// Draft preview, only inserted into the administrator's local exercise card.
const known=new WeakMap();
let engine;
const load=()=>engine??=import('./exercise-drawings.js');
const ui={
 ar:{title:'معاينة الرسم المتحرك (مسودة)',note:'رسم تجريبي غير معتمد لتعليم الحركة. يحتاج مراجعة مختص قبل النشر.',play:'تشغيل',pause:'إيقاف',time:'مرحلة الحركة',wrong:'عرض الخطأ (إن توفر)',none:'لا يوجد رسم لهذا التمرين'},
 en:{title:'Animated SVG preview (draft)',note:'Unapproved artwork draft. Specialist review required before publication.',play:'Play',pause:'Pause',time:'Movement phase',wrong:'Show error (if available)',none:'No drawing for this exercise'},
 sv:{title:'Animerad SVG-förhandsvisning (utkast)',note:'Illustrationsutkast, ej godkänt. Granskning krävs före publicering.',play:'Spela',pause:'Pausa',time:'Rörelsefas',wrong:'Visa fel (om tillgängligt)',none:'Ingen illustration för övningen'}
};
export function drawingPreview(h,id,lang,name){
  const l=ui[lang]||ui.en;
  return `<details class="training-drawing" data-exercise-drawing="${h(id)}" data-drawing-lang="${h(lang)}"><summary>${l.title}</summary><div class="stack"><p class="notice">${l.note}</p><img alt="${h(name)}" hidden><div class="drawing-controls" hidden><button type="button" class="secondary" data-drawing-play aria-pressed="false">${l.play}</button><label>${l.time}<input type="range" min="0" max="99" value="0" data-drawing-phase></label><label class="check-row" data-drawing-wrong-label hidden><input type="checkbox" data-drawing-wrong>${l.wrong}</label></div><p data-drawing-missing hidden>${l.none}</p></div></details>`;
}
export function bindDrawingPreviews(doc){
  if(known.has(doc))return;known.set(doc,true);
  const states=new WeakMap();
  function stop(panel,s){s.running=false;if(s.raf)cancelAnimationFrame(s.raf);s.raf=null;const b=panel.querySelector('[data-drawing-play]');b.textContent=s.l.play;b.setAttribute('aria-pressed','false')}
  function frame(panel,s){const svg=s.engine.drawingFrame(panel.dataset.exerciseDrawing,s.phase,s.wrong,doc.documentElement.dataset.theme);if(svg)panel.querySelector('img').src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)}
  doc.addEventListener('toggle',async e=>{
    const panel=e.target;if(!panel.matches?.('[data-exercise-drawing]'))return;
    const old=states.get(panel);
    if(!panel.open){if(old)stop(panel,old);return}
    if(old){frame(panel,old);return}
    const mod=await load();if(!panel.open||!panel.isConnected||states.has(panel))return;
    const info=mod.drawingInfo(panel.dataset.exerciseDrawing);if(!info){panel.querySelector('[data-drawing-missing]').hidden=false;return}
    const s={engine:mod,l:ui[panel.dataset.drawingLang]||ui.en,phase:0,wrong:false,running:false};states.set(panel,s);
    panel.querySelector('img').hidden=false;panel.querySelector('.drawing-controls').hidden=info.static;
    panel.querySelector('[data-drawing-wrong-label]').hidden=!info.wrongMode;frame(panel,s);
  },true);
  doc.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-drawing-play]');if(!b)return;
    const panel=b.closest('[data-exercise-drawing]'),s=states.get(panel);if(!s)return;
    if(s.running){stop(panel,s);return}
    s.running=true;b.textContent=s.l.pause;b.setAttribute('aria-pressed','true');
    let last=0;
    const tick=now=>{if(!s.running||!panel.open||!panel.isConnected||doc.hidden){stop(panel,s);return}if(now-last>=100){s.phase=(s.phase+.033)%1;last=now;panel.querySelector('[data-drawing-phase]').value=Math.round(s.phase*99);frame(panel,s)}s.raf=requestAnimationFrame(tick)};
    s.raf=requestAnimationFrame(tick);
  });
  doc.addEventListener('input',e=>{const control=e.target,panel=control.closest?.('[data-exercise-drawing]'),s=states.get(panel);if(!s)return;if(control.matches('[data-drawing-phase]')){stop(panel,s);s.phase=Number(control.value)/100;frame(panel,s)}if(control.matches('[data-drawing-wrong]')){s.wrong=control.checked;frame(panel,s)}});
}
