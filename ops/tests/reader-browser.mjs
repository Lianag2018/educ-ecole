// Optional real-browser smoke test. Requires Chromium and Node >=22 (native WebSocket).
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile,mkdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
import {storyCards} from '../../src/learning.js';
const acoustic=JSON.parse(await readFile(new URL('../../src/reading-acoustic-data.json',import.meta.url),'utf8'));
const root=new URL('../..',import.meta.url).pathname;
const temp=await mkdtemp(join(tmpdir(),'atelier-chrome-'));
// Real public narrator audio and its bundled acoustic cues; no paid generation.
const audioClips={},audioAlignments={};await mkdir(join(root,'dist/audio'),{recursive:true});
for(const id of ['p1','p2']){const story=storyCards({id})[0],pair=Object.entries(acoustic.clips).find(([,e])=>e.text===story.text);assert.ok(pair);const [file,entry]=pair;audioClips[story.text]=file;audioAlignments[file]=entry;const response=await fetch('https://educ-ecole.vercel.app/audio/'+file,{signal:AbortSignal.timeout(20000)});assert.ok(response.ok);await writeFile(join(root,'dist/audio',file),Buffer.from(await response.arrayBuffer()));}
await writeFile(join(root,'dist/audio/manifest.json'),JSON.stringify({version:1,clips:audioClips}));
await writeFile(join(root,'dist/audio/alignment.json'),JSON.stringify({version:1,clips:audioAlignments}));
const server=spawn(process.execPath,['ops/server.mjs','dist'],{cwd:root,stdio:'ignore'});
const chrome=spawn(process.env.CHROMIUM_PATH||'/usr/bin/chromium',['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=9223',`--user-data-dir=${temp}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
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
 await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`window.Audio=class extends Audio{constructor(...args){super(...args);window.qaNarrator=this;}}`});
 await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:5173'});

 const click=async s=>{for(let i=0;i<50;i++){if(await run(`!!document.querySelector(${JSON.stringify(s)})`))break;await sleep(100);}assert.equal(await run(`!!document.querySelector(${JSON.stringify(s)})`),true,s+' missing; '+JSON.stringify(errors));await run(`document.querySelector(${JSON.stringify(s)}).click()`);assert.deepEqual(errors,[]);};
 for(const child of [0,1]){
  await run('localStorage.clear()');await cdp('Page.reload');
  for(let i=0;i<60;i++){if(await run("!!document.querySelector('[data-game-child]')"))break;await sleep(100);}
  await run(`void Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[{name:'Amélie',lang:'fr-CA',voiceURI:'amelie'}],cancel(){},speak(){}}});`);
  await click(`[data-game-child="${child}"]`);await click('[data-action="french"]');await click('[data-scene="reading"]');
  assert.equal(await run("document.body.classList.contains('reading-focus')"),true);
  for(const [width,height] of [[820,1180],[1180,820],[390,844]]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
   assert.equal(await run(`document.documentElement.scrollWidth<=innerWidth`),true);
   for(const selector of ['[data-reading-focus]','[data-action="listen"]','[data-action="reading-pause"]','#reading-speed']){
    assert.equal(await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return r.width>0&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth})()`),true,selector+' must be reachable');
   }
   assert.equal(await run("getComputedStyle(document.querySelector('.guided-text')).maxHeight"),'none');
  }
  await click('[data-action="listen"]');
  const trace=[];for(let i=0;i<100;i++){if(i%5===0)trace.push(await run("({time:window.qaNarrator?.currentTime,boxes:[...document.querySelectorAll('.guided-reading')].map(b=>({text:b.dataset.guidedText,timing:b.dataset.timing,key:b.dataset.cueKey,active:b.querySelector('.ball-active')?.textContent}))})"));if(await run("Number(document.querySelector('.ball-active')?.dataset.part)>0"))break;await sleep(100);}
  assert.equal(await run("Number(document.querySelector('.ball-active')?.dataset.part)>0"),true,'second syllable must light up on real audio: '+JSON.stringify(trace)+' '+JSON.stringify(await run("({time:window.qaNarrator?.currentTime,paused:window.qaNarrator?.paused,error:window.qaNarrator?.error?.code,src:window.qaNarrator?.currentSrc,status:document.querySelector('.audio-status')?.textContent,timing:document.querySelector('.guided-reading')?.dataset.timing})")));
  await click('[data-action="reading-pause"]');
  const paint=await run("(()=>{const s=getComputedStyle(document.querySelector('.ball-active'));return {color:s.color,background:s.backgroundColor,shadow:s.boxShadow}})()");
  assert.deepEqual(paint,{color:'rgb(8, 117, 47)',background:'rgba(0, 0, 0, 0)',shadow:'none'},'active syllable uses green letters without a rectangle');
  const paused=await run("window.qaNarrator.currentTime");await sleep(180);assert.equal(await run("window.qaNarrator.currentTime"),paused);
  const sample=await run(`(()=>{const node=document.querySelector('.ball-active');return {time:window.qaNarrator.currentTime,part:Number(node.dataset.part),word:node.closest('[data-cue]').textContent}})()`);
  const entry=audioAlignments[audioClips[storyCards({id:child?'p2':'p1'})[0].text]];
  assert.ok(entry.syllables.some(c=>c.partIndex===sample.part&&entry.text.slice(c.charIndex,c.charEnd)===sample.word&&sample.time>=c.start-.08&&sample.time<c.end+.08),'green syllable must match media time');
  await click('[data-action="reading-pause"]');for(let i=0;i<40;i++){if(await run("window.qaNarrator.currentTime")>paused+.1)break;await sleep(50);}assert.ok(await run("window.qaNarrator.currentTime")>paused+.1);
  await click('[data-reading-focus]');assert.equal(await run("document.body.classList.contains('reading-focus')"),false);
  assert.equal(await run("getComputedStyle(document.querySelector('.choices')).display==='none'"),false);
  await click('[data-reading-focus]');assert.equal(await run("document.body.classList.contains('reading-focus')"),true);
  await click('[data-reading-focus]');await click('[data-action="home"]');assert.equal(await run("document.body.classList.contains('reading-focus')"),false);
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: both profiles, portrait/landscape/mobile controls inside viewport, question return, home cleanup; real narrator syllable cues, pause and resume verified.');
}finally{socket?.close();chrome.kill('SIGTERM');server.kill('SIGTERM');await sleep(200);await rm(temp,{recursive:true,force:true});}
