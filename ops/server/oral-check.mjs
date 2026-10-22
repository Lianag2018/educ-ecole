import {randomUUID} from 'node:crypto';
import {CAP,quote} from './budget.mjs';
import {ready,validateWav} from './turn.mjs';
import {numberWords} from '../../src/numbers.js';
import {ADULT_CONFIRMATION_MS,ORAL_FEEDBACK,ORAL_WORD_TEXTS,resolveOralTarget} from '../../src/oral-check-targets.js';

export const ORAL_CHECK_MODEL='gpt-transcribe';
const PROVIDER_URL='https://api.openai.com/v1/audio/transcriptions';
const MAX_PROVIDER_BYTES=8192;
const normalize=text=>text.normalize('NFC').trim().toLocaleLowerCase('fr-CA')
 .replace(/(?<=\p{L})[\u2010\u2011-](?=\p{L})/gu,' ').replace(/\s+/gu,' ').replace(/[.!?]+$/u,'').trim();

// ASR cannot establish silent written plurals. Enumerate only cent(s)/vingt(s)
// spellings inside the 2,000 complete authored number names; never rewrite a
// received word or arbitrary phrase. A collision must fail instead of guessing.
export function buildOralNumberAliases(numberName=numberWords){
 const forms=new Map();
 for(let value=0;value<=1999;value++){
  let aliases=[''];
  for(const token of normalize(numberName(value)).split(' ')){
   const variants=['cent','cents'].includes(token)?['cent','cents']:['vingt','vingts'].includes(token)?['vingt','vingts']:[token];
   aliases=aliases.flatMap(prefix=>variants.map(part=>prefix?prefix+' '+part:part));
  }
  for(const alias of aliases){
   if(forms.has(alias)&&forms.get(alias)!==value)throw Error('ambiguous_number_alias');
   forms.set(alias,value);
  }
 }
 return forms;
}
const frenchNumbers=buildOralNumberAliases();

// One full minute reserved for <=10 seconds. The 6,000 micro-USD floor is an
// internal conservative bound, not a claimed provider minimum charge. Pricing
// must be explicitly reviewed for this model before enabling the feature.
export function maximumOralUsd(config){
 const amount=config?.rates?.sttMinuteMicros;
 if(config?.oralCheckModel!==ORAL_CHECK_MODEL||!Number.isSafeInteger(amount)||amount<6000)throw Error('pricing_unavailable');
 return amount;
}
export function oralCheckReady(config){
 try{return ready(config)&&config.oralCheckEnabled===true&&Number.isSafeInteger(config.otherCostsMicros)&&config.otherCostsMicros>0&&config.otherCostsMicros<CAP&&quote(config.pricing,maximumOralUsd(config))>0;}
 catch{return false;}
}

// This only detects near-digital silence/DC. It is not voice detection and says
// nothing about pronunciation, identity, emotion or speaking ability.
export function hasOralSignal(wav){
 const count=(wav.length-44)/2;let sum=0,squares=0;
 for(let offset=44;offset<wav.length;offset+=2){const value=wav.readInt16LE(offset);sum+=value;squares+=value*value;}
 return squares/count-(sum/count)**2>=16**2;
}

function result(kind,target,ai){return {status:200,body:{result:kind,feedback:ORAL_FEEDBACK[kind],feedbackKey:kind,ai,targetText:target.text}};}
function parseNumber(text){
 if(/^(?:0|[1-9]\d{0,3})$/u.test(text)){const value=Number(text);return value<=1999?value:null;}
 if(/^1 \d{3}$/u.test(text))return Number(text.replace(' ',''));
 return frenchNumbers.get(text)??null;
}

export function oralResult(transcription,target){
 if(!transcription||typeof transcription.text!=='string'||transcription.text.length>160||!Array.isArray(transcription.languages)||transcription.languages.length!==1||transcription.languages[0]?.code!=='fr')return 'uncertain';
 const text=normalize(transcription.text);if(!text)return 'uncertain';
 if(target.kind==='number'){
  const value=parseNumber(text);
  return value===null?'uncertain':value===target.value?'recognized':'retry';
 }
 if(text===normalize(target.text))return 'recognized';
 // Unknown spellings, homophones and plural forms remain uncertain; no fuzzy
 // matching and no pronunciation failure inferred from a transcription.
 return ORAL_WORD_TEXTS.includes(text)?'retry':'uncertain';
}

async function boundedJson(response,signal){
 if(Number(response.headers?.get('content-length'))>MAX_PROVIDER_BYTES){await response.body?.cancel().catch(()=>{});return null;}
 const reader=response.body?.getReader();if(!reader)return null;
 let size=0;const chunks=[];
 try{
  for(;;){signal?.throwIfAborted();const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_PROVIDER_BYTES){await reader.cancel();return null;}chunks.push(value);}
  return JSON.parse(Buffer.concat(chunks,size).toString('utf8'));
 }catch{signal?.throwIfAborted();return null;}
 finally{reader.releaseLock();}
}

export class OralCheckProvider{
 constructor({apiKey,fetchImpl=fetch}={}){this.apiKey=apiKey;this.fetch=fetchImpl;}
 async transcribe(wav,signal){
  if(!this.apiKey)throw Error('oral_check_unavailable');
  const body=new FormData();
  body.set('file',new Blob([wav],{type:'audio/wav'}),'oral.wav');
  body.set('model',ORAL_CHECK_MODEL);body.set('response_format','json');body.append('languages[]','fr');
  // Never send the expected target, profile, school content or a hint that could
  // prime the transcription. No chat/TTS call or automatic provider retry.
  const response=await this.fetch(PROVIDER_URL,{method:'POST',redirect:'error',signal,headers:{Authorization:'Bearer '+this.apiKey},body});
  if(!response.ok)throw Error('oral_check_unavailable');
  return boundedJson(response,signal);
 }
}

export function createOralCheckEndpoint({auth,profiles,ledger,provider,config,now=Date.now}={}){
 return async req=>{
  let phase='auth';
  try{
   if(req.method!=='POST')return {status:405,body:{code:'method_not_allowed'}};
   const parent=await auth?.authenticateParent(req);
   if(!parent?.id||parent.role!=='parent'||!parent.emailVerified||!parent.recentLogin||!parent.csrfVerified)return {status:401,body:{code:'parent_login_required'}};
   const body=req.body;
   const keys=['profileId','target','audio','adultPresent','adultConfirmedAt'];
   if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==keys.length||Object.keys(body).some(key=>!keys.includes(key))||!['p1','p2'].includes(body.profileId))return {status:400,body:{code:'invalid_request'}};
   // A recent adult attestation supplements real parent authentication. It is
   // not technical proof that an adult is physically present. Small clock skew
   // is tolerated; the claim never enables a missing server consent gate.
   const age=now()-body.adultConfirmedAt;
   if(body.adultPresent!==true||!Number.isSafeInteger(body.adultConfirmedAt)||body.adultConfirmedAt<=0||age< -30000||age>ADULT_CONFIRMATION_MS)return {status:403,body:{code:'adult_presence_required'}};
   const profile=await profiles?.ownedBy(parent.id,body.profileId);
   if(!profile||!['1re année','3e année'].includes(profile.stage))return {status:403,body:{code:'profile_forbidden'}};
   if(body.profileId==='p1'&&body.target?.kind==='number'&&Number.isSafeInteger(body.target.value)&&body.target.value>99)return {status:403,body:{code:'target_forbidden'}};
   const target=resolveOralTarget(body.target,body.profileId==='p1'?'1re année':profile.stage);
   if(!target)return {status:400,body:{code:'invalid_target'}};
   phase='config';
   if(!oralCheckReady(config)||!ledger?.durable||typeof ledger.reserve!=='function'||typeof provider?.transcribe!=='function')return {status:503,body:{code:'oral_check_unavailable'}};
   const wav=validateWav(body.audio);
   req.signal?.throwIfAborted();
   if(!hasOralSignal(wav))return result('uncertain',target,false);
   const amount=quote(config.pricing,maximumOralUsd(config));
   phase='budget';
   await ledger.reserve({family:parent.id,profileId:body.profileId,id:randomUUID(),amount,otherCostsMicros:config.otherCostsMicros});
   // Keep the whole reservation on success, interruption or ambiguous failure.
   // Audio/transcription are volatile and never passed to the durable ledger.
   phase='provider';
   const signal=AbortSignal.any([req.signal||new AbortController().signal,AbortSignal.timeout(20000)]);
   signal.throwIfAborted();
   const transcription=await provider.transcribe(wav,signal);
   signal.throwIfAborted();
   return result(oralResult(transcription,target),target,true);
  }catch(error){
   const code=error.message==='invalid_audio'?'invalid_audio':phase==='budget'?(error.message==='rate_limit'?'rate_limit':'budget_unavailable'):'oral_check_unavailable';
   return {status:code==='invalid_audio'?400:code==='rate_limit'?429:503,body:{code}};
  }
 };
}
