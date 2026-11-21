// Roue des surprises : un rouleau de machine à sous qui choisit une activité (ou un lien d'école) et y entre.
// Elle lit les vraies tuiles de l'écran de la fille : rien n'est inventé ni dupliqué.
import {startWheelSound,SPIN_EASE} from './wheel-sound.js';
import {partyMuted,setPartyMuted} from './party-sound.js';
const CATS=[['all','🎲','Tout'],['hub-read','📖','Lire et écrire'],['hub-math','🔢','Les maths'],['hub-play','🎵','Écouter'],['hub-other','🌍','Autres matières'],['hub-school','🏫','École']];
const DESC={'Les sons':'Écoute chaque son et découvre ses lettres.','Mes cartes de sons':'Toutes les cartes de sons à toucher et à écouter.','Les syllabes':'Assemble des syllabes pour lire des mots.','Je lis':'De petites histoires à lire à voix haute.','Dictée magique':'Regarde le mot, il disparaît, écris-le avec ton crayon.','Défi 3 secondes':'Lis le mot avant la fin des 3 secondes !','Histoires de l’école':'Les histoires du livre de l’école.','Mon carnet de trucs':'Les trucs secrets que tu as découverts.','Mes mots':'Ton vocabulaire et ton orthographe.','Les histoires':'Lire et comprendre des histoires.','Sons et syllabes':'Assembler les sons et relire.','Pourquoi ça s’écrit?':'Les mystères de l’orthographe, un à la fois.','Les nombres':'Compter, lire et écrire les nombres.','Les calculs':'Ajouter, enlever et grouper.','Défi vitesse':'Des cartes de calcul, à ta vitesse.','Lire un nombre avec la maîtresse':'Lis un nombre à voix haute avec la maîtresse.','Mes mini-défis':'Petits jeux de maths dans le jardin.','Mes tables':'Les tables de la semaine.','Bonds de nombres':'Saute de 2 en 2, de 5 en 5, de 10 en 10.','Tables en chansons':'Écoute, compte et joue avec les tables.','Mon Pop-it':'Appuie et cherche les bons nombres.','Chansons':'Des chansons pour apprendre en s’amusant.','Vidéos et défis':'Des vidéos et de petits défis.','Un prof et sa guitare':'Un prof qui chante et joue de la guitare.','Maître Lucas':'Des leçons avec Maître Lucas.','Notre voyage':'La carte de notre voyage.','Mon archipel Squishy':'12 compagnons à découvrir.','Mon coffre':'Tes récompenses et tes étoiles.','Météormath 2':'Un jeu de calcul d’Alloprof (nouvel onglet).','MaZone CEC':'Tes exercices scolaires (nouvel onglet).','Voca · mes mots':'Ta liste de vocabulaire (nouvel onglet).','Nougat · mon livre':'Ton livre de maths (nouvel onglet).','Mémoire des nombres':'Des jeux de cartes pour retenir les doubles et les compléments de 10.','Anglais':'Écoute, répète et réponds en anglais.','Histoire':'Découvre le passé, une leçon à la fois.','Sciences':'Observe, comprends, expérimente.'};
const TEXT={'hub-read':'Lire et écrire','hub-math':'Les maths','hub-play':'Écouter et découvrir','hub-other':'Autres matières','hub-school':'Jeux de l’école'};
const H=86,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const wheelMarkup=who=>`<section class="hub-wheel wh-${who}" data-wheel aria-label="Ma roue des surprises"></section>`;
export function pickTarget(pool,rnd=Math.random){return pool.length?Math.floor(rnd()*pool.length):-1;}
export function buildStrip(pool,target,rnd=Math.random,min=26){
 const strip=[];
 while(strip.length<min){const block=pool.map((_,i)=>i).sort(()=>rnd()-.5);if(strip.length&&pool.length>1&&block[0]===strip.at(-1))block.push(block.shift());strip.push(...block);}
 const land=strip.length-3;strip[land]=target;
 // Jamais deux fois la même activité côte à côte autour de l'arrêt.
 if(pool.length>2)for(const k of [land-1,land+1])if(strip[k]===target)strip[k]=[...pool.keys()].find(i=>i!==target&&i!==strip[k-1]&&i!==strip[k+1]);
 return {strip,land};
}
export function mountWheel(root,{who=0}={}){
 const box=root.querySelector('[data-wheel]');if(!box)return {destroy(){}};
 const entries=[...root.querySelectorAll('.child-hub .hub-tile')].map(el=>({el,cat:[...el.closest('.hub-sec').classList].find(c=>c!=='hub-sec'),label:el.querySelector('strong').textContent.trim(),art:el.querySelector('.hub-art').innerHTML}));
 let cat='all',busy=false,picked=null,timer=null,alive=true,snd=null,raf=0;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pool=()=>entries.filter(e=>cat==='all'||e.cat===cat);
 const item=e=>`<div class="wh-item" style="height:${H}px"><span class="wh-art" aria-hidden="true">${e.art}</span><b>${esc(e.label)}</b></div>`;
 const shell=()=>{box.innerHTML=`<div class="wh-head"><button type="button" class="wh-sound" data-wh-sound aria-pressed="${!partyMuted()}" aria-label="Sons de la roue">${partyMuted()?'🔇':'🔊'}</button><h2>${who?'🦄':'🦋'} Ma roue des surprises</h2><p>Choisis une matière, tourne la roue et va où elle s’arrête !</p></div><div class="wh-body"><div class="wh-cats" role="group" aria-label="Choisir la matière">${CATS.map(([k,i,t])=>`<button type="button" data-wh-cat="${k}" aria-pressed="${k===cat}"><span aria-hidden="true">${i}</span> ${t}</button>`).join('')}</div><div class="wh-machine"><div class="wh-window" aria-hidden="true"><div class="wh-strip"></div><div class="wh-frame"></div><div class="wh-shade"></div></div><button type="button" class="wh-spin" data-wh-spin>🎰 Tourne !</button></div><div class="wh-preview" aria-live="polite"></div></div>`;idle();};
 const strip=()=>box.querySelector('.wh-strip'),prev=()=>box.querySelector('.wh-preview');
 const idle=()=>{const p=pool();strip().style.transition='none';strip().innerHTML=p.concat(p).slice(0,6).map(item).join('');strip().style.transform='translate3d(0,0,0)';
  prev().innerHTML=`<div class="wh-hint"><span aria-hidden="true">🎰</span><b>Appuie sur « Tourne ! »</b><small>${p.length} activités t’attendent.</small></div>`;};
 const show=e=>{picked=e;prev().innerHTML=`<div class="wh-card"><span class="wh-big" aria-hidden="true">${e.art}</span><small>${esc(TEXT[e.cat]||'')}</small><strong>${esc(e.label)}</strong><p>${esc(DESC[e.label]||'Une activité pour toi !')}</p><div class="wh-actions"><button type="button" class="wh-go" data-wh-go>Y aller !</button><button type="button" class="wh-again" data-wh-spin>Encore</button></div></div>`;busy=false;box.classList.remove('wh-spinning');};
 // Le rouleau est dessiné image par image (pas de transition CSS : Safari laissait parfois le rouleau vide), puis, à l'arrêt, on ne garde que les 3 cases visibles.
 const settle=(p,s,land,t)=>{if(!busy)return;cancelAnimationFrame(raf);clearTimeout(timer);const st=strip();st.style.transition='none';st.style.transform='translate3d(0,0,0)';st.innerHTML=[s[land-1],s[land],s[land+1]].map(i=>item(p[i])).join('');show(p[t]);};
 const spin=()=>{if(busy)return;const p=pool();if(!p.length)return;busy=true;box.classList.add('wh-spinning');prev().innerHTML='<div class="wh-hint"><span aria-hidden="true">🎶</span><b>La roue tourne…</b></div>';
  const t=pickTarget(p),{strip:s,land}=buildStrip(p,t);snd?.stop();snd=startWheelSound({count:reduce?0:land-1,seconds:reduce?0:3.4});const st=strip();st.innerHTML=s.map(i=>item(p[i])).join('');
  if(reduce){st.style.transform=`translate3d(0,${-(land-1)*H}px,0)`;return settle(p,s,land,t);}
  const T=3400,start=performance.now(),dist=(land-1)*H;st.style.transition='none';st.style.transform='translate3d(0,0,0)';
  const tick=now=>{if(!alive||!busy)return;const x=Math.min(1,(now-start)/T);st.style.transform=`translate3d(0,${-dist*SPIN_EASE(x)}px,0)`;if(x<1)raf=requestAnimationFrame(tick);else settle(p,s,land,t);};
  raf=requestAnimationFrame(tick);clearTimeout(timer);timer=setTimeout(()=>{if(alive)settle(p,s,land,t);},T+700);};
 const click=e=>{const b=e.target.closest('button');if(!b||!alive)return;
  if(b.dataset.whCat&&!busy){cat=b.dataset.whCat;picked=null;shell();}
  else if(b.hasAttribute('data-wh-spin'))spin();
  else if(b.hasAttribute('data-wh-sound')){setPartyMuted(!partyMuted());b.textContent=partyMuted()?'🔇':'🔊';b.setAttribute('aria-pressed',String(!partyMuted()));}
  else if(b.hasAttribute('data-wh-go')&&picked){snd?.stop();picked.el.click();}};
 box.addEventListener('click',click);shell();
 return {destroy(){alive=false;cancelAnimationFrame(raf);clearTimeout(timer);snd?.stop();box.removeEventListener('click',click);}};
}
