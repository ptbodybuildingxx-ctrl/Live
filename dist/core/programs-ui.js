import {rehabPage} from './rehab-ui.js';
import {libraryPage} from './library-ui.js';
import {campaignPage} from './campaign-ui.js';
import {eventsPage} from './events-ui.js';
const filters=new Map();
export function programFilter(userId,data){if(['events','campaigns','ramadan','startfit','library','rehab'].includes(data.module))filters.set(userId+':'+data.module,{language:data.language,category:data.category,region:data.region,contentType:data.contentType,topic:data.topic,format:data.format,view:data.view,sort:data.sort,query:String(data.query||'').slice(0,100)})}
const button=(t,h,btn,module,op,id,label,extras='')=>btn(t(label),'programAction',`data-module="${module}" data-op="${op}" data-id="${h(id||'')}" ${extras}`,'secondary');
const noItems=t=>`<p class="empty">${t('noItems')}</p>`;
export function programPage({state,id,t,h,btn}){
  const p=state.programs;if(!p)return '';
  if(id==='masterAdmin'){
    if(!p.canAdmin)return '';
    const refs=['events','campaigns','library','rehab'];
    return `<section class="card stack"><h1>${t(id)}</h1><p>${t('programAdminNotice')}</p><div class="grid">${Object.entries(p.summary).map(([k,v])=>`<div class="stat-box"><b>${v}</b><br>${t(k==='accounts'?'users':k)}</div>`).join('')}</div>${refs.map(m=>`<div class="row rule wrap"><b class="grow">${t(m)}</b>${button(t,h,btn,m,'flag','',p.flags[m]?'programDisable':'programEnable',`data-enabled="${!p.flags[m]}"`)}${btn(t(m),'nav',`data-id="${m}"`,'chip')}</div>`).join('')}${btn(t('identity'),'nav','data-id="identity"','secondary')}${state.me.role==='admin'?btn(t('admin'),'nav','data-id="admin"','secondary'):''}<h2>${t('audit')}</h2>${p.audit.map(a=>`<div class="rule"><b>${h(a.operation)}</b> · ${t(a.module)} · ${h(new Date(a.at).toLocaleString())}</div>`).join('')||noItems(t)}</section>`;
  }
  if(!p.flags[['ramadan','startfit'].includes(id)?'campaigns':id]&&!p.canAdmin)return `<div class="notice">${t('programDisabled')}</div>`;
  if(['campaigns','ramadan','startfit'].includes(id))return campaignPage({state,id,t,h,btn,filter:filters.get(state.me.id+':'+id)||{}});
  if(id==='rehab')return rehabPage({state,t,h,btn,filter:filters.get(state.me.id+':rehab')||{}});
  if(id==='library')return libraryPage({state,t,h,btn,filter:filters.get(state.me.id+':library')||{}});
  if(id==='events')return eventsPage({state,t,h,btn,filter:filters.get(state.me.id+':events')||{}});
  return '';
}
export function programPayload(data){const p={...data};for(const k of ['minimum','capacity','progress'])if(Object.hasOwn(p,k))p[k]=Number(p[k]);if(Object.hasOwn(p,'waitlistEnabled'))p.waitlistEnabled=p.waitlistEnabled==='true';if(Object.hasOwn(p,'campaignCapacity'))p.campaignCapacity=p.campaignCapacity===''?null:Number(p.campaignCapacity);if(Object.hasOwn(p,'campaignTasks'))p.campaignTasks=String(p.campaignTasks).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);if(Object.hasOwn(p,'discomfort'))p.discomfort=p.discomfort===''?null:Number(p.discomfort);if(Object.hasOwn(p,'rights'))p.rights=p.rights==='on';if(Object.hasOwn(p,'confirm'))p.confirm=p.confirm==='on';if(p.linkId==='none')p.linkId=null;return p;}
