import {prioritySkills,isReadingEvent,isPracticeEvent,dailyEvidence,normalizeReadingSubject} from './progress.js';
import {readingBank} from './learning.js';
import { bank, skills } from './content.js';

export const KEY = 'atelier-mots-v1';
export const fresh = () => ({
  version: 1,
  active: 'p1',
  profiles: ['p1', 'p2'].map((id, i) => ({
    id, name: `Lectrice ${i + 1}`, schoolContext: {stage:i===0?'1re année':'3e année',focus:''}, records: {}, history: [],
    assignments: [], calibrated: false,
  })),
});

export function load(storage) {
  try {
    const s = JSON.parse(storage.getItem(KEY));
    if (s?.version === 1 && s.profiles?.length === 2 &&
        s.profiles.every((p, i) => p.id === `p${i + 1}` &&
          typeof p.name === 'string' && p.records &&
          Array.isArray(p.history) && Array.isArray(p.assignments)) &&
        ['p1', 'p2'].includes(s.active)) { s.profiles.forEach((p,i)=>{p.schoolContext??={stage:i===0?'1re année':'3e année',focus:''};reconcileReviews(p);}); return s; }
  } catch { /* Private mode or unavailable storage: keep the app usable. */ }
  return fresh();
}

export function save(storage, state) {
  try {
    storage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function pool(p) { return [...readingBank(p), ...p.assignments]; }

// Conservative product settings for this small activity bank, not validated
// clinical cutoffs, school grades or a diagnosis. Tier 2 allows a single card
// practiced on different days because some grade-3 domains have one tier-1 card.
export const PROGRESSION_RULES=Object.freeze({window:4,tier2Days:2,tier2Ratio:.75,tier3Days:3,tier3Cards:2,reviewDays:Object.freeze([1,3,7,14])});
export function level(p, skill, day) {
  const recent = dailyEvidence(p.history.filter(x => isPracticeEvent(x) && x.skill === skill && isReadingEvent(x) && (!day || x.day <= day))).slice(-PROGRESSION_RULES.window);
  const days = new Set(recent.map(x => x.day)).size;
  const cards = new Set(recent.map(x => x.id)).size;
  if (recent.length === PROGRESSION_RULES.window && days >= PROGRESSION_RULES.tier3Days && cards >= PROGRESSION_RULES.tier3Cards && recent.every(x => x.result === 'correct')) return 3;
  return days >= PROGRESSION_RULES.tier2Days &&
    recent.filter(x => x.result === 'correct').length >= Math.ceil(recent.length * PROGRESSION_RULES.tier2Ratio)
    ? 2 : 1;
}

const authoredOrder=(a,b)=>(Number.isFinite(a.order)?a.order:Number.MAX_SAFE_INTEGER)-(Number.isFinite(b.order)?b.order:Number.MAX_SAFE_INTEGER)||b.level-a.level||a.id.localeCompare(b.id);

export function select(p, day) {
  const all = pool(p);
  if (!p.calibrated) {
    return Object.keys(skills).map(skill =>
      all.filter(q => q.skill === skill && q.level === 1).sort(authoredOrder)[0]);
  }
  const due = all.filter(q => p.records[q.id]?.due <= day).sort((a, b) =>
    p.records[a.id].due.localeCompare(p.records[b.id].due) || a.id.localeCompare(b.id));
  // Reserve room for an unseen school word and coverage of other domains.
  const picked = due.slice(0, 3);
  const assigned = p.assignments.find(q => !p.records[q.id] && !picked.includes(q));
  if (assigned) picked.push(assigned);
  for (const skill of prioritySkills(p, day)) {
    const tier=level(p,skill,day);
    const candidates = all.filter(q => q.skill === skill &&
      !picked.includes(q) && (!p.records[q.id] || p.records[q.id].due <= day) &&
      q.level <= tier).sort((a, b) =>
      Number(!!p.records[a.id]) - Number(!!p.records[b.id]) ||
      (p.records[a.id]?.due || '').localeCompare(p.records[b.id]?.due || '') ||
      authoredOrder(a,b));
    if (candidates[0] && picked.length < 8) picked.push(candidates[0]);
  }
  return picked;
}

export function nextDate(day, days) {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const samePractice=(a,b)=>a.skill===b.skill&&(isReadingEvent(a)?isReadingEvent(b):normalizeReadingSubject(a.subject)===normalizeReadingSubject(b.subject));
function reviewFrom(evidence){
  const latest=evidence.at(-1);
  let streak=0;
  for(let i=evidence.length-1;i>=0&&evidence[i].result==='correct';i--)streak++;
  const days=latest.result==='correct'?PROGRESSION_RULES.reviewDays[Math.min(streak-1,PROGRESSION_RULES.reviewDays.length-1)]:0;
  return {streak,result:latest.result,due:nextDate(latest.day,days)};
}

// Repair only derived review fields from old repeated-click records. Do not
// rewrite history, attempt counts, assignments, profile data or unrelated keys.
function reconcileReviews(p){
  const cards=new Map();
  for(const e of p.history){
    if(!isPracticeEvent(e)||!Object.hasOwn(p.records,e.id))continue;
    if(!cards.has(e.id))cards.set(e.id,[]);
    cards.get(e.id).push(e);
  }
  for(const [id,events] of cards){
    const latest=dailyEvidence(events).at(-1);
    const evidence=dailyEvidence(events.filter(e=>samePractice(latest,e)));
    p.records[id]={...p.records[id],...reviewFrom(evidence)};
  }
}

export function answer(p, q, result, day, subject = 'Français') {
  if (!['correct', 'incorrect', 'help'].includes(result)) throw Error('Résultat invalide');
  const old = p.records[q.id] || { streak: 0, attempts: 0 };
  const event = { id: q.id, skill: q.skill, result, day, subject:normalizeReadingSubject(subject), activityLevel: q.level || 1 };
  const evidence=dailyEvidence([...p.history.filter(x=>isPracticeEvent(x)&&x.id===q.id&&x.day<=day&&samePractice(event,x)),event]);
  const effective=evidence.at(-1).result;
  p.records[q.id] = {...old,...reviewFrom(evidence),attempts:old.attempts+1};
  p.history.push({...event,result:effective,...(effective!==result?{submittedResult:result}:{})});
  return effective;
}

// Literal token extraction only: no invented phonetics, syllable breaks or answers.
export function generate(text) {
  const clean = text.normalize('NFC').trim().slice(0, 5000);
  const words = [...new Set((clean.match(/[\p{L}]+(?:[’'-][\p{L}]+)*/gu) || [])
    .filter(w => w.length > 1))].slice(0, 20);
  return words.map((word, i) => ({
    id: `school-${i}-${word.toLowerCase()}`, skill: 'mots', level: 1,
    prompt: 'Lis ce mot à voix haute, puis fais le point avec un adulte.',
    text: word, choices: [], answer: null,
    explanation: 'Relis le mot dans ton texte scolaire. Un adulte peut t’aider à vérifier la lecture.',
    source: clean,
  }));
}

export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
