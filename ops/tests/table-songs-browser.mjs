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
 socket.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});
 const run=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await cdp('Runtime.enable');await cdp('Page.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:'http://127.0.0.1:5173'});
 for(let i=0;i<50;i++){if(await run("!!document.querySelector('[data-game-child]')"))break;await sleep(100);}
 const click=async s=>{for(let i=0;i<50;i++){if(await run(`!!document.querySelector(${JSON.stringify(s)})`))break;await sleep(100);}assert.equal(await run(`!!document.querySelector(${JSON.stringify(s)})`),true,s+' missing; '+JSON.stringify(errors)+'; '+await run('document.body.innerText.slice(0,1800)'));await run(`document.querySelector(${JSON.stringify(s)}).click()`);assert.deepEqual(errors,[]);};

 await click('[data-game-child="1"]');
 await click('[data-action=maths]');await click('[data-action=table-songs]');
 assert.equal(await run("document.querySelector('iframe')===null"),true);
 await click('[data-more]');assert.match(await run("document.querySelector('.table-equation').textContent"),/3 × 3 = 9/);
 await click('[data-start]');
 await run("document.querySelector('#table-answer').value='9';document.querySelector('[data-answer]').requestSubmit()");
 assert.match(await run("document.querySelector('[data-feedback]').textContent"),/Pas encore/);
 await click('[data-help]');
 for(const n of [0,3,6]){await run(`document.querySelector('#table-answer').value='${n}';document.querySelector('[data-answer]').requestSubmit()`);await click('[data-next]');}
 assert.match(await run("document.querySelector('.table-panel').textContent"),/2 réponses sans aide sur 3/);
 const saved=JSON.parse(await run("localStorage.getItem('atelier-mots-v1')"));assert.equal(saved.profiles[1].tableSongPractice[3],1);assert.equal(saved.profiles[0].tableSongPractice,undefined);
 await click('[data-explore]');await click('[data-table="10"]');
 for(let i=0;i<8;i++)await click('[data-more]');
 assert.equal(await run("document.querySelectorAll('.shell-group span').length"),100);
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await click('[data-table="3"]');await click('[data-song]');
 assert.match(await run("document.querySelector('iframe').src"),/youtube-nocookie.com/);
 await run("window.testPlayer=document.querySelector('iframe')");await click('[data-more]');assert.equal(await run("window.testPlayer===document.querySelector('iframe')"),true);
 await click('[data-action=home]');assert.equal(await run("document.querySelector('iframe')===null"),true);
 assert.deepEqual(errors,[]);console.log('Tables browser: groups, quiz, help, profile isolation, mobile layout and player cleanup passed');
}finally{socket?.close();chrome.kill();server.kill();await sleep(150);await rm(temp,{recursive:true,force:true});}
