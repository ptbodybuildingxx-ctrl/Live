// Only render the scope returned by the authenticated server; never calculate club data from the global feed.
const preferenceKey=state=>`ml-dashboard-compact:${state.me.id}:${state.dashboard.contextKey}`;
export function dashboardCompact(state,storage){
  try{return !!state.dashboard&&storage.getItem(preferenceKey(state))==='1'}catch{return false}
}
export function setDashboardCompact(state,storage,value){
  if(!state.dashboard)return;
  try{storage.setItem(preferenceKey(state),value?'1':'0')}catch{}
}
export function dashboardPage({state,production,t,h,btn,compact=false}){
  const d=state.dashboard;
  if(production||!d||d.contextKey!==state.identity?.active?.key)return '';
  const context=d.club?.name||t(['moderator','admin','superAdmin'].includes(d.role)?'identityPlatform':'identityPersonal');
  return `<section class="card stack smart-dashboard" aria-labelledby="dashboard-title"><div class="row space wrap"><div class="grow"><span class="eyebrow">MUSCLIVO LIVE / SMART</span><h2 id="dashboard-title">${t('smartDashboard')}</h2><p>${h(context)} · ${t('identity_'+d.role)}</p></div>${btn(t('identitySwitchLabel'),'nav','data-id="identity"','secondary','shield')}</div><p class="muted">${t('dashboardIntro')}</p>${!compact&&d.metrics.length?`<div class="dashboard-metrics">${d.metrics.map(m=>`<div class="stat-box"><div class="stat green">${h(m.value)}</div><small>${t(m.key)}</small></div>`).join('')}</div>`:''}<div class="dashboard-actions">${d.actions.map(a=>`<button class="secondary dashboard-action" data-action="nav" data-id="${h(a.target)}"><span>${t(a.key)}</span>${a.planned?`<span class="badge gold">${t('planned')}</span>`:''}</button>`).join('')}</div>${btn(t('settings'),'nav','data-id="settings"','chip','settings')}</section>`;
}
export function dashboardSettings({state,production,t,compact}){
  if(production||!state.dashboard||state.dashboard.contextKey!==state.identity?.active?.key)return '';
  return `<section class="card stack"><h2>${t('smartDashboard')}</h2><p class="muted">${t('dashboardSettingsHint')}</p>${state.dashboard.metricsEnabled?`<label class="check-row"><input id="dashboard-compact" type="checkbox" ${compact?'checked':''}>${t('dashboardCompact')}</label>`:`<p class="notice">${t('dashboardMetricsDisabled')}</p>`}</section>`;
}
