// Original session guidance based on the reviewed PDFs; page numbers are PDF pages.
// Opening a support does not demonstrate mastery. The parent confirms each next step.
const refs={
 sounds:'p1-14341d14690b',letters:'p1-ecf60b8a8e50',words:'p1-900cb01b1a2a',codes:'p1-19857d156eb4',alphabet:'p1-a30d12a97456',pizza:'p1-3623772977ab',
 count:'p1-f070630c10e7',quantities:'p1-9138284d25d8',tens:'p1-3c6231147e2e',grid:'p1-11750c5ffd5a',
 preview:'p1-2fd130f27466',knowledge:'p1-189d24373281',frequent:'p1-6dd0c0361f0b',context:'p1-fb0aad8bdd90',pictures:'p1-7e9a58e9814b',
 syllables:'p1-770a7213eb8e',phonics:'p1-7e944d966771',sentences:'p1-69d024e4870b',pauses:'p1-e799df9d4b19',questions:'p1-3f16ee0f60d9',
 pace:'p1-f530763f4418',meaning:'p1-34a66c1c6981',recall:'p1-a7b2be426737',reaction:'p1-f8515759cdbc',opinion:'p1-df63c26eb60e',strategies:'p1-93ac383bc2f8',
 baseTen:'family-72fb37925c99',concentration:'family-ba137a86ad33',stories:'family-f5a9e6d12b9e',problemSteps:'family-c4c89947fbab'
};
const support=(id,pages,role,note)=>({id:refs[id],pages,role,note});

export const P1_PATHS=[
 {
  id:'decoding',title:'Des sons aux petits mots',icon:'🔤',
  description:'Quelques lettres, une syllabe, puis un petit mot. On choisit peu de cartes et on avance avec un parent.',
  steps:[
   {
    id:'p1-decoding-letters',title:'Je retrouve mes lettres',
    goal:'Associer la majuscule et la minuscule de quelques lettres familières.',
    instruction:'Choisis deux ou trois lettres de ton prénom ou des lettres que tu connais. Retrouve chaque lettre sous ses deux formes avec ton parent.',
    readyWhen:'Elle retrouve les deux formes des lettres choisies à plusieurs occasions, avec moins d’aide.',
    documents:[support('alphabet',[1],'activity','Deux ou trois lettres suffisent; toute l’affiche reste un aide-mémoire.')],
    practice:null
   },
   {
    id:'p1-decoding-sounds',title:'J’entends un son',
    goal:'Entendre un son dans un mot connu et le relier à une lettre.',
    instruction:'Ton parent choisit trois images et un seul son familier. Nomme les images ensemble, puis montre celles où tu entends ce son.',
    readyWhen:'Elle retrouve le son choisi dans plusieurs mots connus sans se fier seulement au nom de la lettre.',
    documents:[
     support('sounds',[2,3],'activity','Choisir quelques cartes seulement, par exemple autour de a, i, m ou l. Ne pas lire toute la planche.'),
     support('sounds',[1],'parent','Suggestions de jeu; commencer par un son, puis chercher sa place dans le mot.')
    ],
    practice:'sounds'
   },
   {
    id:'p1-decoding-syllables',title:'Je colle deux sons',
    goal:'Assembler une consonne et une voyelle connues.',
    instruction:'Avec deux lettres choisies par ton parent, écoute les sons puis rapproche-les pour lire une syllabe. Change une seule lettre et essaie encore.',
    readyWhen:'Elle assemble quelques syllabes simples avec les lettres travaillées, sans avoir besoin du modèle à chaque essai.',
    documents:[
     support('letters',[2],'material','Choisir les lettres déjà connues. Le tirage de tout l’alphabet pourrait donner des cas difficiles.'),
     support('letters',[1],'parent','Consignes de manipulation; deux ou trois syllabes forment une petite séance.'),
     support('phonics',[1,2,3,11],'parent','Guide de décodage pour l’adulte. Le texte de Flamie et les règles de c, g et s ne sont pas à faire à cette étape.')
    ],
    practice:'syllables'
   },
   {
    id:'p1-decoding-word-cards',title:'Je lis un petit mot',
    goal:'Lire un mot accessible, puis vérifier son sens avec une image.',
    instruction:'Ton parent choisit deux ou trois mots avec des sons que tu connais. Essaie de lire le mot, puis trouve son image. Relis-le une fois en entier.',
    readyWhen:'Elle lit les mots choisis en regardant leurs lettres, puis retrouve l’image qui correspond.',
    documents:[support('words',[3,6],'activity','Choisir une seule petite série: par exemple lit ou lune à la page 3, sac ou vélo à la page 6, selon les sons appris. Les numéros indiqués sont les pages du PDF.')],
    practice:null
   },
   {
    id:'p1-decoding-word-syllables',title:'Un mot, morceau par morceau',
    goal:'Découper un mot en syllabes et revenir au sens de la phrase.',
    instruction:'Choisis avec ton parent un ou deux mots à décoder. Lis les morceaux, relis le mot entier, puis écoute ou relis la courte phrase où il se trouve.',
    readyWhen:'Elle retrouve le mot entier après l’avoir découpé et peut dire ce que signifie la phrase avec aide au besoin.',
    documents:[
     support('syllables',[5],'material','Le texte en couleurs est une banque de mots. Choisir un ou deux mots accessibles; aucune lecture intégrale de Flamie n’est demandée.'),
     support('syllables',[3,4,6],'parent','Modèle et aide-mémoire. Distinguer syllabes orales et écrites; garder les structures complexes pour plus tard.')
    ],
    practice:null
   },
   {
    id:'p1-decoding-familiar',title:'Je lis mes mots familiers',
    goal:'Reconnaître quelques mots fréquents et vérifier leur forme exacte.',
    instruction:'Ton parent lit un petit passage. À ton tour, lis seulement les deux ou trois mots connus que vous avez choisis. Vérifiez ensemble les lettres du mot.',
    readyWhen:'Elle reconnaît les mots sélectionnés dans plusieurs endroits et vérifie un mot qu’elle a confondu.',
    documents:[
     support('frequent',[4],'activity','Une courte portion suffit. Le parent lit le reste; l’enfant lit uniquement ses mots familiers.'),
     support('frequent',[3,5,6],'parent','La liste est une banque de choix. Ne pas demander de tout mémoriser ni de deviner à partir des premières lettres.')
    ],
    practice:null
   },
   {
    id:'p1-decoding-meaning',title:'Je vérifie ce que j’ai lu',
    goal:'Vérifier un mot avec ses lettres et chercher son sens dans une phrase ou une image.',
    instruction:'Lis une courte phrase avec ton parent. Choisissez un mot à éclaircir, puis montre un indice qui t’aide à le comprendre. Relisez ensuite la phrase.',
    readyWhen:'Elle peut expliquer simplement le mot choisi et vérifier que le mot lu correspond aux lettres écrites.',
    documents:[
     support('pictures',[5],'activity','Travailler une phrase et une image seulement; le parent peut lire les mots difficiles.'),
     support('pictures',[3,4],'parent','L’illustration aide à vérifier le sens, sans remplacer le décodage.'),
     support('context',[3,4],'parent','Autre façon de guider la même petite activité: chercher un indice dans la phrase.'),
     support('meaning',[3,4],'parent','Guide facultatif pour préciser le sens d’un seul mot nouveau; aucun exercice supplémentaire obligatoire.')
    ],
    practice:null
   },
   {
    id:'p1-decoding-school-words',title:'Mes mots de la semaine',
    goal:'Réutiliser quelques mots qui correspondent aux apprentissages de l’école.',
    instruction:'Choisis avec ton parent deux ou trois mots déjà travaillés. Lis-les, associe une image ou invente une petite phrase. Reprenez ces mots un autre jour.',
    readyWhen:'Elle réutilise les mots choisis et retrouve progressivement leur lecture lors de courtes reprises.',
    documents:[
     support('words',[1,3,6],'material','Choisir une page et quelques cartes qui conviennent aux sons travaillés; il ne faut pas terminer toutes les cartes.'),
     support('codes',[1],'parent','Codes de listes dans les outils officiels Alloprof, facultatifs. Choisir une seule liste adaptée; les résultats externes ne sont pas synchronisés.')
    ],
    practice:'vocabulary'
   }
  ]
 },
 {
  id:'reading',title:'Je comprends ce qu’on lit',icon:'📖',
  description:'On prépare une courte lecture, on fait des pauses et on en parle. Le parent peut lire le texte à voix haute.',
  steps:[
   {
    id:'p1-reading-preview',title:'Je regarde avant de lire',
    goal:'Utiliser le titre et une image pour se préparer à la lecture.',
    instruction:'Regarde le titre et une image avec ton parent. Dis ce que tu remarques et de quoi le texte pourrait parler. Une idée suffit.',
    readyWhen:'Elle repère un indice et peut expliquer une idée sur le sujet, sans devoir deviner toute l’histoire.',
    documents:[
     support('preview',[4],'activity','Observer la présentation; le parent pourra lire ensuite une courte portion du texte.'),
     support('preview',[2,3],'parent','Guide du survol; la même activité convient à un livre familier.'),
     support('strategies',[1],'parent','Pointer seulement la stratégie utilisée aujourd’hui.'),
     support('concentration',[1],'parent','Aide facultative pour choisir un moment confortable et prévoir une pause.')
    ],
    practice:null
   },
   {
    id:'p1-reading-knowledge',title:'Ce que je sais déjà',
    goal:'Relier une connaissance ou une question au sujet de la lecture.',
    instruction:'Dis une chose que tu sais déjà et une chose que tu aimerais savoir. Ton parent peut écrire ou dessiner ton idée. Après un petit passage, revenez à ta question.',
    readyWhen:'Elle exprime une idée ou une question et accepte de la préciser quand elle découvre une information.',
    documents:[
     support('knowledge',[4],'activity','Observer le texte et les illustrations. Répondre oralement ou sur une feuille libre est suffisant.'),
     support('knowledge',[2,3,5],'parent','Lire un court passage choisi. La page 5 est un exemple de tableau déjà rempli, à garder pour le parent. Les prédictions se révisent.')
    ],
    practice:null
   },
   {
    id:'p1-reading-sentence',title:'Une phrase, une idée',
    goal:'Repérer où une phrase commence et se termine, puis en retrouver l’idée.',
    instruction:'Choisis une courte phrase avec ton parent. Montre son début et sa fin. Après l’avoir écoutée ou lue ensemble, dis de qui on parle et ce qu’on apprend.',
    readyWhen:'Elle retrouve les limites de la phrase choisie et en reformule l’idée avec de moins en moins d’aide.',
    documents:[
     support('sentences',[5],'activity','Version avec repères colorés. Une ou deux phrases suffisent.'),
     support('sentences',[3,4],'parent','Guidage de la compréhension phrase par phrase. Les autres versions du texte ne sont pas des devoirs supplémentaires.')
    ],
    practice:null
   },
   {
    id:'p1-reading-pause',title:'Une petite pause pour comprendre',
    goal:'Ralentir ou s’arrêter pour retenir une idée importante.',
    instruction:'Lis ou écoute un très court passage. Fais une pause et raconte une chose importante. Si le sens s’est perdu, ton parent et toi pouvez le relire calmement.',
    readyWhen:'Elle peut dire une idée importante après une pause et reconnaît quand une relecture l’aide.',
    documents:[
     support('pauses',[5],'activity','Choisir un seul des premiers paragraphes; le parent peut assurer la lecture.'),
     support('pauses',[3,4],'parent','Modèles de reformulation; ne pas demander un résumé de tout le texte.'),
     support('pace',[3,4],'parent','Ajuster le rythme selon le sens et l’exactitude, sans chronomètre ni objectif de vitesse.')
    ],
    practice:null
   },
   {
    id:'p1-reading-question',title:'Je pose ma question',
    goal:'Chercher si une question trouve sa réponse dans le texte.',
    instruction:'Après une petite portion lue ensemble, pose une question. Écoute la suite ou regarde le passage pour chercher un indice. Tu peux aussi dire que le texte ne répond pas.',
    readyWhen:'Elle formule une question avec aide au besoin et distingue une information du texte d’une idée qu’elle imagine.',
    documents:[
     support('questions',[5],'activity','Un extrait suffit pour chercher une information.'),
     support('questions',[3,4],'parent','Quelques modèles de questions. Une réponse absente du texte ne doit pas être inventée.')
    ],
    practice:null
   },
   {
    id:'p1-reading-recall',title:'Je raconte avec mes mots',
    goal:'Rappeler une ou deux informations importantes après une courte lecture.',
    instruction:'Après le passage lu avec ton parent, raconte ce que tu as retenu. Commence par une idée. Tu peux faire un dessin, puis ajouter une deuxième idée.',
    readyWhen:'Elle rappelle les idées principales du petit passage avec ses propres mots, sans réciter exactement le texte.',
    documents:[
     support('recall',[6],'activity','Le parent choisit un court passage déjà compris. Le texte informatif ne demande pas un schéma d’histoire avec problème et solution.'),
     support('recall',[3,4,5],'parent','Guides et exemple de rappel; une relance ou un dessin reste possible.')
    ],
    practice:null
   },
   {
    id:'p1-reading-reaction',title:'Ce que l’histoire me fait ressentir',
    goal:'Exprimer une réaction et la relier à un moment de l’histoire.',
    instruction:'Ton parent lit un petit passage de l’histoire. Choisis un moment et dis ce que tu ressens, ou ce que tu ferais à la place du personnage. Explique une raison.',
    readyWhen:'Elle exprime une réaction personnelle et peut la relier à un détail de l’histoire.',
    documents:[
     support('reaction',[5],'activity','Ce récit est différent du texte informatif. Le parent lit; aucune lecture autonome intégrale n’est attendue.'),
     support('reaction',[3,4],'parent','Plusieurs réponses sont possibles. Ne pas imposer une seule émotion ou un seul choix.')
    ],
    practice:null
   },
   {
    id:'p1-reading-opinion',title:'Je donne mon avis',
    goal:'Dire ce qui plaît dans une lecture et fournir une raison simple.',
    instruction:'Pense à une lecture que tu connais. Dis ce que tu as aimé ou moins aimé, puis explique pourquoi. Si tu en as envie, invente ensuite une toute petite histoire à l’oral.',
    readyWhen:'Elle exprime une préférence et l’explique par un détail du texte, des images ou de la présentation.',
    documents:[
     support('opinion',[5,6],'activity','Choisir un seul texte connu ou un autre livre familier. Lire les deux textes en entier n’est pas nécessaire.'),
     support('stories',[8],'material','Option après la discussion: inventer oralement une petite histoire avec les idées de la page.'),
     support('opinion',[3,4],'parent','Choisir un seul critère. L’enfant a le droit de ne pas aimer une lecture.')
    ],
    practice:'reading'
   }
  ]
 },
 {
  id:'numbers',title:'Des objets aux dizaines',icon:'🔢',
  description:'On compte avec les mains et des objets, puis on apprend les paquets de dix. Les premières étapes se font sans jeu de grands nombres.',
  steps:[
   {
    id:'p1-numbers-count',title:'Je compte mes objets',
    goal:'Compter chaque objet une seule fois et annoncer la quantité totale.',
    instruction:'Prends trois à cinq petits objets. Déplace chaque objet en le comptant, puis dis combien il y en a en tout. Change leur place et regarde si la quantité a changé. Enlève ensuite tous les objets : il en reste zéro.',
    readyWhen:'Elle compte la petite collection sans oubli ni double compte et sait annoncer le total.',
    documents:[
     support('baseTen',[3],'material','Quelques unités suffisent si vous préférez le matériel imprimé. Des objets du quotidien conviennent aussi.'),
     support('count',[1,2,3],'parent','Le dénombrement se pratique par manipulation; les trois pages sont un guide pour l’adulte.')
    ],
    practice:null
   },
   {
    id:'p1-numbers-to-five',title:'Je reconnais de un à cinq',
    goal:'Associer plusieurs représentations d’une petite quantité.',
    instruction:'Choisis deux nombres entre un et cinq. Avec ton parent, retrouve leur image sur un dé, avec les doigts ou dans une boîte. Recompte si tu en as besoin.',
    readyWhen:'Elle associe les représentations choisies à la même quantité et commence à reconnaître de petits groupes.',
    documents:[
     support('quantities',[5,6,7],'material','Choisir une page et quelques cartes. Les trois pages donnent plusieurs représentations, pas trois exercices obligatoires.'),
     support('quantities',[2,3,4],'parent','Commencer par un à cinq. Les nombres écrits en lettres sont facultatifs.')
    ],
    practice:null
   },
   {
    id:'p1-numbers-to-ten',title:'Je reconnais de six à dix',
    goal:'Utiliser des groupes visibles pour comprendre les quantités jusqu’à dix.',
    instruction:'Choisis une quantité entre six et dix. Regarde ce qui forme un groupe de cinq et ce qu’il faut ajouter. Associe ensuite une autre image de la même quantité.',
    readyWhen:'Elle retrouve plusieurs représentations des quantités travaillées et explique un petit regroupement avec aide au besoin.',
    documents:[
     support('quantities',[8,9,10],'material','Choisir une page de cartes ou une boîte de dix. Pas de course ni de lecture obligatoire des mots-nombres.'),
     support('quantities',[3,4],'parent','Reprendre la même démarche que pour un à cinq; revenir à de petites quantités lorsque nécessaire.')
    ],
    practice:null
   },
   {
    id:'p1-numbers-first-ten',title:'Je fais un paquet de dix',
    goal:'Comprendre qu’un paquet de dix vaut dix unités.',
    instruction:'Compte dix objets et réunis-les en un paquet. Défaites le paquet pour vérifier, puis reformez-le. Ton parent peut montrer la barre qui représente ces dix unités.',
    readyWhen:'Elle comprend que le paquet et les dix objets représentent la même quantité, même après les avoir séparés.',
    documents:[
     support('tens',[5,6],'material','Boîtes et dizaines à découper. Utiliser seulement un paquet au début; ne pas ouvrir les centaines.'),
     support('baseTen',[3,2],'material','Commencer par les unités de la page 3, puis montrer la dizaine de la page 2.'),
     support('tens',[1,2,3],'parent','Le parent adapte l’entrée à dix objets. Les exemples à plusieurs dizaines viendront ensuite; la page 4 sur les centaines est différée.')
    ],
    practice:null
   },
   {
    id:'p1-numbers-tens-units',title:'Mes dizaines et mes unités',
    goal:'Représenter un petit nombre à deux chiffres avec des paquets de dix et des unités.',
    instruction:'Commence avec ton parent par un paquet de dix et deux objets. Recompte les unités pour vérifier. Quand cela devient facile, construis un autre nombre choisi ensemble.',
    readyWhen:'Elle sait combien vaut chaque paquet et explique les unités qui restent pour les nombres travaillés.',
    documents:[
     support('tens',[3],'parent','La page montre 24 et 53. Commencer concrètement par 12, puis 24 si cela convient; 53 est facultatif.'),
     support('baseTen',[2,3],'material','Utiliser seulement les dizaines et les unités. Les centaines ne font pas partie de cette étape.')
    ],
    practice:null
   },
   {
    id:'p1-numbers-grid',title:'Je retrouve mes nombres',
    goal:'Repérer des nombres connus et suivre de petits déplacements sur une grille.',
    instruction:'Choisis une petite zone de la grille avec ton parent. Trouve un nombre, son voisin, puis un nombre un peu plus loin. Complète quelques cases seulement si tu veux essayer la grille vide.',
    readyWhen:'Elle retrouve les nombres de la zone travaillée et peut expliquer un petit déplacement sans perdre le sens de la quantité.',
    documents:[support('grid',[1,2],'activity','Commencer dans une zone connue, puis élargir avec le parent. La consigne de l’Atelier s’arrête à 99; le PDF original contient aussi 100 et 101.')],
    practice:'numbers'
   },
   {
    id:'p1-numbers-pizza',title:'Je prépare une commande de pizza',
    goal:'Organiser une petite situation en distinguant les personnes et les portions.',
    instruction:'Ton parent raconte la commande. Représente les élèves avec des objets, donne deux jetons à chacun, puis cherche une manière de compter toutes les pointes de pizza.',
    readyWhen:'Elle distingue les élèves des pointes par élève et peut expliquer son comptage avec le matériel.',
    documents:[
     support('pizza',[3,4],'activity','Les indices représentent 12 élèves et deux pointes chacun. Chaque page contient deux copies identiques: utiliser une seule copie.'),
     support('pizza',[2],'parent','Lire la situation à voix haute. Revenir aux manipulations si le total de 24 est encore difficile; aucune notation de multiplication n’est exigée.'),
     support('problemSteps',[1],'parent','Aide-mémoire facultatif pour organiser la démarche, une action à la fois.')
    ],
    practice:'maths'
   }
  ]
 }
];
