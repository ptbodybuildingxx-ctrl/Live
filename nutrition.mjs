import {randomUUID} from 'node:crypto';
import {can,activeContext} from './identity.mjs';
import {seedFoods,nutrientKeys,cuisines,foodGroups,servingUnits,goals,meals,strategies,templates,calculateNutrients,sumNutrients,targetValid,dayForDate,daySummary,portionAlternatives,mealAlternatives} from './dist/core/nutrition-catalog.js';

const need=(ok,message,status=400)=>{if(!ok)throw Object.assign(new Error(message),{status})};
const str=(v,max,optional=false)=>{need(typeof v==='string'&&v.trim().length<=max&&(optional||v.trim().length),'Invalid text');return v.trim()};
const num=(v,min,max,int=false)=>{need(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max&&(!int||Number.isInteger(v)),'Invalid number');return v};
const choose=(v,list)=>{need(list.includes(v),'Invalid option');return v};
const date=v=>{need(typeof v==='string'&&/^20\d\d-\d\d-\d\d$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v,'Invalid date');return v};
const empty=()=>({foods:[],logs:[],water:[],plans:[],recipes:[],goals:{},favorites:{},sharing:{},activePlans:{}});
const read=s=>s.nutrition||empty(), write=s=>s.nutrition??=empty();
const catalogAudit=(d,id,operation)=>{const entries=d.audit??=[];entries.unshift({actor:id,operation,at:Date.now()});entries.splice(1000)};
const personal=(s,id)=>can(s,id,'personal.read');
const enabled=(s,id)=>personal(s,id)&&!!s.wellness?.enabled.includes(id);
const admin=(s,id)=>can(s,id,'platform.admin');
const profile=(s,id)=>s.profiles.find(p=>p.id===id&&!p.suspended&&p.emailVerified!==false);
const isCoach=(s,id)=>enabled(s,id)&&activeContext(s,id)?.role==='coach'&&profile(s,id)?.verified===true;
const links=s=>s.coaching?.links||[];
const validLink=(s,l)=>l?.status==='active'&&profile(s,l.coach)?.verified===true&&profile(s,l.coach)?.role==='coach'&&profile(s,l.member)&&!s.blocks.some(b=>(b.from===l.coach&&b.to===l.member)||(b.to===l.coach&&b.from===l.member));
const coachLink=(s,id,l)=>isCoach(s,id)&&l?.coach===id&&validLink(s,l)&&!!s.wellness?.enabled.includes(l.member);
const own=(arr,id)=>arr.filter(x=>x.owner===id);
const idRow=(arr,id,user)=>arr.find(x=>x.id===id&&x.owner===user);
const freshId=()=>randomUUID();
function allFoods(s){
  const d=read(s),overrides=new Map(d.foods.filter(x=>x.owner===null).map(x=>[x.id,x]));
  return [...seedFoods.map(x=>overrides.get(x.id)||{...x,owner:null}),...d.foods.filter(x=>!seedFoods.some(f=>f.id===x.id))];
}
const readableFood=(f,id)=>f.owner===null||f.owner===id;
function getFood(s,id,fid){
  const f=allFoods(s).find(x=>x.id===fid&&readableFood(x,id)&&x.status==='ready');
  need(f,'Food has no approved nutrient data',404);return f;
}
function foodBody(b){
  const names=Object.fromEntries(['ar','en','sv'].map(k=>[k,str(b.names?.[k],120)]));
  const status=choose(b.status,['draft','ready','archived']);
  const nutrients=status==='draft'&&b.nutrients===null?null:Object.fromEntries(nutrientKeys.map(k=>{
    const v=b.nutrients?.[k];return [k,v===null||v===undefined?null:num(v,0,k==='kcal'?1000:k==='sodium'?100000:100)];
  }));
  const source=str(b.source??'',400,true);
  if(status==='ready')need(source&&nutrients&&['kcal','protein','carbs','fat'].every(k=>nutrients[k]!==null),'Source and core nutrient values required');
  const portions={g:1,kg:1000};
  for(const u of servingUnits.filter(u=>!['g','kg','l'].includes(u)))if(b.portions?.[u]!==undefined&&b.portions[u]!==null)portions[u]=num(b.portions[u],.001,10000);
  if(portions.ml)portions.l=portions.ml*1000;
  return {names,cuisine:choose(b.cuisine,cuisines),group:choose(b.group,foodGroups),preparation:str(b.preparation??'',100,true),nutrients,source,portions,status,barcode:str(b.barcode??'',32,true),allergens:str(b.allergens??'',250,true)};
}
// Freeze the actual nutrient values and portion weight used in each entry. Editing
// a catalog item must not change past diaries or previously assigned programs.
function ingredient(s,id,b){
  const food=getFood(s,id,b.foodId),quantity=num(b.quantity,.001,10000),unit=choose(b.unit,servingUnits);
  const res=calculateNutrients(food,quantity,unit);need(res&&res.grams<=20000,'Invalid portion');
  return {foodId:food.id,names:{...food.names},cuisine:food.cuisine,group:food.group,preparation:food.preparation||'',source:food.source,quantity,unit,...res,allergens:food.allergens||''};
}
function targetBody(b){
  const t={goal:choose(b.goal,goals),kcal:num(b.kcal,1000,10000),protein:num(b.protein,0,1000),carbs:num(b.carbs,0,2000),fat:num(b.fat,0,1000),waterMl:b.waterMl==null?null:num(b.waterMl,1,10000),notes:str(b.notes??'',500,true)};
  need(targetValid(t),'Energy and macro targets are inconsistent or outside the permitted range');return t;
}
const planFilters=p=>({allergies:p.allergies||'',exclude:p.excludeFoods||'',cuisine:p.preferredCuisine||'',vegetarian:p.vegetarian===true});
const preferences=b=>({preferences:str(b.preferences??'',500,true),allergies:str(b.allergies??'',500,true),excludeFoods:str(b.excludeFoods??'',500,true),preferredCuisine:choose(b.preferredCuisine??'',['',...cuisines]),vegetarian:b.vegetarian===true||b.vegetarian==='true'});
const loggedItem=(d,p,i)=>d.logs.some(x=>x.owner===p.owner&&x.planId===p.id&&x.planItemId===i.id);
const totals=rows=>sumNutrients(rows.map(x=>x.nutrients));
const publicFood=({owner,...f})=>({...f,private:owner!==null});
const publicPlan=(p,id,d)=>({...p,mine:p.owner===id,editable:p.owner===id||d.sharing[p.linkId]===true});
const canEditPlan=(s,id,p)=>enabled(s,id)&&(p.owner===id||(p.author===id&&coachLink(s,id,links(s).find(l=>l.id===p.linkId))));
const plansFor=(s,id)=>read(s).plans.filter(p=>canEditPlan(s,id,p));
const dayCount=p=>p.weeks*7;
function logRecipe(s,id,r,quantity){
  need(r&&r.owner===id,'Recipe not found',404);num(quantity,.001,1000);
  return {foodId:r.id,names:{ar:r.title,en:r.title,sv:r.title},source:'recipe',quantity,unit:'serving',grams:r.items.reduce((a,x)=>a+x.grams,0)*quantity/r.servings,nutrients:Object.fromEntries(nutrientKeys.map(k=>[k,r.nutrients[k]===null?null:r.nutrients[k]*quantity/r.servings])),ingredients:r.items.map(x=>({foodId:x.foodId,names:x.names,grams:x.grams*quantity/r.servings})),allergens:r.items.map(x=>x.allergens).filter(Boolean).join(', ')};
}
export function nutritionView(s,id){
  if(!personal(s,id)&&!admin(s,id))return undefined;
  const d=read(s),canAdmin=admin(s,id),active=enabled(s,id);
  const foods=allFoods(s).filter(f=>readableFood(f,id)&&(canAdmin||f.status!=='archived'));
  const currentLinks=links(s).filter(l=>coachLink(s,id,l));
  const shareLinks=active?links(s).filter(l=>l.member===id&&validLink(s,l)):[];
  return {enabled:active,canAdmin,canCoach:isCoach(s,id),foods:foods.map(publicFood),
    goals:active?d.goals[id]||null:null,activePlanId:active?d.activePlans?.[id]||null:null,logs:active?own(d.logs,id):[],water:active?own(d.water,id):[],
    plans:active?plansFor(s,id).map(p=>publicPlan(p,id,d)):[],recipes:active?own(d.recipes,id):[],
    favorites:active?d.favorites[id]||[]:[],
    links:currentLinks.map(l=>({id:l.id,name:profile(s,l.member).name})),
    shareLinks:shareLinks.map(l=>({id:l.id,name:profile(s,l.coach).name,enabled:d.sharing[l.id]===true})),
    shared:currentLinks.filter(l=>d.sharing[l.id]===true).map(l=>{
      const logs=own(d.logs,l.member),water=own(d.water,l.member),plan=d.plans.find(p=>p.id===d.activePlans?.[l.member]&&p.owner===l.member);
      const today=new Date();const days=Array.from({length:7},(_,i)=>{const x=new Date(today);x.setUTCDate(x.getUTCDate()+i-6);return x.toISOString().slice(0,10)});
      return {name:profile(s,l.member).name,logs:logs.slice(-100),water:water.slice(-100),goals:d.goals[l.member]||null,activePlan:plan?.title||null,weekly:days.map(day=>daySummary(plan,day,logs,water,d.goals[l.member]))};
    })};
}
export function nutritionExport(s,id){
  if(!s.nutrition)return undefined;const d=read(s);
  return {foods:own(d.foods,id),logs:own(d.logs,id),water:own(d.water,id),plans:own(d.plans,id),recipes:own(d.recipes,id),goals:d.goals[id]||null,activePlanId:d.activePlans?.[id]||null,favorites:d.favorites[id]||[]};
}
export function clearNutrition(s,id){
  if(!s.nutrition)return;const d=write(s);
  for(const k of ['logs','water','plans','recipes','foods'])d[k]=d[k].filter(x=>x.owner!==id);
  // Keep trainee-owned snapshots when a coach clears their data, but remove access.
  for(const p of d.plans)if(p.author===id){p.author=p.owner;p.linkId=null}
  delete d.goals[id];delete d.favorites[id];if(d.activePlans)delete d.activePlans[id];for(const l of links(s))if(l.member===id||l.coach===id)delete d.sharing[l.id];
}
export function nutritionAction(s,id,b){
  const d=write(s),op=b.operation;
  if(op==='foodImport'){
    need(admin(s,id),'Administrator required',403);
    need(Array.isArray(b.rows)&&b.rows.length>0&&b.rows.length<=50,'Import 1–50 food records');
    const catalog=new Map(allFoods(s).filter(f=>f.owner===null).map(x=>[x.id,x]));
    const imported=new Set();
    const records=b.rows.map(row=>{
      need(row&&typeof row==='object'&&!Array.isArray(row),'Invalid food record');
      const old=catalog.get(row.id);need(!row.id||old,'Unknown food ID');
      const key=row.id||freshId();need(!imported.has(key),'Duplicate ID in import');imported.add(key);
      return {id:key,owner:null,...foodBody({...old,...row})};
    });
    need(catalog.size+records.filter(r=>!catalog.has(r.id)).length<=5000,'Catalog capacity',429);
    for(const row of records){const i=d.foods.findIndex(x=>x.id===row.id);if(i<0)d.foods.push(row);else d.foods[i]=row}catalogAudit(d,id,op);return;
  }
  if(['foodCreate','foodUpdate','foodArchive'].includes(op)){
    need(admin(s,id)||enabled(s,id),'Personal or admin context required',403);
    const publicScope=admin(s,id);
    const old=op==='foodCreate'?null:allFoods(s).find(f=>f.id===b.id&&(publicScope?f.owner===null:f.owner===id));
    if(op!=='foodCreate')need(old,'Food not found',404);
    const owner=publicScope?null:id;
    if(op==='foodCreate')need((publicScope?allFoods(s).filter(f=>f.owner===null):d.foods.filter(f=>f.owner===owner)).length<(publicScope?5000:500),'Food limit',429);
    const record=op==='foodArchive'?{...old,status:'archived'}:{id:old?.id||freshId(),owner,...foodBody(b)};
    const index=d.foods.findIndex(x=>x.id===record.id);
    if(index<0)d.foods.push(record);else d.foods[index]=record;if(publicScope)catalogAudit(d,id,op);return;
  }
  need(enabled(s,id),'Enable private personal records first',403);
  if(op==='share'){
    const l=links(s).find(x=>x.id===b.linkId&&x.member===id&&validLink(s,x));
    need(l&&typeof b.enabled==='boolean','Invalid sharing relationship',403);d.sharing[l.id]=b.enabled;return;
  }
  if(op==='goal'){d.goals[id]=targetBody(b);return}
  if(op==='planActivate'){
    need(!b.id||idRow(d.plans,b.id,id),'Only the owner can activate a plan',403);
    d.activePlans??={};if(b.id)d.activePlans[id]=b.id;else delete d.activePlans[id];return;
  }
  if(op==='favorite'){
    const f=allFoods(s).find(x=>x.id===b.foodId&&readableFood(x,id)&&x.status==='ready');need(f,'Food unavailable',404);
    const list=d.favorites[id]??=[];const i=list.indexOf(f.id);if(i>=0)list.splice(i,1);else{need(list.length<500,'Favorite limit',429);list.push(f.id)}return;
  }
  if(op==='waterAdd'){need(own(d.water,id).length<5000,'Water limit',429);d.water.push({id:freshId(),owner:id,date:date(b.date),ml:num(b.ml,1,10000)});return}
  if(op==='waterDelete'||op==='logDelete'||op==='recipeDelete'||op==='planDelete'){
    const arr={waterDelete:d.water,logDelete:d.logs,recipeDelete:d.recipes,planDelete:d.plans}[op],i=arr.findIndex(x=>x.id===b.id&&x.owner===id);
    need(i>=0,'Record not found',404);arr.splice(i,1);if(op==='planDelete'&&d.activePlans?.[id]===b.id)delete d.activePlans[id];return;
  }
  if(op==='logAdd'||op==='logUpdate'){
    const old=op==='logUpdate'?idRow(d.logs,b.id,id):null;if(op==='logUpdate')need(old&&!old.planId,'Meal entry not found or linked to a plan',409);
    else need(own(d.logs,id).length<10000,'Diary limit',429);
    need(Boolean(b.recipeId)!==Boolean(b.foodId),'Choose one food or recipe');
    const amount=b.recipeId?logRecipe(s,id,idRow(d.recipes,b.recipeId,id),b.quantity):ingredient(s,id,b);
    const record={id:old?.id||freshId(),owner:id,date:date(b.date),meal:choose(b.meal,meals),...amount};
    if(old)Object.assign(old,record);else d.logs.push(record);return;
  }
  if(op==='recipeCreate'||op==='recipeUpdate'){
    const old=op==='recipeUpdate'?idRow(d.recipes,b.id,id):null;if(op==='recipeUpdate')need(old,'Recipe not found',404);
    else need(own(d.recipes,id).length<300,'Recipe limit',429);
    need(Array.isArray(b.items)&&b.items.length>0&&b.items.length<=50,'Invalid ingredients');
    const items=b.items.map(x=>ingredient(s,id,x));
    const row={id:old?.id||freshId(),owner:id,title:str(b.title,100),servings:num(b.servings,1,100),minutes:num(b.minutes,0,1440),cost:b.cost==null?null:num(b.cost,0,100000),currency:choose(b.currency||'SEK',['SEK','EUR','USD']),notes:str(b.notes??'',2000,true),items,nutrients:totals(items)};
    if(old)Object.assign(old,row);else d.recipes.push(row);return;
  }
  if(op==='recipeShare'){
    const r=idRow(d.recipes,b.id,id),l=links(s).find(x=>x.id===b.linkId);need(r&&coachLink(s,id,l),'Recipe or relationship unavailable',404);
    need(own(d.recipes,l.member).length<300,'Recipe limit',429);d.recipes.push({...structuredClone(r),id:freshId(),owner:l.member});return;
  }
  if(op==='planCreate'||op==='planTemplate'){
    need(own(d.plans,id).length<100,'Plan limit',429);
    const template=op==='planTemplate'?templates.find(x=>x[0]===b.template):null;if(op==='planTemplate')need(template,'Template not found');
    d.plans.push({id:freshId(),owner:id,author:id,linkId:null,title:str(b.title,100),startDate:date(b.startDate),weeks:num(b.weeks,1,52,true),...targetBody({...b,goal:template?.[0]==='ramadan'?b.goal:template?.[1]||b.goal}),strategy:template?.[0]==='ramadan'?'ramadan':choose(b.strategy,strategies),...preferences({...b,vegetarian:template?.[0]==='vegetarian'||b.vegetarian}),template:template?.[0]||null,items:[],dayTargets:{},revision:1});return;
  }
  if(op==='planCopy'||op==='planAssign'){
    const p=idRow(d.plans,b.id,id);need(p,'Plan not found',404);
    const l=op==='planAssign'?links(s).find(x=>x.id===b.linkId):null;
    if(op==='planAssign')need(coachLink(s,id,l),'Accepted coaching relationship required',403);
    const owner=l?.member||id;need(own(d.plans,owner).length<100,'Plan limit',429);
    d.plans.push({...structuredClone(p),id:freshId(),owner,author:id,linkId:l?.id||null,revision:1});return;
  }
  const p=d.plans.find(x=>x.id===b.id&&canEditPlan(s,id,x));need(p,'Plan not found',404);
  // A coach cannot infer private diary activity by attempting to change a
  // trainee's logged program items while diary sharing is disabled.
  need(p.owner===id||d.sharing[p.linkId]===true,'Trainee must enable sharing before revising an assigned plan',403);
  if(op==='planUpdate'){
    const weeks=num(b.weeks,1,52,true);need(p.items.every(x=>x.day<=weeks*7)&&Object.keys(p.dayTargets).every(x=>Number(x)<=weeks*7),'Remove later days first');
    const startDate=date(b.startDate);need(startDate===p.startDate||!p.items.some(i=>loggedItem(d,p,i)),'Cannot move a plan with logged meals');
    Object.assign(p,{title:str(b.title,100),startDate,weeks,...targetBody(b),strategy:choose(b.strategy,strategies),...preferences(b)});
  }else if(op==='dayTarget'){
    p.dayTargets[num(b.day,1,dayCount(p),true)]={...targetBody(b),type:choose(b.type,['training','rest','custom'])};
  }else if(op==='planItemAdd'||op==='planItemUpdate'){
    const old=op==='planItemUpdate'?p.items.find(x=>x.id===b.itemId):null;
    if(op==='planItemUpdate')need(old&&!loggedItem(d,p,old),'Program item not found or already logged',409);else need(p.items.length<3000,'Program limit',429);
    need(Boolean(b.recipeId)!==Boolean(b.foodId),'Choose one food or recipe');
    const amount=b.recipeId?logRecipe(s,id,idRow(d.recipes,b.recipeId,id),b.quantity):ingredient(s,id,b);
    const entry={id:old?.id||freshId(),day:num(b.day,1,dayCount(p),true),meal:choose(b.meal,meals),time:str(b.time??'',5,true),note:str(b.note??'',500,true),...amount};
    need(!entry.time||/^([01]\d|2[0-3]):[0-5]\d$/.test(entry.time),'Invalid meal time');
    if(old)Object.assign(old,entry);else p.items.push(entry);
  }else if(op==='planItemSwap'){
    const item=p.items.find(x=>x.id===b.itemId);need(item&&item.source!=='recipe'&&!loggedItem(d,p,item),'Item not available for replacement',409);
    const ref={id:item.foodId,group:item.group||allFoods(s).find(f=>f.id===item.foodId&&readableFood(f,id))?.group};
    const matches=portionAlternatives(allFoods(s).filter(f=>readableFood(f,id)),ref,item.nutrients,planFilters(p));
    const match=matches.find(x=>x.food.id===b.foodId);need(match,'No matching alternative',400);
    Object.assign(item,ingredient(s,id,{foodId:match.food.id,quantity:match.grams,unit:'g'}));
  }else if(op==='planMealSwap'){
    const day=num(b.day,1,dayCount(p),true),meal=choose(b.meal,meals),items=p.items.filter(x=>x.day===day&&x.meal===meal);
    need(items.length&&items.every(i=>!loggedItem(d,p,i)),'Meal empty or already logged',409);
    const match=mealAlternatives(own(d.recipes,id),totals(items),planFilters(p),items.filter(i=>i.source==='recipe').map(i=>i.foodId)).find(x=>x.recipe.id===b.recipeId);
    need(match,'No matching recipe',400);const amount=logRecipe(s,id,match.recipe,match.quantity);
    p.items=p.items.filter(x=>!items.includes(x));p.items.push({id:freshId(),day,meal,time:items[0].time,note:items.map(i=>i.note).filter(Boolean).join(' · ').slice(0,500),...amount});
  }else if(op==='planItemDelete'){
    const i=p.items.findIndex(x=>x.id===b.itemId);need(i>=0&&!loggedItem(d,p,p.items[i]),'Program item not found or already logged',409);p.items.splice(i,1);
  }else if(op==='dayCopy'||op==='mealCopy'){
    const from=num(b.fromDay,1,dayCount(p),true),to=num(b.toDay,1,dayCount(p),true);need(from!==to,'Choose another day');
    const meal=op==='mealCopy'?choose(b.meal,meals):null;
    const items=p.items.filter(x=>x.day===from&&(!meal||x.meal===meal));need(p.items.length+items.length<=3000,'Program limit',429);
    p.items.push(...items.map(x=>({...structuredClone(x),id:freshId(),day:to})));
  }else if(op==='planLog'){
    need(p.owner===id,'Only the trainee can log meals',403);const item=p.items.find(x=>x.id===b.itemId);need(item,'Program item missing',404);
    const logDate=date(b.date);need(dayForDate(p,logDate)===item.day,'Meal date must match the planned day');need(!loggedItem(d,p,item),'Already logged',409);
    need(own(d.logs,id).length<10000,'Diary limit',429);
    d.logs.push({...structuredClone(item),id:freshId(),owner:id,date:logDate,planItemId:item.id,planId:p.id});return;
  }else need(false,'Unknown nutrition operation');
  p.revision++;
}
