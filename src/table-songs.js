// Official player links only: no copied audio or lyrics, no third-party request before a click.
export const tableSongs=Object.freeze({2:'tbseH34CCno',3:'eEtHFttLJyo',4:'V08QMp1wkLI',5:'faP9QbHiXlM',6:'Cs1fEoWy5iA'});
export function tableFacts(table){if(!Number.isInteger(table)||table<1||table>10)throw new RangeError('Table invalide');return Array.from({length:11},(_,groups)=>({groups,table,total:groups*table}));}
export function tableRound(table,round=0){const facts=tableFacts(table);return [0,1,2].map(i=>facts[(round*3+i)%11]);}
export function mountTableSongs(root,profile,{save=()=>{}}={}){
 let table=3,groups=2,mode='explore',index=0,round=0,help=false,missed=false,solved=false,score=0,dead=false;
 const progress=profile.tableSongPractice&&typeof profile.tableSongPractice==='object'?profile.tableSongPractice:{};
 const stopVideo=()=>root.querySelector('[data-song-player]')?.replaceChildren();
 function draw(preserveSong=false){
  if(dead)return;
  const fact=mode==='quiz'?tableRound(table,round)[index]:tableFacts(table)[groups];
  const visible=mode!=='quiz'||help||solved;
  const markup=`<section class="table-island" aria-label="Tables en chansons"><header class="table-banner"><span aria-hidden="true">🏝️ 🎵</span><h1>Mon île des multiplications</h1><p>J’écoute, je compte, puis j’essaie.</p></header>
  <nav class="table-picker" aria-label="Choisir une table">${Array.from({length:10},(_,i)=>`<button data-table="${i+1}" aria-pressed="${table===i+1}">${i+1}</button>`).join('')}</nav>
  <p class="table-caption">Tables de 1 à 6 pour commencer · 7 à 10 pour aller plus loin avec ton parent.</p>
  <h2>Table de ${table}</h2>
  ${mode==='done'?`<div class="table-panel"><h3>Ta petite mission est terminée!</h3><p>${score} réponse${score>1?'s':''} sans aide sur 3. Chaque essai compte.</p><button data-replay>Trois autres calculs</button><button data-explore>Retour aux groupes</button></div>`:`
  ${mode==='explore'?`<div class="table-song"><h3>1. J’écoute</h3>${tableSongs[table]?`<button data-song>▶ Écouter la chanson de ${table}</button><div data-song-player></div><p class="table-caption">${table===2?'YourKid TV':table===6?'Un prof et sa guitare':'EspaceFrancais'} · lecteur YouTube externe, chargé seulement au toucher. <a href="https://www.youtube.com/watch?v=${tableSongs[table]}" target="_blank" rel="noopener noreferrer">Ouvrir la chanson si le lecteur ne fonctionne pas</a></p>`:'<p>La chanson de cette table n’est pas encore ajoutée. Tu peux déjà jouer avec les groupes!</p>'}</div>`:''}
  <div class="table-panel"><h3>${mode==='quiz'?`À toi! · Question ${index+1} sur 3`:'2. Je découvre les groupes'}</h3>
  <p class="table-equation">${fact.groups} × ${table} = ${visible?fact.total:'?'}</p>
  ${mode==='explore'?`<div class="table-controls"><button data-less ${groups===0?'disabled':''}>− Un groupe</button><button data-more ${groups===10?'disabled':''}>+ Un groupe</button></div>`:''}
  ${visible?`<p>${fact.groups} groupe${fact.groups>1?'s':''} de ${table} coquillage${table>1?'s':''}.</p><div class="shell-groups" aria-label="${fact.groups} groupes de ${table}">${Array.from({length:fact.groups},()=>`<div class="shell-group" aria-hidden="true">${'<span>🐚</span>'.repeat(table)}</div>`).join('')||'<p>Aucun groupe : zéro coquillage.</p>'}</div><p class="table-addition">${fact.groups?Array(fact.groups).fill(table).join(' + '):'0'} = ${fact.total}</p>`:''}
  ${mode==='quiz'?`<form data-answer><label for="table-answer">Combien de coquillages en tout?</label><input id="table-answer" name="answer" type="number" inputmode="numeric" min="0" max="100" step="1" required ${solved?'disabled':''}><button ${solved?'disabled':''}>Vérifier</button></form><button data-help ${solved?'disabled':''}>Voir les groupes</button><p role="status" data-feedback></p>${solved?'<button data-next>Continuer →</button>':''}`:'<button data-start>3. À moi de jouer · 3 questions</button>'}</div>`}
  <p class="table-caption">Pratique locale · ${Number.isSafeInteger(progress[table])?progress[table]:0} petite(s) mission(s) terminée(s). Écouter ne valide pas une table.</p></section>`;
  if(preserveSong){const template=document.createElement('template');template.innerHTML=markup;root.querySelector('.table-panel').replaceWith(template.content.querySelector('.table-panel'));}else root.innerHTML=markup;
  root.querySelectorAll('[data-table]').forEach(b=>b.onclick=()=>{stopVideo();table=Number(b.dataset.table);groups=2;mode='explore';round=0;draw();});
  const on=(selector,fn)=>{const el=root.querySelector(selector);if(el)el.onclick=fn;};
  on('[data-more]',()=>{groups++;draw(true);});on('[data-less]',()=>{groups--;draw(true);});
  on('[data-song]',()=>{const box=root.querySelector('[data-song-player]');if(box.firstChild){stopVideo();return;}const frame=document.createElement('iframe');frame.title=`Chanson de la table de ${table}`;frame.src=`https://www.youtube-nocookie.com/embed/${tableSongs[table]}?playsinline=1&rel=0`;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;box.append(frame);});
  const start=()=>{mode='quiz';index=0;score=0;help=false;missed=false;solved=false;draw();root.querySelector('input')?.focus();};
  on('[data-start]',start);on('[data-replay]',()=>{round++;start();});on('[data-explore]',()=>{mode='explore';draw();});
  on('[data-help]',()=>{help=true;draw();root.querySelector('input')?.focus();});
  const form=root.querySelector('[data-answer]');if(form)form.onsubmit=event=>{event.preventDefault();if(solved)return;const input=form.elements.answer;if(input.value===''||!input.checkValidity())return;const correct=Number(input.value)===fact.total;if(!correct){missed=true;root.querySelector('[data-feedback]').textContent='Pas encore. Essaie de nouveau ou regarde les groupes.';return;}solved=true;if(!help&&!missed)score++;draw();root.querySelector('[data-feedback]').textContent='Oui! Tu as trouvé. Continuons à ton rythme.';root.querySelector('[data-next]').focus();};
  on('[data-next]',()=>{if(!solved)return;index++;help=false;missed=false;solved=false;if(index===3){mode='done';progress[table]=(Number.isSafeInteger(progress[table])?progress[table]:0)+1;profile.tableSongPractice=progress;save();}draw();root.querySelector('input')?.focus();});
 }
 const visibility=()=>{if(document.hidden)stopVideo();};document.addEventListener('visibilitychange',visibility);draw();
 return {destroy(){dead=true;stopVideo();root.replaceChildren();document.removeEventListener('visibilitychange',visibility);}};
}
