import {numberWords} from './numbers.js';
// Same-origin prerecorded OpenAI narration. No user text or microphone data is sent.
export class NarrationSpeaker {
 constructor({fallback,AudioClass=globalThis.Audio,fetcher=globalThis.fetch}={}){
  this.fallback=fallback;this.clips={};this.epoch=0;this.audio=AudioClass?new AudioClass():null;
  if(this.audio){this.audio.preload='auto';this.audio.setAttribute?.('playsinline','');}
  this.ready=fetcher('/audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.version===1)this.clips=m.clips||{};}).catch(()=>{});
 }
 stop(){this.epoch++;this.fallback?.stop();if(this.audio){this.audio.pause();this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;this.audio.removeAttribute?.('src');} }
 speak(text,options={}){
  this.stop();const epoch=this.epoch,raw=String(text).trim(),key=/^\d{1,4}$/.test(raw)&&Number(raw)<=1999?numberWords(Number(raw)):raw,parts=this.clips[key]?[key]:key.split('. ').filter(Boolean);
  const files=parts.map(p=>this.clips[p]);
  if(options.systemVoice||options.preferredURI||!this.audio||!files.length||files.some(f=>!f||!/^[a-f0-9]{64}\.mp3$/.test(f))){this.fallback.speak(text,options);return;}
  const onState=options.onState||(()=>{}),audio=this.audio;let index=0;
  const active=()=>this.epoch===epoch;
  const fail=()=>{if(active()){this.stop();onState('error','Touche Écouter pour relancer la narratrice. Vérifie aussi le volume.');}};
  const play=()=>{if(!active())return;audio.src='/audio/'+files[index];audio.playbackRate=options.speed==='very-slow'?.8:1;audio.volume=1;audio.muted=false;try{const promise=audio.play();promise?.catch(fail);}catch{fail();}};
  audio.onplaying=()=>{if(active())onState('speaking','Narratrice IA · français québécois · lecture douce.');};
  audio.onerror=fail;
  audio.onended=()=>{if(!active())return;if(++index<files.length)play();else onState('ended','À ton tour! Tu peux réécouter aussi souvent que tu veux.');};
  play();if(active())onState('starting','La narratrice commence…');
 }
}
