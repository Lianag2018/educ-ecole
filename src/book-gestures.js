// Gestes du livre de l'école (« Pour joindre le geste à la parole »), importés par la famille (fichier family/gestes-livre.md), gardés dans l'appareil.
// Format : « ## graphie — Titre » puis la description du geste. L'app ne contient aucun de ces textes : sans fichier, elle garde ses propres gestes.
const KEY='atelier-mots-book-gestures-v1';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
// Quel geste du livre correspond à chaque son de l'app (premier trouvé).
export const GRAPHIES_FOR_SOUND=Object.freeze({
 ou:['ou'],on:['on et om'],ch:['ch'],a:['a'],i:['i'],u:['u'],f:['f','ph'],v:['v'],m:['m'],l:['l'],s:['s','c [s]','ç'],
 in:['in et im','aim, ain et ein','yn et ym'],eacute:['é','ai [é]','ez','er'],egrave:['è','ê','ë','ai [è]','ei'],
 o:['o','au','eau'],eu:['eu'],oe:['œu','eu [e]'],e:['e'],an:['an et en','am et em'],un:['un et um'],p:['p'],b:['b'],t:['t'],d:['d'],
 k:['k','c','qu','q'],g:['g','gu'],n:['n'],gn:['gn'],z:['z','s [z]'],j:['j','g [j]'],r:['r'],y:['ill et il'],w:['w','oi']
});
export function parseGestures(text){
 const out={};
 for(const block of String(text??'').replace(/\r/g,'').split(/\n(?=## )/)){
  const lines=block.trim().split('\n'),m=lines[0].match(/^##\s+(.+?)\s+[—–]\s+.+$/);if(!m)continue;
  const g=m[1].trim().toLowerCase(),body=lines.slice(1).join(' ').replace(/\s+/g,' ').trim();
  if(g==='introduction'||!body||body.length>400)continue;
  out[g]=body;
 }
 return out;
}
export const loadBookGestures=()=>{try{const v=JSON.parse(store()?.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}};
export function saveBookGestures(map){try{store()?.setItem(KEY,JSON.stringify(map));}catch{}return map;}
export function bookGestureFor(soundId){
 const all=loadBookGestures();for(const g of GRAPHIES_FOR_SOUND[soundId]||[])if(all[g])return all[g];return '';
}
