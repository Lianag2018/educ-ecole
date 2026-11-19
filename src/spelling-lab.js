// « Pourquoi ça s'écrit comme ça? » : comprendre les sons et leurs lettres, mot décortiqué par syllabes,
// avec des astuces et des exemples. Contenu 100 % original, aucun texte d'éditeur.
// Les syllabes sont écrites avec des crochets autour de la graphie à repérer : « b[ai]·gné ».
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// word = tableau de syllabes; le mot entier se lit en retirant les crochets.
const rules=[
 {id:'e-ouvert',icon:'🥖',title:'Le son « è »',question:'Pourquoi « baigné » s’écrit avec ai, et pas avec è ou es?',
  idea:'Dans baigné, on entend le son è, mais on l’écrit ai. Le son è s’écrit de plusieurs façons. Chaque façon a ses mots.',
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
   {prompt:'Dans « rose », le s fait le son…',text:'ro-se',right:'z',others:['s','k'],explanation:'Dans rose, le s entre deux voyelles fait z.'}]}
];
const plain=syl=>syl.replace(/[\[\]]/g,'');
export const spellingRules=Object.freeze(rules.map(r=>Object.freeze(r)));
export const ruleFor=id=>spellingRules.find(r=>r.id===id)||null;
export const wordOf=syllables=>syllables.map(plain).join('');
export const allWords=()=>[...new Set(spellingRules.flatMap(r=>r.spellings.flatMap(s=>s.words.map(wordOf))))];
// Textes racontés : l'énigme avec son idée, puis les astuces. Les mots sont dits un à un quand on les touche.
export const ruleIntroText=r=>`${r.question} ${r.idea}`;
export const ruleTricksText=r=>r.tricks.map(t=>`${t[1]}. ${t[2]}`).join(' ');
export const ruleNarrationTexts=Object.freeze(spellingRules.flatMap(r=>[ruleIntroText(r),ruleTricksText(r)]));
// Une syllabe avec sa graphie repérée en couleur.
export function syllableMarkup(syl){
 return syl.split(/(\[[^\]]+\])/).filter(Boolean).map(part=>part.startsWith('[')?`<mark class="sl-g">${esc(part.slice(1,-1))}</mark>`:esc(part)).join('');
}
export function wordMarkup(syllables){
 return `<button type="button" class="sl-word" data-lab-word="${esc(wordOf(syllables))}" aria-label="Écouter ${esc(wordOf(syllables))}">${syllables.map(s=>`<span class="sl-syl">${syllableMarkup(s)}</span>`).join('<i aria-hidden="true">·</i>')}</button>`;
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
 if(step<=0)body=`<h1>${rule.icon} ${esc(rule.question)}</h1><p class="sl-idea">${esc(rule.idea)}</p><div class="sl-rows">${rule.spellings.map(s=>`<div class="sl-row"><b class="sl-badge">${esc(s.g)}</b><div class="sl-words">${s.words.map(wordMarkup).join('')}</div></div>`).join('')}</div><p class="sl-hint">Touche un mot pour l’écouter, syllabe par syllabe.</p><div class="sl-nav"><button class="sl-listen" data-lab-listen>🔊 Écouter</button><button class="sl-next" data-lab-next>Les astuces ›</button></div>`;
 else if(step===1)body=`<h1>${rule.icon} Mes astuces</h1><ol class="sl-tricks">${rule.tricks.map(t=>`<li><span aria-hidden="true">${t[0]}</span><div><b>${esc(t[1])}</b><p>${esc(t[2])}</p></div></li>`).join('')}</ol><div class="sl-nav"><button data-lab-prev>‹ Observer</button><button class="sl-listen" data-lab-listen>🔊 Écouter</button><button class="sl-next" data-lab-next>À toi de jouer ›</button></div>`;
 else body=`<h1>🎯 À toi de jouer!</h1><p class="sl-idea">3 petites questions pour essayer tes astuces.</p><div class="sl-nav"><button data-lab-prev>‹ Astuces</button><button class="sl-next" data-lab-play>▶ Jouer</button></div>`;
 return `<section class="spelling-lab" aria-label="${esc(rule.title)}"><div class="sl-top"><button data-action="spelling-lab">‹ Les mystères</button><span>${esc(rule.title)}</span></div>${nav}<div class="sl-page">${body}</div></section>`;
}
