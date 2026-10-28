let current,busy=false;
const post=(path,body={})=>fetch('/api/parent/device/'+path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
function lock(value){busy=value;document.querySelectorAll('[data-device-action]').forEach(b=>{b.disabled=value;});}
export async function refreshFamilyDevice(){
 const box=current;if(!box)return;
 try{const r=await post('status'),data=await r.json();if(box!==current||!box.isConnected)return;
  box.querySelector('[data-device-status]').textContent=!r.ok?'L’activation serveur reste à terminer.':data.enabled?'Cet appareil peut sauvegarder les progrès sans reconnecter le parent.':'Cet appareil n’est pas autorisé à sauvegarder sans connexion parent.';
 }catch{if(box===current&&box.isConnected)box.querySelector('[data-device-status]').textContent='Statut indisponible. Les progrès locaux restent sur cet appareil.';}
}
export function mountFamilyDevice({onChange=()=>{}}={}){
 const panel=document.querySelector('.parent-login-slot')||document.querySelector('.parent');if(!panel)return;
 const box=document.createElement('section');box.className='panel';
 box.innerHTML='<h2>Appareil familial</h2><p>Après ta connexion parent, autorise cette tablette à sauvegarder les progrès pendant 90 jours. Les filles n’ont rien à saisir. Active aussi la sauvegarde de chaque enfant dans Parents → Progrès.</p><p>L’analyse en ligne des documents et le tuteur demandent toujours une connexion parent. La sauvegarde des réponses ne transmet pas les photos ni les codes d’accès.</p><button data-device-action="enable">Autoriser cet appareil pour 90 jours</button><button data-device-action="revoke">Retirer l’autorisation de cet appareil</button><button data-device-action="all">Retirer toutes les autorisations</button><p data-device-status role="status">Vérification de l’appareil…</p>';
 panel.append(box);current=box;lock(busy);refreshFamilyDevice();
 for(const button of box.querySelectorAll('[data-device-action]'))button.addEventListener('click',async()=>{
  if(busy)return;lock(true);const action=button.dataset.deviceAction;
  box.querySelector('[data-device-status]').textContent='Mise à jour en cours…';
  try{const r=await post(action==='all'?'revoke':action,action==='all'?{all:true}:{});
   if(!r.ok){box.querySelector('[data-device-status]').textContent=r.status===401?'Connecte le compte parent pour autoriser une tablette ou retirer toutes les autorisations.':'Modification non confirmée. Les progrès locaux sont conservés.';return;}
   onChange();await refreshFamilyDevice();
  }catch{box.querySelector('[data-device-status]').textContent='Modification non confirmée. Réessaie lorsque la connexion est rétablie.';}
  finally{lock(false);}
 });
}
