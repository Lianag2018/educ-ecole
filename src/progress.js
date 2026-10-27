import {skills} from './content.js';
const readingSubjects=new Set(['Français','Lecture']);
// Older subject buttons stored a skill key as the subject. Interpret those
// entries without rewriting history or moving Maths into the reading domains.
export const normalizeReadingSubject=subject=>Object.hasOwn(skills,subject)?'Français':subject;
export const isReadingEvent=e=>!e.subject||readingSubjects.has(normalizeReadingSubject(e.subject));
const results=new Set(['correct','help','incorrect']);
const validDay=day=>typeof day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T12:00:00Z'))&&new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day;
export const isPracticeEvent=event=>!!event&&typeof event.id==='string'&&typeof event.skill==='string'&&validDay(event.day)&&results.has(event.result);
const evidenceKey=event=>JSON.stringify([isReadingEvent(event)?'reading':normalizeReadingSubject(event.subject),event.skill,event.id,event.day]);

// A card contributes at most one observation per day. These are product rules,
// not a standardized assessment: a successful retry does not erase the support
// or error that preceded it. Every original event remains in profile.history.
export function dailyEvidence(history){
 const days=new Map();
 for(const event of history){
  if(!isPracticeEvent(event))continue;
  const subject=normalizeReadingSubject(event.subject);
  const key=evidenceKey(event);
  const previous=days.get(key);
  const hadHelp=!!previous?.hadHelp||event.result==='help';
  const hadError=!!previous?.hadError||event.result==='incorrect';
  const result=hadHelp||(hadError&&event.result==='correct')?'help':event.result;
  days.set(key,{...event,subject,result,hadHelp,hadError,attempts:(previous?.attempts||0)+1});
 }
 return [...days.values()].sort((a,b)=>a.day.localeCompare(b.day));
}
const shift=(day,n)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);};
// Recompute from the existing per-profile history: no duplicate store or migration.
export function learningReport(p,day){
 const history=p.history.filter(e=>isPracticeEvent(e)&&e.day<=day);
 const outcomes=new Map(dailyEvidence(history).map(e=>[evidenceKey(e),e.result]));
 const groups=new Map();
 for(const e of history){const subject=normalizeReadingSubject(e.subject)||'Historique non classé',key=subject+'|'+e.skill;if(!groups.has(key))groups.set(key,{key,subject,skill:e.skill,events:[]});groups.get(key).events.push({...e,result:outcomes.get(evidenceKey(e))});}
 const domains=[...groups.values()].map(g=>{
  const recent=dailyEvidence(g.events).slice(-8);
  const independent=recent.filter(e=>e.result==='correct').length,help=recent.filter(e=>e.result==='help').length,retry=recent.filter(e=>e.result==='incorrect').length;
  const days=new Set(recent.map(e=>e.day)).size,cards=new Set(recent.map(e=>e.id)).size;
  const status=recent.length<3?'À découvrir':retry+help>=Math.ceil(recent.length/2)?'À accompagner':independent/recent.length>=.8&&days>=3&&cards>=2?'À consolider dans le temps':'En progression';
  const latest=recent.at(-1);
  const next=status==='À accompagner'?'Reprendre un exemple, donner un indice, puis réessayer.':status==='À consolider dans le temps'?'Revoir plus tard avec une autre activité.':'Continuer avec une courte activité du même domaine.';
  return {...g,events:undefined,independent,help,retry,days,cards,status,next,lastDay:latest.day,label:readingSubjects.has(g.subject)?(skills[g.skill]||g.skill):g.subject,priority:(retry*2+help)/Math.max(1,recent.length)};
 });
 const count=(from,to)=>{const events=history.filter(e=>e.day>=from&&e.day<=to),evidence=dailyEvidence(events);return {attempts:events.length,observations:evidence.length,days:new Set(evidence.map(e=>e.day)).size,independent:evidence.filter(e=>e.result==='correct').length,help:evidence.filter(e=>e.result==='help').length,retry:evidence.filter(e=>e.result==='incorrect').length};};
 return {version:1,asOf:day,total:history.length,domains:domains.sort((a,b)=>b.priority-a.priority||a.key.localeCompare(b.key)),current:count(shift(day,-6),day),previous:count(shift(day,-13),shift(day,-7)),legacy:history.filter(e=>!e.subject).length};
}
export function prioritySkills(p,day){const report=learningReport(p,day);const ranks=new Map();for(const d of report.domains)if(readingSubjects.has(d.subject))ranks.set(d.skill,Math.max(ranks.get(d.skill)||0,d.priority));const advice=p.learningAdvice;const age=validDay(advice?.asOf)?(Date.parse(day)-Date.parse(advice.asOf))/86400000:Infinity;const priorities=age>=0&&age<=7&&Array.isArray(advice?.priorities)?advice.priorities:[];const rank=s=>{const i=priorities.indexOf(s);return i<0?99:i;};return Object.keys(skills).sort((a,b)=>(ranks.get(b)||0)-(ranks.get(a)||0)||rank(a)-rank(b));}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function progressPanel(p,day){const r=learningReport(p,day);return `<section class="panel learning-memory"><h2>Son évolution et la prochaine étape</h2><p>Le bilan se met à jour après chaque réponse. Les révisions et la difficulté de la mission de français utilisent ses réponses, dans son année scolaire.</p><p><strong>7 derniers jours :</strong> ${r.current.days} jour(s) de pratique · ${r.current.independent} réussite(s) sans aide signalée · ${r.current.help} avec aide ou après reprise · ${r.current.retry} à revoir.</p><p>Une activité compte une fois par jour. Une réussite après une aide ou une erreur le même jour reste accompagnée.</p><p>7 jours précédents : ${r.previous.days} jour(s) de pratique, ${r.previous.attempts} essai(s). Les quantités ne constituent pas une note scolaire.</p>${r.domains.length?r.domains.map(d=>`<article><h3>${esc(d.label)} <small>· ${esc(d.subject)}</small></h3><p><strong>${d.status}</strong> · ${d.independent} sans aide signalée / ${d.help} accompagnée ou reprise / ${d.retry} à revoir, sur les dernières observations quotidiennes.</p><p>${d.next}</p><p class="small">Dernière pratique : ${esc(d.lastDay)} · ${d.days} jour(s) observé(s).</p></article>`).join(''):'<p>Le portrait se construira avec ses premiers essais. Aucune difficulté n’est déduite avant observation.</p>'}${r.legacy?'<p class="small">Les anciens essais sont conservés comme historique non classé : leur matière ne peut pas être confirmée.</p>':''}<p class="small">Mémoire locale, avec sauvegarde privée facultative dans le panneau ci-dessus. Les réponses non synchronisées peuvent être perdues si le navigateur est effacé. Ce bilan décrit les réponses aux activités; il ne mesure pas la prononciation et ne constitue pas un diagnostic. Ses repères de progression sont des choix de l’atelier, pas des seuils d’évaluation scolaire ou clinique.</p></section>`;}
// Reorder an explicitly opened subject without hiding its content or changing grade.
export function adaptiveCards(p,cards,day){const rank=q=>{const r=p.records[q.id];return !r?1:r.due<=day?(r.result==='correct'?2:0):3;};return cards.map((q,i)=>({q,i})).sort((a,b)=>rank(a.q)-rank(b.q)||a.i-b.i).map(x=>x.q);}
