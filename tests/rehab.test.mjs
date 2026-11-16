import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword} from './local-fixtures.mjs';
import {programPage,programPayload} from '../dist/core/programs-ui.js';
import {rehabRegions,rehabSides,rehabStatuses,rehabContentTypes} from '../dist/core/rehab-schema.js';
import {tr,langs} from '../dist/i18n.js';

test('Rehab Pro blank content library, reviewed draft workflow and private longitudinal records',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,b,cookie)=>{const r=await fetch(base+path,{method:b?'POST':'GET',headers:{...(b?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:b?JSON.stringify(b):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=r=>req('/api/auth',{mode:'login',email:r+'@demo.local',password:demoPassword});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),rehab=(u,operation,b={})=>act(u,'programs',{module:'rehab',operation,...b}),view=u=>req('/api/state',null,u.cookie);
  try{
    const [a,c,admin,gym]=await Promise.all(['athlete','coach','admin','gym'].map(login));
    assert.deepEqual(a.data.programs.rehabContent.items,[]);assert.deepEqual(admin.data.programs.rehabContent.items,[]);assert(!admin.data.programs.rehab);assert(!gym.data.programs.rehab);
    const draft={title:'Synthetic template',description:'Test placeholder',region:'knee',contentType:'template',language:'en',content:''};
    assert.equal((await rehab(a,'rehabContentCreate',draft)).status,403);
    const created=await rehab(admin,'rehabContentCreate',draft);assert.equal(created.status,200);const contentId=created.data.programs.rehabContent.items[0].id;
    assert.equal(created.data.programs.rehabContent.items[0].status,'draft');assert.deepEqual((await view(a)).data.programs.rehabContent.items,[]);
    assert.equal((await rehab(admin,'rehabContentPublish',{id:contentId,reviewer:'Synthetic reviewer',source:'Test reference',confirm:true})).status,409);
    await rehab(admin,'rehabContentUpdate',{id:contentId,...draft,content:'Synthetic placeholder only; not medical advice.'});
    assert.equal((await rehab(admin,'rehabContentPublish',{id:contentId,reviewer:'Synthetic reviewer',source:'Test reference'})).status,403);
    assert.equal((await rehab(admin,'rehabContentPublish',{id:contentId,reviewer:'Synthetic reviewer',source:'Test reference',confirm:true})).status,200);
    assert.equal((await view(a)).data.programs.rehabContent.items.length,1);
    await rehab(admin,'rehabContentUpdate',{id:contentId,...draft});assert.deepEqual((await view(a)).data.programs.rehabContent.items,[]);
    const record={title:'Private synthetic case',date:'2026-11-16',note:'Private note',plan:'',progress:20,region:'shoulder',side:'left',status:'open'};
    await act(a,'wellness',{operation:'enable',confirm:true});await act(c,'wellness',{operation:'enable',confirm:true});
    assert.equal((await rehab(a,'create',{...record,side:'invalid'})).status,400);
    const saved=await rehab(a,'create',record);assert.equal(saved.status,200);const id=saved.data.programs.rehab.records[0].id;
    assert.equal(saved.data.programs.rehab.records[0].region,'shoulder');
    const entry={id,date:'2026-11-16',progress:25,discomfort:4,note:'Private follow-up'};
    assert.equal((await rehab(a,'rehabCheckinCreate',{...entry,discomfort:11})).status,400);
    const check=await rehab(a,'rehabCheckinCreate',entry);assert.equal(check.status,200);const checkinId=check.data.programs.rehab.records[0].checkins[0].id;
    assert.equal((await rehab(a,'rehabCheckinCreate',entry)).status,409);
    assert.equal((await rehab(c,'rehabCheckinUpdate',{...entry,checkinId})).status,404);
    const task=await rehab(a,'rehabTaskCreate',{id,taskTitle:'Private plan item',taskNote:'Synthetic entry'});const taskId=task.data.programs.rehab.records[0].tasks[0].id;
    assert.equal((await rehab(a,'rehabTaskToggle',{id,taskId,completed:true})).data.programs.rehab.records[0].tasks[0].completed,true);
    assert.equal((await rehab(a,'rehabClose',{id})).data.programs.rehab.records[0].status,'closed');assert.equal((await rehab(a,'rehabReopen',{id})).data.programs.rehab.records[0].status,'open');
    const invite=await act(a,'coaching',{operation:'invite',target:'demo-coach'}),linkId=invite.data.coaching.links[0].id;
    await act(c,'identity',{operation:'switch',context:'personal:coach'});await act(c,'coaching',{operation:'respond',linkId,accept:true});
    assert.equal((await rehab(a,'share',{id,linkId})).status,200);const shared=(await view(c)).data.programs.rehab.shared[0];assert.equal(shared.checkins[0].note,'Private follow-up');assert.equal(shared.tasks[0].completed,true);
    await rehab(a,'rehabCheckinUpdate',{...entry,checkinId,progress:30});assert.deepEqual((await view(c)).data.programs.rehab.shared,[]);
    assert(!JSON.stringify((await view(admin)).data).includes('Private synthetic case'));
    const current=(await view(a)).data;
    for(const lang of langs){const html=programPage({state:current,id:'rehab',t:k=>tr(k,lang),h:String,btn:()=>''});assert.match(html,/Private synthetic case/);assert.match(html,/data-disclosure-key="rehab:timeline:/);assert(!html.includes('Synthetic placeholder only'));}
    for(const lang of langs)for(const k of [...rehabRegions.map(x=>'rehabRegion_'+x),...rehabSides.map(x=>'rehabSide_'+x),...rehabStatuses.map(x=>'rehabStatus_'+x),...rehabContentTypes.map(x=>'rehabType_'+x)])assert.notEqual(tr(k,lang),k);
    assert.deepEqual(programPayload({discomfort:'',progress:'20',confirm:'on'}),{discomfort:null,progress:20,confirm:true});
    for(const f of ['rehab-ui.js','rehab-schema.js'])assert.equal((await fetch(base+'/core/'+f)).status,200);
    const ex=await req('/api/account',{operation:'export',password:demoPassword},a.cookie);assert.equal(ex.data.programs.rehab[0].checkins[0].progress,30);
    await rehab(a,'rehabTaskDelete',{id,taskId});await rehab(a,'rehabCheckinDelete',{id,checkinId});
    await act(a,'wellness',{operation:'clear',confirm:true});assert.equal((await view(a)).data.programs.rehab.records.length,0);
    await rehab(admin,'flag',{enabled:false});assert(!((await view(a)).data.programs.rehabContent));assert((await view(admin)).data.programs.rehabContent.canManage);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
