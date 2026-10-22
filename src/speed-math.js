import {tablePractice} from './week-plan.js';
import {NarrationSpeaker} from './narration.js';
import {ReadingSpeaker,spokenActivity} from './speech.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const speedLevels=[{name:'Petit départ',tables:2,seconds:20,ops:['+']},{name:'Je prends mon élan',tables:4,seconds:15,ops:['+','−']},{name:'Je gagne en aisance',tables:6,seconds:10,ops:['+','−']}];
export function speedState(p){const s=p.speedMath;return {level:Number.isInteger(s?.level)&&s.level>=0&&s.level<3?s.level:0,recent:Array.isArray(s?.recent)?s.recent.slice(-100):[],rounds:Number.isInteger(s?.rounds)?s.rounds:0};}
export function adaptSpeed(s,event){
 const recent=[...s.recent,event].slice(-100),window=recent.filter(e=>e.level===s.level&&e.block===s.block).slice(-5);
 let level=s.level,block=s.block||0;
 if(window.length>=5){
  if(window.every(e=>e.correct&&!e.help)&&window.filter(e=>e.ms<=speedLevels[level].seconds*1000).length>=4)level=Math.min(2,level+1);
  else if(window.filter(e=>!e.correct||e.help).length>=2||window.filter(e=>e.ms>speedLevels[level].seconds*1500).length>=3)level=Math.max(0,level-1);
  block++;
 }
 return {...s,level,block,recent};
}
export function speedCard(level,used=[],random=Math.random,tableCap=6){
 const l=speedLevels[level],all=[];
 for(let n=1;n<=Math.min(l.tables,tableCap);n++)for(const op of l.ops)all.push(...tablePractice(n,op));
 const candidates=all.filter(q=>!used.includes(q.id)),pool=candidates.length?candidates:all;
 const base=pool[Math.min(pool.length-1,Math.floor(random()*pool.length))],correct=Number(base.choices[base.answer]);
 const choices=[correct,correct===0?2:correct-1,correct+1];
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 return {...base,id:'speed-'+base.id,choices:choices.map(String),answer:choices.indexOf(correct),sourceId:base.id};
}
export class SpeedRound{
 constructor(p,{now=()=>performance.now(),random=Math.random,tableCap=6}={}){this.state={...speedState(p),block:0};this.now=now;this.random=random;this.tableCap=tableCap;this.results=[];this.used=[];this.phase='ready';}
 next(){if(this.results.length>=10){this.phase='done';return;}this.card=speedCard(this.state.level,this.used,this.random,this.tableCap);this.used.push(this.card.sourceId);this.cardLevel=this.state.level;this.elapsed=0;this.started=this.now();this.phase='playing';this.help=false;}
 time(){return this.elapsed+(this.phase==='playing'?Math.max(0,this.now()-this.started):0);}
 pause(){if(this.phase==='playing'){this.elapsed=this.time();this.phase='paused';}}
 resume(){if(this.phase==='paused'){this.started=this.now();this.phase='playing';}}
 submit(index){if(this.phase!=='playing'||!Number.isInteger(index)||index<0||index>2)return null;
  const ms=this.time();this.elapsed=ms;this.phase='feedback';const e={correct:index===this.card.answer,help:this.help,ms:Math.round(ms),level:this.cardLevel,block:this.state.block,id:this.card.id};this.results.push(e);this.state=adaptSpeed(this.state,e);return e;
 }
}
export function mountSpeedMath(root,p,{save,onAnswer,tableCap=6}={}){
 const game=new SpeedRound(p,{tableCap}),voice=new NarrationSpeaker({fallback:new ReadingSpeaker()}),controller=new AbortController();let interval,dead=false;
 const speak=text=>voice.speak(text,{speed:.9,onState:(s,m)=>{const out=root.querySelector('[data-speed-audio]');if(out)out.textContent=m;}});
 const draw=()=>{
  clearInterval(interval);if(dead)return;
  const l=speedLevels[game.cardLevel??game.state.level];
  root.innerHTML=`<section class="speed-game"><button data-action="home" data-speed-home>‹ Mon monde</button><div class="speed-pet" aria-hidden="true">🫧</div><h1>Le sprint Squishy</h1>${game.phase==='ready'?`<p>10 cartes. Choisis la bonne réponse, puis essaie de gagner en vitesse.</p><p>Le chrono est un repère : tu peux toujours continuer après le temps proposé.</p><p>Départ : ${speedLevels[game.state.level].name} · tables jusqu’à ${Math.min(speedLevels[game.state.level].tables,tableCap)}</p><button class="primary" data-speed-start>▶ C’est parti!</button>`:game.phase==='done'?`<h2>⭐ Ton entraînement est terminé!</h2><p>${game.results.filter(r=>r.correct&&!r.help).length} réponses justes sans aide sur 10.</p><p>Prochaine partie : ${speedLevels[game.state.level].name}.</p><p>Chaque entraînement compte. Les erreurs servent à choisir quoi revoir.</p><button data-speed-start>Rejouer</button>`:`<div class="speed-top"><span>Carte ${Math.min(10,game.results.length+(game.phase==='feedback'?0:1))} / 10</span><span>${l.name}</span><span>Repère : ${l.seconds} s</span></div><div class="speed-clock" aria-label="Temps de réflexion"><span data-speed-clock>0,0</span> s</div><p data-speed-pace>Prends ton élan!</p><div class="speed-equation">${game.phase==='paused'?'⏸':esc(game.card.text)} = ?</div>${game.phase==='paused'?'<p>Chronomètre en pause. Reprends quand tu es prête.</p><button class="primary" data-speed-resume>▶ Reprendre</button>':`<div class="speed-choices">${game.card.choices.map((c,i)=>`<button data-speed-choice="${i}" ${game.phase!=='playing'?'disabled':''}>${c}</button>`).join('')}</div>`}${game.phase==='feedback'?`<div role="status"><h2>${game.results.at(-1).correct?'✨ Oui, tu as trouvé!':'🌱 On apprend ensemble.'}</h2><p>${esc(game.card.explanation)}</p><p>${(game.elapsed/1000).toFixed(1).replace('.',',')} secondes de réflexion.</p><button data-speed-explain>🔊 Écouter l’explication</button><button class="primary" data-speed-next>${game.results.length===10?'Voir mon bilan':'Prochaine carte'} →</button></div>`:game.phase==='playing'?'<button data-speed-listen>🔊 Écouter le calcul · pause du chrono</button><button data-speed-pause>⏸ Pause</button>':''}`}<p data-speed-audio role="status"></p></section>`;
  root.querySelector('[data-speed-home]').onclick=()=>document.querySelector('header [data-action=home]').click();
  root.querySelector('[data-speed-start]')?.addEventListener('click',()=>{if(game.phase==='done'){game.results=[];game.used=[];}game.next();draw();});
  root.querySelector('[data-speed-next]')?.addEventListener('click',()=>{voice.stop();game.next();draw();});
  root.querySelector('[data-speed-resume]')?.addEventListener('click',()=>{voice.stop();game.resume();draw();});
  root.querySelector('[data-speed-pause]')?.addEventListener('click',()=>{game.pause();draw();});
  root.querySelector('[data-speed-listen]')?.addEventListener('click',()=>{game.pause();game.help=true;draw();speak(spokenActivity(game.card));});
  root.querySelector('[data-speed-explain]')?.addEventListener('click',()=>speak(game.card.explanation));
  root.querySelectorAll('[data-speed-choice]').forEach(b=>b.onclick=()=>{const e=game.submit(Number(b.dataset.speedChoice));if(!e)return;voice.stop();if(game.results.length===10)game.state.rounds++;p.speedMath={...game.state};onAnswer?.(game.card,e);save?.();draw();});
  if(game.card){const tick=()=>{const clock=root.querySelector('[data-speed-clock]');if(clock)clock.textContent=(game.time()/1000).toFixed(1).replace('.',',');const pace=root.querySelector('[data-speed-pace]');if(pace)pace.textContent=game.time()>l.seconds*1000?'Tu peux continuer. Une bonne réponse compte avant la vitesse.':'Cherche la bonne réponse.';};tick();if(game.phase==='playing')interval=setInterval(tick,100);}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden){game.pause();voice.stop();draw();}},{signal:controller.signal});draw();
 return {destroy(){dead=true;clearInterval(interval);voice.stop();controller.abort();}};
}
