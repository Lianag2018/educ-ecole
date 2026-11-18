// Lecture à voix haute : l'enfant lit le nombre affiché et le dit à un adulte; l'adulte touche « Bien dit »
// ou « À revoir ». L'application ne dit le nombre qu'à la demande (« À revoir »), pas avant.
// Ordre des lignes de la 3e année : de 1 000 à 9 999, du plus simple au plus grand.
export const ADVANCED_ORDER=Object.freeze(['J','L','M','N','P']);
export const createReadAloud=()=>({done:new Map(),message:''});
export const doneIn=(s,row)=>s.done.get(row)??new Set();
export function markRead(s,row,index){const set=new Set(doneIn(s,row));set.add(index);s.done.set(row,set);return set.size;}
export const rowComplete=(s,row,length=10)=>doneIn(s,row).size>=length;
// Prochain nombre à lire : d'abord ceux de la ligne qui ne sont pas encore dits (en avançant), puis la ligne suivante.
export function nextPosition(s,order,row,index,length=10){
 const set=doneIn(s,row);
 for(let k=1;k<=length;k++){const i=(index+k)%length;if(!set.has(i))return {row,index:i,rowDone:false,finished:false};}
 const at=order.indexOf(row),finished=at===order.length-1,next=order[(at+1)%order.length],seen=doneIn(s,next);
 let first=0;while(first<length-1&&seen.has(first))first++;
 return {row:next,index:first,rowDone:true,finished};
}
export const dotsMarkup=(s,row,index,length=10)=>Array.from({length},(_,i)=>`<i class="${doneIn(s,row).has(i)?'done':i===index?'now':''}"></i>`).join('');
