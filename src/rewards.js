import {travelPoints} from './voyage.js';
// Récompenses de la famille : un parcours d'étapes (McDo, cinéma, sushi…) que les étoiles font avancer.
// Les étoiles sont celles du voyage : un exercice ne rapporte qu'une fois, et plus il est avancé plus il rapporte (5, 10 ou 15).
// Une étape atteinte reste « à remettre » jusqu'à ce qu'un parent confirme l'avoir donnée : l'application ne promet rien seule.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const DEFAULT_REWARDS=Object.freeze([
 {id:'r0',icon:'🍟',title:'McDo',cost:100},
 {id:'r1',icon:'🤸',title:'Parc de trampolines',cost:250},
 {id:'r2',icon:'🎬',title:'Cinéma',cost:400},
 {id:'r3',icon:'🍣',title:'Resto sushi',cost:600},
 {id:'r4',icon:'🎢',title:'Parc d’amusement',cost:1000},
 {id:'r5',icon:'🏨',title:'Fin de semaine à l’hôtel',cost:2000}
]);
export const MAX_REWARDS=8;
export function rewardState(p){return p.rewards??={list:null,claimed:{},base:0};}
export const rewardPoints=p=>Math.max(0,travelPoints(p)-(rewardState(p).base||0));
export const rewardList=p=>[...(rewardState(p).list??DEFAULT_REWARDS)].sort((a,b)=>a.cost-b.cost);
export function rewardStatus(p){
 const s=rewardState(p),points=rewardPoints(p),gifts=s.gifts||{};
 const raw=rewardList(p).map(r=>({...r,own:points>=r.cost,gift:gifts[r.id]?.from||''}));
 for(const [id,g] of Object.entries(gifts))if(!raw.some(r=>r.id===id))raw.push({id,icon:g.icon,title:g.title,cost:g.cost,own:false,gift:g.from});
 raw.sort((a,b)=>a.cost-b.cost);
 const items=raw.map(r=>({...r,reached:r.own||Boolean(r.gift),claimed:Boolean(s.claimed[r.id]),choice:s.choice?.[r.id]||'',missing:Math.max(0,r.cost-points)}));
 const next=items.find(r=>!r.reached)??null;
 const previous=next?items.filter(r=>r.reached).at(-1)?.cost??0:next?.cost??0;
 const percent=next?Math.round(100*(points-previous)/Math.max(1,next.cost-previous)):100;
 return {points,items,next,percent:Math.max(0,Math.min(100,percent)),waiting:items.filter(r=>r.reached&&!r.claimed).length};
}
// Seul un parent confirme : une étape non atteinte ou déjà remise ne change rien. Remettre une récompense utilise ses étoiles (elles sont retirées du total).
export function claimReward(p,id,now=new Date()){
 const r=rewardStatus(p).items.find(x=>x.id===id);if(!r||!r.reached||r.claimed)return false;
 const st=rewardState(p);st.claimed[id]=now.toISOString();if(r.own){st.base=(st.base||0)+r.cost;st.spent=(st.spent||0)+r.cost;}return true;
}
// Enregistre la liste modifiée par le parent (titres, icônes, coûts). Les lignes invalides sont ignorées.
export function saveRewards(p,rows){
 const s=rewardState(p),clean=[];
 for(const row of Array.isArray(rows)?rows.slice(0,MAX_REWARDS):[]){
  const title=String(row?.title??'').trim().slice(0,40),cost=Math.round(Number(row?.cost));
  if(!title||!Number.isFinite(cost)||cost<5||cost>100000)continue;
  clean.push({id:String(row.id||'').match(/^r\d{1,3}$/)?row.id:'r'+(100+clean.length),icon:String(row.icon||'🎁').trim().slice(0,4)||'🎁',title,cost});
 }
 if(!clean.length)return false;
 if(new Set(clean.map(r=>r.id)).size!==clean.length)clean.forEach((r,i)=>{r.id='r'+(200+i);});
 s.list=clean;for(const id of Object.keys(s.claimed))if(!clean.some(r=>r.id===id))delete s.claimed[id];
 return true;
}
// Nouveau parcours : on repart de zéro étoile sans effacer l'historique des réponses.
export function restartRewards(p){const s=rewardState(p);s.base=travelPoints(p);s.claimed={};s.celebrated={};s.choice={};s.gifts={};s.spent=0;return true;}
export function rewardsKid(p){
 const st=rewardStatus(p);
 const line=st.next?`Encore <b>${st.next.missing}</b> étoiles pour ${esc(st.next.icon)} ${esc(st.next.title)}`:'Tu as débloqué toutes les récompenses !';
 return `<section class="rewards-page" aria-labelledby="rewards-title"><h1 id="rewards-title">Mon coffre aux récompenses</h1>
 <div class="rewards-top"><div class="rewards-stars" aria-label="${st.points} étoiles"><span aria-hidden="true">⭐</span><b>${st.points}</b></div>
 <div class="rewards-bar"><div class="rewards-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.percent}"><i style="width:${st.percent}%"></i></div><p>${line}</p></div></div>
 <ul class="rewards-grid">${st.items.map(r=>`<li class="reward ${r.claimed?'got':r.reached?(r.choice==='save'?'kept':'ready'):'locked'}"><span class="reward-icon" aria-hidden="true">${esc(r.icon)}</span><b>${esc(r.title)}</b><small>${r.claimed?'Reçu ✓':r.reached?(r.choice==='save'?'Gagné ! Je garde mes étoiles 💎':r.choice==='now'?'Demandée ✓ Montre à un adulte':r.gift&&!r.own?`Cadeau de ${esc(r.gift)} 🎁 Montre à un adulte`:'Gagné ! Montre à un adulte'):`🔒 ${r.cost} ⭐`}</small></li>`).join('')}</ul></section>`;
}
export function rewardsParent(p){
 const st=rewardStatus(p),rows=rewardList(p);
 return `<section class="panel rewards-parent" data-parent-group="week"><h2>Récompenses de la famille</h2>
 <p>Les étoiles du voyage font avancer le parcours : un exercice ne rapporte qu’une seule fois (5 étoiles, 10 ou 15 pour les exercices plus avancés). ${esc(p.name)} a <strong>${st.points}</strong> étoiles. Choisis tes récompenses et leurs coûts. Une récompense gagnée par une fille est donnée aux deux filles. Quand tu confirmes « Remis », les étoiles de la fille qui l'a gagnée sont retirées de son total.</p>
 ${st.items.filter(r=>r.reached&&!r.claimed).map(r=>`<p class="rewards-waiting"><strong>${esc(r.icon)} ${esc(r.title)}</strong> est gagné ${r.gift&&!r.own?'— cadeau de '+esc(r.gift)+' ':''}${r.choice==='now'?'— ' +esc(p.name)+' la veut maintenant 🙋':r.choice==='save'?'— '+esc(p.name)+' garde ses étoiles pour la prochaine 💎':''}. <button type="button" data-reward-claim="${esc(r.id)}" data-cost="${r.cost}" data-title="${esc(r.title)}">Remis aux deux filles ✓ ${r.own?`(−${r.cost} ⭐)`:`(étoiles de ${esc(r.gift)})`}</button></p>`).join('')}
 <form id="rewards-form">${rows.map((r,i)=>`<p class="rewards-row"><input type="hidden" name="id${i}" value="${esc(r.id)}"><label>Icône<input name="icon${i}" maxlength="4" value="${esc(r.icon)}" size="3"></label><label>Récompense<input name="title${i}" maxlength="40" value="${esc(r.title)}"></label><label>Étoiles<input name="cost${i}" type="number" min="5" max="100000" step="5" value="${r.cost}"></label></p>`).join('')}
 ${rows.length<MAX_REWARDS?`<p class="rewards-row"><label>Icône<input name="icon${rows.length}" maxlength="4" size="3" placeholder="🎁"></label><label>Nouvelle récompense<input name="title${rows.length}" maxlength="40"></label><label>Étoiles<input name="cost${rows.length}" type="number" min="5" max="100000" step="5"></label></p>`:''}
 <button>Enregistrer les récompenses</button></form>
 <button type="button" data-reward-restart>Nouveau parcours (repartir à 0 étoile)</button><p class="small" data-rewards-status role="status"></p></section>`;
}
// Relit le formulaire du parent.
export function rowsFromForm(form){
 const rows=[];for(let i=0;i<=MAX_REWARDS;i++){if(!form.has('title'+i))continue;rows.push({id:form.get('id'+i)||'',icon:form.get('icon'+i),title:form.get('title'+i),cost:form.get('cost'+i)});}
 return rows;
}

// Fête de la récompense : quand une étape est atteinte pour la première fois, une grande ouverture s'affiche une seule fois.
// L'ambiance grandit avec le niveau de la récompense (1 à 3) et avec les étoiles gagnées; la fille choisit de la prendre ou de garder ses étoiles.
export const pendingCelebration=p=>{const s=rewardState(p),c=s.celebrated??{};return rewardStatus(p).items.filter(r=>r.reached&&!r.claimed&&!c[r.id]).at(-1)??null;};
export function markCelebrated(p,id){const s=rewardState(p),c=(s.celebrated??={});c[id]=true;for(const r of rewardStatus(p).items)if(r.cost<=(rewardStatus(p).items.find(x=>x.id===id)?.cost??0))c[r.id]=true;}
export function tierFor(p,id){const list=rewardStatus(p).items,i=list.findIndex(r=>r.id===id);return i<0?1:Math.min(3,1+Math.floor(i*3/Math.max(1,list.length)));}
export function nextReward(p,id){const st=rewardStatus(p),i=st.items.findIndex(r=>r.id===id);return i>=0&&st.items[i+1]?st.items[i+1]:null;}
// Choix de la fille : « now » = je la veux maintenant (le parent le voit); « save » = je garde mes étoiles pour la prochaine. Les étoiles ne sont jamais dépensées.
export function chooseReward(p,id,choice){if(!['now','save'].includes(choice)||!rewardStatus(p).items.some(r=>r.id===id))return false;(rewardState(p).choice??={})[id]=choice;return true;}
const CONFETTI={1:['🎉','⭐','✨','🎈','💖','🌟','🎊','🦄','🌈','🎀','⭐','✨'],2:['🎉','⭐','✨','🎈','💖','🌟','🎊','🦄','🌈','🎀','⭐','✨','🏆','💛','🎁','🪙'],3:['🎉','⭐','✨','🎈','💖','🌟','🎊','🦄','🌈','🎀','⭐','✨','🏆','💛','🎁','👑','💎','🎆','🎇','🥳']};
const BURSTS=[{x:16,y:14,c:'#ff5fa2',d:0},{x:82,y:12,c:'#ffd34f',d:.8},{x:48,y:24,c:'#7be0ff',d:1.6},{x:26,y:34,c:'#b6ff7a',d:2.2},{x:72,y:32,c:'#ff9f43',d:.4},{x:58,y:9,c:'#c58bff',d:1.2},{x:8,y:28,c:'#ffd34f',d:2.8},{x:92,y:27,c:'#ff5fa2',d:1.9}];
const PLANE='<svg class="rp-plane-svg" viewBox="0 0 124 52" width="124" height="52" focusable="false"><path d="M14 20 L3 4 L26 15Z" fill="#ff5fa2" stroke="#24163f" stroke-width="3" stroke-linejoin="round"/><path d="M9 26 Q11 16 26 16 L90 18 Q114 21 118 27 Q114 33 90 34 L26 35 Q11 35 9 26Z" fill="#fff" stroke="#24163f" stroke-width="3" stroke-linejoin="round"/><path d="M52 32 L36 49 L68 49 L78 33Z" fill="#7452a8" stroke="#24163f" stroke-width="3" stroke-linejoin="round"/><circle cx="46" cy="25" r="4" fill="#7be0ff" stroke="#24163f" stroke-width="2"/><circle cx="62" cy="25" r="4" fill="#7be0ff" stroke="#24163f" stroke-width="2"/><circle cx="78" cy="25" r="4" fill="#7be0ff" stroke="#24163f" stroke-width="2"/><path d="M118 20 L122 34" stroke="#24163f" stroke-width="3" stroke-linecap="round"/></svg>';
export function celebrationMarkup(reward,name='toi',{points=0,next=null,tier=1,lower=[],names=null,gift=''}={}){
 const who=names&&names.length?names:[name];
 const t=Math.max(1,Math.min(3,tier|0||1)),conf=CONFETTI[t].map((c,i)=>`<span class="rp-c rp-c${(i%12)+1}" style="--i:${i}">${c}</span>`).join('');
 const bursts=BURSTS.slice(0,t===1?3:t===2?5:8).map(b=>`<i class="rp-burst" style="left:${b.x}%;top:${b.y}%;--c:${b.c};--d:${b.d}s"></i>`).join('');
 const title=gift?`🎁 Un cadeau de ${esc(gift)}! 🎁`:t===3?'🏆 Super récompense! 🏆':t===2?'🎊 Récompense obtenue! 🎊':'🎉 Récompense obtenue! 🎉';
 const plane=`<div class="rp-plane" aria-hidden="true"><div class="rp-banner"><span>${gift?`Cadeau de ${esc(gift)} pour ${esc(name)}!`:`Félicitations ${who.map(esc).join(' et ')}!`}</span></div>${PLANE}</div>`;
 const smaller=lower.length?`<p class="rp-sub">Ou une plus petite :</p><div class="rp-lower">${lower.map(l=>`<button type="button" data-party-pick="${esc(l.id)}"><span aria-hidden="true">${esc(l.icon)}</span> ${esc(l.title)}<small>−${l.cost} ⭐</small></button>`).join('')}</div>`:'';
 const both=gift?`<p class="rp-both">💖 Ta sœur ${esc(gift)} t'offre cette récompense. Dis-lui merci!</p>`:who.length>1?`<p class="rp-both">🎁 Tu offres aussi cette récompense à ${who.slice(1).map(esc).join(' et ')}!</p>`:'';
 let question;
 if(!gift&&(next||lower.length)){
  question=`<p class="rp-ask">${next?`Prends-la, ou garde tes étoiles pour <b>${esc(next.icon)} ${esc(next.title)}</b> (encore ${next.missing} ⭐). Une récompense prise utilise ses étoiles.`:'Prends-la maintenant. Une récompense prise utilise ses étoiles.'}</p><div class="rp-actions"><button type="button" class="rp-go" data-party-now>🎁 Je prends ${esc(reward.icon)} ${esc(reward.title)} <small>−${reward.cost} ⭐</small></button>${next?'<button type="button" class="rp-chest" data-party-save>💎 Je garde mes étoiles</button>':''}</div>${smaller}<button type="button" class="rp-later" data-party-later>Plus tard</button>`;
 }else{
  question=`<div class="rp-actions"><button type="button" class="rp-go" data-party-close>Super!</button><button type="button" class="rp-chest" data-party-chest>⭐ Voir mon coffre</button></div>`;
 }
 return `<div class="reward-party rp-t${t}" role="dialog" aria-modal="true" aria-label="Récompense obtenue. Félicitations ${who.map(esc).join(' et ')}"><img class="rp-photo" src="/icons/voyage-soeurs.webp" alt="" width="1672" height="941"><div class="rp-intro" aria-hidden="true"><div class="rp-box">🎁</div><div class="rp-halo"></div></div><div class="rp-flash" aria-hidden="true"></div><div class="rp-glow" aria-hidden="true"></div><div class="rp-rays" aria-hidden="true"></div><div class="rp-fireworks" aria-hidden="true">${bursts}</div><div class="rp-trail" aria-hidden="true"></div>${plane}<div class="rp-confetti" aria-hidden="true">${conf}</div><div class="rp-card"><h1>${title}</h1><div class="rp-row"><div class="rp-icon" aria-hidden="true">${esc(reward.icon)}</div><div class="rp-who"><h2>${esc(reward.title)}</h2>${gift?`<div class="rp-stars rp-giftline">🎁 Pour toi!</div>`:`<div class="rp-stars" aria-label="${points} étoiles">⭐ <b data-party-count="${points}">${points}</b> étoiles</div>`}</div></div>${both}${question}</div></div>`;
}

// Récompenses partagées : ce qu'une fille gagne est donné aux deux filles. La sœur reçoit un « cadeau » (sans dépenser ses étoiles);
// les étoiles sont retirées seulement à la fille qui l'a gagnée, quand le parent confirme « Remis ».
export function syncGifts(profiles){
 let changed=false;
 for(const b of profiles){const sb=rewardState(b);for(const [id,g] of Object.entries(sb.gifts||{})){
  const giver=profiles.find(x=>x!==b&&x.name===g.from),ok=giver&&rewardStatus(giver).items.find(x=>x.id===id&&x.own&&!x.claimed);
  if(!ok||sb.claimed[id]){delete sb.gifts[id];changed=true;}}}
 for(const a of profiles)for(const b of profiles){if(a===b)continue;
  for(const r of rewardStatus(a).items){if(!r.own||r.claimed)continue;
   const sb=rewardState(b);if(sb.claimed[r.id]||sb.gifts?.[r.id])continue;
   if(rewardStatus(b).items.find(x=>x.id===r.id)?.own)continue;
   (sb.gifts??={})[r.id]={from:a.name,icon:r.icon,title:r.title,cost:r.cost};changed=true;}}
 return changed;
}
// Qui paie les étoiles : la fille qui a gagné la récompense (celle sur laquelle on clique, sinon sa sœur).
export function ownerOf(profiles,clicked,id){
 const mine=rewardStatus(clicked).items.find(x=>x.id===id);if(!mine||!mine.reached||mine.claimed)return null;
 if(mine.own)return clicked;
 return profiles.find(o=>o!==clicked&&rewardStatus(o).items.find(x=>x.id===id&&x.own&&!x.claimed))||null;
}
export function giveReward(profiles,clicked,id,now=new Date()){
 const owner=ownerOf(profiles,clicked,id);if(!owner||!claimReward(owner,id,now))return null;
 for(const o of profiles)if(o!==owner){const so=rewardState(o);so.claimed[id]=now.toISOString();if(so.gifts)delete so.gifts[id];}
 return owner;
}
