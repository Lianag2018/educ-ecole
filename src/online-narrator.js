// Même narratrice partout : pour un texte absent du catalogue préenregistré, on essaie d'abord la voix de conteuse en ligne
// (gardée dans l'appareil après la première fois). Si elle tarde, est refusée ou indisponible, la voix de l'appareil prend le relais
// tout de suite : l'enfant n'attend jamais plus que quelques secondes, et la phrase suivante sera déjà prête.
export class OnlineNarrator{
 constructor({device,getAudio,canUse=()=>true,AudioClass=globalThis.Audio,URLClass=globalThis.URL,waitMs=2500,setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}={}){
  Object.assign(this,{device,getAudio,canUse,AudioClass,URLClass,waitMs,setTimer,clearTimer});this.epoch=0;this.audio=null;this.url=null;this.mode='idle';
 }
 release(){if(this.audio){this.audio.onended=this.audio.onerror=this.audio.ontimeupdate=null;try{this.audio.pause();}catch{}this.audio=null;}if(this.url){try{this.URLClass.revokeObjectURL(this.url);}catch{}this.url=null;}}
 stop(){this.epoch++;this.clearTimer(this.timer);this.release();this.mode='idle';this.device?.stop?.();}
 pause(){if(this.mode==='online'&&this.audio){this.audio.pause();this.paused=true;this.options?.onState?.('paused','Lecture en pause.');return true;}return this.device?.pause?.()||false;}
 resume(){if(this.mode==='online'&&this.audio){this.paused=false;this.audio.play?.();this.options?.onState?.('speaking','La lecture reprend.');return true;}return this.device?.resume?.()||false;}
 setSpeed(value){if(this.mode!=='online')this.device?.setSpeed?.(value);}
 speak(text,options={}){
  this.stop();const epoch=this.epoch,t=String(text||'').trim(),onState=options.onState||(()=>{});this.options=options;
  const toDevice=()=>{if(this.epoch!==epoch)return;this.mode='device';this.device.speak(t,options);};
  if(options.deviceOnly||!this.getAudio||t.length<2||t.length>600||!this.canUse(t)){toDevice();return;}
  this.mode='pending';let settled=false;
  const settle=fn=>{if(settled||this.epoch!==epoch)return;settled=true;this.clearTimer(this.timer);fn();};
  this.timer=this.setTimer(()=>settle(toDevice),t.length<=25?Math.min(this.waitMs,700):this.waitMs);
  Promise.resolve().then(()=>this.getAudio(t)).catch(()=>null).then(data=>{
   if(!data?.bytes){settle(toDevice);return;}
   settle(()=>{
    let el,url;
    try{url=this.URLClass.createObjectURL(new Blob([data.bytes],{type:'audio/mpeg'}));el=new this.AudioClass(url);}catch{toDevice();return;}
    this.audio=el;this.url=url;this.mode='online';this.paused=false;
    el.ontimeupdate=()=>{if(this.epoch!==epoch||!(el.duration>0))return;options.onProgress?.({charIndex:Math.floor(el.currentTime/el.duration*t.length),timing:'estimate',approximate:true});};
    el.onended=()=>{if(this.epoch!==epoch)return;this.release();this.mode='idle';onState('ended','Lecture terminée — narratrice douce.');};
    el.onerror=()=>{if(this.epoch!==epoch)return;this.release();toDevice();};
    onState('starting','La narratrice se prépare…');
    Promise.resolve(el.play()).then(()=>{if(this.epoch===epoch)onState('speaking','Lecture en cours — narratrice douce.');}).catch(()=>{if(this.epoch===epoch){this.release();toDevice();}});
   });
  });
 }
}
