// Keep the one-use invitation in memory only, never localStorage or a request URL.
const tokenHash=new URLSearchParams(location.hash.slice(1)).get('token');
history.replaceState(null,'',location.pathname);
const form=document.querySelector('#activate-parent'),status=document.querySelector('#activation-status');
if(!/^[a-f0-9]{32,128}$/i.test(tokenHash||'')){form.hidden=true;status.textContent='Ouvre le lien d’activation reçu par courriel. Si ton compte est déjà activé, connecte-toi dans l’espace parent.';}
// Native validation can silently prevent submit in mobile embedded browsers.
// Keep HTML constraints for no-JS clients; use explicit, visible feedback here.
form.noValidate=true;
const password=form.elements.password,confirmation=form.elements.confirmation;
const hint=document.querySelector('#password-hint');
const showMessage=message=>{status.textContent=message;status.focus({preventScroll:true});status.scrollIntoView({block:'center',behavior:'auto'});};
const updateHint=()=>{hint.textContent=password.value.length<12?`Mot de passe : ${password.value.length}/12 caractères minimum.`:'Longueur suffisante. Confirme le même mot de passe.';};
password.addEventListener('input',updateHint);password.addEventListener('change',updateHint);updateHint();
let busy=false;
form.addEventListener('submit',async event=>{
 event.preventDefault();if(busy)return;
 updateHint();
 if(password.value.length<12){showMessage('Ton mot de passe doit contenir au moins 12 caractères. Il en manque '+(12-password.value.length)+'.');return;}
 if(password.value.length>256){showMessage('Ton mot de passe doit contenir au maximum 256 caractères.');return;}
 if(!confirmation.value){showMessage('Confirme ton mot de passe dans le deuxième champ.');return;}
 if(password.value!==confirmation.value){showMessage('Les deux mots de passe doivent être identiques. Vérifie le deuxième champ.');return;}
 busy=true;form.querySelector('button').disabled=true;showMessage('Activation en cours…');
 try{
  const r=await fetch('/api/parent/activate',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({tokenHash,password:form.elements.password.value,rememberDevice:form.elements.rememberDevice.checked})});
  const data=await r.json();
  if(!r.ok)throw Error(data.code==='password_rejected'?'password_rejected':'activation_failed');
  form.hidden=true;status.textContent=data.deviceEnabled?'Compte activé et appareil autorisé pour 90 jours. Dans Parents → Progrès, active la sauvegarde pour chaque enfant.':'Compte activé. Dans Parents → Progrès, active la sauvegarde pour chaque enfant. Tu peux aussi autoriser ta tablette dans les réglages parent.';
 }catch(e){status.textContent=e.message==='password_rejected'?'Ce mot de passe a été refusé ou le serveur est indisponible. Choisis un mot de passe plus long et réessaie dans les dix minutes.':'Activation non confirmée. Si le lien a déjà été utilisé, essaie ton mot de passe dans l’espace parent. Sinon, demande une nouvelle invitation.';}
 finally{status.focus({preventScroll:true});status.scrollIntoView({block:'center',behavior:'auto'});form.elements.password.value='';form.elements.confirmation.value='';busy=false;form.querySelector('button').disabled=false;}
});
