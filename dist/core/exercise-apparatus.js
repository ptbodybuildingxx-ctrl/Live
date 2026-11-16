// Apparatus components for explicitly authored tracks. All moving parts use
// the same wrist/ankle coordinates as the body; no separate animation clock.
const steel='#7d8985',pad='#27312d',accent='#39FF88',dark='#16221b';
// Fixed-length linkage geometry; a 2-link schematic is explicitly drawn
// with a hinge rather than a solid bar stretching from a fixed pivot.
const specs={
 chestPress:[[[545,330],'w',85,-1]],
 inclinePress:[[[530,230],'w',115,-1]],
 rowMachine:[[[570,320],'w',150,-1]],
 shoulderPress:[[[220,185],'w',90,1],[[500,185],'w2',90,-1]],
 lateralMachine:[[[337,385],'e',0,0],[[383,385],'e2',0,0]],
 highRow:[[[450,190],'w',135,-1]],
 pulloverMachine:[[[540,265],'w',150,1]],
 pecDeck:[[[215,225],'e',125,1],[[505,225],'e2',125,-1]],
 reversePec:[[[215,265],'e',105,1],[[505,265],'e2',105,-1]],
 abCrunch:[[[275,335],'w',120,-1]]
};
const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
const offset=(p,x,y)=>[p[0]+x,p[1]+y];
const normalOffset=(root,tip,along,across)=>{
  const d=dist(root,tip),x=(tip[0]-root[0])/d,y=(tip[1]-root[1])/d;
  return offset(tip,along*x+across*y,along*y-across*x);
};
// A crank, rigid pedal coupler and rocker form one closed four-bar chain.
// Opposite cranks share the same phase; the handles are rigid extensions of the rockers.
export function ellipticalGeometry(phase){
  const u=Number.isFinite(phase)?((phase%1)+1)%1:0,crank=[245,609],rocker=[460,420];
  return [0,Math.PI].map((side,i)=>{
    const t=u*2*Math.PI+side,c=offset(crank,30*Math.cos(t),30*Math.sin(t));
    const dx=c[0]-rocker[0],dy=c[1]-rocker[1],d=Math.hypot(dx,dy),x=(175**2-205**2+d*d)/(2*d),y=Math.sqrt(175**2-x*x);
    const j=offset(rocker,(dx*x+dy*y)/d,(dy*x-dx*y)/d),mid=[(c[0]+j[0])/2,(c[1]+j[1])/2];
    const a=offset(mid,0,-13),w=offset(rocker,-(j[0]-rocker[0])*110/175,-(j[1]-rocker[1])*110/175);
    return {crank,rocker,c,j,mid,a,w,footKey:i?'a2':'a',handKey:i?'w2':'w'};
  });
}
export const ellipticalTargets=phase=>Object.fromEntries(ellipticalGeometry(phase).flatMap(g=>[[g.footKey,g.a],[g.handKey,g.w]]));
export function railGeometry(q,opt){
  const leg=opt.apparatus==='legPress';
  if(!leg&&opt.apparatus!=='hackSquat')return null;
  const start=leg?[280,510]:[240,200],end=leg?[510,350]:[450,655],contact=leg?q.a:q.h;
  const d=dist(start,end),axis=[(end[0]-start[0])/d,(end[1]-start[1])/d],along=(contact[0]-start[0])*axis[0]+(contact[1]-start[1])*axis[1];
  return {start,end,axis,contact,cart:offset(start,axis[0]*along,axis[1]*along),off:(contact[0]-start[0])*(-axis[1])+(contact[1]-start[1])*axis[0]};
}
export function mechanismLinks(q,opt,phase=0){
 const type=opt.apparatus||opt.linkage;
  const rigid=(pivot,end,length,key)=>({pivot,end,key,lengths:[length],joint:null,reachable:Math.abs(dist(pivot,end)-length)<1e-6});
  if(opt.landmineRadius)return [rigid(opt.landminePivot,q.w,opt.landmineRadius,'w')];
  if(['legExtension','legCurl','lyingLegCurl'].includes(type)){
    const end=normalOffset(q.k,q.a,-12,type==='legExtension'?23:-23),len=type==='lyingLegCurl'?118:115;
    return [rigid(q.k,end,Math.hypot(len-12,23),'roller')];
  }
  if(['abductor','adductor'].includes(type))return ['k','k2'].map((key,i)=>{
    const side=(i?1:-1)*(type==='abductor'?1:-1),end=normalOffset(q.h,q[key],-7,side*22);
    return rigid(q.h,end,Math.hypot(90-7,22),key+'Pad');
  });
  if(type==='elliptical')return ellipticalGeometry(phase).flatMap(g=>[
    rigid(g.crank,g.c,30,g.footKey+'Crank'),rigid(g.c,g.j,205,g.footKey+'Coupler'),rigid(g.rocker,g.j,175,g.footKey+'Rocker'),rigid(g.rocker,g.w,110,g.handKey+'Handle')]);
 if(!opt.rigidApparatus||!specs[type])return [];
 return specs[type].map(([pivot,key,length,side])=>{
  const end=q[key],dx=end[0]-pivot[0],dy=end[1]-pivot[1],d=Math.hypot(dx,dy);
  if(!length)return {pivot,end,key,lengths:[75],joint:null,reachable:true};
  const height=Math.sqrt(Math.max(0,length*length-d*d/4)),joint=[(pivot[0]+end[0])/2-side*dy/d*height,(pivot[1]+end[1])/2+side*dx/d*height];
  return {pivot,joint,end,key,lengths:[length,length],reachable:d<=2*length+1e-8&&d>0};
 });
}
export function apparatusSvg(P,q,opt,phase=0){
  const {h,s,k,a,e,w,k2,a2,e2,w2}=q;
  const {L,R,C,add,mid}=P;
  let out='';
  const beam=(p,z,ww=10)=>L(p,z,ww,steel);
  const support=(x,y=160)=>beam([x,y],[x,655],12);
  const joint=p=>C(p,12,steel,accent,2);
  const links=mechanismLinks(q,opt,phase);
  const drive=(link,width=11)=>{
    if(!link)return '';
    const {pivot,joint:j,end}=link;
    return joint(pivot)+(j?beam(pivot,j,width)+beam(j,end,width)+joint(j):beam(pivot,end,width));
  };
  const footplate=(p,angle=0)=>{
    const f=[Math.cos(angle)*37,Math.sin(angle)*37];
    return L(add(p,[0,19],1),add(p,[0,19],1),1,steel)+L(add(add(p,[0,19]),f,-1),add(add(p,[0,19]),f),14,pad)+L(add(add(p,[0,19]),f,-1),add(add(p,[0,19]),f),3,steel);
  };
  const stack=(x=610,y=455)=>R(x-28,y,56,195,pad,8,steel)+beam([x-14,y-60],[x-14,y+175],3)+beam([x+14,y-60],[x+14,y+175],3)+Array.from({length:7},(_,i)=>R(x-25,y+12+i*23,50,16,dark,3,steel)).join('');
  switch(opt.apparatus){
    case 'chestPress':case 'inclinePress':{
      const pivot=opt.apparatus==='chestPress'?[545,330]:[530,230];
      out+=support(555,210)+stack(610)+beam([555,210],pivot)+(links.length?drive(links[0],13):joint(pivot)+beam(pivot,w,13))+C(w,11,pad,accent,2)+L([555,655],[245,655],10,pad);
      break;
    }
    case 'pecDeck':case 'reversePec':{
      const y=opt.apparatus==='pecDeck'?225:265;
      out+=support(215,y)+support(505,y)+beam([215,y],[505,y],10);
      for(const [i,[el,hand]] of [[e,w],[e2,w2]].entries())out+=drive(links[i],8)+beam(el,hand,8)+C(el,20,pad,steel,3)+C(hand,10,steel);
      break;
    }
    case 'rowMachine':{
      const pivot=[570,320];
      out+=support(570,275)+stack(615)+(links.length?drive(links[0],12):joint(pivot)+beam(pivot,w,12))+footplate(a,-.45)+beam([505,635],[570,655]);
      break;
    }
    case 'cableRow':out+=footplate(a,-.45)+beam([a[0],a[1]+19],[570,655],10)+stack(620);break;
    case 'latPulldown':
      out+=stack(610)+beam([355,120],[610,120])+support(610,120)+L([395,k[1]-34],[465,k[1]-34],22,pad)+beam([430,k[1]-34],[430,k[1]+26],7)+L(add(w,[-28,0]),add(w,[28,0]),8,steel);break;
    case 'shoulderPress':
      out+=support(220,185)+support(500,185)+beam([220,185],[500,185])+stack(610);
      for(const [i,[x,p]] of [[220,w],[500,w2]].entries())out+=(links.length?drive(links[i]):joint([x,185])+beam([x,185],p,11))+C(p,10,steel,accent,2);
      break;
    case 'lateralMachine':
      out+=support(245,295)+support(475,295)+beam([245,295],[475,295])+stack(610);
      for(const [i,[x,p]] of [[245,e],[475,e2]].entries())out+=(links.length?beam([x,295],links[i].pivot,8)+drive(links[i],9):joint([x,295])+beam([x,295],p,9))+C(p,21,pad,steel,3);
      break;
    case 'highRow':case 'pulloverMachine':{
      const l=links[0];
      if(l)out+=support(l.pivot[0],l.pivot[1])+stack(615)+drive(l,12)+C(w,10,pad,accent,2);
      break;
    }
    case 'rope':{
      const hook=add(w,[0,-24]);
      out+=L(hook,add(w,[-16,17]),6,steel)+L(hook,add(w,[16,17]),6,steel)+C(add(w,[-16,17]),9,pad,steel,2)+C(add(w,[16,17]),9,pad,steel,2);
      break;
    }
    case 'shortBar':out+=L(add(w,[-31,0]),add(w,[31,0]),9,steel)+C(add(w,[-28,0]),7,pad)+C(add(w,[28,0]),7,pad);break;
    case 'armCurl':case 'armExtension':
      out+=support(e[0]+115,e[1]-65)+stack(610)+beam([e[0]+115,e[1]],e)+joint(e)+beam(e,w,9)+C(w,12,steel,accent,2);
      break;
    case 'legPress':{
      const {cart,axis}=railGeometry(q,opt),plate=offset(a,0,19),load=offset(cart,axis[0]*36,axis[1]*36);
      out+=beam([280,510],[510,350],12)+beam([310,545],[540,385],10)+beam([280,510],[245,655])+beam([540,385],[590,655])+footplate(a,Math.atan2(axis[0],-axis[1]))+beam(cart,plate,11)+C(cart,15,steel,pad,3)+beam(cart,load,11)+C(load,34,pad,steel,4)+C(load,10,steel);
      break;
    }
    case 'hackSquat':{
      out+=beam([240,200],[450,655],12)+beam([280,200],[490,655],10)+L([375,656],[565,656],18,pad);
      const {cart}=railGeometry(q,opt);
      out+=beam(add(s,[-27,12]),add(h,[-27,12]),32)+beam(cart,add(h,[-27,12]),12)+C(cart,22,pad,steel,4)+L(add(s,[-14,0]),add(s,[48,0]),22,pad)+beam(add(s,[25,10]),w,8);
      break;
    }
    case 'legExtension':case 'legCurl':case 'lyingLegCurl':{
      const roller=links[0].end,x=opt.apparatus==='lyingLegCurl'?k[0]-65:k[0]+85;
      out+=support(x,k[1])+stack(610)+beam([x,k[1]],k)+drive(links[0])+C(roller,20,pad,steel,4);
      if(opt.apparatus==='legCurl')out+=L(add(k,[-38,-32]),add(k,[23,-32]),18,pad);
      break;
    }
    case 'seatedCalf':
      out+=beam([490,335],[490,655],10)+L(add(k,[-40,-27]),add(k,[40,-27]),24,pad)+beam([490,335],add(k,[15,-25]),9)+C([490,335],12,steel)+footplate([445,637]);
      break;
    case 'abductor':case 'adductor':{
      out+=support(360,260)+stack(605)+R(300,360,120,150,pad,12,steel);
      for(const [i,f] of [a,a2].entries()){
        const link=links[i];out+=drive(link,8)+C(link.end,22,pad,steel,3)+footplate(f);
      }
      break;
    }
    case 'abCrunch':
      out+=support(275,280)+stack(610)+drive(links[0])+L(add(s,[-18,15]),add(s,[40,15]),20,pad);
      break;
    case 'bike':{
      const crank=[410,555],wheel=[470,582];
      out+=C(wheel,56,pad,steel,5)+C(wheel,15,steel)+beam([245,650],[540,650],15)+beam([305,458],crank,16)+beam(crank,[495,457],13)+beam([495,457],w,9)+R(h[0]-43,h[1]+21,86,14,pad,5,steel)+beam([h[0],h[1]+35],[305,550])+C(crank,20,steel,pad,3);
      for(const p of [a2,a])out+=beam(crank,p,7)+L(add(p,[-25,12]),add(p,[25,12]),10,pad);
      out+=L(add(w,[-25,0]),add(w,[25,0]),9,steel);break;
    }
    case 'elliptical':
      out+=C([245,609],45,pad,steel,4)+beam([195,655],[540,655],14)+beam([460,655],[460,420],15)+joint([460,420])+joint([245,609]);
      for(const g of ellipticalGeometry(phase).reverse())out+=beam(g.crank,g.c,9)+beam(g.c,g.j,10)+beam(g.j,g.w,9)+joint(g.c)+joint(g.j)+L(add(g.mid,[-32,0]),add(g.mid,[32,0]),12,pad)+C(g.w,10,steel);
      break;
    case 'rower':
      out+=beam([210,645],[610,645],14)+C([620,572],55,pad,steel,4)+beam([600,645],[600,580])+R(h[0]-36,h[1]+19,72,18,pad,5,steel)+beam([h[0],h[1]+37],[h[0],645])+footplate(a,-1.05)+L([620,535],w,3,steel)+L(add(w,[-26,0]),add(w,[26,0]),9,steel);break;
  }
  if(opt.tool==='ankleCable'){
    const anchor=opt.anchor;
    out+=support(anchor[0],145)+stack(anchor[0]+70)+C(anchor,13,steel)+L(anchor,a2,3,steel)+C(a2,16,pad,accent,3);
  }
  return out;
}
