import * as storage from './school-photo-store.js';
import {PHOTO_GAMES,PHOTO_KINDS,PHOTO_BATCH_LIMIT,photoAssociation} from './school-photo-store.js';
import {prepareSchoolPhoto,photoPreviewFallback} from './school-photo-image.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const subjects=['Français','Maths','Univers social'];
export function photoWeek(date=new Date()){
 const d=new Date(date);d.setDate(d.getDate()-(d.getDay()+6)%7);
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function schoolPhotosPanel(p,{parent=true}={}){
 return `<section class="panel school-photos" id="school-photos" aria-labelledby="school-photos-title"><h${parent?2:1} id="school-photos-title">📷 ${parent?'Ajouter des photos de devoirs':'Mes photos de devoirs'}</h${parent?2:1}><p>Pour ${esc(p.name)} · ${esc(p.schoolContext?.stage)}</p>${parent?`<p>Feuille de la semaine, mots à pratiquer ou pages de cahier : choisis des photos ou prends-en une avec ton téléphone. Associe chaque photo à sa semaine et à son jeu.</p><details><summary>Conserver seulement des photos · sans analyse IA</summary><form data-photo-form><div class="photo-pickers"><label>Choisir mes photos<input data-photo-files type="file" accept="image/jpeg,image/png,image/webp" multiple></label><label>Prendre une photo<input data-photo-camera type="file" accept="image/jpeg,image/png,image/webp" capture="environment"></label></div><p class="small">JPG, PNG ou WebP · ${PHOTO_BATCH_LIMIT} photos à la fois · 15 Mo maximum par photo. Pour un fichier HEIC, exporte-le en JPG.</p><div data-photo-rows></div><button type="submit" data-photo-save disabled>Enregistrer les photos</button></form></details><p class="small">Photos converties en JPEG et réduites avant enregistrement. Le fichier original n’est pas conservé. Photos enregistrées dans ce navigateur, sur cet appareil. Elles ne sont pas envoyées à OpenAI par ce formulaire et ne se synchronisent pas. Leur ajout ne valide aucun devoir. Utilise « Photo → activités » ci-dessus pour une préparation automatique.</p>`:'<p>Retrouve la photo ajoutée par ton parent, puis ouvre le jeu associé pour pratiquer.</p>'}<p data-photo-status role="status" aria-live="polite"></p><div data-photo-list><p>Recherche des photos enregistrées…</p></div>${parent?'<details><summary>Photos archivées · restaurer une photo</summary><div data-photo-archive></div></details>':''}</section>`;
}
function errorText(error){return ({photos_required:`Choisis de 1 à ${PHOTO_BATCH_LIMIT} photos.`,photo_invalid:'Cette photo ne peut pas être lue. Choisis un JPG, PNG ou WebP lisible, de moins de 15 Mo.',photo_too_detailed:'Cette photo reste trop volumineuse. Recadre une seule page, puis réessaie pour garder le texte lisible.',association_invalid:'Pour chaque photo, indique un titre, la semaine, la matière et le jeu correspondant.',storage_full:'Il manque de la place sur cet appareil. Les photos déjà enregistrées sont conservées.',storage_unavailable:'Le navigateur refuse l’enregistrement des photos. Les anciennes données sont conservées; essaie hors navigation privée.',storage_blocked:'Ferme les autres onglets de l’Atelier, puis réessaie.'})[error?.message]||'Les photos n’ont pas pu être ajoutées. Tes données précédentes sont conservées.';}
export function photoSizeLabel(photo){const bytes=Number(photo.bytes)||0,original=Number(photo.originalBytes)||bytes,reduction=original>bytes?Math.floor(100*(1-bytes/original)):0;return `JPEG optimisé · ${Math.ceil(bytes/1024)} Ko${photo.width?' · '+photo.width+' × '+photo.height:''}${reduction?' · '+reduction+' % de place économisée':''}`;}
const gameOptions=subject=>'<option value="">Choisir le jeu associé</option>'+Object.entries(PHOTO_GAMES).filter(([,g])=>g.subject===subject).map(([id,g])=>`<option value="${id}">${esc(g.label)}</option>`).join('');
export function mountSchoolPhotos(root,p,{parent=true,services={},onPractice=()=>{}}={}){
 if(!root||!['p1','p2'].includes(p?.id))return {destroy(){}};
 const api={...storage,...services},form=root.querySelector('[data-photo-form]'),rows=root.querySelector('[data-photo-rows]'),status=root.querySelector('[data-photo-status]'),list=root.querySelector('[data-photo-list]'),archive=root.querySelector('[data-photo-archive]');
 let alive=true,files=[],busy=false,epoch=0;const previews=new Set(),savedUrls=new Set();
 const message=text=>{if(alive)status.textContent=text;};
 function revoke(urls){for(const url of urls)URL.revokeObjectURL(url);urls.clear();}
 const picker=()=>root.querySelector('[data-photo-files]'),camera=()=>root.querySelector('[data-photo-camera]');
 function choose(ev){
  if(busy)return;const selected=Array.from(ev.target.files||[]);if(!selected.length)return;
  try{
   if(selected.length>PHOTO_BATCH_LIMIT)throw Error('photos_required');
   if(selected.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||!f.size||f.size>15000000))throw Error('photo_invalid');
   revoke(previews);files=selected;rows.innerHTML=files.map((file,index)=>{
    const url=URL.createObjectURL(file);previews.add(url);
    return `<fieldset data-photo-row><legend>Photo ${index+1} · association au jeu</legend><img class="photo-preview" data-preview-url="${url}" alt="Aperçu de la photo ${index+1}"><p>Enfant : <strong>${esc(p.name)}</strong></p><label>Titre de la photo<input data-photo-title maxlength="120" value="Photo de devoir ${index+1}" required></label><label>Document<select data-photo-kind>${Object.entries(PHOTO_KINDS).map(([id,label])=>`<option value="${id}">${esc(label)}</option>`).join('')}</select></label><div class="photo-association"><label>Semaine du<input data-photo-week type="date" value="${photoWeek()}" required></label><label>Matière<select data-photo-subject required><option value="">Choisir la matière</option>${subjects.map(s=>`<option>${s}</option>`).join('')}</select></label><label>Associer au jeu<select data-photo-game required><option value="">Choisis d’abord la matière</option></select></label></div><label>Notion ou pages à travailler<input data-photo-note maxlength="300" placeholder="Ex. : mots de la semaine, Nougat page 34"></label></fieldset>`;
   }).join('');
   rows.querySelectorAll('.photo-preview').forEach((img,index)=>{const file=files[index];photoPreviewFallback(img,file,()=>alive&&files[index]===file&&img.isConnected);img.src=img.dataset.previewUrl;});
   rows.querySelectorAll('[data-photo-subject]').forEach(select=>select.onchange=()=>{select.closest('[data-photo-row]').querySelector('[data-photo-game]').innerHTML=gameOptions(select.value);});
   root.querySelector('[data-photo-save]').disabled=false;message('Vérifie la ligne d’association de chaque photo, puis enregistre.');
  }catch(error){ev.target.value='';files=[];rows.innerHTML='';revoke(previews);root.querySelector('[data-photo-save]').disabled=true;message(errorText(error));}
 }
 async function load(){
  const token=++epoch;
  try{
   const photos=await api.listSchoolPhotos(p.id,{includeArchived:parent});if(!alive||token!==epoch)return;
   revoke(savedUrls);list.innerHTML='';if(archive)archive.innerHTML='';
   const visible=photos.filter(r=>!r.archived);if(!visible.length)list.innerHTML='<p>Aucune photo ajoutée pour cet enfant.</p>';
   for(const photo of photos){
    const destination=photo.archived?archive:list;if(!destination)continue;
    const article=document.createElement('article');article.className='school-photo-card';
    article.innerHTML=`<h3>${esc(photo.title)}</h3><p class="photo-association-line">${esc(p.name)} → semaine du ${esc(photo.week)} → ${esc(photo.subject)} → <strong>${esc(PHOTO_GAMES[photo.game]?.label)}</strong></p><p>${esc(PHOTO_KINDS[photo.kind])}${photo.note?' · '+esc(photo.note):''}</p><div data-photo-image><p>Chargement de la photo…</p></div><div class="photo-actions">${!photo.archived?`<button type="button" data-photo-practice>Pratiquer · ${esc(PHOTO_GAMES[photo.game]?.label)}</button>`:''}${parent?`<button type="button" data-photo-toggle>${photo.archived?'Restaurer la photo':'Archiver la photo'}</button>`:''}</div>`;
    const size=document.createElement('p');size.className='small';size.textContent=photoSizeLabel(photo);article.append(size);destination.append(article);
    article.querySelector('[data-photo-practice]')?.addEventListener('click',()=>onPractice(photo.game));
    article.querySelector('[data-photo-toggle]')?.addEventListener('click',async ev=>{
     const button=ev.currentTarget;button.disabled=true;try{await api.archiveSchoolPhoto(p.id,photo.id,!photo.archived);if(!alive)return;message(photo.archived?'Photo restaurée.':'Photo archivée. Tu peux la restaurer plus bas.');await load();}catch(error){message(errorText(error));}finally{if(alive)button.disabled=false;}
    });
    const blob=await api.getSchoolPhoto(p.id,photo.id);if(!alive||token!==epoch)return;
    const image=article.querySelector('[data-photo-image]');
    if(blob){const url=URL.createObjectURL(blob);savedUrls.add(url);image.innerHTML=`<details><summary>Ouvrir la photo</summary><img class="school-photo-full" alt="${esc(photo.title)}"><a href="${url}" download="devoir-${esc(photo.week)}.jpg">Télécharger la photo</a></details>`;const preview=image.querySelector('.school-photo-full');photoPreviewFallback(preview,blob,()=>alive&&token===epoch&&preview.isConnected);preview.src=url;}
    else image.textContent='La copie de cette photo est indisponible sur cet appareil.';
   }
   if(archive&&!photos.some(r=>r.archived))archive.innerHTML='<p>Aucune photo archivée.</p>';
  }catch(error){if(alive&&token===epoch){list.innerHTML='<p>Les photos ne peuvent pas être lues ici pour le moment.</p>';message(errorText(error));}}
 }
 async function submit(ev){
  ev.preventDefault();if(busy)return;
  if(!files.length){message(errorText(Error('photos_required')));return;}
  const rowList=[...rows.querySelectorAll('[data-photo-row]')];
  let associations;
  try{associations=rowList.map(row=>photoAssociation({profileId:p.id,title:row.querySelector('[data-photo-title]').value,kind:row.querySelector('[data-photo-kind]').value,week:row.querySelector('[data-photo-week]').value,subject:row.querySelector('[data-photo-subject]').value,game:row.querySelector('[data-photo-game]').value,note:row.querySelector('[data-photo-note]').value},p.id));}catch(error){message(errorText(error));return;}
  busy=true;form.querySelectorAll('input,select,button').forEach(el=>el.disabled=true);message('Préparation et enregistrement des photos…');
  try{
   const prepared=[];
   for(let i=0;i<files.length;i++){
    const image=await (services.preparePhoto||prepareSchoolPhoto)(files[i]);if(!alive)return;
    prepared.push({...associations[i],...image});
   }
   await api.saveSchoolPhotos(p.id,prepared);if(!alive)return;
   files=[];rows.innerHTML='';picker().value='';camera().value='';revoke(previews);message(`${prepared.length} photo${prepared.length>1?'s':''} enregistrée${prepared.length>1?'s':''} avec leur association. Retrouve-les aussi dans son monde, sous « Mes photos de devoirs ».`);await load();
  }catch(error){message(errorText(error));}
  finally{busy=false;if(alive){form.querySelectorAll('input,select,button').forEach(el=>el.disabled=false);root.querySelector('[data-photo-save]').disabled=!files.length;}}
 }
 if(parent){picker().addEventListener('change',choose);camera().addEventListener('change',choose);form.addEventListener('submit',submit);}
 load();return {refresh:load,destroy(){alive=false;epoch++;revoke(previews);revoke(savedUrls);if(parent){picker()?.removeEventListener('change',choose);camera()?.removeEventListener('change',choose);form?.removeEventListener('submit',submit);}}};
}
