// A private, on-device photo viewer for school access sheets.
// Photos are never uploaded, persisted, or included in the app bundle.
export const SCHOOL_HELP=Object.freeze({
 nougat:{title:'1·2·3 avec Nougat',url:'https://www.iplusinteractif.com/primaire/login?lang=fr_CA'},
 cec:{title:'MaZone CEC',url:'https://app.mazonecec.com/login?return_url=https%3A%2F%2Fmazonecec.com%2Fapplication'}
});
export function showSchoolHelp(kind,{doc=globalThis.document,openWindow=(...args)=>globalThis.window?.open(...args)}={}){
 const info=SCHOOL_HELP[kind];if(!info||!doc)return false;
 const dialog=doc.createElement('dialog');dialog.className='school-help-dialog school-photo-dialog';
 let photoData=null,photoWindow=null;
 const title=doc.createElement('h2');title.textContent='📷 Ma fiche d’accès · '+info.title;
 const intro=doc.createElement('p');intro.textContent='Choisis la photo de la fiche de l’école sur ton appareil. Elle reste privée et ne quitte pas cet appareil.';
 const layout=doc.createElement('div');layout.className='school-photo-layout';
 const preview=doc.createElement('div');preview.className='school-photo-preview';
 const image=doc.createElement('img');image.alt='Photo de ma fiche scolaire';image.hidden=true;
 const empty=doc.createElement('p');empty.textContent='La photo apparaîtra ici, agrandissable.';
 preview.append(empty,image);
 const controls=doc.createElement('div');controls.className='school-photo-controls';
 const label=doc.createElement('label');label.textContent='Choisir une photo';
 const file=doc.createElement('input');file.type='file';file.accept='image/*';file.setAttribute('aria-label','Choisir une photo de la fiche scolaire');
 label.append(file);
 const status=doc.createElement('p');status.setAttribute('role','status');
 const beside=doc.createElement('button');beside.type='button';beside.textContent='Afficher la photo à côté';beside.disabled=true;
 file.addEventListener('change',()=>{
  const selected=file.files?.[0];if(!selected)return;
  if(!selected.type.startsWith('image/')||selected.size>10*1024*1024){status.textContent='Choisis une image de moins de 10 Mo.';return;}
  const reader=new FileReader();
  reader.onload=()=>{
   if(!dialog.isConnected)return;
   photoData=String(reader.result||'');image.src=photoData;image.hidden=false;empty.hidden=true;beside.disabled=false;
   status.textContent='Photo prête. Tu peux l’afficher à côté du site scolaire.';
  };
  reader.onerror=()=>{status.textContent='Impossible de lire cette photo.';};
  reader.readAsDataURL(selected);
 });
 beside.addEventListener('click',()=>{
  if(!photoData)return;
  const popup=openWindow('','fiche-acces-scolaire','popup,width=470,height=700');
  if(!popup){status.textContent='Fenêtre bloquée. La photo reste visible ici; autorise les fenêtres surgissantes pour l’afficher à côté.';return;}
  photoWindow=popup;
  const d=popup.document;d.title='Ma fiche scolaire · lecture privée';d.body.replaceChildren();
  d.body.style.cssText='margin:0;padding:12px;background:#f7f3fa;text-align:center';
  const photo=d.createElement('img');photo.src=photoData;photo.alt='Fiche scolaire';photo.style.cssText='max-width:100%;height:auto';
  d.body.append(photo);popup.focus();
 });
 const site=doc.createElement('a');site.href=info.url;site.target='_blank';site.rel='noopener noreferrer';site.textContent='Ouvrir '+info.title+' ↗';
 const close=doc.createElement('button');close.type='button';close.textContent='Fermer';close.addEventListener('click',()=>dialog.close());
 controls.append(label,beside,site,close,status);layout.append(preview,controls);dialog.append(title,intro,layout);
 dialog.addEventListener('close',()=>{photoData=null;image.removeAttribute('src');file.value='';try{photoWindow?.close();}catch{}dialog.remove();},{once:true});
 doc.body.append(dialog);dialog.showModal();return true;
}
