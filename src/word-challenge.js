// Défi 3 secondes : lire chaque mot fréquent à voix haute avant la fin du temps.
// Listes : J. Giasson (La lecture, de la théorie à la pratique) et Y. Nadon (Lire et écrire en première année), telles que
// publiées sur pedagonet.com. La lecture est dite par l'enfant; l'app ne l'évalue pas (un adulte peut écouter).
const NADON='à amour aimer aller ami amie après au aussi avec avoir beau beaucoup bébé belle bien blanc blanche bleu bleue bon bonne bonbon ton bouche bras brun brune chat chatte cher chère chez chien chienne cinq classe cou dans de des deux dimanche dire dix du école elle elles en et été être faim faire fête fille fin frère garçon grand grande gros grosse huit il ils j’ai jamais jaune je jeu jeudi joue jupe le la les livre long longue main maison malade maman me mère midi mon ma mes neuf noir noire nom non nous on orange ou oui papa par pas père petit petite pied plus pomme porte poule poupée pour premier première puis quatre robe rose rouge rue samedi sept si six sœur son sa ses souris sous souvent sur table te terre tête ta tes toujours très trois tu un une vache vert verte vite vous yeux';
const GIASSON='à au aux aller autre avec avoir bien ce cet cette ces comme de du des dans dire donner elle elles en et être faire il ils je me moi jour le la les leur leurs lui mais mon ma mes ne où par pas plus pour pouvoir prendre que qui se sans savoir si soi son sa ses sur te tu toi ton ta tes tout tous un une uns unes venir voir votre vos vouloir vous y';
const uniq=t=>[...new Set(t.split(/\s+/).filter(Boolean))];
export const nadonWords=uniq(NADON),giassonWords=uniq(GIASSON);
export const wordsForChild=older=>older?uniq(NADON+' '+GIASSON):nadonWords;
export const ROUND=10,TIME_MS=3000,MAX_STAR_ROUNDS=3,PASS=8;
const KEY='atelier-mots-defi-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
const save=d=>{try{localStorage.setItem(KEY,JSON.stringify(d));}catch{}};
const mine=(d,id)=>d[id]??=({known:{},missed:[],rounds:{}});
// Les mots ratés reviennent d'abord, puis les moins réussis, puis les nouveaux (au hasard).
export function pickRound(words,rec,rnd=Math.random,n=ROUND){
 const missed=(rec.missed||[]).filter(w=>words.includes(w)),rest=words.filter(w=>!missed.includes(w));
 const shuffled=rest.map(w=>[w,(rec.known?.[w]||0)+rnd()*1.5]).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
 return [...missed,...shuffled].slice(0,n);
}
export function recordRound(profileId,results,day){
 const d=load(),r=mine(d,profileId);
 for(const [w,ok] of results){if(ok){r.known[w]=(r.known[w]||0)+1;r.missed=r.missed.filter(x=>x!==w);}else if(!r.missed.includes(w))r.missed.push(w);}
 const good=results.filter(x=>x[1]).length,passed=good>=PASS,done=r.rounds[day]||0;
 const star=passed&&done<MAX_STAR_ROUNDS;
 r.rounds[day]=done+(passed?1:0);
 for(const k of Object.keys(r.rounds))if(k<day)delete r.rounds[k];
 save(d);return {good,star,roundId:`defi:${day}:${done+1}`};
}
export const challengeSummary=id=>{const r=load()[id]||{known:{},missed:[]};return {known:Object.keys(r.known).length,missed:r.missed.length};};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const challengeMarkup=()=>`<section class="wc" data-wc aria-label="Défi 3 secondes"></section>`;
// Monte le défi dans le conteneur; app fournit {profile:{id,older},speak,award,onExit,today}.
export function mountWordChallenge(root,{profile,speak,award,onExit,today}){
 const box=root.querySelector('[data-wc]');if(!box)return {destroy(){}};
 const words=wordsForChild(profile.older);let timer=null,list=[],i=0,results=[],alive=true;
 const clear=()=>{clearTimeout(timer);timer=null;};
 const intro=()=>{clear();const s=challengeSummary(profile.id);
  box.innerHTML=`<div class="wc-card"><h2>⏱️ Défi 3 secondes</h2><p>Un mot apparaît. Lis-le <b>à voix haute</b> avant la fin du temps, puis touche <b>« Je l’ai lu ! »</b>.</p><p class="wc-stat">${s.known?`Tu connais déjà ${s.known} mot${s.known>1?'s':''}.`:'Premier défi !'}${s.missed?` ${s.missed} mot${s.missed>1?'s':''} à revoir.`:''}</p><button class="wc-go" data-wc-start>Je commence !</button><button class="wc-back" data-wc-exit>Retour</button></div>`;};
 const start=()=>{list=pickRound(words,load()[profile.id]||{});i=0;results=[];next();};
 const next=()=>{clear();if(i>=list.length)return end();const w=list[i];
  box.innerHTML=`<div class="wc-card wc-play"><p class="wc-count">Mot ${i+1} sur ${list.length}</p><div class="wc-word" lang="fr-CA">${esc(w)}</div><div class="wc-bar" role="timer" aria-label="Temps pour lire le mot"><i style="animation-duration:${TIME_MS}ms"></i></div><button class="wc-read" data-wc-read>Je l’ai lu !</button></div>`;
  timer=setTimeout(()=>miss(w),TIME_MS);};
 const hear=w=>{try{speak(w);}catch{}};
 const miss=w=>{clear();results.push([w,false]);
  box.innerHTML=`<div class="wc-card wc-play wc-miss"><p class="wc-count">Mot ${i+1} sur ${list.length}</p><div class="wc-word">${esc(w)}</div><p class="wc-msg">Le temps est fini. Écoute et répète le mot !</p><button class="wc-again" data-wc-hear>🔊 Écouter</button><button class="wc-go" data-wc-next>Suivant</button></div>`;hear(w);};
 const hit=w=>{clear();results.push([w,true]);
  box.innerHTML=`<div class="wc-card wc-play wc-hit"><p class="wc-count">Mot ${i+1} sur ${list.length}</p><div class="wc-word">${esc(w)}</div><p class="wc-msg">✓ Bravo !</p></div>`;hear(w);timer=setTimeout(()=>{i++;next();},900);};
 const end=()=>{clear();const r=recordRound(profile.id,results,today());if(r.star)award(r.roundId);
  box.innerHTML=`<div class="wc-card"><h2>${r.good>=PASS?'🎉 Bravo !':'💪 Bon travail !'}</h2><p class="wc-score">${r.good} mot${r.good>1?'s':''} sur ${list.length} lus à temps</p>${r.star?'<p class="wc-star">+5 ⭐</p>':r.good>=PASS?'<p>Tu as déjà gagné tes étoiles de défi aujourd’hui.</p>':`<p>Avec ${PASS} mots sur ${list.length}, tu gagnes des étoiles. Les mots ratés reviennent au prochain défi.</p>`}<button class="wc-go" data-wc-start>Encore ${ROUND} mots</button><button class="wc-back" data-wc-exit>Retour</button></div>`;};
 const click=e=>{const b=e.target.closest('button');if(!b||!alive)return;
  if(b.hasAttribute('data-wc-start'))start();else if(b.hasAttribute('data-wc-exit'))onExit();
  else if(b.hasAttribute('data-wc-read')&&timer)hit(list[i]);
  else if(b.hasAttribute('data-wc-hear'))hear(list[i]);
  else if(b.hasAttribute('data-wc-next')){i++;next();}};
 box.addEventListener('click',click);intro();
 return {destroy(){alive=false;clear();box.removeEventListener('click',click);}};
}
