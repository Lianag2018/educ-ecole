// Même narratrice partout : pour un texte absent du catalogue préenregistré, on joue la voix de conteuse en ligne quand elle est
// DÉJÀ prête (gardée dans l'appareil), au moment même du toucher. Sinon la voix de l'appareil parle immédiatement (Safari exige que
// la lecture démarre dans le geste de l'enfant : jamais d'attente) et la voix en ligne se prépare en arrière-plan pour la fois suivante.
export class OnlineNarrator{
 constructor({device,peek,warm,canUse=()=>true,AudioClass=globalThis.Audio,URLClass=globalThis.URL}={}){
  Object.assign(this,{device,peek,warm,canUse,AudioClass,URLClass});this.epoch=0;this.audio=null;this.url=null;this.mode='idle';
 }
 release(){if(this.audio){this.audio.onended=this.audio.onerror=this.audio.ontimeupdate=null;try{this.audio.pause();}catch{}this.audio=null;}if(this.url){try{this.URLClass.revokeObjectURL(this.url);}catch{}this.url=null;}}
 stop(){this.epoch++;this.release();this.mode='idle';this.device?.stop?.();}
 pause(){if(this.mode==='online'&&this.audio){this.audio.pause();this.paused=true;this.options?.onState?.('paused','Lecture en pause.');return true;}return this.device?.pause?.()||false;}
 resume(){if(this.mode==='online'&&this.audio){this.paused=false;this.audio.play?.();this.options?.onState?.('speaking','La lecture reprend.');return true;}return this.device?.resume?.()||false;}
 setSpeed(value){if(this.mode!=='online')this.device?.setSpeed?.(value);}
 speak(text,options={}){
  this.stop();const epoch=this.epoch,t=String(text||'').trim(),onState=options.onState||(()=>{});this.options=options;
  const toDevice=()=>{if(this.epoch!==epoch)return;this.mode='device';this.device.speak(t,options);};
  if(options.deviceOnly||t.length<2||t.length>600||!this.canUse(t)){toDevice();return;}
  const bytes=this.peek?.(t);
  if(!bytes){try{this.warm?.(t);}catch{}toDevice();return;}
  let el,url;
  try{url=this.URLClass.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));el=new this.AudioClass(url);}catch{toDevice();return;}
  this.audio=el;this.url=url;this.mode='online';this.paused=false;
  el.ontimeupdate=()=>{if(this.epoch!==epoch||!(el.duration>0))return;options.onProgress?.({charIndex:Math.floor(el.currentTime/el.duration*t.length),timing:'estimate',approximate:true});};
  el.onended=()=>{if(this.epoch!==epoch)return;this.release();this.mode='idle';onState('ended','Lecture terminée — narratrice douce.');};
  el.onerror=()=>{if(this.epoch!==epoch)return;this.release();toDevice();};
  onState('starting','La narratrice commence…');
  let started;try{started=el.play();}catch{this.release();toDevice();return;}
  Promise.resolve(started).then(()=>{if(this.epoch===epoch)onState('speaking','Lecture en cours — narratrice douce.');}).catch(()=>{if(this.epoch===epoch){this.release();toDevice();}});
 }
}
