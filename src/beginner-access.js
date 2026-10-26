// Authored beginner variants. Listening comprehension is not independent decoding.
// Unknown parent material is preserved, presented one sentence at a time with an adult.
const variants={
 co1:['La plume est ici.','Que vois-tu?',['Une plume','Une pomme'],0],
 co2:['Lili met ses bottes.','Que met Lili?',['Ses bottes','Son chapeau'],0],
 co3:['Sami arrose la pousse.','Que fait Sami?',['Il arrose','Il dort'],0],
 co4:['Nora aide son ami.','Qui aide son ami?',['Nora','Lili'],0],
 'garden-story-1':['Le chat est sur le tapis.','Où est le chat?',['Sur le tapis','Sur le lit'],0],
 'garden-story-2':['Il pleut. L’ours se met à l’abri.','Quel temps fait-il?',['Il pleut','Il neige'],0],
 'unicorn-cloud-1':['Une licorne vole. Elle se pose sur un nuage.','Où se pose la licorne?',['Sur un nuage','Sur la mer'],0],
 'unicorn-star-1':['Une étoile a peur. La licorne la rassure.','Qui a peur?',['L’étoile','La licorne'],0],
 'g1-social':['Voici un livre. Je l’emprunte à la bibliothèque.','Que peut-on emprunter?',['Un livre','Un vélo'],0],
};
const island={
 bateau:['Voici la carte.','Que vois-tu?',['Une carte','Une fleur','Un livre'],0],
 palmiers:['Le papillon va sur la pierre.','Où va le papillon?',['Sur la pierre','Sur le livre','Sur le lit'],0],
 plage:['Le coffre cache un livre.','Que cache le coffre?',['Un livre','Une fleur','Un ballon'],0]
};
const travel={
 mexique:['Une étoile brille sur la plage.','Où brille l’étoile?',['Sur la plage','Sur le lit'],0],
 cuba:['Le nuage chante.','Qui chante?',['Le nuage','Le hibou'],0],
 dominicaine:['La tortue va vers la mer.','Où va la tortue?',['Vers la mer','Vers le lit'],0],
 ciel:['Le hibou arrive.','Qui arrive?',['Le hibou','Le poisson'],0]
};
export const beginnerProfile=p=>!(/^[34]/.test(p.schoolContext?.stage||'')||(!/^[12]/.test(p.schoolContext?.stage||'')&&p.id==='p2'));
export function beginnerCard(q,p,subject='Français'){
 if(!beginnerProfile(p))return q;
 const v=variants[q.id]||(q.island&&q.id.endsWith('-histoire')?island[q.island]:null)||(q.id.startsWith('voyage-')&&q.id.endsWith('-story')?travel[q.id.split('-')[1]]:null);
 let out={...q};
 if(['Maths','Mathématiques'].includes(subject))out.skill='maths';
 const math={'g1-add':[3,'+',2],'g1-sub':[8,'−',3],'g1-tens':[10,'+',4]};
 if(math[q.id])out={...out,skill:'maths',beginnerMath:math[q.id],prompt:'Compte avec les dessins.',text:q.text};
 if(v){const [text,prompt,choices,answer]=v;out={...out,text,prompt,choices,answer,explanation:text};delete out.spokenText;}
 // Keep word matching short; do not imply that recognizing the shape decodes it.
 if(q.island&&q.id.endsWith('-indice'))out={...out,prompt:'Trouve le même mot.',text:q.text.match(/: (.+)\./)?.[1]||q.text,explanation:'Compare les lettres. Écoute le mot avec un adulte.'};
 if(q.skill==='comprehension'&&!['Maths','Mathématiques'].includes(subject))out={...out,learningMode:'listening',travelSubject:'Compréhension orale'};
 return out;
}
export function beginnerPages(text){return String(text||'').match(/[^.!?]+[.!?]*/gu)?.map(s=>s.trim()).filter(Boolean)||[''];}
export function activityPages(q,p){return beginnerProfile(p)?beginnerPages(q.spokenText||q.text):[q.spokenText||q.text];}
// Shared pictorial choices for concrete objects; text and audio remain available.
const pictures={'Une carte':'🗺️','Une fleur':'🌸','Un livre':'📖','Un ballon':'⚽','Une plume':'🪶','Une pomme':'🍎','Ses bottes':'👢','Son chapeau':'👒','Sur le tapis':'🐈','Sur le lit':'🛏️','Il pleut':'🌧️','Il neige':'🌨️','Sur un nuage':'☁️','Sur la mer':'🌊','L’étoile':'⭐','La licorne':'🦄','Un vélo':'🚲','Sur la pierre':'🪨','Sur le livre':'📖','Sur la plage':'🏖️','Le nuage':'☁️','Le hibou':'🦉','Le poisson':'🐟','Vers la mer':'🌊','Vers le lit':'🛏️'};
export const choicePicture=text=>pictures[text]||'';

export function beginnerMathVisual(q){
 const [a,op,b]=q.beginnerMath;
 const group=(n,cross=0)=>`<span class="beginner-math-group">${Array.from({length:n},(_,i)=>`<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="13" fill="#d9973e"/>${i>=n-cross?'<path d="M6 6L34 34M6 34L34 6" stroke="#473768" stroke-width="4"/>':''}</svg>`).join('')}</span>`;
 return `<div class="beginner-math" role="img" aria-label="${a} objets ${op==='+'?'et '+b+' objets': 'dont '+b+' sont barrés'}">${group(a,op==='−'?b:0)}${op==='+'?'<strong>+</strong>'+group(b):''}</div><p>${a} ${op} ${b}</p>`;
}
