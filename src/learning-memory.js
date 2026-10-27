import {isPracticeEvent, isReadingEvent, normalizeReadingSubject, dailyEvidence, learningReport} from './progress.js';
import {skills} from './content.js';

export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fields=['syncId','id','skill','result','day','subject','activityLevel','submittedResult'];
export function observation(e) {
  if (!isPracticeEvent(e)||!UUID.test(e.syncId)||e.id.length>200||e.skill.length>100||
      (e.subject!==undefined&&(typeof e.subject!=='string'||e.subject.length>100))||!Number.isInteger(e.activityLevel)||e.activityLevel<1||e.activityLevel>10||
      (e.submittedResult!==undefined&&!['correct','help','incorrect'].includes(e.submittedResult))) throw Error('invalid_observation');
  return Object.fromEntries(fields.filter(k=>e[k]!==undefined).map(k=>[k,e[k]]));
}
// Stable IDs are persisted before sending. No names, codes, audio or free text.
export function prepareObservations(p, uuid=()=>crypto.randomUUID()) {
  return p.history.filter(isPracticeEvent).map(e=>{
    e.syncId??=uuid(); e.activityLevel??=1;
    return observation(e);
  });
}
export function mergeObservations(p, remote) {
  const before=new Map();for(const e of p.history.filter(isPracticeEvent))before.set(e.id,(before.get(e.id)||0)+1);
  const ids=new Set(p.history.map(e=>e.syncId).filter(Boolean));
  for(const raw of remote){const e=observation(raw);if(!ids.has(e.syncId)){p.history.push(e);ids.add(e.syncId);}}
  p.history.sort((a,b)=>String(a.day).localeCompare(String(b.day))||String(a.syncId||'').localeCompare(String(b.syncId||'')));
  // Rebuild reviews for remote cards, preserving other record fields. Aided or
  // unsuccessful observations from either device must never become mastery.
  const cards=new Map();
  for(const e of p.history.filter(isPracticeEvent)){if(!cards.has(e.id))cards.set(e.id,[]);cards.get(e.id).push(e);}
  for(const [id,events] of cards){
    const last=dailyEvidence(events).at(-1);
    const days=dailyEvidence(events.filter(e=>e.skill===last.skill&&(isReadingEvent(last)?isReadingEvent(e):normalizeReadingSubject(e.subject)===normalizeReadingSubject(last.subject))));let streak=0;
    for(let i=days.length-1;i>=0&&days[i].result==='correct';i--)streak++;
    const d=new Date(last.day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+(last.result==='correct'?[1,3,7,14][Math.min(streak-1,3)]:0));
    const oldAttempts=Number.isSafeInteger(p.records[id]?.attempts)?p.records[id].attempts:0;
    const attempts=Math.max(oldAttempts,before.get(id)||0)+events.length-(before.get(id)||0);
    Object.defineProperty(p.records,id,{value:{...p.records[id],streak,result:last.result,due:d.toISOString().slice(0,10),attempts},writable:true,enumerable:true,configurable:true});
  }
}
// Only bounded aggregate counts enter the model. IDs may contain school words.
export function learningSummary(history,day) {
  const report=learningReport({history},day);
  return {asOf:day,current:report.current,previous:report.previous,domains:report.domains.filter(d=>Object.hasOwn(skills,d.skill)).slice(0,12).map(d=>({skill:d.skill,independent:d.independent,help:d.help,retry:d.retry,days:d.days,cards:d.cards}))};
}
export const strategies=['short_practice','worked_example','spaced_review'];
export function validateAdvice(a){
  if(!a||Object.keys(a).sort().join(',')!=='priorities,strategy'||!Array.isArray(a.priorities)||a.priorities.length>3||a.priorities.some(s=>!Object.hasOwn(skills,s))||new Set(a.priorities).size!==a.priorities.length||!strategies.includes(a.strategy))throw Error('invalid_advice');
  return {priorities:a.priorities,strategy:a.strategy};
}
export const strategyLabels={short_practice:'Proposer une courte pratique.',worked_example:'Faire un exemple ensemble, puis laisser essayer.',spaced_review:'Revoir les notions sur plusieurs jours.'};
