import {kaluluMarkup} from './kalulu-bank.js';
// Banque d'activités originales, alignées sur les photos des cahiers de 1re année.
// Aucun fac-similé, image d'éditeur, identifiant ou mot de passe scolaire.
export const motsMely=("la|le|ma|me|sa|se|si|je|ou|de|du|te|tu|ne|on|ton|mon|son|un|une|un ami|une amie|j’ai|je suis|il|elle|une maman|un papa|aime|j’aime|une mère|un père|un chat|un chien|il a|elle a|une école|est|il est|elle est|joue|je joue|petit|petite|un bébé|et|rouge|jaune|une poule|une pomme|les|des|mes|joli|jolie|moi|toi|bon|bonne|un bonbon|une bouche|beau|belle|grand|grande|avec|un garçon|une fille|vert|verte|dans|chez|une maison|pour|une fête|une tête|gros|grosse|brun|brune|je fais|long|longue|blanc|blanche|je vais|il va|elle va|orange|mange|rose|bleu|un frère|une sœur|deux|sur|sous|une rue|une robe|beaucoup").split('|');
const data=[
 ['voyelles','Voyelles','Français','a, e, i, o, u, y','Quel mot commence par le son a ?','ami','lit','rue'],
 ['lm','Syllabes l et m','Français','la, li, ma, mi','Quel mot commence par ma ?','maman','salade','robe'],
 ['rs','Syllabes r et s','Français','ra, ri, sa, si','Quel mot commence par sa ?','salade','maman','lune'],
 ['vj','Syllabes v et j','Français','va, vi, jo, ju','Quel mot commence par jo ?','joli','vélo','maison'],
 ['fnch','Syllabes f, n et ch','Français','fa, ni, cha, chou','Quel mot commence comme chou ?','chat','farine','nez'],
 ['ouon','Sons ou et on','Français','ou, on','Dans quel mot entends-tu ou ?','loup','lit','lac'],
 ['inverse','Syllabes inverses','Français','al, il, or','Quel groupe termine le mot fil ?','il','li','la'],
 ['doubles','Syllabes complexes','Français','pla, bra, tri','Quel mot commence par pla ?','plante','bateau','robe'],
 ['mots','Lire des mots','Français','lire et comprendre','Quel mot désigne un animal ?','chat','table','route'],
 ['phrases','Petites phrases','Français','lire et comprendre','Lila a un vélo. Que possède Lila ?','un vélo','un chat','une fleur'],
 ['ortho1','Orthographe 1 à 20','Français','mots fréquents','Quel mot signifie une seule personne ?','un','les','des'],
 ['ortho2','Orthographe 21 à 60','Français','famille et école','Quel mot désigne un lieu pour apprendre ?','une école','un chat','une pomme'],
 ['ortho3','Orthographe 61 à 100','Français','adjectifs et couleurs','Quel mot est une couleur ?','orange','maison','frère'],
 ['quantites','Quantités 0 à 20','Maths','compter et comparer','Combien font ● ● ● et ● ● ?','5','4','6'],
 ['dizaines','Dizaines et unités','Maths','grouper par 10','3 dizaines et 4 unités font…','34','43','304'],
 ['grille','Grille de 0 à 99','Maths','avant, après, entre','Quel nombre vient après 59 ?','60','58','69'],
 ['calculs','Addition et soustraction','Maths','ajouter et retirer','Combien font 8 − 3 ?','5','6','4'],
 ['problemes','Résoudre un problème','Maths','chercher, représenter, vérifier','Mia a 4 pommes et en reçoit 3. Combien en a-t-elle ?','7','6','8']
];
export const sujetsMely=data.map(([id,title,subject,examples])=>({id,title,subject,examples}));
const card=(id,skill,prompt,choices,answer=0)=>({id:'mely-'+id,skill,level:1,prompt,text:'Choisis une réponse. Tu peux demander de l’aide.',choices,answer,explanation:'Bonne réponse : '+choices[answer]+'. Explique pourquoi avec un adulte.'});
export function exercicesMely(id){
 const item=data.find(row=>row[0]===id);if(!item)return [];
 const [,title,subject,examples,prompt,correct,wrong1,wrong2]=item;
 const skill=subject==='Maths'?'mots':id==='phrases'?'comprehension':id==='voyelles'||id==='ouon'?'sons':id.startsWith('ortho')||id==='mots'?'mots':'syllabes';
 const choices=[wrong1,correct,wrong2];
 return [card(id+'-1',skill,prompt,choices,1),card(id+'-2',skill,'Retrouve la bonne réponse : '+prompt,[wrong2,wrong1,correct],2)];
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function ecranMely(){
 return '<section class="lesson"><h1>📘 Mon cahier de 1re année</h1><p>Les sons, les syllabes, les mots et les nombres, à petits pas. Activités originales adaptées aux photos de classe.</p><div class="audio"><button type="button" data-action="test-voice">🔊 Tester le son</button><button type="button" data-action="system-voice">Voix française de secours</button></div><p>Pour écouter un mot, touche son haut-parleur ci-dessous.</p><button class="primary" data-action="rms-course">🌱 Mon chemin des sons · dans l’ordre du cahier →</button><div class="skill-grid">'+sujetsMely.map(s=>'<article><h3>'+esc(s.title)+'</h3><p>'+esc(s.examples)+'</p><button data-mely-topic="'+esc(s.id)+'">Pratiquer →</button></article>').join('')+'</div><div class="school-math-links" aria-label="Mon livre de maths Nougat"><h2>🐱 Mes maths avec Nougat</h2><p>Retrouve ton livre scolaire et fais tes exercices avec un adulte.</p><div class="school-math-grid"><a data-school-resource href="https://www.iplusinteractif.com/primaire/login?lang=fr_CA" target="_blank" rel="noopener noreferrer"><strong>📘 Ouvrir 1·2·3 avec Nougat</strong><small>i+ Élève · Accès de l’école</small></a><a data-school-resource href="https://www.alloprof.qc.ca/fr/eleves/bv/jeux/meteormath-2" target="_blank" rel="noopener noreferrer"><strong>☄️ Jouer à Météormath 2</strong><small>Défis de calcul faciles</small></a></div><p class="small">Les activités se font sur les sites d’origine. Aucun mot de passe ni résultat externe n’est enregistré ici.</p></div>'+kaluluMarkup()+'<details><summary>Avec un parent · Mes 100 mots à orthographier</summary><p>Choisir 3 à 5 mots, les écouter, les cacher, puis les écrire et vérifier.</p>'+[0,20,40,60,80].map(n=>'<p><strong>Mots '+(n+1)+' à '+(n+20)+' :</strong> '+motsMely.slice(n,n+20).map(word=>'<button type="button" class="word-audio" data-mely-word="'+esc(word)+'" aria-label="Écouter '+esc(word)+'">🔊 '+esc(word)+'</button>').join(' ')+'</p>').join('')+'</details><p class="small">Les exercices ne reproduisent pas les pages de l’éditeur. Le livre 1·2·3 avec Nougat reste accessible sur sa plateforme scolaire. Aucun identifiant scolaire n’est stocké dans l’application.</p></section>';
}
