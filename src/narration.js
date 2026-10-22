import {playbackSpeed} from './speech.js';
import {numberWords,numberParts} from './numbers.js';
const numberByWords=new Map(Array.from({length:2000},(_,n)=>[numberWords(n),n]));
// Same-origin prerecorded OpenAI narration. No user text or microphone data is sent.
export class NarrationSpeaker {
 constructor({fallback,AudioClass=globalThis.Audio,fetcher=globalThis.fetch}={}){
  this.fallback=fallback;this.clips={};this.alignments={};this.epoch=0;this.audio=AudioClass?new AudioClass():null;
  if(this.audio){this.audio.preload='auto';this.audio.setAttribute?.('playsinline','');}
  this.alignmentReady=fetcher('/audio/alignment.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.version===1)this.alignments=m.clips||{};}).catch(()=>{});
  this.ready=fetcher('/audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.version===1)this.clips=m.clips||{};}).catch(()=>{});
 }
 stop(){this.epoch++;this.fallback?.stop();if(this.audio){this.audio.pause();this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;this.audio.ontimeupdate=null;this.audio.removeAttribute?.('src');} }
 setSpeed(value){this.speed=playbackSpeed(value);if(this.audio){this.audio.playbackRate=this.speed;this.audio.preservesPitch=true;}if(this.usingFallback)this.fallback?.setSpeed?.(value);}
 speak(text,options={}){
  this.stop();this.usingFallback=false;this.setSpeed(options.speed);const epoch=this.epoch,raw=String(text).trim(),key=/^\d{1,4}$/.test(raw)&&Number(raw)<=1999?numberWords(Number(raw)):raw,parts=this.clips[key]?[key]:key.split('. ').filter(Boolean);
  const files=parts.flatMap(p=>this.clips[p]?[this.clips[p]]:numberByWords.has(p)?numberParts(numberByWords.get(p)).map(s=>this.clips[s]):[undefined]);
  if(options.systemVoice||options.preferredURI||!this.audio||!files.length||files.some(f=>!f||!/^[a-f0-9]{64}\.mp3$/.test(f))){this.usingFallback=true;this.fallback.speak(text,options);return;}
  const onState=options.onState||(()=>{}),audio=this.audio;let index=0;
  const active=()=>this.epoch===epoch;
  const fail=()=>{if(active()){this.stop();onState('error','Touche Écouter pour relancer la narratrice. Vérifie aussi le volume.');}};
  const play=()=>{if(!active())return;audio.src='/audio/'+files[index];audio.playbackRate=this.speed;audio.preservesPitch=true;audio.volume=1;audio.muted=false;try{const promise=audio.play();promise?.catch(fail);}catch{fail();}};
  audio.onplaying=()=>{if(active()){onState('speaking','Narratrice IA · français québécois · lecture douce.');progress();}};
  // Use media time: slowing, buffering, seeking and replay cannot drift from audio.
  const progress=()=>{
   if(!active()||files.length!==1||!Number.isFinite(audio.duration)||audio.duration<=0)return;
   const aligned=this.alignments[files[0]],cues=aligned?.text===key?aligned.cues:null;
   if(Array.isArray(cues)&&cues.length){
    const time=audio.currentTime;let cue=null;
    for(const c of cues){if(c.start>time)break;cue=c;}
    options.onProgress?.({charIndex:cue?(time>=cue.end&&/^[,!.?…]/.test(key.slice(cue.charEnd))?cue.charEnd:cue.charIndex):-1,charEnd:cue?.charEnd,approximate:false});
   }else options.onProgress?.({progress:audio.currentTime/audio.duration,approximate:true});
  };
  audio.ontimeupdate=progress;
  audio.onerror=fail;
  audio.onended=()=>{if(!active())return;if(++index<files.length)play();else onState('ended','À ton tour! Tu peux réécouter aussi souvent que tu veux.');};
  play();if(active())onState('starting','La narratrice commence…');
 }
}
