import {advanced,gradeFor,mathsFor,readingBank,storyCards} from './learning.js';
import {select} from './engine.js';
import {adaptiveCards} from './progress.js';
import {beginnerCard} from './beginner-access.js';
import {islandCards,nextIsland,islandIcon} from './dominican-adventure.js';
import {illustratedCards} from './illustrated-games.js';
import {planMissions,missionOpen} from './school-plan.js';
import {weekKey} from './garden.js';
import {childName,schoolMathLinks} from './worlds.js';
import {schoolVocabularyLinks} from './school-vocabulary.js';
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
export function childHome(p,day){
 const route=p.dailyAdventure,progress=route?.day===day&&route.profileId===p.id&&route.grade===gradeFor(p)?Math.min(3,route.index):0,s=weeklyTravel(p);
 return `<section class="simple-world" aria-label="Mon monde">
 <nav class="simple-top" aria-label="Mon profil"><button data-action="choose-child">‹ Changer de personnage</button><button data-action="parent">Parents</button></nav>
 ${heading(p,'À toi de jouer!')}
 <div class="simple-doors" aria-label="Mes trois choix">
 <button class="daily-door" data-action="daily-start"><img src="/icons/dominicaine-bateau.webp" alt="" width="1672" height="941"><span class="daily-copy"><small>${progress===3?'Une série terminée · La suite t’attend':progress?`Étape ${progress+1} sur 3`:'3 petits jeux · À ton rythme'}</small><strong>Mon aventure du jour</strong><span>${progress===3?'Continuer mon aventure':progress?'Je continue':'C’est parti!'} →</span></span></button>
 ${tile('Français',advanced(p)?'Mes mots et mes histoires':'Les sons et les mots','<span class="book-art">Aa</span>','data-action="french"')}
 ${tile('Maths','Les nombres et les calculs','<span class="number-art">1 2<br>3 4</span>','data-action="maths"')}
 </div><details class="simple-treasure"><summary>✦ ${travelPoints(p)} étoiles · Mon coffre</summary><p>${s.reward?'Tes ailes de la semaine sont dans ton coffre!':'Chaque petit effort fait avancer ton voyage.'}</p>${s.tasks.length?`<p>${s.done} / ${s.tasks.length} étapes du plan confirmées avec ton parent.</p>`:''}<button data-action="adventure">La carte de notre voyage</button><button data-action="school-plan">Mes étapes de la semaine</button></details>
 </section>`;
}
export function subjectHome(p,subject){
 const older=advanced(p),french=subject==='french';
 const tiles=french?[
  ...(!older?[tile('Les sons','Écouter et découvrir','🌸','data-action="rms-course"')]:[]),
  tile(older?'Mes mots':'Les syllabes',older?'Vocabulaire et orthographe':'Assembler les petits morceaux','🦋',older?'data-action="words"':'data-scene="syllables"'),
  tile('Les histoires',older?'Lire et comprendre':'Écouter et comprendre','🦄','data-scene="reading"'),
  ...(older?[tile('Les sons et syllabes','Assembler et relire','📖','data-scene="syllables"')]:[])
 ]:[tile('Les nombres',older?'Compter jusqu’à 1 999':'Compter jusqu’à 99','<span class="number-art">1 2<br>3 4</span>','data-scene="numbers"'),tile('Les calculs',older?'Ajouter, enlever et grouper':'Ajouter et enlever',islandIcon('palmiers'),older?'data-illustrated-calculation':'data-subject="2"'),tile('Mon Pop-it','Appuyer et chercher','<span class="popit-art">● ● ●<br>● ● ●<br>● ● ●</span>','data-popit')];
 return `<section class="simple-subject">${heading(p,french?'Français':'Maths')}<div class="simple-grid">${tiles.join('')}</div>
 ${french?schoolVocabularyLinks(p,{installation:false}):''}
 <details class="simple-more"><summary>${french?'Encore des découvertes':'D’autres jeux de maths'}</summary><div class="simple-extra">
 ${french?`${older?'<button data-action="squishy">Mon archipel Squishy</button>':'<button data-action="sound-garden">Toutes mes cartes de sons</button>'}<button data-action="adventure">Nos histoires de voyage</button><button data-subject="3">Découvrir le monde</button>`:`${older?'<button data-action="weekly">Mes tables</button>':'<button data-action="mini-garden">Mes mini-défis</button>'}${schoolMathLinks(p)}`}
 </div></details></section>`;
}
