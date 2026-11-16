import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';
import {healthGoalFields} from './dist/core/health-config.js';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)fail(message,status)};
const empty=()=>({habits:[],checks:[],suggestions:[],shares:[],goals:[]});
const store=s=>s.wellness?.health||empty();
const own=(rows,id)=>rows.filter(x=>x.owner===id);
const exposed=({owner,...row})=>row;
const enabled=(s,id)=>!!s.wellness?.enabled.includes(id);
const ownGoals=(d,id)=>d.goals?.find(g=>g.owner===id)?.values||{};
const dateOK=v=>typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const dateValue=v=>{need(dateOK(v),'Invalid date');return v};
const today=()=>new Date().toISOString().slice(0,10);
const profile=(s,id)=>s.profiles.find(p=>p.id===id);
const available=p=>!!p&&!p.suspended&&p.emailVerified!==false&&p.role!=='admin';
const links=s=>(s.coaching?.links||[]).filter(l=>l.status==='active'&&available(profile(s,l.member))&&available(profile(s,l.coach))&&profile(s,l.coach).verified===true&&profile(s,l.coach).role==='coach'&&!(s.blocks||[]).some(b=>(b.from===l.member&&b.to===l.coach)||(b.to===l.member&&b.from===l.coach)));
const role=(s,id)=>{const c=activeContext(s,id);return c?.clubId==null&&can(s,id,'personal.read',null)?c.role:null};
const text=(v,max)=>{need(typeof v==='string'&&v.trim().length>0&&v.trim().length<=max,'Invalid habit name');return v.trim()};
function habitBody(b){
  need(Array.isArray(b.days)&&b.days.length>=1&&b.days.length<=7&&b.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&new Set(b.days).size===b.days.length,'Invalid repeat days');
  need(b.reminder===''||b.reminder==null||typeof b.reminder==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(b.reminder),'Invalid reminder time');
  return {name:text(b.name,80),days:[...b.days].sort(),reminder:b.reminder||null};
}
export const scheduled=(h,d)=>{const p=h.schedule?.findLast(v=>v.date<=d);return d>=h.startDate&&(p?p.active&&p.days.includes(new Date(d+'T00:00:00Z').getUTCDay()):!h.schedule&&(!h.archivedDate||d<h.archivedDate)&&h.days.includes(new Date(d+'T00:00:00Z').getUTCDay()))};
function changeSchedule(h,date,days,active){
  date=dateValue(date);h.schedule??=[{date:h.startDate,days:h.days,active:true},...(h.archivedDate?[{date:h.archivedDate,days:h.days,active:false}]:[])];
  need(date>=h.schedule.at(-1).date,'Date precedes latest schedule');
  need(h.schedule.length<1000||date===h.schedule.at(-1).date,'Schedule history limit',429);
  if(h.schedule.at(-1).date===date)h.schedule.pop();h.schedule.push({date,days:[...days],active});
}
export function dayOffset(d,n){const v=new Date(d+'T00:00:00Z');v.setUTCDate(v.getUTCDate()+n);return v.toISOString().slice(0,10)}
function aggregate(s,id){
  const d=store(s),habits=own(d.habits,id),checks=new Set(own(d.checks,id).filter(c=>c.completed).map(c=>`${c.habitId}:${c.date}`)),end=today();
  let scheduledCount=0,completed=0;
  for(let i=0;i<7;i++){const date=dayOffset(end,-i);for(const h of habits.filter(h=>scheduled(h,date))){scheduledCount++;if(checks.has(`${h.id}:${date}`))completed++}}
  return {scheduled:scheduledCount,completed};
}
export function healthView(s,id){
  const d=store(s),r=role(s,id),accepted=links(s),members=accepted.filter(l=>l.member===id&&r==='member'),coaches=accepted.filter(l=>l.coach===id&&r==='coach');
  const visible=new Set([...members,...coaches].map(l=>l.id));
  return {habits:own(d.habits,id).map(exposed),checks:own(d.checks,id).map(exposed),goals:ownGoals(d,id),suggestions:d.suggestions.filter(x=>visible.has(x.linkId)&&x.status==='pending').map(({id,linkId,name,days,reminder,status,coach})=>({id,linkId,name,days,reminder,status,coachName:profile(s,coach).name})),
    shareLinks:members.map(l=>({id:l.id,name:profile(s,l.coach).name,enabled:d.shares.some(x=>x.linkId===l.id)})),
    coachLinks:coaches.filter(l=>enabled(s,l.member)).map(l=>({id:l.id,name:profile(s,l.member).name})),
    shared:coaches.filter(l=>enabled(s,l.member)&&d.shares.some(x=>x.linkId===l.id)).map(l=>({name:profile(s,l.member).name,...aggregate(s,l.member)}))};
}
export function healthExport(s,id){const d=store(s);return {habits:own(d.habits,id).map(exposed),checks:own(d.checks,id).map(exposed),goals:ownGoals(d,id),suggestions:d.suggestions.filter(x=>x.member===id||x.coach===id).map(({member,coach,...x})=>x),shares:d.shares.filter(x=>x.owner===id).map(exposed)}}
export function clearHealth(s,id){if(!s.wellness?.health)return;const d=s.wellness.health;d.habits=d.habits.filter(x=>x.owner!==id);d.checks=d.checks.filter(x=>x.owner!==id);d.suggestions=d.suggestions.filter(x=>x.member!==id&&x.coach!==id);d.shares=d.shares.filter(x=>x.owner!==id&&x.coach!==id);d.goals=(d.goals||[]).filter(x=>x.owner!==id)}
export function healthAction(s,id,b){
  need(enabled(s,id)&&role(s,id),'Personal test records required',403);
  s.wellness.health??=empty();const d=s.wellness.health;
  const op=b.operation;
  if(op==='healthGoalsSet'){
    need(b.goals&&typeof b.goals==='object'&&!Array.isArray(b.goals)&&Object.keys(b.goals).every(k=>healthGoalFields.some(f=>f.key===k)),'Invalid health goals');
    const values={};for(const f of healthGoalFields){const v=b.goals[f.key];if(v==null)continue;need(typeof v==='number'&&Number.isFinite(v)&&v>=f.min&&v<=f.max&&Math.abs(v/f.step-Math.round(v/f.step))<1e-8,'Invalid health goal');values[f.key]=v}
    d.goals=(d.goals||[]).filter(g=>g.owner!==id);if(Object.keys(values).length)d.goals.push({owner:id,values});return;
  }
  const create=body=>{need(own(d.habits,id).length<150,'Habit limit',429);const startDate=dateValue(b.date);d.habits.push({id:randomUUID(),owner:id,...body,startDate,archivedDate:null,schedule:[{date:startDate,days:[...body.days],active:true}]})};
  if(op==='healthHabitCreate'){create(habitBody(b));return}
  if(op==='healthHabitSuggest'||op==='healthShare'){
    const l=links(s).find(l=>l.id===b.linkId&&(op==='healthShare'?l.member===id&&role(s,id)==='member':l.coach===id&&role(s,id)==='coach'));
    need(l&&enabled(s,l.member),'Accepted coaching relationship required',403);
    if(op==='healthShare'){need(typeof b.enabled==='boolean','Invalid sharing choice');d.shares=d.shares.filter(x=>x.linkId!==l.id);if(b.enabled)d.shares.push({linkId:l.id,owner:id,coach:l.coach});return}
    need(d.suggestions.filter(x=>x.linkId===l.id&&x.status==='pending').length<20&&d.suggestions.filter(x=>x.linkId===l.id).length<200,'Suggestion limit',429);
    d.suggestions.push({id:randomUUID(),linkId:l.id,member:l.member,coach:id,...habitBody(b),status:'pending'});return;
  }
  if(op==='healthHabitRespond'){
    const x=d.suggestions.find(x=>x.id===b.id&&x.member===id&&x.status==='pending'&&links(s).some(l=>l.id===x.linkId));need(x&&role(s,id)==='member','Suggestion unavailable',404);need(typeof b.accept==='boolean','Invalid response');if(b.accept)create({name:x.name,days:x.days,reminder:x.reminder});x.status=b.accept?'accepted':'declined';return;
  }
  const h=d.habits.find(x=>x.id===b.id&&x.owner===id);need(h,'Habit not found',404);
  if(op==='healthHabitEdit'){const body=habitBody(b);changeSchedule(h,b.date,body.days,!h.archivedDate);Object.assign(h,body);return}
  if(op==='healthHabitArchive'){if(!h.archivedDate){changeSchedule(h,b.date,h.days,false);h.archivedDate=b.date}return}
  if(op==='healthHabitRestore'){if(h.archivedDate){changeSchedule(h,b.date,h.days,true);h.archivedDate=null}return}
  if(op==='healthHabitCheck'){
    const date=dateValue(b.date);need(scheduled(h,date),'Habit not scheduled');need(typeof b.completed==='boolean','Invalid completion');
    const row=d.checks.find(x=>x.owner===id&&x.habitId===h.id&&x.date===date);if(row){row.completed=b.completed;return}
    need(own(d.checks,id).length<15000,'Check-in limit',429);d.checks.push({owner:id,habitId:h.id,date,completed:b.completed});return;
  }
  fail('Unknown health operation');
}
