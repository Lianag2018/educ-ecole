// Voix de conteuse : on lit une histoire phrase par phrase, avec une expression et une pause adaptées au sens
// (narration douce, question, exclamation, parole d'un personnage, suspense, chuchotement). Le timbre vient de la voix de l'appareil;
// ici on règle seulement le débit, la hauteur, le volume et les pauses, toujours doucement.
export const KIND_PARAMS=Object.freeze({
 narration:{rate:.82,pitch:.97,volume:.85,pause:520},
 question:{rate:.85,pitch:1.06,volume:.9,pause:640},
 exclaim:{rate:.88,pitch:1.09,volume:.95,pause:640},
 dialogue:{rate:.86,pitch:1.1,volume:.92,pause:560},
 trail:{rate:.76,pitch:.94,volume:.8,pause:900},
 whisper:{rate:.76,pitch:.92,volume:.62,pause:620}
});
const LETTER=/[\p{L}\p{N}]/u;
export function classify(s){
 const t=s.trim();
 if(/^\(.*\)[.!?…]*$/.test(t)||/\bchut\b/i.test(t))return 'whisper';
 if(/(\.{3}|…)["»”)]*$/.test(t))return 'trail';
 if(/[?]["»”)]*$/.test(t))return 'question';
 if(/[!]["»”)]*$/.test(t))return 'exclaim';
 return /[«“"]/.test(t)||/^[—–-]\s/.test(t)?'dialogue':'narration';
}
// Renvoie des morceaux {text,start,kind,rate,pitch,volume,pause}; start = position dans le texte d'origine (pour le surlignage).
// Les paroles entre « » sont lues à part (voix un peu plus vive), et la suite (« dit-il ») reste avec la narration.
export function splitForTelling(text){
 const src=String(text||''),out=[],n=src.length;let segStart=0,quote=false;
 const push=(a,b,speech)=>{
  let raw=src.slice(a,b),lead=raw.length-raw.trimStart().length;raw=raw.trim();
  if(speech){const m=raw.match(/^[«“"]\s*/);if(m){raw=raw.slice(m[0].length);lead+=m[0].length;}raw=raw.replace(/\s*[»”"]$/,'');}
  if(!LETTER.test(raw))return;
  let kind=classify(raw);if(speech&&kind==='narration')kind='dialogue';
  out.push({text:raw,start:a+lead,kind,speech:Boolean(speech),...KIND_PARAMS[kind]});
 };
 for(let k=0;k<n;k++){
  const ch=src[k];
  if(!quote&&(ch==='«'||ch==='“')){push(segStart,k,false);segStart=k;quote=true;continue;}
  if(quote&&(ch==='»'||ch==='”')){push(segStart,k+1,true);segStart=k+1;quote=false;continue;}
  if(!quote&&/[.!?…]/.test(ch)){let e=k+1;while(e<n&&/[.!?…]/.test(src[e]))e++;while(e<n&&/["»”)\]]/.test(src[e]))e++;push(segStart,e,false);segStart=e;k=e-1;}
 }
 push(segStart,n,quote);
 out.forEach((x,i)=>{const nx=out[i+1];if(x.speech&&nx&&/^\p{Ll}/u.test(nx.text))x.pause=220;});
 if(out.length)out[out.length-1].pause=0;
 return out;
}
// Lit les morceaux l'un après l'autre. speakOne(segment,{onProgress,onState}) lit un morceau; schedule(fn,ms) programme la pause.
// Renvoie {stop}. onState reçoit 'speaking' | 'ended' | 'error' pour l'ensemble de l'histoire.
export function tell(text,{speakOne,onProgress=()=>{},onState=()=>{},schedule=(f,ms)=>setTimeout(f,ms),cancel=id=>clearTimeout(id)}){
 const segs=splitForTelling(text);let i=0,timer=null,dead=false;
 const next=()=>{
  if(dead)return;if(i>=segs.length){onState('ended','');return;}
  const s=segs[i++];
  speakOne(s,{onProgress:e=>{if(!dead&&Number.isInteger(e?.charIndex))onProgress({...e,charIndex:e.charIndex+s.start});else if(!dead)onProgress(e);},
   onState:(st,msg)=>{if(dead)return;if(st==='ended'){if(s.pause>0)timer=schedule(next,s.pause);else next();}else if(st==='error'){dead=true;onState('error',msg);}else onState(st,msg);}});
 };
 if(!segs.length){onState('ended','');return {stop(){}};}
 next();
 return {stop(){dead=true;if(timer!==null)cancel(timer);}};
}
