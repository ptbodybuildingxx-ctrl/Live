import { test } from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword,newTestPassword} from './local-fixtures.mjs';

test('local MVP: accounts, permissions, social, matches, chats and challenges',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const request=async(path,body,token='')=>{
    const res=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Cookie:token}:{})},body:body?JSON.stringify(body):undefined});
    return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};
  };
  const login=role=>request('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const act=(token,type,p={})=>request('/api/action',{type,...p},token);
  try{
    assert.equal((await fetch(url)).status,200);
    assert.equal((await request('/api/state')).status,401);
    const a=await login('athlete'),c=await login('coach'),admin=await login('admin'),g=await login('gym');
    assert.equal(a.status,200);assert.equal(a.body.me.role,'athlete');assert(!a.body.admin);assert(admin.body.admin);assert.equal(g.body.me.role,'gym');
    assert.equal((await act(a.cookie,'admin',{operation:'suspend',id:'demo-coach'})).status,403);
    const post=await act(a.cookie,'post',{text:'Local test post',kind:'workout'});assert.equal(post.status,200);
    const p=post.body.posts.find(x=>x.text==='Local test post');assert(p);
    assert.equal((await act(c.cookie,'like',{id:p.id})).body.posts.find(x=>x.id===p.id).likes.includes('demo-coach'),true);
    assert.equal((await act(c.cookie,'comment',{id:p.id,text:'Great work'})).status,200);
    await act(a.cookie,'settings',{posts:'private'});assert(!(await request('/api/state',null,c.cookie)).body.posts.some(x=>x.id===p.id));
    assert.equal((await act(c.cookie,'like',{id:p.id})).status,404);
    await act(a.cookie,'settings',{posts:'everyone'});
    const match=await act(a.cookie,'request',{target:'demo-coach',sport:'Strength'});assert.equal(match.status,200);
    const r=match.body.requests[0];assert.equal((await act(g.cookie,'respond',{id:r.id,accept:true})).status,403);
    assert.equal((await act(c.cookie,'respond',{id:r.id,accept:true})).status,200);
    const convo=(await request('/api/state',null,a.cookie)).body.conversations.find(x=>x.members.includes('demo-coach'));
    assert.equal((await act(a.cookie,'message',{id:convo.id,text:'See you at 6'})).status,200);
    assert((await request('/api/state',null,c.cookie)).body.conversations.find(x=>x.id===convo.id).messages.some(m=>m.text==='See you at 6'));
    assert.equal((await act(g.cookie,'message',{id:convo.id,text:'unauthorized'})).status,403);
    assert(!(await request('/api/state',null,admin.cookie)).body.conversations.some(x=>x.id===convo.id));
    await act(a.cookie,'block',{target:'demo-coach'});
    assert.equal((await act(c.cookie,'message',{id:convo.id,text:'blocked'})).status,403);
    assert(!(await request('/api/state',null,a.cookie)).body.profiles.some(x=>x.id==='demo-coach'));
    assert.equal((await act(a.cookie,'story',{text:'test story'})).status,200);
    const challenge=await act(a.cookie,'joinChallenge',{id:'challenge-1'});assert.equal(challenge.status,200);
    const checked=await act(a.cookie,'checkin',{id:'challenge-1'});assert.equal(checked.body.me.xp,a.body.me.xp+20);
    assert.equal((await act(a.cookie,'checkin',{id:'challenge-1'})).status,409);
    assert.equal((await act(a.cookie,'session',{title:'Not coach',at:Date.now()+3600000})).status,403);
    assert.equal((await act(c.cookie,'session',{title:'Test training',sport:'Strength',at:Date.now()+3600000})).status,200);
    const newUser=await request('/api/auth',{mode:'register',name:'Test coach',email:'test@example.local',password:newTestPassword(),role:'coach',lang:'sv'});
    assert.equal(newUser.status,200);assert.equal(newUser.body.me.lang,'sv');assert(!newUser.body.me.verified);
    const v=await act(newUser.cookie,'verification',{text:'Training certificate'});assert.equal(v.status,200);
    assert.equal((await act(admin.cookie,'admin',{operation:'verify',id:v.body.verifications[0].id,accept:true})).status,200);
    assert.equal((await request('/api/state',null,newUser.cookie)).body.me.verified,true);
    assert.equal((await act(a.cookie,'report',{targetType:'post',id:'post-2',reason:'Test moderation'})).status,200);
    const report=(await request('/api/state',null,admin.cookie)).body.admin.reports[0];
    assert.equal((await act(admin.cookie,'admin',{operation:'resolve',id:report.id})).status,200);
    assert.equal((await request('/api/logout',{},a.cookie)).status,200);
    assert.equal((await request('/api/state',null,a.cookie)).status,401);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
