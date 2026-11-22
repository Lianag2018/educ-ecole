// Voix de conteuse en ligne pour les histoires de l'école : le texte d'UNE page (jamais d'enfant, jamais d'audio d'enfant) est lu avec la
// voix douce de conteuse des autres narrations (mêmes modèle, voix et consignes). Le résultat est gardé sur l'appareil par l'application.
// Conditions : appareil de la famille ou parent connecté, activation explicite par le parent (EDUC_STORY_VOICE_CONFIG), budget durable
// partagé avec les autres voix payantes. Rien n'est conservé sur le serveur. Ce point d'accès n'active ni ne modifie la conversation vocale.
import {randomUUID} from 'node:crypto';
import {quote} from './budget.mjs';
import {MODEL,VOICE,STORY_INSTRUCTIONS,storyCue} from '../narration-catalog.mjs';
export const MAX_STORY_CHARS=600;
export const storyVoiceReady=(story,voice)=>story?.enabled===true&&story.parentConsent===true&&Number.isSafeInteger(voice?.rates?.ttsMillionCharsMicros)&&voice.rates.ttsMillionCharsMicros>0&&Boolean(voice?.pricing);
// Noms seulement (jamais de valeur) des éléments qui manquent, pour que le parent sache quoi ajouter.
export const storyMissing=(story,voice,apiKey,ledger)=>{const m=[];
 if(!(story?.enabled===true&&story.parentConsent===true))m.push('EDUC_STORY_VOICE_CONFIG');
 if(!apiKey)m.push('EDUC_OPENAI_API_KEY');
 if(!(Number.isSafeInteger(voice?.rates?.ttsMillionCharsMicros)&&voice.rates.ttsMillionCharsMicros>0))m.push('EDUC_VOICE_CONFIG.rates.ttsMillionCharsMicros');
 if(!voice?.pricing)m.push('EDUC_VOICE_CONFIG.pricing');
 if(!ledger?.durable)m.push('registre du budget (Supabase)');
 return m;};
export const storyRequest=text=>({model:MODEL,voice:VOICE,input:text,instructions:STORY_INSTRUCTIONS+storyCue(text),response_format:'mp3',speed:.88});
export function createStoryVoiceEndpoint({auth,storyConfig,voiceConfig,ledger,apiKey,fetcher=fetch}){
 return async req=>{
  let phase='auth',missing;
  try{
   if(req.method!=='POST')return {status:405,body:{code:'method_not_allowed'}};
   const who=await auth?.authenticateLearner?.(req);if(!who?.id||!who.csrfVerified)return {status:401,body:{code:'parent_login_required'}};
   const b=req.body||{};
   if(Object.keys(b).some(k=>!['text','profileId'].includes(k))||!['p1','p2'].includes(b.profileId)||typeof b.text!=='string')throw Error('invalid_request');
   const text=b.text.normalize('NFC').trim();if(text.length<2||text.length>MAX_STORY_CHARS||/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))throw Error('invalid_request');
   phase='config';if(!apiKey||!storyVoiceReady(storyConfig,voiceConfig)||!ledger?.durable){missing=storyMissing(storyConfig,voiceConfig,apiKey,ledger);throw Error('story_voice_unavailable');}
   // Montant réservé = borne haute du prix du texte (tarif par million de caractères de la configuration); jamais remboursé, comme les autres voix.
   const usd=Math.max(1,Math.ceil(text.length*voiceConfig.rates.ttsMillionCharsMicros/1e6)),amount=quote(voiceConfig.pricing,usd);phase='budget';
   await ledger.reserve({family:who.id,profileId:b.profileId,id:randomUUID(),amount,otherCostsMicros:voiceConfig.otherCostsMicros});
   phase='provider';const signal=AbortSignal.any([req.signal||new AbortController().signal,AbortSignal.timeout(45000)]);
   const r=await fetcher('https://api.openai.com/v1/audio/speech',{method:'POST',redirect:'error',signal,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(storyRequest(text))});
   if(!r.ok){await r.body?.cancel?.();throw Error('provider_unavailable');}
   const audio=Buffer.from(await r.arrayBuffer());
   if(audio.length<1000||audio.length>3000000||!(audio.subarray(0,3).toString()==='ID3'||(audio[0]===255&&(audio[1]&224)===224)))throw Error('provider_unavailable');
   return {status:200,body:{audio:audio.toString('base64'),audioType:'audio/mpeg',ai:true}};
  }catch(e){
   const code=e.message==='invalid_request'?'invalid_request':e.message==='story_voice_unavailable'?'story_voice_unavailable':phase==='budget'?(e.message==='rate_limit'?'rate_limit':'budget_unavailable'):'voice_unavailable';
   return {status:code==='invalid_request'?400:code==='rate_limit'?429:503,body:missing?.length?{code,missing}:{code}};
  }
 };
}
