import {numberWords,numberParts} from './numbers.js';
import {mathSpeech} from './math-speech.js';
import {PEDAGOFA_NUMBER_CLIPS} from './number-audio-data.js';

const HASH_FILE=/^[a-f0-9]{64}\.mp3$/;
const OPERATORS=/ (est plus petit que|est plus grand que|divisé par|plus|moins|fois|égale) /u;
const WRITTEN_NUMBERS=new Map();
for(let n=0;n<=1999;n++){
 const words=numberWords(n);
 WRITTEN_NUMBERS.set(words,n);
 // Both traditional and rectified spelling describe the same complete number.
 WRITTEN_NUMBERS.set(words.replaceAll(' ','-'),n);
}

function normalize(text){
 return text.normalize('NFC').trim().toLocaleLowerCase('fr-CA')
  .replace(/[\u2010\u2011]/gu,'-').replace(/\s+/gu,' ');
}

function recognizedNumber(text){
 if(/^\d{1,4}$/u.test(text)){
  const number=Number(text);
  return number<=1999?number:null;
 }
 return WRITTEN_NUMBERS.get(text)??null;
}

function recognizeItem(raw){
 const number=recognizedNumber(raw);
 if(number!==null)return {text:numberWords(number),parts:[{number}]};
 // Reuse the application's deliberately narrow calculation grammar. Nothing is
 // extracted from prose; every operand must itself be a whole recognized number.
 const spoken=normalize(mathSpeech(raw));
 const pieces=spoken.split(OPERATORS);
 if(pieces.length!==3&&pieces.length!==5)return null;
 if(pieces.length===5&&pieces[3]!=='égale')return null;
 const parts=[],words=[];
 for(let i=0;i<pieces.length;i++){
  if(i%2){parts.push({operator:pieces[i]});words.push(pieces[i]);}
  else{
   const value=recognizedNumber(pieces[i]);
   if(value===null)return null;
   parts.push({number:value});words.push(numberWords(value));
  }
 }
 return {text:words.join(' '),parts};
}

function recognize(text){
 if(typeof text!=='string'&&typeof text!=='number')return null;
 const normalized=normalize(String(text));
 if(!normalized)return null;
 const items=normalized.split('. ').map(recognizeItem);
 if(items.some(item=>!item))return null;
 return {text:items.map(item=>item.text).join('. '),items};
}

function narrated(text,clips){
 if(!clips||!Object.prototype.hasOwnProperty.call(clips,text))return null;
 const file=clips[text];
 return typeof file==='string'&&HASH_FILE.test(file)
  ?{text,src:'/audio/'+file,source:'narration'}:null;
}

function original(number){
 const clip=PEDAGOFA_NUMBER_CLIPS[number];
 return clip?{text:numberWords(number),src:clip.src,source:'pedagofa'}:null;
}

function concatenate(first,last){
 return first&&last?[...first,...last]:null;
}

// Cents and quatre-vingts lose their written s before another number. Their
// isolated recordings have no spoken final s, so only the segment label changes.
function beforeRemainder(segments){
 return segments.map(segment=>({...segment,text:segment.text.replace(/cents$/u,'cent').replace(/quatre-vingts$/u,'quatre-vingt')}));
}

function originalNumber(number,clips){
 const complete=original(number);
 if(complete)return [complete];
 if(number>=1000){
  return concatenate([original(1000)],originalNumber(number-1000,clips));
 }
 if(number>=100){
  const hundreds=Math.floor(number/100),remainder=number%100;
  let prefix;
  if(hundreds<=3)prefix=[original(hundreds*100)];
  else if([4,7,9].includes(hundreds)){
   // Quatre, sept and neuf retain their final consonant before cent.
   prefix=[original(hundreds),{...original(100),text:'cents'}];
  }else{
   // Never splice isolated cinq/six/huit before cent: use the complete block.
   const block=narrated(numberWords(hundreds*100),clips);
   if(!block)return null;
   prefix=[block];
  }
  return remainder?concatenate(beforeRemainder(prefix),originalNumber(remainder,clips)):prefix;
 }
 if(number<30||[31,41,51,61].includes(number)){
  // Vingt has a different final consonant in 21–29. The et constructions also
  // need their complete narrated block: an isolated et recording is not assumed.
  const block=narrated(numberWords(number),clips);
  return block?[block]:null;
 }
 const base=number<70?Math.floor(number/10)*10:number<80?60:80;
 // 93–99 use quatre-vingts + treize…dix-neuf, never quatre-vingt-dix + unit.
 return concatenate(beforeRemainder([original(base)]),originalNumber(number-base,clips));
}

function narratedNumber(number,clips){
 const complete=narrated(numberWords(number),clips);
 if(complete)return [complete];
 const names=numberParts(number),segments=[];
 for(let i=0;i<names.length;i++){
  const segment=narrated(names[i],clips);
  if(!segment)return null;
  segments.push(i<names.length-1?beforeRemainder([segment])[0]:segment);
 }
 return segments;
}

/**
 * Plan numbers 0–1999, number lists separated by ". ", and simple calculations.
 * Return null for unrecognized text or a missing/invalid required narration.
 * No fetch, playback, speech generation, or mutation of the supplied clip bank.
 * Remote original failures are handled by the caller by replanning once with
 * preferOriginal:false. The returned text always uses canonical numberWords.
 */
export function planNumberAudio(text,clips={}, {preferOriginal=true}={}){
 const recognized=recognize(text);
 if(!recognized)return null;
 if(!preferOriginal){
  const complete=narrated(recognized.text,clips);
  if(complete)return {text:recognized.text,segments:[complete],usesOriginals:false};
 }
 const segments=[];
 for(const item of recognized.items){
  // Existing complete calculation recordings are also valid local fallbacks.
  const complete=!preferOriginal&&narrated(item.text,clips);
  if(complete){segments.push(complete);continue;}
  for(const part of item.parts){
   let next;
   if(part.operator){
    const segment=narrated(part.operator,clips);
    next=segment?[segment]:null;
   }else next=preferOriginal?originalNumber(part.number,clips):narratedNumber(part.number,clips);
   if(!next)return null;
   segments.push(...next);
  }
 }
 return {text:recognized.text,segments,usesOriginals:segments.some(segment=>segment.source==='pedagofa')};
}
