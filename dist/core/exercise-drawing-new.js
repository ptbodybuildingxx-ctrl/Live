// Local artwork drafts built with the supplied SVG engine's anatomical primitives.
// Not certified exercise instruction. No default or unrelated fallback.
import {xdrawEngine as X} from './xdraw-engine.js';
import {seedExercises} from './exercise-catalog.js';
import {compileTrack,sampleTrack} from './exercise-kinematics.js';
import {applyDrawingCorrections} from './exercise-drawing-corrections.js';
import {applyLegacyTracks} from './exercise-drawing-legacy-tracks.js';
import {applyAnatomyRefinements,hipSwitchGeometry} from './exercise-drawing-anatomy.js';
import {apparatusSvg,mechanismLinks,railGeometry} from './exercise-apparatus.js';
const P=X.primitives;
const A='#39FF88', steel='#7d8985', pad='#27312d';
// Pose coordinates: hip, shoulder, knee, ankle, elbow, wrist, then optional far-side joints.
const stand={h:[340,405],s:[340,280],k:[345,520],a:[340,635],e:[345,358],w:[350,430]};
const pose=(base,changes)=>({...base,...changes});
const drafts=new Map();
const metadata=new Map(seedExercises.map(e=>[e.id,e]));
const add=(id,a,b,opt={})=>drafts.set(id,{a,b,opt});
const still=(id,b,opt={})=>add(id,b,b,opt);
const floor={h:[355,606],s:[230,606],k:[448,510],a:[520,635],e:[200,535],w:[200,474]};
const quad={h:[420,510],s:[285,510],k:[435,635],a:[525,644],e:[280,568],w:[278,638]};
const seat={h:[325,515],s:[325,390],k:[440,515],a:[440,635],e:[330,466],w:[355,510]};
const kneel={h:[350,515],s:[350,390],k:[348,642],a:[445,642],e:[350,465],w:[350,505]};
const front={...stand,front:true,k:[309,520],a:[300,635],e:[300,355],w:[291,430],k2:[370,520],a2:[380,635],e2:[380,355],w2:[389,430]};
const split={...stand,k:[395,525],a:[450,635],k2:[285,530],a2:[225,635]};
const lunge=pose(split,{h:[365,505],s:[365,380],k:[450,505],a:[450,635],k2:[290,620],a2:[225,635],e:[370,450],w:[380,525]});
const bent=pose(stand,{h:[330,430],s:[455,378],k:[355,530],a:[340,635],e:[455,458],w:[455,535]});
const raise=(e,w)=>pose(stand,{e,w});
// Stretching / mobility: individual draft poses, including static holds.
still('doorway-chest',pose(stand,{s:[370,280],h:[350,405],e:[317,275],w:[317,205],k:[395,520],a:[435,635],k2:[306,520],a2:[285,635]}),{wall:312});
still('cross-body-shoulder',pose(front,{e:[400,320],w:[465,320],e2:[440,385],w2:[402,320]}));
still('overhead-triceps-stretch',pose(stand,{e:[340,199],w:[300,278],e2:[402,220],w2:[342,202]}));
still('seated-hamstring-stretch',{...seat,h:[310,620],s:[405,560],k:[435,620],a:[565,628],e:[447,595],w:[500,608],k2:[225,585],a2:[310,630]});
still('standing-quad-stretch',pose(stand,{k2:[335,525],a2:[263,426],e2:[300,375],w2:[266,426]}));
still('wall-calf-stretch',pose(split,{h:[375,405],s:[425,286],e:[465,325],w:[530,300],k:[465,520],a:[480,635],k2:[290,520],a2:[225,635]}),{wall:535});
still('half-kneel-hip-stretch',pose(kneel,{h:[398,505],s:[410,380],k:[335,642],a:[240,642],k2:[510,505],a2:[510,635],e:[440,450],w:[503,493]}));
still('figure-four',pose(floor,{k:[430,505],a:[430,630],k2:[370,490],a2:[435,520],e:[350,550],w:[421,522],e2:[320,535],w2:[395,515]}));
still('butterfly-stretch',{...front,h:[360,621],s:[360,496],k:[243,601],a:[345,640],k2:[477,601],a2:[375,640],e:[295,550],w:[285,600],e2:[425,550],w2:[435,600]});
add('arm-circles',pose(front,{e:[275,265],w:[205,250],e2:[445,265],w2:[515,250]}),pose(front,{e:[320,205],w:[315,129],e2:[400,205],w2:[405,129]}),{loop:'arms'});
add('leg-swing-front',pose(stand,{k2:[286,505],a2:[220,595]}),pose(stand,{k2:[450,465],a2:[540,500]}),{wall:590});
add('leg-swing-side',pose(front,{k2:[390,520],a2:[390,635]}),pose(front,{k2:[455,475],a2:[550,520]}));
add('walking-lunge-rotation',lunge,pose(lunge,{s:[335,380],e:[287,390],w:[227,385],e2:[415,385],w2:[475,390]}));
add('dynamic-inchworm',pose(stand,{h:[320,405],s:[410,495],e:[435,570],w:[465,638],k:[322,520],a:[315,635]}),{h:[340,560],s:[470,555],k:[210,595],a:[105,630],e:[470,612],w:[470,638]});
add('open-book',pose(floor,{h:[340,620],s:[240,620],k:[425,520],a:[505,620],e:[300,580],w:[365,550],e2:[300,580],w2:[365,550]}),pose(floor,{h:[340,620],s:[240,620],k:[425,520],a:[505,620],e:[182,553],w:[118,504],e2:[300,580],w2:[365,550]}));
add('ankle-rocks',split,pose(split,{h:[390,409],s:[390,284],k:[472,520],a:[450,635],k2:[320,530]}),{wall:560});
still('hip-90-90',{...front,h:[360,620],s:[360,495],k:[250,600],a:[250,695],k2:[485,595],a2:[400,530],e:[300,560],w:[275,625],e2:[420,560],w2:[440,625]});
add('thoracic-extension',pose(seat,{s:[325,390],e:[385,335],w:[344,305]}),pose(seat,{s:[276,401],e:[315,327],w:[269,326]}),{bench:[210,525,180],chairBack:[295,400]});
add('scapular-wall-circles',pose(front,{e:[290,335],w:[263,265],e2:[430,335],w2:[457,265]}),pose(front,{e:[295,260],w:[315,185],e2:[425,260],w2:[405,185]}),{wallBehind:true});
add('march-in-place',stand,pose(stand,{k:[444,420],a:[444,530],e:[310,340],w:[260,300],e2:[390,340],w2:[420,370]}));
add('heel-to-toe-rock',stand,pose(stand,{h:[350,390],s:[350,265],k:[350,510],a:[350,615]}),{toe:true});
add('side-step-warmup',front,pose(front,{k2:[440,511],a2:[510,635],h:[395,404],s:[395,280]}));
still('child-pose',{h:[290,570],s:[408,610],k:[380,638],a:[240,645],e:[485,624],w:[555,640]});
still('supine-knee-hug',pose(floor,{k:[335,500],a:[422,550],k2:[365,500],a2:[455,550],e:[282,533],w:[342,505],e2:[300,530],w2:[363,505]}));
// Additional high-priority resistance and bodyweight patterns.
const benchBody={h:[375,485],s:[245,485],k:[465,520],a:[465,635],e:[225,425],w:[225,350]};
const benchPress=(id,body,tool,options={})=>add(id,body,pose(body,{e:[body.s[0],body.s[1]-78],w:[body.s[0],body.s[1]-155]}),{tool,...options});
benchPress('db-floor',pose(floor,{e:[230,540],w:[230,465]}),'db');
benchPress('bb-floor',pose(floor,{e:[230,540],w:[230,465]}),'bar');
const decline=pose(benchBody,{s:[252,520],h:[375,470],e:[245,455],w:[245,380],k:[440,480],a:[490,530]});
benchPress('db-decline',decline,'db',{slant:[205,544,425,460]});
benchPress('bb-decline',decline,'bar',{slant:[205,544,425,460]});
benchPress('db-squeeze-press',benchBody,'db',{bench:[190,505,235],squeeze:true});
benchPress('single-db-bench',pose(benchBody,{e2:[295,486],w2:[368,490]}),'db',{bench:[190,505,235],one:true});
benchPress('smith-bench',benchBody,'bar',{bench:[190,505,235],smith:true});
add('db-incline-fly',{...benchBody,h:[365,505],s:[280,405],e:[180,405],w:[115,390]}, {...benchBody,h:[365,505],s:[280,405],e:[252,330],w:[252,250]},{tool:'db',slant:[240,389,386,530]});
const hang=pose(stand,{h:[355,420],s:[355,295],k:[365,529],a:[350,630],e:[355,214],w:[355,135]});
const pull=pose(hang,{h:[355,310],s:[355,185],k:[365,419],a:[350,520],e:[410,240],w:[355,135]});
add('chin-up',hang,pull,{pullbar:true,grip:'under'});
add('neutral-pull',pose(hang,{w:[370,135]}),pose(pull,{w:[370,135]}),{pullbar:true,grip:'neutral'});
add('scapular-pullup',hang,pose(hang,{h:[355,400],s:[355,275],e:[355,205]}),{pullbar:true});
add('assisted-pullup',pose(hang,{k:[355,515],a:[425,515]}),pose(pull,{k:[355,405],a:[425,405]}),{pullbar:true,assist:true});
const plank={h:[340,555],s:[467,555],k:[220,592],a:[100,630],e:[467,605],w:[467,639]};
add('close-pushup',plank,pose(plank,{h:[340,602],s:[467,601],e:[525,578]}));
add('archer-pushup',pose(plank,{e2:[420,605],w2:[340,639]}),pose(plank,{h:[340,602],s:[467,601],e:[525,578],e2:[402,601],w2:[340,639]}));
add('body-triceps',pose(stand,{h:[325,440],s:[409,345],k:[280,540],a:[235,635],e:[455,305],w:[515,255]}),pose(stand,{h:[345,455],s:[435,365],k:[280,540],a:[235,635],e:[510,350],w:[515,255]}),{wall:520});
add('wall-handstand',{h:[390,340],s:[390,465],k:[390,220],a:[390,100],e:[390,545],w:[390,635]},{h:[390,387],s:[390,512],k:[390,267],a:[390,147],e:[455,570],w:[390,635]},{wall:410});
add('wall-slide',pose(front,{e:[290,320],w:[290,245],e2:[430,320],w2:[430,245]}),pose(front,{e:[315,210],w:[320,132],e2:[405,210],w2:[400,132]}),{wallBehind:true});
const rowEnd=pose(bent,{e:[385,380],w:[380,460]});
add('db-bent-row',bent,rowEnd,{tool:'db'});
add('db-supported-row',pose(bent,{h:[330,445],s:[455,400],e2:[500,470],w2:[535,510]}),pose(rowEnd,{h:[330,445],s:[455,400],e2:[500,470],w2:[535,510]}),{tool:'db',bench:[490,520,135],one:true});
add('bb-under-row',bent,rowEnd,{tool:'bar'});
add('pendlay-row',pose(bent,{s:[455,451],e:[455,530],w:[455,610]}),pose(bent,{s:[455,451],e:[375,440],w:[405,512]}),{tool:'bar'});
add('db-renegade',plank,pose(plank,{e:[390,555],w:[390,615],e2:[467,605],w2:[467,639]}),{tool:'db',one:true});
add('bb-shrug',stand,pose(stand,{s:[340,265],e:[345,343],w:[350,415]}),{tool:'bar'});
add('db-seated-lateral',seat,pose(seat,{e:[401,390],w:[470,390]}),{tool:'db',bench:[250,535,125]});
add('db-rear',bent,pose(bent,{e:[380,345],w:[310,315]}),{tool:'db'});
add('db-supported-rear',pose(bent,{h:[365,510],s:[440,405],e:[440,485],w:[440,555]}),pose(bent,{h:[365,510],s:[440,405],e:[367,370],w:[300,340]}),{tool:'db',slant:[330,521,455,410]});
add('bb-seated-overhead',pose(seat,{e:[380,390],w:[380,310]}),pose(seat,{e:[325,312],w:[325,235]}),{tool:'bar',bench:[250,535,130]});
add('bb-pushpress',pose(stand,{h:[340,430],s:[340,305],k:[375,525],e:[380,305],w:[380,231]}),pose(stand,{e:[340,201],w:[340,125]}),{tool:'bar'});
add('db-preacher',pose(seat,{e:[395,460],w:[450,520]}),pose(seat,{e:[395,460],w:[395,385]}),{tool:'db',bench:[250,535,130],slant:[350,420,425,495]});
add('db-reverse-curl',stand,raise([345,358],[350,280]),{tool:'db'});
add('ez-curl',stand,raise([345,358],[350,280]),{tool:'ez'});
add('db-wrist',pose(seat,{e:[405,495],w:[480,515]}),pose(seat,{e:[405,495],w:[480,480]}),{tool:'db',bench:[250,535,130]});
add('bb-wrist-curl',pose(seat,{e:[405,495],w:[480,515]}),pose(seat,{e:[405,495],w:[480,480]}),{tool:'bar',bench:[250,535,130]});
add('db-skull',pose(benchBody,{e:[245,407],w:[165,407]}),pose(benchBody,{e:[245,407],w:[245,330]}),{tool:'db',bench:[190,505,235]});
add('split-squat',split,lunge);
add('forward-lunge',stand,lunge);
add('reverse-lunge',stand,lunge,{reverse:true});
add('db-split',split,lunge,{tool:'db'});
add('db-lunge',stand,lunge,{tool:'db'});
add('db-calf',stand,pose(stand,{h:[340,385],s:[340,260],k:[345,500],a:[340,615],e:[345,338],w:[350,410]}),{tool:'db',toe:true});
const squat=pose(stand,{h:[300,525],s:[350,410],k:[410,520],a:[340,635],e:[400,400],w:[390,350]});
add('bb-front-squat',pose(stand,{e:[415,290],w:[350,260]}),squat,{tool:'bar'});
add('bb-zercher',pose(stand,{e:[400,360],w:[350,312]}),pose(squat,{e:[405,470],w:[360,415]}),{tool:'bar'});
add('bb-goodmorning',pose(stand,{e:[285,285],w:[325,260]}),pose(bent,{e:[400,350],w:[438,361]}),{tool:'bar'});
add('db-single-rdl',stand,pose(bent,{k2:[205,430],a2:[100,430]}),{tool:'db'});
add('dead-bug',pose(floor,{k:[455,525],a:[530,525],e:[230,530],w:[230,455],k2:[455,525],a2:[530,525],e2:[230,530],w2:[230,455]}),pose(floor,{k:[455,525],a:[530,525],k2:[475,605],a2:[600,605],e:[230,530],w:[230,455],e2:[157,590],w2:[80,590]}));
add('reverse-crunch',floor,pose(floor,{h:[330,565],k:[300,485],a:[385,495]}));
add('hanging-knee',hang,pose(hang,{k:[455,420],a:[455,530]}),{pullbar:true});
add('db-side-bend',front,pose(front,{s:[410,295],e2:[440,367],w2:[445,445]}),{tool:'db',one:true});
add('db-weighted-crunch',pose(floor,{e:[280,565],w:[265,535]}),pose(floor,{s:[260,530],e:[320,500],w:[300,465]}),{tool:'db'});
add('db-scaptation',stand,raise([410,280],[477,255]),{tool:'db'});
add('half-kneel-db-press',pose(kneel,{e:[392,390],w:[392,310]}),pose(kneel,{e:[350,312],w:[350,235]}),{tool:'db',one:true});
add('bb-front-raise',stand,raise([420,280],[495,280]),{tool:'bar'});
add('cable-front-raise',stand,raise([420,280],[495,280]),{tool:'cable',anchor:[160,615]});
add('db-zottman',stand,raise([345,358],[350,280]),{tool:'db'});
add('pallof-press',pose(front,{e:[310,350],w:[360,340],e2:[410,350],w2:[360,340]}),pose(front,{e:[310,280],w:[360,255],e2:[410,280],w2:[360,255]}),{tool:'cable',anchor:[120,340]});
add('cossack-squat',front,pose(front,{h:[430,510],s:[430,385],k2:[520,520],a2:[520,635],k:[295,575],a:[170,635]}));
add('bb-thruster',squat,pose(stand,{e:[340,201],w:[340,125]}),{tool:'bar'});
const invert={h:[365,555],s:[245,505],k:[475,600],a:[575,638],e:[245,427],w:[245,349]};
const invEnd=pose(invert,{h:[365,470],s:[245,420],e:[310,445]});
add('inverted-row',invert,invEnd,{rack:[245,349]});
add('supinated-row',pose(invert,{w:[260,349]}),pose(invEnd,{w:[260,349]}),{rack:[260,349]});
const prone={h:[315,618],s:[440,618],k:[195,630],a:[90,637],e:[505,608],w:[580,608]};
add('prone-y',prone,pose(prone,{e:[500,570],w:[565,535]}));
add('prone-t',pose(prone,{e:[438,550],w:[438,475]}),pose(prone,{e:[438,505],w:[438,430]}));
const rowSeat=pose(seat,{h:[312,520],s:[312,395],k:[423,558],a:[530,575],e:[392,410],w:[468,420]});
add('wide-cable-row',rowSeat,pose(rowSeat,{e:[252,420],w:[325,435]}),{bench:[240,535,130],tool:'cable',anchor:[580,420]});
add('cable-single-row',rowSeat,pose(rowSeat,{e:[238,425],w:[312,445]}),{bench:[240,535,130],tool:'cable',anchor:[580,420],one:true});
const pullSeat=pose(seat,{e:[325,315],w:[325,240]});
add('neutral-pulldown',pullSeat,pose(pullSeat,{e:[395,395],w:[395,320]}),{bench:[250,535,130],tool:'cable',anchor:[325,130]});
add('under-pulldown',pose(pullSeat,{w:[350,240]}),pose(pullSeat,{e:[395,395],w:[355,330]}),{bench:[250,535,130],tool:'cable',anchor:[350,130]});
add('high-row',pose(seat,{e:[385,350],w:[460,300]}),pose(seat,{e:[285,435],w:[360,400]}),{bench:[250,535,130],tool:'cable',anchor:[575,210]});
add('landmine-press',pose(stand,{e:[395,350],w:[440,300]}),pose(stand,{e:[405,235],w:[470,190]}),{landmine:true});
add('db-step',stand,pose(stand,{h:[410,330],s:[410,205],k:[465,440],a:[465,540],k2:[350,460],a2:[340,575],e:[415,283],w:[420,355]}),{tool:'db',step:[415,559,125]});
add('sumo-deadlift',pose(front,{h:[360,520],s:[360,395],k:[235,520],a:[210,635],k2:[485,520],a2:[510,635],e:[350,465],w:[350,545],e2:[370,465],w2:[370,545]}),pose(front,{a:[210,635],a2:[510,635],k:[285,520],k2:[435,520],e:[350,355],w:[350,433],e2:[370,355],w2:[370,433]}),{tool:'bar'});
add('lying-legcurl',{...prone,h:[340,515],s:[465,515],k:[225,510],a:[110,515],e:[510,540],w:[555,545]}, {...prone,h:[340,515],s:[465,515],k:[225,510],a:[200,395],e:[510,540],w:[555,545]},{bench:[180,535,365],roller:true});
add('calf-machine',stand,pose(stand,{h:[340,385],s:[340,260],k:[345,500],a:[340,615],e:[345,338],w:[350,410]}),{toe:true,calf:true});
add('bb-rollout',pose(kneel,{h:[350,515],s:[410,405],e:[472,465],w:[520,600]}),{h:[355,580],s:[475,560],k:[280,642],a:[180,642],e:[542,585],w:[610,600]},{rollerBar:true});
const gaitA=pose(split,{h:[345,405],s:[345,280],k:[390,522],a:[445,635],k2:[285,520],a2:[225,635],e:[290,340],w:[260,400],e2:[390,345],w2:[430,300]});
const gaitB=pose(gaitA,{k:[285,520],a:[225,635],k2:[390,522],a2:[445,635],e:[390,345],w:[430,300],e2:[290,340],w2:[260,400]});
add('walking',gaitA,gaitB);
add('jogging',pose(gaitA,{h:[345,390],s:[355,265],k:[430,475],a:[455,582],k2:[265,475],a2:[210,565]}),pose(gaitB,{h:[345,390],s:[355,265],k2:[430,475],a2:[455,582],k:[265,475],a:[210,565]}));
const boxer=pose(split,{e:[385,335],w:[392,255],e2:[305,335],w2:[335,250]});
add('shadow-box',boxer,pose(boxer,{e:[420,285],w:[498,285]}));
add('db-suitcase',pose(gaitA,{e:[345,358],w:[345,433]}),pose(gaitB,{e:[345,358],w:[345,433]}),{tool:'db',one:true});
add('db-farmer',pose(gaitA,{e:[345,358],w:[330,433],e2:[355,358],w2:[365,433]}),pose(gaitB,{e:[345,358],w:[330,433],e2:[355,358],w2:[365,433]}),{tool:'db'});
add('treadmill',gaitA,gaitB,{treadmill:true});
add('stair-climber',pose(gaitA,{k:[405,468],a:[455,548],k2:[315,520],a2:[340,625]}),pose(gaitA,{k2:[405,468],a2:[455,548],k:[315,520],a:[340,625]}),{steps:true});
add('cable-high-fly',pose(front,{e:[265,268],w:[195,245],e2:[455,268],w2:[525,245]}),pose(front,{e:[310,360],w:[350,410],e2:[410,360],w2:[370,410]}),{tool:'cable',anchor:[120,135],secondAnchor:[600,135]});
add('db-elbow-out-row',bent,pose(bent,{e:[400,320],w:[420,400]}),{tool:'db'});
add('meadows-row',bent,pose(bent,{e:[380,340],w:[385,425]}),{landmine:true});
add('machine-pullover',pose(seat,{e:[325,310],w:[325,235]}),pose(seat,{e:[405,420],w:[440,480]}),{bench:[250,535,130],machinePivot:[325,215]});
add('cable-rear-fly',pose(front,{e:[325,305],w:[365,300],e2:[395,305],w2:[355,300]}),pose(front,{e:[265,280],w:[190,280],e2:[455,280],w2:[530,280]}),{tool:'cable',anchor:[600,300],secondAnchor:[120,300]});
add('cable-reverse-pushdown',pose(stand,{e:[365,355],w:[440,355]}),pose(stand,{e:[365,355],w:[365,430]}),{tool:'cable',anchor:[480,145]});
// Source mapping is retained for provenance; corrected tracks take precedence
// in the preview, but the original file and original scene indices remain intact.
export const newDrawingIds=Object.freeze([...drafts.keys()]);
applyDrawingCorrections(drafts);
applyLegacyTracks(drafts);
applyAnatomyRefinements(drafts);
export const correctedSourceIds=Object.freeze([...drafts.keys()].filter(id=>!newDrawingIds.includes(id)));
export const revisedTrackIds=Object.freeze([...drafts].filter(([,d])=>d.revised).map(([id])=>id));
export const legacyTrackIds=Object.freeze([...drafts].filter(([,d])=>d.legacyReauthored).map(([id])=>id));
const tracks=new Map([...drafts].map(([id,d])=>[id,compileTrack(d.frames||[d.a,d.b],d.opt)]));
export const drawingTrackInfo=id=>tracks.has(id)?{static:tracks.get(id).hold,cycle:tracks.get(id).cycle}:null;
export function drawingPose(id,phase){
  if(id==='hip-90-90')return hipSwitchGeometry(phase);
  const track=tracks.get(id);return track?sampleTrack(track,phase):null;
}
export function drawingMechanism(id,phase){
  const d=drafts.get(id);if(!d)return [];
  return mechanismLinks(drawingPose(id,phase).pose,d.opt,phase);
}
export function drawingRail(id,phase){const d=drafts.get(id);return d?railGeometry(drawingPose(id,phase).pose,d.opt):null;}
// A planted hand is drawn from the wrist down to a flat palm on its support.
// Raised hands (e.g. alternating bird-dog) retain their free-hand silhouette.
export function drawingHandContact(id,phase){
  const d=drafts.get(id);if(!d)return [];
  const {pose:q}=drawingPose(id,phase),surface=d.opt.groundHands?659:d.opt.handSurface;
  if(surface===undefined)return [];
  const far=Boolean(d.a.k2||d.b.k2||d.a.e2||d.b.e2||d.frames?.some(p=>p.k2||p.e2));
  return (far?['w','w2']:['w']).filter(key=>surface-q[key][1]>=8&&surface-q[key][1]<=30).map(key=>({key,wrist:q[key],surface,palm:[q[key][0]+12,surface],fingers:[q[key][0]+31,surface]}));
}
// Draw with the same skin, contour, shoes, gradients, grid and accent as the source.
export function newDrawingFrame(id,phase=0,theme='dark'){
  const d=drafts.get(id);if(!d)return null;P.reset();
  const {a,b,opt}=d,{pose:q,progress:t,limbs}=drawingPose(id,phase);
  const {h,s,k,a:ank,e,w,k2,a2,e2,w2}=q,dir=P.ang(h,s)*Math.PI/180,hp=P.add(s,[Math.cos(dir)*44,Math.sin(dir)*44]);
  let svg=P.bgl('','','')+(opt.overheadView?'':P.L([45,659],[675,659],4,steel,.55));
  if(opt.overheadView)svg+=P.R(100,90,520,570,'#101d15',18,steel);
  if(opt.wall)svg+=P.R(opt.wall,100,12,559,pad,2,steel);
  if(opt.wallBehind)svg+=P.R(245,102,230,557,'none',8,steel);
  if(opt.bench){const [x,y,ww]=opt.bench;svg+=P.R(x,y,ww,20,pad,6,steel)+P.L([x+22,y+20],[x+22,656],10,steel)+P.L([x+ww-28,y+20],[x+ww-28,656],10,steel)}
  if(opt.chairBack)svg+=P.L(opt.chairBack,[opt.chairBack[0],535],18,pad);
  if(opt.slant){const [x,y,xx,yy]=opt.slant;svg+=P.L([x,y],[xx,yy],22,pad)+P.L([xx,yy],[xx,655],10,steel)}
  if(opt.legLock){const [x,y]=opt.legLock;svg+=P.L([x,y],[x,655],9,steel)+P.C([x,y],22,pad,steel,3)+P.C([x-28,y-70],20,pad,steel,3)}
  if(opt.declineSupport){const {upper,lower,radius}=opt.declineSupport;svg+=P.L([435,457],[475,437],11,steel)+P.L([475,437],upper,10,steel)+P.L([475,437],lower,10,steel)+P.C(upper,radius,pad,steel,3)+P.C(lower,radius,pad,steel,3)}
  if(opt.chestPad){const [x,y,ww,hh]=opt.chestPad;svg+=P.R(x,y,ww,hh,pad,6,steel)+P.L([x+ww/2,y+hh],[x+ww/2,655],10,steel)}
  if(opt.armRest){const [x,y,ww]=opt.armRest;svg+=P.R(x,y,ww,20,pad,6,steel)+P.L([x+30,y+20],[x+30,655],8,pad)}
  if(opt.inclineIndicator)svg+=P.L([300,554],[420,473],16,pad);
  if(opt.pullbar){svg+=P.L([160,135],[560,135],10,steel)+P.L([160,135],[160,655],8,pad)+P.L([560,135],[560,655],8,pad);if(opt.grip==='neutral')for(const x of [330,390])svg+=P.L([x,118],[x,155],10,steel)}
  if(opt.rack){const [x,y]=opt.rack;svg+=P.L([x-100,y],[x+100,y],10,steel)+P.L([x-100,y],[x-100,655],9,pad)}
  if(opt.step){const [x,y,ww]=opt.step;svg+=P.R(x,y,ww,659-y,pad,6,steel)}
  if(opt.treadmill)svg+=P.R(165,641,390,20,pad,6,steel)+P.L([530,640],[530,330],10,steel)+P.R(485,302,90,30,pad,5,steel);
  if(opt.steps)for(let i=0;i<3;i++)svg+=P.R(300+i*55,630-i*40,120,30,pad,4,steel);
  if(opt.calf)svg+=P.L([280,655],[280,195],10,pad)+P.L([280,195],[385,195],10,steel)+P.L([340,195],[340,s[1]],8,steel)+P.R(315,s[1]-15,60,15,pad,4,steel);
  if(opt.roller)svg+=P.L([145,535],[ank[0],ank[1]],8,steel)+P.C(ank,19,pad,steel,3);
  if(opt.rollerBar)svg+=P.C(w,36,pad,steel,4)+P.C(w,8,steel);
  if(opt.landmine){const pivot=opt.landminePivot||[165,644];svg+=P.L([pivot[0]-26,655],[pivot[0]+26,655],9,pad)+P.C(pivot,10,steel,A,2)+P.L(pivot,w,9,steel)+P.C(w,16,steel,A,3);}
  if(opt.machinePivot)svg+=P.L([opt.machinePivot[0]-60,655],opt.machinePivot,12,pad)+P.C(opt.machinePivot,18,steel)+P.L(opt.machinePivot,w,10,steel);
  if(opt.assist)svg+=P.R(290,k[1]+18,160,18,pad,6,steel)+P.L([360,k[1]+36],[360,655],8,steel);
  if(opt.kneelingAssist){const y=k[1]+16;svg+=P.L([190,655],[190,137],12,steel)+P.L([190,137],[395,137],12,steel)+P.C([395,137],9,steel,pad,3)+P.L([175,655],[230,655],12,steel)+P.R(178,y+5,25,35,steel,4,pad)+P.L([190,y+23],[292,y+23],12,steel)+P.R(215,y,170,18,pad,6,steel)+P.R(150,575,80,16,pad,4,steel)+P.L([555,655],[555,137],8,pad)+P.L([190,137],[555,137],5,steel)+P.R(526,490,58,165,pad,4,steel);for(let j=0;j<7;j++)svg+=P.L([530,506+j*20],[580,506+j*20],2,steel);}
  if(opt.smith)svg+=P.L([270-35,120],[270-35,655],9,steel)+P.L([270+35,120],[270+35,655],9,steel);
  if(opt.tool==='cable'){const x=opt.anchor||[120,340];svg+=P.L([x[0],110],[x[0],655],10,pad)+P.C(x,13,steel)+P.L(x,w,3,steel)}
  if(opt.secondAnchor){const x=opt.secondAnchor;svg+=P.L([x[0],110],[x[0],655],10,pad)+P.C(x,13,steel)+P.L(x,w2,3,steel)}
  svg+=apparatusSvg(P,q,opt,phase);
  const far=(a.k2||b.k2||a.e2||b.e2||d.frames?.some(p=>p.k2||p.e2)),f=q.a2,nearS=P.add(s,[a.front?-23:0,q.girdle]),farS=P.add(s,[a.front?23:0,q.girdle]);
  const shoeEnd=(p)=>P.add(p,[a.front?0:(opt.footDirection??(opt.floor&&id.includes('plank')?-1:1))*26,opt.rocking?8+q.footTilt*20:opt.toe?19:10]);
  const curvedTorso=()=>{
    const dx=s[0]-h[0],dy=s[1]-h[1],len=Math.hypot(dx,dy),n=[-dy/len,dx/len],m=P.mid(h,s);
    const offset=(pt,value)=>P.add(pt,n,value),bend=offset(m,q.spineBend);
    const l=offset(h,23),r=offset(h,-23),l2=offset(s,22),r2=offset(s,-22);
    return `<path d="M ${l.join(' ')} Q ${offset(bend,32).join(' ')} ${l2.join(' ')} Q ${s.join(' ')} ${r2.join(' ')} Q ${offset(bend,-27).join(' ')} ${r.join(' ')} Q ${offset(h,-3).join(' ')} ${l.join(' ')} Z" fill="#cdb59f" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/><path d="M ${h.join(' ')} Q ${bend.join(' ')} ${s.join(' ')}" stroke="#8d7766" stroke-width="3" fill="none"/>`+P.C(s,18,'#cdb59f','#0c1210',2)+P.L(s,hp,22,'#cdb59f');
  };
  const handContacts=drawingHandContact(id,phase);
  const hand=(p,key)=>{
    const c=handContacts.find(x=>x.key===key);
    if(!c)return P.hand(p);
    const [x,y]=p,z=c.surface;
    return '<path d="M '+(x-9)+' '+y+' Q '+(x-10)+' '+(z-12)+' '+(x+1)+' '+z+' L '+(x+31)+' '+z+' Q '+(x+39)+' '+(z-5)+' '+(x+28)+' '+(z-9)+' L '+(x+10)+' '+(z-10)+' L '+(x+8)+' '+y+' Z" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5" stroke-linejoin="round"/>';
  };
  const legHip=limbs?.[0].projected.hip||h,farHip=limbs?.[1].projected.hip||h;
  if(far)svg+='<g opacity=".78">'+P.limb(farHip,k2,34)+P.limb(k2,f,28)+P.shorts(farHip,k2)+P.shoe(f,shoeEnd(f))+P.limb(farS,e2,26)+P.limb(e2,w2,22)+hand(w2,'w2')+'</g>';
  svg+=P.limb(legHip,k,36)+P.limb(k,ank,28)+P.shorts(legHip,k)+P.shoe(ank,shoeEnd(ank))+(d.frames?.some(p=>p.spineBend!==undefined)?curvedTorso():P.torso(h,s,hp))+(a.front?P.frontHead(hp):P.head(hp,[Math.sin(-dir),Math.cos(dir)]))+P.limb(nearS,e,26)+P.limb(e,w,22);
  // Broad muscle-group accent, not an anatomical activation measurement.
  const meta=metadata.get(id),group=meta?.muscle==='stretch'?meta.secondary?.[0]:meta?.muscle;
  const areas={chest:[P.mid(s,h,.2),17,24,P.ang(s,h)-90],back:[P.mid(s,h,.38),17,30,P.ang(s,h)-90],shoulders:[nearS,15,16,0],arms:[P.mid(nearS,e),11,22,P.ang(nearS,e)-90],legs:[P.mid(h,k,.6),15,25,P.ang(h,k)-90],core:[P.mid(h,s,.36),15,23,P.ang(h,s)-90]};
  const calf=(j,foot)=>[P.mid(j,foot,.35),12,24,P.ang(j,foot)-90];
  if(id==='wall-calf-stretch')svg+=P.muscle(...calf(k2,a2),.55,'p');
  else if(meta?.pattern==='calf')svg+=P.muscle(...calf(k,ank),.35+t*.45,'p');
  else if(id==='standing-quad-stretch')svg+=P.muscle(P.mid(h,k2,.65),14,23,P.ang(h,k2)-90,.55,'p');
  else if(meta?.muscle==='stretch'){if(['doorway-chest','cross-body-shoulder','overhead-triceps-stretch','seated-hamstring-stretch','butterfly-stretch'].includes(id)&&areas[group])svg+=P.muscle(...areas[group],.55,'p')}
  else if(opt.wristMotion)svg+=P.muscle(P.mid(e,w),11,25,P.ang(e,w)-90,.65,'p');
  else if(areas[group])svg+=P.muscle(...areas[group],.35+t*.45,'p');
  const palm=opt.wristMotion?P.add(w,[18*Math.cos(q.handAngle),-18*Math.sin(q.handAngle)]):w;
  const mixRotation=phase<.35?0:phase<.5?(phase-.35)/.15:phase<.85?1:(1-phase)/.15;
  const gripAngle=opt.gripRotation?(id==='db-arnold'?t:Math.max(0,Math.min(1,mixRotation)))*Math.PI*.5:opt.grip==='neutral'?Math.PI*.5:opt.grip==='over'?Math.PI*.25:0;
  const db=(p)=>{const off=[24*Math.sin(gripAngle),24*Math.cos(gripAngle)];return P.L(P.add(p,off,-1),P.add(p,off),7,steel)+P.C(P.add(p,off,-1),13,steel,A,2)+P.C(P.add(p,off),13,steel,A,2)};
  if(opt.tool==='db'){svg+=db(palm);if(!opt.one&&far)svg+=db(w2)}
  if(opt.tool==='goblet')svg+=db(palm);
  if(opt.hipBar)svg+=P.C(h,33,steel,A,3)+P.C(h,9,pad,steel,2);
  if(opt.tool==='bar'||opt.tool==='ez'){
    if(opt.zercherBar)svg+=P.C(e,29,steel,A,2)+P.C(e,8,pad,steel,2);
    else if(opt.frontRack){const axis=P.add(s,[24,2]);svg+=P.C(axis,29,steel,A,2)+P.C(axis,8,pad,steel,2)+P.L(w,axis,12,'#d9c4b0')+P.hand(axis);}
    else if(opt.shoulderBar)svg+=P.C(P.add(s,[-14,4]),32,steel,A,2)+P.C(P.add(s,[-14,4]),8,pad,steel,2);
    else if(a.front&&far){
      const l=w[0]<w2[0]?palm:w2,r=w[0]<w2[0]?w2:palm,center=P.mid(l,r),left=P.add(l,[-64,0]),right=P.add(r,[64,0]),rad=opt.plateRadius||19;
      if(opt.tool==='ez')svg+=P.L(left,l,7,steel)+P.L(l,P.add(center,[-18,12]),7,steel)+P.L(P.add(center,[-18,12]),P.add(center,[18,12]),7,steel)+P.L(P.add(center,[18,12]),r,7,steel)+P.L(r,right,7,steel);
      else svg+=P.L(left,right,7,steel);
      svg+=P.C(P.add(left,[10,0]),rad,steel,A,2)+P.C(P.add(right,[-10,0]),rad,steel,A,2);
    }else svg+=P.C(palm,opt.plateRadius||24,steel,A,2)+P.C(palm,7,pad,steel,2);
  }
  if(opt.wristMotion)svg+=P.L(w,palm,14,'#d9c4b0');
  if(!opt.frontRack)svg+=hand(palm,'w');
  if(opt.grip)svg+=P.L(P.add(palm,[-7,opt.grip==='under'?5:-5]),P.add(palm,[7,opt.grip==='under'?5:-5]),2,'#8d7766');
  // Supplemental mini projection illustrates grip/arm relationship that is
  // otherwise hidden in a side elevation. It is never used as the main pose.
  if(opt.gripInset){
    const mode=opt.gripInset,x=570,y=158;
    svg+='<g opacity=".92">'+P.R(470,75,200,168,'#101d15',10,steel);
    if(['bike','rotate','scaption'].includes(mode)){
      const twist=mode==='bike'?Math.cos(phase*Math.PI*2):mode==='rotate'?t:0;
      const center=[x,y],left=[x-28,y-17-13*twist],right=[x+28,y-17+13*twist];
      svg+=P.R(x-25,y-14,50,60,'#cdb59f',9)+P.C([x,y-40],14,'#cdb59f',pad,2)+P.L(left,right,13,'#cdb59f');
      if(mode==='scaption'){
        for(const side of [-1,1]){
          const shoulder=[x+side*28,y-17],hand=[x+side*75,y-17-40*t];
          svg+=P.L(shoulder,hand,10,'#cdb59f')+P.C(hand,8,steel,A,2)+P.L(shoulder,[x+side*75,y-17],2,steel,.6);
        }
      }else if(mode==='bike'){
        const k=[x-25*twist,y+54],heel=[x+45*twist,y+77];
        svg+=P.L([x,y+35],k,13,'#cdb59f')+P.L(k,[x-54*twist,y+77],9,'#cdb59f')+P.L([x,y+35],heel,10,'#cdb59f')+P.L(left,[x+35*twist,y+7],10,'#cdb59f')+P.L(right,[x-35*twist,y+7],10,'#cdb59f');
      }else{
        const lx=[x-70,y-17-20*twist],rx=[x+70,y-17+20*twist];
        svg+=P.L(left,lx,10,'#cdb59f')+P.L(right,rx,10,'#cdb59f')+P.guide(`M ${x-65} ${y+55} Q ${x} ${y+82} ${x+65} ${y+55}`);
      }
      svg+='</g>';
    }else{
    const shift=mode==='archer'?(t-.5)*30:0;
    svg+=P.L([x-28+shift,y-12],[x+28+shift,y-12],15,'#cdb59f')+P.R(x-28+shift,y-12,56,47,'#cdb59f',8)+P.C([x+shift,y-37],15,'#cdb59f',pad,2);
    const gap=mode==='close'?13:mode==='squeeze'?12:mode==='wide'?69:mode==='pressDb'?55:mode==='fly'?65-53*t:mode==='rear'?12+53*t:mode==='archer'?60:mode==='neutral'?20:32;
    const l=[x-gap,y-16],r=[x+gap,y-16];
    const elbowLeft=mode==='archer'?[x-45,y-14+(1-t)*28]:[x-47,y+12],elbowRight=mode==='archer'?[x+45,y-14+t*28]:[x+47,y+12];
    svg+=P.L([x-27+shift,y-10],elbowLeft,12,'#cdb59f')+P.L(elbowLeft,l,9,'#cdb59f')+P.L([x+27+shift,y-10],elbowRight,12,'#cdb59f')+P.L(elbowRight,r,9,'#cdb59f');
    if(['squeeze','fly','shoulder','rear','pressDb'].includes(mode)){const tiny=p=>P.L(P.add(p,[0,-12]),P.add(p,[0,12]),5,steel)+P.C(P.add(p,[0,-12]),8,steel,A,2)+P.C(P.add(p,[0,12]),8,steel,A,2);svg+=tiny(l)+tiny(r)}
    else if(mode==='neutral')svg+=P.L(P.add(l,[0,-15]),P.add(l,[0,15]),7,steel)+P.L(P.add(r,[0,-15]),P.add(r,[0,15]),7,steel);
    else if(!id.includes('pushup')&&!id.includes('push-up'))svg+=P.L(P.add(l,[-12,0]),P.add(r,[12,0]),6,steel);
    svg+=P.C(l,7,'#d9c4b0',pad,2)+P.C(r,7,'#d9c4b0',pad,2)+'</g>';
    }
  }
  if(t>0&&a.w!==b.w&&!opt.cycle&&a.w[0]!==b.w[0])svg+=P.guide('M'+a.w.join(',')+' L'+b.w.join(','));
  return P.wrap(svg,theme);
}
