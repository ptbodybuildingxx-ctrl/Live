import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import http from 'node:http';
import {createApp} from '../server.mjs';
import {newTestPassword} from './local-fixtures.mjs';

test('demo secrets rotate on restart, local quick login remains available and actual users are preserved',async()=>{
  const folder=mkdtempSync(join(tmpdir(),'ml-demo-security-')),dbPath=join(folder,'test.sqlite');
  const first=newTestPassword(),second=newTestPassword(),userPassword=newTestPassword();
  let app;
  const start=async password=>{
    app=createApp({dbPath,demoPassword:password});
    await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
    return async(path,body,cookie='',host)=>{
      if(host)return new Promise((resolve,reject)=>{const request=http.request({hostname:'127.0.0.1',port:app.server.address().port,path,method:'POST',headers:{host,'Content-Type':'application/json'}},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode}))});request.on('error',reject);request.end(JSON.stringify(body))});
      const res=await fetch('http://127.0.0.1:'+app.server.address().port+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...(host?{Host:host}:{})},body:body?JSON.stringify(body):undefined});
      return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};
    };
  };
  const close=async()=>{if(app){await new Promise(r=>app.server.close(r));app.db.close();app=null}};
  const login=password=>({mode:'login',email:'athlete@demo.local',password});
  try{
    let req=await start(first);
    const demo=await req('/api/auth',login(first));assert.equal(demo.status,200);
    assert.equal((await req('/api/action',{type:'post',text:'Persistence test'},demo.cookie)).status,200);
    const person=await req('/api/auth',{mode:'register',name:'Local fixture',role:'athlete',email:'person@example.test',password:userPassword});assert.equal(person.status,200);
    assert.equal((await req('/api/auth',{mode:'demo',role:'admin'},'','untrusted.example')).status,403);
    await close();req=await start(second);
    assert.equal((await req('/api/state',null,demo.cookie)).status,401);
    assert.equal((await req('/api/auth',login(first))).status,401);
    const fresh=await req('/api/auth',login(second));assert.equal(fresh.status,200);assert(fresh.body.posts.some(p=>p.text==='Persistence test'));
    assert.equal((await req('/api/auth',{mode:'demo',role:'admin'})).status,200);
    assert.equal((await req('/api/state',null,person.cookie)).status,200);
    assert.equal((await req('/api/auth',{mode:'login',email:'person@example.test',password:userPassword})).status,200);
    assert(!JSON.stringify(fresh.body).includes(second));
    await close();req=await start(undefined);
    assert.equal((await req('/api/auth',login(second))).status,401);
    assert.equal((await req('/api/auth',{mode:'demo',role:'athlete'})).status,200);
  }finally{await close();rmSync(folder,{recursive:true,force:true})}
});
