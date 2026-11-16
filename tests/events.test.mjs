import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword} from './local-fixtures.mjs';
import {programPage,programPayload,programFilter} from '../dist/core/programs-ui.js';
import {tr,langs} from '../dist/i18n.js';

test('Events Pro registration limits, FIFO promotion, private attendance and cancellation',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),run=(u,operation,b={})=>act(u,'programs',{module:'events',operation,...b}),view=u=>req('/api/state',null,u.cookie);
  const row=(v,id)=>v.data.programs.items.find(x=>x.id===id),day=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
  const fields={title:'Events test',description:'Local test only',language:'en',scope:'public',start:day(0),end:day(1),registrationEnd:day(0),time:'18:00',location:'Test hall',minimum:1,capacity:1,eventCategory:'workshop',waitlistEnabled:false};
  const make=async(admin,overrides)=>{const result=await run(admin,'create',{...fields,...overrides});assert.equal(result.status,200);return result.data.programs.items.at(-1).id};
  try{
    assert.equal((await fetch(url+'/core/events-ui.js')).status,200);
    const [admin,member,coach,sara]=await Promise.all(['admin','athlete','coach','sara'].map(login));
    assert.equal((await run(member,'create',fields)).status,403);
    assert.equal((await run(admin,'create',{...fields,registrationEnd:day(2)})).status,400);
    assert.equal((await run(admin,'create',{...fields,eventCategory:'bad'})).status,400);
    const id=await make(admin,{});await run(admin,'publish',{id});
    assert.equal(row(await view(member),id).signupAvailable,true);
    assert.equal((await run(member,'eventRegistration',{id,enabled:false})).status,403);
    await run(admin,'eventRegistration',{id,enabled:false});assert.equal((await run(member,'join',{id})).status,409);
    await run(admin,'eventRegistration',{id,enabled:true});assert.equal((await run(member,'join',{id})).status,200);
    assert.equal((await run(coach,'join',{id})).status,429);assert.equal(row(await view(coach),id).roster,undefined);
    assert.equal(row(await view(admin),id).attendanceSummary.unmarked,1);
    assert.equal((await run(member,'attendance',{id,target:'demo-athlete',attended:true})).status,403);
    const absent=await run(admin,'attendance',{id,target:'demo-athlete',attended:false});assert.equal(absent.status,200);assert.equal(row(absent,id).attendanceSummary.absent,1);assert.equal(row(await view(member),id).attendanceState,'absent');
    assert.equal((await run(member,'leave',{id})).status,409);assert.equal((await run(admin,'update',{...fields,id})).status,409);assert.equal((await run(admin,'eventCancel',{id})).status,409);
    assert.equal(row(await run(admin,'attendance',{id,target:'demo-athlete',attended:true}),id).attendanceSummary.present,1);
    const queue=await make(admin,{title:'Queue test',waitlistEnabled:true});await run(admin,'publish',{id:queue});
    await run(member,'join',{id:queue});await run(coach,'join',{id:queue});await run(sara,'join',{id:queue});
    assert.equal(row(await view(coach),queue).waitPosition,1);assert.equal(row(await view(sara),queue).waitPosition,2);
    await run(member,'leave',{id:queue});assert.equal(row(await view(coach),queue).waiting,false);assert.equal(row(await view(sara),queue).waitPosition,1);
    assert.equal((await run(admin,'attendance',{id:queue,target:'demo-sara',attended:true})).status,404);
    assert.equal((await run(admin,'eventCancel',{id:queue})).status,200);assert.equal(row(await view(coach),queue).eventStatus,'cancelled');assert(!row(await view(member),queue));assert((await view(sara)).data.notifications.some(n=>n.text.includes('Queue test')));assert.equal((await run(admin,'publish',{id:queue})).status,409);
    await run(admin,'archive',{id:queue});assert.equal((await run(admin,'publish',{id:queue})).status,409);
    const expired=await make(admin,{title:'Closed deadline',registrationEnd:day(-1)});await run(admin,'publish',{id:expired});assert.equal((await run(member,'join',{id:expired})).status,409);
    const future=await make(admin,{title:'Future test',start:day(1),end:day(1)});await run(admin,'publish',{id:future});await run(member,'join',{id:future});assert.equal((await run(admin,'attendance',{id:future,target:'demo-athlete',attended:true})).status,400);
    const state=(await view(admin)).data;
    for(const lang of langs){const html=programPage({state,id:'events',t:k=>tr(k,lang),h:String,btn:(label,action,attrs)=>`<button ${attrs}>${label}</button>`});assert.match(html,/data-form="programFilter"/);assert.match(html,/Events test/);assert(!html.includes('eventAttendance_present'))}
    programFilter(state.me.id,{module:'events',query:'Future test',view:'manage'});const html=programPage({state,id:'events',t:k=>tr(k,'en'),h:String,btn:()=>''});assert.match(html,/Future test/);assert(!html.includes('Events test'));
    assert.deepEqual(programPayload({minimum:'1',capacity:'3',waitlistEnabled:'false'}),{minimum:1,capacity:3,waitlistEnabled:false});
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
