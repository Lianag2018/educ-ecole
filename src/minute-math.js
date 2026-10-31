import {advanced} from './learning.js';
export function minuteCards({older=true,table=4,count=18,variant=0}={}){
 const cap=older?Math.min(6,Math.max(1,table)):Math.min(3,Math.max(1,table)),pool=[];
 for(let n=1;n<=cap;n++)for(let b=1;b<=(older?12:7);b++)for(const op of ['+','−']){
  const a=op==='+'?n:n+b,answer=op==='+'?n+b:b;
  pool.push({id:`minute-${a}-${op}-${op==='+'?b:n}`,skill:'maths',level:1,text:`${a} ${op} ${op==='+'?b:n}`,choices:[String(answer)],answer:0,value:answer});
 }
 // Deterministic shuffled worksheets: repeatable for a fair personal comparison.
 let seed=12345+variant*7919+cap*31;
 for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,Math.min(count,pool.length));
}
export function flashCards({older=true,operation='mixed',count=18,variant=0,range}={}){
 const max=[5,8,12].includes(range)?range:older?12:5,pool=[];
 for(let a=0;a<=max;a++)for(let b=0;b<=max;b++)for(const op of ['+','−']){
  if(operation!=='mixed'&&operation!==op)continue;
  if(op==='−'&&a<b)continue;
  const value=op==='+'?a+b:a-b;
  pool.push({id:`flash-${a}-${op}-${b}`,skill:'maths',level:1,text:`${a} ${op} ${b}`,choices:[String(value)],answer:0,value});
 }
 let seed=23517+variant*7919;
 for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]];}
 return pool.slice(0,count);
}
export const flashStages=[{range:5,seconds:300},{range:8,seconds:240},{range:12,seconds:180},{range:12,seconds:120},{range:12,seconds:60}];
export function flashStage(p,operation='mixed'){
 if(advanced(p))return flashStages[4];
 const rows=Array.isArray(p.minuteMath)?p.minuteMath:[];
 let stage=0;
 for(let i=0;i<4;i++){
  const {range,seconds}=flashStages[i];
  const passed=rows.filter(r=>r.format==='cards'&&r.operation===operation&&r.range===range&&r.limitMs===seconds*1000&&!r.paused&&Number.isInteger(r.count)&&r.count>=6&&r.correct/r.count>=.8&&r.correct+r.incorrect+r.unanswered===r.count&&r.ms>0&&r.ms<=seconds*1000);
  if(new Set(passed.map(r=>r.variant)).size<2)break;
  stage=i+1;
 }
 return flashStages[stage];
}
export function flashRange(p,operation='mixed'){return flashStage(p,operation).range;}
export function verticalCalculation(q){
 const match=/^(\d+) ([+−]) (\d+)$/.exec(q.text);
 if(!match)return '';
 return `<div class="flash-operation" aria-hidden="true"><span class="flash-top">${match[1]}</span><span class="flash-sign">${match[2]}</span><span class="flash-bottom">${match[3]}</span></div>`;
}
export class MinuteRound{
 constructor(cards,now=()=>performance.now(),limitMs=60000){this.limitMs=limitMs;this.cards=cards;this.now=now;this.phase='ready';this.values=cards.map(()=> '');this.elapsed=0;this.paused=false;}
 start(){if(this.phase!=='ready')return;this.started=this.now();this.phase='playing';}
 time(){return Math.min(this.limitMs,this.elapsed+(this.phase==='playing'?Math.max(0,this.now()-this.started):0));}
 tick(){if(this.phase==='playing'&&this.time()>=this.limitMs)this.finish();return this.phase;}
 input(i,value){this.tick();if(this.phase!=='playing'||!Number.isInteger(i)||i<0||i>=this.cards.length||!/^\d{0,3}$/.test(value))return false;this.values[i]=value;return true;}
 pause(){this.tick();if(this.phase==='playing'){this.elapsed=this.time();this.phase='paused';this.paused=true;}}
 resume(){if(this.phase==='paused'){this.started=this.now();this.phase='playing';}}
 finish(){if(!['playing','paused'].includes(this.phase))return;this.elapsed=this.time();this.phase='done';}
 results(){return this.cards.map((q,i)=>({card:q,value:this.values[i],status:this.values[i]===''?'unanswered':Number(this.values[i])===q.value?'correct':'incorrect'}));}
}
export function improvementMessage(previous,current){
 if(current.paused)return '';
 const same=previous.filter(r=>!r.paused&&['format','operation','range','limitMs','table','count','variant'].every(k=>r[k]===current[k]));
 const perfect=same.filter(r=>r.correct===r.count&&r.incorrect===0&&r.unanswered===0);
 if(current.correct===current.count&&current.incorrect===0&&current.unanswered===0&&perfect.length){
  const best=Math.min(...perfect.map(r=>r.ms));const gained=Math.floor((best-current.ms)/1000);
  if(gained>=1)return `Tu as gagné ${gained} seconde${gained>1?'s':''} sur ce tableau, avec toutes les réponses justes! Tu es sur la bonne voie!`;
 }
 if(same.length){const best=Math.max(...same.map(r=>r.correct)),extra=current.correct-best;if(extra>0)return `${extra} bonne${extra>1?'s':''} réponse${extra>1?'s':''} de plus sur ce tableau! Bravo, tu progresses!`;}
 return '';
}
export function mountMinuteMath(root,p,{save,onAnswer}={}){
 const older=advanced(p),controller=new AbortController();let game,interval,variant=0,table=older?4:2,count=older?18:10,recorded=false,format='cards',operation='mixed',cardIndex=0,improvement='',range=flashRange(p,operation),limitMs=flashStage(p,operation).seconds*1000;
 const setup=()=>{range=flashRange(p,operation);limitMs=flashStage(p,operation).seconds*1000;game=new MinuteRound(format==='cards'?flashCards({older,operation,count,variant,range}):minuteCards({older,table,count,variant}),undefined,limitMs);recorded=false;cardIndex=0;improvement='';};
 const record=()=>{if(recorded||game.phase!=='done')return;recorded=true;const results=game.results();
  for(const r of results)if(r.status!=='unanswered')onAnswer?.(r.card,{correct:r.status==='correct',help:game.paused});
  const entry={at:new Date().toISOString(),table,count,variant,format,operation,range,limitMs,ms:game.elapsed,paused:game.paused,correct:results.filter(r=>r.status==='correct').length,incorrect:results.filter(r=>r.status==='incorrect').length,unanswered:results.filter(r=>r.status==='unanswered').length};
  improvement=improvementMessage(Array.isArray(p.minuteMath)?p.minuteMath:[],entry);
  p.minuteMath=[...(Array.isArray(p.minuteMath)?p.minuteMath:[]),entry].slice(-100);save?.();
 };
 const tick=()=>{game.tick();if(game.phase==='done'){record();draw();return;}const el=root.querySelector('[data-minute-clock]');if(el){const s=Math.ceil((game.limitMs-game.time())/1000);el.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}};
 const draw=()=>{clearInterval(interval);const done=game.phase==='done',playing=game.phase==='playing',results=game.results();
 root.innerHTML=`<section class="minute-game"><h1>🚀 Défi vitesse</h1>${game.phase==='ready'?`<p>${limitMs/60000} minute${limitMs>60000?'s':''} pour toute la série. Écris les réponses que tu trouves.</p><label>Présentation <select data-minute-format><option value="cards" ${format==='cards'?'selected':''}>Cartes verticales</option><option value="table" ${format==='table'?'selected':''}>Tableau de l’école</option></select></label> ${format==='cards'?`<label>Opérations <select data-minute-operation><option value="mixed" ${operation==='mixed'?'selected':''}>+ et −</option><option value="+" ${operation==='+'?'selected':''}>Additions</option><option value="−" ${operation==='−'?'selected':''}>Soustractions</option></select></label><p>Nombres de 0 à ${range} · sommes jusqu’à ${range*2}${!older?' · progression 0–5 → 0–8 → 0–12':''}</p>`:''}<label ${format==='cards'?'hidden':''}>Tables <select data-minute-table>${(older?[4,5,6]:[1,2,3]).map(n=>`<option value="${n}" ${table===n?'selected':''}>+ et − 1 à ${n}</option>`).join('')}</select></label> <label>Calculs <select data-minute-count>${(older?[18,21]:[6,10]).map(n=>`<option ${count===n?'selected':''}>${n}</option>`).join('')}</select></label><p>Tableau ${variant+1} sur 6</p><button data-minute-start class="primary">Commencer · ${limitMs/60000} min</button>`:`<div class="minute-toolbar"><strong data-minute-clock aria-label="Temps restant">${done?'Terminé':`${limitMs/60000}:00`}</strong><span>Tableau ${variant+1} · ${count} calculs</span></div>${game.phase==='paused'?'<p>En pause. Cette série sera notée comme entraînement avec pause.</p><button data-minute-resume>Reprendre</button>':format==='cards'&&!done?`<div class="flash-progress">Carte ${cardIndex+1} / ${game.cards.length}</div><div class="arithmetic-flashcard">${verticalCalculation(game.cards[cardIndex])}<input data-minute-input="${cardIndex}" aria-label="Réponse : ${game.cards[cardIndex].text.replace('−','moins').replace('+','plus')}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${game.values[cardIndex]}"><button class="primary" data-flash-next>Valider →</button><button data-flash-skip>Passer</button></div>`:`<div class="minute-board">${game.cards.map((q,i)=>`<label class="minute-cell ${done?results[i].status:''}"><span>${q.text} =</span><input data-minute-input="${i}" aria-label="${q.text.replace('−','moins').replace('+','plus')}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" value="${game.values[i]}" ${done?'disabled':''}>${done?`<small>${results[i].status==='correct'?'✓':results[i].status==='incorrect'?`À revoir : ${q.value}`:'Non terminé'}</small>`:''}</label>`).join('')}</div>`}${playing?'<button data-minute-finish>J’ai terminé</button><button data-minute-pause>Pause</button>':''}${done?`<div role="status"><h2>⭐ Bravo pour ton effort!</h2>${improvement?`<p class="flash-unlocked">${improvement}</p>`:''}<p>${results.filter(r=>r.status==='correct').length} justes · ${results.filter(r=>r.status==='incorrect').length} à revoir · ${results.filter(r=>r.status==='unanswered').length} non terminés</p>${format==='cards'&&!older&&flashStage(p,operation).seconds*1000<limitMs?'<p class="flash-unlocked">🌟 Nouveau niveau débloqué! La prochaine série ira plus loin avec un peu moins de temps.</p>':''}<p>Temps : ${(game.elapsed/1000).toFixed(1)} s${game.paused?' · avec pause':''}</p><button data-minute-again>Refaire ce tableau</button><button data-minute-next class="primary">Tableau suivant →</button></div>`:''}`}</section>`;
 root.querySelector('[data-minute-format]')?.addEventListener('change',e=>{format=e.target.value;setup();draw();});
 root.querySelector('[data-minute-operation]')?.addEventListener('change',e=>{operation=e.target.value;setup();draw();});
 const advance=()=>{game.tick();if(game.phase==='playing'){if(cardIndex<game.cards.length-1)cardIndex++;else game.finish();}if(game.phase==='done')record();draw();root.querySelector('input')?.focus();};
 root.querySelector('[data-flash-next]')?.addEventListener('click',()=>{if(game.values[cardIndex]!=='')advance();else root.querySelector('input')?.focus();});
 root.querySelector('[data-flash-skip]')?.addEventListener('click',()=>{game.input(cardIndex,'');advance();});
 root.querySelector('[data-minute-table]')?.addEventListener('change',e=>{table=Number(e.target.value);setup();});
 root.querySelector('[data-minute-count]')?.addEventListener('change',e=>{count=Number(e.target.value);setup();});
 root.querySelector('[data-minute-start]')?.addEventListener('click',()=>{game.start();draw();root.querySelector('input')?.focus();});
 root.querySelector('[data-minute-pause]')?.addEventListener('click',()=>{game.pause();draw();});
 root.querySelector('[data-minute-resume]')?.addEventListener('click',()=>{game.resume();draw();});
 root.querySelector('[data-minute-finish]')?.addEventListener('click',()=>{game.finish();record();draw();});
 root.querySelector('[data-minute-next]')?.addEventListener('click',()=>{variant=(variant+1)%6;setup();draw();});
 root.querySelector('[data-minute-again]')?.addEventListener('click',()=>{setup();draw();});
 root.querySelectorAll('[data-minute-input]').forEach((input)=>{const i=Number(input.dataset.minuteInput);input.addEventListener('input',()=>{if(!game.input(i,input.value))input.value=game.values[i];if(game.phase==='done'){record();draw();}});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(format==='cards'){root.querySelector('[data-flash-next]')?.click();return;}root.querySelector(`[data-minute-input="${i+1}"]`)?.focus();}});});
 if(playing){tick();interval=setInterval(tick,100);}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden){game.pause();if(game.phase==='done')record();draw();}},{signal:controller.signal});setup();draw();
 return {destroy(){clearInterval(interval);controller.abort();}};
}
