import {filterCoaches} from './modules.js';

// The directory uses only the already privacy-filtered profile snapshot.
const filters=new Map();
const defaults={query:'',verifiedOnly:false};
export function updateDirectoryFilter(userId,data){
  filters.set(userId,{query:String(data.query||'').trim().slice(0,100),verifiedOnly:data.verifiedOnly===true});
}
export function resetDirectoryFilters(){filters.clear()}
export function directoryRows(profiles,viewerId,languages,filter=defaults,lang='en'){
  const q=String(filter.query||'').trim().toLocaleLowerCase(lang);
  return filterCoaches(profiles.filter(p=>p.id!==viewerId&&!p.suspended),languages)
    .filter(p=>(!filter.verifiedOnly||p.verified)&&(!q||[p.name,p.city,p.sport,p.bio,p.level].some(value=>String(value||'').toLocaleLowerCase(lang).includes(q))))
    .sort((a,b)=>Number(!!b.verified)-Number(!!a.verified)||a.name.localeCompare(b.name,lang));
}
export function directoryPage({state,t,h,btn,person,lang,selected}){
  const filter=filters.get(state.me.id)||defaults,rows=directoryRows(state.profiles,state.me.id,selected,filter,lang);
  const connected=new Map((state.coaching?.links||[]).map(l=>[l.otherId,l]));
  const cards=rows.map(p=>{
    const languages=(p.spokenLanguages||[p.lang]).filter(l=>['ar','en','sv'].includes(l));
    const link=connected.get(p.id),canInvite=state.coaching?.role==='member'&&p.verified&&!link;
    return `<details class="card stack" data-disclosure-key="coach:${h(p.id)}"><summary><span class="row wrap space"><b>${h(p.name)}</b><span class="badge ${p.verified?'green':'gold'}">${t(p.verified?'verified':'directoryUnverified')}</span></span><small>${h([p.city,p.sport].filter(Boolean).join(' · ')||'—')}</small></summary>${person(p)}<p class="post-text">${h(p.bio||'—')}</p><div class="row wrap"><small>${t('spokenLanguages')}</small>${languages.map(l=>`<span class="badge">${h(t('lang_'+l))}</span>`).join('')}</div>${p.level?`<small>${t('level')}: ${h(p.level)}</small>`:''}<div class="row wrap">${btn(t('chat'),'directChat',`data-id="${h(p.id)}"`,'secondary')}${canInvite?`<form data-form="coachingInvite"><input type="hidden" name="target" value="${h(p.id)}"><button type="submit" class="primary">${t('directoryRequestCoaching')}</button></form>`:link?`<span class="badge ${link.status==='active'?'green':'gold'}">${t(link.status==='active'?'coachingActive':'coachingPending')}</span>`:''}${btn(t('report'),'reportProfile',`data-id="${h(p.id)}"`,'chip')}</div></details>`;
  }).join('');
  return `<section class="card stack"><h2>${t('coachDirectory')}</h2><p class="muted">${t('directoryIntro')}</p><p class="muted">${t('coachLanguageHint')}</p><div class="row wrap">${['all','ar','en','sv'].map(l=>btn(l==='all'?t('all'):t('lang_'+l),'coachLang',`data-id="${l}" aria-pressed="${l==='all'?!selected.length:selected.includes(l)}"`,'chip '+((l==='all'?!selected.length:selected.includes(l))?'active':''))).join('')}</div><form class="stack" data-form="coachDirectoryFilter"><label>${t('directorySearch')}<input type="search" name="query" maxlength="100" value="${h(filter.query)}" placeholder="${h(t('directorySearchHint'))}"></label><label class="check-row"><input type="checkbox" name="verifiedOnly" ${filter.verifiedOnly?'checked':''}>${t('directoryVerifiedOnly')}</label><button class="secondary" type="submit">${t('search')}</button></form><div class="row space"><small>${t('directoryResults')}: <b>${rows.length}</b></small><small>${t('directoryVerificationNote')}</small></div><div class="grid workspace-grid">${cards||`<p class="empty">${t('directoryEmpty')}</p>`}</div></section>`;
}

const features=[['trainingPro','dumbbell','aboutTraining'],['nutrition','zap','aboutNutrition'],['health','check','aboutHealth'],['coaches','profile','aboutCoaches'],['clubs','social','aboutClubs'],['campaigns','flag','aboutCampaigns']];
export function aboutPage({t,h,ic,btn,lang}){
  return `<div class="stack"><section class="hero workspace-hero"><span class="eyebrow">MUSCLIVO LIVE</span><h1>${t('about')}</h1><h2>${t('aboutMission')}</h2><p>${t('aboutIntro')}</p></section><section class="card stack"><h2>${t('aboutIndependence')}</h2><p>${t('aboutVision')}</p><p>${t('aboutFree')}</p></section><section class="card stack"><h2>${t('aboutFeatures')}</h2><div class="grid workspace-grid">${features.map(([id,icon,desc])=>`<details class="workspace-card" data-disclosure-key="about:${id}"><summary><span class="workspace-card-heading"><span class="workspace-card-icon">${ic(icon)}</span><b>${t(id)}</b></span></summary><div class="workspace-card-body stack"><p>${t(desc)}</p>${btn(t('openModule'),'nav',`data-id="${id}"`,'secondary')}</div></details>`).join('')}</div></section><section class="card stack"><h2>${t('aboutTrust')}</h2><p>${t('aboutPrivacy')}</p><p>${t('aboutSafety')}</p><div class="row wrap"><a class="secondary" href="/privacy?lang=${h(lang)}" target="_blank" rel="noopener">${t('privacy')}</a><a class="secondary" href="/terms?lang=${h(lang)}" target="_blank" rel="noopener">${t('terms')}</a></div></section><section class="card stack"><h2>${t('aboutDevelopment')}</h2><p class="notice">${t('aboutLocal')}</p>${btn(t('workspace'),'nav','data-id="workspace"','primary')}</section></div>`;
}
