import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';

const roleSets={club:['member','coach','clubOwner','clubManager','staff','accountant'],staff:['clubOwner','clubManager','staff'],coach:['clubOwner','clubManager','coach'],finance:['clubOwner','clubManager','accountant']};
const fail=(msg,status=400)=>{throw Object.assign(new Error(msg),{status})};
const require=(ok,msg,status)=>{if(!ok)fail(msg,status)};
const profile=(s,id)=>s.profiles.find(p=>p.id===id);
const available=(s,id)=>{const p=profile(s,id);return p&&!p.suspended&&p.emailVerified!==false};
const blocked=(s,a,b)=>s.blocks.some(x=>(x.from===a&&x.to===b)||(x.from===b&&x.to===a));
const store=s=>s.clubChat??={groups:[],messages:[],invitations:[],audit:[]};
const custom=(s,clubId)=>(s.clubChat?.groups||[]).filter(g=>g.clubId===clubId);
const groups=(s,clubId)=>[...Object.keys(roleSets).map(category=>({id:`room:${clubId}:${category}`,clubId,category,builtin:true,archived:false})),...custom(s,clubId)];
const eligible=(s,clubId,id,category)=>available(s,id)&&s.identity.grants.some(g=>g.clubId===clubId&&g.userId===id&&roleSets[category].includes(g.role));
const assignedManager=(s,clubId,id)=>available(s,id)&&s.identity.grants.some(g=>g.clubId===clubId&&g.userId===id&&['clubOwner','clubManager'].includes(g.role));
const activeEligible=(s,id,g)=>{const c=activeContext(s,id);return c?.clubId===g.clubId&&roleSets[g.category].includes(c.role)&&available(s,id)};
const mayRead=(s,id,g)=>activeEligible(s,id,g)&&(g.builtin||g.members.includes(id));
const find=(s,clubId,groupId)=>{const g=groups(s,clubId).find(g=>g.id===groupId);require(g,'Group not found',404);return g};
const text=(v,max)=>{require(typeof v==='string'&&v.trim().length>0&&v.trim().length<=max,'Invalid chat text');return v.trim()};
const messages=(s,g)=>(s.clubChat?.messages||[]).filter(m=>m.groupId===g.id&&m.clubId===g.clubId);
const meta=g=>({id:g.id,category:g.category,name:g.name||null,builtin:g.builtin===true,archived:g.archived===true});
const audit=(s,clubId,id,operation,target)=>store(s).audit.unshift({id:randomUUID(),clubId,actor:id,operation,target,at:Date.now()});
const contact=(s,id)=>({id,name:profile(s,id)?.name||null});
function reportMessage(s,id,m,type){
  require(m.owner!==id,'Cannot report own message',400);
  require(!s.reports.some(r=>r.by===id&&r.target===m.id&&r.targetType===type&&r.state==='pending'),'Report already pending',409);
}
function createReport(s,id,m,type,reason){reportMessage(s,id,m,type);s.reports.unshift({id:randomUUID(),by:id,target:m.id,targetType:type,reason:text(reason,400),evidence:{senderId:m.owner,text:m.text},state:'pending',at:Date.now()})}
export function reportPrivateMessage(s,id,b){
  const c=s.conversations.find(x=>x.id===b.conversationId&&x.members.includes(id));require(c,'Conversation not found',404);
  const m=c.messages.find(m=>m.id===b.messageId&&!blocked(s,id,m.owner));require(m,'Message not found',404);createReport(s,id,m,'directMessage',b.reason);
}
export function clubChatView(s,id){
  const c=activeContext(s,id),clubId=c?.clubId;if(!clubId||!can(s,id,'club.read',clubId))return undefined;
  const manage=can(s,id,'club.manage',clubId),all=groups(s,clubId),invites=s.clubChat?.invitations||[];
  const visible=all.filter(g=>mayRead(s,id,g)).map(g=>({...meta(g),canRemove:manage,messages:messages(s,g).filter(m=>!m.removedAt&&!blocked(s,id,m.owner)).slice(-100).map(m=>({id:m.id,owner:m.owner,senderName:profile(s,m.owner)?.name||null,text:m.text,at:m.at}))}));
  const incoming=invites.filter(v=>v.clubId===clubId&&v.target===id&&v.status==='pending'&&assignedManager(s,clubId,v.sender)&&!blocked(s,id,v.sender)).flatMap(v=>{const g=all.find(g=>g.id===v.groupId);return g&&!g.archived&&activeEligible(s,id,g)&&eligible(s,clubId,id,g.category)?[{id:v.id,group:meta(g),senderName:profile(s,v.sender)?.name||null}]:[]});
  const management=manage?custom(s,clubId).map(g=>({...meta(g),members:g.members.filter(u=>eligible(s,clubId,u,g.category)).map(u=>contact(s,u)),pending:invites.filter(v=>v.groupId===g.id&&v.status==='pending').map(v=>({...contact(s,v.target),id:v.id,targetId:v.target})),candidates:[...new Set(s.identity.grants.filter(r=>r.clubId===clubId).map(r=>r.userId))].filter(u=>eligible(s,clubId,u,g.category)&&!g.members.includes(u)&&!invites.some(v=>v.groupId===g.id&&v.status==='pending'&&v.target===u)&&!blocked(s,id,u)).map(u=>contact(s,u))})):[];
  return {clubId,manage,groups:visible,incoming,management};
}
export function revokeClubChatGrant(s,clubId,id){
  if(!s.clubChat)return;for(const g of custom(s,clubId))if(!eligible(s,clubId,id,g.category)){g.members=g.members.filter(u=>u!==id);for(const v of s.clubChat.invitations)if(v.groupId===g.id&&v.target===id&&v.status==='pending')v.status='cancelled'}
  if(!assignedManager(s,clubId,id))for(const v of s.clubChat.invitations)if(v.clubId===clubId&&v.sender===id&&v.status==='pending')v.status='cancelled';
}
export function cancelClubChatPairInvites(s,a,b){for(const v of s.clubChat?.invitations||[])if(v.status==='pending'&&((v.sender===a&&v.target===b)||(v.sender===b&&v.target===a)))v.status='cancelled'}
export function removeClubChat(s,id){
  if(!s.clubChat)return;const clubs=new Set(s.identity?.clubs.map(c=>c.id)||[]);
  const removed=new Set(s.clubChat.messages.filter(m=>m.owner===id||!clubs.has(m.clubId)).map(m=>m.id));
  for(const key of Object.keys(s.clubChat))s.clubChat[key]=s.clubChat[key].filter(x=>clubs.has(x.clubId));
  for(const g of s.clubChat.groups)g.members=g.members.filter(u=>u!==id);
  s.clubChat.messages=s.clubChat.messages.filter(m=>m.owner!==id);s.clubChat.invitations=s.clubChat.invitations.filter(v=>v.sender!==id&&v.target!==id);
  for(const a of s.clubChat.audit)if(a.actor===id)a.actor=null;
  s.reports=s.reports.filter(r=>r.targetType!=='clubMessage'||!removed.has(r.target));
}
export function clubChatExport(s,id){if(!s.clubChat)return undefined;return {messages:s.clubChat.messages.filter(m=>m.owner===id),memberships:s.clubChat.groups.filter(g=>g.members.includes(id)).map(g=>({id:g.id,clubId:g.clubId,category:g.category})),invitations:s.clubChat.invitations.filter(v=>v.target===id).map(v=>({id:v.id,clubId:v.clubId,groupId:v.groupId,status:v.status}))}}
export function clubChatAction(s,id,b){
  const c=activeContext(s,id),clubId=c?.clubId;require(clubId&&can(s,id,'club.read',clubId),'Club context required',403);
  require(b.clubId===undefined||b.clubId===clubId,'Wrong club context',403);
  const manage=can(s,id,'club.manage',clubId);
  if(b.operation==='create'){
    require(manage,'Club management required',403);require(Object.hasOwn(roleSets,b.category),'Invalid channel category');
    require(custom(s,clubId).length<30,'Group limit',429);const g={id:randomUUID(),clubId,category:b.category,name:text(b.name,80),members:[id],archived:false};store(s).groups.push(g);audit(s,clubId,id,'create',g.id);return;
  }
  if(b.operation==='response'){
    const v=(s.clubChat?.invitations||[]).find(v=>v.id===b.inviteId&&v.clubId===clubId&&v.target===id&&v.status==='pending');require(v,'Invitation not found',404);const g=find(s,clubId,v.groupId);
    require(!g.archived&&activeEligible(s,id,g)&&eligible(s,clubId,id,g.category)&&assignedManager(s,clubId,v.sender)&&!blocked(s,id,v.sender),'Invitation unavailable',403);require(typeof b.accept==='boolean','Invalid response');
    if(b.accept){require(g.members.length<100,'Group member limit',429);g.members.push(id);v.status='accepted'}else v.status='declined';audit(s,clubId,id,b.accept?'accept':'decline',g.id);return;
  }
  const g=find(s,clubId,b.groupId);
  if(['invite','removeMember','cancelInvite','archive'].includes(b.operation)){
    require(manage&&!g.builtin&&!g.archived,'Group management required',403);
    if(b.operation==='archive'){g.archived=true;for(const v of store(s).invitations)if(v.groupId===g.id&&v.status==='pending')v.status='cancelled'}
    else if(b.operation==='invite'){
      require(eligible(s,clubId,b.target,g.category)&&!blocked(s,id,b.target),'Recipient not eligible',403);
      require(!g.members.includes(b.target)&&!store(s).invitations.some(v=>v.groupId===g.id&&v.target===b.target&&v.status==='pending'),'Already member or invited',409);
      require(store(s).invitations.filter(v=>v.groupId===g.id).length<500,'Group invitation limit',429);store(s).invitations.push({id:randomUUID(),clubId,groupId:g.id,sender:id,target:b.target,status:'pending'});
    }else if(b.operation==='removeMember'){require(g.members.includes(b.target),'Member not found',404);g.members=g.members.filter(u=>u!==b.target)}
    else {const v=store(s).invitations.find(v=>v.id===b.inviteId&&v.groupId===g.id&&v.status==='pending');require(v,'Invitation not found',404);v.status='cancelled'}
    audit(s,clubId,id,b.operation,g.id);return;
  }
  require(mayRead(s,id,g),'Group membership required',403);
  if(b.operation==='leave'){require(!g.builtin,'Built-in channel follows club role',403);g.members=g.members.filter(u=>u!==id);audit(s,clubId,id,'leave',g.id);return}
  if(b.operation==='send'){
    require(!g.archived,'Archived channel',403);require(messages(s,g).length<5000,'Message limit',429);
    store(s).messages.push({id:randomUUID(),clubId,groupId:g.id,owner:id,text:text(b.text,1000),at:Date.now()});return;
  }
  const m=messages(s,g).find(m=>m.id===b.messageId&&!m.removedAt&&!blocked(s,id,m.owner));require(m,'Message not found',404);
  if(b.operation==='report'){createReport(s,id,m,'clubMessage',b.reason);return}
  if(b.operation==='removeMessage'){require(m.owner===id||manage,'Message moderation required',403);m.removedAt=Date.now();m.text='';audit(s,clubId,id,'removeMessage',m.id);return}
  fail('Unknown club chat operation');
}
