import {can,activeContext} from './identity.mjs';

const fail=(message,status=403)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)fail(message,status)};
const profile=(s,id)=>s.profiles.find(p=>p.id===id);
const protectedAccount=(s,p)=>p.role==='admin'||s.identity.grants.some(g=>g.userId===p.id&&!g.clubId&&['admin','superAdmin','moderator'].includes(g.role));
const contentCounts=rows=>({total:rows.length,published:rows.filter(r=>r.status==='published').length,draft:rows.filter(r=>r.status==='draft'||r.status==='review').length,archived:rows.filter(r=>r.status==='archived').length});

// Explicit platform projection. Never read personal records, club ledgers or conversations.
export function masterAdminView(s,id,{programs,training,nutrition}={}){
  if(!s.identity||!can(s,id,'platform.admin'))return undefined;
  const now=Date.now(),i=s.identity,publicRows=(s.programs?.items||[]).filter(r=>!r.clubId),names=new Map(s.profiles.map(p=>[p.id,p.name]));
  const accounts=s.profiles.map(p=>({id:p.id,name:p.name,role:p.role,verified:!!p.verified,suspended:!!p.suspended,active30:Number(p.lastActive)>now-30*86400000&&!p.suspended,protected:protectedAccount(s,p)}));
  const verifications=s.verifications.filter(v=>v.state==='pending'&&profile(s,v.owner)).map(v=>({id:v.id,name:names.get(v.owner),role:profile(s,v.owner).role,text:v.text,at:v.at}));
  const counts=Object.fromEntries(['events','campaigns','library'].map(m=>[m,contentCounts(publicRows.filter(r=>r.module===m))]));
  counts.rehab=contentCounts(s.programs?.rehabContent||[]);
  const catalog=training?.canAdmin?training.catalog||[]:[];
  const foods=nutrition?.canAdmin?nutrition.foods||[]:[];
  const roles=Object.fromEntries(['athlete','coach','gym','admin'].map(role=>[role,accounts.filter(p=>p.role===role).length]));
  const platformTargets=new Set([...publicRows.map(r=>r.id),...(s.programs?.rehabContent||[]).map(r=>r.id),...['events','campaigns','library','rehab']]);
  const audit=[...(s.audit||[]).map(a=>({...a,source:'accounts'})),...(i.audit||[]).filter(a=>!a.clubId).map(a=>({...a,source:'identity'})),...(s.programs?.audit||[]).filter(a=>platformTargets.has(a.target)).map(a=>({...a,source:a.module})),...(s.training?.audit||[]).map(a=>({...a,source:'trainingPro'})),...(s.nutrition?.audit||[]).map(a=>({...a,source:'nutrition'}))].sort((a,b)=>b.at-a.at).slice(0,200).map(a=>({source:a.source,operation:a.operation,actor:names.get(a.actor)||null,at:a.at}));
  return {contextKey:activeContext(s,id).key,accounts,verifications,roles,counts,flags:programs?.flags||{},audit,
    summary:{accounts:accounts.length,active30:accounts.filter(x=>x.active30).length,suspended:accounts.filter(x=>x.suspended).length,clubs:i.clubs.length,pendingReports:s.reports.filter(r=>r.state==='pending').length,pendingVerification:verifications.length,exercises:catalog.filter(r=>!r.archived).length,foods:foods.filter(r=>!r.private&&r.status!=='archived').length},
    canAssign:can(s,id,'platform.assign'),platformModeratorCount:i.grants.filter(g=>!g.clubId&&g.role==='moderator').length};
}

export function masterAdminAction(s,id,b){
  need(s.identity,'Local master administration unavailable',404);need(can(s,id,'platform.admin'),'Active platform administrator required');
  if(b.operation==='accountStatus'){
    const p=profile(s,b.id);need(p,'Account not found',404);need(p.id!==id&&!protectedAccount(s,p),'Protected platform account');need(typeof b.enabled==='boolean','Invalid account status',400);
    if(!!p.suspended===b.enabled)return;
    p.suspended=b.enabled;
    s.audit.unshift({at:Date.now(),actor:id,operation:b.enabled?'suspend':'restore',target:p.id});
  }else if(b.operation==='verify'){
    need(typeof b.accept==='boolean','Invalid verification decision',400);
    const v=s.verifications.find(v=>v.id===b.id&&v.state==='pending');need(v,'Verification request unavailable',404);
    const p=profile(s,v.owner);need(p&&!p.suspended&&['coach','gym'].includes(p.role),'Verification account unavailable',409);
    v.state=b.accept?'approved':'rejected';p.verified=b.accept;
    s.audit.unshift({at:Date.now(),actor:id,operation:b.accept?'verifyApproved':'verifyRejected',target:v.id});
  }else fail('Unknown master administration operation',400);
  s.audit.splice(1000);
}
