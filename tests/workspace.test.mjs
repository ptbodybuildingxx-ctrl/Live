import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {modules,canOpen,allowedModules,filterCoaches,samples} from '../dist/core/modules.js';
import {tr,langs,dictionary} from '../dist/i18n.js';
import {workspacePage,toggleSample,resetWorkspace} from '../dist/core/workspace.js';

test('local module registry, translation keys and role gate',()=>{
  assert.equal(new Set(modules.map(m=>m.id)).size,modules.length);
  assert(!canOpen('finance','athlete'));assert(canOpen('finance','gym'));
  assert.equal(allowedModules('admin',true).length,0);
  assert(!canOpen('unknown','admin'));
  for(const key of [...modules.flatMap(m=>[m.id,m.stage,...m.items]),...Object.values(samples).flat()])for(const lang of langs)assert.notEqual(tr(key,lang),key);
  for(const values of Object.values(dictionary))assert(values.every(Boolean));
  const candidates=[{role:'coach',spokenLanguages:['ar','sv']},{role:'coach',lang:'en'},{role:'gym',lang:'sv'}];
  assert.equal(filterCoaches(candidates,['ar','en']).length,2);
  assert.equal(filterCoaches(candidates,['sv']).length,1);
  assert.equal(filterCoaches(candidates,[]).length,2);
});

test('demo checklist is temporary, per account, and cannot render in release mode',()=>{
  const state={me:{id:'a',role:'athlete'},profiles:[]};
  const context={state,id:'train',production:false,t:k=>tr(k,'en'),h:String,ic:()=>'',btn:()=>'',person:()=>'',lang:'en'};
  resetWorkspace();assert.match(workspacePage(context),/0 \/ 3/);
  toggleSample(state,'train','sampleSquat');assert.match(workspacePage(context),/1 \/ 3/);
  assert.match(workspacePage({...context,state:{me:{id:'b',role:'athlete'},profiles:[]}}),/0 \/ 3/);
  assert.equal(workspacePage({...context,production:true}),'');
});

test('local server serves modules and validates coach language edits',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
  try{
    for(const path of ['/core/modules.js','/core/workspace.js','/languages/ar.js','/languages/en.js','/languages/sv.js'])assert.equal((await req(path)).status,200);
    assert.equal((await req('/core/unknown.js')).status,404);
    const auth=await req('/api/auth',{mode:'login',email:'coach@demo.local',password:'DemoLive2026!'});
    const cookie=auth.headers.get('set-cookie').split(';')[0];
    const edit=await req('/api/action',{type:'profile',spokenLanguages:['ar','sv','ar']},cookie);
    assert.equal(edit.status,200);assert.deepEqual((await edit.json()).me.spokenLanguages,['ar','sv']);
    assert.equal((await req('/api/action',{type:'profile',spokenLanguages:['invalid']},cookie)).status,400);
    const athlete=await req('/api/auth',{mode:'login',email:'athlete@demo.local',password:'DemoLive2026!'});
    assert.equal((await req('/api/action',{type:'profile',spokenLanguages:['en']},athlete.headers.get('set-cookie').split(';')[0])).status,400);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
