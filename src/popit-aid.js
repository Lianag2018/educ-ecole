import {fullPopitMarkup,initialPopit,togglePhysicalPopit,pressPopitAxis,pathFeedback,physicalFeedback} from './popit-advanced.js';

// Only offer a board whose actual axes/units can represent the current exercise.
export function popitExercise(card){
 const parts=card?.beginnerMath||String(card?.islandMath||card?.text||'').match(/^(\d+)\s*([+−×÷])\s*(\d+)$/)?.slice(1);
 if(!parts)return null;
 const [aa,op,bb]=parts,a=Number(aa),b=Number(bb);
 if(!Number.isInteger(a)||!Number.isInteger(b))return null;
 const axes=a>=1&&a<=12&&b>=1&&b<=12;
 if(!((['+','×'].includes(op)&&axes)||(op==='−'&&a>=0&&a<=144&&b>=0&&b<=a)||(op==='÷'&&a>=1&&b>=1&&b<=12&&a%b===0&&a/b<=12)))return null;
 return {a,b,op,target:op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b};
}

// This aid does not answer the lesson or award points. The child returns to
// the same question, and the caller records that help was used.
export function openPopitAid(item,{stop=()=>{}}={}){
 const previous=document.activeElement,d=document.createElement('dialog');
 d.className='popit-dialog popit-advanced popit-expanded';d.setAttribute('aria-labelledby','popit-aid-title');
 const pathMode=['+','×'].includes(item.op),table=['×','÷'].includes(item.op);
 let pressed=pathMode?new Set():initialPopit(item),row=null,col=null,last=null;
 const instruction=pathMode?'Choisis les deux numéros, puis enfonce le chemin jusqu’au croisement.':item.op==='−'?`${item.a} bulles sont enfoncées. Relève ${item.b} bulles. Compte celles qui restent.`:`Cherche ${item.a} dans la colonne ${item.b}. Le numéro de la ligne donne le résultat.`;
 d.innerHTML=`<div class="popit-top"><h2 id="popit-aid-title">${item.a} ${item.op} ${item.b} = ?</h2><button data-close>Revenir au calcul</button></div><p>${instruction}</p>${fullPopitMarkup(table,pressed,item)}<p data-count role="status"></p><button data-clear>Recommencer la manipulation</button>`;
 const close=()=>{stop();d.close();d.remove();previous?.focus();};
 function refresh(){
  const feedback=pathMode?pathFeedback(item,pressed,row,col):null;
  d.querySelectorAll('[data-full-bubble]').forEach(b=>{const i=+b.dataset.fullBubble,r=Math.floor(i/12)+1,c=i%12+1;b.setAttribute('aria-pressed',String(pressed.has(i)));b.classList.toggle('popit-guide',pathMode?feedback.cells.includes(i):table&&(r===row||c===col));b.classList.toggle('popit-correct',!!feedback?.correct&&r===row&&c===col);});
  d.querySelectorAll('[data-pop-axis]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.axisNumber===(b.dataset.popAxis==='row'?row:col))));
  d.querySelector('[data-count]').textContent=feedback?feedback.text:physicalFeedback(item,pressed,last);
 }
 d.querySelectorAll('[data-full-bubble]').forEach(b=>b.onclick=()=>{last=+b.dataset.fullBubble;togglePhysicalPopit(pressed,last);refresh();});
 d.querySelectorAll('[data-pop-axis]').forEach(b=>b.onclick=()=>{const n=+b.dataset.axisNumber,axis=b.dataset.popAxis;if(pathMode||table){if(pathMode)pressed.clear();if(axis==='row')row=row===n?null:n;else col=col===n?null:n;}else pressPopitAxis(pressed,axis,n);refresh();});
 d.querySelector('[data-clear]').onclick=()=>{pressed=pathMode?new Set():initialPopit(item);row=null;col=null;last=null;refresh();};
 d.querySelector('[data-close]').onclick=close;d.addEventListener('cancel',e=>{e.preventDefault();close();});
 document.body.append(d);refresh();d.showModal();d.querySelector('[data-close]').focus();return {destroy:close};
}
