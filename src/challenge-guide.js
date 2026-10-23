export const challengeStages=Object.freeze({
 syllabes:{young:['Écoute','Assemble','Choisis'],older:['Découpe','Lis le mot','Explique']},
 sons:{young:['Écoute','Repère','Choisis'],older:['Écoute','Compare','Justifie']},
 mots:{young:['Écoute','Cherche','Choisis'],older:['Lis','Comprends','Choisis']},
 comprehension:{young:['Écoute','Cherche l’indice','Réponds'],older:['Lis','Trouve les indices','Justifie']},
 maths:{young:['Observe','Manipule','Réponds'],older:['Comprends','Calcule','Vérifie']},
 social:{young:['Observe','Découvre','Réponds'],older:['Observe','Compare','Explique']}
});
export function stagesFor(q,grade,subject=''){
 const key=subject==='Maths'||subject==='Mathématiques'?'maths':subject==='Univers social'?'social':q?.skill;
 return (challengeStages[key]||challengeStages.mots)[grade>=3?'older':'young'];
}
export function challengeStepMarkup(q,grade,subject,answered=false){
 return '<div class="challenge-steps" aria-label="Les trois étapes du défi">'+stagesFor(q,grade,subject).map((step,i)=>'<span class="challenge-step'+(answered&&i===2?' challenge-step-done':'')+'">'+(i+1)+'. '+step+'</span>').join('')+'</div>';
}
