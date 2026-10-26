import {dailyEvidence} from './progress.js';
import {PROGRESSION_RULES} from './engine.js';
import {advanced} from './learning.js';
// Original exercises. Only the external links refer to the publisher's material.
export const miniZones=[
 {id:'collections',icon:'🐝',title:'La prairie des collections',detail:'Compter et reconnaître une quantité'},
 {id:'compare',icon:'🦋',title:'Le pont des nombres',detail:'Comparer et trouver le nombre suivant'},
 {id:'tens',icon:'🌻',title:'Le potager des dizaines',detail:'Faire des groupes de dix'},
 {id:'calculate',icon:'🐿️',title:'La réserve des noisettes',detail:'Ajouter, retirer et expliquer'}
];
export const miniEnabled=p=>p.id==='p1'&&!advanced(p);
const card=(zone,tier,i,text,prompt,correct,wrong,hint,visual)=>{
 const choices=[String(correct),...wrong.map(String)];
 const shift=i%3;choices.push(...choices.splice(0,shift));
 return {id:`mini-${zone}-${tier}-${i}`,skill:'mots',level:tier,text,prompt,choices,answer:choices.indexOf(String(correct)),hint,
  explanation:`La réponse est ${correct}. ${hint}`,miniZone:zone,visual};
};
export function miniCards(zone,tier){
 if(!miniZones.some(z=>z.id===zone)||![1,2,3].includes(tier))return [];
 return Array.from({length:6},(_,i)=>{
  if(zone==='collections'){
   const n=[i,5+i,10+i][tier-1];
   return card(zone,tier,i,'Compte les graines. Les cases vides ne comptent pas.','Combien de graines vois-tu?',n,[n+1,n===0?2:n-1],
    'Compte chaque graine une seule fois. Une case vide ne compte pas.',{kind:'seeds',count:n});
  }
  if(zone==='compare'){
   const n=[i+2,12+i,32+i][tier-1];
   if(i%2===1)return card(zone,tier,i,`${n} · ${n+2} · ${n-1}`,'Quel est le plus grand nombre?',n+2,[n,n-1],
    'Compare les dizaines, puis les unités si les dizaines sont pareilles.',{kind:'compare',numbers:[n,n+2,n-1]});
   return card(zone,tier,i,`${n} · ${n+1} · ?`,'Quel nombre vient juste après?',n+2,[n,n+3],
    'Avance d’un seul pas dans la suite des nombres.',{kind:'sequence',numbers:[n,n+1]});
  }
  if(zone==='tens'){
   const tens=tier===1?1:tier===2?2:4,units=tier===1?i%3:i+1,n=tens*10+units;
   return card(zone,tier,i,`${tens} dizaines et ${units} unités`,'Quel nombre est représenté?',n,[n+10,n+1],
    'Chaque cadre contient dix graines. Ajoute ensuite les graines seules.',{kind:'tens',tens,units});
  }
  const a=[i+2,i+7,i+12][tier-1],b=tier===1?1:3,subtract=i%2===1,n=subtract?a-b:a+b;
  return card(zone,tier,i,`${a} ${subtract?'−':'+'} ${b}`,
   subtract?'Des noisettes sont mangées. Combien en reste-t-il?':'Des noisettes sont ajoutées. Combien y en a-t-il?',n,[n+1,n-1],
   subtract?'Retire les noisettes mangées, puis compte celles qui restent.':'Pars de la première quantité et ajoute les nouvelles noisettes.',{kind:'calculation',a,b,subtract});
 });
}
// Same observation window and day/card thresholds as the reading engine, but
// strictly Maths and per zone. Never upgrade reading or treat a launch as success.
export function miniTier(p,zone,day){
 if(!miniEnabled(p))return 1;
 let tier=1;
 for(let candidate=1;candidate<=2;candidate++){
  const ids=new Set(miniCards(zone,candidate).map(q=>q.id));
  const evidence=dailyEvidence(p.history.filter(e=>ids.has(e.id)&&e.subject==='Maths'&&e.day<=day)).slice(-PROGRESSION_RULES.window);
  const days=new Set(evidence.map(e=>e.day)).size,cards=new Set(evidence.map(e=>e.id)).size;
  const ready=candidate===1
   ?days>=PROGRESSION_RULES.tier2Days&&evidence.filter(e=>e.result==='correct').length>=Math.ceil(evidence.length*PROGRESSION_RULES.tier2Ratio)
   :evidence.length===PROGRESSION_RULES.window&&days>=PROGRESSION_RULES.tier3Days&&cards>=PROGRESSION_RULES.tier3Cards&&evidence.every(e=>e.result==='correct');
  if(!ready)break;tier=candidate+1;
 }
 return tier;
}
export function miniSession(p,zone,day){
 if(!miniEnabled(p))return [];
 const tier=miniTier(p,zone,day),all=Array.from({length:tier},(_,i)=>miniCards(zone,i+1)).flat();
 const due=all.filter(q=>p.records[q.id]?.due<=day).sort((a,b)=>p.records[a.id].due.localeCompare(p.records[b.id].due)||a.id.localeCompare(b.id));
 const fresh=miniCards(zone,tier).filter(q=>!p.records[q.id]);
 // Keep the existing review priority, with a bounded three-card session.
 return [...new Map([...due,...fresh,...miniCards(zone,tier)].map(q=>[q.id,q])).values()].slice(0,3);
}
// Countable shapes use inline SVG: independent of fonts, emoji or remote assets.
const seed=()=>`<svg class="mini-token mini-seed" data-object="seed" viewBox="0 0 40 40" aria-hidden="true"><path d="M30 5C9 4 3 17 9 29S35 33 30 5Z" fill="#b77934" stroke="#623d1c" stroke-width="2"/><path d="M12 29Q19 18 27 9" fill="none" stroke="#ffe0a0" stroke-width="3"/></svg>`;
const nut=()=>`<svg class="mini-token mini-nut" data-object="nut" viewBox="0 0 40 40" aria-hidden="true"><path d="M7 18Q4 33 20 36Q36 33 33 18Z" fill="#b97632" stroke="#633c1d" stroke-width="2"/><path d="M5 18Q6 7 20 7Q34 7 35 18Z" fill="#69472b"/><path d="M20 8L23 3" stroke="#69472b" stroke-width="3"/><path d="M14 22L15 29" stroke="#ffe0a0" stroke-width="3"/></svg>`;
const row=(count,draw=seed)=>Array.from({length:count},draw).join('');
const ten=()=>`<span class="mini-ten" data-group="ten">${row(10)}</span>`;
const quantity=n=>`<span class="mini-quantity">${Array.from({length:Math.floor(n/10)},ten).join('')}<span class="mini-units">${row(n%10)}</span></span>`;
export function miniVisual(q){
 const v=q.visual;if(!v)return '';
 if(v.kind==='seeds')return `<div class="mini-seeds" role="img" aria-label="${v.count} graines">${Array.from({length:20},(_,i)=>`<span class="mini-cell ${i<v.count?'filled':'empty'}" aria-hidden="true">${i<v.count?seed():''}</span>`).join('')}</div>`;
 if(v.kind==='tens')return `<div class="mini-bouquets" role="img" aria-label="${v.tens} dizaines et ${v.units} unités"><small>Un cadre contient dix graines.</small>${quantity(v.tens*10+v.units)}</div>`;
 if(v.kind==='compare')return `<div class="mini-comparison">${v.numbers.map(n=>`<div class="mini-number-group" role="img" aria-label="${n} graines"><strong>${n}</strong>${quantity(n)}</div>`).join('')}</div>`;
 if(v.kind==='sequence')return `<div class="mini-sequence" role="img" aria-label="${v.numbers.join(', ')}, puis un nombre à trouver"><span>${v.numbers[0]}</span><b aria-hidden="true">→</b><span>${v.numbers[1]}</span><b aria-hidden="true">→</b><span class="mini-missing">?</span></div>`;
 if(v.kind==='calculation'){
  const label=v.subtract?`${v.a} noisettes au départ, ${v.b} barrées à retirer`:`${v.a} noisettes au départ, ${v.b} noisettes ajoutées`;
  const initial=Array.from({length:v.a},(_,i)=>`<span class="mini-nut-slot${v.subtract&&i>=v.a-v.b?' removed':''}"${v.subtract&&i>=v.a-v.b?' data-removed="true"':''}>${nut()}${v.subtract&&i>=v.a-v.b?'<span class="mini-cross" aria-hidden="true">×</span>':''}</span>`).join('');
  return `<div class="mini-calculation" role="img" aria-label="${label}"><div><small>Au départ</small><div class="mini-nut-row">${initial}</div></div>${v.subtract?'<small>Les noisettes barrées sont retirées. Compte celles qui restent.</small>':`<b aria-hidden="true">+</b><div><small>On ajoute</small><div class="mini-nut-row">${row(v.b,nut)}</div></div>`}</div>`;
 }
 return '';
}
export function miniGarden(p,day){
 if(!miniEnabled(p))return '';
 return `<section class="mini-garden lesson"><div class="mini-sky" aria-hidden="true"><span>☀️</span><span>☁️</span><span>🐝</span><span>🌼</span></div><span class="world-badge">Mon jardin des mini-défis</span><h1>Trois petits défis, puis une pause!</h1><p>Choisis un coin du jardin. Tu peux écouter, demander un indice et revenir demain.</p><div class="audio"><button data-action="test-voice">🔊 Écouter ma narratrice</button><button data-scene="sounds">🌸 Mon jardin des sons</button></div><div class="mini-zone-grid">${miniZones.map(z=>`<article><span class="mini-friend" aria-hidden="true">${z.icon}</span><h2>${z.title}</h2><p>${z.detail}</p><p>Palier ${miniTier(p,z.id,day)} sur 3 · Sans chronomètre</p><button class="primary" data-mini-zone="${z.id}">Jouer · 3 défis →</button></article>`).join('')}</div><details><summary>Avec un parent · Mes ressources Nougat</summary><p>Les jeux de ce jardin sont originaux. Les activités de l’éditeur restent sur leur plateforme; ouvrir un lien ne valide aucun résultat.</p><p><a data-school-resource href="https://iplusinteractif.com/primaire/31" target="_blank" rel="noopener noreferrer">Nougat · Livres et 51 activités</a></p><p><a data-school-resource href="https://iplusinteractif.com/dapps/activities/avec-retro/385_M1_T1_S1_nombres-paires_AR/Activity/" target="_blank" rel="noopener noreferrer">Activité observée · Associer les nombres aux quantités</a></p><p>Les paliers utilisent les réponses de plusieurs journées, avec les règles de progression de l’atelier. Une aide reste une aide, même après un nouvel essai réussi. Les résultats des autres parcours sont conservés.</p></details><button data-action="home">Retour à mon monde</button></section>`;
}
