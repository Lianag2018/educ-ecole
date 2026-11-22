import test from 'node:test';import assert from 'node:assert/strict';
const {createStoryVoiceEndpoint,storyVoiceReady,storyRequest,MAX_STORY_CHARS}=await import('../server/story-voice.mjs');
const voiceConfig={rates:{ttsMillionCharsMicros:15000000},pricing:{fxPpm:1400000,bufferPpm:100000,feeMicros:1000,pricingReviewedAt:'2026-11-01',validUntil:'2099-01-01'},otherCostsMicros:1000000};
const storyConfig={enabled:true,parentConsent:true};
const mp3=Buffer.concat([Buffer.from('ID3'),Buffer.alloc(2000,7)]);
function make({who={id:'parent-1',role:'family_device',csrfVerified:true},story=storyConfig,voice=voiceConfig,reserve,fetcher,key='k'}={}){
 const calls={reserve:[],fetch:[]};
 const ep=createStoryVoiceEndpoint({auth:{authenticateLearner:async()=>who},storyConfig:story,voiceConfig:voice,apiKey:key,
  ledger:{durable:true,reserve:reserve||(async x=>{calls.reserve.push(x);})},fetcher:fetcher||(async(u,o)=>{calls.fetch.push({u,o});return new Response(mp3);})});
 return {ep,calls};
}
const req=body=>({method:'POST',headers:{},body});
test('une page est lue avec la voix et les consignes de conteuse; le budget est réservé avant l’appel',async()=>{
 const {ep,calls}=make();const r=await ep(req({text:'« Maman ! » crie le petit loup.',profileId:'p2'}));
 assert.equal(r.status,200);assert.equal(r.body.audioType,'audio/mpeg');assert.equal(Buffer.from(r.body.audio,'base64').length,mp3.length);
 assert.equal(calls.reserve.length,1);assert.equal(calls.reserve[0].family,'parent-1');assert.ok(calls.reserve[0].amount>0);
 const sent=JSON.parse(calls.fetch[0].o.body);assert.equal(sent.voice,'coral');assert.equal(sent.response_format,'mp3');assert.match(sent.instructions,/conteuse/);assert.match(sent.instructions,/guillemets/);
 assert.equal(calls.fetch[0].o.headers.Authorization,'Bearer k');assert.equal(calls.fetch[0].o.redirect,'error');
});
test('refus : pas connecté, pas activé, mauvaise demande, texte trop long',async()=>{
 assert.equal((await make({who:null}).ep(req({text:'Bonjour',profileId:'p1'}))).status,401);
 assert.equal((await make({story:{enabled:false,parentConsent:true}}).ep(req({text:'Bonjour',profileId:'p1'}))).body.code,'story_voice_unavailable');
 assert.equal((await make({story:{enabled:true}}).ep(req({text:'Bonjour',profileId:'p1'}))).body.code,'story_voice_unavailable');
 assert.equal((await make({key:''}).ep(req({text:'Bonjour',profileId:'p1'}))).body.code,'story_voice_unavailable');
 for(const b of [{text:'Bonjour',profileId:'p9'},{text:'x'.repeat(MAX_STORY_CHARS+1),profileId:'p1'},{text:'Bonjour',profileId:'p1',extra:1},{text:'',profileId:'p1'},{text:'a\u0000b',profileId:'p1'},{profileId:'p1'}])assert.equal((await make().ep(req(b))).status,400);
 assert.equal((await make().ep({method:'GET',headers:{},body:{}})).status,405);
});
test('le budget refuse avant tout appel payant; une réponse invalide du fournisseur n’est jamais renvoyée',async()=>{
 let fetched=0;const a=make({reserve:async()=>{throw Error('budget_cap');},fetcher:async()=>{fetched++;return new Response(mp3);}});
 const r=await a.ep(req({text:'Bonjour',profileId:'p1'}));assert.equal(r.status,503);assert.equal(r.body.code,'budget_unavailable');assert.equal(fetched,0);
 const lim=make({reserve:async()=>{throw Error('rate_limit');}});assert.equal((await lim.ep(req({text:'Bonjour',profileId:'p1'}))).status,429);
 for(const bad of [new Response(Buffer.alloc(10)),new Response(Buffer.alloc(3000,1)),new Response('no',{status:500})])assert.equal((await make({fetcher:async()=>bad}).ep(req({text:'Bonjour',profileId:'p1'}))).body.code,'voice_unavailable');
});
test('activation : il faut le consentement du parent et des tarifs valides',()=>{
 assert.equal(storyVoiceReady(storyConfig,voiceConfig),true);assert.equal(storyVoiceReady(null,voiceConfig),false);assert.equal(storyVoiceReady(storyConfig,{}),false);assert.equal(storyVoiceReady({enabled:true,parentConsent:false},voiceConfig),false);
 assert.equal(storyRequest('Bonjour').speed,.88);
});
test('serveur non prêt : indique les noms des éléments manquants, sans valeur',async()=>{
 const {createStoryVoiceEndpoint}=await import('../server/story-voice.mjs');
 const ep=createStoryVoiceEndpoint({auth:{authenticateLearner:async()=>({id:'x',csrfVerified:true})},storyConfig:{enabled:true,parentConsent:true},voiceConfig:{rates:{}},ledger:{durable:true},apiKey:'sk-secret',fetcher:async()=>{throw Error('non');}});
 const r=await ep({method:'POST',body:{text:'Il était une fois.',profileId:'p1'}});
 assert.equal(r.status,503);assert.equal(r.body.code,'story_voice_unavailable');
 assert.deepEqual(r.body.missing,['EDUC_VOICE_CONFIG.rates.ttsMillionCharsMicros','EDUC_VOICE_CONFIG.pricing']);
 assert.ok(!JSON.stringify(r.body).includes('sk-secret'));
});
