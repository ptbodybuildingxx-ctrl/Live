import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {createApp,demoPassword,newTestPassword} from './local-fixtures.mjs';
import {wellnessKinds} from '../dist/core/wellness-schema.js';
import {wellnessPage,wellnessForm,wellnessFormRecord} from '../dist/core/wellness-ui.js';
import {tr,langs,dictionary} from '../dist/i18n.js';

const date='2026-11-16';
const fixtures={
  plan:{recordTitle:'Test program',recordExercises:['Squat','Row']},
  workout:{recordDate:date,recordExercise:'Test squat',recordSets:3,recordReps:10,recordWeight:25.5},
  meal:{recordDate:date,recordMeal:'recordBreakfast',recordFood:'Test meal',recordCalories:450},
  water:{recordDate:date,recordMl:500},
  habit:{recordDate:date,recordHabit:'Test habit',recordComplete:true},
  sleep:{recordDate:date,recordHours:7.5},
  measurement:{recordDate:date,recordWeight:80.5}
};
async function open(dbPath){
  const {server,db}=createApp({dbPath});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  return {db,base,req,login:role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword}),action:(cookie,b)=>req('/api/action',{type:'wellness',...b},cookie),view:cookie=>req('/api/state',null,cookie),close:async()=>{await new Promise(resolve=>server.close(resolve));db.close()}};
}
test('local record CRUD for all seven kinds, owner isolation, validation, persistence and account deletion',async()=>{
  const dir=mkdtempSync(join(process.cwd(),'wellness-test-'));let app;
  try{
    app=await open(join(dir,'test.sqlite'));
    let [a,c,g,s,admin]=await Promise.all(['athlete','coach','gym','sara','admin'].map(app.login));
    assert.deepEqual(a.data.wellness,{enabled:false,records:[]});assert(!g.data.wellness);assert(!admin.data.wellness);
    const act=(b,cookie=a.cookie)=>app.action(cookie,b);
    assert.equal((await act({operation:'create',kind:'plan',record:fixtures.plan})).status,403);
    assert.equal((await act({operation:'enable'})).status,400);
    assert.equal((await act({operation:'enable',confirm:true},admin.cookie)).status,403);
    assert.equal((await act({operation:'enable',confirm:true},g.cookie)).status,403);
    assert.equal((await act({operation:'enable',confirm:true})).status,200);
    const ids={};
    for(const [kind,record] of Object.entries(fixtures)){
      const result=await act({operation:'create',kind,record});assert.equal(result.status,200,kind);const row=result.data.wellness.records.find(x=>x.kind===kind);assert.deepEqual(row.data,record);assert(!Object.hasOwn(row,'owner'));ids[kind]=row.id;
    }
    const aState=(await app.view(a.cookie)).data;
    assert.equal(aState.wellness.records.length,7);
    assert.equal((await act({operation:'create',kind:'workout',record:{...fixtures.workout,recordSets:-1}})).status,400);
    assert.equal((await act({operation:'create',kind:'workout',record:{...fixtures.workout,recordDate:'2026-02-31'}})).status,400);
    assert.equal((await act({operation:'create',kind:'meal',record:{...fixtures.meal,recordCalories:'450'}})).status,400);
    assert.equal((await act({operation:'create',kind:'measurement',record:{...fixtures.measurement,owner:'demo-coach'}})).status,400);
    assert.equal((await act({operation:'create',kind:'sleep',record:fixtures.sleep})).status,409);
    assert.equal((await act({operation:'update',id:ids.workout,kind:'meal',record:fixtures.meal})).status,400);
    const updated=await act({operation:'update',id:ids.workout,kind:'workout',record:{...fixtures.workout,recordWeight:30}});assert.equal(updated.status,200);assert.equal(updated.data.wellness.records.find(r=>r.id===ids.workout).data.recordWeight,30);
    assert.equal((await act({operation:'enable',confirm:true},c.cookie)).status,200);
    assert.equal((await act({operation:'update',id:ids.workout,kind:'workout',record:fixtures.workout},c.cookie)).status,404);
    assert.equal((await act({operation:'delete',id:ids.workout},c.cookie)).status,404);
    assert.deepEqual((await app.view(c.cookie)).data.wellness.records,[]);
    assert(!JSON.stringify((await app.view(admin.cookie)).data).includes('Test squat'));
    const switched=await app.req('/api/action',{type:'identity',operation:'switch',context:'club-iron:member'},a.cookie);assert.equal(switched.status,200);assert(!switched.data.wellness);
    assert.equal((await act({operation:'delete',id:ids.workout})).status,403);
    const personal=await app.req('/api/action',{type:'identity',operation:'switch',context:'personal:member'},a.cookie);assert.equal(personal.data.wellness.records.length,7);
    const exported=await app.req('/api/account',{operation:'export',password:demoPassword},a.cookie);assert.equal(exported.data.wellness.records.length,7);
    const otherExport=await app.req('/api/account',{operation:'export',password:demoPassword},c.cookie);assert.equal(otherExport.data.wellness.records.length,0);
    for(const lang of langs){const context={state:aState,id:'nutrition',t:k=>tr(k,lang),h:String,btn:()=>'',today:date};const html=wellnessPage(context);assert.match(html,/450/);assert.match(html,/500/);assert.match(html,/Test meal/);assert.match(wellnessForm('meal',fixtures.meal,context.t,String),/450/)}
    assert.equal((await fetch(app.base+'/core/wellness-ui.js')).status,200);
    assert.equal((await fetch(app.base+'/core/wellness-schema.js')).status,200);
    await app.close();app=await open(join(dir,'test.sqlite'));
    assert.equal((await app.view(a.cookie)).status,401);
    [a,c,s]=await Promise.all(['athlete','coach','sara'].map(app.login));
    assert.equal((await app.view(a.cookie)).data.wellness.records.length,7);
    assert.equal((await act({operation:'delete',id:ids.measurement})).status,200);
    assert.equal((await app.view(a.cookie)).data.wellness.records.length,6);
    assert.equal((await act({operation:'clear'})).status,400);
    assert.equal((await act({operation:'clear',confirm:true})).status,200);
    assert.deepEqual((await app.view(a.cookie)).data.wellness,{enabled:false,records:[]});
    await act({operation:'enable',confirm:true},s.cookie);await act({operation:'create',kind:'plan',record:fixtures.plan},s.cookie);
    // Sara owns a club, so exercise account deletion using a non-owner coach account.
    await act({operation:'create',kind:'plan',record:fixtures.plan},c.cookie);
    assert.equal((await app.req('/api/account',{operation:'delete',password:demoPassword,confirm:true},c.cookie)).status,200);
    const stored=JSON.parse(app.db.prepare('SELECT data FROM state WHERE id=1').get().data);
    assert(!stored.wellness.records.some(r=>r.owner==='demo-coach'));assert(!stored.wellness.enabled.includes('demo-coach'));assert(stored.wellness.records.some(r=>r.owner==='demo-sara'));
  }finally{if(app)await app.close();rmSync(dir,{recursive:true,force:true})}
});
test('wellness schema labels are translated and form conversion is typed',()=>{
  for(const k of ['wellnessLocal',...Object.keys(dictionary).filter(k=>k.startsWith('wellness')||k.startsWith('record'))])assert(dictionary[k].every(Boolean),k);
  for(const schema of Object.values(wellnessKinds))for(const f of schema.fields)for(const l of langs){assert.notEqual(tr(f.key,l),f.key);for(const opt of f.options||[])assert.notEqual(tr(opt,l),opt)}
  const fd=new FormData();fd.set('recordDate',date);fd.set('recordMl','500');assert.deepEqual(wellnessFormRecord('water',fd),fixtures.water);
});
