// Optional real-browser smoke test. Requires Chromium and Node >=22 (native WebSocket).
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const root=new URL('../..',import.meta.url).pathname;
const temp=await mkdtemp(join(tmpdir(),'atelier-chrome-'));
const server=spawn(process.execPath,['ops/server.mjs','dist'],{cwd:root,stdio:'ignore'});
const chrome=spawn(process.env.CHROMIUM_PATH||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port=9223',`--user-data-dir=${temp}`,'about:blank'],{stdio:'ignore'});
let socket;
try{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9223/json')).json();break;}catch{await sleep(100);}}
 assert.ok(tabs,'Chromium debugging endpoint unavailable');
 socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});let id=0;const pending=new Map(),errors=[];
 socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Runtime.enable');await cdp('Page.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:5173'});
 for(let i=0;i<50;i++){if(await run("!!document.querySelector('[data-scene=start]')"))break;await sleep(100);}
 const click=s=>run(`document.querySelector(${JSON.stringify(s)}).click()`);
 assert.match(await run('document.title'),/Atelier/);
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await click('[data-scene=start]');await click('[data-choice="1"]');
 assert.match(await run("document.querySelector('.feedback').textContent"),/apprend/);
 await click('[data-action=next]');await click('[data-action=help]');
 assert.match(await run("document.querySelector('.tutor').textContent"),/tour d’essayer/);
 assert.equal(await run("document.querySelector('.feedback')===null"),true);
 await click('[data-action=help]');
 assert.match(await run("document.querySelector('.feedback').textContent"),/aide/);
 await click('[data-action=next]');await click('[data-choice="1"]');
 let saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));
 assert.deepEqual(saved.profiles[0].history.map(h=>h.result),['incorrect','help','correct']);
 assert.equal(saved.profiles[1].history.length,0);
 await run("document.querySelector('#profile').value='p2';document.querySelector('#profile').dispatchEvent(new Event('change'))");
 assert.match(await run('document.querySelector(".scene-note").textContent'),/Lectrice 2/);
 await cdp('Page.reload');await sleep(200);
 assert.match(await run('document.querySelector(".scene-note").textContent'),/Lectrice 2/);
 await click('[data-action=parent]');await run("document.querySelector('#name').value='Petite fleur';document.querySelector('#rename').requestSubmit()");
 await run("document.querySelector('#school').value='bateau neige';document.querySelector('#generate').requestSubmit()");
 assert.match(await run("document.querySelector('.preview').textContent"),/bateau/);
 await click('[data-action=assign]');
 saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));assert.equal(saved.profiles[0].assignments.length,0);assert.equal(saved.profiles[1].assignments.length,2);assert.equal(saved.profiles[1].name,'Petite fleur');
 await click('[data-action=home]');await click('[data-scene=start][data-child="1"]');
 for(let i=0;i<6;i++){await click('[data-choice="0"]');await click('[data-action=next]');}
 assert.match(await run('document.querySelector("h1").textContent'),/Bravo/);
 await click('[data-action=home]');await click('[data-scene=start][data-child="1"]');
 assert.match(await run("document.querySelector('.reading').textContent"),/./);
 // Switching or leaving the exercise must stop all microphone tracks.
 await run(`window.__stopped=0;window.__requests=0;Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{window.__requests++;return {getTracks:()=>[{stop:()=>window.__stopped++}]}}},configurable:true});window.MediaRecorder=class {constructor(){this.state='inactive';this.mimeType='audio/webm'}start(){this.state='recording'}stop(){this.state='inactive';this.onstop?.()}};`);
 assert.equal(await run('window.__requests'),0);
 await click('[data-action=record]');await sleep(50);assert.equal(await run('window.__requests'),1);
 await click('[data-action=home]');assert.ok(await run('window.__stopped>0'));
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await run("window.confirm=()=>true");await click('[data-action=parent]');await click('[data-action=reset-profile]');
 saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));assert.equal(saved.profiles[1].history.length,0);assert.equal(saved.profiles[0].history.length,3);
 await click('[data-action=reset-all]');saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));assert.ok(saved.profiles.every(p=>p.history.length===0));
 // Garden interactions; runs only when a real Chromium endpoint is available.
 await click('[data-action=home]');
 assert.equal(await run("document.querySelectorAll('[data-subject]').length"),4);
 await click('[data-subject="1"]');
 assert.match(await run("document.querySelector('.reading').textContent"),/chat/);
 await click('[data-action=help]');await click('[data-choice="0"]');
 saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));
 assert.equal(saved.profiles[0].history.at(-1).result,'help');
 await click('[data-action=retry]');await click('[data-choice="0"]');
 await click('[data-action=home]');await click('[data-action=numbers]');
 await run("document.querySelector('#number-row').value='D';document.querySelector('#number-row').dispatchEvent(new Event('change'))");
 await click('[data-action=row-mode]');
 assert.match(await run("document.querySelector('.reading').textContent"),/176 · 97 · 287/);
 await click('[data-action=row-retry]');
 assert.match(await run("document.querySelector('[role=status]').textContent"),/./);
 await click('[data-action=home]');await click('[data-subject="3"]');
 assert.match(await run("document.querySelector('.reading').textContent"),/quartier imaginaire/);
 await click('[data-action=home]');
 await run("document.querySelector('.storybook-art').decode()");
 assert.equal(await run("document.querySelector('.storybook-art').naturalWidth>0"),true);
 for(const kind of ['sounds','syllables','reading','numbers','talk']){
  await click(`[data-scene="${kind}"]`);
  assert.ok(await run("!!document.querySelector('.reading')"));
  if(kind==='numbers')assert.equal(await run("document.querySelector('.reading').textContent"),'307');
  if(kind==='talk')assert.ok(await run("!!document.querySelector('#conversation-state')"));
  await click('[data-action=home]');
 }
 assert.deepEqual(errors,[]);
 if(process.env.SCREENSHOT){await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});const pic=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(process.env.SCREENSHOT,Buffer.from(pic.data,'base64'));}
 console.log('PASS: production browser flow, correct/incorrect/help, reload, profile isolation, parent review/assignment, full calibration, mic gesture/cleanup, profile/all reset, tablet/mobile layout, no runtime exceptions.');
}finally{socket?.close();chrome.kill('SIGTERM');server.kill('SIGTERM');await sleep(200);await rm(temp,{recursive:true,force:true});}
