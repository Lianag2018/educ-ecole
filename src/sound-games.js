// Jeux de syllabes (démarche de l'école, reformulée) : « Les amoureux » = une consonne et une voyelle forment une syllabe à lire, puis on trouve un mot qui la contient.
import {lessonWords} from './sound-lessons.js';
const pool=[...new Set(Object.values(lessonWords).flatMap(s=>s.split(' ')))].map(w=>({plain:w.replace(/-/g,''),syl:w.split('-')}));
const CV=/^(ch|[bcdfgjklmnprstvz])(a|i|o|u|é|ou|on|an|in|oi|eu)$/;
export const loverSyllables=[...new Set(pool.flatMap(w=>w.syl).filter(s=>CV.test(s)&&pool.some(w=>w.syl.includes(s))))].sort();
const split=s=>{const m=s.match(CV);return m?[m[1],m[2]]:null;};
const pick=(arr,seed,n)=>Array.from({length:n},(_,i)=>arr[(seed*7+i*3)%arr.length]);
const rot=(choices,k)=>{const c=[...choices];for(let i=0;i<k%c.length;i++)c.push(c.shift());return c;};
// 6 cartes par partie; chaque partie (n) montre d'autres syllabes.
export function loversCards(n=0,count=6){
 const cards=[];
 for(let i=0;i<count;i++){
  const syl=loverSyllables[(n*count+i*5)%loverSyllables.length],[c,v]=split(syl);
  if(i%2===0){
   const others=[...new Set(pick(loverSyllables.filter(s=>s!==syl&&(split(s)[0]===c||split(s)[1]===v)).concat(loverSyllables.filter(s=>s!==syl)),n+i,6))].filter(s=>s!==syl).slice(0,2);
   const choices=rot([syl,...others],i);
   cards.push({id:`lovers-${n}-${i}`,skill:'syllabes',level:1,prompt:`« ${c} » et « ${v} » sont amoureux. Quelle syllabe forment-ils?`,text:`${c} + ${v}`,choices,answer:choices.indexOf(syl),explanation:`${c} et ${v} ensemble font « ${syl} ».`,grade:1,storyActivity:true});
  }else{
   const right=pool.find(w=>w.syl.includes(syl)),wrong=pool.filter(w=>!w.syl.includes(syl)&&!w.plain.includes(syl));
   const others=pick(wrong,n+i,2),choices=rot([right.plain,...others.map(w=>w.plain)],i);
   cards.push({id:`lovers-${n}-${i}`,skill:'syllabes',level:1,prompt:`Quel mot contient la syllabe « ${syl} »?`,text:`Cherche « ${syl} » dans le mot.`,choices,answer:choices.indexOf(right.plain),explanation:`Dans ${right.syl.join('-')}, on entend « ${syl} ».`,grade:1,storyActivity:true});
  }
 }
 return cards;
}
