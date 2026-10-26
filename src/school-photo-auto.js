import {prepareSchoolPhoto} from './school-photo-image.js';
import {saveSchoolPhotos} from './school-photo-store.js';
import {preparePhoto,installPlan} from './school-plan.js';
import {photoWeek} from './school-photos.js';
export function automaticPhotosPanel(){return `<section class="panel" id="automatic-homework"><h2>📷 Photo → activités</h2><p>Choisis le profil et la semaine, puis ajoute les feuilles. La préparation se poursuit automatiquement.</p><label>Semaine du <input data-auto-week type="date" value="${photoWeek()}" required></label><p>En utilisant ce bouton, tu envoies les photos sélectionnées à OpenAI pour extraire les devoirs de cet enfant. Recadre les noms, coordonnées et signatures. Une copie JPEG reste sur cet appareil; seules les notions sont sauvegardées sur le serveur privé. Connexion parent et budget disponibles requis.</p><label class="homework-pick">Ajouter les photos et préparer les jeux<input data-auto-files type="file" accept="image/jpeg,image/png,image/webp" multiple></label><p data-auto-status role="status" aria-live="polite">Jusqu’à 8 photos. Les passages illisibles ne sont jamais devinés.</p><button type="button" data-auto-open hidden>Voir les activités préparées</button></section>`;}
export const autoPhotoError=code=>({parent_login_required:'Photos conservées ici. Connecte le compte parent pour permettre l’analyse.',plan_unavailable:'Photos conservées ici. Le service privé OpenAI n’est pas activé; aucune analyse confirmée.',budget_unavailable:'Photos conservées ici. Budget indisponible ou atteint; aucune nouvelle tentative automatique.',unclear_plan:'Photo conservée. Devoir illisible ou semaine différente : aucune activité inventée.',invalid_plan:'Extraction refusée par les contrôles; les activités précédentes sont conservées.',plan_full:'La semaine contient déjà 12 tâches. Les nouvelles tâches ne remplacent pas les anciennes.',profile_mismatch:'Le profil reçu ne correspond pas à cet enfant.',photos_required:'Choisis entre 1 et 8 photos.',photo_invalid:'Photo illisible ou format refusé. Choisis un JPG, PNG ou WebP.',association_invalid:'Choisis une semaine valide avant d’ajouter les photos.',storage_unavailable:'Le navigateur refuse le stockage local. Aucune analyse lancée.',photo_too_detailed:'Photo trop détaillée : recadre une seule page.'})[code]||'Préparation interrompue. Les photos déjà enregistrées et les activités précédentes sont conservées.';
export async function processHomeworkPhotos({files,profile,week,signal,prepare=prepareSchoolPhoto,encode=preparePhoto,store=saveSchoolPhotos,request,save,progress=()=>{},onStored=()=>{}}){
 if(!files.length||files.length>8)throw Error('photos_required');
 const active=()=>{if(signal.aborted)throw Error('aborted');};
 active();const prepared=[];
 for(const file of files){prepared.push({...await prepare(file),profileId:profile.id,week,subject:'Plan scolaire',game:'plan',kind:'week',title:'Devoirs de la semaine',note:''});active();}
 await store(profile.id,prepared);active();await onStored();active();progress('Photos enregistrées. Vérification du service privé…');
 const status=await request('/api/plans/status',{profileId:profile.id});active();
 if(!status.ready)throw Error(status.code||'plan_unavailable');
 let missions=0,unsupported=0;
 for(const [i,photo] of prepared.entries()){
  active();progress(`Lecture de la photo ${i+1}/${prepared.length} et préparation des jeux…`);
  const image=await encode(photo.blob);active();
  const result=await request('/api/plans/import',{profileId:profile.id,week,consent:true,image});active();
  const work=installPlan(profile,result.plan,{append:true});
  if(save()===false)throw Error('storage_unavailable');
  missions=work.missions.length;unsupported=work.unsupported.length;
 }
 return {missions,unsupported};
}
export function mountAutomaticPhotos(root,p,{save,onOpen=()=>{},onStored=()=>{}}={}){
 if(!root)return {destroy(){}};
 const input=root.querySelector('[data-auto-files]'),week=root.querySelector('[data-auto-week]'),status=root.querySelector('[data-auto-status]'),open=root.querySelector('[data-auto-open]');
 const controller=new AbortController();let busy=false;
 const request=async(path,body)=>{const r=await fetch(path,{method:'POST',credentials:'same-origin',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let data;try{data=await r.json();}catch{throw Error('plan_unavailable');}if(!r.ok)throw Error(data.code||'plan_unavailable');return data;};
 input.onchange=async()=>{
  if(busy||!input.files.length)return;busy=true;input.disabled=week.disabled=true;open.hidden=true;
  status.textContent='Compression et sauvegarde des photos…';
  try{const result=await processHomeworkPhotos({files:[...input.files],profile:p,week:week.value,signal:controller.signal,request,save,onStored,progress:text=>{status.textContent=text;}});if(controller.signal.aborted)return;status.textContent=`${result.missions} activité(s) préparée(s).${result.unsupported?' '+result.unsupported+' notion(s) non prise(s) en charge ou incomplète(s), signalée(s) dans la semaine.':''}`;open.hidden=!result.missions;}
  catch(e){if(!controller.signal.aborted)status.textContent=autoPhotoError(e.message);}
  finally{busy=false;if(!controller.signal.aborted){input.value='';input.disabled=week.disabled=false;}}
 };
 open.onclick=onOpen;
 return {destroy(){controller.abort();input.onchange=null;open.onclick=null;}};
}
