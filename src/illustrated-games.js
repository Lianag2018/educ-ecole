// Presentation adapters only: existing card IDs, answers and progress stay authoritative.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sceneFor(q){
 if(q.visual?.kind==='seeds'&&Number.isInteger(q.visual.count)&&q.visual.count>=0&&q.visual.count<=20)return {kind:'count',count:q.visual.count};
 if(q.skill!=='maths'&&!q.beginnerMath&&!q.miniZone)return null;
 const m=String(q.islandMath||q.text||'').match(/^(\d+)\s*([+−×÷])\s*(\d+)$/);
 const parts=q.beginnerMath||m?.slice(1);if(!parts)return null;
 const [aa,op,bb]=parts,a=Number(aa),b=Number(bb);
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>144||b>144)return null;
 if(op==='+'&&a+b<=24)return {kind:'add',a,b};
 if(op==='−'&&a<=24&&b<=a)return {kind:'subtract',a,b};
 if(op==='×'&&a>=1&&a<=12&&b>=1&&b<=12)return {kind:'groups',a,b};
 if(op==='÷'&&b>=1&&b<=12&&a%b===0&&a/b<=12)return {kind:'share',a,b};
 return null;
}
const seed='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M48 8C19 8 8 26 13 43c5 18 31 19 39-2C57 28 51 17 48 8Z" fill="#a76b3f" stroke="#643d28" stroke-width="3"/><path d="M23 43Q21 25 43 17" fill="none" stroke="#edc493" stroke-width="4" stroke-linecap="round"/></svg>';
const sprout='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 58V24" stroke="#437357" stroke-width="4"/><path d="M31 39Q5 39 8 16Q31 15 31 39M33 30Q32 6 57 9Q59 31 33 30" fill="#82b57b" stroke="#437357" stroke-width="2"/></svg>';
const pearl='<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="#f9d67d" stroke="#a97641" stroke-width="2"/><circle cx="15" cy="14" r="4" fill="#fff5ce"/></svg>';
export function sceneMarkup(q,state={}){
 const s=sceneFor(q);if(!s)return '';
 const pressed=new Set(state.pressed||[]);
 const items=(n,offset=0)=>Array.from({length:n},(_,i)=>{const id=i+offset,on=pressed.has(id);return `<button type="button" class="scene-seed ${on?'is-planted':''}" data-scene-object="${id}" aria-pressed="${on}" aria-label="Graine ${id+1}">${seed}${sprout}</button>`;}).join('');
 let body='',instruction='',equation='';
 if(s.kind==='count'){instruction='Touche chaque graine.';body=`<div class="seed-bed">${items(s.count)}${s.count===0?'<span class="empty-soil" aria-label="La terre est vide"></span>':''}</div>`;}
 if(s.kind==='add'){instruction='Réunis les graines.';body=`<div class="seed-sum"><div class="seed-bed">${items(s.a)}</div><b aria-hidden="true">+</b><div class="seed-bed">${items(s.b,s.a)}</div></div>`;equation=`${s.a} + ${s.b} = ?`;}
 if(s.kind==='subtract'){instruction=`Retire ${s.b} graines.`;body=`<div class="seed-bed subtraction">${items(s.a)}</div>`;equation=`${s.a} − ${s.b} = ?`;}
 if(s.kind==='groups'||s.kind==='share'){
  instruction=s.kind==='groups'?'Explore les groupes.':'Partage les perles.';
  const count=s.kind==='groups'?s.a:s.b,per=s.kind==='groups'?s.b:s.a/s.b;
  body=`<div class="pearl-groups">${Array.from({length:count},(_,i)=>`<button type="button" class="pearl-basket" data-scene-object="${i}" aria-pressed="${pressed.has(i)}" aria-label="Groupe ${i+1}, ${per} perles">${Array.from({length:per},()=>pearl).join('')}</button>`).join('')}</div>`;
  equation=`${s.a} ${s.kind==='groups'?'×':'÷'} ${s.b} = ?`;
 }
 return `<section class="play-scene ${s.kind}" aria-label="Manipulation illustrée"><div class="scene-firefly" aria-hidden="true"></div><p class="scene-instruction">${instruction}</p>${equation?`<strong class="scene-equation">${equation}</strong>`:''}${body}<button type="button" class="scene-reset" data-scene-reset aria-label="Remettre les objets au départ">↺</button></section>`;
}
export function toggleSceneObject(q,state,index){
 const s=sceneFor(q);if(!s)return false;
 const count=s.kind==='count'?s.count:s.kind==='add'?s.a+s.b:s.kind==='share'?s.b:s.a;
 if(!Number.isInteger(index)||index<0||index>=count)return false;
 const set=new Set(state.pressed||[]);set.has(index)?set.delete(index):set.add(index);
 // Subtraction requires removing the requested number, never all items accidentally.
 if(s.kind==='subtract'&&set.size>s.b)return false;
 state.pressed=[...set];return true;
}
export function mountScene(root,q,state,{onHelp=()=>{},disabled=false}={}){
 if(!root||!sceneFor(q))return ()=>{};
 const onClick=e=>{const button=e.target.closest('button');if(!button||!root.contains(button)||disabled)return;
  if(button.hasAttribute('data-scene-reset')){state.pressed=[];root.innerHTML=sceneMarkup(q,state);return;}
  if(!button.hasAttribute('data-scene-object'))return;
  const index=Number(button.dataset.sceneObject);if(!toggleSceneObject(q,state,index))return;
  if(['groups','share'].includes(sceneFor(q).kind))onHelp();
  const on=state.pressed.includes(index);button.setAttribute('aria-pressed',String(on));button.classList.toggle('is-planted',on);
 };
 root.addEventListener('click',onClick);if(disabled)root.querySelectorAll('button').forEach(b=>b.disabled=true);
 return ()=>root.removeEventListener('click',onClick);
}
// Update narration without replacing game DOM, focus, objects or video.
export function updateAudioSurface(root,{speaking,message}){
 root.ownerDocument.body.classList.toggle('reading-aloud',speaking);
 root.querySelectorAll('.audio-status').forEach(el=>{el.textContent=message||'';});
 root.querySelectorAll('[data-action="listen"],[data-action="question-audio"]').forEach(el=>el.setAttribute('aria-busy',String(speaking)));
}
export function illustratedCards(p){
 if(p.id!=='p2')return [];
 return [[3,'×',4],[4,'×',6],[5,'×',7],[12,'÷',3],[24,'÷',4],[36,'÷',6]].map(([a,op,b],i)=>{
  const n=op==='×'?a*b:a/b,answer=i%3,choices=[n+1,n+2,n+3].map(String);choices[answer]=String(n);
  return {id:`illustrated-groups-v1-${i}`,skill:'maths',level:1,text:`${a} ${op} ${b}`,prompt:op==='×'?'Combien de perles en tout?':'Combien de perles par groupe?',choices,answer,explanation:op==='×'?`${a} groupes de ${b} font ${n}.`:`${a} perles partagées en ${b} groupes donnent ${n} perles par groupe.`};
 });
}
