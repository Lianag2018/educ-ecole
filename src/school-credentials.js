// Values stay only in the mounted parent view, never in localStorage or backups.
let cleanups=[];
export function clearSchoolCredentials(){for(const item of cleanups)item.clear();}
export function mountSchoolCredentials(root,profiles,{fetcher=globalThis.fetch,clipboard=globalThis.navigator?.clipboard}={}){
 for(const item of cleanups.splice(0))item.dispose();
 const host=root.querySelector('.school-access-settings');if(!host)return;
 for(const p of profiles){
  const resource=p.id==='p1'?'nougat':p.id==='p2'?'cec':null;if(!resource)continue;
  const box=host.ownerDocument.createElement('section');box.className='private-school-access';box.dataset.privateAccess=p.id;
  const title=host.ownerDocument.createElement('h3');title.textContent='Accès privé · '+p.name+' · '+(resource==='nougat'?'Nougat':'MaZone CEC');box.append(title);
  const open=host.ownerDocument.createElement('button');open.type='button';open.textContent='Consulter les identifiants';box.append(open);
  const status=host.ownerDocument.createElement('p');status.setAttribute('role','status');box.append(status);
  const fields=host.ownerDocument.createElement('div');box.append(fields);host.append(box);
  let ticket=0,timer;
  const clear=()=>{ticket++;clearTimeout(timer);fields.querySelectorAll('input').forEach(input=>{input.value='';});fields.replaceChildren();open.disabled=false;};
  const conceal=()=>{clear();status.textContent='Identifiants masqués.';};
  const visibility=()=>{if(host.ownerDocument.visibilityState==='hidden')conceal();};
  host.ownerDocument.addEventListener('visibilitychange',visibility);
  cleanups.push({clear:conceal,dispose:()=>{clear();host.ownerDocument.removeEventListener('visibilitychange',visibility);}});
  open.addEventListener('click',async()=>{
   clear();const active=++ticket;open.disabled=true;status.textContent='Chargement des accès privés…';
   try{
    const r=await fetcher('/api/parent/school-access',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileId:p.id,resource})});
    if(active!==ticket||!box.isConnected)return;
    if(!r.ok){status.textContent=r.status===401?'Connecte-toi à ton compte parent dans cette section, puis réessaie.':r.status===404?'Identifiants non encore enregistrés pour cet accès.':'Accès privé indisponible. Réessaie plus tard.';return;}
    const data=await r.json();if(active!==ticket||!box.isConnected)return;
    for(const [key,label] of [['group','Code du groupe'],['username','Nom d’utilisateur'],['password','Mot de passe']]){
     if(typeof data.values?.[key]!=='string')continue;
     const row=host.ownerDocument.createElement('label');row.textContent=label;
     const input=host.ownerDocument.createElement('input');input.readOnly=true;input.type=key==='password'?'password':'text';input.value=data.values[key];input.autocomplete='off';row.append(input);
     const copy=host.ownerDocument.createElement('button');copy.type='button';copy.textContent='Copier';copy.setAttribute('aria-label','Copier '+label.toLowerCase());copy.addEventListener('click',async()=>{try{await clipboard.writeText(input.value);status.textContent='Copié.';}catch{status.textContent='Copie indisponible sur cet appareil.';}});row.append(copy);
     if(key==='password'){const show=host.ownerDocument.createElement('button');show.type='button';show.textContent='Afficher';show.addEventListener('click',()=>{input.type=input.type==='password'?'text':'password';show.textContent=input.type==='password'?'Afficher':'Masquer';});row.append(show);}
     fields.append(row);
    }
    const hide=host.ownerDocument.createElement('button');hide.type='button';hide.textContent='Masquer les identifiants';hide.addEventListener('click',conceal);fields.append(hide);
    status.textContent='Accès privé chargé. Masquage automatique dans une minute.';timer=setTimeout(conceal,60000);
   }catch{if(active===ticket&&box.isConnected)status.textContent='Accès privé indisponible. Réessaie plus tard.';}
   finally{if(active===ticket)open.disabled=false;}
  });
 }
}
