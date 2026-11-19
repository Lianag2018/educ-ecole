// Leçon d'un son en cinq temps, adaptée de la démarche pédagogique de l'école : (1) voir et entendre l'histoire, (2) faire le GESTE avec le bruit,
// (3) lire quelques MOTS en les découpant en syllabes, (4) jouer l'activité, (5) réinvestir par la dictée magique.
// Tous les gestes et textes sont reformulés avec nos mots (le livre de l'école reste privé à la famille).
import {lessonWords} from './lesson-words-data.js';
import {syllabify} from './syllables.js';
import {bookWordsFor} from './book-words.js';
import {bookGestureFor} from './book-gestures.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const LESSON_STEPS=2;
export const gestures=Object.freeze({
 ou:['👻','Bouge les bras comme un fantôme fatigué et étire le son : « ou-ou-ou ».'],
 on:['🙊','Pose une main sur ta bouche, l’air désolé, et dis : « onnn ».'],
 ch:['🤫','Mets ton doigt devant ta bouche pour calmer un bébé : « chchch ».'],
 a:['😮','Ouvre grand la bouche, une main sur la joue, comme avec un mal de dents : « aaaa ».'],
 i:['🐭','Étire un grand sourire et fais le petit cri de la souris : « i-i, i-i ».'],
 u:['🐴','Secoue des rênes imaginaires devant toi : « u-u ».'],
 f:['🚲','Pompe un pneu de vélo avec tes mains : « f-f-f-f ».'],
 v:['🚢','Tire une corde de haut en bas comme la sirène d’un bateau : « vvvv-vvvv ».'],
 m:['😋','Frotte ton ventre en petits ronds : « mmm, c’est bon ».'],
 l:['❄️','Penche la tête en arrière et montre où va ta langue : « lllll ».'],
 s:['🐍','Fais onduler ta main en traçant un s, comme un serpent : « sssss ».'],
 in:['📺','Appuie sur un gros bouton imaginaire avec ta paume : « in! ».'],
 eacute:['🚴','Tiens un guidon, lève les yeux vers le haut de la côte : « héééé, hop! ».'],
 egrave:['😱','Regarde vers le bas d’une pente imaginaire et crie : « èèèèè! ».'],
 o:['🎅','Fais une bouche bien ronde et ris comme le père Noël : « oh-oh-oh ».'],
 oopen:['🍎','Arrondis la bouche un peu moins grand et dis « o » comme dans « pomme ».'],
 eu:['☝️','Lève le bras, pointe l’index vers de faux coupables : « eu-eu-eu ».'],
 oe:['🤔','Pose le menton sur tes mains comme quelqu’un qui cherche : « eu… ».'],
 e:['🧠','Cherche dans ta tête en fermant les yeux : « eee… eee… ».'],
 'a-back':['🥱','Ouvre la bouche haute et profonde, comme un bâillement : « âââ ».'],
 an:['🚶','Appuie une main sur une marchette imaginaire, l’autre en cornet à l’oreille : « an-an-an ».'],
 un:['☝️','Lève un seul doigt et dis : « un ».'],
 p:['🚤','Tire la corde du moteur de la chaloupe : « p-p-p, p-p-p-p-p ».'],
 b:['🤭','Une main sur le ventre, fais de tout petits hoquets : « b-b-b ».'],
 t:['🥁','Tape sur un tambour imaginaire : « t-t-t, t-t-t ».'],
 d:['🎲','Lance des dés dans les airs en bégayant : « d-d-d-d ».'],
 k:['🪵','Casse une petite branche entre tes mains : « k! ».'],
 g:['🥤','Fais semblant de boire en avalant : « g-g-g-g ».'],
 n:['😠','Secoue la tête et le doigt comme une gardienne fâchée : « n-n-n ».'],
 gn:['😝','Plisse le nez, pouce sur la tempe, et chantonne en te moquant : « gn-gn-gn ».'],
 z:['🐝','Trace un z dans l’air avec le doigt comme une abeille : « zzzzz ».'],
 j:['🪒','Fais semblant de passer un rasoir électrique sur ta joue : « jjjjj ».'],
 r:['🦁','Fais la patte d’un lion qui gronde : « rrr-rrr ».'],
 y:['🦖','Fais deux ou trois antennes avec tes doigts derrière ta tête et cligne des yeux : « i-e, i-e ».'],
 w:['🪿','Mets tes mains en cornet autour de la bouche et appelle l’oie : « oi-oi, oi-oi ».'],
 ui:['💧','Touche ton nez comme si une goutte tombait et dis : « ui, ui! ».']
});
// Quatre mots par son, découpés en syllabes avec des tirets. Mots courants.
export {lessonWords};
// Conseils de lecture (reformulés) : on en montre un différent selon le son.
export const readingTips=Object.freeze([
 'Si le mot ne sonne pas comme un mot que tu connais, des lettres ont peut-être mal parlé. Regarde-le autrement!',
 'Découpe le mot en syllabes en tapant dans tes mains : ba-na-ne. Une tape, une syllabe.',
 'Deux lettres pareilles, comme nn ou mm, sont des jumeaux : ils restent ensemble et ne changent pas le son d’avant.',
 'Cherche d’abord les lettres qui vont ensemble, comme ou, on ou ch, avant de lire lettre par lettre.']);
export const gestureFor=id=>{const mine=gestures[id]||['🖐️','Invente un geste pour ce son et dis-le bien fort.'],book=bookGestureFor(id);return [mine[0],book||mine[1]];};
export const wordsFor=id=>{const own=(lessonWords[id]||'').split(' ').filter(Boolean).map(w=>({syllables:w.split('-'),plain:w.replace(/-/g,'')}));const seen=new Set(own.map(w=>w.plain));const extra=bookWordsFor(id).filter(w=>!seen.has(w)&&seen.add(w)).map(w=>({syllables:syllabify(w),plain:w}));return [...own,...extra];};
export const tipFor=idx=>readingTips[Math.abs(idx)%readingTips.length];
export const gestureText=id=>gestureFor(id)[1];
export const lessonNarrationLines=id=>[gestureText(id)];
export function gestureStepMarkup(story){
 const [icon,text]=gestureFor(story.id);
 return `<div class="ss-page ss-gesture" style="--ss:${story.color}"><button type="button" class="ss-scene" data-story-read aria-label="Relire le geste">${icon}<i class="ss-ear" aria-hidden="true">🔊</i></button><h2 class="ss-step">✋ Fais le geste du son « ${esc(story.label||story.sound)} »</h2><p class="ss-text">${esc(text)}</p><button type="button" class="ss-go" data-story-gesture>✋ Je l’ai fait!</button>`;
}
export const WORDS_PER_PAGE=6;
export const wordPages=id=>Math.max(1,Math.ceil(wordsFor(id).length/WORDS_PER_PAGE));
export function wordsStepMarkup(story,idx=0,round=0){
 const all=wordsFor(story.id),pages=wordPages(story.id),at=round%pages,list=all.slice(at*WORDS_PER_PAGE,(at+1)*WORDS_PER_PAGE);
 const items=list.map(w=>`<button type="button" class="ss-word" data-lesson-word="${esc(w.plain)}" aria-label="${esc(w.plain)}">${w.syllables.map(s=>`<span>${esc(s)}</span>`).join('<i aria-hidden="true">·</i>')}</button>`).join('');
 return `<div class="ss-page ss-words" style="--ss:${story.color}"><h2 class="ss-step">👀 Lis les mots, syllabe par syllabe</h2><div class="ss-wordlist">${items}</div><p class="ss-tip" data-story-read>💡 ${esc(tipFor(idx+at))}</p><button type="button" class="ss-go" data-lesson-write>✍️ Écrire des mots du son</button>${pages>1?`<button type="button" class="ss-again" data-lesson-more>🔄 Autres mots (${at+1} / ${pages})</button>`:''}`;
}
