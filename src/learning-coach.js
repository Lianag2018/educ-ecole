// Original optional prompts, informed by the official references linked in the
// parent panel. Pure markup: no answers, assessment, storage or audio side effects.
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const formatNumber = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const count = (value, singular, plural = `${singular}s`) => `${value} ${value > 1 ? plural : singular}`;
const validNumber = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1999;

function numberChallenge(value, places) {
  const [thousands, hundreds, tens, units] = places;
  if (value === 0) return 'Pose une petite boîte vide. Elle contient 0 objet. Montre cette collection vide, puis écris 0 pour dire combien il y en a.';
  if (value < 10) return `Prends ${count(value, 'petit objet', 'petits objets')}. Touche chaque objet une seule fois en comptant. Le dernier nombre dit combien il y en a. Si tu veux, change leur disposition et vérifie que la quantité reste la même.`;
  if (value < 100) return `Fais ${count(tens, 'groupe')} de 10 objets${units ? `, puis ajoute ${count(units, 'objet')} tout seul${units > 1 ? 's' : ''}` : ' : il ne reste aucun objet seul'}. Compte de dix en dix, puis compte les unités qui restent.`;
  const drawing = `${count(hundreds, 'carré')}, ${count(tens, 'barre')} et ${count(units, 'point')}`;
  const legend = 'Un carré représente 100, une barre représente 10 et un point représente 1.';
  return value < 1000
    ? `${legend} Dessine ${drawing}. Montre comment ton dessin correspond au tableau des positions.`
    : `${legend} Un cadre marqué 1 000 représente 10 carrés de 100. Dessine ${count(thousands, 'cadre')} de 1 000, puis ${drawing} à l’extérieur. Montre comment ton dessin correspond au tableau des positions.`;
}

export function numberCoachMarkup(value) {
  if (!validNumber(value)) return '';
  const places = [Math.floor(value / 1000), Math.floor(value / 100) % 10, Math.floor(value / 10) % 10, value % 10];
  const firstPlace = value < 100 ? 2 : value < 1000 ? 1 : 0;
  const labels = ['Milliers', 'Centaines', 'Dizaines', 'Unités'].slice(firstPlace);
  const visiblePlaces = places.slice(firstPlace);
  const expanded = places.map((digit, index) => digit * [1000, 100, 10, 1][index]).slice(firstPlace);
  const other = value === 0 ? 1 : value - 1;
  const regroupings = [
    ...(value >= 10 ? ['10 unités = 1 dizaine.'] : []),
    ...(value >= 100 ? ['10 dizaines = 1 centaine.'] : []),
    ...(value >= 1000 ? ['10 centaines = 1 millier.'] : [])
  ];
  return `<details class="learning-coach learning-coach-number">
    <summary>Comprendre ce nombre avec l’adulte</summary>
    <div class="lc-content">
      <p>Choisissez un petit défi pour <strong>${formatNumber(value)}</strong>. Commencez avec des objets ou un dessin, à votre rythme.</p>
      <table class="lc-place-table"><caption>Les positions dans l’écriture de ${formatNumber(value)}</caption>
        <thead><tr>${labels.map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead>
        <tbody><tr>${visiblePlaces.map(digit => `<td>${digit}</td>`).join('')}</tr></tbody>
      </table>
      <p class="lc-decomposition">${formatNumber(value)} = ${expanded.map(formatNumber).join(' + ')}</p>
      <p class="lc-zero-note">Le 0 garde la place quand il n’y a pas de groupe à cette position dans l’écriture du nombre.</p>
      ${regroupings.length ? `<p class="lc-regroupings">${regroupings.join('<br>')}</p>` : ''}
      <h4>Un petit défi concret</h4><p class="lc-challenge">${numberChallenge(value, places)}</p>
      <h4>Une question au choix</h4>
      <ul class="lc-prompts">
        <li><strong>Reformuler :</strong> comment expliquerais-tu ce nombre avec tes mots?</li>
        <li><strong>Montrer :</strong> peux-tu représenter la même quantité autrement?</li>
        <li><strong>Écrire :</strong> écris le nombre, puis vérifie ses chiffres avec tes objets ou ton dessin.</li>
        <li><strong>Comparer :</strong> regarde ${formatNumber(value)} et ${formatNumber(other)}. Quel nombre est le plus grand? Montre comment tu le sais.</li>
      </ul>
      <p class="lc-soft-note">Vous pouvez vous arrêter après ce petit essai et reprendre avec un autre nombre plus tard.</p>
    </div>
  </details>`;
}

export function wordCoachMarkup(targetText) {
  if (typeof targetText !== 'string' || !targetText.trim() || targetText.length > 80) return '';
  const word = escape(targetText.trim());
  return `<details class="learning-coach learning-coach-word">
    <summary>Donner du sens au mot</summary>
    <div class="lc-content">
      <p>Avec <strong>« ${word} »</strong>, choisissez une petite activité.</p>
      <ul class="lc-prompts">
        <li><strong>Relire :</strong> lis le mot doucement. Si tu en as besoin, écoute un modèle avec l’adulte, puis redis le mot entier.</li>
        <li><strong>Expliquer :</strong> que veut dire ce mot? Tu peux l’expliquer avec tes mots, un geste, un objet ou un dessin.</li>
        <li><strong>Mettre en contexte :</strong> invente une petite phrase avec ce mot. L’adulte peut proposer un exemple si tu hésites.</li>
        <li><strong>Reprendre plus tard :</strong> retrouve le mot dans une autre phrase, puis essaie de le relire sans modèle.</li>
      </ul>
      <p class="lc-soft-note">Écouter un modèle aide à apprendre. L’adulte peut noter cette aide et proposer un autre essai un autre jour.</p>
    </div>
  </details>`;
}

export function parentCoachingPanel(profile = {}) {
  const stage = typeof profile?.schoolContext?.stage === 'string' && profile.schoolContext.stage.trim() ? profile.schoolContext.stage.trim().slice(0, 60) : 'non précisé';
  const focus = typeof profile?.schoolContext?.focus === 'string' ? profile.schoolContext.focus.trim().slice(0, 160) : '';
  return `<section class="panel learning-coach-parent">
    <h2>Accompagner un petit essai</h2>
    <p><strong>Année scolaire choisie :</strong> ${escape(stage)}. Vous pouvez la modifier dans « Son petit profil ».</p>
    ${focus ? `<p><strong>Objectif choisi avec l’école :</strong> ${escape(focus)}</p>` : ''}
    <details class="learning-coach"><summary>Un objectif court, un petit pas à la fois</summary>
      <div class="lc-content"><ol class="lc-prompts">
        <li><strong>Choisir :</strong> gardez un seul objectif court, par exemple expliquer un mot ou montrer des dizaines. Suivez l’objectif convenu avec l’école.</li>
        <li><strong>Montrer si besoin :</strong> donnez un modèle et dites simplement ce que vous faites.</li>
        <li><strong>Essayer ensemble :</strong> laissez l’enfant manipuler, relire ou expliquer. Donnez une petite aide à la fois.</li>
        <li><strong>Réessayer seule :</strong> quand l’enfant est à l’aise, proposez un autre exemple sans modèle. Reprenez un autre jour.</li>
        <li><strong>Observer :</strong> si vous donnez un modèle ou une aide pendant cet essai, notez-le comme un essai aidé. Notez aussi ce qui est encore à reprendre. Arrêtez si la fatigue ou le découragement apparaît.</li>
      </ol><p class="lc-soft-note">Ces échanges ne valident aucune activité et ne changent pas les progrès automatiquement.</p></div>
    </details>
    <details class="learning-coach lc-references"><summary>Références pour l’adulte</summary>
      <div class="lc-content">
        <p>Ces propositions originales reprennent des notions de représentation, de décomposition, de comparaison et de compréhension des mots. Elles ne couvrent pas le programme complet et ne constituent ni un diagnostic ni une évaluation orthopédagogique.</p>
        <ul class="lc-prompts">
          <li><a href="https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/programme-formation-ecole-quebecoise/primaire/mathematique" target="_blank" rel="noopener noreferrer">Ministère de l’Éducation · Mathématique au primaire</a></li>
          <li><a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/primaire/progressions-apprentissages/PFEQ-progression-apprentissages-mathematique-primaire.pdf#page=5" target="_blank" rel="noopener noreferrer">Progression en mathématique · Sens et écriture des nombres, pages 5–6 du PDF</a></li>
          <li><a href="https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/programme-formation-ecole-quebecoise/primaire/francais-langue-enseignement" target="_blank" rel="noopener noreferrer">Ministère de l’Éducation · Français, langue d’enseignement, au primaire</a></li>
          <li><a href="https://www.ladoq.ca/fr/orthopedagogue" target="_blank" rel="noopener noreferrer">L’ADOQ · Le rôle de l’orthopédagogue</a></li>
        </ul>
        <p>Les références décrivent les apprentissages scolaires et le rôle des professionnels. Elles ne certifient pas les activités de cet atelier. Pour préciser les besoins, échangez avec l’enseignante ou l’orthopédagogue qui accompagne l’enfant.</p>
      </div>
    </details>
  </section>`;
}
