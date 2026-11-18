import {numberWords} from './numbers.js';
// Tableau de 100 : dix lignes de dix. On donne un nombre écrit en lettres, l'enfant le cherche et le touche,
// et chaque nombre touché est prononcé. Aucune note, aucune limite de temps.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const rowOf=n=>Math.floor((n-1)/10);
// Tirage direct, sans boucle : on choisit parmi les 99 autres nombres, puis on saute le nombre précédent.
export function newTarget(previous=0,random=Math.random){
 const had=previous>=1&&previous<=100,n=1+Math.floor(random()*(had?99:100));
 return had&&n>=previous?n+1:n;
}
export function createChart(random=Math.random){return {random,target:newTarget(0,random),last:null,found:new Set(),tries:0,msg:'',ok:null};}
// Touche un nombre : renvoie ce qu'il faut dire à voix haute, ou null si la valeur n'est pas dans le tableau.
export function tapNumber(s,n){
 if(!Number.isInteger(n)||n<1||n>100)return null;
 s.last=n;
 if(n===s.target){s.found.add(n);s.ok=true;s.tries=0;s.msg=`Bravo ! ${numberWords(n)}, c’est ${n}.`;return {right:true,speak:numberWords(n)};}
 s.ok=false;s.tries++;s.msg=`Ça, c’est ${numberWords(n)}. Cherche ${numberWords(s.target)}.`;return {right:false,speak:numberWords(n)};
}
export function nextTarget(s){s.target=newTarget(s.target,s.random);s.ok=null;s.tries=0;s.msg='';}
// Après deux essais ratés, on éclaire la ligne du nombre cherché.
export const hintRow=s=>s.tries>=2?rowOf(s.target):-1;
export function cellClass(s,n){
 return ['hundred-cell',n%10===0?'ten-end':'',s.found.has(n)?'found':'',s.last===n&&s.ok===true?'right':'',s.last===n&&s.ok===false?'wrong':'',rowOf(n)===hintRow(s)?'hint':'',rowOf(n)%2?'row-b':'row-a'].filter(Boolean).join(' ');
}
export function chartMarkup(s){
 return `<section class="hundred-chart" aria-label="Tableau des nombres de 1 à 100">
 <div class="hundred-grid" role="group" aria-label="Appuie sur le bon nombre">${Array.from({length:100},(_,i)=>`<button type="button" class="${cellClass(s,i+1)}" data-hundred-n="${i+1}">${i+1}</button>`).join('')}</div>
 <aside class="hundred-side"><div class="hundred-ask"><span>Trouve le nombre</span><strong data-hundred-word>${esc(numberWords(s.target))}</strong><button type="button" class="hundred-hear" data-hundred-hear aria-label="Écouter le nombre à trouver">🔊 Écouter</button></div>
 <div class="hundred-last" aria-live="polite"><b data-hundred-last>${s.last??'?'}</b><small data-hundred-last-words>${s.last?esc(numberWords(s.last)):'Appuie sur un nombre'}</small></div>
 <p class="hundred-msg" role="status" data-hundred-msg>${esc(s.msg)}</p><p class="hundred-score" data-hundred-score>⭐ ${s.found.size}</p></aside></section>`;
}
// Met à jour l'écran sans le reconstruire : l'audio en cours n'est jamais interrompu par un nouveau dessin.
export function paintChart(root,s){
 root.querySelectorAll('[data-hundred-n]').forEach(b=>{b.className=cellClass(s,Number(b.dataset.hundredN));});
 const set=(sel,text)=>{const e=root.querySelector(sel);if(e)e.textContent=text;};
 set('[data-hundred-word]',numberWords(s.target));set('[data-hundred-last]',s.last??'?');
 set('[data-hundred-last-words]',s.last?numberWords(s.last):'Appuie sur un nombre');set('[data-hundred-msg]',s.msg);set('[data-hundred-score]','⭐ '+s.found.size);
}
