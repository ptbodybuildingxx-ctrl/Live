import test from 'node:test';
import assert from 'node:assert/strict';
import {seedExercises} from '../dist/core/exercise-catalog.js';
import {drawingInfo,drawingFrame,sourceDrawingFrame,missingDrawingIds,suppliedMatches,suppliedSceneCount} from '../dist/core/exercise-drawings.js';
import {newDrawingIds,correctedSourceIds,legacyTrackIds,drawingPose,drawingMechanism,drawingHandContact,drawingRail} from '../dist/core/exercise-drawing-new.js';
import {ellipticalGeometry} from '../dist/core/exercise-apparatus.js';
import {distance} from '../dist/core/exercise-kinematics.js';
import {drawingPreview} from '../dist/core/xdraw-ui.js';
test('all 200 original catalog entries have explicit artwork drafts with stable unique IDs',()=>{
  assert.equal(suppliedSceneCount,143);assert.equal(suppliedMatches.length,91);
  assert.equal(newDrawingIds.length,109);assert.deepEqual(missingDrawingIds,[]);
  assert.equal(new Set([...suppliedMatches,...newDrawingIds]).size,200);
  for(const e of seedExercises)assert.equal(drawingInfo(e.id).status,'draft');
  assert.equal(drawingInfo('unknown'),null);assert.equal(drawingFrame('unknown'),null);
});
test('SVG frames are finite, local, text-free and compatible with both themes',()=>{
  for(const e of seedExercises)for(const theme of ['dark','light'])for(const phase of [0,.23,.45,.73,.99])for(const wrong of drawingInfo(e.id).wrongMode?[false,true]:[false]){
    const s=drawingFrame(e.id,phase,wrong,theme);
    assert.ok(s.startsWith('<svg '),e.id);assert.ok(s.endsWith('</svg>'),e.id);
    assert.doesNotMatch(s,/NaN|Infinity|undefined|<text\b|<script|<foreignObject|\bon\w+\s*=|\b(?:href|src)\s*=\s*["'](?:https?:|javascript:)/i,e.id);
  }
});
test('preview is explicitly labelled a draft and user-controlled',()=>{
  const html=drawingPreview(x=>x,'db-bench','en','Bench');
  assert.match(html,/draft/);assert.match(html,/data-drawing-play/);assert.match(html,/type="range"/);
  assert.equal(drawingInfo('db-floor').wrongMode,false);
});
test('articulated tracks preserve all projected bone lengths, close loops and avoid joint jumps',()=>{
  const ids=[...newDrawingIds,...correctedSourceIds];
  for(const id of ids){
    // The seated hip switch has a true 3D rig; its projected lengths vary
    // with perspective. Test its anatomical lengths separately below.
    if(id==='hip-90-90')continue;
    const lengths=p=>{
      const ns=[p.s[0]-(p.front?23:0),p.s[1]+p.girdle],fs=[p.s[0]+(p.front?23:0),p.s[1]+p.girdle];
      return [[p.h,p.s],[p.h,p.k],[p.k,p.a],[p.h,p.k2],[p.k2,p.a2],[ns,p.e],[p.e,p.w],[fs,p.e2],[p.e2,p.w2]].map(([a,b])=>distance(a,b));
    };
    const first=drawingPose(id,0).pose,expected=lengths(first);let previous=first;
    for(let i=0;i<=200;i++){
      const {pose:p,anchors}=drawingPose(id,i/200);
      for(const [j,len] of lengths(p).entries())assert.ok(Math.abs(len-expected[j])<1e-6,id+' bone '+j);
      for(const [k,pos] of Object.entries(p))if(Array.isArray(pos)){
        assert.ok(pos[0]>=25&&pos[0]<=695&&pos[1]>=45&&pos[1]<=659,id+' joint '+k+' is out of bounds');
        assert.ok(distance(previous[k],pos)<21,id+' discontinuity '+k+' at '+i);
      }
      for(const [key,{error}] of Object.entries(anchors))assert.ok(error<5,id+' anchor '+key+' '+error);
      previous=p;
    }
    assert.deepEqual(previous,first,id+' loop closure');
    assert.equal(drawingInfo(id).status,'draft');
    assert.equal(drawingInfo(id).geometry,'rigged');
  }
});
test('hip 90/90 switches sides with stable feet, constant 3D limb lengths and knee flexion',()=>{
  const first=drawingPose('hip-90-90',0),last=drawingPose('hip-90-90',.5),mid=drawingPose('hip-90-90',.25);
  const len=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
  let prev=first;
  for(let i=0;i<=200;i++){
    const p=drawingPose('hip-90-90',i/200);
    for(const [j,l] of p.limbs.entries()){
      assert.deepEqual(l.ankle,first.limbs[j].ankle);assert.deepEqual(l.hip,first.limbs[j].hip);
      assert.ok(Math.abs(len(l.hip,l.knee)-110)<1e-6);assert.ok(Math.abs(len(l.knee,l.ankle)-110)<1e-6);
      assert.ok(Math.abs(len(l.hip,l.ankle)/110-Math.SQRT2)<1e-6);
      assert.ok(l.knee[2]>=16.99);assert.ok(len(l.knee,prev.limbs[j].knee)<10);
    }
    for(const v of Object.values(p.pose))if(Array.isArray(v))assert.ok(v[0]>=25&&v[0]<=695&&v[1]>=45&&v[1]<=659);
    prev=p;
  }
  assert.deepEqual(prev.pose,first.pose);
  for(const [j,l] of first.limbs.entries()){
    assert.ok(l.knee[0]<l.hip[0]);assert.ok(last.limbs[j].knee[0]>l.hip[0]);assert.ok(mid.limbs[j].knee[2]>l.knee[2]+60);
  }
});
test('decline pads, assisted kneeling and front rack keep their revised support geometry',()=>{
  for(let i=0;i<=200;i++){
    const t=i/200;
    for(const id of ['db-decline','bb-decline']){const {pose:p}=drawingPose(id,t);assert.ok(distance(p.a,[543,428])>35);assert.ok(distance(p.k,[454,375])>35);assert.match(drawingFrame(id,t),/cx="454" cy="375"/);}
    const {pose:p}=drawingPose('assisted-pullup',t);assert.ok(Math.abs(p.k[1]-p.a[1])<1e-6);assert.ok(Math.abs(p.k[0]-p.h[0])<1e-6);assert.ok(distance(p.w,[395,137])<1e-6);
    const {pose:q}=drawingPose('bb-front-squat',t);assert.ok(q.e[1]<q.s[1]);assert.ok(distance(q.w,[q.s[0]+24,q.s[1]+2])<20);
  }
});
test('static holds stay still, similar movement variants remain distinct, and original mapping is retained',()=>{
  for(const id of ['plank','side-plank','doorway-chest','wall-calf-stretch','child-pose']){
    assert.equal(drawingInfo(id).static,true,id);
    assert.equal(drawingFrame(id,0),drawingFrame(id,.5),id);
  }
  assert.equal(drawingInfo('hip-90-90').static,false);
  assert.notEqual(drawingFrame('hip-90-90',0),drawingFrame('hip-90-90',.5));
  assert.notDeepEqual(drawingPose('forward-lunge',.5).pose,drawingPose('reverse-lunge',.5).pose);
  assert.notEqual(drawingFrame('db-wrist',0),drawingFrame('db-wrist',.5));
  assert.equal(drawingInfo('db-bench').scene,1);
  assert.equal(drawingInfo('db-bench').wrongMode,false);
  assert.equal(drawingInfo('leg-press').geometry,'rigged');
  assert.equal(correctedSourceIds.length,91);
});
test('all 75 remaining original mappings are re-authored without losing source access',()=>{
  assert.equal(legacyTrackIds.length,75);
  assert.equal(new Set([...newDrawingIds,...correctedSourceIds]).size,200);
  for(const e of seedExercises){
    const info=drawingInfo(e.id);
    assert.equal(info.geometry,'rigged',e.id);
    assert.equal(info.wrongMode,false,e.id);
    if(!info.static)assert.ok(new Set([0,.125,.25,.375,.5,.625,.75,.875].map(p=>drawingFrame(e.id,p))).size>1,e.id);
    if(info.kind==='supplied')assert.ok(sourceDrawingFrame(e.id,0).startsWith('<svg '),e.id);
    else assert.equal(sourceDrawingFrame(e.id),null);
  }
});
test('all 200 exercise preview sequences remain distinguishable',()=>{
  const distinct=new Map();
  for(const exercise of seedExercises){
    const sequence=[0,.25,.5,.75].map(p=>drawingFrame(exercise.id,p)).join('');
    assert.ok(!distinct.has(sequence),exercise.id+' duplicates '+distinct.get(sequence));
    distinct.set(sequence,exercise.id);
  }
});
test('projected joints avoid the acute-overlap screening thresholds across all 200 tracks',()=>{
  // Artwork screening only: these numbers are not clinical ROM thresholds.
  const internal=(a,b,c)=>{
    const u=a.map((x,i)=>x-b[i]),v=c.map((x,i)=>x-b[i]);
    return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/Math.hypot(...u)/Math.hypot(...v))))*180/Math.PI;
  };
  for(const {id} of seedExercises)for(let i=0;i<=200;i++){
    const q=drawingPose(id,i/200).pose,s1=[q.s[0]-(q.front?23:0),q.s[1]+q.girdle],s2=[q.s[0]+(q.front?23:0),q.s[1]+q.girdle];
    for(const [a,b,c,threshold] of [[q.h,q.k,q.a,30],[q.h,q.k2,q.a2,30],[s1,q.e,q.w,25],[s2,q.e2,q.w2,25]])assert.ok(internal(a,b,c)>=threshold,id+' at '+i/200);
  }
});
test('seven corrected machine mechanisms have fixed-length reachable articulated links',()=>{
  for(const id of ['machine-chest','machine-incline','machine-row','machine-shoulder','machine-lateral','high-row','machine-pullover'])for(let i=0;i<=200;i++){
    const links=drawingMechanism(id,i/200);assert.ok(links.length,id);
    for(const l of links){
      assert.ok(l.reachable,id);
      const pts=l.joint?[l.pivot,l.joint,l.end]:[l.pivot,l.end];
      assert.ok(pts.every(p=>p.every(x=>x>=0&&x<=720)),id);
      l.lengths.forEach((len,j)=>assert.ok(Math.abs(distance(pts[j],pts[j+1])-len)<1e-6,id));
      assert.deepEqual(l.end,drawingPose(id,i/200).pose[l.key]);
    }
  }
});
test('pedal crank stays at fixed radius and opposite phase',()=>{
  for(let i=0;i<=200;i++){
    const p=drawingPose('stationary-bike',i/200).pose,pivot=[410,555];
    assert.ok(Math.abs(distance(p.a,pivot)-43)<1e-6);
    assert.ok(Math.abs(distance(p.a2,pivot)-43)<1e-6);
    assert.ok(Math.abs(distance(p.a,p.a2)-86)<1e-6);
  }
});
test('twelve additional apparatus tracks preserve rigid link lengths, fixed pivots and actual hand/pad contacts',()=>{
  const ids=['pec-deck','reverse-pec','leg-extension','seated-legcurl','lying-legcurl','hip-abductor','hip-adductor','machine-crunch','elliptical','landmine-press','meadows-row','tbar-row'];
  for(const id of ids){
    const first=drawingMechanism(id,0);assert.ok(first.length,id);
    for(let i=0;i<=400;i++){
      const t=i/400,links=drawingMechanism(id,t),p=drawingPose(id,t).pose;
      assert.equal(links.length,first.length,id);
      for(const [j,l] of links.entries()){
        assert.ok(l.reachable,id+' '+i+' '+l.key);assert.deepEqual(l.lengths,first[j].lengths,id);
        const pts=l.joint?[l.pivot,l.joint,l.end]:[l.pivot,l.end];
        assert.ok(pts.every(v=>v.every(x=>x>=0&&x<=720)),id);
        l.lengths.forEach((n,k)=>assert.ok(Math.abs(distance(pts[k],pts[k+1])-n)<1e-6,id));
        if(id!=='elliptical')assert.ok(distance(l.pivot,first[j].pivot)<1e-6,id+' pivot drift');
        if(['e','e2','w'].includes(l.key))assert.ok(distance(l.end,p[l.key])<1e-6,id+' contact');
        if(l.key==='roller'){
          assert.ok(distance(l.end,p.a)>23&&distance(l.end,p.a)<27,id+' shin pad');
          assert.ok(distance(l.pivot,p.k)<1e-6,id+' knee pivot');
        }
        if(l.key.endsWith('Pad'))assert.ok(Math.abs(distance(l.end,p[l.key.slice(0,-3)])-Math.hypot(7,22))<1e-6,id+' thigh pad');
      }
    }
  }
  const closed=drawingPose('hip-abductor',0).pose,open=drawingPose('hip-abductor',.5).pose;
  assert.ok(distance(open.a,open.a2)>distance(closed.a,closed.a2)+30);
  for(const [id,phase] of [['pec-deck',.5],['reverse-pec',0]]){
    const p=drawingPose(id,phase).pose;
    assert.ok(Math.abs(p.w[1]-p.s[1])<50&&Math.abs(p.w2[1]-p.s[1])<50,id+' chest-height closure');
  }
});
test('elliptical rear cranks, 205-unit pedal rods and rockers remain coupled to both hands and feet',()=>{
  for(let i=0;i<=400;i++){
    const t=i/400,g=ellipticalGeometry(t),p=drawingPose('elliptical',t).pose;
    assert.ok(Math.abs(distance(g[0].c,g[1].c)-60)<1e-6);
    for(const x of g){
      assert.ok(Math.abs(distance(x.j,x.w)-285)<1e-6);
      assert.ok(distance(x.a,p[x.footKey])<1e-6);
      assert.ok(distance(x.w,p[x.handKey])<1e-6);
      assert.ok(Math.abs(distance(x.c,x.mid)-102.5)<1e-6);
      assert.ok(Math.abs(distance(x.j,x.mid)-102.5)<1e-6);
    }
  }
});
test('leg press and hack squat stay on their guide rails with constant offsets and no contact drift',()=>{
  for(const id of ['leg-press','hack-squat']){
    const first=drawingRail(id,0),p0=drawingPose(id,0).pose;
    assert.ok(distance(first.contact,drawingRail(id,.5).contact)>40,id);
    for(let i=0;i<=400;i++){
      const t=i/400,r=drawingRail(id,t),p=drawingPose(id,t).pose;
      assert.ok(Math.abs(r.off-first.off)<1e-6,id);
      assert.ok(Math.abs(distance(r.start,r.cart)+distance(r.cart,r.end)-distance(r.start,r.end))<1e-6,id);
      if(id==='leg-press')assert.ok(distance(p.a,p.a2)<1e-6,id);
      else{
        assert.ok(distance(p.a,p0.a)<1e-6,id);
        for(const key of ['s','e','w'])assert.ok(Math.hypot(...p[key].map((x,j)=>x-p.h[j]-p0[key][j]+p0.h[j]))<1e-6,id+' '+key);
      }
    }
  }
});
test('planted hands reach the depicted support while lifted bird-dog hands are not planted',()=>{
  for(const id of ['push-up','wide-push-up','close-pushup','archer-pushup','pike-pushup','bird-dog','cat-cow','mountain-climber','dynamic-inchworm','incline-push-up','decline-push-up','wall-handstand'])for(let i=0;i<=200;i++){
    const contacts=drawingHandContact(id,i/200);
    assert.ok(contacts.length,id+' at '+i/200);
    for(const c of contacts)assert.equal(c.palm[1],c.surface,id);
  }
  assert.equal(drawingHandContact('bird-dog',.25).length,1);
});
