// Device-local drafts, separate from learning results and cloud synchronization.
export const draftKey=(profileId,activityId)=>'atelier-board-v1:'+JSON.stringify([profileId,activityId]);
export function readDraft(storage,key){try{const value=JSON.parse(storage?.getItem(key));return Array.isArray(value)&&value.length<=500?value.filter(s=>['pen','erase'].includes(s.tool)&&Array.isArray(s.points)&&s.points.length<=4000&&s.points.every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)&&p[0]>=0&&p[0]<=800&&p[1]>=0&&p[1]<=1000&&p[2]>=0&&p[2]<=1)):[];}catch{return [];}}
export function acceptsPointer(event,finger=false){return event.pointerType==='pen'||(event.pointerType==='mouse'&&event.button===0)||(finger&&event.pointerType==='touch');}
export function mountWhiteboard(work,{profileId,activityId,storage}){
 if(!work)return null;
 const key=draftKey(profileId,activityId),layout=work.parentElement;
 const shell=document.createElement('div');shell.className='writing-workspace';
 work.before(shell);shell.append(work);layout.classList.add('has-whiteboard');
 const aside=document.createElement('aside');aside.className='whiteboard';aside.setAttribute('aria-label','Mon tableau de travail');
 aside.innerHTML=`<h2>✎ Mon brouillon</h2><p>Lis à gauche. Cherche et écris ici.</p><div class="board-tools" role="group" aria-label="Outils du tableau"><button type="button" data-tool="pen" aria-pressed="true">Crayon</button><button type="button" data-tool="erase" aria-pressed="false">Gomme</button><button type="button" data-undo>Annuler</button><button type="button" data-clear>Effacer tout</button></div><div class="board-options"><label><input type="checkbox" data-grid checked> Quadrillage</label><label><input type="checkbox" data-finger> Écrire au doigt</label></div><div class="board-paper"><canvas width="800" height="1000" aria-label="Brouillon à écrire au stylet. Les réponses se choisissent dans l’énoncé."></canvas></div><p class="board-status" role="status">Brouillon sur cet appareil seulement.</p>`;
 shell.append(aside);
 const canvas=aside.querySelector('canvas'),ctx=canvas.getContext('2d'),status=aside.querySelector('.board-status');
 let strokes=readDraft(storage,key),active=null,tool='pen',finger=false,destroyed=false,backup=null;
 const abort=new AbortController(),options={signal:abort.signal};
 const draw=()=>{ctx.clearRect(0,0,800,1000);for(const stroke of [...strokes,...(active?[active.stroke]:[])]){ctx.globalCompositeOperation=stroke.tool==='erase'?'destination-out':'source-over';ctx.strokeStyle='#294b72';ctx.fillStyle='#294b72';ctx.lineCap='round';ctx.lineJoin='round';for(let i=0;i<stroke.points.length;i++){const p=stroke.points[i],prev=stroke.points[Math.max(0,i-1)],width=stroke.tool==='erase'?28:2+4*p[2];ctx.lineWidth=width;ctx.beginPath();if(i===0){ctx.arc(p[0],p[1],width/2,0,Math.PI*2);ctx.fill();}else{ctx.moveTo(prev[0],prev[1]);ctx.lineTo(p[0],p[1]);ctx.stroke();}}}ctx.globalCompositeOperation='source-over';aside.querySelector('[data-undo]').disabled=!strokes.length&&!backup;};
 const persist=()=>{try{if(!storage)throw Error();storage.setItem(key,JSON.stringify(strokes));status.textContent='Brouillon sauvegardé sur cet appareil.';}catch{status.textContent='Sauvegarde impossible. Garde cette activité ouverte.';}};
 const point=e=>{const r=canvas.getBoundingClientRect();return [Math.max(0,Math.min(800,(e.clientX-r.left)*800/r.width)),Math.max(0,Math.min(1000,(e.clientY-r.top)*1000/r.height)),e.pointerType==='pen'?Math.max(.1,Math.min(1,e.pressure||.5)):.5];};
 const finish=()=>{if(!active)return;strokes.push(active.stroke);active=null;backup=null;persist();draw();};
 canvas.addEventListener('pointerdown',e=>{if(active||!acceptsPointer(e,finger))return;if(strokes.length>=500){status.textContent='Le tableau est plein. Efface quelques traits pour continuer.';return;}e.preventDefault();active={id:e.pointerId,stroke:{tool,points:[point(e)]}};try{canvas.setPointerCapture(e.pointerId);}catch{}draw();},options);
 canvas.addEventListener('pointermove',e=>{if(active?.id!==e.pointerId)return;e.preventDefault();for(const event of e.getCoalescedEvents?.()||[e]){if(active.stroke.points.length<4000)active.stroke.points.push(point(event));}draw();},options);
 for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(active?.id===e.pointerId)finish();},options);
 aside.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>{finish();tool=button.dataset.tool;aside.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));},options));
 aside.querySelector('[data-undo]').addEventListener('click',()=>{finish();if(backup){strokes=backup;backup=null;}else strokes.pop();persist();draw();},options);
 aside.querySelector('[data-clear]').addEventListener('click',()=>{finish();backup=strokes;strokes=[];persist();draw();status.textContent='Tableau effacé. Annuler permet de le retrouver.';},options);
 aside.querySelector('[data-grid]').addEventListener('change',e=>aside.classList.toggle('no-grid',!e.target.checked),options);
 aside.querySelector('[data-finger]').addEventListener('change',e=>{finish();finger=e.target.checked;},options);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='board-toggle';toggle.textContent='Masquer mon brouillon';toggle.setAttribute('aria-expanded','true');shell.before(toggle);
 toggle.addEventListener('click',()=>{finish();const hidden=!aside.hidden;aside.hidden=hidden;shell.classList.toggle('board-closed',hidden);toggle.textContent=hidden?'Ouvrir mon brouillon':'Masquer mon brouillon';toggle.setAttribute('aria-expanded',String(!hidden));},options);
 window.addEventListener('pagehide',finish,options);document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();},options);
 draw();
 return {destroy(){if(destroyed)return;destroyed=true;finish();abort.abort();}};
}
