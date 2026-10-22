import {syllableParts} from './reading-syllables.js';
// Pedagogical cues, not a phonetic assessment. Prerecorded timing is approximate.
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const links=new Map([['les amis','z'],['des ailes','z'],['ses ailes','z'],['ses amies','z'],['les étoiles','z'],['un arbre','n'],['un oisillon','n'],['un arrosoir','n'],['un petit ours','t']]);
const marks={';':['comma','Fais une pause.'],':':['comma','Fais une pause avant la suite.'],',':['comma','Petite pause'],'.':['stop','La phrase est finie. Fais une pause.'],'!':['expression','Mets de l’expression, sans crier !'],'?':['question','Fais entendre la question.'],'…':['stop','Prends ton temps…']};
export function readingCues(text){
 const tokens=Array.from(String(text).matchAll(/[\p{L}\p{N}]+(?:[’'−-][\p{L}\p{N}]+)*|[^\s]/gu),m=>({text:m[0],start:m.index,end:m.index+m[0].length,kind:marks[m[0]]?.[0]||'word',hint:marks[m[0]]?.[1]||'Suis la petite balle. Écoute chaque syllabe.'}));
 for(const [phrase,sound] of links){let at=-1;while((at=text.toLocaleLowerCase('fr-CA').indexOf(phrase,at+1))!==-1){
  if(/[\p{L}]/u.test(text[at-1]||'')||/[\p{L}]/u.test(text[at+phrase.length]||''))continue;
  const group=tokens.filter(t=>t.start>=at&&t.end<=at+phrase.length);
  group.forEach((t,i)=>{t.link=sound;t.bridge=i<group.length-1;t.hint=`Relie les mots avec le son « ${sound} ».`;});
 }}
 let total=0;for(const t of tokens){t.parts=t.kind==='word'?syllableParts(t.text):[t.text];t.from=total;total+=t.kind==='comma'?2:t.kind==='stop'?4:t.kind==='word'?Math.max(1,t.text.length*.55):3;t.to=total;}
 return {tokens,total};
}
export function cueAt(plan,progress){if(!plan.tokens.length)return -1;const n=Math.max(0,Math.min(1,progress))*plan.total;return Math.max(0,plan.tokens.findIndex(t=>n<t.to)===-1?plan.tokens.length-1:plan.tokens.findIndex(t=>n<t.to));}
export function guidedMarkup(text,older=false){const {tokens}=readingCues(text);let end=0;const html=tokens.map((t,i)=>{const space=escape(text.slice(end,t.start));end=t.end;return space+`<span data-cue="${i}" class="read-token cue-${t.kind}${t.bridge?' liaison-bridge':''}"${t.link?` title="Liaison : son ${t.link}"`:''}>${t.parts.map((part,j)=>`<span class="read-syllable" data-part="${j}">${escape(part)}</span>`).join('')}</span>`;}).join('');return `<div class="guided-reading" data-guided-text="${escape(text)}"><div class="reading guided-text">${html}</div><p class="reading-coach">🦉 Écoute, puis essaie à ton tour.</p><div class="reading-legend"><span>, petite pause</span><span>. pause</span><span>! expression</span>${older?'<span>? question</span>':''}<span>⌣ mots liés</span></div><p class="small">Petite balle sur les syllabes connues; les autres mots restent entiers. Temps des syllabes approximatifs entre les repères audio. Les ponts montrent certaines liaisons à pratiquer.</p></div>`;}
export function updateReadingCue(root,text,event){const box=root.querySelector('.guided-reading');if(!box||box.dataset.guidedText!==text)return;const plan=readingCues(text);const index=event.charIndex!==undefined?event.charIndex<0?-1:plan.tokens.findIndex(t=>t.end>event.charIndex):cueAt(plan,event.progress);const partIndex=syllableIndex(plan,index,event);box.querySelectorAll('[data-cue]').forEach((el,i)=>{el.classList.toggle('cue-active',i===index);el.classList.toggle('cue-read',i<index);el.querySelectorAll('[data-part]').forEach((part,j)=>part.classList.toggle('ball-active',i===index&&j===partIndex));});const coach=box.querySelector('.reading-coach');const active=box.querySelector('.cue-active');if(active&&box.dataset.activeCue!==String(index)){box.dataset.activeCue=String(index);const rect=active.getBoundingClientRect?.();if(rect&&(rect.bottom>globalThis.innerHeight-100||rect.top<80))active.scrollIntoView?.({block:'center',behavior:'auto'});}if(coach)coach.textContent='🦉 '+(plan.tokens[index]?.hint||'Écoute, puis essaie à ton tour.');}

// Measured word anchors, interpolated syllables. Punctuation has its own stop.
export function syllableIndex(plan,index,event){
 const token=plan.tokens[index];if(!token)return -1;
 let fraction=event.wordProgress??0;
 if(event.charIndex===undefined&&Number.isFinite(event.progress))fraction=(event.progress*plan.total-token.from)/(token.to-token.from);
 return Math.min(token.parts.length-1,Math.floor(Math.max(0,Math.min(.999999,fraction))*token.parts.length));
}
