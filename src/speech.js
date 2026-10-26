import {mathSpeech} from './math-speech.js';
// Only join visual syllable separators in syllable activities: maths keeps its operators.
export function spokenActivity(activity) {
 const text=String(activity.spokenText??activity.text??'');
 return activity.skill==='syllabes' ? text.replace(/\s*\+\s*/gu,'') : mathSpeech(text);
}
export function chooseReadingVoice(voices, preferredURI='') {
 const french=voices.filter(v=>/^fr(?:-|_)/i.test(v.lang));
 const preferred=french.find(v=>v.voiceURI===preferredURI);
 if(preferred)return preferred;
 // Voice APIs expose no gender. Prefer familiar French voice names when present;
 // the parent can choose another voice after listening on the actual device.
 const score=v=>(/^fr[-_]CA$/i.test(v.lang)?100:0)+(/am[eé]lie|julie|sylvie|ch[aâ]ntal/i.test(v.name)?40:0)+(/enhanced|premium|améliorée/i.test(v.name)?10:0);
 return french.slice().sort((a,b)=>score(b)-score(a))[0];
}

export const playbackSpeed = value => value==='very-slow' ? .8 : Number.isFinite(Number(value)) && Number(value)>0 ? Math.max(.6,Math.min(1.5,Number(value))) : 1;
// Keep explicit legacy phonics pacing; ordinary narration starts at the native rate.
export const readingRate = mode => mode==='very-slow' ? .45 : playbackSpeed(mode);

// Keep the utterance alive and isolate callbacks from stopped/replaced readings.
export class ReadingSpeaker {
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}={}) {
  Object.assign(this,{synth,Utterance,setTimer,clearTimer});this.epoch=0;this.current=null;
 }
 stop(){this.epoch++;this.clearTimer(this.timer);this.current=null;this.synth?.cancel();}
 setSpeed(speed){
  if(!this.current||!this.resumeOptions)return;
  const text=this.resumeText,offset=this.resumeOffset||0,options=this.resumeOptions;
  this.speak(text.slice(offset),{...options,speed,onProgress:e=>options.onProgress?.({...e,charIndex:e.charIndex+offset})});
 }
 speak(text,{preferredURI='',speed,systemVoice=false,onState=()=>{},onProgress=()=>{}}={}) {
  this.stop();text=mathSpeech(text);this.resumeText=String(text);this.resumeOffset=0;this.resumeOptions={preferredURI,systemVoice,onState,onProgress};const epoch=this.epoch;
  if(!this.synth||!this.Utterance){onState('error','Lecture audio indisponible ici. Ouvre l’application dans Safari.');return;}
  const voice=chooseReadingVoice(this.synth.getVoices(),systemVoice?'':preferredURI);
  // iOS Safari can report zero voices until its synthesizer initializes. In that case,
  // request fr-CA explicitly rather than refusing to speak. Never choose an English-only voice.
  if(!voice&&this.synth.getVoices().length){onState('error','Aucune voix française disponible. Un adulte peut ajouter une voix française dans les réglages de l’appareil, puis réessayer.');return;}
  const u=new this.Utterance(String(text));this.current=u;
  u.lang=voice?.lang||'fr-CA';if(voice)u.voice=voice;
  u.rate=readingRate(speed);u.pitch=1;u.volume=1;
  const label=voice?`${voice.name} · ${voice.lang}`:'Voix système · français canadien demandé';
  const active=()=>this.epoch===epoch&&this.current===u;
  const fail=message=>{if(!active())return;this.stop();onState('error',message);};
  u.onstart=()=>{if(!active())return;this.clearTimer(this.timer);onState('speaking',`Lecture en cours — ${label}.`);};
  u.onboundary=e=>{if(active()&&Number.isInteger(e.charIndex)){this.resumeOffset=e.charIndex;onProgress({charIndex:e.charIndex,approximate:false});}};
  u.onend=()=>{if(!active())return;this.clearTimer(this.timer);this.current=null;onState('ended',`Lecture terminée — ${label}.`);};
  u.onerror=e=>fail(e.error==='not-allowed'?'Lecture bloquée par le navigateur. Touche « Tester la voix » pour la relancer.':'La voix sélectionnée est indisponible. Touche « Réessayer avec la voix système ».');
  this.timer=this.setTimer(()=>fail('La lecture ne démarre pas. Réessaie avec la voix système et vérifie le volume de l’appareil.'),8000);
  // Stay in the tap handler: deferring speak can lose Safari user activation.
  try{if(this.synth.paused)this.synth.resume();this.synth.speak(u);if(active())onState('starting',`Démarrage de la lecture — ${label}.`);}catch{fail('Le navigateur ne peut pas démarrer la voix. Touche « Réessayer avec la voix système ».');}
 }
}
