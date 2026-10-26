// Original activities. Page order observed in the authenticated school viewer,
// Raconte-moi les sons, printed pp. 34–112, 2026-10-25. No publisher artwork/stories.
import {wordLesson} from './oral-learning.js';
import {gardenSounds} from './sound-garden.js';
import {answer,PROGRESSION_RULES} from './engine.js';
import {dailyEvidence} from './progress.js';

// page(s), spelling, recorded sound, model word, picture, assembly, teaching cue.
const rows=[
 [34,'a','a','avion','✈️','a','Ouvre la bouche pour cette voyelle.'],
 [35,'e','e','cheval','🐴','e','Écoute le petit e de cheval, différent de é.'],
 [36,'i','i','île','🏝️','i','Étire doucement les lèvres.'],
 [37,'y','i','stylo','🖊️','y','Dans stylo, y se lit comme i. Il peut changer dans d’autres mots.'],
 [38,'o','o','vélo','🚲','o','Arrondis les lèvres.'],
 [39,'u','u','lune','🌙','u','Le u de lune est différent du ou de loup.'],
 [40,'é','eacute','étoile','⭐','é','Regarde le sens de l’accent aigu.'],
 [41,'è','egrave','chèvre','🐐','è','Regarde l’accent grave et écoute la voyelle ouverte.'],
 [42,'ê','egrave','tête','🙂','ê','Dans tête, ê fait le même son que è.'],
 [43,'ë','egrave','Noël','🎄','ë','Dans Noël, les deux points séparent les voyelles. Écoute ë dans ce mot.'],
 [44,'s','s','soleil','☀️','s+a','Fais durer le son sans dire le nom de la lettre.'],
 [45,'j','j','jupe','👗','j+u','Fais vibrer doucement ta voix.'],
 [46,'f','f','fée','🧚','f+é','Souffle entre les dents du haut et la lèvre du bas.'],
 [47,'ch','ch','chat','🐱','ch+a','Deux lettres se lisent ensemble.'],
 [48,'r','r','rat','🐀','r+a','Écoute le son de r, sans ajouter e.'],
 [49,'z','z','zèbre','🦓','z+è','Ta voix vibre pour z.'],
 [50,'v','v','vélo','🚲','v+é','Ta voix vibre; compare avec f.'],
 [51,'m','m','mouton','🐑','m+a','Ferme les lèvres et fais vibrer ta voix.'],
 [52,'l','l','lune','🌙','l+u','Écoute l au début de lune.'],
 [53,'n','n','nuage','☁️','n+u','Écoute n au début de nuage.'],
 [54,'au','o','jaune','🟡','j+au','au se lit en un seul groupe, comme o.'],
 [55,'eau','o','seau','🪣','s+eau','Trois lettres, un seul son. Ne lis pas e séparément.'],
 [56,'on','on','ballon','🎈','l+on','Garde on ensemble pour la voyelle nasale.'],
 [57,'om','on','ombre','🌑','om','Devant b ou p, on s’écrit souvent om.'],
 [58,'t','t','tortue','🐢','t+o','Le son t est bref. Ne dis pas té.'],
 [59,'p','p','pomme','🍎','p+a','Le son p est bref.'],
 [60,'d','d','dauphin','🐬','d+au','Le son d est bref.'],
 [61,'b','b','bateau','⛵','b+a','Le son b est bref.'],
 [[62,63],'b / d','b','bulle','🫧','b+u','b : le rond est à droite de la tige. d : le rond est à gauche.'],
 [64,'ou','ou','loup','🐺','l+ou','Deux lettres ensemble. Compare ou avec u.'],
 [65,'h',null,'hibou','🦉','h+i','Dans hibou, h est muet. Écoute le mot entier.'],
 [[66,67],'eu','eu','feu','🔥','f+eu','Dans feu, eu se lit ensemble. Un autre son viendra plus tard.'],
 [68,'an','an','volant','🚗','l+an','an est une voyelle nasale.'],
 [69,'am','an','lampe','💡','l+am','Devant b ou p, an s’écrit souvent am.'],
 [70,'en','an','dent','🦷','d+en','Dans dent, en fait le même son que an.'],
 [71,'em','an','empreinte','🐾','em','Devant b ou p, en peut s’écrire em, comme dans septembre.'],
 [72,'k','k','kiwi','🥝','k+i','k garde le son bref de canard.'],
 [73,'c','k','canard','🦆','c+a','Dans ca, c fait le son k.'],
 [74,'q','k','coq','🐓','q','À la fin de coq, q fait le son k.'],
 [75,'qu','k','quatre','4️⃣','qu+a','Dans quatre, qu fait k; u ne se lit pas séparément.'],
 [76,'c devant e, i','s','citron','🍋','c+i','Devant e ou i, c fait s, comme dans citron.'],
 [77,'ç','s','garçon','👦','ç+on','La cédille garde le son s, comme dans garçon.'],
 [[78,79],'p / q','p','poule','🐔','p+ou','p : le rond est à droite. q : le rond est à gauche. La tige descend.'],
 [80,'oi',null,'poire','🍐','p+oi','oi se lit ensemble, comme dans poire. Écoute le mot.'],
 [81,'w','w','wapiti','🦌','w+a','Dans wapiti, w commence comme oui. Le son de w dépend du mot.'],
 [82,'er','eacute','panier','🧺','er','À la fin de panier, er se lit comme é.'],
 [83,'ez','eacute','nez','👃','ez','À la fin de nez, ez se lit comme é.'],
 [84,'ei','egrave','neige','❄️','n+ei','Dans neige, ei se lit comme è.'],
 [85,'ai','egrave','aile','🪽','ai','Dans aile, ai se lit comme è. Observe ce qui suit ai.'],
 [86,'g','g','gâteau','🍰','g+a','Dans gâteau, g fait son son dur.'],
 [87,'gu','g','guitare','🎸','gu+i','Devant i ou e, u aide g à garder son son dur.'],
 [88,'g devant e, i','j','girafe','🦒','g+i','Devant i ou e, g peut faire le son j.'],
 [89,'x',null,'taxi','🚕','x','Dans taxi, x fait deux sons, k puis s. Écoute le mot entier.'],
 [90,'in','in','sapin','🌲','p+in','Garde in ensemble.'],
 [91,'im','in','timbre','✉️','t+im','Devant b ou p, in s’écrit souvent im.'],
 [[92,93],'ain / ein / aim','in','pain','🥖','p+ain','Dans pain, plein et faim, le groupe se lit comme in.'],
 [94,'un','un','brun','🟤','un','Écoute un et compare avec in, avec ton adulte.'],
 [95,'um','un','parfum','🌸','um','Dans parfum, um se lit comme un.'],
 [96,'s entre voyelles','z','rose','🌹','r+o','Dans rose, s entre deux voyelles fait z.'],
 [97,'gn','gn','montagne','🏔️','gn+e','gn se lit ensemble, comme dans montagne.'],
 [[98,99],'e et deux consonnes','egrave','perle','🦪','p+er','Dans perle, e devant deux consonnes se lit comme è.'],
 [100,'ai final','eacute','balai','🧹','l+ai','À la fin de balai, ai se lit comme é. Compare avec aile.'],
 [101,'eu ouvert','oe','fleur','🌷','l+eu','Dans fleur, eu est ouvert. Compare fleur avec feu.'],
 [102,'ill','y','papillon','🦋','ill','Dans papillon, ill glisse. D’autres mots, comme ville, sont différents.'],
 [103,'il après une voyelle','y','soleil','☀️','e+il','Dans soleil, il après e glisse. Écoute le mot entier.'],
 [[104,105],'ph','f','photo','📷','ph+o','Deux lettres ph font le même son que f.'],
 [[106,107],'tion',null,'addition','➕','tion','Dans addition, tion se lit comme sion. Écoute le groupe dans le mot.'],
 [[108,109],'ien',null,'chien','🐶','ch+ien','Dans chien, ien se lit ensemble, avec un début qui glisse.'],
 [110,'œu','oe','œuf','🥚','œu','Dans œuf, œu fait une voyelle ouverte. Écoute le mot.'],
 [111,'ch avec k','k','orchestre','🎻','ch+e','Dans orchestre, ch fait k. Essaie d’abord le son habituel de chat dans un mot nouveau.'],
 [112,'yn / ym','in','lynx','🐈','l+yn','Dans lynx et thym, yn et ym se lisent comme in.']
];
export const rmsLessons=rows.map(([pages,spelling,sound,word,picture,assembly,cue])=>({
 id:'rms-'+(Array.isArray(pages)?pages[0]:pages),pages:Array.isArray(pages)?pages:[pages],spelling,sound,word,picture,parts:assembly.split('+'),cue
}));
export const rmsSteps=['Écouter','Choisir l’image','Assembler','Lire un mot','Petit défi'];
export const rmsSpeech={image:'Écoute le mot, puis choisis son image.',assembly:'Touche les morceaux dans le bon ordre. Tu peux les effacer et recommencer.',word:'Essaie de lire le mot. Avec ton adulte, indique comment cela s’est passé.',challenge:'Retrouve la voyelle, la syllabe ou le groupe que tu as assemblé.',correct:'Bravo pour ton effort! Continue à ton rythme.',retry:'On prend notre temps. Écoute le modèle et essaie encore.',pause:'Une petite pause! Tes essais sont conservés.'};
export const rmsNarrationTexts=[...Object.values(rmsSpeech),...rmsLessons.flatMap(l=>[wordLesson(l.word),l.cue])];
export const rmsEnabled=p=>p?.id==='p1'&&p.schoolContext?.stage==='1re année';
export function rmsCard(lesson,step){return {id:lesson.id+'-'+step,skill:step===2?'syllabes':step===3?'mots':'sons',level:1};}
export function rmsTier(p,lesson,day){
 const byDay=new Map();
 for(const e of dailyEvidence(p.history.filter(e=>typeof e?.id==='string'&&e.id.startsWith(lesson.id+'-')&&e.day<=day))){
  const previous=byDay.get(e.day);byDay.set(e.day,{...e,result:previous&&previous.result!=='correct'?previous.result:e.result});
 }
 const recent=[...byDay.values()].slice(-PROGRESSION_RULES.window);
 const days=new Set(recent.map(e=>e.day)).size;
 return recent.length===4&&days>=PROGRESSION_RULES.tier3Days&&recent.every(e=>e.result==='correct')?3:days>=PROGRESSION_RULES.tier2Days&&recent.filter(e=>e.result==='correct').length>=Math.ceil(recent.length*PROGRESSION_RULES.tier2Ratio)?2:1;
}
export function rmsSuggested(p,day){
 const due=rmsLessons.find(l=>[1,2,3,4].some(s=>p.records[rmsCard(l,s).id]?.due<=day));
 return due||rmsLessons.find(l=>![1,2,3,4].every(s=>p.records[rmsCard(l,s).id]))||rmsLessons[0];
}
export function rmsRecord(p,lesson,step,result,day){if(!rmsEnabled(p)||!rmsLessons.includes(lesson)||![1,2,3,4].includes(step))return null;return answer(p,rmsCard(lesson,step),result,day,'Français');}
export function rmsPictures(lesson,tier){
 const distractors=gardenSounds.filter(s=>s.word!==lesson.word&&s.emoji!==lesson.picture&&s.id!==lesson.sound);
 return [{word:lesson.word,picture:lesson.picture},...distractors.slice(0,tier===1?1:2).map(s=>({word:s.word,picture:s.emoji}))].sort((a,b)=>a.word.localeCompare(b.word,'fr'));
}
export function rmsSpellings(lesson,tier){return [...new Set([lesson.parts.join(''),...(tier===1?['a','i']:['a','i','ou'])])].sort((a,b)=>a.localeCompare(b,'fr'));}
export function rmsAssemblyChoices(lesson){return lesson.parts.map((text,index)=>({text,index})).reverse();}
