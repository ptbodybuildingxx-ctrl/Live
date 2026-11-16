import {randomUUID} from 'node:crypto';
import {activeContext,can} from './identity.mjs';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const require=(ok,message,status)=>{if(!ok)fail(message,status)};
const currencies=['SEK','EUR','USD'];
const periods=['monthly','annual','once'];
const empty=()=>({branches:[],plans:[],memberships:[],ledger:[],invoices:[],audit:[]});
const list=(s,key,clubId)=>(s.clubOps?.[key]||[]).filter(r=>r.clubId===clubId);
const text=(x,max,optional=false)=>{require(typeof x==='string'&&x.trim().length<=max&&(optional||x.trim().length>0),'Invalid text');return x.trim()};
const date=x=>{require(typeof x==='string'&&/^20\d\d-\d\d-\d\d$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x,'Invalid date');return x};
const today=()=>new Date().toISOString().slice(0,10);
const money=b=>{require(currencies.includes(b.currency)&&Number.isSafeInteger(b.amountMinor)&&b.amountMinor>0&&b.amountMinor<=100000000,'Invalid amount or currency');return {currency:b.currency,amountMinor:b.amountMinor}};
const scoped=(s,key,clubId,id)=>{const x=list(s,key,clubId).find(r=>r.id===id);require(x,'Record not found',404);return x};
const p=(s,id)=>s.profiles.find(u=>u.id===id);
const memberIds=(s,clubId)=>new Set(s.identity.grants.filter(g=>g.clubId===clubId&&g.role==='member'&&p(s,g.userId)&&!p(s,g.userId).suspended&&p(s,g.userId).emailVerified!==false).map(g=>g.userId));
const members=(s,clubId)=>[...memberIds(s,clubId)].map(id=>({id,name:p(s,id).name}));
const audit=(s,clubId,actor,domain,operation,target)=>{s.clubOps.audit.unshift({id:randomUUID(),clubId,actor,domain,operation,target,at:Date.now()});};
const limit=(s,key,clubId,n)=>require(list(s,key,clubId).length<n,'Club record limit',429);
const membershipStatus=(m,d=today())=>m.cancelledAt?'cancelled':m.startDate>d?'scheduled':m.endDate<d?'expired':'active';
const membershipView=(s,m)=>({...m,status:membershipStatus(m),memberName:p(s,m.memberId)?.name||null,branchName:list(s,'branches',m.clubId).find(b=>b.id===m.branchId)?.name||null});
const invoiceView=(s,i)=>({...i,memberName:p(s,i.memberId)?.name||null});
const auditView=(s,clubId,domain)=>list(s,'audit',clubId).filter(a=>a.domain===domain).slice(0,100).map(a=>({...a,actorName:p(s,a.actor)?.name||null}));
export function financeTotals(entries){
  const map=new Map();for(const e of entries){if(e.voidAt)continue;const t=map.get(e.currency)||{currency:e.currency,incomeMinor:0,expenseMinor:0,balanceMinor:0};if(e.kind==='income')t.incomeMinor+=e.amountMinor;else t.expenseMinor+=e.amountMinor;t.balanceMinor=t.incomeMinor-t.expenseMinor;map.set(e.currency,t)}return [...map.values()].sort((a,b)=>a.currency.localeCompare(b.currency));
}
export function clubOpsView(s,id){
  const clubId=activeContext(s,id)?.clubId;if(!clubId||!can(s,id,'club.read',clubId))return undefined;
  const has=permission=>can(s,id,permission,clubId),manage=has('club.manage'),role=activeContext(s,id).role;
  const data={clubId,manage,branches:list(s,'branches',clubId),plans:list(s,'plans',clubId),memberships:[],ownInvoices:[]};
  if(manage){data.members=members(s,clubId);data.memberships=list(s,'memberships',clubId).map(m=>membershipView(s,m));data.audit=auditView(s,clubId,'club')}
  else if(role==='member'){data.memberships=list(s,'memberships',clubId).filter(m=>m.memberId===id).map(m=>membershipView(s,m));data.ownInvoices=list(s,'invoices',clubId).filter(i=>i.memberId===id).map(i=>invoiceView(s,i))}
  if(has('club.finance.read')){
    const ledger=list(s,'ledger',clubId),invoices=list(s,'invoices',clubId).map(i=>invoiceView(s,i));
    data.finance={write:has('club.finance.write'),ledger,invoices,billableMembers:has('club.finance.write')?members(s,clubId):[],totals:financeTotals(ledger),audit:auditView(s,clubId,'finance')};
  }
  return data;
}
export function clubOpsExport(s,id){
  if(!s.clubOps)return undefined;
  return {memberships:s.clubOps.memberships.filter(m=>m.memberId===id),invoices:s.clubOps.invoices.filter(i=>i.memberId===id)};
}
export function removeClubOps(s,id){
  if(!s.clubOps)return;const activeClubs=new Set(s.identity?.clubs.map(c=>c.id)||[]);
  for(const key of Object.keys(s.clubOps))s.clubOps[key]=s.clubOps[key].filter(r=>activeClubs.has(r.clubId));
  s.clubOps.memberships=s.clubOps.memberships.filter(m=>m.memberId!==id);
  for(const i of s.clubOps.invoices)if(i.memberId===id)i.memberId=null;
  for(const a of s.clubOps.audit)if(a.actor===id)a.actor=null;
}
export function revokeMembership(s,clubId,memberId,actor){
  for(const m of list(s,'memberships',clubId))if(m.memberId===memberId&&!m.cancelledAt){m.cancelledAt=Date.now();audit(s,clubId,actor,'club','membershipCancel',m.id)}
}
export function clubOpsAction(s,id,b){
  const clubId=activeContext(s,id)?.clubId;require(clubId&&can(s,id,'club.read',clubId),'Club context required',403);
  const financeOps=['ledgerAdd','ledgerVoid','invoiceCreate','invoicePaid','invoiceVoid'];
  const clubOps=['branchCreate','branchUpdate','branchArchive','planCreate','planUpdate','planArchive','membershipCreate','membershipCancel'];
  const domain=financeOps.includes(b.operation)?'finance':clubOps.includes(b.operation)?'club':null;
  require(domain,'Unknown club operation');require(can(s,id,domain==='finance'?'club.finance.write':'club.manage',clubId),'Club permission required',403);
  // Club identifiers from callers never select a tenant. Reject explicit mismatches.
  require(b.clubId===undefined||b.clubId===clubId,'Wrong club context',403);
  s.clubOps??=empty();let target;
  if(b.operation==='branchCreate'||b.operation==='branchUpdate'){
    const fields={name:text(b.name,80),city:text(b.city,80),address:text(b.address??'',160,true)};
    if(b.operation==='branchCreate'){limit(s,'branches',clubId,100);target=randomUUID();s.clubOps.branches.push({id:target,clubId,...fields,archived:false})}
    else {const x=scoped(s,'branches',clubId,b.id);require(!x.archived,'Archived branch',409);target=x.id;Object.assign(x,fields)}
  }else if(b.operation==='branchArchive'){const x=scoped(s,'branches',clubId,b.id);require(!x.archived,'Already archived',409);x.archived=true;target=x.id}
  else if(b.operation==='planCreate'||b.operation==='planUpdate'){
    require(periods.includes(b.period),'Invalid billing period');const fields={name:text(b.name,80),period:b.period,...money(b)};
    if(b.operation==='planCreate'){limit(s,'plans',clubId,100);target=randomUUID();s.clubOps.plans.push({id:target,clubId,...fields,archived:false})}
    else{const x=scoped(s,'plans',clubId,b.id);require(!x.archived,'Archived plan',409);Object.assign(x,fields);target=x.id}
  }else if(b.operation==='planArchive'){const x=scoped(s,'plans',clubId,b.id);require(!x.archived,'Already archived',409);x.archived=true;target=x.id}
  else if(b.operation==='membershipCreate'){
    require(memberIds(s,clubId).has(b.memberId),'Accepted member required',404);const plan=scoped(s,'plans',clubId,b.planId);require(!plan.archived,'Archived plan',409);
    const branch=b.branchId?scoped(s,'branches',clubId,b.branchId):null;require(!branch?.archived,'Archived branch',409);
    const startDate=date(b.startDate),endDate=date(b.endDate);require(startDate<=endDate,'Invalid membership dates');
    require(!list(s,'memberships',clubId).some(m=>m.memberId===b.memberId&&!m.cancelledAt&&m.startDate<=endDate&&m.endDate>=startDate),'Overlapping membership',409);
    limit(s,'memberships',clubId,5000);target=randomUUID();s.clubOps.memberships.push({id:target,clubId,memberId:b.memberId,planId:plan.id,planName:plan.name,period:plan.period,currency:plan.currency,amountMinor:plan.amountMinor,branchId:branch?.id||null,startDate,endDate,cancelledAt:null});
  }else if(b.operation==='membershipCancel'){const m=scoped(s,'memberships',clubId,b.id);require(!m.cancelledAt,'Already cancelled',409);m.cancelledAt=Date.now();target=m.id}
  else if(b.operation==='ledgerAdd'){
    require(['income','expense'].includes(b.kind),'Invalid entry type');limit(s,'ledger',clubId,10000);target=randomUUID();s.clubOps.ledger.push({id:target,clubId,kind:b.kind,date:date(b.date),label:text(b.label,120),...money(b),invoiceId:null,voidAt:null});
  }else if(b.operation==='ledgerVoid'){
    const e=scoped(s,'ledger',clubId,b.id);require(!e.voidAt&&!e.invoiceId,'Void invoice-linked income through its invoice',409);e.voidReason=text(b.reason,160);e.voidAt=Date.now();target=e.id;
  }else if(b.operation==='invoiceCreate'){
    require(memberIds(s,clubId).has(b.memberId),'Accepted member required',404);const issued=date(b.date),dueDate=date(b.dueDate);require(issued<=dueDate,'Invalid invoice dates');limit(s,'invoices',clubId,5000);target=randomUUID();
    s.clubOps.invoices.push({id:target,clubId,number:list(s,'invoices',clubId).length+1,memberId:b.memberId,label:text(b.label,120),date:issued,dueDate,...money(b),status:'issued',paidDate:null,ledgerId:null});
  }else if(b.operation==='invoicePaid'){
    const i=scoped(s,'invoices',clubId,b.id);require(i.status==='issued','Invoice not payable',409);const paidDate=date(b.date);require(paidDate>=i.date,'Invalid recorded payment date');limit(s,'ledger',clubId,10000);
    i.status='paid';i.paidDate=paidDate;i.ledgerId=randomUUID();target=i.id;s.clubOps.ledger.push({id:i.ledgerId,clubId,kind:'income',date:paidDate,label:i.label,currency:i.currency,amountMinor:i.amountMinor,invoiceId:i.id,voidAt:null});
  }else if(b.operation==='invoiceVoid'){
    const i=scoped(s,'invoices',clubId,b.id);require(i.status!=='void','Already void',409);const reason=text(b.reason,160);if(i.ledgerId){const e=scoped(s,'ledger',clubId,i.ledgerId);e.voidAt=Date.now();e.voidReason=reason}i.status='void';i.voidReason=reason;i.voidAt=Date.now();target=i.id;
  }
  audit(s,clubId,id,domain,b.operation,target);
}
