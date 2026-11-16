const dayShift=(d,n)=>{const x=new Date(d+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)};
const localDay=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const localClock=d=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
export const isHabitScheduled=(habit,date)=>{const p=habit.schedule?.findLast(v=>v.date<=date);return date>=habit.startDate&&(p?p.active&&p.days.includes(new Date(date+'T00:00:00Z').getUTCDay()):!habit.schedule&&(!habit.archivedDate||date<habit.archivedDate)&&habit.days.includes(new Date(date+'T00:00:00Z').getUTCDay()))};

// No browser notifications or background tracking. Reminders are computed from the user's
// private server projection and this device's local clock whenever the app renders.
export function healthDueReminders(health,now=new Date()){
  if(!health)return [];
  const date=localDay(now),clock=localClock(now),completed=new Set(health.checks.filter(x=>x.date===date&&x.completed).map(x=>x.habitId));
  return health.habits.filter(x=>x.reminder&&x.reminder<=clock&&!x.archivedDate&&isHabitScheduled(x,date)&&!completed.has(x.id)).sort((a,b)=>a.reminder.localeCompare(b.reminder));
}
export function healthReminderBanner({state,t,h,btn,now=new Date()}){
  if(!state?.wellness?.enabled)return '';
  const due=healthDueReminders(state.wellness.health,now);
  return due.length?`<section class="card row space wrap health-reminder" role="status"><div class="grow"><b>${h(t('healthDueReminders'))} · ${due.length}</b><small>${h(t('healthReminderOpen'))}</small></div>${btn(t('health'),'nav','data-id="health"','secondary','check')}</section>`:'';
}

// Retain missing days as null; measured zero remains distinguishable from unlogged data.
export function healthSeries(records,kind,key,today,days=30){
  const start=dayShift(today,1-days),latest=new Map();
  for(const r of records){const date=r.data.recordDate;if(r.kind!==kind||date<start||date>today||!Number.isFinite(r.data[key]))continue;const old=latest.get(date);if(!old||(r.updatedAt??0)>(old.updatedAt??0))latest.set(date,r)}
  return Array.from({length:days},(_,i)=>{const date=dayShift(start,i);return {date,value:latest.get(date)?.data[key]??null}});
}

const format=v=>String(Math.round(v*100)/100);
export function healthTrendChart({series,title,unit,t,h}){
  const valid=series.filter(x=>x.value!==null);
  if(!valid.length)return `<section class="card stack"><h3>${h(title)}</h3><p class="empty">${h(t('healthNoChartData'))}</p></section>`;
  const vs=valid.map(x=>x.value),low=Math.min(...vs),high=Math.max(...vs),margin=low===high?Math.max(Math.abs(low)*0.05,0.1):0;
  const min=Math.max(0,low-margin),max=high+margin||1,span=max-min||1,w=420,height=146,x0=57,x1=408,y0=15,y1=112;
  const x=i=>x0+(x1-x0)*i/Math.max(1,series.length-1),y=v=>y1-(v-min)*(y1-y0)/span;
  const ticks=[0,.5,1].map(f=>{const v=min+span*f,py=y(v);return `<line x1="${x0}" x2="${x1}" y1="${py}" y2="${py}" class="health-chart-grid"/><text x="${x0-5}" y="${py+4}" text-anchor="end">${format(v)}</text>`}).join('');
  const marks=series.map((p,i)=>p.value===null?'':`${i&&series[i-1].value!==null?`<line class="health-chart-line" x1="${x(i-1)}" y1="${y(series[i-1].value)}" x2="${x(i)}" y2="${y(p.value)}"/>`:''}<circle class="health-chart-dot" cx="${x(i)}" cy="${y(p.value)}" r="3.25"><title>${h(p.date)}: ${h(p.value)} ${h(unit)}</title></circle>`).join('');
  const table=`<details data-disclosure-key="health:chart-data:${h(title)}"><summary>${h(t('healthChartData'))}</summary><div class="stack">${valid.map(p=>`<div class="row space"><time datetime="${h(p.date)}" dir="ltr">${h(p.date)}</time><b>${h(p.value)} ${h(unit)}</b></div>`).join('')}</div></details>`;
  return `<section class="card stack health-chart"><div class="row space wrap"><h3>${h(title)}</h3><small>${valid.length} / ${series.length} ${h(t('healthRecordedDays'))}</small></div><svg class="health-chart-svg" viewBox="0 0 ${w} ${height}" role="img" aria-label="${h(title)} (${h(unit)})" dir="ltr">${ticks}${marks}<text x="${x0}" y="135" text-anchor="start">${h(series[0].date.slice(5))}</text><text x="${x1}" y="135" text-anchor="end">${h(series.at(-1).date.slice(5))}</text></svg>${table}</section>`;
}
