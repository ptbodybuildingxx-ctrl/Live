// Explicit authored corrective tracks. Never silently substitute a different
// exercise. Every track remains a draft until independently reviewed.
export function applyDrawingCorrections(drafts){
  const pose=(p,delta)=>({...p,...delta});
  const set=(id,frames,opt={})=>drafts.set(id,{a:frames[0],b:frames.at(-1),frames,opt,revised:true});
  const edit=(id,fn)=>{const d=drafts.get(id);set(id,...fn(d.a,d.b,d.opt))};
  const flat={h:[405,444],s:[270,444],k:[503,520],a:[503,637],e:[287,518],w:[287,443]};
  const floor={h:[385,635],s:[250,635],k:[470,550],a:[535,637],e:[325,635],w:[325,560]};
  const incline={h:[401,493],s:[313,392],k:[512,510],a:[512,637],e:[340,462],w:[340,387]};
  const decline={h:[402,427],s:[275,471],k:[482,350],a:[518,460],e:[285,545],w:[285,470]};
  function press(id,b,tool,extra={}){
    const start=pose(b,{e2:b.e,w2:b.w}),end=pose(start,{e:[b.s[0],b.s[1]-75],w:[b.s[0],b.s[1]-150],e2:[b.s[0],b.s[1]-75],w2:[b.s[0],b.s[1]-150]});
    if(extra.one){start.e2=[325,444];start.w2=[393,443];end.e2=start.e2;end.w2=start.w2}
    if(extra.smith){start.w=[b.s[0],start.w[1]];start.w2=start.w}
    set(id,[start,end],{tool,...extra,anchors:['a','a2',...(extra.smith?['w','w2']:[])],lengths:{w:[75,75],w2:[75,75]}});
  }
  const bench=[204,465,245],inclined=[278,409,420,520],declined=[220,495,425,425];
  for(const [id,tool] of [['db-bench','db'],['bb-bench','bar'],['smith-bench','bar'],['single-db-bench','db'],['db-squeeze-press','db']])press(id,flat,tool,{bench,smith:id==='smith-bench',one:id==='single-db-bench',squeeze:id==='db-squeeze-press'});
  for(const [id,tool] of [['db-floor','db'],['bb-floor','bar']])press(id,floor,tool,{floor:true});
  for(const [id,tool] of [['db-incline','db'],['bb-incline','bar']])press(id,incline,tool,{slant:inclined,bench:[390,515,120]});
  for(const [id,tool] of [['db-decline','db'],['bb-decline','bar']])press(id,decline,tool,{slant:declined,legLock:[518,460]});
  // Head-on projection distinguishes width of the grip, dumbbells and fly arc.
  // Side elevation retains bench/foot support; inset explicitly depicts the
  // grip width or horizontal fly arc, avoiding a misleading seated press.
  press('bb-close-bench',flat,'bar',{bench,gripInset:'close'});
  press('db-squeeze-press',flat,'db',{bench,gripInset:'squeeze',squeeze:true});
  for(const id of ['db-fly','db-incline-fly']){
    const body=id==='db-fly'?flat:incline,s=body.s;
    const a=pose(body,{e:[s[0]+72,s[1]+6],w:[s[0]+142,s[1]-20]});
    const b=pose(body,{e:[s[0]+5,s[1]-74],w:[s[0]+15,s[1]-148]});
    set(id,[a,b],{tool:'db',gripInset:'fly',...(id==='db-fly'?{bench}:{slant:inclined,bench:[390,515,120]}),lengths:{w:[75,75]}});
  }
  for(const [id,tool] of [['db-skull','db'],['ez-extension','ez']]){
    const a=pose(flat,{e:[270,368],w:[205,406]}),b=pose(a,{w:[270,293]});
    set(id,[a,b],{tool,bench,lengths:{w:[75,75],w2:[75,75]}});
  }
  const stand={h:[360,407],s:[360,282],k:[360,522],a:[360,637],e:[360,357],w:[360,432]};
  const front=pose(stand,{front:true,k:[330,523],a:[330,637],k2:[390,523],a2:[390,637],e:[337,357],w:[337,432],e2:[383,357],w2:[383,432]});
  const curls=(id,tool,grip)=>{
    const a=pose(front,{e:[304,353],w:[300,428],e2:[416,353],w2:[420,428]}),b=pose(a,{w:[300,278],w2:[420,278]});
    set(id,[a,b],{tool,grip,gripRotation:id==='db-zottman',lengths:{w:[78,75],w2:[78,75]}});
  };
  curls('db-reverse-curl','db','over');curls('ez-curl','ez','under');curls('bb-reverse','bar','over');curls('db-zottman','db','under');
  const seated=pose(stand,{h:[322,506],s:[405,420],k:[437,506],a:[437,637],e:[410,495],w:[485,495]});
  for(const [id,tool] of [['db-wrist','db'],['bb-wrist-curl','bar']]){
    set(id,[seated,pose(seated,{handAngle:Math.PI/3})],{tool,bench:[248,526,139],wristMotion:true,one:id==='db-wrist',armRest:[380,505,115],grip:'under'});
  }
  const hang=pose(front,{h:[360,407],s:[360,282],e:[310,208],w:[310,137],e2:[410,208],w2:[410,137],k:[330,510],a:[280,585],k2:[390,510],a2:[440,585]});
  const pulled=pose(hang,{h:[360,293],s:[360,168],e:[280,180],e2:[440,180],k:[330,396],a:[280,471],k2:[390,396],a2:[440,471]});
  set('chin-up',[hang,pulled],{pullbar:true,grip:'under',lengths:{w:[80,75],w2:[80,75]}});
  const narrow=pose(hang,{w:[330,137],w2:[390,137]});
  set('neutral-pull',[narrow,pose(pulled,{w:narrow.w,w2:narrow.w2})],{pullbar:true,grip:'neutral',lengths:{w:[80,75],w2:[80,75]}});
  const assisted=pose(hang,{k:[320,503],a:[320,390],k2:[400,503],a2:[400,390]});
  set('assisted-pullup',[assisted,pose(pulled,{k:[320,389],a:[320,276],k2:[400,389],a2:[400,276]})],{pullbar:true,assist:true});
  const dipA=pose(stand,{h:[320,390],s:[382,280],k:[320,502],a:[245,572],e:[384,355],w:[384,430]});
  set('chest-dip',[dipA,pose(dipA,{h:[317,465],s:[390,355],e:[315,404],k:[317,575],a:[240,650]})],{rack:[384,430],lengths:{w:[78,75]}});
  // Fixed shoulder and wrist positions for static support; no fake repetition.
  const plank={h:[330,595],s:[461,595],k:[219,617],a:[108,637],e:[461,637],w:[530,637]};
  set('plank',[plank],{floor:true});
  const side=pose(plank,{h:[330,575],s:[450,530],k:[226,606],a:[120,637],e:[450,618],w:[525,637],e2:[445,455],w2:[425,382]});
  set('side-plank',[side],{floor:true});
  const seatedFront=pose(front,{h:[360,509],s:[360,384],k:[310,525],a:[310,637],k2:[410,525],a2:[410,637],e:[308,455],w:[308,530],e2:[412,455],w2:[412,530]});
  set('db-seated-lateral',[seatedFront,pose(seatedFront,{e:[261,384],w:[185,384],e2:[459,384],w2:[535,384]})],{tool:'db',bench:[285,540,150]});
  // Main side view keeps the hip hinge and supports visible; the inset
  // separately shows the transverse movement of the elbows/arms.
  const rear={h:[330,453],s:[449,415],k:[365,536],a:[355,637],e:[451,490],w:[451,565]};
  const rearEnd=pose(rear,{e:[405,357],w:[336,330]});
  set('db-rear',[rear,rearEnd],{tool:'db',gripInset:'rear',lengths:{w:[75,75]}});
  const supported=pose(rear,{h:[310,510],s:[414,441],e:[415,516],w:[415,591],k:[265,555],a:[245,637]});
  const supportedEnd=pose(supported,{e:[365,384],w:[298,355]});
  set('db-supported-rear',[supported,supportedEnd],{tool:'db',slant:[299,538,441,448],gripInset:'rear',lengths:{w:[75,75]}});
  const rowA=pose(supported,{e:[414,516],w:[414,591]});
  const rowB=pose(rowA,{e:[341,423],w:[390,480]});
  set('db-supported-row',[rowA,rowB],{tool:'db',slant:[299,538,441,448],lengths:{w:[75,75]}});
  set('db-elbow-out-row',[rear,pose(rear,{e:[377,395],w:[430,448]})],{tool:'db',gripInset:'rear',lengths:{w:[75,75]}});
  const proneTop={front:true,h:[360,441],s:[360,314],k:[326,551],a:[326,637],k2:[394,551],a2:[394,637],e:[337,239],w:[337,164],e2:[383,239],w2:[383,164]};
  const proneDown=pose(proneTop,{e:[337,389],w:[337,464],e2:[383,389],w2:[383,464]});
  const proneY=pose(proneTop,{e:[282,261],w:[230,209],e2:[438,261],w2:[490,209]});
  const proneT=pose(proneTop,{e:[262,314],w:[187,314],e2:[458,314],w2:[533,314]});
  set('prone-y',[proneDown,proneY],{overheadView:true});
  set('prone-t',[proneDown,proneT],{overheadView:true});
  // Pressing from anti-rotation stance, lateral cable anchor, horizontal travel.
  const pallof=pose(stand,{e:[400,325],w:[410,345],e2:[400,325],w2:[410,345]});
  set('pallof-press',[pallof,pose(pallof,{e:[432,325],w:[507,325],e2:[432,325],w2:[507,325]})],{tool:'cable',anchor:[140,325],one:true});
  const kneel={h:[315,514],s:[440,514],k:[315,637],a:[205,637],e:[470,574],w:[480,623]};
  const roll=pose(kneel,{h:[410,565],s:[531,533],e:[589,581],w:[650,623]});
  set('bb-rollout',[kneel,roll],{rollerBar:true,anchors:['a','a2','w','w2'],lengths:{a:[123,110],a2:[123,110],w:[80,83],w2:[80,83]}});
  // Stepping forward and back have different fixed stance feet.
  const stride=pose(stand,{h:[360,450],s:[360,325],k:[412,530],a:[465,637],k2:[310,535],a2:[255,637]});
  const low=pose(stride,{h:[380,519],s:[380,394],k:[474,519],a:[475,637],k2:[285,591],a2:[250,637]});
  const backward=pose(stride,{h:[310,450],s:[310,325],k:[365,535],a:[360,637],k2:[260,530],a2:[208,637]});
  const backLow=pose(backward,{h:[288,519],s:[288,394],k:[360,519],a:[360,637],k2:[208,592],a2:[208,637]});
  const lungeLengths={a:[115,115],a2:[115,115]};
  set('forward-lunge',[stand,stride,low],{anchors:['a','a2'],lengths:lungeLengths});
  set('reverse-lunge',[stand,backward,backLow],{anchors:['a','a2'],lengths:lungeLengths});
  set('db-lunge',[stand,stride,low,pose(stand,{h:[430,407],s:[430,282],k:[430,522],a:[430,637],k2:[430,522],a2:[430,637]})],{tool:'db',cycle:true,anchors:['a','a2'],lengths:lungeLengths});
  const stepA=pose(stand,{k:[425,455],a:[495,550],k2:[360,522],a2:[360,637]});
  const stepB=pose(stepA,{h:[495,326],s:[495,201],k:[495,435],a:[495,550],k2:[460,435],a2:[460,550],e:[495,276],w:[495,351]});
  set('db-step',[stepA,stepB],{tool:'db',step:[425,568,135],anchors:['a','a2']});
  const rackPose=pose(stand,{e:[409,322],w:[409,247]});
  const down=pose(rackPose,{h:[295,515],s:[350,403],k:[427,505],a:[360,637],e:[399,443],w:[399,368]});
  const overhead=pose(stand,{e:[360,207],w:[360,132]});
  for(const [id,tool] of [['bb-pushpress','bar'],['bb-thruster','bar'],['db-thruster','db']]){
    const dip=id==='bb-pushpress'?pose(rackPose,{h:[340,438],s:[350,313],k:[390,531],e:[399,353],w:[399,278]}):down;
    set(id,[rackPose,dip,rackPose,overhead,rackPose],{tool,cycle:true,anchors:['a','a2'],lengths:{a:[115,115],a2:[115,115]},gripInset:id==='db-thruster'?'shoulder':undefined});
  }
  const frontSumo=pose(front,{k:[287,523],a:[240,637],k2:[433,523],a2:[480,637],e:[342,357],w:[342,432],e2:[378,357],w2:[378,432]});
  const sumoLow=pose(frontSumo,{h:[360,615-80],s:[360,410],k:[260,535],k2:[460,535],e:[342,485],w:[342,610],e2:[378,485],w2:[378,610]});
  set('sumo-deadlift',[sumoLow,frontSumo],{tool:'bar',anchors:['a','a2'],lengths:{w:[85,105],w2:[85,105]},plateRadius:49});
  // Full cyclic alternating gait, with one support ankle below the hips.
  const gait=(id,tool,opt={})=>{
    const z=opt.running?12:0,base=pose(stand,{h:[360,407-z],s:[368,282-z]});
    const states=[
      pose(base,{k:[403,510],a:[447,637],k2:[315,518],a2:[268,627],e:[325,343],w:[290,397],e2:[405,332],w2:[440,286]}),
      pose(base,{k:[361,522],a:[360,637],k2:[321,509],a2:[375,579],e:[360,357],w:[340,430],e2:[380,357],w2:[410,404]}),
      pose(base,{k:[315,518],a:[268,627],k2:[403,510],a2:[447,637],e:[405,332],w:[440,286],e2:[325,343],w2:[290,397]}),
      pose(base,{k:[321,509],a:[375,579],k2:[361,522],a2:[360,637],e:[380,357],w:[410,404],e2:[360,357],w2:[340,430]})];
    if(tool)for(const p of states)Object.assign(p,{e:[353,357],w:[353,432],e2:[375,357],w2:[375,432]});
    if(opt.running){states[1].a=[398,607];states[1].a2=[310,555];states[3].a2=[398,607];states[3].a=[310,555]}
    set(id,states,{...opt,tool,cycle:true,anchors:['a','a2']});
  };
  gait('walking');gait('jogging',null,{running:true});gait('treadmill',null,{treadmill:true});gait('db-farmer','db');gait('db-suitcase','db',{one:true});
  const marchA=pose(stand,{k:[454,431],a:[454,546],e:[312,340],w:[272,285],e2:[388,340],w2:[421,390]});
  const marchB=pose(stand,{k2:[454,431],a2:[454,546],e2:[312,340],w2:[272,285],e:[388,340],w:[421,390]});
  set('march-in-place',[stand,marchA,stand,marchB],{cycle:true,anchors:['a','a2']});
  // Running drill: lifted thigh and brief flight, not the slower grounded march.
  const runA=pose(stand,{k:[474,405],a:[470,520],k2:[360,522],a2:[360,637],e:[316,341],w:[350,274],e2:[409,339],w2:[468,370]});
  const runB=pose(runA,{k:runA.k2,a:runA.a2,k2:runA.k,a2:runA.a,e:runA.e2,w:runA.w2,e2:runA.e,w2:runA.w});
  const hopA=pose(stand,{h:[360,390],s:[360,265],k:[401,490],a:[385,600],k2:[387,490],a2:[424,595],e:[325,330],w:[374,284],e2:[395,330],w2:[437,381]});
  const hopB=pose(hopA,{k:hopA.k2,a:hopA.a2,k2:hopA.k,a2:hopA.a,e:hopA.e2,w:hopA.w2,e2:hopA.e,w2:hopA.w});
  set('high-knees',[runA,hopA,runB,hopB],{cycle:true,anchors:['a','a2'],lengths:{a:[115,115],a2:[115,115],torso:125}});
  set('heel-to-toe-rock',[stand,pose(stand,{h:[376,387],s:[376,262],k:[376,502],a:[376,617],footTilt:1}),stand,pose(stand,{h:[346,407],s:[346,282],k:[346,522],a:[346,637],footTilt:-1})],{cycle:true,rocking:true});
  const rot=(p,a)=>[p[0]+75*Math.cos(a),p[1]+75*Math.sin(a)];
  const angular=Array.from({length:8},(_,i)=>{const t=i*Math.PI/4,l=rot([337,282],Math.PI+t),r=rot([383,282],-t);return pose(front,{e:l,w:rot(l,Math.PI+t),e2:r,w2:rot(r,-t)})});
  set('arm-circles',angular,{cycle:true});
  const hipA=pose(front,{h:[360,445],s:[360,320],k:[250,445],a:[250,555],k2:[470,445],a2:[470,335],e:[310,390],w:[280,455],e2:[410,390],w2:[440,455]});
  const hipB=pose(hipA,{k:[250,445],a:[250,335],k2:[470,445],a2:[470,555]});
  set('hip-90-90',[hipA,hipB],{overheadView:true,lengths:{a:[110,110],a2:[110,110]}});
  const ankle=pose(stand,{k:[429,520],a:[490,637],k2:[298,518],a2:[245,637],e:[455,335],w:[530,335]});
  set('ankle-rocks',[ankle,pose(ankle,{h:[391,420],s:[408,296],k:[525,520]})],{wall:532,anchors:['a','a2','w']});
  const wallA=pose(front,{e:[270,372],w:[270,297],e2:[450,372],w2:[450,297]});
  set('scapular-wall-circles',[wallA,pose(wallA,{s:[360,268],e:[270,348],e2:[450,348]}),pose(wallA,{s:[367,282],e:[277,372],e2:[457,372]}),pose(wallA,{s:[360,296],e:[270,386],e2:[450,386]})],{wallBehind:true,cycle:true,anchors:['w','w2']});
  // Ground and apparatus contact fixes discovered by the constraint pass.
  const pike={h:[330,467],s:[410,563],k:[310,558],a:[295,637],e:[428,603],w:[450,637]};
  const exercisePlank={h:[335,545],s:[458,523],k:[222,590],a:[110,637],e:[455,585],w:[458,637]};
  set('dynamic-inchworm',[pike,exercisePlank,pose(pike,{a:[365,637],k:[350,550],w:[485,637]})],{anchors:['a','a2','w','w2']});
  const rowPlank=pose(exercisePlank,{h:[310,545],s:[433,523],w:[433,612],w2:[433,612],e2:[433,570],e:[433,570]});
  set('db-renegade',[rowPlank,pose(rowPlank,{e:[356,512],w:[356,587]})],{tool:'db',anchors:['w','w2','a','a2']});
  const wide=pose(front,{h:[360,452],s:[360,327],k:[248,523],a:[194,637],k2:[472,523],a2:[526,637]});
  set('cossack-squat',[wide,pose(wide,{h:[440,520],s:[440,395],k:[320,562],k2:[526,522]})],{anchors:['a','a2']});
  const sideStep=pose(front,{k2:[430,520],a2:[470,637]});
  set('side-step-warmup',[front,sideStep,pose(front,{h:[430,407],s:[430,282],a:[400,637],a2:[460,637]})],{anchors:['a','a2']});
  for(const id of ['inverted-row','supinated-row']){
    edit(id,(a,b,opt)=>[[pose(a,{h:[405,555],s:[285,505],k:[505,596],a:[575,638]}),pose(b,{h:[422,490],s:[300,435],k:[505,565],a:[575,638]})],{...opt,grip:id==='supinated-row'?'under':'over'}]);
  }
  edit('figure-four',(a,b,opt)=>{const p=pose(a,{e:[290,570],w:[367,537],e2:[292,555],w2:[366,510]});return [[p],opt]});
  edit('standing-quad-stretch',(a,b,opt)=>{const p=pose(a,{e2:[300,380],w2:[279,451],a2:[279,451]});return [[p],opt]});
  edit('supine-knee-hug',(a,b,opt)=>{const p=pose(a,{w:[320,515],w2:[337,516]});return [[p],opt]});
  // A lateral cable attachment, pressing and rotational patterns retain a
  // distinct equipment layout and hand path.
  const highA=pose(seated,{s:[325,381],e:[390,323],w:[447,274],e2:[390,323],w2:[447,274]});
  set('high-row',[highA,pose(highA,{e:[285,438],w:[350,401],e2:[285,438],w2:[350,401]})],{bench:[250,526,132],machinePivot:[450,190],chestPad:[357,382,22,112]});
  edit('wide-cable-row',(a,b,opt)=>[[a,b],{...opt,gripInset:'wide'}]);
  edit('neutral-pulldown',(a,b,opt)=>[[a,b],{...opt,grip:'neutral',gripInset:'neutral'}]);
  edit('under-pulldown',(a,b,opt)=>[[a,b],{...opt,grip:'under',gripInset:'under'}]);
  edit('bb-under-row',(a,b,opt)=>[[a,b],{...opt,grip:'under',gripInset:'under'}]);
  edit('cable-reverse-pushdown',(a,b,opt)=>[[a,b],{...opt,grip:'under'}]);
  const arnoldA=pose(seatedFront,{e:[322,446],w:[340,373],e2:[398,446],w2:[380,373]});
  const arnoldMid=pose(arnoldA,{e:[264,384],w:[264,309],e2:[456,384],w2:[456,309]});
  const arnoldEnd=pose(arnoldA,{e:[337,309],w:[337,234],e2:[383,309],w2:[383,234]});
  set('db-arnold',[arnoldA,arnoldMid,arnoldEnd],{tool:'db',bench:[285,540,150],gripRotation:true});
  // Explicit step/strike recovery and alternating knees.
  const boxA=pose(stand,{e:[390,345],w:[397,272],e2:[330,345],w2:[365,277],k:[395,518],a:[430,637],k2:[320,518],a2:[285,637]});
  const boxL=pose(boxA,{e:[435,291],w:[508,290]});
  const boxR=pose(boxA,{e2:[435,315],w2:[506,315],s:[375,283]});
  set('shadow-box',[boxA,boxL,boxA,boxR],{cycle:true});
  const climbA=pose(stand,{h:[395,390],s:[395,265],k:[440,452],a:[440,532],k2:[365,503],a2:[365,612],e:[440,325],w:[475,365],e2:[440,325],w2:[475,365]});
  const climbB=pose(climbA,{k:[365,503],a:[365,612],k2:[440,452],a2:[440,532]});
  set('stair-climber',[climbA,climbB],{steps:true,cycle:true,anchors:['a','a2','w','w2']});
  const openA={h:[365,530],s:[240,530],k:[365,418],a:[475,418],k2:[375,428],a2:[485,428],e:[310,530],w:[385,530],e2:[310,530],w2:[385,530]};
  set('open-book',[openA,pose(openA,{e:[240,455],w:[240,380]}),pose(openA,{e:[165,530],w:[90,530]})],{overheadView:true,anchors:['a','a2']});
  const rotation=pose(low,{e:[320,400],w:[250,400],e2:[445,400],w2:[516,400]});
  set('walking-lunge-rotation',[stand,stride,low,rotation,low,stride],{anchors:['a','a2'],cycle:true,gripInset:'rotate',lengths:lungeLengths});
  const swingA=pose(stand,{s:[410,282],h:[380,407],e:[465,315],w:[530,330],k2:[310,500],a2:[245,583]});
  set('leg-swing-front',[swingA,pose(swingA,{k2:[490,438],a2:[555,515]})],{wall:532,anchors:['a','w']});
  const oneRdl=pose(stand,{h:[360,407],s:[360,282],e:[367,357],w:[367,432]});
  const rdlEnd=pose(oneRdl,{h:[335,412],s:[459,397],k2:[220,425],a2:[106,438],k:[350,523],a:[360,637],e:[459,472],w:[459,547]});
  set('db-single-rdl',[oneRdl,rdlEnd],{tool:'db',one:true,anchors:['a'],lengths:{a:[116,115],a2:[116,115],w:[75,75]}});
  const pendlayA=pose(stand,{h:[290,487],s:[415,487],k:[355,523],a:[360,637],e:[415,560],w:[415,633]});
  set('pendlay-row',[pendlayA,pose(pendlayA,{e:[343,507],w:[415,518]})],{tool:'bar',plateRadius:26,anchors:['a']});
  const hangProne={h:[330,535],s:[456,487],k:[220,590],a:[110,637],e:[456,562],w:[456,637]};
  set('close-pushup',[hangProne,pose(hangProne,{s:[456,601],h:[330,594],e:[525,590]})],{anchors:['a','w'],gripInset:'close',lengths:{w:[75,75],w2:[75,75]}});
  set('archer-pushup',[hangProne,pose(hangProne,{h:[330,590],s:[456,601],e:[525,590]})],{anchors:['a','w'],gripInset:'archer',lengths:{w:[75,75],w2:[75,75]}});
  // Fixed position of the bent limb and contact points are visible in this
  // static version; 90/90 switches use a separate cyclic track above.
  edit('ankle-rocks',(a,b,opt)=>[[pose(a,{s:[355,282],e:[467,326],w:[532,335]}),pose(b,{e:[470,335],w:[532,335]})],{...opt,lengths:{w:[95,95],w2:[95,95]}}]);
  edit('standing-quad-stretch',(a,b,opt)=>[[pose(a,{e2:[304,364],w2:[279,451]})],{...opt,lengths:{w2:[90,95]}}]);
  set('wide-push-up',[hangProne,pose(hangProne,{h:[330,590],s:[456,601],e:[525,590]})],{anchors:['a','w'],gripInset:'wide',lengths:{w:[75,75],w2:[75,75]}});
  const handstand={h:[410,357],s:[410,487],k:[418,242],a:[418,127],e:[410,562],w:[410,637]};
  set('wall-handstand',[handstand,pose(handstand,{h:[410,418],s:[410,548],k:[418,303],a:[418,188],e:[468,587]})],{wall:430,anchors:['w','w2'],lengths:{w:[75,75],w2:[75,75]}});
  const supine={h:[370,635],s:[245,635],k:[388,520],a:[503,520],k2:[388,520],a2:[503,520],e:[245,560],w:[245,485],e2:[245,560],w2:[245,485]};
  const deadA=pose(supine,{k:[480,611],a:[592,635],e2:[170,630],w2:[95,630]});
  const deadB=pose(supine,{k2:[480,611],a2:[592,635],e:[170,630],w:[95,630]});
  set('dead-bug',[supine,deadA,supine,deadB],{floor:true,cycle:true,lengths:{a:[115,115],a2:[115,115],w:[75,75],w2:[75,75]}});
  const reverseA=pose(supine,{e:[320,635],w:[395,635],e2:[320,635],w2:[395,635]});
  const reverseB=pose(reverseA,{h:[350,567],s:[245,635],k:[285,477],a:[400,477],k2:[285,477],a2:[400,477]});
  set('reverse-crunch',[reverseA,reverseB],{floor:true,anchors:['w','w2'],lengths:{w:[75,75],w2:[75,75],a:[115,115],a2:[115,115]}});
  const bikeA=pose(supine,{h:[385,635],s:[274,578],k:[285,538],a:[400,540],k2:[495,603],a2:[608,625],e:[217,529],w:[194,598],e2:[237,507],w2:[204,575]});
  const bikeB=pose(bikeA,{k2:[285,538],a2:[400,540],k:[495,603],a:[608,625],e2:bikeA.e,w2:bikeA.w,e:bikeA.e2,w:bikeA.w2});
  set('bicycle-crunch',[bikeA,bikeB],{floor:true,cycle:true,gripInset:'bike',lengths:{a:[115,115],a2:[115,115],w:[75,75],w2:[75,75]}});
  const scapA=pose(front,{e:[308,357],w:[290,430],e2:[412,357],w2:[430,430]});
  const scapB=pose(scapA,{e:[285,315],w:[220,280],e2:[435,315],w2:[500,280]});
  set('db-scaptation',[scapA,scapB],{tool:'db',gripInset:'scaption',lengths:{w:[75,75],w2:[75,75]}});
  const cableA=pose(front,{e:[295,322],w:[362,289],e2:[425,322],w2:[358,289]});
  const cableB=pose(cableA,{e:[262,282],w:[187,282],e2:[458,282],w2:[533,282]});
  set('cable-rear-fly',[cableA,cableB],{tool:'cable',anchor:[600,300],secondAnchor:[120,300],lengths:{w:[75,75],w2:[75,75]}});
}
