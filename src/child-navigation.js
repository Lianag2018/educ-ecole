import {journeyDoorMarkup} from './journey.js';
import {advanced,gradeFor,mathsFor,readingBank,storyCards} from './learning.js';
import {select} from './engine.js';
import {adaptiveCards} from './progress.js';
import {beginnerCard} from './beginner-access.js';
import {islandCards,nextIsland,islandIcon} from './dominican-adventure.js';
import {illustratedCards} from './illustrated-games.js';
import {planMissions,missionOpen} from './school-plan.js';
import {weekKey} from './garden.js';
import {childName,schoolMathLinks} from './worlds.js';
import {schoolVocabularyLinks,vocabularyURL} from './school-vocabulary.js';
import {travelPoints,weeklyTravel} from './voyage.js';

const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const card=(q,p,subject)=>{const adapted=beginnerCard(q,p,subject);return {...adapted,travelSubject:adapted.travelSubject||subject};};
const ready=q=>q&&typeof q.id==='string'&&typeof q.text==='string'&&Array.isArray(q.choices);
export function dailyAdventure(p,day,{exclude=[]}={}){
 const old=p.dailyAdventure;
 if(old?.day===day&&old.profileId===p.id&&old.grade===gradeFor(p)&&Array.isArray(old.items)&&old.items.length===3&&old.items.every(ready)&&Number.isInteger(old.index)&&old.index>=0&&old.index<=3)return old;
 const unseen=items=>items.filter(q=>!exclude.includes(q.id));
 const items=[],add=(q,subject)=>{if(ready(q)&&!exclude.includes(q.id)&&items.length<3&&!items.some(x=>x.id===q.id))items.push(card(q,p,subject));};
 // Only this child's current school week can feed the daily route.
 const week=weekKey(new Date(day+'T17:00:00Z'));
 const plan=(p.schoolPlans||[]).find(x=>x.profileId===p.id&&x.grade===gradeFor(p)&&x.week===week);
 if(plan){try{for(const [i,m] of planMissions(plan).missions.entries()){if(!missionOpen(p,planMissions(plan).missions,i))continue;const pending=m.items.filter(q=>p.records[q.id]?.result!=='correct');add(adaptiveCards(p,unseen(pending),day)[0],m.subject);}}catch{/* Keep the built-in route usable if an imported plan is invalid. */}}
 add(adaptiveCards(p,unseen(select(p,day,{shortSession:true}).filter(Boolean)),day)[0]||adaptiveCards(p,unseen(readingBank(p)),day)[0],'Français');
 add(adaptiveCards(p,unseen([...(advanced(p)?illustratedCards(p):[]),...mathsFor(p)]),day)[0],'Maths');
 const chapter=islandCards(p,nextIsland(p).id);
 const nextChapterCard=adaptiveCards(p,unseen(chapter),day)[0];
 add(nextChapterCard,nextChapterCard?.travelSubject||'Français');
 for(const q of [...chapter,...storyCards(p),...readingBank(p),...mathsFor(p)])add(q,q.travelSubject||'Français');
 const route={day,profileId:p.id,grade:gradeFor(p),items,index:0,seen:exclude};
 p.dailyAdventure=route;
 return route;
}
export function nextDailyAdventure(p,day){
 const old=dailyAdventure(p,day);
 if(old.index<old.items.length)return old;
 const exclude=[...new Set([...(old.seen||[]),...old.items.map(q=>q.id)])];
 delete p.dailyAdventure;
 let next=dailyAdventure(p,day,{exclude});
 if(next.items.length<3){delete p.dailyAdventure;next=dailyAdventure(p,day,{exclude:old.items.map(q=>q.id)});next.review=true;}
 return next;
}

export function advanceDaily(p,day,index){
 const route=p.dailyAdventure;
 if(route?.day===day&&route.profileId===p.id&&index===route.index&&index<route.items.length)route.index++;
}

function heading(p,title){return `<div class="simple-heading"><div class="portrait face-${p.id==='p1'?0:1}" aria-hidden="true"></div><div><span class="simple-level">${e(childName(p))} · ${gradeFor(p)}${gradeFor(p)===1?'re':'e'} année</span><h1>${title}</h1></div></div>`;}
function tile(label,description,art,attrs){return `<button class="simple-tile" ${attrs}><span class="simple-art" aria-hidden="true">${art}</span><span><strong>${label}</strong><small>${description}</small></span><span class="simple-arrow" aria-hidden="true">→</span></button>`;}
// Page d'accueil de chaque fille : tout est à un seul toucher, rien n'est caché derrière un sous-menu.
const hubLink=(label,art,href)=>`<a class="hub-tile hub-link" data-school-resource href="${e(href)}" target="_blank" rel="noopener noreferrer"><span class="hub-art" aria-hidden="true">${art}</span><strong>${label}</strong></a>`;
const hubTile=(label,art,attrs)=>`<button class="hub-tile" ${attrs}><span class="hub-art" aria-hidden="true">${art}</span><strong>${label}</strong></button>`;
export function childHome(p,day){
 const route=p.dailyAdventure,progress=route?.day===day&&route.profileId===p.id&&route.grade===gradeFor(p)?Math.min(3,route.index):0,s=weeklyTravel(p),older=advanced(p),who=p.id==='p1'?0:1;
 const read=older?[
  hubTile('Mes mots','🦋','data-action="words"'),hubTile('Les histoires','🦄','data-scene="reading"'),hubTile('Sons et syllabes','📖','data-scene="syllables"'),hubTile('Dictée magique','✍️','data-action="dictation"'),
  hubTile('Défi 3 secondes','⏱️','data-action="word-challenge"'),hubTile('Histoires de l’école','📚','data-action="private-stories"'),hubTile('Pourquoi ça s’écrit?','🔎','data-action="spelling-lab"'),hubTile('Mon carnet de trucs','🎁','data-action="trick-book"')
 ]:[
  hubTile('Les sons','🌸','data-action="rms-course"'),hubTile('Mes cartes de sons','🔤','data-action="sound-garden"'),hubTile('Les syllabes','🦋','data-scene="syllables"'),hubTile('Je lis','📖','data-scene="reading"'),
  hubTile('Dictée magique','✍️','data-action="dictation"'),hubTile('Défi 3 secondes','⏱️','data-action="word-challenge"'),hubTile('Histoires de l’école','📚','data-action="private-stories"'),hubTile('Mon carnet de trucs','🎁','data-action="trick-book"')
 ];
 const maths=[
  hubTile('Les nombres','<span class="number-art">1 2<br>3 4</span>','data-scene="numbers"'),
  hubTile('Les calculs','➕',older?'data-illustrated-calculation':'data-subject="2"'),
  hubTile('Défi vitesse','🚀','data-action="speed-math"'),
  older?hubTile('Mes tables','🔢','data-action="weekly"'):hubTile('Mes mini-défis','🌻','data-action="mini-garden"'),
  hubTile('Bonds de nombres','🐸','data-action="skip-counting"'),
  older?hubTile('Tables en chansons','🎵','data-action="table-songs"'):hubTile('Mon Pop-it','🔴','data-popit')
 ];
 const play=[
  hubTile('Chansons','🎵','data-action="songs-world"'),hubTile('Vidéos et défis','🎬','data-action="videos-french"'),hubTile('Un prof et sa guitare','🎸','data-action="videos-prof"'),hubTile('Maître Lucas','🎓','data-action="videos-lucas"'),
  hubTile('Notre voyage','🏝️','data-action="adventure"'),...(older?[hubTile('Mon archipel Squishy','🫧','data-action="squishy"')]:[]),hubTile('Mon coffre','🎁','data-action="rewards"')
 ];
 let voca='';try{voca=String(vocabularyURL(p)||'');}catch{}
 const school=[hubLink('Météormath 2','☄️','https://www.alloprof.qc.ca/fr/eleves/bv/jeux/meteormath-2'),...(older?[hubLink('MaZone CEC','📘','https://app.mazonecec.com/login?return_url=https%3A%2F%2Fmazonecec.com%2Fapplication'),...(/^https:\/\//.test(voca)?[hubLink('Voca · mes mots','🧩',voca)]:[])]:[hubLink('Nougat · mon livre','🐱','https://www.iplusinteractif.com/primaire/login?lang=fr_CA')])];
 const sec=(cls,icon,title,tiles)=>`<section class="hub-sec ${cls}" aria-label="${title}"><h2><span aria-hidden="true">${icon}</span> ${title}</h2><div class="hub-grid">${tiles.join('')}</div></section>`;
 return `<section class="simple-world child-hub hub-${who}" aria-label="Mon monde">
 <nav class="simple-top" aria-label="Mon profil"><button data-action="choose-child">‹ Changer de personnage</button><button data-action="rewards" class="hub-stars">✦ ${travelPoints(p)} étoiles · Mon coffre</button><button data-action="parent">Parents</button></nav>
 ${heading(p,'À toi de jouer!')}
 <div class="hub-hero">${journeyDoorMarkup(p,older)}<button class="daily-door" data-action="daily-start"><img src="/icons/dominicaine-bateau.webp" alt="" width="1672" height="941"><span class="daily-copy"><b class="kid-label">${progress&&progress<3?'Je continue !':'Jouer !'}</b><small>${progress===3?'Une série terminée · La suite t’attend':progress?`Étape ${progress+1} sur 3`:'3 petits jeux · À ton rythme'}</small><strong>Mon aventure du jour</strong></span></button></div>
 <div class="hub-secs">${sec('hub-read','📖','Lire et écrire',read)}${sec('hub-math','🔢','Les maths',maths)}${sec('hub-play','🎵','Écouter et découvrir',play)}${sec('hub-school','🏫','Mes jeux de l’école (nouvel onglet)',school)}</div>
 <p class="hub-more"><button data-action="french">Tout le français</button><button data-action="maths">Tous les maths</button>${s.tasks.length?'<button data-action="school-plan">Mes étapes de la semaine</button>':''}</p>
 </section>`;
}
export function subjectHome(p,subject,page=0){
 const older=advanced(p),french=subject==='french';
 // Pages de quatre grandes tuiles pour l'enfant : rien n'est retiré, tout reste atteignable avec « Encore ».
 // L'adulte voit toutes les pages d'un coup.
 const defi=tile('Défi 3 secondes','Lire les mots vite','⏱️','data-action="word-challenge"'),vid=tile('Vidéos et petits défis','Maître Lucas · Prof à la guitare','🎬','data-action="videos-french"'),songs=tile('Le français en chansons','Écouter, jouer et comprendre','🎵','data-action="songs-french"'),trip=tile('Nos histoires de voyage','La carte de notre voyage','🏝️','data-action="adventure"'),world=tile('Découvrir le monde','Mon école et mon quartier','🌍','data-subject="3"'),ecole=tile('Les histoires de l’école','Mes histoires du livre','📚','data-action="private-stories"'),carnet=tile('Mon carnet de trucs','Les trucs secrets que je découvre','🎁','data-action="trick-book"'),dict=tile('Dictée magique','Regarder, écouter, écrire mes mots','✍️','data-action="dictation"');
 const groups=french?(older?[
  [tile('Mes mots','Vocabulaire et orthographe','🦋','data-action="words"'),tile('Les histoires','Lire et comprendre','🦄','data-scene="reading"'),tile('Les sons et syllabes','Assembler et relire','📖','data-scene="syllables"'),defi],
  [vid,songs,tile('Mon archipel Squishy','12 compagnons · 3 chemins','🫧','data-action="squishy"'),trip],
  [tile('Pourquoi ça s’écrit comme ça?','Les sons, les lettres et les astuces','🔎','data-action="spelling-lab"'),world,dict,carnet],
  [ecole]
 ]:[
  [tile('Les sons','Écouter et découvrir','🌸','data-action="rms-course"'),tile('Les syllabes','Des mots de deux ou trois syllabes','🦋','data-scene="syllables"'),tile('Je lis de petites histoires','Lire et comprendre','📖','data-scene="reading"'),defi],
  [songs,tile('Toutes mes cartes de sons','Écouter et découvrir','🔤','data-action="sound-garden"'),trip,world],
  [dict,carnet,ecole,vid]
 ]):[
  [tile('Les nombres',older?'Compter jusqu’à 9 999':'Compter jusqu’à 99','<span class="number-art">1 2<br>3 4</span>','data-scene="numbers"'),
   tile('Les calculs',older?'Ajouter, enlever et grouper':'Ajouter et enlever',islandIcon('palmiers'),older?'data-illustrated-calculation':'data-subject="2"'),
   tile('Défi vitesse','Cartes et tableaux · chrono adapté','🚀','data-action="speed-math"'),
   tile('Vidéos et petits défis','Calculs et chansons expliqués','🎬','data-action="videos-maths"')],
  [tile('Mes bonds de nombres','De 2, de 5 et de 10 · jusqu’à 100','🐸','data-action="skip-counting"'),
   older?tile('Mes tables','Tables et opérations de la semaine','🔢','data-action="weekly"'):tile('Mes mini-défis','Petits jeux de maths','🌻','data-action="mini-garden"'),
   tile('Les maths en chansons','Calculs, mesures et fractions','🎵','data-action="songs-maths"'),
   ...(older?[tile('Tables en chansons','Écouter, compter et jouer','🏝️ 🎵','data-action="table-songs"')]:[tile('Mon Pop-it','Appuyer et chercher','<span class="popit-art">● ● ●<br>● ● ●<br>● ● ●</span>','data-popit')])],
  ...(older?[[tile('Mon Pop-it','Appuyer et chercher','<span class="popit-art">● ● ●<br>● ● ●<br>● ● ●</span>','data-popit')]]:[])
 ];
 const links=french?schoolVocabularyLinks(p,{installation:false}):schoolMathLinks(p);
 const pages=groups.map(g=>`<div class="simple-grid">${g.join('')}</div>`);
 if(links)pages.push(links);
 const current=((page%pages.length)+pages.length)%pages.length;
 return `<section class="simple-subject">${heading(p,french?'Français':'Maths')}${pages.map((html,i)=>`<div class="kid-page${i===current?' is-current':''}">${html}</div>`).join('')}
 ${pages.length>1?`<button type="button" class="kid-more" data-action="subject-more" aria-label="${current===pages.length-1?'Revenir au début':'Voir d’autres jeux'}">${current===pages.length-1?'‹ Début':'Encore ›'}</button>`:''}</section>`;
}
