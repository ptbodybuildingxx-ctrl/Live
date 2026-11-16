import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';
import { readReleaseConfig } from '../release.mjs';
import {newTestPassword} from './local-fixtures.mjs';

test('production preflight remains closed without real configuration',()=>{
  assert.throws(()=>readReleaseConfig({ML_MODE:'production'}),/Release blocked/);
  assert.equal(readReleaseConfig({}).production,false);
  assert.throws(()=>createApp({dbPath:':memory:',release:{production:true}}),/Release blocked/);
});

test('offline production simulation: no demos, verified email, secure sessions, privacy and deletion',async()=>{
  const outbox=[], userPassword=newTestPassword(), resetPassword=newTestPassword();
  const release={production:true,origin:'https://live.example.test',adminEmail:'owner@example.test',adminPassword:newTestPassword(),contact:'support@example.test',maxUsers:20,mailer:async m=>outbox.push(m)};
  const {server,db}=createApp({dbPath:':memory:',release,features:{smartDashboard:true,dashboardMetrics:true}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const request=async(path,body,cookie='',origin=release.origin)=>{
    const res=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json',...(origin?{Origin:origin}:{})}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
    return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0],headers:res.headers};
  };
  const act=(c,type,b={})=>request('/api/action',{type,...b},c);
  const auth=b=>request('/api/auth',b);
  const register=(email,name)=>auth({mode:'register',email,name,password:userPassword,role:'athlete',lang:'en',acceptPolicies:true,adult:true});
  const verify=async(email)=>auth({mode:'verify',email,code:outbox.findLast(x=>x.to===email&&x.purpose==='verify').code});
  const login=(email,password=userPassword)=>auth({mode:'login',email,password});
  try{
    const config=await request('/api/config');assert.equal(config.body.demo,false);assert.equal(config.body.production,true);assert.deepEqual(config.body.features,{smartDashboard:false,dashboardMetrics:false});
    assert.equal((await auth({mode:'demo',role:'admin'})).status,404);
    assert.equal((await request('/api/auth',{mode:'login',email:release.adminEmail,password:release.adminPassword},'','https://wrong.example')).status,403);
    assert.equal((await request('/api/auth',{mode:'login',email:release.adminEmail,password:release.adminPassword},'','')).status,403);
    const admin=await login(release.adminEmail,release.adminPassword);assert.equal(admin.status,200);assert.match(admin.headers.get('set-cookie'),/Secure/);assert.match(admin.headers.get('set-cookie'),/HttpOnly/);
    assert.equal(admin.body.admin.profiles.length,1);assert.equal(admin.body.posts.length,0);assert.equal(admin.body.conversations.length,0);
    assert.equal(admin.body.training,undefined);assert.equal((await act(admin.cookie,'training',{operation:'catalogCreate'})).status,404);
    assert.equal((await request('/api/training-media?exercise=push-up&slot=start',null,admin.cookie)).status,404);
    assert.equal(admin.body.identity,undefined);assert.equal(admin.body.dashboard,undefined);assert.equal(admin.body.wellness,undefined);assert.equal(admin.body.coaching,undefined);assert.equal(admin.body.clubOps,undefined);assert.equal(admin.body.clubChat,undefined);assert.equal((await act(admin.cookie,'identity',{operation:'switch',context:'personal:superAdmin'})).status,404);assert.equal((await act(admin.cookie,'wellness',{operation:'enable',confirm:true})).status,404);assert.equal((await act(admin.cookie,'coaching',{operation:'invite',target:'anyone'})).status,404);assert.equal((await act(admin.cookie,'clubOps',{operation:'branchCreate',name:'Test',city:'Test'})).status,404);assert.equal((await act(admin.cookie,'clubChat',{operation:'create',name:'Test',category:'club'})).status,404);assert.equal((await act(admin.cookie,'chatReport',{conversationId:'fake',messageId:'fake',reason:'Test'})).status,404);
    assert.equal((await auth({mode:'register',email:'minor@example.test',name:'Minor',password:userPassword,role:'athlete',adult:false,acceptPolicies:true})).status,400);
    const aEmail='athlete@example.test',bEmail='partner@example.test';
    const reg=await register(aEmail,'Athlete');assert.equal(reg.status,201);assert(reg.body.verificationRequired);assert(!reg.cookie);assert.equal(outbox.length,1);
    assert.equal((await login(aEmail)).status,403);assert.equal((await auth({mode:'verify',email:aEmail,code:'wrong'})).status,400);
    assert.equal((await verify(aEmail)).status,200);assert.equal((await verify(aEmail)).status,400);
    const a=await login(aEmail);assert.equal(a.status,200);assert.equal(a.body.me.privacy.posts,'followers');assert.equal(a.body.me.privacy.match,false);
    await register(bEmail,'Partner');assert.equal((await verify(bEmail)).status,200);
    const b=await login(bEmail);assert.equal(b.status,200);
    const post=await act(a.cookie,'post',{text:'Followers-only content'});assert.equal(post.status,200);const p=post.body.posts[0];
    assert(!(await request('/api/state',null,b.cookie)).body.posts.some(x=>x.id===p.id));
    const follow=await act(b.cookie,'follow',{target:a.body.me.id});assert.equal(follow.status,200);assert.equal(follow.body.followRequests.length,1);assert(!follow.body.posts.some(x=>x.id===p.id));
    const f=follow.body.followRequests[0];assert.equal((await act(b.cookie,'respondFollow',{id:f.id,accept:true})).status,403);
    assert.equal((await act(a.cookie,'respondFollow',{id:f.id,accept:true})).status,200);
    assert((await request('/api/state',null,b.cookie)).body.posts.some(x=>x.id===p.id));
    assert.equal((await act(b.cookie,'admin',{operation:'suspend',id:a.body.me.id})).status,403);
    const exported=await request('/api/account',{operation:'export',password:userPassword},a.cookie);assert.equal(exported.status,200);assert.equal(exported.body.profile.email,aEmail);assert(!('hash' in exported.body.profile));
    assert.equal((await request('/api/account',{operation:'delete',password:newTestPassword(),confirm:true},b.cookie)).status,401);
    assert.equal((await request('/api/account',{operation:'delete',password:userPassword,confirm:false},b.cookie)).status,400);
    assert.equal((await request('/api/account',{operation:'delete',password:userPassword,confirm:true},b.cookie)).status,200);
    assert.equal((await request('/api/state',null,b.cookie)).status,401);
    // Separate email to test reset without exhausting per-email anti-abuse limits.
    const cEmail='reset@example.test';await register(cEmail,'Reset account');await verify(cEmail);const c=await login(cEmail);
    await auth({mode:'forgot',email:cEmail});const code=outbox.findLast(x=>x.to===cEmail&&x.purpose==='reset').code;
    assert.equal((await auth({mode:'reset',email:cEmail,code,password:resetPassword})).status,200);
    assert.equal((await request('/api/state',null,c.cookie)).status,401);
    assert.equal((await login(cEmail,resetPassword)).status,200);
    assert.equal((await fetch(url+'/privacy')).status,200);
    assert.equal((await fetch(url+'/terms')).status,200);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});

