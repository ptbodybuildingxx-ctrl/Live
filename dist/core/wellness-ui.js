import {wellnessKinds,kindsFor} from './wellness-schema.js';
import {healthPage} from './health-ui.js';
export const todayLocal=(now=new Date())=>`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const recordsFor=(state,kind)=>state.wellness?.records.filter(r=>r.kind===kind)||[];
const fieldValue=(f,v,t,h)=>f.type==='boolean'?t(v?'done':'recordNotDone'):f.type==='select'?t(v):f.type==='lines'?v.map(h).join(' · '):h(v);
export function wellnessPage({state,id,t,h,btn,today=todayLocal()}){
  const w=state.wellness;
  if(!w)return `<section class="card stack"><p>${t('wellnessPersonalOnly')}</p>${btn(t('identitySwitchLabel'),'nav','data-id="identity"','secondary')}</section>`;
  if(!w.enabled)return `<section class="card stack"><h2>${t('wellnessPrivate')}</h2><p>${t('wellnessConsent')}</p>${btn(t('wellnessEnable'),'wellnessEnable','','primary')}</section>`;
  const kinds=kindsFor(id),daily=kind=>recordsFor(state,kind).filter(r=>r.data.recordDate===today);
  if(id==='health'){
    const recordCards=kinds.map(kind=>{const schema=wellnessKinds[kind],records=recordsFor(state,kind);return `<details class="card health-disclosure" data-disclosure-key="health:record:${kind}"><summary><strong>${h(t(schema.label))}</strong> <span class="badge">${records.length}</span></summary><div class="stack health-disclosure-body">${btn(t('wellnessAdd'),'wellnessNew',`data-id="${kind}"`,'primary','plus')}${records.map(r=>`<article class="rule stack"><dl class="wellness-fields">${schema.fields.map(f=>`<div><dt>${h(t(f.key))}</dt><dd>${fieldValue(f,r.data[f.key],t,h)}</dd></div>`).join('')}</dl><div class="row wrap">${btn(t('wellnessEdit'),'wellnessEdit',`data-id="${h(r.id)}"`,'secondary')}${btn(t('remove'),'wellnessDelete',`data-id="${h(r.id)}"`,'secondary')}</div></article>`).join('')||`<p class="empty">${t('noItems')}</p>`}</div></details>`}).join('');
    return healthPage({state,t,h,btn,today,recordCards});
  }
  const sum=(kind,key)=>daily(kind).reduce((a,r)=>a+r.data[key],0);
  const metrics=id==='train'?[['workoutPlans',recordsFor(state,'plan').length],['wellnessTodayWorkouts',daily('workout').length],['wellnessTotalWorkouts',recordsFor(state,'workout').length]]:id==='nutrition'?[['wellnessTodayCalories',sum('meal','recordCalories')],['wellnessTodayWater',sum('water','recordMl')]]:[['wellnessTodayHabits',`${daily('habit').filter(r=>r.data.recordComplete).length}/${daily('habit').length}`],['wellnessTodaySleep',Math.round(sum('sleep','recordHours')*10)/10]];
  return `<div class="stack private-records"><div class="notice">${t('wellnessLocalNotice')}</div><section class="card stack"><div class="row space wrap"><h2>${t('wellnessSummary')}</h2><small>${h(today)}</small></div><div class="dashboard-metrics">${metrics.map(([k,v])=>`<div class="stat-box"><div class="stat green">${h(v)}</div><small>${t(k)}</small></div>`).join('')}</div></section>${kinds.map(kind=>{
    const schema=wellnessKinds[kind],records=recordsFor(state,kind);
    return `<section class="card stack"><div class="row space wrap"><h2>${t(schema.label)}</h2>${btn(t('wellnessAdd'),'wellnessNew',`data-id="${kind}"`,'primary','plus')}</div>${records.map(r=>`<article class="rule stack"><dl class="wellness-fields">${schema.fields.map(f=>`<div><dt>${t(f.key)}</dt><dd>${fieldValue(f,r.data[f.key],t,h)}</dd></div>`).join('')}</dl><div class="row wrap">${btn(t('wellnessEdit'),'wellnessEdit',`data-id="${h(r.id)}"`,'secondary')}${btn(t('remove'),'wellnessDelete',`data-id="${h(r.id)}"`,'secondary')}</div></article>`).join('')||`<p class="empty">${t('noItems')}</p>`}</section>`;
  }).join('')}</div>`;
}
export function wellnessForm(kind,data,t,h){
  return wellnessKinds[kind].fields.map(f=>{
    const v=data?.[f.key]??(f.type==='date'?todayLocal():'');
    if(f.type==='boolean')return `<label class="check-row"><input type="checkbox" name="${f.key}" ${v?'checked':''}>${t(f.key)}</label>`;
    if(f.type==='select')return `<label>${t(f.key)}<select name="${f.key}" required>${f.options.map(o=>`<option value="${o}" ${o===v?'selected':''}>${t(o)}</option>`).join('')}</select></label>`;
    if(f.type==='lines')return `<label>${t(f.key)}<small>${t('recordExercisesHint')}</small><textarea name="${f.key}" required maxlength="${f.limit*(f.max+1)}">${h(Array.isArray(v)?v.join('\n'):v)}</textarea></label>`;
    return `<label>${t(f.key)}<input name="${f.key}" type="${f.type}" value="${h(v)}" required ${f.type==='number'?`min="${f.min}" max="${f.max}" step="${f.step}"`:f.type==='text'?`maxlength="${f.max}"`:''}></label>`;
  }).join('');
}
export function wellnessFormRecord(kind,fd){
  return Object.fromEntries(wellnessKinds[kind].fields.map(f=>[f.key,f.type==='boolean'?fd.has(f.key):f.type==='number'?(fd.get(f.key)===''?NaN:Number(fd.get(f.key))):f.type==='lines'?String(fd.get(f.key)).split(/\r?\n/).map(x=>x.trim()).filter(Boolean):fd.get(f.key)]));
}
export function wellnessSettings({state,t,btn}){
  if(!state.wellness?.enabled)return '';
  return `<section class="card stack"><h2>${t('wellnessPrivate')}</h2><p>${t('wellnessLocalNotice')}</p>${btn(t('wellnessClear'),'wellnessClear','','danger')}</section>`;
}
