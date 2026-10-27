import {vocabularyCode,vocabularyURL} from './school-vocabulary.js';

// Only list/group codes and student names are stored locally. No passwords,
// tokens or school credentials are shipped with the public application.
const resources={
 nougat:{title:'Nougat · i+ Élève',profiles:['p1'],url:'https://www.iplusinteractif.com/primaire/login?lang=fr_CA',fields:[['group','Code du groupe',40],['username','Nom d’utilisateur',80]]},
 voca:{title:'Voca · Alloprof',profiles:['p2'],url:vocabularyURL,fields:[['code','Code de la liste',12]]},
 cec:{title:'MaZone CEC',profiles:['p2'],url:'https://app.mazonecec.com/login?return_url=https%3A%2F%2Fmazonecec.com%2Fapplication',fields:[['username','Nom d’utilisateur',80]]}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=(s,max)=>typeof s==='string'&&s.trim().length<=max&&!/[\u0000-\u001f\u007f]/u.test(s)?s.trim():'';
export function accessResources(profile){return Object.entries(resources).filter(([,r])=>r.profiles.includes(profile?.id));}
export function accessValues(profile,id){
 const r=resources[id];if(!r?.profiles.includes(profile?.id))return {};
 const saved=id==='voca'?profile.schoolVocabulary:profile.schoolAccess?.[id];
 return Object.fromEntries(r.fields.map(([key,,max])=>[key,id==='voca'?vocabularyCode(saved?.[key]):clean(saved?.[key],max)]));
}
export function updateSchoolAccess(state,profileId,id,values,persist){
 const r=resources[id],profile=state?.profiles?.find(p=>p.id===profileId);
 if(!r?.profiles.includes(profileId)||!profile||!values||typeof values!=='object'||Array.isArray(values)||Object.keys(values).some(key=>!r.fields.some(([k])=>k===key)))return 'invalid';
 const normalized={};
 for(const [key,,max] of r.fields){
  const raw=values[key];if(typeof raw!=='string')return 'invalid';
  const value=id==='voca'?vocabularyCode(raw.trim()):clean(raw,max);
  if(raw.trim()&&!value)return 'invalid';
  normalized[key]=value;
 }
 const next={...state,profiles:state.profiles.map(p=>p.id!==profileId?p:id==='voca'?{...p,schoolVocabulary:{...p.schoolVocabulary,...normalized}}:{...p,schoolAccess:{...p.schoolAccess,[id]:normalized}})};
 try{if(!persist(next))return 'storage-unavailable';}catch{return 'storage-unavailable';}
 Object.assign(state,next);return 'saved';
}
function fieldsMarkup(p,id,r){
 const values=accessValues(p,id);
 return r.fields.map(([key,label])=>`<div class="access-value"><span>${label}</span>${values[key]?`<strong>${esc(values[key])}</strong><button type="button" data-access-copy="${id}" data-access-field="${key}" data-access-profile="${esc(p.id)}" aria-label="Copier ${label.toLowerCase()} · ${esc(r.title)} · ${esc(p.name)}">Copier</button>`:'<span class="access-missing">À compléter</span>'}</div>`).join('');
}
export function schoolAccessBar(p){
 const entries=accessResources(p);if(!entries.length)return '';
 return `<aside class="school-access-bar" aria-label="Mes accès scolaires · ${esc(p.name)}"><h2>🔑 Mes accès · ${esc(p.name)}</h2><div class="school-access-grid">${entries.map(([id,r])=>`<article class="school-access-card"><h3>${r.title}</h3>${fieldsMarkup(p,id,r)}<a data-school-resource href="${typeof r.url==='function'?r.url(p):r.url}" target="_blank" rel="noopener noreferrer">Ouvrir ${id==='voca'?'mes mots':id==='nougat'?'Nougat':'MaZone CEC'} ↗</a><span class="access-copy-status" role="status"></span></article>`).join('')}</div></aside>`;
}
export function schoolAccessSettings(profiles){
 return `<section class="panel school-access-settings" data-parent-group="settings"><h2>Codes d’accès des enfants</h2><p>Codes de groupe ou de liste et noms d’utilisateur seulement. Les mots de passe se saisissent sur le site scolaire et ne sont pas enregistrés ici.</p><p class="small">Enregistrés sur cet appareil, visibles par ses utilisateurs. Ces accès ne sont pas encore synchronisés entre les tablettes.</p>${profiles.map(p=>`<fieldset><legend>${esc(p.name)}</legend>${accessResources(p).map(([id,r])=>{const values=accessValues(p,id);return `<form data-access-form="${id}" data-access-profile="${esc(p.id)}"><h3>${r.title}</h3>${r.fields.map(([key,label,max])=>`<label>${label}<input name="${key}" value="${esc(values[key])}" maxlength="${max}" autocomplete="off" autocapitalize="none" spellcheck="false" ${id==='voca'?'pattern="[A-Za-z0-9]{5,12}"':''}></label>`).join('')}<button type="submit">Enregistrer · ${esc(p.name)}</button><p role="status"></p></form>`;}).join('')}</fieldset>`).join('')}</section>`;
}
export function mountSchoolAccess(root,state,{persist,onSaved=()=>{},clipboard=globalThis.navigator?.clipboard}={}){
 root.querySelectorAll('[data-access-copy]').forEach(button=>button.addEventListener('click',async()=>{
  const p=state.profiles.find(x=>x.id===button.dataset.accessProfile),value=accessValues(p,button.dataset.accessCopy)[button.dataset.accessField];
  const status=button.closest('.school-access-card')?.querySelector('[role="status"]');if(!value||!status)return;
  try{if(!clipboard?.writeText)throw Error();await clipboard.writeText(value);if(button.isConnected)status.textContent='Copié!';}
  catch{if(button.isConnected)status.textContent='Copie indisponible. Garde le doigt sur le code pour le sélectionner.';}
 }));
 root.querySelectorAll('[data-access-form]').forEach(form=>form.addEventListener('submit',event=>{
  event.preventDefault();const values=Object.fromEntries(new FormData(form));
  const result=updateSchoolAccess(state,form.dataset.accessProfile,form.dataset.accessForm,values,persist);
  form.querySelector('[role="status"]').textContent=result==='saved'?'Accès enregistré sur cet appareil.':result==='invalid'?'Vérifie le code ou le nom d’utilisateur.':'Enregistrement impossible. L’ancien accès est conservé.';
  if(result==='saved')onSaved();
 }));
}
