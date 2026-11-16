import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';

// Local test-data only. All writes are validated again on the server.
export const programModules=['events','campaigns','library','rehab'];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)fail(message,status)};
const txt=(v,max,optional=false)=>{need(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length),'Invalid text');return v.trim()};
const num=(v,min,max)=>{need(Number.isInteger(v)&&v>=min&&v<=max,'Invalid number');return v};
const date=v=>{need(typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date');return v};
const today=()=>new Date().toISOString().slice(0,10);
const empty=()=>({flags:{},items:[],entries:[],rehab:[],audit:[]});
const read=s=>s.programs||empty();
const store=s=>s.programs??=empty();
const enabled=(s,k)=>read(s).flags[k]!==false;
const admin=(s,id)=>can(s,id,'platform.admin');
const personal=(s,id)=>can(s,id,'personal.read');
const profile=(s,id)=>s.profiles.find(p=>p.id===id&&!p.suspended&&p.emailVerified!==false);
const blocked=(s,a,b)=>s.blocks.some(x=>(x.from===a&&x.to===b)||(x.from===b&&x.to===a));
const activeLink=(s,l)=>l.status==='active'&&profile(s,l.member)&&profile(s,l.coach)?.verified===true&&!blocked(s,l.member,l.coach);
const links=s=>s.coaching?.links||[];
const eligible=(s,id,clubId)=>!!profile(s,id)&&(!clubId||s.identity?.grants.some(g=>g.userId===id&&g.clubId===clubId));
const manage=(s,id,row)=>row.clubId?can(s,id,'club.manage',row.clubId):admin(s,id);
const scope=(s,id,row)=>!row.clubId||can(s,id,'club.read',row.clubId);
const audit=(s,id,operation,target,module)=>{const a=store(s).audit;a.unshift({id:randomUUID(),actor:id,operation,target,module,at:Date.now()});a.splice(1000)};
const participants=(s,row)=>read(s).entries.filter(e=>e.itemId===row.id&&eligible(s,e.owner,row.clubId));
const confirmed=(s,row)=>participants(s,row).slice(0,row.capacity);
const eventStatus=(s,row)=>row.status!=='published'?row.status:row.end<today()?'ended':confirmed(s,row).length>=row.minimum?'confirmed':'pending';
const eventState=(s,row)=>({confirmed:eventStatus(s,row)==='confirmed',seats:new Set(confirmed(s,row).map(e=>e.owner))});
function eventChanges(s,row,before){
  if(row.module!=='events'||row.status!=='published')return;
  const after=eventState(s,row);
  for(const e of participants(s,row)){
    const p=profile(s,e.owner);if(!p?.privacy.notifications)continue;
    const seat=after.seats.has(e.owner)&&!before.seats.has(e.owner),changed=after.confirmed!==before.confirmed;
    if(!seat&&!changed)continue;
    const labels={en:['A seat is available','Event confirmed','Minimum no longer reached'],ar:['تأكد مقعدك','تأكدت الفعالية','لم يعد الحد الأدنى متحققاً'],sv:['En plats är tillgänglig','Evenemang bekräftat','Minimiantal uppnås inte längre']};
    const lang=labels[p.lang]||labels.en;
    const text=(changed?lang[after.confirmed?1:2]:lang[0])+': '+row.title;
    s.notifications.unshift({id:randomUUID(),owner:e.owner,actor:null,text,at:Date.now(),read:false});
  }
}
const active=(row)=>row.status==='published'&&row.start<=today()&&row.end>=today();
function itemBody(module,b){
  const base={title:txt(b.title,100),description:txt(b.description,2000),language:b.language};
  need(['ar','en','sv'].includes(base.language),'Invalid language');
  if(module==='library'){
    need(['book','guide'].includes(b.category)&&b.rights===true,'Rights confirmation required');
    return {...base,category:b.category,author:txt(b.author,100),rightsNote:txt(b.rightsNote,200),content:txt(b.content,12000)};
  }
  const start=date(b.start),end=date(b.end);need(start<=end,'Invalid date range');
  if(module==='events'){
    const minimum=num(b.minimum,1,500),capacity=num(b.capacity,minimum,500);
    need(typeof b.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(b.time),'Invalid UTC start time');
    return {...base,start,end,time:b.time,location:txt(b.location,160),minimum,capacity};
  }
  need(['ramadan','startfit'].includes(b.category),'Invalid campaign');
  return {...base,start,end,category:b.category};
}
function publicItem(s,id,row){
  const e=participants(s,row),own=e.find(x=>x.owner===id),m=manage(s,id,row);
  const {createdBy,...fields}=row;
  const event=row.module==='events', seats=event?confirmed(s,row):e;
  return {...fields,manage:m,count:seats.length,waitCount:event?e.length-seats.length:0,waiting:!!own&&event&&!seats.includes(own),joined:!!own,checkins:own?.checkins||[],eventStatus:event?eventStatus(s,row):undefined,
    ...(m&&row.module!=='library'?{roster:e.map(x=>({id:x.owner,name:profile(s,x.owner)?.name,checkins:x.checkins.length,attended:!!x.attended,waiting:event&&!seats.includes(x)}))}:{})};
}
const ownRehab=(s,id)=>read(s).rehab.filter(r=>r.owner===id);
const rehabRecord=({owner,shareLink,...r})=>({...r,shareLink:shareLink||null});
export function programsView(s,id){
  if(!s.identity)return undefined;
  const d=read(s),ctx=activeContext(s,id),isAdmin=admin(s,id),p=personal(s,id);
  return {flags:Object.fromEntries(programModules.map(k=>[k,enabled(s,k)])),canAdmin:isAdmin,canClubEvents:!!ctx?.clubId&&can(s,id,'club.manage',ctx.clubId),
    items:d.items.filter(r=>(enabled(s,r.module)||isAdmin)&&scope(s,id,r)&&(r.status==='published'||manage(s,id,r))).map(r=>publicItem(s,id,r)),
    ...(p&&enabled(s,'rehab')?{rehab:{enabled:!!s.wellness?.enabled.includes(id),records:ownRehab(s,id).map(rehabRecord),
      choices:links(s).filter(l=>l.member===id&&activeLink(s,l)).map(l=>({id:l.id,name:profile(s,l.coach)?.name})),
      shared:ctx.role==='coach'?d.rehab.filter(r=>links(s).some(l=>l.id===r.shareLink&&l.coach===id&&l.member===r.owner&&activeLink(s,l))).map(r=>({...rehabRecord(r),memberName:profile(s,r.owner)?.name})):[]}}:{}),
    ...(isAdmin?{audit:d.audit,summary:{clubs:s.identity.clubs.length,accounts:s.profiles.length,events:d.items.filter(r=>r.module==='events').length,campaigns:d.items.filter(r=>r.module==='campaigns').length,library:d.items.filter(r=>r.module==='library').length}}:{})};
}
export function programsAction(s,id,b){
  const d=store(s),module=b.module,op=b.operation;
  if(op==='flag'){
    need(admin(s,id),'Platform administrator required',403);need(programModules.includes(module)&&typeof b.enabled==='boolean','Invalid flag');
    d.flags[module]=b.enabled;audit(s,id,op,module,module);return;
  }
  need(programModules.includes(module),'Invalid module');need(enabled(s,module)||admin(s,id),'Module disabled',403);
  if(module==='rehab'){
    need(personal(s,id)&&s.wellness?.enabled.includes(id)&&enabled(s,module),'Enable personal test records first',403);
    if(op==='create'){
      need(ownRehab(s,id).length<100,'Record limit',429);
      d.rehab.push({id:randomUUID(),owner:id,title:txt(b.title,100),note:txt(b.note,1000),plan:txt(b.plan,1000,true),date:date(b.date),progress:num(b.progress,0,100),shareLink:null});return;
    }
    const r=ownRehab(s,id).find(x=>x.id===b.id);need(r,'Record not found',404);
    if(op==='delete'){d.rehab=d.rehab.filter(x=>x.id!==r.id);return}
    if(op==='update'){Object.assign(r,{title:txt(b.title,100),note:txt(b.note,1000),plan:txt(b.plan,1000,true),date:date(b.date),progress:num(b.progress,0,100),shareLink:null});return}
    if(op==='share'){need(b.linkId===null||links(s).some(l=>l.id===b.linkId&&l.member===id&&activeLink(s,l)),'Accepted coaching relationship required',403);r.shareLink=b.linkId;return}
    fail('Unknown rehab operation');
  }
  if(op==='create'){
    const clubId=b.scope==='club'?activeContext(s,id)?.clubId:null;
    need(b.scope!=='club'||module==='events'&&clubId,'Club event required',403);
    need(manage(s,id,{clubId}),'Management permission required',403);
    need(d.items.length<1000,'Content limit',429);
    const r={id:randomUUID(),module,clubId:clubId||null,createdBy:id,status:'draft',...itemBody(module,b)};
    d.items.push(r);audit(s,id,op,r.id,module);return;
  }
  const r=d.items.find(x=>x.id===b.id&&x.module===module&&scope(s,id,x));need(r,'Content not found',404);
  const before=module==='events'?eventState(s,r):null;
  if(['update','publish','archive','draft','attendance'].includes(op)){
    need(manage(s,id,r),'Management permission required',403);
    if(op==='update'){
      const body=itemBody(module,b);need(module!=='events'||body.capacity>=confirmed(s,r).length,'Capacity below enrollment');
      Object.assign(r,body,{status:'draft'});
    }else if(op==='attendance'){
      need(module==='events'&&typeof b.attended==='boolean'&&eventStatus(s,r)==='confirmed'&&today()>=r.start,'Confirmed event required');
      const e=confirmed(s,r).find(e=>e.owner===b.target);need(e,'Participant not found',404);e.attended=b.attended;
    }else r.status={publish:'published',archive:'archived',draft:'draft'}[op];
    audit(s,id,op,r.id,module);eventChanges(s,r,before);return;
  }
  need(enabled(s,module)&&r.status==='published'&&module!=='library'&&eligible(s,id,r.clubId),'Enrollment unavailable',403);
  const context=activeContext(s,id);
  need(personal(s,id)||!!context?.clubId&&can(s,id,'club.read',context.clubId),'Use participant context',403);
  const e=d.entries.find(x=>x.itemId===r.id&&x.owner===id);
  if(op==='leave'){d.entries=d.entries.filter(x=>x!==e);eventChanges(s,r,before);return}
  if(op==='join'){
    need(today()<=r.end,'Registration closed',409);need(!e,'Already enrolled',409);
    need(participants(s,r).length<(module==='events'?r.capacity+500:1000),'Enrollment limit',429);
    d.entries.push({itemId:r.id,owner:id,checkins:[],attended:false});eventChanges(s,r,before);return;
  }
  if(op==='checkin'){need(module==='campaigns'&&e&&active(r),'Active campaign enrollment required',403);need(!e.checkins.includes(today()),'Already checked in',409);e.checkins.push(today());return}
  fail('Unknown operation');
}
export function clearRehab(s,id){if(s.programs)s.programs.rehab=s.programs.rehab.filter(r=>r.owner!==id)}
export function revokeProgramGrant(s,clubId,id){
  if(!s.programs||eligible(s,id,clubId))return;
  const ids=new Set(s.programs.items.filter(r=>r.clubId===clubId).map(r=>r.id));
  s.programs.entries=s.programs.entries.filter(e=>e.owner!==id||!ids.has(e.itemId));
}
export function programsExport(s,id){if(!s.programs)return undefined;const d=read(s);return {entries:d.entries.filter(e=>e.owner===id),rehab:ownRehab(s,id).map(rehabRecord)}}
export function removePrograms(s,id){
  if(!s.programs)return;clearRehab(s,id);
  const d=s.programs,removed=new Set(d.items.filter(r=>r.clubId&&!s.identity.clubs.some(c=>c.id===r.clubId)).map(r=>r.id));
  d.items=d.items.filter(r=>!removed.has(r.id));for(const r of d.items)if(r.createdBy===id)r.createdBy=null;
  d.entries=d.entries.filter(e=>e.owner!==id&&!removed.has(e.itemId));for(const a of d.audit)if(a.actor===id)a.actor=null;
}
