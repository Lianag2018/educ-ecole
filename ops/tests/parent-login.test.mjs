import test from 'node:test';
import assert from 'node:assert/strict';

// Small DOM and HTTP doubles exercise the real handlers. No credentials,
// microphone, provider endpoint or server session are used by these tests.
let moduleId=0;
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
const flush=()=>new Promise(resolve=>setImmediate(resolve));

class Box{
 constructor(){this.isConnected=false;this.nodes=new Map();}
 set innerHTML(html){
  this.html=html;this.nodes.clear();
  const status={textContent:''},button={disabled:false};
  if(html.includes('id="ask-tutor"')){
   const form={elements:{question:{value:''}},querySelector:selector=>selector==='button'?button:null};
   this.nodes.set('form',form);this.nodes.set('form button',button);
   this.nodes.set('#conversation-state',status);
   for(const selector of ['#talk','#finish-talk','#cancel-talk'])this.nodes.set(selector,{disabled:true});
  }else{
   const form={elements:{email:{value:'parent@example.test'},password:{value:'synthetic-password'}},querySelector:selector=>selector==='button'?button:null};
   this.nodes.set('form',form);this.nodes.set('[role=status]',status);
   this.login=button;this.logout={disabled:false};this.nodes.set('#logout-parent',this.logout);
  }
 }
 querySelector(selector){return this.nodes.get(selector)||null;}
}

async function harness(t){
 const previous={document:Object.getOwnPropertyDescriptor(globalThis,'document'),fetch:Object.getOwnPropertyDescriptor(globalThis,'fetch')};
 const parents=[],tutors=[],requests=[],operations=[];
 const parentPanel={append(box){box.isConnected=true;parents.push(box);}};
 const tutorPanel={append(box){box.isConnected=true;tutors.push(box);}};
 const documentRef={
  createElement:()=>new Box(),
  querySelector(selector){
   if(selector==='.parent')return parentPanel;
   if(selector==='.tutor')return tutorPanel;
   if(selector==='#conversation-state')return tutors.findLast(box=>box.isConnected)?.querySelector(selector)||null;
   return null;
  },
  querySelectorAll(selector){return selector==='[data-parent-auth-action]'?parents.filter(box=>box.isConnected).flatMap(box=>[box.login,box.logout]):[];}
 };
 Object.defineProperty(globalThis,'document',{value:documentRef,writable:true,configurable:true});
 Object.defineProperty(globalThis,'fetch',{value:(url,init)=>{
  if(url==='/api/voice/status')return Promise.resolve({ok:true,json:async()=>({available:true,authenticated:true})});
  assert.ok(['/api/parent/login','/api/parent/logout'].includes(url),'unexpected network endpoint');
  const pending=deferred();requests.push({url,init,...pending});return pending.promise;
 },writable:true,configurable:true});
 // A fresh module isolates the module-level lock between tests. All remounts
 // within one test deliberately share this same module instance.
 const module=await import('../../src/conversation.js?parent-login-test='+moduleId++);
 t.after(async()=>{
  for(const request of requests)request.resolve({ok:false});
  await Promise.allSettled(operations);await flush();
  for(const [name,descriptor] of Object.entries(previous)){
   if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];
  }
 });
 return {
  module,requests,
  parent(options={}){for(const box of parents)box.isConnected=false;module.mountParentLogin(options);return parents.at(-1);},
  tutor(options={}){for(const box of tutors)box.isConnected=false;module.mountConversation({id:'p1'},{id:'sy1'},options);return tutors.at(-1);},
  login(box){const operation=box.querySelector('form').onsubmit({preventDefault(){},target:box.querySelector('form')});operations.push(operation);return operation;},
  logout(box){const operation=box.logout.onclick();operations.push(operation);return operation;}
 };
}

function locked(box,value){assert.equal(box.login.disabled,value);assert.equal(box.logout.disabled,value);}

test('pending login locks both commands and ignores duplicate login or logout handlers',async t=>{
 const h=await harness(t),events=[];
 const box=h.parent({onAuthChanged:()=>events.push('changed'),onLogoutStart:()=>events.push('logout')});
 const pending=h.login(box);locked(box,true);
 await h.login(box);await h.logout(box);
 assert.equal(h.requests.length,1);assert.deepEqual(events,[]);
 assert.equal(h.requests[0].url,'/api/parent/login');
 assert.equal(h.requests[0].init.credentials,'same-origin');
 assert.deepEqual(JSON.parse(h.requests[0].init.body),{email:'parent@example.test',password:'synthetic-password'});
 h.requests[0].resolve({ok:true});await pending;
 locked(box,false);assert.deepEqual(events,['changed']);
 assert.equal(box.querySelector('form').elements.password.value,'');
 const logout=h.logout(box);assert.equal(h.requests.length,2);locked(box,true);
 assert.equal(h.requests[1].url,'/api/parent/logout');
 h.requests[1].resolve({ok:true});await logout;locked(box,false);
 assert.deepEqual(events,['changed','logout','changed']);
 assert.match(box.querySelector('[role=status]').textContent,/Session parent fermée/);
});

test('pending logout stops local audio once and prevents a login cookie race',async t=>{
 const h=await harness(t),events=[];
 h.module.conversation.reset=()=>events.push('stop-audio');
 const box=h.parent({onLogoutStart:()=>events.push('logout-start'),onAuthChanged:()=>events.push('changed')});
 const pending=h.logout(box);locked(box,true);
 assert.deepEqual(events,['logout-start','stop-audio']);
 await h.login(box);await h.logout(box);
 assert.equal(h.requests.length,1);assert.equal(h.requests[0].url,'/api/parent/logout');
 assert.deepEqual(events,['logout-start','stop-audio']);
 h.requests[0].resolve({ok:true});await pending;
 locked(box,false);assert.deepEqual(events,['logout-start','stop-audio','changed']);
});

test('a remounted parent panel inherits an in-flight login lock and unlocks on completion',async t=>{
 const h=await harness(t),events=[];
 const old=h.parent({onAuthChanged:()=>events.push('original-login')});
 const pending=h.login(old),current=h.parent({onAuthChanged:()=>events.push('remounted')});
 assert.equal(old.isConnected,false);locked(current,true);
 await h.login(current);await h.logout(current);
 assert.equal(h.requests.length,1);assert.deepEqual(events,[]);
 h.requests[0].resolve({ok:true});await pending;
 locked(current,false);assert.equal(old.querySelector('form').elements.password.value,'');
 assert.deepEqual(events,['original-login']);
 const logout=h.logout(current);assert.equal(h.requests.length,2);
 h.requests[1].resolve({ok:true});await logout;locked(current,false);
 assert.deepEqual(events,['original-login','remounted']);
});

test('a remounted panel cannot start a login until the earlier logout has completed',async t=>{
 const h=await harness(t),events=[];
 const old=h.parent({onAuthChanged:()=>events.push('original-logout')});
 const pending=h.logout(old),current=h.parent({onAuthChanged:()=>events.push('new-login')});
 locked(current,true);await h.login(current);await h.logout(current);
 assert.equal(h.requests.length,1);
 h.requests[0].resolve({ok:true});await pending;locked(current,false);
 const login=h.login(current);assert.equal(h.requests.length,2);assert.equal(h.requests[1].url,'/api/parent/login');
 h.requests[1].resolve({ok:true});await login;
 locked(current,false);assert.deepEqual(events,['original-logout','new-login']);
});

test('HTTP and network login failures clear the submitted password and release remounted controls',async t=>{
 const h=await harness(t),events=[];
 for(const failure of ['http','network']){
  const old=h.parent({onAuthChanged:()=>events.push('unexpected-auth')});
  const pending=h.login(old),request=h.requests.at(-1),current=h.parent();locked(current,true);
  if(failure==='http')request.resolve({ok:false});else request.reject(Error('synthetic failure'));
  await pending;locked(current,false);
  assert.equal(old.querySelector('form').elements.password.value,'');
  assert.doesNotMatch(old.querySelector('[role=status]').textContent,/Parent connecté/);
 }
 assert.deepEqual(events,[]);
});

test('failed logout releases the shared lock without claiming that the server disconnected',async t=>{
 const h=await harness(t),events=[];
 for(const failure of ['http','network']){
  const box=h.parent({onLogoutStart:()=>events.push('local-reset')});
  const pending=h.logout(box),request=h.requests.at(-1);locked(box,true);
  if(failure==='http')request.resolve({ok:false});else request.reject(Error('synthetic failure'));
  await pending;locked(box,false);
  assert.equal(box.querySelector('[role=status]').textContent,'Déconnexion serveur non confirmée.');
 }
 assert.deepEqual(events,['local-reset','local-reset']);
});

test('written questions stop other audio before sending and preserve text across a full remount',async t=>{
 const h=await harness(t),events=[];let audioActive=true;
 const expected='Comment réunir la et pin?';
 let first;
 first=h.tutor({onBeforeCapture:()=>{
  events.push('stop-other-audio');audioActive=false;
  first.querySelector('form').elements.question.value='';
  h.tutor().querySelector('form').elements.question.value='Nouvelle saisie après rendu';
 }});
 await flush();assert.equal(first.querySelector('form button').disabled,false);
 h.module.conversation.send=body=>{
  assert.equal(audioActive,false);events.push('send');
  assert.deepEqual(body,{profileId:'p1',activityId:'sy1',text:expected});
 };
 first.querySelector('form').elements.question.value=expected;
 first.querySelector('form').onsubmit({preventDefault(){events.push('prevent-default');},target:first.querySelector('form')});
 assert.deepEqual(events,['prevent-default','stop-other-audio','send']);
 assert.equal(first.isConnected,false);assert.equal(h.requests.length,0);
});

test('the microphone entry keeps the same stop-before-record ordering after remount',async t=>{
 const h=await harness(t),events=[];
 const first=h.tutor({onBeforeCapture:()=>{events.push('stop-other-audio');h.tutor();}});
 h.module.conversation.record=(profileId,activityId)=>{events.push('record');assert.equal(profileId,'p1');assert.equal(activityId,'sy1');};
 first.querySelector('#talk').onclick();
 assert.deepEqual(events,['stop-other-audio','record']);assert.equal(first.isConnected,false);assert.equal(h.requests.length,0);
});
