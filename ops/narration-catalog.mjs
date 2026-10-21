import {createHash} from 'node:crypto';
import {bank} from '../src/content.js';
import {olderReading} from '../src/learning.js';
import {stories,mathCards,social} from '../src/garden.js';
import {tablePractice} from '../src/week-plan.js';
import {numberWords} from '../src/numbers.js';
import {spokenActivity} from '../src/speech.js';
export const MODEL='gpt-4o-mini-tts-2025-12-15',VOICE='coral';
export const INSTRUCTIONS='Parle en français québécois naturel, avec une voix féminine douce, chaleureuse et rassurante. Lis lentement et articule clairement, sans exagérer l’accent. Respecte les pauses et l’intonation du texte. Lis seulement le texte fourni, sans introduction.';
export function narrationCatalog(){
 const cards=[...bank,...olderReading,...stories,...mathCards,social];
 for(let n=1;n<=6;n++)for(const op of ['+','−'])cards.push(...tablePractice(n,op));
 const texts=new Set(['Bonjour! On prend notre temps pour lire ensemble.','Bravo! Tu as bien travaillé.','On prend notre temps. Tu peux réessayer.']);
 for(let n=0;n<=1999;n++)texts.add(numberWords(n));
 for(const q of cards){
  // Built-in teaching content only. No profiles, uploads, questions or child audio.
  const text=spokenActivity(q);if(!/Liana|Mely-Ann/i.test(text))texts.add(text);
 }
 return [...texts].map(text=>({text,file:createHash('sha256').update(MODEL+'|'+VOICE+'|'+INSTRUCTIONS+'|'+text).digest('hex')+'.mp3'}));
}
