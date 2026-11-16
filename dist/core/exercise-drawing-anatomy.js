// Individually authored refinements to the technical recheck. Draft artwork,
// not clinical range-of-motion limits or certification.
import {ellipticalTargets} from './exercise-apparatus.js';
const rad=n=>n*Math.PI/180;
const polar=(p,l,a)=>[p[0]+l*Math.cos(rad(a)),p[1]+l*Math.sin(rad(a))];
const arm=(p,u,f,far=false)=>{
 const s=[p.s[0]+(p.front?(far?23:-23):0),p.s[1]+(p.girdle||0)];
 const e=polar(s,75,u),w=polar(e,75,f);
 return far?{...p,e2:e,w2:w}:{...p,e,w};
};
const arms=(p,u,f,u2,f2)=>arm(arm(p,u,f),u2,f2,true);
const leg=(p,u,f,far=false)=>{
 const k=polar(p.h,110,u),a=polar(k,110,f);
 return far?{...p,k2:k,a2:a}:{...p,k,a};
};
// Hip switch: rotate each knee around its fixed hip-to-ankle axis in 3D.
// A planar rig cannot show this transition without artificially straightening
// the knee or changing the length of its bones. Units are drawing units.
export function hipSwitchGeometry(phase=0){
 const u=Number.isFinite(phase)?((phase%1)+1)%1:0,p=1-Math.abs(2*u-1),t=p*p*(3-2*p),theta=Math.PI*t;
 const add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,k)=>a.map(x=>x*k);
 const project=([x,y,z])=>[360+x,430+y*.70-(z-22)*.85];
 const limbs=[-1,1].map(side=>{
  const hip=[side*25,0,22],ankle=[side*65,150,12],axis=[side*40,150,-10],d=Math.hypot(...axis),unit=mul(axis,1/d),mid=add(hip,mul(axis,.5));
  const horizontal=[-150/Math.hypot(150,40),side*40/Math.hypot(150,40),0];
  const cross=[unit[1]*horizontal[2]-unit[2]*horizontal[1],unit[2]*horizontal[0]-unit[0]*horizontal[2],unit[0]*horizontal[1]-unit[1]*horizontal[0]];
  const r=Math.sqrt(110**2-(d/2)**2),knee=add(mid,mul(add(mul(horizontal,Math.cos(theta)),mul(cross,Math.sin(theta))),r));
  return {hip,knee,ankle,projected:{hip:project(hip),knee:project(knee),ankle:project(ankle)}};
 });
 const [l,r]=limbs.map(x=>x.projected),h=project([0,0,22]),s=project([0,0,147]);
 const pose={front:true,h,s,k:l.knee,a:l.ankle,k2:r.knee,a2:r.ankle,e:[300,371],w:[272,414],e2:[420,371],w2:[448,414],girdle:0,spineBend:0,footTilt:0,handAngle:0};
 return {pose,anchors:{},progress:p,hold:false,limbs};
}
export function applyAnatomyRefinements(drafts){
 const edit=(id,fn)=>{
  const d=drafts.get(id),frames=d.frames||[d.a,d.b],{poses=frames,opt=d.opt}=fn(frames,d.opt);
  drafts.set(id,{...d,a:poses[0],b:poses.at(-1),frames:poses,opt,revised:true});
 };
 // Three-quarter schematic start: avoid folding the forearm through the
 // upper arm. Keep existing bench, foot support and stable exercise IDs.
 for(const id of ['db-bench','db-incline','db-decline','bb-bench','bb-incline','bb-decline','bb-close-bench','db-squeeze-press','single-db-bench','smith-bench']){
  edit(id,([a,b],opt)=>{
   let start=arm(a,25,270);
   if(opt.smith){
    // Fixed vertical guide: wrist travels above the shoulder rather than
    // returning onto the shoulder center at the bottom.
    start={...a,e:[a.s[0]+65,a.s[1]-37],w:[a.s[0],a.s[1]-74]};
   }
   if(!opt.one)start={...start,e2:start.e,w2:start.w};
   return {poses:[start,b],opt:{...opt,gripInset:opt.one?undefined:opt.gripInset||(id.startsWith('db-')?'pressDb':'wide')}};
  });
 }
 // Pads touch the limb silhouette from opposite sides, not its centerline.
 // The sloping bench is offset from the torso to join the back surface.
 for(const id of ['db-decline','bb-decline'])edit(id,(poses,opt)=>({poses,opt:{...opt,slant:[230,527,435,457],legLock:undefined,declineSupport:{upper:[454,375],lower:[543,428],radius:19}}}));
 // Fly closure shown in the oblique/front schematic, not a folded elbow.
 for(const id of ['pec-deck','cable-fly','reverse-pec']){
  edit(id,([a,b],opt)=>{
   const closed=id==='reverse-pec'?a:b;
   // Close at chest height, rather than lowering the handles to the abdomen.
   // The cable fly keeps its existing separate path.
   const p=id==='cable-fly'?arms(closed,125,25,55,155):arms(closed,140,-8,40,188);
   return {poses:id==='reverse-pec'?[p,b]:[a,p],opt};
  });
 }
 edit('cable-rear-fly',([a,b],opt)=>({poses:[arms(a,125,25,55,155),b],opt}));
 edit('neutral-pull',([a,b],opt)=>({poses:[a,{...b,h:[b.h[0],b.h[1]+12],s:[b.s[0],b.s[1]+12],k:[b.k[0],b.k[1]+12],a:[b.a[0],b.a[1]+12],k2:[b.k2[0],b.k2[1]+12],a2:[b.a2[0],b.a2[1]+12]}],opt}));
 edit('assisted-pullup',()=>{
  const p={h:[350,400],s:[350,275],k:[350,510],a:[240,510],e:[377,204],w:[395,137]};
  const q={h:[350,275],s:[350,150],k:[350,385],a:[240,385],e:[420,195],w:[395,137]};
  return {poses:[p,q],opt:{kneelingAssist:true,anchors:['w','w2'],lengths:{w:[75,75],w2:[75,75],a:[110,110],a2:[110,110]},footDirection:-1}};
 });
 edit('pendlay-row',([a,b],opt)=>({poses:[a,{...b,w:[397,538]}],opt}));
 edit('db-arnold',([a,m,b],opt)=>({poses:[arms(a,138,285,42,255),m,b],opt}));
 for(const id of ['db-curl','db-hammer','bb-curl','cable-curl','db-incline-curl']){
  edit(id,([a,b],opt)=>({poses:[a,arm(b,id==='db-incline-curl'?100:90,-48)],opt}));
 }
 edit('bb-front-squat',(frames,opt)=>({poses:frames.map(p=>{
  const e=polar(p.s,65,-12),w=polar(e,48,142);
  return {...p,e,w,e2:e,w2:w};
 }),opt:{...opt,frontRack:true,lengths:{...opt.lengths,w:[65,48],w2:[65,48]}}}));
 edit('bb-zercher',(frames,opt)=>({poses:frames.map(p=>arm(p,45,290)),opt:{...opt,zercherBar:true}}));
 edit('bb-goodmorning',(frames,opt)=>({poses:frames.map(p=>arm(p,135,260)),opt:{...opt,shoulderBar:true}}));
 edit('high-knees',(frames,opt)=>({poses:frames.map((p,i)=>i<2?arms(p,35,-55,135,45):arms(p,135,45,35,-55)),opt}));
 edit('shadow-box',(frames,opt)=>({poses:frames.map((p,i)=>i===1?arms(p,5,5,125,30):i===3?arms(p,125,30,5,5):arms(p,125,30,60,-35)),opt}));
 edit('seated-hamstring-stretch',(frames,opt)=>({poses:[{...frames[0],k2:[215,575],a2:[210,635]}],opt}));
 edit('butterfly-stretch',(frames,opt)=>{
  const p={...frames[0],h:[360,520],s:[360,395],k:[250,560],a:[350,630],k2:[470,560],a2:[370,630],e:[290,465],w:[280,539],e2:[430,465],w2:[440,539]};
  return {poses:[p],opt:{...opt,overheadView:true,lengths:{a:[117,122],a2:[117,122]}}};
 });
 edit('hip-90-90',([a],opt)=>({poses:[leg(leg(a,145,55),325,235,true),leg(leg(a,215,125),35,-55,true)],opt:{...opt,hipSwitch3D:true}}));
 // Explicit contact artwork follows the actual supporting wrist. A hand
 // lifted from the floor remains a free hand, not a planted palm.
 for(const id of ['push-up','wide-push-up','close-pushup','archer-pushup','pike-pushup','bird-dog','cat-cow','mountain-climber','dynamic-inchworm','decline-push-up','wall-handstand']){
  edit(id,(poses,opt)=>({poses,opt:{...opt,groundHands:true}}));
 }
 // Inclined push-up hands use the top of the bench, rather than floor.
 edit('incline-push-up',(poses,opt)=>({poses,opt:{...opt,handSurface:540}}));
 // Pedal crank must travel along a circle, not a sequence of chords.
 edit('stationary-bike',(poses,opt)=>({poses,opt:{...opt,arcTargets:{a:[410,555],a2:[410,555]}}}));
 // Fixed-length articulated link design for the depicted machine layouts.
 // Each endpoint stays on the same wrist/forearm; radius pairs are computed
 // from the full authored track by the renderer.
 for(const id of ['machine-chest','machine-incline','machine-row','machine-shoulder','machine-lateral','high-row','machine-pullover']){
  edit(id,(poses,opt)=>({poses,opt:{...opt,rigidApparatus:true,...(id==='high-row'?{machinePivot:null,apparatus:'highRow'}:id==='machine-pullover'?{machinePivot:null,apparatus:'pulloverMachine'}:{})}}));
 }
 // Fixed pivots and exact circular hand paths for all three landmine bars.
 for(const [id,pivot,radius,angles] of [
  ['landmine-press',[555,644],410,[-113,-100.5]],
  ['tbar-row',[165,644],295,[-17,-34]],
  ['meadows-row',[165,644],300,[-19,-45]]
 ])edit(id,([a,b],opt)=>{
  const bones=id==='meadows-row'?[85,85]:id==='tbar-row'?[78,78]:[75,75];
  return {poses:[a,b].map((p,i)=>({...p,w:polar(pivot,radius,angles[i])})),opt:{...opt,landminePivot:pivot,landmineRadius:radius,anchors:[...new Set([...(opt.anchors||[]),'w','w2'])],arcTargets:{...opt.arcTargets,w:pivot,w2:pivot},lengths:{...opt.lengths,w:bones,w2:bones}}};
 });
 for(const id of ['pec-deck','reverse-pec','machine-crunch'])edit(id,(poses,opt)=>({poses,opt:{...opt,rigidApparatus:true}}));
 // In the seated front projection the feet follow the thighs outward/inward,
 // instead of the previous open pose that brought the feet together.
 for(const id of ['hip-abductor','hip-adductor'])edit(id,(poses,opt)=>({poses:poses.map(p=>({...p,a:[p.k[0],p.k[1]+95],a2:[p.k2[0],p.k2[1]+95]})),opt}));
 // Roller contacts rotate with the shin around the anatomical knee, not a
 // moving offset in screen coordinates. The prone curl shares this model.
 edit('lying-legcurl',(poses,opt)=>({poses,opt:{...opt,roller:false,apparatus:'lyingLegCurl',lengths:{...opt.lengths,a:[Math.hypot(115,5),118],a2:[Math.hypot(115,5),118]}}}));
 // Sleds travel on the drawn rails. The plate and carriage have one common
 // displacement; both feet stay together in the side view of the leg press.
 edit('leg-press',([a,b],opt)=>{
  const end=[a.a[0]+90,a.a[1]-90*160/230];
  return {poses:[{...a,a2:a.a,k2:a.k},{...b,a:end,a2:end,k2:b.k}],opt:{...opt,anchors:['a','a2'],lengths:{...opt.lengths,a:[120,120],a2:[120,120]}}};
 });
 edit('hack-squat',([a,b],opt)=>{
  const dy=b.h[1]-a.h[1],dx=dy*210/455;
  const p={...b,...Object.fromEntries(['h','s','e','w'].map(k=>[k,[a[k][0]+dx,a[k][1]+dy]]))};
  return {poses:[a,p],opt};
 });
 // The elliptical pedal and handle targets are evaluated from the actual
 // closed linkage at every phase, not independently interpolated chords.
 edit('elliptical',(frames,opt)=>({poses:frames.map((p,i)=>({...p,k:[410,525],k2:[410,525],e:[405,365],e2:[405,365],...ellipticalTargets(i/frames.length)})),opt:{...opt,targetAt:ellipticalTargets,lengths:{...opt.lengths,a:[115,115],a2:[115,115],w:[75,75],w2:[75,75]}}}));
}
