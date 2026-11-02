import {readingCues} from './guided-reading.js';
// A reviewed cue refers to the unchanged audio file and exact displayed text.
// Never derive syllable boundaries from character count or elapsed percentage.
const verified=new WeakMap();
export function validReadingAlignment(entry,text){
 if(!entry||entry.text!==text||!(entry.reviewed===true||(entry.source==='mfa-french-3.4.3'&&entry.validated===true&&/^[a-f0-9]{64}$/.test(entry.audioSha256)))||!Array.isArray(entry.syllables)||!entry.syllables.length)return false;
 if(verified.get(entry)===text)return true;
 const tokens=readingCues(text).tokens;
 let previousEnd = 0;
 for (const cue of entry.syllables) {
  if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start ||
      !Number.isInteger(cue.charIndex) || !Number.isInteger(cue.charEnd) || cue.charIndex < 0 || cue.charEnd > text.length || cue.charEnd <= cue.charIndex ||
      !Number.isInteger(cue.partIndex) || cue.partIndex < 0) return false;
  const token=tokens.find(t=>t.start===cue.charIndex&&t.end===cue.charEnd);
  if(!token||cue.partIndex>=token.parts.length|| (cue.liaison===true&&!token.link))return false;
  previousEnd = cue.end;
 }
 verified.set(entry,text);return true;
}
export function verifiedReadingPosition(entry,text,time){
 if(!Number.isFinite(time)||!validReadingAlignment(entry,text))return null;
 const cue = entry.syllables.find(c => time >= c.start && time < c.end);
 return cue ? {charIndex:cue.charIndex,charEnd:cue.charEnd,partIndex:cue.partIndex,liaison:cue.liaison===true,timing:'syllable',approximate:false} : {charIndex:-1,partIndex:-1,timing:'syllable',approximate:false};
}
