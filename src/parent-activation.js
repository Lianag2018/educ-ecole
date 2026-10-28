// Keep the one-use invitation in memory only, never localStorage or a request URL.
const tokenHash=new URLSearchParams(location.hash.slice(1)).get('token');
history.replaceState(null,'',location.pathname);
const form=document.querySelector('#activate-parent'),status=document.querySelector('#activation-status');
if(!/^[a-f0-9]{32,128}$/i.test(tokenHash||'')){form.hidden=true;status.textContent='Ouvre le lien d’activation reçu par courriel. Si ton compte est déjà activé, connecte-toi dans l’espace parent.';}
let busy=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 if(form.elements.password.value!==form.elements.confirmation.value){status.textContent='Les deux mots de passe doivent être identiques.';return;}
 busy=true;form.querySelector('button').disabled=true;status.textContent='Activation en cours…';
 try{
  const r=await fetch('/api/parent/activate',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({tokenHash,password:form.elements.password.value,rememberDevice:form.elements.rememberDevice.checked})});
  const data=await r.json();
  if(!r.ok)throw Error(data.code==='password_rejected'?'password_rejected':'activation_failed');
  form.hidden=true;status.textContent=data.deviceEnabled?'Compte activé et appareil autorisé pour 90 jours. Dans Parents → Progrès, active la sauvegarde pour chaque enfant.':'Compte activé. Dans Parents → Progrès, active la sauvegarde pour chaque enfant. Tu peux aussi autoriser ta tablette dans les réglages parent.';
 }catch(e){status.textContent=e.message==='password_rejected'?'Ce mot de passe a été refusé ou le serveur est indisponible. Choisis un mot de passe plus long et réessaie dans les dix minutes.':'Activation non confirmée. Si le lien a déjà été utilisé, essaie ton mot de passe dans l’espace parent. Sinon, demande une nouvelle invitation.';}
 finally{form.elements.password.value='';form.elements.confirmation.value='';busy=false;form.querySelector('button').disabled=false;}
});
