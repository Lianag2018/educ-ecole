// Original practice content. No publisher text, private school words or paid generation.
const make=(id,skill,text,prompt,choices,answer,explanation,extra={})=>({id,skill,level:1,text,prompt,choices,answer,explanation,practiceExtension:true,...extra});
const words=[
 ['la + pin','lapin','sapin','patin'],['sa + pin','sapin','lapin','satin'],['pa + tin','patin','matin','sapin'],['ma + tin','matin','patin','marin'],
 ['ma + rin','marin','matin','malin'],['ma + lin','malin','marin','lapin'],['sa + lon','salon','savon','ballon'],['sa + von','savon','salon','melon'],
 ['me + lon','melon','salon','savon'],['ba + teau','bateau','cadeau','gâteau'],['ca + deau','cadeau','bateau','rideau'],['ri + deau','rideau','cadeau','radeau'],
 ['ra + deau','radeau','rideau','bateau'],['cha + peau','chapeau','château','cadeau'],['châ + teau','château','chapeau','gâteau'],['gâ + teau','gâteau','château','bateau'],
 ['sou + ris','souris','sourire','soupe'],['sou + pe','soupe','souris','souper'],['pou + le','poule','boule','moule'],['bou + le','boule','poule','bulle'],
 ['mou + le','moule','poule','mule'],['lu + ne','lune','louve','plume'],['plu + me','plume','prune','lune'],['pru + ne','prune','plume','brume']
];
const longWords=[
 ['pa + pil + lon','papillon','pavillon','pantalon'],['pan + ta + lon','pantalon','papillon','panier'],['cho + co + lat','chocolat','choc','chou'],
 ['to + ma + te','tomate','tortue','patate'],['pa + ta + te','patate','tomate','pâte'],['sa + la + de','salade','salon','sable'],
 ['do + mi + no','domino','domaine','dormir'],['a + ni + mal','animal','amical','animation'],['a + mi + cal','amical','animal','amitié'],
 ['a + mi + tié','amitié','amical','animal'],['é + lé + phant','éléphant','élégant','enfant'],['té + lé + phone','téléphone','télescope','télévision'],
 ['té + lé + vi + sion','télévision','téléphone','vision'],['hé + li + cop + tère','hélicoptère','hélice','hippopotame'],
 ['hip + po + po + ta + me','hippopotame','hélicoptère','hippocampe'],['cro + co + di + le','crocodile','croquis','croc'],
 ['lo + co + mo + ti + ve','locomotive','locomotion','location'],['a + na + nas','ananas','animal','avocat'],
 ['a + vo + cat','avocat','ananas','aventure'],['a + ven + tu + re','aventure','avocat','avenue'],['a + ve + nue','avenue','aventure','avenir'],
 ['bi + cy + clette','bicyclette','biscuit','bibliothèque'],['bi + blio + thè + que','bibliothèque','bicyclette','bibliothécaire'],['or + di + na + teur','ordinateur','ordinaires','organisateur']
];
function syllables(rows,grade){return rows.map(([text,correct,...others],i)=>{const choices=[correct,...others];const shift=i%3;for(let j=0;j<shift;j++)choices.push(choices.shift());return make(`practice-g${grade}-sy-${i}`,'syllabes',text,'Assemble les syllabes. Quel mot obtiens-tu?',choices,choices.indexOf(correct),`Le mot est « ${correct} ». Relis les morceaux, puis le mot entier.`);});}
export const extraReading=p=>syllables((/^[1-4]/.test(p.schoolContext?.stage||'')?/^[34]/.test(p.schoolContext.stage):p.id==='p2')?longWords:words,(/^[1-4]/.test(p.schoolContext?.stage||'')?/^[34]/.test(p.schoolContext.stage):p.id==='p2')?3:1);
export function extraMath(older){
 const cards=[],grade=older?3:1;
 const add=(a,op,b)=>{const result=op==='+'?a+b:op==='−'?a-b:op==='×'?a*b:a/b;const i=cards.length,choices=[result,result+1,result===0?2:result-1].map(String),shift=i%3;for(let j=0;j<shift;j++)choices.push(choices.shift());cards.push(make(`practice-g${grade}-${op}-${a}-${b}`,'maths',`${a} ${op} ${b}`,'Trouve le résultat.',choices,choices.indexOf(String(result)),`${a} ${op} ${b} = ${result}.`,{travelSubject:'Maths',...(!older?{beginnerMath:[a,op,b]}:{})}));};
 if(!older){for(let a=1;a<=10;a++)for(const b of [1,2,3])add(a,'+',b);for(let a=4;a<=13;a++)for(const b of [1,2,3])add(a,'−',b);}
 else {for(let a=12;a<=45;a+=3)for(const b of [11,23]){add(a,'+',b);add(a+30,'−',b);}for(let a=2;a<=6;a++)for(let b=2;b<=6;b++){add(a,'×',b);add(a*b,'÷',a);}}
 return cards;
}
const readings=[
 ['Le chat dort sur le tapis. La souris passe près du lit.','Où dort le chat?',['Sur le tapis','Sur le lit','Dans la cour'],0],
 ['Il pleut. Zoé prend ses bottes et son parapluie.','Pourquoi prend-elle son parapluie?',['Pour se protéger de la pluie','Pour jouer au ballon','Pour dormir'],0],
 ['Le bateau arrive au quai. Sami attend avec son sac. Il monte à bord.','Que fait Sami en dernier?',['Il monte à bord','Il prépare son sac','Il attend au quai'],0],
 ['Une tortue avance vers la mer. Un crabe passe près de sa patte. La tortue poursuit son chemin.','Vers quoi va la tortue?',['La mer','La forêt','La maison'],0],
 ['Noa plante une graine. Chaque matin, il arrose la terre. Une petite pousse apparaît.','Que fait Noa chaque matin?',['Il arrose la terre','Il cueille une fleur','Il change de pot'],0],
 ['Le vent emporte le chapeau de Mia. Il tombe près du banc. Mia court le chercher.','Pourquoi Mia court-elle?',['Pour reprendre son chapeau','Pour attraper le banc','Pour rentrer dormir'],0],
 ['Lina cherche son livre. Elle regarde sous la table. Le livre est dans son sac.','Où est le livre?',['Dans son sac','Sous la table','Sur une chaise'],0],
 ['Le soleil se couche. Les enfants rangent les pelles et quittent la plage.','À quel moment quittent-ils la plage?',['Le soir','Au lever du soleil','À midi'],0]
];
export const extraStories=older=>readings.map(([text,prompt,answers,answer],i)=>{const choices=[...answers];for(let j=0;j<i%3;j++)choices.push(choices.shift());return make(`practice-g${older?3:1}-story-${i}`,'comprehension',text,prompt,choices,choices.indexOf(answers[answer]),`Dans le texte : ${answers[answer].toLowerCase()}.`,{grade:older?3:1});});
