// A guide to the official login page; the application never asks for school passwords.
export const SCHOOL_HELP=Object.freeze({
 nougat:{title:'1·2·3 avec Nougat',url:'https://www.iplusinteractif.com/primaire/login?lang=fr_CA',fields:['Code du groupe','Nom d’utilisateur','Mot de passe']},
 cec:{title:'MaZone CEC',url:'https://app.mazonecec.com/login?return_url=https%3A%2F%2Fmazonecec.com%2Fapplication',fields:['Nom d’utilisateur','Mot de passe']}
});
export function showSchoolHelp(kind,{gate=()=>false,doc=globalThis.document}={}){
 const info=SCHOOL_HELP[kind];if(!info||!gate()||!doc)return false;
 const dialog=doc.createElement('dialog');dialog.className='school-help-dialog';
 const title=doc.createElement('h2');title.textContent='🔐 '+info.title;
 const explanation=doc.createElement('p');explanation.textContent='Prépare la fiche d’accès de l’école. Sur le site officiel, remplis ces champs dans cet ordre :';
 const list=doc.createElement('ol');
 for(const label of info.fields){const li=doc.createElement('li');li.textContent=label;list.append(li);}
 const note=doc.createElement('p');note.textContent='Aucun code scolaire ni mot de passe n’est affiché, demandé ou enregistré dans l’Atelier. Pour éviter de les retaper, utilise le gestionnaire de mots de passe sur le site officiel.';
 const actions=doc.createElement('div');actions.className='school-help-actions';
 const link=doc.createElement('a');link.href=info.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Ouvrir la connexion officielle ↗';
 const close=doc.createElement('button');close.type='button';close.textContent='Fermer';close.addEventListener('click',()=>dialog.close());
 actions.append(link,close);dialog.append(title,explanation,list,note,actions);
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});
 doc.body.append(dialog);dialog.showModal();return true;
}
