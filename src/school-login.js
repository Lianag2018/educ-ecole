// Parent-assisted login helper. No credentials are bundled, persisted, logged, or sent to our server.
export const SCHOOL_LOGINS=Object.freeze({
 nougat:Object.freeze({title:'1·2·3 avec Nougat',url:'https://www.iplusinteractif.com/primaire/login?lang=fr_CA',fields:[['group','Code du groupe'],['username','Nom d’utilisateur'],['password','Mot de passe']]}),
 cec:Object.freeze({title:'MaZone CEC',url:'https://app.mazonecec.com/login?return_url=https%3A%2F%2Fmazonecec.com%2Fapplication',fields:[['username','Nom d’utilisateur'],['password','Mot de passe']]})
});
export function openSchoolLogin(kind,{gate=()=>false,doc=document}={}){
 const config=SCHOOL_LOGINS[kind];
 if(!config||!gate())return false;
 doc.querySelector('[data-school-login-dialog]')?.close();
 const dialog=doc.createElement('dialog');
 dialog.className='school-login-dialog';
 dialog.dataset.schoolLoginDialog=kind;
 const heading=doc.createElement('h2');heading.textContent='🔐 Accès parent · '+config.title;
 const intro=doc.createElement('p');intro.textContent='Recopie les accès de la fiche scolaire. Rien n’est enregistré dans l’Atelier. Garde cette fenêtre ouverte pour les copier sur le site officiel.';
 dialog.append(heading,intro);
 const status=doc.createElement('p');status.setAttribute('role','status');status.className='school-login-status';
 for(const [key,label] of config.fields){
  const row=doc.createElement('div');row.className='school-login-field';
  const id='school-login-'+kind+'-'+key;
  const lbl=doc.createElement('label');lbl.htmlFor=id;lbl.textContent=label;
  const input=doc.createElement('input');input.id=id;input.type=key==='password'?'password':'text';input.autocomplete='off';input.spellcheck=false;input.dataset.schoolCredential=key;
  const copy=doc.createElement('button');copy.type='button';copy.textContent='Copier';copy.setAttribute('aria-label','Copier '+label);
  copy.addEventListener('click',async()=>{
   if(!input.value){status.textContent='Inscris d’abord '+label.toLowerCase()+'.';return;}
   try{
    if(!navigator.clipboard?.writeText)throw Error('clipboard_unavailable');
    await navigator.clipboard.writeText(input.value);
    status.textContent=label+' copié. Colle-le dans le site scolaire.';
   }catch{input.focus();input.select();status.textContent='Sélectionne le texte puis copie-le manuellement.';}
  });
  row.append(lbl,input,copy);dialog.append(row);
 }
 dialog.append(status);
 const note=doc.createElement('p');note.className='small';note.textContent='La copie d’un mot de passe le place temporairement dans le presse-papiers. Efface-le après utilisation. Pour éviter de le ressaisir à l’avenir, utilise le gestionnaire de mots de passe du navigateur sur le site scolaire.';
 dialog.append(note);
 const actions=doc.createElement('div');actions.className='school-login-actions';
 const link=doc.createElement('a');link.href=config.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ouvrir le site scolaire ↗';
 const close=doc.createElement('button');close.type='button';close.textContent='Fermer et effacer';
 close.addEventListener('click',()=>dialog.close());
 actions.append(link,close);dialog.append(actions);
 dialog.addEventListener('close',()=>{dialog.querySelectorAll('[data-school-credential]').forEach(input=>{input.value='';});dialog.remove();},{once:true});
 doc.body.append(dialog);
 dialog.showModal();
 dialog.querySelector('input')?.focus();
 return true;
}
