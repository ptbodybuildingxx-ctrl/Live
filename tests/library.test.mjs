import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword} from './local-fixtures.mjs';
import {libraryTopics,libraryFormats} from '../dist/core/library-schema.js';
import {programPage,programFilter} from '../dist/core/programs-ui.js';
import {tr,langs} from '../dist/i18n.js';

test('Library Pro drafts, authenticated PDF attachments, filters and private reading progress',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,b,cookie)=>{const r=await fetch(base+path,{method:b?'POST':'GET',headers:{...(b?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:b?JSON.stringify(b):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=r=>req('/api/auth',{mode:'login',email:r+'@demo.local',password:demoPassword});
  const act=(u,operation,b={})=>req('/api/action',{type:'programs',module:'library',operation,...b},u.cookie),view=u=>req('/api/state',null,u.cookie);
  const find=(v,id)=>v.data.programs.items.find(r=>r.id===id);
  const upload=(u,id,data,type='application/pdf')=>fetch(base+'/api/library-pdf?id='+id,{method:'POST',headers:{Cookie:u.cookie,'Content-Type':type},body:data});
  const download=(u,id)=>fetch(base+'/api/library-pdf?id='+id,{headers:u?{Cookie:u.cookie}:{}});
  try{
    const [a,c,admin,gym]=await Promise.all(['athlete','coach','admin','gym'].map(login));
    assert.equal(a.data.programs.items.filter(r=>r.module==='library').length,0);
    const data={title:'Synthetic PDF guide',description:'Test-only metadata',language:'sv',category:'guide',topic:'training',format:'both',author:'Test author',rightsNote:'Synthetic original content',content:'Synthetic text only',rights:true};
    assert.equal((await act(a,'create',data)).status,403);assert.equal((await act(admin,'create',{...data,rights:false})).status,400);
    const created=await act(admin,'create',data);assert.equal(created.status,200);const id=created.data.programs.items.find(r=>r.module==='library').id;
    assert.equal(find(created,id).status,'draft');assert(!find(await view(a),id));assert.equal((await act(admin,'publish',{id})).status,409);
    const pdf=Buffer.from('%PDF-1.4\n% Synthetic test attachment\n%%EOF\n');
    assert.equal((await upload(a,id,pdf)).status,403);assert.equal((await upload(admin,id,Buffer.from('not a pdf'))).status,415);assert.equal((await upload(admin,id,pdf,'text/plain')).status,415);
    const attached=await upload(admin,id,pdf);assert.equal(attached.status,200);assert.equal((await attached.json()).programs.items.find(r=>r.id===id).pdf.size,pdf.length);
    assert.equal((await download(null,id)).status,401);assert.equal((await download(a,id)).status,404);assert.equal((await download(admin,id)).status,200);
    assert.equal((await act(admin,'publish',{id})).status,200);assert.equal(find(await view(a),id).format,'both');
    const read=await download(a,id);assert.equal(read.status,200);assert.match(read.headers.get('content-disposition'),/^attachment/);assert.deepEqual(Buffer.from(await read.arrayBuffer()),pdf);
    assert.equal((await act(a,'libraryFavorite',{id,favorite:true})).status,200);assert.equal((await act(a,'libraryProgress',{id,progress:101})).status,400);assert.equal((await act(a,'libraryProgress',{id,progress:40})).status,200);
    const av=await view(a);assert.equal(av.data.programs.library.preferences[0].progress,40);assert.equal(av.data.programs.library.preferences[0].favorite,true);assert.deepEqual((await view(c)).data.programs.library.preferences,[]);assert.deepEqual((await view(admin)).data.programs.library.preferences,[]);
    programFilter(a.data.me.id,{module:'library',view:'favorites'});for(const lang of langs){const html=programPage({state:av.data,id:'library',t:k=>tr(k,lang),h:String,btn:()=>''});assert.match(html,/Synthetic PDF guide/);assert.match(html,/library-pdf/);assert.match(html,/library-cover/);assert(!html.includes('libraryUpload'))}
    programFilter(a.data.me.id,{module:'library',topic:'nutrition'});assert(!programPage({state:av.data,id:'library',t:k=>tr(k,'en'),h:String,btn:()=>''}).includes('Synthetic PDF guide'));
    for(const lang of langs)for(const key of [...libraryTopics.map(x=>'libraryTopic_'+x),...libraryFormats.map(x=>'libraryFormat_'+x),'libraryProgress','libraryFavorites'])assert.notEqual(tr(key,lang),key);
    const ex=await req('/api/account',{operation:'export',password:demoPassword},a.cookie);assert.equal(ex.data.programs.library[0].progress,40);
    assert.equal((await act(gym,'libraryFavorite',{id,favorite:true})).status,403);
    const replace=await upload(admin,id,pdf);assert.equal(replace.status,200);assert.equal((await download(a,id)).status,404);
    assert.equal((await act(admin,'update',{id,...data,format:'text'})).status,409);
    const remove=await fetch(base+'/api/library-pdf?id='+id+'&remove=1',{method:'POST',headers:{Cookie:admin.cookie,'Content-Type':'application/octet-stream'}});assert.equal(remove.status,200);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM library_pdf').get().n,0);
    assert.equal((await act(admin,'update',{id,...data,format:'text'})).status,200);await act(admin,'publish',{id});assert.equal((await act(a,'libraryClear',{id})).data.programs.library.preferences.length,0);
    await act(admin,'flag',{enabled:false});assert(!find(await view(a),id));assert.equal((await download(a,id)).status,404);
    for(const file of ['library-ui.js','library-schema.js'])assert.equal((await fetch(base+'/core/'+file)).status,200);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
