import {randomUUID} from 'node:crypto';
import {can} from './identity.mjs';
import {wellnessKinds} from './dist/core/wellness-schema.js';

const fail=(msg,status=400)=>{throw Object.assign(new Error(msg),{status})};
const require=(v,msg,status)=>{if(!v)fail(msg,status)};
const permitted=(s,id)=>can(s,id,'personal.read',null);
const own=(s,id)=>s.wellness?.records.filter(r=>r.owner===id)||[];
const enabled=(s,id)=>s.wellness?.enabled.includes(id)||false;
const publicRecord=({owner,...record})=>record;
const dateOK=v=>typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
const validText=(v,max)=>typeof v==='string'&&v.trim().length>0&&v.trim().length<=max;
const uniqueSleep=(s,id,kind,data,except)=>require(kind!=='sleep'||!own(s,id).some(r=>r.kind==='sleep'&&r.id!==except&&r.data.recordDate===data.recordDate),'One sleep record per date',409);
function validate(kind,input){
  require(Object.hasOwn(wellnessKinds,kind),'Invalid record type');
  const schema=wellnessKinds[kind].fields;
  require(input&&typeof input==='object'&&!Array.isArray(input)&&Object.keys(input).length===schema.length&&schema.every(f=>Object.hasOwn(input,f.key)),'Invalid record fields');
  const data={};
  for(const f of schema){
    const v=input[f.key];let ok=false;
    if(f.type==='date')ok=dateOK(v);
    if(f.type==='text')ok=validText(v,f.max);
    if(f.type==='lines')ok=Array.isArray(v)&&v.length>0&&v.length<=f.limit&&v.every(x=>validText(x,f.max));
    if(f.type==='number')ok=typeof v==='number'&&Number.isFinite(v)&&v>=f.min&&v<=f.max&&Math.abs(v/f.step-Math.round(v/f.step))<1e-8;
    if(f.type==='boolean')ok=typeof v==='boolean';
    if(f.type==='select')ok=f.options.includes(v);
    require(ok,'Invalid record value');
    data[f.key]=f.type==='text'?v.trim():f.type==='lines'?v.map(x=>x.trim()):v;
  }
  return data;
}
export function wellnessView(s,id){
  if(!permitted(s,id))return undefined;
  return {enabled:enabled(s,id),records:own(s,id).map(publicRecord).sort((a,b)=>(b.data.recordDate||'').localeCompare(a.data.recordDate||'')||b.updatedAt-a.updatedAt)};
}
export function wellnessExport(s,id){
  if(!s.wellness)return undefined;
  return {enabled:enabled(s,id),records:own(s,id).map(publicRecord)};
}
export function removeWellness(s,id){
  if(!s.wellness)return;
  s.wellness.enabled=s.wellness.enabled.filter(x=>x!==id);
  s.wellness.records=s.wellness.records.filter(r=>r.owner!==id);
}
export function wellnessAction(s,id,b){
  require(permitted(s,id),'Personal context required',403);
  if(b.operation==='enable'){
    require(b.confirm===true,'Confirmation required');
    s.wellness??={enabled:[],records:[]};
    if(!enabled(s,id))s.wellness.enabled.push(id);
    return;
  }
  require(enabled(s,id),'Enable local records first',403);
  if(b.operation==='clear'){
    require(b.confirm===true,'Confirmation required');removeWellness(s,id);return;
  }
  if(b.operation==='create'){
    const data=validate(b.kind,b.record);
    uniqueSleep(s,id,b.kind,data);
    require(own(s,id).length<1000,'Record limit reached',429);
    s.wellness.records.push({id:randomUUID(),owner:id,kind:b.kind,data,createdAt:Date.now(),updatedAt:Date.now()});return;
  }
  require(['update','delete'].includes(b.operation),'Unknown record operation');
  const i=s.wellness.records.findIndex(r=>r.id===b.id&&r.owner===id);
  require(i>=0,'Record not found',404);
  if(b.operation==='delete'){s.wellness.records.splice(i,1);return}
  const r=s.wellness.records[i];require(r.kind===b.kind,'Invalid record type');
  const data=validate(r.kind,b.record);uniqueSleep(s,id,r.kind,data,r.id);r.data=data;r.updatedAt=Date.now();
}
