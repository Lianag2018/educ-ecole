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
const chrome=spawn(process.env.CHROMIUM_PATH||'/usr/bin/chromium',['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--remote-debugging-port=9224',`--user-data-dir=${temporary}`,'about:blank'],{stdio:'ignore'});
let socket;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
try{
 let tabs;for(let i=0;i<60;i++){try{tabs=await(await fetch('http://127.0.0.1:9224/json')).json();break;}catch{await sleep(100);}}
 assert.ok(tabs,'Chromium required');socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
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
 console.log('Browser: parent reconnection, real fetch, private merge, separate children and tablet layout passed.');
}finally{socket?.close();if(chrome.exitCode===null)await new Promise(r=>{chrome.once('exit',r);chrome.kill();});server.close();await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
