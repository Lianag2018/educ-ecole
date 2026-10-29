// Real DOM + native browser fetch. All API responses are synthetic, local only.
import {createServer} from 'node:http';
import {readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
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
 res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; media-src 'self' blob: https://pedagofa.cssdm.gouv.qc.ca; connect-src 'self'");
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
 const click=async s=>{await until(`!!document.querySelector(${JSON.stringify(s)})`);if(s.includes('data-game-child'))await until(`typeof document.querySelector(${JSON.stringify(s)}).onclick==='function'`);return run(`document.querySelector(${JSON.stringify(s)}).click()`);};
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:1,mobile:true});
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}`});await until('!!document.querySelector("[data-game-child]")');

 await click('[data-game-child="0"]');await click('[data-action=daily-start]');
 const state=()=>run("JSON.parse(localStorage.getItem('atelier-mots-v1'))");
 const finish=async count=>{for(let i=0;i<count;i++){await until('!!document.querySelector("[data-choice]")');await click('[data-choice]');await run("document.querySelector('[data-action=pause-next]')?.click()");await click('[data-action=next]');}};
 const first=(await state()).profiles[0].dailyAdventure.items.map(q=>q.id);
 await finish(3);await until('!!document.querySelector("[data-action=daily-more]")');await click('[data-action=daily-more]');
 const second=(await state()).profiles[0].dailyAdventure.items.map(q=>q.id);assert.ok(second.every(id=>!first.includes(id)));
 await finish(1);await cdp('Page.reload');await until('!!document.querySelector("[data-game-child]")');await click('[data-game-child="0"]');await click('[data-action=daily-start]');
 assert.equal((await state()).profiles[0].dailyAdventure.index,1);assert.deepEqual((await state()).profiles[0].dailyAdventure.items.map(q=>q.id),second);
 await click('[data-action=home]');await click('[data-action=choose-child]');await click('[data-game-child="1"]');await click('[data-action=french]');await click('[data-scene=syllables]');
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await run("[...document.querySelectorAll('[data-choice]')].every(b=>b.scrollWidth<=b.clientWidth+1)"),true);
 assert.equal(await run('document.documentElement.scrollWidth<=document.documentElement.clientWidth'),true);
 const texts=[];for(let i=0;i<6;i++){texts.push(await run("document.querySelector('.lesson-text').innerText"));await finish(1);}
 await until('!!document.querySelector("[data-action=practice-more]")');await click('[data-action=practice-more]');
 assert.ok(!texts.includes(await run("document.querySelector('.lesson-text').innerText")));
 assert.equal((await state()).profiles[0].history.length,4);assert.equal((await state()).profiles[1].history.length,6);
 assert.deepEqual(errors,[]);console.log('PASS: new daily series, reload mid-series, separate profiles, six-question batches and uncropped mobile choices.');
}finally{socket?.close();chrome.kill('SIGTERM');server.close();await sleep(500);await rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
