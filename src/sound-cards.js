// Original diagrams; no third-party film/audio is copied or synthesized here.
export const soundCards = Object.freeze({
 f: { letter:'f', held:'fffff', syllable:'fa', word:'four', voiced:false,
  instruction:'Pose doucement tes dents du haut sur ta lèvre du bas. Souffle longtemps, sans faire vibrer ta voix. Puis essaie avec un adulte.',
  reference:'https://enseignants.lumni.fr/fiche-media/00000005139/decouvrir-le-son-f-et-ses-graphies.html' },
 v: { letter:'v', held:'vvvvv', syllable:'va', word:'vélo', voiced:true,
  instruction:'Pose doucement tes dents du haut sur ta lèvre du bas. Fais passer l’air et fais vibrer ta voix. Pose une main sur ta gorge pour sentir la vibration. Puis essaie avec un adulte.',
  reference:'https://www.lumni.fr/video/decouvrir-le-son-v-et-sa-graphie' }
});
// Deliberately empty until each exact file is listened to and reviewed.
// Never send held-letter strings to TTS as a pronunciation model.
export const reviewedSounds = Object.freeze({});
export function soundCardMarkup(key='f') {
 const c=soundCards[key]||soundCards.f;
 return `<section class="sound-lab" aria-label="Comment produire le son ${c.letter}"><div class="sound-tabs"><button data-sound-card="f" aria-pressed="${c.letter==='f'}">🌬 f</button><button data-sound-card="v" aria-pressed="${c.letter==='v'}">〰 v</button><strong>Regarde · écoute · essaie</strong></div><div class="sound-demo ${c.voiced?'voiced':''}"><svg viewBox="0 0 240 130" role="img" aria-label="Dents du haut posées doucement sur la lèvre du bas; ${c.voiced?'avec vibration de la voix':'souffle sans vibration de la voix'}"><ellipse cx="85" cy="65" rx="65" ry="50" fill="#ffd4bb"/><path d="M40 60 Q85 35 130 60 Q85 105 40 60" fill="#82364b"/><path d="M55 54 H115 V70 Q85 80 55 70 Z" fill="white"/><path d="M48 80 Q85 60 122 80" fill="none" stroke="#e87983" stroke-width="12"/><g class="sound-air" fill="none" stroke="#258aab" stroke-width="5" stroke-linecap="round"><path d="M155 48 h45"/><path d="M155 68 h60"/><path d="M155 88 h45"/></g>${c.voiced?'<path class="sound-vibration" d="M60 112 l10 -8 10 8 10 -8 10 8" fill="none" stroke="#7957c5" stroke-width="5"/>':''}</svg><div><strong class="held-sound">${c.held}</strong><p>${c.voiced?'〰 Ma voix vibre':'🌬 Je souffle'}</p><span>${c.letter} + a → ${c.syllable}</span></div></div><button data-sound-instruction="${c.letter}">🔊 Montre-moi comment faire</button><p>${c.instruction}</p><details><summary>Avec un adulte · modèle sonore</summary><p>Le son isolé attend un enregistrement vérifié à l’écoute. La voix de lecture explique le geste; elle ne certifie pas le son. Le dessin est un repère simplifié, sans synchronisation avec la voix.</p><a href="${c.reference}" target="_blank" rel="noopener noreferrer" data-sound-reference>▶ Animation pédagogique ${c.letter} · Lumni / Canopé (nouvel onglet)</a><p>Ressource de France. Accès et lecture vidéo à vérifier avec l’adulte.</p></details></section>`;
}
