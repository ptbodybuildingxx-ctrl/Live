// Planar articulated rig for exercise artwork drafts. The model is illustrative,
// not a clinical biomechanical model. Bone lengths are constant throughout a track.
const TAU=2*Math.PI;
const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
export const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const angle=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
const polar=(p,r,a)=>[p[0]+r*Math.cos(a),p[1]+r*Math.sin(a)];
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
const turn=(a,b,t)=>a+(((((b-a+Math.PI)%TAU)+TAU)%TAU)-Math.PI)*t;
const smooth=t=>t*t*(3-2*t);
const same=(a,b)=>distance(a,b)<.001;
const point=(p,k)=>p[k]||p[k.replace(/2$/,'')];
const shoulders=(p,k)=>[p.s[0]+(p.front?(k.endsWith('2')?23:-23):0),p.s[1]+(p.girdle??0)];
const chains=[['h','k','a'],['h','k2','a2'],['s','e','w'],['s','e2','w2']];
const origin=(p,k,end)=>k==='s'?shoulders(p,end):p.h;
const keys=['h','s','k','a','k2','a2','e','w','e2','w2'];
function validatePose(p){for(const k of keys){const v=point(p,k);if(!Array.isArray(v)||v.length!==2||!v.every(Number.isFinite))throw new TypeError('Invalid joint '+k)}}
function boneLengths(poses,root,mid,end){
  // Use authored projected size, not the potentially collapsed lengths of in-between frames.
  const u=poses.map(p=>distance(origin(p,root,end),point(p,mid)));
  const v=poses.map(p=>distance(point(p,mid),point(p,end)));
  const bounds=root==='h'?[85,140]:[48,95];
  return [clamp(Math.max(...u),...bounds),clamp(Math.max(...v),...bounds)];
}
export function compileTrack(poses,{cycle=false,anchors=[],free=[],lengths={},durations,anchorStages={},arcTargets={},targetAt=null}={}){
  if(!Array.isArray(poses)||!poses.length)throw new TypeError('Missing poses');
  poses.forEach(validatePose);
  if(poses.some(p=>Boolean(p.front)!==Boolean(poses[0].front)))throw new TypeError('Change of camera in one track');
  const front=Boolean(poses[0].front),torso=lengths.torso??clamp(Math.max(...poses.map(p=>distance(p.h,p.s))),95,160);
  const bones=chains.map(([r,m,e])=>{
    // Select the bending branch from the most informative keyframe, then keep
    // it for the full track. A mid-cycle branch flip teleports a knee/elbow.
    const bends=poses.map(p=>{const a=origin(p,r,e),b=point(p,m),c=point(p,e);return (c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0])});
    const strongest=bends.reduce((a,b)=>Math.abs(b)>Math.abs(a)?b:a,0);
    return {r,m,e,ls:lengths[e]||boneLengths(poses,r,m,e),side:strongest<0?-1:1,stages:anchorStages[e]||[],anchor:!free.includes(e)&&(anchors.includes(e)||poses.every(p=>same(point(p,e),point(poses[0],e))))};
  });
  // A single keyframe is an intentional hold, not an oscillating animation.
  const segments=cycle?poses.length:Math.max(1,poses.length-1);
  if(durations&&(!Array.isArray(durations)||durations.length!==segments||durations.some(n=>!Number.isFinite(n)||n<=0)))throw new TypeError('Invalid stage durations');
  const times=durations||Array(segments).fill(1),total=times.reduce((a,b)=>a+b,0);
  return {poses,cycle,front,torso,bones,times,total,arcTargets,targetAt,hold:poses.length===1||poses.every(p=>keys.every(k=>same(point(p,k),point(poses[0],k)))&&['handAngle','footTilt','girdle','spineBend'].every(k=>(p[k]??0)===(poses[0][k]??0)))};
}
function solve(root,target,l1,l2,sg){
  const theta=angle(root,target),raw=distance(root,target),d=clamp(raw,Math.abs(l1-l2)+.0001,l1+l2-.0001);
  const end=polar(root,d,theta),x=(l1*l1-l2*l2+d*d)/(2*d),y=Math.sqrt(Math.max(0,l1*l1-x*x));
  const ux=Math.cos(theta),uy=Math.sin(theta);
  return {mid:[root[0]+ux*x-uy*y*sg,root[1]+uy*x+ux*y*sg],end,error:Math.abs(d-raw)};
}
export function sampleTrack(track,phase=0){
  const {poses,cycle,front,torso,bones,hold,times,total,arcTargets,targetAt}=track;
  const u=Number.isFinite(phase)?((phase%1)+1)%1:0;
  const progress=hold?0:cycle?u:1-Math.abs(2*u-1);
  let at=progress*total,i=0;while(i<times.length-1&&at>=times[i]){at-=times[i];i++}
  const t=smooth(clamp(at/times[i],0,1));
  const a=poses[i]||poses[0],b=poses[(i+1)%poses.length]||a;
  const q={front,h:mix(a.h,b.h,t)};
  for(const key of ['handAngle','footTilt','girdle','spineBend'])q[key]=(a[key]??0)+((b[key]??0)-(a[key]??0))*t;
  q.s=polar(q.h,torso,turn(angle(a.h,a.s),angle(b.h,b.s),t));
  const anchors={};
  const targets=targetAt?.(u)||{};
  for(const {r,m,e,ls:[l1,l2],anchor,side,stages} of bones){
    const root=origin(q,r,e),ar=origin(a,r,e),br=origin(b,r,e);
    const am=point(a,m),bm=point(b,m),ae=point(a,e),be=point(b,e);
    const midAngle=turn(angle(ar,am),angle(br,bm),t);
    if(anchor||stages.includes(i)){
      const pivot=arcTargets[e],target=targets[e]||(pivot?polar(pivot,distance(pivot,ae),turn(angle(pivot,ae),angle(pivot,be),t)):mix(ae,be,t)),v=solve(root,target,l1,l2,side);
      q[m]=v.mid;q[e]=v.end;anchors[e]={target,error:v.error};
    }else{
      q[m]=polar(root,l1,midAngle);
      // Interpolate elbow/knee *relative* flexion; avoids a collapsed segment
      // and a reflex-angle jump when the whole arm swings through the axis.
      const relativeA=angle(am,ae)-angle(ar,am),relativeB=angle(bm,be)-angle(br,bm);
      q[e]=polar(q[m],l2,midAngle+turn(relativeA,relativeB,t));
    }
  }
  return {pose:q,anchors,progress,hold};
}
