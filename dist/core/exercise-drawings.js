// Explicit mapping from MUSCLIVO LIVE stable IDs to the supplied xdraw scene indices.
// Never substitute an unrelated drawing based solely on a similar exercise name.
import {xdrawEngine as X} from './xdraw-engine.js';
import {seedExercises} from './exercise-catalog.js';
import {newDrawingIds,newDrawingFrame,correctedSourceIds,drawingTrackInfo} from './exercise-drawing-new.js';

const sourceMap=Object.freeze({
  'seated-legcurl':0,'db-bench':1,'lat-pulldown':2,'db-incline':3,'db-fly':4,'db-shoulder':5,'cable-row':6,'db-curl':7,'bar-pushdown':8,'bb-back-squat':9,'bb-rdl':10,'leg-press':11,'leg-extension':12,'body-calf':13,'crunch':14,'db-front':15,'push-up':16,'pull-up':17,'bb-overhead':18,'chest-dip':19,'bb-hipthrust':21,'bb-row':22,'db-shrug':23,'plank':24,'bb-curl':27,'db-overhead-triceps':29,'cable-glute-kickback':30,'cable-crunch':31,'face-pull':32,'db-pullover':33,'tbar-row':35,'straight-pulldown':36,'db-lateral':38,'cable-fly':39,'cable-lateral':40,'bb-bench':42,'bb-incline':43,'bb-close-bench':44,'deadlift':45,'db-goblet':46,'db-rdl':47,'db-hammer':48,'db-cross-hammer':49,'db-concentration':50,'db-incline-curl':51,'db-kickback':52,'db-row':53,'db-bulgarian':54,'ez-extension':55,'bb-reverse':56,'bb-preacher':57,'cable-curl':58,'rope-pushdown':60,'cable-overhead-triceps':61,'cable-low-fly':63,'db-arnold':64,'machine-chest':65,'machine-incline':66,'pec-deck':67,'reverse-pec':68,'machine-shoulder':69,'machine-lateral':70,'machine-row':71,'hack-squat':72,'hip-abductor':73,'hip-adductor':74,'machine-curl':75,'machine-triceps':76,'machine-crunch':77,'seated-calf':78,'burpee':79,'mountain-climber':80,'jumping-jack':81,'high-knees':82,'side-plank':84,'bird-dog':85,'cat-cow':87,'stationary-bike':89,'rowing-machine':90,'elliptical':91,'pike-pushup':121,'incline-push-up':123,'decline-push-up':124,'body-squat':125,'step-up':127,'bicycle-crunch':129,'single-bridge':132,'db-thruster':134,'bench-dip':135,'wide-push-up':136,'glute-bridge':138
});
const newIds=new Set(newDrawingIds);
const correctedIds=new Set(correctedSourceIds);
const sourceWithoutWrong=new Set(['jumping-jack','cat-cow']);
export const suppliedSceneCount=X.count;
export const suppliedMatches=Object.freeze(Object.keys(sourceMap));
export const missingDrawingIds=Object.freeze(seedExercises.filter(r=>!Object.hasOwn(sourceMap,r.id)&&!newIds.has(r.id)).map(r=>r.id));
export function drawingInfo(id){
  const track=drawingTrackInfo(id);
  return Object.hasOwn(sourceMap,id)?{kind:'supplied',scene:sourceMap[id],corrected:correctedIds.has(id),wrongMode:!correctedIds.has(id)&&!sourceWithoutWrong.has(id),status:'draft',static:track?.static||false,geometry:track?'rigged':'legacy-review-pending'}:newIds.has(id)?{kind:'new',wrongMode:false,status:'draft',static:track?.static||false,geometry:'rigged'}:null;
}
export function drawingFrame(id,phase=0,wrong=false,theme='dark'){const info=drawingInfo(id);if(!info)return null;return info.kind==='supplied'&&!info.corrected?X.frame(info.scene,phase,info.wrongMode&&wrong,theme):newDrawingFrame(id,phase,theme)}
// Original assets are preserved for reviewer comparison; never substituted
// for the corrected draft automatically, including the error variant.
export function sourceDrawingFrame(id,phase=0,wrong=false,theme='dark'){
  return Object.hasOwn(sourceMap,id)?X.frame(sourceMap[id],phase,Boolean(wrong),theme):null;
}
