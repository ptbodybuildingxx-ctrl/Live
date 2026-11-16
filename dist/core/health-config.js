// These are input validation boundaries, not recommended or default targets.
export const healthGoalFields=Object.freeze([
  {key:'steps',label:'healthSteps',min:1,max:200000,step:1,unit:''},
  {key:'activeMinutes',label:'healthMoveMinutes',min:1,max:1440,step:1,unit:'min'},
  {key:'sleepHours',label:'healthGoalSleep',min:0.1,max:24,step:0.1,unit:'h'},
  {key:'weightKg',label:'healthGoalWeight',min:1,max:1000,step:0.1,unit:'kg'},
  {key:'habitRate',label:'healthGoalCompletion',min:1,max:100,step:1,unit:'%'}
]);

// No prescribed duration, intensity, goal or reminder. Users choose the schedule.
export const healthHabitTemplates=Object.freeze([
  {id:'walk',label:'healthTemplateWalk',group:'healthTemplateMovement'},
  {id:'stretch',label:'healthTemplateStretch',group:'healthTemplateMovement'},
  {id:'break',label:'healthTemplateBreak',group:'healthTemplateMovement'},
  {id:'training',label:'healthTemplateTraining',group:'healthTemplateMovement'},
  {id:'water',label:'healthTemplateWater',group:'healthTemplateNutrition'},
  {id:'meals',label:'healthTemplateMeals',group:'healthTemplateNutrition'},
  {id:'mealPrep',label:'healthTemplateMealPrep',group:'healthTemplateNutrition'},
  {id:'sleep',label:'healthTemplateSleep',group:'healthTemplateRecovery'},
  {id:'bedtime',label:'healthTemplateBedtime',group:'healthTemplateRecovery'},
  {id:'rest',label:'healthTemplateRest',group:'healthTemplateRecovery'},
  {id:'journal',label:'healthTemplateJournal',group:'healthTemplateRoutine'},
  {id:'plan',label:'healthTemplatePlan',group:'healthTemplateRoutine'}
]);
