// Anglais, histoire, sciences : leçons à lire et à écouter, puis petites questions. Le contenu arrive plus tard
// (importé par un adulte, par fille ou pour les deux); tant qu'il manque, la page le dit simplement.
export const SUBJECTS=[{id:'english',label:'Anglais',icon:'🇬🇧',lang:'en-US',hint:'Écoute, répète et réponds.'},{id:'history',label:'Histoire',icon:'🏛️',lang:'fr-CA',hint:'Découvre le passé, une leçon à la fois.'},{id:'science',label:'Sciences',icon:'🔬',lang:'fr-CA',hint:'Observe, comprends, expérimente.'}];
const KEY='atelier-mots-subjects-v1';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
const readAll=()=>{try{return JSON.parse(store()?.getItem(KEY)||'{}')||{};}catch{return {};}};
export const lessonsFor=(subject,pid)=>{const l=readAll()[subject]?.[pid];return Array.isArray(l)?l:[];};
export function saveLessons(subject,pids,lessons){const all=readAll();all[subject]??={};for(const pid of pids)all[subject][pid]=lessons;try{store()?.setItem(KEY,JSON.stringify(all));return true;}catch{return false;}}
export function clearLessons(subject,pid){const all=readAll();if(all[subject])delete all[subject][pid];try{store()?.setItem(KEY,JSON.stringify(all));}catch{}}
const clean=s=>String(s).replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,600);
// Format : « # Anglais », « pour: Liana » (facultatif), « ## Titre », paragraphes, « en: phrase anglaise »,
// « ? Question | bonne réponse | autre | autre ». Les sections « ## » sont les leçons.
export function parseSubject(text){
 const out={subject:null,pids:['p1','p2'],lessons:[]};let cur=null;
 for(const raw of String(text).replace(/\r/g,'').split('\n')){
  const line=raw.trim();if(!line)continue;
  let m;
  if((m=line.match(/^#\s+(.+)$/))){const t=m[1].toLowerCase();out.subject=/angl|engl/.test(t)?'english':/hist/.test(t)?'history':/scien/.test(t)?'science':out.subject;continue;}
  if((m=line.match(/^pour\s*:\s*(.+)$/i))){const t=m[1].toLowerCase();out.pids=/mely/.test(t)?['p1']:/liana/.test(t)?['p2']:['p1','p2'];continue;}
  if((m=line.match(/^##\s+(.+)$/))){cur={title:clean(m[1]).slice(0,80),paras:[],quiz:[]};out.lessons.push(cur);continue;}
  if(!cur)continue;
  if((m=line.match(/^\?\s*(.+)$/))){const [q,a,...w]=m[1].split('|').map(clean).filter(Boolean);if(q&&a&&w.length)cur.quiz.push({q,a,w:w.slice(0,3)});continue;}
  if((m=line.match(/^en\s*:\s*(.+)$/i)))cur.paras.push({t:clean(m[1]),en:true});else cur.paras.push({t:clean(line)});
 }
 out.lessons=out.lessons.filter(l=>l.paras.length||l.quiz.length).slice(0,60);
 return out;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const subjectMarkup=()=>'<section class="sj" data-sj aria-label="Ma matière"></section>';
const shuffle=(a,r=Math.random)=>a.map(x=>[x,r()]).sort((p,q)=>p[1]-q[1]).map(x=>x[0]);
// Monte la page d'une matière. app fournit {subject,profile:{id,name},speak,award,onExit,adult,onImported}.
export function mountSubject(root,{subject,profile,speak,award,onExit,adult=false,onImported=()=>{}}){
 const box=root.querySelector('[data-sj]');if(!box)return {destroy(){}};
 const S=SUBJECTS.find(x=>x.id===subject)||SUBJECTS[0];let alive=true,li=0,qi=0,order=[],wrong=0,perfect=true;
 const lessons=()=>lessonsFor(S.id,profile.id);
 const say=(p)=>{try{if(p.en||S.lang==='en-US'&&p.en!==false&&/^[\x20-\x7e’]+$/.test(p.t)){const u=new SpeechSynthesisUtterance(p.t);u.lang='en-US';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u);}else speak(p.t);}catch{}};
 const top=()=>`<div class="sj-top"><button type="button" data-sj-exit aria-label="Retour">‹</button><h2><span aria-hidden="true">${S.icon}</span> ${esc(S.label)}</h2></div>`;
 const importUi=()=>adult?`<label class="sj-import">Ajouter la matière (fichier .md ou .txt)<input type="file" accept=".md,.txt,text/plain,text/markdown" data-sj-file></label>`:'';
 const list=()=>{const L=lessons();
  box.innerHTML=`${top()}<div class="sj-card">${L.length?`<p>${esc(S.hint)}</p><div class="sj-list">${L.map((l,i)=>`<button type="button" class="sj-lesson" data-sj-open="${i}"><span aria-hidden="true">${S.icon}</span><strong>${esc(l.title)}</strong><small>${l.quiz.length?l.quiz.length+' question'+(l.quiz.length>1?'s':''):'À lire'}</small></button>`).join('')}</div>`:`<div class="sj-empty"><span aria-hidden="true">${S.icon}</span><strong>${esc(S.label)} arrive bientôt !</strong><p>Un adulte va ajouter la matière pour ${esc(profile.name)}.</p></div>`}${importUi()}</div>`;};
 const lesson=()=>{const l=lessons()[li];if(!l)return list();qi=0;wrong=0;perfect=true;order=shuffle(l.quiz.map((_,i)=>i));
  box.innerHTML=`${top()}<article class="sj-card sj-read"><h3>${esc(l.title)}</h3>${l.paras.map((p,i)=>`<div class="sj-para"><button type="button" class="sj-say" data-sj-say="${i}" aria-label="Écouter">🔊</button><p lang="${p.en?'en':'fr-CA'}">${esc(p.t)}</p></div>`).join('')}${l.quiz.length?'<button type="button" class="sj-go" data-sj-quiz>Je teste ce que j’ai appris !</button>':''}<button type="button" class="sj-back" data-sj-list>Mes leçons</button></article>`;};
 const question=()=>{const l=lessons()[li],q=l.quiz[order[qi]];if(!q)return done();const opts=shuffle([q.a,...q.w]);
  box.innerHTML=`${top()}<div class="sj-card sj-q"><p class="sj-count">Question ${qi+1} sur ${order.length}</p><h3>${esc(q.q)}</h3><div class="sj-opts">${opts.map(o=>`<button type="button" data-sj-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div><p class="sj-msg" role="status"></p></div>`;
  box.querySelector('.sj-q').dataset.answer=q.a;};
 const done=()=>{const l=lessons()[li];const star=perfect&&award(`matiere:${S.id}:${li}`,S.label);
  box.innerHTML=`${top()}<div class="sj-card sj-done"><h3>${perfect?'🎉 Bravo !':'💪 Bon travail !'}</h3><p>${esc(l.title)} · ${order.length-wrong} bonne${order.length-wrong>1?'s':''} réponse${order.length-wrong>1?'s':''} du premier coup sur ${order.length}</p>${star?'<p class="sj-star">+5 ⭐</p>':''}<button type="button" class="sj-go" data-sj-list>Mes leçons</button></div>`;};
 const click=e=>{const b=e.target.closest('button');if(!b||!alive)return;
  if(b.hasAttribute('data-sj-exit'))return onExit();
  if(b.dataset.sjOpen!==undefined){li=Number(b.dataset.sjOpen);return lesson();}
  if(b.dataset.sjSay!==undefined)return say(lessons()[li].paras[Number(b.dataset.sjSay)]);
  if(b.hasAttribute('data-sj-quiz'))return question();
  if(b.hasAttribute('data-sj-list'))return list();
  if(b.dataset.sjOpt!==undefined){const card=b.closest('.sj-q');if(b.dataset.sjOpt===card.dataset.answer){card.querySelector('.sj-msg').textContent='✓ Bravo !';card.querySelectorAll('button').forEach(x=>x.disabled=true);setTimeout(()=>{if(alive){qi++;question();}},900);}else{if(!b.disabled){wrong++;perfect=false;}b.disabled=true;card.querySelector('.sj-msg').textContent='Essaie encore !';}}};
 const change=async e=>{const f=e.target.files?.[0];if(!f||!e.target.hasAttribute('data-sj-file'))return;if(f.size>400000){alert('Ce fichier est trop gros.');return;}
  const r=parseSubject(await f.text());const sub=r.subject||S.id;if(!r.lessons.length){alert('Je n’ai trouvé aucune leçon dans ce fichier.');return;}
  saveLessons(sub,r.pids,r.lessons);alert(`Matière ajoutée : ${r.lessons.length} leçon${r.lessons.length>1?'s':''}.`);onImported();if(alive)list();};
 box.addEventListener('click',click);box.addEventListener('change',change);list();
 return {destroy(){alive=false;box.removeEventListener('click',click);box.removeEventListener('change',change);try{speechSynthesis.cancel();}catch{}}};
}
