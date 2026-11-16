import {nutrientKeys,cuisines,foodGroups,servingUnits,goals,meals,strategies,templates,sumNutrients,calculateNutrients,energyEstimate,smartTargets,planTargetForDate,daySummary,portionAlternatives,mealAlternatives} from './nutrition-catalog.js';
import {todayLocal} from './wellness-ui.js';
const views=new Map();
const view=id=>{if(!views.has(id))views.set(id,{tab:'diary',date:todayLocal(),query:'',cuisine:'',group:'',ready:false,onlyFavorites:false,page:0,plan:null,day:1,food:null,recipe:null});return views.get(id)};
export const resetNutritionUI=()=>views.clear();
export function nutritionUI(id,op,value){
  const v=view(id);
  if(op==='tab'&&['diary','foods','plans','recipes','shopping','progress','coach'].includes(value))v.tab=value;
  if(op==='filter')Object.assign(v,value,{page:0});
  if(op==='page')v.page=Math.max(0,v.page+Number(value));
  if(op==='date')v.date=value;
  if(op==='plan'){v.plan=value;v.day=1}
  if(op==='day')v.day=Number(value);
  if(op==='food')v.food=value;
  if(op==='recipe')v.recipe=value;
}
const label=(t,k)=>t('nut_'+k);
const field=(t,h,n,k,v='',type='text',extra='')=>`<label>${label(t,k)}<input name="${n}" type="${type}" value="${h(v)}" ${extra}></label>`;
const number=(t,h,n,k,v='',min=0,max=10000,step='any',required=true)=>field(t,h,n,k,v,'number',`min="${min}" max="${max}" step="${step}" ${required?'required':''}`);
const select=(t,h,n,k,opts,value='',required=true)=>`<label>${label(t,k)}<select name="${n}" ${required?'required':''}>${opts.map(([id,name])=>`<option value="${h(id)}" ${String(id)===String(value)?'selected':''}>${h(name)}</option>`).join('')}</select></label>`;
const opts=(t,x)=>x.map(k=>[k,label(t,k)]);
const hidden=(h,n,v)=>`<input type="hidden" name="${n}" value="${h(v)}">`;
const form=(t,h,op,body,id='',key='save')=>`<form class="stack nutrition-form" data-form="nutrition">${hidden(h,'operation',op)}${id?hidden(h,'id',id):''}${body}<button type="submit" class="primary">${t(key)}</button></form>`;
const action=(t,h,key,op,id='',extra='')=>`<button type="button" class="secondary" data-action="nutritionAction" data-op="${op}" data-id="${h(id)}" ${extra}>${t(key)}</button>`;
const ui=(t,h,key,op,id)=>`<button type="button" class="secondary" data-action="nutritionUI" data-op="${op}" data-id="${h(id)}">${label(t,key)}</button>`;
const name=(food,lang)=>food.names?.[lang]||food.names?.en||food.title;
// Preserve the reference preparation for foods whose generic display name is broader
// than the official sample. The source description is intentionally untranslated.
const foodName=(food,lang)=>name(food,lang)+(food.preparation?` · ${food.preparation}`:'');
const show=v=>v===null||v===undefined?'—':String(Math.round(v*10)/10);
const units=t=>servingUnits.map(u=>[u,label(t,u)]);
const empty=t=>`<p class="empty">${t('noItems')}</p>`;
const offsetDate=(date,offset)=>new Date(Date.parse(date+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10);
function stats(t,h,n,all=false){
  return `<div class="grid">${(all?nutrientKeys:nutrientKeys.slice(0,4)).map(k=>`<div class="stat-box"><strong>${h(show(n?.[k]))}</strong> <small>${k==='kcal'?'kcal':k==='sodium'?'mg':'g'}</small><br><small>${label(t,k)}</small></div>`).join('')}</div>`;
}
const targets=(t,h,p={})=>select(t,h,'goal','goal',opts(t,goals),p.goal||'maintenance')+number(t,h,'kcal','kcal',p.kcal??'',1000,10000)+number(t,h,'protein','protein',p.protein??'',0,1000)+number(t,h,'carbs','carbs',p.carbs??'',0,2000)+number(t,h,'fat','fat',p.fat??'',0,1000)+number(t,h,'waterMl','waterGoal',p.waterMl??'',1,10000,'any',false)+field(t,h,'notes','notes',p.notes,'text','maxlength="500"')+smartFields(t,h);
const smartFields=(t,h)=>`<details><summary>${label(t,'smartTargets')}</summary><p class="notice">${label(t,'smartHint')}</p><div class="grid">${number(t,h,'smart_weight','weightKg','',30,300,'any',false)}${number(t,h,'smart_height','heightCm','',120,220,'any',false)}${number(t,h,'smart_age','age','',19,78,1,false)}${select(t,h,'smart_sex','sex',[['male',label(t,'male')],['female',label(t,'female')]])}${number(t,h,'smart_factor','factor','',1,2.5,.01,false)}${number(t,h,'smart_adjustment','adjustment','',-15,10,1,false)}${number(t,h,'smart_proteinRate','proteinRate',1.6,1.4,2,.1,false)}${number(t,h,'smart_fatPercent','fatPercent',30,20,35,1,false)}</div><p>${label(t,'adjustmentHint')}</p><label class="check-row"><input type="checkbox" name="smart_eligible">${label(t,'eligible')}</label><button type="button" class="secondary" data-action="nutritionCalculate">${label(t,'fillTargets')}</button><output data-smart-result aria-live="polite"></output></details>`;
export function fillSmartTargets(form,t){
  if(!form)return;const e=form.elements,read=k=>e.namedItem(k)?.value,goal=read('goal');
  // A goal-specific template overrides the manual selection; Ramadan retains it.
  const template=templates.find(x=>x[0]===read('template')),chosen=template&&template[0]!=='ramadan'?template[1]:goal;
  const values=smartTargets({goal:chosen,weight:Number(read('smart_weight')),height:Number(read('smart_height')),age:Number(read('smart_age')),sex:read('smart_sex'),factor:Number(read('smart_factor')),adjustment:read('smart_adjustment')===''?NaN:Number(read('smart_adjustment')),proteinRate:Number(read('smart_proteinRate')),fatPercent:Number(read('smart_fatPercent')),eligible:e.namedItem('smart_eligible')?.checked===true});
  const out=form.querySelector('[data-smart-result]');if(!out)return;
  if(!values){out.textContent=label(t,'smartInvalid');return}
  ['goal','kcal','protein','carbs','fat'].forEach(k=>{e.namedItem(k).value=values[k]});out.textContent=`${label(t,'totalEnergy')}: ${values.total} kcal · ${label(t,'filledReview')}`;
}
const filters=p=>({allergies:p.allergies||'',exclude:p.excludeFoods||'',cuisine:p.preferredCuisine||'',vegetarian:p.vegetarian===true});
const activePlan=d=>d.plans.find(p=>p.mine&&p.id===d.activePlanId);
const ramadanNote=t=>`<p class="notice">${label(t,'ramadanHint')}</p>`;
const mealOrder=p=>p?.strategy==='ramadan'?['iftar','snack','suhoor','preWorkout','postWorkout','breakfast','lunch','dinner']:meals;
const macroLine=n=>`${show(n.kcal)} kcal · P ${show(n.protein)} g · C ${show(n.carbs)} g · F ${show(n.fat)} g`;
const logged=(d,p,x)=>p.mine&&d.logs.some(l=>l.planId===p.id&&l.planItemId===x.id);
const available=d=>d.foods.filter(f=>f.status==='ready');
function foodPicker(t,h,d,lang,suffix='',required=true,current={}){
  return `<div class="stack" data-food-picker>${select(t,h,'foodId'+suffix,'food',[['',label(t,'chooseFood')],...available(d).map(f=>[f.id,foodName(f,lang)])],current.foodId||'',required)}${number(t,h,'quantity'+suffix,'quantity',current.quantity??100,.001,10000)}${select(t,h,'unit'+suffix,'unit',units(t),current.unit||'g')}<output data-food-result></output></div>`;
}
function amountFields(t,h,d,lang,current={}){
  const recipe=current.source==='recipe';
  return foodPicker(t,h,d,lang,'',false,{...current,foodId:recipe?'':current.foodId})+select(t,h,'recipeId','recipe',[['',label(t,'none')],...d.recipes.map(r=>[r.id,r.title])],recipe?current.foodId:'',false)+`<small>${label(t,'amountHint')}</small>`;
}
function dateForm(t,h,v){return `<form class="row wrap" data-form="nutritionViewDate">${field(t,h,'date','date',v.date,'date','required')}<button class="secondary" type="submit">${t('save')}</button></form>`}
function estimateForm(t,h){
  return `<details><summary>${label(t,'estimate')}</summary><div class="notice">${label(t,'estimateHint')}</div><form data-form="nutritionEstimate" class="stack">${number(t,h,'weight','weightKg','',30,300)}${number(t,h,'height','heightCm','',120,220)}${number(t,h,'age','age','',19,78,1)}${select(t,h,'sex','sex',[['male',label(t,'male')],['female',label(t,'female')]])}${number(t,h,'factor','factor','',1,2.5,.01)}<button type="submit" class="secondary">${label(t,'estimate')}</button><output data-estimate-result aria-live="polite"></output><small>Mifflin–St Jeor · PMID 2305711</small></form></details>`;
}
export function showEnergyEstimate(form,data,t){
  const x=energyEstimate({weight:Number(data.weight),height:Number(data.height),age:Number(data.age),sex:data.sex,factor:Number(data.factor)});
  form.querySelector('[data-estimate-result]').textContent=x?`${label(t,'restingEnergy')}: ${x.resting} kcal · ${label(t,'totalEnergy')}: ${x.total} kcal`:label(t,'estimateInvalid');
}
function diary({d,t,h,lang,v}){
  const logs=d.logs.filter(x=>x.date===v.date),water=d.water.filter(x=>x.date===v.date);
  const plan=activePlan(d),dayTarget=planTargetForDate(plan,v.date),daily=sumNutrients(logs.map(x=>x.nutrients)),g=dayTarget||d.goals;
  const planned=dayTarget?plan.items.filter(x=>x.day===dayTarget.day):[],waterTotal=water.reduce((n,x)=>n+x.ml,0);
  const recent=d.logs.slice(-30).reverse().filter((x,i,a)=>a.findIndex(y=>y.foodId===x.foodId)===i);
  return `<section class="card stack"><h2>${label(t,'diary')}</h2>${dateForm(t,h,v)}${form(t,h,'planActivate',select(t,h,'id','activePlan',[['',label(t,'manualGoal')],...d.plans.filter(p=>p.mine).map(p=>[p.id,p.title])],d.activePlanId||'',false))}${dayTarget?`<p>${h(plan.title)} · ${label(t,'day')} ${dayTarget.day} · ${label(t,dayTarget.type||'custom')}</p>`:''}${stats(t,h,daily,true)}${g?`<div class="grid">${nutrientKeys.slice(0,4).map(k=>`<div class="rule"><b>${label(t,k)}</b><p>${show(daily[k])} / ${show(g[k])} · ${label(t,'remaining')}: ${show(daily[k]===null?null:g[k]-daily[k])}</p><progress value="${Math.max(0,Math.min(daily[k]||0,g[k]))}" max="${g[k]||1}"></progress></div>`).join('')}</div>`:''}<details><summary>${label(t,'manualGoal')}</summary>${form(t,h,'goal',targets(t,h,d.goals||{}))}</details><p class="notice">${label(t,'targetHint')}</p>${estimateForm(t,h)}${dayTarget&&plan.strategy==='ramadan'?ramadanNote(t):''}</section>
  ${planned.length?`<section class="card stack"><h3>${label(t,'plannedToday')}</h3>${planned.map(x=>`<div class="row wrap space"><span>${h(foodName(x,lang))} · ${label(t,x.meal)} · ${show(x.quantity)} ${label(t,x.unit)}</span>${logs.some(l=>l.planId===plan.id&&l.planItemId===x.id)?`<small>${label(t,'logged')}</small>`:action(t,h,'nut_logMeal','planLog',plan.id,`data-item="${h(x.id)}" data-date="${h(v.date)}"`)}</div>`).join('')}</section>`:''}
  <section class="card stack"><h3>${label(t,'logMeal')}</h3>${form(t,h,'logAdd',hidden(h,'date',v.date)+select(t,h,'meal','meal',opts(t,mealOrder(dayTarget?plan:null)),dayTarget&&plan.strategy==='ramadan'?'iftar':'breakfast')+amountFields(t,h,d,lang),'','create')}
  ${mealOrder(dayTarget?plan:null).map(m=>`<div class="rule stack"><h4>${label(t,m)}</h4>${logs.filter(x=>x.meal===m).map(x=>`<div class="row wrap space"><span>${h(foodName(x,lang))} · ${show(x.quantity)} ${label(t,x.unit)} · ${show(x.nutrients.kcal)} kcal</span>${action(t,h,'remove','logDelete',x.id)}</div>`).join('')||empty(t)}</div>`).join('')}
  <details><summary>${label(t,'recent')}</summary>${recent.map(x=>`<p>${h(foodName(x,lang))}</p>`).join('')||empty(t)}</details></section>
  <section class="card stack"><h3>${label(t,'water')}</h3><b>${waterTotal} ml${g?.waterMl?` / ${g.waterMl} ml`:''}</b>${g?.waterMl?`<progress value="${Math.min(waterTotal,g.waterMl)}" max="${g.waterMl}"></progress>`:''}${form(t,h,'waterAdd',hidden(h,'date',v.date)+number(t,h,'ml','ml',250,1,10000),'','create')}${water.map(x=>`<div class="row space"><span>${x.ml} ml</span>${action(t,h,'remove','waterDelete',x.id)}</div>`).join('')}</section>`;
}
function foodEditor(t,h,f,d){
  return ['ar','en','sv'].map(l=>`<label>${t('lang_'+l)}<input name="name_${l}" value="${h(f?.names[l])}" required maxlength="120"></label>`).join('')
    +select(t,h,'cuisine','cuisine',opts(t,cuisines),f?.cuisine||'basic')+select(t,h,'group','group',opts(t,foodGroups),f?.group||'dishes')
    +field(t,h,'preparation','preparation',f?.preparation,'text','maxlength="100"')+field(t,h,'source','source',f?.source,'text','maxlength="400"')
    +field(t,h,'allergens','allergens',f?.allergens,'text','maxlength="250"')+field(t,h,'barcode','barcode',f?.barcode,'text','maxlength="32"')
    +`<h4>${label(t,'per100')}</h4><div class="grid">${nutrientKeys.map(k=>number(t,h,k,k,f?.nutrients?.[k]??'',0,k==='sodium'?100000:k==='kcal'?1000:100,'any',false)).join('')}</div><h4>${label(t,'portionWeights')}</h4><div class="grid">${servingUnits.filter(u=>!['g','kg','l'].includes(u)).map(u=>number(t,h,'portion_'+u,u,f?.portions?.[u]??'',.001,10000,'any',false)).join('')}</div>`
    +select(t,h,'status','status',opts(t,['draft','ready']),f?.status==='ready'?'ready':'draft');
}
function foods({d,t,h,v,lang}){
  const matches=d.foods.filter(f=>(!v.cuisine||f.cuisine===v.cuisine)&&(!v.group||f.group===v.group)&&(!v.ready||f.status==='ready')&&(!v.onlyFavorites||d.favorites.includes(f.id))&&(!v.query||Object.values(f.names).some(s=>s.toLowerCase().includes(v.query.toLowerCase()))||f.barcode?.includes(v.query)));
  const last=Math.max(0,Math.ceil(matches.length/20)-1);v.page=Math.min(v.page,last);
  const f=d.foods.find(x=>x.id===v.food),profileFilters=filters(activePlan(d)||{});
  return `<section class="card stack"><h2>${label(t,'foods')}</h2><p class="notice">${label(t,'draftNotice')}</p><p>${d.foods.length} · ${available(d).length} ${label(t,'ready')}</p><form class="stack" data-form="nutritionFilter">${field(t,h,'query','search',v.query,'search','maxlength="120"')}${select(t,h,'cuisine','cuisine',[['',t('all')],...opts(t,cuisines)],v.cuisine,false)}${select(t,h,'group','group',[['',t('all')],...opts(t,foodGroups)],v.group,false)}<label class="check-row"><input name="ready" type="checkbox" ${v.ready?'checked':''}>${label(t,'readyOnly')}</label>${d.enabled?`<label class="check-row"><input name="onlyFavorites" type="checkbox" ${v.onlyFavorites?'checked':''}>${label(t,'favorites')}</label>`:''}<button type="submit" class="secondary">${label(t,'search')}</button></form>${d.canAdmin||d.enabled?ui(t,h,'newFood','food','new'):''}
  ${d.canAdmin?`<details><summary>${label(t,'import')}</summary><p>${label(t,'importHint')}</p>${form(t,h,'foodImport',`<textarea name="importJson" rows="8" required maxlength="200000" placeholder="JSON"></textarea>`,'','save')}</details>`:''}
  ${v.food&&(v.food==='new'||f&&(d.canAdmin||f.private))?`<div class="rule stack">${form(t,h,f?'foodUpdate':'foodCreate',foodEditor(t,h,f,d),f?.id||'')}${ui(t,h,'close','food','')}</div>`:''}
  <div class="grid">${matches.slice(v.page*20,v.page*20+20).map(x=>`<article class="card stack"><span class="badge">${label(t,x.cuisine)} · ${label(t,x.group)}</span><h3>${h(foodName(x,lang))}</h3><small>${label(t,x.status)}</small>${x.status==='ready'?`${stats(t,h,x.nutrients,true)}<small>${label(t,'per100')} · ${h(x.source)}</small>${d.enabled?action(t,h,d.favorites.includes(x.id)?'nut_unfavorite':'nut_favorite','favorite',x.id):''}`:''}${x.status==='ready'?`<details><summary>${label(t,'alternatives')}</summary><p>${label(t,'smartAlternativesHint')}</p>${profileFilters.allergies?`<p>${label(t,'allergyBlocked')}</p>`:portionAlternatives(d.foods,x,x.nutrients,profileFilters).map(a=>`<p>${h(foodName(a.food,lang))} · ${a.grams} g · ${macroLine(a.nutrients)}</p>`).join('')||empty(t)}</details>`:''}${(d.canAdmin&&!x.private)||(d.enabled&&x.private)?ui(t,h,'edit','food',x.id)+action(t,h,'remove','foodArchive',x.id):''}</article>`).join('')||empty(t)}</div><div class="row space">${v.page?ui(t,h,'previous','page','-1'):''}<span>${v.page+1}/${last+1}</span>${v.page<last?ui(t,h,'next','page','1'):''}</div></section>`;
}
const planFields=(t,h,p={})=>field(t,h,'title','title',p.title,'text','required maxlength="100"')+field(t,h,'startDate','date',p.startDate||todayLocal(),'date','required')+number(t,h,'weeks','weeks',p.weeks??4,1,52,1)+targets(t,h,p)+select(t,h,'strategy','strategy',opts(t,strategies),p.strategy||'flexible')+field(t,h,'preferences','preferences',p.preferences,'text','maxlength="500"')+field(t,h,'allergies','allergens',p.allergies,'text','maxlength="500"')+select(t,h,'preferredCuisine','preferredCuisine',[['',t('all')],...opts(t,cuisines)],p.preferredCuisine||'',false)+select(t,h,'vegetarian','vegetarianFilter',[['false',t('all')],['true',label(t,'vegetarian')]],String(!!p.vegetarian))+field(t,h,'excludeFoods','excludeFoods',p.excludeFoods,'text','maxlength="500"');
function alternativesForMeal(d,t,h,lang,p,items,day,meal){
  if(!items.length||items.some(x=>logged(d,p,x)))return '';
  const f=filters(p);if(f.allergies)return `<p class="notice">${label(t,'allergyBlocked')}</p>`;
  const rows=mealAlternatives(d.recipes,sumNutrients(items.map(x=>x.nutrients)),f,items.filter(x=>x.source==='recipe').map(x=>x.foodId));
  return `<details><summary>${label(t,'mealAlternatives')}</summary><p>${label(t,'mealAlternativesHint')}</p>${rows.map(a=>`<div class="rule stack"><b>${h(a.recipe.title)} · ${show(a.quantity)} ${label(t,'serving')}</b><small>${macroLine(a.nutrients)}</small>${form(t,h,'planMealSwap',hidden(h,'day',day)+hidden(h,'meal',meal)+hidden(h,'recipeId',a.recipe.id),p.id,'nut_replaceMeal')}</div>`).join('')||empty(t)}</details>`;
}
function alternativesForItem(d,t,h,lang,p,item){
  if(item.source==='recipe'||logged(d,p,item)||p.allergies)return '';
  const ref={id:item.foodId,group:item.group||d.foods.find(f=>f.id===item.foodId)?.group};
  return `<details><summary>${label(t,'alternatives')}</summary><p>${label(t,'smartAlternativesHint')}</p>${portionAlternatives(d.foods,ref,item.nutrients,filters(p)).map(a=>`<div class="rule stack"><b>${h(foodName(a.food,lang))} · ${a.grams} g</b><small>${macroLine(a.nutrients)}</small>${form(t,h,'planItemSwap',hidden(h,'itemId',item.id)+hidden(h,'foodId',a.food.id),p.id,'nut_replaceFood')}</div>`).join('')||empty(t)}</details>`;
}
function plans({d,t,h,v,lang}){
  const p=d.plans.find(x=>x.id===v.plan)||d.plans[0];
  let panel='';
  if(p){
    v.day=Math.max(1,Math.min(p.weeks*7,v.day));const items=p.items.filter(x=>x.day===v.day),dayTarget=p.dayTargets[v.day]||p,planDate=offsetDate(p.startDate,v.day-1);
    const dayOptions=Array.from({length:p.weeks*7},(_,i)=>[i+1,String(i+1)]);
    if(p.editable===false)panel=`<section class="card stack"><h2>${h(p.title)}</h2><p class="notice">${label(t,'revisionConsent')}</p><form data-form="nutritionDay" class="row wrap">${select(t,h,'day','day',dayOptions,v.day)}<button class="secondary">${t('save')}</button></form><h3>${label(t,'day')} ${v.day} · ${h(planDate)}</h3>${stats(t,h,dayTarget)}${items.map(x=>`<p>${label(t,x.meal)} · ${h(foodName(x,lang))} · ${show(x.quantity)} ${label(t,x.unit)}</p>`).join('')||empty(t)}</section>`;
    else
    panel=`<section class="card stack"><h2>${h(p.title)}</h2><p>${label(t,p.goal)} · ${label(t,p.strategy)} · ${p.weeks} ${label(t,'weeks')}</p>${p.strategy==='ramadan'?ramadanNote(t):''}${p.mine?`<p>${p.id===d.activePlanId?label(t,'isActive'):action(t,h,'nut_activatePlan','planActivate',p.id)}</p>`:''}<details><summary>${label(t,'edit')}</summary>${form(t,h,'planUpdate',planFields(t,h,p),p.id)}</details>${p.mine?'<div class="row wrap">'+action(t,h,'train_copy','planCopy',p.id)+action(t,h,'remove','planDelete',p.id)+'</div>':''}
    ${p.mine&&d.canCoach&&d.links.length?form(t,h,'planAssign',select(t,h,'linkId','trainee',d.links.map(l=>[l.id,l.name])),p.id,'train_assign'):''}
    <form data-form="nutritionDay" class="row wrap">${select(t,h,'day','day',dayOptions,v.day)}<button class="secondary">${t('save')}</button></form>
    <h3>${label(t,'day')} ${v.day} · ${h(planDate)} · ${label(t,dayTarget.type||'custom')}</h3>
    ${stats(t,h,sumNutrients(items.map(x=>x.nutrients)))}<p>${label(t,'goal')}: ${dayTarget.kcal} kcal · ${dayTarget.protein} g P · ${dayTarget.carbs} g C · ${dayTarget.fat} g F</p>
    <details><summary>${label(t,'dayTarget')}</summary>${form(t,h,'dayTarget',hidden(h,'day',v.day)+select(t,h,'type','dayType',opts(t,['training','rest','custom']),dayTarget.type||'custom')+targets(t,h,dayTarget),p.id)}</details>
    ${mealOrder(p).map(m=>{const mealItems=items.filter(x=>x.meal===m);return `<div class="rule stack"><h4>${label(t,m)}</h4>${mealItems.map(x=>`<div class="stack rule"><b>${h(foodName(x,lang))} · ${show(x.quantity)} ${label(t,x.unit)}</b><small>${h(x.time)} · ${macroLine(x.nutrients)} · ${h(x.note)}</small><div class="row wrap">${logged(d,p,x)?`<small>${label(t,'logged')}</small>`:action(t,h,'remove','planItemDelete',p.id,`data-item="${h(x.id)}"`)+(p.mine?action(t,h,'nut_logMeal','planLog',p.id,`data-item="${h(x.id)}" data-date="${h(planDate)}"`):'')}</div>${alternativesForItem(d,t,h,lang,p,x)}</div>`).join('')||empty(t)}${alternativesForMeal(d,t,h,lang,p,mealItems,v.day,m)}</div>`}).join('')}
    <details open><summary>${label(t,'addFood')}</summary>${form(t,h,'planItemAdd',hidden(h,'day',v.day)+select(t,h,'meal','meal',opts(t,mealOrder(p)),p.strategy==='ramadan'?'iftar':'breakfast')+field(t,h,'time','time','','time')+field(t,h,'note','notes','','text','maxlength="500"')+amountFields(t,h,d,lang),p.id,'create')}</details>
    <details><summary>${label(t,'copyDay')}</summary>${form(t,h,'dayCopy',hidden(h,'fromDay',v.day)+select(t,h,'toDay','day',dayOptions,v.day===p.weeks*7?1:v.day+1),p.id)}${form(t,h,'mealCopy',hidden(h,'fromDay',v.day)+select(t,h,'toDay','day',dayOptions,v.day===p.weeks*7?1:v.day+1)+select(t,h,'meal','meal',opts(t,meals),'breakfast'),p.id,'nut_copyMeal')}</details></section>`;
  }
  return `<section class="card stack"><h2>${label(t,'plans')}</h2><details ${!p?'open':''}><summary>${label(t,'newPlan')}</summary>${form(t,h,'planCreate',planFields(t,h),'','create')}</details><details><summary>${label(t,'templates')}</summary><p class="notice">${label(t,'templateHint')}</p>${form(t,h,'planTemplate',select(t,h,'template','templates',templates.map(([k])=>[k,label(t,k)]))+planFields(t,h),'','create')}</details><div class="grid">${d.plans.map(x=>`<button type="button" class="card quick" data-action="nutritionUI" data-op="plan" data-id="${h(x.id)}"><b>${h(x.title)}</b><small>${label(t,x.goal)}</small></button>`).join('')||empty(t)}</div></section>${panel}`;
}
function recipes({d,t,h,lang,v}){
  const r=d.recipes.find(x=>x.id===v.recipe);
  return `<section class="card stack"><h2>${label(t,'recipes')}</h2><details><summary>${label(t,'newRecipe')}</summary>${form(t,h,'recipeCreate',field(t,h,'title','title','','text','required maxlength="100"')+number(t,h,'servings','serving',1,1,100)+number(t,h,'minutes','minutes',0,0,1440)+number(t,h,'cost','cost','',0,100000,'any',false)+select(t,h,'currency','currency',['SEK','EUR','USD'].map(x=>[x,x]),'SEK')+field(t,h,'notes','notes','','text','maxlength="2000"')+Array.from({length:12},(_,i)=>`<details ${i===0?'open':''}><summary>${label(t,'ingredient')} ${i+1}</summary>${foodPicker(t,h,d,lang,String(i),i===0)}</details>`).join(''),'','create')}</details>${d.recipes.map(x=>`<article class="rule stack"><h3>${h(x.title)}</h3><p>${x.servings} ${label(t,'serving')} · ${x.minutes} min ${x.cost===null?'':' · '+h(x.cost)+' '+h(x.currency)}</p>${stats(t,h,Object.fromEntries(nutrientKeys.map(k=>[k,x.nutrients[k]===null?null:x.nutrients[k]/x.servings])))}<small>${label(t,'perServing')}</small><details><summary>${label(t,'ingredient')}</summary>${x.items.map(i=>`<p>${h(foodName(i,lang))} · ${show(i.grams)} g</p>`).join('')}<p>${h(x.notes)}</p></details>${action(t,h,'remove','recipeDelete',x.id)}${d.canCoach&&d.links.length?form(t,h,'recipeShare',select(t,h,'linkId','trainee',d.links.map(l=>[l.id,l.name])),x.id,'share'):''}</article>`).join('')||empty(t)}</section>`;
}
function shopping({d,t,h,v,lang}){
  const p=d.plans.find(x=>x.id===v.plan)||d.plans[0];if(!p)return `<section class="card stack"><h2>${label(t,'shopping')}</h2>${empty(t)}</section>`;
  const week=Math.max(1,Math.min(p.weeks,Math.ceil(v.day/7))),from=(week-1)*7+1,to=week*7,items=p.items.filter(x=>x.day>=from&&x.day<=to);
  const list=new Map();
  for(const x of items){
    const ingredients=x.ingredients||[x];
    for(const i of ingredients){const row=list.get(i.foodId)||{...i,grams:0};row.grams+=i.grams;list.set(i.foodId,row)}
  }
  return `<section class="card stack"><h2>${label(t,'shopping')}</h2><p>${h(p.title)} · ${label(t,'weeks')} ${week}</p><form data-form="nutritionDay" class="row wrap">${select(t,h,'day','weeks',Array.from({length:p.weeks},(_,i)=>[i*7+1,String(i+1)]),from)}<button class="secondary">${t('save')}</button></form>${[...list.values()].map(x=>`<label class="check-row"><input type="checkbox">${h(foodName(x,lang))} · ${show(x.grams)} g</label>`).join('')||empty(t)}</section>`;
}
function progress({d,t,h,v}){
  const days=Array.from({length:7},(_,i)=>offsetDate(v.date,i-6));
  const plan=activePlan(d),rows=days.map(date=>daySummary(plan,date,d.logs,d.water,d.goals));
  const recorded=rows.filter(r=>r.recorded),average=Object.fromEntries(nutrientKeys.map(k=>[k,recorded.length&&recorded.every(r=>r.nutrients[k]!==null)?recorded.reduce((a,r)=>a+r.nutrients[k],0)/recorded.length:null]));
  return `<section class="card stack"><h2>${label(t,'progress')}</h2>${dateForm(t,h,v)}${plan?`<p>${label(t,'activePlan')}: ${h(plan.title)}</p>`:''}<p>${label(t,'recordedDays')}: ${recorded.length}/7 · ${label(t,'dailyAverage')}</p>${stats(t,h,average)}${weeklyRows(t,h,rows)}</section>`;
}
function weeklyRows(t,h,rows){
  return rows.map(r=>`<article class="rule stack"><b>${h(r.date)}</b>${stats(t,h,r.recorded?r.nutrients:{})}${r.target?`<small>${label(t,'goal')}: ${macroLine(r.target)}</small>`:''}<small>${label(t,'water')}: ${r.water} ml${r.target?.waterMl?` / ${r.target.waterMl} ml`:''} · ${label(t,'adherence')}: ${r.planned?`${r.done}/${r.planned}`:'—'}</small></article>`).join('');
}
function coach({d,t,h,lang}){
  return `<section class="card stack"><h2>${label(t,'coach')}</h2><p class="notice">${label(t,'sharingHint')}</p>${d.shareLinks.map(l=>`<div class="row space"><b>${h(l.name)}</b>${action(t,h,l.enabled?'nut_stopSharing':'nut_allowSharing','share',l.id,`data-enabled="${!l.enabled}"`)}</div>`).join('')||empty(t)}${d.shared.map(l=>`<article class="rule stack"><h3>${h(l.name)}</h3>${l.activePlan?`<p>${label(t,'activePlan')}: ${h(l.activePlan)}</p>`:''}${l.goals?stats(t,h,l.goals):''}<details open><summary>${label(t,'weeklyCoach')}</summary>${weeklyRows(t,h,l.weekly||[])}</details><details><summary>${label(t,'recent')}</summary>${l.logs.slice(-14).reverse().map(x=>`<p>${h(x.date)} · ${h(foodName(x,lang))} · ${show(x.nutrients.kcal)} kcal</p>`).join('')||empty(t)}</details></article>`).join('')}</section>`;
}
export function nutritionPage({state,t,h,btn,lang}){
  const d=state.nutrition,v=view(state.me.id),permitted=d.enabled?['diary','foods','plans','recipes','shopping','progress','coach']:['foods'];if(!permitted.includes(v.tab))v.tab=permitted[0];
  return `<div class="stack"><div class="hero workspace-hero"><span class="eyebrow">MUSCLIVO LIVE / NUTRITION PRO</span><h1>${t('nutrition')}</h1><p>${label(t,'draftNotice')}</p></div>${!d.enabled&&!d.canAdmin?`<section class="card stack"><p>${t('wellnessConsent')}</p>${btn(t('wellnessEnable'),'wellnessEnable','','primary')}</section>`:''}<div class="row wrap">${permitted.map(k=>btn(label(t,k),'nutritionUI',`data-op="tab" data-id="${k}" aria-pressed="${v.tab===k}"`,v.tab===k?'primary':'secondary')).join('')}</div>${({diary,foods,plans,recipes,shopping,progress,coach})[v.tab]({d,t,h,v,lang})}</div>`;
}
export function updateNutritionPicker(group,data,t){
  const sel=group?.querySelector('select[name^=foodId]'),unit=group?.querySelector('select[name^=unit]'),quantity=group?.querySelector('input[name^=quantity]'),result=group?.querySelector('[data-food-result]');
  if(!sel||!unit||!quantity||!result)return;
  const food=data.foods.find(x=>x.id===sel.value);
  for(const op of unit.options)op.disabled=!!food&&!food.portions[op.value];
  if(unit.selectedOptions[0]?.disabled)unit.value='g';
  const cal=calculateNutrients(food,Number(quantity.value),unit.value);result.textContent=cal?`${show(cal.grams)} g · ${show(cal.nutrients.kcal)} kcal · P ${show(cal.nutrients.protein)} g · C ${show(cal.nutrients.carbs)} g · F ${show(cal.nutrients.fat)} g`:'';
}
export function nutritionPayload(data){
  const b={...data},op=b.operation;
  for(const key of Object.keys(b))if(key.startsWith('smart_'))delete b[key];
  for(const k of ['quantity','kcal','protein','carbs','fat','weeks','day','fromDay','toDay','ml','waterMl','servings','minutes','cost'])if(Object.hasOwn(b,k))b[k]=b[k]===''?null:Number(b[k]);
  if(['foodCreate','foodUpdate'].includes(op)){
    b.names=Object.fromEntries(['ar','en','sv'].map(l=>[l,b['name_'+l]]));
    b.nutrients=Object.fromEntries(nutrientKeys.map(k=>[k,data[k]===''?null:Number(data[k])]));
    b.portions=Object.fromEntries(servingUnits.filter(u=>data['portion_'+u]).map(u=>[u,Number(data['portion_'+u])]));
  }
  if(op==='recipeCreate'||op==='recipeUpdate')b.items=Array.from({length:12},(_,i)=>({foodId:b['foodId'+i],quantity:Number(b['quantity'+i]),unit:b['unit'+i]})).filter(x=>x.foodId);
  if(op==='foodImport'){try{b.rows=JSON.parse(b.importJson)}catch{b.rows=[]}delete b.importJson}
  return b;
}
