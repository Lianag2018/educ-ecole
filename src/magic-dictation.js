// Dictée magique : le mot s'affiche et se dit, les lettres se disent une à une, le mot disparaît par magie, puis l'enfant l'écrit
// sur une ligne de cahier (avec l'Apple Pencil : l'iPad convertit l'écriture en lettres grâce à Scribble; le clavier marche aussi).
// Bien écrit : bravo et on passe tout de suite au mot suivant. Sinon : on aide (lettres à revoir en couleur), on le redit et on recommence.
// Aucune note, aucun diagnostic : l'application compare seulement les lettres écrites au mot proposé.
import {syllabify} from './syllables.js';
import {coachTip} from './coach.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const DEFAULTS=Object.freeze({
 young:['chat','lapin','pomme','ballon','soleil','chapeau','papa','maman','lune','vélo','moto','fleur','poule','souris','nuage','bateau','gâteau','cheval','canard','tortue','livre','école','jardin','maison','rose','étoile','mer','chien','arbre','fée'],
 older:['baigné','maison','forêt','cerise','garçon','girafe','bateau','poisson','neige','cadeau','fenêtre','château','légume','voiture','musique','journée','école','grenouille','papillon','montagne','champignon','orange','chocolat','bibliothèque','plage','gentil','jardin','nuage','éléphant','guitare','fromage','tableau','chaise','rivière','lumière','cuisine','magicien','crayon','ordinateur','amitié']
});
export const BATCH_SIZE=5,MAX_TRIES=3,MAX_PARENT_WORDS=200;
export const LETTER_NAMES=Object.freeze({a:'a',b:'bé',c:'cé',d:'dé',e:'e',f:'effe',g:'gé',h:'ache',i:'i',j:'ji',k:'ka',l:'elle',m:'emme',n:'enne',o:'o',p:'pé',q:'ku',r:'erre',s:'esse',t:'té',u:'u',v:'vé',w:'double vé',x:'ixe',y:'i grec',z:'zède',
 'é':'é accent aigu','è':'e accent grave','ê':'e accent circonflexe','à':'a accent grave','â':'a accent circonflexe','î':'i accent circonflexe','ô':'o accent circonflexe','û':'u accent circonflexe','ù':'u accent grave','ë':'e tréma','ï':'i tréma','ç':'cé cédille','œ':'o e collés','-':'trait d’union','’':'apostrophe',"'":'apostrophe'});
const EXTRA_NAMES={"'":'apostrophe','’':'apostrophe','-':'trait d’union'};
export const normalizeWord=s=>String(s??'').normalize('NFC').trim().toLowerCase().replace(/\s+/g,'');
const strip=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
// Mots donnés par le parent : un par ligne (ou séparés par des virgules); lettres, trait d'union et apostrophe seulement.
export function parseWords(text){
 const seen=new Set(),out=[];
 for(const raw of String(text??'').split(/[\n,;]+/)){
  const w=normalizeWord(raw);
  if(!w||w.length>25||!/^[\p{L}'’-]+$/u.test(w)||seen.has(w))continue;
  seen.add(w);out.push(w);if(out.length>=MAX_PARENT_WORDS)break;
 }
 return out;
}
export const dictationWords=(p,older,extra=[])=>{
 const isOlder=older??(p.schoolContext?.stage==='3e année'||p.id==='p2');
 return [...new Set([...(p.dictation?.words||[]),...extra,...(isOlder?DEFAULTS.older:DEFAULTS.young)])];
};
// Le groupe numéro n : 5 mots, en recommençant au début quand la liste est finie.
export function batchWords(p,index,older,extra=[]){
 const all=dictationWords(p,older,extra),n=all.length;
 return Array.from({length:Math.min(BATCH_SIZE,n)},(_,i)=>all[(index*BATCH_SIZE+i)%n]);
}
export const spellOut=word=>[...normalizeWord(word)].map(c=>LETTER_NAMES[c]||EXTRA_NAMES[c]||c);
// Les lettres à revoir : celles du mot proposé qui ne se retrouvent pas, dans l'ordre, dans ce que l'enfant a écrit
// (avec la plus longue suite commune : une lettre oubliée ne décale pas tout le reste).
export function checkWord(target,attempt){
 const t=[...normalizeWord(target)],a=[...normalizeWord(attempt)];
 const L=Array.from({length:t.length+1},()=>new Array(a.length+1).fill(0));
 for(let i=t.length-1;i>=0;i--)for(let j=a.length-1;j>=0;j--)L[i][j]=t[i]===a[j]?L[i+1][j+1]+1:Math.max(L[i+1][j],L[i][j+1]);
 const keep=new Set();let i=0,j=0;
 while(i<t.length&&j<a.length){if(t[i]===a[j]){keep.add(i);i++;j++;}else if(L[i+1][j]>=L[i][j+1])i++;else j++;}
 const wrong=t.map((_,k)=>k).filter(k=>!keep.has(k));
 const ok=!wrong.length&&a.length===t.length;
 return {ok,wrong,accentOnly:!ok&&strip(normalizeWord(target))===strip(normalizeWord(attempt)),tooShort:a.length<t.length,tooLong:a.length>t.length};
}
export function wordMarkup(word,wrong=[],syl=null){
 const letters=[...word];let k=0;
 const one=i=>`<span class="dm-l${wrong.includes(i)?' bad':''}">${esc(letters[i])}</span>`;
 if(!syl||syl.length<2||syl.join('')!==word)return letters.map((_,i)=>one(i)).join('');
 return syl.map((part,n)=>`<span class="dm-syl s${n%2}">${[...part].map(()=>one(k++)).join('')}</span>`).join('');
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// speak(text) renvoie une promesse qui finit quand la voix a fini (ou après un délai maximum, si la voix n'est pas disponible).
export function mountDictation(root,{words,speak,stop=()=>{},onWordDone=()=>{},onFinish=()=>{},nextLabel=''}){
 let alive=true,timers=[];
 const wait=ms=>new Promise(r=>{const t=setTimeout(r,ms);timers.push(t);});
 const say=text=>Promise.race([Promise.resolve().then(()=>speak(text)).catch(()=>{}),wait(Math.max(3500,text.length*140))]);
 const results=[];
 root.innerHTML=`<div class="dm"><div class="dm-dots" data-dm-dots></div><div class="dm-stage" data-dm-stage></div><p class="dm-msg" role="status" data-dm-msg></p></div>`;
 const stage=root.querySelector('[data-dm-stage]'),msg=root.querySelector('[data-dm-msg]'),dots=root.querySelector('[data-dm-dots]');
 const setDots=(i)=>{dots.innerHTML=words.map((_,k)=>`<i class="${results[k]==='ok'?'done':results[k]==='review'?'review':k===i?'now':''}"></i>`).join('');};
 const write=(i,target,tries)=>new Promise(resolve=>{
  stage.innerHTML=`<div class="dm-paper"><label class="dm-ask" for="dm-input">Écris le mot que tu as vu${syllabify(target).length>1?` (${syllabify(target).length} syllabes)`:''}</label><input id="dm-input" class="dm-line" data-dm-input type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-label="Écris le mot" placeholder="✏️"><button class="dm-ok" data-dm-ok type="button">✔ J’ai fini</button></div>`;
  const input=stage.querySelector('[data-dm-input]');let done=false,idle=null;
  const submit=()=>{if(done||!alive)return;const v=input.value;if(!normalizeWord(v))return;done=true;clearTimeout(idle);resolve(v);};
  input.addEventListener('input',()=>{clearTimeout(idle);if([...normalizeWord(input.value)].length>=[...target].length)idle=setTimeout(submit,1400);});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit();}});
  stage.querySelector('[data-dm-ok]').addEventListener('click',submit);
  timers.push(setTimeout(()=>{try{input.focus();}catch{}},150));
 });
 async function oneWord(i){
  const target=normalizeWord(words[i]);setDots(i);
  for(let tries=1;alive&&tries<=MAX_TRIES;tries++){
   // 1. Je lis le mot : il s'affiche et je le dis
   msg.textContent='Regarde bien, écoute le mot.';
   stage.innerHTML=`<button class="dm-word" data-dm-word type="button" aria-label="Réécouter le mot">${wordMarkup(target)}</button>`;
   stage.querySelector('[data-dm-word]').addEventListener('click',()=>speak(target));
   await say(target);if(!alive)return;await wait(400);
   // 2. À son tour, l'enfant relit le mot à voix haute (au premier essai seulement)
   if(tries===1){
    msg.textContent='À toi ! Lis le mot à voix haute.';
    stage.insertAdjacentHTML('beforeend','<button class="dm-step" data-dm-read type="button">🗣️ Je l’ai lu</button>');
    await new Promise(r=>{const btn=stage.querySelector('[data-dm-read]');btn.addEventListener('click',()=>{btn.remove();r();},{once:true});timers.push(setTimeout(()=>{btn.isConnected&&(btn.remove(),r());},60000));});if(!alive)return;
    await say('Bravo!');if(!alive)return;await wait(250);
   }
   // 3. Je découpe en syllabes : l'app les tape une à une, puis l'enfant les touche dans l'ordre en les disant
   const syls=syllabify(target);
   if(syls.length>1&&syls.join('')===target){
    msg.textContent='Découpons le mot en syllabes : '+syls.length+' syllabes.';
    stage.innerHTML=`<div class="dm-syls" data-dm-syls>${syls.map((x,k)=>`<span class="dm-chip" data-dm-chip="${k}">${esc(x)}</span>`).join('<i aria-hidden="true">·</i>')}</div>`;
    const chipsS=[...stage.querySelectorAll('[data-dm-chip]')];
    for(const [k,c] of chipsS.entries()){if(!alive)return;c.classList.add('lit');await say(syls[k]);await wait(250);}
    if(!alive)return;await wait(250);
    msg.textContent='À toi ! Touche chaque syllabe en la disant.';
    chipsS.forEach(c=>c.classList.remove('lit'));
    await new Promise(done=>{let at=0;chipsS.forEach((c,k)=>{c.setAttribute('role','button');c.tabIndex=0;const tap=()=>{if(!alive||k!==at)return;c.classList.add('lit');at++;speak(syls[k]);if(at>=syls.length)timers.push(setTimeout(done,600));};c.addEventListener('click',tap);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();tap();}});});});
    if(!alive)return;await say('Bravo!');if(!alive)return;await wait(200);
    stage.innerHTML=`<button class="dm-word" data-dm-word type="button" aria-label="Réécouter le mot">${wordMarkup(target,[],syls)}</button>`;
    stage.querySelector('[data-dm-word]').addEventListener('click',()=>speak(target));
   }
   // 4. J'épelle avec la voix : les lettres s'allument une à une
   msg.textContent='Écoute les lettres.';
   const names=spellOut(target);
   const chips=[...stage.querySelectorAll('.dm-l')];
   const lit=(async()=>{for(const c of chips){if(!alive)return;c.classList.add('lit');await wait(650);}})();
   await Promise.all([say(names.join(', ')),lit]);if(!alive)return;await wait(300);
   // 5. À son tour, l'enfant épelle : elle touche chaque lettre, dans l'ordre, en disant son nom
   msg.textContent='À toi ! Épelle le mot : touche chaque lettre en la disant.';
   const letters=[...target];
   const groupsK=syls.length>1&&syls.join('')===target?syls:[target];let kk=0;
   stage.innerHTML=`<div class="dm-spell" data-dm-spell>${groupsK.map(g=>`<span class="dm-sg">${[...g].map(c=>`<button type="button" class="dm-key" data-dm-key="${kk++}">${esc(c)}</button>`).join('')}</span>`).join('')}</div>`;
   await new Promise(done=>{
    let at=0,miss=0;const keys=[...stage.querySelectorAll('[data-dm-key]')];
    keys.forEach((btn,k)=>btn.addEventListener('click',()=>{
     if(!alive||btn.classList.contains('lit'))return;
     if(k===at){btn.classList.add('lit');at++;miss=0;speak(names[k]);if(at>=letters.length)timers.push(setTimeout(done,700));else keys[at].classList.remove('hint');}
     else{btn.classList.add('shake');timers.push(setTimeout(()=>btn.classList.remove('shake'),400));if(++miss>=2&&keys[at])keys[at].classList.add('hint');}
    }));
   });if(!alive)return;
   stage.innerHTML=`<button class="dm-word" data-dm-word type="button" aria-label="Réécouter le mot">${wordMarkup(target,[],syls)}</button>`;
   chips.length&&stage.querySelectorAll('.dm-l').forEach(c=>c.classList.add('lit'));
   await say('Bien épelé!');if(!alive)return;await wait(300);
   // 3. Le mot disparaît par magie
   msg.textContent='Abracadabra… le mot disparaît !';
   stage.querySelector('[data-dm-word]')?.classList.add('vanish');
   stage.insertAdjacentHTML('beforeend','<div class="dm-sparkles" aria-hidden="true">✨ ✨ ✨</div>');
   await wait(1100);if(!alive)return;
   // 4. J'écris
   msg.textContent='À toi ! Écris le mot sur la ligne.';
   const attempt=await write(i,target,tries);if(!alive)return;
   const res=checkWord(target,attempt);
   if(res.ok){
    stage.innerHTML=`<div class="dm-bravo" aria-live="polite"><span aria-hidden="true">🌟</span><b>${wordMarkup(target)}</b></div>`;msg.textContent='Bravo !';
    results[i]=tries===1?'ok':'ok';setDots(i);onWordDone(target,true,tries);
    await say('Bravo!');if(!alive)return;await wait(300);return;
   }
   // Pas tout à fait : on aide, on le redit, puis on recommence.
   if(tries>=MAX_TRIES){
    stage.innerHTML=`<div class="dm-help"><b>${wordMarkup(target)}</b></div>`;msg.textContent='On le reverra bientôt. '+coachTip(target,attempt,res.wrong);results[i]='review';setDots(i);onWordDone(target,false,tries);
    await say(target);if(!alive)return;await wait(900);return;
   }
   const tip=coachTip(target,attempt,res.wrong);msg.textContent='Presque ! '+tip;
   stage.innerHTML=`<div class="dm-help"><b>${wordMarkup(target,res.accentOnly?[...target].map((c,k)=>strip(c)!==c?k:-1).filter(k=>k>=0):res.wrong)}</b></div>`;
   await say(target);if(!alive)return;await say('Presque! '+tip);if(!alive)return;await wait(1200);if(!alive)return;
   msg.textContent='On recommence ensemble.';await wait(700);
  }
 }
 (async()=>{
  for(let i=0;alive&&i<words.length;i++){await oneWord(i);}
  if(!alive)return;
  const good=results.filter(r=>r==='ok').length;
  setDots(-1);
  stage.innerHTML=`<div class="dm-end"><span aria-hidden="true">🎉</span><h2>Bravo !</h2><p>${good} mot${good>1?'s':''} bien écrit${good>1?'s':''} sur ${words.length}.</p>${nextLabel?`<button class="dm-next" data-dm-next type="button">${esc(nextLabel)}</button>`:''}<button class="dm-again" data-dm-again type="button">↺ Recommencer</button></div>`;
  msg.textContent='';
  onFinish({results:[...results],words:[...words]});
 })();
 return {destroy(){alive=false;timers.forEach(clearTimeout);timers=[];stop();root.innerHTML='';}};
}

// Espace parent : ajouter des mots au vocabulaire de l'enfant (un par ligne). Ils passent avant les mots proposés par l'application.
export function dictationParent(p){
 const mine=(p.dictation?.words||[]).join('\n'),review=(p.dictation?.review||[]);
 return `<section class="panel dictation-parent" data-parent-group="week"><h2>Mots à écrire (dictée magique)</h2>
 <p>Ajoute les mots du vocabulaire de ${esc(p.name)}, un par ligne. L'enfant les voit, les entend, les épelle, puis les écrit sur une ligne de cahier (Apple Pencil avec Scribble, ou clavier). Ils passent avant les mots proposés par l'application.</p>
 <form id="dictation-form"><label>Mots (un par ligne)<textarea name="words" rows="6" maxlength="4000" placeholder="baigné&#10;fenêtre">${esc(mine)}</textarea></label><button>Enregistrer les mots</button></form>
 ${review.length?`<p class="small">À revoir (mal écrits trois fois) : ${review.map(esc).join(', ')}.</p>`:''}<p class="small" data-dictation-status role="status"></p></section>`;
}
