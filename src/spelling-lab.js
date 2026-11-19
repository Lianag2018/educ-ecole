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
export const ruleNarrationTexts=Object.freeze(spellingRules.flatMap(r=>[ruleIntroText(r),...r.tricks.map(trickText)]));
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
export function labHubMarkup(){
 return `<section class="spelling-lab" aria-label="Pourquoi ça s’écrit comme ça?"><div class="sl-top"><button data-action="french">‹ Mon français</button><span>🔎 Pourquoi ça s’écrit comme ça?</span></div><p class="sl-lead">Choisis un mystère à découvrir.</p><div class="sl-hub">${spellingRules.map(r=>`<button class="sl-card" data-lab-rule="${r.id}"><span aria-hidden="true">${r.icon}</span><b>${esc(r.title)}</b></button>`).join('')}</div></section>`;
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
