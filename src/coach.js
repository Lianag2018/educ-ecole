// Le prof des sons : à chaque erreur d'écriture, un conseil précis (reformulé, original) au lieu d'un simple « presque ».
// On compare le mot attendu et le mot écrit; on cherche la règle la plus utile à rappeler, puis on termine par la méthode des syllabes.
import {syllabify} from './syllables.js';
const norm=s=>String(s??'').normalize('NFC').trim().toLowerCase().replace(/\s+/g,'');
const strip=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
const ACC={'é':'Le é avec l’accent aigu fait le son « é », comme un cri qui monte : hé hop!','è':'Le è avec l’accent grave fait le son « è », comme le cri de quelqu’un qui descend une pente.','ê':'Le ê avec le petit chapeau fait le son « è », comme le chapeau de fête.','à':'Le à avec l’accent grave se dit comme un a.','â':'Le â avec son chapeau se dit comme un a profond.','ô':'Le ô avec son chapeau fait le son « o ».','î':'Le î avec son chapeau se dit comme un i.','û':'Le û avec son chapeau se dit comme un u.','ë':'Le ë avec ses deux points fait le son « è ».','ç':'Le ç avec sa cédille fait le son « s », comme le petit serpent.'};
const RULES=[
 [/([bcdfgklmnprstvz])\1/g,t=>`Ce mot a des jumeaux : deux « ${t.match(/([bcdfgklmnprstvz])\1/)[1]} » côte à côte. Les jumeaux restent toujours ensemble.`],
 [/m[bp]|n[bp]/g,()=>'Devant b ou p, on écrit m et non n : jambe, lampe, timbre. C’est la marchette de grand-papa!'],
 [/ç/g,()=>ACC['ç']],
 [/ph/g,()=>'Les lettres ph font le son « f ». Pense à monsieur f caché sous son drap.'],
 [/gu[eiéèêy]/g,()=>'Le u garde le g dur devant e ou i : guitare, guidon.'],
 [/tion/g,()=>'Le groupe tion se dit « sion », comme si le s avait pris la place du t.'],
 [/ill|[aeou]il/g,()=>'Les lettres ill (ou il après a, e, eu, ou) font le petit bruit de la gentille bête : i-e, i-e.'],
 [/eau/g,()=>'Dans eau, e et a sont des spectateurs : on entend seulement le son « o ».'],
 [/œu/g,()=>'Dans œu, le o et le u sont des spectateurs : on entend seulement « eu ».'],
 [/oi/g,()=>'Les lettres oi font « oi », comme l’appel du fermier à son oie.'],
 [/ch/g,()=>'Les lettres ch font souvent « chchch », comme pour calmer un bébé. Parfois elles font « k », comme une branche qui casse.'],
 [/^h|[aeiou]h/g,()=>'Mademoiselle h est timide : elle ne dit presque jamais rien, mais elle est là dans le mot.'],
 [/x/g,()=>'Le x fait « ks » comme le bruit des cymbales : ksss.'],
 [/(er|ez|é|ée)$/g,()=>'À la fin d’un mot, le son é s’écrit é, er, ez ou ai. Remplace par « vendre » : si ça va, c’est er; si « vendu » va, c’est é.'],
 [/ai|ei|e[bcdfgklmnprstvz]{2}/g,()=>'Le son « è » peut s’écrire è, ê, ai, ei, ou e suivi de deux consonnes : mère, forêt, maison, neige, belle.'],
 [/c[eiy]/g,()=>'Devant e, i ou y, le c est doux, comme un s : cerise, cinéma. Devant a, o, u, il est dur, comme k.'],
 [/g[eiy]/g,()=>'Devant e, i ou y, le g est doux, comme j : girafe. Devant a, o, u, il est dur.'],
 [/[aeiouy]s[aeiouy]/g,()=>'Un s entre deux voyelles fait le son « z » : maison, rose. Pour faire « s », on écrit ss : poisson.']
];
const covers=(t,re,wrong)=>{for(const m of t.matchAll(re)){const from=m.index,to=m.index+m[0].length;if(!wrong.length||wrong.some(k=>k>=from-1&&k<=to))return true;}return false;};
export function coachTip(target,attempt,wrong=[]){
 const t=norm(target),a=norm(attempt);
 const syl=syllabify(t);
 const method=syl.length>1?` Découpe en syllabes : ${syl.join('-')}, et écris-les une à une.`:'';
 if(!a)return 'Écoute le mot et écris-le lettre par lettre.'+method;
 if(strip(t)===strip(a)&&t!==a){const i=[...t].findIndex((c,k)=>c!==[...a][k]);return ACC[[...t][i]]||'Regarde bien les accents : é (aigu), è (grave), ê (chapeau).';}
 for(const [re,tip] of RULES)if(covers(t,re,wrong))return tip(t)+method;
 return 'Regarde les lettres en rouge.'+method;
}
