// Local-only module registry. These are navigation previews, not release authorization.
export const modules = [
  {id:'train',icon:'dumbbell',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['workoutPlans','workoutLog','workoutProgress']},
  {id:'trainingPro',icon:'dumbbell',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['exerciseLibrary','trainingBuilder','trainingLive','trainingProgress']},
  {id:'nutrition',icon:'zap',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['mealLog','calories','water']},
  {id:'health',icon:'check',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['healthRecurring','sleep','healthActivity','healthRecovery','measurements','healthReports']},
  {id:'rehab',icon:'shield',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['injuryLog','rehabTimeline','rehabPlanChecklist','rehabContentLibrary','consent']},
  {id:'coaches',icon:'profile',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['coachDirectory','coachPrograms','traineeProgress']},
  {id:'clubs',icon:'social',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['clubDirectory','branches','memberships','staff']},
  {id:'finance',icon:'calendar',roles:['gym','admin'],stage:'prototype',items:['income','expenses','invoices','financeReports']},
  {id:'events',icon:'calendar',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['programParticipants']},
  {id:'campaigns',icon:'flag',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['ramadan','startfit','campaignAdmin']},
  {id:'ramadan',icon:'flag',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['campaignTasks','campaignMyProgress']},
  {id:'startfit',icon:'flag',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['campaignTasks','campaignMyProgress']},
  {id:'library',icon:'bookmark',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['books','guides','libraryFavorites','libraryProgress','contentReview']},
  {id:'masterAdmin',icon:'shield',roles:['admin'],stage:'prototype',items:['audit']},
  {id:'about',icon:'shield',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['aboutMission','aboutIndependence']}
];
export const canOpen = (id,role,production=false) => !production && modules.some(m=>m.id===id&&m.roles.includes(role));
export const allowedModules = (role,production=false) => modules.filter(m=>canOpen(m.id,role,production));
export const filterCoaches = (profiles,selected=[]) => profiles.filter(p=>p.role==='coach'&&(!selected.length||selected.some(l=>(p.spokenLanguages||[p.lang]).includes(l))));
export const samples = {
  train:['sampleSquat','samplePress','sampleRow'],
  health:['sampleWater','sampleWalk','sampleSleep'],
  nutrition:['sampleBreakfast','sampleLunch','sampleDinner']
};
