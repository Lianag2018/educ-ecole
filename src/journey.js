import {soundStories,storyFor} from './sound-stories.js';
import {spellingRules,ruleFor} from './spelling-lab.js';
// « Mon parcours » : un seul bouton par fille. Il ouvre toujours la prochaine étape non terminée, sans rien à choisir.
// Mely-Ann (1re année) : les 36 sons, du plus avancé au plus simple. Liana (3e année) : les mystères d'orthographe mêlés aux histoires des sons.
// Une étape est terminée quand l'enfant arrive à la fin de l'histoire (ou à la page « À toi » du mystère). Rien n'est noté ni diagnostiqué.
const ORDER=['ou','on','ch','in','an','eacute','egrave','a','i','o','u','f','v','m','l','s','p','b','t','d','k','g','n','z','j','r','eu','oe','e','a-back','oopen','un','gn','y','w','ui'];
const OLDER_START=['lab:e-ouvert','story:egrave','lab:c','story:k','story:s','lab:g','story:g','story:j','lab:o','story:o','story:oopen','lab:s','story:z','story:ui'];
const step=id=>{const [kind,target]=id.split(':');return {id,kind,target};};
// Une dictée magique (5 mots) s'ajoute après chaque groupe d'étapes : 6 pour Mely-Ann, 4 pour Liana.
const withDictations=(ids,every)=>{const out=[];let n=0;ids.forEach((id,i)=>{out.push(id);if((i+1)%every===0)out.push('dict:'+n++);});return out;};
export function journeySteps(p,older){
 const isOlder=older??(p.schoolContext?.stage==='3e année'||p.id==='p2');
 const stories=ORDER.filter(id=>storyFor(id)).map(id=>'story:'+id);
 if(!isOlder)return withDictations(stories,6).map(step);
 const ids=[...OLDER_START.filter(id=>id.startsWith('lab:')?ruleFor(id.slice(4)):storyFor(id.slice(6)))];
 for(const id of stories)if(!ids.includes(id))ids.push(id);
 for(const r of spellingRules)if(!ids.includes('lab:'+r.id))ids.push('lab:'+r.id);
 return withDictations(ids,4).map(step);
}
export const journeyState=p=>p.journey??={done:{},laps:0};
export function markJourney(p,id,day){const s=journeyState(p);if(s.done[id])return false;s.done[id]=day||true;return true;}
export function journeyProgress(p,older){const steps=journeySteps(p,older),s=journeyState(p);return {done:steps.filter(x=>s.done[x.id]).length,total:steps.length,laps:s.laps||0};}
// Prochaine étape; quand tout est fait, on recommence un nouveau tour sans rien effacer d'autre.
export function journeyNext(p,older){
 const steps=journeySteps(p,older),s=journeyState(p);
 let next=steps.find(x=>!s.done[x.id]);
 if(!next&&steps.length){s.done={};s.laps=(s.laps||0)+1;next=steps[0];}
 return next||null;
}
export function stepLabel(st){
 if(!st)return '';
 if(st.kind==='story'){const s=storyFor(st.target);return s?`L’histoire du son « ${s.label||s.sound} »`:'Une histoire';}
 if(st.kind==='dict')return 'Écrire mes mots avec la dictée magique';
 const r=ruleFor(st.target);return r?`Mystère : ${r.title}`:'Un mystère';
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function journeyDoorMarkup(p,older){
 const steps=journeySteps(p,older),s=journeyState(p),next=steps.find(x=>!s.done[x.id])||steps[0];
 if(!next)return '';
 const done=steps.filter(x=>s.done[x.id]).length;
 return `<button class="journey-door" data-action="journey"><span class="jd-icon" aria-hidden="true">🧭</span><span class="jd-copy"><b>Mon parcours</b><small>Étape ${Math.min(done+1,steps.length)} sur ${steps.length} · ${esc(stepLabel(next))}</small></span><span class="jd-go" aria-hidden="true">▶</span></button>`;
}
