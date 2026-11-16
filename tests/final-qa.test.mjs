import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createApp,demoPassword} from './local-fixtures.mjs';
import ar from '../dist/languages/ar.js';
import en from '../dist/languages/en.js';
import sv from '../dist/languages/sv.js';
import {tr,langs} from '../dist/i18n.js';
import {modules,allowedModules} from '../dist/core/modules.js';
import {workspaceRole} from '../dist/core/identity-ui.js';
import {workspacePage} from '../dist/core/workspace.js';
import {hasUnsavedForm} from '../dist/core/disclosures.js';

const dist=new URL('../dist/',import.meta.url);
const core=readdirSync(new URL('core/',dist)).filter(x=>x.endsWith('.js')).map(x=>'core/'+x);
const styles=readdirSync(new URL('styles/',dist)).filter(x=>x.endsWith('.css')).map(x=>'styles/'+x);
const ordinary=['app.js','i18n.js','policy.js','app.css',...langs.map(l=>'languages/'+l+'.js'),...core,...styles];
const draftFiles=new Set(['xdraw-engine','exercise-drawing-new','exercise-drawings','exercise-kinematics','exercise-drawing-corrections','exercise-drawing-legacy-tracks','exercise-drawing-anatomy','exercise-apparatus'].map(x=>'core/'+x+'.js'));
const h=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('all language dictionaries have exact key parity and every literal UI translation exists',()=>{
  const expected=Object.keys(en).sort();
  for(const lang of [ar,en,sv]){assert.deepEqual(Object.keys(lang).sort(),expected);assert(Object.values(lang).every(v=>typeof v==='string'&&v.trim().length>0))}
  for(const path of ['app.js',...core]){
    const data=readFileSync(new URL(path,dist),'utf8');
    for(const match of data.matchAll(/\bt\(['"]([A-Za-z0-9_]+)['"]\)/g))assert(Object.hasOwn(en,match[1]),`${path}: missing ${match[1]}`);
    for(const match of data.matchAll(/(?:from\s*|import\s*\()\s*['"](\.\.?\/[^'"]+)['"]/g))assert.doesNotThrow(()=>readFileSync(new URL(match[1],new URL(path,dist))),`${path}: missing import ${match[1]}`);
  }
});

test('background refresh detects unsaved text, checkbox, selection and file input',()=>{
  const input={tagName:'INPUT',name:'title',type:'text',value:'A',defaultValue:'A'};
  const check={tagName:'INPUT',name:'confirmed',type:'checkbox',checked:false,defaultChecked:false};
  const select={tagName:'SELECT',name:'role',multiple:false,options:[{selected:true,defaultSelected:false},{selected:false,defaultSelected:false}]};
  const file={tagName:'INPUT',name:'upload',type:'file',files:[]};
  const root={querySelectorAll:()=>[{elements:[input,check,select,file]}]};
  assert(!hasUnsavedForm(root));input.value='B';assert(hasUnsavedForm(root));input.value='A';check.checked=true;assert(hasUnsavedForm(root));check.checked=false;
  select.options[0].selected=false;select.options[1].selected=true;assert(hasUnsavedForm(root));select.options[0].selected=true;select.options[1].selected=false;
  file.files=[{}];assert(hasUnsavedForm(root));file.files=[];assert(!hasUnsavedForm(root));assert(!hasUnsavedForm(null));
});

test('every static asset is served and all allowed workspace pages render in three languages',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const switchTo=(u,context)=>req('/api/action',{type:'identity',operation:'switch',context},u.cookie);
  const render=(state,id,lang,production=false)=>workspacePage({state,id,lang,production,t:k=>tr(k,lang),h,ic:()=>'',btn:(label,action,attrs='')=>`<button data-action="${action}" ${attrs}>${h(label)}</button>`,person:p=>`<span>${h(p.name)}</span>`});
  try{
    const [admin,member,coach,gym,sara]=await Promise.all(['admin','athlete','coach','gym','sara'].map(login));
    for(const file of ordinary){const protectedFile=draftFiles.has(file),anon=await fetch(base+'/'+file);assert.equal(anon.status,protectedFile?403:200,file);if(protectedFile)assert.equal((await fetch(base+'/'+file,{headers:{Cookie:admin.cookie}})).status,200,file);else assert.equal(anon.headers.get('content-type').includes(file.endsWith('.css')?'text/css':'text/javascript'),true,file);await anon.arrayBuffer()}
    for(const path of ['/','/privacy','/terms','/logo.svg','/robots.txt']){const response=await fetch(base+path);assert.equal(response.status,200,path);await response.arrayBuffer()}
    const states=[admin.data,member.data,coach.data,gym.data,sara.data];
    for(const [u,c] of [[admin,'personal:superAdmin'],[coach,'personal:coach'],[coach,'club-iron:coach'],[member,'club-iron:member'],[sara,'club-iron:accountant'],[sara,'club-north:clubOwner']]){const x=await switchTo(u,c);assert.equal(x.status,200,c);states.push(x.data)}
    let pages=0;
    for(const state of states)for(const lang of langs){
      const role=workspaceRole(state),allowed=allowedModules(role).map(m=>m.id);
      assert.match(render(state,'workspace',lang),/workspace-grid/);assert.equal(render(state,'workspace',lang,true),'');
      for(const m of modules){const html=render(state,m.id,lang);if(!allowed.includes(m.id)){assert.equal(html,'',`${role}/${m.id}`);continue}assert(html.length>30,`${role}/${m.id}/${lang}`);assert(!/\b(?:undefined|NaN)(?=[<"\s])/.test(html),`${role}/${m.id}/${lang}: invalid rendered value`);assert.equal(render(state,m.id,lang,true),'');pages++}
    }
    assert(pages>=350,`Only ${pages} pages rendered`);
    console.log(`Final QA: ${pages} module views in ${states.length} authenticated snapshots and ${langs.length} languages; ${ordinary.length+5} static routes.`);
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
