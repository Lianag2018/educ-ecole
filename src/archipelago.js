import {islands,landmarks,coconuts,collectCoconuts,archipelagoState,positionFor,moveExplorer,landPosition,walkToward,islandRoute} from './archipelago-model.js';
import {childName} from './worlds.js';
import {travelPoints} from './voyage.js';
import {escapePlan as e} from './school-plan.js';

export function archipelagoHome(p,day){
 const s=archipelagoState(p),island=islands.find(i=>i.id===s.destination),route=islandRoute(p,island.id,day);
 return `<section class="archipelago" data-archipelago aria-labelledby="archipelago-title">
  <div class="archipelago-heading"><div><span class="archipelago-kicker">LE VOYAGE DES DEUX SŒURS</span><h1 id="archipelago-title">Les îles aux trésors</h1><p>${e(childName(p))}, choisis ton escale et pars explorer!</p></div><div class="archipelago-score">✦ ${travelPoints(p)} <small>étoiles</small></div></div>
  <nav class="archipelago-islands" aria-label="Choisir une destination">${islands.map(i=>`<button data-island-go="${i.id}" ${i.id===island.id?'aria-current="location"':''}><span aria-hidden="true">${i.icon}</span><span>${i.name}</span></button>`).join('')}</nav>
  <div class="archipelago-world">
   <div class="archipelago-scene-head"><div><span>ESCALE ${islands.indexOf(island)+1} / 4</span><h2>${island.name}</h2><p>${island.detail}</p></div><button data-island-pause aria-pressed="${!!s.quiet}" aria-label="Mettre l’exploration en pause">${s.quiet?'▶ Reprendre':'Ⅱ Pause'}</button></div>
   <div class="archipelago-stage" tabindex="0" role="group" aria-label="Explorer ${island.name}. Touche le sable pour marcher, ou utilise les flèches du clavier." aria-describedby="archipelago-controls">
    <div class="archipelago-land" aria-hidden="true"></div><div class="archipelago-sea-glow" aria-hidden="true"></div>
    ${landmarks.map((m,n)=>`<button class="archipelago-marker ${route.explored.includes(n)?'explored':''}" data-island-landmark="${n}" aria-label="Aller à ${m.name.toLowerCase()} : défi ${n+1}${route.explored.includes(n)?', déjà exploré':''}"><span aria-hidden="true">${m.icon}</span><b>${n+1}</b></button>`).join('')}
    ${coconuts.map((c,n)=>`<button class="archipelago-coconut" data-coconut="${n}" aria-label="Ramasser la noix de coco ${n+1}" ${s.baskets[island.id]?.includes(n)?'hidden':''}>🥥</button>`).join('')}
    <span class="archipelago-basket" aria-label="Souvenirs ramassés">🧺 <b data-coconut-count>${s.baskets[island.id]?.length||0}</b> / 5</span>
    <div class="archipelago-target" aria-hidden="true" hidden></div>
    <div class="archipelago-girl girl-p1" aria-hidden="true"><div class="girl-shadow"></div><div class="girl-sprite"></div></div>
    <div class="archipelago-girl girl-p2" aria-hidden="true"><div class="girl-shadow"></div><div class="girl-sprite"></div></div>
    <span class="archipelago-active-name">${e(childName(p))}</span>
   </div>
   <div class="archipelago-playbar"><p id="archipelago-controls">Touche le sable pour marcher.<br><span>Va vers un trésor pour découvrir son défi.</span></p><div class="archipelago-dpad" role="group" aria-label="Déplacer les personnages"><button data-walk="up" aria-label="Monter">↑</button><button data-walk="left" aria-label="Aller à gauche">←</button><button data-walk="down" aria-label="Descendre">↓</button><button data-walk="right" aria-label="Aller à droite">→</button></div></div>
   <p class="archipelago-status" role="status" aria-live="polite">${s.quiet?'Exploration en pause.':'Les deux sœurs sont prêtes à explorer.'}</p>
   <div class="archipelago-quest" hidden></div>
  </div>
  <section class="archipelago-passport" aria-label="Les missions de cette escale"><div><h2>Trois trésors à découvrir</h2><p>${route.fromPlan?'Tes devoirs de la semaine font partie de cette escale.':'Des découvertes à ton niveau.'}</p></div><strong>${route.explored.length} / 3 <small>défis explorés</small></strong><div class="archipelago-stops">${landmarks.map((m,n)=>`<button data-island-shortcut="${n}"><span aria-hidden="true">${route.explored.includes(n)?'✓':m.icon}</span><span>${m.name}<small>${e(route.items[n]?.travelSubject||'Découverte')}</small></span><b>→</b></button>`).join('')}</div></section>
  <details class="archipelago-notes"><summary>Avec un parent · Les activités de ce voyage</summary><p>Les escales sont des décors imaginaires inspirés des destinations, pas une carte géographique. Le Mexique est représenté par sa côte des Caraïbes. Les missions reprennent les activités de ce profil et son plan de la semaine lorsqu’il est disponible. L’exploration des décors n’ajoute aucun résultat scolaire.</p>${route.unsupported?'<p>Certains éléments du plan demandent encore un complément dans l’espace parent.</p>':''}<p>Les noix de coco sont des souvenirs à collectionner, sans points scolaires. Les positions et les escales se conservent sur cet appareil. Les réponses utilisent le suivi habituel. Les photos envoyées dans une conversation ne sont pas transférées automatiquement au jeu.</p><button data-action="school-plan">Voir le plan de travail</button> <button data-action="adventure">Retrouver nos histoires</button></details>
 </section>`;
}

export function mountArchipelago(root,p,{day,save,onIsland,onMission}={}){
 if(!root)return null;
 const controller=new AbortController(),{signal}=controller,s=archipelagoState(p),id=s.destination,route=islandRoute(p,id,day);
 const stage=root.querySelector('.archipelago-stage'),status=root.querySelector('.archipelago-status'),quest=root.querySelector('.archipelago-quest');
 stage.style.setProperty('--island-position',islands.find(i=>i.id===id).position);
 root.querySelectorAll('[data-island-landmark]').forEach(b=>{const m=landmarks[Number(b.dataset.islandLandmark)];b.style.left=m.x+'%';b.style.top=m.y+'%';});
 root.querySelectorAll('[data-coconut]').forEach(b=>{const c=coconuts[Number(b.dataset.coconut)];b.style.left=c.x+'%';b.style.top=c.y+'%';});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),girls=[...root.querySelectorAll('.archipelago-girl')],name=root.querySelector('.archipelago-active-name'),targetMarker=root.querySelector('.archipelago-target');
 let position=positionFor(p,id),target=null,queued=null,frame=0,last=0,elapsed=0,paused=!!s.quiet,destroyed=false,dirty=false,facing=1;
 const keys=new Set(),directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},keyDirections={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right',z:'up',q:'left'};
 const listen=(element,type,fn,options={})=>element.addEventListener(type,fn,{...options,signal});
 function store(){if(dirty){moveExplorer(p,id,position);save?.();dirty=false;}}
 function collect(){
  const found=collectCoconuts(p,id,position);
  if(found.length){found.forEach(n=>{root.querySelector(`[data-coconut="${n}"]`).hidden=true;});root.querySelector('[data-coconut-count]').textContent=s.baskets[id].length;status.textContent=s.baskets[id].length===5?'Ton panier de souvenirs est rempli!':'Une noix de coco dans ton panier!';dirty=true;}
 }
 function paint(moving=false){
  const spriteFrame=moving&&!reduced.matches?Math.floor(elapsed/130)%4:1;
  girls.forEach((girl,n)=>{
   const lead=(p.id==='p1'?0:1)===n,point=lead?position:landPosition(position.x-6*facing,position.y+3);
   girl.style.left=point.x+'%';girl.style.top=point.y+'%';girl.style.zIndex=String(Math.round(point.y)+10);
   girl.querySelector('.girl-sprite').style.backgroundPosition=`${spriteFrame*100/3}% ${n*100}%`;
   girl.querySelector('.girl-sprite').style.transform=`scaleX(${facing})`;
  });
  name.style.left=position.x+'%';name.style.top=position.y+'%';
  stage.dataset.x=position.x.toFixed(2);stage.dataset.y=position.y.toFixed(2);
  stage.dataset.moving=String(moving);stage.dataset.paused=String(paused);
 }
 function stop({remember=true}={}){cancelAnimationFrame(frame);frame=0;last=0;target=null;queued=null;keys.clear();targetMarker.hidden=true;paint();if(remember)store();}
 function showQuest(n){
  const q=route.items[n];if(!q)return;
  quest.hidden=false;quest.innerHTML=`<span class="archipelago-quest-icon" aria-hidden="true">${landmarks[n].icon}</span><div><small>DÉFI ${n+1} · ${e(q.travelSubject)}</small><h3>${e(q.title||landmarks[n].name)}</h3><p>${e(q.archipelagoSource==='plan'?'Un défi de ton plan de travail.':'Un petit défi à ton niveau.')}</p></div><button class="primary" data-quest-start>Jouer →</button><button class="archipelago-quest-close" aria-label="Continuer à explorer">×</button>`;
  status.textContent=`${landmarks[n].name} découvert! Ton défi est prêt.`;
  quest.querySelector('[data-quest-start]').onclick=()=>{stop();onMission?.({profileId:p.id,island:id,revision:route.revision,slot:n},q);};
  quest.querySelector('.archipelago-quest-close').onclick=()=>{quest.hidden=true;stage.focus({preventScroll:true});};
 }
 function tick(time){
  frame=0;if(destroyed||paused||document.hidden)return stop();
  const dt=last?Math.min((time-last)/1000,0.05):0.016;last=time;elapsed+=dt*1000;
  let goal=target;
  if(keys.size){let dx=0,dy=0;for(const k of keys){dx+=directions[k][0];dy+=directions[k][1];}goal={x:position.x+dx*10,y:position.y+dy*10};}
  if(!goal)return stop();
  const old=position;position=walkToward(position,goal,dt);const moved=Math.hypot(position.x-old.x,position.y-old.y)>0.001;
  if(position.x!==old.x)facing=position.x>old.x?1:-1;
  dirty ||= moved;collect();paint(moved);
  if(target&&Math.hypot(position.x-target.x,position.y-target.y)<0.15){const arrival=queued;stop();if(arrival!==null)showQuest(arrival);return;}
  if(!moved&&!target)return stop();
  frame=requestAnimationFrame(tick);
 }
 function start(){if(!frame&&!paused&&!document.hidden&&!destroyed)frame=requestAnimationFrame(tick);}
 function go(point,n=null){
  if(paused){status.textContent='Touche Reprendre pour continuer.';return;}
  stop();quest.hidden=true;target=landPosition(point.x,point.y);queued=n;
  targetMarker.hidden=false;targetMarker.style.left=target.x+'%';targetMarker.style.top=target.y+'%';
  status.textContent=n===null?'En route!':`En route vers ${landmarks[n].name.toLowerCase()}…`;
  if(reduced.matches){position=target;dirty=true;collect();const arrival=queued;stop();if(arrival!==null)showQuest(arrival);}else start();
 }
 listen(stage,'pointerdown',event=>{
  if(event.target.closest('button')||event.button>0)return;
  const rect=stage.getBoundingClientRect();stage.focus({preventScroll:true});
  go({x:(event.clientX-rect.left)/rect.width*100,y:(event.clientY-rect.top)/rect.height*100});
 });
 root.querySelectorAll('[data-island-landmark],[data-island-shortcut]').forEach(button=>listen(button,'click',()=>{const n=Number(button.dataset.islandLandmark??button.dataset.islandShortcut);go(landmarks[n],n);}));
 root.querySelectorAll('[data-island-go]').forEach(button=>listen(button,'click',()=>{if(button.dataset.islandGo===id)return;stop();s.destination=button.dataset.islandGo;save?.();onIsland?.();}));
 const pauseButton=root.querySelector('[data-island-pause]');
 listen(pauseButton,'click',()=>{paused=!paused;s.quiet=paused;stop();save?.();pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'Reprendre l’exploration':'Mettre l’exploration en pause');pauseButton.textContent=paused?'▶ Reprendre':'Ⅱ Pause';status.textContent=paused?'Exploration en pause.':'À toi de choisir le chemin.';});
 root.querySelectorAll('[data-coconut]').forEach(button=>listen(button,'click',()=>go(coconuts[Number(button.dataset.coconut)])));
 function press(direction){
  if(paused)return;quest.hidden=true;target=null;queued=null;targetMarker.hidden=true;
  if(reduced.matches){position=landPosition(position.x+directions[direction][0]*3,position.y+directions[direction][1]*3);dirty=true;collect();paint();store();return;}
  keys.add(direction);start();
 }
 root.querySelectorAll('[data-walk]').forEach(button=>{
  listen(button,'pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);press(button.dataset.walk);});
  const release=()=>{keys.delete(button.dataset.walk);if(!keys.size)stop();};
  listen(button,'pointerup',release);listen(button,'pointercancel',release);listen(button,'lostpointercapture',release);
  listen(button,'click',event=>{if(event.detail===0){const direction=button.dataset.walk;go({x:position.x+directions[direction][0]*7,y:position.y+directions[direction][1]*7});}});
 });
 listen(stage,'keydown',event=>{const direction=keyDirections[event.key];if(direction){event.preventDefault();press(direction);}if(event.key==='Escape'){stop();quest.hidden=true;}});
 listen(window,'keyup',event=>{const direction=keyDirections[event.key];if(direction){keys.delete(direction);if(!keys.size)stop();}});
 listen(window,'blur',()=>stop());listen(document,'visibilitychange',()=>{if(document.hidden)stop();});listen(window,'pagehide',()=>stop());
 listen(reduced,'change',()=>stop());
 paint();save?.();
 return {destroy(){if(destroyed)return;stop();destroyed=true;controller.abort();}};
}
