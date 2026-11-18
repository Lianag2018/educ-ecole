// Banque originale de 3e année (Liana) : vocabulaire, sons, liaisons, intonation et compréhension.
// Chaque ligne : [compétence, consigne, texte, bonne réponse, autres choix, explication, niveau]. Aucun texte d'éditeur.
const rows=[
 ['mots','Quel mot est le contraire de « courageux »?','Un chevalier courageux','peureux',['joyeux','rapide'],'Peureux est le contraire de courageux : il a peur.'],
 ['mots','Quel mot veut dire presque la même chose que « joyeux »?','Une fille joyeuse','content',['fâché','fatigué'],'Content et joyeux veulent dire à peu près la même chose.'],
 ['mots','Quel mot est de la famille de « terre »?','terre','atterrir',['terrible','tarte'],'Atterrir, c’est revenir sur la terre : le mot terre est caché dedans.',2],
 ['mots','Quel mot est de la famille de « dent »?','dent','dentiste',['danser','dedans'],'Le dentiste soigne les dents : on retrouve le mot dent.'],
 ['mots','Quel mot est le contraire de « ouvrir »?','ouvrir la porte','fermer',['offrir','couvrir'],'Ouvrir et fermer sont des contraires.'],
 ['mots','Quel mot n’est pas le nom d’un animal?','Pense aux animaux de la forêt.','chaudron',['hibou','renard'],'Un chaudron est une grosse marmite de cuisine, pas un animal.'],
 ['mots','Que veut dire « un sentier »?','Un sentier dans la forêt','un petit chemin',['un grand bateau','une petite maison'],'Un sentier est un petit chemin étroit.'],
 ['mots','Quel mot veut dire presque la même chose que « se dépêcher »?','Il faut se dépêcher.','se presser',['se reposer','se cacher'],'Se presser, c’est aller plus vite : comme se dépêcher.'],
 ['mots','Choisis le bon mot.','Liana ___ un livre.','a',['à','as'],'On peut dire « avait » : c’est le verbe avoir, donc a sans accent.',2],
 ['mots','Choisis le bon mot.','Elle va ___ la bibliothèque.','à',['a','as'],'On ne peut pas dire « avait » : c’est le petit mot à, avec un accent.',2],
 ['mots','Choisis le bon mot.','Les enfants ___ contents.','sont',['son','sons'],'On peut dire « étaient » : c’est le verbe être, donc sont.',2],
 ['mots','Choisis le bon mot.','Liana range ___ cahier.','son',['sont','sons'],'On peut dire « mon cahier » : c’est son, qui montre à qui il est.',2],
 ['sons','Quel mot rime avec « jardin »?','jardin','matin',['jardinier','jaune'],'Jardin et matin finissent par le même son. Écoute-les, puis redis-les.'],
 ['sons','Quel mot rime avec « soleil »?','soleil','abeille',['solide','soldat'],'Soleil et abeille finissent par le même son.'],
 ['sons','Quel mot rime avec « chanson »?','chanson','maison',['chanter','chat'],'Chanson et maison finissent par le son « on ».'],
 ['sons','Quel mot rime avec « pluie »?','pluie','nuit',['pleur','plume'],'Pluie et nuit finissent par le même son.',2],
 ['sons','Dans quel mot le c fait-il le son « s »?','Observe la lettre après le c.','cirque',['carotte','corde'],'Devant i, le c fait le son s : cirque.'],
 ['sons','Quel mot s’écrit avec « ph » pour faire le son « f »?','ph = f','photo',['forêt','fleur'],'Dans photo, ph fait le son f.',2],
 ['sons','Quel mot s’écrit avec « ç » pour faire le son « s »?','Observe la cédille sous le c.','garçon',['gare','gomme'],'La cédille sous le c fait entendre s devant o : garçon.',2],
 ['sons','Combien de syllabes entends-tu dans ce mot?','papillon','trois',['deux','quatre'],'pa-pil-lon : trois syllabes. Frappe-les dans tes mains.'],
 ['sons','Combien de syllabes entends-tu dans ce mot?','hippopotame','cinq',['quatre','six'],'hip-po-po-ta-me : cinq syllabes.',2],
 ['sons','Dans quel mot entends-tu le son « on »?','Écoute bien la fin du mot.','pont',['pain','plan'],'Dans pont, on entend « on ».'],
 ['sons','Quel mot s’écrit avec « gu » pour faire le son « g » devant i?','gu + i','guitare',['girafe','gilet'],'Devant i, il faut gu pour garder le son g : guitare.',2],
 ['liaisons','Quel son relie « les » à « amis »?','les amis','z',['t','n'],'Les‿amis : le s fait entendre z.'],
 ['liaisons','Quel son relie « un » à « ours »?','un ours','n',['z','t'],'Un‿ours : on entend n.'],
 ['liaisons','Quel son relie « petit » à « oiseau »?','un petit oiseau','t',['z','n'],'Petit‿oiseau : le t se fait entendre.'],
 ['liaisons','Dans quel groupe ne fait-on pas de liaison?','Le h de héros est aspiré.','les héros',['les amis','les enfants'],'Devant héros, on ne fait pas de liaison : on dit « les / héros ».',2],
 ['intonation','Comment lire cette phrase?','Où vas-tu?','Une voix qui monte, pour poser une question',['Une voix qui avertit','Une voix qui chuchote'],'Le point d’interrogation te dit de monter un peu la voix à la fin.'],
 ['intonation','Quelle voix convient à cette phrase?','Bravo, tu as réussi!','Une voix joyeuse',['Une voix triste','Une voix endormie'],'Le point d’exclamation et le mot bravo invitent à lire avec joie.'],
 ['intonation','Quel signe te dit de faire une courte pause?','Liana, Mely-Ann et maman arrivent.','la virgule',['la majuscule','le point final'],'La virgule te dit de faire une petite pause.'],
 ['intonation','Quel signe termine une phrase qui pose une question?','Comment t’appelles-tu','?',['.',','],'Une question se termine par un point d’interrogation.'],
 ['comprehension','Que cherchent les deux sœurs?','Liana trouve une clé dorée sous le vieux pommier. Elle la montre à Mely-Ann. Ensemble, elles cherchent le coffre qui va avec.','le coffre qui va avec la clé',['un pommier','un livre'],'Elles cherchent le coffre qui va avec la clé.'],
 ['comprehension','Pourquoi Liana met-elle ses bottes?','Il pleut depuis le matin. Liana met ses bottes jaunes et son manteau. Elle saute dans les flaques en riant.','Parce qu’il pleut',['Parce qu’il neige','Parce qu’elle a froid'],'Il pleut depuis le matin : c’est pourquoi elle met ses bottes.'],
 ['comprehension','Que fait le chat quand il entend un bruit?','Le chat de Mely-Ann dort sur le divan. Quand il entend un bruit, il ouvre un œil, puis se rendort.','Il ouvre un œil',['Il saute du divan','Il se met à courir'],'Dans le texte : il ouvre un œil, puis se rendort.'],
 ['comprehension','Qui sort les sandwichs?','Samedi, la famille pique-nique près du lac. Papa étend la nappe, maman sort les sandwichs et les filles cueillent des fleurs.','maman',['papa','les filles'],'Dans le texte : maman sort les sandwichs.'],
 ['comprehension','Que ressent Liana?','Liana bâille et se frotte les yeux. Elle ferme doucement son livre et éteint la lampe.','Elle a sommeil',['Elle a faim','Elle a peur'],'Elle bâille et se frotte les yeux : ce sont des indices de sommeil.',2],
 ['comprehension','Comment sait-on que le renard est passé ici?','Un petit renard avance sans bruit dans la neige. Ses pattes laissent des traces. Soudain, il s’arrête et dresse les oreilles.','Il a laissé des traces',['Il a fait du bruit','Il a mangé'],'Ses pattes laissent des traces dans la neige.',2],
 ['comprehension','Comment Liana aide-t-elle sa sœur?','Mely-Ann est triste : son ballon s’est envolé. Liana lui donne la main et lui promet d’en gonfler un autre.','Elle la console',['Elle rit de son ballon','Elle part sans rien dire'],'Elle lui donne la main et promet un autre ballon : elle la console.',2],
 ['comprehension','Vers quoi les tournesols se tournent-ils?','Dans le jardin, les tournesols se tournent vers le soleil toute la journée.','vers le soleil',['vers la pluie','vers la maison'],'Dans le texte : vers le soleil.']
];
export const grade3Bank=()=>rows.map(([skill,prompt,text,right,others,explanation,level=1],i)=>{
 const choices=[right,...others];for(let k=0;k<i%choices.length;k++)choices.push(choices.shift());
 return {id:`g3-extra-${i}`,skill,level,prompt,text,choices,answer:choices.indexOf(right),explanation,practiceExtension:true,grade:3};
});
