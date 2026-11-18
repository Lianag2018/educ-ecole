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
 const s=rewardState(p),points=rewardPoints(p);
 const items=rewardList(p).map(r=>({...r,reached:points>=r.cost,claimed:Boolean(s.claimed[r.id]),missing:Math.max(0,r.cost-points)}));
 const next=items.find(r=>!r.reached)??null;
 const previous=next?items.filter(r=>r.reached).at(-1)?.cost??0:next?.cost??0;
 const percent=next?Math.round(100*(points-previous)/Math.max(1,next.cost-previous)):100;
 return {points,items,next,percent:Math.max(0,Math.min(100,percent)),waiting:items.filter(r=>r.reached&&!r.claimed).length};
}
// Seul un parent confirme : une étape non atteinte ou déjà remise ne change rien.
export function claimReward(p,id,now=new Date()){
 const r=rewardStatus(p).items.find(x=>x.id===id);if(!r||!r.reached||r.claimed)return false;
 rewardState(p).claimed[id]=now.toISOString();return true;
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
export function restartRewards(p){const s=rewardState(p);s.base=travelPoints(p);s.claimed={};return true;}
export function rewardsKid(p){
 const st=rewardStatus(p);
 const line=st.next?`Encore <b>${st.next.missing}</b> étoiles pour ${esc(st.next.icon)} ${esc(st.next.title)}`:'Tu as débloqué toutes les récompenses !';
 return `<section class="rewards-page" aria-labelledby="rewards-title"><h1 id="rewards-title">Mon coffre aux récompenses</h1>
 <div class="rewards-top"><div class="rewards-stars" aria-label="${st.points} étoiles"><span aria-hidden="true">⭐</span><b>${st.points}</b></div>
 <div class="rewards-bar"><div class="rewards-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.percent}"><i style="width:${st.percent}%"></i></div><p>${line}</p></div></div>
 <ul class="rewards-grid">${st.items.map(r=>`<li class="reward ${r.claimed?'got':r.reached?'ready':'locked'}"><span class="reward-icon" aria-hidden="true">${esc(r.icon)}</span><b>${esc(r.title)}</b><small>${r.claimed?'Reçu ✓':r.reached?'Gagné ! Montre à un adulte':`🔒 ${r.cost} ⭐`}</small></li>`).join('')}</ul></section>`;
}
export function rewardsParent(p){
 const st=rewardStatus(p),rows=rewardList(p);
 return `<section class="panel rewards-parent" data-parent-group="week"><h2>Récompenses de la famille</h2>
 <p>Les étoiles du voyage font avancer le parcours : un exercice ne rapporte qu’une seule fois (5 étoiles, 10 ou 15 pour les exercices plus avancés). ${esc(p.name)} a <strong>${st.points}</strong> étoiles. Choisis tes récompenses et leurs coûts; confirme chaque fois que tu en remets une.</p>
 ${st.items.filter(r=>r.reached&&!r.claimed).map(r=>`<p class="rewards-waiting"><strong>${esc(r.icon)} ${esc(r.title)}</strong> est gagné. <button type="button" data-reward-claim="${esc(r.id)}">Remis à ${esc(p.name)} ✓</button></p>`).join('')}
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
