import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readReleaseConfig } from './release.mjs';
import {ensureIdentity,identityView,identityAction,identityExport,removeIdentity,can} from './identity.mjs';
import {dashboardFlags,dashboardView} from './dashboard.mjs';
import {wellnessView,wellnessAction,wellnessExport,removeWellness} from './wellness.mjs';
import {coachingView,coachingAction,coachingExport,removeCoaching,revokeCoachingPair,disableWorkoutSharing} from './coaching.mjs';
import {clubOpsView,clubOpsAction,clubOpsExport,removeClubOps,revokeMembership} from './club-ops.mjs';
import {clubChatView,clubChatAction,clubChatExport,removeClubChat,revokeClubChatGrant,cancelClubChatPairInvites,reportPrivateMessage} from './club-chat.mjs';
import {programsView,programsAction,programsExport,removePrograms,clearRehab,revokeProgramGrant} from './programs.mjs';
import {trainingView,trainingAction,trainingExport,removeTraining,clearTraining,trainingMediaRow,trainingAttachMedia} from './training.mjs';
import {nutritionView,nutritionAction,nutritionExport,clearNutrition} from './nutrition.mjs';
import {libraryFileRow,libraryAttachFile,libraryFileAudit} from './library.mjs';
import {libraryPdfLimit,libraryTotalPdfLimit} from './dist/core/library-schema.js';

const root = dirname(fileURLToPath(import.meta.url));
const uuid = randomUUID;
const now = () => Date.now();
const DAY = 86400000;
const clean = (v, max=500) => String(v ?? '').trim().slice(0,max);
const roles = ['athlete','coach','gym'];
const languages = ['ar','en','sv'];
const hash = (pass,salt) => scryptSync(pass,salt,64).toString('hex');
const digest = value => createHash('sha256').update(value).digest('hex');
const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const publicPrivacy = () => ({profile:'everyone',posts:'followers',messages:'followers',stories:'followers',presence:false,match:false,notifications:true});
const POLICY_VERSION = '1.0-rc';
const defaultPrivacy = () => ({profile:'everyone',posts:'everyone',messages:'everyone',stories:'everyone',presence:true,match:true,notifications:true});
const sample = [
  {id:'demo-athlete',name:'Omar Fitness',email:'athlete@demo.local',role:'athlete',city:'Kalmar',sport:'Strength',goal:'Build muscle',level:'Intermediate',lang:'ar',bio:'Never train alone. 💪',color:'#39FF88',xp:1250},
  {id:'demo-coach',name:'Coach Adam',email:'coach@demo.local',role:'coach',city:'Kalmar',sport:'Strength',goal:'Build muscle',level:'Advanced',lang:'en',bio:'Strength & conditioning.',color:'#F2C94C',xp:5200,verified:true},
  {id:'demo-gym',name:'Iron Gym',email:'gym@demo.local',role:'gym',city:'Kalmar',sport:'Strength',goal:'General fitness',level:'All levels',lang:'sv',bio:'A community that grows stronger together.',color:'#22D3EE',xp:0,verified:true},
  {id:'demo-sara',name:'Sara Lift',email:'sara@demo.local',role:'athlete',city:'Kalmar',sport:'HIIT',goal:'General fitness',level:'Intermediate',lang:'sv',bio:'One step at a time.',color:'#818CF8',xp:650},
  {id:'demo-admin',name:'MUSCLIVO Admin',email:'admin@demo.local',role:'admin',city:'',sport:'',goal:'',level:'',lang:'en',bio:'Local administrator',color:'#39FF88',xp:0}
];
function makeState(){
  return {
    profiles: sample.map(p=>({...p,privacy:defaultPrivacy(),status:p.role==='admin'?'offline':'ready',lastActive:now(),joined:now()})),
    posts:[
      {id:'post-1',owner:'demo-coach',text:'Push day complete! 💪 Small steps make big progress.',type:'workout',image:'',at:now()-1200000,likes:['demo-sara'],comments:[{id:uuid(),owner:'demo-sara',text:'Let’s go! 🔥',at:now()-60000}]},
      {id:'post-2',owner:'demo-gym',text:'Community strength session today at 18:00. Everyone is welcome!',type:'checkin',image:'',at:now()-3600000,likes:['demo-athlete'],comments:[]},
      {id:'post-3',owner:'demo-sara',text:'New personal record today. Consistency is everything. 🏆',type:'record',image:'',at:now()-8400000,likes:[],comments:[]}
    ],
    stories:[{id:'story-1',owner:'demo-coach',text:'Ready for today’s workout!',image:'',at:now()-600000}],
    follows:[{from:'demo-athlete',to:'demo-coach'}],saved:[],blocks:[],reports:[],requests:[],
    conversations:[{id:'chat-1',name:'',members:['demo-athlete','demo-coach'],messages:[{id:uuid(),owner:'demo-coach',text:'Ready for today’s workout? 💪',at:now()-300000}]}],
    sessions:[{id:'session-1',owner:'demo-coach',title:'Full Body Workout',sport:'Strength',at:now()+3600000,participants:[]},{id:'session-2',owner:'demo-gym',title:'Community Strength',sport:'Strength',at:now()+7200000,participants:[]}],
    challenges:[{id:'challenge-1',owner:'demo-gym',title:'7 Day Consistency',days:7,members:{}},{id:'challenge-2',owner:'demo-coach',title:'30 Day Movement',days:30,members:{}}],
    notifications:[],verifications:[],audit:[]
  };
}
function emptyState(){
  return Object.fromEntries(Object.keys(makeState()).map(key=>[key,[]]));
}
const bad=(message,status=400)=>Object.assign(new Error(message),{status});
const assert=(yes,msg='Not allowed',status=403)=>{if(!yes)throw bad(msg,status)};
const profile=(s,id)=>s.profiles.find(p=>p.id===id);
const blocked=(s,a,b)=>s.blocks.some(x=>(x.from===a&&x.to===b)||(x.from===b&&x.to===a));
const follows=(s,a,b)=>s.follows.some(x=>x.from===a&&x.to===b);
function visible(s,owner,viewer,kind){
  if(owner===viewer)return true;
  if(blocked(s,owner,viewer))return false;
  const p=profile(s,owner); if(!p||p.suspended||p.emailVerified===false)return false;
  const rule=p.privacy[kind];return rule==='everyone'||(rule==='followers'&&follows(s,viewer,owner));
}
const notify=(s,owner,text,actor)=>{if(owner!==actor&&profile(s,owner)?.privacy.notifications)s.notifications.unshift({id:uuid(),owner,text,actor,at:now(),read:false})};
const safeProfile=(s,p,viewer)=>{const {email,privacy,emailVerified,policyVersion,policyAcceptedAt,...v}=p;return {...v,lastActive:undefined,status:p.id===viewer||(p.privacy.presence&&p.lastActive>now()-30*60000)?p.status:'offline',matchable:p.privacy.match&&p.privacy.presence,privacy:p.id===viewer?privacy:undefined,emailVerified:p.id===viewer?emailVerified:undefined}};
const media=(x)=>{const m=String(x||'');assert(!m||(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(m)&&m.length<400000),'Image too large or invalid',400);return m};
function snapshot(s,id,flags){
  const identity=identityView(s,id);
  const wellness=wellnessView(s,id);
  const coaching=coachingView(s,id);
  const clubOps=clubOpsView(s,id);
  const clubChat=clubChatView(s,id);
  const programs=programsView(s,id);
  const training=trainingView(s,id);
  const nutrition=s.identity?nutritionView(s,id):undefined;
  const me=profile(s,id);
  const profiles=s.profiles.filter(p=>p.role!=='admin'&&visible(s,p.id,id,'profile')).map(p=>safeProfile(s,p,id));
  const posts=s.posts.filter(p=>visible(s,p.owner,id,'posts')).slice(0,50).map(p=>({...p,comments:p.comments.filter(c=>!blocked(s,c.owner,id)).slice(-100)}));
  return {me:{...safeProfile(s,me,id),email:me.email},profiles,posts,
    ...(identity?{identity}:{}),
    ...(wellness?{wellness}:{}),
    ...(coaching?{coaching}:{}),
    ...(clubOps?{clubOps}:{}),
    ...(clubChat?{clubChat}:{}),
    ...(programs?{programs}:{}),
    ...(training?{training}:{}),
    ...(nutrition?{nutrition}:{}),
    ...(flags.smartDashboard&&identity?.active?{dashboard:dashboardView(s,id,identity,flags,coaching,clubOps)}:{}),
    stories:s.stories.filter(x=>x.at>now()-DAY&&visible(s,x.owner,id,'stories')),
    follows:s.follows.filter(x=>x.from===id||x.to===id),saved:s.saved.filter(x=>x.owner===id),
    blocks:s.blocks.filter(x=>x.from===id),requests:s.requests.filter(x=>x.from===id||x.to===id).slice(0,100),
    followRequests:(s.followRequests||[]).filter(x=>x.from===id||x.to===id),
    conversations:s.conversations.filter(c=>c.members.includes(id)).map(c=>({...c,messages:c.messages.filter(m=>!blocked(s,m.owner,id)).slice(-100)})),
    sessions:s.sessions.filter(x=>visible(s,x.owner,id,'profile')),
    challenges:s.challenges.filter(x=>visible(s,x.owner,id,'profile')),
    notifications:s.notifications.filter(n=>n.owner===id&&!blocked(s,n.actor??id,id)).slice(0,100),
    verifications:s.verifications.filter(x=>x.owner===id),
    ...(me.role==='admin'?{admin:{profiles:s.profiles.map(p=>({id:p.id,name:p.name,role:p.role,suspended:!!p.suspended,verified:!!p.verified,lastActive:p.lastActive})),reports:s.reports,verifications:s.verifications,audit:s.audit.slice(0,100),posts:s.posts.map(p=>({id:p.id,owner:p.owner,text:p.text}))}}:{})
  };
}
function action(s,id,b){
  const me=profile(s,id), t=b.type, p=s.posts.find(x=>x.id===b.id), other=profile(s,b.target);
  const canPost=()=>assert(p&&visible(s,p.owner,id,'posts'),'Post not found',404);
  const validTarget=()=>assert(other&&other.id!==id&&visible(s,other.id,id,'profile'),'Account unavailable',404);
  const toggle=(arr,find,create)=>{const i=arr.findIndex(find);if(i>=0)arr.splice(i,1);else arr.push(create)};
  switch(t){
    case 'training':{assert(s.identity,'Local training unavailable',404);trainingAction(s,id,b);break;}
    case 'nutrition':{assert(s.identity,'Local nutrition unavailable',404);nutritionAction(s,id,b);break;}
    case 'programs':{assert(s.identity,'Local programs unavailable',404);programsAction(s,id,b);break;}
    case 'clubChat':{assert(s.identity,'Local club chat unavailable',404);clubChatAction(s,id,b);break;}
    case 'chatReport':{assert(s.identity,'Local chat reporting unavailable',404);reportPrivateMessage(s,id,b);break;}
    case 'clubOps':{
      assert(s.identity,'Local club operations unavailable',404);clubOpsAction(s,id,b);break;
    }
    case 'coaching':{
      assert(s.identity,'Local coaching unavailable',404);
      if(b.operation==='invite')validTarget();
      coachingAction(s,id,b);break;
    }
    case 'wellness':{
      assert(s.identity,'Local personal records unavailable',404);
      wellnessAction(s,id,b);if(b.operation==='clear'){disableWorkoutSharing(s,id);clearRehab(s,id);clearTraining(s,id);clearNutrition(s,id)}break;
    }
    case 'identity':{
      assert(s.identity,'Local identity module unavailable',404);
      if(b.operation==='invite')assert(visible(s,b.target,id,'profile'),'Account unavailable',404);
      const revoked=b.operation==='revoke'?s.identity.grants.find(g=>g.id===b.id):null;
      identityAction(s,id,b);if(revoked?.role==='member'&&revoked.clubId)revokeMembership(s,revoked.clubId,revoked.userId,id);if(revoked?.clubId){revokeClubChatGrant(s,revoked.clubId,revoked.userId);revokeProgramGrant(s,revoked.clubId,revoked.userId)}break;
    }
    case 'profile': {
      for(const key of ['name','city','sport','goal','level','bio'])if(b[key]!==undefined)me[key]=clean(b[key],key==='bio'?280:60);
      assert(me.name,'Name required',400);
      if(b.spokenLanguages!==undefined){assert(me.role==='coach'&&Array.isArray(b.spokenLanguages)&&b.spokenLanguages.length<=3&&b.spokenLanguages.every(l=>languages.includes(l)),'Invalid spoken languages',400);me.spokenLanguages=[...new Set(b.spokenLanguages)];if(!me.spokenLanguages.length)me.spokenLanguages=[me.lang];}break;
    }
    case 'settings':{
      if(languages.includes(b.lang))me.lang=b.lang;
      if(['light','dark'].includes(b.theme))me.theme=b.theme;
      for(const k of ['profile','posts','messages','stories'])if(['everyone','followers','private'].includes(b[k]))me.privacy[k]=b[k];
      for(const k of ['presence','match','notifications'])if(typeof b[k]==='boolean')me.privacy[k]=b[k];break;
    }
    case 'status': assert(['ready','training','offline'].includes(b.status),'Invalid status',400);me.status=b.status;break;
    case 'post':{
      assert(clean(b.text)||b.image,'Empty post',400);assert(s.posts.filter(p=>p.owner===id&&p.at>now()-DAY).length<20,'Daily post limit',429);
      s.posts.unshift({id:uuid(),owner:id,text:clean(b.text,1500),image:media(b.image),type:['workout','record','checkin','text'].includes(b.kind)?b.kind:'text',at:now(),likes:[],comments:[]});break;
    }
    case 'deletePost': assert(p&&(p.owner===id||me.role==='admin'));s.posts=s.posts.filter(x=>x.id!==p.id);s.saved=s.saved.filter(x=>x.post!==p.id);if(me.role==='admin')s.audit.unshift({at:now(),actor:id,operation:'deletePost',target:p.id});break;
    case 'like':canPost();toggle(p.likes,x=>x===id,id);if(p.likes.includes(id))notify(s,p.owner,'like',id);break;
    case 'save':canPost();toggle(s.saved,x=>x.owner===id&&x.post===p.id,{owner:id,post:p.id});break;
    case 'comment':canPost();assert(clean(b.text),'Empty comment',400);p.comments.push({id:uuid(),owner:id,text:clean(b.text,500),at:now()});notify(s,p.owner,'comment',id);break;
    case 'story':assert(clean(b.text)||b.image,'Empty story',400);assert(s.stories.filter(x=>x.owner===id&&x.at>now()-DAY).length<3,'Story limit',429);s.stories.push({id:uuid(),owner:id,text:clean(b.text,280),image:media(b.image),at:now()});break;
    case 'follow': {
      validTarget();s.followRequests??=[];
      if(follows(s,id,other.id)){s.follows=s.follows.filter(x=>!(x.from===id&&x.to===other.id));break}
      const waiting=s.followRequests.find(x=>x.from===id&&x.to===other.id);
      if(waiting){s.followRequests=s.followRequests.filter(x=>x.id!==waiting.id);break}
      if(Object.values(other.privacy).includes('followers')){s.followRequests.unshift({id:uuid(),from:id,to:other.id,at:now()});notify(s,other.id,'followRequest',id)}
      else{s.follows.push({from:id,to:other.id});notify(s,other.id,'follow',id)}
      break;
    }
    case 'respondFollow': {const r=(s.followRequests||[]).find(x=>x.id===b.id);assert(r&&r.to===id&&!blocked(s,id,r.from));s.followRequests=s.followRequests.filter(x=>x.id!==r.id);if(b.accept===true){s.follows.push({from:r.from,to:id});notify(s,r.from,'accepted',id)}break}
    case 'block':assert(other&&other.id!==id);if(b.blocked===true){if(!s.blocks.some(x=>x.from===id&&x.to===other.id))s.blocks.push({from:id,to:other.id})}else if(b.blocked===false)s.blocks=s.blocks.filter(x=>x.from!==id||x.to!==other.id);else toggle(s.blocks,x=>x.from===id&&x.to===other.id,{from:id,to:other.id});revokeCoachingPair(s,id,other.id);cancelClubChatPairInvites(s,id,other.id);s.follows=s.follows.filter(x=>!((x.from===id&&x.to===other.id)||(x.from===other.id&&x.to===id)));s.followRequests=(s.followRequests||[]).filter(x=>!((x.from===id&&x.to===other.id)||(x.from===other.id&&x.to===id)));break;
    case 'request':{
      validTarget();assert(other.privacy.match&&other.privacy.presence&&other.status==='ready'&&other.lastActive>now()-30*60000,'Not currently available');assert(!s.requests.some(x=>x.from===id&&x.to===other.id&&x.state==='pending'),'Already requested',409);
      s.requests.unshift({id:uuid(),from:id,to:other.id,sport:clean(b.sport,60),state:'pending',at:now()});notify(s,other.id,'request',id);break;
    }
    case 'respond':{
      const r=s.requests.find(x=>x.id===b.id);assert(r&&r.to===id&&r.state==='pending'&&!blocked(s,id,r.from));r.state=b.accept===true?'accepted':'declined';
      if(b.accept===true&&!s.conversations.some(c=>c.members.length===2&&c.members.includes(id)&&c.members.includes(r.from)))s.conversations.push({id:uuid(),name:'',members:[id,r.from],messages:[]});
      notify(s,r.from,r.state,id);break;
    }
    case 'conversation':{
      const ids=[...new Set([id,...(Array.isArray(b.members)?b.members:[])])];assert(ids.length>1&&ids.length<=12,'Invalid participants',400);
      assert(ids.filter(x=>x!==id).every(x=>visible(s,x,id,'messages')),'Messaging restricted');
      if(ids.length===2&&s.conversations.some(c=>c.members.length===2&&ids.every(x=>c.members.includes(x))))break;
      s.conversations.push({id:uuid(),name:clean(b.name,60),members:ids,messages:[]});break;
    }
    case 'message':{
      const c=s.conversations.find(x=>x.id===b.id);assert(c&&c.members.includes(id));assert(c.members.every(x=>!blocked(s,id,x)&&!profile(s,x)?.suspended),'Blocked');assert(clean(b.text),'Empty message',400);assert(c.messages.length<10000,'Conversation limit',429);
      c.messages.push({id:uuid(),owner:id,text:clean(b.text,1000),at:now()});c.members.forEach(x=>notify(s,x,'message',id));break;
    }
    case 'session':assert(['coach','gym'].includes(me.role)&&me.verified,'Verification required');assert(clean(b.title)&&Number.isFinite(Number(b.at))&&Number(b.at)>now(),'Invalid session',400);s.sessions.push({id:uuid(),owner:id,title:clean(b.title,80),sport:clean(b.sport,60),at:Number(b.at),participants:[]});break;
    case 'joinSession':{const x=s.sessions.find(x=>x.id===b.id);assert(x&&visible(s,x.owner,id,'profile')&&x.at>now());toggle(x.participants,a=>a===id,id);break;}
    case 'createChallenge':assert(['coach','gym'].includes(me.role)&&me.verified,'Verification required');assert(clean(b.title)&&[7,14,30].includes(Number(b.days)),'Invalid challenge',400);s.challenges.unshift({id:uuid(),owner:id,title:clean(b.title,80),days:Number(b.days),members:{}});break;
    case 'joinChallenge':{const x=s.challenges.find(x=>x.id===b.id);assert(x&&visible(s,x.owner,id,'profile'));x.members[id]??=[];break;}
    case 'checkin':{const x=s.challenges.find(x=>x.id===b.id);assert(x&&x.members[id]);const date=new Date().toISOString().slice(0,10);assert(!x.members[id].includes(date),'Already checked in today',409);assert(x.members[id].length<x.days,'Challenge completed',409);x.members[id].push(date);me.xp+=20;if(x.members[id].length===x.days)me.xp+=x.days===7?150:500;break;}
    case 'verification':assert(['coach','gym'].includes(me.role)&&!me.verified);assert(clean(b.text),'Details required',400);assert(!s.verifications.some(x=>x.owner===id&&x.state==='pending'),'Already pending',409);s.verifications.unshift({id:uuid(),owner:id,text:clean(b.text,800),state:'pending',at:now()});break;
    case 'report':assert(clean(b.reason),'Reason required',400);assert((b.targetType==='post'&&p&&visible(s,p.owner,id,'posts'))||(b.targetType==='profile'&&other&&other.id!==id),'Invalid report',400);s.reports.unshift({id:uuid(),by:id,target:b.targetType==='post'?p.id:other.id,targetType:b.targetType,reason:clean(b.reason,400),state:'pending',at:now()});break;
    case 'readNotifications':s.notifications.forEach(n=>{if(n.owner===id)n.read=true});break;
    case 'admin':{
      assert(me.role==='admin');
      if(b.operation==='verify'){const v=s.verifications.find(x=>x.id===b.id);assert(v&&v.state==='pending');v.state=b.accept===true?'approved':'rejected';profile(s,v.owner).verified=b.accept===true;}
      else if(b.operation==='suspend'){const u=profile(s,b.id);assert(u&&u.role!=='admin');u.suspended=!u.suspended;}
      else if(b.operation==='resolve'){const x=s.reports.find(r=>r.id===b.id);assert(x);x.state='resolved';}
      else throw bad('Unknown admin operation');
      s.audit.unshift({at:now(),actor:id,operation:b.operation,target:b.id});break;
    }
    default:throw bad('Unknown action');
  }
  me.lastActive=now();
}

function removeAccount(s,id){
  clearNutrition(s,id);
  removeIdentity(s,id);
  removeWellness(s,id);
  removeCoaching(s,id);
  removeClubOps(s,id);
  removeClubChat(s,id);
  removePrograms(s,id);
  removeTraining(s,id);
  const owned=new Set(s.posts.filter(p=>p.owner===id).map(p=>p.id));
  s.profiles=s.profiles.filter(p=>p.id!==id);
  s.posts=s.posts.filter(p=>p.owner!==id).map(p=>({...p,likes:p.likes.filter(x=>x!==id),comments:p.comments.filter(c=>c.owner!==id)}));
  s.stories=s.stories.filter(x=>x.owner!==id);
  s.follows=s.follows.filter(x=>x.from!==id&&x.to!==id);
  s.followRequests=(s.followRequests||[]).filter(x=>x.from!==id&&x.to!==id);
  s.blocks=s.blocks.filter(x=>x.from!==id&&x.to!==id);
  s.requests=s.requests.filter(x=>x.from!==id&&x.to!==id);
  s.saved=s.saved.filter(x=>x.owner!==id&&!owned.has(x.post));
  s.conversations=s.conversations.map(c=>({...c,members:c.members.filter(x=>x!==id),messages:c.messages.filter(m=>m.owner!==id)})).filter(c=>c.members.length>=2);
  s.sessions=s.sessions.filter(x=>x.owner!==id).map(x=>({...x,participants:x.participants.filter(a=>a!==id)}));
  s.challenges=s.challenges.filter(x=>x.owner!==id).map(x=>{delete x.members[id];return x});
  s.notifications=s.notifications.filter(x=>x.owner!==id&&x.actor!==id);
  s.verifications=s.verifications.filter(x=>x.owner!==id);
  s.reports=s.reports.filter(x=>x.by!==id&&x.target!==id&&!owned.has(x.target)&&x.evidence?.senderId!==id);
}
export function createApp({dbPath,demoPassword,release={production:false},features={smartDashboard:process.env.ML_SMART_DASHBOARD!=='0',dashboardMetrics:process.env.ML_DASHBOARD_METRICS!=='0'}}={}){
  const production=release.production===true;
  if(!production&&demoPassword!==undefined&&(typeof demoPassword!=='string'||demoPassword.length<16||demoPassword.length>128))throw new Error('Local demo password must be 16–128 characters');
  const flags=dashboardFlags(production,features);
  dbPath??=resolve(root,production?'data/production.sqlite':'data/local.sqlite');
  if(production&&(!release.origin?.startsWith('https://')||typeof release.mailer!=='function'||!emailValid(release.adminEmail||'')||typeof release.adminPassword!=='string'||release.adminPassword.length<16||!emailValid(release.contact||'')))throw new Error('Release blocked: incomplete configuration');
  if(dbPath!==':memory:')mkdirSync(dirname(dbPath),{recursive:true,mode:0o700});
  const db=new DatabaseSync(dbPath);
  db.exec('CREATE TABLE IF NOT EXISTS exercise_media (exercise_id TEXT NOT NULL, slot TEXT NOT NULL, mime TEXT NOT NULL, data BLOB NOT NULL, sha TEXT NOT NULL, PRIMARY KEY(exercise_id,slot));');
  db.exec('CREATE TABLE IF NOT EXISTS library_pdf (item_id TEXT PRIMARY KEY, data BLOB NOT NULL, sha TEXT NOT NULL);');
  db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id); CREATE TABLE IF NOT EXISTS auth_codes (user_id TEXT NOT NULL, purpose TEXT NOT NULL, digest TEXT NOT NULL, expires INTEGER NOT NULL, PRIMARY KEY(user_id,purpose));');
  const read=()=>{const s=JSON.parse(db.prepare('SELECT data FROM state WHERE id=1').get().data);return production?s:ensureIdentity(s)};
  const save=s=>{
    s.stories=s.stories.filter(x=>x.at>now()-DAY);
    s.notifications=s.notifications.filter(x=>x.at>now()-30*DAY).slice(0,10000);
    const data=JSON.stringify(s);assert(!production||Buffer.byteLength(data)<16*1024*1024,'Pilot storage capacity reached',507);db.prepare('INSERT INTO state VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(data);
  };
  const add=(id,email,password)=>{const salt=randomBytes(16).toString('hex');db.prepare('INSERT INTO accounts VALUES (?,?,?,?)').run(id,email,salt,hash(password,salt));};
  if(!db.prepare('SELECT id FROM state WHERE id=1').get()){
    db.exec('BEGIN');try{
      if(production){const s=emptyState(),id=uuid();s.profiles.push({id,name:'MUSCLIVO Admin',email:release.adminEmail,role:'admin',city:'',sport:'',goal:'',level:'',lang:'en',bio:'',color:'#39FF88',xp:0,privacy:publicPrivacy(),status:'offline',lastActive:now(),joined:now(),emailVerified:true,policyVersion:POLICY_VERSION,policyAcceptedAt:now()});save(s);add(id,release.adminEmail,release.adminPassword)}
      else{save(makeState());for(const p of sample)add(p.id,p.email,randomBytes(32).toString('hex'))}
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e}
  }
  if(!production){
    // Rotate all seeded demo credentials (including databases created before this change).
    // Never persist a cleartext credential or expose it in an API response.
    db.exec('BEGIN');try{
      for(const p of sample){const salt=randomBytes(16).toString('hex');db.prepare('UPDATE accounts SET salt=?,hash=? WHERE id=? AND email=?').run(salt,hash(demoPassword??randomBytes(32).toString('hex'),salt),p.id,p.email);db.prepare('DELETE FROM sessions WHERE user_id=?').run(p.id)}
      save(read());db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');db.close();throw e}
  }
  if(production&&(read().identity||read().wellness||read().coaching||read().clubOps||read().clubChat||read().programs||read().training||read().nutrition||read().profiles.some(p=>p.id.startsWith('demo-')||p.email?.endsWith('@demo.local')||p.emailVerified===undefined))){db.close();throw new Error('Release blocked: use a fresh production database, never a demo database')}
  const tokenFrom=req=>(req.headers.cookie||'').match(/(?:^|; )ml_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  const revoke=req=>{const token=tokenFrom(req);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token))};
  const session=(req)=>{const token=tokenFrom(req);return token?db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').get(digest(token),now())?.user_id:null};
  const cookieSuffix=production?'; Secure':'';
  const signIn=(res,id)=>{const token=randomBytes(32).toString('hex'),ttl=production?DAY:7*DAY;db.prepare('DELETE FROM sessions WHERE expires<=?').run(now());db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token),id,now()+ttl);res.setHeader('Set-Cookie',`ml_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ttl/1000}${cookieSuffix}`);};
  const clearCookie=res=>res.setHeader('Set-Cookie','ml_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'+cookieSuffix);
  const rates=new Map();
  function rate(key,limit,window){const ts=now();if(rates.size>10000){for(const [k,v] of rates)if(v.until<=ts)rates.delete(k);assert(rates.size<=10000,'Server busy',429)}let r=rates.get(key);if(!r||r.until<=ts){r={n:0,until:ts+window};rates.set(key,r)}r.n++;assert(r.n<=limit,'Too many requests. Try again later.',429)}
  const dummySalt=randomBytes(16).toString('hex'),dummyHash=hash(randomBytes(32).toString('hex'),dummySalt);
  function checkPassword(account,password){const computed=hash(password,account?.salt||dummySalt);return timingSafeEqual(Buffer.from(computed,'hex'),Buffer.from(account?.hash||dummyHash,'hex'))&&!!account}
  function codeValid(uid,purpose,code){const item=db.prepare('SELECT digest FROM auth_codes WHERE user_id=? AND purpose=? AND expires>?').get(uid,purpose,now());return !!item&&timingSafeEqual(Buffer.from(item.digest,'hex'),Buffer.from(digest(code),'hex'))}
  async function sendCode(p,purpose){const code=randomBytes(24).toString('hex');db.prepare('INSERT INTO auth_codes VALUES (?,?,?,?) ON CONFLICT(user_id,purpose) DO UPDATE SET digest=excluded.digest,expires=excluded.expires').run(p.id,purpose,digest(code),now()+30*60000);try{await release.mailer({to:p.email,purpose,code,lang:p.lang})}catch{throw bad('Email delivery unavailable. Try again later.',503)}}
  const json=(res,v,status=200)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(v))};
  const parse=async req=>{let bytes=0;const chunks=[];for await(const c of req){bytes+=c.length;assert(bytes<550000,'Request too large',413);chunks.push(c)}try{const data=JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');if(!data||typeof data!=='object'||Array.isArray(data))throw new Error();return data}catch{throw bad('Invalid JSON')}};
  const server=http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://localhost');
      res.setHeader('X-Content-Type-Options','nosniff');
      res.setHeader('Referrer-Policy','no-referrer');
      res.setHeader('X-Frame-Options','DENY');
      res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
      if(production)res.setHeader('Strict-Transport-Security','max-age=31536000');
      res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'");
      if(url.pathname.startsWith('/api/')){
        const ip=req.socket.remoteAddress||'unknown';
        rate('ip:'+ip,production?1500:3000,60000);
        if(req.method==='POST'){assert(production?req.headers.origin===release.origin:(!req.headers.origin||req.headers.origin===`http://${req.headers.host}`),'Invalid origin');if(!['/api/training-media','/api/library-pdf'].includes(url.pathname))assert((req.headers['content-type']||'').includes('application/json'),'JSON required',415)}
        if(url.pathname==='/api/config'&&req.method==='GET')return json(res,{production,demo:!production,policyVersion:POLICY_VERSION,contact:production?release.contact:null,features:flags});
        if(url.pathname==='/api/health'&&req.method==='GET')return json(res,{ok:true});
        const id=session(req);
        if(url.pathname==='/api/auth'&&req.method==='POST'){
          rate('auth:'+ip,production?40:120,60000);
          const b=await parse(req),email=clean(b.email,150).toLowerCase(),password=String(b.password||'');
          assert(password.length<=128,'Password too long',400);rate('email:'+email,production?8:50,600000);
          let uid;
          if(b.mode==='register'){
            assert(emailValid(email)&&password.length>=(production?12:8)&&clean(b.name)&&roles.includes(b.role),'Invalid registration details',400);
            if(production){rate('register:'+ip,10,3600000);assert(b.acceptPolicies===true&&b.adult===true,'Policy and adult confirmation required',400);assert(!email.endsWith('@demo.local'),'Invalid email',400)}
            assert(!db.prepare('SELECT id FROM accounts WHERE email=?').get(email),'Email already exists',409);
            uid=uuid();const s=read(),expired=production?s.profiles.filter(p=>p.emailVerified===false&&p.joined<now()-DAY).map(p=>p.id):[],p={id:uid,name:clean(b.name,60),email,role:b.role,city:'',sport:'Strength',goal:'General fitness',level:'Beginner',lang:languages.includes(b.lang)?b.lang:'en',bio:'',color:'#39FF88',privacy:production?publicPrivacy():defaultPrivacy(),status:'offline',xp:0,joined:now(),lastActive:now(),emailVerified:!production,policyVersion:production?POLICY_VERSION:null,policyAcceptedAt:production?now():null};
            for(const stale of expired)removeAccount(s,stale);
            assert(!production||s.profiles.length<(release.maxUsers||100),'Pilot registration is currently full',503);s.profiles.push(p);
            db.exec('BEGIN');try{for(const stale of expired){db.prepare('DELETE FROM accounts WHERE id=?').run(stale);db.prepare('DELETE FROM auth_codes WHERE user_id=?').run(stale)}add(uid,email,password);save(s);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
            if(production){await sendCode(p,'verify');return json(res,{verificationRequired:true},201)}
          }else if(b.mode==='verify'||b.mode==='reset'){
            assert(production,'Not available',404);const account=db.prepare('SELECT * FROM accounts WHERE email=?').get(email);const purpose=b.mode;
            assert(account&&codeValid(account.id,purpose,clean(b.code,48)),'Invalid or expired code',400);
            const s=read(),p=profile(s,account.id);assert(p&&!p.suspended,'Account unavailable',403);
            if(purpose==='verify'){assert(!p.emailVerified,'Account already verified',409);p.emailVerified=true;save(s)}
            else{assert(password.length>=12,'Password must be at least 12 characters',400);const salt=randomBytes(16).toString('hex');db.prepare('UPDATE accounts SET salt=?,hash=? WHERE id=?').run(salt,hash(password,salt),account.id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(account.id)}
            db.prepare('DELETE FROM auth_codes WHERE user_id=? AND purpose=?').run(account.id,purpose);return json(res,{ok:true});
          }else if(b.mode==='resend'||b.mode==='forgot'){
            assert(production,'Not available',404);const a=db.prepare('SELECT id FROM accounts WHERE email=?').get(email),p=a?profile(read(),a.id):null;
            if(p&&!p.suspended&&((b.mode==='resend'&&!p.emailVerified)||(b.mode==='forgot'&&p.emailVerified)))await sendCode(p,b.mode==='resend'?'verify':'reset');
            return json(res,{ok:true});
          }else if(b.mode==='demo'){
            assert(!production,'Demo accounts disabled',404);assert(['127.0.0.1','::1','::ffff:127.0.0.1'].includes(ip)&&/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(req.headers.host||''),'Local demo access only',403);const p=sample.find(x=>x.id==='demo-'+clean(b.role,20));assert(p,'Invalid demo role',400);uid=p.id;const demo=profile(read(),uid);assert(demo&&!demo.suspended,'Account unavailable',403);
          }else{
            assert(b.mode==='login','Unknown authentication action',400);const a=db.prepare('SELECT * FROM accounts WHERE email=?').get(email);assert(checkPassword(a,password),'Invalid credentials',401);uid=a.id;const p=profile(read(),uid);assert(!p.suspended,'Account suspended');assert(!production||p.emailVerified===true,'Email verification required',403);
          }
          revoke(req);signIn(res,uid);const s=read();profile(s,uid).lastActive=now();save(s);return json(res,snapshot(s,uid,flags));
        }
        if(url.pathname==='/api/logout'&&req.method==='POST'){revoke(req);clearCookie(res);return json(res,{ok:true});}
        const s=read(),me=profile(s,id);assert(id&&me&&!me.suspended&&(!production||me.emailVerified===true),'Sign in required',401);
        rate('user:'+id,production?120:500,60000);
        if(url.pathname==='/api/library-pdf'){
          assert(!production&&s.identity,'Local library unavailable',404);const itemId=url.searchParams.get('id');
          if(req.method==='POST'){
            libraryFileRow(s,id,itemId,true);rate('library-pdf:'+id,20,60000);const remove=url.searchParams.get('remove')==='1';
            let data=null,sha=null,size=0;
            if(!remove){assert(req.headers['content-type']==='application/pdf','PDF required',415);assert(!req.headers['content-length']||Number(req.headers['content-length'])<=libraryPdfLimit,'PDF too large',413);const chunks=[];for await(const c of req){size+=c.length;assert(size<=libraryPdfLimit,'PDF too large',413);chunks.push(c)}data=Buffer.concat(chunks);assert(size>=16&&data.toString('ascii',0,5)==='%PDF-'&&data.subarray(Math.max(0,size-2048)).toString('ascii').includes('%%EOF'),'Invalid PDF signature',415);sha=digest(data)}
            else assert(!req.headers['content-length']||Number(req.headers['content-length'])===0,'Empty removal request required',400);
            const fresh=read();assert(session(req)===id&&profile(fresh,id)&&!profile(fresh,id).suspended,'Sign in required',401);libraryAttachFile(fresh,id,itemId,remove?null:{size,sha});libraryFileAudit(fresh,id,remove?'libraryPdfRemove':'libraryPdfAttach',itemId);
            const used=db.prepare('SELECT COALESCE(SUM(length(data)),0) AS total FROM library_pdf WHERE item_id<>?').get(itemId).total;assert(used+size<=libraryTotalPdfLimit,'Local library quota reached',429);
            db.exec('BEGIN');try{if(remove)db.prepare('DELETE FROM library_pdf WHERE item_id=?').run(itemId);else db.prepare('INSERT INTO library_pdf VALUES (?,?,?) ON CONFLICT(item_id) DO UPDATE SET data=excluded.data,sha=excluded.sha').run(itemId,data,sha);save(fresh);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return json(res,snapshot(fresh,id,flags));
          }
          if(req.method==='GET'){
            const book=libraryFileRow(s,id,itemId);assert(book.pdf,'PDF not found',404);const row=db.prepare('SELECT data,sha FROM library_pdf WHERE item_id=?').get(itemId);assert(row&&row.sha===book.pdf.sha,'PDF not found',404);const bytes=Buffer.from(row.data);res.writeHead(200,{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="musclivo-${book.id}.pdf"`,'Content-Length':bytes.length,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'});return res.end(bytes);
          }
          return json(res,{error:'Not found'},404);
        }
        if(url.pathname==='/api/training-media'){
          assert(!production&&s.identity,'Local training unavailable',404);
          const exerciseId=url.searchParams.get('exercise'),slot=url.searchParams.get('slot');
          if(req.method==='POST'){
            trainingMediaRow(s,id,exerciseId,slot,true);rate('training-media:'+id,30,60000);
            const mime=req.headers['content-type'],isVideo=slot==='video',max=isVideo?8*1024*1024:2*1024*1024,allowed=isVideo?['video/mp4','video/webm']:['image/jpeg','image/png','image/webp'];assert(allowed.includes(mime),'Unsupported media type',415);
            assert(!req.headers['content-length']||Number(req.headers['content-length'])<=max,'Media too large',413);let size=0;const chunks=[];for await(const c of req){size+=c.length;assert(size<=max,'Media too large',413);chunks.push(c)}const data=Buffer.concat(chunks);
            const valid=mime==='image/png'?data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/jpeg'?data[0]===255&&data[1]===216&&data[2]===255:mime==='image/webp'?data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP':mime==='video/mp4'?data.toString('ascii',4,8)==='ftyp':data.subarray(0,4).equals(Buffer.from([26,69,223,163]));assert(size>=16&&valid,'Invalid media signature',415);
            const fresh=read();assert(session(req)===id&&profile(fresh,id)&&!profile(fresh,id).suspended,'Sign in required',401);const sha=digest(data);trainingAttachMedia(fresh,id,exerciseId,slot,{mime,sha,size});
            const used=db.prepare('SELECT COALESCE(SUM(length(data)),0) AS total FROM exercise_media WHERE NOT (exercise_id=? AND slot=?)').get(exerciseId,slot).total;assert(used+size<=512*1024*1024,'Local media quota reached',429);
            db.exec('BEGIN');try{db.prepare('INSERT INTO exercise_media VALUES (?,?,?,?,?) ON CONFLICT(exercise_id,slot) DO UPDATE SET mime=excluded.mime,data=excluded.data,sha=excluded.sha').run(exerciseId,slot,mime,data,sha);save(fresh);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}return json(res,snapshot(fresh,id,flags));
          }
          if(req.method==='GET'){
            const {asset}=trainingMediaRow(s,id,exerciseId,slot);assert(asset,'Media not found',404);const row=db.prepare('SELECT mime,data,sha FROM exercise_media WHERE exercise_id=? AND slot=?').get(exerciseId,slot);assert(row&&row.sha===asset.sha,'Media not found',404);
            const bytes=Buffer.from(row.data);let from=0,to=bytes.length-1,status=200;const headers={'Content-Type':row.mime,'Cache-Control':'no-store','Accept-Ranges':'bytes','Cross-Origin-Resource-Policy':'same-origin'};
            if(req.headers.range){const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});return res.end()}from=Number(m[1]);to=m[2]?Math.min(Number(m[2]),to):to;if(from>to){res.writeHead(416,{'Content-Range':`bytes */${bytes.length}`});return res.end()}status=206;headers['Content-Range']=`bytes ${from}-${to}/${bytes.length}`}
            headers['Content-Length']=to-from+1;res.writeHead(status,headers);return res.end(bytes.subarray(from,to+1));
          }
          return json(res,{error:'Not found'},404);
        }
        if(url.pathname==='/api/state'&&req.method==='GET'){if(me.lastActive<now()-60000){me.lastActive=now();s.stories=s.stories.filter(x=>x.at>now()-DAY);save(s)}return json(res,snapshot(s,id,flags));}
        if(url.pathname==='/api/account'&&req.method==='POST'){
          rate('account:'+id,8,600000);
          const b=await parse(req),fresh=read(),p=profile(fresh,id);assert(p&&!p.suspended);const account=db.prepare('SELECT * FROM accounts WHERE id=?').get(id),pass=String(b.password||'');assert(pass.length<=128&&checkPassword(account,pass),'Invalid credentials',401);
          if(b.operation==='logoutAll'){db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);clearCookie(res);return json(res,{ok:true})}
          if(b.operation==='export'){return json(res,{profile:p,posts:fresh.posts.filter(x=>x.owner===id),comments:fresh.posts.flatMap(x=>x.comments.filter(c=>c.owner===id).map(c=>({...c,post:x.id}))),stories:fresh.stories.filter(x=>x.owner===id),follows:fresh.follows.filter(x=>x.from===id||x.to===id),messages:fresh.conversations.filter(c=>c.members.includes(id)).flatMap(c=>c.messages.filter(m=>m.owner===id).map(m=>({...m,conversation:c.id}))),requests:fresh.requests.filter(x=>x.from===id||x.to===id),reports:fresh.reports.filter(x=>x.by===id),settings:p.privacy,identity:identityExport(fresh,id),wellness:wellnessExport(fresh,id),coaching:coachingExport(fresh,id),clubOps:clubOpsExport(fresh,id),clubChat:clubChatExport(fresh,id),programs:programsExport(fresh,id),training:trainingExport(fresh,id),nutrition:nutritionExport(fresh,id)})}
          if(b.operation==='delete'){assert(p.role!=='admin','Administrator cannot self-delete');assert(b.confirm===true,'Confirmation required',400);removeAccount(fresh,id);db.exec('BEGIN');try{save(fresh);db.prepare('DELETE FROM accounts WHERE id=?').run(id);db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);db.prepare('DELETE FROM auth_codes WHERE user_id=?').run(id);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}clearCookie(res);return json(res,{ok:true})}
          throw bad('Unknown account operation');
        }
        if(url.pathname==='/api/action'&&req.method==='POST'){
          const b=await parse(req);const fresh=read();assert(profile(fresh,id)&&!profile(fresh,id).suspended);assert(typeof b.type==='string'&&b.type.length<40,'Invalid action',400);
          rate('action:'+id+':'+b.type,production?35:150,60000);
          if(production&&(b.type==='post'||b.type==='story')&&b.image){const used=[...fresh.posts,...fresh.stories].filter(p=>p.owner===id).reduce((a,p)=>a+Buffer.byteLength(p.image||''),0);assert(used+Buffer.byteLength(String(b.image))<=1500000,'Personal media quota reached',429)}
          action(fresh,id,b);if(b.type==='admin'&&b.operation==='suspend'&&profile(fresh,b.id)?.suspended)db.prepare('DELETE FROM sessions WHERE user_id=?').run(b.id);
          save(fresh);return json(res,snapshot(fresh,id,flags));
        }
        return json(res,{error:'Not found'},404);
      }
      const names={'/':'index.html','/index.html':'index.html','/app.css':'app.css','/app.js':'app.js','/i18n.js':'i18n.js','/languages/ar.js':'languages/ar.js','/languages/en.js':'languages/en.js','/languages/sv.js':'languages/sv.js','/core/modules.js':'core/modules.js','/core/workspace.js':'core/workspace.js','/core/identity-ui.js':'core/identity-ui.js','/core/dashboard.js':'core/dashboard.js','/core/wellness-schema.js':'core/wellness-schema.js','/core/wellness-ui.js':'core/wellness-ui.js','/core/coaching-ui.js':'core/coaching-ui.js','/core/club-ops-ui.js':'core/club-ops-ui.js','/core/club-chat-ui.js':'core/club-chat-ui.js','/core/programs-ui.js':'core/programs-ui.js','/core/training-ui.js':'core/training-ui.js','/core/exercise-catalog.js':'core/exercise-catalog.js','/logo.svg':'logo.svg','/privacy':'privacy.html','/terms':'terms.html','/policy.js':'policy.js','/robots.txt':'robots.txt'};
      names['/core/xdraw-ui.js']='core/xdraw-ui.js';
      names['/core/training-templates.js']='core/training-templates.js';
      names['/core/nutrition-catalog.js']='core/nutrition-catalog.js';
      names['/core/nutrition-ui.js']='core/nutrition-ui.js';
      names['/core/disclosures.js']='core/disclosures.js';
      names['/core/health-ui.js']='core/health-ui.js';
      names['/core/health-config.js']='core/health-config.js';
      names['/core/health-insights.js']='core/health-insights.js';
      names['/core/rehab-schema.js']='core/rehab-schema.js';
      names['/core/rehab-ui.js']='core/rehab-ui.js';
      names['/core/library-schema.js']='core/library-schema.js';
      names['/core/library-ui.js']='core/library-ui.js';
      names['/core/campaign-ui.js']='core/campaign-ui.js';
      names['/core/directory-ui.js']='core/directory-ui.js';
      names['/core/events-ui.js']='core/events-ui.js';
      for(const style of ['tokens','base','responsive','modules','training','components'])names['/styles/'+style+'.css']='styles/'+style+'.css';
      const draftModules=['xdraw-engine','exercise-drawing-new','exercise-drawings','exercise-kinematics','exercise-drawing-corrections','exercise-drawing-legacy-tracks','exercise-drawing-anatomy','exercise-apparatus'];
      const draftModule=draftModules.find(name=>url.pathname==='/core/'+name+'.js');
      if(draftModule&&!production){const id=session(req),s=read();assert(id&&profile(s,id)&&!profile(s,id).suspended&&can(s,id,'platform.admin'),'Not authorized',403);names[url.pathname]='core/'+draftModule+'.js'}
      const file=names[url.pathname];if(!file){res.writeHead(404);return res.end('Not found')}
      const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
      res.writeHead(200,{'Content-Type':types[extname(file)],'Cache-Control':draftModule?'no-store':'no-cache'});res.end(readFileSync(resolve(root,'dist',file)));
    }catch(e){json(res,{error:e.status?e.message:'Internal error'},e.status||500);if(!e.status)console.error(e)}
  });
  server.requestTimeout=15000;server.headersTimeout=10000;server.keepAliveTimeout=5000;server.maxHeadersCount=80;
  return {server,db};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||4173);
  const release=readReleaseConfig();if(process.argv.includes('--release')&&!release.production)throw new Error('Release blocked: ML_MODE=production required');if(release.production)process.umask(0o077);
  createApp({release,demoPassword:release.production?undefined:process.env.ML_LOCAL_DEMO_PASSWORD}).server.listen(port,'127.0.0.1',()=>console.log(`MUSCLIVO LIVE · http://127.0.0.1:${port} · ${release.production?'RELEASE MODE / HTTPS PROXY REQUIRED':'LOCAL DEVELOPMENT'}`));
}

