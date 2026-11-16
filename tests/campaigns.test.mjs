import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword} from './local-fixtures.mjs';
import {programPage,programPayload} from '../dist/core/programs-ui.js';
import {tr,langs} from '../dist/i18n.js';
import {workspacePage} from '../dist/core/workspace.js';

test('independent campaign pages, enrollment and daily tasks are managed and private',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const run=(u,operation,b={})=>req('/api/action',{type:'programs',module:'campaigns',operation,...b},u.cookie),view=u=>req('/api/state',null,u.cookie);
  const find=(v,id)=>v.data.programs.items.find(x=>x.id===id);
  const day=new Date().toISOString().slice(0,10),fields={title:'Ramadan test',description:'Test only',language:'en',start:day,end:day,category:'ramadan',campaignCapacity:1,campaignTasks:['Test task']};
  try{
    assert.equal((await fetch(url+'/core/campaign-ui.js')).status,200);
    const [admin,member,coach]=await Promise.all(['admin','athlete','coach'].map(login));
    assert.equal((await run(member,'create',fields)).status,403);
    assert.equal((await run(admin,'create',{...fields,campaignTasks:['dup','dup']})).status,400);
    const draft=await run(admin,'create',fields);assert.equal(draft.status,200);
    const row=draft.data.programs.items.find(x=>x.title===fields.title),id=row.id,taskId=row.tasks[0].id;
    assert.equal(row.campaignStatus,'draft');assert(!find(await view(member),id));
    await run(admin,'create',{...fields,title:'StartFit test',category:'startfit'});
    await run(admin,'campaignSignup',{id,enabled:false});await run(admin,'publish',{id});
    assert.equal((await run(member,'join',{id})).status,409);
    assert.equal((await run(member,'campaignSignup',{id,enabled:true})).status,403);
    await run(admin,'campaignSignup',{id,enabled:true});
    assert.equal((await run(member,'campaignTaskToggle',{id,taskId,completed:true})).status,403);
    assert.equal((await run(member,'join',{id})).status,200);
    assert.equal((await run(coach,'join',{id})).status,429);
    assert.equal((await run(member,'campaignTaskToggle',{id,taskId:'unknown',completed:true})).status,400);
    for(let i=0;i<2;i++)assert.deepEqual(find(await run(member,'campaignTaskToggle',{id,taskId,completed:true}),id).taskChecksToday,[taskId]);
    assert.deepEqual(find(await view(coach),id).taskChecksToday,[]);
    assert.equal(find(await view(coach),id).roster,undefined);
    assert.deepEqual(find(await run(member,'campaignTaskToggle',{id,taskId,completed:false}),id).taskChecksToday,[]);
    await run(member,'campaignTaskToggle',{id,taskId,completed:true});
    const checked=find(await run(member,'checkin',{id}),id);assert.equal(checked.progress,100);assert(checked.checkedInToday);
    assert.equal((await run(member,'checkin',{id})).status,409);
    assert.equal(find(await view(admin),id).roster[0].checkins,1);
    const av=(await view(admin)).data;
    for(const lang of langs){const args={state:av,t:k=>tr(k,lang),h:String,btn:(label,action,attrs)=>`<button ${attrs}>${label}</button>`};
      const ramadan=programPage({...args,id:'ramadan'}),startfit=programPage({...args,id:'startfit'});
      assert.match(ramadan,/Ramadan test/);assert(!ramadan.includes('StartFit test'));assert.match(startfit,/StartFit test/);assert(!startfit.includes('Ramadan test'));
      assert.equal(workspacePage({...args,id:'ramadan',production:true}),'');
      assert(!ramadan.includes('campaignStatus_active'));
    }
    const edited=find(await run(admin,'update',{...fields,id}),id);assert.equal(edited.tasks[0].id,taskId);assert.equal(edited.status,'draft');
    assert(!find(await view(member),id));await run(admin,'publish',{id});assert.deepEqual(find(await view(member),id).taskChecksToday,[taskId]);
    await run(admin,'flag',{enabled:false});assert(!find(await view(member),id));assert.equal((await run(member,'checkin',{id})).status,403);
    assert.deepEqual(programPayload({campaignCapacity:'',campaignTasks:'One\r\n\n Two '}),{campaignCapacity:null,campaignTasks:['One','Two']});
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
