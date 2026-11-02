import {readingCues} from './guided-reading.js';
// A reviewed cue refers to the unchanged audio file and exact displayed text.
// Never derive syllable boundaries from character count or elapsed percentage.
export function verifiedReadingPosition(entry, text, time) {
 if (!entry || entry.text !== text || entry.reviewed !== true || !Array.isArray(entry.syllables) || !Number.isFinite(time)) return null;
 const tokens=readingCues(text).tokens;
 let previousEnd = 0;
 for (const cue of entry.syllables) {
  if (!Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start ||
      !Number.isInteger(cue.charIndex) || !Number.isInteger(cue.charEnd) || cue.charIndex < 0 || cue.charEnd > text.length || cue.charEnd <= cue.charIndex ||
      !Number.isInteger(cue.partIndex) || cue.partIndex < 0) return null;
  const token=tokens.find(t=>t.start===cue.charIndex&&t.end===cue.charEnd);
  if(!token||cue.partIndex>=token.parts.length|| (cue.liaison===true&&!token.link))return null;
  previousEnd = cue.end;
 }
 const cue = entry.syllables.find(c => time >= c.start && time < c.end);
 return cue ? {charIndex:cue.charIndex,charEnd:cue.charEnd,partIndex:cue.partIndex,liaison:cue.liaison===true,approximate:false} : {charIndex:-1,partIndex:-1,approximate:false};
}
