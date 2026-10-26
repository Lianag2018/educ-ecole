import {sujetsMely,exercicesMely} from '../src/mely-grade1.js';
import {beginnerCard,activityPages} from '../src/beginner-access.js';
import {islandChapters,islandCards} from '../src/dominican-adventure.js';
import {destinations,travelCards} from '../src/voyage.js';
import {rmsNarrationTexts} from '../src/rms-course.js';
import {numericInstructions} from '../src/math-speech.js';
import {miniZones,miniCards} from '../src/mini-garden.js';
import {ORAL_FEEDBACK,ORAL_WORD_TEXTS} from '../src/oral-check-targets.js';
import {squishyStages} from '../src/squishy.js';
import {gardenSounds,gardenWelcome,gardenEncouragement} from '../src/sound-garden.js';
import {soundCards} from '../src/sound-cards.js';
import {createHash} from 'node:crypto';
import {bank} from '../src/content.js';
import {olderReading,mathsFor,socialFor} from '../src/learning.js';
import {oralQuestion,oralFeedback,choiceSpeech,wordLesson,isFrenchWordModel,syllables} from '../src/oral-learning.js';
import {localHint} from '../src/tutor.js';
import {stories,mathCards,social,rows} from '../src/garden.js';
import {tablePractice} from '../src/week-plan.js';
import {numberWords} from '../src/numbers.js';
import {spokenActivity} from '../src/speech.js';
export const MODEL='gpt-4o-mini-tts-2025-12-15',VOICE='coral';
export const INSTRUCTIONS='Parle en français québécois naturel, avec une voix féminine douce, chaleureuse et rassurante. Lis lentement et articule clairement, sans exagérer l’accent. Respecte les pauses et l’intonation du texte. Lis seulement le texte fourni, sans introduction. Reste exclusivement en français du Québec du début à la fin, y compris pour les mots isolés et les nombres. Ne prononce aucun mot comme un mot anglais. Ne rajoute ni syllabe ni mot. Garde les voyelles françaises distinctes et les voyelles nasales naturelles.';
export const NATURAL_INSTRUCTIONS=INSTRUCTIONS.replace('Lis lentement et articule clairement', 'Lis à un rythme naturel et fluide, avec une articulation claire, sans étirer les syllabes');
export function narrationCatalog(){
 // Alignment uses the activity's source collection, not number/operator words
 // found in a story. This metadata does not participate in the MP3 cache key.
 const numericActivityTexts=new Set([...mathsFor({id:'p1'}),...mathsFor({id:'p2'}),...mathCards].flatMap(q=>[spokenActivity(q),q.explanation]));
 const island=islandChapters.flatMap(c=>['p1','p2'].flatMap(id=>islandCards({id},c.id)));
 const travel=destinations.flatMap(d=>['p1','p2'].flatMap(id=>travelCards({id},d.id)));
 const cards=[...mathsFor({id:'p2'}),...bank,...olderReading,...stories,...mathCards,social];
 for(let n=1;n<=6;n++)for(const op of ['+','−']){
  const practice=tablePractice(n,op);cards.push(...practice);
  for(const q of practice){numericActivityTexts.add(spokenActivity(q));numericActivityTexts.add(q.explanation);}
 }
 const texts=new Set(['Bonjour! On prend notre temps pour lire ensemble.','Bravo! Tu as bien travaillé.','On prend notre temps. Tu peux réessayer.']);
 // Standalone operators join the recorded number blocks without regenerating
 // complete calculations or changing the existing narration cache keys.
 const operatorTexts=new Set(['plus','moins','fois','divisé par','égale','est plus petit que','est plus grand que']);
 for(const text of operatorTexts)texts.add(text);
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
 for(const card of Object.values(soundCards))texts.add(card.instruction);
 texts.add('cinquante-six moins vingt');
 const numberNames=new Set(Array.from({length:2000},(_,n)=>numberWords(n)));
 const numericTexts=new Set([...texts].filter(t=>operatorTexts.has(t)||numberNames.has(t)||/ (plus|moins|fois|égale|divisé par|est plus petit que|est plus grand que) /.test(t)));
 for(let n=1;n<=6;n++)for(const op of ['+','−'])for(const q of tablePractice(n,op))texts.add(q.explanation);
 const baseTexts=new Set(texts);

 for(const text of rmsNarrationTexts)texts.add(text);
 // Fixed oral feedback and whole-word models contain no child recording.
 for(const text of [...Object.values(ORAL_FEEDBACK),...ORAL_WORD_TEXTS])texts.add(text);
 // Introduce older activities by their instruction, leaving the reading model optional.
 for(const q of olderReading)texts.add(oralQuestion(q));
 texts.add(gardenWelcome);texts.add(gardenEncouragement);for(const card of gardenSounds)texts.add(card.instruction);
 for(const stage of squishyStages)for(const q of stage.items){texts.add(spokenActivity(q));texts.add(oralQuestion(q));texts.add(q.hint);for(const c of q.choices)texts.add(choiceSpeech(c));for(const r of ['correct','incorrect','help'])texts.add(oralFeedback(q,r));}
 const young={id:'p1'},oralCards=[...bank,...mathsFor(young),socialFor(young),...stories.filter(q=>q.grade===1)];
 for(const q of oralCards){texts.add(spokenActivity(q));texts.add(oralQuestion(q));texts.add(localHint(q,young));for(const c of q.choices)texts.add(choiceSpeech(c));for(const result of ['correct','incorrect','help'])texts.add(oralFeedback(q,result));}
 // Public, original mini-games reuse the same narrator/cache and never include
 // school credentials, child results or publisher assets. No extra alignment.
 for(const zone of miniZones)for(const tier of [1,2,3])for(const q of miniCards(zone.id,tier)){
  for(const text of [spokenActivity(q),oralQuestion(q),q.hint,...q.choices.map(choiceSpeech),...['correct','incorrect','help'].map(r=>oralFeedback(q,r))]){
   texts.add(text);numericActivityTexts.add(text);
  }
 }
 for(const word of Object.keys(syllables))texts.add(wordLesson(word));
 // New adventure narration is natural at 1x. Keep shared teaching clips and
 // existing cache keys intact; no wholesale re-generation of the audio library.
 const adventureTexts=new Set();
 for(const q of [...travel,...island])for(const text of [spokenActivity(q),oralQuestion(q),q.explanation,...q.choices.map(choiceSpeech),...['correct','incorrect','help'].map(r=>oralFeedback(q,r))])adventureTexts.add(text);
 const naturalTexts=new Set([...adventureTexts].filter(text=>!texts.has(text)));
 for(const text of adventureTexts)texts.add(text);
 for(const original of [...sujetsMely.flatMap(s=>exercicesMely(s.id)),...oralCards,...travel.filter(q=>q.id.includes('-p1-')),...island.filter(q=>q.id.includes('-p1-'))]){const q=beginnerCard(original,{id:'p1'});for(const text of [...activityPages(q,{id:'p1'}),oralQuestion(q),q.explanation,...q.choices.map(choiceSpeech),...['correct','incorrect','help'].map(r=>oralFeedback(q,r))]){if(!texts.has(text))naturalTexts.add(text);texts.add(text);}}
 const wordModels=new Set([...Object.keys(syllables).map(wordLesson),...rmsNarrationTexts.filter(isFrenchWordModel)]);
 const blends=new Set(bank.filter(q=>q.id.startsWith('first-blend-')).map(spokenActivity));
 const socialModel=socialFor(young);
 const socialTexts=new Set([spokenActivity(socialModel),oralQuestion(socialModel),socialModel.explanation]);
 const phonics=new Set(bank.filter(q=>['sons','syllabes'].includes(q.skill)).flatMap(q=>[spokenActivity(q),oralQuestion(q),...q.choices.map(choiceSpeech),...['correct','incorrect','help'].map(r=>oralFeedback(q,r))]));
 return [...texts].map(text=>{
 const natural=phonics.has(text)||isFrenchWordModel(text)||wordModels.has(text)||blends.has(text)||socialTexts.has(text);
 let instructions=natural?'Lis exclusivement en français, avec une prononciation française du Québec claire et usuelle, une voix féminine douce et un débit naturel. Garde chaque mot entier et ses sons liés. Ne chante pas, ne scande pas et n’étire aucune voyelle. Ne rajoute pas de e final ni de nom de lettre. Fais seulement une courte pause entre les phrases. Lis uniquement le texte fourni.':(naturalTexts.has(text)?NATURAL_INSTRUCTIONS:INSTRUCTIONS);
 if(natural)instructions+=' Ne bascule jamais en anglais, même pour un mot court. Le u de lune et de lecture est différent du ou de loup. Pain, main et pin ont une voyelle nasale française. Dans choisis, le s entre voyelles se prononce comme z. Dans rapporte, les deux p écrits ne donnent qu’un seul son p. Dans bibliothèque, th se prononce t et que se prononce k. Dans après, le s final est muet et è est une voyelle ouverte.';
 if(numericTexts.has(text))instructions+=numericInstructions;
 const speed=natural||naturalTexts.has(text)?1:.85;
 // Preserve all unrelated cache keys. Revised phonics use a new key including
 // their natural generation speed, so old defective clips cannot be reused.
 const key=MODEL+'|'+VOICE+'|'+instructions+'|'+text+(natural?'|speed='+speed:'');
 return {text,instructions,speed,numeric:operatorTexts.has(text)||numberNames.has(text)||numericActivityTexts.has(text),align:baseTexts.has(text),file:createHash('sha256').update(key).digest('hex')+'.mp3'};});
}
