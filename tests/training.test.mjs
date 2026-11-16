import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword,newTestPassword} from './local-fixtures.mjs';
import {seedExercises,equipment,muscles,patterns,levels,alternatives} from '../dist/core/exercise-catalog.js';
import {exerciseDraft} from '../exercise-instructions.mjs';
import {trainingPage,trainingUI,trainingPayload,resetTrainingUI} from '../dist/core/training-ui.js';
import {groupTypes} from '../training.mjs';
import {tr,langs} from '../dist/i18n.js';

const date=new Date().toISOString().slice(0,10);
const plan={title:'Local test plan',goal:'Full body',startDate:date,weeks:4,daysPerWeek:3,unit:'kg',notes:''};
const ex=(exerciseId,extra={})=>({exerciseId,kg:20,reps:10,rest:30,duration:0,side:'both',tempo:'',weights:[],...extra});
const block=(method,items,extra={})=>({method,items,phase:'base',rounds:2,day:1,weekFrom:1,weekTo:4,rest:60,warmup:false,...extra});
const withApp=async run=>{
  const {server,db}=createApp({dbPath:':memory:'});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const act=(u,type,data)=>req('/api/action',{type,...data},u.cookie);
  const train=(u,operation,data={})=>act(u,'training',{operation,...data});
  const view=u=>req('/api/state',null,u.cookie);
  const enable=u=>act(u,'wellness',{operation:'enable',confirm:true});
  const change=(u,context)=>act(u,'identity',{operation:'switch',context});
  try{await run({req,login,act,train,view,enable,change,db,base})}finally{await new Promise(r=>server.close(r));db.close()}
};

test('200 distinct exercises, 25 stretch movements, 4 equipment categories and multilingual catalog',()=>{
  assert.equal(seedExercises.length,200);assert.equal(new Set(seedExercises.map(x=>x.id)).size,200);
  const counts=Object.fromEntries(muscles.map(m=>[m,seedExercises.filter(x=>x.muscle===m).length]));assert.deepEqual(counts,{chest:25,back:30,shoulders:25,arms:30,legs:35,core:15,cardio:15,stretch:25});
  const stretch=seedExercises.filter(x=>x.muscle==='stretch');assert(stretch.every(x=>x.secondary.length));assert.equal(new Set(stretch.map(x=>x.pattern)).size,5);assert(alternatives(seedExercises,stretch[3]).every(x=>x.secondary.some(m=>stretch[3].secondary.includes(m))));
  for(const row of seedExercises){assert(equipment.includes(row.equipment));assert(patterns.includes(row.pattern));assert(levels.includes(row.level));assert(langs.every(l=>row.names[l].length>0));assert(row.secondary.every(m=>muscles.includes(m)&&m!==row.muscle))}
  const db=seedExercises.find(r=>r.id==='db-bench'),others=alternatives(seedExercises,db);assert(others.some(x=>x.equipment==='bodyweight'));assert(others.some(x=>x.equipment==='machine'));assert(others.every(x=>x.muscle===db.muscle&&x.pattern===db.pattern&&x.id!==db.id));
  for(const key of [...equipment,...muscles,...patterns,...levels,...groupTypes])for(const l of langs)assert.notEqual(tr('train_'+key,l),'train_'+key);
});

test('catalog supports more than 1,000 entries with a paged browser view',async()=>withApp(async({login,view,db})=>{
  const admin=await login('admin'),s=JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);
  const example=seedExercises[0];s.training={catalog:Array.from({length:900},(_,i)=>({...example,id:'fixture-'+i,names:{en:'Fixture '+i,ar:'اختبار '+i,sv:'Test '+i}})),plans:[],sessions:[],settings:{},audit:[]};
  db.prepare('UPDATE state SET data=? WHERE id=1').run(JSON.stringify(s));
  const state=(await view(admin)).data;assert.equal(state.training.catalog.length,1100);
  resetTrainingUI();const h=v=>String(v??'');const html=trainingPage({state,t:k=>tr(k,'en'),h,btn:(x,a,attrs)=>`<button data-action="${a}" ${attrs}>${x}</button>`,lang:'en'});assert.match(html,/1100 \/ 1100/);assert.equal((html.match(/<article class="card stack">/g)||[]).length,24);
}));

test('all 200 original starter drafts contain localized technique, mistakes and safety notes without publishing',async()=>withApp(async({login,view,train})=>{
  const [admin,a]=await Promise.all(['admin','athlete'].map(login));const draftRows=(await view(admin)).data.training.catalog;
  assert.equal(draftRows.length,200);for(const row of draftRows){assert.equal(row.content.origin,'starterDraft');assert.equal(row.content.status,'draft');assert.deepEqual(row.content.assets,{});assert.equal(row.media,null);for(const l of langs)for(const field of [row.notes,row.content.mistakes,row.content.safety])assert(field[l].length>20&&field[l].length<=1000);assert.deepEqual(row.notes,exerciseDraft(seedExercises.find(x=>x.id===row.id)).notes)}
  for(const row of (await view(a)).data.training.catalog){assert.equal(row.notes.en,'');assert.equal(row.content.origin,undefined);assert.equal(row.content.safety,undefined)}
  assert.equal((await train(admin,'contentSubmit',{id:'push-up'})).status,400);
  assert.notEqual(draftRows.find(x=>x.id==='wall-calf-stretch').notes.en,draftRows.find(x=>x.id==='standing-quad-stretch').notes.en);
}));

test('catalog management is administrator-only and browser modules are served',async()=>withApp(async({login,train,view,base})=>{
  const [admin,a]=await Promise.all(['admin','athlete'].map(login));
  const row={names:{en:'Local example',ar:'تجريبي',sv:'Lokalt exempel'},notes:{en:'',ar:'',sv:''},equipment:'bodyweight',muscle:'core',pattern:'coreStability',level:'beginner',media:null};
  assert.equal((await train(a,'catalogCreate',row)).status,403);
  const created=await train(admin,'catalogCreate',row);assert.equal(created.status,200);const id=created.data.training.catalog.find(x=>x.names.en==='Local example').id;
  assert.equal((await view(a)).data.training.catalog.length,201);
  assert.equal((await train(admin,'catalogArchive',{id})).status,200);assert(!(await view(a)).data.training.catalog.some(x=>x.id===id));
  assert.equal((await train(admin,'catalogRestore',{id})).status,200);
  assert.equal((await train(admin,'catalogUpdate',{...row,id,media:{rights:'',reference:'x'}})).status,400);
  assert.equal((await train(admin,'catalogUpdate',{...row,id,names:{en:'missing'}})).status,400);
  assert(!(await view(admin)).data.training.sessions);
  for(const pathname of ['/core/training-ui.js','/core/exercise-catalog.js']){const response=await fetch(base+pathname);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/javascript/);assert((await response.text()).length>500)}
}));

test('exercise content requires all translated notes, rights, three assets and specialist approval; drafts are never exposed',async()=>withApp(async({login,train,view,base,db})=>{
  const [admin,a]=await Promise.all(['admin','athlete'].map(login)),id='push-up',names=seedExercises.find(x=>x.id===id).names;
  const notes={en:'Fixture instruction',ar:'تعليمات اختبار',sv:'Testinstruktion'},mistakes={en:'Fixture mistake',ar:'خطأ اختبار',sv:'Testfel'},safety={en:'Fixture warning',ar:'تحذير اختبار',sv:'Testvarning'};
  const row={id,names,notes,mistakes,safety,equipment:'bodyweight',muscle:'chest',pattern:'horizontalPush',level:'beginner',media:{rights:'Synthetic test only',reference:'Local test fixture'}};
  const media=(slot,user,bytes,mime,range)=>fetch(base+'/api/training-media?exercise='+id+'&slot='+slot,{method:bytes?'POST':'GET',headers:{...(user?{Cookie:user.cookie}:{}),...(bytes?{'Content-Type':mime}:{}),...(range?{Range:range}:{})},body:bytes});
  // Tiny byte fixtures exercise the transport/signature checks, not video decoding.
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a/6EAAAAASUVORK5CYII=','base64');
  const video=Buffer.from([0,0,0,20,102,116,121,112,105,115,111,109,0,0,0,0,105,115,111,109]);
  assert.equal((await train(admin,'catalogUpdate',row)).status,200);
  assert.equal((await train(admin,'contentSubmit',{id})).status,400);
  assert.equal((await media('start',a,png,'image/png')).status,403);
  assert.equal((await media('start',admin,Buffer.from('<svg>invalid</svg>'),'image/svg+xml')).status,415);
  assert.equal((await media('start',admin,Buffer.from('Not a real image file'),'image/png')).status,415);
  assert.equal((await media('start',admin,png,'image/png')).status,200);
  assert.equal((await media('end',admin,png,'image/png')).status,200);
  assert.equal((await media('video',admin,video,'video/mp4')).status,200);
  assert.equal((await media('start',admin)).status,200);
  assert.equal((await media('start',a)).status,404);assert.equal((await media('start',null)).status,401);
  let e=(await view(a)).data.training.catalog.find(x=>x.id===id);assert.equal(e.notes.en,'');assert.deepEqual(e.content.assets,{});assert.equal(e.media,null);
  assert.equal((await train(a,'contentPublish',{id,confirm:true})).status,403);
  assert.equal((await train(admin,'contentPublish',{id,confirm:true})).status,403);
  assert.equal((await train(admin,'contentSubmit',{id})).status,200);
  assert.equal((await media('video',a)).status,404);
  assert.equal((await train(admin,'contentPublish',{id})).status,403);
  assert.equal((await train(admin,'contentPublish',{id,confirm:true})).status,200);
  e=(await view(a)).data.training.catalog.find(x=>x.id===id);assert.equal(e.content.status,'published');assert.equal(e.notes.en,notes.en);assert.equal(e.content.safety.en,safety.en);
  const r=await media('video',a,null,null,'bytes=0-7');assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,8);assert.equal(r.headers.get('content-type'),'video/mp4');
  const got=await media('start',a);assert.equal(got.status,200);assert.deepEqual(Buffer.from(await got.arrayBuffer()),png);
  assert.equal((await media('start',admin,png,'image/png')).status,200);assert.equal((await media('start',a)).status,404);
  assert.equal((await view(a)).data.training.catalog.find(x=>x.id===id).notes.en,'');
  assert.equal(db.prepare('SELECT count(*) AS n FROM exercise_media').get().n,3);
}));

test('training builder validates all methods, schedule, order, ownership and coach assignment',async()=>withApp(async({login,train,view,act,enable,change})=>{
  const [a,c,s,g]=await Promise.all(['athlete','coach','sara','gym'].map(login));
  assert.equal((await train(a,'planCreate',plan)).status,403);await enable(a);
  await enable(s);await change(c,'personal:coach');await enable(c);
  const made=await train(c,'planCreate',plan);assert.equal(made.status,200);const id=made.data.training.plans[0].id;
  assert.equal((await train(a,'blockAdd',{id,...block('standard',[ex('db-bench')])})).status,404);
  assert.equal((await train(g,'planCreate',plan)).status,403);
  assert.equal((await train(c,'blockAdd',{id,...block('superset',[ex('db-bench')])})).status,400);
  assert.equal((await train(c,'blockAdd',{id,...block('drop',[ex('db-bench',{weights:[30,15]})])})).status,400);
  assert.equal((await train(c,'blockAdd',{id,...block('pyramid',[ex('db-bench',{weights:[20]})])})).status,400);
  const samples={standard:[ex('db-bench')],drop:[ex('db-bench',{weights:[15,10]})],superset:[ex('db-bench'),ex('bb-row')],triset:[ex('db-bench'),ex('bb-row'),ex('plank')],giant:[ex('db-bench'),ex('bb-row'),ex('plank'),ex('dbl-row'.replace('dbl','db'))],circuit:[ex('db-bench'),ex('push-up')],restPause:[ex('db-bench',{segments:3,segmentRest:10})],pyramid:[ex('db-bench',{weights:[15,20]})],cluster:[ex('db-bench',{segments:2,segmentRest:5})],tempo:[ex('db-bench',{tempo:'3-1-1-0'})],amrap:[ex('push-up',{duration:30})],custom:[ex('push-up'),ex('db-bench')]};
  for(const method of groupTypes){const res=await train(c,'blockAdd',{id,...block(method,samples[method],method==='custom'?{name:'Custom'}:{})});assert.equal(res.status,200,method+': '+JSON.stringify(res.data.error))}
  let p=(await view(c)).data.training.plans[0];assert.equal(p.blocks.length,groupTypes.length);
  const source=p.blocks[0].id,target=p.blocks[2].id;
  assert.equal((await train(c,'blockMoveTo',{id,blockId:source,targetBlockId:target})).data.training.plans[0].blocks[2].id,source);
  assert.equal((await train(c,'planAssign',{id,linkId:'wrong'})).status,403);
  const invite=await act(c,'coaching',{operation:'invite',target:'demo-athlete'});assert.equal(invite.status,200);const linkId=invite.data.coaching.links[0].id;
  assert.equal((await train(c,'planAssign',{id,linkId})).status,403);
  assert.equal((await act(a,'coaching',{operation:'respond',linkId,accept:true})).status,200);
  assert.equal((await train(c,'planAssign',{id,linkId})).status,200);
  const assigned=(await view(a)).data.training.plans[0];assert.equal(assigned.blocks.length,groupTypes.length);assert(assigned.mine&&assigned.assigned);
  assert(!(await view(s)).data.training.plans.some(x=>x.id===assigned.id));
  assert.equal((await train(c,'start',{id:assigned.id,week:1,day:1})).status,403);
  await act(a,'coaching',{operation:'end',linkId});assert(!(await view(c)).data.training.plans.some(x=>x.id===assigned.id));assert((await view(a)).data.training.plans.some(x=>x.id===assigned.id));
}));

test('workout execution snapshots, logging, consent, PRs, progression, export and clear',async()=>withApp(async({login,train,view,act,enable,change,req,db})=>{
  const [a,c,admin,g]=await Promise.all(['athlete','coach','admin','gym'].map(login));await enable(a);await change(c,'personal:coach');await enable(c);
  const made=await train(a,'planCreate',plan),id=made.data.training.plans[0].id;
  const add=await train(a,'blockAdd',{id,...block('drop',[ex('db-bench',{kg:30,weights:[20,10],side:'each'})],{rounds:1,day:1})});assert.equal(add.status,200);
  const bid=add.data.training.plans[0].blocks[0].id;
  const start=await train(a,'start',{id,week:1,day:1});assert.equal(start.status,200);const session=start.data.training.sessions[0],sid=session.id;
  assert.deepEqual(session.steps.map(x=>x.kg),[30,30,20,20,10,10]);assert.deepEqual(session.steps.map(x=>x.side),['left','right','left','right','left','right']);
  assert.equal((await train(a,'start',{id,week:1,day:1})).status,409);
  assert.equal((await train(c,'log',{sessionId:sid,index:0,kg:30,reps:10})).status,404);
  assert.equal((await train(a,'replace',{sessionId:sid,index:0,exerciseId:'leg-press'})).status,400);
  assert.equal((await train(a,'log',{sessionId:sid,index:1,kg:30,reps:10})).status,409);
  assert.equal((await train(a,'log',{sessionId:sid,index:0,kg:30,reps:10,rir:3})).status,200);
  const resumed=(await view(a)).data.training.sessions[0];assert.equal(resumed.cursor,1);assert.equal(resumed.logs.length,1);assert(resumed.restUntil);
  assert.equal((await train(a,'finish',{sessionId:sid})).status,400);
  assert.equal((await train(a,'blockRemove',{id,blockId:bid})).status,200); // snapshot survives edit
  for(let i=1;i<6;i++)assert.equal((await train(a,'log',{sessionId:sid,index:i,kg:session.steps[i].kg,reps:10,rir:3})).status,200);
  const end=await train(a,'finish',{sessionId:sid,rating:5,note:'Local test workout'});assert.equal(end.status,200);
  assert.equal(end.data.training.progress.exercises[0].maxKg,30);assert.equal(end.data.training.progress.volume,1200);
  assert(!JSON.stringify((await view(admin)).data).includes('Local test workout'));
  assert(!JSON.stringify((await view(g)).data).includes('Local test workout'));
  const added=await train(a,'blockAdd',{id,...block('standard',[ex('db-bench',{kg:20})],{rounds:1,day:2})});assert.equal(added.status,200);const standard=added.data.training.plans[0].blocks[0].id;
  for(let week=1;week<=2;week++){const started=await train(a,'start',{id,week,day:2});const active=started.data.training.sessions.find(x=>x.status==='active');assert.equal((await train(a,'log',{sessionId:active.id,index:0,kg:20,reps:10,rir:3})).status,200);assert.equal((await train(a,'finish',{sessionId:active.id})).status,200)}
  assert.equal((await view(a)).data.training.suggestions.length,0);
  const settings=await train(a,'settings',{progression:true});const suggestion=settings.data.training.suggestions[0];assert.equal(suggestion.kg,20.5);
  assert.equal((await train(a,'progressApply',{id,blockId:standard,itemIndex:0,kg:20.5})).status,403);
  assert.equal((await train(a,'progressApply',{id,blockId:standard,itemIndex:0,kg:20.5,confirm:true})).data.training.plans[0].blocks[0].items[0].kg,20.5);
  assert.equal((await view(a)).data.training.progress.adherence[0].completed,2);
  const invitation=await act(a,'coaching',{operation:'invite',target:'demo-coach'}),linkId=invitation.data.coaching.links[0].id;await act(c,'coaching',{operation:'respond',linkId,accept:true});
  assert.equal((await view(c)).data.training.shared.length,0);
  await act(a,'coaching',{operation:'share',linkId,enabled:true});const shared=(await view(c)).data.training.shared[0];assert.equal(shared.progress.sessions,3);assert(!shared.progress.adherence);assert(!JSON.stringify(shared).includes('Local test workout'));
  await act(a,'coaching',{operation:'share',linkId,enabled:false});assert.equal((await view(c)).data.training.shared.length,0);
  await change(a,'club-iron:member');assert(!(await view(a)).data.training.sessions);await change(a,'personal:member');
  const exported=await req('/api/account',{operation:'export',password:demoPassword},a.cookie);assert.equal(exported.data.training.sessions.length,3);
  await act(a,'wellness',{operation:'clear',confirm:true});assert(!(await view(a)).data.training.sessions);
  const s=JSON.parse(db.prepare('SELECT data FROM state').get().data);assert(!s.training.sessions.some(x=>x.owner==='demo-athlete'));
}));

test('training UI renders all tabs and multilingual catalog filters; pounds normalize to kilograms',async()=>withApp(async({login,enable,view,train})=>{
  const a=await login('athlete');await enable(a);await train(a,'planCreate',plan);
  const state=(await view(a)).data;
  for(const l of langs)for(const tab of ['catalog','builder','live','progress']){
    resetTrainingUI();trainingUI(state.me.id,'tab',tab);
    const html=trainingPage({state,t:k=>tr(k,l),h:v=>String(v??''),btn:(x,a,attrs)=>`<button data-action="${a}" ${attrs}>${x}</button>`,lang:l});
    assert(html.includes('MUSCLIVO LIVE / TRAIN PRO'));assert(!/\btrain_(tab|testNotice|noActive)/.test(html));
  }
  const payload=trainingPayload({operation:'log',unit:'lb',kg:'22.046226218',reps:'10',duration:'0',index:'1',rpe:'',rir:'2'});
  assert.equal(payload.kg,10);assert.equal(payload.rpe,null);assert.equal(payload.rir,2);
}));
