import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createApp,demoPassword} from './local-fixtures.mjs';
import {directoryRows,updateDirectoryFilter} from '../dist/core/directory-ui.js';
import {workspacePage,toggleCoachLanguage,resetWorkspace} from '../dist/core/workspace.js';
import {tr,langs} from '../dist/i18n.js';

const btn=(label,action,attrs='')=>`<button data-action="${action}" ${attrs}>${label}</button>`;
const h=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const render=(state,id,lang='en',production=false)=>workspacePage({state,id,production,t:k=>tr(k,lang),h,btn,ic:()=>'',person:p=>`<b>${h(p.name)}</b>`,lang});

test('directory search, OR language selection, verification and account-specific filters',()=>{
  const profiles=[{id:'a',role:'coach',name:'Alice',lang:'en',city:'Kalmar',sport:'Strength',verified:true},{id:'b',role:'coach',name:'Bertil',lang:'sv',spokenLanguages:['sv','ar'],sport:'Running'},{id:'c',role:'athlete',name:'C',lang:'en'},{id:'d',role:'coach',name:'Dave',lang:'en',suspended:true}];
  assert.deepEqual(directoryRows(profiles,'me',['ar','en']).map(x=>x.id),['a','b']);
  assert.deepEqual(directoryRows(profiles,'me',['ar','en'],{query:'KALMAR'}).map(x=>x.id),['a']);
  assert.deepEqual(directoryRows(profiles,'me',[],{verifiedOnly:true}).map(x=>x.id),['a']);
  assert.deepEqual(directoryRows(profiles,'a',[]).map(x=>x.id),['b']);
  resetWorkspace();const state={me:{id:'me',role:'athlete'},profiles};
  assert.match(render(state,'coaches','sv'),/Bertil/);assert(!render(state,'coaches','sv').includes('Alice'));
  toggleCoachLanguage(state,'en','sv');assert.match(render(state,'coaches','sv'),/Alice/);
  updateDirectoryFilter('me',{query:'Running',verifiedOnly:false});assert(!render(state,'coaches','sv').includes('Alice'));
  assert.match(render({...state,me:{id:'other',role:'athlete'}},'coaches','en'),/Alice/);
  resetWorkspace();assert(!render(state,'coaches','sv').includes('Alice'));
  for(const lang of langs){const html=render(state,'about',lang);assert.match(html,/MUSCLIVO LIVE/);assert.match(html,/\/privacy\?lang=/);assert(!html.includes('aboutIntro'));assert.equal(render(state,'about',lang,true),'');assert.equal(render(state,'coaches',lang,true),'')}
});

test('directory integration respects profile visibility, blocking and verified consent',async()=>{
  const {server,db}=createApp({dbPath:':memory:'});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const req=async(path,body,cookie)=>{const r=await fetch(url+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}};
  const login=role=>req('/api/auth',{mode:'login',email:role+'@demo.local',password:demoPassword});
  const act=(u,type,b)=>req('/api/action',{type,...b},u.cookie),view=u=>req('/api/state',null,u.cookie);
  try{
    assert.equal((await fetch(url+'/core/directory-ui.js')).status,200);
    const [member,coach]=await Promise.all(['athlete','coach'].map(login));
    await act(coach,'profile',{spokenLanguages:['ar','sv'],bio:'<script>private test</script>'});
    let state=(await view(member)).data;
    const row=state.profiles.find(p=>p.id==='demo-coach');assert(row);assert.equal(row.email,undefined);
    const html=render(state,'coaches','ar');assert.match(html,/Coach Adam/);assert.match(html,/data-form="coachingInvite"/);assert(!html.includes('<script>'));assert(!html.includes('coach@demo.local'));
    await act(coach,'settings',{profile:'private'});state=(await view(member)).data;
    assert(!state.profiles.some(p=>p.id==='demo-coach'));assert(!render(state,'coaches','ar').includes('Coach Adam'));
    assert.equal((await act(member,'coaching',{operation:'invite',target:'demo-coach'})).status,404);
    await act(coach,'settings',{profile:'everyone'});assert.match(render((await view(member)).data,'coaches','ar'),/Coach Adam/);
    assert.equal((await act(member,'coaching',{operation:'invite',target:'demo-coach'})).status,200);
    assert(!render((await view(member)).data,'coaches','ar').includes('data-form="coachingInvite"><input type="hidden" name="target" value="demo-coach"'));
    await act(member,'block',{target:'demo-coach',blocked:true});assert(!render((await view(member)).data,'coaches','ar').includes('Coach Adam'));
  }finally{await new Promise(resolve=>server.close(resolve));db.close()}
});
