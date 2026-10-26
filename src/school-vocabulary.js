// External practice only: opening Alloprof does not credit a completed activity.
// Teacher list codes stay on Alloprof and are never bundled into this public app.
export function schoolVocabularyLinks(profile){
 if(profile?.id!=='p2')return '';
 return `<section class="school-math-links school-vocabulary-links" aria-label="Mes mots de vocabulaire avec Alloprof">
 <h2>📚 Mes mots · Alloprof</h2>
 <div class="school-math-grid">
 <a data-school-resource href="https://static.alloprof.qc.ca/exercices/exerciseur/voc/" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🔊 ✏️</span><strong>Écouter et écrire mes mots</strong><small>Voca · Jouer sans compte ↗</small></a>
 <a data-school-resource href="https://apps.apple.com/ca/app/voca/id6742566113" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📱</span><strong>Voca sur iPhone ou iPad</strong><small>Ouvrir l’App Store ↗</small></a>
 </div>
 <details><summary>Comment commencer?</summary><ol><li>Choisis <strong>Commencer</strong>, puis <strong>Continuer sans se connecter</strong>.</li><li>Dans <strong>Entrer un code</strong>, inscris le code de ta liste et touche ▶.</li><li>Choisis <strong>Commencer</strong>. Écoute le mot, écris-le, puis touche <strong>Valider</strong>.</li></ol><p>Sans code, tu peux choisir les listes <strong>Primaire 3</strong>.</p><p>Le jeu s’ouvre dans un autre onglet. Les résultats restent sur Alloprof; ils ne s’ajoutent pas automatiquement à tes étoiles dans l’Atelier.</p></details>
 </section>`;
}
