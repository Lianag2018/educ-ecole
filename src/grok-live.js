import {connectGrok,prepareGrokAudio} from './grok-audio.js';
// Session credentials and audio stay in memory. No automatic microphone access.
const labels={reading:'Je lis avec la maîtresse',owl:'Parler avec la chouette',number:'Lis ce nombre à voix haute'};
export class GrokLive {
 constructor({request=fetch,microphone=()=>navigator.mediaDevices.getUserMedia({audio:true}),connect,prepareAudio,onState=()=>{}}={}){
  Object.assign(this,{request,microphone,connect,prepareAudio,onState});this.epoch=0;this.available=false;
 }
 emit(message){this.onState(message);}
 stop(message='Arrêté. Le microphone est fermé.'){
  this.epoch++;clearTimeout(this.timer);this.abort?.abort();this.abort=null;
  this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;
  this.connection?.close();this.connection=null;this.audioLease?.close();this.audioLease=null;this.emit(message);
 }
 async start(context){
  if(!this.available)return;
  this.stop();const epoch=this.epoch;this.abort=new AbortController();this.emit('Connexion à la maîtresse…');
  try{
   this.audioLease=this.prepareAudio?.();
   const response=await this.request('/api/voice/grok/session',{method:'POST',credentials:'same-origin',signal:this.abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(context)});
   const session=await response.json();if(epoch!==this.epoch)return;
   if(!response.ok||!Number.isInteger(session.durationSeconds)||session.durationSeconds<1||session.durationSeconds>180)throw Error('unavailable');
   // A server deadline is mandatory. This timer only cleans up the local device.
   if(!this.connect)throw Error('transport_missing');
   this.emit('Autorisation du microphone…');
   const stream=await this.microphone();if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;
   const connection=await this.connect(session,stream,{onMessage:message=>{if(epoch===this.epoch)this.emit(message);},signal:this.abort.signal,audioLease:this.audioLease,onClose:()=>{if(epoch===this.epoch)this.stop();}});
   if(epoch!==this.epoch){connection.close();return;}
   this.connection=connection;this.timer=setTimeout(()=>this.stop('La séance est terminée. Le microphone est fermé.'),session.durationSeconds*1000);
   this.emit('Je t’écoute. Tu peux arrêter quand tu veux.');
  }catch{if(epoch===this.epoch)this.stop('La voix Grok est indisponible. Le microphone est fermé.');}
 }
}
export const grokLive=new GrokLive({connect:connectGrok,prepareAudio:prepareGrokAudio});
export function grokMarkup(mode){return `<section class="grok-live" data-grok-mode="${mode}" aria-label="Aide vocale"><button type="button" data-grok-start disabled>${labels[mode]}</button> <button type="button" data-grok-stop>Arrêter</button><p data-grok-state role="status">Préparation de la voix Grok. Microphone fermé.</p></section>`;}
export function mountGrok(root,context,{beforeStart=()=>{}}={}){
 if(!root)return;
 const start=root.querySelector('[data-grok-start]'),status=root.querySelector('[data-grok-state]');
 let destroyed=false;const abort=new AbortController();
 const update=message=>{if(!destroyed)status.textContent=message;};grokLive.onState=update;grokLive.available=false;
 root.querySelector('[data-grok-stop]').onclick=()=>grokLive.stop();
 start.onclick=()=>{beforeStart();grokLive.start(typeof context==='function'?context():context);};
 fetch('/api/voice/grok/status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}',signal:abort.signal})
  .then(r=>{if(!r.ok)throw Error('status');return r.json();}).then(s=>{
   if(destroyed)return;grokLive.available=s.available===true&&s.authenticated===true;start.disabled=!grokLive.available;
   update(grokLive.available?'Voix envoyée à xAI pendant la séance. Touche pour commencer; Arrêter ferme le micro.':'La voix Grok se prépare. Pour le moment, utilise Écouter et les indices. Microphone fermé.');
  }).catch(()=>{if(!destroyed)update('Voix Grok indisponible. Microphone fermé.');});
 return {destroy(){destroyed=true;abort.abort();grokLive.stop();grokLive.available=false;}};
}

