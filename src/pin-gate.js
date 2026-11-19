// Petit code à 4 chiffres pour entrer dans le monde de chaque fille (verrou familial, pas une sécurité forte).
// Seuls les empreintes SHA-256 des codes sont dans le code; un code changé est gardé sur l'appareil.
const DEFAULTS=['7bfad9aad1348f1b9ea549362073ea86fdf5c7366cc008e8a82d8f3910fae728','e831d985aaf11609d46f6383356195bd0dea36b45ca99d91c959fc42d9049c46'];
const KEY='atelier-mots-pin-v1',NAMES=['Mely-Ann','Liana'];
const unlocked=new Set();
const sha=async s=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('atelier-mots:'+s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');};
const custom=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
export async function setPin(index,pin){if(!/^\d{4}$/.test(pin))return false;const c=custom();c[index]=await sha(pin);localStorage.setItem(KEY,JSON.stringify(c));return true;}
export async function checkPin(index,pin){return await sha(pin)===(custom()[index]||DEFAULTS[index]);}
function ask(index){return new Promise(done=>{
 const o=document.createElement('div');o.className='pin-gate';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Code secret de '+NAMES[index]);
 o.innerHTML=`<div class="pin-box"><h2>Code de ${NAMES[index]}</h2><p>Tape ton code secret.</p><div class="pin-dots" aria-live="polite"><i></i><i></i><i></i><i></i></div><div class="pin-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-d="${n}">${n}</button>`).join('')}<button type="button" data-x="back" aria-label="Effacer">⌫</button><button type="button" data-d="0">0</button><button type="button" data-x="cancel" aria-label="Annuler">✕</button></div><button type="button" class="pin-forgot" data-x="forgot">Code oublié ?</button></div>`;
 let v='',busy=false;const dots=[...o.querySelectorAll('.pin-dots i')];
 const paint=()=>dots.forEach((d,i)=>d.classList.toggle('on',i<v.length));
 const close=r=>{document.removeEventListener('keydown',key,true);o.remove();done(r);};
 const push=async d=>{if(busy||v.length>=4)return;v+=d;paint();if(v.length<4)return;busy=true;
  if(await checkPin(index,v))return close(true);
  o.querySelector('.pin-box').classList.add('bad');setTimeout(()=>{o.querySelector('.pin-box')?.classList.remove('bad');v='';paint();busy=false;},600);};

 const reset=()=>{document.removeEventListener('keydown',key,true);
  const a=11+Math.floor(Math.random()*9),m=6+Math.floor(Math.random()*4);
  o.querySelector('.pin-box').innerHTML=`<h2>Nouveau code de ${NAMES[index]}</h2><p>Pour un adulte : combien font ${a} × ${m} ?</p><form class="pin-reset"><input name="q" inputmode="numeric" autocomplete="off" aria-label="Réponse de l’adulte"><label>Nouveau code (4 chiffres)<input name="n" inputmode="numeric" maxlength="4" autocomplete="off"></label><label>Répète le nouveau code<input name="c" inputmode="numeric" maxlength="4" autocomplete="off"></label><p class="pin-msg" role="alert"></p><button type="submit" class="pin-save">Enregistrer</button><button type="button" class="pin-cancel" data-x="cancel">Annuler</button></form>`;
  const f=o.querySelector('form'),msg=f.querySelector('.pin-msg');
  f.addEventListener('submit',async e=>{e.preventDefault();const d=new FormData(f);
   if(Number(d.get('q'))!==a*m){msg.textContent='Ce n’est pas la bonne réponse.';return;}
   if(!/^\d{4}$/.test(d.get('n'))){msg.textContent='Le code doit avoir 4 chiffres.';return;}
   if(d.get('n')!==d.get('c')){msg.textContent='Les deux codes ne sont pas pareils.';return;}
   await setPin(index,d.get('n'));close(true);});
  f.q.focus();};
 const key=e=>{if(/^\d$/.test(e.key)){e.preventDefault();push(e.key);}else if(e.key==='Backspace'){v=v.slice(0,-1);paint();}else if(e.key==='Escape')close(false);};
 o.addEventListener('click',e=>{const b=e.target.closest('button');if(e.target===o)return close(false);if(!b)return;if(b.dataset.d)push(b.dataset.d);else if(b.dataset.x==='back'&&!busy){v=v.slice(0,-1);paint();}else if(b.dataset.x==='cancel')close(false);else if(b.dataset.x==='forgot')reset();});
 document.addEventListener('keydown',key,true);document.body.append(o);
});}
export function mountPinGate(){
 document.addEventListener('click',async e=>{
  const b=e.target.closest?.('[data-game-child],[data-welcome-child]');if(!b||b.dataset.pinOk)return;
  const index=Number(b.dataset.gameChild??b.dataset.welcomeChild);if(!(index in NAMES)||unlocked.has(index))return;
  e.preventDefault();e.stopImmediatePropagation();
  if(!globalThis.crypto?.subtle){unlocked.add(index);b.dataset.pinOk='1';b.click();return;}
  if(await ask(index)){unlocked.add(index);b.click();}
 },true);
}
