// Recorded phonemes only: never synthesize a letter name as an audio fallback.
// Les enregistrements de consonnes de l'Université Laval sont de la forme « a-consonne-a » (ex. « acha »). Pour ces sons, on joue
// la version isolée (sans les voyelles autour) : « chhhh », « ssss », « mmmm ». Les originaux restent inchangés (voir solo-sources.json).
export const SOLO_PHONEMES=Object.freeze(['ch','s','z','j','f','v','m','n','r']);
export const phonemeSrc=id=>SOLO_PHONEMES.includes(id)?`/icons/phonemes/${id}-solo.mp3`:`/icons/phonemes/${id}.mp3`;
import {stretchSamples,trimSilence,normalize,defaultStretchMs} from './sound-stretch.js';
import {getRecording,stretchMsFor} from './sound-bank.js';
// Lecture : les sons se jouent étirés (environ 1 s) quand le navigateur sait faire du Web Audio; sinon on joue l'enregistrement tel quel.
// Un enregistrement de la famille (laboratoire des sons) remplace celui de l'application.
export class PhonemePlayer {
 constructor({createAudio,onState=()=>{},webAudio}={}){this.useWebAudio=webAudio??(!createAudio&&Boolean(globalThis.AudioContext||globalThis.webkitAudioContext));this.createAudio=createAudio||(src=>new Audio(src));this.onState=onState;this.epoch=0;this.audio=null;this.ctx=null;this.source=null;this.cache=new Map();}
 stop(){this.epoch++;if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;}if(this.source){try{this.source.onended=null;this.source.stop();}catch{}this.source=null;}this.onState('idle');}
 context(){if(!this.ctx){const C=globalThis.AudioContext||globalThis.webkitAudioContext;this.ctx=new C();}if(this.ctx.state==='suspended')this.ctx.resume?.();return this.ctx;}
 async decode(id){
  const ctx=this.context(),custom=await getRecording(id);
  const bytes=custom?(custom.arrayBuffer?await custom.arrayBuffer():custom):await (await fetch(phonemeSrc(id))).arrayBuffer();
  const buf=await new Promise((res,rej)=>ctx.decodeAudioData(bytes.slice(0),res,rej));
  return {samples:buf.getChannelData(0),rate:buf.sampleRate,custom:Boolean(custom)};
 }
 // Prépare les échantillons à jouer (pour l'écoute dans le laboratoire aussi).
 async prepare(id,ms){
  const {samples,rate,custom}=await this.decode(id);
  const base=custom?normalize(trimSilence(samples,rate)):samples;
  const target=custom?0:(ms??stretchMsFor(id,defaultStretchMs(id)));
  return {out:target>0?stretchSamples(base,rate,target):Float32Array.from(base),rate};
 }
 async playWebAudio(id,epoch,ms){
  this.onState('loading');
  const key=id+'|'+(ms??'');let data=this.cache.get(key);
  if(!data){data=await this.prepare(id,ms);if(this.cache.size>60)this.cache.clear();this.cache.set(key,data);}
  if(epoch!==this.epoch)return;
  const ctx=this.context(),buf=ctx.createBuffer(1,data.out.length,data.rate);buf.copyToChannel(data.out,0);
  const src=ctx.createBufferSource();src.buffer=buf;src.connect(ctx.destination);this.source=src;
  src.onended=()=>{if(epoch===this.epoch)this.onState('ended');};
  src.start();this.onState('playing');
 }
 clearCache(){this.cache.clear();}
 async play(id,ms){
  this.stop();const epoch=this.epoch;
  if(!/^[a-z][a-z-]*$/.test(id)){this.onState('error');return;}
  if(this.useWebAudio){try{await this.playWebAudio(id,epoch,ms);return;}catch{if(epoch!==this.epoch)return;}}
  const audio=this.createAudio(phonemeSrc(id));this.audio=audio;
  const update=state=>{if(epoch===this.epoch)this.onState(state);};
  audio.onplaying=()=>update('playing');audio.onended=()=>update('ended');audio.onerror=()=>update('error');
  audio.preload='auto';audio.playbackRate=1;this.onState('loading');
  try{await audio.play();}catch{update('error');}
 }
}
