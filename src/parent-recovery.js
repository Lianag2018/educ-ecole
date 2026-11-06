// Credentials from Supabase's implicit recovery flow stay in memory only.
const fragment=new URLSearchParams(location.hash.slice(1));
let accessToken=fragment.get('type')==='recovery'?fragment.get('access_token'):null;
const linkError=fragment.has('error')||fragment.has('error_code');
history.replaceState(null,'',location.pathname);
const request=document.querySelector('#request-recovery'),reset=document.querySelector('#reset-password'),status=document.querySelector('#recovery-status');
const show=text=>{status.textContent=text;status.focus({preventScroll:true});status.scrollIntoView({block:'center'});};
if(accessToken){request.hidden=true;reset.hidden=false;}
else if(linkError)show('Ce lien a expiré ou a déjà été utilisé. Demande un nouveau lien ci-dessus.');
let busy=false;
async function post(path,body){const r=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.code||'unavailable');}
request.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;const button=request.querySelector('button');button.disabled=true;show('Demande en cours…');try{await post('/api/parent/recover',{email:request.elements.email.value.trim()});show('Si ce courriel correspond au compte parent, un lien de récupération a été envoyé. Vérifie aussi les indésirables.');}catch(e){show(e.message==='recovery_rate_limited'?'La limite temporaire d’envoi de courriels est atteinte. Aucun nouveau lien n’a été envoyé. Attends une heure avant de refaire une seule demande.':'Le service de récupération est indisponible. Aucun envoi n’a pu être confirmé. Réessaie plus tard.');}finally{busy=false;button.disabled=false;}};
reset.noValidate=true;
reset.onsubmit=async e=>{e.preventDefault();if(busy)return;const password=reset.elements.password.value;if(password.length<12||password.length>256){show('Choisis un mot de passe de 12 à 256 caractères.');return;}if(password!==reset.elements.confirmation.value){show('Les deux mots de passe doivent être identiques.');return;}busy=true;const button=reset.querySelector('button');button.disabled=true;show('Enregistrement en cours…');try{await post('/api/parent/reset-password',{accessToken,password});accessToken=null;reset.hidden=true;show('Mot de passe renouvelé. Tu es connecté : retourne à ton atelier pour parler avec la chouette.');}catch(e){if(e.message==='password_rejected')show('Ce mot de passe a été refusé. Choisis-en un autre et réessaie.');else{accessToken=null;reset.hidden=true;request.hidden=false;show('Ce lien est invalide ou a expiré. Demande un nouveau lien.');}}finally{reset.reset();busy=false;button.disabled=false;}};
