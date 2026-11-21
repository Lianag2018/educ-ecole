// Les feuilles de l'école, à colorier sur la tablette : mêmes grilles, mêmes consignes. Liana touche les cases qui vont ensemble
// (deux cases qui font 10, ou trois cases « terme, terme, somme » pour les doubles); elles se colorient de la même couleur.
// Les nombres des feuilles « de l'école » sont ceux de la page photographiée par le parent (usage familial); « Nouvelle feuille » en fabrique d'autres.
export const KINDS=Object.freeze({
 complements:{id:'complements',title:'Les compléments de 10',need:2,icon:'🔟',hand:true,
  instruction:'Colorie de la même couleur les deux cases qui font 10 ensemble.',
  say:v=>`${v[0]} plus ${v[1]} égale 10`},
 doubles:{id:'doubles',title:'Les doubles',need:3,icon:'🃏',hand:false,
  instruction:'Colorie les trois cases correspondantes de la même couleur pour les doubles (les deux termes et la somme).',
  say:v=>{const x=Math.min(...v);return `${x} plus ${x} égale ${2*x}`;}}
});
const N=null;
export const SCHOOL_PAGES=Object.freeze({
 complements:[
  [[7,3,2,4,6],[3,7,8,7,4],[0,8,2,1,9],[10,2,7,3,1],[5,5,3,6,4],[2,8,7,4,8],[8,3,3,6,2]],
  [[1,9,2,3,7],[3,7,8,4,6],[7,2,3,6,5],[3,8,2,3,5],[1,9,6,5,4],[2,8,4,5,3],[8,1,9,5,7]]],
 doubles:[
  [[N,14,8,3,N],[2,3,9,2,7],[10,9,6,9,4],[1,4,4,5,16],[2,7,2,8,4],[1,5,6,6,9],[18,8,18,2,12]],
  [[10,4,4,8,16],[9,7,8,6,5],[16,1,3,2,18],[4,14,5,9,6],[3,2,6,7,2],[12,3,8,1,6],[N,8,3,8,N]]]
});
export const isGroup=(kind,vals)=>{
 if(kind==='complements')return vals.length===2&&vals[0]+vals[1]===10;
 if(kind==='doubles'){if(vals.length!==3)return false;const s=[...vals].sort((a,b)=>a-b);return s[0]===s[1]&&s[2]===2*s[0];}
 return false;
};
// Cherche un groupe possible parmi les cases libres [{k,v}] (pour l'indice et pour savoir si la feuille est finie).
export function findGroup(kind,cells){
 if(kind==='complements'){for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)if(cells[i].v+cells[j].v===10)return [cells[i],cells[j]];return null;}
 for(let i=0;i<cells.length;i++)for(let j=i+1;j<cells.length;j++)if(cells[i].v===cells[j].v)for(let k=0;k<cells.length;k++)if(k!==i&&k!==j&&cells[k].v===2*cells[i].v)return [cells[i],cells[j],cells[k]];
 return null;
}
const shuffle=(a,r)=>a.map(x=>[x,r()]).sort((p,q)=>p[1]-q[1]).map(x=>x[0]);
// Fabrique une page de 2 grilles 7×5 dans le même format que la feuille de l'école (des groupes cachés + des nombres « pièges »).
export function generatePage(kind,rnd=Math.random){
 const grids=[];
 for(let g=0;g<2;g++){
  const cells=[],dark=kind==='doubles'?2:0,total=35-dark,vals=[];
  if(kind==='complements'){const k=14;for(let i=0;i<k;i++){const a=Math.floor(rnd()*6);vals.push(a,10-a);}while(vals.length<total)vals.push(Math.floor(rnd()*11));}
  else{const k=8;for(let i=0;i<k;i++){const x=1+Math.floor(rnd()*9);vals.push(x,x,2*x);}while(vals.length<total)vals.push(1+Math.floor(rnd()*18));}
  const flat=shuffle(vals,rnd).slice(0,total);let p=0;
  for(let r=0;r<7;r++){const row=[];for(let c=0;c<5;c++){const isDark=dark&&r===(g?6:0)&&(c===0||c===4);row.push(isDark?null:flat[p++]);}cells.push(row);}
  grids.push(cells);
 }
 return grids;
}
const COLORS=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#fd79a8','#6c5ce7','#00b894'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Monte une page à colorier dans `box`. app fournit {kind,grids,profile,speak,award,onBack,label}.
export function mountSheet(box,{kind,grids,profile,speak,award,onBack,label=''}){
 const K=KINDS[kind];let alive=true,timers=[],sel=[],groups=[],color=0,hints=3,finished=false;
 const cells=[];grids.forEach((g,gi)=>g.forEach((row,r)=>row.forEach((v,c)=>cells.push({k:`${gi}:${r}:${c}`,v,gi,r,c}))));
 const byKey=Object.fromEntries(cells.map(c=>[c.k,c]));
 const locked=()=>new Set(groups.flatMap(g=>g.keys));
 const free=()=>cells.filter(c=>c.v!==null&&!locked().has(c.k));
 const later=(f,ms)=>{timers.push(setTimeout(()=>{if(alive)f();},ms));};
 const say=t=>{try{speak(t);}catch{}};
 const colorOf=k=>{const g=groups.find(x=>x.keys.includes(k));return g?COLORS[g.color]:sel.includes(k)?COLORS[color]:'';};
 const render=()=>{
  box.innerHTML=`<div class="ws-top"><button type="button" data-ws-back aria-label="Retour">‹</button><h2>${K.icon} ${esc(label||K.title)}</h2></div>
  <article class="ws-page ${K.hand?'hand':''}"><div class="ws-head"><span>${K.hand?'':''}<b>Nom :</b> <u>&nbsp;${esc(profile.name)}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></span></div><h3>${esc(K.title)}</h3><p class="ws-instr">${esc(K.instruction)}</p>
  <div class="ws-grids">${grids.map((g,gi)=>`<div class="ws-grid">${g.map((row,r)=>row.map((v,c)=>{const key=`${gi}:${r}:${c}`;if(v===null)return `<span class="ws-dark" aria-hidden="true"></span>`;const col=colorOf(key),lk=locked().has(key);return `<button type="button" class="ws-cell ${lk?'lk':''} ${sel.includes(key)?'sel':''}" data-ws-cell="${key}" ${col?`style="--c:${col}"`:''} aria-label="${v}">${v}</button>`;}).join('')).join('')}</div>`).join('')}</div></article>
  <p class="ws-msg" role="status"></p>
  <div class="ws-tools"><div class="ws-crayons" role="group" aria-label="Crayons">${COLORS.map((c,i)=>`<button type="button" class="${i===color?'on':''}" data-ws-color="${i}" style="--c:${c}" aria-label="Crayon ${i+1}"></button>`).join('')}</div>
  <button type="button" data-ws-undo>↩ Défaire</button><button type="button" data-ws-hint>💡 Indice (${hints})</button><span class="ws-count">${groups.length} ${kind==='doubles'?'groupe'+(groups.length>1?'s trouvés':' trouvé'):'paire'+(groups.length>1?'s trouvées':' trouvée')}</span></div>`;};
 const msg=t=>{const m=box.querySelector('.ws-msg');if(m)m.textContent=t;};
 const nextColor=()=>{const used=new Set(groups.map(g=>g.color));for(let i=1;i<=COLORS.length;i++){const c=(color+i)%COLORS.length;if(!used.has(c)){color=c;return;}}};
 const finishIf=()=>{if(finished||findGroup(kind,free()))return;finished=true;const star=award(kind),n=groups.length;
  later(()=>{box.innerHTML=`<div class="ws-top"><button type="button" data-ws-back aria-label="Retour">‹</button><h2>🎉 Bravo !</h2></div><div class="ws-done"><p class="ws-score">${n} ${kind==='doubles'?'groupe'+(n>1?'s coloriés':' colorié'):'paire'+(n>1?'s coloriées':' coloriée')} !</p>${star?'<p class="ws-star">+5 ⭐</p>':''}<p>Tu as trouvé tout ce qui allait ensemble.</p><button type="button" class="ws-go" data-ws-back>Retour aux jeux</button></div>`;say('Bravo ! Tu as tout trouvé !');},1200);};
 const validate=()=>{const vals=sel.map(k=>byKey[k].v);
  if(isGroup(kind,vals)){groups.push({keys:[...sel],color});sel=[];nextColor();render();msg('✓ '+K.say(vals).replace(' égale ',' = ').replace(/ plus /g,' + ')+' !');say(K.say(vals));finishIf();return;}
  let hint='Ces cases ne vont pas ensemble. Essaie encore !';
  if(kind==='doubles'){const s=[...vals].sort((a,b)=>a-b);if(s[0]===s[1])hint=`${s[0]} + ${s[0]} = ${2*s[0]} : cherche la case ${2*s[0]} !`;}
  else hint=`${vals[0]} + ${vals[1]} ne fait pas 10. Pense à ce qui manque pour arriver à 10 !`;
  msg(hint);later(()=>{sel=[];render();msg(hint);},1400);};
 const click=e=>{const b=e.target.closest('button');if(!b||!alive)return;
  if(b.hasAttribute('data-ws-back'))return onBack();
  if(b.dataset.wsColor!==undefined){color=Number(b.dataset.wsColor);render();return;}
  if(b.hasAttribute('data-ws-undo')){if(groups.length){groups.pop();sel=[];finished=false;render();msg('Dernier groupe effacé.');}return;}
  if(b.hasAttribute('data-ws-hint')){if(hints<=0)return;const g=findGroup(kind,free());if(!g)return;hints--;sel=[];render();g.forEach(c=>box.querySelector(`[data-ws-cell="${c.k}"]`)?.classList.add('hint'));msg('💡 Ces cases vont ensemble !');return;}
  if(b.dataset.wsCell!==undefined){const k=b.dataset.wsCell;if(locked().has(k)||sel.length>=K.need&&!sel.includes(k))return;
   sel=sel.includes(k)?sel.filter(x=>x!==k):[...sel,k];render();msg(sel.length?`${sel.length} case${sel.length>1?'s':''} choisie${sel.length>1?'s':''}…`:'');
   if(sel.length===K.need)validate();}};
 box.addEventListener('click',click);render();msg(K.need===2?'Touche deux cases qui font 10.':'Touche trois cases : deux pareilles et leur double.');
 return {destroy(){alive=false;timers.forEach(clearTimeout);box.removeEventListener('click',click);}};
}
