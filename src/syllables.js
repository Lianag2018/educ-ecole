// Découper un mot en syllabes à l'écrit (méthode d'école) : « bi-bli-o-thè-que ». Règles simples du français, sans prétendre à la perfection :
// on garde d'abord le découpage connu (mots des leçons), sinon on applique les règles ci-dessous.
import {lessonWords} from './sound-lessons.js';
const V='aeiouyàâäéèêëîïôöûùüœæ';
const known=new Map(Object.values(lessonWords).flatMap(s=>s.split(' ')).map(w=>[w.replace(/-/g,''),w.split('-')]));
const NUC=new RegExp(`^(?:eau|œu|ain|ein|aim|oin|ien|oi|ou|ai|ei|au|eu|ui|[${V}](?:[nm](?![${V}h]))?)`,'i');
const DIG=['ch','ph','th','gn','qu'];
const LIQ=new Set(['pl','pr','bl','br','cl','cr','gl','gr','dr','tr','fl','fr','vr']);
function tokenize(w){
 const t=[];let i=0;
 while(i<w.length){
  const rest=w.slice(i),low=rest.toLowerCase();
  if(low.startsWith('qu')||(/^gu[eiéèêy]/.test(low))){t.push({c:rest.slice(0,2),v:false});i+=2;continue;}
  const dg=DIG.find(d=>low.startsWith(d));
  if(dg){t.push({c:rest.slice(0,2),v:false});i+=2;continue;}
  const m=rest.match(NUC);
  if(m){t.push({c:m[0],v:true});i+=m[0].length;continue;}
  t.push({c:rest[0],v:false});i++;
 }
 return t;
}
export function syllabify(word){
 const w=String(word??'').normalize('NFC').toLowerCase().replace(/[^\p{L}'’-]/gu,'');
 if(!w)return [];
 if(w.includes('-')&&!w.startsWith('-'))return w.split('-').flatMap(syllabify);
 if(known.has(w))return known.get(w);
 let t=tokenize(w);
 // e muet final après une voyelle (tue, vie, fée) : il s'attache à la syllabe d'avant
 if(t.length>1&&t[t.length-1].c==='e'&&t[t.length-2].v)t.splice(t.length-2,2,{c:t[t.length-2].c+'e',v:true});
 const nuc=t.map((x,i)=>x.v?i:-1).filter(i=>i>=0);
 if(nuc.length<2)return [w];
 const cuts=[];
 for(let k=0;k<nuc.length-1;k++){
  const a=nuc[k],b=nuc[k+1],between=b-a-1;
  if(between===0)cuts.push(b);
  else if(between===1)cuts.push(b-1);
  else{const lastTwo=(t[b-2].c+t[b-1].c).toLowerCase();cuts.push(LIQ.has(lastTwo)?b-2:a+2);}
 }
 const out=[];let from=0;
 for(const c of cuts){out.push(t.slice(from,c).map(x=>x.c).join(''));from=c;}
 out.push(t.slice(from).map(x=>x.c).join(''));
 return out.filter(Boolean);
}
export const syllableCount=w=>syllabify(w).length;
