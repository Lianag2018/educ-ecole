export const schoolWeek={id:'2026-10-19',title:'Ma semaine · 19 au 23 octobre',tasks:[
 'Lire 4 fois pendant 15 minutes. Défi de lecture à remettre le 29 octobre.',
 'Orthographe : bloc 1, semaine 5, page 7, 21 mots. Étudier au moins 2 fois. Liste des mots à ajouter.',
 'Feuille rose 1 000 à 9 999 : lignes G, H et I. Feuille exacte à ajouter. Ici, on s’entraîne progressivement de 0 à 1 999.',
 'Tables d’addition et de soustraction de 1 à 6. Cahier jaune, pages 4 à 17 selon la progression. Test le jeudi 22 octobre.',
 'Axel : page 8, activité du bas. Page à ajouter.',
 'Ma zone CEC : exercice 5, le plan cartésien; exercice 6, révision de la section 2.',
 'Faire signer le test de math dans le cahier de calcul vitesse.'
]};
// Original generated practice of the assigned facts; no scans or answer sheet copied.
export function tablePractice(table,operation){
 if(!Number.isInteger(table)||table<1||table>6||!['+','−'].includes(operation))throw new RangeError('Table de 1 à 6 attendue');
 return Array.from({length:12},(_,i)=>{
 const other=i+1,addition=operation==='+',result=addition?table+other:other;
 const text=addition?`${table} + ${other}`:`${other+table} − ${table}`;
 const answer=i%3,choices=[result+1,result+2,result+3].map(String);choices[answer]=String(result);
 return {id:`week-20261019-${addition?'add':'sub'}-${table}-${other}`,skill:'mots',level:1,prompt:'Trouve la réponse. Prends ton temps.',text,choices,answer,explanation:addition?`Pars de ${other}, puis ajoute ${table}. Tu arrives à ${result}.`:`Retire ${table} de ${other+table}. Il reste ${result}. Pour vérifier : ${result} + ${table} = ${other+table}.`};
 });
}
