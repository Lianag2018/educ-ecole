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
        ['p1', 'p2'].includes(s.active)) { s.profiles.forEach((p,i)=>{p.schoolContext??={stage:i===0?'1re année':'3e année',focus:''};}); return s; }
  } catch { /* Private mode or unavailable storage: keep the app usable. */ }
  return fresh();
}

export function save(storage, state) {
  try {
    storage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch { return false; }
}

export function pool(p) { return [...bank, ...p.assignments]; }

// These are content tiers, not school grades or a reading diagnosis.
export function level(p, skill) {
  const recent = p.history.filter(x => x.skill === skill).slice(-4);
  if (recent.length === 4 && recent.every(x => x.result === 'correct')) return 3;
  return recent.length >= 2 &&
    recent.filter(x => x.result === 'correct').length >= Math.ceil(recent.length * .75)
    ? 2 : 1;
}

export function select(p, day) {
  const all = pool(p);
  if (!p.calibrated) {
    return Object.keys(skills).map(skill =>
      all.find(q => q.skill === skill && q.level === 1));
  }
  const due = all.filter(q => p.records[q.id]?.due <= day).sort((a, b) =>
    p.records[a.id].due.localeCompare(p.records[b.id].due) || a.id.localeCompare(b.id));
  // Reserve room for an unseen school word and coverage of other domains.
  const picked = due.slice(0, 3);
  const assigned = p.assignments.find(q => !p.records[q.id] && !picked.includes(q));
  if (assigned) picked.push(assigned);
  for (const skill of Object.keys(skills)) {
    const candidates = all.filter(q => q.skill === skill &&
      !picked.includes(q) && (!p.records[q.id] || p.records[q.id].due <= day) &&
      q.level <= level(p, skill)).sort((a, b) =>
      Number(!!p.records[a.id]) - Number(!!p.records[b.id]) ||
      (p.records[a.id]?.due || '').localeCompare(p.records[b.id]?.due || '') ||
      b.level - a.level || a.id.localeCompare(b.id));
    if (candidates[0] && picked.length < 8) picked.push(candidates[0]);
  }
  return picked;
}

export function nextDate(day, days) {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function answer(p, q, result, day) {
  if (!['correct', 'incorrect', 'help'].includes(result)) throw Error('Résultat invalide');
  const old = p.records[q.id] || { streak: 0, attempts: 0 };
  const streak = result === 'correct' ? old.streak + 1 : 0;
  const days = result === 'correct' ? [1, 3, 7, 14][Math.min(streak - 1, 3)] : 0;
  p.records[q.id] = { streak, attempts: old.attempts + 1, result, due: nextDate(day, days) };
  p.history.push({ id: q.id, skill: q.skill, result, day });
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
