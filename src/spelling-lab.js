// « Pourquoi ça s'écrit comme ça? » : comprendre les sons et leurs lettres, mot décortiqué par syllabes,
// avec des astuces et des exemples. Contenu 100 % original, aucun texte d'éditeur.
// Les syllabes sont écrites avec des crochets autour de la graphie à repérer : « b[ai]·gné ».
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// word = tableau de syllabes; le mot entier se lit en retirant les crochets.
const rules=[
 {id:'e-ouvert',icon:'🥖',title:'Le son « è »',question:'Pourquoi « baigné » s’écrit avec ai, et pas avec è ou es?',
  idea:'Dans baigné, on entend le son è, mais on l’écrit ai. Quand les lettres ai sont suivies d’autres lettres, elles font souvent le son è. Le son è s’écrit aussi d’autres façons.',
  spellings:[
   {g:'ai',words:[['b[ai]','gné'],['m[ai]','son']]},
   {g:'è',words:[['p[è]','re'],['ch[è]','vre']]},
   {g:'ê',words:[['t[ê]','te'],['fo','r[ê]t']]},
   {g:'ei',words:[['n[ei]','ge'],['r[ei]','ne']]}],
  tricks:[
   ['🔍','Cherche la famille du mot','Forêt, forestier : le ^ de ê garde la place d’un ancien s. Cherche un mot de la même famille pour comprendre.'],
   ['✌️','Compte les consonnes','Quand le e est suivi de deux consonnes, il fait è sans accent : el-le, mer-ci, ver-te.'],
   ['🗝️','Choisis ton mot-clé','Pour ai, retiens baigné. Pour ei, retiens neige. Quand tu hésites, pense à ton mot-clé.']],
  activity:[
   {prompt:'Quel mot s’écrit avec « ai » pour le son è?',text:'Écoute bien le milieu du mot.',right:'maison',others:['tête','neige'],explanation:'Dans mai-son, le son è s’écrit ai.'},
   {prompt:'Quel mot s’écrit avec « ê »?',text:'L’accent circonflexe ressemble à un petit chapeau.',right:'forêt',others:['mère','reine'],explanation:'Forêt s’écrit avec ê. Pense à forestier.'},
   {prompt:'Comment s’écrit le son è dans « neige »?',text:'Écoute bien le mot neige.',right:'ei',others:['ai','ê'],explanation:'Dans neige, le son è s’écrit ei.'}]},
 {id:'c',icon:'🕵️',title:'Le c doux et le c dur',question:'Pourquoi « cerise » commence par s et « corde » par k?',
  idea:'La lettre c change de son. Un détective regarde la lettre qui vient juste après le c.',
  spellings:[
   {g:'c doux (s)',words:[['[c]e','ri','se'],['[c]i','né','ma']]},
   {g:'c dur (k)',words:[['[c]a','deau'],['[c]or','de']]},
   {g:'ç (s)',words:[['gar','[ç]on'],['le','[ç]on']]}],
  tricks:[
   ['🕵️','Le détective du c','Regarde la lettre après le c. E, i, y : le c est doux, comme s. A, o, u : le c est dur, comme k.'],
   ['🧩','La cédille','Pour faire le son s devant a, o ou u, on met une cédille : ç. Garçon, leçon.'],
   ['🗝️','Ton mot-clé','Retiens cerise pour le c doux et cadeau pour le c dur.']],
  activity:[
   {prompt:'Dans « cerise », le c est…',text:'ce-ri-se',right:'doux (comme s)',others:['dur (comme k)','muet'],explanation:'Le c est suivi de e : il est doux, comme s.'},
   {prompt:'Dans « corde », le c est…',text:'cor-de',right:'dur (comme k)',others:['doux (comme s)','muet'],explanation:'Le c est suivi de o : il est dur, comme k.'},
   {prompt:'Quel mot s’écrit avec ç pour le son s?',text:'Pense à la cédille.',right:'garçon',others:['garage','cadeau'],explanation:'Dans garçon, ç fait le son s devant o.'}]},
 {id:'g',icon:'🦒',title:'Le g doux et le g dur',question:'Pourquoi « girafe » et « gomme » ne commencent pas par le même son?',
  idea:'Comme le c, la lettre g change de son selon la lettre qui vient après.',
  spellings:[
   {g:'g doux (j)',words:[['[g]i','ra','fe'],['[g]en','til']]},
   {g:'g dur (g)',words:[['[g]om','me'],['[g]â','teau']]},
   {g:'gu',words:[['[gu]i','ta','re'],['[gu]é','pard']]}],
  tricks:[
   ['🕵️','Le détective du g','Regarde la lettre après le g. E, i, y : le g est doux, comme j. A, o, u : le g est dur.'],
   ['➕','Le e qui garde le son doux','Dans nous mangeons, on garde un e pour que le g reste doux devant o.'],
   ['🗝️','Ton mot-clé','Retiens girafe pour le g doux et gomme pour le g dur.']],
  activity:[
   {prompt:'Dans « girafe », le g est…',text:'gi-ra-fe',right:'doux (comme j)',others:['dur (comme g)','muet'],explanation:'Le g est suivi de i : il est doux, comme j.'},
   {prompt:'Dans « gomme », le g est…',text:'gom-me',right:'dur (comme g)',others:['doux (comme j)','muet'],explanation:'Le g est suivi de o : il est dur.'},
   {prompt:'Pourquoi écrit-on « nous mangeons » avec un e?',text:'man-geons',right:'Pour garder le g doux',others:['Pour faire joli','Parce que c’est un nom'],explanation:'Le e garde le son doux du g devant o.'}]},
 {id:'o',icon:'🚲',title:'Le son « o »',question:'Pourquoi « vélo », « jaune » et « bateau » ont le même son o?',
  idea:'Le son o s’écrit de trois façons : o, au et eau. Tu les trouves à des endroits différents.',
  spellings:[
   {g:'o',words:[['vé','l[o]'],['m[o]','to']]},
   {g:'au',words:[['j[au]','ne'],['[au]','to']]},
   {g:'eau',words:[['ba','t[eau]'],['gâ','t[eau]']]}],
  tricks:[
   ['🔚','Regarde la fin du mot','À la fin d’un mot, on trouve souvent eau : bateau, gâteau, cadeau.'],
   ['👀','Regarde le début','Au début d’un mot ou au milieu, on trouve souvent au : auto, jaune.'],
   ['🗝️','Ton mot-clé','Retiens vélo pour o, jaune pour au et bateau pour eau.']],
  activity:[
   {prompt:'Comment s’écrit le son o à la fin de « bateau »?',text:'Regarde la fin du mot.',right:'eau',others:['o','au'],explanation:'Bateau finit par eau.'},
   {prompt:'Quel mot s’écrit avec « au »?',text:'Le son o s’écrit de trois façons.',right:'jaune',others:['vélo','bateau'],explanation:'Jaune s’écrit avec au.'},
   {prompt:'Quel mot s’écrit avec un simple « o »?',text:'Cherche le mot sans au ni eau.',right:'moto',others:['gâteau','chaud'],explanation:'Moto s’écrit avec un o.'}]},
 {id:'s',icon:'🐟',title:'Un s ou deux s?',question:'Pourquoi « poisson » a deux s, et « maison » un seul?',
  idea:'Entre deux voyelles, un seul s fait le son z. Pour faire le son s, on double la lettre.',
  spellings:[
   {g:'s = z',words:[['mai','[s]on'],['ro','[s]e']]},
   {g:'ss = s',words:[['poi[s]','[s]on'],['ta[s]','[s]e']]},
   {g:'s = s',words:[['[s]o','leil'],['[s]a','lon']]}],
  tricks:[
   ['✌️','Un seul s entre deux voyelles','Il fait z : maison, rose. Pour le son s, on écrit deux s : poisson, tasse.'],
   ['👂','Écoute puis décide','Dis le mot lentement. Entends-tu z ou s? Ça t’aide à choisir.'],
   ['🗝️','Ton mot-clé','Retiens maison pour z et poisson pour ss.']],
  activity:[
   {prompt:'Dans « maison », que fait le s entre deux voyelles?',text:'mai-son',right:'le son z',others:['le son s','il est muet'],explanation:'Un seul s entre deux voyelles fait le son z.'},
   {prompt:'Quel mot s’écrit avec deux s pour le son s?',text:'Cherche le double s.',right:'poisson',others:['maison','rose'],explanation:'Dans poisson, ss fait le son s.'},
   {prompt:'Dans « rose », le s fait le son…',text:'ro-se',right:'z',others:['s','k'],explanation:'Dans rose, le s entre deux voyelles fait z.'}]},
 {id:'bdpq',icon:'🔄',title:'b, d, p, q : les lettres jumelles',question:'Comment ne jamais mélanger b, d, p et q?',
  idea:'Ces quatre lettres sont faites d’un bâton et d’un ventre. Tout change selon la place du ventre et du bâton. Avec les bons trucs, plus de mélange.',
  spellings:[
   {g:'b (bâton en haut, ventre à droite)',words:[['[b]a','teau'],['[b]a','na','ne']]},
   {g:'d (bâton en haut, ventre à gauche)',words:[['[d]o','mi','no'],['[d]ou','che']]},
   {g:'p (bâton en bas, ventre à droite)',words:[['[p]a','pa'],['[p]i','pe']]},
   {g:'q (bâton en bas, ventre à gauche)',words:[['[q]ua','tre'],['[q]ues','tion']]}],
  tricks:[
   ['✋','Le truc des deux poings','Ferme tes deux poings, pouces en l’air. Les pouces sont les bâtons. Le poing gauche fait un b, le poing droit fait un d. Entre les deux, le mot « bed » : b, lit, d.'],
   ['🚲','Le ventre et le bâton','b et p ont le ventre à droite, comme on écrit : bâton d’abord, ventre ensuite. d et q ont le ventre à gauche. Le bâton qui monte, c’est b ou d. Le bâton qui descend, c’est p ou q.'],
   ['🪄','Le q a besoin du u','Presque toujours, le q est suivi de u : quatre, question. Si tu vois un q tout seul à la fin, comme dans coq ou cinq, c’est un cas rare à retenir.']],
  activity:[
   {prompt:'Quelle lettre a le bâton en bas et le ventre à droite?',text:'Pense à papa.',right:'p',others:['b','d'],explanation:'Le p a son bâton qui descend et son ventre à droite.'},
   {prompt:'Quel mot commence par la lettre d?',text:'Le ventre est à gauche, le bâton monte.',right:'douche',others:['bateau','papa'],explanation:'Dans douche, la première lettre est d.'},
   {prompt:'Après le q, on met presque toujours…',text:'qua-tre',right:'la lettre u',others:['la lettre a','la lettre s'],explanation:'Le q aime avoir un u derrière lui : quatre, question.'}]},
 {id:'fin-e',icon:'⛰️',title:'Le son « é » à la fin',question:'Pourquoi « manger », « mangez » et « j’ai » finissent par le même son?',
  idea:'Le son é à la fin d’un mot s’écrit de plusieurs façons : é, er, ez, ai. Le petit mot qui est devant t’aide à choisir.',
  spellings:[
   {g:'é',words:[['man','g[é]'],['bé','b[é]']]},
   {g:'er',words:[['man','g[er]'],['jou','[er]']]},
   {g:'ez',words:[['man','g[ez]'],['sa','v[ez]']]},
   {g:'ai',words:[['man','ge','r[ai]'],['se','r[ai]']]}],
  tricks:[
   ['🔁','Le truc du remplacement','Remplace le mot par vendre. Si « vendre » va, c’est er : manger, vendre. Si « vendu » va, c’est é : mangé, vendu.'],
   ['🗣️','Vous, tu l’entends?','Si le mot suit « vous », c’est souvent ez : vous mangez, vous jouez.'],
   ['👤','Moi, je…','Quand c’est moi qui le fera plus tard : je mangerai, je verrai. Avec ai à la fin.']],
  activity:[
   {prompt:'Comment finit « il veut manger »?',text:'Remplace par vendre.',right:'er',others:['é','ez'],explanation:'On peut dire « il veut vendre » : donc er.'},
   {prompt:'Comment finit « vous mangez »?',text:'Vous… mange?',right:'ez',others:['er','é'],explanation:'Après vous, on écrit souvent ez.'},
   {prompt:'Comment finit « j’ai mangé »?',text:'Remplace par vendu.',right:'é',others:['er','ez'],explanation:'On peut dire « j’ai vendu » : donc é.'}]},
 {id:'m-bp',icon:'🧓',title:'m devant b et p',question:'Pourquoi on écrit « jambe » et « lampe » avec un m, mais « banane » avec un n?',
  idea:'Devant b ou p, le n se change en m. Le son ne change pas : an, on et in deviennent am, om, im.',
  spellings:[
   {g:'am',words:[['ja[m]','be'],['la[m]','pe']]},
   {g:'om',words:[['po[m]','pe'],['no[m]','bre']]},
   {g:'im',words:[['si[m]','ple'],['ti[m]','bre']]},
   {g:'em',words:[['se[m]','blable'],['te[m]','pête']]}],
  tricks:[
   ['🧍','Grand-papa et sa marchette','Pour retenir, imagine un grand-père avec sa marchette : le m ressemble à une marchette. Il apparaît quand b et p sont assis tout près.'],
   ['⚠️','Une seule exception','Le mot « bonbon » garde son n, même devant b : c’est l’exception à retenir.'],
   ['👂','Écoute : le son est le même','am dit an, om dit on, im dit in. Tu écris m, mais tu entends le même son.']],
  activity:[
   {prompt:'Quel mot s’écrit avec un m devant le p?',text:'Écoute lam-pe.',right:'lampe',others:['banane','lune'],explanation:'Devant p, on écrit m : lampe.'},
   {prompt:'Dans « jambe », que dit « am »?',text:'jam-be',right:'an',others:['on','in'],explanation:'am dit le même son que an.'},
   {prompt:'Quel mot est l’exception qui garde son n devant b?',text:'bon-bon',right:'bonbon',others:['jambe','tambour'],explanation:'Bonbon s’écrit avec n, c’est l’exception.'}]},
 {id:'muets',icon:'🤫',title:'Les lettres spectatrices',question:'Pourquoi « eau », « œuf » et « hôtel » ont des lettres qu’on n’entend pas?',
  idea:'Dans certains groupes, une lettre parle et les autres regardent en silence. Dans eau, c’est le o qu’on entend. Dans œu, c’est le son e. Et h ne dit presque jamais rien.',
  spellings:[
   {g:'eau',words:[['ba','t[eau]'],['cha','p[eau]']]},
   {g:'œu',words:[['b[œu]','f'],['c[œu]','r']]},
   {g:'h muet',words:[['[h]ô','tel'],['[h]i','ver']]},
   {g:'e muet',words:[['pom','m[e]'],['ro','s[e]']]}],
  tricks:[
   ['👀','Les spectateurs','Dans eau, e et a regardent sans parler. Dans œu, o et u regardent. Un seul de la bande parle.'],
   ['🤐','Mademoiselle h','Le h est timide et se cache. Ne la fais pas parler. Seule exception : ch, qui fait ch ou k.'],
   ['🐢','Le petit e de la fin','À la fin de pomme ou de rose, le e se tait. Il aide seulement la lettre d’avant : pomme, rose.']],
  activity:[
   {prompt:'Dans « bateau », quelle lettre parle?',text:'ba-teau',right:'le o',others:['le e','le a'],explanation:'Dans eau, on entend o. e et a sont des spectateurs.'},
   {prompt:'Le h de « hôtel » dit…',text:'hô-tel',right:'rien du tout',others:['h','ch'],explanation:'Le h est muet dans hôtel.'},
   {prompt:'Dans « rose », le e de la fin…',text:'ro-se',right:'se tait',others:['dit è','dit é'],explanation:'Le e de la fin se tait.'}]},
 {id:'tion',device:true,icon:'🎪',title:'tion se dit « sion »',question:'Pourquoi « attention » se dit avec un son s alors qu’on écrit t?',
  idea:'Les lettres tion forment une équipe de cirque. Sur le fil, le t se fait remplacer par un s : on dit « sion ».',
  spellings:[{g:'tion',words:[['at','ten','[tion]'],['ac','[tion]']]},{g:'tion',words:[['col','la','[tion]'],['sous','trac','[tion]']]}],
  tricks:[['🎪','Le t qui tombe du fil','Dans tion, le t tombe et le s prend sa place : on entend « sion ».'],['👏','Tape les syllabes','at-ten-tion : trois tapes. La dernière fait « sion ».'],['🔎','Cherche la fin du mot','Si un mot finit par le son « sion » et parle d’une action, pense à tion.']],
  activity:[{prompt:'Comment se dit la fin de « collation »?',text:'col-la-tion',right:'sion',others:['tion comme tomate','chion'],explanation:'tion se dit « sion ».'},{prompt:'Quel mot finit par tion?',text:'Écoute la fin.',right:'attention',others:['garçon','maison'],explanation:'Attention finit par tion.'},{prompt:'Qui prend la place du t sur le fil?',text:'Le cirque des lettres.',right:'le s',others:['le k','le p'],explanation:'Le s remplace le t : tion = sion.'}]},
 {id:'ph',device:true,icon:'👻',title:'ph fait « f »',question:'Pourquoi « photo » commence par ph et pas par f?',
  idea:'Les lettres ph ensemble font le son f. C’est monsieur f caché sous un drap de fantôme avec sa pompe à vélo.',
  spellings:[{g:'ph',words:[['[ph]o','to'],['é','lé','[ph]ant']]},{g:'ph',words:[['té','lé','[ph]o','ne'],['dau','[ph]in']]}],
  tricks:[['👻','Monsieur f sous le drap','Quand tu vois ph, pense à monsieur f caché qui fait « fff-fff ».'],['🔁','Remplace ph par f','Si tu changes ph en f et que le mot sonne pareil, tu as trouvé : photo, foto.'],['📝','Des mots savants','Éléphant, téléphone, dauphin : de grands mots avec ph.']],
  activity:[{prompt:'Quel son font les lettres ph?',text:'pho-to',right:'f',others:['p','h'],explanation:'ph fait le son f.'},{prompt:'Quel mot s’écrit avec ph?',text:'Écoute le début.',right:'photo',others:['fée','farine'],explanation:'Photo s’écrit avec ph.'},{prompt:'Qui est caché sous le drap?',text:'Monsieur…',right:'f',others:['p','h'],explanation:'Monsieur f se cache sous le drap de ph.'}]},
 {id:'ill',device:true,icon:'🐲',title:'ill et il : la gentille bête',question:'Pourquoi « fille » et « soleil » font le petit bruit i-e?',
  idea:'Les lettres ill sont les antennes d’une gentille bête qui cligne des yeux : « i-e, i-e ». Les lettres il à la fin d’un mot, après a, e, eu ou ou, font le même bruit.',
  spellings:[{g:'ill',words:[['fa','m[ill]e'],['gre','nou[ill]e']]},{g:'il',words:[['so','le[il]'],['tra','va[il]']]}],
  tricks:[['🐲','La gentille bête','Quand tu vois ill, imagine la bête qui cligne des yeux : i-e, i-e.'],['👶','Le bébé à deux antennes','À la fin du mot, la bête bébé n’a que deux antennes : il.'],['👂','Écoute le « ille »','Fille, famille, abeille : à la fin on entend « ille ».']],
  activity:[{prompt:'Quel bruit fait ill?',text:'fil-le',right:'i-e',others:['i-l','i-n'],explanation:'ill fait i-e.'},{prompt:'Quel mot a la gentille bête ill?',text:'Écoute le milieu.',right:'grenouille',others:['lapin','chocolat'],explanation:'Grenouille a ill.'},{prompt:'Combien d’antennes pour il (bébé)?',text:'Pense à la bête bébé.',right:'deux',others:['trois','une'],explanation:'il a deux antennes, ill en a trois.'}]},
 {id:'ch-k',device:true,icon:'🪵',title:'ch : « ch » ou « k »',question:'Pourquoi « chat » fait ch, mais « orchestre » fait k?',
  idea:'Les lettres ch font souvent « chchch ». Si le mot sonne bizarre, essaie k : la timide h se cache à côté du c, et on entend la branche qui casse.',
  spellings:[{g:'ch (ch)',words:[['[ch]a','peau'],['mou','[ch]e']]},{g:'ch (k)',words:[['or','[ch]es','tre'],['é','[ch]o']]}],
  tricks:[['🤫','Chchch d’abord','Essaie toujours le son « chchch » en premier : ça marche presque tout le temps.'],['🪵','Sinon, la branche','Si le mot ne sonne pas comme un mot connu, essaie k : orchestre, écho, chorale.'],['🧠','Les mots savants','Les mots de musique et de science ont souvent ch = k.']],
  activity:[{prompt:'Comment se dit ch dans « chapeau »?',text:'cha-peau',right:'ch',others:['k','s'],explanation:'Dans chapeau, ch fait « chchch ».'},{prompt:'Comment se dit ch dans « orchestre »?',text:'or-ches-tre',right:'k',others:['ch','s'],explanation:'Dans orchestre, ch fait k.'},{prompt:'Si ch sonne bizarre, on essaie…',text:'Pense à la branche.',right:'k',others:['z','p'],explanation:'On essaie le son k.'}]},
 {id:'oi',device:true,icon:'🪿',title:'oi : l’appel de l’oie',question:'Pourquoi « oiseau » et « moi » ont le même son?',
  idea:'Les lettres oi font le son « oi », comme le fermier qui appelle son oie : « oi-oi-oi ».',
  spellings:[{g:'oi',words:[['[oi]','seau'],['mi','r[oi]r']]},{g:'oi',words:[['é','t[oi]','le'],['b[oi]','re']]}],
  tricks:[['🪿','L’appel du fermier','Mets les mains en cornet et appelle l’oie : oi-oi-oi.'],['👀','Deux lettres, un son','o et i travaillent ensemble : ne les sépare pas, lis « oi ».'],['🗣️','Des mots de tous les jours','Moi, toi, roi, voix, étoile, noir, trois.']],
  activity:[{prompt:'Quel son font les lettres oi?',text:'Écoute le mot oiseau.',right:'oi',others:['o-i','ou'],explanation:'oi se dit « oi ».'},{prompt:'Quel mot a oi?',text:'Écoute le milieu.',right:'étoile',others:['lapin','banane'],explanation:'Étoile a oi.'},{prompt:'Qui appelle l’oie?',text:'Le…',right:'fermier',others:['pirate','roi'],explanation:'Le fermier appelle son oie.'}]},
 {id:'o-au',device:true,icon:'🎅',title:'Le son « o » : o, au, eau',question:'Pourquoi « moto », « auto » et « bateau » ont le même son o?',
  idea:'Le son o s’écrit de trois façons : o, au et eau. Comme le rire du père Noël : « oh-oh-oh ».',
  spellings:[{g:'o',words:[['m[o]','to'],['ra','di','[o]']]},{g:'au',words:[['[au]','to'],['[au]','tomne']]},{g:'eau',words:[['ba','t[eau]'],['cha','p[eau]']]}],
  tricks:[['🎅','Le rire du père Noël','Fais une bouche ronde : oh-oh-oh. Pour écrire ce son, pense à o, au ou eau.'],['🔎','Cherche la famille','Un mot de la même famille aide : chapeau, chapelier.'],['🗝️','Choisis un mot-clé','Retiens moto pour o, auto pour au, bateau pour eau.']],
  activity:[{prompt:'Comment s’écrit le son o dans « bateau »?',text:'ba-teau',right:'eau',others:['au','o'],explanation:'Bateau s’écrit avec eau.'},{prompt:'Comment s’écrit le son o dans « auto »?',text:'Écoute le mot auto.',right:'au',others:['eau','ô'],explanation:'Auto s’écrit avec au.'},{prompt:'Quel rire fait le son o?',text:'Pense au père Noël.',right:'oh-oh-oh',others:['ha-ha-ha','hi-hi-hi'],explanation:'Le père Noël rit « oh-oh-oh ».'}]},
 {id:'an-en',device:true,icon:'🚶',title:'an, en, am, em : le son « an »',question:'Pourquoi « enfant » et « maman » ont le même son an?',
  idea:'Le son an s’écrit an ou en. Devant b ou p, il devient am ou em. Imagine grand-papa qui répète « an? an? » en marchant.',
  spellings:[{g:'an',words:[['ma','m[an]'],['o','r[an]','ge']]},{g:'en',words:[['[en]','fant'],['v[en]','te']]}],
  tricks:[['🚶','Grand-papa et sa marchette','Il dit toujours « an? an? ». Pense à lui quand tu vois an ou en.'],['🔁','Am et em devant b ou p','jambe, lampe, temps : m au lieu de n devant b ou p.'],['👂','Écoute bien','Enfant, vent, dent, blanc, orange : toujours le son « an ».']],
  activity:[{prompt:'Quel son font les lettres en dans « enfant »?',text:'en-fant',right:'an',others:['on','in'],explanation:'en dit « an ».'},{prompt:'Comment s’écrit le son an dans « orange »?',text:'o-ran-ge',right:'an',others:['on','in'],explanation:'Orange s’écrit avec an.'},{prompt:'Devant p, an devient…',text:'lam-pe',right:'am',others:['ap','on'],explanation:'Devant p, on écrit am.'}]},
 {id:'in-ain',device:true,icon:'📺',title:'Le son « in » : in, ain, ein, im',question:'Pourquoi « lapin », « pain » et « peinture » ont le même son?',
  idea:'Le son in s’écrit de plusieurs façons : in, ain, ein, im. Comme le bouton du jeu-questionnaire à la télévision : « in! ».',
  spellings:[{g:'in',words:[['la','p[in]'],['ma','t[in]']]},{g:'ain',words:[['m[ain]','te','nant'],['de','m[ain]']]},{g:'ein',words:[['p[ein]','tu','re'],['c[ein]','tu','re']]},{g:'im',words:[['s[im]','ple'],['t[im]','bre']]}],
  tricks:[['📺','Le bouton « in! »','Appuie sur un bouton imaginaire en disant « in! » quand tu entends ce son.'],['🔁','m devant b et p','Devant b ou p, in devient im : timbre, simple.'],['🗝️','Choisis un mot-clé','Retiens lapin pour in, pain pour ain, peinture pour ein.']],
  activity:[{prompt:'Comment s’écrit le son in dans « pain »?',text:'pain',right:'ain',others:['in','ein'],explanation:'Pain s’écrit avec ain.'},{prompt:'Comment s’écrit le son in dans « peinture »?',text:'pein-tu-re',right:'ein',others:['ain','im'],explanation:'Peinture s’écrit avec ein.'},{prompt:'Devant p, in devient…',text:'sim-ple',right:'im',others:['ip','an'],explanation:'Devant p, on écrit im.'}]},
 {id:'un-um',device:true,icon:'☝️',title:'Le son « un » : un, um',question:'Pourquoi « lundi » et « parfum » ont le même son?',
  idea:'Le son un s’écrit un ou um. Lève un doigt et dis « un ». Devant b ou p, un devient um.',
  spellings:[{g:'un',words:[['l[un]','di'],['cha','c[un]']]},{g:'um',words:[['par','f[um]'],['h[um]','ble']]}],
  tricks:[['☝️','Un seul doigt','Lève un doigt en disant « un » : c’est le son un.'],['🔁','Um devant b et p','Humble, parfum : m au lieu de n.'],['⚠️','Un son rare','Le son un est rare : il y a peu de mots, c’est facile de les retenir.']],
  activity:[{prompt:'Quel son font les lettres un?',text:'lun-di',right:'un',others:['on','in'],explanation:'un dit « un ».'},{prompt:'Comment s’écrit le son un dans « parfum »?',text:'par-fum',right:'um',others:['un','on'],explanation:'Parfum s’écrit avec um.'},{prompt:'Combien de doigts pour le son un?',text:'Lève la main.',right:'un',others:['deux','trois'],explanation:'On lève un doigt.'}]},
 {id:'ien',device:true,icon:'🐕',title:'ien : le son « i-in »',question:'Pourquoi « chien » et « bien » font i-in?',
  idea:'Les lettres ien font le son i-in : dans l’histoire de la classe, le e a été remplacé par i pour réciter la comptine.',
  spellings:[{g:'ien',words:[['b[ien]','tôt'],['mu','si','c[ien]']]},{g:'ien',words:[['ma','gi','c[ien]'],['ch[ien]','ne']]}],
  tricks:[['🎤','La comptine','Quand tu vois ien, pense à la classe qui récite : i-in.'],['✂️','Ne coupe pas','Ne lis pas chi-an : lis chien, avec ien tout ensemble.'],['🗣️','Mots de tous les jours','Chien, bien, rien, musicien, magicien.']],
  activity:[{prompt:'Quel son font les lettres ien?',text:'chien',right:'i-in',others:['i-an','i-on'],explanation:'ien se dit « i-in ».'},{prompt:'Quel mot a ien?',text:'Écoute la fin.',right:'musicien',others:['chat','lapin'],explanation:'Musicien a ien.'},{prompt:'Faut-il couper ien en deux?',text:'Lis-le d’un coup.',right:'non',others:['oui','parfois'],explanation:'On lit ien tout ensemble.'}]},
 {id:'eu-oeu',device:true,icon:'🤔',title:'Le son « eu » : eu, œu',question:'Pourquoi « feu », « peur » et « cœur » ont le son eu?',
  idea:'Le son eu s’écrit eu ou œu. Dans œu, le o et le u sont des spectateurs qui laissent parler le e.',
  spellings:[{g:'eu',words:[['f[eu]','tre'],['bl[eu]','et']]},{g:'œu',words:[['c[œu]','r'],['s[œu]','r']]}],
  tricks:[['👀','Les spectateurs','Dans œu, le o et le u regardent. On entend eu.'],['🤔','Le geste du penseur','Pose le menton dans ta main et dis « eu… ».'],['🗝️','Mots-clés','Feu, peur, cœur, sœur, bœuf.']],
  activity:[{prompt:'Quel son font les lettres œu?',text:'cœur',right:'eu',others:['ou','o'],explanation:'œu se dit « eu ».'},{prompt:'Quel mot a œu?',text:'Écoute le milieu.',right:'sœur',others:['soupe','ballon'],explanation:'Sœur a œu.'},{prompt:'Qui parle dans œu?',text:'Qui regarde? Qui parle?',right:'le e',others:['le o','le u'],explanation:'On entend le e : eu.'}]},
 {id:'gn',device:true,icon:'😝',title:'gn : le son « gn »',question:'Pourquoi « montagne » a un g et un n qui se disent ensemble?',
  idea:'Les lettres gn font un seul son, comme l’enfant qui se moque : « gn-gn-gn ». Ne sépare pas le g et le n.',
  spellings:[{g:'gn',words:[['mon','ta','[gn]','e'],['li','[gn]','e']]},{g:'gn',words:[['a','rai','[gn]','ée'],['cham','pi','[gn]','on']]}],
  tricks:[['😝','Le moqueur','Plisse le nez et chante « gn-gn-gn » : ça fait le son gn.'],['✂️','Ne coupe pas','gn est un seul son. Dans mon-ta-gne, le gn va ensemble.'],['🗝️','Mots-clés','Retiens montagne et champignon.']],
  activity:[{prompt:'Quel son font les lettres gn?',text:'mon-ta-gne',right:'gn',others:['g','n'],explanation:'gn est un seul son.'},{prompt:'Quel mot a gn?',text:'Écoute le milieu.',right:'montagne',others:['ballon','lapin'],explanation:'Montagne a gn.'},{prompt:'Comment lire gn?',text:'Pense à la montagne.',right:'ensemble',others:['séparés','g seulement'],explanation:'On lit gn ensemble.'}]},
 {id:'k-q',device:true,icon:'🪵',title:'Le son « k » : c, k, qu',question:'Pourquoi « cadeau », « kiwi » et « quatre » commencent par k?',
  idea:'Le son k s’écrit c (devant a, o, u), k ou qu. Comme une branche qui casse : « k! ».',
  spellings:[{g:'c',words:[['[c]a','deau'],['[c]or','de']]},{g:'k',words:[['[k]i','wi'],['[k]a','ra','té']]},{g:'qu',words:[['[qu]a','tre'],['ra','[qu]et','te']]}],
  tricks:[['🪵','La branche qui casse','Casse une branche imaginaire en disant « k! ».'],['🔎','Qu : le u accompagne le q','Presque toujours, q a besoin de son ami u : quatre, question.'],['🗝️','Mots-clés','Cadeau pour c, kiwi pour k, quatre pour qu.']],
  activity:[{prompt:'Comment s’écrit le son k dans « quatre »?',text:'qua-tre',right:'qu',others:['c','k'],explanation:'Quatre s’écrit avec qu.'},{prompt:'Comment s’écrit le son k dans « kiwi »?',text:'ki-wi',right:'k',others:['c','qu'],explanation:'Kiwi s’écrit avec k.'},{prompt:'Quelle lettre accompagne le q?',text:'Presque toujours…',right:'u',others:['a','s'],explanation:'Le q a besoin du u.'}]},
 {id:'x',device:true,icon:'🥁',title:'x : « ks » ou « gz »',question:'Pourquoi « taxi » a un x qui dit ks?',
  idea:'La lettre x fait le plus souvent « ks », comme le bruit des cymbales. Au début de certains mots, elle fait « gz ».',
  spellings:[{g:'x (ks)',words:[['ta','[x]i'],['te','[x]','te']]},{g:'x (gz)',words:[['e','[x]','em','ple'],['e','[x]','act']]}],
  tricks:[['🥁','Les cymbales','Fais « ksss-ksss » en frappant les cymbales : c’est le x.'],['👂','Écoute si ça sonne gz','Au début, exemple et exact font gz.'],['🗝️','Mots-clés','Taxi, texte, exemple.']],
  activity:[{prompt:'Quel son fait x dans « taxi »?',text:'ta-xi',right:'ks',others:['gz','s'],explanation:'Dans taxi, x fait ks.'},{prompt:'Quel instrument fait « ksss »?',text:'Pense au x.',right:'les cymbales',others:['le piano','la flûte'],explanation:'Le x ressemble aux cymbales.'},{prompt:'Dans « exemple », x fait…',text:'e-xem-ple',right:'gz',others:['ks','k'],explanation:'Dans exemple, x fait gz.'}]},
 {id:'y',device:true,icon:'🐭',title:'y : le i grec',question:'Pourquoi « pyjama » et « cygne » ont un y?',
  idea:'La lettre y fait le son i ou i-i, comme la souris acrobate vue de dos. Dans bicyclette, c’est i. Dans crayon, c’est i-i.',
  spellings:[{g:'y (i)',words:[['bi','c[y]','clet','te'],['c[y]','gne']]},{g:'y (i-i)',words:[['cra','[y]on'],['[y]o','gourt']]}],
  tricks:[['🐭','La souris vue de dos','Imagine la souris y accrochée à sa corde : elle crie « i-i ».'],['👀','Y fait parfois deux i','Crayon se dit « cra-i-ion » : le y compte pour deux i.'],['🗝️','Mots-clés','Pyjama, cygne, bicyclette, crayon.']],
  activity:[{prompt:'Quel son fait y dans « pyjama »?',text:'py-ja-ma',right:'i',others:['ou','a'],explanation:'Dans pyjama, y fait i.'},{prompt:'Dans « crayon », y fait…',text:'cra-yon',right:'i-i',others:['a','ou'],explanation:'Dans crayon, y fait i-i.'},{prompt:'À qui ressemble y?',text:'Pense à la souris.',right:'à la souris i',others:['au loup','au chat'],explanation:'y est le cousin de i.'}]},
 {id:'jumeaux',device:true,icon:'👯',title:'Les jumeaux : deux lettres pareilles',question:'Pourquoi « pomme », « belle » et « bonne » ont deux lettres pareilles?',
  idea:'Quand deux consonnes pareilles sont côte à côte, ce sont des jumeaux : ils restent ensemble. Devant des jumeaux, le e fait le son è.',
  spellings:[{g:'mm',words:[['po','m[m]e'],['gom','m[m]e']]},{g:'ll',words:[['be','l[l]e'],['pe','l[l]e']]},{g:'nn',words:[['bo','n[n]e'],['a','n[n]ée']]},{g:'tt',words:[['pa','t[t]e'],['bo','t[t]e']]}],
  tricks:[['👯','Les jumeaux restent ensemble','Deux consonnes pareilles ne se séparent pas : pom-me, bel-le.'],['🔊','On entend une seule fois','Pomme : on n’entend qu’un seul m, mais on en écrit deux.'],['✌️','Le e devant des jumeaux','Un e suivi de deux consonnes fait le son è : belle, terre, verre.']],
  activity:[{prompt:'Combien de m dans « pomme »?',text:'pom-me',right:'deux',others:['un','trois'],explanation:'Pomme s’écrit avec deux m : des jumeaux.'},{prompt:'Quel mot a des jumeaux?',text:'Regarde le milieu.',right:'belle',others:['lapin','chat'],explanation:'Belle a deux l.'},{prompt:'Devant des jumeaux, le e fait…',text:'bel-le',right:'è',others:['é','eu'],explanation:'Un e devant des jumeaux fait è.'}]},
];
const plain=syl=>syl.replace(/[\[\]]/g,'');
export const spellingRules=Object.freeze(rules.map(r=>Object.freeze(r)));
export const ruleFor=id=>spellingRules.find(r=>r.id===id)||null;
export const wordOf=syllables=>syllables.map(plain).join('');
export const allWords=()=>[...new Set(spellingRules.flatMap(r=>r.spellings.flatMap(s=>s.words.map(wordOf))))];
// Textes racontés : l'énigme avec son idée, puis les astuces. Les mots sont dits un à un quand on les touche.
export const ruleIntroText=r=>`${r.question} ${r.idea}`;
export const trickText=t=>`${t[1]}. ${t[2]}`;
export const ruleTricksText=r=>r.tricks.map(trickText).join(' ');
export const ruleNarrationTexts=Object.freeze(spellingRules.filter(r=>!r.device).flatMap(r=>[ruleIntroText(r),...r.tricks.map(trickText)]));
// Une syllabe avec sa graphie repérée en couleur.
export function syllableMarkup(syl){
 return syl.split(/(\[[^\]]+\])/).filter(Boolean).map(part=>part.startsWith('[')?`<mark class="sl-g">${esc(part.slice(1,-1))}</mark>`:esc(part)).join('');
}
export function wordMarkup(syllables){
 return `<button type="button" class="sl-word" data-lab-word="${esc(wordOf(syllables))}" aria-label="Entendre ${esc(wordOf(syllables))}">${syllables.map(s=>`<span class="sl-syl">${syllableMarkup(s)}</span>`).join('<i aria-hidden="true">·</i>')}</button>`;
}
export function labCards(rule){
 return rule.activity.map((a,i)=>{
  const choices=[a.right,...a.others];for(let k=0;k<(i+1)%choices.length;k++)choices.push(choices.shift());
  return {id:`lab-${rule.id}-${i}`,skill:'mots',level:2,prompt:a.prompt,text:a.text,choices,answer:choices.indexOf(a.right),explanation:a.explanation,grade:3,spellingLab:true};
 });
}
export const HUB_PER_PAGE=6;
export const hubPages=()=>Math.max(1,Math.ceil(spellingRules.length/HUB_PER_PAGE));
export function labHubMarkup(page=0){
 const pages=hubPages(),at=Math.max(0,Math.min(page,pages-1)),list=spellingRules.slice(at*HUB_PER_PAGE,(at+1)*HUB_PER_PAGE);
 return `<section class="spelling-lab" aria-label="Pourquoi ça s’écrit comme ça?"><div class="sl-top"><button data-action="french">‹ Mon français</button><span>🔎 ${spellingRules.length} mystères</span></div><p class="sl-lead">Choisis un mystère à découvrir.</p><div class="sl-hub">${list.map(r=>`<button class="sl-card" data-lab-rule="${r.id}"><span aria-hidden="true">${r.icon}</span><b>${esc(r.title)}</b></button>`).join('')}</div><div class="tb-nav"><button data-hub-prev aria-label="Page précédente" ${at<=0?'disabled':''}>◀</button><span>${at+1} / ${pages}</span><button data-hub-next aria-label="Page suivante" ${at>=pages-1?'disabled':''}>▶</button></div></section>`;
}
// Étapes : 0 = observe, 1 = astuces, 2 = à toi.
export function labRuleMarkup(rule,step=0){
 const nav=`<div class="sl-steps" aria-label="Étape ${step+1} sur 3">${['Observe','Astuces','À toi'].map((t,i)=>`<i class="${i<step?'done':i===step?'now':''}">${t}</i>`).join('')}</div>`;
 let body;
 if(step<=0)body=`<div class="sl-read" role="button" tabindex="0" data-lab-read aria-label="Toucher pour écouter"><h1>${rule.icon} ${esc(rule.question)}</h1><p class="sl-idea">${esc(rule.idea)}</p></div><div class="sl-rows">${rule.spellings.map(s=>`<div class="sl-row"><b class="sl-badge">${esc(s.g)}</b><div class="sl-words">${s.words.map(wordMarkup).join('')}</div></div>`).join('')}</div><p class="sl-hint">Touche le texte ou un mot : tu l’entends, syllabe par syllabe.</p><div class="sl-nav"><button class="sl-next" data-lab-next>Les astuces ›</button></div>`;
 else if(step===1)body=`<h1>${rule.icon} Mes astuces</h1><ol class="sl-tricks">${rule.tricks.map(t=>`<li role="button" tabindex="0" data-lab-say="${esc(trickText(t))}"><span aria-hidden="true">${t[0]}</span><div><b>${esc(t[1])}</b><p>${esc(t[2])}</p></div></li>`).join('')}</ol><div class="sl-nav"><button data-lab-prev>‹ Observer</button><button class="sl-next" data-lab-next>À toi de jouer ›</button></div>`;
 else body=`<h1>🎯 À toi de jouer!</h1><p class="sl-idea">3 petites questions pour essayer tes astuces.</p><div class="sl-nav"><button data-lab-prev>‹ Astuces</button><button class="sl-next" data-lab-play>▶ Jouer</button><button data-journey-next>➡ Étape suivante</button></div>`;
 return `<section class="spelling-lab" aria-label="${esc(rule.title)}"><div class="sl-top"><button data-action="spelling-lab">‹ Les mystères</button><span>${esc(rule.title)}</span></div>${nav}<div class="sl-page">${body}</div></section>`;
}
