import {openAdvancedPopit,advancedProblem} from './popit-advanced.js';
import {advanced} from './learning.js';
export const popOperations=p=>advanced(p)?['+','−','×','÷']:['+','−','×'];
export function popProblem(p,op,round=0){
 if(!popOperations(p).includes(op))throw Error('Opération non proposée à ce niveau');
 if(advanced(p))return advancedProblem(op,round);
 const a=op==='×'?2+(round%2):2+(round%5),b=op==='×'?1+(round%3):1+((round*2)%4);
 if(op==='+')return {a,b,op,total:a+b,target:a+b,initial:a,columns:5,instruction:`${a} bulles sont déjà enfoncées. Ajoute ${b} bulle${b>1?'s':''}.`};
 if(op==='−')return {a:a+b,b,op,total:a+b,target:a,initial:a+b,columns:5,instruction:`${a+b} bulles sont déjà enfoncées. Relève ${b} bulle${b>1?'s':''}. Compte celles qui restent enfoncées.`};
 if(op==='×')return {a,b,op,total:a*b,target:a*b,initial:0,columns:b,instruction:`Enfonce ${a} rangées de ${b} bulle${b>1?'s':''}. Compte toutes les bulles.`};
 return {a:a*b,b,op,total:a*b,target:a,initial:0,columns:b,instruction:`Fais des groupes de ${b} bulle${b>1?'s':''}. Combien de groupes as-tu?`};
}
export function popChoices(n){return [...new Set([Math.max(0,n-1),n,n+1])];}
export function openPopit(p,options={}){
 return openAdvancedPopit(p,{...options,problem:advanced(p)?null:(op,round)=>popProblem(p,op,round)});
}
