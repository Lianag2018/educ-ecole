// « Les histoires de l'école » : histoires importées par la famille (usage personnel), gardées SEULEMENT dans cet appareil (localStorage).
// Rien n'est ajouté au dépôt public ni au site : l'app ne contient aucun texte du livre, elle sait seulement lire un fichier que la famille charge.
// Format : « ## graphie — Titre » ouvre une histoire; chaque paragraphe (séparé par une ligne vide) est une page; *mot* marque un mot du son.
const KEY='atelier-mots-private-stories-v1';
const COLORS=['#2a7f9e','#b5543a','#6a8f2d','#8a4fa0','#c0892b','#2c7a63'];
const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const chunk=(p,max=150)=>{const parts=p.split(/(?<=[.!?»])\s+/),out=[];let cur='';for(const x of parts){if(cur&&(cur+' '+x).length>max){out.push(cur);cur=x;}else cur=cur?cur+' '+x:x;}if(cur)out.push(cur);return out;};
const tokens=s=>(String(s).match(/\p{L}+/gu)||[]);
export function parseStories(text){
 const out=[];let cur=null;
 const flush=()=>{if(cur&&cur.paras.length)out.push(cur);cur=null;};
 const blocks=String(text).replace(/\r/g,'').split(/\n{2,}/);
 for(const raw of blocks){
  const lines=raw.split('\n');
  const head=lines.find(l=>/^#{1,3}\s+/.test(l));
  let body=lines.filter(l=>l!==head).join(' ').trim();
  if(head){flush();const h=head.replace(/^#{1,3}\s+/,'').trim(),m=h.match(/^(.+?)\s+[—–-]\s+(.+)$/);cur={graphie:(m?m[1]:h).trim(),title:(m?m[2]:h).trim(),paras:[]};}
  if(cur&&body)cur.paras.push(...chunk(body));
 }
 flush();
 return out.map((s,i)=>{
  const g=s.graphie.toLowerCase(),pages=s.paras.map(p=>{
   const marked=[...p.matchAll(/\*([^*]+)\*/g)].flatMap(m=>tokens(m[1]).map(w=>w.toLowerCase()));
   const text=p.replace(/\*/g,'');
   const words=marked.length?[...new Set(marked)]:[...new Set(tokens(text).filter(w=>g.length>=2?w.toLowerCase().includes(g.replace(/\s+/g,'')):w.toLowerCase()===g))];
   return {text,scene:'📖',words};
  });
  return {id:'priv-'+slug(s.graphie+'-'+s.title),title:s.title,label:s.graphie,sound:s.graphie,cover:'📖',color:COLORS[i%COLORS.length],private:true,pages,activity:[]};
 }).filter(s=>s.pages.length);
}
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export function loadPrivate(){try{const v=JSON.parse(store()?.getItem(KEY)||'[]');return Array.isArray(v)?v:[];}catch{return [];}}
export function savePrivate(list){const m=new Map(loadPrivate().map(s=>[s.id,s]));list.forEach(s=>m.set(s.id,s));try{store()?.setItem(KEY,JSON.stringify([...m.values()]));}catch{}return [...m.values()];}
export function clearPrivate(){try{store()?.removeItem(KEY);}catch{}}
export const privateStoryFor=id=>String(id).startsWith('priv-')?loadPrivate().find(s=>s.id===id)||null:null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const PS_PER_PAGE=6;
export const psPages=()=>Math.max(1,Math.ceil(loadPrivate().length/PS_PER_PAGE));
export function privateStoriesMarkup(page=0){
 const list=loadPrivate(),pages=psPages(),at=Math.max(0,Math.min(page,pages-1));
 const items=list.slice(at*PS_PER_PAGE,(at+1)*PS_PER_PAGE).map(s=>`<button type="button" class="ps-item" data-private-open="${esc(s.id)}" style="--ss:${esc(s.color)}"><span class="ps-g">${esc(s.label)}</span><b>${esc(s.title)}</b></button>`).join('');
 return `<section class="private-stories" aria-label="Les histoires de l’école"><div class="tb-top"><button data-action="french">‹ Mon français</button><span>📚 ${list.length} histoire${list.length>1?'s':''}</span></div>${list.length?`<div class="ps-grid">${items}</div>${pages>1?`<div class="tb-nav"><button data-ps-prev aria-label="Page précédente" ${at<=0?'disabled':''}>◀</button><span>${at+1} / ${pages}</span><button data-ps-next aria-label="Page suivante" ${at>=pages-1?'disabled':''}>▶</button></div>`:''}`:'<p class="tb-intro">Les histoires de ton livre d’école seront ici quand un adulte les aura ajoutées. En attendant, choisis des histoires des sons ou de petites lectures!</p>'}<div class="ps-more"><button type="button" data-action="sound-garden">🌟 Histoires des sons</button><button type="button" data-scene="reading">📖 Lire de petites histoires</button></div><div class="ps-tools"><label class="ss-again ps-import">📥 Ajouter des histoires ou des mots<input type="file" accept=".md,.txt,.markdown" data-private-file hidden></label>${list.length?'<button type="button" class="ps-clear" data-private-clear>Effacer de cet appareil</button>':''}<small>Les histoires restent sur cet appareil. Elles ne sont jamais envoyées sur Internet.</small></div></section>`;
}
