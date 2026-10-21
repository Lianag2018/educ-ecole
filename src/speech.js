// Only join visual syllable separators in syllable activities: maths keeps its operators.
export function spokenActivity(activity) {
 const text=String(activity.text??'');
 return activity.skill==='syllabes' ? text.replace(/\s*\+\s*/gu,'') : text;
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

export const readingRate = mode => mode==='very-slow' ? .45 : .65;

// Keep the utterance alive and isolate callbacks from stopped/replaced readings.
export class ReadingSpeaker {
 constructor({synth=globalThis.speechSynthesis,Utterance=globalThis.SpeechSynthesisUtterance,setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}={}) {
  Object.assign(this,{synth,Utterance,setTimer,clearTimer});this.epoch=0;this.current=null;
 }
 stop(){this.epoch++;this.clearTimer(this.timer);this.current=null;this.synth?.cancel();}
 speak(text,{preferredURI='',speed,systemVoice=false,onState=()=>{}}={}) {
  this.stop();const epoch=this.epoch;
  if(!this.synth||!this.Utterance){onState('error','Lecture audio indisponible ici. Ouvre l’application dans Safari.');return;}
  const voice=systemVoice||!preferredURI?undefined:chooseReadingVoice(this.synth.getVoices(),preferredURI);
  const u=new this.Utterance(String(text));this.current=u;
  u.lang=voice?.lang||'fr-CA';if(voice)u.voice=voice;
  u.rate=readingRate(speed);u.pitch=1;u.volume=1;
  const label=voice?`${voice.name} · ${voice.lang}`:'Voix système · français canadien demandé';
  const active=()=>this.epoch===epoch&&this.current===u;
  const fail=message=>{if(!active())return;this.stop();onState('error',message);};
  u.onstart=()=>{if(!active())return;this.clearTimer(this.timer);onState('speaking',`Lecture en cours — ${label}.`);};
  u.onend=()=>{if(!active())return;this.clearTimer(this.timer);this.current=null;onState('ended',`Lecture terminée — ${label}.`);};
  u.onerror=e=>fail(e.error==='not-allowed'?'Lecture bloquée par le navigateur. Touche « Tester la voix » pour la relancer.':'La voix sélectionnée est indisponible. Touche « Réessayer avec la voix système ».');
  this.timer=this.setTimer(()=>fail('La lecture ne démarre pas. Réessaie avec la voix système et vérifie le volume de l’appareil.'),8000);
  // Stay in the tap handler: deferring speak can lose Safari user activation.
  try{if(this.synth.paused)this.synth.resume();this.synth.speak(u);if(active())onState('starting',`Démarrage de la lecture — ${label}.`);}catch{fail('Le navigateur ne peut pas démarrer la voix. Touche « Réessayer avec la voix système ».');}
 }
}
