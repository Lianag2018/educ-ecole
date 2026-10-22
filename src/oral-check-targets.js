import {bank} from './content.js';
import {numberWords} from './numbers.js';
import {olderReading} from './learning.js';

export const ADULT_CONFIRMATION_MS=15*60*1000;
export const ORAL_FEEDBACK=Object.freeze({
 recognized:'Bravo! J’ai reconnu ta réponse.',
 retry:'Écoutons le modèle, puis essaie encore. On prend notre temps.',
 uncertain:'Je n’ai pas bien entendu. Tu peux réessayer avec l’adulte.'
});

// Only authored whole-word assembly activities are eligible. Bare sounds,
// syllables, reading passages and private local assignments are not targets.
const advancedWordIds=new Set(['g3-sy1','g3-sy2']);
const wordActivities=[
 ...bank.filter(activity=>['sy1','sy3'].includes(activity.id)||activity.id.startsWith('first-word-')),
 ...olderReading.filter(activity=>advancedWordIds.has(activity.id))
];
const wordTargets=new Map();
for(const activity of wordActivities){
 const text=activity.text.split(' + ').join('');
 if(/^[\p{L}]{2,40}$/u.test(text)&&activity.choices?.[activity.answer]===text){
  wordTargets.set(activity.id,Object.freeze({kind:'word',activityId:activity.id,text}));
 }
}
export const ORAL_WORD_TEXTS=Object.freeze([...new Set([...wordTargets.values()].map(target=>target.text))]);

function record(value){return value!==null&&typeof value==='object'&&!Array.isArray(value);}
function exactKeys(value,keys){return Object.keys(value).length===keys.length&&Object.keys(value).every(key=>keys.includes(key));}

/** Resolve only server-owned content. Unknown school stages fail closed. */
export function resolveOralTarget(target,stage){
 if(!['1re année','3e année'].includes(stage)||!record(target))return null;
 if(target.kind==='number'){
  if(!exactKeys(target,['kind','value'])||!Number.isSafeInteger(target.value)||target.value<0||target.value>(stage==='1re année'?99:1999))return null;
  return {kind:'number',value:target.value,text:numberWords(target.value)};
 }
 if(target.kind==='word'){
  if(!exactKeys(target,['kind','activityId'])||typeof target.activityId!=='string')return null;
  if(advancedWordIds.has(target.activityId)&&stage!=='3e année')return null;
  const known=wordTargets.get(target.activityId);
  return known?{...known}:null;
 }
 return null;
}

/** Browser helper: a local item cannot borrow an authored id with changed text. */
export function oralTargetForActivity(activity){
 if(!record(activity))return null;
 const known=wordTargets.get(activity.id);
 const authored=wordActivities.find(item=>item.id===activity.id);
 return known&&activity.text===authored.text?{kind:'word',activityId:known.activityId}:null;
}
