// Individual re-authored tracks for the remaining original catalog mappings.
// Source scene IDs remain in exercise-drawings.js for provenance and comparison.
// These are planar artwork drafts, not anatomical certification.
const V=(x,y)=>[x,y];
const copy=(p,d)=>({...p,...d});
const rad=d=>d*Math.PI/180;
const polar=(p,l,d)=>[p[0]+l*Math.cos(rad(d)),p[1]+l*Math.sin(rad(d))];
const L={a:[115,115],a2:[115,115],w:[75,75],w2:[75,75],torso:125};
const stand={h:V(335,407),s:V(335,282),k:V(335,522),a:V(335,637),e:V(335,357),w:V(335,432)};
const front=copy(stand,{front:true,h:V(360,407),s:V(360,282),k:V(344,521),a:V(333,635),k2:V(376,521),a2:V(387,635),e:V(337,357),w:V(337,432),e2:V(383,357),w2:V(383,432)});
const seat={h:V(330,522),s:V(330,397),k:V(445,522),a:V(445,637),e:V(330,472),w:V(405,472)};
const fseat=copy(front,{h:V(360,510),s:V(360,385),k:V(305,545),a:V(305,635),k2:V(415,545),a2:V(415,635),e:V(337,460),w:V(337,535),e2:V(383,460),w2:V(383,535)});
const arm=(p,u,f,far=false)=>{
  const s=p.front?V(p.s[0]+(far?23:-23),p.s[1]):p.s,e=polar(s,75,u),w=polar(e,75,f);
  return far?copy(p,{e2:e,w2:w}):copy(p,{e,w});
};
const arms=(p,u,f,u2,f2)=>arm(arm(p,u,f),u2,f2,true);
const leg=(p,u,f,far=false)=>{
  const k=polar(p.h,115,u),a=polar(k,115,f);
  return far?copy(p,{k2:k,a2:a}):copy(p,{k,a});
};
const translate=(p,x,y)=>{
  const q={...p};for(const k of ['h','s','k','a','e','w','k2','a2','e2','w2'])if(p[k])q[k]=V(p[k][0]+x,p[k][1]+y);
  return q;
};
const seatEquip={bench:[265,543,180],chairBack:[303,390]};
const fseatEquip={bench:[278,541,164]};
export function applyLegacyTracks(drafts){
  const set=(id,frames,opt={})=>{
    if(drafts.has(id))throw new Error('Track already exists: '+id);
    drafts.set(id,{a:frames[0],b:frames.at(-1),frames,opt:{lengths:L,...opt},revised:true,legacyReauthored:true});
  };
  // Bodyweight pressing: distinguish support heights without changing feet/hand
  // position during a rep; elbows bend while torso moves as a rigid segment.
  const pushA={h:V(330,535),s:V(445,486),k:V(220,585),a:V(125,637),e:V(450,560),w:V(450,635)};
  const pushB=copy(pushA,{h:V(330,595),s:V(454,587),e:V(510,590)});
  set('push-up',[pushA,pushB],{anchors:['a','w'],footDirection:-1});
  const incA=copy(pushA,{h:V(310,500),s:V(406,420),a:V(125,637),k:V(218,566),e:V(457,474),w:V(510,525)});
  set('incline-push-up',[incA,copy(incA,{h:V(325,550),s:V(444,512),e:V(495,462)})],{bench:[480,540,134],anchors:['a','w'],footDirection:-1});
  const decA=copy(pushA,{h:V(330,497),s:V(455,487),k:V(215,500),a:V(100,500),w:V(455,637)});
  set('decline-push-up',[decA,copy(decA,{h:V(318,545),s:V(440,575),e:V(510,605)})],{bench:[65,520,146],anchors:['a','w'],footDirection:-1});
  const pressStart=arm(seat,68,-26),pressEnd=arm(seat,0,0);
  set('machine-chest',[pressStart,pressEnd],{...seatEquip,apparatus:'chestPress'});
  const inclineBody=copy(seat,{s:V(294,402)});
  set('machine-incline',[arm(inclineBody,42,-58),arm(inclineBody,-35,-35)],{bench:seatEquip.bench,slant:[270,401,311,535],apparatus:'inclinePress'});
  const flyA=arms(fseat,192,175,-12,5),flyB=arms(fseat,130,-40,50,220);
  set('pec-deck',[flyA,flyB],{...fseatEquip,apparatus:'pecDeck'});
  const cableA=arms(front,190,175,-10,5),cableB=arms(front,130,-40,50,220);
  set('cable-fly',[cableA,cableB],{tool:'cable',anchor:V(130,255),secondAnchor:V(590,255)});
  set('cable-low-fly',[arms(front,115,115,65,65),arms(front,210,-45,-30,225)],{tool:'cable',anchor:V(125,620),secondAnchor:V(595,620)});

  // Pulls: wrist is locked to the bar for pull-up; cables and machine handles
  // follow the authored wrists. Source variants have different grips/equipment.
  const hang=copy(front,{h:V(360,407),s:V(360,282),k:V(325,505),a:V(285,603),k2:V(395,505),a2:V(435,603),e:V(282,216),w:V(260,137),e2:V(438,216),w2:V(460,137)});
  const hangA=translate(hang,0,-17);hangA.w=V(275,137);hangA.w2=V(445,137);
  const hangB=copy(translate(hangA,0,-105),{w:hangA.w,w2:hangA.w2,e:V(245,205),e2:V(475,205)});
  set('pull-up',[hangA,hangB],{pullbar:true,grip:'over',anchors:['w','w2'],lengths:{...L,w:[82,82],w2:[82,82]}});
  const hinge={h:V(320,442),s:V(440,407),k:V(377,528),a:V(345,637),e:V(440,482),w:V(440,557)};
  const handRow=copy(hinge,{k2:V(270,535),a2:V(165,535),e2:V(493,460),w2:V(530,522)});
  set('db-row',[handRow,copy(handRow,{e:V(367,399),w:V(410,461)})],{tool:'db',one:true,bench:[135,535,420],anchors:['w2','a','a2']});
  set('bb-row',[arm(hinge,90,90),arm(hinge,195,55)],{tool:'bar',anchors:['a']});
  set('tbar-row',[arm(hinge,85,85),arm(hinge,170,55)],{landmine:true,anchors:['a']});
  const pullover={h:V(405,445),s:V(280,445),k:V(505,520),a:V(505,635),e:V(280,370),w:V(280,295)};
  set('db-pullover',[arm(pullover,270,270),arm(pullover,195,180)],{tool:'db',one:true,bench:[205,467,235],anchors:['a']});
  const shrugA=arm(stand,90,90),shrugB=copy(shrugA,{girdle:-18,e:V(335,339),w:V(335,414)});
  set('db-shrug',[shrugA,shrugB],{tool:'db',shoulderLift:true});
  // Shrug uses the shoulder-girdle offset rather than shortening the trunk.
  const rowSeat=copy(seat,{h:V(305,516),s:V(305,391),k:V(405,554),a:V(504,610)});
  const rowStart=arm(rowSeat,3,3),rowEnd=arm(rowSeat,160,20);
  set('machine-row',[rowStart,rowEnd],{bench:[255,537,125],chestPad:[330,390,24,120],apparatus:'rowMachine'});
  set('cable-row',[rowStart,rowEnd],{bench:[255,537,125],tool:'cable',anchor:V(570,415),apparatus:'cableRow'});
  const latA=arm(seat,275,275),latB=arm(seat,30,265);
  set('lat-pulldown',[latA,latB],{...seatEquip,tool:'cable',anchor:V(355,120),apparatus:'latPulldown'});
  set('straight-pulldown',[arm(stand,300,300),arm(stand,70,85)],{tool:'cable',anchor:V(530,155)});
  // Shoulders: preserve the elbow angle during raises and use bilateral views
  // where grip width and symmetry are essential.
  const pike={h:V(275,455),s:V(375,530),k:V(215,550),a:V(150,637),e:V(420,580),w:V(465,637)};
  set('pike-pushup',[pike,copy(pike,{h:V(292,485),s:V(395,556),e:V(460,565)})],{anchors:['a','w'],footDirection:-1});
  const spA=arms(fseat,156,270,24,270),spB=arms(fseat,252,270,288,270);
  set('db-shoulder',[spA,spB],{tool:'db',...fseatEquip});
  set('db-lateral',[arms(front,98,98,82,82),arms(front,183,180,-3,0)],{tool:'db'});
  set('db-front',[arm(stand,90,90),arm(stand,0,0)],{tool:'db'});
  set('bb-overhead',[arm(stand,22,270),arm(stand,270,270)],{tool:'bar'});
  set('machine-shoulder',[spA,spB],{...fseatEquip,apparatus:'shoulderPress'});
  set('machine-lateral',[arms(fseat,100,100,80,80),arms(fseat,180,180,0,0)],{...fseatEquip,apparatus:'lateralMachine'});
  set('cable-lateral',[arms(front,98,98,82,82),arms(front,180,180,82,82)],{tool:'cable',anchor:V(515,625)});
  set('reverse-pec',[flyB,flyA],{...fseatEquip,apparatus:'reversePec'});
  set('face-pull',[arm(stand,0,0),arm(stand,195,-15)],{tool:'cable',anchor:V(565,280),gripInset:'rear',apparatus:'rope'});
  // Arms. The forearm rotates around fixed elbow rather than the shoulder.
  const curl=(id,p,tool,opt={},u=90,start=84,end=-82)=>set(id,[arm(p,u,start),arm(p,u,end)],{tool,...opt});
  curl('db-curl',stand,'db',{grip:'under'});
  curl('db-hammer',stand,'db',{grip:'neutral'});
  const inclineCurl=copy(seat,{s:V(263,416)});
  curl('db-incline-curl',inclineCurl,'db',{grip:'under',slant:[242,430,337,541],bench:[300,543,155]},100,90,-75);
  const conc=copy(seat,{h:V(310,523),s:V(406,443)});
  curl('db-concentration',conc,'db',{one:true,grip:'under',bench:[250,543,155]},65,85,-85);
  set('db-overhead-triceps',[arm(stand,270,160),arm(stand,270,270)],{tool:'db',one:true});
  set('db-kickback',[arm(hinge,165,82),arm(hinge,165,165)],{tool:'db',one:true});
  curl('bb-curl',stand,'bar',{grip:'under'});
  const preacher=copy(seat,{h:V(300,522),s:V(335,402)});
  curl('bb-preacher',preacher,'bar',{bench:[235,543,145],armRest:[376,454,108],grip:'under'},45,45,-95);
  curl('machine-curl',preacher,null,{bench:[235,543,145],armRest:[376,454,108],apparatus:'armCurl'},45,45,-95);
  curl('cable-curl',stand,'cable',{anchor:V(500,620),grip:'under'});
  const pushdownA=arm(stand,85,0),pushdownB=arm(stand,85,90);
  set('rope-pushdown',[pushdownA,pushdownB],{tool:'cable',anchor:V(450,155),apparatus:'rope'});
  set('bar-pushdown',[pushdownA,pushdownB],{tool:'cable',anchor:V(450,155),apparatus:'shortBar'});
  set('machine-triceps',[arm(seat,85,-5),arm(seat,85,90)],{...seatEquip,apparatus:'armExtension'});
  const dips={h:V(390,510),s:V(365,387),k:V(475,555),a:V(560,637),e:V(325,450),w:V(305,510)};
  set('bench-dip',[dips,copy(dips,{h:V(395,575),s:V(370,452),e:V(295,440)})],{bench:[170,523,151],anchors:['a','w']});
  const crossA=arms(front,90,85,90,85),crossB=arm(crossA,80,-30);
  const crossC=arm(crossA,100,210,true);
  set('db-cross-hammer',[crossA,crossB,crossA,crossC],{tool:'db',grip:'neutral',cycle:true});
  set('cable-overhead-triceps',[arm(stand,285,160),arm(stand,285,285)],{tool:'cable',anchor:V(155,555)});

  // Lower body. Keep soles, step deck, pad and bar references tied to the
  // support surfaces; weighted variants carry a distinct load.
  const squatDown=copy(stand,{h:V(282,526),s:V(338,414),k:V(409,537),a:V(335,637)});
  const bodyA=arm(stand,20,0),bodyB=arm(squatDown,310,0);
  set('body-squat',[bodyA,bodyB],{anchors:['a']});
  set('db-goblet',[arm(stand,45,260),arm(squatDown,45,260)],{tool:'goblet',one:true,anchors:['a']});
  set('bb-back-squat',[arm(stand,135,265),arm(squatDown,135,265)],{tool:'bar',hipBar:false,shoulderBar:true,anchors:['a']});
  const stepA=copy(stand,{k:V(401,435),a:V(470,520),k2:V(335,522),a2:V(335,637)});
  const stepB=copy(translate(stand,135,-117),{a:V(470,520),a2:V(470,520),k2:V(460,410)});
  set('step-up',[stepA,stepB],{step:[405,542,145],anchors:['a','a2']});
  const bridge={h:V(385,635),s:V(260,635),k:V(455,548),a:V(520,637),e:V(335,630),w:V(392,635)};
  const bridgeUp=copy(bridge,{h:V(346,545),s:V(260,635),k:V(461,545),e:V(335,635)});
  set('glute-bridge',[bridge,bridgeUp],{floor:true,anchors:['a','w']});
  set('single-bridge',[leg(bridge,310,310,true),leg(bridgeUp,310,310,true)],{floor:true,anchors:['a','w'],free:['a2']});
  set('body-calf',[stand,copy(translate(stand,0,-20),{footTilt:1})],{rocking:true});
  const rdlTop=arm(stand,90,90),rdlBottom=arm(copy(hinge,{h:V(290,427),s:V(411,396),k:V(340,530),a:V(335,637)}),90,90);
  set('db-rdl',[rdlTop,rdlBottom],{tool:'db',anchors:['a']});
  set('bb-rdl',[rdlTop,rdlBottom],{tool:'bar',anchors:['a']});
  const bulgA=copy(stand,{h:V(350,435),s:V(350,310),k:V(405,535),a:V(430,637),k2:V(283,526),a2:V(218,527)});
  const bulgB=copy(bulgA,{h:V(340,522),s:V(340,397),k:V(430,522),k2:V(283,597),e:V(343,472),w:V(343,547)});
  set('db-bulgarian',[bulgA,bulgB],{tool:'db',bench:[125,548,120],anchors:['a','a2']});
  const deadLow=arm(copy(stand,{h:V(275,535),s:V(374,459),k:V(387,535),a:V(335,637)}),90,90);
  set('deadlift',[deadLow,rdlBottom,rdlTop],{tool:'bar',plateRadius:50,anchors:['a']});
  const thrustA={h:V(385,592),s:V(265,555),k:V(485,522),a:V(505,637),e:V(337,575),w:V(385,592)};
  const thrustB=copy(thrustA,{h:V(390,538),s:V(265,555),k:V(505,522),e:V(338,540),w:V(390,538)});
  set('bb-hipthrust',[thrustA,thrustB],{bench:[175,573,100],hipBar:true,anchors:['a']});
  const lpA={h:V(275,520),s:V(177,442),k:V(388,510),a:V(365,430),e:V(225,492),w:V(287,537)};
  const lpB=copy(lpA,{k:V(370,450),a:V(455,377)});
  set('leg-press',[lpA,lpB],{slant:[154,460,280,544],bench:[225,542,145],apparatus:'legPress',anchors:['a']});
  const hackA=copy(stand,{h:V(368,400),s:V(315,287),a:V(465,637),k:V(425,515),e:V(342,342),w:V(385,400)});
  const hackB=copy(hackA,{h:V(408,513),s:V(355,400),k:V(510,536),e:V(385,452),w:V(425,510)});
  set('hack-squat',[hackA,hackB],{apparatus:'hackSquat',anchors:['a'],lengths:{...L,a:[125,135],a2:[125,135]}});
  const legSeat=copy(seat,{h:V(310,490),s:V(310,365),k:V(425,490),a:V(425,605),e:V(345,430),w:V(390,475)});
  const extend=copy(legSeat,{a:V(540,490)});
  set('leg-extension',[legSeat,extend],{bench:[251,511,174],chairBack:[281,359],apparatus:'legExtension'});
  set('seated-legcurl',[extend,legSeat],{bench:[251,511,174],chairBack:[281,359],apparatus:'legCurl'});
  set('seated-calf',[seat,copy(seat,{a:V(445,617),footTilt:1})],{...seatEquip,apparatus:'seatedCalf',rocking:true});
  const hipsClosed=copy(fseat,{h:V(360,455),s:V(360,330),k:V(335,535),a:V(335,625),k2:V(385,535),a2:V(385,625),e:V(300,390),w:V(300,465),e2:V(420,390),w2:V(420,465)});
  const hipsOpen=leg(leg(hipsClosed,145,52),35,128,true);
  set('hip-abductor',[hipsClosed,hipsOpen],{apparatus:'abductor',bench:[275,477,170],lengths:{...L,a:[90,95],a2:[90,95]}});
  set('hip-adductor',[hipsOpen,hipsClosed],{apparatus:'adductor',bench:[275,477,170],lengths:{...L,a:[90,95],a2:[90,95]}});
  const kickA=copy(stand,{h:V(350,414),s:V(395,297),e:V(447,350),w:V(490,410),k:V(350,526),a:V(350,637),k2:V(355,526),a2:V(355,637)});
  const kickB=leg(kickA,145,145,true);
  set('cable-glute-kickback',[kickA,kickB],{tool:'ankleCable',anchor:V(515,620),rack:[490,410],anchors:['a','w']});

  // Floor, conditioning, and cyclic equipment. Use alternate limbs and
  // multiple distinct key poses rather than a single pendulum pose.
  const quad={h:V(330,522),s:V(450,487),k:V(330,637),a:V(215,637),e:V(450,562),w:V(450,637),k2:V(330,637),a2:V(215,637),e2:V(450,562),w2:V(450,637)};
  const dogA=leg(arm(quad,0,0),180,180,true),dogB=leg(arm(quad,0,0,true),180,180);
  set('bird-dog',[quad,dogA,quad,dogB],{floor:true,cycle:true,anchors:['a','a2','w','w2']});
  const crunchA={h:V(390,635),s:V(265,635),k:V(455,545),a:V(515,637),e:V(215,578),w:V(277,548),spineBend:0};
  const crunchB=copy(crunchA,{s:V(285,568),e:V(264,493),w:V(335,518),spineBend:24});
  set('crunch',[crunchA,crunchB],{floor:true,anchors:['a']});
  const kneel={h:V(345,522),s:V(345,397),k:V(345,637),a:V(235,637),e:V(395,349),w:V(335,303),spineBend:0};
  const kneelB=copy(kneel,{s:V(455,463),e:V(498,402),w:V(423,395),spineBend:25});
  set('cable-crunch',[kneel,kneelB],{tool:'cable',anchor:V(505,175),anchors:['a']});
  set('machine-crunch',[copy(seat,{e:V(391,448),w:V(390,372),spineBend:0}),copy(seat,{s:V(417,432),e:V(470,481),w:V(480,407),spineBend:24})],{...seatEquip,apparatus:'abCrunch'});
  const jackClosed=arms(front,90,90,90,90),jackOpen=arms(copy(front,{h:V(360,445),s:V(360,320),k:V(283,540),a:V(230,637),k2:V(437,540),a2:V(490,637)}),225,250,315,290);
  const jackFlight=copy(translate(jackClosed,0,-32),{a:V(283,580),a2:V(437,580)});
  set('jumping-jack',[jackClosed,jackFlight,jackOpen,jackFlight],{cycle:true,anchors:['a','a2']});
  const climb={h:V(330,535),s:V(455,487),k:V(220,585),a:V(125,637),e:V(455,562),w:V(455,637),k2:V(220,585),a2:V(125,637),e2:V(455,562),w2:V(455,637)};
  const climbA=copy(climb,{k:V(405,539),a:V(340,637)}),climbB=copy(climb,{k2:V(405,539),a2:V(340,637)});
  set('mountain-climber',[climbA,climb,climbB,climb],{cycle:true,anchors:['w','w2','a','a2'],footDirection:-1});
  const burpeeSquat=copy(squatDown,{e:V(398,468),w:V(447,521)});
  const burpeeFloor=copy(climb,{h:V(330,588),s:V(455,585),e:V(525,611),e2:V(525,611)});
  const jump=arm(translate(stand,0,-42),300,300);
  // The hands travel freely during the jump/standing transition; retaining an
  // IK hand target there would cross the shoulder and flip the elbow branch.
  set('burpee',[stand,burpeeSquat,climb,burpeeFloor,climb,burpeeSquat,jump],{cycle:true,footDirection:-1,anchors:['a','a2'],free:['w','w2'],anchorStages:{w:[2,3],w2:[2,3]},durations:[1,1,1,1,1,1.45,1.3]});
  const bike={h:V(305,440),s:V(393,351),k:V(405,512),a:V(405,605),e:V(454,391),w:V(502,435),k2:V(405,512),a2:V(405,605),e2:V(454,391),w2:V(502,435)};
  const ped=(cx,cy,rx,ry,i)=>V(cx+rx*Math.cos(i*Math.PI/4),cy+ry*Math.sin(i*Math.PI/4));
  const bikeFrames=Array.from({length:8},(_,i)=>copy(bike,{a:ped(410,555,43,43,i),a2:ped(410,555,43,43,i+4)}));
  set('stationary-bike',bikeFrames,{apparatus:'bike',cycle:true,anchors:['a','a2','w','w2']});
  const ell=copy(stand,{h:V(350,423),s:V(350,298),e:V(405,345),w:V(455,290),k2:V(350,536),a2:V(350,630),e2:V(405,345),w2:V(455,290)});
  const ellFrames=Array.from({length:8},(_,i)=>copy(ell,{a:ped(350,601,62,21,i),a2:ped(350,601,62,21,i+4),w:V(447+24*Math.cos(i*Math.PI/4),347),w2:V(447-24*Math.cos(i*Math.PI/4),347)}));
  set('elliptical',ellFrames,{apparatus:'elliptical',cycle:true,anchors:['a','a2','w','w2']});
  const rowingCatch={h:V(395,565),s:V(455,455),k:V(460,490),a:V(560,585),e:V(525,480),w:V(595,506)};
  const rowingDrive=copy(rowingCatch,{h:V(340,565),s:V(340,440),k:V(450,550),e:V(415,455),w:V(490,470)});
  const rowingFinish=copy(rowingDrive,{h:V(335,565),s:V(305,444),e:V(252,493),w:V(325,509)});
  set('rowing-machine',[rowingCatch,rowingDrive,rowingFinish],{apparatus:'rower',anchors:['a']});
  set('cat-cow',[copy(quad,{spineBend:-22}),copy(quad,{spineBend:22})],{floor:true,anchors:['a','a2','w','w2']});
}
