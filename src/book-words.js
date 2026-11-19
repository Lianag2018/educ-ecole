// « Mots du livre » : listes de mots par graphie, importées par la famille (fichier family/mots-du-livre.md ajouté à l'application ou chargé à la main).
// Format : « ## graphie | id-du-son » puis des mots séparés par des espaces ou des retours à la ligne. Gardés dans l'appareil (localStorage).
const KEY='atelier-mots-book-words-v1';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export function parseBookWords(text){
 const out={};let cur=null;
 for(const line of String(text??'').replace(/\r/g,'').split('\n')){
  const h=line.match(/^#{1,3}\s+(.+?)\s*\|\s*([a-z-]+)\s*$/i);
  if(h){cur=h[2].toLowerCase();out[cur]=out[cur]||[];continue;}
  if(!cur||/^#/.test(line))continue;
  for(const w of line.split(/[\s,;]+/)){const x=w.trim().toLowerCase();if(x&&x.length<=25&&/^[\p{L}'’-]+$/u.test(x)&&!out[cur].includes(x))out[cur].push(x);}
 }
 return out;
}
export const loadBookWords=()=>{try{const v=JSON.parse(store()?.getItem(KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}};
export function saveBookWords(map){try{store()?.setItem(KEY,JSON.stringify(map));}catch{}return map;}
export const bookWordsFor=id=>Array.isArray(loadBookWords()[id])?loadBookWords()[id]:[];
