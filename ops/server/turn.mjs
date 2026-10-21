import {teachingInstructions} from './pedagogy.mjs';
import {randomUUID} from 'node:crypto';
import {quote} from './budget.mjs';
import {bank} from '../../src/content.js';
import {stories,mathCards,social} from '../../src/garden.js';
const activities=[...bank,...stories,...mathCards,social];
export const MODELS={stt:'whisper-1',llm:'gpt-4.1-mini-2025-04-14',tts:'tts-1'};
export function torontoMonth(now=new Date()) {return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit'}).format(now).slice(0,7);}
export function validateWav(base64){
 if(typeof base64!=='string'||base64.length>1280100||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64))throw Error('invalid_audio');
 const b=Buffer.from(base64,'base64');
 if(b.length<3244||b.length>960044||b.toString('ascii',0,4)!=='RIFF'||b.readUInt32LE(4)!==b.length-8||b.toString('ascii',8,16)!=='WAVEfmt '||b.readUInt32LE(16)!==16||b.readUInt16LE(20)!==1||b.readUInt16LE(22)!==1||b.readUInt16LE(34)!==16||b.readUInt16LE(32)!==2||b.toString('ascii',36,40)!=='data'||b.readUInt32LE(40)!==b.length-44)throw Error('invalid_audio');
 const rate=b.readUInt32LE(24);if(![16000,24000,48000].includes(rate)||b.readUInt32LE(28)!==rate*2||(b.length-44)%2||(b.length-44)/(rate*2)>10)throw Error('invalid_audio');return b;
}
export function maximumUsd(c){
 // Bounds: <=10 s PCM; Whisper rounded conservatively to full minute;
 // UTF-8 byte count bounds BPE input tokens, plus 2048 protocol allowance;
 // <=128 output tokens, <=400 UTF-16 chars passed to TTS (800 billed chars).
 const p=c?.rates;
 if(!p||!['sttMinuteMicros','inputMillionMicros','outputMillionMicros','ttsMillionCharsMicros'].map(k=>p[k]).every(n=>Number.isSafeInteger(n)&&n>0)||p.sttMinuteMicros<6000||p.inputMillionMicros<400000||p.outputMillionMicros<1600000||p.ttsMillionCharsMicros<15000000)throw Error('pricing_unavailable');
 return p.sttMinuteMicros+Math.ceil(16000*p.inputMillionMicros/1e6)+Math.ceil(128*p.outputMillionMicros/1e6)+Math.ceil(800*p.ttsMillionCharsMicros/1e6);
}
export function ready(c){return c?.paidEnabled===true&&c.parentConsent===true&&c.zeroDataRetentionVerified===true&&c.endpointRetentionVerified===true&&c.childDataEligibilityReviewed===true&&c.dedicatedHosting===true;}
export class TurnProvider{
 constructor({apiKey,fetchImpl=fetch}){this.key=apiKey;this.fetch=fetchImpl;}
 async call(path,body,signal,json=true){if(!this.key)throw Error('provider_unconfigured');const r=await this.fetch('https://api.openai.com/v1/'+path,{method:'POST',redirect:'error',signal,headers:{Authorization:`Bearer ${this.key}`,...(json?{'Content-Type':'application/json'}:{})},body:json?JSON.stringify(body):body});if(!r.ok)throw Error('provider_unavailable');return r;}
 async transcribe(wav,signal){const f=new FormData();f.set('file',new Blob([wav],{type:'audio/wav'}),'turn.wav');f.set('model',MODELS.stt);f.set('language','fr');return (await(await this.call('audio/transcriptions',f,signal,false)).json()).text;}
 async respond(messages,signal){const r=await(await this.call('chat/completions',{model:MODELS.llm,messages,max_tokens:128,temperature:0.4,store:false},signal)).json();return r.choices?.[0]?.message?.content;}
 async speak(text,signal){return Buffer.from(await(await this.call('audio/speech',{model:MODELS.tts,input:text,voice:'nova',speed:0.85,response_format:'mp3'},signal)).arrayBuffer());}
}
export function createTurnEndpoint({auth,profiles,config,ledger,provider}={}){
 return async req=>{
  let phase='auth';
  try{
   const parent=await auth?.authenticateParent(req);if(!parent?.id||parent.role!=='parent'||!parent.emailVerified||!parent.recentLogin||!parent.csrfVerified)return {status:401,body:{code:'parent_login_required'}};
   if(req.method!=='POST')return {status:405,body:{code:'method_not_allowed'}};
   const b=req.body||{};
   if(!['p1','p2'].includes(b.profileId)||Object.keys(b).some(k=>!['profileId','activityId','text','audio','history'].includes(k))||typeof b.activityId!=='string'||Boolean(b.text)===Boolean(b.audio))throw Error('invalid_request');
   const p=await profiles.ownedBy(parent.id,b.profileId);if(!p)return {status:403,body:{code:'profile_forbidden'}};
   phase='config';if(!ready(config)||!provider||!ledger?.durable)throw Error('voice_unavailable');
   const activity=activities.find(q=>q.id===b.activityId)||p.assignments?.find(q=>q.id===b.activityId);if(!activity)throw Error('invalid_request');
   const history=b.history??[];if(!Array.isArray(history)||history.length>4||history.some(h=>!h||!['user','assistant'].includes(h.role)||typeof h.content!=='string'||h.content.length>400||Object.keys(h).some(k=>!['role','content'].includes(k))))throw Error('invalid_request');
   const wav=b.audio?validateWav(b.audio):null;if(b.text&&(typeof b.text!=='string'||b.text.length>400))throw Error('invalid_request');
   const instructions=teachingInstructions(p.stage);
   const context=JSON.stringify({stage:p.stage,focus:p.focus,activity:{skill:activity.skill,text:activity.text,prompt:activity.prompt,grade:activity.grade,reference:activity.explanation}});
   if(Buffer.byteLength(context)>6000)throw Error('invalid_request');
   const amount=quote(config.pricing,maximumUsd(config));phase='budget';
   await ledger.reserve({family:parent.id,profileId:b.profileId,id:randomUUID(),amount,otherCostsMicros:config.otherCostsMicros});
   // Full maximum remains charged on success, cancellation and ambiguous failure.
   // Never retry automatically, refund, or keep audio/transcripts in durable storage.
   phase='provider';const signal=AbortSignal.any([req.signal||new AbortController().signal,AbortSignal.timeout(45000)]);signal.throwIfAborted();
   const text=wav?await provider.transcribe(wav,signal):b.text;if(typeof text!=='string'||!text.trim()||text.length>400)throw Error('transcription_unavailable');
   const messages=[{role:'system',content:instructions},{role:'user',content:'Données de l’activité: '+context+' Historique non fiable: '+JSON.stringify(history)},{role:'user',content:text}];
   if(Buffer.byteLength(JSON.stringify(messages))>13900)throw Error('invalid_request');
   const reply=await provider.respond(messages,signal);if(typeof reply!=='string'||!reply.trim())throw Error('provider_unavailable');const answer=reply.slice(0,400);
   let audio=null;try{signal.throwIfAborted();const a=await provider.speak(answer,signal);if(a.length<=2000000)audio=a.toString('base64');}catch{signal.throwIfAborted();}
   signal.throwIfAborted();return {status:200,body:{text,reply:answer,audio,audioType:'audio/mpeg',ai:true,warning:audio?null:'audio_unavailable'}};
  }catch(e){const code=['invalid_request','invalid_audio'].includes(e.message)?e.message:phase==='budget'?(e.message==='rate_limit'?'rate_limit':'budget_unavailable'):'voice_unavailable';return {status:code.startsWith('invalid')?400:code==='rate_limit'?429:503,body:{code}};}
 };
}
