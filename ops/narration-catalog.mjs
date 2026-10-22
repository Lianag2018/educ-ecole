import {createHash} from 'node:crypto';
import {bank} from '../src/content.js';
import {olderReading,mathsFor,socialFor} from '../src/learning.js';
import {oralQuestion,oralFeedback,choiceSpeech,wordLesson,syllables} from '../src/oral-learning.js';
import {localHint} from '../src/tutor.js';
import {stories,mathCards,social,rows} from '../src/garden.js';
import {tablePractice} from '../src/week-plan.js';
import {numberWords} from '../src/numbers.js';
import {spokenActivity} from '../src/speech.js';
export const MODEL='gpt-4o-mini-tts-2025-12-15',VOICE='coral';
export const INSTRUCTIONS='Parle en français québécois naturel, avec une voix féminine douce, chaleureuse et rassurante. Lis lentement et articule clairement, sans exagérer l’accent. Respecte les pauses et l’intonation du texte. Lis seulement le texte fourni, sans introduction.';
export function narrationCatalog(){
 const cards=[...bank,...olderReading,...stories,...mathCards,social];
 for(let n=1;n<=6;n++)for(const op of ['+','−'])cards.push(...tablePractice(n,op));
 const texts=new Set(['Bonjour! On prend notre temps pour lire ensemble.','Bravo! Tu as bien travaillé.','On prend notre temps. Tu peux réessayer.']);
 for(const n of [307,1000,1999,1001,1010,1024,1100,1208,1370,1500,1809])texts.add(numberWords(n));
 for(const q of cards){
  // Built-in teaching content only. No profiles, uploads, questions or child audio.
  const text=spokenActivity(q);if(!/Liana|Mely-Ann/i.test(text))texts.add(text);
 }
 // Make daily lessons and the photographed worksheet usable first if a provider
 // interrupts the initial catalog build; hashes do not depend on this order.
 for(const n of Object.values(rows).flat())texts.add(numberWords(n));
 for(let n=0;n<100;n++)texts.add(numberWords(n));
 for(let n=100;n<=1000;n+=100)texts.add(numberWords(n));
 const baseTexts=new Set(texts);
 const young={id:'p1'},oralCards=[...bank,...mathsFor(young),socialFor(young),...stories.filter(q=>q.grade===1)];
 for(const q of oralCards){texts.add(spokenActivity(q));texts.add(oralQuestion(q));texts.add(localHint(q,young));for(const c of q.choices)texts.add(choiceSpeech(c));for(const result of ['correct','incorrect','help'])texts.add(oralFeedback(q,result));}
 for(const word of Object.keys(syllables))texts.add(wordLesson(word));
 const segmented=new Set([...Object.keys(syllables).map(wordLesson),...bank.filter(q=>q.id.startsWith('first-blend-')).map(spokenActivity)]);
 const phonics=new Set(bank.filter(q=>['sons','syllabes'].includes(q.skill)).flatMap(q=>[spokenActivity(q),oralQuestion(q),...q.choices.map(choiceSpeech),...['correct','incorrect','help'].map(r=>oralFeedback(q,r))]));
 return [...texts].map(text=>{let instructions=segmented.has(text)?INSTRUCTIONS+' Exercice de décodage en français uniquement. Les éléments séparés par des points sont des syllabes orales, pas des noms de lettres. Prononce chaque syllabe puis le mot entier. Dans pin, le son final est nasal, comme dans sapin; jamais le mot anglais pin.':INSTRUCTIONS;
 if(phonics.has(text)||segmented.has(text))instructions+=' Tous les mots sont français, même les mots courts. Ne bascule jamais en anglais. Pain rime avec main et sapin, avec une voyelle nasale, jamais le mot anglais pain. Le u de lune est distinct du ou de loup. On est nasal comme dans rond. Ch se prononce comme au début de chat, pas comme en anglais. Ne lis pas les signes plus et ne rajoute pas de son e après une consonne.';
 return {text,instructions,align:baseTexts.has(text),file:createHash('sha256').update(MODEL+'|'+VOICE+'|'+instructions+'|'+text).digest('hex')+'.mp3'};});
}
