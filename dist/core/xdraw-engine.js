/* Musclivo — رسوم الحركة الصحيحة/الخاطئة (دمبل/بار/كيبل). تُحمَّل عند الحاجة من app.html */
// Adapted from the user-provided Musclivo xdraw.js; graphical primitives and original scenes preserved.
export const xdrawEngine=(()=>{
'use strict';
const G='#39FF88',Y='#F2C94C',RED='#ff6b6b',BLU='#8fd1ff';
const L=(a,b,w,c,o=1)=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
const C=(p,r,f,s='none',sw=0)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;
const R=(x,y,w,h,f,rx=6,s='none')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${s}"/>`;
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k];
const mid=(a,b,k=.5)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k];
const ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;
function ik(S,W,l1,l2,sg){const dx=W[0]-S[0],dy=W[1]-S[1],raw=Math.hypot(dx,dy),d=Math.min(l1+l2-.5,Math.max(Math.abs(l1-l2)+.5,raw)),a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a)),ux=raw>1e-6?dx/raw:1,uy=raw>1e-6?dy/raw:0;return [S[0]+ux*a-uy*h*sg,S[1]+uy*a+ux*h*sg]}
const JT='#141b18';
function cap(a,b,w1,w2,f,st='none'){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,r1=w1/2,r2=w2/2;
 const p=[[a[0]+nx*r1,a[1]+ny*r1],[b[0]+nx*r2,b[1]+ny*r2],[b[0]-nx*r2,b[1]-ny*r2],[a[0]-nx*r1,a[1]-ny*r1]];
 return `<path d="M${p.map(q=>q.join(',')).join(' L')} Z" fill="${f}" stroke="${st}" stroke-width="3" stroke-linejoin="round"/>`+C(a,r1,f,st,3)+C(b,r2,f,st,3)}
let GID=0;
function prof(arr,t){for(let i=1;i<arr.length;i++){if(t<=arr[i][0]){const a=arr[i-1],b=arr[i],k=(t-a[0])/(b[0]-a[0]),q=k*k*(3-2*k);return a[1]+(b[1]-a[1])*q}}return arr[arr.length-1][1]}
function shape(a,b,fr,bk,fill,o={}){const infl=o.infl||0,t0=o.t0||0,t1=o.t1===undefined?1:o.t1,side=o.side||1,N=24,dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,nx=-dy/d*side,ny=dx/d*side;
 const F=[],B=[];let wm=0;for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N,cx=a[0]+dx*t,cy=a[1]+dy*t,f=prof(fr,t)+infl,g=prof(bk,t)+infl;wm=Math.max(wm,f,g);F.push([cx+nx*f,cy+ny*f]);B.push([cx-nx*g,cy-ny*g])}
 const pts=F.concat(B.reverse()),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];let g='',fl=fill;
 if(fill==='skin'){const id='sk'+(GID++);g=`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${m[0]-nx*wm}" y1="${m[1]-ny*wm}" x2="${m[0]+nx*wm}" y2="${m[1]+ny*wm}"><stop offset="0" stop-color="#7d6857"/><stop offset=".3" stop-color="#cdb59f"/><stop offset=".62" stop-color="#e6d3bf"/><stop offset="1" stop-color="#9b8472"/></linearGradient>`;fl=`url(#${id})`}
 return `<defs>${g}</defs><path d="M${pts.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' L')} Z" fill="${fl}" stroke="${o.stroke||'#0c1210'}" stroke-width="${o.sw===undefined?3:o.sw}" stroke-linejoin="round" opacity="${o.op||1}"/>`}
const PR={thigh:[[[0,21],[.3,23],[.65,20],[1,15]],[[0,22],[.3,22],[.65,18],[1,14]]],calf:[[[0,14],[.3,16],[.7,10.5],[1,7.5]],[[0,14],[.3,17],[.7,11],[1,7.5]]],uarm:[[[0,15],[.4,16],[.85,12],[1,10.5]],[[0,15],[.4,14.5],[.85,12],[1,10.5]]],farm:[[[0,11.5],[.28,12.5],[1,7]],[[0,11.5],[.28,12],[1,7]]]};
function limb(a,b,w){const k=w>=34?'thigh':(w===28||w===30)?'calf':w===26?'uarm':'farm',[f,bk]=PR[k],sc=w>=34?w/34:1;
 const sf=f.map(q=>[q[0],q[1]*sc]),sb=bk.map(q=>[q[0],q[1]*sc]);return shape(a,b,sf,sb,'skin')+defn(a,b,sf,sb,k)}
function defn(a,b,sf,sb,k){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d,N=10,t0=k==='thigh'?.12:.1,t1=k==='farm'?.8:.86;let sh=[],hi=[],sp=[];
 for(let i=0;i<=N;i++){const t=t0+(t1-t0)*i/N,cx=a[0]+dx*t,cy=a[1]+dy*t,f=prof(sf,t),g=prof(sb,t),bulge=k==='calf'?1+.25*Math.sin(Math.PI*Math.min(1,t*1.6)):1;
  sh.push([cx+nx*f*.52*bulge,cy+ny*f*.52*bulge]);hi.push([cx-nx*g*.38,cy-ny*g*.38]);sp.push([cx+nx*f*.18,cy+ny*f*.18])}
 const P=q=>q.map(z=>z[0].toFixed(1)+','+z[1].toFixed(1)).join(' L');
 return `<path d="M${P(sh)}" fill="none" stroke="#7a5d4a" stroke-width="2.2" stroke-linecap="round" opacity=".55"/><path d="M${P(hi)}" fill="none" stroke="#fff3e3" stroke-width="3" stroke-linecap="round" opacity=".28"/><path d="M${P(sp)}" fill="none" stroke="#7a5d4a" stroke-width="1.2" stroke-linecap="round" opacity=".3"/>`}
function shorts(a,b,w=36){return shape(a,b,PR.thigh[0],PR.thigh[1],'#1e2a3d',{infl:2.5,t0:0,t1:.62})}
const TF=[[0,20],[.28,18],[.58,24],[.85,28],[1,20]],TB=[[0,26],[.25,19],[.55,20],[.85,25],[1,19]];
function torso(h,s,hp,side=1){const dx=s[0]-h[0],dy=s[1]-h[1],d=Math.hypot(dx,dy)||1,nx=-dy/d*side,ny=dx/d*side,ux=dx/d,uy=dy/d;
 const pt=(t,k)=>{const f=prof(TF,t),cx=h[0]+dx*t,cy=h[1]+dy*t;return [cx+nx*f*k,cy+ny*f*k]};
 const P=q=>q.map(z=>z[0].toFixed(1)+','+z[1].toFixed(1)).join(' L'),ln=(arr,w,c,o)=>`<path d="M${P(arr)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
 let m='',tt;
 for(const t of [.14,.28,.42]){m+=ln([pt(t,.18),pt(t+.02,.62),pt(t,.93)],2,'#6d5140',.55)}
 m+=ln([pt(.08,.2),pt(.5,.2)],2,'#6d5140',.4);
 const ar=[];for(let i=0;i<=8;i++){const t=.58+.3*i/8,k=.95-.55*Math.sin(Math.PI*i/8);ar.push(pt(t,k))}
 m+=ln(ar,2.6,'#6d5140',.6)+ln(ar.map(q=>[q[0]-nx*3+ux*-1,q[1]-ny*3]),3,'#fff3e3',.25);
 m+=ln([pt(.1,.99),pt(.3,.9),pt(.5,.97)],2,'#6d5140',.35);
 const sx=s[0],sy=s[1],id='dl'+(GID++);
 return shape(s,hp,[[0,11],[1,10]],[[0,12],[1,10.5]],'skin')+shape(h,s,TF,TB,'skin',{side})+m+`<defs><radialGradient id="${id}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#ecd8c4"/><stop offset=".7" stop-color="#cdb59f"/><stop offset="1" stop-color="#9b8472"/></radialGradient></defs><circle cx="${sx}" cy="${sy}" r="17" fill="url(#${id})" stroke="#0c1210" stroke-width="3"/><path d="M${sx-9},${sy-9} Q${sx+4},${sy-3} ${sx-4},${sy+11}" fill="none" stroke="#6d5140" stroke-width="2" stroke-linecap="round" opacity=".55"/>`}
function head(p,f=[1,0]){const a=Math.atan2(f[1],f[0])*180/Math.PI,id='hd'+(GID++);
 return `<defs><radialGradient id="${id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ecdac8"/><stop offset=".7" stop-color="#cdb59f"/><stop offset="1" stop-color="#9b8472"/></radialGradient></defs>
<g transform="translate(${p[0]} ${p[1]}) rotate(${a})" stroke-linejoin="round">
<path d="M-22,-8 C-23,-31 10,-35 22,-19 L24,-7 L31,3 L24,7 L25,11 C26,16 22,22 16,25 L6,26 C-6,27 -22,21 -22,6 Z" fill="url(#${id})" stroke="#0c1210" stroke-width="2.5"/>
<path d="M-24,2 C-27,-35 10,-40 23,-20 L19,-15 C9,-22 -5,-21 -9,-8 L-11,7 C-15,11 -22,9 -24,2 Z" fill="#2a211c" stroke="#0c1210" stroke-width="2"/>
<ellipse cx="-5" cy="6" rx="5" ry="7.5" fill="#bda08a" stroke="#0c1210" stroke-width="2"/>
<ellipse cx="13" cy="-5" rx="2.6" ry="1.9" fill="#10201a"/><path d="M8,-11 L19,-12" stroke="#3a2a20" stroke-width="2.4" stroke-linecap="round"/>
<path d="M17,14 L24,13" stroke="#8a5f55" stroke-width="2" stroke-linecap="round"/></g>`}
function hand(w){return `<ellipse cx="${w[0]}" cy="${w[1]}" rx="13" ry="9" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5"/>`+L(add(w,[2,-5]),add(w,[11,-9]),5,'#d9c4b0')+L(add(w,[-6,-6]),add(w,[8,-8]),2,'#8d7766',.7)}
function shoe(a,f){return cap(a,f,24,20,'#eef3f1','#0c1210')+L(mid(a,f,.2),mid(a,f,.8),3,G,.7)}
function bgl(title,ar,muscle){let g='';for(let i=0;i<=720;i+=40){g+=`<line x1="${i}" y1="0" x2="${i}" y2="720" stroke="#13201a" stroke-width="1"/><line x1="0" y1="${i}" x2="720" y2="${i}" stroke="#13201a" stroke-width="1"/>`}
return `<defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter><filter id="sh" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter><linearGradient id=bgg x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050806"/><stop offset="1" stop-color="#0b1812"/></linearGradient></defs><rect width="720" height="720" fill="url(#bgg)"/>${g}
<text x="36" y="56" fill="#d9f2c4" font-family="monospace" font-size="15" letter-spacing="2">${title}</text>
<text x="684" y="58" text-anchor="end" fill="${G}" font-family="T" font-size="40">${ar}</text>
<text x="684" y="98" text-anchor="end" fill="${Y}" font-family="T" font-size="${(muscle.length+17)>31?(22*31/(muscle.length+17)).toFixed(1):22}">العضلة المستهدفة: ${muscle}</text>
<ellipse cx="360" cy="672" rx="300" ry="9" fill="#000" opacity=".5" filter="url(#sh)"/>`}
function glow(c,rx,ry,rot,p){return `<g transform="rotate(${rot} ${c[0]} ${c[1]})"><ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx*1.15}" ry="${ry*1.4}" fill="${Y}" opacity="${.1+.5*p}" filter="url(#bl)"/></g>`}
function muscle(c,rx,ry,rot,p,k){const sc=1+.24*p,pr=k==='p',id='mg'+(GID++),op=pr?.62+.38*p:.3+.3*p,hy=ry*sc;let f='';const n=7;
 for(let i=0;i<n;i++){const y=(i-(n-1)/2)/((n-1)/2)*hy*.8,h=Math.sqrt(Math.max(0,1-(y/hy)**2))*rx*.96;f+=`<path d="M${c[0]-h},${c[1]+y*.8} Q${c[0]},${c[1]+y*1.25} ${c[0]+h},${c[1]+y*.8}" fill="none" stroke="${pr?'#ffb4a0':'#9be8cf'}" stroke-width="1.3" opacity="${.35+.25*p}"/>`}
 const c0=pr?'#ff5a44':'#4cc9a0',c1=pr?'#b3201a':'#1f7d62',c2=pr?'#5c0f0d':'#0f4a3a';
 return `<defs><radialGradient id="${id}" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="${c0}"/><stop offset=".6" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs><g transform="rotate(${rot} ${c[0]} ${c[1]})">${pr?`<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx*1.2}" ry="${hy*1.6}" fill="#ff4a36" opacity="${.08+.5*p}" filter="url(#bl)"/>`:''}<ellipse cx="${c[0]}" cy="${c[1]}" rx="${rx}" ry="${hy}" fill="url(#${id})" opacity="${op}" stroke="${c2}" stroke-width="1.2" stroke-opacity=".6"/>${f}<ellipse cx="${c[0]-rx*.25}" cy="${c[1]-hy*.35}" rx="${rx*.4}" ry="${hy*.22}" fill="#fff" opacity="${.1+.1*p}"/></g>`}
function stack(x,top,n,sel,lift,w=70,kg=0,unit=' كغ'){let s=R(x-8,top-30,w+16,n*16+50,'none',8,'#2c3a33');s+=L([x+w/2,top-24],[x+w/2,top+n*16+14],2,'#8fa39a');for(let i=0;i<n;i++){const up=i<sel?lift:0;s+=R(x,top+i*16-up,w,12,i<sel?'#c3cdc9':'#7d8985',3)}
 s+=L([x-4,top+sel*16-lift-2],[x+w+4,top+sel*16-lift-2],3,G);s+=`<text x="${x+w/2}" y="${top+n*16+40}" text-anchor="middle" fill="${Y}" font-family="T" font-size="22">${kg}${unit}</text>`;return s}
function guide(d){return `<path d="${d}" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="4 8" opacity=".5"/>`}
const sm=x=>(1-Math.cos(Math.PI*Math.min(1,Math.max(0,x))))/2;
const E=u=>u<.38?sm(u/.38):u<.46?1:u<.92?1-sm((u-.46)/.46):0;
var PROBE=null;
function romOf(cfg,o){if(cfg.rom!==undefined)return cfg.rom;const idx=CFG.indexOf(cfg);let r=null;if(idx>=0&&SC[idx]){PROBE=[];try{for(let t=0;t<3;t+=.1)SC[idx](t,{wrong:false,kg:o.kg,ctl:false});const v=PROBE.filter(x=>isFinite(x));if(v.length){const lo=Math.round(Math.min(...v)),hi=Math.round(Math.max(...v));if(hi-lo>=8)r=[lo,hi]}}catch(e){}PROBE=null}return cfg.rom=r}
function ui(u,o,cfg,angle){if(o.visualOnly)return '';if(PROBE){PROBE.push(angle);return ''}const ph=u<.38?0:u<.46?1:u<.92?2:3,col=[G,Y,BLU,'#8fa39a'][ph],txt=[cfg.lab[0],'ثبّت وشدّ العضلة',cfg.lab[1],'تنفّس'][ph],ic=['↑','●','↓','○'][ph];
 let s=`<rect x="36" y="600" width="260" height="46" rx="23" fill="#0c1612" stroke="${col}" stroke-width="2"/><text x="62" y="632" fill="${col}" font-family="T" font-size="26">${ic}</text><text x="270" y="631" text-anchor="end" fill="${col}" font-family="T" font-size="${txt.length>15?Math.max(14,22*15/txt.length).toFixed(1):22}">${txt}</text>`;
 const r=ph==0?20-10*sm(u/.38):ph==1?10:ph==2?10+10*sm((u-.46)/.46):20,bt=ph==0?'زفير':ph==1?'ثبّت':ph==2?'شهيق':'شهيق';
 s+=`<circle cx="52" cy="104" r="${r}" fill="${BLU}" opacity=".18" stroke="${BLU}" stroke-width="3"/><text x="86" y="111" fill="${BLU}" font-family="T" font-size="20">${bt}</text>`;
 s+=o.wrong?`<rect x="135" y="86" width="165" height="32" rx="16" fill="#3a1111" stroke="${RED}" stroke-width="2"/><text x="217" y="109" text-anchor="middle" fill="${RED}" font-family="T" font-size="20">✗ حركة خاطئة</text>`:`<rect x="135" y="86" width="165" height="32" rx="16" fill="#0c2a1a" stroke="${G}" stroke-width="2"/><text x="217" y="109" text-anchor="middle" fill="${G}" font-family="T" font-size="20">✓ الحركة الصحيحة</text>`;
 s+=`<text x="36" y="146" fill="#d9f2c4" font-family="T" font-size="21">◆ ${cfg.cue[Math.min(ph,2)]}</text>`;
 s+=o.wrong?`<rect x="316" y="600" width="368" height="46" rx="23" fill="#3a1111" stroke="${RED}" stroke-width="3"/><text x="338" y="632" fill="${RED}" font-family="T" font-size="24">✗</text><text x="662" y="631" text-anchor="end" fill="#ffb0b0" font-family="T" font-size="${(cfg.mist.length+5)>26?(19*26/(cfg.mist.length+5)).toFixed(1):19}">خطأ: ${cfg.mist}</text>`:`<rect x="316" y="600" width="368" height="46" rx="23" fill="#1a0d0d" stroke="${RED}" stroke-width="2"/><text x="338" y="632" fill="${RED}" font-family="T" font-size="24">⚠</text><text x="662" y="631" text-anchor="end" fill="#ff9b9b" font-family="T" font-size="${(cfg.mist.length+10)>29?(18*29/(cfg.mist.length+10)).toFixed(1):18}">خطأ شائع: ${cfg.mist}</text>`;
const rg=romOf(cfg,o);if(rg){const X=a=>372+Math.max(0,Math.min(180,a))/180*190,x0=X(rg[0]),x1=X(rg[1]),cx=X(angle);
 s+=`<rect x="372" y="111" width="190" height="7" rx="3.5" fill="#15221b" stroke="#2c3a33" stroke-width="1.5"/><rect x="${x0}" y="111" width="${Math.max(4,x1-x0)}" height="7" rx="3.5" fill="${G}" opacity=".4"/><circle cx="${cx}" cy="114.5" r="6" fill="${col}" stroke="#0c1210" stroke-width="2"/><text x="364" y="119" text-anchor="end" fill="#8fa39a" font-family="monospace" font-size="13">${rg[0]}°</text><text x="570" y="119" fill="#8fa39a" font-family="monospace" font-size="13">${rg[1]}°</text>`}
s+=mechLine(u,cfg,angle);
 if(o.ctl){s+=`<text x="296" y="710" fill="#8fa39a" font-size="16" font-family="monospace">⏸</text><line x1="326" y1="705" x2="516" y2="705" stroke="#2c3a33" stroke-width="4" stroke-linecap="round"/><circle cx="${326+190*u}" cy="707" r="6" fill="${G}"/><text x="536" y="710" fill="#8fa39a" font-size="15" font-family="monospace">0.5× 1× 1.5×</text>`}
 return s}
const CFG=[{lab:['اسحب بقوة','ارجع ببطء'],cue:['اثنِ الركبة واسحب الكعبين نحو الأرداف','اضغط الوسادة وثبّت الورك على المقعد','مدّ الركبة ببطء خلال ثلاث ثوانٍ'],mist:'رفع الورك عن الكرسي',mech:['الركبة','ثني (Flexion)']},
{lab:['ادفع للأعلى','انزل ببطء'],cue:['ادفع الدمبلين للأعلى حتى يمتد المرفق','اقبض الصدر وثبّت لوحي الكتف','أنزل الدمبلين ببطء حتى مستوى الصدر'],mist:'ارتداد الدمبل',mech:['المرفق','مدّ (Extension)']},
{lab:['اسحب نحو الصدر','ارجع ببطء'],cue:['اسحب المرفقين للأسفل نحو الخصر','اضغط لوحي الكتف وارفع الصدر','ارجع ببطء حتى تمتد الذراعان'],mist:'السحب خلف الرقبة',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع للأعلى','انزل ببطء'],cue:['ادفع الدمبلين للأعلى حتى يمتد المرفق','اقبض أعلى الصدر وثبّت لوحي الكتف','أنزل ببطء حتى يلامس الدمبل أعلى الصدر'],mist:'رفع الورك عن البنش',mech:['المرفق','مدّ (Extension)']},
{lab:['اجمع الدمبلين','افتح ببطء'],cue:['اجمع الدمبلين فوق الصدر بقوس واسع','اعصر الصدر وأبقِ المرفقين مثنيين قليلاً','افتح الذراعين ببطء حتى يتمدد الصدر'],mist:'ثني المرفقين كأنه ضغط',mech:['مفصل الكتف','ضمّ أفقي (Adduction)']},
{lab:['ادفع للأعلى','انزل ببطء'],cue:['ادفع الدمبلين فوق الرأس حتى يمتد المرفق','شدّ البطن وثبّت أسفل الظهر','أنزل الدمبلين ببطء إلى مستوى الأذنين'],mist:'تقوّس أسفل الظهر',mech:['المرفق','مدّ (Extension)']},
{lab:['اسحب نحو البطن','ارجع ببطء'],cue:['اسحب المقبض نحو البطن وجذعك ثابت','اضغط لوحي الكتف معاً','مدّ الذراعين ببطء دون تدوير الظهر'],mist:'تأرجح الجذع',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفق','انزل ببطء'],cue:['اثنِ المرفق وارفع الدمبل نحو الكتف','اعصر العضلة ذات الرأسين بالأعلى','أنزل الدمبل ببطء مع ثبات المرفق'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع للأسفل','ارجع ببطء'],cue:['مدّ المرفقين للأسفل وثبّت العضد','اعصر العضلة ثلاثية الرؤوس بالأسفل','ارجع ببطء حتى زاوية 90 درجة'],mist:'تحريك المرفقين للأمام',mech:['المرفق','مدّ (Extension)']},
{lab:['انزل ببطء','ارتفع بقوة'],cue:['اهبط حتى توازي الفخذين مع الأرض','ثبّت الكعبين وأبقِ الصدر مرفوعاً','ادفع الأرض بقوة وشدّ الألية للأعلى'],mist:'انحناء الجذع للأمام',mech:['الركبة','ثني (Flexion)']},
{lab:['ادفع الورك للخلف','قف بقوة'],cue:['ادفع الورك للخلف والركبة شبه ثابتة','أبقِ البار ملاصقاً للساقين','اشدّ الألية للأمام عند الوقوف'],mist:'ابتعاد البار عن الساقين',mech:['الورك','ثني (Hip Hinge)']},
{lab:['ادفع المنصّة','ارجع ببطء'],cue:['ادفع المنصّة بكعبيك دون قفل الركبتين','ثبّت الحوض والظهر على المقعد','ارجع ببطء حتى زاوية 90 درجة'],mist:'ارتفاع الحوض عن المقعد',mech:['الركبة','مدّ (Extension)']},
{lab:['ارفع الساقين','انزل ببطء'],cue:['افرد الركبة حتى النهاية واعصر الفخذ','ثبّت الظهر على المسند','أنزل الساقين ببطء دون ارتطام الأوزان'],mist:'تأرجح الجذع للخلف',mech:['الركبة','مدّ (Extension)']},
{lab:['ارتفع على أطراف الأصابع','انزل ببطء'],cue:['ارتفع لأقصى حد على مشط القدم','اعصر السمانة في الأعلى ثانية','انزل ببطء حتى تمتد السمانة'],mist:'ثني الركبتين',mech:['الكاحل','ثني أخمصي (Plantar Flexion)']},
{lab:['اقبض البطن','انزل ببطء'],cue:['ارفع الكتفين عن الأرض بتقويس البطن','أبقِ الذقن بعيداً عن الصدر','انزل ببطء دون ارتخاء كامل'],mist:'سحب الرقبة بالأيدي',mech:['العمود الفقري','ثني (Flexion)']},
{lab:['ارفع الدمبل','انزل ببطء'],cue:['ارفع الذراعين للأمام حتى مستوى الكتفين','أبقِ المرفقين شبه مفرودين','أنزل ببطء دون تأرجح الجسم'],mist:'تأرجح الجسم للخلف',mech:['الكتف','ثني (Shoulder Flexion)']},
{lab:['انزل بالصدر','ادفع للأعلى'],cue:['انزل بصدرك مع جسم مستقيم كالخط','ثبّت الكوعين بزاوية 45 درجة','ادفع الأرض بقوة حتى تمدّ الذراعين'],mist:'هبوط الحوض',mech:['المرفق','ثني (Flexion)']},
{lab:['اسحب للأعلى','انزل ببطء'],cue:['اسحب صدرك نحو العقلة بقوة الظهر','اجمع لوحي الكتف في الأعلى','انزل ببطء حتى مدّ الذراعين'],mist:'التأرجح بالجسم',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع البار للأعلى','أنزل ببطء'],cue:['ادفع البار فوق الرأس بخط مستقيم','شدّ البطن وثبّت الظهر','أنزل البار ببطء إلى مستوى الترقوة'],mist:'تقويس الظهر للخلف',mech:['المرفق','مدّ (Extension)']},
{lab:['انزل بتحكم','ادفع للأعلى'],cue:['انزل حتى زاوية 90 درجة في المرفقين','أبقِ الصدر مرفوعاً والكتفين للأسفل','ادفع بقوة دون قفل المرفقين'],mist:'انحناء الجذع للأمام',mech:['المرفق','ثني (Flexion)']},
{lab:['انزل للأسفل','ادفع بالكعب'],cue:['انزل حتى تلامس الركبة الخلفية الأرض تقريباً','أبقِ الجذع منتصباً','ادفع بكعب القدم الأمامية للأعلى'],mist:'انحناء الجذع للأمام',mech:['الركبة','ثني (Flexion)']},
{lab:['ارفع الحوض','انزل ببطء'],cue:['ادفع بكعبيك وارفع الحوض للأعلى','اعصر الألية في القمة ثانية','أبقِ الذقن مثبتاً دون تقويس الظهر'],mist:'القدمان بعيدتان جداً',mech:['الورك','مدّ (Hip Extension)']},
{lab:['اسحب البار','انزل ببطء'],cue:['اسحب البار نحو أسفل البطن','أبقِ الظهر مسطّحاً والجذع ثابتاً','اجمع لوحي الكتف عند القمة'],mist:'رفع الجذع أثناء السحب',mech:['المرفق','ثني (Flexion)']},
{lab:['ارفع الكتفين','انزل ببطء'],cue:['ارفع الكتفين نحو الأذنين مباشرة','اعصر العضلة شبه المنحرفة ثانية','أنزل ببطء دون تدوير الكتفين'],mist:'تقدّم الرأس للأمام',mech:['الكتف','رفع (Elevation)']},
{lab:['شدّ الجسم','حافظ على الثبات'],cue:['ابنِ خطاً مستقيماً من الرأس للكعبين','شدّ البطن والألية معاً','تنفّس بانتظام دون هبوط الحوض'],mist:'هبوط الحوض',mech:['الورك','ثبات (Neutral)']},
{lab:['ارفع الساقين','انزل ببطء'],cue:['ارفع الساقين بتقويس الحوض للأعلى','اشدّ أسفل البطن','أنزل ببطء دون تأرجح الجسم'],mist:'التأرجح بالجسم',mech:['الورك','ثني (Hip Flexion)']},
{lab:['ارفع الجذع','انزل ببطء'],cue:['ارفع الجذع حتى خط مستقيم مع الساقين','اعصر أسفل الظهر والألية','لا تتجاوز الخط المستقيم بالتقوّس'],mist:'فرط تقوّس الظهر',mech:['الورك','مدّ (Extension)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['اثنِ المرفقين وارفع البار نحو الصدر','ثبّت العضدين بجانب الجسم','أنزل البار ببطء حتى مدّ الذراعين'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع للأعلى','انزل ببطء'],cue:['ادفع الدمبل للأعلى فوق الصدر العلوي','ثبّت الكتفين على المقعد','أنزل ببطء حتى مستوى الصدر'],mist:'رفع الكتفين عن المقعد',mech:['المرفق','مدّ (Extension)']},
{lab:['مدّ المرفقين','انزل ببطء'],cue:['ثبّت العضدين قرب الرأس','مدّ المرفقين حتى النهاية','أنزل الدمبل ببطء خلف الرأس'],mist:'تحريك المرفقين للأمام',mech:['المرفق','مدّ (Extension)']},
{lab:['ارفع الساق للخلف','ارجع ببطء'],cue:['ادفع القدم للخلف بقوة الألية','أبقِ الجذع ثابتاً دون تقويس','اعصر الألية في القمة ثانية'],mist:'تقويس أسفل الظهر',mech:['الورك','مدّ (Hip Extension)']},
{lab:['اقبض البطن','ارجع ببطء'],cue:['اثنِ العمود الفقري نحو الأرض بقوة البطن','ثبّت الورك ولا تجلس للخلف','أبقِ الحبل بجانب الرأس'],mist:'تحريك الورك للخلف',mech:['العمود الفقري','ثني (Flexion)']},
{lab:['اسحب نحو الوجه','ارجع ببطء'],cue:['اسحب الحبل نحو الوجه والمرفقان للأعلى','اجمع لوحي الكتف للخلف','أبقِ الجذع ثابتاً دون ميل للخلف'],mist:'الميل للخلف أثناء السحب',mech:['المرفق','ثني (Flexion)']},
{lab:['انزل خلف الرأس','اسحب للأعلى'],cue:['أنزل الدمبل خلف الرأس بذراعين شبه مفرودتين','افتح القفص الصدري وتنفّس بعمق','اسحب الدمبل فوق الصدر بقوة'],mist:'ثني المرفقين',mech:['الكتف','ثني (Shoulder Flexion)']},
{lab:['اسحب للأعلى','انزل ببطء'],cue:['اسحب البار ملاصقاً للجسم حتى الصدر','قُد الحركة بالمرفقين للأعلى','أنزل البار ببطء دون تأرجح'],mist:'تأرجح الجسم للخلف',mech:['الكتف','رفع (Abduction)']},
{lab:['اسحب نحو الصدر','انزل ببطء'],cue:['اسحب المقبض نحو أسفل الصدر','أبقِ الظهر مسطّحاً والجذع ثابتاً','اجمع لوحي الكتف عند القمة'],mist:'رفع الجذع أثناء السحب',mech:['المرفق','ثني (Flexion)']},
{lab:['اسحب للأسفل','ارجع ببطء'],cue:['اسحب الذراعين مفرودتين نحو الفخذين','اعصر عضلة اللاتس بالأسفل','أبقِ المرفقين شبه مفرودين'],mist:'ثني المرفقين',mech:['الكتف','مدّ (Shoulder Extension)']},
{lab:['اقطع بقطر الجسم','ارجع ببطء'],cue:['اسحب الحبل قطرياً من الأعلى للأسفل','لفّ الجذع من الخصر وليس بالذراعين','ثبّت القدمين وشدّ البطن'],mist:'تحريك الورك بدل الجذع',mech:['الجذع','دوران (Rotation)']},
{lab:['ارفع الذراعين جانباً','انزل ببطء'],cue:['ارفع الدمبل جانباً حتى مستوى الكتفين','قُد الحركة بالمرفق ولا ترفع الكتفين','أنزل ببطء مع ثبات الجذع'],mist:'رفع الكتفين نحو الأذنين',mech:['الكتف','إبعاد (Abduction)']},
{lab:['اجمع اليدين أمام الصدر','افتح ببطء'],cue:['اجمع اليدين أمام الصدر مع ثني بسيط بالمرفق','اعصر عضلات الصدر في المنتصف','افتح ببطء حتى تشعر بتمدد الصدر'],mist:'رفع الكتفين أثناء الجمع',mech:['الكتف','تقريب (Adduction)']},
{lab:['ارفع الذراع جانباً','انزل ببطء'],cue:['ارفع الذراع جانباً حتى مستوى الكتف','أبقِ الجذع ثابتاً وغير مائل','أنزل ببطء ضد مقاومة الحبل'],mist:'ميل الجذع للجانب',mech:['الكتف','إبعاد (Abduction)']},
{lab:['لفّ الجذع','بدّل الجهة'],cue:['لفّ الجذع بالكامل مع الكتفين','أبقِ الصدر مرفوعاً وساقيك ثابتتين','حرّك الوزن بقوة الخصر لا الذراعين'],mist:'تحريك الذراعين فقط',mech:['الجذع','دوران (Rotation)']},
{lab:['ادفع البار للأعلى','انزل ببطء'],cue:['اضغط البار فوق الصدر بخط مستقيم','ثبّت لوحي الكتف على المقعد','أنزل البار ببطء حتى يلامس أسفل الصدر'],mist:'ارتداد البار عن الصدر',mech:['المرفق','مدّ (Extension)']},
{lab:['ادفع البار للأعلى','انزل ببطء'],cue:['ادفع البار فوق أعلى الصدر','ثبّت الكتفين على المقعد المائل','أنزل البار ببطء حتى أعلى الصدر'],mist:'رفع الكتفين عن المقعد',mech:['المرفق','مدّ (Extension)']},
{lab:['ادفع البار للأعلى','انزل ببطء'],cue:['أبقِ المرفقين قريبين من الجسم','ادفع البار بقوة الترايسبس','أنزل البار ببطء إلى أسفل الصدر'],mist:'إبعاد المرفقين للخارج',mech:['المرفق','مدّ (Extension)']},
{lab:['ارفع البار','انزل بتحكم'],cue:['ادفع الأرض بقدميك وارفع البار قريباً من الساقين','أبقِ الظهر مسطّحاً والصدر مرفوعاً','اشدّ الألية في القمة دون تقويس'],mist:'تقويس الظهر عند الرفع',mech:['الورك','مدّ (Hip Extension)']},
{lab:['انزل ببطء','قف بقوة'],cue:['أمسك الدمبل أمام الصدر والمرفقان للأسفل','اهبط حتى توازي الفخذين مع الأرض','ادفع الأرض بكعبيك وأبقِ الصدر مرفوعاً'],mist:'انحناء الجذع للأمام',mech:['الركبة','ثني (Flexion)']},
{lab:['ادفع الورك للخلف','قف بقوة'],cue:['ادفع الورك للخلف والركبتان شبه ثابتتين','أبقِ الدمبل ملاصقاً للساقين','اشدّ الألية للأمام عند الوقوف'],mist:'ابتعاد الدمبل عن الساقين',mech:['الورك','ثني (Hip Hinge)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['أمسك الدمبلين بقبضة محايدة والإبهام للأعلى','اثنِ المرفق وارفع الدمبل نحو الكتف','أنزل ببطء مع ثبات العضد بجانب الجسم'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['اسحب نحو الكتف المقابل','انزل ببطء'],cue:['اسحب الدمبل قطرياً نحو الكتف المقابل','أبقِ المرفق ثابتاً قرب الجسم','أنزل ببطء مع التحكم'],mist:'ابتعاد المرفق عن الجسم',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفق','انزل ببطء'],cue:['ثبّت المرفق على باطن الفخذ','اثنِ المرفق واعصر العضلة في القمة','أنزل الدمبل ببطء حتى مدّ الذراع'],mist:'رفع المرفق عن الفخذ',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['استلقِ على المقعد المائل والذراعان متدليتان','اثنِ المرفق دون تحريك الكتف','أنزل ببطء لتمتد العضلة بالكامل'],mist:'تقدّم الكتف للأمام',mech:['المرفق','ثني (Flexion)']},
{lab:['مدّ الذراع للخلف','ارجع ببطء'],cue:['ثبّت العضد موازياً للجذع','مدّ المرفق للخلف حتى النهاية','أبقِ الظهر مسطّحاً وغير متحرك'],mist:'نزول المرفق',mech:['المرفق','مدّ (Extension)']},
{lab:['اسحب الدمبل','انزل ببطء'],cue:['اسحب الدمبل نحو الورك بمرفق قريب','أبقِ الظهر مسطّحاً والجذع ثابتاً','اعصر لوح الكتف في الأعلى'],mist:'لفّ الجذع أثناء السحب',mech:['المرفق','ثني (Flexion)']},
{lab:['انزل ببطء','ادفع بالكعب'],cue:['ضع القدم الخلفية على المقعد','انزل حتى تلامس الركبة الخلفية الأرض تقريباً','ادفع بكعب القدم الأمامية للأعلى'],mist:'انحناء الجذع للأمام',mech:['الركبة','ثني (Flexion)']},
{lab:['مدّ المرفقين','انزل ببطء'],cue:['ثبّت العضدين عمودياً فوق الصدر','أنزل البار نحو الجبهة بثني المرفقين فقط','مدّ المرفقين دون تحريك الكتفين'],mist:'تحريك المرفقين للخارج',mech:['المرفق','مدّ (Extension)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['أمسك البار بقبضة مقلوبة','اثنِ المرفقين وأبقِ المعصمين مستقيمين','أنزل ببطء مع ثبات العضد'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['ثبّت العضدين على الوسادة','اثنِ المرفقين واعصر العضلة في القمة','أنزل ببطء حتى شبه مدّ كامل'],mist:'رفع المرفقين عن الوسادة',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['اسحب الحبل بثني المرفقين فقط','ثبّت العضدين بجانب الجسم','أنزل ببطء ضد مقاومة الكيبل'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['أمسك الحبل بقبضة محايدة','اثنِ المرفقين نحو الكتفين','أنزل ببطء مع ثبات العضد'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع للأسفل','ارجع ببطء'],cue:['ثبّت العضدين وادفع الحبل للأسفل','افتح الحبل جانباً في الأسفل','ارجع ببطء حتى زاوية 90 درجة'],mist:'تحريك المرفقين للأمام',mech:['المرفق','مدّ (Extension)']},
{lab:['مدّ المرفقين','ارجع ببطء'],cue:['ثبّت العضدين قرب الرأس','مدّ المرفقين للأعلى بقوة','أنزل الحبل خلف الرأس ببطء'],mist:'تحريك المرفقين للأمام',mech:['المرفق','مدّ (Extension)']},
{lab:['اثنِ المرفقين','انزل ببطء'],cue:['أمسك الكيبل بقبضة مقلوبة','اثنِ المرفقين وأبقِ المعصمين مستقيمين','أنزل ببطء مع ثبات العضد'],mist:'تأرجح الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['ارفع اليدين للأعلى','افتح ببطء'],cue:['اسحب اليدين قطرياً من الأسفل للأعلى','اجمع اليدين أمام أعلى الصدر','افتح ببطء حتى تمتد عضلات الصدر'],mist:'رفع الكتفين أثناء الجمع',mech:['الكتف','تقريب (Adduction)']},
{lab:['ادفع للأعلى','انزل ببطء'],cue:['ابدأ والدمبل أمام الوجه والكفان للداخل','لفّ المعصمين للخارج أثناء الدفع للأعلى','أنزل ببطء وأعد اللفّ للداخل'],mist:'تقويس الظهر للخلف',mech:['الكتف','دفع (Press)']}];
function jointArc(c,p1,p2,label){const a1=Math.atan2(p1[1]-c[1],p1[0]-c[0]),a2=Math.atan2(p2[1]-c[1],p2[0]-c[0]);let d=a2-a1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;const r=38,am=a1+d/2,sw=d>0?1:0;
 const q=(k,rr)=>[c[0]+rr*Math.cos(k),c[1]+rr*Math.sin(k)];const p=q(a1,r),e=q(a2,r),t=q(am,r+22);
 return `<path d="M${p[0]} ${p[1]} A${r} ${r} 0 0 ${sw} ${e[0]} ${e[1]}" fill="none" stroke="${Y}" stroke-width="3" stroke-linecap="round"/><text x="${t[0]}" y="${t[1]+6}" text-anchor="middle" fill="${Y}" font-family="monospace" font-size="17" font-weight="bold" stroke="#050806" stroke-width="3" paint-order="stroke">${label}°</text>`}
function mechLine(u,cfg,angle){const ph=u<.38?0:u<.46?1:u<.92?2:3,ct=['انقباض متحرّك (Concentric)','انقباض ثابت (Isometric)','انقباض لامركزي (Eccentric)','راحة'][ph];
 return `<text x="360" y="692" text-anchor="middle" direction="rtl" style="unicode-bidi:embed" fill="#bcd3c8" font-family="T" font-size="17">${cfg.mech[0]} · ${cfg.mech[1]} · ${Math.round(angle)}° &#160;&#160;|&#160;&#160; ${ct}</text>`}
function flx(a,b,c){const v1=[a[0]-b[0],a[1]-b[1]],v2=[c[0]-b[0],c[1]-b[1]],d=Math.acos(Math.max(-1,Math.min(1,(v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2)||1))));return 180-d*180/Math.PI}
function scene1(t,o){const u=t/3%1,w=o.wrong,p=E(u),th=(6+92*p)*Math.PI/180,lf=w?26*p:0;
 const H=[310,470-lf],S=[290,330-lf],K=[450,470-lf*.5],dir=[Math.cos(th),Math.sin(th)],A=add(K,dir,145),F=add(A,[Math.cos(th-1.2),Math.sin(th-1.2)],32),nrm=[-dir[1],dir[0]];
 let s=bgl('SEATED LEG CURL','كيرل أرجل جالس','الهامسترينغ');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[0]/8)),p*70,70,o.kg[0]);s+=L([95,300],[95,255],2,'#8fa39a');
 s+=L([20,670],[600,670],6,'#3b4a43')+R(250,492,190,26,'#27312d',10)+L([345,518],[345,670],10,'#4a5a52');
 s+=`<g transform="rotate(8 260 400)">${R(212,300,42,190,'#2d3834',8)}</g>`;
 s+=torso(H,S,[S[0]+12,S[1]-62]);
 s+=guide(`M ${450+145*Math.cos(.1)} ${470+145*Math.sin(.1)} A 145 145 0 0 1 ${450+145*Math.cos(1.7)} ${470+145*Math.sin(1.7)}`)+limb(H,K,34)+shorts(H,K)+muscle([385,478-lf*.4],60,14,0,p,'p')+limb(K,A,28)+muscle(add(K,dir,70),42,9,th*180/Math.PI,p,'s')+shoe(A,F);
 s+=R(395,424-lf*.4,70,16,'#3b4a43',8,'#51615a')+L([430,424-lf*.4],[430,380],6,'#51615a');
 s+=L(add(K,nrm,-26),add(A,nrm,-26),9,'#51615a')+L(add(K,nrm,-26),K,9,'#51615a')+C(K,13,'#3b4a43',G,2)+C(add(A,nrm,-26),16,'#5b6b64',G,3)+C(K,10,JT)+C(H,10,JT);
 const Es=[345,440-lf],Ws=[410,462-lf*.5];s+=limb(S,Es,22)+limb(Es,Ws,20)+hand(Ws);
 s+=jointArc(K,[2*K[0]-H[0],2*K[1]-H[1]],A,Math.round(th*180/Math.PI))+head(add(S,[12,-62]))+ui(u,o,CFG[0],th*180/Math.PI);if(w)s+=`<path d="M310 ${440-lf} L310 ${470}" stroke="${RED}" stroke-width="3" stroke-dasharray="4 5"/>`;return s}
function scene2(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),S=[290,448],arch=w?14*Math.sin(Math.PI*p):0;
 const El=[S[0]+18-16*p,S[1]+24-119*p+(w?14*(1-p):0)],W=[El[0],El[1]-85];
 let s=bgl('DB BENCH PRESS','ضغط صدر بالدمبل','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(150,480,420,28,'#27312d',10)+L([200,508],[200,670],10,'#4a5a52')+L([520,508],[520,670],10,'#4a5a52');
 const Hp=[480,460-arch],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472]);
 s+=torso([470,452-arch],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=guide(`M 308 387 L 292 268`)+muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-34],[W[0],W[1]+34],9,'#51615a')+C([W[0],W[1]-34],17,'#7d8985',G,3)+C([W[0],W[1]+34],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[1]}×2 كغ</text>`+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[1],flx(S,El,W));return s}
function scene3(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,500],S=[330-16*p+(w?20*p:0),335],B=[w?296:372,152+213*p];
 const El=ik(S,B,100,95,1);
 let s=bgl('LAT PULLDOWN','سحب علوي بالكيبل','الظهر العريض');
 s+=stack(590,250,10,Math.max(1,Math.round(o.kg[2]/10)),p*60,60,o.kg[2]);
 s+=L([20,670],[700,670],6,'#3b4a43')+R(270,522,150,24,'#27312d',10)+L([345,546],[345,670],10,'#4a5a52');
 s+=L([375,124],[620,124],6,'#51615a')+C([375,124],14,'#5b6b64')+C([620,124],14,'#5b6b64')+L([620,124],[620,250-20-p*60+1],2,'#8fa39a');
 s+=L([375,124],[B[0],B[1]],2,'#8fa39a')+L([B[0]-120,B[1]],[B[0]+110,B[1]],10,'#9aa6a2')+C([B[0]-120,B[1]],8,G)+C([B[0]+110,B[1]],8,G);
 const K=[455,490],F=[465,610];
 s+=limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[505,622])+R(380,455,100,18,'#27312d',8);
 s+=torso(H,S,add(S,[w?24:6,w?-52:-58]),1)+muscle(add(S,[-14,75]),24,66,-3,p,'p');
 s+=guide('M 372 152 L 372 365')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,B,22)+C(El,9,JT)+C(S,11,JT)+hand(B);
 s+=head(add(S,[w?24:6,w?-52:-58]),[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],B,Math.round(flx(S,El,B)))+ui(u,o,CFG[2],flx(S,El,B));return s}

function scene4(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),arch=w?14*Math.sin(Math.PI*p):0;
 const H=[400,480-arch],S=[310,368-arch*.6],ux=S[0]-H[0],uy=S[1]-H[1],dl=Math.hypot(ux,uy),uv=[ux/dl,uy/dl],n=[-uv[1],uv[0]],hp=add(S,uv,62);
 const El=[S[0]+22-14*p,S[1]+26-120*p+(w?14*(1-p):0)],W=[El[0],El[1]-85],K=[500,470],F=[515,585],nb=[-n[0],-n[1]];
 let s=bgl('INCLINE DB PRESS','ضغط صدر مائل بالدمبل','أعلى الصدر');s+='<g transform="translate(36 67) scale(.9)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+cap(add(H,nb,34),add(add(S,uv,30),nb,34),30,30,'#2d3834','#0c1210')+R(370,500,150,22,'#27312d',8)+L([440,522],[440,670],10,'#4a5a52')+L([300,560],[440,540],8,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[552,595])+torso(H,S,hp,1)+C(H,10,JT)+head(hp,n);
 s+=guide(`M ${W[0]} ${S[1]-120+0} L ${W[0]} ${S[1]-8}`)+muscle(add(add(S,uv,-30),n,14),38,19,ang(H,S),p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-34],[W[0],W[1]+34],9,'#51615a')+C([W[0],W[1]-34],17,'#7d8985',G,3)+C([W[0],W[1]+34],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[3]}×2 كغ</text>`;
 s+=jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+'</g>'+ui(u,o,CFG[3],flx(S,El,W));return s}
function scene5(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[290,448],th=(100-100*p)*Math.PI/180,arm=w?150:172;
 const W=[S[0]+10,S[1]-arm*Math.cos(th)],dm=mid(S,W),El=[dm[0]+(w?46:16),dm[1]];
 let s=bgl('DUMBBELL FLY','تفتيح صدر بالدمبل','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(150,480,420,28,'#27312d',10)+L([200,508],[200,670],10,'#4a5a52')+L([520,508],[520,670],10,'#4a5a52');
 const Hp=[480,460],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472])+torso([470,452],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-34],[W[0],W[1]+34],9,'#51615a')+C([W[0],W[1]-34],17,'#7d8985',G,3)+C([W[0],W[1]+34],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[4]}×2 كغ</text>`;
 // front-view inset
 const cx=590,cy=270,sc=.46,bend=w?20:7;let ins=R(480,160,200,170,'#0c1612',14,'#2c3a33')+`<text x="580" y="184" text-anchor="middle" fill="#8fa39a" font-family="T" font-size="16">منظر أمامي</text>`+L([cx-34,cy],[cx+34,cy],10,'#27312d');
 for(const sg of [-1,1]){const sh=[cx+sg*34,cy],wr=[sh[0]+sg*arm*sc*Math.sin(th),sh[1]-arm*sc*Math.cos(th)],em=[mid(sh,wr)[0]+sg*bend,mid(sh,wr)[1]];ins+=L(sh,em,9,'#c3ab94')+L(em,wr,8,'#c3ab94')+C(wr,8,'#7d8985',G,2)}
 ins+=`<text x="580" y="318" text-anchor="middle" fill="${Y}" font-family="monospace" font-size="15">${Math.round(th*180/Math.PI)}°</text>`;
 s+=ins+ui(u,o,CFG[4],th*180/Math.PI);return s}
function scene6(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?30*p:0,H=[330,500],S=[330-lean,340];
 const El=[S[0]+20-8*p,S[1]+80-175*p],W=[El[0],El[1]-85],K=[455,490],F=[465,610];
 let s=bgl('SHOULDER PRESS','ضغط كتف جالس بالدمبل','الكتف الأمامي');s+='<g transform="translate(36 67) scale(.9)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+R(270,522,150,24,'#27312d',10)+L([345,546],[345,670],10,'#4a5a52')+`<g transform="rotate(${w?0:3} 300 420)">${R(270,300,36,226,'#2d3834',8)}</g>`;
 s+=limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[505,622])+torso(H,S,add(S,[6+lean*.2,-58]),1)+muscle(add(S,[10,-4]),20,26,0,p,'p')+guide(`M ${W[0]} ${S[1]-125} L ${W[0]} ${S[1]-5}`);
 s+=limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-34],[W[0],W[1]+34],9,'#51615a')+C([W[0],W[1]-34],17,'#7d8985',G,3)+C([W[0],W[1]+34],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[5]}×2 كغ</text>`;
 s+=head(add(S,[6+lean*.2,-58]),[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+'</g>'+ui(u,o,CFG[5],flx(S,El,W));return s}

function scene7(t,o){const u=t/3%1,w=o.wrong,p=E(u),sw=w?40*(1-p)-30*p:0,H=[300,500],S=[300+sw-10*p,360],K=[415,468],F=[505,530],B=[S[0]+190-150*p,S[1]+48+22*p],El=ik(S,B,100,95,1),hp=add(S,[6+sw*.1,-58]);
 let s=bgl('CABLE ROW','سحب كيبل جالس (تجديف)','الظهر');
 s+=stack(620,300,10,Math.max(1,Math.round(o.kg[6]/8)),p*50,60,o.kg[6]);
 s+=L([20,670],[700,670],6,'#3b4a43')+R(240,505,140,22,'#27312d',10)+L([310,527],[310,670],10,'#4a5a52')+R(528,470,14,100,'#3b4a43',4)+L([535,570],[535,670],8,'#4a5a52');
 s+=L([570,430],[570,262],2,'#8fa39a')+L([570,262],[650,262],2,'#8fa39a')+L([650,262],[650,276-p*50],2,'#8fa39a')+C([570,430],8,'#5b6b64')+L(B,[570,430],2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]+32,F[1]+6])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-12,62]),22,50,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,B,22)+C(El,9,JT)+C(S,11,JT)+L([B[0],B[1]-20],[B[0],B[1]+20],8,'#51615a')+hand(B);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],B,Math.round(flx(S,El,B)))+ui(u,o,CFG[6],flx(S,El,B));return s}
function scene8(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?26*p:0,A=[330,630],K=[335,520],H=[330,420],S=[330-lean,292],hp=add(S,[6-lean*.1,-58]);
 const El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('DB BICEPS CURL','كيرل بايسبس بالدمبل','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),36,13,ang(S,El),p,'p')+limb(El,W,22)+muscle(mid(El,W,.3),26,8,ang(El,W),p,'s')+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-30],[W[0],W[1]+30],9,'#51615a')+C([W[0],W[1]-30],16,'#7d8985',G,3)+C([W[0],W[1]+30],16,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[7]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[7],flx(S,El,W));return s}
function scene9(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?24:6,A=[330,630],K=[335,520],H=[330,420],S=[330+lean,292],hp=add(S,[8,-56]);
 const El=[S[0]+(w?30*p:0)+4,S[1]+92],ph=(100-100*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('TRICEPS PUSHDOWN','نزول ترايسبس بالكيبل','ثلاثية الرؤوس');
 s+=stack(620,300,10,Math.max(1,Math.round(o.kg[8]/6)),p*60,60,o.kg[8]);
 s+=L([20,670],[700,670],6,'#3b4a43')+L([440,128],[620,128],6,'#51615a')+C([440,128],14,'#5b6b64')+C([620,128],14,'#5b6b64')+L([620,128],[620,286-p*60],2,'#8fa39a')+L([440,128],W,2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[-7,0]),36,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-6,W[1]-4,12,10,'#51615a',3)+hand(W);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[8],flx(S,El,W));return s}

function scene10(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-65*p,422+95*p],lean=(28+(w?32:0))*p*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8+10*Math.sin(lean),-52]),K=ik(H,A,100,110,-1),W=add(S,[-6,-2]),El=ik(S,W,52,52,-1);
 let s=bgl('BARBELL SQUAT','سكوات بالبار','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0]-2,W[1]-4],[W[0]-2,W[1]+4],10,'#7d8985')+C([W[0]-4,W[1]-2],34,'#51615a','#0c1210',4)+C([W[0]-4,W[1]-2],18,'#7d8985')+hand(W)+`<text x="${W[0]-90}" y="${W[1]-44}" fill="${Y}" font-family="T" font-size="22">${o.kg[9]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[9],flx(H,K,A));return s}
function scene11(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-72*p,410+10*p],lean=(84*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[56*Math.sin(lean)+8*(1-p),-48+22*p]),K=ik(H,A,100,110,-1),Wx=S[0]+8+(w?58*p:0),Wd=[Wx,S[1]+(150-40*p)];
 const Wp=[Wd[0],Math.min(Wd[1],575)];
 let s=bgl('ROMANIAN DEADLIFT','ديدليفت روماني','الهامسترينغ');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,K,.45),[-12,0]),38,13,ang(H,K),p,'p')+limb(S,Wp,24)+C(S,11,JT)+C(Wp,34,'#51615a','#0c1210',4)+C(Wp,18,'#7d8985')+hand(Wp)+`<text x="${Wp[0]+44}" y="${Wp[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[10]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[10],flx(S,H,K));return s}
function scene12(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[250,520-(w?34*p:0)],A=[H[0]+100+100*p,H[1]-40-20*p],K=ik(H,A,100,110,-1),S=[H[0]-88,H[1]-96],hp=add(S,[-28,-42]),Hd=[H[0]+6,H[1]-50];
 let s=bgl('LEG PRESS','ضغط أرجل','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([H[0]-40,540],[H[0]+360,420],14,'#27312d')+L([H[0]-40,540],[H[0]-40,670],12,'#4a5a52')+L([H[0]+360,420],[H[0]+360,670],12,'#4a5a52');
 s+=L(add(H,[-16,16]),add(S,[-16,16]),30,'#2d3834')+L([H[0]-34,H[1]+26],[H[0]+44,H[1]+26],18,'#2d3834');
 s+=`<g transform="rotate(-20 ${A[0]+26} ${A[1]})">${R(A[0]+18,A[1]-90,16,180,'#51615a',6)}</g>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+18,A[1]+2])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,Hd,24)+C(S,11,JT)+hand(Hd)+head(hp,[1,0]);
 s+=`<text x="${A[0]+56}" y="${A[1]-100}" fill="${Y}" font-family="T" font-size="22">${o.kg[11]} كغ</text>`;
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[11],flx(H,K,A));return s}

function scene13(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[240,520],K=[H[0]+104,H[1]-6],th=(8+78*p)*Math.PI/180,A=[K[0]+110*Math.sin(th),K[1]+110*Math.cos(th)],bk=w?36*p:0,S=[H[0]-22-bk,H[1]-126+bk*.2],hp=add(S,[-4-bk*.1,-54]);
 let s=bgl('LEG EXTENSION','تمديد أرجل','الفخذ');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(H[0]-50,H[1]+10,150,24,'#27312d',10)+L([H[0]+20,H[1]+34],[H[0]+20,670],10,'#4a5a52')+L(add(H,[-40,20]),add(S,[-30,10]),26,'#2d3834');
 s+=L(add(A,[6,-12]),add(A,[6,18]),20,'#51615a')+L(K,add(K,[8,10]),6,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+6])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,[H[0]+30,H[1]-20],24)+hand([H[0]+30,H[1]-20])+C(S,11,JT)+head(hp,[1,0]);
 s+=`<text x="${A[0]+40}" y="${A[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[12]} كغ</text>`;
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[12],flx(H,K,A));return s}
function scene14(t,o){const u=t/3%1,w=o.wrong,p=E(u),T=[408,640],lift=46*p,A=[336,628-lift],bend=w?34*p:0,H=[338+bend*.6,A[1]-206+bend],S=[H[0]+4,H[1]-128],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1);
 let s=bgl('STANDING CALF RAISE','رفع سمانة واقفاً','السمانة');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(300,646,150,24,'#27312d',6);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,T)+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(K,A,.4),[-9,0]),34,13,ang(K,A),p,'p')+limb(S,[S[0]+6,S[1]+110],24)+C(S,11,JT)+head(hp,[1,0]);
 s+=`<text x="${H[0]+80}" y="${H[1]-60}" fill="${Y}" font-family="T" font-size="22">${o.kg[13]} كغ</text>`;
 s+=jointArc(A,K,T,Math.round(flx(K,A,T)))+ui(u,o,CFG[13],flx(K,A,T));return s}
function scene15(t,o){const u=t/3%1,w=o.wrong,p=E(u),c=(42*p)*Math.PI/180,H=[470,556],A=[590,566],K=ik(H,A,100,110,-1),S=[H[0]-128*Math.cos(c),H[1]-128*Math.sin(c)-14],nk=w?30*p:0,hp=[S[0]-54*Math.cos(c)-nk,S[1]-54*Math.sin(c)-14-(w?10*p:0)];
 let s=bgl('CRUNCH','كرنش بطن','عضلات البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(130,566,520,30,'#27312d',14)+L([200,596],[200,670],8,'#3b4a43')+L([580,596],[580,670],8,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),58,13,ang(H,S),p,'p')+limb(S,add(hp,[10,-4]),22)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[14],flx(S,H,K));return s}

function scene16(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?-18*p:0,S=[330+lean,292],hp=add(S,[6+lean*.1,-58]),ph=(90*p)*Math.PI/180,W=[S[0]+8+120*Math.sin(ph),S[1]+8+120*Math.cos(ph)];
 let s=bgl('FRONT RAISE','رفع أمامي بالدمبل','الكتف الأمامي');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,W,24)+muscle(add(S,[10,6]),18,18,0,p,'p')+C(S,11,JT)+L([W[0],W[1]-28],[W[0],W[1]+28],9,'#51615a')+C([W[0],W[1]-28],15,'#7d8985',G,3)+C([W[0],W[1]+28],15,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+40}" y="${W[1]-34}" fill="${Y}" font-family="T" font-size="22">${o.kg[15]} كغ</text>`;
 s+=head(hp,[1,0])+ui(u,o,CFG[15],ph*180/Math.PI);return s}
function scene17(t,o){const u=t/3%1,w=o.wrong,p=E(u),F=[130,562],Wr=[520,558],S=[500-12*p,428+104*p],sag=w?42*p:0,Hm=[S[0]+(F[0]-S[0])*.58,S[1]+(F[1]-S[1])*.58+sag],H=Hm,K=[ (H[0]+F[0])/2,(H[1]+F[1])/2+sag*.2],dir=[(S[0]-F[0]),(S[1]-F[1])],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54]),El=ik(S,Wr,70,64,1);
 let s=bgl('PUSH-UP','تمرين الضغط','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-4,22]),24,16,ang(F,S)+90,p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(El,S,Wr,Math.round(flx(S,El,Wr)))+ui(u,o,CFG[16],flx(S,El,Wr));return s}
function scene18(t,o){const u=t/3%1,w=o.wrong,p=E(u),sw=w?40*Math.sin(u*Math.PI*2):0,W=[330,200],S=[330+sw*.5,330-108*p],H=[S[0]+sw*.3-4*p,S[1]+128],K=[H[0]-8+sw*.4,H[1]+100],A=[K[0]-14+sw*.6,K[1]+104],hp=add(S,[6,-56]),El=ik(S,W,66,66,1);
 let s=bgl('PULL-UP','تمرين العقلة','الظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([150,200],[510,200],10,'#7d8985')+L([150,200],[150,670],8,'#3b4a43')+L([510,200],[510,670],8,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(S,H,.3),[-12,0]),22,40,0,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 s+=jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[17],flx(S,El,W));return s}

function scene19(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?24*p:0,S=[330-lean,292],hp=add(S,[8-lean*.1,-56]),W=[S[0]+14,S[1]-4-132*p],El=ik(S,W,68,68,1);
 let s=bgl('OVERHEAD PRESS','ضغط كتف بالبار','الكتف');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(S,[10,4]),18,20,0,p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(add(W,[0,-2]),30,'#51615a','#0c1210',4)+C(add(W,[0,-2]),15,'#7d8985')+hand(W)+`<text x="${W[0]+48}" y="${W[1]-18}" fill="${Y}" font-family="T" font-size="22">${o.kg[18]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[18],flx(S,El,W));return s}
function scene20(t,o){const u=t/3%1,w=o.wrong,p=E(u),W=[330,360],fw=w?34*p:0,S=[330+fw,224+76*p],hp=add(S,[8+fw*.3,-52]),H=[S[0]-6-fw*.4,S[1]+128],K=[H[0]+14,H[1]+92],A=[K[0]-72,K[1]+44],El=ik(S,W,68,68,1);
 let s=bgl('PARALLEL BAR DIPS','تمرين الغطس','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([270,360],[420,360],12,'#7d8985')+L([300,360],[300,670],10,'#3b4a43')+L([400,360],[400,670],10,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]-30,A[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[2,26]),22,18,0,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 s+=jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[19],flx(S,El,W));return s}
function scene21(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[430,615],B=[205,600],H=[322,408+100*p],lean=w?26*p*Math.PI/180:0,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),K2=ik(H,B,100,110,-1);
 let s=bgl('WALKING LUNGE','طعن أمامي (لانج)','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="320" cy="660" rx="160" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,B,28)+shoe(B,[B[0]-30,B[1]+14])+C(K2,10,JT);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,[S[0]+6,S[1]+100],24)+C(S,11,JT)+head(hp,[1,0]);
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[20],flx(H,K,A));return s}

function scene22(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[205,540],A=[w?500:430,630],H=[325,596-78*p],K=ik(H,A,100,110,-1),hp=[S[0]-40,S[1]-44],Hd=[H[0]+6,H[1]-24];
 let s=bgl('HIP THRUST','دفع الحوض (هيب ثراست)','عضلة الألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(120,552,150,100,'#27312d',14)+L([150,652],[150,670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(H,[-14,2]),26,22,0,p,'p')+limb(S,Hd,24)+C(S,11,JT)+C(add(Hd,[0,-6]),30,'#51615a','#0c1210',4)+C(add(Hd,[0,-6]),15,'#7d8985')+hand(Hd)+head(hp,[1,0])+`<text x="${Hd[0]+46}" y="${Hd[1]-34}" fill="${Y}" font-family="T" font-size="22">${o.kg[21]} كغ</text>`;
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[21],flx(S,H,K));return s}
function scene23(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[340,630],H=[290,430],lean=(62-(w?24*p:0))*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[48*Math.cos(lean*.6),-30]),K=ik(H,A,100,110,-1),W=[S[0]+8-48*p,S[1]+130-80*p],El=ik(S,W,68,66,1);
 let s=bgl('BENT-OVER ROW','سحب البار منحنياً','الظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="100" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,S,.55),[-6,-6]),42,13,ang(H,S),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,32,'#51615a','#0c1210',4)+C(W,16,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[22]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[22],flx(S,El,W));return s}
function scene24(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],S=[330,292-30*p],fw=w?30:0,hp=add(S,[8+fw,-56+30*p*.2]),W=[S[0]+10,S[1]+150];
 let s=bgl('DUMBBELL SHRUG','رفع الكتفين (شراغز)','الترابيس');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,W,24)+muscle(add(S,[-6,-14]),30,12,-20,p,'p')+C(S,11,JT)+L([W[0],W[1]-24],[W[0],W[1]+24],9,'#51615a')+C([W[0],W[1]-24],15,'#7d8985',G,3)+C([W[0],W[1]+24],15,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+40}" y="${W[1]}" fill="${Y}" font-family="T" font-size="22">${o.kg[23]} كغ</text>`;
 s+=head(hp,[1,0])+ui(u,o,CFG[23],30*p*3);return s}
function scene25(t,o){const u=t/3%1,w=o.wrong,p=E(u),F=[130,562],S=[470,490],sag=w?46:0,H=[S[0]+(F[0]-S[0])*.58,S[1]+(F[1]-S[1])*.58+sag],K=[(H[0]+F[0])/2,(H[1]+F[1])/2+sag*.2],dir=[S[0]-F[0],S[1]-F[1]],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54]),El=[S[0]+4,562],Wr=[S[0]+86,562];
 let s=bgl('PLANK','بلانك','البطن والجذع');
 s+=L([20,578],[700,578],4,'#27312d')+L([20,670],[700,670],6,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),70,12,ang(H,S),p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[24],flx(S,H,K));return s}
function scene26(t,o){const u=t/3%1,w=o.wrong,p=E(u),W=[330,152],sw=w?-34*Math.sin(u*Math.PI*2):0,S=[330+sw*.4,285],H=[S[0]+sw*.3,S[1]+128],ph=(86*p)*Math.PI/180,K=[H[0]+100*Math.sin(ph),H[1]+100*Math.cos(ph)],A=[K[0]+110*Math.sin(ph),K[1]+110*Math.cos(ph)],hp=add(S,[6,-56]),El=ik(S,W,68,66,1);
 let s=bgl('HANGING LEG RAISE','رفع الساقين معلّقاً','أسفل البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([150,152],[510,152],10,'#7d8985')+L([150,152],[150,670],8,'#3b4a43')+L([510,152],[510,670],8,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34*Math.cos(ph),A[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(S,H,.75),[8,0]),22,22,0,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[25],flx(S,H,K));return s}
function scene27(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,470],A=[450,610],al=(-52+(w?100:62)*p)*Math.PI/180,S=[H[0]-128*Math.cos(al),H[1]-128*Math.sin(al)],hp=[S[0]-54*Math.cos(al),S[1]-54*Math.sin(al)-4],K=mid(H,A,.5);
 let s=bgl('BACK EXTENSION','تمرين أسفل الظهر','أسفل الظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([270,500],[470,640],14,'#27312d')+L([300,520],[300,670],10,'#3b4a43')+L([440,620],[440,670],10,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),50,12,ang(H,S),p,'p')+limb(S,add(S,[14,30]),24)+C(S,11,JT)+head(hp,[-1,.4]);
 s+=ui(u,o,CFG[26],flx(S,H,K));return s}

function scene28(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?26*p:0,S=[330-lean,292],hp=add(S,[6-lean*.1,-58]),El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('BARBELL CURL','كيرل بالبار','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),36,13,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(W,30,'#51615a','#0c1210',4)+C(W,15,'#7d8985')+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[27]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[27],flx(S,El,W));return s}
function scene29(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[310,560],A=[420,640],K=ik(H,A,100,110,-1),S=[H[0]-92,H[1]-90+(w?0:0)],hp=add(S,[-28,-44]),sh=w?-14*p:0,Wb=[S[0]+34,S[1]-6+sh],W=[Wb[0]+10,Wb[1]-128*p],El=ik(S,W,68,66,-1);
 let s=bgl('INCLINE DB PRESS','ضغط مائل بالدمبل','الصدر العلوي');
 s+=L([20,670],[700,670],6,'#3b4a43')+L(add(H,[-18,18]),add(S,[-18,18]),34,'#2d3834')+L([H[0]-40,H[1]+30],[H[0]+40,H[1]+30],18,'#2d3834')+L([H[0],H[1]+36],[H[0],670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[20,6]),20,16,40,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,26,'#51615a','#0c1210',4)+C(W,13,'#7d8985')+hand(W)+`<text x="${W[0]+40}" y="${W[1]-10}" fill="${Y}" font-family="T" font-size="22">${o.kg[28]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[28],flx(S,El,W));return s}
function scene30(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],S=[330,292],hp=add(S,[8,-56]),fw=w?34*p:0,El=[S[0]+6+fw,S[1]-72],th=(165*(1-p))*Math.PI/180,W=[El[0]-68*Math.sin(th),El[1]-68*Math.cos(th)];
 let s=bgl('OVERHEAD TRICEPS EXT','ترايسبس فوق الرأس','ثلاثية الرؤوس');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=head(hp,[1,0])+limb(S,El,26)+muscle(add(mid(S,El),[-8,0]),34,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+L([W[0]-22,W[1]],[W[0]+22,W[1]],9,'#51615a')+C([W[0]-22,W[1]],15,'#7d8985',G,3)+C([W[0]+22,W[1]],15,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+50}" y="${W[1]}" fill="${Y}" font-family="T" font-size="22">${o.kg[29]} كغ</text>`;
 s+=jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[29],flx(S,El,W));return s}
function scene31(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],H=[330,424],lean=(24-(w?44:0)*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[44*Math.cos(lean),-30]),K=ik(H,A,100,110,-1),ph=(8+34*p)*Math.PI/180,K2=[H[0]-100*Math.sin(ph),H[1]+100*Math.cos(ph)],A2=[K2[0]-110*Math.sin(ph+.1),K2[1]+110*Math.cos(ph+.1)],Hd=[S[0]+30,S[1]+70];
 let s=bgl('CABLE KICKBACK','ركل الكيبل للخلف','عضلة الألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([540,150],[540,670],12,'#27312d')+L([540,640],A2,2,'#8fa39a')+C([540,640],8,'#5b6b64')+L([Hd[0]+10,Hd[1]+20],[Hd[0]+10,670],10,'#3b4a43');
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]-34,A2[1]+8])+C(K2,10,JT);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(H,[-12,-2]),24,20,0,p,'p')+limb(S,Hd,24)+C(S,11,JT)+hand(Hd)+head(hp,[1,0]);
 s+=`<text x="${A2[0]+30}" y="${A2[1]-70}" fill="${Y}" font-family="T" font-size="22">${o.kg[30]} كغ</text>`;
 s+=jointArc(H,S,K2,Math.round(flx(S,H,K2)))+ui(u,o,CFG[30],flx(S,H,K2));return s}
function scene32(t,o){const u=t/3%1,w=o.wrong,p=E(u),bk=w?44*p:0,Kn=[340,640],H=[330-bk,540],lean=(4+66*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[44*Math.cos(lean)+8,-30*Math.cos(lean)+20*Math.sin(lean)]),B=[Kn[0]-110,648],K=ik(H,Kn,100,10,-1);
 let s=bgl('CABLE CRUNCH','كرنش بالكيبل','عضلات البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([560,110],[560,300],10,'#27312d')+C([560,110],12,'#5b6b64')+stack(600,300,9,Math.max(1,Math.round(o.kg[31]/8)),p*50,60,o.kg[31]);
 s+=L([560,110],add(hp,[10,-10]),2,'#8fa39a');
 s+=limb(H,Kn,34)+shorts(H,Kn,40)+limb(Kn,B,28)+shoe(B,[B[0]-34,B[1]+4])+torso(H,S,hp,1)+C(H,10,JT)+C(Kn,10,JT);
 s+=muscle(add(mid(H,S,.5),[10,0]),52,12,ang(H,S),p,'p')+limb(S,add(hp,[10,0]),22)+C(S,11,JT)+head(hp,[1,0.3]);
 s+=jointArc(H,S,Kn,Math.round(flx(S,H,Kn)))+ui(u,o,CFG[31],flx(S,H,Kn));return s}
function scene33(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?-20*p:0,S=[330+lean,292],hp=add(S,[8+lean*.1,-56]),P=[600,250],W=[S[0]+130-100*p,S[1]-26-20*p],El=ik(S,W,68,66,-1);
 let s=bgl('CABLE FACE PULL','سحب الحبل للوجه','الكتف الخلفي');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([620,160],[620,670],12,'#27312d')+C(P,12,'#5b6b64')+L(P,W,2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-10,-4]),22,18,0,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 s+=`<text x="${P[0]-40}" y="${P[1]-24}" fill="${Y}" font-family="T" font-size="22">${o.kg[32]} كغ</text>`;
 s+=jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[32],flx(S,El,W));return s}

function scene34(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[250,505],H=[390,505],A=[470,600],K=ik(H,A,100,110,-1),hp=[S[0]-48,S[1]-6],ph=(100*p)*Math.PI/180,len=w?72:120,W=[S[0]-len*Math.sin(ph),S[1]-len*Math.cos(ph)];
 let s=bgl('DB PULLOVER','بول أوفر بالدمبل','الصدر والظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(180,519,260,26,'#27312d',10)+L([220,545],[220,670],10,'#4a5a52')+L([400,545],[400,670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[40,-12]),42,12,0,p,'p')+limb(S,W,24)+C(S,11,JT)+L([W[0]-24,W[1]],[W[0]+24,W[1]],9,'#51615a')+C([W[0]-24,W[1]],16,'#7d8985',G,3)+C([W[0]+24,W[1]],16,'#7d8985',G,3)+hand(W)+head(hp,[1,-.3])+`<text x="${W[0]+40}" y="${W[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[33]} كغ</text>`;
 s+=ui(u,o,CFG[33],100*p);return s}
function scene35(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?-20*p:0,S=[330+lean,292],hp=add(S,[8+lean*.1,-56]),W=[S[0]+36,S[1]+146-96*p],El=ik(S,W,68,66,-1);
 let s=bgl('UPRIGHT ROW','سحب للذقن بالبار','الكتف');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[8,2]),18,18,0,p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,30,'#51615a','#0c1210',4)+C(W,15,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[34]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[34],flx(S,El,W));return s}
function scene36(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[340,630],H=[290,430],lean=(56-(w?22*p:0))*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[48*Math.cos(lean*.6),-28]),K=ik(H,A,100,110,-1),W=[S[0]+10-50*p,S[1]+128-70*p],El=ik(S,W,68,66,1),Pl=[470,628];
 let s=bgl('T-BAR ROW','تي بار رو','الظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+C(Pl,40,'#3a4741','#0c1210',4)+C(Pl,16,'#7d8985')+L(Pl,W,8,'#7d8985');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,S,.55),[-6,-6]),42,13,ang(H,S),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+`<text x="${Pl[0]+50}" y="${Pl[1]-80}" fill="${Y}" font-family="T" font-size="22">${o.kg[35]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[35],flx(S,El,W));return s}
function scene37(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],H=[330,424],lean=14*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),a=(40+135*p)*Math.PI/180,len=w?76:128,W=[S[0]+len*Math.sin(a),S[1]-len*Math.cos(a)],P=[470,130],Wh=W;
 let s=bgl('STRAIGHT-ARM PULLDOWN','سحب ذراع مفرودة','عضلة اللاتس');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([560,110],[560,670],12,'#27312d')+L([470,110],[560,110],10,'#27312d')+C(P,12,'#5b6b64')+L(P,W,2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-14,26]),20,36,0,p,'p')+limb(S,W,24)+C(S,11,JT)+hand(W)+head(hp,[1,0])+`<text x="${P[0]-96}" y="${P[1]+44}" fill="${Y}" font-family="T" font-size="22">${o.kg[36]} كغ</text>`;
 s+=ui(u,o,CFG[36],(40+135*p));return s}
function scene38(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],hs=w?-34*p:0,H=[330+hs,440+30*p],lean=(4+34*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),W=[S[0]+100-150*p,S[1]-96+170*p],P=[560,170];
 let s=bgl('CABLE WOODCHOP','وودتشوب بالكيبل','عضلات الجذع');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([600,150],[600,670],12,'#27312d')+L(P,[600,170],8,'#27312d')+C(P,12,'#5b6b64')+L(P,W,2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),44,12,ang(H,S)+90,p,'p')+limb(S,W,24)+C(S,11,JT)+hand(W)+head(hp,[1,0])+`<text x="${P[0]-60}" y="${P[1]-26}" fill="${Y}" font-family="T" font-size="22">${o.kg[37]} كغ</text>`;
 s+=ui(u,o,CFG[37],Math.round(lean*180/Math.PI));return s}

function fdef(cx,y1,y2,w1,w2){const H=y2-y1,l=(a,w,o,c='#6d5140')=>`<path d="${a}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`,wx=t=>w1+(w2-w1)*t;let g='';
 g+=`<path d="M${cx-w1},${y1} L${cx-w2},${y2} L${cx-w2+14},${y2} L${cx-w1+16},${y1} Z M${cx+w1},${y1} L${cx+w2},${y2} L${cx+w2-14},${y2} L${cx+w1-16},${y1} Z" fill="#8d725e" opacity=".35"/>`;
 g+=l(`M${cx},${y1+H*.12} L${cx},${y2-H*.04}`,2,.5);
 for(const s of [-1,1]){const x0=cx+s*3,x1=cx+s*wx(.2)*.8;g+=l(`M${x0},${y1+H*.34} Q${cx+s*wx(.3)*.45},${y1+H*.43} ${x1},${y1+H*.3}`,2.6,.6)+l(`M${x0},${y1+H*.2} Q${cx+s*wx(.15)*.55},${y1+H*.28} ${cx+s*wx(.1)*.92},${y1+H*.16}`,1.8,.3);
  for(const t of [.5,.64,.78]){g+=l(`M${cx+s*4},${y1+H*t} Q${cx+s*wx(t)*.35},${y1+H*(t+.025)} ${cx+s*wx(t)*.62},${y1+H*t}`,2,.5)}
  g+=l(`M${cx+s*wx(.45)*.9},${y1+H*.4} L${cx+s*wx(.6)*.82},${y1+H*.55} L${cx+s*wx(.8)*.8},${y1+H*.68}`,1.6,.32)}
 g+=l(`M${cx-w1*.55},${y1+H*.1} Q${cx},${y1+H*.2} ${cx+w1*.55},${y1+H*.1}`,1.6,.25,'#fff3e3');return g}
function fhead(p){return `<ellipse cx="${p[0]}" cy="${p[1]}" rx="27" ry="32" fill="#e0cbb6" stroke="#0c1210" stroke-width="2.5"/><path d="M${p[0]-30},${p[1]-4} C${p[0]-34},${p[1]-44} ${p[0]+34},${p[1]-44} ${p[0]+30},${p[1]-4} C${p[0]+22},${p[1]-22} ${p[0]-22},${p[1]-22} ${p[0]-30},${p[1]-4} Z" fill="#2a211c" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]-10}" cy="${p[1]+2}" rx="3" ry="2.2" fill="#10201a"/><ellipse cx="${p[0]+10}" cy="${p[1]+2}" rx="3" ry="2.2" fill="#10201a"/><path d="M${p[0]-8},${p[1]+18} Q${p[0]},${p[1]+22} ${p[0]+8},${p[1]+18}" stroke="#8a5f55" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="${p[0]-28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]+28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/>`}
function fbase(cx,y0,sw=50,up=0){const HL=[cx-26,y0+135],HR=[cx+26,y0+135],KL=[cx-30,y0+245],KR=[cx+30,y0+245],AL=[cx-32,y0+350],AR=[cx+32,y0+350];let g='';
 g+=limb(HL,KL,34)+shorts(HL,KL,40)+limb(KL,AL,28)+limb(HR,KR,34)+shorts(HR,KR,40)+limb(KR,AR,28);
 g+=`<ellipse cx="${AL[0]-4}" cy="${AL[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/><ellipse cx="${AR[0]+4}" cy="${AR[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<rect x="${cx-12}" y="${y0-up-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<path d="M${cx-sw-10},${y0-up+4} Q${cx},${y0-up-10} ${cx+sw+10},${y0-up+4} L${cx+36},${y0+142} L${cx-36},${y0+142} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,y0-up+4,y0+128,sw+6,36)}`;
 g+=`<rect x="${cx-37}" y="${y0+128}" width="74" height="16" rx="5" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,y0-up-68]);return g}
function fdb(w,k=1){return `<rect x="${w[0]-12}" y="${w[1]-20}" width="24" height="40" rx="8" fill="#7d8985" stroke="${G}" stroke-width="3"/>`}
function fhand(w){return `<ellipse cx="${w[0]}" cy="${w[1]}" rx="12" ry="12" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5"/>`}
function scene39(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,up=w?22*p:0,th=(8+82*p)*Math.PI/180,SL=[cx-50,y0-up],SR=[cx+50,y0-up],WR=[SR[0]+118*Math.sin(th),SR[1]+118*Math.cos(th)],WL=[SL[0]-118*Math.sin(th),SL[1]+118*Math.cos(th)];
 let s=bgl('DB LATERAL RAISE','رفرفة جانبية بالدمبل','الكتف الجانبي');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="360" cy="660" rx="120" ry="8" fill="#0c1612"/>`+fbase(cx,y0,50,up);
 s+=limb(SR,WR,26)+limb(SL,WL,26)+muscle(add(SR,[8,6]),18,18,0,p,'p')+muscle(add(SL,[-8,6]),18,18,0,p,'p')+C(SR,11,JT)+C(SL,11,JT)+fhand(WR)+fhand(WL)+fdb(WR)+fdb(WL)+`<text x="${WR[0]+30}" y="${WR[1]-26}" fill="${Y}" font-family="T" font-size="22">${o.kg[38]} كغ</text>`;
 s+=ui(u,o,CFG[38],8+82*p);return s}
function scene40(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,up=w?22*p:0,SL=[cx-50,y0-up],SR=[cx+50,y0-up],WR=[cx+(168-140*p),y0+14+80*p],WL=[cx-(168-140*p),y0+14+80*p],ER=add(mid(SR,WR),[12,10]),EL=add(mid(SL,WL),[-12,10]),PR1=[cx+250,170],PL1=[cx-250,170];
 let s=bgl('CABLE FLY','فتح الصدر بالكيبل','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([cx+250,150],[cx+250,670],12,'#27312d')+L([cx-250,150],[cx-250,670],12,'#27312d')+C(PR1,12,'#5b6b64')+C(PL1,12,'#5b6b64')+L(PR1,WR,2,'#8fa39a')+L(PL1,WL,2,'#8fa39a')+fbase(cx,y0,50,up);
 s+=muscle([cx-22,y0+34],22,18,0,p,'p')+muscle([cx+22,y0+34],22,18,0,p,'p')+limb(SR,ER,26)+limb(ER,WR,22)+limb(SL,EL,26)+limb(EL,WL,22)+C(SR,11,JT)+C(SL,11,JT)+C(ER,9,JT)+C(EL,9,JT)+fhand(WR)+fhand(WL)+`<text x="${PR1[0]-30}" y="${PR1[1]+40}" fill="${Y}" font-family="T" font-size="22">${o.kg[39]} كغ</text>`;
 s+=ui(u,o,CFG[39],(150-136*p)/1.5);return s}
function scene41(t,o){const u=t/3%1,w=o.wrong,p=E(u),tilt=w?14*p:0,cx=360+tilt*.6,y0=290,SL=[cx-50,y0],SR=[cx+50,y0],th=(6+84*p)*Math.PI/180,WR=[SR[0]+118*Math.sin(th),SR[1]+118*Math.cos(th)],WL=[SL[0]+4,SL[1]+120],Pu=[cx-170,650];
 let s=bgl('CABLE LATERAL RAISE','رفرفة جانبية بالكيبل','الكتف الجانبي');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([Pu[0],560],[Pu[0],670],12,'#27312d')+C(Pu,10,'#5b6b64')+L(Pu,WR,2,'#8fa39a')+fbase(cx,y0,50,0);
 s+=limb(SL,[SL[0]-2,SL[1]+70],26)+limb([SL[0]-2,SL[1]+70],[cx-34,y0+138],22)+limb(SR,WR,26)+muscle(add(SR,[8,6]),18,18,0,p,'p')+C(SR,11,JT)+C(SL,11,JT)+fhand(WR)+`<text x="${Pu[0]-30}" y="${Pu[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[40]} كغ</text>`;
 s+=ui(u,o,CFG[40],6+84*p);return s}
function scene42(t,o){const u=t/3%1,w=o.wrong,tw=Math.sin(u*Math.PI*2),cx=360,y0=360,sw=w?50:Math.max(18,50*Math.cos(tw*.9)),SL=[cx-sw,y0],SR=[cx+sw,y0],W=[cx+120*tw,y0+105],p=Math.abs(tw);
 let s=bgl('RUSSIAN TWIST','تويست روسي بالوزن','عضلات الجذع');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="${cx}" cy="662" rx="130" ry="8" fill="#0c1612"/>`;
 for(const d of[-34,34])s+=`<ellipse cx="${cx+d}" cy="566" rx="30" ry="40" fill="#cdb59f" stroke="#0c1210" stroke-width="3"/><path d="M${cx+d-30},548 Q${cx+d},520 ${cx+d+30},548 L${cx+d+28},575 L${cx+d-28},575 Z" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/><ellipse cx="${cx+d}" cy="620" rx="20" ry="26" fill="#cdb59f" stroke="#0c1210" stroke-width="3"/><ellipse cx="${cx+d}" cy="652" rx="22" ry="12" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=`<rect x="${cx-12}" y="${y0-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/><path d="M${cx-sw-10},${y0+4} Q${cx},${y0-10} ${cx+sw+10},${y0+4} L${cx+36},${y0+150} L${cx-36},${y0+150} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,y0+4,y0+128,sw+6,36)}`+fhead([cx+14*tw,y0-68]);
 s+=muscle([cx,y0+88],26,38,0,p,'p')+limb(SL,W,24)+limb(SR,W,24)+C(SL,11,JT)+C(SR,11,JT)+C(W,26,'#51615a','#0c1210',4)+C(W,12,'#7d8985')+fhand(W)+`<text x="${W[0]+34}" y="${W[1]-24}" fill="${Y}" font-family="T" font-size="22">${o.kg[41]} كغ</text>`;
 s+=ui(u,o,CFG[41],Math.round(tw*40));return s}

function scene43(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),S=[290,448],arch=w?14*Math.sin(Math.PI*p):0;
 const El=[S[0]+18-16*p,S[1]+24-119*p+(w?14*(1-p):0)],W=[El[0],El[1]-85];
 let s=bgl('BARBELL BENCH PRESS','بنش بريس بالبار','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(150,480,420,28,'#27312d',10)+L([200,508],[200,670],10,'#4a5a52')+L([520,508],[520,670],10,'#4a5a52');
 const Hp=[480,460-arch],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472]);
 s+=torso([470,452-arch],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=guide(`M 308 387 L 292 268`)+muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(W,34,'#51615a','#0c1210',4)+C(W,18,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[42]} كغ</text>`+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[42],flx(S,El,W));return s}
function scene44(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),arch=w?14*Math.sin(Math.PI*p):0;
 const H=[400,480-arch],S=[310,368-arch*.6],ux=S[0]-H[0],uy=S[1]-H[1],dl=Math.hypot(ux,uy),uv=[ux/dl,uy/dl],n=[-uv[1],uv[0]],hp=add(S,uv,62);
 const El=[S[0]+22-14*p,S[1]+26-120*p+(w?14*(1-p):0)],W=[El[0],El[1]-85],K=[500,470],F=[515,585],nb=[-n[0],-n[1]];
 let s=bgl('INCLINE BARBELL BENCH','بنش بريس مائل بالبار','أعلى الصدر');s+='<g transform="translate(36 67) scale(.9)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+cap(add(H,nb,34),add(add(S,uv,30),nb,34),30,30,'#2d3834','#0c1210')+R(370,500,150,22,'#27312d',8)+L([440,522],[440,670],10,'#4a5a52')+L([300,560],[440,540],8,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[552,595])+torso(H,S,hp,1)+C(H,10,JT)+head(hp,n);
 s+=guide(`M ${W[0]} ${S[1]-120+0} L ${W[0]} ${S[1]-8}`)+muscle(add(add(S,uv,-30),n,14),38,19,ang(H,S),p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(W,34,'#51615a','#0c1210',4)+C(W,18,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[43]} كغ</text>`;
 s+=jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+'</g>'+ui(u,o,CFG[43],flx(S,El,W));return s}
function scene45(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),S=[290,448],arch=w?14*Math.sin(Math.PI*p):0;
 const El=[S[0]+4-4*p+(w?22*(1-p):0),S[1]+30-119*p],W=[El[0],El[1]-85];
 let s=bgl('CLOSE-GRIP BENCH','بنش بريس بقبضة ضيقة','ثلاثية الرؤوس');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(150,480,420,28,'#27312d',10)+L([200,508],[200,670],10,'#4a5a52')+L([520,508],[520,670],10,'#4a5a52');
 const Hp=[480,460-arch],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472]);
 s+=torso([470,452-arch],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=guide(`M 308 387 L 292 268`)+muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(W,34,'#51615a','#0c1210',4)+C(W,18,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[44]} كغ</text>`+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[44],flx(S,El,W));return s}
function scene46(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],L1=(50*(1-p)+(w?-0:0))*Math.PI/180,S=[348-18*p,478-186*p],Hh=[S[0]-128*Math.sin(L1),S[1]+128*Math.cos(L1)],H=Hh,hp=add(S,[(w?-6:46)*(1-p)+8*p,-48*(1-p)-52*p+(w?22*(1-p):0)]),K=ik(H,A,100,110,-1),Wp=[S[0]+(w?-14*(1-p):0),Math.min(S[1]+150,612)];
 let s=bgl('CONVENTIONAL DEADLIFT','ديدليفت بالبار','الظهر والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,K,.45),[-12,0]),38,13,ang(H,K),p,'p')+limb(S,Wp,24)+C(S,11,JT)+C(Wp,40,'#51615a','#0c1210',4)+C(Wp,20,'#7d8985')+hand(Wp)+`<text x="${Wp[0]+84}" y="${Wp[1]-70}" fill="${Y}" font-family="T" font-size="22">${o.kg[45]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[45],flx(S,H,K));return s}
function scene47(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-65*p,422+95*p],lean=(28+(w?32:0))*p*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8+10*Math.sin(lean),-52]),K=ik(H,A,100,110,-1),W=add(S,[34,34]),El=ik(S,W,52,52,1);
 let s=bgl('GOBLET SQUAT','سكوات جوبلت','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(add(W,[6,0]),24,'#51615a','#0c1210',4)+C(add(W,[6,0]),12,'#7d8985')+hand(W)+`<text x="${W[0]+40}" y="${W[1]-24}" fill="${Y}" font-family="T" font-size="22">${o.kg[46]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[46],flx(H,K,A));return s}
function scene48(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-72*p,410+10*p],lean=(84*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[56*Math.sin(lean)+8*(1-p),-48+22*p]),K=ik(H,A,100,110,-1),Wx=S[0]+8+(w?58*p:0),Wd=[Wx,S[1]+(150-40*p)];
 const Wp=[Wd[0],Math.min(Wd[1],575)];
 let s=bgl('DB RDL','ديدليفت روماني بالدمبل','الهامسترينغ');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,K,.45),[-12,0]),38,13,ang(H,K),p,'p')+limb(S,Wp,24)+C(S,11,JT)+C(Wp,24,'#51615a','#0c1210',4)+C(Wp,12,'#7d8985')+hand(Wp)+`<text x="${Wp[0]+44}" y="${Wp[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[47]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[47],flx(S,H,K));return s}

function scene49(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?26*p:0,A=[330,630],K=[335,520],H=[330,420],S=[330-lean,292],hp=add(S,[6-lean*.1,-58]);
 const El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('HAMMER CURL','هامر كيرل بالدمبل','العضدية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),36,13,ang(S,El),p,'p')+limb(El,W,22)+muscle(mid(El,W,.3),26,8,ang(El,W),p,'s')+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0]-30,W[1]],[W[0]+30,W[1]],9,'#51615a')+C([W[0]-30,W[1]],15,'#7d8985',G,3)+C([W[0]+30,W[1]],15,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[48]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[48],flx(S,El,W));return s}
function scene50(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,SL=[cx-50,y0],SR=[cx+50,y0],El=[SR[0]+6-14*p+(w?30*p:0),y0+96],W=[SR[0]+14+((cx-34)-(SR[0]+14))*p,y0+172-132*p];
 let s=bgl('CROSS-BODY HAMMER','هامر كيرل عبر الجسم','العضدية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="360" cy="660" rx="120" ry="8" fill="#0c1612"/>`+fbase(cx,y0,50,0);
 s+=limb(SL,[SL[0]-4,SL[1]+100],26)+limb([SL[0]-4,SL[1]+100],[cx-36,y0+140],22)+limb(SR,El,26)+limb(El,W,22)+muscle(mid(El,W,.4),22,9,ang(El,W),p,'p')+C(SR,11,JT)+C(SL,11,JT)+C(El,9,JT)+fhand(W)+fdb(W)+`<text x="${W[0]+34}" y="${W[1]-24}" fill="${Y}" font-family="T" font-size="22">${o.kg[49]} كغ</text>`;
 s+=ui(u,o,CFG[49],Math.round(150*p));return s}
function scene51(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,516],K=[430,512],A=[440,628],S=[412,422],hp=add(S,[34,-44]),El=[418,496-(w?30*p:0)],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('CONCENTRATION CURL','كيرل التركيز','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(280,536,190,24,'#27312d',10)+L([330,560],[330,670],10,'#4a5a52')+L([440,560],[440,670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+limb(S,[K[0]-30,K[1]-26],22);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),30,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+L([W[0],W[1]-26],[W[0],W[1]+26],9,'#51615a')+C([W[0],W[1]-26],14,'#7d8985',G,3)+C([W[0],W[1]+26],14,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+40}" y="${W[1]}" fill="${Y}" font-family="T" font-size="22">${o.kg[50]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[50],flx(S,El,W));return s}
function scene52(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[400,560],S=[300,500],hp=add(S,[-36,-26]),A=[470,640],K=ik(H,A,100,110,-1),sh=w?20*p:0,El=[S[0]+10+sh,S[1]+88],ph=(145*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('INCLINE DB CURL','كيرل مائل بالدمبل','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+L(add(H,[-16,18]),add(S,[-16,18]),34,'#2d3834')+L([H[0]-40,H[1]+30],[H[0]+40,H[1]+30],18,'#2d3834')+L([H[0],H[1]+36],[H[0],670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+head(hp,[1,-.2]);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),34,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+L([W[0],W[1]-26],[W[0],W[1]+26],9,'#51615a')+C([W[0],W[1]-26],14,'#7d8985',G,3)+C([W[0],W[1]+26],14,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+40}" y="${W[1]}" fill="${Y}" font-family="T" font-size="22">${o.kg[51]} كغ</text>`;
 s+=jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[51],flx(S,El,W));return s}
function scene53(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[340,630],H=[290,430],lean=66*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[46,-24]),K=ik(H,A,100,110,-1),El=[S[0]-66,S[1]+14+(w?34*p:0)],ph=(90*p)*Math.PI/180,W=[El[0]-70*Math.sin(ph),El[1]+70*Math.cos(ph)];
 let s=bgl('DB KICKBACK','ركلة الترايسبس بالدمبل','ثلاثية الرؤوس');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="100" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[0,10]),32,11,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,20,'#51615a','#0c1210',4)+C(W,10,'#7d8985')+hand(W)+`<text x="${W[0]-20}" y="${W[1]+50}" fill="${Y}" font-family="T" font-size="22">${o.kg[52]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[52],flx(S,El,W));return s}
function scene54(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[340,630],H=[290,430],lean=(80-(w?26*p:0))*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[48*Math.cos(lean*.6),-30]),K=ik(H,A,100,110,-1),W=[S[0]+8-44*p,S[1]+128-84*p],El=ik(S,W,68,66,1);
 let s=bgl('1-ARM DB ROW','تجديف بالدمبل بذراع واحدة','الظهر');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="100" ry="8" fill="#0c1612"/>`+R(S[0]-50,S[1]+130,150,22,'#27312d',8)+L([S[0]-20,S[1]+152],[S[0]-20,670],10,'#4a5a52')+L([S[0]+70,S[1]+152],[S[0]+70,670],10,'#4a5a52')+limb([S[0]+16,S[1]],[S[0]+22,S[1]+128],24)+hand([S[0]+22,S[1]+128]);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(H,S,.55),[-6,-6]),42,13,ang(H,S),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,24,'#51615a','#0c1210',4)+C(W,12,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[53]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[53],flx(S,El,W));return s}
function scene55(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[430,615],B=[205,548],H=[322,408+100*p],lean=w?26*p*Math.PI/180:0,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),K2=ik(H,B,100,110,-1);
 let s=bgl('BULGARIAN SQUAT','سكوات بلغاري بالدمبل','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="320" cy="660" rx="160" ry="8" fill="#0c1612"/>`+R(140,562,130,22,'#27312d',8)+L([160,584],[160,670],10,'#4a5a52')+L([250,584],[250,670],10,'#4a5a52');
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,B,28)+shoe(B,[B[0]-30,B[1]+14])+C(K2,10,JT);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,[S[0]+6,S[1]+100],24)+C([S[0]+6,S[1]+112],20,'#51615a','#0c1210',4)+C([S[0]+6,S[1]+112],10,'#7d8985')+C(S,11,JT)+head(hp,[1,0]);
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[54],flx(H,K,A));return s}

function scene56(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),S=[290,448],arch=w?14*Math.sin(Math.PI*p):0;
 const El=[S[0]+14+(w?26*(1-p):0),S[1]-92],fph=(95*(1-p))*Math.PI/180,W=[El[0]-85*Math.sin(fph),El[1]-85*Math.cos(fph)];
 let s=bgl('SKULL CRUSHER','سكل كراشر بالبار','ثلاثية الرؤوس');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(150,480,420,28,'#27312d',10)+L([200,508],[200,670],10,'#4a5a52')+L([520,508],[520,670],10,'#4a5a52');
 const Hp=[480,460-arch],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472]);
 s+=torso([470,452-arch],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=guide(`M 308 387 L 292 268`)+muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=C(W,28,'#51615a','#0c1210',4)+C(W,14,'#7d8985')+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[55]} كغ</text>`+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[55],flx(S,El,W));return s}
function scene57(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?26*p:0,S=[330-lean,292],hp=add(S,[6-lean*.1,-58]),El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('REVERSE CURL','كيرل عكسي بالبار','الساعد');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),34,11,ang(S,El),p,'s')+limb(El,W,22)+muscle(mid(El,W,.35),28,9,ang(El,W),p,'p')+C(El,9,JT)+C(S,11,JT);
 s+=C(W,30,'#51615a','#0c1210',4)+C(W,15,'#7d8985')+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[56]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[56],flx(S,El,W));return s}
function scene58(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[290,520],K=[392,516],A=[402,628],S=[318,396],hp=add(S,[8,-56]),P1=[346,436],P2=[440,548],t0=.34+(w?-.16*p:0),El=[P1[0]+(P2[0]-P1[0])*t0,P1[1]+(P2[1]-P1[1])*t0-(w?24*p:0)],a=(30+148*p)*Math.PI/180,W=[El[0]+85*Math.sin(a),El[1]+85*Math.cos(a)];
 let s=bgl('PREACHER CURL','كيرل على الوسادة','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(240,536,150,22,'#27312d',8)+L([300,558],[300,670],10,'#4a5a52')+L(P1,P2,34,'#2d3834')+L([P2[0]-10,P2[1]+10],[P2[0]-10,670],10,'#4a5a52');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[0,-8]),32,11,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C(W,28,'#51615a','#0c1210',4)+C(W,14,'#7d8985')+hand(W)+`<text x="${W[0]+40}" y="${W[1]-24}" fill="${Y}" font-family="T" font-size="22">${o.kg[57]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[57],flx(S,El,W));return s}
function scene59(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?26*p:0,S=[330-lean,292],hp=add(S,[6-lean*.1,-58]),El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('CABLE CURL','كيرل بالكيبل','ذات الرأسين');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),36,13,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L(W,[560,652],2,'#8fa39a')+C([560,652],10,'#5b6b64')+L([560,662],[560,670],14,'#27312d')+C(W,12,'#7d8985')+L([W[0]-24,W[1]],[W[0]+24,W[1]],8,'#7d8985')+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[58]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[58],flx(S,El,W));return s}
function scene60(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?26*p:0,A=[330,630],K=[335,520],H=[330,420],S=[330-lean,292],hp=add(S,[6-lean*.1,-58]);
 const El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('ROPE HAMMER CURL','هامر كيرل بالحبل','العضدية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),36,13,ang(S,El),p,'p')+limb(El,W,22)+muscle(mid(El,W,.3),26,8,ang(El,W),p,'s')+C(El,9,JT)+C(S,11,JT);
 s+=L(W,[560,652],2,'#8fa39a')+C([560,652],10,'#5b6b64')+L([560,662],[560,670],14,'#27312d')+C([W[0]-16,W[1]],7,'#7d8985')+C([W[0]+16,W[1]],7,'#7d8985')+L([W[0]-16,W[1]],[W[0]+16,W[1]],5,'#7d8985')+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[59]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[59],flx(S,El,W));return s}
function scene61(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?24:6,A=[330,630],K=[335,520],H=[330,420],S=[330+lean,292],hp=add(S,[8,-56]);
 const El=[S[0]+(w?30*p:0)+4,S[1]+92],ph=(100-100*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('ROPE PUSHDOWN','ترايسبس بالحبل','ثلاثية الرؤوس');
 s+=stack(620,300,10,Math.max(1,Math.round(o.kg[60]/6)),p*60,60,o.kg[60]);
 s+=L([20,670],[700,670],6,'#3b4a43')+L([440,128],[620,128],6,'#51615a')+C([440,128],14,'#5b6b64')+C([620,128],14,'#5b6b64')+L([620,128],[620,286-p*60],2,'#8fa39a')+L([440,128],W,2,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[-7,0]),36,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+C([W[0]-12-10*p,W[1]+6],6,'#7d8985')+C([W[0]+12+10*p,W[1]+6],6,'#7d8985')+L([W[0]-12-10*p,W[1]+6],[W[0]+12+10*p,W[1]+6],4,'#7d8985')+hand(W);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[60],flx(S,El,W));return s}

function scene62(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],S=[330,292],hp=add(S,[8,-56]),fw=w?34*p:0,El=[S[0]+6+fw,S[1]-72],th=(165*(1-p))*Math.PI/180,W=[El[0]-68*Math.sin(th),El[1]-68*Math.cos(th)];
 let s=bgl('CABLE OH TRI','ترايسبس فوق الرأس كيبل','ثلاثية الرؤوس');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=head(hp,[1,0])+limb(S,El,26)+muscle(add(mid(S,El),[-8,0]),34,12,ang(S,El),p,'p')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+L(W,[110,652],2,'#8fa39a')+C([110,652],10,'#5b6b64')+L([110,662],[110,670],14,'#27312d')+C([W[0]-10,W[1]],7,'#7d8985')+C([W[0]+10,W[1]],7,'#7d8985')+L([W[0]-10,W[1]],[W[0]+10,W[1]],5,'#7d8985')+hand(W)+`<text x="${W[0]+50}" y="${W[1]}" fill="${Y}" font-family="T" font-size="22">${o.kg[61]} كغ</text>`;
 s+=jointArc(El,S,W,Math.round(flx(S,El,W)))+ui(u,o,CFG[61],flx(S,El,W));return s}
function scene63(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],K=[335,520],H=[330,420],lean=w?26*p:0,S=[330-lean,292],hp=add(S,[6-lean*.1,-58]),El=[S[0]+10+(w?14*p:0),S[1]+92],ph=(150*p)*Math.PI/180,W=[El[0]+85*Math.sin(ph),El[1]+85*Math.cos(ph)];
 let s=bgl('REVERSE CABLE CURL','كيرل عكسي بالكيبل','الساعد');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="90" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=limb(S,El,26)+muscle(add(mid(S,El),[7,0]),34,11,ang(S,El),p,'s')+limb(El,W,22)+muscle(mid(El,W,.35),28,9,ang(El,W),p,'p')+C(El,9,JT)+C(S,11,JT);
 s+=L(W,[560,652],2,'#8fa39a')+C([560,652],10,'#5b6b64')+L([560,662],[560,670],14,'#27312d')+C(W,12,'#7d8985')+L([W[0]-24,W[1]],[W[0]+24,W[1]],8,'#7d8985')+hand(W)+`<text x="${W[0]+44}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[62]} كغ</text>`;
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[62],flx(S,El,W));return s}
function scene64(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,up=w?22*p:0,SL=[cx-50,y0-up],SR=[cx+50,y0-up],WR=[cx+(150-130*p),y0+150-100*p],WL=[cx-(150-130*p),y0+150-100*p],ER=add(mid(SR,WR),[12,10]),EL=add(mid(SL,WL),[-12,10]),PR1=[cx+250,640],PL1=[cx-250,640];
 let s=bgl('LOW-HIGH FLY','فتح كيبل لأعلى','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([cx+250,150],[cx+250,670],12,'#27312d')+L([cx-250,150],[cx-250,670],12,'#27312d')+C(PR1,12,'#5b6b64')+C(PL1,12,'#5b6b64')+L(PR1,WR,2,'#8fa39a')+L(PL1,WL,2,'#8fa39a')+fbase(cx,y0,50,up);
 s+=muscle([cx-22,y0+34],22,18,0,p,'p')+muscle([cx+22,y0+34],22,18,0,p,'p')+limb(SR,ER,26)+limb(ER,WR,22)+limb(SL,EL,26)+limb(EL,WL,22)+C(SR,11,JT)+C(SL,11,JT)+C(ER,9,JT)+C(EL,9,JT)+fhand(WR)+fhand(WL)+`<text x="${PR1[0]-30}" y="${PR1[1]-30}" fill="${Y}" font-family="T" font-size="22">${o.kg[63]} كغ</text>`;
 s+=ui(u,o,CFG[63],(150-136*p)/1.5);return s}
function scene65(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?30*p:0,H=[330,500],S=[330-lean,340];
 const El=[S[0]+34-22*p,S[1]+80-175*p],W=[El[0],El[1]-85],rr=(90*(1-p))*Math.PI/180,K=[455,490],F=[465,610];
 let s=bgl('ARNOLD PRESS','أرنولد بريس بالدمبل','الكتف الأمامي');s+='<g transform="translate(36 67) scale(.9)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+R(270,522,150,24,'#27312d',10)+L([345,546],[345,670],10,'#4a5a52')+`<g transform="rotate(${w?0:3} 300 420)">${R(270,300,36,226,'#2d3834',8)}</g>`;
 s+=limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[505,622])+torso(H,S,add(S,[6+lean*.2,-58]),1)+muscle(add(S,[10,-4]),20,26,0,p,'p')+guide(`M ${W[0]} ${S[1]-125} L ${W[0]} ${S[1]-5}`);
 s+=limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0]-34*Math.sin(rr),W[1]-34*Math.cos(rr)],[W[0]+34*Math.sin(rr),W[1]+34*Math.cos(rr)],9,'#51615a')+C([W[0]-34*Math.sin(rr),W[1]-34*Math.cos(rr)],17,'#7d8985',G,3)+C([W[0]+34*Math.sin(rr),W[1]+34*Math.cos(rr)],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[64]}×2 كغ</text>`;
 s+=head(add(S,[6+lean*.2,-58]),[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+'</g>'+ui(u,o,CFG[64],flx(S,El,W));return s}

/* ===== scenes 66-82: machines ===== */
function fseat(cx,y0,sw,kn,up=0,tilt=0){const HL=[cx-26,y0+135],HR=[cx+26,y0+135],KL=[cx-kn,y0+190],KR=[cx+kn,y0+190],AL=[cx-kn*1.04,y0+318],AR=[cx+kn*1.04,y0+318];let g='';
 g+=R(cx-70,y0-56,140,200,'#2d3834',16)+R(cx-96,y0+136,192,26,'#27312d',10)+L([cx,y0+162],[cx,670],14,'#4a5a52');
 g+=limb(HL,KL,34)+shorts(HL,KL,40)+limb(KL,AL,28)+limb(HR,KR,34)+shorts(HR,KR,40)+limb(KR,AR,28);
 g+=`<ellipse cx="${AL[0]-4}" cy="${AL[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/><ellipse cx="${AR[0]+4}" cy="${AR[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<g transform="rotate(${tilt} ${cx} ${y0+140})"><rect x="${cx-12}" y="${y0-up-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<path d="M${cx-sw-10},${y0-up+4} Q${cx},${y0-up-10} ${cx+sw+10},${y0-up+4} L${cx+36},${y0+142} L${cx-36},${y0+142} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,y0-up+4,y0+128,sw+6,36)}`;
 g+=`<rect x="${cx-37}" y="${y0+128}" width="74" height="16" rx="5" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,y0-up-68])+'</g>';return {g,KL,KR,AL,AR}}
function sideSeat(H,K,F,tl){return L([20,670],[700,670],6,'#3b4a43')+R(270,522,150,24,'#27312d',10)+L([345,546],[345,670],10,'#4a5a52')+`<g transform="rotate(${tl===undefined?3:tl} 300 420)">${R(270,300,36,226,'#2d3834',8)}</g>`}
function scene66(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,500],sh=w?22*p:0,S=[330,340-sh],hp=add(S,[6,-58]),K=[455,490],F=[465,610],y=S[1]+54+sh,W=[S[0]+30+155*p,y],El=ik(S,W,100,95,1);
 let s=bgl('CHEST PRESS','صدر بالجهاز','الصدر');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[65]/6)),p*60,70,o.kg[65])+L([95,300],[95,255],2,'#8fa39a')+sideSeat();
 s+=L([205,y+6],W,10,'#51615a')+C([205,y+6],10,'#3b4a43',G,2);
 s+=limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[505,622])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=guide(`M ${S[0]+30} ${y} L ${S[0]+185} ${y}`)+muscle([S[0]+24,S[1]+46],36,22,-8,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-6,W[1]-22,12,44,'#51615a',4)+hand(W);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[65],flx(S,El,W));return s}
function scene67(t,o){const u=t/3%1,w=o.wrong,p=E(u),r=25*Math.PI/180,lift=w?26*p:0,H0=[340,510],H=[H0[0],H0[1]-lift],S=[H[0]-160*Math.sin(r),H[1]-160*Math.cos(r)],hp=add(S,[-4,-58]),K=[462,498],F=[472,614];
 const a=-40*Math.PI/180,W0=[S[0]+36,S[1]+20],W=[W0[0]+165*Math.cos(a)*p,W0[1]+165*Math.sin(a)*p],El=ik(S,W,100,95,1),P=[S[0]-70,S[1]+46];
 let s=bgl('INCLINE PRESS','صدر مائل بالجهاز','الصدر العلوي');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[66]/6)),p*60,70,o.kg[66])+L([95,300],[95,255],2,'#8fa39a')+L([20,670],[700,670],6,'#3b4a43')+R(280,522,160,24,'#27312d',10)+L([355,546],[355,670],10,'#4a5a52')+`<g transform="rotate(-25 ${H0[0]-10} ${H0[1]+10})">${R(H0[0]-40,H0[1]-214,36,236,'#2d3834',8)}</g>`;
 s+=L(P,W,10,'#51615a')+C(P,10,'#3b4a43',G,2)+limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[512,626])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=guide(`M ${W0[0]} ${W0[1]} L ${W0[0]+165*Math.cos(a)} ${W0[1]+165*Math.sin(a)}`)+muscle([S[0]+30,S[1]+30],34,20,-35,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-6,W[1]-22,12,44,'#51615a',4)+hand(W);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[66],flx(S,El,W));return s}
function pecArms(cx,y0,sw,p,w,rev,kind){ // front-view seated arms
 const up=w?22*p:0;let s='';const SR=[cx+sw,y0+6-up],SL=[cx-sw,y0+6-up];
 let ER,WR,EL,WL;
 if(kind==='pec'){const ex=46+104*(1-p);ER=[cx+ex,y0+34];EL=[cx-ex,y0+34];WR=[ER[0]-ex*.18,ER[1]-90];WL=[EL[0]+ex*.18,EL[1]-90]}
 else if(kind==='rev'){ER=[cx+34+72*p,y0+38-14*p];EL=[cx-34-72*p,y0+38-14*p];WR=[cx+18+172*p,y0+34-8*p];WL=[cx-18-172*p,y0+34-8*p]}
 else{const a=(8+80*p)*Math.PI/180;ER=[SR[0]+95*Math.sin(a),SR[1]+95*Math.cos(a)];EL=[SL[0]-95*Math.sin(a),SL[1]+95*Math.cos(a)];WR=[ER[0]-8,ER[1]-14];WL=[EL[0]+8,EL[1]-14]}
 return {SR,SL,ER,EL,WR,WL,up}}
function scene68(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,sw=50,A=pecArms(cx,y0,sw,p,w,0,'pec'),B=fseat(cx,y0,sw,52,A.up);
 let s=bgl('PEC DECK','جهاز الفراشة','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([cx-215,y0-120],[cx-215,670],14,'#27312d')+L([cx+215,y0-120],[cx+215,670],14,'#27312d')+L([cx-215,y0+60],A.EL,12,'#51615a')+L([cx+215,y0+60],A.ER,12,'#51615a')+C([cx-215,y0+60],12,'#3b4a43',G,2)+C([cx+215,y0+60],12,'#3b4a43',G,2);
 s+=B.g+muscle([cx-22,y0+34],22,18,0,p,'p')+muscle([cx+22,y0+34],22,18,0,p,'p');
 s+=limb(A.SR,A.ER,26)+limb(A.ER,A.WR,22)+limb(A.SL,A.EL,26)+limb(A.EL,A.WL,22)+C(A.SR,11,JT)+C(A.SL,11,JT)+C(A.ER,9,JT)+C(A.EL,9,JT)+L(add(A.ER,[18,0]),add(A.WR,[18,0]),14,'#51615a')+L(add(A.EL,[-18,0]),add(A.WL,[-18,0]),14,'#51615a')+fhand(A.WR)+fhand(A.WL);
 s+=`<text x="${cx+170}" y="${y0-90}" fill="${Y}" font-family="T" font-size="22">${o.kg[67]} كغ</text>`+ui(u,o,CFG[67],(150-136*p)/1.5);return s}
function scene69(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,sw=50,A=pecArms(cx,y0,sw,p,w,1,'rev'),B=fseat(cx,y0,sw,52,A.up);
 let s=bgl('REVERSE PEC DECK','جهاز الكتف الخلفي','الكتف الخلفي');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([cx-215,y0-120],[cx-215,670],14,'#27312d')+L([cx+215,y0-120],[cx+215,670],14,'#27312d')+L([cx-215,y0+30],A.WL,12,'#51615a')+L([cx+215,y0+30],A.WR,12,'#51615a')+C([cx-215,y0+30],12,'#3b4a43',G,2)+C([cx+215,y0+30],12,'#3b4a43',G,2);
 s+=B.g+muscle([cx-sw,y0-2-A.up],18,15,0,p,'p')+muscle([cx+sw,y0-2-A.up],18,15,0,p,'p');
 s+=limb(A.SR,A.ER,26)+limb(A.ER,A.WR,22)+limb(A.SL,A.EL,26)+limb(A.EL,A.WL,22)+C(A.SR,11,JT)+C(A.SL,11,JT)+C(A.ER,9,JT)+C(A.EL,9,JT)+fhand(A.WR)+fhand(A.WL);
 s+=`<text x="${cx+170}" y="${y0-90}" fill="${Y}" font-family="T" font-size="22">${o.kg[68]} كغ</text>`+ui(u,o,CFG[68],(20+130*p)/1.2);return s}
function scene70(t,o){const u=t/3%1,w=o.wrong,p=E(u),lean=w?30*p:0,H=[330,500],S=[330-lean,340];
 const El=[S[0]+20-8*p,S[1]+80-175*p],W=[El[0],El[1]-85],K=[455,490],F=[465,610],P=[S[0]-80,S[1]+30];
 let s=bgl('SHOULDER PRESS','كتف بالجهاز','الكتف الأمامي');s+='<g transform="translate(36 67) scale(.9)">';
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[69]/4)),p*60,70,o.kg[69])+L([95,300],[95,255],2,'#8fa39a');
 s+=sideSeat(H,K,F,w?0:3)+L(P,W,10,'#51615a')+C(P,10,'#3b4a43',G,2);
 s+=limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[505,622])+torso(H,S,add(S,[6+lean*.2,-58]),1)+muscle(add(S,[10,-4]),20,26,0,p,'p')+guide(`M ${W[0]} ${S[1]-125} L ${W[0]} ${S[1]-5}`);
 s+=limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-6,W[1]-20,12,40,'#51615a',4)+hand(W);
 s+=head(add(S,[6+lean*.2,-58]),[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+'</g>'+ui(u,o,CFG[69],flx(S,El,W));return s}
function scene71(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,sw=50,A=pecArms(cx,y0,sw,p,w,0,'lat'),B=fseat(cx,y0,sw,52,A.up);
 let s=bgl('LATERAL RAISE','رفرفة جانبية','الكتف الجانبي');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([cx-215,y0-120],[cx-215,670],14,'#27312d')+L([cx+215,y0-120],[cx+215,670],14,'#27312d')+L([cx-215,y0+60],A.EL,12,'#51615a')+L([cx+215,y0+60],A.ER,12,'#51615a')+C([cx-215,y0+60],12,'#3b4a43',G,2)+C([cx+215,y0+60],12,'#3b4a43',G,2);
 s+=B.g+muscle([cx-sw-14,y0+4-A.up],16,22,0,p,'p')+muscle([cx+sw+14,y0+4-A.up],16,22,0,p,'p');
 s+=limb(A.SR,A.ER,26)+limb(A.SL,A.EL,26)+C(A.SR,11,JT)+C(A.SL,11,JT)+C(A.ER,16,'#51615a','#0c1210',3)+C(A.EL,16,'#51615a','#0c1210',3)+fhand(A.WR)+fhand(A.WL);
 s+=`<text x="${cx+170}" y="${y0-90}" fill="${Y}" font-family="T" font-size="22">${o.kg[70]} كغ</text>`+ui(u,o,CFG[70],8+80*p);return s}
CFG.push(
{lab:['ادفع للأمام','ارجع ببطء'],cue:['ثبّت ظهرك على المسند وكتفيك للخلف','ادفع المقبضين حتى تمتد الذراعان تقريباً','ارجع ببطء دون أن يلمس الحمل الأثقال'],mist:'رفع الكتفين نحو الأذنين',mech:['المرفق','بسط (Extension)']},
{lab:['ادفع للأعلى','ارجع ببطء'],cue:['ثبّت ظهرك على المسند المائل','ادفع المقبضين للأعلى وللأمام','انزل ببطء حتى مستوى الصدر'],mist:'رفع الورك عن المقعد',mech:['المرفق','بسط (Extension)']},
{lab:['اجمع الذراعين','افتح ببطء'],cue:['اجلس بظهر ثابت وصدر مرفوع','اضغط الذراعين معاً أمام الصدر','افتح ببطء حتى تشعر بتمدد الصدر'],mist:'رفع الكتفين مع الضغط',mech:['الكتف','تقريب أفقي (Horizontal Adduction)']},
{lab:['افتح للخلف','ارجع ببطء'],cue:['ثبّت صدرك على الوسادة','افتح الذراعين للخلف بمرفقين مرنين','اعصر لوحي الكتف عند النهاية'],mist:'سحب الجسم بدل الذراعين',mech:['الكتف','بعد أفقي (Horizontal Abduction)']},
{lab:['ادفع للأعلى','ارجع ببطء'],cue:['ثبّت الظهر على المسند','ادفع المقبضين للأعلى حتى تمتد الذراعان','انزل ببطء حتى مستوى الأذنين'],mist:'تقوس أسفل الظهر',mech:['المرفق','بسط (Extension)']},
{lab:['ارفع جانباً','انزل ببطء'],cue:['ثبّت الظهر والصدر على المسند','ارفع المرفقين جانباً حتى مستوى الكتفين','انزل ببطء دون ارتخاء'],mist:'رفع الكتفين نحو الأذنين',mech:['الكتف','تبعيد (Abduction)']}
);
function legsSeat(H,K,F){return limb(H,K,34)+shorts(H,K)+limb(K,F,28)+shoe(F,[F[0]+40,F[1]+12])+C(H,10,JT)+C(K,10,JT)}
function scene72(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,500],lean=w?30*p:0,S=[330-lean,340],y=S[1]+55,W=[S[0]+185-150*p,y],El=ik(S,W,100,95,1),hp=add(S,[6-lean*.1,-58]),K=[455,490],F=[465,610];
 let s=bgl('ROW MACHINE','تجديف بالجهاز','الظهر');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[71]/6)),p*60,70,o.kg[71])+L([95,300],[95,255],2,'#8fa39a')+sideSeat()+R(S[0]+42,S[1]+4,22,130,'#3b4a43',8)+L(add(W,[0,0]),[S[0]+235,y],8,'#51615a')+C([S[0]+235,y],9,'#3b4a43',G,2);
 s+=legsSeat(H,K,F)+torso(H,S,hp,1)+guide(`M ${S[0]+35} ${y} L ${S[0]+185} ${y}`)+muscle([S[0]-18,S[1]+55],34,24,0,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-6,W[1]-22,12,44,'#51615a',4)+hand(W);
 s+=head(hp,[1,0])+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[71],flx(S,El,W));return s}
function scene73(t,o){const u=t/3%1,w=o.wrong,p=E(u),Hb=[300+36*p,420+90*p],d=[-.37,-.93],H=[Hb[0]+(w?26*p:0),Hb[1]],S=[Hb[0]+d[0]*150,Hb[1]+d[1]*150],hp=add(S,[d[0]*52,d[1]*52]),A=[420,610],K=ik(H,A,122,122,-1);
 let s=bgl('HACK SQUAT','هاك سكوات','الأرجل');s+='<g transform="translate(0 -55)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+`<g transform="rotate(-21 ${S[0]} ${S[1]})">${R(Hb[0]-70,S[1]-40,28,400,'#2d3834',10)}</g>`+L([360,620],[520,620],10,'#4a5a52')+L([20,670],[700,670],6,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K)+limb(K,A,28)+shoe(A,[A[0]+48,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+muscle(mid(H,K),38,15,ang(H,K),p,'p')+muscle(add(H,[10,-4]),24,18,0,p,'s');
 s+=limb(S,add(S,[48,56]),24)+limb(add(S,[48,56]),add(S,[88,68]),20)+C(S,11,JT)+head(hp,[1,0])+jointArc(K,H,A,Math.round(ang(K,H)-ang(K,A)<0?360+ang(K,H)-ang(K,A):ang(K,H)-ang(K,A)))+'</g>'+ui(u,o,CFG[72],180-ang3(H,K,A));return s}
function ang3(a,b,c){const x=a[0]-b[0],y=a[1]-b[1],X=c[0]-b[0],Y=c[1]-b[1];return Math.abs(Math.atan2(x*Y-y*X,x*X+y*Y))*180/Math.PI}
function scene74(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,kn=50+66*p,B=fseat(cx,y0,50,kn,0,w?10*p:0);
 let s=bgl('HIP ABDUCTION','جهاز فتح الأرجل','الأرداف الجانبية');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(cx-kn-52,y0+170,26,60,'#51615a',8)+R(cx+kn+26,y0+170,26,60,'#51615a',8);
 s+=B.g+muscle([cx-64,y0+150],18,16,0,p,'p')+muscle([cx+64,y0+150],18,16,0,p,'p')+guide(`M ${cx-52} ${y0+250} L ${cx-120} ${y0+250} M ${cx+52} ${y0+250} L ${cx+120} ${y0+250}`)
 +`<text x="${cx+190}" y="${y0-90}" fill="${Y}" font-family="T" font-size="22">${o.kg[73]} كغ</text>`+ui(u,o,CFG[73],20+40*p);return s}
function scene75(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,kn=116-66*p,B=fseat(cx,y0,50,kn,0,w?10*p:0);
 let s=bgl('HIP ADDUCTION','جهاز ضم الأرجل','الفخذ الداخلي');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(cx-kn-26,y0+170,26,60,'#51615a',8)+R(cx+kn,y0+170,26,60,'#51615a',8);
 s+=B.g+muscle([cx-26,y0+200],14,30,0,p,'p')+muscle([cx+26,y0+200],14,30,0,p,'p')+guide(`M ${cx-120} ${y0+250} L ${cx-52} ${y0+250} M ${cx+120} ${y0+250} L ${cx+52} ${y0+250}`)
 +`<text x="${cx+190}" y="${y0-90}" fill="${Y}" font-family="T" font-size="22">${o.kg[74]} كغ</text>`+ui(u,o,CFG[74],60-40*p);return s}
function scene76(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,500],S=[330,340],hp=add(S,[6,-58]),K=[455,490],F=[465,610],lift=w?28*p:0,El=[S[0]+62,S[1]+105-lift],a=(59-160*p)*Math.PI/180,W=[El[0]+95*Math.cos(a),El[1]+95*Math.sin(a)];
 let s=bgl('BICEPS CURL','جهاز البايسبس','البايسبس');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[75]/4)),p*60,70,o.kg[75])+L([95,300],[95,255],2,'#8fa39a')+sideSeat()+`<g transform="rotate(-30 ${S[0]+50} ${S[1]+130})">${R(S[0]+34,S[1]+60,120,26,'#3b4a43',10)}</g>`;
 s+=legsSeat(H,K,F)+torso(H,S,hp,1)+limb(S,El,26)+C(S,11,JT)+muscle(mid(S,El),30,13,ang(S,El),p,'s')+limb(El,W,22)+muscle(add(mid(El,W),[0,-6]),32,15,ang(El,W),p,'p')+C(El,9,JT)+R(W[0]-6,W[1]-22,12,44,'#51615a',4)+hand(W)+head(hp,[1,0]);
 s+=jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[75],flx(S,El,W));return s}
function scene77(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[330,500],up=w?22*p:0,S=[330,340-up],hp=add(S,[6,-58]),K=[455,490],F=[465,610],El=[S[0]+22,S[1]+90],a=(-60+140*p)*Math.PI/180,W=[El[0]+95*Math.cos(a),El[1]+95*Math.sin(a)];
 let s=bgl('TRICEPS MACHINE','جهاز الترايسبس','الترايسبس');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[76]/5)),p*60,70,o.kg[76])+L([95,300],[95,255],2,'#8fa39a')+sideSeat()+L(W,[S[0]+105,S[1]-30],8,'#51615a')+C([S[0]+105,S[1]-30],9,'#3b4a43',G,2);
 s+=legsSeat(H,K,F)+torso(H,S,hp,1)+limb(S,El,26)+C(S,11,JT)+muscle(add(mid(S,El),[-8,0]),30,13,ang(S,El),p,'s')+limb(El,W,22)+muscle(add(mid(S,El),[-12,6]),34,12,ang(S,El),p,'p')+C(El,9,JT)+R(W[0]-6,W[1]-22,12,44,'#51615a',4)+hand(W)+head(hp,[1,0]);
 s+=jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+ui(u,o,CFG[76],flx(S,El,W));return s}
function scene78(t,o){const u=t/3%1,w=o.wrong,p=E(u),th=(w?16:40)*p*Math.PI/180,H=[330,500-(w?18*p:0)],S=[H[0]+165*Math.sin(th),H[1]-165*Math.cos(th)],hp=[S[0]+58*Math.sin(th)+6,S[1]-58*Math.cos(th)],K=[455,490],F=[465,610],Wh=[S[0]+36,S[1]+30],El=ik(S,Wh,70,70,1);
 let s=bgl('AB CRUNCH MACHINE','جهاز البطن','عضلات البطن');
 s+=stack(60,330,10,Math.max(1,Math.round(o.kg[77]/6)),p*60,70,o.kg[77])+L([95,300],[95,255],2,'#8fa39a')+sideSeat(0,0,0,0)+R(S[0]+34,S[1]-6,24,86,'#3b4a43',8);
 s+=legsSeat(H,K,F)+torso(H,S,hp,1)+muscle(mid(H,S),32,22,ang(H,S),p,'p')+limb(S,El,22)+limb(El,Wh,20)+C(S,10,JT)+C(El,8,JT)+hand(Wh)+head(hp,[1,0]);
 s+=`<path d="M${H[0]},${H[1]-120} A120 120 0 0 1 ${H[0]+120*Math.sin(th)},${H[1]-120*Math.cos(th)}" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="5 5"/>`+jointArc(H,add(H,[0,-90]),S,Math.round(th*180/Math.PI))+ui(u,o,CFG[77],th*180/Math.PI);return s}
function scene79(t,o){const u=t/3%1,w=o.wrong,p=E(w?.45*u:u),H=[300,480],S=[300,325],hp=add(S,[6,-58]),K=[430,480-34*p],A=[K[0]+8,K[1]+128],T=[A[0]+52,642];
 let s=bgl('SEATED CALF RAISE','سمانة جلوساً','السمانة');s+='<g transform="translate(0 -60)">';
 s+=L([20,670],[700,670],6,'#3b4a43')+R(230,500,110,24,'#27312d',10)+L([285,524],[285,670],10,'#4a5a52')+R(K[0]-30,K[1]-62,60,22,'#3b4a43',9)+L([K[0],K[1]-62],[K[0],K[1]-150],12,'#51615a')+R(A[0]-40,640,150,14,'#4a5a52',5)
 +`<text x="560" y="300" fill="${Y}" font-family="T" font-size="22">${o.kg[78]} كغ</text>`;
 s+=limb(H,K,34)+shorts(H,K)+limb(K,A,26)+shoe(A,T)+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+muscle(mid(K,A),32,15,ang(K,A),p,'p')+limb(S,[S[0]+60,S[1]+90],22)+limb([S[0]+60,S[1]+90],[K[0]-14,K[1]-70],20)+hand([K[0]-14,K[1]-70])+C(S,10,JT)+head(hp,[1,0]);
 s+='</g>'+ui(u,o,CFG[78],40*p+10);return s}
CFG.push(
{lab:['اسحب للخلف','ارجع ببطء'],cue:['ثبّت صدرك على الوسادة','اسحب المقبضين للخلف حتى تقترب المرفقان من الجسم','اعصر لوحي الكتف ثم ارجع ببطء'],mist:'إمالة الجسم للخلف',mech:['المرفق','ثني (Flexion)']},
{lab:['انزل للأسفل','ارتفع ببطء'],cue:['ثبّت ظهرك على الوسادة','انزل حتى تصبح الركبتان بزاوية قائمة','ادفع بالكعبين للأعلى'],mist:'ابتعاد الورك عن الوسادة',mech:['الركبة','ثني (Flexion)']},
{lab:['افتح الأرجل','ارجع ببطء'],cue:['اجلس بظهر ثابت على المسند','افتح الركبتين للخارج بقوة','ارجع ببطء دون ارتطام الأثقال'],mist:'إمالة الجذع للأمام',mech:['الورك','تبعيد (Abduction)']},
{lab:['اضمم الأرجل','افتح ببطء'],cue:['اجلس بظهر ثابت على المسند','اضمم الركبتين معاً بقوة','افتح ببطء مع التحكم'],mist:'إمالة الجذع للأمام',mech:['الورك','تقريب (Adduction)']},
{lab:['اثنِ المرفق','انزل ببطء'],cue:['ثبّت العضد على الوسادة','اثنِ المرفقين حتى ينقبض البايسبس','انزل ببطء حتى تمتد الذراع'],mist:'رفع المرفق عن الوسادة',mech:['المرفق','ثني (Flexion)']},
{lab:['ادفع للأسفل','ارجع ببطء'],cue:['ثبّت المرفقين بجانب الجسم','ادفع المقبضين للأسفل حتى تمتد الذراعان','ارجع ببطء دون تحريك العضد'],mist:'رفع الكتفين نحو الأذنين',mech:['المرفق','بسط (Extension)']},
{lab:['اثنِ الجذع','ارجع ببطء'],cue:['ثبّت الوسادة على الصدر','اثنِ الجذع للأمام بانقباض البطن','ارجع ببطء دون ارتخاء'],mist:'رفع الورك عن المقعد',mech:['العمود الفقري','ثني (Flexion)']},
{lab:['ارفع الكعبين','انزل ببطء'],cue:['ضع الركبتين تحت الوسادة','ارفع الكعبين لأعلى نقطة','انزل ببطء حتى تتمدد السمانة'],mist:'نصف حركة',mech:['الكاحل','ثني أخمصي (Plantarflexion)']}
);
function lerp(a,b,t){return a+(b-a)*t}
function lp(A,B,t){return A.map((v,i)=>Array.isArray(v)?[lerp(v[0],B[i][0],t),lerp(v[1],B[i][1],t)]:lerp(v,B[i],t))}
function gfloor(){return L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d')}
function pers(H,S,K,A,W,hp,toe,p,mus,El){let s='';s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,toe)+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);s+=(mus||'')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);return s}
function scene80(t,o){const u=t/3%1,w=o.wrong,p=E(u),ST=[[330,420],[330,292],[335,520],[330,630],[336,430]],SQ=[[290,520],[350,410],[400,505],[335,628],[420,600]],PL=[[310,540],[480,520],[220,552],[130,562],[500,562]];
 const q=p<.5?lp(ST,SQ,p*2):lp(SQ,PL,(p-.5)*2),sag=w?44*Math.max(0,(p-.5)*2):0,H=[q[0][0],q[0][1]+sag],S=q[1],A=q[3],K=ik(H,A,100,110,-1),W=q[4],hp=[S[0]+(S[0]-H[0])*.38+6,S[1]+(S[1]-H[1])*.38-8],El=ik(S,W,70,64,1);
 let s=bgl('BURPEE','بيربي','الجسم كامل');s+=gfloor();
 s+=pers(H,S,K,A,W,hp,[A[0]+(p>.7?-26:36),A[1]+12],p,muscle(mid(H,S,.5),44,16,ang(H,S),p,'p')+muscle(mid(H,K,.5),36,14,ang(H,K),p,'s'),El);
 s+=ui(u,o,CFG[79],flx(S,H,K));return s}
function scene81(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[490,438],up=w?52:0,H=[318,502-up],F=[130,562],hp=[S[0]+50,S[1]-14],Wr=[500,562],El=ik(S,Wr,70,64,1);
 const A1=[130+190*p,566-10*p],A2=[130+190*(1-p),566-10*(1-p)];
 const kn=(A)=>{const k=ik(H,A,100,110,A[0]>200?1:-1);return k};
 let s=bgl('MOUNTAIN CLIMBERS','تسلق الجبل','البطن والجسم');s+=gfloor();
 const K2=kn(A2),K1=kn(A1);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]-26,A2[1]+12])+C(K2,9,JT);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]-26,A1[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT);
 s+=muscle(mid(H,S,.5),70,12,ang(H,S),p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=ui(u,o,CFG[80],flx(S,H,K1));return s}
function scene82(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=290,jmp=40*Math.sin(Math.PI*p),dy=-jmp,sp=70*p,sw=w?0:50;
 const hs=y0+dy,SR=[cx+50,hs+4],SL=[cx-50,hs+4],th=(10+160*p)*Math.PI/180,WR=[SR[0]+118*Math.sin(th),SR[1]+118*Math.cos(th)],WL=[SL[0]-118*Math.sin(th),SL[1]+118*Math.cos(th)],ER=mid(SR,WR),EL=mid(SL,WL);
 const HL=[cx-26,hs+135],HR=[cx+26,hs+135],AL=[cx-32-sp,y0+350+dy*.3+(w?0:0)],AR=[cx+32+sp,y0+350+dy*.3],KL=mid(HL,AL),KR=mid(HR,AR);
 let s=bgl('JUMPING JACKS','قفز فتح وضم','الجسم كامل');s+=gfloor();
 s+=`<ellipse cx="360" cy="662" rx="${110+sp}" ry="8" fill="#0c1612"/>`+limb(HL,KL,34)+shorts(HL,KL,40)+limb(KL,AL,28)+limb(HR,KR,34)+shorts(HR,KR,40)+limb(KR,AR,28);
 s+=`<ellipse cx="${AL[0]-4}" cy="${AL[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/><ellipse cx="${AR[0]+4}" cy="${AR[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=`<rect x="${cx-12}" y="${hs-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/><path d="M${cx-60},${hs+4} Q${cx},${hs-10} ${cx+60},${hs+4} L${cx+36},${hs+142} L${cx-36},${hs+142} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,hs+4,hs+128,56,36)}<rect x="${cx-37}" y="${hs+128}" width="74" height="16" rx="5" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,hs-68]);
 s+=limb(SR,ER,26)+limb(ER,WR,22)+limb(SL,EL,26)+limb(EL,WL,22)+C(SR,11,JT)+C(SL,11,JT)+fhand(WR)+fhand(WL)+muscle([cx-64,hs+10],16,20,0,p,'s')+muscle([cx+64,hs+10],16,20,0,p,'s');
 s+=ui(u,o,CFG[81],10+160*p);return s}
function scene83(t,o){const u=t/3%1,w=o.wrong,p=E(u),ph=(w?60:92)*Math.sin(Math.PI*Math.abs(Math.sin(t*2.4)))*0+((w?60:92)*(.5+.5*Math.sin(t*5.2)))*Math.PI/180,bob=-10*Math.abs(Math.sin(t*5.2)),H=[330,422+bob],lean=w?-24:6,S=[H[0]+lean,H[1]-128],hp=add(S,[8+lean*.2,-52]);
 const K1=[H[0]+100*Math.sin(ph),H[1]+100*Math.cos(ph)],A1=[K1[0]-6,K1[1]+104],K2=[H[0]-2,H[1]+100],A2=[H[0]-10,H[1]+205+8*Math.abs(Math.sin(t*5.2))],sa=(ph*180/Math.PI)*.7*Math.PI/180;
 const El=[S[0]+40*Math.sin(-sa)*.9+10,S[1]+60],W=[S[0]+(70*Math.sin(-sa)),S[1]+110],El2=[S[0]-30*Math.sin(-sa)*.9,S[1]+60],W2=[S[0]-(40*Math.sin(-sa)),S[1]+108];
 let s=bgl('HIGH KNEES','رفع الركبتين','الأرجل والكارديو');s+=gfloor();s+=`<ellipse cx="340" cy="662" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+34,A2[1]+10])+C(K2,9,JT)+limb(S,El2,24)+limb(El2,W2,20)+hand(W2);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+34,A1[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT);
 s+=muscle(mid(H,K1,.5),38,15,ang(H,K1),p,'p')+limb(S,El,24)+limb(El,W,20)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 s+=ui(u,o,CFG[82],ph*180/Math.PI);return s}
function scene84(t,o){const u=t/3%1,w=o.wrong,p=E(u),wl=240,A=[w?350:392,612],H=[wl+30,436+54*p],S=[wl+30,H[1]-132],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),Wr=[K[0]-10,K[1]-30],El=ik(S,Wr,70,64,1);
 let s=bgl('WALL SIT','الجلوس على الحائط','الفخذ الأمامي');s+=L([20,670],[700,670],6,'#3b4a43')+R(wl-34,180,34,490,'#27312d',4)+L([wl,180],[wl,670],3,'#8fa39a',.5);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[83],flx(H,K,A));return s}
function scene85(t,o){const u=t/3%1,w=o.wrong,p=E(u),F=[130,562],S=[470,470],Hs=[S[0]+(F[0]-S[0])*.58,S[1]+(F[1]-S[1])*.58],sag=w?50:50*(1-p),H=[Hs[0],Hs[1]+sag],K=[(H[0]+F[0])/2,(H[1]+F[1])/2+sag*.1],dir=[S[0]-F[0],S[1]-F[1]],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54-4]);
 let s=bgl('SIDE PLANK','بلانك جانبي','عضلات الجذع الجانبية');s+=gfloor();
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+muscle(mid(H,S,.35),60,12,ang(H,S),p,'p');
 s+=limb(S,[S[0]+4,562],26)+C(S,11,JT)+R(S[0]-6,548,70,14,'#cdb59f',6)+limb(S,[S[0]+40,S[1]-130],24)+hand([S[0]+40,S[1]-130])+head(hp,[1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[84],flx(S,H,K));return s}
function scene86(t,o){const u=t/3%1,w=o.wrong,p=E(u),sag=w?44*p:0,S=[460,470],H=[290,470+sag],hp=add(S,[54,-8]),Kd=[250,562],Ad=[190,560],Wr=[470,562],Wx=[S[0]+8+130*p,S[1]-8];
 const Ks=[H[0]-2,562],Ax=[H[0]-100-80*p,470+sag-10*p+(1-p)*80],Kx=ik(H,Ax,100,110,1);
 let s=bgl('BIRD DOG','الكلب والطائر','الظهر والجذع');s+=gfloor();
 s+=limb(H,Ks,34)+shorts(H,Ks,40)+limb(Ks,[Ks[0]-70,562],28)+shoe([Ks[0]-70,562],[Ks[0]-96,566]);
 s+=limb(H,Kx,34)+shorts(H,Kx,40)+limb(Kx,Ax,28)+shoe(Ax,[Ax[0]-26,Ax[1]+4]);
 s+=torso(H,S,hp,1)+C(H,10,JT)+muscle(mid(H,S,.5),70,12,ang(H,S),p,'p');
 s+=limb(S,Wr,26)+C(S,11,JT)+hand(Wr)+limb(S,Wx,24)+hand(Wx)+head(hp,[1,0]);
 s+=ui(u,o,CFG[85],20+60*p);return s}
function scene87(t,o){const u=t/3%1,w=o.wrong,p=E(u),y=548,Hp=[300,y],S=[440,y-20*p],hp=[S[0]+50,S[1]-22-(w?34*p:0)],A=[130,y-4-62*p],K=[(Hp[0]+A[0])/2,y-2-34*p],W=[S[0]+120,y-14-68*p],El=[(S[0]+W[0])/2,y-10-38*p];
 let s=bgl('SUPERMAN','سوبرمان','أسفل الظهر');s+=gfloor();
 s+=limb(Hp,K,34)+shorts(Hp,K,40)+limb(K,A,28)+shoe(A,[A[0]-26,A[1]+6])+torso(Hp,S,hp,1)+C(Hp,10,JT)+C(K,10,JT)+muscle(mid(Hp,S,.5),60,12,ang(Hp,S),p,'p');
 s+=limb(S,El,26)+limb(El,W,22)+C(S,11,JT)+C(El,9,JT)+hand(W)+head(hp,[1,0]);
 s+=ui(u,o,CFG[86],40*p);return s}
function scene88(t,o){const u=t/3%1,w=o.wrong,p=E(u),arch=64*p,S=[460,470],H=[280,470],Kn=[250,562],Wr=[470,562],hp=lp([[0,0]],[[0,0]],0)&&[S[0]+(50-24*p),S[1]-(24-62*p)];
 let s=bgl('CAT-COW','القطة والبقرة','العمود الفقري');s+=gfloor();
 s+=limb(H,Kn,34)+shorts(H,Kn,40)+limb(Kn,[Kn[0]-70,562],28)+shoe([Kn[0]-70,562],[Kn[0]-96,566]);
 s+=`<path d="M${H[0]},${H[1]} Q${(H[0]+S[0])/2},${H[1]-arch-30*(1-p)*-1+10*(1-p)} ${S[0]},${S[1]}" fill="none" stroke="#1d4a35" stroke-width="54" stroke-linecap="round"/><path d="M${H[0]},${H[1]} Q${(H[0]+S[0])/2},${H[1]-arch+10*(1-p)} ${S[0]},${S[1]}" fill="none" stroke="#0c1210" stroke-width="3" opacity=".6"/>`;
 s+=muscle([(H[0]+S[0])/2,H[1]-arch*.5],70,10,0,p,'p')+limb(S,Wr,26)+C(S,11,JT)+C(H,10,JT)+hand(Wr)+head(hp,[1,0]);
 s+=ui(u,o,CFG[87],arch);return s}
function scene89(t,o){const ph=t*7.2,s1=Math.sin(ph),lean=o.wrong?-22:8,H=[330,428-6*Math.abs(Math.cos(ph))],S=[H[0]+lean,H[1]-128],hp=add(S,[8+lean*.2,-52]);
 const th1=40*s1*Math.PI/180,th2=-40*s1*Math.PI/180,Kp=(th)=>[H[0]+100*Math.sin(th),H[1]+100*Math.cos(th)],sh=(th,c)=>th-(c>0?(.9+.5*Math.sin(th*0)):0);
 const K1=Kp(th1),K2=Kp(th2),A1=[K1[0]+105*Math.sin(th1-(1.0-.9*Math.max(0,Math.cos(ph)))),K1[1]+105*Math.cos(th1-(1.0-.9*Math.max(0,Math.cos(ph))))],A2=[K2[0]+105*Math.sin(th2-(1.0+.9*Math.min(0,Math.cos(ph)))),K2[1]+105*Math.cos(th2-(1.0+.9*Math.min(0,Math.cos(ph))))];
 const W1=[S[0]+60*s1*-1+10,S[1]+110],El1=[S[0]+26*-s1+8,S[1]+62],W2=[S[0]+60*s1+10,S[1]+110],El2=[S[0]+26*s1+8,S[1]+62];
 let s=bgl('TREADMILL RUN','جري على التردميل','الأرجل والقلب')+'<g transform="translate(0 -55)">';s+=L([20,670],[700,670],6,'#3b4a43')+R(150,636,360,26,'#27312d',10)+L([520,320],[520,636],10,'#51615a')+R(470,262,130,60,'#2d3834',10);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+32,A2[1]+8])+limb(S,El2,24)+limb(El2,W2,20)+hand(W2);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+32,A1[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT)+muscle(mid(H,K1,.5),38,15,ang(H,K1),.5+.5*s1,'p')+limb(S,El1,24)+limb(El1,W1,20)+C(S,11,JT)+hand(W1)+head(hp,[1,0]);
 s+='</g>';s+=ui(t/3%1,o,CFG[88],40*Math.abs(s1));return s}
function scene90(t,o){const cr=t/3*Math.PI*4,C0=[400,585],f=(a)=>[C0[0]+46*Math.cos(a),C0[1]+46*Math.sin(a)],P1=f(cr),P2=f(cr+Math.PI),H=[300,430],lean=o.wrong?-0:34,S=[H[0]+lean+40,H[1]-120],hp=add(S,[30,-30]),Hb=[500,430],K1=ik(H,P1,112,112,-1),K2=ik(H,P2,112,112,-1),W=[Hb[0],Hb[1]-10],El=ik(S,W,70,68,1);
 let s=bgl('STATIONARY BIKE','دراجة ثابتة','الأرجل والقلب')+'<g transform="translate(0 -72)">';s+=L([20,670],[700,670],6,'#3b4a43')+L([230,670],[560,670],10,'#27312d')+L([300,452],[320,670],10,'#4a5a52')+R(262,432,100,16,'#27312d',8)+L([C0[0],C0[1]],[470,430],10,'#4a5a52')+L([470,430],[500,420],8,'#4a5a52')+C(C0,52,'none','#3b4a43',6)+C(C0,10,'#8fa39a');
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,P2,28)+shoe(P2,[P2[0]+30,P2[1]+4]);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,P1,28)+shoe(P1,[P1[0]+30,P1[1]+4])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT)+limb(S,El,24)+limb(El,W,20)+C(S,11,JT)+C(El,9,JT)+hand(W)+head(hp,[1,0])+muscle(mid(H,K1,.5),38,15,ang(H,K1),.6,'p');
 s+='</g>';s+=ui(t/3%1,o,CFG[89],flx(H,K1,P1));return s}
function scene91(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[500,598],H=[380-90*p,566],th=(20-(w?65:40)*p)*Math.PI/180,S=[H[0]+128*Math.sin(th),H[1]-128*Math.cos(th)],hp=add(S,[8*Math.cos(th)+14*Math.sin(th),-52*Math.cos(th)]),K=ik(H,A,100,110,-1),Wc=[S[0]+34+(1-p)*176,S[1]+40+(1-p)*72-(1-p)*10],El=ik(S,Wc,70,64,-1);
 let s=bgl('ROWING MACHINE','جهاز التجديف','الجسم كامل')+'<g transform="translate(0 -80)">';s+=L([20,670],[700,670],6,'#3b4a43')+L([120,590],[520,600],10,'#4a5a52')+C([560,566],54,'#27312d','#3b4a43',6)+R(H[0]-34,574,68,14,'#3b4a43',6)+L(Wc,[560,566],3,'#8fa39a');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,Wc,22)+C(S,11,JT)+C(El,9,JT)+hand(Wc)+head(hp,[1,0]);
 s+='</g>';s+=ui(u,o,CFG[90],flx(H,K,A));return s}
function scene92(t,o){const cr=t/3*Math.PI*4,f=(a)=>[330+54*Math.cos(a),612+20*Math.sin(a)],A1=f(cr),A2=f(cr+Math.PI),H=[336,440],S=[H[0]+(o.wrong?-26:4),H[1]-128],hp=add(S,[8,-52]),K1=ik(H,A1,100,110,-1),K2=ik(H,A2,100,110,-1),h1=[S[0]+60+26*Math.sin(cr),S[1]+30],h2=[S[0]+60-26*Math.sin(cr),S[1]+30],El1=ik(S,h1,70,64,-1);
 let s=bgl('ELLIPTICAL','جهاز الإليبتيكال','الأرجل والقلب')+'<g transform="translate(0 -60)">';s+=L([20,670],[700,670],6,'#3b4a43')+R(240,632,200,22,'#27312d',10)+L([470,260],[470,632],12,'#51615a')+L([470,278],[h1[0]+10,h1[1]],8,'#51615a')+R(450,240,80,22,'#2d3834',8);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+34,A2[1]+8])+limb(S,[h2[0]-20,h2[1]+30],24)+hand([h2[0]-20,h2[1]+30]);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+34,A1[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT)+limb(S,El1,24)+limb(El1,h1,20)+C(S,11,JT)+hand(h1)+head(hp,[1,0])+muscle(mid(H,K1,.5),38,15,ang(H,K1),.6,'p');
 s+='</g>';s+=ui(t/3%1,o,CFG[91],flx(H,K1,A1));return s}
CFG.push(
{lab:['انزل ثم اقفز','ارجع ببطء'],cue:['انزل للقرفصاء وضع اليدين على الأرض','ارم القدمين للخلف ثم ارجع للأمام','اقفز لأعلى مع رفع الذراعين'],mist:'هبوط الورك في وضع البلانك',mech:['الجسم كامل','حركة مركّبة (Compound)']},
{lab:['اسحب الركبة','بدّل الرجل'],cue:['ثبّت اليدين تحت الكتفين','اسحب الركبة نحو الصدر بسرعة','حافظ على الورك منخفضاً'],mist:'رفع الورك للأعلى',mech:['الورك','ثني (Flexion)']},
{lab:['افتح','اضمم'],cue:['قف بقدمين مضمومتين','اقفز وافتح الرجلين وارفع الذراعين','اضمم القدمين وانزل الذراعين'],mist:'عدم رفع الذراعين كاملاً',mech:['الكتف','تبعيد (Abduction)']},
{lab:['ارفع الركبة','بدّل الرجل'],cue:['اركض في المكان بسرعة','ارفع الركبة حتى مستوى الورك','حرّك الذراعين مع الركض'],mist:'الميل للخلف',mech:['الورك','ثني (Flexion)']},
{lab:['اجلس','ثبّت'],cue:['ألصق الظهر بالحائط','اجلس حتى تصبح الركبتان بزاوية قائمة','ثبّت وتنفّس بانتظام'],mist:'تقدّم الركبتين عن القدمين',mech:['الركبة','ثني (Flexion)']},
{lab:['ارفع الورك','ثبّت'],cue:['استند على الساعد والقدم','ارفع الورك ليصبح الجسم مستقيماً','ثبّت دون هبوط الورك'],mist:'هبوط الورك',mech:['الجذع','ثبات (Isometric)']},
{lab:['مدّ الذراع والرجل','ارجع ببطء'],cue:['ابدأ على اليدين والركبتين','مدّ الذراع والرجل المعاكسة','ثبّت الجذع دون ميل'],mist:'هبوط الورك',mech:['الجذع','ثبات (Isometric)']},
{lab:['ارفع الذراعين والرجلين','انزل ببطء'],cue:['استلقِ على البطن','ارفع الذراعين والرجلين معاً','ثبّت ثانية ثم انزل'],mist:'رفع الرأس لأعلى',mech:['أسفل الظهر','بسط (Extension)']},
{lab:['قوّس الظهر للأعلى','قوّس للأسفل'],cue:['ابدأ على اليدين والركبتين','قوّس الظهر للأعلى مع إنزال الرأس','ثم ارفع الصدر وانزل البطن'],mist:'تحريك الذراعين بدل الظهر',mech:['العمود الفقري','ثني وبسط']},
{lab:['اركض','بخطوات ثابتة'],cue:['اركض بخطوات متوازنة','أبقِ الجذع مائلاً قليلاً للأمام','تنفّس بانتظام'],mist:'الميل للخلف',mech:['الورك والركبة','ثني وبسط']},
{lab:['ادفع الدواسة','بوتيرة ثابتة'],cue:['اضبط المقعد على ارتفاع الورك','ادفع الدواسة بكامل القدم','أبقِ الظهر مستقيماً'],mist:'انحناء الظهر',mech:['الركبة','ثني وبسط']},
{lab:['ادفع بالساقين','اسحب بالذراعين'],cue:['ابدأ بالركبتين مثنيتين','ادفع بالساقين ثم أمِل الجذع','اسحب المقبض نحو الصدر'],mist:'السحب بالذراعين أولاً',mech:['الركبة والورك','حركة مركّبة (Compound)']},
{lab:['ادفع الدواسة','بوتيرة ثابتة'],cue:['قف بظهر مستقيم','ادفع الدواسات بحركة بيضاوية','أمسك المقبضين بخفة'],mist:'الميل للأمام',mech:['الورك والركبة','ثني وبسط']}
);
/*FRONTMARK*/
/* ===== FRONT / BACK VIEW SCENES (93..120) ===== */
function bgf(en,ar,mus,back){return bgl(en,ar,mus)+`<text x="36" y="68" fill="${BLU}" font-family="T" font-size="19">↔ ${back?'من الخلف':'أمامي'}</text>`}
function bgfb(en,ar,mus){return bgf(en,ar,mus,1)}
function fstand(cx,y0){return {SL:[cx-50,y0],SR:[cx+50,y0],HL:[cx-26,y0+135],HR:[cx+26,y0+135],KL:[cx-30,y0+245],KR:[cx+30,y0+245],AL:[cx-32,y0+350],AR:[cx+32,y0+350]}}
function ffig(J,ord){
 const cx=(J.SL[0]+J.SR[0])/2,sy=(J.SL[1]+J.SR[1])/2,sh='fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"';
 const lg=(H,K,A,d)=>limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+`<ellipse cx="${A[0]+d*5}" cy="${J.fy?J.fy:A[1]+10}" rx="21" ry="10" ${sh}/>`;
 const legs=ord?lg(J.HR,J.KR,J.AR,1)+lg(J.HL,J.KL,J.AL,-1):lg(J.HL,J.KL,J.AL,-1)+lg(J.HR,J.KR,J.AR,1);
 const torso=`<path d="M${J.SL[0]-10},${J.SL[1]+4} Q${cx},${sy-10} ${J.SR[0]+10},${J.SR[1]+4} L${J.HR[0]+12},${J.HR[1]+8} L${J.HL[0]-12},${J.HL[1]+8} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,sy,J.HL[1],(J.SR[0]-J.SL[0])/2+4,(J.HR[0]-J.HL[0])/2+10)}<path d="M${J.HL[0]-14},${J.HL[1]-4} L${J.HR[0]+14},${J.HR[1]-4} L${J.HR[0]+14},${J.HR[1]+14} L${J.HL[0]-14},${J.HL[1]+14} Z" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5" stroke-linejoin="round"/>`;
 const neck=`<rect x="${cx-12}" y="${sy-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`;
 const head=fhead(J.hd||[cx,sy-68]);
 const arm=(S,E,W)=>E?limb(S,E,26)+limb(E,W,22)+C(E,9,JT)+C(S,11,JT)+fhand(W):'';
 return {legs,torso,neck,head,arms:arm(J.SL,J.EL,J.WL)+arm(J.SR,J.ER,J.WR),cx,sy}}
function bhead(p){return `<ellipse cx="${p[0]-28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]+28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]}" cy="${p[1]}" rx="27" ry="32" fill="#2a211c" stroke="#0c1210" stroke-width="2.5"/><path d="M${p[0]-14},${p[1]+30} L${p[0]+14},${p[1]+30}" stroke="#cdb59f" stroke-width="6"/>`}
function fbar(x0,x1,y,pl){let s=L([x0,y],[x1,y],9,'#aab5b0');if(pl)s+=R(x0-4,y-40,18,80,'#3b4a43',5,G)+R(x1-14,y-40,18,80,'#3b4a43',5,G);return s}
function fdbH(w,wd=58){return `<rect x="${w[0]-wd/2}" y="${w[1]-10}" width="${wd}" height="20" rx="7" fill="#7d8985" stroke="${G}" stroke-width="3"/>`}
function fkg(w,v,dx=34,dy=-28){if(!v)return '';return `<text x="${w[0]+dx}" y="${w[1]+dy}" fill="${Y}" font-family="T" font-size="22">${v} كغ</text>`}
function lerpA(a,b,t){return a+(b-a)*t}
function fshadow(cx,y=606,rx=130){return `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="8" fill="#0c1612"/>`}
/* squat family */
function fsq(t,o,idx,side,mode,en,ar,mus){const u=t/3%1,w=o.wrong,p=E(u),cx=360,dr=100*p,Py=375+dr,sy=240+dr*.88,ky=485-24*p;
 let ax=44,out=ax+(w?-30*p:16*p);if(mode==='wall'){ax=40;out=ax+(w?-26*p:8*p)}
 const J={SL:[cx-50,sy],SR:[cx+50,sy],HL:[cx-26,Py],HR:[cx+26,Py],KL:[cx-out,ky],KR:[cx+out,ky],AL:[cx-ax,584],AR:[cx+ax,584],hd:[cx,sy-68+ (mode==='wall'?0:0)]};
 let s=bgf(en,ar,mus)+fgnd0()+fshadow(cx);
 if(mode==='bulg'){J.AL=[cx-36,584];J.KL=[cx-36+(w?30*p:-4*p),ky];J.KR=[cx+54,Py+36];J.AR=[cx+78,540];J.fy=null;s+=R(cx+22,548,150,16,'#27312d',6,'#3b4a43')}
 if(mode==='hack'){s+=R(cx-92,sy-70,184,420,'#27312d',16,'#3b4a43')+L([cx-118,606],[cx-92,sy+250],8,'#3b4a43')+L([cx+118,606],[cx+92,sy+250],8,'#3b4a43')}
 if(mode==='wall'){s+=R(cx-190,150,380,456,'#1b2621',4,'#2c3a33')}
 if(mode==='bar'){J.WL=[cx-112,sy-6];J.WR=[cx+112,sy-6];J.EL=[cx-100,sy+56];J.ER=[cx+100,sy+56]}
 else if(mode==='gob'){J.WL=[cx-19,sy+46];J.WR=[cx+19,sy+46];J.EL=[cx-68,sy+98];J.ER=[cx+68,sy+98]}
 else if(mode==='bulg'){J.WL=[cx-78,Py+26];J.WR=[cx+78,Py+26];J.EL=[cx-70,sy+88];J.ER=[cx+70,sy+88]}
 else if(mode==='hack'){J.WL=[cx-86,sy+46];J.WR=[cx+86,sy+46];J.EL=[cx-104,sy+84];J.ER=[cx+104,sy+84]}
 else {J.WL=[cx-72,Py+8];J.WR=[cx+72,Py+8];J.EL=[cx-66,sy+80];J.ER=[cx+66,sy+80]}
 const F=ffig(J,mode==='bulg');s+=F.legs+`<line x1="${cx-ax}" y1="584" x2="${cx-ax}" y2="330" stroke="${G}" stroke-width="2" stroke-dasharray="4 8" opacity=".45"/>`+(mode==='bulg'?'':`<line x1="${cx+ax}" y1="584" x2="${cx+ax}" y2="330" stroke="${G}" stroke-width="2" stroke-dasharray="4 8" opacity=".45"/>`)+F.torso+F.neck;
 if(mode==='bar')s+=fbar(cx-186,cx+186,sy-8,1);
 if(mode==='hack')s+=C(J.SL,22,'#3b4a43','#0c1210',3)+C(J.SR,22,'#3b4a43','#0c1210',3);
 s+=F.head+F.arms;
 if(mode==='gob')s+=`<rect x="${cx-15}" y="${sy+22}" width="30" height="62" rx="9" fill="#7d8985" stroke="${G}" stroke-width="3"/>`+fkg([cx+15,sy+30],o.kg[side],36,-8);
 if(mode==='bulg')s+=fdb2(J.WL)+fdb2(J.WR)+fkg(J.WR,o.kg[side],26,-24);
 if(mode==='bar')s+=fkg([cx+186,sy-8],o.kg[side],-6,-54);
 s+=C(J.KL,10,JT)+C(J.KR,10,JT)+muscle([cx-out*.7,ky+22],14,22,0,p,'p')+muscle([cx+out*.7,ky+22],14,22,0,p,'p');
 return s+ui(u,o,CFG[idx],Math.round(176-86*p))}
function fdb2(w){return `<rect x="${w[0]-12}" y="${w[1]-20}" width="24" height="40" rx="8" fill="#7d8985" stroke="${G}" stroke-width="3"/>`}
function fsc(cx,k){return `<g transform="translate(${cx*(1-k)} ${606*(1-k)}) scale(${k})">`}
function fgnd0(){return L([20,606],[700,606],6,'#3b4a43')}
function scene93(t,o){return fsq(t,o,92,9,'bar','BARBELL SQUAT','سكوات بالبار','الفخذ والألية')}
function scene94(t,o){return fsq(t,o,93,46,'gob','GOBLET SQUAT','سكوات جوبلت','الفخذ والألية')}
function scene95(t,o){return fsq(t,o,94,54,'bulg','BULGARIAN SQUAT','سكوات بلغاري بالدمبل','الفخذ والألية')}
function scene96(t,o){return fsq(t,o,95,72,'hack','HACK SQUAT','هاك سكوات','الأرجل')}
/* lunge */
function scene97(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,Py=375+80*p,sy=240+72*p;
 const J={SL:[cx-50,sy],SR:[cx+50,sy],HL:[cx-26,Py],HR:[cx+26,Py],KL:[cx-30+(w?-0:0)+(w?34*p:-6*p),485+32*p],AL:[cx-34,590+8*p],KR:[cx+34,485+75*p],AR:[cx+44,590-18*p],hd:[cx,sy-68]};
 J.KL[0]=cx-30+(w?34*p:-8*p);J.fy=null;
 J.WL=[cx-72,Py+14];J.WR=[cx+72,Py+14];J.EL=[cx-64,sy+72];J.ER=[cx+64,sy+72];
 let s=bgf('WALKING LUNGE','طعن أمامي (لانج)','الفخذ والألية')+fgnd0()+fshadow(cx);
 const F=ffig(J,1);s+=F.legs+F.torso+F.neck+F.head+F.arms+fdb2(J.WL)+fdb2(J.WR)+fkg(J.WR,o.kg[20],26,-24)+muscle([cx-30,Py+34],24,30,0,p,'p');
 return s+ui(u,o,CFG[96],Math.round(176-86*p))}
/* leg press */
function scene98(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,kx=64+(w?-38*p:12*p),ky=340+60*p,ay=475+85*p;
 const J={SL:[cx-50,290],SR:[cx+50,290],HL:[cx-30,410],HR:[cx+30,410],KL:[cx-kx,ky],KR:[cx+kx,ky],AL:[cx-58,ay],AR:[cx+58,ay],hd:[cx,222]};
 J.WL=[cx-92,402];J.WR=[cx+92,402];J.EL=[cx-84,350];J.ER=[cx+84,350];J.fy=ay+8;
 let s=bgf('LEG PRESS','ضغط أرجل','الفخذ والألية')+fgnd0()+R(cx-100,236,200,200,'#27312d',22,'#3b4a43');
 const F=ffig(J);s+=F.torso+F.neck+F.head+F.legs+F.arms+R(cx-134,ay+6,268,20,'#4a5a52',7,G)+fkg([cx+134,ay],o.kg[11],8,0)+muscle([cx-34,ky+30],22,34,0,p,'p')+muscle([cx+34,ky+30],22,34,0,p,'p');
 return s+ui(u,o,CFG[97],Math.round(80+90*p))}
/* hip thrust */
function scene99(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,Hy=490-80*p,kx=56+(w?-30*p:6*p);
 const J={SL:[cx-46,330],SR:[cx+46,330],HL:[cx-28,Hy],HR:[cx+28,Hy],KL:[cx-kx,Hy+30],KR:[cx+kx,Hy+30],AL:[cx-64,570],AR:[cx+64,570],hd:[cx,262]};
 J.WL=[cx-104,352];J.WR=[cx+104,352];J.EL=[cx-84,330];J.ER=[cx+84,330];J.fy=578;
 let s=bgf('HIP THRUST','دفع الحوض (هيب ثراست)','عضلة الألية')+fgnd0()+R(cx-110,318,220,70,'#27312d',14,'#3b4a43')+fshadow(cx);
 const F=ffig(J);s+=F.torso+F.neck+F.head+fbar(cx-170,cx+170,Hy-6,1)+F.legs+F.arms+fkg([cx+170,Hy-6],o.kg[21],-6,-54)+muscle([cx,Hy-14],40,18,0,p,'p');
 return s+ui(u,o,CFG[98],Math.round(120+60*p))}
/* bench from head end */
function fbench(t,o,idx,side,mode,en,ar,mus){const u=t/3%1,w=o.wrong,p=E(u),cx=360,gw=mode==='cg'?38:mode==='db'?74:96,fl=w?64:16,wy=398-130*p,sy=424;
 const J={SL:[cx-60,sy],SR:[cx+60,sy],HL:[cx-34,340],HR:[cx+34,340],KL:[cx-40,300],KR:[cx+40,300],AL:[cx-44,290],AR:[cx+44,290]};
 const ex=(sg)=>[cx+sg*(lerpA((60+gw)/2+fl,(60+gw)/2,p)),(sy+wy)/2+(1-p)*6],wr=(sg)=>[cx+sg*gw,wy];
 let s=bgf(en,ar,mus)+fgnd0()+`<path d="M${cx-34},300 L${cx+34},300 L${cx+58},560 L${cx-58},560 Z" fill="#27312d" stroke="#3b4a43" stroke-width="3"/>`;
 s+=`<path d="M${cx-64},${sy+4} Q${cx},${sy-14} ${cx+64},${sy+4} L${cx+36},348 L${cx-36},348 Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,sy+4,336,60,36)}`;
 s+=muscle([cx-26,sy-24],26,20,0,p,'p')+muscle([cx+26,sy-24],26,20,0,p,'p');
 s+=`<ellipse cx="${cx}" cy="${sy+40}" rx="27" ry="30" fill="#2a211c" stroke="#0c1210" stroke-width="2.5"/>`;
 const SLp=[cx-60,sy],SRp=[cx+60,sy],EL=ex(-1),ER=ex(1),WL=wr(-1),WR=wr(1);
 s+=limb(SLp,EL,26)+limb(EL,WL,22)+limb(SRp,ER,26)+limb(ER,WR,22)+C(EL,9,JT)+C(ER,9,JT)+C(SLp,11,JT)+C(SRp,11,JT);
 if(mode==='db')s+=fdbH(WL,50)+fdbH(WR,50)+fhand(WL)+fhand(WR);else s+=fbar(cx-gw-90,cx+gw+90,wy,1)+fhand(WL)+fhand(WR);
 s+=fkg([cx+gw+96,wy],o.kg[side],4,-40);
 return s+ui(u,o,CFG[idx],Math.round(60+110*p))}
function scene100(t,o){return fbench(t,o,99,42,'bb','BARBELL BENCH PRESS','بنش بريس بالبار','الصدر')}
function scene101(t,o){return fbench(t,o,100,44,'cg','CLOSE-GRIP BENCH','بنش بريس بقبضة ضيقة','ثلاثية الرؤوس')}
function scene102(t,o){return fbench(t,o,101,1,'db','DB BENCH PRESS','ضغط صدر بالدمبل','الصدر')}
/* push-up facing viewer */
function scene103(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,hy=532,hw=66,sy=hy-142+98*p,fl=w?70:18,sx=58;
 const SL=[cx-sx,sy],SR=[cx+sx,sy],eY=lerpA((sy+hy)/2+4,hy-40,p),eX=hw-2+fl*p,EL=[cx-eX,eY],ER=[cx+eX,eY],WL=[cx-hw,hy],WR=[cx+hw,hy];
 let s=bgf('PUSH-UP','تمرين الضغط','الصدر')+L([20,548],[700,548],6,'#3b4a43')+fshadow(cx,548,170);
 s+=`<path d="M${cx-sx-8},${sy+2} Q${cx},${sy-14} ${cx+sx+8},${sy+2} L${cx+36},${sy-92} L${cx-36},${sy-92} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,sy+2,sy-92,sx+4,36)}<path d="M${cx-38},${sy-96} L${cx+38},${sy-96} L${cx+34},${sy-76} L${cx-34},${sy-76} Z" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=muscle([cx-26,sy+10],24,16,0,p,'p')+muscle([cx+26,sy+10],24,16,0,p,'p');
 const arm=(S,E2,W)=>limb(S,E2,26)+limb(E2,W,22)+C(E2,9,JT)+C(S,11,JT)+`<ellipse cx="${W[0]}" cy="${W[1]+2}" rx="17" ry="10" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=arm(SL,EL,WL)+arm(SR,ER,WR);
 s+=`<rect x="${cx-12}" y="${sy-14}" width="24" height="26" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,sy+22-6*p]);
 s+=guide(`M${cx-hw},${hy} L${cx-hw},${sy-30}`)+guide(`M${cx+hw},${hy} L${cx+hw},${sy-30}`);
 return s+ui(u,o,CFG[102],Math.round(flx(SR,ER,WR)))}
/* dips */
function scene104(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,sy=290+88*p,fl=w?60:16,hx=76;
 const J={SL:[cx-52,sy],SR:[cx+52,sy],HL:[cx-26,sy+135],HR:[cx+26,sy+135],KL:[cx-24,sy+195],KR:[cx+24,sy+195],AL:[cx-12,sy+250],AR:[cx+12,sy+250],hd:[cx,sy-68]};
 J.WL=[cx-hx,404];J.WR=[cx+hx,404];J.EL=[cx-hx-fl*p,(sy+404)/2+16];J.ER=[cx+hx+fl*p,(sy+404)/2+16];J.fy=J.AL[1]+10;
 let s=bgf('PARALLEL BAR DIPS','تمرين الغطس','الصدر')+fgnd0()+L([cx-hx,414],[cx-hx,606],12,'#27312d')+L([cx+hx,414],[cx+hx,606],12,'#27312d')+R(cx-hx-34,396,68,14,'#9aa6a1',5)+R(cx+hx-34,396,68,14,'#9aa6a1',5);
 const F=ffig(J);s+=F.legs+F.torso+muscle([cx,sy+30],34,22,0,p,'p')+F.neck+F.head+F.arms;
 return s+ui(u,o,CFG[103],Math.round(170-80*p))}
/* lat pulldown */
function scene105(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,sy=330-(w?20*p:0),wy=150+170*p,wx=120-24*p,ex=lerpA(112,92,p)+(w?30*p:0);
 const J={SL:[cx-52,sy],SR:[cx+52,sy],HL:[cx-30,455],HR:[cx+30,455],KL:[cx-48,472],KR:[cx+48,472],AL:[cx-48,590],AR:[cx+48,590],hd:[cx,sy-68]};
 J.WL=[cx-wx,wy];J.WR=[cx+wx,wy];J.EL=[cx-ex,(sy+wy)/2+(1-p)*-6];J.ER=[cx+ex,(sy+wy)/2+(1-p)*-6];
 let s=bgf('LAT PULLDOWN','سحب علوي بالكيبل','الظهر العريض').replace('سحب علوي بالكيبل','سحب علوي بالكيبل')+fgnd0()+L([cx-150,90],[cx-150,300],8,'#27312d')+L([cx+150,90],[cx+150,300],8,'#27312d')+C([cx-150,100],12,'#5b6b64')+C([cx+150,100],12,'#5b6b64')+L([cx-150,100],[cx-wx-26,wy],3,'#8fa39a')+L([cx+150,100],[cx+wx+26,wy],3,'#8fa39a');
 const F=ffig(J);s+=F.legs+R(cx-84,440,168,26,'#27312d',10,'#3b4a43')+F.torso+muscle([cx-34,sy+60],22,36,0,p,'p')+muscle([cx+34,sy+60],22,36,0,p,'p')+F.neck+F.head+L([cx-wx-34,wy],[cx+wx+34,wy],10,'#aab5b0')+F.arms+fkg([cx+170,150],o.kg[2],0,0);
 return s+ui(u,o,CFG[104],Math.round(150-60*p))}
/* pull-up */
function scene106(t,o){const u=t/3%1,w=o.wrong,pp=E(u),p=w?pp*.5:pp,cx=360,sy=292-92*p,hx=104;
 const J={SL:[cx-50,sy],SR:[cx+50,sy],HL:[cx-24,sy+135],HR:[cx+24,sy+135],KL:[cx-16,sy+210],KR:[cx+16,sy+210],AL:[cx-8,sy+282],AR:[cx+8,sy+282],hd:[cx,sy-68]};
 J.WL=[cx-hx,172];J.WR=[cx+hx,172];J.EL=[cx-hx+lerpA(0,26,p),(sy+172)/2+10*p];J.ER=[cx+hx-lerpA(0,26,p),(sy+172)/2+10*p];J.fy=J.AL[1]+10;
 let s=bgf('PULL-UP','تمرين العقلة','الظهر')+fgnd0()+L([cx-190,172],[cx+190,172],12,'#9aa6a1')+L([cx-190,172],[cx-190,606],12,'#27312d')+L([cx+190,172],[cx+190,606],12,'#27312d');
 const F=ffig(J);s+=F.legs+F.torso+muscle([cx-32,sy+50],24,40,0,pp,'p')+muscle([cx+32,sy+50],24,40,0,pp,'p')+F.neck+F.head+F.arms;
 return s+ui(u,o,CFG[105],Math.round(160-100*pp))}
/* row (back view) */
function scene107(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,sy=332,fl=w?60:14,tilt=w?14*p:0;
 const J={SL:[cx-58,sy-tilt],SR:[cx+58,sy+tilt],HL:[cx-34,420],HR:[cx+34,420],KL:[cx-36,505],KR:[cx+36,505],AL:[cx-36,590],AR:[cx+36,590],hd:[cx,sy-66]};
 const wy=lerpA(486,404,p);J.WL=[cx-62,wy];J.WR=[cx+62,wy];J.EL=[cx-lerpA(66,76+fl,p),lerpA(412,370,p)];J.ER=[cx+lerpA(66,76+fl,p),lerpA(412,370,p)];
 let s=bgfb('BENT-OVER ROW','سحب البار منحنياً','الظهر')+fgnd0()+fshadow(cx);
 const F=ffig(J);s+=F.legs+F.torso.replace(/#1d4a35/,'#1d4a35')+L([cx,sy+8],[cx,410],3,'#0c1210',.5)+muscle([cx-28,sy+44],26,40,0,p,'p')+muscle([cx+28,sy+44],26,40,0,p,'p')+F.neck+bhead(J.hd)+F.arms+fdbH(J.WL,44)+fdbH(J.WR,44)+fkg(J.WR,o.kg[22],34,-20);
 return s+ui(u,o,CFG[106],Math.round(160-70*p))}
/* press: db / bb / arnold */
function fpress(t,o,idx,side,mode,en,ar,mus){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,lag=w?34*p:0,J=fstand(cx,y0);
 const st=mode==='arn'?{wx:36,wy:y0+22,ex:58,ey:y0+84}:{wx:70,wy:y0+8,ex:94,ey:y0+66},fn={wx:56,wy:y0-150,ex:64+(w?26:0),ey:y0-76};
 const m=(a,b)=>lerpA(a,b,p);
 J.WL=[cx-m(st.wx,fn.wx),m(st.wy,fn.wy)+lag];J.WR=[cx+m(st.wx,fn.wx),m(st.wy,fn.wy)];
 J.EL=[cx-m(st.ex,fn.ex),m(st.ey,fn.ey)+lag*.6];J.ER=[cx+m(st.ex,fn.ex),m(st.ey,fn.ey)];
 let s=bgf(en,ar,mus)+fgnd0()+fshadow(cx)+fsc(cx,.82);const F=ffig(J);s+=F.legs+F.torso+F.neck+F.head+F.arms;
 if(mode==='bb')s+=fbar(cx-170,cx+170,(J.WL[1]+J.WR[1])/2,1)+fhand(J.WL)+fhand(J.WR);
 else if(mode==='arn'&&p<.5)s+=fdb2(J.WL)+fdb2(J.WR);else s+=fdbH(J.WL)+fdbH(J.WR);
 s+=fkg(J.WR,o.kg[side],40,-26)+muscle([cx-52,y0+6],18,18,0,p,'p')+muscle([cx+52,y0+6],18,18,0,p,'p')+'</g>';
 return s+ui(u,o,CFG[idx],Math.round(80+90*p))}
function scene108(t,o){return fpress(t,o,107,5,'db','SHOULDER PRESS','ضغط كتف جالس بالدمبل','الكتف الأمامي')}
function scene109(t,o){return fpress(t,o,108,18,'bb','OVERHEAD PRESS','ضغط كتف بالبار','الكتف')}
function scene110(t,o){return fpress(t,o,109,64,'arn','ARNOLD PRESS','أرنولد بريس بالدمبل','الكتف الأمامي')}
/* face pull */
function scene111(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),m=(a,b)=>lerpA(a,b,p),ed=w?44:0;
 J.WL=[cx-m(30,70),m(y0+64,y0-22)+ed*p*.4];J.WR=[cx+m(30,70),J.WL[1]];J.EL=[cx-m(76,120),m(y0+44,y0+4)+ed*p];J.ER=[cx+m(76,120),J.EL[1]];
 let s=bgf('CABLE FACE PULL','سحب الحبل للوجه','الكتف الخلفي')+fgnd0()+fshadow(cx);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+L(J.WL,[cx,y0+110],4,'#8fa39a')+L(J.WR,[cx,y0+110],4,'#8fa39a')+C([cx,y0+110],7,'#5b6b64')+F.arms+muscle([cx-44,y0+20],20,16,0,p,'p')+muscle([cx+44,y0+20],20,16,0,p,'p');
 return s+ui(u,o,CFG[110],Math.round(70+50*p))}
/* upright row */
function scene112(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),m=(a,b)=>lerpA(a,b,p);
 J.WL=[cx-m(40,40),m(y0+160,y0+54)];J.WR=[cx+m(40,40),J.WL[1]];J.EL=[cx-m(58,100+(w?24:0)),m(y0+90,w?y0-44:y0+4)];J.ER=[cx+m(58,100+(w?24:0)),J.EL[1]];
 let s=bgf('UPRIGHT ROW','سحب للذقن بالبار','الكتف')+fgnd0()+fshadow(cx);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+F.arms+fbar(cx-86,cx+86,J.WL[1],0)+fhand(J.WL)+fhand(J.WR)+fkg(J.WR,o.kg[34],40,-20);
 return s+ui(u,o,CFG[111],Math.round(60+60*p))}
/* shrug */
function scene113(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),up=30*p;
 J.SL=[cx-50,y0-up];J.SR=[cx+50,y0-up];J.hd=[cx,y0-68];
 const bend=w?44*p:0;J.WL=[cx-70-bend*.4,y0+152-up-bend];J.WR=[cx+70+bend*.4,y0+152-up-bend];J.EL=[cx-66-bend*.5,y0+80-up-bend*.3];J.ER=[cx+66+bend*.5,y0+80-up-bend*.3];
 let s=bgf('DUMBBELL SHRUG','رفع الكتفين (شراغز)','الترابيس')+fgnd0()+fshadow(cx);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+muscle([cx-34,y0-up+2],24,16,0,p,'p')+muscle([cx+34,y0-up+2],24,16,0,p,'p')+F.arms+fdb2(J.WL)+fdb2(J.WR)+fkg(J.WR,o.kg[23],24,-24);
 return s+ui(u,o,CFG[112],Math.round(30*p))}
/* triceps pushdown */
function scene114(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),m=(a,b)=>lerpA(a,b,p),fl=w?36:0;
 const ex=64+fl;J.EL=[cx-ex,y0+90+(w?10*p:0)];J.ER=[cx+ex,J.EL[1]];J.WL=[cx-m(40,60),m(y0+40,y0+176)];J.WR=[cx+m(40,60),J.WL[1]];
 let s=bgf('TRICEPS PUSHDOWN','نزول ترايسبس بالكيبل','ثلاثية الرؤوس')+fgnd0()+fshadow(cx)+L([cx,120],[cx,J.WL[1]],3,'#8fa39a')+C([cx,112],13,'#5b6b64')+L([cx-40,112],[cx+40,112],10,'#27312d');
 const F=ffig(J);s+=F.legs+F.torso+F.neck+F.head+F.arms+fbar(cx-76,cx+76,J.WL[1]+2,0)+fhand(J.WL)+fhand(J.WR)+muscle([cx-62,y0+110],14,28,0,p,'p')+muscle([cx+62,y0+110],14,28,0,p,'p');
 return s+ui(u,o,CFG[113],Math.round(60+110*p))}
/* overhead triceps */
function scene115(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),m=(a,b)=>lerpA(a,b,p),fl=w?46:0;
 J.EL=[cx-(34+fl),y0-96];J.ER=[cx+(34+fl),y0-96];J.WL=[cx-m(14,16),m(y0-30,y0-190)];J.WR=[cx+m(14,16),J.WL[1]];
 let s=bgf('OVERHEAD TRICEPS EXT','ترايسبس فوق الرأس','ثلاثية الرؤوس')+fgnd0()+fshadow(cx)+fsc(cx,.8);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.arms+`<rect x="${cx-16}" y="${J.WL[1]-30}" width="32" height="64" rx="9" fill="#7d8985" stroke="${G}" stroke-width="3"/>`+fhand(J.WL)+fhand(J.WR)+F.head+fkg([cx+16,J.WL[1]],o.kg[29],30,-8)+muscle([cx-44,y0-70],14,24,0,p,'p')+muscle([cx+44,y0-70],14,24,0,p,'p')+'</g>';
 return s+ui(u,o,CFG[114],Math.round(60+110*p))}
/* front raise */
function scene116(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=236,J=fstand(cx,y0),top=w?y0-40:y0+14,wy=lerpA(y0+156,top,p);
 J.SL=[cx-50,y0-(w?14*p:0)];J.SR=[cx+50,y0-(w?14*p:0)];J.WL=[cx-56,wy];J.WR=[cx+56,wy];J.EL=[cx-60,(J.SL[1]+wy)/2];J.ER=[cx+60,(J.SL[1]+wy)/2];
 let s=bgf('FRONT RAISE','رفع أمامي بالدمبل','الكتف الأمامي')+fgnd0()+fshadow(cx);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+F.arms+C(J.WL,17,'#7d8985',G,3)+C(J.WR,17,'#7d8985',G,3)+fkg(J.WR,o.kg[15],30,-24)+muscle([cx-32,y0+10],18,18,0,p,'p')+muscle([cx+32,y0+10],18,18,0,p,'p');
 return s+ui(u,o,CFG[115],Math.round(90*p))}
/* calf raise */
function scene117(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,y0=240,J=fstand(cx,y0+4),lift=24*p,roll=w?16*p:0;
 for(const k of ['SL','SR','HL','HR','KL','KR','AL','AR'])J[k]=[J[k][0],J[k][1]-lift];
 J.AL[0]-=roll;J.AR[0]+=roll;J.KL[0]-=roll*.4;J.KR[0]+=roll*.4;J.fy=606;
 J.WL=[cx-66,y0+156-lift];J.WR=[cx+66,y0+156-lift];J.EL=[cx-64,y0+84-lift];J.ER=[cx+64,y0+84-lift];
 let s=bgf('STANDING CALF RAISE','رفع سمانة واقفاً','السمانة')+fgnd0()+fshadow(cx,606,100);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+F.arms+muscle([cx-34,J.KL[1]+60],14,36,0,p,'p')+muscle([cx+34,J.KR[1]+60],14,36,0,p,'p');
 return s+ui(u,o,CFG[116],Math.round(70*p))}
/* deadlift */
function scene118(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,sy=lerpA(316,240,p),Py=lerpA(420,375,p),ky=485,wy=lerpA(536,404,p),kx=lerpA(48,32,p),tl=w?28*p:0;
 const J={SL:[cx-52,sy],SR:[cx+52,sy],HL:[cx-26,Py],HR:[cx+26,Py],KL:[cx-kx,ky],KR:[cx+kx,ky],AL:[cx-34,590],AR:[cx+34,590],hd:[cx,sy-68]};
 J.WL=[cx-62,wy+tl*.4];J.WR=[cx+62,wy-tl*.4];J.EL=[cx-60,(sy+wy)/2];J.ER=[cx+60,(sy+wy)/2];
 let s=bgf('CONVENTIONAL DEADLIFT','ديدليفت بالبار','الظهر والألية')+fgnd0()+fshadow(cx);const F=ffig(J);
 s+=F.legs+F.torso+F.neck+F.head+F.arms+`<line x1="${cx-150}" y1="${wy+tl}" x2="${cx+150}" y2="${wy-tl}" stroke="#aab5b0" stroke-width="9" stroke-linecap="round"/>`+R(cx-176,wy+tl-44,18,88,'#3b4a43',5,G)+R(cx+158,wy-tl-44,18,88,'#3b4a43',5,G)+fhand(J.WL)+fhand(J.WR)+fkg([cx+176,wy-tl],o.kg[45],-54,-54)+muscle([cx,Py-30],36,30,0,p,'p');
 return s+ui(u,o,CFG[117],Math.round(60+100*p))}
/* bird dog (from behind) */
function scene119(t,o){const u=t/3%1,w=o.wrong,p=E(u),cx=360,tl=w?32*p:0;
 const SLp=[cx-46,406],SRp=[cx+46,406],HLp=[cx-30,470-tl],HRp=[cx+30,470];
 let s=bgfb('BIRD DOG','الكلب والطائر','الظهر والجذع')+fgnd0()+fshadow(cx,606,150);
 const leg=(H,K,A)=>limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+`<ellipse cx="${A[0]}" cy="${A[1]+10}" rx="21" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=leg(HRp,[cx+34,562],[cx+34,596]);
 s+=`<path d="M${cx-52},410 Q${cx},392 ${cx+52},410 L${cx+34},476 L${cx-34},476 Z" fill="#1d4a35" stroke="#0c1210" stroke-width="3"/><path d="M${HLp[0]-14},${HLp[1]-6} L${HRp[0]+14},${HRp[1]-6} L${HRp[0]+14},${HRp[1]+12} L${HLp[0]-14},${HLp[1]+12} Z" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=limb(SLp,[cx-52,470],26)+limb([cx-52,470],[cx-54,558],22)+fhand([cx-54,566])+bhead([cx,356]);
 const wx=cx+54-lerpA(0,0,p);s+=limb(SRp,[cx+60,lerpA(470,380,p)],26)+limb([cx+60,lerpA(470,380,p)],[cx+64,lerpA(558,330,p)],22)+fhand([cx+64,lerpA(566,324,p)]);
 const A2=[cx-34,lerpA(560,596,p)],K2=[cx-34,lerpA(560,574,p)];s+=leg(HLp,K2,[cx-34,lerpA(596,604,p)]);
 s+=muscle([cx,436],30,26,0,p,'p');
 return s+ui(u,o,CFG[118],Math.round(70+90*p))}
/* wall sit */
function scene120(t,o){return fsq(t,o,119,83,'wall','WALL SIT','الجلوس على الحائط','الفخذ الأمامي')}
CFG.push(
{lab:CFG[9].lab,cue:['القدمان أوسع من الكتفين قليلاً','وجّه الركبتين نحو أصابع القدمين','ادفع الأرض وابقِ الركبتين للخارج'],mist:'انهيار الركبتين للداخل',mech:CFG[9].mech},
{lab:CFG[46].lab,cue:['أمسك الدمبل أمام الصدر','وجّه الركبتين نحو أصابع القدمين','ابقِ الصدر مرفوعاً وادفع للأعلى'],mist:'انهيار الركبتين للداخل',mech:CFG[46].mech},
{lab:CFG[54].lab,cue:['القدم الأمامية ثابتة والخلفية على البنش','الركبة الأمامية باتجاه أصابع القدم','انزل للأسفل والجذع مستقيم'],mist:'انهيار الركبة للداخل',mech:CFG[54].mech},
{lab:CFG[72].lab,cue:['ثبّت الظهر والكتفين على الوسادة','وجّه الركبتين نحو أصابع القدمين','ادفع المنصة دون إدخال الركبتين'],mist:'انهيار الركبتين للداخل',mech:CFG[72].mech},
{lab:CFG[20].lab,cue:['خطوة للأمام والجذع مستقيم','الركبة الأمامية فوق القدم','ادفع بالكعب للعودة'],mist:'انهيار الركبة للداخل',mech:CFG[20].mech},
{lab:CFG[11].lab,cue:['القدمان على عرض الكتفين','الركبتان باتجاه أصابع القدمين','ادفع المنصة دون قفل الركبتين'],mist:'انهيار الركبتين للداخل',mech:CFG[11].mech},
{lab:CFG[21].lab,cue:['القدمان على عرض الكتفين','ارفع الحوض حتى يستقيم الجسم','الركبتان ثابتتان للخارج قليلاً'],mist:'انهيار الركبتين للداخل',mech:CFG[21].mech},
{lab:CFG[42].lab,cue:['امسك البار بعرض أوسع من الكتفين','المرفقان بزاوية مائلة عن الجسم','ادفع البار للأعلى بالتساوي'],mist:'فتح المرفقين للجانب',mech:CFG[42].mech},
{lab:CFG[44].lab,cue:['القبضة بعرض الكتفين','ابقِ المرفقين قريبين من الجسم','ادفع البار للأعلى بالتساوي'],mist:'فتح المرفقين للجانب',mech:CFG[44].mech},
{lab:CFG[1].lab,cue:['الدمبلان فوق الصدر بالتساوي','المرفقان بزاوية مائلة عن الجسم','ادفع الدمبلين للأعلى معاً'],mist:'فتح المرفقين للجانب',mech:CFG[1].mech},
{lab:CFG[16].lab,cue:['اليدان أوسع من الكتفين قليلاً','المرفقان بزاوية مائلة عن الجسم','انزل بالصدر ثم ادفع الأرض'],mist:'فتح المرفقين للجانب',mech:CFG[16].mech},
{lab:CFG[19].lab,cue:['اليدان على القضيبين والكتفان للأسفل','ابقِ المرفقين قريبين من الجسم','انزل بتحكم ثم ادفع'],mist:'فتح المرفقين للخارج',mech:CFG[19].mech},
{lab:CFG[2].lab,cue:['قبضة أوسع من الكتفين','اسحب المرفقين نحو الخصر','ابقِ الكتفين بعيدين عن الأذنين'],mist:'رفع الكتفين نحو الأذنين',mech:CFG[2].mech},
{lab:CFG[17].lab,cue:['قبضة أوسع من الكتفين','اسحب الصدر نحو البار','انزل حتى تمتد الذراعان'],mist:'سحب نصف الحركة فقط',mech:CFG[17].mech},
{lab:CFG[22].lab,cue:['اسحب المرفقين للخلف قرب الجسم','اضغط لوحي الكتف معاً','ابقِ الكتفين مستويين دون ميلان'],mist:'فتح المرفقين للجانب',mech:CFG[22].mech},
{lab:CFG[5].lab,cue:['ادفع الدمبلين فوق الكتفين','ادفع الذراعين بالتساوي','ابقِ الجذع ثابتاً'],mist:'عدم تساوي الذراعين',mech:CFG[5].mech},
{lab:CFG[18].lab,cue:['ادفع البار فوق الرأس','ادفع الذراعين بالتساوي','ابقِ الجذع ثابتاً'],mist:'عدم تساوي الذراعين',mech:CFG[18].mech},
{lab:CFG[64].lab,cue:['ابدأ والكفان أمام الوجه','أدر الكفين أثناء الدفع','ادفع للأعلى حتى يمتد المرفق'],mist:'عدم تساوي الذراعين',mech:CFG[64].mech},
{lab:CFG[32].lab,cue:['اسحب الحبل نحو الوجه','ارفع المرفقين بمستوى الكتفين','افتح الذراعين للخارج'],mist:'نزول المرفقين',mech:CFG[32].mech},
{lab:CFG[34].lab,cue:['اسحب البار قريباً من الجسم','ارفع المرفقين للأعلى','توقف عند مستوى الكتفين'],mist:'رفع المرفقين فوق الكتفين',mech:CFG[34].mech},
{lab:CFG[23].lab,cue:['الذراعان مستقيمتان بجانب الجسم','ارفع الكتفين نحو الأذنين','انزل ببطء دون ثني المرفقين'],mist:'ثني المرفقين أثناء الرفع',mech:CFG[23].mech},
{lab:CFG[8].lab,cue:['ثبّت المرفقين بجانب الجسم','مدّ المرفقين للأسفل','ارجع ببطء حتى زاوية 90 درجة'],mist:'فتح المرفقين للخارج',mech:CFG[8].mech},
{lab:CFG[29].lab,cue:['ابقِ المرفقين قريبين من الرأس','مدّ المرفقين للأعلى','انزل الدمبل خلف الرأس ببطء'],mist:'فتح المرفقين للجانب',mech:CFG[29].mech},
{lab:CFG[15].lab,cue:['ارفع الدمبلين أمام الجسم','توقف عند مستوى الكتفين','انزل ببطء دون تأرجح'],mist:'رفع الذراعين فوق الكتفين',mech:CFG[15].mech},
{lab:CFG[13].lab,cue:['القدمان على عرض الورك','ارتفع على أطراف الأصابع','ابقِ الكاحلين مستقيمين'],mist:'ميلان الكاحلين للخارج',mech:CFG[13].mech},
{lab:CFG[45].lab,cue:['القدمان على عرض الورك','البار قريب من الساقين','ارفع البار بالتساوي من الجهتين'],mist:'ميلان البار لجهة واحدة',mech:CFG[45].mech},
{lab:CFG[85].lab,cue:['ابدأ على اليدين والركبتين','مدّ الذراع والرجل المعاكسة','ابقِ الحوض مستوياً دون ميلان'],mist:'ميلان الحوض',mech:CFG[85].mech},
{lab:CFG[83].lab,cue:['ابقِ الظهر ملاصقاً للحائط','الركبتان باتجاه أصابع القدمين','اجلس حتى تصبح الركبتان بزاوية قائمة'],mist:'انهيار الركبتين للداخل',mech:CFG[83].mech}
);

const SC=[scene1,scene2,scene3,scene4,scene5,scene6,scene7,scene8,scene9,scene10,scene11,scene12,scene13,scene14,scene15,scene16,scene17,scene18,scene19,scene20,scene21,scene22,scene23,scene24,scene25,scene26,scene27,scene28,scene29,scene30,scene31,scene32,scene33,scene34,scene35,scene36,scene37,scene38,scene39,scene40,scene41,scene42,scene43,scene44,scene45,scene46,scene47,scene48,scene49,scene50,scene51,scene52,scene53,scene54,scene55,scene56,scene57,scene58,scene59,scene60,scene61,scene62,scene63,scene64,scene65,scene66,scene67,scene68,scene69,scene70,scene71,scene72,scene73,scene74,scene75,scene76,scene77,scene78,scene79,scene80,scene81,scene82,scene83,scene84,scene85,scene86,scene87,scene88,scene89,scene90,scene91,scene92,scene93,scene94,scene95,scene96,scene97,scene98,scene99,scene100,scene101,scene102,scene103,scene104,scene105,scene106,scene107,scene108,scene109,scene110,scene111,scene112,scene113,scene114,scene115,scene116,scene117,scene118,scene119,scene120,scene121,scene122,scene123,scene124,scene125,scene126,scene127,scene128,scene129,scene130,scene131,scene132,scene133,scene134,scene135,scene136,scene137,scene138,scene139,scene140,scene141,scene142,scene143];
function scene121(t,o){const u=t/3%1,w=o.wrong,p=E(u),K=[250,552],F=[140,556],ph=(25+55*p)*Math.PI/180,ps=(78+2*p)*Math.PI/180,sag=w?50*p:0,
 H0=[K[0]+100*Math.sin(ph),K[1]-100*Math.cos(ph)],H=[H0[0],H0[1]+sag],S=[H0[0]+143*Math.sin(ps),H0[1]-143*Math.cos(ps)],hp=add(S,[54*Math.sin(ps)*.9+6,-54*Math.cos(ps)*.9-10]),
 dyw=530-S[1],Wr=[S[0]+Math.sqrt(Math.max(0,133*133-dyw*dyw)),530],El=ik(S,Wr,70,64,1);
 let s=bgl('AB WHEEL','عجلة البطن','البطن والجسم');
 s+=L([20,578],[700,578],4,'#27312d')+L([20,670],[700,670],6,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=`<circle cx="${Wr[0]}" cy="${Wr[1]}" r="26" fill="#1d2a24" stroke="#6b8076" stroke-width="5"/>`+C(Wr,8,JT);
 s+=muscle(mid(H,S,.5),70,12,ang(H,S),p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[120],flx(S,H,K));return s}
CFG.push({lab:['شدّ الجسم','ارجع ببطء'],cue:['ابدأ على الركبتين والعجلة تحت الكتفين','مدّ الجسم للأمام بخط مستقيم','شدّ البطن والألية معاً'],mist:'هبوط الحوض',mech:['الورك','بسط (Extension)']});
function scene122(t,o){const u=t/3%1,w=o.wrong,p=E(u),F=[263,562],Wr=[455,562],S=[430+10*p,436+54*p],sag=w?70*p:0,H=[320+40*p,360+15*p+sag],K=ik(H,F,100,110,-1),
 dir=[S[0]-H[0],S[1]-H[1]],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54]),El=ik(S,Wr,70,64,1);
 let s=bgl('PIKE PUSH-UP','ضغط بايك','الكتف الأمامي');
 s+=L([20,578],[700,578],4,'#27312d')+L([20,670],[700,670],6,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-4,22]),24,16,ang(H,S)+90,p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(El,S,Wr,Math.round(flx(S,El,Wr)))+ui(u,o,CFG[121],flx(S,El,Wr));return s}
CFG.push({lab:['انزل بالرأس','ادفع للأعلى'],cue:['ارفع الورك عالياً ليصبح جسمك مثلثاً','انزل بالرأس بين اليدين وانثنِ بالمرفقين','ادفع الأرض بقوة حتى تمدّ الذراعين'],mist:'هبوط الحوض',mech:['المرفق','ثني (Flexion)']});
/* ===== VARIANT SCENES (123..138) ===== */
function pushVar(t,o,V){const u=t/3%1,w=o.wrong,p=E(u),S=[V.S0[0]+(V.S1[0]-V.S0[0])*p,V.S0[1]+(V.S1[1]-V.S0[1])*p],sag=w?42*p:0,Wr=V.Wr,F=V.F;
 let H,K;const piv=V.K||F;
 if(V.K){const d=[S[0]-V.K[0],S[1]-V.K[1]];H=[V.K[0]+d[0]*.42,V.K[1]+d[1]*.42+sag];K=V.K}else{H=[S[0]+(F[0]-S[0])*.58,S[1]+(F[1]-S[1])*.58+sag];K=[(H[0]+F[0])/2,(H[1]+F[1])/2+sag*.2]}
 const dir=[S[0]-piv[0],S[1]-piv[1]],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54]),El=ik(S,Wr,70,64,1);
 let s=bgl(V.en,V.ar,'الصدر')+L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d');
 s+=V.box||'';
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(S,[-4,22]),24,16,ang(F,S)+90,p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 return s+jointArc(El,S,Wr,Math.round(flx(S,El,Wr)))+ui(u,o,CFG[V.cfg],flx(S,El,Wr))}
function scene123(t,o){return pushVar(t,o,{en:'KNEE PUSH-UP',ar:'ضغط على الركبتين',cfg:122,F:[165,492],K:[255,553],Wr:[520,558],S0:[490,430],S1:[478,520]})}
function scene124(t,o){return pushVar(t,o,{en:'INCLINE PUSH-UP',ar:'ضغط مائل',cfg:123,F:[130,562],Wr:[520,476],S0:[505,350],S1:[493,436],box:R(440,478,200,16,'#27312d',6)+L([462,494],[462,562],8,'#3b4a43')+L([618,494],[618,562],8,'#3b4a43')})}
function scene125(t,o){return pushVar(t,o,{en:'DECLINE PUSH-UP',ar:'ضغط بقدمين عالية',cfg:124,F:[128,420],Wr:[520,558],S0:[500,436],S1:[488,522],box:R(60,424,150,16,'#27312d',6)+L([86,440],[86,562],8,'#3b4a43')+L([186,440],[186,562],8,'#3b4a43')})}
function bwSquat(t,o,jump,cfgI,en,ar){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-65*p,422+95*p],lean=(28+(w?32:0))*p*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8+10*Math.sin(lean),-52]),K=ik(H,A,100,110,-1),W=add(S,[112,16-10*p]),El=ik(S,W,66,66,-1),lift=jump&&u>.8&&u<.98?70*Math.sin(Math.PI*(u-.8)/.18):0;
 let s=bgl(en,ar,'الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="${110-lift*.5}" ry="8" fill="#0c1612"/>`;
 if(lift)s+=`<g transform="translate(0,${-lift.toFixed(1)})">`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+hand(W)+head(hp,[1,0]);
 if(lift)s+='</g>';
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[cfgI],flx(H,K,A));return s}
function scene126(t,o){return bwSquat(t,o,false,125,'BODYWEIGHT SQUAT','سكوات بوزن الجسم')}
function scene127(t,o){return bwSquat(t,o,true,126,'JUMP SQUAT','سكوات بالقفز')}
function scene128(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[455,500],B=lerpA(330,398,p)>0?[lerpA(330,398,p),lerpA(562,470,p)]:[330,562],lean=((w?30:8)*Math.PI/180)*(.4+.6*p),H=[395+35*p,418-110*p],S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),K2=ik(H,B,100,110,-1);
 let s=bgl('STEP-UP','الصعود على الكرسي','الفخذ والألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="400" cy="660" rx="170" ry="8" fill="#0c1612"/>`+R(380,500,170,18,'#27312d',6)+L([396,518],[396,562],8,'#3b4a43')+L([534,518],[534,562],8,'#3b4a43');
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,B,28)+shoe(B,[B[0]+38,B[1]+12])+C(K2,10,JT);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,[S[0]+6,S[1]+100],24)+C(S,11,JT)+head(hp,[1,0]);
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[127],flx(H,K,A));return s}
function scene129(t,o){const u=t/3%1,w=o.wrong,p=E(u),H=[300,556],S=[172,542],hp=[118,536],ph=(80*p)*Math.PI/180,b=(w?100*p:0)*Math.PI/180,K=[H[0]+100*Math.cos(ph),H[1]-100*Math.sin(ph)],A=[K[0]+110*Math.cos(ph+b),K[1]-110*Math.sin(ph+b)];
 let s=bgl('LYING LEG RAISE','رفع الأرجل مستلقياً','أسفل البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(80,568,520,16,'#27312d',8);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34*Math.cos(ph),A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(S,H,.8),[0,-4]),30,16,0,p,'p')+limb(S,[S[0]+60,S[1]+8],22)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[128],flx(S,H,K));return s}
function scene130(t,o){const u=t/3%1,w=o.wrong,sn=Math.sin(u*Math.PI*2),c=(38+4*Math.abs(sn))*Math.PI/180,H=[470,556],S=[H[0]-128*Math.cos(c),H[1]-128*Math.sin(c)-14],nk=w?30:0,hp=[S[0]-54*Math.cos(c)-nk,S[1]-54*Math.sin(c)-14-(w?10:0)];
 const leg=e=>{const d=140+65*e,a=(62-50*e)*Math.PI/180,T=[H[0]+d*Math.cos(a),H[1]-d*Math.sin(a)+(e>.7?6:0)];return [ik(H,T,100,110,-1),T]};
 const [K1,A1]=leg((1+sn)/2),[K2,A2]=leg((1-sn)/2);
 let s=bgl('BICYCLE CRUNCH','كرنش الدراجة','عضلات البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(130,566,520,30,'#27312d',14);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+34,A2[1]+8])+C(K2,10,JT);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+34,A1[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT);
 s+=muscle(mid(H,S,.5),58,13,ang(H,S),.6,'p')+limb(S,add(hp,[16,-6]),22)+limb(add(hp,[16,-6]),add(hp,[-10,-16]),20)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(H,S,K1,Math.round(flx(S,H,K1)))+ui(u,o,CFG[129],flx(S,H,K1));return s}
function scene131(t,o){const u=t/3%1,w=o.wrong,p=E(u),c=(80*p)*Math.PI/180,H=[470,556],A=[570,566],K=ik(H,A,100,110,-1),S=[H[0]-128*Math.cos(c),H[1]-128*Math.sin(c)-14],nk=w?30*p:0,hp=[S[0]-54*Math.cos(c)-nk,S[1]-54*Math.sin(c)-14-(w?10*p:0)];
 let s=bgl('SIT-UP','سيت أب','عضلات البطن');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(130,566,520,30,'#27312d',14);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+34,A[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),58,13,ang(H,S),p,'p')+limb(S,add(hp,[16,-6]),22)+limb(add(hp,[16,-6]),add(hp,[-10,-16]),20)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(H,S,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[130],flx(S,H,K));return s}
function scene132(t,o){const u=t/3%1,w=o.wrong,p=E(u),th=((w?135:100)*p)*Math.PI/180,Wr=[490,562],S=[470,436],H=[330,440+(w?18*p:0)],K1=[320,552],A1=[220,560],K2=[H[0]-100*Math.sin(th),H[1]+100*Math.cos(th)],A2=[K2[0]-110*Math.cos(th),K2[1]-110*Math.sin(th)],El=ik(S,Wr,70,64,1),hp=add(S,[52,-14]);
 let s=bgl('DONKEY KICK','ركلة الحمار','عضلة الألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d');
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]-26,A1[1]+6])+C(K1,10,JT);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+10,A2[1]-26])+torso(H,S,hp,1)+C(H,10,JT)+C(K2,10,JT);
 s+=muscle(add(H,[-8,-6]),30,20,0,p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(H,S,K2,Math.round(flx(S,H,K2)))+ui(u,o,CFG[131],flx(S,H,K2));return s}
function scene133(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[240,550],hp=[188,546],H=[340,546-(w?55:110)*p],A1=[445,566],K1=ik(H,A1,100,110,-1),al=((w?50-40*p:50)*Math.PI/180),A2=[H[0]+205*Math.cos(al),H[1]-205*Math.sin(al)],K2=mid(H,A2,.48);
 let s=bgl('SINGLE-LEG BRIDGE','جسر الأرداف برجل واحدة','عضلة الألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(80,568,520,16,'#27312d',8);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+30,A2[1]-8])+C(K2,10,JT);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+38,A1[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT);
 s+=muscle(add(H,[-6,-4]),30,20,0,p,'p')+limb(S,[S[0]+70,S[1]+14],22)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(K1,H,S,Math.round(flx(S,H,K1)))+ui(u,o,CFG[132],flx(S,H,K1));return s}
function scene139(t,o){const u=t/3%1,w=o.wrong,p=E(u),S=[240,550],hp=[188,546],H=[340,546-(w?55:110)*p],A1=[445,566],K1=ik(H,A1,100,110,-1),al=((w?50-40*p:50)*Math.PI/180),A2=[A1[0]-20,A1[1]-2],K2=ik(H,A2,100,110,-1);
 let s=bgl('GLUTE BRIDGE','جسر الأرداف','عضلة الألية');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(80,568,520,16,'#27312d',8);
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]+38,A2[1]+8])+C(K2,10,JT);
 s+=limb(H,K1,34)+shorts(H,K1,40)+limb(K1,A1,28)+shoe(A1,[A1[0]+38,A1[1]+8])+torso(H,S,hp,1)+C(H,10,JT)+C(K1,10,JT);
 s+=muscle(add(H,[-6,-4]),30,20,0,p,'p')+limb(S,[S[0]+70,S[1]+14],22)+C(S,11,JT)+head(hp,[-1,0]);
 s+=jointArc(K1,H,S,Math.round(flx(S,H,K1)))+ui(u,o,CFG[138],flx(S,H,K1));return s}
function scene140(t,o){const u=t/3%1,w=o.wrong,p=w?1-Math.abs(2*u-1):E(u),S=[290,448],arch=w?14*Math.sin(Math.PI*p):0;
 const El=[S[0]+18-16*p,S[1]+24-119*p+(w?14*(1-p):0)],W=[El[0],El[1]-85];
 let s=bgl('FLOOR PRESS','ضغط أرضي','الصدر');
 s+=L([20,578],[700,578],6,'#3b4a43')+`<g transform="translate(0 106)">`;
 const Hp=[480,460-arch],K=[570,390],F=[600,470];
 s+=limb(Hp,K,36)+shorts(Hp,K,40)+limb(K,F,30)+shoe(F,[640,472]);
 s+=torso([470,452-arch],[262,444],[205,425],1)+C(Hp,12,JT)+head([205,425],[0,-1]);
 s+=guide(`M 308 387 L 292 268`)+muscle([318,448],44,22,-3,p,'p')+limb(S,El,26)+muscle(mid(S,El),34,10,ang(S,El),p,'s')+limb(El,W,22)+C(El,9,JT)+C(S,11,JT);
 s+=L([W[0],W[1]-34],[W[0],W[1]+34],9,'#51615a')+C([W[0],W[1]-34],17,'#7d8985',G,3)+C([W[0],W[1]+34],17,'#7d8985',G,3)+hand(W)+`<text x="${W[0]+46}" y="${W[1]+8}" fill="${Y}" font-family="T" font-size="22">${o.kg[1]}×2 كغ</text>`+jointArc(El,[2*El[0]-S[0],2*El[1]-S[1]],W,Math.round(flx(S,El,W)))+`</g>`+ui(u,o,CFG[139],flx(S,El,W));return s}
function scene141(t,o){const u=t/3%1,w=o.wrong,p=E(u),F=[130,562],Wr=[520,558],S=[500-12*p,428+104*p],sag=w?42*p:0,Hm=[S[0]+(F[0]-S[0])*.58,S[1]+(F[1]-S[1])*.58+sag],H=Hm,K=[ (H[0]+F[0])/2,(H[1]+F[1])/2+sag*.2],dir=[(S[0]-F[0]),(S[1]-F[1])],dl=Math.hypot(...dir),hp=add(S,[dir[0]/dl*54,dir[1]/dl*54]),El=ik(S,Wr,70,64,1);
 let s=bgl('WEIGHTED PUSH-UP','ضغط بالحقيبة','الصدر');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]-26,F[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT)+(()=>{const m=mid(H,S,.55),c=[m[0],m[1]-40],a=Math.atan2(S[1]-H[1],S[0]-H[0])*180/Math.PI;return `<g transform="rotate(${a} ${c[0]} ${c[1]})">`+R(c[0]-46,c[1]-26,92,52,'#5a4630',12,'#2b2117')+R(c[0]-30,c[1]-14,60,22,'#7a5f3e',6,'#2b2117')+`</g>`})();
 s+=muscle(add(S,[-4,22]),24,16,ang(F,S)+90,p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(El,S,Wr,Math.round(flx(S,El,Wr)))+ui(u,o,CFG[16],flx(S,El,Wr));return s}
function scene142(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,630],hs=w?-34*p:0,H=[330+hs,440+30*p],lean=(4+34*p)*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1),W=[S[0]+100-150*p,S[1]-96+170*p],P=[560,170];
 let s=bgl('BOTTLE WOODCHOP','وودتشوب بالقارورة','عضلات الجذع');
 s+=L([20,670],[700,670],6,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+36,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,S,.5),44,12,ang(H,S)+90,p,'p')+limb(S,W,24)+C(S,11,JT)+(()=>{const a=Math.atan2(W[1]-S[1],W[0]-S[0])*180/Math.PI+90;return `<g transform="rotate(${a} ${W[0]} ${W[1]})">`+R(W[0]-10,W[1]-30,20,56,'#6fb7d4',8,'#0c1210')+R(W[0]-6,W[1]-40,12,12,'#e8e8e8',3,'#0c1210')+`</g>`})()+hand(W)+head(hp,[1,0]);
 s+=ui(u,o,CFG[141],Math.round(lean*180/Math.PI));return s}

function fhead(p){return `<ellipse cx="${p[0]}" cy="${p[1]}" rx="27" ry="32" fill="#e0cbb6" stroke="#0c1210" stroke-width="2.5"/><path d="M${p[0]-30},${p[1]-4} C${p[0]-34},${p[1]-44} ${p[0]+34},${p[1]-44} ${p[0]+30},${p[1]-4} C${p[0]+22},${p[1]-22} ${p[0]-22},${p[1]-22} ${p[0]-30},${p[1]-4} Z" fill="#2a211c" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]-10}" cy="${p[1]+2}" rx="3" ry="2.2" fill="#10201a"/><ellipse cx="${p[0]+10}" cy="${p[1]+2}" rx="3" ry="2.2" fill="#10201a"/><path d="M${p[0]-8},${p[1]+18} Q${p[0]},${p[1]+22} ${p[0]+8},${p[1]+18}" stroke="#8a5f55" stroke-width="2" fill="none" stroke-linecap="round"/><ellipse cx="${p[0]-28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/><ellipse cx="${p[0]+28}" cy="${p[1]+6}" rx="4" ry="8" fill="#bda08a" stroke="#0c1210" stroke-width="2"/>`}
function fbase(cx,y0,sw=50,up=0){const HL=[cx-26,y0+135],HR=[cx+26,y0+135],KL=[cx-30,y0+245],KR=[cx+30,y0+245],AL=[cx-32,y0+350],AR=[cx+32,y0+350];let g='';
 g+=limb(HL,KL,34)+shorts(HL,KL,40)+limb(KL,AL,28)+limb(HR,KR,34)+shorts(HR,KR,40)+limb(KR,AR,28);
 g+=`<ellipse cx="${AL[0]-4}" cy="${AL[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/><ellipse cx="${AR[0]+4}" cy="${AR[1]+10}" rx="20" ry="10" fill="#eef3f1" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<rect x="${cx-12}" y="${y0-up-34}" width="24" height="34" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`;
 g+=`<path d="M${cx-sw-10},${y0-up+4} Q${cx},${y0-up-10} ${cx+sw+10},${y0-up+4} L${cx+36},${y0+142} L${cx-36},${y0+142} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,y0-up+4,y0+128,sw+6,36)}`;
 g+=`<rect x="${cx-37}" y="${y0+128}" width="74" height="16" rx="5" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,y0-up-68]);return g}
function fdb(w,k=1){return `<rect x="${w[0]-12}" y="${w[1]-20}" width="24" height="40" rx="8" fill="#7d8985" stroke="${G}" stroke-width="3"/>`}
function fhand(w){return `<ellipse cx="${w[0]}" cy="${w[1]}" rx="12" ry="12" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5"/>`}
function scene143(t,o){const u=t/3%1,w=o.wrong,p=E(u),T=[408,640],lift=46*p,A=[336,628-lift],bend=w?34*p:0,H=[338+bend*.6,A[1]-206+bend],S=[H[0]+4,H[1]-128],hp=add(S,[8,-52]),K=ik(H,A,100,110,-1);
 let s=bgl('SINGLE-LEG CALF RAISE','سمانة برجل واحدة','السمانة');
 s+=L([20,670],[700,670],6,'#3b4a43')+R(300,646,150,24,'#27312d',6);
 const K2=[H[0]-34,H[1]+98],A2=[K2[0]-96,K2[1]-12];s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]-34,A2[1]-6])+C(K2,10,JT);s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,T)+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(add(mid(K,A,.4),[-9,0]),34,13,ang(K,A),p,'p')+limb(S,[S[0]+6,S[1]+110],24)+C(S,11,JT)+head(hp,[1,0]);
  s+=jointArc(A,K,T,Math.round(flx(K,A,T)))+ui(u,o,CFG[13],flx(K,A,T));return s}
function scene134(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],ps=(88*p)*Math.PI/180,H=[330-35*p,415+28*p],S0=[H[0]+128*Math.sin(ps),H[1]-128*Math.cos(ps)],S=[S0[0],S0[1]+(w?18*p:0)],K=ik(H,A,100,110,-1),dv=[(S0[0]-H[0])/128,(S0[1]-H[1])/128],A2=[H[0]-dv[0]*205,H[1]-dv[1]*205],K2=mid(H,A2,.48),hp=[S[0]+dv[0]*54+4,S[1]+dv[1]*54-8+(w?26*p:0)];
 let s=bgl('SINGLE-LEG RDL','ديدليفت برجل واحدة','الهامسترينغ');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="340" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K2,34)+shorts(H,K2,40)+limb(K2,A2,28)+shoe(A2,[A2[0]-26,A2[1]+10])+C(K2,10,JT);
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,[S[0]+6,S[1]+100],24)+C(S,11,JT)+head(hp,[1,0]);
 s+=jointArc(S,H,K,Math.round(flx(S,H,K)))+ui(u,o,CFG[133],flx(S,H,K));return s}
function scene135(t,o){const u=t/3%1,w=o.wrong,p=E(u),A=[330,615],H=[330-65*p,422+95*p],lean=(28+(w?32:0))*p*Math.PI/180,S=[H[0]+128*Math.sin(lean),H[1]-128*Math.cos(lean)],hp=add(S,[8+10*Math.sin(lean),-52]),K=ik(H,A,100,110,-1),
 pr=u<.15?sm(1-u/.15):u>.7?sm((u-.7)/.3):0,W0=add(S,[30,-6]),W1=add(S,[6,-132]),W=[W0[0]+(W1[0]-W0[0])*pr,W0[1]+(W1[1]-W0[1])*pr],El=ik(S,W,66,66,-1);
 let s=bgl('THRUSTER','ثراستر','الجسم كامل');
 s+=L([20,670],[700,670],6,'#3b4a43')+`<ellipse cx="350" cy="660" rx="110" ry="8" fill="#0c1612"/>`;
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,A,28)+shoe(A,[A[0]+38,A[1]+12])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(H,K,.5),40,15,ang(H,K),p,'p')+limb(S,El,26)+limb(El,W,22)+C(El,9,JT)+C(S,11,JT)+R(W[0]-8,W[1]-18,16,30,'#51615a',5,'#0c1210')+hand(W)+head(hp,[1,0]);
 s+=jointArc(K,H,A,Math.round(flx(H,K,A)))+ui(u,o,CFG[134],flx(H,K,A));return s}
function scene136(t,o){const u=t/3%1,w=o.wrong,p=E(u),Wr=[372,468],dx=w?45*p:0,S=[388+dx,340+62*p],H=[S[0]+24+(w?30*p:0),S[1]+132],F=[620,562],K=ik(H,F,100,110,-1),El=ik(S,Wr,70,64,1),hp=add(S,[8,-54]);
 let s=bgl('CHAIR DIPS','ديبس على الكرسي','الترايسبس');
 s+=L([20,670],[700,670],6,'#3b4a43')+L([20,578],[700,578],4,'#27312d')+R(300,468,140,16,'#27312d',6)+L([320,484],[320,562],8,'#3b4a43')+L([420,484],[420,562],8,'#3b4a43');
 s+=limb(H,K,34)+shorts(H,K,40)+limb(K,F,28)+shoe(F,[F[0]+36,F[1]+10])+torso(H,S,hp,1)+C(H,10,JT)+C(K,10,JT);
 s+=muscle(mid(S,El,.5),34,12,ang(S,El),p,'p')+limb(S,El,26)+limb(El,Wr,22)+C(El,9,JT)+C(S,11,JT)+hand(Wr)+head(hp,[1,0]);
 s+=jointArc(El,S,Wr,Math.round(flx(S,El,Wr)))+ui(u,o,CFG[135],flx(S,El,Wr));return s}
function fpushW(t,o,hw,cfgI,en,ar,e0,e1,fw){const u=t/3%1,w=o.wrong,p=E(u),cx=360,hy=532,sy=hy-142+98*p,sx=58;
 const SL=[cx-sx,sy],SR=[cx+sx,sy],eY=lerpA((sy+hy)/2+4,hy-40,p),eX=lerpA(e0,w?fw:e1,p),EL=[cx-eX,eY],ER=[cx+eX,eY],WL=[cx-hw,hy],WR=[cx+hw,hy];
 let s=bgf(en,ar,'الصدر')+L([20,548],[700,548],6,'#3b4a43')+fshadow(cx,548,170);
 s+=`<path d="M${cx-sx-8},${sy+2} Q${cx},${sy-14} ${cx+sx+8},${sy+2} L${cx+36},${sy-92} L${cx-36},${sy-92} Z" fill="#d3bba5" stroke="#0c1210" stroke-width="3" stroke-linejoin="round"/>${fdef(cx,sy+2,sy-92,sx+4,36)}<path d="M${cx-38},${sy-96} L${cx+38},${sy-96} L${cx+34},${sy-76} L${cx-34},${sy-76} Z" fill="#1e2a3d" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=muscle([cx-26,sy+10],24,16,0,p,'p')+muscle([cx+26,sy+10],24,16,0,p,'p');
 const arm=(S2,E2,W2)=>limb(S2,E2,26)+limb(E2,W2,22)+C(E2,9,JT)+C(S2,11,JT)+`<ellipse cx="${W2[0]}" cy="${W2[1]+2}" rx="17" ry="10" fill="#d9c4b0" stroke="#0c1210" stroke-width="2.5"/>`;
 s+=arm(SL,EL,WL)+arm(SR,ER,WR);
 s+=`<rect x="${cx-12}" y="${sy-14}" width="24" height="26" fill="#cdb59f" stroke="#0c1210" stroke-width="2.5"/>`+fhead([cx,sy+22-6*p]);
 s+=guide(`M${cx-hw},${hy} L${cx-hw},${sy-30}`)+guide(`M${cx+hw},${hy} L${cx+hw},${sy-30}`);
 return s+ui(u,o,CFG[cfgI],Math.round(flx(SR,ER,WR)))}
function scene137(t,o){return fpushW(t,o,100,136,'WIDE PUSH-UP','ضغط واسع',108,122,150)}
function scene138(t,o){return fpushW(t,o,16,137,'DIAMOND PUSH-UP','ضغط ماسي',36,62,100)}
(()=>{const c=i=>CFG[i],pk=(a,b)=>({lab:a.lab,cue:b,mist:a.mist,mech:a.mech});
 CFG.push(pk(c(16),['ابقَ الجسم مستقيماً من الركبتين حتى الرأس',c(16).cue[1],c(16).cue[2]]));
 CFG.push(pk(c(16),['ضع يديك على حافة مرتفعة وابقِ الجسم مستقيماً',c(16).cue[1],c(16).cue[2]]));
 CFG.push(pk(c(16),['ضع قدميك على مقعد وابقِ الحوض مرفوعاً',c(16).cue[1],c(16).cue[2]]));
 CFG.push(pk(c(9),c(9).cue));
 CFG.push(pk(c(9),[c(9).cue[0],'اقفز بقوة للأعلى ثم اهبط بنعومة',c(9).cue[1]]));
 CFG.push(pk(c(20),['ضع القدم كاملة على الكرسي',c(20).cue[1],c(20).cue[2]]));
 CFG.push({lab:c(25).lab,cue:['استلقِ وثبّت أسفل الظهر على الأرض',c(25).cue[1],c(25).cue[2]],mist:'ثني الركبتين',mech:c(25).mech});
 CFG.push(pk(c(14),[c(14).cue[0],'قرّب المرفق من الركبة المعاكسة','مدّ الرجل الأخرى بالتبادل']));
 CFG.push(pk(c(14),['اثنِ الركبتين وثبّت القدمين','اصعد حتى يقترب الصدر من الركبتين',c(14).cue[2]]));
 CFG.push({lab:c(30).lab,cue:[c(85).cue[0],'ارفع الركبة للخلف والأعلى بقوة الألية',c(21).cue[1]],mist:'تقويس أسفل الظهر',mech:c(30).mech});
 CFG.push({lab:c(21).lab,cue:[c(21).cue[0],'ارفع رجلاً واحدة مفرودة وثبّت الحوض مستوياً',c(21).cue[1]],mist:'هبوط الورك',mech:c(21).mech});
 CFG.push({lab:c(47).lab,cue:[c(47).cue[0],'ارفع الرجل الخلفية بخط واحد مع الجذع',c(47).cue[2]],mist:c(45).mist,mech:c(47).mech});
 CFG.push(pk(c(9),['ابدأ بالسكوات والوزن عند الكتفين',c(9).cue[2],'ادفع الوزن فوق الرأس عند الوقوف']));
 CFG.push({lab:c(19).lab,cue:['ضع يديك على حافة الكرسي خلفك','انزل حتى تصبح المرفقان بزاوية قائمة',c(19).cue[2]],mist:'ابتعاد الورك عن الكرسي',mech:c(19).mech});
 CFG.push(pk(c(102),['ضع اليدين أوسع من الكتفين',c(16).cue[0],c(16).cue[2]]));
 CFG.push(pk(c(102),['ضع اليدين معاً على شكل ماسة',c(16).cue[0],c(16).cue[2]]));
 CFG.push({lab:c(21).lab,cue:[c(21).cue[0],c(21).cue[1],c(21).cue[2]],mist:'هبوط الورك',mech:c(21).mech});
 CFG.push(JSON.parse(JSON.stringify(c(1))));
 CFG.push(JSON.parse(JSON.stringify(c(16))));
 CFG.push({lab:c(37).lab,cue:['اقطع بالقارورة قطرياً من الأعلى للأسفل',c(37).cue[1],c(37).cue[2]],mist:c(37).mist,mech:c(37).mech});
 CFG.push(JSON.parse(JSON.stringify(c(13))));
})();

const LT={'#050806':'#f4f8f6','#0b1812':'#dcebe3','#13201a':'#d0ded6','#d9f2c4':'#24392f','#0c1210':'#2e3d36','#0c1612':'#ffffff','#27312d':'#52645b','#1d4a35':'#4f9a77','#25593f':'#5fb08a','#1e2a3d':'#46607f','#1b2420':'#35433c','#2d3834':'#6a7d73','#3b4a43':'#8da097','#4a5a52':'#8da097','#51615a':'#6d8077','#39FF88':'#0E9F5B','#F2C94C':'#b9830c','#1a0d0d':'#fff1f1','#3a1111':'#ffe3e3','#0c2a1a':'#e7f7ee','#9aa7a3':'#c9d3cf','#8fd1ff':'#1d7fc4','#8fa39a':'#5d6f66','#ff9b9b':'#c44','#ffb0b0':'#b33'};
function svgFor(i,t,theme,o){GID=0;let h=SC[i](t,o);if(theme==='light')h=h.replace(/#[0-9a-fA-F]{6}/g,m=>LT[m]||LT[m.toLowerCase()]||LT[m.toUpperCase()]||m);return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720">${h}</svg>`}


const weights=Array(143).fill(8);
function wrap(h,theme){h=h.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,'').replace(/(\s[\w:-]+)=([A-Za-z0-9#._-]+)(?=[\s/>])/g,'$1="$2"');if(theme==='light')h=h.replace(/#[0-9a-fA-F]{6}/g,m=>LT[m]||LT[m.toLowerCase()]||m);return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 720" width="720" height="720">'+h+'</svg>'}
return {count:SC.length,frame(i,phase=0,wrong=false,theme='dark'){if(!Number.isInteger(i)||i<0||i>=SC.length)throw new RangeError('Unknown scene');GID=0;const t=Number.isFinite(phase)?Math.max(0,Math.min(.999999,phase))*3:0;return wrap(SC[i](t,{wrong:!!wrong,kg:weights,ctl:false,visualOnly:true}),theme)}, primitives:{L,C,R,add,mid,ang,ik,limb,shorts,torso,head,frontHead:fhead,hand,shoe,muscle,guide,bgl,cap,wrap,E,reset(){GID=0}}};
})();
