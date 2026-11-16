import {randomUUID} from 'node:crypto';
import {can,activeContext} from './identity.mjs';

const fail=(msg,status=403)=>{throw Object.assign(new Error(msg),{status})};
const require=(ok,msg,status)=>{if(!ok)fail(msg,status)};
const profile=(s,id)=>s.profiles.find(p=>p.id===id);
const available=p=>!!p&&!p.suspended&&p.emailVerified!==false&&p.role!=='admin';
const coachOK=(s,id)=>{const p=profile(s,id);return available(p)&&p.role==='coach'&&p.verified===true};
const blocked=(s,a,b)=>s.blocks.some(x=>(x.from===a&&x.to===b)||(x.from===b&&x.to===a));
const valid=(s,l)=>coachOK(s,l.coach)&&available(profile(s,l.member))&&!blocked(s,l.coach,l.member);
const contextRole=(s,id)=>{const c=activeContext(s,id);if(c?.clubId||!can(s,id,'personal.read'))return null;return c.role==='coach'&&coachOK(s,id)?'coach':c.role==='member'?'member':null};
const roleMatch=(l,id,role)=>role==='coach'?l.coach===id:role==='member'&&l.member===id;
const links=s=>s.coaching?.links||[];
const programs=s=>s.coaching?.programs||[];
const active=(s,l)=>l?.status==='active'&&valid(s,l);
const publicProgram=({id,title,exercises,notes,archived,completedAt,updatedAt})=>({id,title,exercises,notes,archived,completedAt,updatedAt});
function end(l){l.status='ended';l.shareWorkout=false;l.endedAt=Date.now()}
export function revokeCoachingPair(s,a,b){for(const l of links(s))if(l.status!=='ended'&&((l.coach===a&&l.member===b)||(l.coach===b&&l.member===a)))end(l)}
export function disableWorkoutSharing(s,id){for(const l of links(s))if(l.member===id)l.shareWorkout=false}
export function removeCoaching(s,id){
  if(!s.coaching)return;
  const removed=new Set(links(s).filter(l=>l.coach===id||l.member===id).map(l=>l.id));
  s.coaching.links=links(s).filter(l=>!removed.has(l.id));s.coaching.programs=programs(s).filter(p=>!removed.has(p.linkId));
}
const ownWorkouts=(s,id)=>s.wellness?.enabled.includes(id)?s.wellness.records.filter(r=>r.owner===id&&r.kind==='workout').sort((a,b)=>b.data.recordDate.localeCompare(a.data.recordDate)||b.updatedAt-a.updatedAt):[];
export function coachingView(s,id){
  const role=contextRole(s,id);if(!role)return undefined;
  const rows=links(s).filter(l=>roleMatch(l,id,role)&&l.status!=='ended'&&valid(s,l));
  const view=rows.map(l=>{
    const other=role==='coach'?l.member:l.coach, p=profile(s,other);
    const data={id:l.id,otherId:other,otherName:p.name,status:l.status,incoming:l.sender!==id,shareWorkout:l.shareWorkout===true,programs:[]};
    if(active(s,l)){
      data.programs=programs(s).filter(p=>p.linkId===l.id).map(publicProgram);
      if(role==='coach'&&l.shareWorkout){const logs=ownWorkouts(s,l.member);data.progress={count:logs.length,recent:logs.slice(0,50).map(r=>({...r.data}))}}
    }
    return data;
  });
  const past=role==='member'?links(s).filter(l=>l.member===id&&!active(s,l)).filter(l=>l.status==='ended'||l.status==='active'):[];
  return {role,links:view,canShareWorkout:role==='member'&&!!s.wellness?.enabled.includes(id),pastPrograms:past.flatMap(l=>programs(s).filter(p=>p.linkId===l.id).map(p=>({...publicProgram(p),archived:true})))};
}
export function coachingExport(s,id){
  if(!s.coaching)return undefined;
  const own=links(s).filter(l=>l.member===id||(l.coach===id&&l.status!=='ended'&&valid(s,l)));
  return {links:own.map(l=>({id:l.id,role:l.member===id?'member':'coach',status:l.status,shareWorkout:l.shareWorkout,createdAt:l.createdAt})),programs:own.flatMap(l=>programs(s).filter(p=>p.linkId===l.id).map(publicProgram))};
}
const trim=(v,max,optional=false)=>{require(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length>0),'Invalid program text',400);return v.trim()};
function programBody(b){
  require(Array.isArray(b.exercises)&&b.exercises.length>=1&&b.exercises.length<=20,'Invalid exercise list',400);
  return {title:trim(b.title,80),exercises:b.exercises.map(x=>trim(x,120)),notes:trim(b.notes??'',500,true)};
}
export function coachingAction(s,id,b){
  const role=contextRole(s,id);require(role,'Personal member or verified coach context required');
  if(b.operation==='invite'){
    require(typeof b.target==='string'&&b.target!==id,'Invalid recipient',400);
    const coach=role==='coach'?id:b.target,member=role==='member'?id:b.target;
    const l={coach,member};require(valid(s,l),'Coaching recipient unavailable',404);
    s.coaching??={links:[],programs:[]};
    require(!links(s).some(x=>x.coach===coach&&x.member===member&&x.status!=='ended'),'Relationship already exists',409);
    require([coach,member].every(u=>links(s).filter(x=>x.status!=='ended'&&(x.coach===u||x.member===u)).length<20),'Active relationship limit',429);
    require([coach,member].every(u=>links(s).filter(x=>x.coach===u||x.member===u).length<200),'Relationship history limit',429);
    s.coaching.links.push({id:randomUUID(),coach,member,sender:id,status:'pending',shareWorkout:false,createdAt:Date.now()});return;
  }
  const l=links(s).find(x=>x.id===b.linkId&&roleMatch(x,id,role)&&x.status!=='ended');
  require(l,'Relationship not found',404);
  if(b.operation==='end'){end(l);return}
  require(valid(s,l),'Relationship unavailable',404);
  if(b.operation==='respond'){
    require(l.status==='pending'&&l.sender!==id,'Invitation unavailable',404);require(typeof b.accept==='boolean','Invalid response',400);
    if(b.accept){l.status='active';l.acceptedAt=Date.now()}else end(l);return;
  }
  require(active(s,l),'Accepted relationship required',403);
  if(b.operation==='share'){
    require(role==='member','Only trainee can change sharing');require(typeof b.enabled==='boolean','Invalid sharing choice',400);
    require(!b.enabled||!!s.wellness?.enabled.includes(id),'Enable personal test records first',409);
    l.shareWorkout=b.enabled;return;
  }
  if(b.operation==='programCreate'){
    require(role==='coach','Coach role required');require(programs(s).filter(p=>p.linkId===l.id).length<50,'Program limit',429);
    s.coaching.programs.push({id:randomUUID(),linkId:l.id,...programBody(b),archived:false,completedAt:null,updatedAt:Date.now()});return;
  }
  const p=programs(s).find(x=>x.id===b.programId&&x.linkId===l.id);require(p,'Program not found',404);
  if(b.operation==='programUpdate'){
    require(role==='coach'&&!p.archived,'Active coach program required');Object.assign(p,programBody(b),{completedAt:null,updatedAt:Date.now()});return;
  }
  if(b.operation==='programArchive'){require(role==='coach','Coach role required');p.archived=true;p.updatedAt=Date.now();return}
  if(b.operation==='programComplete'){require(role==='member'&&!p.archived,'Active trainee program required');require(typeof b.completed==='boolean','Invalid completion',400);p.completedAt=b.completed?Date.now():null;p.updatedAt=Date.now();return}
  fail('Unknown coaching operation',400);
}
