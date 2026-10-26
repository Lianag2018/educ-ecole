import {decodeSchoolPhoto,photoDimensions} from './school-photo-image.js';
import {tablePractice} from './week-plan.js';
import {squishyStages} from './squishy.js';
const subjects=['Français','Maths','Univers social'];
export function validatePlan(p){
 if(!p||!['p1','p2'].includes(p.profileId)||![1,3].includes(p.grade)||!/^\d{4}-\d{2}-\d{2}$/.test(p.week)||!Number.isFinite(Date.parse(p.week+'T12:00:00Z'))||new Date(p.week+'T12:00:00Z').toISOString().slice(0,10)!==p.week||!Array.isArray(p.tasks)||p.tasks.length>12||!p.tasks.length)throw Error('invalid_plan');
 if(p.tasks.some(t=>!subjects.includes(t.subject)||typeof t.topic!=='string'||t.topic.length>100||typeof t.instruction!=='string'||t.instruction.length>500||!Array.isArray(t.words)||t.words.length>24||t.words.some(w=>typeof w!=='string'||!/^\p{L}[\p{L}’' -]{0,39}$/u.test(w))||!Array.isArray(t.tables)||t.tables.some(n=>!Number.isInteger(n)||n<1||n>6)||!Array.isArray(t.operations)||t.operations.some(o=>!['+','−'].includes(o))||typeof t.missing!=='boolean'))throw Error('invalid_plan');
 return {profileId:p.profileId,grade:p.grade,week:p.week,tasks:p.tasks.map(t=>({subject:t.subject,topic:t.topic,instruction:t.instruction,words:t.words,tables:t.tables,operations:t.operations,missing:t.missing}))};
}
export function planMissions(input){
 const p=validatePlan(input),missions=[],unsupported=[];
 p.tasks.forEach((t,i)=>{
  const stamp=[...JSON.stringify(t)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261).toString(36);
  const id=`plan-${p.profileId}-${p.week}-${i}-${stamp}`,items=[];
  if(t.missing){unsupported.push(t.topic+' : page ou mots à fournir');return;}
  if(t.subject==='Maths'&&t.tables.length){
   const sets=[];for(const n of t.tables.filter(n=>p.grade===3||n<=2))for(const op of t.operations)sets.push(tablePractice(n,op));
   for(let k=0;k<12;k++)for(const set of sets)items.push(set[k]);
  }else if(t.subject==='Français'&&t.words.length){
   for(const [j,w] of t.words.entries())items.push({id:id+'-word-'+j,skill:'mots',level:1,text:w,prompt:'Écoute le mot, puis lis-le à ton tour.',choices:[],answer:null,explanation:'Écoute encore le modèle. Un adulte peut t’aider à vérifier ta lecture.'});
  }else if(p.grade===3&&t.subject==='Univers social'){
   const topics=t.topic.toLowerCase();
   for(const s of squishyStages.filter(s=>s.domain==='Univers social'))if((/boussole|orientation|cardin/.test(topics)&&/boussole|orientation|cardin/i.test(JSON.stringify(s)))||(/carte|légende/.test(topics)&&/carte|légende/i.test(JSON.stringify(s)))||(/temps|chronolog|siècle/.test(topics)&&/temps|chronolog|siècle/i.test(JSON.stringify(s)))||(/algonqu/.test(topics)&&/algonqu/i.test(JSON.stringify(s))))items.push(...s.items);
  }
  if(items.length)missions.push({id,subject:t.subject,title:t.topic,items:items.slice(0,24).map((q,j)=>({...q,id:id+'-'+j}))});
  else unsupported.push(t.topic+' : activité adaptée à compléter');
 });
 return {missions,unsupported};
}
export function planFor(p){return Array.isArray(p.schoolPlans)?p.schoolPlans.at(-1):null;}
export function installPlan(p,input,{append=false}={}){let plan=validatePlan(input);if(plan.profileId!==p.id)throw Error('profile_mismatch');const previous=Array.isArray(p.schoolPlans)?p.schoolPlans:[];
 if(append){const old=previous.find(x=>x.week===plan.week);if(old){const tasks=[...new Map([...old.tasks,...plan.tasks].map(t=>[JSON.stringify(t),t])).values()];if(tasks.length>12)throw Error('plan_full');plan=validatePlan({...plan,tasks});}}
 p.schoolPlans=[...previous.filter(x=>x.week!==plan.week),plan].sort((a,b)=>a.week.localeCompare(b.week)).slice(-12);return planMissions(plan);}
export function missionOpen(p,missions,index){return index===0||missions[index-1].items.slice(0,4).every(q=>p.records[q.id]?.result==='correct');}
export const escapePlan=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function planPanel(p){const e=escapePlan,plan=planFor(p);return `<section class="panel school-plan-parent"><h2>Analyse du plan avec OpenAI</h2><p>Pour extraire les devoirs d’une photo, la connexion parent et le service privé OpenAI doivent être configurés. L’ajout et l’association de photos en haut de cet espace fonctionnent séparément.</p><form id="plan-photo-form"><label>Semaine du <input name="week" type="date" required></label><label>Photo du plan <input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required></label><p>Le document est transmis à OpenAI pour repérer les devoirs. Recadre les coordonnées et les signatures. La photo n’est pas enregistrée dans l’application; les notions extraites sont conservées.</p><label><input name="consent" type="checkbox" required> Envoyer cette photo pour préparer les activités de cet enfant</label><button>Préparer sa semaine</button></form><button id="plan-sync">Récupérer les plans de cet enfant</button><p id="plan-status" role="status"></p>${plan?`<h3>Plan du ${e(plan.week)}</h3><ul>${plan.tasks.map(t=>`<li>${e(t.subject)} : ${e(t.instruction)}</li>`).join('')}</ul><button data-action="school-plan">Voir ses étapes</button>`:'<p>Aucun plan importé pour ce profil.</p>'}</section>`;}
export function planMap(p){const plan=planFor(p);if(!plan)return '<section class="panel"><h1>Ma semaine</h1><p>Ton parent peut ajouter le plan dans son espace.</p></section>';const {missions,unsupported}=planMissions(plan),e=escapePlan;return `<section class="weekly-plan"><button data-action="home">‹ Mon monde</button><h1>🫧 Mes étapes de la semaine</h1><p>Semaine du ${e(plan.week)}</p><div class="world-grid">${missions.map((m,i)=>`<button data-plan-mission="${i}" ${missionOpen(p,missions,i)?'':'disabled'}><strong>${missionOpen(p,missions,i)?'⭐':'🔒'} ${e(m.title)}</strong><small>${e(m.subject)} · ${Math.min(4,m.items.length)} défis</small></button>`).join('')}</div>${unsupported.length?`<details><summary>Avec un parent · Éléments à compléter</summary><ul>${unsupported.map(s=>`<li>${e(s)}</li>`).join('')}</ul></details>`:''}<p>Quatre défis réussis sans aide ouvrent l’étape suivante. Tu peux rejouer à chaque étape.</p></section>`;}
export async function preparePhoto(file){
 if(!file||file.size>15000000||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('photo_invalid');
 const decoded=await decodeSchoolPhoto(file);try{const {width,height}=photoDimensions(decoded.width,decoded.height,1600);const canvas=document.createElement('canvas');Object.assign(canvas,{width,height});const context=canvas.getContext('2d');if(!context)throw Error('photo_invalid');context.fillStyle='#fff';context.fillRect(0,0,width,height);context.drawImage(decoded.image,0,0,width,height);const data=canvas.toDataURL('image/jpeg',.85);if(data.length>1200000)throw Error('photo_invalid');return data;}finally{decoded.close();}
}
export function mountPlanImport(p,{save,refresh}={}){
 const form=document.querySelector('#plan-photo-form'),status=document.querySelector('#plan-status');if(!form)return;
 const controller=new AbortController(),signal=controller.signal;
 let selectedImage=null;
 form.elements.photo.onchange=()=>{selectedImage=null;form.elements.photo.required=true;form.elements.consent.checked=false;};
 const message=code=>({parent_login_required:'Connecte le compte parent ci-dessous, puis réessaie.',plan_unavailable:'Le serveur privé des plans n’est pas encore configuré. Aucun document envoyé à OpenAI.',budget_unavailable:'Le budget des plans est indisponible ou atteint.',photo_invalid:'Choisis une photo JPG, PNG ou WebP lisible, de moins de 15 Mo.',unclear_plan:'La photo ne permet pas de préparer les devoirs. Ajoute une photo plus nette et les pages manquantes.',invalid_plan:'Le plan extrait n’a pas passé les contrôles. Aucun exercice ajouté.'})[code]||'Le plan n’a pas pu être importé. Les activités précédentes sont conservées.';
 async function request(path,body){const r=await fetch(path,{method:'POST',credentials:'same-origin',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.code);return data;}
 form.onsubmit=async ev=>{ev.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='Lecture du plan et préparation des activités…';try{const data=await request('/api/plans/import',{profileId:p.id,week:form.elements.week.value,consent:form.elements.consent.checked,image:await preparePhoto(form.elements.photo.files[0])});if(signal.aborted)return;installPlan(p,data.plan);save();refresh();}catch(e){if(!signal.aborted)status.textContent=message(e.message);}finally{button.disabled=false;}};
 document.querySelector('#plan-sync').onclick=async()=>{status.textContent='Recherche des plans privés…';try{const data=await request('/api/plans/list',{profileId:p.id});for(const plan of [...data.plans].reverse())installPlan(p,plan,{append:true});save();if(!data.plans.length)status.textContent='Aucun plan sauvegardé sur le serveur pour ce profil.';else refresh();}catch(e){if(!signal.aborted)status.textContent=message(e.message);}};
 return {destroy(){controller.abort();selectedImage=null;}};
}
