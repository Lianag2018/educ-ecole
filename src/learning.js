import {bank} from './content.js';
import {rows,stories,mathCards,social} from './garden.js';

// School placement selects content; performance still adjusts difficulty within it.
export const gradeFor=p=>Number(p.schoolContext?.stage?.match(/^[1-4]/)?.[0])||(p.id==='p2'?3:1);
export const advanced=p=>gradeFor(p)>=3;
const card=(id,skill,prompt,text,choices,answer,explanation,level=1)=>({id,skill,level,prompt,text,choices,answer,explanation});
export const olderReading=[
 card('g3-sy1','syllabes','Assemble ce mot de quatre syllabes.','a + ni + ma + tion',['animation','animal','amitié'],0,'a, ni, ma, tion : animation. Lis ensuite le mot entier.'),
 card('g3-sy2','syllabes','Quel mot peux-tu former?','in + vi + ta + tion',['invention','invitation','imitation'],1,'in, vi, ta, tion : invitation. Prends le temps de réunir les syllabes.',2),
 card('g3-so1','sons','Quel mot contient le même son que « feuille »?','feuille',['seuil','fille','file'],0,'Feuille et seuil ont le même son final. Écoute-les, puis redis les mots.'),
 card('g3-so2','sons','Dans quel mot le g fait-il le son « j »?','Observe la lettre après le g.',['gare','girafe','gomme'],1,'Dans girafe, g devant i fait le son j.',2),
 card('g3-mo1','mots','Choisis le mot qui précise le sens.','Les deux sœurs observent le ciel avec…',['attention','attendre','attentif'],0,'Avec attention signifie qu’elles regardent soigneusement.'),
 card('g3-mo2','mots','Quel mot veut dire presque la même chose que « immense »?','Un immense nuage',['minuscule','gigantesque','léger'],1,'Gigantesque veut dire très grand, comme immense.',2),
 card('g3-li1','liaisons','Quel son relie « deux » à « étoiles »?','deux étoiles',['z','n','aucun'],0,'Deux‿étoiles : le x fait entendre z. Relis les deux mots ensemble.'),
 card('g3-li2','liaisons','Où faut-il éviter de faire une liaison?','Un ami et une amie',['un ami','et une','une amie'],1,'On ne fait jamais de liaison après et. Dis « et une » sans ajouter de t.',2),
 card('g3-in1','intonation','Quelle voix convient à cette phrase?','Attention, le pont bouge!',['Une voix qui avertit','Une voix qui pose une question'],0,'Le point d’exclamation et Attention invitent à avertir. Marque une courte pause après la virgule.'),
 card('g3-in2','intonation','Quel groupe doit rester ensemble quand tu lis?','Au-dessus du jardin, les deux licornes déploient leurs ailes.',['les deux licornes','jardin les','leurs'],0,'Lis « les deux licornes » ensemble. Fais une petite pause après jardin.',2),
 card('g3-co1','comprehension','Pourquoi Liana ralentit-elle?','Les deux sœurs volent vers un nuage doré. Mely-Ann reste un peu derrière. Liana ralentit et lui montre un passage sans vent. Bientôt, elles volent côte à côte.',['Pour aider sa sœur à la rejoindre','Parce qu’elle veut rentrer seule'],0,'Mely-Ann est derrière, puis elles volent côte à côte : Liana l’aide à la rejoindre.'),
 card('g3-co2','comprehension','Quel indice montre que la pluie approche?','Le ciel s’assombrit. Les feuilles se retournent sous le vent. Liana referme son livre et les deux sœurs courent vers la maison.',['Le ciel s’assombrit','Le livre est ouvert'],0,'Le ciel qui s’assombrit et le vent donnent des indices. Explique ton raisonnement avec ces détails.',2)
];
export const readingBank=p=>advanced(p)?olderReading:bank;
export const skillCards=(p,skill)=>readingBank(p).filter(q=>q.skill===skill).sort((a,b)=>!advanced(p)?(a.order??100)-(b.order??100):0);
export const storyCards=p=>stories.filter(q=>q.grade===(advanced(p)?3:1));
const youngerMath=[
 card('g1-add','mots','Compte les étoiles.','3 + 2',['4','5','6'],1,'Pars de 3 et ajoute 2 : 4, 5. Il y a 5 étoiles.'),
 card('g1-sub','mots','Il y a 8 fleurs. Tu en cueilles 3. Combien restent?','8 − 3',['5','6','11'],0,'Retire 3 à 8 : 7, 6, 5. Il reste 5 fleurs.'),
 card('g1-order','mots','Quel nombre est le plus petit?','Compare ces nombres.',['12','9','15'],1,'9 vient avant 12 et 15 dans la suite des nombres.'),
 card('g1-tens','mots','Combien font une dizaine et quatre unités?','10 + 4',['40','14','41'],1,'Une dizaine vaut 10. Ajoute 4 unités : 14.')
];
export const mathsFor=p=>advanced(p)?mathCards:youngerMath;
const youngerSocial=card('g1-social','comprehension','Où peux-tu emprunter un livre?','Je vais à la bibliothèque. Je choisis un livre. Je le rapporte après ma lecture.',['À la bibliothèque','Au parc'],0,'La bibliothèque permet d’emprunter des livres. Nomme un endroit que tu connais dans ton quartier.');
export const socialFor=p=>advanced(p)?social:youngerSocial;
const smallRows=Object.fromEntries(Object.keys(rows).map((k,i)=>[k,Array.from({length:10},(_,j)=>i*10+j+1)]));
export const numberRows=p=>advanced(p)?{...rows,J:[1000,1001,1010,1024,1100,1208,1370,1500,1809,1999],K:[0,1,9,10,11,20,71,80,91,99]}:smallRows;
export const firstNumberRow=p=>advanced(p)?'J':'A';
