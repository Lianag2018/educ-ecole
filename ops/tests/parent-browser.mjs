// Real DOM + native browser fetch. All API responses are synthetic, local only.
import {createServer} from 'node:http';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve,extname} from 'node:path';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(new URL('../..',import.meta.url).pathname),errors=[],received=[];
let parent=false,device=false;
const server=createServer(async(req,res)=>{try{
 const path=new URL(req.url,'http://localhost').pathname;
 if(path.startsWith('/api/')){
  let raw='';for await(const chunk of req)raw+=chunk;const body=JSON.parse(raw||'{}');received.push({path,body});
  res.setHeader('Content-Type','application/json');
  const reply=(data,status=200)=>{res.writeHead(status);res.end(JSON.stringify(data));};
  if(path==='/api/parent/activate'){parent=true;device=body.rememberDevice;return reply({ok:true,deviceEnabled:device});}
  if(path==='/api/parent/login'){parent=true;return reply({ok:true});}
  if(path==='/api/parent/logout'){parent=false;return reply({ok:true});}
  if(path==='/api/voice/status')return reply({authenticated:parent,authConfigured:true,available:false});
  if(path==='/api/parent/device/status')return reply({enabled:device});
  if(path==='/api/parent/device/enable'){if(!parent)return reply({},401);device=true;return reply({ok:true});}
  if(path==='/api/parent/device/revoke'){if(body.all&&!parent)return reply({},401);device=false;return reply({ok:true});}
  if(path==='/api/learning/sync'){if(!parent&&!device)return reply({code:'parent_login_required'},401);return reply({accepted:body.events.map(e=>e.syncId),events:[],cursor:0,more:false,autoAvailable:false,canEvolve:parent});}
  if(path==='/api/plans/list')return reply({plans:[]});
  if(path==='/api/plans/status')return reply({ready:false});
  return reply({},401);
 }
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));
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
 const base=`http://127.0.0.1:${server.address().port}`;
 await cdp('Page.navigate',{url:base+'/activation.html#token='+'a'.repeat(64)});
 await until('!!document.querySelector("#activate-parent")');
 await until('location.hash===""');assert.equal(received.length,0);
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 await run(`document.querySelector('[name=password]').value='synthetic long password';document.querySelector('[name=confirmation]').value='other long password';document.querySelector('#activate-parent').requestSubmit();`);
 await until('document.querySelector("#activation-status").textContent.includes("identiques")');assert.equal(received.length,0);
 await run(`document.querySelector('[name=confirmation]').value='synthetic long password';document.querySelector('[name=rememberDevice]').checked=true;document.querySelector('#activate-parent').requestSubmit();`);
 await until('document.querySelector("#activation-status").textContent.includes("90 jours")');assert.equal(received.filter(r=>r.path==='/api/parent/activate').length,1);
 assert.equal(await run('document.querySelector("[name=password]").value'), '');
 assert.equal(await run('JSON.stringify(localStorage).includes("synthetic long password")'),false);
 await cdp('Page.navigate',{url:base});await until('!!document.querySelector("[data-game-child]")');
 parent=false;
 await click('[data-game-child="0"]');assert.equal(await run('!!document.querySelector("input[type=password]")'),false);
 await click('[data-action=parent]');await click('[data-parent-section=settings]');
 await until('document.querySelector("[data-device-status]").textContent.includes("sans reconnecter")');
 await click('[data-parent-section=progress]');await click('#learning-enable');
 await until('document.querySelector("#learning-sync-status").textContent.includes("Réponses sauvegardées")');
 await click('[data-parent-section=settings]');await click('[data-device-action=revoke]');
 await until('document.querySelector("[data-device-status]").textContent.includes("n’est pas autorisé")');
 await click('[data-device-action=enable]');await until('document.querySelector("[data-device-status]").textContent.includes("Connecte le compte parent")');
 await click('[data-parent-section=progress]');await click('#learning-enable');await until('document.querySelector("#learning-sync-status").textContent.includes("Reconnecte")');
 assert.equal(await run('document.documentElement.scrollWidth<=innerWidth'),true);
 assert.deepEqual(errors,[]);console.log('Browser: one-use activation form, fragment cleanup, no child login, device-only sync and revocation passed.');
}finally{socket?.close();if(chrome.pid&&chrome.exitCode===null&&chrome.signalCode===null)await new Promise(r=>{chrome.once('exit',r);chrome.kill();});server.close();await rm(temporary,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
