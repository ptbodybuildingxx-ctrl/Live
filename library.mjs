import {randomUUID} from 'node:crypto';
import {can} from './identity.mjs';
import {libraryTopics,libraryFormats,libraryCategories,libraryLanguages} from './dist/core/library-schema.js';

const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const need=(ok,message,status)=>{if(!ok)fail(message,status)};
const text=(v,max,optional=false)=>{need(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length>0),'Invalid library text');return v.trim()};
const choose=(v,values)=>{need(values.includes(v),'Invalid library selection');return v};
const admin=(s,id)=>can(s,id,'platform.admin',null);
const personal=(s,id)=>can(s,id,'personal.read',null);
const active=(s)=>s.programs?.flags.library!==false;
const format=r=>r.format||'text';
const prefs=(d,id)=>(d.libraryPrefs||[]).filter(x=>x.owner===id);
const expose=({owner,...r})=>r;
export function libraryFields(r){return {topic:r.topic||'other',format:format(r),updatedAt:r.updatedAt||0,pdf:r.pdf||null}}
export function libraryReaderView(s,id,d){const allowed=personal(s,id)&&active(s),live=new Set(d.items.filter(x=>x.module==='library'&&x.status==='published').map(x=>x.id));return {canSave:allowed,preferences:allowed?prefs(d,id).filter(x=>live.has(x.itemId)).map(expose):[]}}
export function libraryExport(d,id){return prefs(d,id).map(expose)}
export function removeLibraryReader(d,id){if(d)d.libraryPrefs=(d.libraryPrefs||[]).filter(x=>x.owner!==id)}
function body(b){
  need(b.rights===true,'Rights confirmation required');
  return {title:text(b.title,100),description:text(b.description,2000),language:choose(b.language,libraryLanguages),category:choose(b.category,libraryCategories),author:text(b.author,100),rightsNote:text(b.rightsNote,200),content:text(b.content??'',12000,true),topic:choose(b.topic??'other',libraryTopics),format:choose(b.format??'text',libraryFormats)};
}
export function libraryFileRow(s,id,itemId,write=false){
  const row=s.programs?.items.find(x=>x.id===itemId&&x.module==='library');need(row,'Book not found',404);
  if(write)need(admin(s,id),'Platform administrator required',403);
  else need(admin(s,id)||(active(s)&&row.status==='published'&&format(row)!=='text'),'Book not found',404);
  return row;
}
export function libraryAttachFile(s,id,itemId,pdf){const row=libraryFileRow(s,id,itemId,true);if(pdf)need(format(row)!=='text','Select PDF or both formats first',409);row.pdf=pdf;row.status='draft';row.updatedAt=Date.now();return row}
export function libraryFileAudit(s,id,op,itemId){const a=s.programs.audit;a.unshift({id:randomUUID(),actor:id,operation:op,target:itemId,module:'library',at:Date.now()});a.splice(1000)}
export function libraryAction(s,id,d,b,audit){
  const op=b.operation;
  if(op==='create'){
    need(admin(s,id)&&(!b.scope||b.scope==='public'),'Platform administrator required',403);need(d.items.length<1000,'Content limit',429);
    const row={id:randomUUID(),module:'library',clubId:null,createdBy:id,status:'draft',...body(b),pdf:null,createdAt:Date.now(),updatedAt:Date.now()};d.items.push(row);audit(op,row.id);return;
  }
  const r=d.items.find(x=>x.module==='library'&&x.id===b.id);need(r,'Book not found',404);
  if(['libraryFavorite','libraryProgress','libraryClear'].includes(op)){
    need(personal(s,id)&&active(s)&&r.status==='published','Personal library unavailable',403);
    d.libraryPrefs??=[];let row=d.libraryPrefs.find(x=>x.owner===id&&x.itemId===r.id);
    if(op==='libraryClear'){d.libraryPrefs=d.libraryPrefs.filter(x=>x!==row);return}
    if(op==='libraryFavorite')need(typeof b.favorite==='boolean','Invalid favorite');
    else need(Number.isInteger(b.progress)&&b.progress>=0&&b.progress<=100,'Invalid reading progress');
    if(!row){need(prefs(d,id).length<1000,'Reading list limit',429);row={owner:id,itemId:r.id,favorite:false,progress:0,updatedAt:Date.now()};d.libraryPrefs.push(row)}
    if(op==='libraryFavorite')row.favorite=b.favorite;else row.progress=b.progress;
    row.updatedAt=Date.now();return;
  }
  need(admin(s,id),'Platform administrator required',403);
  if(op==='update'){const next=body(b);need(next.format!=='text'||!r.pdf,'Remove PDF before changing to text format',409);Object.assign(r,next,{status:'draft',updatedAt:Date.now()})}
  else if(op==='publish'){
    need(active(s),'Library is disabled',403);need(r.status==='draft','Draft required',409);
    need((format(r)==='pdf'||!!r.content?.trim())&&(format(r)==='text'||!!r.pdf),'Complete selected formats first',409);
    r.status='published';r.updatedAt=Date.now();
  }else if(op==='draft'||op==='archive'){r.status=op==='draft'?'draft':'archived';r.updatedAt=Date.now()}
  else fail('Unknown library operation');audit(op,r.id);
}
