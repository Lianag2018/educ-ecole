import test from 'node:test';
import assert from 'node:assert/strict';
import {bank} from '../../src/content.js';
import {olderReading} from '../../src/learning.js';
import {numberWords} from '../../src/numbers.js';
import {ADULT_CONFIRMATION_MS,ORAL_FEEDBACK,ORAL_WORD_TEXTS,resolveOralTarget,oralTargetForActivity} from '../../src/oral-check-targets.js';
import {buildOralNumberAliases,createOralCheckEndpoint,maximumOralUsd,oralCheckReady,oralResult,OralCheckProvider,hasOralSignal} from '../server/oral-check.mjs';
import {validateWav} from '../server/turn.mjs';
import {runtime} from '../server/runtime.mjs';

const NOW=1792695600000;
const parent={id:'test-parent',role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
const config={paidEnabled:true,parentConsent:true,zeroDataRetentionVerified:true,endpointRetentionVerified:true,childDataEligibilityReviewed:true,dedicatedHosting:true,oralCheckEnabled:true,oralCheckModel:'gpt-transcribe',otherCostsMicros:2000000,rates:{sttMinuteMicros:6000},pricing:{fxPpm:1500000,bufferPpm:250000,feeMicros:1000,pricingReviewedAt:'2026-10-22',validUntil:'2099-01-01'}};
function wav({seconds=.5,rate=24000,amplitude=3000,dc=false}={}){
 const samples=Math.round(seconds*rate),buffer=Buffer.alloc(44+samples*2);
 buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(buffer.length-44,40);
 for(let i=0;i<samples;i++)buffer.writeInt16LE(dc?amplitude:Math.round(amplitude*Math.sin(i*.15)),44+i*2);
 return buffer.toString('base64');
}
const body=()=>({profileId:'p1',target:{kind:'number',value:56},audio:wav(),adultPresent:true,adultConfirmedAt:NOW});
const request=(changes={})=>({method:'POST',headers:{},body:{...body(),...changes}});
function fixture(){
 const calls=[];
 return {calls,now:()=>NOW,config:structuredClone(config),auth:{authenticateParent:async()=>parent},profiles:{ownedBy:async(id,slot)=>{assert.equal(id,parent.id);return {stage:slot==='p1'?'1re année':'3e année'};}},ledger:{durable:true,reserve:async data=>calls.push(['reserve',data])},provider:{transcribe:async(wav,signal)=>{calls.push(['stt',{bytes:wav.length,signal}]);return {text:'Cinquante-six.',languages:[{code:'fr'}]};}}};
}

test('shared targets admit eight authored whole words and explicit grade number limits',()=>{
 const eligible=bank.filter(activity=>oralTargetForActivity(activity));
 assert.equal(eligible.length,8);assert.equal(ORAL_WORD_TEXTS.length,10);
 for(const activity of eligible){const descriptor=oralTargetForActivity(activity);const target=resolveOralTarget(descriptor,'1re année');assert.equal(target.text,activity.choices[activity.answer]);assert.equal(oralTargetForActivity({...activity,text:'Texte privé'}),null);}
 for(const id of ['first-sound-a','first-blend-la','co1','li1','so1','mo1'])assert.equal(oralTargetForActivity(bank.find(item=>item.id===id)),null);
 assert.equal(oralTargetForActivity({id:'school-word-1',text:'lapin'}),null);
 for(const value of [0,99])assert.equal(resolveOralTarget({kind:'number',value},'1re année').value,value);
 assert.equal(resolveOralTarget({kind:'number',value:100},'1re année'),null);
 assert.equal(resolveOralTarget({kind:'number',value:1999},'3e année').text,numberWords(1999));
 for(const target of [{kind:'number',value:2000},{kind:'number',value:-1},{kind:'number',value:1.5},{kind:'number',value:'56'},{kind:'number',value:56,text:'faux'},{kind:'word',activityId:'co1'},{kind:'word',activityId:'sy1',text:'faux'}])assert.equal(resolveOralTarget(target,'3e année'),null);
 assert.equal(resolveOralTarget({kind:'number',value:1},'2e année'),null);
});

test('third-grade word assemblies are available to p2 and cannot be forged by p1',async()=>{
 for(const id of ['g3-sy1','g3-sy2']){
  const activity=olderReading.find(item=>item.id===id),descriptor=oralTargetForActivity(activity);
  assert.deepEqual(descriptor,{kind:'word',activityId:id});
  assert.equal(resolveOralTarget(descriptor,'1re année'),null);
  assert.equal(resolveOralTarget(descriptor,'3e année').text,activity.choices[activity.answer]);
  for(const stage of ['1re année','3e année']){
   const f=fixture();f.profiles.ownedBy=async()=>({stage});
   const denied=await createOralCheckEndpoint(f)(request({target:descriptor}));
   assert.equal(denied.status,400);assert.equal(denied.body.code,'invalid_target');assert.deepEqual(f.calls,[]);
  }
  const f=fixture();f.provider.transcribe=async()=>({text:activity.choices[activity.answer],languages:[{code:'fr'}]});
  const allowed=await createOralCheckEndpoint(f)(request({profileId:'p2',target:descriptor}));
  assert.equal(allowed.status,200);assert.equal(allowed.body.result,'recognized');
 }
 for(const activity of olderReading.filter(item=>!['g3-sy1','g3-sy2'].includes(item.id)))assert.equal(oralTargetForActivity(activity),null);
});

test('whole-number transcription comparison covers 0–1999 without arbitrary text parsing',()=>{
 for(let value=0;value<=1999;value++){
  const target=resolveOralTarget({kind:'number',value},'3e année');
  for(const text of [String(value),numberWords(value),numberWords(value).replaceAll(' ','-')])assert.equal(oralResult({text,languages:[{code:'fr'}]},target),'recognized');
 }
 const target=resolveOralTarget({kind:'number',value:1999},'3e année');
 assert.equal(oralResult({text:'1\u202f999.',languages:[{code:'fr'}]},target),'recognized');
 for(const text of ['1,999','1.999','1 + 999','1-999','1. 999','mille. neuf cent quatre-vingt-dix-neuf'])assert.equal(oralResult({text,languages:[{code:'fr'}]},target),'uncertain');
 const one=resolveOralTarget({kind:'number',value:1},'1re année');
 for(const text of ['-1','−1','-un','un-','1-'])assert.equal(oralResult({text,languages:[{code:'fr'}]},one),'uncertain');
});

test('silent cent and vingt plurals are explicit complete-number aliases only',()=>{
 for(const [value,texts] of [
  [20,['vingts']],[21,['vingts et un']],[80,['quatre-vingt']],[81,['quatre-vingts-un']],
  [100,['cents']],[200,['deux cent']],[201,['deux cents un']],
  [280,['deux cent quatre-vingt','deux cents quatre-vingts']],
  [281,['deux cents quatre-vingts-un']],[1080,['mille quatre-vingt']],
  [1200,['mille deux cent']],[1280,['mille deux cents quatre-vingt']],
  [1999,['mille neuf cents quatre-vingts-dix-neuf']]
 ]){
  const target=resolveOralTarget({kind:'number',value},'3e année');
  const other=resolveOralTarget({kind:'number',value:value+1},'3e année');
  for(const text of texts){
   assert.equal(oralResult({text,languages:[{code:'fr'}]},target),'recognized',text);
   if(other)assert.equal(oralResult({text,languages:[{code:'fr'}]},other),'retry',text);
  }
 }
 for(const [text,targetText] of [['cents','cent'],['vingts','vingt'],['lapins','lapin']]){
  assert.equal(oralResult({text,languages:[{code:'fr'}]},{kind:'word',text:targetText}),'uncertain');
 }
 const target=resolveOralTarget({kind:'number',value:80},'3e année');
 for(const text of ['-quatre-vingt','quatre-vingt-','4-20','quatre-vin','deux sans','deuxcent','cents et un','deux cent plus un']){
  assert.equal(oralResult({text,languages:[{code:'fr'}]},target),'uncertain',text);
 }
});

test('number alias collisions fail closed instead of reassigning another value',()=>{
 assert.throws(()=>buildOralNumberAliases(value=>value===81?'quatre-vingt':numberWords(value)),/^Error: ambiguous_number_alias$/);
 assert.throws(()=>buildOralNumberAliases(value=>value===1?'zéro':numberWords(value)),/^Error: ambiguous_number_alias$/);
});

test('homophones, word plurals, unknown/foreign/long output stay uncertain',()=>{
 const number=resolveOralTarget({kind:'number',value:20},'1re année');
 const word=resolveOralTarget({kind:'word',activityId:'sy1'},'1re année');
 for(const text of ['vin','sang','sans','si','cette','de','20 et 21','001','la réponse est vingt'])assert.equal(oralResult({text,languages:[{code:'fr'}]},number),'uncertain');
 for(const text of ['lapins','le lapin','la pin','lapin et parasol','a'.repeat(161)])assert.equal(oralResult({text,languages:[{code:'fr'}]},word),'uncertain');
 for(const languages of [undefined,[],[{code:'en'}],[{code:'fr'},{code:'en'}]])assert.equal(oralResult({text:'lapin',languages},word),'uncertain');
 assert.equal(oralResult({text:'Lapin!',languages:[{code:'fr'}]},word),'recognized');
 assert.equal(oralResult({text:'moto',languages:[{code:'fr'}]},word),'retry');
 assert.equal(oralResult({text:'dix-neuf',languages:[{code:'fr'}]},number),'retry');
});

test('authenticated recognized attempt reserves once before one STT and discloses no transcript',async()=>{
 const f=fixture(),response=await createOralCheckEndpoint(f)(request());
 assert.equal(response.status,200);assert.deepEqual(response.body,{result:'recognized',feedback:ORAL_FEEDBACK.recognized,feedbackKey:'recognized',ai:true,targetText:'cinquante-six'});
 assert.deepEqual(f.calls.map(call=>call[0]),['reserve','stt']);
 assert.equal(f.calls[0][1].amount,12250);assert.equal(f.calls[0][1].profileId,'p1');
 assert.deepEqual(Object.keys(f.calls[0][1]).sort(),['amount','family','id','otherCostsMicros','profileId']);
 assert.equal(JSON.stringify(response).includes('Cinquante-six.'),false);
});

test('method and real parent verification are mandatory before a provider or reserve',async()=>{
 for(const field of ['id','role','emailVerified','recentLogin','csrfVerified']){
  const f=fixture();f.auth.authenticateParent=async()=>({...parent,[field]:false});
  assert.equal((await createOralCheckEndpoint(f)(request())).status,401);assert.deepEqual(f.calls,[]);
 }
 const f=fixture();assert.equal((await createOralCheckEndpoint(f)({...request(),method:'GET'})).status,405);assert.deepEqual(f.calls,[]);
});

test('adult attestation is explicit, recent and bounded; it never replaces authentication',async()=>{
 for(const changes of [{adultPresent:false},{adultPresent:'true'},{adultConfirmedAt:NOW-ADULT_CONFIRMATION_MS-1},{adultConfirmedAt:NOW+30001},{adultConfirmedAt:String(NOW)},{adultConfirmedAt:0}]){
  const f=fixture(),response=await createOralCheckEndpoint(f)(request(changes));
  assert.equal(response.status,403);assert.equal(response.body.code,'adult_presence_required');assert.deepEqual(f.calls,[]);
 }
 const f=fixture();assert.equal((await createOralCheckEndpoint(f)(request({adultConfirmedAt:NOW-ADULT_CONFIRMATION_MS}))).status,200);
});

test('request schema, target ownership and profile grades reject before charging',async()=>{
 const variants=[request({profileId:'other'}),request({expectedText:'cinquante-six'}),request({target:{kind:'word',activityId:'co1'}}),request({target:{kind:'number',value:56,text:'provided answer'}}),request({target:{kind:'number',value:'56'}})];
 const missing=request();delete missing.body.adultConfirmedAt;variants.push(missing);
 for(const req of variants){const f=fixture();assert.equal((await createOralCheckEndpoint(f)(req)).status,400);assert.deepEqual(f.calls,[]);}
 for(const profile of [null,{stage:'2e année'}]){const f=fixture();f.profiles.ownedBy=async()=>profile;assert.equal((await createOralCheckEndpoint(f)(request())).status,403);assert.deepEqual(f.calls,[]);}
 const f=fixture();f.profiles.ownedBy=async()=>({stage:'3e année'});assert.equal((await createOralCheckEndpoint(f)(request({target:{kind:'number',value:100}}))).status,403);assert.deepEqual(f.calls,[]);
 const advanced=fixture();advanced.provider.transcribe=async()=>({text:'1999',languages:[{code:'fr'}]});assert.equal((await createOralCheckEndpoint(advanced)(request({profileId:'p2',target:{kind:'number',value:1999}}))).body.result,'recognized');
});

test('every consent/retention gate, explicit model and durable budget stay closed by default',async()=>{
 for(const field of ['paidEnabled','parentConsent','zeroDataRetentionVerified','endpointRetentionVerified','childDataEligibilityReviewed','dedicatedHosting','oralCheckEnabled']){
  const f=fixture();f.config[field]=false;assert.equal((await createOralCheckEndpoint(f)(request())).status,503);assert.deepEqual(f.calls,[]);
 }
 for(const mutate of [f=>delete f.config.oralCheckModel,f=>f.config.oralCheckModel='whisper-1',f=>f.ledger.durable=false,f=>delete f.ledger.reserve,f=>f.config.otherCostsMicros=0,f=>f.config.otherCostsMicros=40000000]){
  const f=fixture();mutate(f);assert.equal((await createOralCheckEndpoint(f)(request())).status,503);assert.deepEqual(f.calls,[]);
 }
});

test('reviewed pricing and conservative one-minute reserve are required',async()=>{
 assert.equal(maximumOralUsd(config),6000);assert.equal(oralCheckReady(config),true);
 for(const mutate of [f=>f.config.rates.sttMinuteMicros=4500,f=>f.config.rates.sttMinuteMicros=0,f=>delete f.config.pricing,f=>f.config.pricing.fxPpm=0,f=>f.config.pricing.validUntil='2020-01-01',f=>f.config.pricing.feeMicros=0]){
  const f=fixture();mutate(f);assert.equal((await createOralCheckEndpoint(f)(request())).status,503);assert.deepEqual(f.calls,[]);
 }
});

test('PCM validation is independent; compressed, overlong and malformed input never reaches STT',async()=>{
 for(const audio of [wav({seconds:11}),wav({rate:44100}),wav({seconds:.01}),'data:audio/wav;base64,AAAA','AAAA','not base64']){
  const f=fixture();const response=await createOralCheckEndpoint(f)(request({audio}));assert.equal(response.status,400);assert.equal(response.body.code,'invalid_audio');assert.deepEqual(f.calls,[]);
 }
 for(const rate of [16000,24000,48000]){const f=fixture();assert.equal((await createOralCheckEndpoint(f)(request({audio:wav({seconds:10,rate})}))).status,200);}
});

test('digital silence and constant DC return uncertainty without any paid reserve or provider call',async()=>{
 for(const audio of [wav({amplitude:0}),wav({amplitude:1000,dc:true}),wav({amplitude:1})]){
  assert.equal(hasOralSignal(validateWav(audio)),false);
  const f=fixture();const response=await createOralCheckEndpoint(f)(request({audio}));assert.equal(response.status,200);assert.equal(response.body.result,'uncertain');assert.equal(response.body.ai,false);assert.deepEqual(f.calls,[]);
 }
});

test('budget outage and family rate limit cannot call the transcription provider',async()=>{
 for(const [error,status,code] of [['budget_cap',503,'budget_unavailable'],['private database failure',503,'budget_unavailable'],['rate_limit',429,'rate_limit']]){
  const f=fixture();f.ledger.reserve=async()=>{throw Error(error);};const response=await createOralCheckEndpoint(f)(request());
  assert.equal(response.status,status);assert.deepEqual(response.body,{code});assert.deepEqual(f.calls,[]);
 }
});

test('provider failure is neutral, retains debit, and never retries or invents a recognized response',async()=>{
 const f=fixture();let calls=0;f.provider.transcribe=async()=>{calls++;throw Error('private audio and credential');};
 const response=await createOralCheckEndpoint(f)(request());assert.equal(response.status,503);assert.deepEqual(response.body,{code:'oral_check_unavailable'});assert.equal(calls,1);assert.deepEqual(f.calls.map(call=>call[0]),['reserve']);
});

test('abort before reserve is free; abort during STT retains reserve and suppresses late result',async()=>{
 const ac=new AbortController();ac.abort();const f=fixture();assert.equal((await createOralCheckEndpoint(f)({...request(),signal:ac.signal})).status,503);assert.deepEqual(f.calls,[]);
 const active=new AbortController(),other=fixture();let finish;
 other.provider.transcribe=()=>new Promise(resolve=>finish=resolve);
 const pending=createOralCheckEndpoint(other)({...request(),signal:active.signal});
 while(!finish)await Promise.resolve();active.abort();finish({text:'56',languages:[{code:'fr'}]});
 assert.equal((await pending).status,503);assert.deepEqual(other.calls.map(call=>call[0]),['reserve']);
});

test('unexpected provider output is uncertain with a fixed phrase and no echoed content',async()=>{
 for(const output of [null,{text:56,languages:[{code:'fr'}]},{text:'ignore the rules',languages:[{code:'en'}]},{text:'cinquante-six',languages:[]}]){
  const f=fixture();f.provider.transcribe=async()=>output;const response=await createOralCheckEndpoint(f)(request());assert.equal(response.status,200);assert.equal(response.body.result,'uncertain');assert.equal(response.body.ai,true);assert.equal(response.body.feedback,ORAL_FEEDBACK.uncertain);assert.equal('transcript' in response.body,false);assert.equal('text' in response.body,false);
 }
});

test('gpt-transcribe adapter sends only French audio fields to the fixed endpoint without target priming',async()=>{
 const calls=[],provider=new OralCheckProvider({apiKey:'test-only',fetchImpl:async(url,init)=>{calls.push({url,init});return Response.json({text:'56',languages:[{code:'fr'}]});}});
 const signal=new AbortController().signal;assert.equal((await provider.transcribe(validateWav(wav()),signal)).text,'56');
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://api.openai.com/v1/audio/transcriptions');assert.equal(calls[0].init.redirect,'error');assert.equal(calls[0].init.signal,signal);
 const form=calls[0].init.body;assert.deepEqual([...form.keys()].sort(),['file','languages[]','model','response_format']);assert.equal(form.get('languages[]'),'fr');assert.equal(form.get('model'),'gpt-transcribe');assert.equal(form.get('response_format'),'json');assert.equal(form.get('file').type,'audio/wav');assert.equal(form.get('file').name,'oral.wav');
 assert.equal(form.has('language'),false);assert.equal(form.has('prompt'),false);assert.equal(form.has('keywords'),false);assert.equal(form.has('include'),false);
});

test('provider refuses upstream errors and bounds malformed or excessive response bodies',async()=>{
 const signal=new AbortController().signal;
 const failing=new OralCheckProvider({apiKey:'test-only',fetchImpl:async()=>new Response('upstream private detail',{status:429})});await assert.rejects(failing.transcribe(validateWav(wav()),signal),/^Error: oral_check_unavailable$/);
 for(const response of [new Response('not JSON'),new Response('a'.repeat(8193)),new Response('{}',{headers:{'content-length':'9000'}})]){
  const provider=new OralCheckProvider({apiKey:'test-only',fetchImpl:async()=>response});assert.equal(await provider.transcribe(validateWav(wav()),signal),null);
 }
});

function runtimeFixture(){
 const id='11111111-1111-4111-8111-111111111111',origin='https://atelier.example';
 const token='header.'+Buffer.from(JSON.stringify({iat:Math.floor(Date.now()/1000)})).toString('base64url')+'.signature';
 const env={EDUC_ORIGIN:origin,EDUC_SUPABASE_URL:'https://abcdefghijklmnopqrst.supabase.co',EDUC_SUPABASE_SERVICE_KEY:'test-service',EDUC_SUPABASE_ANON_KEY:'test-anon',EDUC_PARENT_ID:id,EDUC_OPENAI_API_KEY:'test-provider',EDUC_VOICE_CONFIG:JSON.stringify(config)};
 const calls=[];
 const fetcher=async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith('/auth/v1/user'))return Response.json({id,email_confirmed_at:'2026-01-01'});
  if(url.includes('/famille_voice_profiles?'))return Response.json([{stage:'1re année'}]);
  if(url.endsWith('/rpc/famille_reserve_voice'))return Response.json(null);
  if(url.endsWith('/audio/transcriptions'))return Response.json({text:'56',languages:[{code:'fr'}]});
  throw Error('unexpected endpoint');
 };
 return {env,calls,fetcher,headers:{origin,cookie:'educ_parent='+token}};
}

test('runtime route shares verified auth, owned profile and existing SQL reserve before one provider call',async()=>{
 const f=runtimeFixture(),handle=runtime(f.env,f.fetcher);
 const response=await handle({path:'/api/voice/check',...request({adultConfirmedAt:Date.now()}),headers:f.headers});
 assert.equal(response.status,200);assert.equal(response.body.result,'recognized');
 assert.deepEqual(f.calls.map(call=>new URL(call.url).pathname),['/auth/v1/user','/rest/v1/famille_voice_profiles','/rest/v1/rpc/famille_reserve_voice','/v1/audio/transcriptions']);
 assert.equal(JSON.parse(f.calls[2].init.body).p_slot,'p1');
 const before=f.calls.length;const denied=await handle({path:'/api/voice/check',...request(),headers:{...f.headers,origin:'https://untrusted.example'}});assert.equal(denied.status,401);assert.equal(f.calls.length,before);
});

test('status distinguishes parent configuration and oral availability without exposing credentials',async()=>{
 let calls=0;
 const unconfigured=runtime({},async()=>{calls++;throw Error('must not call');});
 const unavailable=await unconfigured({path:'/api/voice/status',method:'POST',headers:{},body:{}});
 assert.equal(unavailable.body.authConfigured,false);assert.equal(unavailable.body.oralCheckAvailable,false);assert.equal(unavailable.body.oralCheckReason,'setup_required');assert.equal(calls,0);
 const f=runtimeFixture(),handle=runtime(f.env,f.fetcher);
 const unauthenticated=await handle({path:'/api/voice/status',method:'POST',headers:{origin:f.headers.origin},body:{}});
 assert.equal(unauthenticated.body.oralCheckAvailable,true);assert.equal(unauthenticated.body.authConfigured,true);assert.equal(unauthenticated.body.authenticated,false);assert.equal(unauthenticated.body.oralCheckReason,'parent_required');assert.equal(f.calls.length,0);
 const authenticated=await handle({path:'/api/voice/status',method:'POST',headers:f.headers,body:{}});
 assert.equal(authenticated.body.authenticated,true);assert.equal(authenticated.body.oralCheckReason,'ready');assert.equal(f.calls.length,1);
 for(const value of ['test-service','test-anon','test-provider','11111111',f.headers.cookie])assert.equal(JSON.stringify(authenticated).includes(value),false);
});

test('status fails closed on unverifiable parent auth; explicit check route retains body limit',async()=>{
 const f=runtimeFixture(),handle=runtime(f.env,async()=>{throw Error('private auth error');});
 const status=await handle({path:'/api/voice/status',method:'POST',headers:f.headers,body:{}});assert.equal(status.status,200);assert.equal(status.body.authenticated,false);
 const {default:handler}=await import('../../api/voice/check.mjs');let code;
 const res={on(){},status(value){code=value;return this;},end(){},json(){},setHeader(){}};
 await handler({url:'/api/voice/check',method:'POST',headers:{},body:{audio:'a'.repeat(1300001)}},res);assert.equal(code,413);
});

test('missing provider key and expired verified parent session reject without a budget reservation',async()=>{
 const f=runtimeFixture();delete f.env.EDUC_OPENAI_API_KEY;
 const response=await runtime(f.env,f.fetcher)({path:'/api/voice/check',...request({adultConfirmedAt:Date.now()}),headers:f.headers});
 assert.equal(response.status,503);assert.equal(response.body.code,'oral_check_unavailable');assert.ok(f.calls.every(call=>!call.url.includes('/rpc/')&&!call.url.includes('api.openai.com')));
 const expired=runtimeFixture();const token='header.'+Buffer.from(JSON.stringify({iat:Math.floor(Date.now()/1000)-3601})).toString('base64url')+'.signature';
 const denied=await runtime(expired.env,expired.fetcher)({path:'/api/voice/check',...request({adultConfirmedAt:Date.now()}),headers:{...expired.headers,cookie:'educ_parent='+token}});
 assert.equal(denied.status,401);assert.equal(expired.calls.length,1);assert.ok(expired.calls[0].url.endsWith('/auth/v1/user'));
});
