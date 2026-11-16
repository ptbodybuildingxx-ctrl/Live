// Local dashboard projections. Derive scope exclusively from the server identity view.
export function dashboardFlags(production, options={}) {
  const smartDashboard=!production&&options.smartDashboard!==false;
  return {smartDashboard, dashboardMetrics:smartDashboard&&options.dashboardMetrics!==false};
}

export function dashboardView(s,id,identity,flags,coaching,clubOps) {
  if(!flags.smartDashboard||!identity?.active)return undefined;
  const {active,permissions,club,roster,invitations,reportList,platformAssignments}=identity;
  const has=p=>permissions.includes(p), metrics=[], actions=[];
  const metric=(key,value)=>{if(flags.dashboardMetrics)metrics.push({key,value})};
  const link=(key,target,planned=false)=>actions.push({key,target,planned});
  const personal=!active.clubId&&has('personal.read');
  if(personal){
    metric('xp',s.profiles.find(p=>p.id===id)?.xp??0);
    metric('dashboardJoinedChallenges',s.challenges.filter(c=>Object.hasOwn(c.members,id)).length);
    metric('dashboardUpcomingSessions',s.sessions.filter(x=>x.at>Date.now()&&(x.owner===id||x.participants.includes(id))).length);
    link('train','train');link('nutrition','nutrition');link('health','health');
    if(active.role==='member')link('coachingManagement','coaches');
  }
  if(has('coach.programs')){const planned=!!active.clubId||s.profiles.find(p=>p.id===id)?.verified!==true;link('coachPrograms','coaches',planned);link('traineeProgress','coaches',planned)}
  if(coaching)metric('coachingIncoming',coaching.links.filter(l=>l.status==='pending'&&l.incoming).length);
  if(active.clubId&&has('club.read')){
    link('dashboardClubContext','identity');link('clubs','clubs');link('clubChatTitle','chat');
    if(has('club.roster'))metric('dashboardClubAccounts',new Set(roster.map(g=>g.userId)).size);
    if(has('club.assign')){
      metric('dashboardPendingInvites',invitations.filter(v=>v.clubId===active.clubId&&v.status==='pending').length);
      link('identityInvite','identity');
    }
    if(has('club.manage')){link('staff','clubs');if(clubOps)metric('clubActiveMemberships',clubOps.memberships.filter(m=>m.status==='active').length)}
    if(has('club.finance.read')){link('finance','finance');if(clubOps?.finance)metric('clubOpenInvoices',clubOps.finance.invoices.filter(i=>i.status==='issued').length)}
  }
  if(has('platform.moderate')){metric('dashboardPendingReports',reportList.length);link('reports','identity')}
  if(has('platform.admin')){
    metric('users',s.profiles.length);link('dashboardPlatformAdmin','admin');
  }
  if(has('platform.assign')){metric('identityAssignments',platformAssignments.length);link('identityAssignments','identity')}
  return {contextKey:active.key,role:active.role,club:club?{id:club.id,name:club.name}:null,metrics,actions,metricsEnabled:flags.dashboardMetrics};
}
