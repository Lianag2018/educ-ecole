// Grille de lecture à voix haute (3e année) : 80 nombres de 1 000 à 9 999 mélangés au hasard,
// dix par rangée, huit rangées. Un nombre est éclairé; l'enfant le dit à voix haute et l'adulte touche « Bien dit ».
export const ADVANCED_ORDER=Object.freeze(['J','L','M','N','P']);
export const GRID_COLUMNS=10,GRID_ROWS=8,GRID_SIZE=GRID_COLUMNS*GRID_ROWS,GRID_MIN=1000,GRID_MAX=9999;
// 80 nombres différents, tirés sans boucle infinie : on tire dans un ensemble qu'on rétrécit.
export function drawNumbers(random=Math.random,count=GRID_SIZE){
 const seen=new Set();
 while(seen.size<count)seen.add(GRID_MIN+Math.floor(random()*(GRID_MAX-GRID_MIN+1)));
 return [...seen];
}
export const createGrid=(random=Math.random)=>({random,numbers:drawNumbers(random),done:new Set(),current:0,message:''});
export const isFinished=g=>g.done.size>=g.numbers.length;
export function select(g,index){if(Number.isInteger(index)&&index>=0&&index<g.numbers.length&&!g.done.has(index))g.current=index;return g.current;}
export function markDone(g,index=g.current){g.done.add(index);return g.done.size;}
// Prochain nombre pas encore lu, en avançant dans la grille; -1 quand tout est lu.
export function nextIndex(g,from=g.current){
 const n=g.numbers.length;
 for(let k=1;k<=n;k++){const i=(from+k)%n;if(!g.done.has(i))return i;}
 return -1;
}
export function cellClass(g,i){return ['read-cell',g.done.has(i)?'done':'',i===g.current?'now':''].filter(Boolean).join(' ');}
export function gridMarkup(g){
 return `<div class="read-aloud"><div class="read-grid" role="group" aria-label="Choisis un nombre et dis-le à voix haute">${g.numbers.map((n,i)=>`<button type="button" class="${cellClass(g,i)}" data-read-cell="${i}">${n}</button>`).join('')}</div>
 <p class="read-ask">Dis à voix haute le nombre <b>jaune</b></p>
 <div class="read-buttons"><button type="button" class="read-ok" data-read-ok>✔ Bien dit</button><button type="button" class="read-again" data-read-again>↻ À revoir</button></div>
 <p class="read-msg" role="status" data-read-msg>${g.message||`${g.done.size} / ${g.numbers.length}`}</p></div>`;
}
// Met à jour l'écran sans le reconstruire.
export function paintGrid(root,g){
 root.querySelectorAll('[data-read-cell]').forEach(b=>{b.className=cellClass(g,Number(b.dataset.readCell));});
 const m=root.querySelector('[data-read-msg]');if(m)m.textContent=g.message||`${g.done.size} / ${g.numbers.length}`;
}
