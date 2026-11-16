// Scheduled for final project QA; do not execute as part of this sprint.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seedFoods,calculateNutrients,sumNutrients,smartTargets,targetValid,planTargetForDate,portionAlternatives,mealAlternatives} from '../dist/core/nutrition-catalog.js';
import {nutritionAction,nutritionView,nutritionExport,clearNutrition} from '../nutrition.mjs';
import {ensureIdentity} from '../identity.mjs';
const day='2026-11-16';
const fixture=()=>{
  const s={profiles:[{id:'athlete',role:'athlete',name:'Athlete'},{id:'coach',role:'coach',verified:true,name:'Coach'},{id:'other',role:'athlete',name:'Other'},{id:'admin',role:'admin',name:'Admin'}],blocks:[],wellness:{enabled:['athlete','coach','other'],records:[]},coaching:{links:[{id:'link',coach:'coach',member:'athlete',status:'active'}]}};
  ensureIdentity(s);s.identity.active.coach='personal:coach';return s;
};
const action=(s,user,operation,params={})=>nutritionAction(s,user,{operation,...params});
const template={title:'Local fixture',startDate:day,weeks:4,goal:'maintenance',kcal:2000,protein:100,carbs:250,fat:60,notes:'',strategy:'flexible'};
test('500 translated foods, approved portions and nullable values',()=>{
  assert.equal(seedFoods.length,500);
  assert.equal(new Set(seedFoods.map(f=>f.id)).size,500);
  assert.deepEqual(Object.fromEntries(['basic','arabic','swedish','european','global'].map(c=>[c,seedFoods.filter(f=>f.cuisine===c).length])),{basic:200,arabic:100,swedish:75,european:75,global:50});
  assert(seedFoods.every(f=>f.names.ar&&f.names.en&&f.names.sv));
  assert(seedFoods.filter(f=>f.status==='ready').length>=318);
  assert(seedFoods.filter(f=>f.status==='ready').every(f=>f.nutrients.sugar===null||f.nutrients.sugar<=f.nutrients.carbs));
  assert.equal(seedFoods.find(f=>f.id==='food-basic-143').nutrients.carbs,3.6);
  assert.equal(seedFoods.find(f=>f.id==='food-basic-69').nutrients.carbs,52.3);
  assert(seedFoods.filter(f=>f.status==='ready').every(f=>f.source&&f.preparation&&['kcal','protein','carbs','fat'].every(k=>Number.isFinite(f.nutrients[k])&&f.nutrients[k]>=0)));
  const banana=seedFoods.find(f=>f.names.en==='Banana');
  assert.equal(calculateNutrients(banana,2,'serving').grams,210);
  assert.equal(calculateNutrients(banana,100,'g').nutrients.kcal,95);
  assert.equal(calculateNutrients(banana,1,'cup'),null);
  assert.equal(calculateNutrients(seedFoods.find(f=>f.status==='draft'),100,'g'),null);
  assert.equal(sumNutrients([{...calculateNutrients(banana,100,'g').nutrients,sugar:null}]).sugar,null);
});
test('private diary, source snapshots, coach assignment and revocation',()=>{
  const s=fixture(),banana=seedFoods.find(f=>f.names.en==='Banana');
  action(s,'coach','planCreate',template);
  const plan=nutritionView(s,'coach').plans[0];
  action(s,'coach','planItemAdd',{id:plan.id,day:2,meal:'breakfast',foodId:banana.id,quantity:1,unit:'serving'});
  action(s,'coach','planAssign',{id:plan.id,linkId:'link'});
  const assigned=nutritionView(s,'athlete').plans[0];
  assert.equal(assigned.items.length,1);assert.equal(nutritionView(s,'other').plans.length,0);
  assert.throws(()=>action(s,'athlete','planLog',{id:assigned.id,itemId:assigned.items[0].id,date:day}));
  action(s,'athlete','planActivate',{id:assigned.id});
  action(s,'athlete','planLog',{id:assigned.id,itemId:assigned.items[0].id,date:'2026-11-17'});
  assert.equal(nutritionView(s,'coach').shared.length,0);
  action(s,'athlete','share',{linkId:'link',enabled:true});
  assert.equal(nutritionView(s,'coach').shared[0].logs.length,1);
  assert.equal(nutritionView(s,'coach').shared[0].weekly.length,7);
  s.coaching.links[0].status='ended';
  assert.equal(nutritionView(s,'coach').shared.length,0);
  assert(!nutritionView(s,'coach').plans.some(x=>x.id===assigned.id));
  assert.equal(nutritionExport(s,'athlete').logs.length,1);
  clearNutrition(s,'athlete');assert.equal(nutritionView(s,'athlete').logs.length,0);
});
test('smart targets are bounded and explicitly eligible; Ramadan preserves selected goal',()=>{
  const inputs={weight:80,height:180,age:35,sex:'male',factor:1.6,proteinRate:1.6,fatPercent:30,eligible:true};
  for(const [goal,adjustment] of [['loss',-10],['gain',5],['maintenance',0],['recomposition',-5]]){
    const result=smartTargets({...inputs,goal,adjustment});assert(result&&targetValid(result));
  }
  assert.equal(smartTargets({...inputs,goal:'loss',adjustment:-50}),null);
  assert.equal(smartTargets({...inputs,goal:'loss',adjustment:-10,eligible:false}),null);
  assert.equal(smartTargets({...inputs,goal:'loss',adjustment:-10,weight:50}),null);
  const s=fixture();action(s,'athlete','planTemplate',{...template,template:'ramadan',goal:'gain'});
  const plan=nutritionView(s,'athlete').plans[0];assert.equal(plan.strategy,'ramadan');assert.equal(plan.goal,'gain');
  action(s,'athlete','dayTarget',{...template,id:plan.id,day:2,type:'training',waterMl:2000});
  assert.equal(planTargetForDate(nutritionView(s,'athlete').plans[0],'2026-11-17').waterMl,2000);
  assert.throws(()=>action(s,'other','planActivate',{id:plan.id}));
  assert.throws(()=>action(s,'athlete','goal',{...template,kcal:100}));
});
test('portion and meal alternatives are approximate and disabled for allergies',()=>{
  const banana=seedFoods.find(f=>f.names.en==='Banana'),ref=calculateNutrients(banana,100,'g').nutrients;
  const candidates=portionAlternatives(seedFoods,banana,ref);assert(candidates.length);
  assert(candidates.every(x=>Math.abs(x.nutrients.kcal-ref.kcal)<=5));
  assert.deepEqual(portionAlternatives(seedFoods,banana,ref,{allergies:'peanut'}),[]);
  const recipe={id:'fixture',servings:2,nutrients:ref,items:[banana]};
  assert.equal(mealAlternatives([recipe],ref)[0].quantity,2);
  assert.deepEqual(mealAlternatives([recipe],ref,{allergies:'milk'}),[]);
});
test('only administrators import public data; user portions require supplied weights',()=>{
  const s=fixture();const food={names:{en:'Fixture food',ar:'طعام تجريبي',sv:'Testmat'},cuisine:'basic',group:'grains',status:'ready',nutrients:{kcal:100,protein:3,carbs:20,fat:1},portions:{cup:150},source:'Local fictional fixture'};
  assert.throws(()=>action(s,'athlete','foodImport',{rows:[food]}));
  action(s,'admin','foodImport',{rows:[food]});
  const row=nutritionView(s,'athlete').foods.find(f=>f.names.en==='Fixture food');
  action(s,'athlete','logAdd',{date:day,meal:'breakfast',foodId:row.id,quantity:1.5,unit:'cup'});
  assert.equal(nutritionView(s,'athlete').logs[0].grams,225);
  assert.throws(()=>action(s,'other','logDelete',{id:nutritionView(s,'athlete').logs[0].id}));
});
