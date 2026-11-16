import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {programPage,programPayload} from '../dist/core/programs-ui.js';
import {tr,langs} from '../dist/i18n.js';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';

test('campaigns, threshold and waitlist events, club isolation, publication rights and rollout',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:'DemoLive2026!'});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),run=(u,module,operation,b={})=>act(u,'programs',{module,operation,...b}),view=u=>req('/api/state',null,u.cookie),switchRole=(u,context)=>act(u,'identity',{operation:'switch',context});
  const find=(v,title)=>v.data.programs.items.find(r=>r.title===title);
  const day=new Date().toISOString().slice(0,10),baseFields={description:'Local test content',language:'en',start:day,end:day};
  try{
    const [admin,member,coach,gym,sara]=await Promise.all(['admin','athlete','coach','gym','sara'].map(login));
    const evt={...baseFields,title:'Iron event',scope:'club',time:'18:00',location:'Test gym',minimum:2,capacity:2};
    assert.equal((await run(member,'events','create',evt)).status,403);
    const created=await run(gym,'events','create',evt);assert.equal(created.status,200);
    const id=find(created,'Iron event').id;
    assert(!find(await view(member),'Iron event'));
    assert.equal((await run(gym,'events','publish',{id})).status,200);
    await switchRole(sara,'club-north:clubOwner');assert(!find(await view(sara),'Iron event'));
    assert.equal((await run(sara,'events','join',{id})).status,404);
    await switchRole(member,'club-iron:member');await switchRole(coach,'club-iron:coach');await switchRole(sara,'club-iron:accountant');
    assert.equal(find(await run(member,'events','join',{id}),'Iron event').eventStatus,'pending');
    assert.equal(find(await run(coach,'events','join',{id}),'Iron event').eventStatus,'confirmed');
    assert((await view(member)).data.notifications.some(n=>n.text.includes('Iron event')));
    assert.equal(find(await run(sara,'events','join',{id}),'Iron event').waiting,true);
    assert.equal(find(await run(member,'events','leave',{id}),'Iron event').count,2);
    assert.equal(find(await view(sara),'Iron event').waiting,false);
    assert((await view(sara)).data.notifications.some(n=>n.text.includes('Iron event')));
    assert.equal((await run(sara,'events','attendance',{id,target:'demo-coach',attended:true})).status,403);
    assert.equal((await run(gym,'events','attendance',{id,target:'demo-coach',attended:true})).status,200);
    assert(!find(await view(admin),'Iron event'));
    await switchRole(member,'personal:member');
    for(const category of ['ramadan','startfit']){
      const title='Campaign '+category,r=await run(admin,'campaigns','create',{...baseFields,title,category});assert.equal(r.status,200);const cid=find(r,title).id;
      assert(!find(await view(member),title));assert.equal((await run(admin,'campaigns','publish',{id:cid})).status,200);
      assert.equal((await run(member,'campaigns','join',{id:cid})).status,200);
      assert.deepEqual(find(await run(member,'campaigns','checkin',{id:cid}),title).checkins,[day]);
      assert.equal((await run(member,'campaigns','checkin',{id:cid})).status,409);
      assert.equal((await run(member,'campaigns','archive',{id:cid})).status,403);
    }
    const book={title:'Guide',description:'Guide description',language:'sv',category:'guide',author:'Author',rightsNote:'Original test content',content:'Example text'};
    assert.equal((await run(admin,'library','create',book)).status,400);
    const lib=await run(admin,'library','create',{...book,rights:true});assert.equal(lib.status,200);const bid=find(lib,'Guide').id;
    assert(!find(await view(member),'Guide'));await run(admin,'library','publish',{id:bid});
    assert.equal(find(await view(member),'Guide').content,'Example text');
    assert.equal((await run(member,'library','flag',{enabled:false})).status,403);
    assert.equal((await run(admin,'library','flag',{enabled:false})).status,200);
    assert(!find(await view(member),'Guide'));
    assert.equal((await run(admin,'library','flag',{enabled:true})).status,200);
    const av=await view(admin);assert(av.data.programs.audit.some(a=>a.operation==='flag'));assert(!av.data.programs.rehab);
    for(const l of langs){const html=programPage({state:av.data,id:'library',t:k=>tr(k,l),h:String,btn:()=>''});assert.match(html,/data-form="programFilter"/);assert(!html.includes('programRightsConfirm'))}
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});

test('rehab test records are personal, consent-scoped, exportable and cleared with wellness',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:'DemoLive2026!'});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),run=(u,operation,b={})=>act(u,'programs',{module:'rehab',operation,...b}),view=u=>req('/api/state',null,u.cookie);
  try{
    const [member,coach,admin,gym]=await Promise.all(['athlete','coach','admin','gym'].map(login));
    const secret='Test only private injury',record={title:'Test record',note:secret,plan:'Written guidance',date:new Date().toISOString().slice(0,10),progress:30};
    assert.equal((await run(member,'create',record)).status,403);
    await act(member,'wellness',{operation:'enable',confirm:true});
    const c=await run(member,'create',record);assert.equal(c.status,200);const id=c.data.programs.rehab.records[0].id;
    for(const u of [coach,admin,gym])assert(!JSON.stringify((await view(u)).data).includes(secret));
    assert.equal((await run(admin,'delete',{id})).status,403);
    const invitation=await act(member,'coaching',{operation:'invite',target:'demo-coach'});assert.equal(invitation.status,200);const linkId=invitation.data.coaching.links[0].id;
    assert.equal((await run(member,'share',{id,linkId})).status,403);
    assert.equal((await act(coach,'identity',{operation:'switch',context:'personal:coach'})).status,200);
    assert.equal((await act(coach,'coaching',{operation:'respond',linkId,accept:true})).status,200);
    assert.equal((await run(member,'share',{id,linkId})).status,200);
    assert.equal((await view(coach)).data.programs.rehab.shared[0].note,secret);
    assert(!JSON.stringify((await view(admin)).data).includes(secret));
    await act(coach,'identity',{operation:'switch',context:'club-iron:coach'});
    assert(!JSON.stringify((await view(coach)).data).includes(secret));
    await act(coach,'identity',{operation:'switch',context:'personal:coach'});
    await run(member,'share',{id,linkId:null});assert(!JSON.stringify((await view(coach)).data).includes(secret));
    const ex=await req('/api/account',{operation:'export',password:'DemoLive2026!'},member.cookie);assert.equal(ex.data.programs.rehab[0].note,secret);
    await act(member,'wellness',{operation:'clear',confirm:true});assert.equal((await view(member)).data.programs.rehab.records.length,0);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});

test('local program data survives a verified SQLite backup and cannot be reused for production',()=>{
  const dir=mkdtempSync(join(tmpdir(),'ml-programs-'));
  try{
    const path=join(dir,'local.sqlite'),backup=join(dir,'backup.sqlite');
    const {db}=createApp({dbPath:path});
    const s=JSON.parse(db.prepare('SELECT data FROM state').get().data);s.programs={flags:{library:false},items:[],entries:[],rehab:[],audit:[]};
    db.prepare('UPDATE state SET data=?').run(JSON.stringify(s));db.prepare('VACUUM INTO ?').run(backup);db.close();
    const restored=new DatabaseSync(backup);assert.equal(restored.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.equal(JSON.parse(restored.prepare('SELECT data FROM state').get().data).programs.flags.library,false);restored.close();
    assert.throws(()=>createApp({dbPath:backup,release:{production:true,origin:'https://test.example',adminEmail:'owner@test.example',adminPassword:'Test-Only-Password-Long',contact:'support@test.example',mailer:async()=>{}}}),/Release blocked/);
    assert.deepEqual(programPayload({minimum:'2',capacity:'5',progress:'20',rights:'on',linkId:'none'}),{minimum:2,capacity:5,progress:20,rights:true,linkId:null});
  }finally{rmSync(dir,{recursive:true,force:true})}
});
