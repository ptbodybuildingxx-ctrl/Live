import {allowedModules,canOpen,filterCoaches,samples} from './modules.js';

// Deliberately temporary examples only. No health/finance data or credentials are stored here.
const checked=new Map();
const selections=new Map();
const sessionKey=(state,id)=>`${state.me.id}:${id}`;
export function toggleSample(state,id,item){
  if(!samples[id]?.includes(item))return;
  const key=sessionKey(state,id), list=checked.get(key)||new Set();
  list.has(item)?list.delete(item):list.add(item);checked.set(key,list);
}
export function toggleCoachLanguage(state,language,currentLanguage){
  if(!['ar','en','sv','all'].includes(language))return;
  const key=sessionKey(state,'coaches'),current=selections.get(key)||[currentLanguage];
  selections.set(key,language==='all'?[]:current.includes(language)?current.filter(x=>x!==language):[...current,language]);
}
export function resetWorkspace(){checked.clear();selections.clear()}
export function workspacePage({state,id,production,t,h,ic,btn,person,lang}){
  const permitted=allowedModules(state.me.role,production);
  if(id==='workspace')return `<div class="stack"><div class="hero workspace-hero"><span class="eyebrow">MUSCLIVO LIVE / CORE</span><h1>${t('workspace')}</h1><p>${t('workspaceIntro')}</p></div><div class="grid workspace-grid">${permitted.map(m=>`<button class="card quick workspace-card" data-action="nav" data-id="${m.id}">${ic(m.icon)}<b>${t(m.id)}</b><span class="badge ${m.stage==='prototype'?'green':'gold'}">${t(m.stage)}</span><small>${t(m.items[0])}</small></button>`).join('')}</div></div>`;
  if(!canOpen(id,state.me.role,production))return '';
  const module=permitted.find(m=>m.id===id);
  const done=checked.get(sessionKey(state,id))||new Set();
  const demo=samples[id]?`<section class="card stack"><h2>${t('sampleChecklist')}</h2><p class="muted">${t('sampleNotice')}</p><div class="progress"><span style="width:${Math.round(done.size/samples[id].length*100)}%"></span></div>${samples[id].map(item=>`<button class="secondary sample-task ${done.has(item)?'sample-done':''}" aria-pressed="${done.has(item)}" data-action="sampleToggle" data-id="${item}">${ic(done.has(item)?'check':'plus')}${t(item)}</button>`).join('')}<small>${done.size} / ${samples[id].length} ${t('done')}</small></section>`:'';
  const selected=selections.get(sessionKey(state,'coaches'))||[lang];
  const coaches=id==='coaches'?`<section class="card stack"><h2>${t('coachDirectory')}</h2><p class="muted">${t('coachLanguageHint')}</p><div class="row wrap">${['all','ar','en','sv'].map(l=>btn(l==='all'?t('all'):t('lang_'+l),'coachLang',`data-id="${l}" aria-pressed="${l==='all'?!selected.length:selected.includes(l)}"`,'chip '+((l==='all'?!selected.length:selected.includes(l))?'active':''))).join('')}</div>${filterCoaches(state.profiles.filter(p=>p.id!==state.me.id),selected).map(p=>person(p,btn(t('chat'),'directChat',`data-id="${h(p.id)}"`,'chip'),`<small>${(p.spokenLanguages||[p.lang]).map(l=>t('lang_'+l)).join(' · ')}</small>`)).join('')||`<div class="empty">${t('noItems')}</div>`}</section>`:'';
  return `<div class="stack"><div class="row wrap">${btn(t('workspace'),'nav','data-id="workspace"','chip')}<span class="badge ${module.stage==='prototype'?'green':'gold'}">${t(module.stage)}</span></div><h1>${t(id)}</h1><div class="notice">${t('moduleNotice')}</div>${demo}${coaches}<section class="card stack"><h2>${t('plannedScope')}</h2>${module.items.map(k=>`<div class="rule row">${ic('check')}<span>${t(k)}</span></div>`).join('')}</section></div>`;
}
