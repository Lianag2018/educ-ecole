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
 // Voice APIs expose no gender. Prefer a soft, natural French voice: Canadian French first, neural
 // ("Natural", "Online") and enhanced voices over compact ones, familiar soft female names over
 // known male or robotic voices. The parent can still choose another voice on the actual device.
 const score=v=>(/^fr[-_]CA$/i.test(v.lang)?100:0)
  +(/natural|neural|online/i.test(v.name)?60:0)
  +(/enhanced|premium|améliorée|siri/i.test(v.name)?30:0)
  +(/sylvie|am[eé]lie|julie|ch[aâ]ntal|denise|[ée]loise|audrey|aur[eé]lie|marie|google fran/i.test(v.name)?40:0)
  -(/antoine|thomas|paul|claude|henri|jean|mathieu|nicolas|daniel|bernard|fabrice|pierre|compact|espeak/i.test(v.name)?80:0);
 return french.slice().sort((a,b)=>score(b)-score(a))[0];
}

export const playbackSpeed = value => value==='very-slow' ? .8 : Number.isFinite(Number(value)) && Number(value)>0 ? Math.max(.6,Math.min(1.5,Number(value))) : 1;
// A system voice reads a little slower than its native rate: soft and clear for a child. No speed control is shown.
export const GENTLE_SYSTEM_SPEED = .88;
// Voix du système plus douce : un peu plus grave et un peu moins forte (certaines voix ignorent la hauteur; le débit reste respecté).
export const GENTLE_SYSTEM_PITCH = .94, GENTLE_SYSTEM_VOLUME = .9;
// Keep explicit legacy phonics pacing; ordinary narration starts at the native rate.
export const readingRate = mode => mode==='very-slow' ? .45 : playbackSpeed(mode);

// Keep the utterance alive and isolate callbacks from stopped/replaced readings.
export class ReadingSpeaker {
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}={}) {
  Object.assign(this,{synth,Utterance,setTimer,clearTimer});this.epoch=0;this.current=null;
 }
 stop(){this.epoch++;this.clearTimer(this.timer);this.current=null;this.paused=false;this.armStartup=null;this.synth?.cancel();}
 pause(){if(!this.current||!this.synth?.pause)return false;this.paused=true;this.clearTimer(this.timer);this.synth.pause();this.resumeOptions?.onState?.('paused','Lecture en pause.');return true;}
 resume(){if(!this.current||!this.synth?.resume)return false;this.paused=false;if(!this.started)this.armStartup?.();this.synth.resume();this.resumeOptions?.onState?.(this.started?'speaking':'starting','La lecture reprend.');return true;}
 setSpeed(speed){
  if(!this.current||!this.resumeOptions)return;
  const text=this.resumeText,offset=this.resumeOffset||0,options=this.resumeOptions,paused=this.paused;
  this.speak(text.slice(offset),{...options,speed,onProgress:e=>options.onProgress?.({...e,charIndex:e.charIndex+offset})});
  if(paused)this.pause();
 }
 speak(text,{preferredURI='',speed,natural=false,systemVoice=false,onState=()=>{},onProgress=()=>{}}={}) {
  this.stop();text=mathSpeech(text);this.resumeText=String(text);this.resumeOffset=0;this.resumeOptions={preferredURI,natural,systemVoice,onState,onProgress};const epoch=this.epoch;
  if(!this.synth||!this.Utterance){onState('error','Lecture audio indisponible ici. Ouvre l’application dans Safari.');return;}
  const voice=chooseReadingVoice(this.synth.getVoices(),systemVoice?'':preferredURI);
  // iOS Safari can report zero voices until its synthesizer initializes. In that case,
  // request fr-CA explicitly rather than refusing to speak. Never choose an English-only voice.
  if(!voice&&this.synth.getVoices().length){onState('error','Aucune voix française disponible. Un adulte peut ajouter une voix française dans les réglages de l’appareil, puis réessayer.');return;}
  const u=new this.Utterance(String(text));this.current=u;this.started=false;
  u.lang=voice?.lang||'fr-CA';if(voice)u.voice=voice;
  const pace=speed===undefined?GENTLE_SYSTEM_SPEED:speed;u.rate=natural?playbackSpeed(pace):readingRate(pace);u.pitch=GENTLE_SYSTEM_PITCH;u.volume=GENTLE_SYSTEM_VOLUME;
  const label=voice?`${voice.name} · ${voice.lang}`:'Voix système · français canadien demandé';
  const active=()=>this.epoch===epoch&&this.current===u;
  const fail=message=>{if(!active())return;this.stop();onState('error',message);};
  u.onstart=()=>{if(!active())return;this.started=true;this.clearTimer(this.timer);if(this.paused){this.synth.pause();return;}onState('speaking',`Lecture en cours — ${label}.`);};
  u.onboundary=e=>{if(active()&&Number.isInteger(e.charIndex)){this.resumeOffset=e.charIndex;onProgress({charIndex:e.charIndex,timing:'word',approximate:false});}};
  u.onend=()=>{if(!active())return;this.clearTimer(this.timer);this.current=null;onState('ended',`Lecture terminée — ${label}.`);};
  u.onerror=e=>fail(e.error==='not-allowed'?'Lecture bloquée par le navigateur. Touche « Tester la voix » pour la relancer.':'La voix sélectionnée est indisponible. Touche « Réessayer avec la voix système ».');
  this.armStartup=()=>{this.clearTimer(this.timer);this.timer=this.setTimer(()=>fail('La lecture ne démarre pas. Réessaie avec la voix système et vérifie le volume de l’appareil.'),8000);};
  this.armStartup();
  // Stay in the tap handler: deferring speak can lose Safari user activation.
  try{if(this.synth.paused)this.synth.resume();this.synth.speak(u);if(active())onState('starting',`Démarrage de la lecture — ${label}.`);}catch{fail('Le navigateur ne peut pas démarrer la voix. Touche « Réessayer avec la voix système ».');}
 }
}
