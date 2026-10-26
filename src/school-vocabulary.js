// Private list codes are supplied on the device, never bundled in this public app.
const VOCA='https://static.alloprof.qc.ca/exercices/exerciseur/voc/';
export function vocabularyCode(value){return typeof value==='string'&&/^[A-Za-z0-9]{5,12}$/.test(value)?value:'';}
export function vocabularyURL(profile){
 const code=profile?.id==='p2'?vocabularyCode(profile.schoolVocabulary?.code):'';
 return code?`${VOCA}#/game?senarioId=${code}&demo=1`:VOCA;
}
// The fragment is not sent to this app's HTTP server. The caller removes it
// from browser history after processing. A failed save must preserve old data.
export function activateVocabulary(state,hash,persist){
 if(typeof hash!=='string'||!hash.startsWith('#voca='))return null;
 const match=/^#voca=p2:([A-Za-z0-9]{5,12})$/.exec(hash);
 if(!match||!state?.profiles?.some(p=>p.id==='p2'))return 'invalid';
 const next={...state,active:'p2',profiles:state.profiles.map(p=>p.id==='p2'?{...p,schoolVocabulary:{code:match[1]}}:p)};
 try{if(!persist(next))return 'storage-unavailable';}catch{return 'storage-unavailable';}
 Object.assign(state,next);return 'ready';
}
export function schoolVocabularyLinks(profile){
 if(profile?.id!=='p2')return '';
 const ready=Boolean(vocabularyCode(profile.schoolVocabulary?.code));
 return `<section class="school-math-links school-vocabulary-links" aria-label="Mes mots de vocabulaire avec Alloprof">
 <h2>📚 Mes mots · Alloprof</h2>
 <div class="school-math-grid">
 <a data-school-resource href="${vocabularyURL(profile)}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">🔊 ✏️</span><strong>${ready?'Jouer avec mes mots':'Écouter et écrire mes mots'}</strong><small>${ready?'Ma liste est prête · Ouvrir ↗':'Voca · Jouer sans compte ↗'}</small></a>
 <a data-school-resource href="https://apps.apple.com/ca/app/voca/id6742566113" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">📱</span><strong>Voca sur iPhone ou iPad</strong><small>Ouvrir l’App Store ↗</small></a>
 </div>
 ${ready?'<details><summary>Mon accès est prêt</summary><p>Ta liste s’ouvre directement. Touche Commencer sur Alloprof pour jouer : aucun code à retaper.</p><p>Ce raccourci est enregistré sur cet appareil. L’installation de Voca depuis l’App Store ne transfère pas ce réglage.</p>':'<details><summary>Comment commencer?</summary><ol><li>Choisis <strong>Commencer</strong>, puis <strong>Continuer sans se connecter</strong>.</li><li>Dans <strong>Entrer un code</strong>, inscris le code de ta liste et touche ▶.</li><li>Choisis <strong>Commencer</strong>. Écoute le mot, écris-le, puis touche <strong>Valider</strong>.</li></ol><p>Sans code, tu peux choisir les listes <strong>Primaire 3</strong>.</p>'}<p>Le jeu s’ouvre dans un autre onglet. Les résultats restent sur Alloprof; ils ne s’ajoutent pas automatiquement à tes étoiles dans l’Atelier.</p></details>
 </section>`;
}
