import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';
import {seedExercises,equipment,muscles,patterns,levels,secondaryGroups,alternatives} from './dist/core/exercise-catalog.js';
import {exerciseDraft} from './exercise-instructions.mjs';

export const groupTypes=['standard','drop','superset','triset','giant','circuit','restPause','pyramid','cluster','tempo','amrap','custom'];
const FAIL=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)FAIL(message,status)};
const text=(v,max,optional=false)=>{need(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length>0),'Invalid text');return v.trim()};
const number=(v,min,max,integer=false)=>{need(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max&&(!integer||Number.isInteger(v)),'Invalid number');return v};
const choice=(v,list)=>{need(list.includes(v),'Invalid choice');return v};
const date=v=>{need(typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date');return v};
const fresh=()=>({catalog:[],plans:[],sessions:[],settings:{},audit:[]});
const view=s=>s.training||fresh();
const store=s=>s.training??=fresh();
const own=(s,id)=>can(s,id,'personal.read')&&!!s.wellness?.enabled.includes(id);
const admin=(s,id)=>can(s,id,'platform.admin');
const profile=(s,id)=>s.profiles.find(p=>p.id===id&&!p.suspended&&p.emailVerified!==false);
const blocked=(s,a,b)=>s.blocks.some(x=>(x.from===a&&x.to===b)||(x.from===b&&x.to===a));
const links=s=>s.coaching?.links||[];
const activeLink=(s,l)=>l?.status==='active'&&profile(s,l.coach)?.verified===true&&profile(s,l.member)&&!blocked(s,l.coach,l.member);
const coach=(s,id)=>own(s,id)&&activeContext(s,id)?.role==='coach'&&profile(s,id)?.verified===true;
const coachLink=(s,id,l)=>coach(s,id)&&l?.coach===id&&activeLink(s,l);
const planLink=(s,p)=>links(s).find(l=>l.id===p.linkId&&l.member===p.owner&&l.coach===p.author);
const mayEdit=(s,id,p)=>own(s,id)&&(p.owner===id||coachLink(s,id,planLink(s,p)));
const day=()=>new Date().toISOString().slice(0,10);
const seededDrafts=seedExercises.map(exerciseDraft);
const seedIds=new Set(seededDrafts.map(r=>r.id));
const catalog=s=>{const edits=new Map(view(s).catalog.map(r=>[r.id,r]));return [...seededDrafts.map(r=>edits.get(r.id)||r),...view(s).catalog.filter(r=>!seedIds.has(r.id))]};
const publicPlan=({owner,author,...p})=>({...p,assigned:!!p.linkId});
const audit=(s,id,operation,target)=>{const a=store(s).audit;a.unshift({id:randomUUID(),actor:id,operation,target,at:Date.now()});a.splice(1000)};
function localized(value,max,optional=false){need(value&&typeof value==='object'&&!Array.isArray(value),'Translations required');return Object.fromEntries(['ar','en','sv'].map(l=>[l,text(value[l],max,optional)]))}
const blank=()=>({ar:'',en:'',sv:''});
export const mediaSlots=['start','end','video'];
// The optional specialist documentation experiment is no longer used.
// Never expose its private fields if an older local backup contains them.
const contentOf=r=>{const {specialistReview,reviewRevision,reviewCurrent,...content}=r.content||{status:'draft',mistakes:blank(),safety:blank(),assets:{},reviewedAt:null};return content};
function putCatalog(s,row){const d=store(s);d.catalog=d.catalog.filter(r=>r.id!==row.id);d.catalog.push(row)}
export function trainingMediaRow(s,id,exerciseId,slot,write=false){
  if(write)need(admin(s,id),'Catalog administration required',403);
  need(mediaSlots.includes(slot),'Invalid media slot');const row=catalog(s).find(r=>r.id===exerciseId);need(row,'Exercise not found',404);
  const content=contentOf(row);if(!write)need(admin(s,id)||(!row.archived&&content.status==='published'),'Media not found',404);
  return {row,content,asset:content.assets[slot]};
}
export function trainingAttachMedia(s,id,exerciseId,slot,asset){
  const {row,content}=trainingMediaRow(s,id,exerciseId,slot,true);need(row.media?.rights&&row.media?.reference,'Rights and source required');
  putCatalog(s,{...row,content:{...content,status:'draft',reviewedAt:null,assets:{...content.assets,[slot]:asset}}});audit(s,id,'mediaUpload',row.id);
}
function catalogBody(b){
  const muscle=choice(b.muscle,muscles),pattern=choice(b.pattern,patterns);let secondary=secondaryGroups(pattern,muscle);
  if(muscle==='stretch'){need(['staticStretch','dynamicStretch','mobility','warmup','cooldown'].includes(pattern),'Invalid stretch category');need(Array.isArray(b.secondary)&&b.secondary.length>0&&b.secondary.length<=7&&b.secondary.every(m=>muscles.includes(m)&&m!=='stretch'),'Target muscles required');secondary=[...new Set(b.secondary)]}
  return {names:localized(b.names,100),notes:localized(b.notes,1000,true),equipment:choice(b.equipment,equipment),muscle,pattern,level:choice(b.level,levels),secondary,
    // A rights note is metadata only; no external fetches or arbitrary media URLs.
    media:b.media===null||b.media===undefined?null:{rights:text(b.media.rights,200),reference:text(b.media.reference,200)}};
}
function planBody(b){return {title:text(b.title,100),goal:text(b.goal??'',80,true),startDate:date(b.startDate),weeks:number(b.weeks,1,52,true),daysPerWeek:number(b.daysPerWeek,1,7,true),notes:text(b.notes??'',1000,true),unit:choice(b.unit,['kg','lb'])}}
const numbers=(values,min,max,limit)=>{need(Array.isArray(values)&&values.length<=limit,'Invalid list');return values.map(v=>number(v,min,max))};
function exerciseItem(s,b,type,rounds){
  need(b&&typeof b==='object'&&!Array.isArray(b),'Invalid exercise item');
  const ex=catalog(s).find(r=>r.id===b.exerciseId&&!r.archived);need(ex,'Exercise unavailable',404);
  const kg=number(b.kg,0,1000),reps=number(b.reps,1,500,true),rest=number(b.rest,0,3600,true),duration=number(b.duration??0,0,7200,true);
  const side=choice(b.side||'both',['both','each']);
  const tempo=text(b.tempo??'',20,true);
  need(!tempo||/^\d{1,2}-\d{1,2}-\d{1,2}-\d{1,2}$/.test(tempo),'Use four-part tempo');
  const weights=numbers(b.weights??[],0,1000,20);
  if(type==='drop')need(weights.length>=1&&weights.every((v,i)=>v<(i?weights[i-1]:kg)),'Drop loads must descend');
  else if(type==='pyramid')need(weights.length===rounds,'One load per round required');
  else need(!weights.length,'Load sequence not used by this method');
  const segments=['restPause','cluster'].includes(type)?number(b.segments??2,2,10,true):1;
  const segmentRest=['restPause','cluster'].includes(type)?number(b.segmentRest??15,1,300,true):0;
  return {exerciseId:ex.id,kg,reps,rest,duration,side,tempo,weights,segments,segmentRest,rpe:b.rpe==null?null:number(b.rpe,1,10),rir:b.rir==null?null:number(b.rir,0,10)};
}
function blockBody(s,p,b){
  const type=choice(b.method,groupTypes),rounds=number(b.rounds,1,20,true),weekFrom=number(b.weekFrom,1,p.weeks,true),weekTo=number(b.weekTo,weekFrom,p.weeks,true);
  need(Array.isArray(b.items),'Exercises required');
  const [min,max]=({standard:[1,1],drop:[1,1],superset:[2,2],triset:[3,3],giant:[4,8],circuit:[2,8],restPause:[1,1],pyramid:[1,1],cluster:[1,1],tempo:[1,1],amrap:[1,8],custom:[1,8]})[type];
  need(b.items.length>=min&&b.items.length<=max,'Wrong exercise count for method');
  const items=b.items.map(x=>exerciseItem(s,x,type,rounds));
  if(type==='tempo')need(items.every(x=>x.tempo),'Tempo required');
  return {method:type,name:text(b.name??'',80,type!=='custom'),phase:choice(b.phase,['base','strength','hypertrophy','endurance','deload','custom']),day:number(b.day,1,7,true),weekFrom,weekTo,rounds,items,rest:number(b.rest,0,3600,true),warmup:b.warmup===true};
}
function workoutSteps(s,p,week,trainingDay){
  const rows=p.blocks.filter(b=>b.day===trainingDay&&b.weekFrom<=week&&b.weekTo>=week),available=catalog(s);
  const steps=[];
  for(const b of rows)for(let round=1;round<=b.rounds;round++)for(const [itemIndex,item] of b.items.entries()){
    const ex=available.find(r=>r.id===item.exerciseId);need(ex&&!ex.archived,'Program contains unavailable exercise',409);
    const loads=b.method==='drop'?[item.kg,...item.weights]:b.method==='pyramid'?[item.weights[round-1]]:Array(item.segments).fill(item.kg);
    for(const [stage,kg] of loads.entries())for(const side of item.side==='each'?['left','right']:['both']){
      const inter=stage<loads.length-1&&side!=='left';
      steps.push({blockId:b.id,itemIndex,method:b.method,exerciseId:ex.id,names:ex.names,muscle:ex.muscle,secondary:ex.secondary,pattern:ex.pattern,equipment:ex.equipment,round,stage:stage+1,side,kg,reps:item.reps,duration:item.duration,rpe:item.rpe,rir:item.rir,tempo:item.tempo,warmup:b.warmup,rest:side==='left'?0:inter?item.segmentRest:itemIndex===b.items.length-1?b.rest:item.rest});
    }
  }
  need(steps.length>0&&steps.length<=300,'Workout must contain 1–300 logged steps');return steps;
}
const completed=s=>s.status==='finished';
function stats(s,id){
  const sessions=view(s).sessions.filter(x=>x.owner===id&&completed(x)).sort((a,b)=>b.endedAt-a.endedAt),exercises={},muscleVolume={};
  let sets=0,volume=0;
  for(const session of sessions)for(const log of session.logs){
    const step=session.steps[log.index];if(log.skipped||step.warmup)continue;
    const v=Math.round(log.kg*log.reps*100)/100;
    const x=exercises[step.exerciseId]??={id:step.exerciseId,names:step.names,maxKg:0,maxReps:0,volume:0,sets:0,recent:[],recentSessions:[]};
    x.maxKg=Math.max(x.maxKg,log.kg);x.maxReps=Math.max(x.maxReps,log.reps);x.volume+=v;x.sets++;if(x.recent.length<8)x.recent.push({sessionId:session.id,at:session.endedAt,kg:log.kg,reps:log.reps,rir:log.rir});
    const last={sessionId:session.id,at:session.endedAt,kg:log.kg,reps:log.reps,rir:log.rir};
    const recentIndex=x.recentSessions.findIndex(r=>r.sessionId===session.id);
    if(recentIndex>=0)x.recentSessions[recentIndex]=last;else if(x.recentSessions.length<3)x.recentSessions.push(last);
    muscleVolume[step.muscle]=(muscleVolume[step.muscle]||0)+v;sets++;volume+=v;
  }
  const countBy=key=>sessions.reduce((a,r)=>{const k=key(new Date(r.endedAt));a[k]=(a[k]||0)+1;return a},{});
  const weekly=countBy(d=>{d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10)});
  const monthly=countBy(d=>d.toISOString().slice(0,7));
  const adherence=view(s).plans.filter(p=>p.owner===id&&!p.archived).map(p=>{
    const scheduled=new Set(p.blocks.flatMap(b=>Array.from({length:b.weekTo-b.weekFrom+1},(_,i)=>(b.weekFrom+i)+':'+b.day)));
    const done=new Set(sessions.filter(r=>r.planId===p.id&&r.logs.every(l=>!l.skipped)).map(r=>r.week+':'+r.day).filter(k=>scheduled.has(k)));
    return {id:p.id,title:p.title,completed:done.size,planned:scheduled.size};
  });
  const summary={sessions:sessions.length,sets,volume:Math.round(volume*100)/100,exercises:Object.values(exercises),muscleVolume,weekly,monthly,adherence};
  return summary;
}
function suggestion(s,id,p,blockId,itemIndex,progress=stats(s,id)){
  const b=p.blocks.find(x=>x.id===blockId),item=b?.items[itemIndex];
  if(!item||b.warmup||b.method!=='standard'||item.kg<=0)return null;
  const x=progress.exercises.find(r=>r.id===item.exerciseId);
  if(!x)return null;
  const unique=x.recentSessions.slice(0,2);
  if(unique.length<2||!unique.every(r=>r.kg>=item.kg&&r.reps>=item.reps&&r.rir!==null&&r.rir>=2))return null;
  return {blockId,itemIndex,kg:Math.min(1000,Math.round(item.kg*1.025*100)/100),exerciseId:item.exerciseId};
}
function ownSessions(s,id){return view(s).sessions.filter(r=>r.owner===id)}
export function trainingView(s,id){
  if(!s.identity)return undefined;
  const d=view(s),enabled=own(s,id),a=admin(s,id),c=coach(s,id);
  const plans=enabled?d.plans.filter(p=>p.owner===id||coachLink(s,id,planLink(s,p))).map(p=>({...publicPlan(p),mine:p.owner===id,ownerName:p.owner!==id?profile(s,p.owner)?.name:null})):[];
  const settings=d.settings[id]||{progression:false};
  const progress=enabled?stats(s,id):null;
  const suggestions=enabled&&settings.progression?d.plans.filter(p=>p.owner===id&&!p.archived).flatMap(p=>p.blocks.flatMap(b=>b.items.flatMap((item,i)=>{const a=suggestion(s,id,p,b.id,i,progress);return a&&a.kg>item.kg?[{planId:p.id,...a}]:[]}))):[];
  return {catalog:catalog(s).filter(r=>a||!r.archived).map(r=>{const content=contentOf(r);return a||content.status==='published'?{...r,content}:{...r,notes:blank(),media:null,content:{status:'draft',assets:{}}}}),canAdmin:a,enabled,canCoach:c,plans,settings:enabled?settings:null,suggestions,
    links:c?links(s).filter(l=>coachLink(s,id,l)&&s.wellness?.enabled.includes(l.member)).map(l=>({id:l.id,name:profile(s,l.member)?.name})):[],
    ...(enabled?{sessions:ownSessions(s,id).map(({owner,...r})=>r),progress}:{}),
    ...(c?{shared:links(s).filter(l=>coachLink(s,id,l)&&l.shareWorkout===true&&s.wellness?.enabled.includes(l.member)).map(l=>{const {adherence,...progress}=stats(s,l.member);return {linkId:l.id,name:profile(s,l.member)?.name,progress}})}:{}),
    ...(a?{audit:d.audit}: {})};
}
export function trainingAction(s,id,b){
  const d=store(s),op=b.operation;
  if(['catalogCreate','catalogUpdate','catalogArchive','catalogRestore','contentSubmit','contentPublish','contentReturn'].includes(op)){
    need(admin(s,id),'Catalog administration required',403);
    const fields=b=>({mistakes:localized(b.mistakes??blank(),1000,true),safety:localized(b.safety??blank(),1000,true)});
    if(op==='catalogCreate'){need(catalog(s).length<2000,'Catalog limit',429);const row={id:randomUUID(),...catalogBody(b),archived:false,content:{...contentOf({}),...fields(b)}};d.catalog.push(row);audit(s,id,op,row.id);return}
    const row=catalog(s).find(r=>r.id===b.id);need(row,'Exercise not found',404);
    const content=contentOf(row);let update;
    if(op==='catalogUpdate')update={...row,...catalogBody(b),content:{...content,...fields(b),origin:'editor',status:'draft',reviewedAt:null}};
    else if(op==='contentSubmit'){need(content.status==='draft'&&!row.archived,'Draft required',409);need(content.origin!=='starterDraft','Review and save the starter instructions before submitting');need(row.media?.rights&&row.media?.reference&&mediaSlots.every(slot=>content.assets[slot])&&['ar','en','sv'].every(l=>row.notes[l]&&content.mistakes[l]&&content.safety[l]),'Complete reviewed content, rights and media required');update={...row,content:{...content,status:'review'}}}
    else if(op==='contentPublish'){need(content.status==='review'&&!row.archived&&b.confirm===true,'Specialist review confirmation required',403);update={...row,content:{...content,status:'published',reviewedAt:Date.now()}}}
    else if(op==='contentReturn'){update={...row,content:{...content,status:'draft',reviewedAt:null}}}
    else update={...row,archived:op==='catalogArchive'};
    putCatalog(s,update);audit(s,id,op,row.id);return;
  }
  need(own(s,id),'Personal test records required',403);
  if(op==='settings'){need(typeof b.progression==='boolean','Invalid choice');d.settings[id]={progression:b.progression};return}
  if(op==='planCreate'){
    need(d.plans.filter(p=>p.owner===id).length<100,'Plan limit',429);
    d.plans.push({id:randomUUID(),owner:id,author:id,linkId:null,...planBody(b),blocks:[],archived:false,revision:1,updatedAt:Date.now(),history:[{revision:1,at:Date.now(),operation:op}]});return;
  }
  if(op==='planCopy'||op==='planAssign'){
    const src=d.plans.find(p=>p.id===b.id&&p.owner===id&&!p.archived);need(src,'Plan not found',404);
    const link=op==='planAssign'?links(s).find(l=>l.id===b.linkId):null;
    if(op==='planAssign')need(coachLink(s,id,link)&&s.wellness?.enabled.includes(link.member),'Accepted coaching relationship required',403);
    const owner=link?.member||id;need(d.plans.filter(p=>p.owner===owner).length<100,'Plan limit',429);
    d.plans.push({...structuredClone(src),id:randomUUID(),owner,author:id,linkId:link?.id||null,title:op==='planCopy'?src.title.slice(0,94)+' copy':src.title,revision:1,updatedAt:Date.now(),history:[{revision:1,at:Date.now(),operation:op}]});return;
  }
  if(['planUpdate','planArchive','planRestore','blockAdd','blockUpdate','blockRemove','blockMove','blockMoveTo','progressApply','start'].includes(op)){
    const p=d.plans.find(r=>r.id===b.id&&mayEdit(s,id,r));need(p,'Plan not found',404);
    const touch=()=>{p.revision++;p.updatedAt=Date.now();p.history=[...(p.history||[]),{revision:p.revision,at:p.updatedAt,operation:op}].slice(-100)};
    if(op==='planArchive'||op==='planRestore'){p.archived=op==='planArchive';touch();return}
    need(!p.archived,'Plan archived',409);
    if(op==='planUpdate'){const next=planBody(b);need(p.blocks.every(x=>x.weekTo<=next.weeks),'Remove incompatible blocks before shortening plan');Object.assign(p,next);touch();return}
    if(op==='blockAdd'){need(p.blocks.length<60,'Block limit',429);p.blocks.push({id:randomUUID(),...blockBody(s,p,b)});touch();return}
    if(op==='start'){
      need(p.owner===id,'Only trainee can start a workout',403);need(!ownSessions(s,id).some(r=>r.status==='active'),'Finish or cancel current workout',409);
      need(ownSessions(s,id).length<150,'Session history limit',429);
      const week=number(b.week,1,p.weeks,true),trainingDay=number(b.day,1,7,true),steps=workoutSteps(s,p,week,trainingDay);
      d.sessions.push({id:randomUUID(),owner:id,planId:p.id,planTitle:p.title,revision:p.revision,week,day:trainingDay,unit:p.unit,steps,logs:[],status:'active',cursor:0,startedAt:Date.now(),endedAt:null,restUntil:null,note:'',rating:null});return;
    }
    const block=p.blocks.find(x=>x.id===b.blockId);need(block,'Block not found',404);
    if(op==='blockUpdate'){Object.assign(block,blockBody(s,p,b));touch();return}
    if(op==='blockRemove'){p.blocks=p.blocks.filter(x=>x!==block);touch();return}
    if(op==='blockMove'){const i=p.blocks.indexOf(block),j=i+choice(b.direction,[-1,1]);need(j>=0&&j<p.blocks.length,'Cannot move block');[p.blocks[i],p.blocks[j]]=[p.blocks[j],p.blocks[i]];touch();return}
    if(op==='blockMoveTo'){const i=p.blocks.indexOf(block),j=p.blocks.findIndex(x=>x.id===b.targetBlockId);need(j>=0,'Target block missing');if(i!==j){p.blocks.splice(i,1);p.blocks.splice(j,0,block);touch()}return}
    if(op==='progressApply'){
      need(p.owner===id&&d.settings[id]?.progression&&b.confirm===true,'Explicit owner confirmation required',403);const i=number(b.itemIndex,0,block.items.length-1,true);
      const a=suggestion(s,id,p,block.id,i);need(a&&a.kg>block.items[i].kg&&a.kg===b.kg,'Suggestion no longer available',409);
      block.items[i].kg=a.kg;touch();return;
    }
  }
  const r=d.sessions.find(x=>x.id===b.sessionId&&x.owner===id);need(r,'Workout not found',404);
  if(op==='sessionDelete'){need(r.status!=='active'&&b.confirm===true,'Finish workout and confirm deletion');d.sessions=d.sessions.filter(x=>x!==r);return}
  need(r.status==='active','Workout not active',409);
  if(op==='cancel'){need(b.confirm===true,'Confirmation required');r.status='cancelled';r.endedAt=Date.now();return}
  if(op==='finish'){
    need(r.cursor===r.steps.length,'Log or skip remaining steps');r.status='finished';r.endedAt=Date.now();r.note=text(b.note??'',500,true);r.rating=b.rating==null?null:number(b.rating,1,5,true);return;
  }
  need(b.index===r.cursor&&r.cursor<r.steps.length,'Workout step changed',409);
  const step=r.steps[r.cursor];
  if(op==='replace'){
    const ex=alternatives(catalog(s),{...step,id:step.exerciseId}).find(x=>x.id===b.exerciseId);need(ex,'Select matching movement alternative');
    for(let i=r.cursor;i<r.steps.length;i++){const row=r.steps[i];if(row.blockId===step.blockId&&row.itemIndex===step.itemIndex){Object.assign(row,{exerciseId:ex.id,names:ex.names,secondary:ex.secondary,equipment:ex.equipment,kg:0})}}return;
  }
  if(op==='skip'||op==='log'){
    const log=op==='skip'?{index:r.cursor,skipped:true,at:Date.now()}:{index:r.cursor,skipped:false,kg:number(b.kg,0,1000),reps:number(b.reps,0,500,true),duration:number(b.duration??0,0,7200,true),rpe:b.rpe==null?null:number(b.rpe,1,10),rir:b.rir==null?null:number(b.rir,0,10),at:Date.now()};
    r.logs.push(log);r.cursor++;r.restUntil=Date.now()+step.rest*1000;return;
  }
  FAIL('Unknown training operation');
}
export function clearTraining(s,id){if(!s.training)return;const d=s.training;d.plans=d.plans.filter(p=>p.owner!==id);d.sessions=d.sessions.filter(r=>r.owner!==id);delete d.settings[id]}
export function removeTraining(s,id){if(!s.training)return;clearTraining(s,id);for(const p of s.training.plans)if(p.author===id){p.author=null;p.linkId=null}for(const a of s.training.audit)if(a.actor===id)a.actor=null;for(const r of s.training.catalog)if(r.content?.specialistReview?.recordedBy===id)r.content.specialistReview.recordedBy=null}
export function trainingExport(s,id){if(!s.training)return undefined;const d=s.training;return {plans:d.plans.filter(p=>p.owner===id).map(publicPlan),sessions:ownSessions(s,id).map(({owner,...r})=>r),settings:d.settings[id]||{progression:false}}}
