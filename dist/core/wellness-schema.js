// Shared definitions; the server validates every field independently of the UI.
const text=(key,max)=>({key,type:'text',max});
const number=(key,min,max,step=1)=>({key,type:'number',min,max,step});
const date={key:'recordDate',type:'date'};
export const wellnessKinds=Object.freeze({
  plan:{module:'train',label:'workoutPlans',fields:[text('recordTitle',80),{key:'recordExercises',type:'lines',max:120,limit:20}]},
  workout:{module:'train',label:'workoutLog',fields:[date,text('recordExercise',80),number('recordSets',1,50),number('recordReps',1,500),number('recordWeight',0,1000,0.1)]},
  meal:{module:'nutrition',label:'mealLog',fields:[date,{key:'recordMeal',type:'select',options:['recordBreakfast','recordLunch','recordDinner','recordSnack']},text('recordFood',120),number('recordCalories',0,10000)]},
  water:{module:'nutrition',label:'water',fields:[date,number('recordMl',1,10000)]},
  habit:{module:'health',label:'habits',fields:[date,text('recordHabit',80),{key:'recordComplete',type:'boolean'}]},
  sleep:{module:'health',label:'sleep',fields:[date,number('recordHours',0,24,0.1)]},
  measurement:{module:'health',label:'measurements',fields:[date,number('recordWeight',1,1000,0.1)]}
});
export const wellnessModules=['train','nutrition','health'];
export const kindsFor=module=>Object.keys(wellnessKinds).filter(k=>wellnessKinds[k].module===module);
