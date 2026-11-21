// Jeux de mémoire des nombres : « Les doubles » (4 + 4 ↔ 8) et « Les compléments de 10 » (3 ↔ 7), façon Memory.
// Pensé pour une enfant qui oublie vite : regard de départ, cartes qui reviennent tant qu'elles ne sont pas retenues (boîtes de Leitner),
// images pour retenir, indices, aucune punition. Les progrès restent dans l'appareil.
const KEY='atelier-mots-paires-v1';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
const readAll=()=>{try{return JSON.parse(store()?.getItem(KEY)||'{}')||{};}catch{return {};}};
const writeAll=d=>{try{store()?.setItem(KEY,JSON.stringify(d));}catch{}};
const TIPS_D={1:['👀','1 + 1 = 2 : tes deux yeux !'],2:['🐱','2 + 2 = 4 : les quatre pattes d’un chat !'],3:['🐞','3 + 3 = 6 : les six pattes d’une coccinelle !'],4:['🕷️','4 + 4 = 8 : les huit pattes d’une araignée !'],5:['🖐️','5 + 5 = 10 : tes deux mains !'],6:['🥚','6 + 6 = 12 : une douzaine d’œufs !'],7:['📅','7 + 7 = 14 : deux semaines, 14 jours !'],8:['🕷️','8 + 8 = 16 : deux araignées, 16 pattes !'],9:['🔟','9 + 9 = 18 : 10 + 10 = 20, puis 2 de moins !']};
export const GAMES=Object.freeze({
 doubles:{id:'doubles',title:'Les doubles',icon:'🃏',intro:'Associe chaque addition à son résultat : 4 + 4 va avec 8.',start:3,max:8,
  pairs:()=>Array.from({length:9},(_,i)=>{const n=i+1;return {id:'d'+n,a:{big:`${n} + ${n}`,dots:[n,n]},b:{big:String(2*n),dots:[2*n]},say:`${n} plus ${n} égale ${2*n}`,icon:TIPS_D[n][0],tip:TIPS_D[n][1]};})},
 complements:{id:'complements',title:'Les compléments de 10',icon:'🔟',intro:'Associe les deux nombres qui font 10 : 3 va avec 7.',start:3,max:6,
  pairs:()=>Array.from({length:6},(_,a)=>({id:'c'+a,a:{big:String(a),frame:a,tone:'a'},b:{big:String(10-a),frame:10-a,tone:'b'},say:`${a} plus ${10-a} égale 10`,icon:'🖐️',tip:`${a} doigt${a>1?'s':''} levé${a>1?'s':''}, ${10-a} baissé${10-a>1?'s':''} : ${a} + ${10-a} = 10.`}))}
});
export const gameIds=Object.freeze(Object.keys(GAMES));
// ---- progrès (boîtes de Leitner) ----
const state=(pid,g)=>{const all=readAll();return all[pid]?.[g]||{level:GAMES[g].start,pairs:{}};};
const saveState=(pid,g,s)=>{const all=readAll();all[pid]??={};all[pid][g]=s;writeAll(all);};
export const knownCount=(pid,g)=>Object.values(state(pid,g).pairs).filter(p=>p.box>=2).length;
export function choosePairs(game,pid,k,rnd=Math.random){
 const st=state(pid,game),all=GAMES[game].pairs();
 const score=p=>{const r=st.pairs[p.id];return (r?r.box:-1)+rnd()*1.5;}; // jamais vues et ratées d'abord
 return all.map(p=>[p,score(p)]).sort((a,b)=>a[0]===b[0]?0:a[1]-b[1]).slice(0,Math.min(k,all.length)).map(x=>x[0]);
}
export function recordRound(game,pid,played,missed,rnd=Math.random){
 const st=state(pid,game);
 for(const p of played){const r=st.pairs[p.id]??{box:0,ok:0,ko:0,at:0};if(missed.has(p.id)){r.box=0;r.ko++;}else{r.box=Math.min(3,r.box+1);r.ok++;}r.at=Date.now();st.pairs[p.id]=r;}
 const misses=missed.size,k=played.length;
 if(misses<=Math.floor(k/2)&&st.level<GAMES[game].max)st.level++;else if(misses>k&&st.level>GAMES[game].start)st.level--;
 saveState(pid,game,st);return st.level;
}
export const deck=(pairs,rnd=Math.random)=>pairs.flatMap(p=>[{pid:p.id,side:'a',p},{pid:p.id,side:'b',p}]).map(c=>[c,rnd()]).sort((x,y)=>x[1]-y[1]).map(x=>x[0]);
export const isMatch=(x,y)=>x!==y&&x.pid===y.pid&&x.side!==y.side;
// ---- affichage ----
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dots=n=>`<span class="mp-dots">${'<i></i>'.repeat(n)}</span>`;
const frame=(n,tone)=>`<span class="mp-frame ${tone}">${Array.from({length:10},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</span>`;
const face=side=>`<b>${esc(side.big)}</b>${side.frame!==undefined?frame(side.frame,side.tone):side.dots.map(dots).join('')}`;
export const memoryMarkup=()=>'<section class="mp" data-mp aria-label="Mémoire des nombres"></section>';
export function mountMemory(root,{profile,speak,award,onExit}){
 const box=root.querySelector('[data-mp]');if(!box)return {destroy(){}};
 let alive=true,timers=[],cur=null;
 const later=(f,ms)=>{const t=setTimeout(()=>{if(alive)f();},ms);timers.push(t);return t;};
 const clear=()=>{timers.forEach(clearTimeout);timers=[];};
 const say=t=>{try{speak(t);}catch{}};
 const top=(t,back)=>`<div class="mp-top"><button type="button" data-mp-${back}>‹</button><h2>${t}</h2></div>`;
 const menu=()=>{clear();cur=null;
  box.innerHTML=`${top('🧠 Mémoire des nombres','exit')}<p class="mp-intro">Des jeux de cartes pour retenir les doubles et les compléments de 10, sans stress : les cartes difficiles reviennent jusqu’à ce que tu les connaisses.</p><div class="mp-menu">${gameIds.map(g=>{const G=GAMES[g],n=G.pairs().length,k=knownCount(profile.id,g);return `<button type="button" class="mp-game" data-mp-game="${g}"><span aria-hidden="true">${G.icon}</span><strong>${esc(G.title)}</strong><small>${k?`Tu en connais ${k} sur ${n}`:`${n} paires à retenir`}</small></button>`;}).join('')}<button type="button" class="mp-game mp-learn" data-mp-learn="all"><span aria-hidden="true">📖</span><strong>Mes trucs pour retenir</strong><small>Des images pour ne plus oublier</small></button></div>`;};
 const learn=(g)=>{clear();const list=g==='all'?gameIds:[g];
  box.innerHTML=`${top('📖 Mes trucs pour retenir','menu')}<div class="mp-learnlist">${list.map(id=>`<h3>${GAMES[id].icon} ${esc(GAMES[id].title)}</h3>${GAMES[id].pairs().map(p=>`<button type="button" class="mp-tip" data-mp-say="${esc(p.say)}"><span aria-hidden="true">${p.icon}</span><span><b>${esc(p.a.big)} ↔ ${esc(p.b.big)}</b><small>${esc(p.tip)}</small></span><i aria-hidden="true">🔊</i></button>`).join('')}`).join('')}</div>`;};
 const start=g=>{clear();const st=state(profile.id,g),G=GAMES[g],pairs=choosePairs(g,profile.id,st.level);
  cur={g,G,pairs,cards:deck(pairs).map(c=>({...c,s:'up'})),open:[],lock:true,missed:new Set(),streak:0,hints:2,moves:0,done:0};
  box.innerHTML=`${top(G.icon+' '+esc(G.title),'menu')}<p class="mp-msg" role="status">👀 Regarde bien et retiens les cartes !</p><div class="mp-bar"><i style="animation-duration:${2000+pairs.length*900}ms"></i></div><div class="mp-grid" style="--cols:${pairs.length<=3?3:4};--w:${pairs.length<=3?176:pairs.length<=6?150:128}px"></div><div class="mp-actions"><button type="button" data-mp-ready>Je suis prête !</button></div>`;
  paint();later(begin,2000+pairs.length*900);};
 const paint=()=>{const grid=box.querySelector('.mp-grid');if(!grid||!cur)return;
  grid.innerHTML=cur.cards.map((c,i)=>`<button type="button" class="mp-card ${c.s}" data-mp-card="${i}" aria-label="${c.s==='down'?'Carte cachée':esc(c.side==='a'?c.p.a.big:c.p.b.big)}"><span class="mp-in"><span class="mp-back" aria-hidden="true">${profile.id==='p2'?'🦄':'🦋'}</span><span class="mp-front">${face(c.side==='a'?c.p.a:c.p.b)}</span></span></button>`).join('');};
 const msg=t=>{const m=box.querySelector('.mp-msg');if(m)m.textContent=t;};
 const begin=()=>{if(!cur||!cur.lock||box.querySelector('[data-mp-ready]')===null)return;cur.cards.forEach(c=>c.s='down');cur.lock=false;
  box.querySelector('.mp-bar')?.remove();box.querySelector('.mp-actions').innerHTML=`<button type="button" data-mp-hint>💡 Indice (${cur.hints})</button><button type="button" data-mp-learn="${cur.g}">📖 Mes trucs</button>`;msg('Trouve les paires : touche deux cartes.');paint();};
 const flip=i=>{if(!cur||cur.lock)return;const c=cur.cards[i];if(!c||c.s!=='down')return;c.s='up';cur.open.push(i);paint();
  if(cur.open.length<2)return;cur.moves++;cur.lock=true;const [x,y]=cur.open.map(k=>cur.cards[k]);
  if(isMatch(x,y)){later(()=>{x.s=y.s='done';cur.done++;cur.streak=0;cur.open=[];cur.lock=false;paint();msg('✓ '+x.p.a.big+' ↔ '+x.p.b.big+' : '+x.p.say.replace(' égale ',' = ')+' !');say(x.p.say);if(cur.done===cur.pairs.length)later(finish,1300);},450);}
  else{cur.missed.add(x.pid);cur.missed.add(y.pid);cur.streak++;msg(cur.streak>=3?'Pas grave ! Touche 💡 Indice si tu veux de l’aide.':'Presque ! Essaie encore.');
   later(()=>{x.s=y.s='down';cur.open=[];cur.lock=false;paint();},1300);}};
 const hint=()=>{if(!cur||cur.lock||cur.hints<=0)return;const left=cur.cards.map((c,i)=>[c,i]).filter(([c])=>c.s==='down');if(!left.length)return;
  const pid=left[Math.floor(Math.random()*left.length)][0].pid,idx=left.filter(([c])=>c.pid===pid).map(([,i])=>i);cur.hints--;
  idx.forEach(i=>box.querySelector(`[data-mp-card="${i}"]`)?.classList.add('hint'));msg('💡 Ces deux cartes vont ensemble !');const b=box.querySelector('[data-mp-hint]');if(b)b.textContent=`💡 Indice (${cur.hints})`;};
 const finish=()=>{const {g,G,pairs,missed}=cur,level=recordRound(g,profile.id,pairs,missed),star=award(g),n=pairs.length,ok=n-missed.size;
  box.innerHTML=`${top('🎉 Bravo !','menu')}<div class="mp-card2"><p class="mp-score">${ok} paire${ok>1?'s':''} sur ${n} du premier coup</p>${missed.size?`<p>Les cartes oubliées reviennent bientôt : c’est comme ça qu’on retient !</p>`:'<p>Tu n’as rien oublié : superbe mémoire !</p>'}${star?'<p class="mp-star">+5 ⭐</p>':''}<p class="mp-next">Prochaine partie : ${level} paires.</p><div class="mp-pairs">${pairs.map(p=>`<span class="${missed.has(p.id)?'miss':''}">${esc(p.a.big)} ↔ ${esc(p.b.big)}</span>`).join('')}</div><button type="button" class="mp-go" data-mp-game="${g}">Encore</button><button type="button" class="mp-alt" data-mp-learn="${g}">📖 Mes trucs pour retenir</button><button type="button" class="mp-alt" data-mp-menu>Autre jeu</button></div>`;
  say(missed.size?'Bon travail !':'Bravo ! Tu as tout retenu !');cur=null;};
 const click=e=>{const b=e.target.closest('button');if(!b||!alive)return;
  if(b.hasAttribute('data-mp-exit')){clear();return onExit();}
  if(b.hasAttribute('data-mp-menu'))return menu();
  if(b.dataset.mpGame)return start(b.dataset.mpGame);
  if(b.dataset.mpLearn)return learn(b.dataset.mpLearn);
  if(b.dataset.mpSay)return say(b.dataset.mpSay);
  if(b.hasAttribute('data-mp-ready'))return begin();
  if(b.hasAttribute('data-mp-hint'))return hint();
  if(b.dataset.mpCard!==undefined)return flip(Number(b.dataset.mpCard));};
 box.addEventListener('click',click);menu();
 return {destroy(){alive=false;clear();box.removeEventListener('click',click);}};
}
