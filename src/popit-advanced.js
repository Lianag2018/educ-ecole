import {scheduleSuccess} from './success-step.js';
// Grade-three practice: solve first, open the complete manipulative only if useful.
const sets={
 '+':[[7,5],[8,4],[6,5],[9,3],[8,3]],
 '−':[[12,5],[11,4],[12,8],[10,6],[11,7]],
 '×':[[6,4],[3,6],[5,4],[4,6],[6,6]],
 '÷':[[24,4],[30,5],[18,3],[36,6],[20,4]]
};
export function advancedProblem(op,round=0,extended=false){
 if(!sets[op])throw Error('Opération inconnue');
 let [a,b]=sets[op][((round%5)+5)%5];
 if(extended&&['×','÷'].includes(op)){const x=[7,8,9,11,12][((round%5)+5)%5],y=[6,7,8,9,12][((round%5)+5)%5];[a,b]=op==='×'?[x,y]:[x*y,y];}
 const target=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b;
 return {a,b,op,target,columns:b,total:op==='×'?a*b:op==='÷'?a:Math.max(a,target)};
}
export function rememberPopit(p,q,{help=false,complete=false,incorrect=false}={},day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto'}).format(new Date())){
 p.popit??={results:{}};p.popit.results??={};const key=`${day}|${q.op}|${q.a}|${q.b}`,old=p.popit.results[key]||{};
 return p.popit.results[key]={assisted:!!(old.assisted||help||incorrect),complete:!!(old.complete||complete)};
}
export function initialPopit(q){return new Set(['+','−'].includes(q.op)?Array.from({length:q.a},(_,i)=>i):[]);}
export function popitFeedback(q,pressed){
 if(q.op==='+')return `${q.a} au départ + ${pressed.size-q.a} ajoutée(s) = ${pressed.size}. Ajoute ${q.b} bulles.`;
 if(q.op==='−')return `${q.a} au départ − ${q.a-pressed.size} retirée(s) = ${pressed.size}. Retire ${q.b} bulles.`;
 if(!pressed.size)return q.op==='×'?`Croise la ligne ${q.a} et la colonne ${q.b}.`:`Cherche ${q.a} dans la colonne ${q.b}. Le numéro de ligne donne le résultat.`;
 const i=[...pressed][0],r=Math.floor(i/12)+1,c=i%12+1;
 return q.op==='×'?`${r} × ${c} = ${r*c}. ${r===q.a&&c===q.b?'Tu as trouvé le croisement!':'Cherche le croisement demandé.'}`:`${r*c} ÷ ${c} = ${r}. ${r*c===q.a?'Tu as trouvé le partage!':`Cherche le total ${q.a}.`}`;
}
export function togglePopit(q,pressed,i){
 if(!Number.isInteger(i)||i<0||i>=144)return;
 if(q.op==='+'){if(i<q.a||i>=12)return;pressed.has(i)?pressed.delete(i):pressed.add(i);}
 else if(q.op==='−'){if(i>=q.a)return;pressed.has(i)?pressed.delete(i):pressed.add(i);}
 else {if(q.op==='÷'&&i%12+1!==q.b)return;pressed.clear();pressed.add(i);}
}
// Free physical board: every bubble can be pressed and released independently.
export function togglePhysicalPopit(pressed,i){
 if(!Number.isInteger(i)||i<0||i>=144)return;
 pressed.has(i)?pressed.delete(i):pressed.add(i);
}
export function pressPopitAxis(pressed,axis,n){
 if(!['row','col'].includes(axis)||!Number.isInteger(n)||n<1||n>12)return;
 const cells=Array.from({length:12},(_,i)=>axis==='row'?(n-1)*12+i:i*12+n-1);
 const release=cells.every(i=>pressed.has(i));
 cells.forEach(i=>release?pressed.delete(i):pressed.add(i));
}
export function physicalFeedback(q,pressed,last=null){
 if(['+','−'].includes(q.op))return `${pressed.size} bulles enfoncées. Une bulle vaut 1. Compte, puis écris ta réponse.`;
 if(last===null)return 'Choisis une ligne et une colonne, puis appuie sur leur croisement.';
 const r=Math.floor(last/12)+1,c=last%12+1;
 return q.op==='×'?`${r} × ${c} = ${r*c}`:`${r*c} ÷ ${c} = ${r}`;
}
export function fullPopitMarkup(table=true,pressed=new Set(),q=null){
 const axis=(kind,n)=>`<button type="button" class="pop-axis pop-color-${(n-1)%6}" data-pop-axis="${kind}" data-axis-number="${n}" aria-label="${kind==='row'?'Ligne':'Colonne'} ${n}" aria-pressed="false">${n}</button>`;
 return `<div class="full-popit-scroll" tabindex="0" aria-label="Pop-it complet 12 par 12, faire défiler horizontalement sur téléphone"><div class="full-popit"><span class="pop-axis">${table?'×':'1'}</span>${Array.from({length:12},(_,i)=>axis('col',i+1)).join('')}${Array.from({length:12},(_,r)=>`${axis('row',r+1)}${Array.from({length:12},(_,c)=>{const i=r*12+c,value=table?(r+1)*(c+1):i+1;return `<button type="button" class="full-pop-bubble pop-color-${c%6}" data-full-bubble="${i}" aria-label="Ligne ${r+1}, colonne ${c+1}, ${value}${table?'':', une unité'}" aria-pressed="${pressed.has(i)}">${value}</button>`;}).join('')}`).join('')}</div></div>`;
}
export function openAdvancedPopit(p,{save=()=>{},speak=()=>{},stop=()=>{}}={}){
 const previous=document.activeElement,d=document.createElement('dialog');d.className='popit-dialog popit-advanced';d.setAttribute('aria-labelledby','popit-advanced-title');document.body.append(d);
 let op='+',round=0,extended=false,helpOpen=false,pressed=initialPopit(advancedProblem('+')),complete=false,draft='',notice='';
 const q=()=>advancedProblem(op,round,extended);
 let last=null,selectedRow=null,selectedCol=null;
 let cancelSuccess=()=>{};
 const close=()=>{cancelSuccess();stop();d.close();d.remove();previous?.focus();};
 function reset(){last=null;selectedRow=null;selectedCol=null;cancelSuccess();stop();helpOpen=false;pressed=initialPopit(q());complete=false;draft='';notice='';draw();}
 function draw(){const item=q(),table=['×','÷'].includes(op);d.classList.toggle('popit-expanded',helpOpen);
 d.innerHTML=`<div class="popit-top"><h2 id="popit-advanced-title">Mes défis de calcul</h2><button data-close aria-label="Fermer les défis">Fermer ✕</button></div><p>Calcule à ta façon. Le Pop-it est là si tu en as besoin.</p><div class="popit-ops">${['+','−','×','÷'].map(x=>`<button data-op="${x}" aria-pressed="${x===op}">${x}</button>`).join('')}</div>${table?`<label>Tables à pratiquer <select data-tables><option value="6" ${!extended?'selected':''}>De 1 à 6</option><option value="12" ${extended?'selected':''}>Défi · jusqu’à 12</option></select></label>`:''}<h3 class="popit-equation">${item.a} ${op} ${item.b} = ?</h3><button data-listen>🔊 Écouter le calcul</button><form data-answer-form><label for="popit-answer">Ma réponse</label><input id="popit-answer" inputmode="numeric" type="number" min="0" max="999" step="1" required autocomplete="off" value="${draft}" ${complete?'disabled':''}><button class="primary" ${complete?'disabled':''}>Vérifier</button></form><p role="status" class="${complete?'travel-bravo':''}">${notice}</p>${complete?'<button class="primary" data-next>Défi suivant →</button>':''}<button class="popit-helper" data-helper aria-expanded="${helpOpen}" aria-controls="popit-aid"><span class="mini-popit" aria-hidden="true">${'<i></i>'.repeat(9)}</span><span>${helpOpen?'Réduire le Pop-it':'Besoin d’aide? Ouvrir mon Pop-it'}</span></button>${helpOpen?`<section id="popit-aid"><h3>Mon Pop-it complet · 12 × 12</h3><p>${op==='+'?`${item.a} bulles sont déjà enfoncées. Enfonce ${item.b} autres bulles, puis compte le total.`:op==='−'?`${item.a} bulles sont enfoncées. Relève ${item.b} bulles, puis compte celles qui restent.`:op==='×'?`Chaque case montre le produit de sa ligne et de sa colonne. Trouve ${item.a} × ${item.b}.`:`La table reste une table de multiplication. Dans la colonne ${item.b}, trouve ${item.a}, puis lis le numéro de la ligne.`}</p><p>${table?'Touche les numéros de ligne et de colonne pour les repérer. Chaque bulle peut être enfoncée et relevée.':'Chaque bulle vaut 1; les chiffres indiquent sa position. Touche une bulle, ou un numéro de ligne ou de colonne pour enfoncer ou relever ses 12 bulles.'}</p>${fullPopitMarkup(table,pressed,item)}<p data-full-count aria-live="polite">${physicalFeedback(item,pressed,last)}</p><button data-clear>Recommencer la manipulation</button></section>`:''}<p>Défi ${round+1} / 5 · Pas de chronomètre</p>`;
 d.querySelector('[data-close]').onclick=close;
 d.querySelector('[data-listen]').onclick=()=>speak(`${item.a} ${op==='+'?'plus':op==='−'?'moins':op==='×'?'fois':'divisé par'} ${item.b}. Quel est le résultat?`);
 d.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{op=b.dataset.op;round=0;reset();});
 d.querySelector('[data-tables]')?.addEventListener('change',e=>{extended=e.target.value==='12';round=0;reset();});
 d.querySelector('#popit-answer').oninput=e=>{draft=/^\d{0,3}$/.test(e.target.value)?e.target.value:'';};
 d.querySelector('[data-helper]').onclick=()=>{helpOpen=!helpOpen;if(helpOpen&&!complete){rememberPopit(p,item,{help:true});save();}draw();d.querySelector('[data-helper]').focus();};
 const refreshAid=()=>{
  d.querySelectorAll('[data-full-bubble]').forEach(b=>{const i=+b.dataset.fullBubble,r=Math.floor(i/12)+1,c=i%12+1;b.setAttribute('aria-pressed',String(pressed.has(i)));b.classList.toggle('popit-guide',table&&(r===selectedRow||c===selectedCol));b.classList.toggle('popit-intersection',table&&r===selectedRow&&c===selectedCol);});
  d.querySelectorAll('[data-pop-axis]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.axisNumber===(b.dataset.popAxis==='row'?selectedRow:selectedCol))));
  d.querySelector('[data-full-count]').textContent=physicalFeedback(item,pressed,last);
 };
 d.querySelectorAll('[data-full-bubble]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fullBubble;togglePhysicalPopit(pressed,i);last=i;refreshAid();});
 d.querySelectorAll('[data-pop-axis]').forEach(b=>b.onclick=()=>{const n=+b.dataset.axisNumber,axis=b.dataset.popAxis;if(table){if(axis==='row')selectedRow=selectedRow===n?null:n;else selectedCol=selectedCol===n?null:n;}else pressPopitAxis(pressed,axis,n);refreshAid();});
 d.querySelector('[data-clear]')?.addEventListener('click',()=>{pressed=initialPopit(item);last=null;selectedRow=null;selectedCol=null;refreshAid();});
 if(helpOpen)refreshAid();
 d.querySelector('[data-answer-form]').onsubmit=e=>{e.preventDefault();if(complete||draft==='')return;const correct=Number(draft)===item.target,result=rememberPopit(p,item,{complete:correct,incorrect:!correct});save();complete=correct;notice=correct?(result.assisted?'Bravo! Tu as résolu le défi avec de l’aide ou un nouvel essai.':'Bravo! Tu as trouvé sans ouvrir le Pop-it.'):'Pas encore. Reprends ton calcul; tu peux ouvrir le Pop-it.';draw();d.querySelector(correct?'[data-next]':'#popit-answer').focus();if(correct){speak('Bravo! Tu as bien travaillé.');cancelSuccess=scheduleSuccess(()=>d.querySelector('[data-next]')?.click());}};
 d.querySelector('[data-next]')?.addEventListener('click',()=>{cancelSuccess();if(round===4){stop();d.innerHTML='<h2>Cinq défis explorés!</h2><p>Bravo pour ton travail. Tes essais sont conservés.</p><button data-close>Revenir au voyage</button>';d.querySelector('button').onclick=close;d.querySelector('button').focus();return;}round++;reset();d.querySelector('#popit-answer').focus();});
 }
 d.addEventListener('cancel',e=>{e.preventDefault();close();});draw();d.showModal();d.querySelector('#popit-answer').focus();return {destroy:close};
}
