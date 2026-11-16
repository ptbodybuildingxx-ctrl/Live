import {randomUUID} from 'node:crypto';

// Local server authorization. Existing public profile roles are preserved for compatibility.
export const permissions=Object.freeze({
  member:['personal.read'],coach:['personal.read','coach.programs'],
  clubOwner:['club.read','club.roster','club.assign','club.finance.read','club.finance.write','club.manage'],
  clubManager:['club.read','club.roster','club.finance.read','club.manage'],
  staff:['club.read'],accountant:['club.read','club.finance.read','club.finance.write'],
  moderator:['platform.moderate'],admin:['platform.moderate','platform.admin'],
  superAdmin:['platform.moderate','platform.admin','platform.assign']
});
const clubRoles=['member','coach','clubManager','staff','accountant'];
const fail=(message,status=403)=>{throw Object.assign(new Error(message),{status})};
const require=(ok,message='Not allowed',status=403)=>{if(!ok)fail(message,status)};
const getProfile=(s,id)=>s.profiles.find(p=>p.id===id);
const activeProfile=(s,id)=>{const p=getProfile(s,id);return p&&!p.suspended&&p.emailVerified!==false};
const context=(role,clubId=null)=>({key:clubId?`${clubId}:${role}`:`personal:${role}`,role,clubId});
const grant=(i,userId,clubId,role)=>{if(!i.grants.some(g=>g.userId===userId&&g.clubId===clubId&&g.role===role))i.grants.push({id:randomUUID(),userId,clubId,role})};

export function ensureIdentity(s){
  if(s.identity)return s;
  const i=s.identity={version:1,clubs:[],grants:[],invitations:[],active:{},audit:[]};
  // Migration is local only. No privileges are inferred from client input.
  if(getProfile(s,'demo-gym')){
    i.clubs.push({id:'club-iron',name:'Iron Gym',owner:'demo-gym'});grant(i,'demo-gym','club-iron','clubOwner');i.active['demo-gym']='club-iron:clubOwner';
    if(getProfile(s,'demo-coach'))grant(i,'demo-coach','club-iron','coach');
    if(getProfile(s,'demo-athlete'))grant(i,'demo-athlete','club-iron','member');
    if(getProfile(s,'demo-sara')){grant(i,'demo-sara','club-iron','accountant');i.clubs.push({id:'club-north',name:'North Fitness (Demo)',owner:'demo-sara'});grant(i,'demo-sara','club-north','clubOwner')}
  }
  if(getProfile(s,'demo-admin')?.role==='admin')grant(i,'demo-admin',null,'superAdmin');
  return s;
}
export function contexts(s,id){
  const p=getProfile(s,id);if(!s.identity||!activeProfile(s,id))return [];
  const base=p.role==='admin'?[context('admin')]:[context('member'),...(p.role==='coach'?[context('coach')]:[])];
  for(const g of s.identity.grants.filter(g=>g.userId===id)){
    if(!Object.hasOwn(permissions,g.role))continue;
    if(g.clubId&&!s.identity.clubs.some(c=>c.id===g.clubId))continue;
    if(!g.clubId&&!['moderator','superAdmin'].includes(g.role))continue;
    base.push(context(g.role,g.clubId));
  }
  return [...new Map(base.map(c=>[c.key,c])).values()];
}
export function activeContext(s,id){const list=contexts(s,id);return list.find(c=>c.key===s.identity?.active[id])||list[0]||null}
const contextPermissions=c=>c?[...permissions[c.role],...(c.clubId&&['member','coach'].includes(c.role)?['club.read']:[])]:[];
export function can(s,id,permission,clubId=null){const c=activeContext(s,id);return !!c&&c.clubId===clubId&&contextPermissions(c).includes(permission)}
const audit=(i,id,operation,clubId,target)=>{i.audit.unshift({id:randomUUID(),actor:id,operation,clubId,target,at:Date.now()});i.audit=i.audit.slice(0,1000)};
export function identityView(s,id){
  if(!s.identity)return undefined;
  const i=s.identity,c=activeContext(s,id),ctx=contexts(s,id).map(x=>({...x,clubName:i.clubs.find(cl=>cl.id===x.clubId)?.name||null}));
  const club=c?.clubId?i.clubs.find(cl=>cl.id===c.clubId):null;
  const roster=club&&can(s,id,'club.roster',club.id)?i.grants.filter(g=>g.clubId===club.id&&activeProfile(s,g.userId)).map(g=>({id:g.id,userId:g.userId,name:getProfile(s,g.userId).name,role:g.role})):[];
  const invites=i.invitations.filter(v=>v.target===id||(club&&v.clubId===club.id&&can(s,id,'club.assign',club.id))||(!v.clubId&&can(s,id,'platform.assign'))).map(v=>({...v,clubName:i.clubs.find(cl=>cl.id===v.clubId)?.name||null,targetName:getProfile(s,v.target)?.name||null}));
  const reportList=can(s,id,'platform.moderate')?s.reports.filter(r=>r.state==='pending').map(r=>({id:r.id,targetType:r.targetType,reason:r.reason,at:r.at,...(r.evidence?{evidence:{text:r.evidence.text}}:{})})):[];
  const platformAssignments=can(s,id,'platform.assign')?i.grants.filter(g=>!g.clubId&&g.role==='moderator').map(g=>({id:g.id,userId:g.userId,name:getProfile(s,g.userId)?.name||'',role:g.role})):[];
  return {contexts:ctx,active:c,permissions:contextPermissions(c),club:club?{id:club.id,name:club.name}:null,roster,invitations:invites,reportList,platformAssignments};
}
export function identityAction(s,id,b){
  require(s.identity&&activeProfile(s,id));const i=s.identity;
  const c=activeContext(s,id),cl=c?.clubId||null;
  switch(b.operation){
    case 'switch':require(contexts(s,id).some(x=>x.key===b.context),'Role not assigned');i.active[id]=b.context;break;
    case 'createClub':{
      const p=getProfile(s,id);require(p.role==='gym'&&p.verified,'Verified gym required');require(typeof b.name==='string'&&b.name.trim().length>=2&&b.name.trim().length<=80,'Invalid club name',400);
      require(i.clubs.filter(x=>x.owner===id).length<5,'Club limit',429);
      const club={id:randomUUID(),name:b.name.trim(),owner:id};i.clubs.push(club);grant(i,id,club.id,'clubOwner');i.active[id]=context('clubOwner',club.id).key;audit(i,id,'createClub',club.id,club.id);break;
    }
    case 'invite':{
      require((cl&&can(s,id,'club.assign',cl)&&b.clubId===cl&&clubRoles.includes(b.role))||(!cl&&b.clubId===null&&can(s,id,'platform.assign')&&b.role==='moderator'),'Cannot assign this role');
      require(typeof b.target==='string'&&b.target!==id&&activeProfile(s,b.target)&&getProfile(s,b.target).role!=='admin','Invalid recipient',400);
      require(!i.grants.some(g=>g.userId===b.target&&g.clubId===cl&&g.role===b.role),'Already assigned',409);
      require(!i.invitations.some(v=>v.target===b.target&&v.clubId===cl&&v.role===b.role&&v.status==='pending'),'Invitation pending',409);
      require(i.invitations.filter(v=>v.sender===id&&v.status==='pending').length<100,'Invitation limit',429);
      i.invitations.push({id:randomUUID(),sender:id,target:b.target,clubId:cl,role:b.role,status:'pending',at:Date.now()});audit(i,id,'invite',cl,b.target);break;
    }
    case 'respond':{
      const v=i.invitations.find(v=>v.id===b.id&&v.target===id&&v.status==='pending');require(v,'Invitation unavailable',404);
      require(typeof b.accept==='boolean','Invalid response',400);
      // Check issuer's current assignment, not their currently selected context.
      const issuer=contexts(s,v.sender).some(x=>x.clubId===v.clubId&&permissions[x.role]?.includes(v.clubId?'club.assign':'platform.assign'));
      require(issuer,'Invitation expired');v.status=b.accept?'accepted':'declined';if(b.accept)grant(i,id,v.clubId,v.role);audit(i,id,v.status,v.clubId,v.id);break;
    }
    case 'revoke':{
      const g=i.grants.find(g=>g.id===b.id);require(g&&g.role!=='clubOwner'&&g.role!=='superAdmin'&&g.userId!==id,'Cannot revoke assignment');
      require(g.clubId?g.clubId===cl&&can(s,id,'club.assign',cl):!cl&&can(s,id,'platform.assign'),'Cannot revoke outside scope');
      i.grants=i.grants.filter(x=>x.id!==g.id);if(i.active[g.userId]===context(g.role,g.clubId).key)delete i.active[g.userId];i.invitations=i.invitations.filter(v=>!(v.target===g.userId&&v.clubId===g.clubId&&v.role===g.role&&v.status==='pending'));audit(i,id,'revoke',g.clubId,g.id);break;
    }
    case 'resolveReport':{
      require(can(s,id,'platform.moderate'));const report=s.reports.find(r=>r.id===b.id&&r.state==='pending');require(report,'Report unavailable',404);report.state='resolved';audit(i,id,'resolveReport',null,report.id);s.audit.unshift({at:Date.now(),actor:id,operation:'resolve',target:report.id});break;
    }
    default:fail('Unknown identity operation',400);
  }
}
export function identityExport(s,id){if(!s.identity)return undefined;return {grants:s.identity.grants.filter(g=>g.userId===id),invitations:s.identity.invitations.filter(v=>v.target===id||v.sender===id),clubs:s.identity.clubs.filter(c=>c.owner===id)};}
export function removeIdentity(s,id){
  if(!s.identity)return;const i=s.identity,owned=i.clubs.filter(c=>c.owner===id).map(c=>c.id);
  require(!i.grants.some(g=>owned.includes(g.clubId)&&g.userId!==id),'Transfer club ownership before deleting this account',409);
  i.clubs=i.clubs.filter(c=>!owned.includes(c.id));i.grants=i.grants.filter(g=>g.userId!==id&&!owned.includes(g.clubId));i.invitations=i.invitations.filter(v=>v.sender!==id&&v.target!==id&&!owned.includes(v.clubId));delete i.active[id];
}
