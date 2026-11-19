// « Mon carnet de trucs » : chaque histoire ou mystère terminé donne un truc secret à garder. Les trucs pas encore découverts restent cachés (🔒).
import {journeySteps,journeyState} from './journey.js';
import {storyFor} from './sound-stories.js';
import {ruleFor} from './spelling-lab.js';
import {gestureFor} from './sound-lessons.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const TRICKS_PER_PAGE=4;
export function trickEntries(p,older){
 const done=journeyState(p).done,out=[];
 for(const st of journeySteps(p,older)){
  if(st.kind==='story'){const s=storyFor(st.target);if(!s)continue;const [icon,text]=gestureFor(st.target);out.push({key:st.id,icon,title:`Le truc du son «\u00a0${s.label||s.sound}\u00a0»`,text,found:Boolean(done[st.id])});}
  else if(st.kind==='lab'){const r=ruleFor(st.target);if(!r)continue;r.tricks.forEach((t,i)=>out.push({key:`${st.id}:${i}`,icon:t[0],title:t[1],text:t[2],found:Boolean(done[st.id])}));}
 }
 return out;
}
export const trickPages=(entries)=>Math.max(1,Math.ceil(entries.length/TRICKS_PER_PAGE));
export const firstPageToShow=entries=>{const i=entries.findIndex(e=>!e.found);return Math.floor((i<0?0:i)/TRICKS_PER_PAGE);};
export function trickBookMarkup(p,page=0,older){
 const entries=trickEntries(p,older),pages=trickPages(entries),at=Math.max(0,Math.min(page,pages-1)),found=entries.filter(e=>e.found).length;
 const cards=entries.slice(at*TRICKS_PER_PAGE,(at+1)*TRICKS_PER_PAGE).map(e=>e.found
  ?`<button type="button" class="tb-card" data-trick-read="${esc(e.title+'. '+e.text)}"><span class="tb-ic" aria-hidden="true">${esc(e.icon)}</span><b>${esc(e.title)}</b><small>${esc(e.text)}</small></button>`
  :`<div class="tb-card tb-lock" aria-label="Truc à découvrir"><span class="tb-ic" aria-hidden="true">🔒</span><b>Truc secret</b><small>Termine l’aventure pour le découvrir.</small></div>`).join('');
 return `<section class="trick-book" aria-label="Mon carnet de trucs"><div class="tb-top"><button data-action="french">‹ Mon français</button><span>🎁 ${found} / ${entries.length} trucs</span></div><p class="tb-intro">Chaque aventure te donne un truc secret pour mieux lire et écrire. Touche un truc pour l’entendre!</p><div class="tb-grid">${cards}</div><div class="tb-nav"><button data-trick-prev aria-label="Page précédente" ${at<=0?'disabled':''}>◀</button><span>${at+1} / ${pages}</span><button data-trick-next aria-label="Page suivante" ${at>=pages-1?'disabled':''}>▶</button></div></section>`;
}
