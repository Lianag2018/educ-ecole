// Grade-three practice: solve first, open the complete manipulative only if useful.
const sets={
 '+':[[27,18],[36,25],[48,17],[59,24],[67,28]],
 '−':[[43,18],[62,27],[75,38],[84,46],[93,57]],
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
export function fullPopitMarkup(table=true,pressed=new Set()){
 return `<div class="full-popit-scroll" tabindex="0" aria-label="Tableau complet, faire défiler horizontalement sur téléphone"><div class="full-popit"><span class="pop-axis">${table?'×':'#'}</span>${Array.from({length:12},(_,i)=>`<span class="pop-axis">${i+1}</span>`).join('')}${Array.from({length:12},(_,r)=>`<span class="pop-axis">${r+1}</span>${Array.from({length:12},(_,c)=>{const i=r*12+c,value=table?(r+1)*(c+1):i+1;return `<button class="full-pop-bubble pop-color-${c%6}" data-full-bubble="${i}" aria-label="Ligne ${r+1}, colonne ${c+1}, ${value}" aria-pressed="${pressed.has(i)}">${value}</button>`;}).join('')}`).join('')}</div></div>`;
}
export function openAdvancedPopit(p,{save=()=>{},speak=()=>{},stop=()=>{}}={}){
 const previous=document.activeElement,d=document.createElement('dialog');d.className='popit-dialog popit-advanced';d.setAttribute('aria-labelledby','popit-advanced-title');document.body.append(d);
 let op='+',round=0,extended=false,helpOpen=false,pressed=new Set(),complete=false,draft='',notice='';
 const q=()=>advancedProblem(op,round,extended);
 const close=()=>{stop();d.close();d.remove();previous?.focus();};
 function reset(){stop();helpOpen=false;pressed=new Set();complete=false;draft='';notice='';draw();}
 function draw(){const item=q(),table=['×','÷'].includes(op);d.classList.toggle('popit-expanded',helpOpen);
 d.innerHTML=`<div class="popit-top"><h2 id="popit-advanced-title">Mes défis de calcul</h2><button data-close aria-label="Fermer les défis">Fermer ✕</button></div><p>Calcule à ta façon. Le Pop-it est là si tu en as besoin.</p><div class="popit-ops">${['+','−','×','÷'].map(x=>`<button data-op="${x}" aria-pressed="${x===op}">${x}</button>`).join('')}</div>${table?`<label>Tables à pratiquer <select data-tables><option value="6" ${!extended?'selected':''}>De 1 à 6</option><option value="12" ${extended?'selected':''}>Défi · jusqu’à 12</option></select></label>`:''}<h3 class="popit-equation">${item.a} ${op} ${item.b} = ?</h3><button data-listen>🔊 Écouter le calcul</button><form data-answer-form><label for="popit-answer">Ma réponse</label><input id="popit-answer" inputmode="numeric" type="number" min="0" max="999" step="1" required autocomplete="off" value="${draft}" ${complete?'disabled':''}><button class="primary" ${complete?'disabled':''}>Vérifier</button></form><p role="status">${notice}</p>${complete?'<button class="primary" data-next>Défi suivant →</button>':''}<button class="popit-helper" data-helper aria-expanded="${helpOpen}" aria-controls="popit-aid"><span class="mini-popit" aria-hidden="true">${'<i></i>'.repeat(9)}</span><span>${helpOpen?'Réduire le Pop-it':'Besoin d’aide? Ouvrir mon Pop-it'}</span></button>${helpOpen?`<section id="popit-aid"><h3>Mon Pop-it complet · 12 × 12</h3><p>${table?'Les nombres sont les produits : croise une ligne et une colonne. Pour une division, cherche le total dans la colonne du diviseur et lis le numéro de ligne.':'Les bulles sont numérotées de 1 à 144. Pour ajouter, enfonce les deux quantités; pour soustraire, enfonce la quantité de départ puis relève ce que tu retires.'}</p>${fullPopitMarkup(table,pressed)}<p data-full-count aria-live="polite">${pressed.size} bulles enfoncées</p><button data-clear>Relever toutes les bulles</button></section>`:''}<p>Défi ${round+1} / 5 · Pas de chronomètre</p>`;
 d.querySelector('[data-close]').onclick=close;
 d.querySelector('[data-listen]').onclick=()=>speak(`${item.a} ${op==='+'?'plus':op==='−'?'moins':op==='×'?'fois':'divisé par'} ${item.b}. Quel est le résultat?`);
 d.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{op=b.dataset.op;round=0;reset();});
 d.querySelector('[data-tables]')?.addEventListener('change',e=>{extended=e.target.value==='12';round=0;reset();});
 d.querySelector('#popit-answer').oninput=e=>{draft=/^\d{0,3}$/.test(e.target.value)?e.target.value:'';};
 d.querySelector('[data-helper]').onclick=()=>{helpOpen=!helpOpen;if(helpOpen&&!complete){rememberPopit(p,item,{help:true});save();}draw();d.querySelector('[data-helper]').focus();};
 d.querySelectorAll('[data-full-bubble]').forEach(b=>b.onclick=()=>{const i=+b.dataset.fullBubble;pressed.has(i)?pressed.delete(i):pressed.add(i);b.setAttribute('aria-pressed',String(pressed.has(i)));d.querySelector('[data-full-count]').textContent=`${pressed.size} bulles enfoncées`;});
 d.querySelector('[data-clear]')?.addEventListener('click',()=>{pressed.clear();d.querySelectorAll('[data-full-bubble]').forEach(b=>b.setAttribute('aria-pressed','false'));d.querySelector('[data-full-count]').textContent='0 bulles enfoncées';});
 d.querySelector('[data-answer-form]').onsubmit=e=>{e.preventDefault();if(complete||draft==='')return;const correct=Number(draft)===item.target,result=rememberPopit(p,item,{complete:correct,incorrect:!correct});save();complete=correct;notice=correct?(result.assisted?'Bravo! Tu as résolu le défi avec de l’aide ou un nouvel essai.':'Bravo! Tu as trouvé sans ouvrir le Pop-it.'):'Pas encore. Reprends ton calcul; tu peux ouvrir le Pop-it.';draw();d.querySelector(correct?'[data-next]':'#popit-answer').focus();};
 d.querySelector('[data-next]')?.addEventListener('click',()=>{if(round===4){stop();d.innerHTML='<h2>Cinq défis explorés!</h2><p>Bravo pour ton travail. Tes essais sont conservés.</p><button data-close>Revenir au voyage</button>';d.querySelector('button').onclick=close;d.querySelector('button').focus();return;}round++;reset();d.querySelector('#popit-answer').focus();});
 }
 d.addEventListener('cancel',e=>{e.preventDefault();close();});draw();d.showModal();d.querySelector('#popit-answer').focus();return {destroy:close};
}
