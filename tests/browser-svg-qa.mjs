// Optional real-browser QA. Run with Playwright installed and Chromium available.
// An isolated in-memory database is used; no external service or user data.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium,devices}=createRequire(import.meta.url)('playwright');
import {createApp} from './local-fixtures.mjs';
import {seedExercises} from '../dist/core/exercise-catalog.js';
import {drawingInfo} from '../dist/core/exercise-drawings.js';
const {server,db}=createApp({dbPath:':memory:'});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.ML_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const configs=[
 {name:'desktop-en-dark',lang:'en',theme:'dark',viewport:{width:1440,height:900}},
 {name:'mobile-ar-light',lang:'ar',theme:'light',...devices['iPhone 13']},
 {name:'tablet-sv-dark',lang:'sv',theme:'dark',viewport:{width:768,height:1024}},
];
const report={configurations:[],roles:[],failures:[],unexpectedRequests:[],pageErrors:[]};
const expected=seedExercises.map(e=>e.id);
async function enter(page,role,config){
 await page.addInitScript(lang=>localStorage.setItem('ml-language',lang),config.lang);
 await page.goto(origin);
 await page.locator(`[data-action="demo"][data-id="${role}"]`).click();
 await page.locator('[data-action="nav"][data-id="trainingPro"]').first().waitFor({state:'attached'});
 await page.evaluate(async theme=>{
  const response=await fetch('/api/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'settings',theme})});
  if(!response.ok)throw new Error('theme setup failed');
 },config.theme);
 await page.reload();
 await page.locator('[data-action="nav"][data-id="trainingPro"]').first().click();
 await page.locator('.training-cards').waitFor();
}
try{
 for(const config of configs){
  const {name,lang,theme,...options}=config;
  const context=await browser.newContext(options);
  const page=await context.newPage();
  page.on('pageerror',e=>report.pageErrors.push([name,e.message]));
  page.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!r.url().startsWith('data:'))report.unexpectedRequests.push([name,r.url()])});
  await enter(page,'admin',config);
  assert.equal(await page.locator('html').getAttribute('lang'),lang);
  assert.equal(await page.locator('html').getAttribute('dir'),lang==='ar'?'rtl':'ltr');
  assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  const rows=[];
  while(true){
   const ids=await page.locator('[data-exercise-drawing]').evaluateAll(els=>els.map(el=>el.dataset.exerciseDrawing));
   assert(ids.length>0);
   // Open all previews on the current page and decode each frame in Chromium.
   await page.locator('[data-exercise-drawing]').evaluateAll(els=>els.forEach(p=>{p.parentElement.closest('details').open=true;p.open=true}));
   await page.waitForFunction(()=>[...document.querySelectorAll('[data-exercise-drawing]')].every(p=>p.querySelector('img').getAttribute('src')||!p.querySelector('[data-drawing-missing]').hidden));
   const result=await page.locator('[data-exercise-drawing]').evaluateAll(async els=>{
    return Promise.all(els.map(async p=>{
     const img=p.querySelector('img'),slider=p.querySelector('[data-drawing-phase]'),controls=p.querySelector('.drawing-controls'),button=p.querySelector('[data-drawing-play]');
     let decoded=true;try{await img.decode()}catch{decoded=false}
     const before=img.src,rect=img.getBoundingClientRect(),panel=p.getBoundingClientRect();
     const base={id:p.dataset.exerciseDrawing,lang:p.dataset.drawingLang,decoded,alt:!!img.alt,visible:!img.hidden&&rect.width>0&&rect.height>0,fit:rect.width<=panel.width+1,static:controls.hidden,wrongHidden:p.querySelector('[data-drawing-wrong-label]').hidden};
     if(!controls.hidden){
      slider.value='50';slider.dispatchEvent(new Event('input',{bubbles:true}));
      try{await img.decode()}catch{decoded=false}
      base.seek=decoded&&img.src!==before; base.paused=button.getAttribute('aria-pressed')==='false';
     }
     return base;
    }));
   });
   for(const r of result){
    const good=r.lang===lang&&r.decoded&&r.alt&&r.visible&&r.fit&&r.wrongHidden&&r.static===drawingInfo(r.id).static&&(r.static||(r.seek&&r.paused));
    rows.push({...r,pass:good});if(!good)report.failures.push([name,r]);
   }
   // Test actual click and playback on one non-static preview per page.
   const active=ids.find(id=>!drawingInfo(id).static);
   if(active){
    const panel=page.locator(`[data-exercise-drawing="${active}"]`);
    const button=panel.locator('[data-drawing-play]');
    const slider=panel.locator('[data-drawing-phase]');
    await button.click();
    await page.waitForFunction(el=>Number(el.value)!==50,await slider.elementHandle());
    await button.click();
    assert.equal(await button.getAttribute('aria-pressed'),'false');
   }
   const over=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
   if(over)report.failures.push([name,'horizontal overflow',ids[0]]);
   const next=page.locator('[data-action="trainingUI"][data-op="page"][data-id="1"]');
   if(!await next.count())break;
   await next.click();
   await page.waitForFunction(first=>document.querySelector('[data-exercise-drawing]')?.dataset.exerciseDrawing!==first,ids[0]);
  }
  assert.deepEqual(rows.map(r=>r.id).sort(),[...expected].sort());
  report.configurations.push({name,total:rows.length,passed:rows.filter(r=>r.pass).length,rows});
  console.log(name,rows.length,rows.filter(r=>r.pass).length);
  await context.close();
 }
 for(const role of ['athlete','coach','gym']){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();await enter(page,role,configs[0]);
  const previews=await page.locator('[data-exercise-drawing]').count();
  const start=await page.request.get(origin+'/api/training-media?exercise=push-up&slot=start');
  report.roles.push({role,previews,draftMediaStatus:start.status(),pass:previews===0&&start.status()===404});
  await context.close();
 }
 const unauth=await fetch(origin+'/api/training-media?exercise=push-up&slot=start');
 const module=await fetch(origin+'/core/exercise-drawings.js');
 report.unauthenticated={draftMediaStatus:unauth.status,staticDrawingModuleStatus:module.status};
 console.log(JSON.stringify({configurations:report.configurations.map(({rows,...x})=>x),roles:report.roles,unauthenticated:report.unauthenticated,failures:report.failures,pageErrors:report.pageErrors,unexpectedRequests:report.unexpectedRequests}));
 if(process.env.ML_QA_REPORT)await import('node:fs/promises').then(fs=>fs.writeFile(process.env.ML_QA_REPORT,JSON.stringify(report,null,2)));
 if(report.failures.length||report.pageErrors.length||report.unexpectedRequests.length||report.roles.some(r=>!r.pass)||unauth.status!==401)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));db.close()}
