// Editable sample schedules, not personalized exercise prescriptions.
const presets = [
  {id:'fullBody',level:'beginner',goal:'general',days:[[1,'body-squat','incline-push-up','db-row'],[3,'glute-bridge','db-shoulder','lat-pulldown'],[5,'step-up','db-bench','cable-row']]},
  {id:'upperLower',level:'intermediate',goal:'strength',days:[[1,'db-bench','cable-row','db-lateral'],[2,'db-goblet','db-rdl','body-calf'],[4,'lat-pulldown','db-shoulder','db-curl'],[5,'leg-press','seated-legcurl','glute-bridge']]},
  {id:'pushPullLegs',level:'intermediate',goal:'hypertrophy',days:[[1,'db-bench','db-shoulder','rope-pushdown'],[3,'lat-pulldown','cable-row','db-curl'],[5,'leg-press','db-rdl','body-calf']]},
  {id:'home',level:'beginner',goal:'general',days:[[1,'body-squat','incline-push-up','bird-dog'],[3,'reverse-lunge','glute-bridge','dead-bug'],[5,'step-up','incline-push-up','plank']]}
];
export const trainingTemplates=presets.map(({id,level,goal,days})=>({id,level,goal,daysPerWeek:days.length,days:days.map(([day,...exercises])=>({day,exercises}))}));
export const templateBlocks=(template,weeks)=>template.days.flatMap(({day,exercises})=>{
  const make=(exerciseId,section,rounds,reps,duration=0)=>({method:'standard',name:'',phase:template.goal==='general'?'base':template.goal,day,weekFrom:1,weekTo:weeks,rounds,rest:section==='work'?60:0,section,items:[{exerciseId,kg:0,reps,rest:0,duration,side:'both',tempo:'',weights:[]}]});
  return [make('march-in-place','warmup',1,1,120),...exercises.map(id=>make(id,'work',2,id==='plank'?1:10,id==='plank'?20:0)),make('child-pose','cooldown',1,1,20)];
});
export const calendarDate=(start,week,day)=>{const date=new Date(start+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+(week-1)*7+day-1);return date.toISOString().slice(0,10)};
export const blocksForDay=(blocks,week,day)=>blocks.filter(b=>b.day===day&&b.weekFrom<=week&&b.weekTo>=week);
