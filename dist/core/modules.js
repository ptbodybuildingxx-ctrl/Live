// Local-only module registry. These are navigation previews, not release authorization.
export const modules = [
  {id:'train',icon:'dumbbell',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['workoutPlans','workoutLog','workoutProgress']},
  {id:'nutrition',icon:'zap',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['mealLog','calories','water']},
  {id:'health',icon:'check',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['habits','sleep','measurements']},
  {id:'rehab',icon:'shield',roles:['athlete','coach','gym','admin'],stage:'planned',items:['injuryLog','rehabPlans','consent']},
  {id:'coaches',icon:'profile',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['coachDirectory','coachPrograms','traineeProgress']},
  {id:'clubs',icon:'social',roles:['athlete','coach','gym','admin'],stage:'prototype',items:['clubDirectory','branches','memberships','staff']},
  {id:'finance',icon:'calendar',roles:['gym','admin'],stage:'prototype',items:['income','expenses','invoices','financeReports']},
  {id:'campaigns',icon:'flag',roles:['athlete','coach','gym','admin'],stage:'planned',items:['ramadan','startfit','campaignAdmin']},
  {id:'library',icon:'bookmark',roles:['athlete','coach','gym','admin'],stage:'planned',items:['books','guides','contentReview']},
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
