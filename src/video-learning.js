import {videoCatalog,videoAuthors,videoSubjects} from './video-catalog.js';
import {gradeFor} from './learning.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const videoDay=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export function videoProgress(p,id,day=videoDay()){
 const rows=(p.videoPractice?.[id]?.days||[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.day)&&x.day<=day);
 const last=rows.at(-1),independent=rows.filter(x=>x.unaided===2);
 return {mode:!last?'discover':last.unaided<2?'support':independent.length>=2?'transfer':'review',last,due:!!last&&last.day<day};
}
export function recordVideoPractice(p,id,answers,help,day=videoDay()){
 if(!videoCatalog.some(x=>x.id===id)||answers.length!==2||help.length!==2)throw Error('invalid_video_attempt');
 const unaided=answers.filter((ok,i)=>ok&&!help[i]).length;
 const old=p.videoPractice?.[id]||{},days=Array.isArray(old.days)?old.days.filter(x=>x.day!==day):[],same=old.days?.find(x=>x.day===day);
 // Repeating a quiz on the same day never erases an earlier error/help.
 days.push({day,unaided:Math.min(same?.unaided??2,unaided)});days.sort((a,b)=>a.day.localeCompare(b.day));
 p.videoPractice={...(p.videoPractice||{}),[id]:{attempts:(Number.isSafeInteger(old.attempts)?old.attempts:0)+1,days:days.slice(-30)}};
 return unaided;
}
export function videoQuestions(s,p,day=videoDay()){
 const mode=videoProgress(p,s.id,day).mode;
 if(s.table){const n=s.table,step=mode==='transfer'?7:2;return [step,step+1].map((k,i)=>({prompt:`${k} groupes de ${n} : ${k} × ${n} =`,choices:i?[String(k*n+1),String(k*n)]:[String(k*n),String(k*n+1)],answer:i}));}
 // New examples for transfer, only after successes on two separate days.
 const extra={
 determiner:[{prompt:'Dans « les petits oiseaux », quel mot est le déterminant?',choices:['les','petits','oiseaux'],answer:0},{prompt:'Quel groupe convient pour plusieurs fleurs?',choices:['la fleurs','les fleurs','le fleurs'],answer:1}],
 noun:[{prompt:'Dans « Le renard avance », quel mot est le nom?',choices:['Le','renard','avance'],answer:1},{prompt:'Quel groupe contient un nom d’objet?',choices:['une lampe','très vite','il danse'],answer:0}],
 adjective:[{prompt:'Dans « un ballon léger », quel mot décrit le ballon?',choices:['un','ballon','léger'],answer:2},{prompt:'Choisis le groupe bien accordé.',choices:['des petits chats','des petit chats','des petits chat'],answer:0}]
 };
 return mode==='transfer'&&extra[s.topic]?extra[s.topic]:s.questions;
}
export function videosFor(p,{author='all',subject='all',scope='mine'}={}){
 const grade=gradeFor(p);
 const priority=x=>({support:0,review:1,discover:2,transfer:3}[videoProgress(p,x.id).mode]);
 return videoCatalog.filter(x=>(author==='all'||x.author===videoAuthors[author])&&(subject==='all'||x.category===subject)&&(scope==='all'||(x.level<=grade&&(!x.maxLevel||grade<=x.maxLevel)))).sort((a,b)=>priority(a)-priority(b));
}
const labels={discover:'À découvrir',support:'À reprendre avec un indice',review:'À revoir un autre jour',transfer:'Pour consolider'};
export function mountVideoLessons(root,p,{author='all',subject='all',save=()=>{},onHome=()=>{},speak=()=>{},stopAudio=()=>{}}={}){
 let scope='mine',page=0,selected=null,phase='watch',index=0,answers=[],help=[],questions=[],dead=false;
 const stop=()=>{root.querySelector('[data-video-player]')?.replaceChildren();stopAudio();};
 const size=()=>window.innerWidth<600?2:4;
 function draw(){
  if(dead)return;stop();
  const list=videosFor(p,{author,subject,scope}),count=size(),pages=Math.max(1,Math.ceil(list.length/count));page=Math.min(page,pages-1);
  const s=videoCatalog.find(x=>x.id===selected),progress=s&&videoProgress(p,s.id);
  root.innerHTML=`<section class="video-room" aria-label="Mes vidéos et exercices"><nav class="video-top"><button data-video-home>‹ Mon monde</button><strong>${esc(p.name)} · ${gradeFor(p)}${gradeFor(p)===1?'re':'e'} année</strong>${s?'<button data-video-back>Les vidéos</button>':''}</nav>
  ${!s?`<h1>🎸 Mes vidéos et petits défis</h1><div class="video-filters"><label>Avec qui?<select data-video-author>${Object.entries(videoAuthors).map(([id,label])=>`<option value="${id}" ${author===id?'selected':''}>${esc(label)}</option>`).join('')}</select></label><label>Matière<select data-video-subject>${Object.entries(videoSubjects).map(([id,label])=>`<option value="${id}" ${subject===id?'selected':''}>${label}</option>`).join('')}</select></label><label>Je choisis<select data-video-scope><option value="mine">À mon niveau</option><option value="all" ${scope==='all'?'selected':''}>Tout · avec un adulte</option></select></label></div><div class="video-cards">${list.slice(page*count,(page+1)*count).map(x=>`<button data-video-id="${x.id}"><span aria-hidden="true">${x.author===videoAuthors.prof?'🎸':x.author===videoAuthors.lucas?'🎓':'🎵'}</span><strong>${esc(x.title)}</strong><small>${esc(x.author)} · ${x.level>3?'Pour plus tard':labels[videoProgress(p,x.id).mode]}</small></button>`).join('')||'<p>Aucune vidéo dans ce choix. Essaie une autre matière.</p>'}</div><nav class="video-pages" aria-label="Pages des vidéos"><button data-video-prev ${page===0?'disabled':''}>‹ Précédent</button><span role="status">${page+1} / ${pages}</span><button data-video-next-page ${page===pages-1?'disabled':''}>Suivant ›</button></nav>`:`<h1>${esc(s.title)}</h1><p class="video-byline">${esc(s.author)} · ${labels[progress.mode]}${s.level>gradeFor(p)?' · Avec un adulte':''}</p><article class="video-stage">
  ${phase==='watch'?`<div class="video-watch"><div data-video-player><button class="video-play" data-video-play>▶ Regarder la vidéo</button></div><p class="video-source"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" data-video-external>Ouvrir chez le créateur ↗</a> · Lecteur YouTube, publicités possibles.</p></div><div class="video-actions"><button data-video-play-toggle>▶ Charger / arrêter la vidéo</button><button data-video-start>Mes 2 petits exercices →</button></div>`:phase==='done'?`<h2>Tu as pratiqué!</h2><p>${answers.filter((x,i)=>x&&!help[i]).length} réponse(s) sans aide sur 2.</p><p>${answers.every((x,i)=>x&&!help[i])?'On reverra cette notion un autre jour.':'On reprend avec un indice, à ton rythme.'}</p><p class="video-note">Un entraînement, pas une note ni une preuve de maîtrise.</p><button data-video-rewatch>Revoir la vidéo</button><button data-video-back>Choisir une autre vidéo</button>`:`<p>Petit défi ${index+1} / 2</p><h2>${esc(questions[index].prompt)}</h2><div class="video-tools"><button data-video-read>🔊 Écouter la question</button><button data-video-help ${answers.length>index?'disabled':''}>Un indice</button></div><p data-video-hint hidden>${esc(s.activity)}</p><div class="video-answers">${questions[index].choices.map((c,i)=>`<button data-video-answer="${i}">${esc(c)}</button>`).join('')}</div><p role="status" data-video-feedback></p><button data-video-continue hidden>Continuer →</button>`}</article>`}</section>`;
  const on=(sel,fn)=>root.querySelectorAll(sel).forEach(el=>el.onclick=fn);
  on('[data-video-home]',onHome);on('[data-video-back]',()=>{selected=null;draw();});
  for(const key of ['author','subject','scope']){const el=root.querySelector('[data-video-'+key+']');if(el)el.onchange=()=>{if(key==='author')author=el.value;if(key==='subject')subject=el.value;if(key==='scope')scope=el.value;page=0;draw();};}
  on('[data-video-prev]',()=>{page--;draw();});on('[data-video-next-page]',()=>{page++;draw();});
  on('[data-video-id]',e=>{selected=e.currentTarget.dataset.videoId;phase='watch';draw();});
  const play=()=>{const box=root.querySelector('[data-video-player]');if(box.querySelector('iframe')){box.replaceChildren();return;}stopAudio();const f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/${s.video}?playsinline=1&rel=0`;f.title=s.title;f.referrerPolicy='strict-origin-when-cross-origin';f.allow='encrypted-media; fullscreen; picture-in-picture';f.allowFullscreen=true;box.replaceChildren(f);};
  on('[data-video-play]',play);on('[data-video-play-toggle]',play);on('[data-video-external]',stop);
  on('[data-video-start]',()=>{questions=videoQuestions(s,p);answers=[];help=[false,false];index=0;phase='quiz';draw();});
  on('[data-video-rewatch]',()=>{phase='watch';draw();});
  on('[data-video-help]',()=>{help[index]=true;root.querySelector('[data-video-hint]').hidden=false;});
  on('[data-video-read]',()=>speak(questions[index].prompt+' '+questions[index].choices.join('. ')));
  on('[data-video-answer]',e=>{if(answers.length>index)return;const ok=Number(e.currentTarget.dataset.videoAnswer)===questions[index].answer;answers.push(ok);root.querySelectorAll('[data-video-answer]').forEach(x=>x.disabled=true);root.querySelector('[data-video-help]').disabled=true;root.querySelector('[data-video-feedback]').textContent=ok?'Oui! Tu as trouvé.':`On apprend ensemble : ${questions[index].choices[questions[index].answer]}.`;root.querySelector('[data-video-continue]').hidden=false;});
  on('[data-video-continue]',()=>{if(answers.length!==index+1)return;if(++index===2){recordVideoPractice(p,s.id,answers,help);save();phase='done';}draw();});
 }
 const hidden=()=>{if(document.hidden)stop();};
 // Resizing a catalog changes pagination; never reset an in-progress answer/video.
 const resize=()=>{if(!selected)draw();};document.addEventListener('visibilitychange',hidden);window.addEventListener('resize',resize);draw();
 return {destroy(){dead=true;stop();root.replaceChildren();document.removeEventListener('visibilitychange',hidden);window.removeEventListener('resize',resize);}};
}
