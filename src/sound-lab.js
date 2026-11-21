// Laboratoire des sons (espace adulte) : écouter chaque son, choisir sa durée d'étirement, ou le remplacer par sa propre voix.
import {soundStories} from './sound-stories.js';
import {isStretchable,defaultStretchMs,MIN_STRETCH_MS,MAX_STRETCH_MS} from './sound-stretch.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const STEP_MS=200;
export const labSounds=()=>soundStories.map(s=>({id:s.sound,label:s.label||s.sound,title:s.title}));
export const nextMs=(current,delta)=>Math.min(MAX_STRETCH_MS,Math.max(MIN_STRETCH_MS,Math.round((current+delta)/STEP_MS)*STEP_MS));
export function soundLabParent(){
 return `<section class="panel" data-parent-group="sounds"><h2>🎛️ Laboratoire des sons</h2><p>Écoute chaque son, allonge-le ou remplace-le par ta propre voix. Les changements restent sur cet appareil.</p><button class="primary" data-action="sound-lab">Ouvrir le laboratoire</button></section>`;
}
export function soundLabMarkup({recorded=new Set(),ms={},recordingId='',message='',take=''}={}){
 const rows=labSounds().map(s=>{
  const stretch=isStretchable(s.id),cur=ms[s.id]??defaultStretchMs(s.id),mine=recorded.has(s.id),rec=recordingId===s.id;
  return `<li class="sl-row" data-lab-row="${esc(s.id)}"><b class="sl-snd">${esc(s.label)}</b><button type="button" data-lab-play="${esc(s.id)}" aria-label="Écouter ${esc(s.label)}">▶</button>`
  +(stretch&&!mine?`<span class="sl-ms"><button type="button" data-lab-ms="${esc(s.id)}" data-delta="-${STEP_MS}" aria-label="Plus court">−</button><span>${(cur/1000).toFixed(1).replace('.',',')} s</span><button type="button" data-lab-ms="${esc(s.id)}" data-delta="${STEP_MS}" aria-label="Plus long">+</button></span>`:`<span class="sl-ms">${mine?'<em>ma voix</em>':'<em>court</em>'}</span>`)
  +(mine?`<button type="button" data-lab-reset="${esc(s.id)}" aria-label="Rétablir le son d’origine">↩</button>`:'<span></span>')
  +`<button type="button" class="${rec?'rec':''}" data-lab-rec="${esc(s.id)}" aria-label="${rec?'Arrêter':'Enregistrer ma voix'}">${rec?'⏹':'🎙️'}</button>`
  +(take===s.id?`<div class="sl-take"><button type="button" data-lab-take-play>▶ Écouter ma prise</button><button type="button" class="keep" data-lab-take-keep>✓ Garder</button><button type="button" data-lab-take-drop aria-label="Jeter cette prise">✕</button></div>`:'')+`</li>`;
 }).join('');
 return `<section class="sound-lab-page" aria-label="Laboratoire des sons"><div class="tb-top"><button data-action="parent">‹ Espace adulte</button><span>🎛️ Les sons</span></div><p class="tb-intro">▶ écouter · − + durée · 🎙️ à droite : enregistre ta voix (4 secondes max, touche encore pour arrêter), puis écoute ta prise et touche ✓ Garder pour l’enregistrer pour de bon · ↩ remettre le son d’origine.</p><div class="sl-transfer"><button type="button" data-lab-export>📤 Envoyer mes sons à une autre tablette</button><label class="sl-import">📥 Recevoir des sons<input type="file" accept=".json,application/json" data-lab-import></label></div><p class="sl-msg" role="status" aria-live="polite" data-lab-msg>${esc(message)}</p>${recordingId?'<div class="sl-level" aria-hidden="true"><i data-lab-level></i></div>':''}<ul class="sl-list">${rows}</ul></section>`;
}
