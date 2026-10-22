import {advanced,gradeFor} from './learning.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const childName=p=>/^Lectrice [12]$/.test(p.name)?(p.id==='p1'?'Mely-Ann':'Liana'):p.name;
export function worldsFor(p){return advanced(p)?[
 {icon:'📚',title:'Les mots explorateurs',detail:'Mots longs et sons complexes',scene:'syllables'},
 {icon:'🦄',title:'Les récits du ciel',detail:'Lire et comprendre une aventure',scene:'reading'},
 {icon:'🏰',title:'Le château des nombres',detail:'De 0 à 1 999',scene:'numbers'},
 {icon:'🔭',title:'Le labo des calculs',detail:'Comparer et décomposer',subject:2},
 {icon:'🌎',title:'Les explorateurs',detail:'Vivre ensemble et découvrir',subject:3},
 {icon:'🦉',title:'Mon défi de la semaine',detail:'Tables de 1 à 6',action:'weekly'}
]:[
 {icon:'🌸',title:'Le jardin des sons',detail:'Écouter et reconnaître les sons',scene:'sounds'},
 {icon:'🦋',title:'Les syllabes magiques',detail:'Assembler mes petits mots',scene:'syllables'},
 {icon:'🦄',title:'Mes petites histoires',detail:'Des phrases pour commencer',scene:'reading'},
 {icon:'🍄',title:'Le sentier des nombres',detail:'Compter de 0 à 99',scene:'numbers'},
 {icon:'⭐',title:'Mes petits calculs',detail:'Ajouter et enlever',subject:2},
 {icon:'🏡',title:'Autour de chez moi',detail:'Mon école et mon quartier',subject:3}
];}
export function landscape(){return `<div class="world-scenery" aria-hidden="true"><i class="sky-orb"></i><i class="cloud cloud-a"></i><i class="cloud cloud-b"></i><i class="hill hill-a"></i><i class="hill hill-b"></i><span class="floating-star star-a">✦</span><span class="floating-star star-b">✧</span><span class="scenery-flower">✿</span><span class="scenery-castle">♜</span></div>`;}
export function worldHome(p){const older=advanced(p);return `<section class="world-home">${landscape()}<div class="world-top"><span>✦ L’Atelier des mots</span><button data-action="parent">⚙ Parents</button></div><div class="world-heading"><div class="portrait face-${p.id==='p1'?0:1}" aria-hidden="true"></div><div><span class="world-badge">${gradeFor(p)}${gradeFor(p)===1?'re':'e'} année · Mon espace</span><h1>${escape(childName(p))}, à toi de jouer!</h1><p>${older?'Prête à explorer le ciel des aventures?':'Bienvenue dans ton jardin des découvertes!'}</p></div><button class="switch-child" data-action="choose-child">Changer de personnage</button></div>${older?'<button class="squishy-banner" data-action="squishy">🫧 Mon archipel Squishy <small>12 compagnons · 3 chemins à explorer →</small></button>':''}<div class="world-grid">${worldsFor(p).map((w,i)=>`<button class="world-card world-card-${i}" ${w.scene?`data-scene="${w.scene}"`:w.subject!==undefined?`data-subject="${w.subject}"`:`data-action="${w.action}"`}><span class="world-illustration" aria-hidden="true"><i></i>${w.icon}</span><span class="world-card-copy"><strong>${w.title}</strong><small>${w.detail}</small></span><span class="world-arrow" aria-hidden="true">➜</span></button>`).join('')}</div><div class="world-bottom"><span>⭐ ${p.history.length} activité${p.history.length===1?'':'s'} explorée${p.history.length===1?'':'s'}</span><button class="daily-adventure" data-action="start">▶ Ma petite mission</button><span>Chaque effort compte!</span></div></section>`;}
export function companion(p){return `<aside class="lesson-companion" aria-label="Ton compagnon de lecture"><div class="portrait face-${p.id==='p1'?0:1}" aria-hidden="true"></div><strong>${escape(childName(p))}</strong><span class="world-badge">${gradeFor(p)}${gradeFor(p)===1?'re':'e'} année</span><div class="companion-owl" aria-hidden="true">🦉</div><p>Un petit pas à la fois.<br>Tu peux réécouter!</p></aside>`;}
