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
const chrome=spawn(process.env.CHROMIUM_PATH||'/usr/bin/chromium',['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port=9223',`--user-data-dir=${temp}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let chromeError='';chrome.stderr.on('data',chunk=>{chromeError=(chromeError+chunk).slice(-4000)});
let socket;
try{
 let tabs;for(let i=0;i<300;i++){try{tabs=await(await fetch('http://127.0.0.1:9223/json')).json();break;}catch{await sleep(100);}}
 assert.ok(tabs,'Chromium debugging endpoint unavailable: '+chromeError);
 socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});let id=0;const pending=new Map(),errors=[];
 socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Runtime.enable');await cdp('Page.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:5173'});

 const click=async s=>{assert.equal(await run(`!!document.querySelector(${JSON.stringify(s)})`),true,s+' missing; '+JSON.stringify(errors));await run(`document.querySelector(${JSON.stringify(s)}).click()`);assert.deepEqual(errors,[]);};
 for(const child of [0,1]){
  await run('localStorage.clear()');await cdp('Page.reload');
  for(let i=0;i<60;i++){if(await run("!!document.querySelector('[data-game-child]')"))break;await sleep(100);}
  await run(`void Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{name:'Amélie',lang:'fr-CA',voiceURI:'amelie'}],cancel(){},speak(){}}});`);
  await click(`[data-game-child="${child}"]`);await click('[data-action="french"]');await click('[data-scene="reading"]');
  assert.equal(await run("document.body.classList.contains('reading-focus')"),true);
  for(const [width,height] of [[820,1180],[1180,820],[390,844]]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
   assert.equal(await run(`document.documentElement.scrollWidth<=innerWidth`),true);
   for(const selector of ['[data-reading-focus]','[data-action="listen"]','[data-action="silence"]','#reading-speed']){
    assert.equal(await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return r.width>0&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth})()`),true,selector+' must be reachable');
   }
   assert.equal(await run("getComputedStyle(document.querySelector('.guided-text')).maxHeight"),'none');
  }
  await click('[data-reading-focus]');assert.equal(await run("document.body.classList.contains('reading-focus')"),false);
  assert.equal(await run("getComputedStyle(document.querySelector('.choices')).display==='none'"),false);
  await click('[data-reading-focus]');assert.equal(await run("document.body.classList.contains('reading-focus')"),true);
  await click('[data-reading-focus]');await click('[data-action="home"]');assert.equal(await run("document.body.classList.contains('reading-focus')"),false);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: both profiles, portrait/landscape/mobile controls inside viewport, question return, home cleanup; no real audio alignment claimed.');
}finally{socket?.close();chrome.kill('SIGTERM');server.kill('SIGTERM');await sleep(200);await rm(temp,{recursive:true,force:true});}
