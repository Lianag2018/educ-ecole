// Original interface; recorded phonemes credited in icons/phonemes/sources.json.
const vowelBase='https://www.phonetique.ulaval.ca/identification-des-sons-du-francais/voyelles/';
const consonantBase='https://www.phonetique.ulaval.ca/identification-des-sons-du-francais/les-consonnes/';
const rows=[
 ['a','a','a','avion','✈️','la','la','open'],['i','i','i','île','🏝️','mi','pie','smile'],
 ['u','u','y','lune','🌙','lu','rue','round'],['ou','ou','u','loup','🐺','lou','boue','round'],
 ['f','f','f','fée','🧚','fa','afin','teeth'],['v','v','v','vélo','🚲','va','avant','teeth'],
 ['m','m','m','mouton','🐑','ma','ami','closed'],['l','l','l','lapin','🐰','la','ilot','open'],
 ['s','s','s','soleil','☀️','sa','hi','smile'],['ch','ch','ʃ','chat','🐱','cha','echu','round'],
 ['on','on','ɔ̃','ballon','🎈','mon','long','round'],['in','in','ɛ̃','sapin','🌲','pin','pain','open'],
 ['eacute','é','e','étoile','⭐','mé','the','smile'],['egrave','è','ɛ','chèvre','🐐','mè','fait','open'],
 ['o','o','o','bateau','⛵','mo','sceau','round'],['oopen','o','ɔ','pomme','🍎','po','bosse','open'],
 ['eu','eu','ø','feu','🔥','peu','peu','round'],['oe','œu','œ','œuf','🥚','meu','boeuf','open'],
 ['e','e','ə','cheval','🐴','le','de','round'],['a-back','â','ɑ','pâtes','🍝','pâ','pate','open'],
 ['an','an','ɑ̃','éléphant','🐘','man','quand','open'],['un','un','œ̃','un','1️⃣','un','un','open'],
 ['p','p','p','papillon','🦋','pa','epis','closed'],['b','b','b','bateau','⛵','ba','a','closed'],
 ['t','t','t','tortue','🐢','ta','attends','smile'],['d','d','d','dauphin','🐬','da','aider','smile'],
 ['k','c · k · qu','k','canard','🦆','ca','echo','open'],['g','g','ɡ','gâteau','🍰','ga','egout','open'],
 ['n','n','n','nuage','☁️','na','uni','open'],['gn','gn','ɲ','montagne','🏔️','gne','oi','smile'],
 ['z','z','z','zèbre','🦓','za','use','smile'],['j','j','ʒ','girafe','🦒','ja','ajout','round'],
 ['r','r','ʁ','renard','🦊','ra','haras','open'],['y','ill · y','j','abeille','🐝','ya','oeillet','smile'],
 ['w','ou','w','oui','👍','oui','oui','round'],['ui','ui','ɥ','nuit','🌌','nuit','puits','round']
];
const vowels=new Set(['a','i','u','ou','on','in','eacute','egrave','o','oopen','eu','oe','e','a-back','an','un']);
export const gardenSounds=Object.freeze(rows.map(([id,label,ipa,word,emoji,syllable,slug,mouth])=>Object.freeze({id,label,ipa,word,emoji,syllable,mouth,
 reference:vowels.has(id)?vowelBase+'comme-dans-'+slug+'/':consonantBase+'comme-la-consonne-dans-'+slug+'/',
 instruction:id==='f'?'Pose doucement tes dents du haut sur ta lèvre du bas. Souffle doucement. Ta voix ne vibre pas.':id==='v'?'Pose doucement tes dents du haut sur ta lèvre du bas. Fais vibrer ta voix. Tu peux poser une main sur ta gorge.':id==='u'?'Arrondis tes lèvres. Avec ton adulte, écoute le son de lune. Il est différent de celui de loup.':id==='ou'?'Arrondis tes lèvres. Avec ton adulte, écoute le son de loup. Il est différent de celui de lune.':`Écoute le son, puis répète-le. Regarde la bouche de ton adulte, puis essaie à ton tour. Le mot illustré est ${word}.`
})));
export const gardenWelcome='Bienvenue dans le jardin des sons! Touche un dessin pour découvrir son son. Touche le bouton Écouter pour entendre le son. Ensuite, essaie à ton tour. Chaque essai fait pousser une fleur!';
export const gardenEncouragement='Une fleur pour ton effort! Tu as essayé. Tu peux recommencer autant de fois que tu veux.';
export function gardenSelection(id){return gardenSounds.find(c=>c.id===id)||gardenSounds[0];}
export function gardenPractice(previous,id){return gardenSounds.some(c=>c.id===id)?[...new Set([...(Array.isArray(previous)?previous:[]),id])].filter(x=>gardenSounds.some(c=>c.id===x)):previous;}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function owl(){return '<img class="garden-owl" src="/icons/plume-owl-v1.png" alt="Plume, ton hibou compagnon" decoding="async">';}
export function soundGardenMarkup({id='a',more=false,practiced=[],celebrate=false}={}){
 const c=gardenSelection(id),visible=more?gardenSounds:gardenSounds.slice(0,12),seen=Array.isArray(practiced)?practiced:[];
 return `<section class="sound-garden ${celebrate?'garden-celebrate':''}"><div class="sg-cloud sg-cloud-one" aria-hidden="true"></div><div class="sg-cloud sg-cloud-two" aria-hidden="true"></div><div class="sg-top"><button data-action="home">‹ Mon monde</button><span>✦ UNE AVENTURE AVEC PLUME</span><button data-garden-welcome aria-label="Écouter comment jouer">🔊 Comment jouer</button></div><div class="sg-title"><span>🌼</span><div><h1>Le jardin des sons</h1><p>Une petite découverte. Une grande fierté.</p></div></div><div class="sg-layout"><aside class="sg-companion">${owl()}<div class="sg-bubble">${celebrate?'Une fleur pour ton effort! 🌸':'Coucou! On essaie ensemble?'}</div><div class="sg-flowers" aria-label="${seen.length} sons essayés">${Array.from({length:Math.min(seen.length,8)},()=>'<span>🌷</span>').join('')||'<span class="sg-seed">🌱</span>'}</div></aside><article class="sg-card" aria-label="Son ${esc(c.label)}, comme dans ${esc(c.word)}"><div class="sg-step">REGARDE LE DESSIN</div><div class="sg-picture" aria-hidden="true">${c.emoji}<i>✦</i><i>✧</i></div><div class="sg-letter">${esc(c.label)}</div><p class="sg-word">comme dans <strong>${esc(c.word)}</strong></p><div class="sg-controls"><button class="sg-listen" data-garden-listen aria-busy="false">▶ Écouter le son</button><p class="sg-audio-status" data-phoneme-status role="status" aria-live="polite"></p><button class="sg-explain" data-garden-explain>🔊 Explique-moi</button><button class="sg-try" data-garden-practice>🌸 J’ai essayé!</button></div><p class="sg-feedback" role="status">${celebrate?'Bravo pour ton effort! Tu peux réessayer.':'Écoute le son, puis essaie à ton tour.'}</p><button class="sg-next" data-garden-next>Un autre son →</button></article><nav class="sg-picker" aria-label="Choisir un son"><h2>${more?'Toutes mes découvertes':'Mes premiers sons'}</h2><div class="sg-grid">${visible.map(s=>`<button data-garden-sound="${s.id}" aria-pressed="${s.id===c.id}" aria-label="${esc(s.label)}, comme dans ${esc(s.word)}"><span aria-hidden="true">${s.emoji}</span><strong>${esc(s.label)}</strong>${seen.includes(s.id)?'<i aria-label="Déjà essayé">✿</i>':''}</button>`).join('')}</div><button class="sg-more" data-garden-more>${more?'🌱 Mes 12 premiers sons':'🌈 Découvrir les 36 sons'}</button></nav></div><div class="sg-footer"><button data-garden-exercises>🦋 Jouer à reconnaître les sons</button><button data-action="silence">■ Arrêter la voix</button><details><summary>Pour l’adulte · modèles et progression</summary><p>Les sons enregistrés proviennent du Laboratoire de phonétique de l’Université Laval et sont importés pour l’usage familial demandé. Aucune licence ouverte ni validation acoustique individuelle n’est affirmée. La voix synthétique explique les activités; elle ne remplace pas un modèle de son isolé. Plume encourage l’enfant; son animation ne représente pas l’articulation humaine.</p><p>Une fleur signifie « j’ai essayé », pas « ma prononciation est correcte ». Les essais restent sur cet appareil et séparés par profil. Aucun microphone n’est activé.</p><a href="${c.reference}" target="_blank" rel="noopener noreferrer">Fiche du son actuel · Université Laval</a> · <a href="${vowelBase}" target="_blank" rel="noopener noreferrer">Voyelles · Université Laval</a> · <a href="${consonantBase}" target="_blank" rel="noopener noreferrer">Consonnes · Université Laval</a></details></div></section>`;
}
