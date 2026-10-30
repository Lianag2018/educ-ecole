// Original short readings; scaffold choices are not evidence of mastery.
const rows=[
 ['Le mouton','🐑','Un mouton marche dans la cour. Il trouve du foin. Il mange près du pont.','Que mange le mouton?',['Du foin','Du pain','Une pomme'],0,[['mouton','mou · ton']]],
 ['Le chapeau','👒','Tu poses ton chapeau sur le banc. Un chat passe près de toi. Il se cache sous le banc.','Où se cache le chat?',['Sur le banc','Sous le banc','Dans le sac'],1,[['chapeau','cha · peau']]],
 ['Le cochon','🐷','Le cochon joue dans la boue. Il voit un ballon. Il pousse le ballon avec son nez.','Avec quoi pousse-t-il le ballon?',['Sa patte','Sa queue','Son nez'],2,[['cochon','co · chon'],['ballon','bal · lon']]],
 ['La soupe','🥣','Papa prépare de la soupe. Tu poses un bol sur la table. On mange ensemble.','Que poses-tu sur la table?',['Un bol','Un livre','Un chapeau'],0,[['papa','pa · pa']]],
 ['Le parasol','🏖️','Le soleil brille sur la plage. On ouvre un parasol. Le chat se couche à son ombre.','Pourquoi le chat se place-t-il sous le parasol?',['Pour se baigner','Pour être à l’ombre','Pour manger'],1,[['parasol','pa · ra · sol']]],
 ['Le domino','🎲','Tu joues avec un ami. Un domino tombe sous la table. Ton ami le ramasse. Puis le jeu continue.','Que fait ton ami avant de continuer?',['Il ferme la boîte','Il part dehors','Il ramasse le domino'],2,[['domino','do · mi · no']]]
];
export const earlyReaderStories=rows.map(([title,art,text,prompt,choices,answer,wordHelp],i)=>({id:`early-reader-${i+1}`,skill:'comprehension',level:i<4?1:2,grade:1,learningMode:'reading',earlyReader:true,travelSubject:'Lecture',title,art,text,prompt,choices,answer,wordHelp,explanation:`Relis l’histoire. La réponse est : ${choices[answer].toLowerCase()}.`}));
const blends=[['mou + ton','mouton','bouton','moulin'],['co + chon','cochon','coton','coquet'],['cha + peau','chapeau','château','chameau'],['pa + ra + sol','parasol','parfum','parade'],['do + mi + no','domino','dominer','dormir'],['cho + co + lat','chocolat','choc','chou']];
export const readerBlends=blends.map(([text,correct,...others],i)=>{const choices=[correct,...others];for(let j=0;j<i%3;j++)choices.push(choices.shift());return {id:`reader-blend-${i+1}`,skill:'syllabes',level:i<3?1:2,readerBlend:true,order:100+i,text,prompt:'Assemble le mot.',choices,answer:choices.indexOf(correct),explanation:`Tu obtiens le mot « ${correct} ».`};});
