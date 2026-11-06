// Real DOM + native browser fetch. All API responses are synthetic, local only.
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(new URL('../..',import.meta.url).pathname),day=new Date().toISOString().slice(0,10);
const event=(result)=>({syncId:randomUUID(),id:'synthetic-card',skill:'mots',subject:'Français',day,result,activityLevel:1});
const records={p1:[event('help')],p2:[event('correct')]};let authenticated=false;
const uploaded=[],errors=[];
const server=createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/')){
  let body='';for await(const chunk of req)body+=chunk;
  const b=JSON.parse(body||'{}');res.setHeader('Content-Type','application/json');
  if(path.startsWith('/api/learning')&&!authenticated){res.writeHead(401);res.end(JSON.stringify({code:'parent_login_required'}));return;}
  if(path==='/api/learning/sync'){
   uploaded.push(b);for(const e of b.events)if(!records[b.profileId].some(x=>x.syncId===e.syncId))records[b.profileId].push(e);
   res.end(JSON.stringify({events:records[b.profileId].slice(b.after),accepted:b.events.map(e=>e.syncId),cursor:records[b.profileId].length,more:false,autoAvailable:true,advice:{priorities:['mots'],strategy:'short_practice',asOf:day,revision:1}}));return;
  }
  if(path==='/api/learning/evolve'){res.end('{"result":"idle"}');return;}
  if(path==='/api/plans/list'){res.end('{"plans":[]}');return;}
  if(path==='/api/voice/grok/status'){res.end(JSON.stringify({available:true,authenticated}));return;}
  if(path==='/api/voice/status'){res.end('{"available":false,"authenticated":false}');return;}
  res.writeHead(401);res.end('{"code":"parent_login_required"}');return;
 }
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));
 if(!file.startsWith(root+'/'))throw Error('path');
 const type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png'}[extname(file)]||'application/octet-stream';
 res.setHeader('Content-Type',type);res.end(await readFile(file));
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const temporary=await mkdtemp(join(tmpdir(),'educ-learning-browser-'));
const chrome=spawn(process.env.CHROMIUM_PATH||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${temporary}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let launchError='',diagnostic='';chrome.on('error',e=>{launchError=e.code;});chrome.stderr.on('data',chunk=>{diagnostic=(diagnostic+chunk).slice(-1500);});
let socket;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 let tabs;for(let i=0;i<300&&!launchError;i++){try{const port=(await readFile(join(temporary,'DevToolsActivePort'),'utf8')).split('\n')[0];tabs=await(await fetch(`http://127.0.0.1:${port}/json`,{signal:AbortSignal.timeout(1000)})).json();if(tabs.some(t=>t.type==='page'))break;}catch{}await sleep(100);}
 assert.ok(tabs?.some(t=>t.type==='page'),'Chromium startup failed: '+launchError+' '+diagnostic);socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 let id=0;const pending=new Map();socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error('CDP failed')):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async expression=>{for(let i=0;i<80;i++){if(await run(expression))return;await sleep(100);}throw Error('Browser condition timed out: '+expression);};
 const click=s=>run(`document.querySelector(${JSON.stringify(s)}).click()`);
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}`});await until('!!document.querySelector("[data-action=parent]")');
 await run(`(()=>{const s=JSON.parse(localStorage.getItem('atelier-mots-v1'));s.profiles[0].name='PRIVATE_NAME';s.profiles[0].history.push(${JSON.stringify(event('correct'))});localStorage.setItem('atelier-mots-v1',JSON.stringify(s));})()`);
 await cdp('Page.reload');await until('!!document.querySelector("[data-action=parent]")');
 await click('[data-action=parent]');await click('[data-parent-section=progress]');await click('#learning-enable');
 await until('document.querySelector("#learning-sync-status").textContent.includes("Reconnecte")');
 authenticated=true;await click('#learning-enable');await until('document.querySelector("#learning-sync-status").textContent.includes("Réponses sauvegardées")');
 let state=JSON.parse(await run('localStorage.getItem("atelier-mots-v1")'));
 assert.equal(state.profiles[0].history.length,2);assert.equal(state.profiles[0].records['synthetic-card'].result,'help');assert.equal(state.profiles[1].history.length,0);
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await run(`document.querySelector('#profile').value='p2';document.querySelector('#profile').dispatchEvent(new Event('change'));`);await click('#learning-enable');
 await until('document.querySelector("#learning-sync-status").textContent.includes("Réponses sauvegardées")');
 state=JSON.parse(await run('localStorage.getItem("atelier-mots-v1")'));assert.equal(state.profiles[1].history.length,1);assert.equal(state.profiles[1].records['synthetic-card'].result,'correct');
 assert.ok(!JSON.stringify(uploaded).includes('PRIVATE_NAME'));assert.deepEqual(errors,[]);
 // Illustrated welcome actions and honest unauthenticated voice state.
 for(const width of [390,820]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height:1180,deviceScaleFactor:1,mobile:true});
  for(const profileId of ['p1','p2']){
   authenticated=false;
   await click('[data-action=home]');
   await run(`document.querySelector('#profile').value='${profileId}';document.querySelector('#profile').dispatchEvent(new Event('change'));`);
   await cdp('Page.reload');await until('!!document.querySelector("[data-welcome-voice=owl]")');
   for(const selector of ['.picture-owl','.picture-number-task','.picture-number-listen','.picture-number-mic']){
    assert.equal(await run(`(()=>{const el=document.querySelector('${selector}');el.scrollIntoView();const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;})()`),true);
   }
   await click('[data-welcome-voice=owl]');
   await until('document.querySelector("[data-grok-state]")?.textContent.includes("Connexion parent requise")');
   assert.equal(await run('document.querySelector("[data-grok-start]").disabled'),true);
   await click('[data-grok-parent]');
   assert.equal(await run('!document.querySelector("#parent-settings").hidden && !!document.querySelector("#parent-settings input[type=password]")'),true);
   authenticated=true;
   await cdp('Page.reload');await until('!!document.querySelector("[data-welcome-voice=owl]")');
   await click('[data-welcome-voice=owl]');await until('document.querySelector("[data-grok-start]")?.disabled===false');
   assert.equal(await run('document.querySelector("[data-grok-parent]").hidden'),true);
   for(const selector of ['.picture-number-task','.picture-number-mic']){
    await cdp('Page.reload');await until('!!document.querySelector("[data-welcome-voice=owl]")');
    await click(selector);await until('!!document.querySelector("[data-grok-mode=number]")');
    assert.equal(await run('Number(document.querySelector("#chosen-number").value)'),profileId==='p1'?7:307);
    await until('document.querySelector("[data-grok-start]")?.disabled===false');
   }
  }
 }
 assert.deepEqual(errors,[]);
 // Real button wiring, synthetic capture/transport only: no microphone or xAI.
 await run(`(async()=>{
  const {grokLive}=await import('/src/grok-live.js');
  window.voiceStartProof={requests:0,tracksStopped:0,transportClosed:0};
  grokLive.prepareAudio=()=>({resumed:Promise.resolve(),close(){}});
  grokLive.microphone=()=>Promise.reject(new DOMException('synthetic refusal','NotAllowedError'));
  grokLive.request=async()=>{window.voiceStartProof.requests++;return {ok:true,json:async()=>({durationSeconds:120})};};
  grokLive.connect=async()=>({close(){window.voiceStartProof.transportClosed++;}});
 })()`);
 await click('[data-grok-start]');await until('document.querySelector("[data-grok-state]").textContent.includes("accès au microphone a été refusé")');
 assert.equal(await run('window.voiceStartProof.requests'),0);
 await run(`(async()=>{const {grokLive}=await import('/src/grok-live.js');grokLive.microphone=async()=>({getTracks:()=>[{stop(){window.voiceStartProof.tracksStopped++;}}]});})()`);
 await click('[data-grok-start]');await until('document.querySelector("[data-grok-state]").textContent.includes("Je t’écoute")');
 assert.equal(await run('window.voiceStartProof.requests'),1);
 await click('[data-grok-stop]');
 assert.equal(await run('window.voiceStartProof.tracksStopped'),1);assert.equal(await run('window.voiceStartProof.transportClosed'),1);
 await run(`(async()=>{const {grokLive}=await import('/src/grok-live.js');grokLive.request=async()=>({ok:false,json:async()=>({code:'parent_login_required'})});})()`);
 await click('[data-grok-start]');await until('document.querySelector("[data-grok-state]").textContent.includes("connexion parent a expiré")');
 assert.equal(await run('document.querySelector("[data-grok-parent]").hidden'),false);
 assert.equal(await run('document.querySelector("[data-grok-start]").disabled'),true);
 assert.equal(await run('window.voiceStartProof.tracksStopped'),2);
 await cdp('Page.reload');await until('!!document.querySelector("[data-action=parent]")');
 for(const profileId of ['p1','p2']){
  const review=await run(`(async()=>{
   const {reviewPlanDraft}=await import('/src/plan-review.js');
   const root=document.createElement('div');document.body.append(root);
   const controller=new AbortController(),calls=[];
   const preview={profileId:'${profileId}',week:'2026-11-02',tasks:[{subject:'Français',topic:'<img src=x onerror=alert(1)>',instruction:'Lire',words:['chat'],tables:[],operations:[],missing:false}]};
   const pending=reviewPlanDraft(root,{preview,draft:'synthetic-token'},{profileId:'${profileId}',signal:controller.signal,request:async(path,body)=>{calls.push({path,body});return {plan:preview};}});
   const before=calls.length,escaped=!root.querySelector('img')&&root.textContent.includes('<img');
   root.querySelector('[data-review-approve]').click();
   root.querySelector('[data-review-approve]')?.click();
   const approved=await pending;
   const cancelled=reviewPlanDraft(root,{preview,draft:'synthetic-token'},{profileId:'${profileId}',signal:controller.signal,request:async()=>{throw Error('must not call');}}).then(()=>null,e=>e.message);
   root.querySelector('[data-review-cancel]').click();const cancelledCode=await cancelled;
   const abandoned=reviewPlanDraft(root,{preview,draft:'synthetic-token'},{profileId:'${profileId}',signal:controller.signal,request:async()=>{throw Error('must not call');}}).then(()=>null,e=>e.message);
   controller.abort();const abortedCode=await abandoned,cleared=root.textContent==='';root.remove();
   return {before,escaped,calls,profile:approved.profileId,cancelledCode,abortedCode,cleared};
  })()`);
  assert.equal(review.before,0);assert.equal(review.escaped,true);assert.equal(review.calls.length,1);
  assert.equal(review.calls[0].path,'/api/plans/approve');assert.equal(review.calls[0].body.profileId,profileId);
  assert.equal(review.profile,profileId);assert.equal(review.cancelledCode,'draft_cancelled');assert.equal(review.abortedCode,'aborted');assert.equal(review.cleared,true);
 }
 // Password recovery UI: synthetic token only, no real email or password change.
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/recovery.html`});
 await until('!!document.querySelector("#request-recovery")');
 assert.equal(await run('document.querySelector("#reset-password").hidden'),true);
 await run(`window.__calls=[];window.fetch=async(path,options)=>{window.__calls.push({path,body:JSON.parse(options.body)});return {ok:true,json:async()=>({ok:true})};};document.querySelector('#request-recovery input').value='synthetic@example.test';document.querySelector('#request-recovery').requestSubmit();`);
 await until('document.querySelector("#recovery-status").textContent.includes("Si ce courriel")');
 assert.equal(await run('window.__calls[0].path'),'/api/parent/recover');
 await run(`window.__calls=[];window.fetch=async()=>{window.__calls.push('recover');return {ok:false,json:async()=>({code:'recovery_rate_limited'})};};document.querySelector('#request-recovery').requestSubmit();`);
 await until('document.querySelector("#recovery-status").textContent.includes("limite temporaire")');
 assert.equal(await run('window.__calls.length'),1);
 assert.match(await run('document.querySelector("#recovery-status").textContent'),/Aucun nouveau lien.*une heure/);
 assert.doesNotMatch(await run('document.querySelector("#recovery-status").textContent'),/quelques minutes/);
 await run(`window.fetch=async()=>{throw Error('offline')};document.querySelector('#request-recovery').requestSubmit();`);
 await until('document.querySelector("#recovery-status").textContent.includes("Aucun envoi n’a pu être confirmé")');
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/recovery.html?reset=1#type=recovery&access_token=synthetic.token.signature`});
 await until('!!document.querySelector("#reset-password") && !document.querySelector("#reset-password").hidden');
 assert.equal(await run('location.hash'),'');
 await run(`window.__calls=[];window.fetch=async(path,options)=>{window.__calls.push({path,body:JSON.parse(options.body)});return {ok:true,json:async()=>({ok:true})};};const f=document.querySelector('#reset-password');f.elements.password.value='synthetic-long-password';f.elements.confirmation.value='different';f.requestSubmit();`);
 assert.equal(await run('window.__calls.length'),0);
 assert.match(await run('document.querySelector("#recovery-status").textContent'),/identiques/);
 await run(`(()=>{const f=document.querySelector('#reset-password');f.elements.confirmation.value=f.elements.password.value;f.requestSubmit();})()`);
 await until('document.querySelector("#recovery-status").textContent.includes("Mot de passe renouvelé")');
 assert.equal(await run('window.__calls[0].path'),'/api/parent/reset-password');
 assert.equal(await run('document.querySelector("#reset-password input").value'),'');
 console.log('Browser: parent reconnection, real fetch, private merge, separate children and tablet layout passed.');
}finally{socket?.close();if(chrome.pid&&chrome.exitCode===null)await new Promise(r=>{chrome.once('exit',r);chrome.kill();});server.close();await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
