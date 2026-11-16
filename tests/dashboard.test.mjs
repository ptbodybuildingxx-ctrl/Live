import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../server.mjs';
import {dashboardFlags} from '../dashboard.mjs';
import {dashboardCompact,setDashboardCompact,dashboardPage,dashboardSettings} from '../dist/core/dashboard.js';
import {tr,langs,dictionary} from '../dist/i18n.js';

const withApp=async(features,run)=>{
  const {server,db}=createApp({dbPath:':memory:',features});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{
    const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});
    return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};
  };
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:'DemoLive2026!'});
  const act=(cookie,operation,params={})=>req('/api/action',{type:'identity',operation,...params},cookie);
  const view=cookie=>req('/api/state',null,cookie);
  try{await run({req,login,act,view,base})}finally{await new Promise(resolve=>server.close(resolve));db.close()}
};
const keys=d=>d.metrics.map(m=>m.key);
const targets=d=>d.actions.map(a=>a.target);
test('all nine roles: authenticated summaries, invite/revoke and tenant isolation',async()=>withApp({},async({req,login,act,view,base})=>{
  const [member,coach,gym,sara,admin]=await Promise.all(['athlete','coach','gym','sara','admin'].map(login));
  const d=member.data.dashboard;
  assert.equal(d.role,'member');assert(keys(d).includes('xp'));assert(!targets(d).includes('finance'));
  assert(!(await req('/api/state')).data.dashboard);
  const c=await act(coach.cookie,'switch',{context:'personal:coach'});assert.equal(c.data.dashboard.role,'coach');assert(targets(c.data.dashboard).includes('coaches'));
  const clubCoach=await act(coach.cookie,'switch',{context:'club-iron:coach'});assert.equal(clubCoach.data.dashboard.club.id,'club-iron');assert(!keys(clubCoach.data.dashboard).includes('xp'));
  const owner=gym.data.dashboard;assert.equal(owner.role,'clubOwner');assert.equal(owner.metrics.find(m=>m.key==='dashboardClubAccounts').value,4);assert(targets(owner).includes('finance'));
  const north=await act(sara.cookie,'switch',{context:'club-north:clubOwner'});assert.equal(north.data.dashboard.club.id,'club-north');assert.equal(north.data.dashboard.metrics.find(m=>m.key==='dashboardClubAccounts').value,1);
  const acct=await act(sara.cookie,'switch',{context:'club-iron:accountant'});assert.equal(acct.data.dashboard.role,'accountant');assert.deepEqual(acct.data.dashboard.metrics,[]);assert(targets(acct.data.dashboard).includes('finance'));
  assert.equal((await act(member.cookie,'switch',{context:'club-north:clubOwner'})).status,403);
  const grant=async(role,target,cookie)=>{
    const g=await act(gym.cookie,'invite',{clubId:'club-iron',role,target});assert.equal(g.status,200);
    const id=g.data.identity.invitations.find(v=>v.role===role&&v.target===target&&v.status==='pending').id;
    assert.equal((await act(cookie,'respond',{id,accept:true})).status,200);
    return (await act(cookie,'switch',{context:'club-iron:'+role})).data.dashboard;
  };
  const staff=await grant('staff','demo-athlete',member.cookie);assert.equal(staff.role,'staff');assert.deepEqual(staff.metrics,[]);assert(!targets(staff).includes('finance'));
  const manager=await grant('clubManager','demo-athlete',member.cookie);assert.equal(manager.role,'clubManager');assert(keys(manager).includes('dashboardClubAccounts'));assert(!keys(manager).includes('dashboardPendingInvites'));
  const grantId=(await view(gym.cookie)).data.identity.roster.find(g=>g.userId==='demo-athlete'&&g.role==='clubManager').id;
  assert.equal((await act(gym.cookie,'revoke',{id:grantId})).status,200);
  assert.notEqual((await view(member.cookie)).data.dashboard.role,'clubManager');assert(!targets((await view(member.cookie)).data.dashboard).includes('finance'));
  assert.equal(admin.data.dashboard.role,'admin');assert(!targets(admin.data.dashboard).includes('finance'));assert(keys(admin.data.dashboard).includes('users'));
  const superAdmin=await act(admin.cookie,'switch',{context:'personal:superAdmin'});assert.equal(superAdmin.data.dashboard.role,'superAdmin');assert(keys(superAdmin.data.dashboard).includes('identityAssignments'));
  const mod=await act(admin.cookie,'invite',{clubId:null,role:'moderator',target:'demo-coach'});const inv=mod.data.identity.invitations.find(v=>v.role==='moderator');
  await act(coach.cookie,'respond',{id:inv.id,accept:true});const moderator=await act(coach.cookie,'switch',{context:'personal:moderator'});assert.equal(moderator.data.dashboard.role,'moderator');assert.deepEqual(keys(moderator.data.dashboard),['dashboardPendingReports']);assert(!targets(moderator.data.dashboard).includes('admin'));
  assert.equal((await fetch(base+'/core/dashboard.js')).status,200);
  const storage=new Map(),store={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
  setDashboardCompact(north.data,store,true);assert(dashboardCompact(north.data,store));assert(!dashboardCompact(acct.data,store));assert(!dashboardCompact(gym.data,store));
  for(const lang of langs){const ctx={state:north.data,production:false,t:k=>tr(k,lang),h:String,btn:()=>''};assert.match(dashboardPage(ctx),/North Fitness/);assert.match(dashboardPage(ctx),/dashboard-metrics/);assert(!dashboardPage({...ctx,compact:true}).includes('dashboard-metrics'));assert.equal(dashboardPage({...ctx,production:true}),'');assert.match(dashboardSettings({...ctx,compact:true}),/checked/)}
  assert.equal(dashboardPage({state:{...north.data,identity:acct.data.identity},production:false}),'');
  for(const k of Object.keys(dictionary).filter(k=>k==='smartDashboard'||k.startsWith('dashboard')))assert(dictionary[k].every(Boolean));
}));
test('feature flags exclude dashboard or metrics; release cannot enable either',async()=>{
  assert.deepEqual(dashboardFlags(true,{smartDashboard:true,dashboardMetrics:true}),{smartDashboard:false,dashboardMetrics:false});
  await withApp({smartDashboard:false},async({login,req})=>{assert.equal((await req('/api/config')).data.features.smartDashboard,false);assert(!Object.hasOwn((await login('gym')).data,'dashboard'))});
  await withApp({dashboardMetrics:false},async({login})=>{const d=(await login('gym')).data.dashboard;assert.deepEqual(d.metrics,[]);assert.equal(d.metricsEnabled,false);assert(targets(d).includes('finance'))});
});
