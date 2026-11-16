import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';
import {rehabRegions,rehabSides,rehabStatuses,rehabContentTypes,rehabLanguages} from './dist/core/rehab-schema.js';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)fail(message,status)};
const text=(v,max,optional=false)=>{need(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length>0),'Invalid text');return v.trim()};
const num=(v,min,max)=>{need(Number.isInteger(v)&&v>=min&&v<=max,'Invalid number');return v};
const date=v=>{need(typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date');return v};
const choose=(v,options)=>{need(options.includes(v),'Invalid selection');return v};
const personal=(s,id)=>can(s,id,'personal.read',null);
const enabled=(s,id)=>!!s.wellness?.enabled.includes(id);
const profile=(s,id)=>s.profiles.find(p=>p.id===id&&!p.suspended&&p.emailVerified!==false&&p.role!=='admin');
const links=s=>(s.coaching?.links||[]).filter(l=>l.status==='active'&&profile(s,l.member)&&profile(s,l.coach)?.role==='coach'&&profile(s,l.coach)?.verified===true&&!(s.blocks||[]).some(x=>(x.from===l.member&&x.to===l.coach)||(x.from===l.coach&&x.to===l.member)));
const own=(d,id)=>(d.rehab||[]).filter(r=>r.owner===id);
function publicRecord({owner,shareLink,...r}){return {...r,region:r.region||'unspecified',side:r.side||'unspecified',status:r.status||'open',checkins:r.checkins||[],tasks:r.tasks||[],shareLink:shareLink||null}}
function body(b,old={}){return {title:text(b.title,100),note:text(b.note,1000),plan:text(b.plan??'',1000,true),date:date(b.date),progress:num(b.progress,0,100),region:choose(b.region??old.region??'unspecified',rehabRegions),side:choose(b.side??old.side??'unspecified',rehabSides),status:choose(b.status??old.status??'open',rehabStatuses)}}
function checkinBody(b){return {date:date(b.date),progress:num(b.progress,0,100),discomfort:b.discomfort==null?null:num(b.discomfort,0,10),note:text(b.note??'',1000,true)}}
const resetShare=r=>{r.shareLink=null;r.updatedAt=Date.now()};
export function rehabView(s,id,d){
  const ctx=activeContext(s,id),accepted=links(s);
  return {enabled:enabled(s,id),records:own(d,id).map(publicRecord),choices:accepted.filter(l=>l.member===id).map(l=>({id:l.id,name:profile(s,l.coach).name})),
    shared:ctx?.role==='coach'?d.rehab.filter(r=>enabled(s,r.owner)&&accepted.some(l=>l.id===r.shareLink&&l.coach===id&&l.member===r.owner)).map(r=>({...publicRecord(r),memberName:profile(s,r.owner).name})):[]};
}
export function rehabExport(d,id){return own(d,id).map(publicRecord)}
export function clearRehabRecords(d,id){if(d)d.rehab=(d.rehab||[]).filter(r=>r.owner!==id)}

function contentBody(b){return {title:text(b.title,100),description:text(b.description??'',1000,true),region:choose(b.region,rehabRegions),type:choose(b.contentType,rehabContentTypes),language:choose(b.language,rehabLanguages),content:text(b.content??'',12000,true)}}
const stripContent=({reviewer,source,reviewedAt,...r})=>({...r,reviewed:!!reviewedAt});
export function rehabContentView(d,admin,enabledFlag){
  return {canManage:admin,items:(d.rehabContent||[]).filter(x=>admin||(enabledFlag&&x.status==='published')).map(x=>admin?{...x}:stripContent(x))};
}
function contentAction(s,id,d,b,enabledFlag,audit){
  need(can(s,id,'platform.admin',null),'Platform administrator required',403);d.rehabContent??=[];
  const op=b.operation;
  if(op==='rehabContentCreate'){need(d.rehabContent.length<2000,'Content limit',429);const r={id:randomUUID(),...contentBody(b),status:'draft',reviewer:null,source:null,reviewedAt:null,updatedAt:Date.now()};d.rehabContent.push(r);audit(op,r.id);return}
  const r=d.rehabContent.find(x=>x.id===b.id);need(r,'Content not found',404);
  if(op==='rehabContentUpdate'){Object.assign(r,contentBody(b),{status:'draft',reviewer:null,source:null,reviewedAt:null,updatedAt:Date.now()})}
  else if(op==='rehabContentPublish'){
    need(enabledFlag&&r.status==='draft'&&r.content.trim().length>0,'Complete draft required',409);
    need(b.confirm===true,'Specialist review confirmation required',403);
    Object.assign(r,{status:'published',reviewer:text(b.reviewer,160),source:text(b.source,500),reviewedAt:Date.now(),updatedAt:Date.now()});
  }else if(op==='rehabContentArchive'||op==='rehabContentDraft'){r.status=op==='rehabContentArchive'?'archived':'draft';r.reviewer=null;r.source=null;r.reviewedAt=null;r.updatedAt=Date.now()}
  else fail('Unknown content operation');audit(op,r.id);
}
export function rehabAction(s,id,d,b,enabledFlag,audit){
  const op=b.operation;
  if(typeof op==='string'&&op.startsWith('rehabContent'))return contentAction(s,id,d,b,enabledFlag,audit);
  need(personal(s,id)&&enabled(s,id)&&enabledFlag,'Enable personal test records first',403);
  if(op==='create'){
    need(own(d,id).length<100,'Record limit',429);d.rehab.push({id:randomUUID(),owner:id,...body(b),createdAt:Date.now(),updatedAt:Date.now(),shareLink:null,checkins:[],tasks:[]});return;
  }
  const r=own(d,id).find(x=>x.id===b.id);need(r,'Record not found',404);
  if(op==='delete'){d.rehab=d.rehab.filter(x=>x!==r);return}
  if(op==='update'){Object.assign(r,body(b,r));resetShare(r);return}
  if(op==='share'){need(b.linkId===null||links(s).some(l=>l.id===b.linkId&&l.member===id),'Accepted coaching relationship required',403);r.shareLink=b.linkId;return}
  if(op==='rehabClose'||op==='rehabReopen'){r.status=op==='rehabClose'?'closed':'open';resetShare(r);return}
  r.checkins??=[];r.tasks??=[];
  if(op==='rehabCheckinCreate'||op==='rehabCheckinUpdate'){
    const data=checkinBody(b),row=op==='rehabCheckinUpdate'?r.checkins.find(x=>x.id===b.checkinId):null;
    if(op==='rehabCheckinUpdate')need(row,'Check-in not found',404);
    need(!r.checkins.some(x=>x!==row&&x.date===data.date),'One entry per date',409);
    need(!!row||r.checkins.length<500,'Check-in limit',429);
    if(row)Object.assign(row,data,{updatedAt:Date.now()});else r.checkins.push({id:randomUUID(),...data,updatedAt:Date.now()});resetShare(r);return;
  }
  if(op==='rehabCheckinDelete'){const row=r.checkins.find(x=>x.id===b.checkinId);need(row,'Check-in not found',404);r.checkins=r.checkins.filter(x=>x!==row);resetShare(r);return}
  if(op==='rehabTaskCreate'){need(r.tasks.length<100,'Plan item limit',429);r.tasks.push({id:randomUUID(),title:text(b.taskTitle,120),note:text(b.taskNote??'',500,true),completed:false});resetShare(r);return}
  if(['rehabTaskUpdate','rehabTaskToggle','rehabTaskDelete'].includes(op)){
    const row=r.tasks.find(x=>x.id===b.taskId);need(row,'Plan item not found',404);
    if(op==='rehabTaskUpdate')Object.assign(row,{title:text(b.taskTitle,120),note:text(b.taskNote??'',500,true)});
    else if(op==='rehabTaskToggle'){need(typeof b.completed==='boolean','Invalid completion');row.completed=b.completed}
    else r.tasks=r.tasks.filter(x=>x!==row);resetShare(r);return;
  }
  fail('Unknown rehab operation');
}
