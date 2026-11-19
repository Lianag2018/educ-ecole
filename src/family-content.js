// Contenu de la famille livré avec l'application (dossier family/, absent tant que la famille ne l'a pas ajouté) : histoires de l'école et mots du livre.
// Au démarrage, on le charge une fois par version; sans fichier, rien ne change.
import {parseStories,savePrivate} from './private-stories.js';
import {parseBookWords,saveBookWords} from './book-words.js';
const VKEY='atelier-mots-family-content-v1';
async function grab(url){try{const r=await fetch(url,{cache:'no-cache'});if(!r.ok||!/text|markdown|octet/i.test(r.headers.get('content-type')||'text'))return '';const t=await r.text();return /^\s*<(!doctype|html)/i.test(t)?'':t;}catch{return '';}}
export async function seedFamilyContent(){
 const [stories,words]=await Promise.all([grab('/family/histoires-ecole.md'),grab('/family/mots-du-livre.md')]);
 const stamp=`${stories.length}:${words.length}`;
 if(stamp==='0:0'||globalThis.localStorage?.getItem(VKEY)===stamp)return false;
 if(stories){const l=parseStories(stories);if(l.length)savePrivate(l);}
 if(words){const m=parseBookWords(words);if(Object.keys(m).length)saveBookWords(m);}
 try{globalThis.localStorage?.setItem(VKEY,stamp);}catch{}
 return true;
}
