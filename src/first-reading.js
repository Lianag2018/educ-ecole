// Original teaching activities. Sequence informed by Alloprof's explicit
// letter/sound/blending approach; not copied from commercial workbooks.
const sounds=[
 ['a','a','ami','avion','lune','Ouvre bien la bouche. Écoute le début du mot ami.'],
 ['i','i','ici','image','moto','Étire doucement les lèvres. Écoute le début du mot ici.'],
 ['o','o','eau','vélo','lune','Arrondis les lèvres. Écoute le son à la fin de vélo.'],
 ['u','u','une','lune','roue','Arrondis les lèvres. Écoute : une, lune. Le son de lune est différent de celui de roue.'],
 ['eacute','é','été','bébé','chat','Écoute : été, bébé. On entend le même son à la fin.'],
 ['egrave','è','aile','sel','vélo','Écoute : aile, sel. Cherche le son que ces mots ont en commun.'],
 ['m','m','maman','moto','vélo','Ferme les lèvres et fais vibrer ta voix. Écoute le début de maman.'],
 ['l','l','lune','lit','sac','Place la pointe de la langue derrière les dents du haut. Écoute le début de lune.'],
 ['s','s','sac','soleil','moto','Écoute le début de sac. Tu peux prolonger ce son doucement.'],
 ['f','f','four','fil','lit','Pose les dents du haut sur la lèvre du bas et souffle doucement. Écoute le début de four.'],
 ['ou','ou','loup','roue','lune','Écoute : loup, roue. Les lettres o et u travaillent ensemble pour représenter ce son.'],
 ['on','on','rond','ballon','bébé','Écoute : rond, ballon. À la fin, le son résonne aussi dans le nez. Ne prononce pas la lettre n séparément.'],
 ['ch','ch','chou','chat','sac','Écoute le début de chou. Les lettres c et h représentent ensemble ce son. Souffle doucement.'],
 ['in','in','sapin','lapin','ballon','Écoute : sapin, lapin. À la fin, le son résonne aussi dans le nez. Ne prononce pas la lettre n séparément.']
];
export const firstSounds=sounds.map(([id,letters,model,yes,no,tip],index)=>({
 id:'first-sound-'+id,skill:'sons',level:index<10?1:2,order:index,
 title:index<6?'Je découvre les voyelles':'Je découvre les sons',text:letters,
 soundTarget:letters,model,
 spokenText:tip,
 lesson:`${tip} Tu peux répéter après moi.`,
 oralPrompt:`Écoute chaque choix. Cherche le son que nous venons de travailler dans le mot ${model}.`,
 prompt:`Cherche le son « ${letters} » dans un autre mot.`,
 choices:index%2?[no,yes]:[yes,no],answer:index%2?1:0,
 explanation:`Écoute : ${model}, ${yes}. On entend le son travaillé dans ces deux mots.`
}));
const blends=[
 ['la','la','la'],['li','li','lit'],['lu','lu','lune'],['ma','ma','maman'],['mi','mi','midi'],['mu','mu','mur'],['mou','mou','mouton'],['lou','lou','loup']
];
export const firstBlends=blends.map(([id,syllable,model],index)=>({
 id:'first-blend-'+id,skill:'syllabes',level:1,order:index,
 title:'Je colle les sons',text:syllable[0]+' + '+syllable.slice(1),
 lesson:`Écoute le début du mot ${model}. Les lettres affichées se lisent ensemble.`,
 prompt:'Écoute, puis retrouve la syllabe.',spokenText:`${syllable}.`,
 choices:index%2?['fa',syllable]:[syllable,'ri'],answer:index%2?1:0,
 explanation:`Les lettres se lisent ensemble : ${syllable}, comme au début de ${model}.`
}));
const words=[['midi','mi + di','midi','moto'],['moto','mo + to','moto','midi'],['salami','sa + la + mi','salami','maman'],['domino','do + mi + no','domino','vélo'],['lavabo','la + va + bo','lavabo','domino'],['tomate','to + mate','tomate','salami']];
export const firstWords=words.map(([id,text,yes,no],i)=>({id:'first-word-'+id,skill:'syllabes',level:2,order:10+i,title:'Je colle les syllabes',text,lesson:'Chaque carte montre un petit morceau du mot. Écoute les morceaux, puis essaie de les réunir.',prompt:'Quel mot peux-tu former?',choices:[yes,no],answer:0,explanation:`${text.replaceAll(' + ', ', ')} : ${yes}. Tu as réuni les syllabes.`}));
