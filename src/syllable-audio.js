import {kaluluSyllables} from './kalulu-bank.js';
// Whole recordings only: never glue separate phonemes into an artificial syllable.
const allowed=new Set(kaluluSyllables);
export function recordedSyllable(value){
 if(typeof value!=='string')return null;
 const parts=value.trim().toLocaleLowerCase('fr-CA').split(/\s*\+\s*/);
 if(parts.length>4||parts.some(p=>!/^\p{L}+$/u.test(p)))return null;
 const syllable=parts.join('');
 return allowed.has(syllable)?syllable:null;
}
export function recordedPieces(value){
 if(typeof value!=='string')return [];
 const parts=value.trim().toLocaleLowerCase('fr-CA').split(/\s*\+\s*/);
 return parts.length>1&&parts.length<=4?parts.map(p=>allowed.has(p)?p:null):[];
}
export const syllableForExercise=q=>q?.skill==='syllabes'?recordedSyllable(q.text):null;
export const syllableForChoice=(q,choice)=>q?.skill==='syllabes'?recordedSyllable(choice):null;
