import {connectGrok,prepareGrokAudio} from './grok-audio.js';
// Session credentials and audio stay in memory. No automatic microphone access.
const labels={reading:'Je lis avec la maîtresse',owl:'Parler avec la chouette',number:'Lis ce nombre à voix haute'};
const sessionErrors={
 parent_login_required:'La connexion parent a expiré. Touche « Connexion parent pour la voix ». Microphone fermé.',
 profile_forbidden:'Ce profil n’est pas prêt pour la voix. Microphone fermé.',
 invalid_request:'Cette activité ne peut pas démarrer la voix. Microphone fermé.',
 grok_setup_required:'Le service vocal n’est pas prêt. Microphone fermé.',
 budget_unavailable:'La séance n’a pas pu être autorisée par le service vocal. Microphone fermé.',
 grok_provider_unavailable:'Le serveur n’a pas pu ouvrir la séance Grok. Microphone fermé.',
};
function startError(phase,error,code){
 if(phase==='microphone'){
  if(['NotAllowedError','PermissionDeniedError','SecurityError'].includes(error?.name))return 'L’accès au microphone a été refusé. Autorise le micro dans les réglages de ce site, puis touche le bouton. Microphone fermé.';
  if(['NotFoundError','DevicesNotFoundError'].includes(error?.name))return 'Aucun microphone n’est disponible sur cet appareil. Microphone fermé.';
  if(['NotReadableError','TrackStartError'].includes(error?.name))return 'Le microphone ne peut pas démarrer. Ferme les autres appels ou enregistrements, puis réessaie. Microphone fermé.';
  return 'Le navigateur n’a pas pu ouvrir le microphone. Ouvre ce site directement dans Safari ou Chrome et autorise le micro. Microphone fermé.';
 }
 if(phase==='audio')return 'Le navigateur n’a pas pu démarrer le son. Recharge la page, puis touche le bouton. Microphone fermé.';
 if(phase==='session')return Object.hasOwn(sessionErrors,code)?sessionErrors[code]:'La séance vocale n’a pas pu être créée. Vérifie la connexion Internet, puis réessaie. Microphone fermé.';
 return 'La connexion vocale a échoué. Vérifie la connexion Internet, puis réessaie. Microphone fermé.';
}
export class GrokLive {
 constructor({request=fetch,microphone=()=>navigator.mediaDevices.getUserMedia({audio:true}),connect,prepareAudio,onState=()=>{},onAuthRequired=()=>{},startTimeoutMs=30000}={}){
  Object.assign(this,{request,microphone,connect,prepareAudio,onState,onAuthRequired,startTimeoutMs});this.epoch=0;this.available=false;
 }
 emit(message){this.onState(message);}
 stop(message='Arrêté. Le microphone est fermé.'){
  this.epoch++;clearTimeout(this.timer);this.abort?.abort();this.abort=null;
  this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;
  this.connection?.close();this.connection=null;this.audioLease?.close();this.audioLease=null;this.emit(message);
 }
 async start(context){
  if(!this.available)return;
  this.stop();const epoch=this.epoch;this.abort=new AbortController();let phase='audio',code;
  this.timer=setTimeout(()=>{if(epoch===this.epoch)this.stop('Le démarrage a pris trop de temps. Touche le bouton pour réessayer et autorise le micro si demandé. Microphone fermé.');},this.startTimeoutMs);
  try{
   this.audioLease=this.prepareAudio?.();
   // Request permission in the original tap, before any network await. No
   // samples are processed or sent until the server authorizes this session.
   phase='microphone';this.emit('Autorise le microphone si le navigateur le demande…');
   const stream=await this.microphone();if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;
   phase='audio';await this.audioLease?.resumed;if(epoch!==this.epoch)return;
   phase='session';this.emit('Micro ouvert. Connexion à la maîtresse…');
   const response=await this.request('/api/voice/grok/session',{method:'POST',credentials:'same-origin',signal:this.abort.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(context)});
   const session=await response.json();if(epoch!==this.epoch)return;
   if(!response.ok){code=session?.code;if(code==='parent_login_required'){this.available=false;this.onAuthRequired();}throw Error('unavailable');}
   if(!response.ok||!Number.isInteger(session.durationSeconds)||session.durationSeconds<1||session.durationSeconds>180)throw Error('unavailable');
   // A server deadline is mandatory. This timer only cleans up the local device.
   phase='connection';
   if(!this.connect)throw Error('transport_missing');
   const connection=await this.connect(session,stream,{onMessage:message=>{if(epoch===this.epoch)this.emit(message);},signal:this.abort.signal,audioLease:this.audioLease,onClose:()=>{if(epoch===this.epoch)this.stop('La connexion vocale est terminée. Microphone fermé.');}});
   if(epoch!==this.epoch){connection.close();return;}
   this.connection=connection;clearTimeout(this.timer);this.timer=setTimeout(()=>this.stop('La séance est terminée. Le microphone est fermé.'),session.durationSeconds*1000);
   this.emit('Je t’écoute. Tu peux arrêter quand tu veux.');
  }catch(error){if(epoch===this.epoch)this.stop(startError(phase,error,code));}
 }
}
export const grokLive=new GrokLive({connect:connectGrok,prepareAudio:prepareGrokAudio});
export function grokMarkup(mode){return `<section class="grok-live" data-grok-mode="${mode}" aria-label="Aide vocale"><button type="button" data-grok-start disabled>${labels[mode]}</button> <button type="button" data-grok-stop>Arrêter</button><button type="button" data-grok-parent hidden>Connexion parent pour la voix</button><p data-grok-state role="status">Préparation de la voix Grok. Microphone fermé.</p></section>`;}
export function mountGrok(root,context,{beforeStart=()=>{},onParent=()=>{}}={}){
 if(!root)return;
 const start=root.querySelector('[data-grok-start]'),status=root.querySelector('[data-grok-state]');
 const parent=root.querySelector('[data-grok-parent]');
 parent.onclick=()=>{grokLive.stop();onParent();};
 let destroyed=false;const abort=new AbortController();
 const update=message=>{if(!destroyed)status.textContent=message;};grokLive.onState=update;grokLive.available=false;
 grokLive.onAuthRequired=()=>{if(!destroyed){parent.hidden=false;start.disabled=true;}};
 root.querySelector('[data-grok-stop]').onclick=()=>grokLive.stop();
 start.onclick=()=>{beforeStart();grokLive.start(typeof context==='function'?context():context);};
 fetch('/api/voice/grok/status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}',signal:abort.signal})
  .then(r=>{if(!r.ok)throw Error('status');return r.json();}).then(s=>{
   if(destroyed)return;grokLive.available=s.available===true&&s.authenticated===true;start.disabled=!grokLive.available;
   parent.hidden=s.authenticated===true;
   update(grokLive.available?'Voix envoyée à xAI pendant la séance. Touche pour commencer; Arrêter ferme le micro.':s.authenticated!==true?'Connexion parent requise pour parler. Touche « Connexion parent pour la voix ». Microphone fermé.':'La voix Grok est indisponible pour le moment. Tu peux utiliser Écouter. Microphone fermé.');
  }).catch(()=>{if(!destroyed)update('Voix Grok indisponible. Microphone fermé.');});
 return {destroy(){destroyed=true;abort.abort();grokLive.stop();grokLive.available=false;}};
}

