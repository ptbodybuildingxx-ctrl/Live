import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword,newTestPassword} from './local-fixtures.mjs';
import {programPage} from '../dist/core/programs-ui.js';
import {updateMasterAdminFilter,resetMasterAdmin} from '../dist/core/master-admin-ui.js';
import {tr,langs} from '../dist/i18n.js';

test('Master Admin Pro is platform-context scoped, manages accounts and keeps private domains separate',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),run=(u,operation,b={})=>act(u,'masterAdmin',{operation,...b}),view=u=>req('/api/state',null,u.cookie);
  const render=(state,lang='en')=>programPage({state,id:'masterAdmin',t:k=>tr(k,lang),h:String,btn:(label,action,attrs)=>`<button data-action="${action}" ${attrs}>${label}</button>`});
  try{
    assert.equal((await fetch(url+'/core/master-admin-ui.js')).status,200);
    const [admin,member,coach,gym]=await Promise.all(['admin','athlete','coach','gym'].map(login));
    for(const u of [member,coach,gym]){assert.equal(u.data.masterAdmin,undefined);assert.equal((await run(u,'accountStatus',{id:'demo-athlete',enabled:true})).status,403)}
    assert.equal(admin.data.masterAdmin.summary.accounts,5);assert.equal(admin.data.masterAdmin.summary.clubs,2);assert.equal(admin.data.masterAdmin.canAssign,false);assert(admin.data.dashboard.actions.some(a=>a.target==='masterAdmin'));
    assert(!JSON.stringify(admin.data.masterAdmin).includes('@demo.local'));assert(!JSON.stringify(admin.data.masterAdmin).includes('Ready for today'));
    assert.equal((await run(admin,'accountStatus',{id:'demo-admin',enabled:true})).status,403);
    assert.equal((await run(admin,'accountStatus',{id:'demo-athlete',enabled:'true'})).status,400);
    const suspended=await run(admin,'accountStatus',{id:'demo-athlete',enabled:true});assert.equal(suspended.status,200);assert.equal(suspended.data.masterAdmin.summary.suspended,1);assert.equal((await view(member)).status,401);
    const repeated=await run(admin,'accountStatus',{id:'demo-athlete',enabled:true});assert.equal(repeated.data.masterAdmin.summary.suspended,1);assert.equal(repeated.data.masterAdmin.audit.filter(a=>a.operation==='suspend').length,1);
    assert.equal((await run(admin,'accountStatus',{id:'demo-athlete',enabled:false})).status,200);
    const restoredMember=await login('athlete');assert.equal(restoredMember.status,200);
    await act(restoredMember,'wellness',{operation:'enable',confirm:true});
    const secret='Private rehab note never in admin panel';await act(restoredMember,'programs',{module:'rehab',operation:'create',title:'Test',note:secret,plan:'Test only',date:new Date().toISOString().slice(0,10),progress:0});
    const food={names:{en:'Fixture food',ar:'طعام تجريبي',sv:'Testmat'},cuisine:'basic',group:'grains',status:'ready',nutrients:{kcal:100,protein:3,carbs:20,fat:1},portions:{cup:150},source:'Local fictional fixture'};
    assert.equal((await act(admin,'nutrition',{operation:'foodImport',rows:[food]})).status,200);
    assert((await view(admin)).data.masterAdmin.audit.some(a=>a.source==='nutrition'&&a.operation==='foodImport'));
    assert.equal((await act(restoredMember,'nutrition',{operation:'foodCreate',...food})).status,200);
    assert(!(await view(admin)).data.masterAdmin.audit.some(a=>a.source==='nutrition'&&a.operation==='foodCreate'));
    const day=new Date().toISOString().slice(0,10);const event=await act(gym,'programs',{module:'events',operation:'create',scope:'club',title:'Private club event',description:'Club only',language:'en',start:day,end:day,time:'18:00',location:'Club',minimum:1,capacity:2});assert.equal(event.status,200);
    assert.equal((await view(admin)).data.masterAdmin.counts.events.total,0);
    assert(!JSON.stringify((await view(admin)).data.masterAdmin).includes(secret));assert(!JSON.stringify((await view(admin)).data.masterAdmin).includes('Private club event'));
    const newCoach=await req('/api/auth',{mode:'register',name:'Candidate coach',email:'candidate@example.local',password:newTestPassword(),role:'coach',lang:'en'});assert.equal(newCoach.status,200);
    const submitted=await act(newCoach,'verification',{text:'Test credentials'});const vid=submitted.data.verifications[0].id;
    assert.equal((await view(admin)).data.masterAdmin.verifications[0].id,vid);assert.equal((await run(coach,'verify',{id:vid,accept:true})).status,403);
    assert.equal((await run(admin,'verify',{id:vid,accept:true})).status,200);assert.equal((await view(newCoach)).data.me.verified,true);
    assert.equal((await act(admin,'programs',{module:'library',operation:'flag',enabled:false})).data.masterAdmin.flags.library,false);
    const superAdmin=await act(admin,'identity',{operation:'switch',context:'personal:superAdmin'});assert.equal(superAdmin.data.masterAdmin.canAssign,true);
    const invitation=await act(admin,'identity',{operation:'invite',clubId:null,role:'moderator',target:'demo-coach'});const grant=invitation.data.identity.invitations.find(x=>x.role==='moderator');await act(coach,'identity',{operation:'respond',id:grant.id,accept:true});
    const moderator=await act(coach,'identity',{operation:'switch',context:'personal:moderator'});assert.equal(moderator.data.masterAdmin,undefined);assert.equal((await run(coach,'accountStatus',{id:'demo-athlete',enabled:true})).status,403);
    assert.equal((await run(admin,'accountStatus',{id:'demo-coach',enabled:true})).status,403);assert.equal((await act(admin,'admin',{operation:'suspend',id:'demo-coach'})).status,403);
    const state=(await view(admin)).data;assert.equal(state.masterAdmin.platformModeratorCount,1);assert(state.masterAdmin.audit.some(a=>a.operation==='verifyApproved'));assert(state.masterAdmin.audit.some(a=>a.source==='library'&&a.operation==='flag'));
    resetMasterAdmin();for(const lang of langs){const html=render(state,lang);assert.match(html,/MUSCLIVO LIVE \/ MASTER ADMIN/);assert.match(html,/Candidate coach/);assert(!html.includes('masterOverview'));assert(!html.includes(secret))}
    updateMasterAdminFilter(state.me.id,{query:'Candidate',role:'coach'});assert.match(render(state),/Candidate coach/);assert(!render(state).includes('Omar Fitness'));resetMasterAdmin();
    assert.equal(render(moderator.data),'');
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
