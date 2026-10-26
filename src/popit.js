import {scheduleSuccess} from './success-step.js';
import {openAdvancedPopit,advancedProblem,initialPopit,togglePopit} from './popit-advanced.js';
import {advanced} from './learning.js';
export const popOperations=p=>advanced(p)?['+','−','×','÷']:['+','−'];
export function popProblem(p,op,round=0){
 if(!popOperations(p).includes(op))throw Error('Opération non proposée à ce niveau');
 if(advanced(p))return advancedProblem(op,round);
 const a=2+(round%5),b=1+((round*2)%4);
 if(op==='+')return {a,b,op,total:a+b,target:a+b,initial:a,columns:5,instruction:`${a} bulles sont déjà enfoncées. Ajoute ${b} bulle${b>1?'s':''}.`};
 if(op==='−')return {a:a+b,b,op,total:a+b,target:a,initial:a+b,columns:5,instruction:`${a+b} bulles sont déjà enfoncées. Relève ${b} bulle${b>1?'s':''}. Compte celles qui restent enfoncées.`};
 if(op==='×')return {a,b,op,total:a*b,target:a*b,initial:0,columns:b,instruction:`Enfonce ${a} rangées de ${b} bulle${b>1?'s':''}. Compte toutes les bulles.`};
 return {a:a*b,b,op,total:a*b,target:a,initial:0,columns:b,instruction:`Fais des groupes de ${b} bulle${b>1?'s':''}. Combien de groupes as-tu?`};
}
export function popChoices(n){return [...new Set([Math.max(0,n-1),n,n+1])];}
export function openPopit(p,{save=()=>{},speak=()=>{},stop=()=>{}}={}){
 if(advanced(p))return openAdvancedPopit(p,{save,speak,stop});
 const previous=document.activeElement,dialog=document.createElement('dialog');dialog.className='popit-dialog';document.body.append(dialog);
 let op='+',round=0,pressed=initialPopit(popProblem(p,'+')),done=false,assisted=false,notice='';
 let cancelSuccess=()=>{};
 const close=()=>{cancelSuccess();stop();dialog.close();dialog.remove();previous?.focus();};
 const q=()=>popProblem(p,op,round);
 const reset=()=>{cancelSuccess();pressed=initialPopit(q());done=false;assisted=false;notice='';draw();};
 function draw(){const item=q();dialog.innerHTML=`<div class="popit-top"><h2>Mon Pop-it de calcul</h2><button data-close aria-label="Fermer le Pop-it">Fermer ✕</button></div><p>Appuie pour enfoncer. Appuie encore pour relever.</p><div class="popit-ops">${popOperations(p).map(x=>`<button data-op="${x}" aria-pressed="${x===op}">${x}</button>`).join('')}</div><h3>${item.a} ${op} ${item.b} = ?</h3><button data-listen>🔊 Écouter la consigne</button><p>${item.instruction}</p><div class="popit-board popit-cols-${item.columns}">${Array.from({length:item.total},(_,i)=>`<button class="pop-bubble" data-bubble="${i}" aria-label="Bulle ${i+1}, rangée ${Math.floor(i/item.columns)+1}" aria-pressed="${pressed.has(i)}" ${done||(op==='+'&&i<item.a)||(op==='−'&&i>=item.a)?'disabled':''}></button>`).join('')}</div><p data-count aria-live="polite">${pressed.size} bulle(s) enfoncée(s)</p><p>${op==='÷'?'Combien de groupes?':'Quel est le résultat?'}</p><div class="popit-answers">${popChoices(item.target).map(n=>`<button data-answer="${n}" ${done?'disabled':''}>${n}</button>`).join('')}</div><p role="status" class="${done?'travel-bravo':''}">${notice}</p>${done?'<button class="primary" data-next>Un autre défi →</button>':''}<p>Petits défis sans chronomètre · ${round+1} / 5</p>`;
 dialog.querySelector('[data-close]').onclick=close;
 dialog.querySelector('[data-listen]').onclick=()=>speak(item.instruction);
 dialog.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{stop();op=b.dataset.op;round=0;reset();});
 dialog.querySelectorAll('[data-bubble]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.bubble);togglePopit(item,pressed,i);b.setAttribute('aria-pressed',String(pressed.has(i)));dialog.querySelector('[data-count]').textContent=`${pressed.size} bulle(s) enfoncée(s)`;});
 dialog.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(done)return;const correct=Number(b.dataset.answer)===item.target;if(!correct){assisted=true;p.popit??={results:{}};p.popit.results??={};p.popit.results[`${new Date().toLocaleDateString('en-CA',{timeZone:'America/Toronto'})}|${op}|${item.a}|${item.b}`]={assisted:true,complete:false};save();notice='Regarde les bulles. Tu peux essayer encore.';dialog.querySelector('[role=status]').textContent=notice;return;}done=true;notice=assisted?'Tu as trouvé avec un nouvel essai. Bravo pour ton effort!':'Bravo! Tu as trouvé!';p.popit??={results:{}};p.popit.results??={};const key=`${new Date().toLocaleDateString('en-CA',{timeZone:'America/Toronto'})}|${op}|${item.a}|${item.b}`;const old=p.popit.results[key];p.popit.results[key]={assisted:assisted||!!old?.assisted,complete:true};save();draw();dialog.querySelector('[data-next]').focus();speak('Bravo! Tu as bien travaillé.');cancelSuccess=scheduleSuccess(()=>dialog.querySelector('[data-next]')?.click());});
 dialog.querySelector('[data-next]')?.addEventListener('click',()=>{cancelSuccess();if(round===4){dialog.innerHTML='<h2>Bravo pour tes cinq défis!</h2><p>Une petite pause? Tes essais sont conservés.</p><button data-close>Revenir à mon voyage</button>';dialog.querySelector('button').onclick=close;dialog.querySelector('button').focus();return;}round++;reset();dialog.querySelector('[data-listen]').focus();});
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});draw();dialog.showModal();dialog.querySelector('[data-close]').focus();return {destroy:close};
}
