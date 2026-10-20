// Short, volatile conversation. Never localStorage; cleanup on profile/activity exit.
export class Conversation {
 constructor({request=fetch,microphone=()=>navigator.mediaDevices.getUserMedia({audio:true}),onState=()=>{}}={}){this.request=request;this.microphone=microphone;this.onState=onState;this.epoch=0;this.history=[];}
 state(s){this.onState(s);}
 release(){clearTimeout(this.timer);this.node?.disconnect();this.source?.disconnect();this.stream?.getTracks().forEach(t=>t.stop());this.context?.close().catch(()=>{});this.node=this.source=this.stream=this.context=null;}
 stop(){this.epoch++;this.abort?.abort();this.release();this.output?.pause();if(this.url)URL.revokeObjectURL(this.url);this.url=null;this.output=null;this.parts=[];this.state('Arrêté. Le microphone est fermé.');}
 reset(){this.stop();this.history=[];}
 async record(profileId,activityId){
  this.stop();globalThis.speechSynthesis?.cancel();const epoch=this.epoch;this.state('Autorisation du microphone…');
  try{
   const stream=await this.microphone();if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}
   this.stream=stream;const AC=globalThis.AudioContext||globalThis.webkitAudioContext;this.context=new AC();await this.context.resume();if(epoch!==this.epoch)return;
   if(![16000,24000,48000].includes(this.context.sampleRate))throw Error('sample_rate');
   this.rate=this.context.sampleRate;this.source=this.context.createMediaStreamSource(stream);this.node=this.context.createScriptProcessor(2048,1,1);this.parts=[];let length=0;
   this.node.onaudioprocess=e=>{const a=e.inputBuffer.getChannelData(0);const remaining=this.rate*10-length;if(remaining>0){const copy=a.slice(0,remaining);this.parts.push(copy);length+=copy.length;}if(length>=this.rate*10)this.finishRecording(profileId,activityId);};
   this.source.connect(this.node);this.node.connect(this.context.destination);this.state('Je t’écoute. Termine ta phrase (10 secondes maximum).');this.timer=setTimeout(()=>this.finishRecording(profileId,activityId),10000);
  }catch{if(epoch===this.epoch){this.release();this.state('Microphone indisponible. Tu peux écrire ta question.');}}
 }
 async finishRecording(profileId,activityId){
  if(!this.stream)return;const parts=this.parts;this.parts=[];const rate=this.rate;this.release();const n=parts.reduce((v,p)=>v+p.length,0);if(n<rate/10){this.state('Enregistrement trop court. Essaie encore ou écris.');return;}
  const wav=new ArrayBuffer(44+n*2),v=new DataView(wav);const str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);let offset=44;for(const a of parts)for(const x of a){v.setInt16(offset,Math.round(Math.max(-1,Math.min(1,x))*32767),true);offset+=2;}
  const bytes=new Uint8Array(wav);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return this.send({profileId,activityId,audio:btoa(binary)});
 }
 async send(body){
  this.stop();globalThis.speechSynthesis?.cancel();const epoch=this.epoch;this.abort=new AbortController();this.state('Transcription et réponse IA en cours…');
  try{const r=await this.request('/api/voice/turn',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},signal:this.abort.signal,body:JSON.stringify({...body,history:this.history})});const data=await r.json();if(epoch!==this.epoch)return;if(!r.ok)throw Error(data.code||'voice_unavailable');
   this.history=[...this.history,{role:'user',content:data.text},{role:'assistant',content:data.reply}].slice(-4);this.onState('Réponse IA : '+data.reply,data);
   if(data.audio){const bytes=Uint8Array.from(atob(data.audio),c=>c.charCodeAt(0));this.url=URL.createObjectURL(new Blob([bytes],{type:'audio/mpeg'}));this.output=new Audio(this.url);this.output.onended=()=>{if(epoch===this.epoch){URL.revokeObjectURL(this.url);this.url=null;}};try{await this.output.play();}catch{if(epoch===this.epoch)this.state('Réponse IA : '+data.reply+' — Lecture audio bloquée par le navigateur.');}}
   else this.state('Réponse IA : '+data.reply+' — Synthèse indisponible; réponse écrite conservée ici.');
  }catch(e){if(epoch===this.epoch)this.state(({parent_login_required:'Connexion parent requise.',budget_unavailable:'Budget indisponible ou plafond atteint. Aucun nouvel échange payant.',rate_limit:'Attendons un peu avant la prochaine question.'})[e.message]||'La conversation IA est indisponible. Tu peux utiliser les indices écrits locaux.');}
 }
}
export const conversation=new Conversation({onState:message=>{const el=document.querySelector('#conversation-state');if(el)el.textContent=message;}});
export function mountConversation(profile,activity){
 const panel=document.querySelector('.tutor');if(!panel)return;
 const box=document.createElement('div');box.innerHTML='<p>Conversation IA : la voix et le texte sont transmis au serveur puis à OpenAI après activation parent. Aucun score de prononciation. Une aide, sans remplacer ton enseignant.</p><button id="talk" disabled>Appuyer pour parler</button><button id="finish-talk" disabled>Terminer ma phrase</button><button id="cancel-talk">Interrompre / arrêter</button><form id="ask-tutor"><label>Ta question écrite <input name="question" maxlength="400" required></label><button disabled>Envoyer au tuteur IA</button></form><p id="conversation-state" role="status">Voix naturelle indisponible : vérification de la configuration serveur…</p>';
 panel.append(box);
 box.querySelector('#cancel-talk').onclick=()=>conversation.stop();box.querySelector('#finish-talk').onclick=()=>conversation.finishRecording(profile.id,activity.id);
 box.querySelector('#talk').onclick=()=>conversation.record(profile.id,activity.id);
 box.querySelector('form').onsubmit=e=>{e.preventDefault();conversation.send({profileId:profile.id,activityId:activity.id,text:e.target.elements.question.value});};
 fetch('/api/voice/status',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'}).then(r=>r.json()).then(s=>{if(!box.isConnected)return;const enabled=s.available&&s.authenticated;box.querySelector('#talk').disabled=!enabled;box.querySelector('#finish-talk').disabled=!enabled;box.querySelector('form button').disabled=!enabled;box.querySelector('#conversation-state').textContent=enabled?'Prêt. Écris ou appuie pour parler.':'Voix naturelle indisponible : activation serveur et connexion parent requises.';}).catch(()=>{if(box.isConnected)box.querySelector('#conversation-state').textContent='Conversation IA indisponible sur cet hébergement. Les indices locaux fonctionnent.';});
}
export function mountParentLogin(){
 const panel=document.querySelector('.parent');if(!panel)return;const box=document.createElement('section');box.className='panel';box.innerHTML='<h2>Connexion parent pour le tuteur IA</h2><p>Compte parent réel sur le serveur dédié. Les profils locaux restent accessibles sur cet appareil. Le niveau et l’objectif du tuteur viennent des profils validés côté serveur; les réglages ci-dessus restent locaux.</p><form><label>Courriel <input type="email" name="email" autocomplete="username" required></label><label>Mot de passe <input type="password" name="password" autocomplete="current-password" required></label><button>Se connecter</button></form><button id="logout-parent">Déconnecter le tuteur</button><p role="status"></p>';panel.append(box);
 box.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=e.target;const button=f.querySelector('button');button.disabled=true;try{const r=await fetch('/api/parent/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.elements.email.value,password:f.elements.password.value})});box.querySelector('[role=status]').textContent=r.ok?'Parent connecté pour une heure.':'Connexion impossible ou activation serveur manquante.';}catch{box.querySelector('[role=status]').textContent='Serveur indisponible.';}finally{f.elements.password.value='';button.disabled=false;}};
 box.querySelector('#logout-parent').onclick=async()=>{conversation.reset();try{const r=await fetch('/api/parent/logout',{method:'POST',credentials:'same-origin'});box.querySelector('[role=status]').textContent=r.ok?'Tuteur déconnecté.':'Déconnexion serveur non confirmée.';}catch{box.querySelector('[role=status]').textContent='Déconnexion serveur non confirmée.';}};
}
