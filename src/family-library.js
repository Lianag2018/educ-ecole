import {LIBRARY_ITEMS} from './family-library-data.js';
import {listLocalDocuments, getLocalDocument, importFamilyZip, clearFamilyLibrary} from './family-library-store.js';
import {pathsFor, pathProgress, setPathStart, recordPathStep} from './family-library-paths.js';
import {childName} from './worlds.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const fold = value => String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('fr-CA').trim();
const integer = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
const plural = (count, word, pluralWord = `${word}s`) => `${count} ${count === 1 ? word : pluralWord}`;
const profileName = profile => {
  const id = profile?.id, known = ['p1', 'p2'].includes(id);
  const name = profile?.name || (known ? `Lectrice ${id === 'p1' ? 1 : 2}` : 'la famille');
  return known ? childName({id, name}) : name;
};
const icons = {'Sons et syllabes':'🔤', Vocabulaire:'🗂️', Mathématiques:'🧩', Nombres:'🔢', Lecture:'📖', 'En famille':'🏡'};
const storage = {listLocalDocuments, getLocalDocument, importFamilyZip, clearFamilyLibrary};
const OPENED_URL_LIFETIME = 60000;

function officialURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['alloprof.qc.ca', 'www.alloprof.qc.ca', 'cms.alloprof.qc.ca'].includes(url.hostname) && !url.username && !url.password && !url.port ? url.href : '';
  } catch { return ''; }
}

function fileSize(bytes) {
  const value = integer(bytes);
  return value >= 1000000 ? `${new Intl.NumberFormat('fr-CA', {maximumFractionDigits:1}).format(value / 1000000)} Mo` : `${Math.max(1, Math.round(value / 1000))} Ko`;
}

function summary(items) {
  return `${plural(items.length, 'document')} · ${plural(items.reduce((sum, item) => sum + integer(item.pages), 0), 'page')}`;
}

function documentPages(pages, item) {
  return [...new Set((Array.isArray(pages) ? pages : []).filter(page => Number.isSafeInteger(page) && page > 0 && page <= integer(item.pages)))].sort((a, b) => a - b);
}

function pageLabel(pages) {
  if (!pages.length) return 'PDF complet';
  const ranges = [];
  for (let index = 0; index < pages.length; index++) {
    const first = pages[index];
    let last = first;
    while (pages[index + 1] === last + 1) last = pages[++index];
    ranges.push(last === first ? `${first}` : `${first}–${last}`);
  }
  return `${pages.length === 1 ? 'Page' : 'Pages'} ${ranges.join(', ')} du PDF`;
}

function guidanceMarkup(item) {
  const guidance = item.guidance;
  if (!guidance) return '';
  const childPages = documentPages(guidance.childPages, item), parentPages = documentPages(guidance.parentPages, item);
  const notes = Array.isArray(guidance.notes) ? guidance.notes.join(' ') : guidance.notes;
  const prerequisites = Array.isArray(guidance.prerequisites) ? guidance.prerequisites.join(' · ') : guidance.prerequisites;
  return `<div class="fl-document-guidance">${guidance.objective ? `<p>${escape(guidance.objective)}</p>` : ''}${childPages.length ? `<p class="fl-page-label">Avec toi : ${pageLabel(childPages)}</p>` : ''}${parentPages.length || notes || prerequisites ? `<details data-fl-expand="guidance-${escape(item.id)}"><summary>Pour le parent</summary>${parentPages.length ? `<p>${pageLabel(parentPages)}</p>` : ''}${prerequisites ? `<p>Avant de commencer : ${escape(prerequisites)}</p>` : ''}${notes ? `<p>${escape(notes)}</p>` : ''}</details>` : ''}</div>`;
}

export function libraryItemsFor(profile, {query = '', category = ''} = {}, items = LIBRARY_ITEMS) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  const id = ['p1', 'p2'].includes(profile?.id) ? profile.id : null;
  return items.filter(item => (item.profile === 'family' || (id && item.profile === id)) &&
    (!category || item.category === category) && words.every(word => fold(`${item.title} ${item.category}`).includes(word)))
    .map(item => id && item.guidanceByProfile?.[id] ? {...item, guidance:{...item.guidance, ...item.guidanceByProfile[id]}} : item);
}

function localControl(item, localIds, {key = `catalog-${item.id}`, page = 0} = {}) {
  return localIds.has(item.id) ? `<button type="button" class="fl-local-button" data-fl-prepare="${escape(item.id)}" data-fl-key="${escape(key)}" data-fl-page="${integer(page)}" aria-label="Préparer la copie sur cet appareil : ${escape(item.title)}">Préparer ma copie</button>` : '';
}

function documentCard(item, localIds) {
  const download = officialURL(item.downloadUrl), source = officialURL(item.sourceUrl);
  const parentOnly = Array.isArray(item.guidance?.childPages) && !item.guidance.childPages.length && documentPages(item.guidance.parentPages, item).length > 0;
  return `<article class="fl-document" data-library-document="${escape(item.id)}">
    <div class="fl-card-top"><span class="fl-document-icon" aria-hidden="true">${icons[item.category] || '📚'}</span><span class="fl-category">${escape(item.category)}</span>${item.profile === 'family' ? '<span class="fl-shared">En famille</span>' : ''}${parentOnly ? '<span class="fl-parent-only-badge">Pour le parent</span>' : ''}</div>
    <h3>${escape(item.title)}</h3>
    <p class="fl-document-meta">PDF · ${plural(integer(item.pages), 'page')} · ${fileSize(item.bytes)}</p>
    ${guidanceMarkup(item)}
    ${parentOnly ? `<details class="fl-parent-only" data-fl-expand="parent-copy-${escape(item.id)}"><summary>Ouvrir avec mon parent</summary>` : ''}<div class="fl-document-actions">${download ? `<a class="fl-open" href="${escape(download)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le PDF chez Alloprof, nouvel onglet : ${escape(item.title)}">Ouvrir le PDF <span aria-hidden="true">↗</span></a>` : '<span class="fl-link-unavailable">Lien à vérifier avec un parent</span>'}<span class="fl-local-control" data-fl-local="${escape(item.id)}" data-fl-local-key="${escape(`catalog-${item.id}`)}">${localControl(item, localIds)}</span></div>${parentOnly ? '</details>' : ''}
    <p class="fl-source">${source ? `<a href="${escape(source)}" target="_blank" rel="noopener noreferrer" aria-label="Voir la ressource Alloprof, nouvel onglet : ${escape(item.title)}">Source : Alloprof</a>` : 'Source : Alloprof'} · nouvel onglet</p>
  </article>`;
}

function guidedDocument(item, reference, key, localIds) {
  const pages = documentPages(reference.pages, item);
  const start = (Array.isArray(reference.pages) ? reference.pages.find(page => pages.includes(page)) : 0) || 0;
  const download = officialURL(item.downloadUrl), source = officialURL(item.sourceUrl);
  const href = download ? new URL(download) : null;
  if (href && start) href.hash = `page=${start}`;
  return `<article class="fl-guided-document" data-library-guided-document="${escape(item.id)}"><div><span class="fl-guide-doc-kind">${reference.role === 'material' ? 'Un support pour t’aider' : reference.role === 'parent' ? 'Pour le parent' : 'Ton support'}</span><h4>${escape(item.title)}</h4><p class="fl-page-label">${pageLabel(pages)}</p>${reference.note ? `<p>${escape(reference.note)}</p>` : ''}</div><div class="fl-document-actions">${href ? `<a class="fl-open" href="${escape(href.href)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le PDF chez Alloprof, ${escape(pageLabel(pages))}, nouvel onglet : ${escape(item.title)}">Ouvrir le PDF${start ? ` · p. ${start}` : ''} <span aria-hidden="true">↗</span></a>` : ''}<span class="fl-local-control" data-fl-local="${escape(item.id)}" data-fl-local-key="${escape(key)}">${localControl(item, localIds, {key, page:start})}</span>${source ? `<a class="fl-guided-source" href="${escape(source)}" target="_blank" rel="noopener noreferrer">Source : Alloprof ↗</a>` : ''}</div></article>`;
}

function preferredPath(profile, track) {
  const paths = pathsFor(profile);
  return paths.find(path => path.id === track)?.id || paths[0]?.id;
}

function guidedMarkup(profile, pathId, localIds = new Set(), message = '', items = LIBRARY_ITEMS) {
  const paths = pathsFor(profile), path = paths.find(candidate => candidate.id === pathId) || paths[0];
  if (!path) return '';
  const progress = pathProgress(profile, path.id), step = progress.step;
  const allowed = new Map(libraryItemsFor(profile, {}, items).map(item => [item.id, item]));
  const references = (step?.documents || []).map((reference, index) => ({reference, index, item:allowed.get(reference.id)})).filter(({reference, item}) => item && (reference.role === 'parent' || (!item.later && (!Array.isArray(item.guidance?.childPages) || item.guidance.childPages.length))));
  const activities = references.filter(({reference}) => reference.role !== 'parent');
  const parentDocuments = references.filter(({reference}) => reference.role === 'parent');
  const documentMarkup = ({reference, index, item}) => guidedDocument(item, reference, `guided-${path.id}-${step.id}-${index}`, localIds);
  const labels = {'again':'À reprendre', 'with-help':'Essayé avec de l’aide', ready:'Prêt pour la suite'};
  return `<div class="fl-guide-heading"><div><span class="fl-eyebrow">UNE PETITE ÉTAPE À LA FOIS</span><h2 id="fl-guide-title">Par où commencer?</h2></div><p>Choisis un parcours. Une petite activité suffit pour aujourd’hui.</p></div>
    <div class="fl-path-tabs" role="group" aria-label="Choisir un parcours">${paths.map(candidate => `<button type="button" data-fl-path="${escape(candidate.id)}" aria-pressed="${candidate.id === path.id}"><span aria-hidden="true">${escape(candidate.icon || '🌱')}</span>${escape(candidate.title)}</button>`).join('')}</div>
    <div class="fl-path-intro"><h3>${escape(path.title)}</h3><p>${escape(path.description)}</p><p class="fl-path-progress">${plural(progress.completedCount, 'étape marquée prête', 'étapes marquées prêtes')} avec un parent · ${plural(path.steps.length, 'étape')} dans le parcours</p></div>
    <p class="fl-guide-status" data-fl-guide-status role="status" aria-live="polite" aria-atomic="true">${escape(message)}</p>
    ${step ? `<article class="fl-current-step" data-fl-current-step="${escape(step.id)}"><span class="fl-step-number">ÉTAPE ${progress.index + 1} SUR ${path.steps.length}</span><h3 data-fl-step-heading tabindex="-1">${escape(step.title)}</h3><p class="fl-step-goal">${escape(step.goal)}</p><div class="fl-step-instruction"><h4>Une petite activité</h4><p>${escape(step.instruction)}</p></div>${activities.filter(({reference}) => reference.role === 'activity').length > 1 ? '<p class="fl-support-choice">Choisis un des supports proposés pour commencer. Tu n’as pas à faire toutes les fiches.</p>' : ''}<div class="fl-guided-documents">${activities.map(documentMarkup).join('')}</div>${parentDocuments.length ? `<details class="fl-parent-documents" data-fl-expand="parent-docs-${escape(path.id)}-${escape(step.id)}"><summary>Les repères pour mon parent</summary><div class="fl-guided-documents">${parentDocuments.map(documentMarkup).join('')}</div></details>` : ''}<div class="fl-ready-when"><h4>Avant d’avancer</h4><p>${escape(step.readyWhen)}</p></div>${step.practice ? `<button class="fl-practice" type="button" data-fl-practice="${escape(step.practice)}">M’exercer dans l’atelier <span aria-hidden="true">→</span></button>` : ''}<details class="fl-step-review" data-fl-expand="review-${escape(path.id)}-${escape(step.id)}" ${progress.statuses[step.id] ? 'open' : ''}><summary>Avec mon parent : comment ça s’est passé?</summary><p>Le parent choisit le repère qui convient. On peut reprendre l’activité autant de fois qu’on en a besoin.</p><div class="fl-review-buttons"><button type="button" data-fl-step-status="again" data-fl-step-id="${escape(step.id)}" aria-pressed="${progress.statuses[step.id] === 'again'}">À reprendre</button><button type="button" data-fl-step-status="with-help" data-fl-step-id="${escape(step.id)}" aria-pressed="${progress.statuses[step.id] === 'with-help'}">Fait avec de l’aide</button><button class="fl-ready-button" type="button" data-fl-step-status="ready" data-fl-step-id="${escape(step.id)}">Prêt pour la suite</button></div></details></article>` : '<div class="fl-path-finished"><span aria-hidden="true">🌟</span><h3 data-fl-step-heading tabindex="-1">Bravo pour les étapes explorées!</h3><p>Tu peux reprendre une étape avec ton parent ou choisir un autre parcours.</p></div>'}
    <details class="fl-path-outline" data-fl-expand="outline-${escape(path.id)}"><summary>Voir les ${path.steps.length} étapes du parcours</summary><ol>${path.steps.map((candidate, index) => `<li class="${candidate.id === step?.id ? 'fl-outline-current' : ''}"><span aria-hidden="true">${index + 1}</span><div><strong>${escape(candidate.title)}</strong><small>${escape(labels[progress.statuses[candidate.id]] || (candidate.id === step?.id ? 'Ton étape du moment' : index < progress.startIndex ? 'Avant le point de départ choisi' : 'À découvrir'))}</small></div></li>`).join('')}</ol></details>
    <details class="fl-start-settings" data-fl-expand="start-${escape(path.id)}"><summary>Avec mon parent : choisir le point de départ</summary><p>Choisissez une étape qui correspond à ce que tu sais déjà faire. Les repères des autres étapes sont conservés.</p><label for="fl-start-step">Commencer à<select id="fl-start-step" data-fl-start-step>${path.steps.map((candidate, index) => `<option value="${escape(candidate.id)}" ${index === progress.startIndex ? 'selected' : ''}>${index + 1}. ${escape(candidate.title)}</option>`).join('')}</select></label><button type="button" data-fl-start-apply>Choisir cette étape de départ</button></details>`;
}

function resultsMarkup(items, localIds = new Set(), laterOpen = false) {
  const now = items.filter(item => !item.later), later = items.filter(item => item.later);
  if (!items.length) return '<div class="fl-empty"><span aria-hidden="true">🔎</span><h2>Aucun document trouvé</h2><p>Essaie un autre mot ou choisis toutes les catégories.</p></div>';
  return `${now.length ? `<section class="fl-shelf" aria-labelledby="fl-now-title"><div class="fl-shelf-heading"><h2 id="fl-now-title">À explorer</h2><p>${summary(now)}</p></div><div class="fl-grid">${now.map(item => documentCard(item, localIds)).join('')}</div></section>` : ''}
    ${later.length ? `<details class="fl-later" data-fl-later ${laterOpen ? 'open' : ''}><summary><span><span aria-hidden="true">🌱</span> Pour plus tard</span><span>${plural(later.length, 'document')}</span></summary><p class="fl-later-note">À choisir avec un parent, quand tu seras prête. Ces documents ne font pas partie des défis de la semaine.</p><div class="fl-grid">${later.map(item => documentCard(item, localIds)).join('')}</div></details>` : ''}`;
}

export function familyLibraryScreen(profile, items = LIBRARY_ITEMS, options = {}) {
  const selected = libraryItemsFor(profile, {}, items);
  const categories = [...new Set(selected.map(item => item.category))].sort((a, b) => a.localeCompare(b, 'fr-CA'));
  return `<section id="family-library-view" class="family-library" aria-labelledby="fl-title">
    <div class="fl-top"><button type="button" data-action="home">‹ Mon monde</button><span class="fl-eyebrow">À MON RYTHME, AVEC MON PARENT</span></div>
    <div class="fl-heading"><span class="fl-heading-icon" aria-hidden="true">📚</span><div><h1 id="fl-title">Les fiches de ${escape(profileName(profile))}</h1><p>Un parcours pour lire, jouer et apprendre, une étape à la fois.</p></div></div>
    <p class="fl-overview">${summary(selected)} · des ressources Alloprof à choisir selon tes besoins</p>
    <section class="fl-guide" data-fl-guide aria-labelledby="fl-guide-title" ${pathsFor(profile).length ? '' : 'hidden'}>${guidedMarkup(profile, preferredPath(profile, options.track), new Set(), '', items)}</section>
    <p class="fl-local-status" data-fl-local-status role="status" aria-live="polite">Les PDF s’ouvrent chez Alloprof dans un nouvel onglet.</p>
    <details class="fl-catalog" data-fl-catalog><summary><span>Toutes mes fiches</span><span>${plural(selected.length, 'document')}</span></summary><div class="fl-catalog-content"><p>Tu peux aussi choisir une fiche avec ton parent. Les documents « Pour plus tard » restent à part.</p><div class="fl-filters"><label for="fl-search">Je cherche<input id="fl-search" data-fl-search type="search" placeholder="Un son, une histoire, les nombres…" autocomplete="off"></label><label for="fl-category">Catégorie<select id="fl-category" data-fl-category><option value="">Toutes les catégories</option>${categories.map(category => `<option value="${escape(category)}">${escape(category)}</option>`).join('')}</select></label></div>
    <p class="fl-result-count" data-fl-count role="status" aria-live="polite" aria-atomic="true">${summary(selected)}</p><div data-fl-results>${resultsMarkup(selected)}</div></div></details>
    <div class="fl-parent-help"><span aria-hidden="true">🏡</span><p>Ton parent peut aussi ajouter la trousse familiale pour garder les PDF sur cet appareil.</p><button type="button" data-action="parent">Espace parent</button></div>
  </section>`;
}

export function familyLibraryPanel(profiles = []) {
  const children = ['p1', 'p2'].map(id => profiles.find(profile => profile.id === id) || {id});
  return `<section id="family-library-import" class="panel family-library-import" aria-labelledby="fl-import-title">
    <div class="fl-import-heading"><span aria-hidden="true">📚</span><div><h2 id="fl-import-title">Bibliothèque familiale</h2><p>${LIBRARY_ITEMS.length} PDF à retrouver dans les bibliothèques des enfants.</p></div></div>
    <div class="fl-family-counts">${children.map(profile => `<span><strong>${escape(profileName(profile))}</strong>${plural(LIBRARY_ITEMS.filter(item => item.profile === profile.id).length, 'document')}</span>`).join('')}<span><strong>En famille</strong>${plural(LIBRARY_ITEMS.filter(item => item.profile === 'family').length, 'document')}</span></div>
    <p>Les liens Alloprof sont déjà disponibles. Pour les feuilles et pages photographiées, utilise « Ajouter des photos de devoirs » en haut de cet espace.</p><details class="fl-legacy-import"><summary>Ancienne trousse Alloprof · importer les copies PDF en ZIP</summary><p>Cette option sert uniquement à la trousse familiale de PDF déjà fournie.</p>
    <form data-fl-import-form><label for="fl-zip-file">Trousse familiale ZIP<input id="fl-zip-file" data-fl-file type="file" accept=".zip,application/zip,application/x-zip-compressed" aria-describedby="fl-device-note fl-selected-file"></label><p id="fl-selected-file" class="fl-file-caption" data-fl-selected>Aucune trousse choisie.</p><div class="fl-import-actions"><button class="fl-import-submit" type="submit" data-fl-import-button disabled>Ajouter les PDF sur cet appareil</button><button type="button" data-fl-cancel hidden>Annuler l’import</button></div></form>
    <progress data-fl-progress max="${LIBRARY_ITEMS.length}" value="0" aria-label="Import de la bibliothèque familiale" hidden></progress>
    <p class="fl-import-status" data-fl-import-status role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="fl-stored-count" data-fl-stored role="status" aria-live="polite">Recherche des PDF enregistrés sur cet appareil…</p>
    <p id="fl-device-note" class="fl-device-note">Les copies restent dans ce navigateur, sur cet appareil. Elles ne se synchronisent pas. Effacer les données du navigateur retire aussi ces copies.</p>
    <button type="button" class="fl-delete" data-fl-delete disabled>Retirer les PDF de cet appareil</button>
    <div class="fl-confirm" data-fl-confirm hidden role="group" aria-labelledby="fl-confirm-title"><h3 id="fl-confirm-title">Retirer toutes les copies de cet appareil?</h3><p>Vous pourrez ajouter la trousse de nouveau.</p><button type="button" data-fl-confirm-delete>Oui, retirer les PDF</button><button type="button" data-fl-keep>Garder les PDF</button></div></details>
  </section>`;
}

function mountRoot(root, id) {
  return root?.id === id ? root : root?.querySelector?.(`#${id}`);
}

function expandedDetails(root) {
  return new Set([...root.querySelectorAll('details[data-fl-expand][open]')].map(element => element.dataset.flExpand));
}

function restoreDetails(root, expanded) {
  for (const element of root.querySelectorAll('details[data-fl-expand]')) if (expanded.has(element.dataset.flExpand)) element.open = true;
}

function errorMessage(error) {
  return ({ZIP_INVALID:'Cette trousse ZIP ne peut pas être lue. Choisissez de nouveau le fichier de la trousse familiale.', ZIP_UNSUPPORTED:'Ce format de ZIP n’est pas pris en charge. Choisissez la trousse familiale fournie.', FILE_REQUIRED:'Choisissez la trousse familiale au format ZIP.', FILE_UNREADABLE:'Ce fichier ne peut pas être lu. Gardez la trousse sur l’appareil, puis réessayez.', ZIP_TOO_LARGE:'Cette trousse est trop volumineuse. Choisissez le fichier de la trousse familiale fourni.', ARCHIVE_MISMATCH:'Ce ZIP ne correspond pas à la trousse familiale. Choisissez le fichier fourni.', DUPLICATE_FILE:'Cette trousse contient un PDF en double. Choisissez le fichier de la trousse familiale fourni.', FILE_MISMATCH:'Un PDF ne correspond pas à la trousse attendue. Choisissez le fichier de la trousse familiale.', INCOMPLETE_ARCHIVE:'Il manque des PDF dans cette trousse. Choisissez la trousse familiale complète.', CATALOG_INVALID:'La liste des PDF n’est pas disponible. Rechargez la page avant de réessayer.', VERIFICATION_UNAVAILABLE:'Ce navigateur ne peut pas vérifier la trousse pour le moment. Réessayez dans un navigateur à jour.', ABORTED:'Import annulé. Les PDF déjà enregistrés sont conservés.', STORAGE_UNAVAILABLE:'Ce navigateur ne permet pas d’enregistrer les PDF. Les liens Alloprof restent disponibles.', STORAGE_FULL:'Il manque de place sur cet appareil pour ajouter la trousse.', STORAGE_BLOCKED:'Fermez les autres onglets de l’Atelier, puis réessayez.', LIBRARY_BUSY:'Une opération est déjà en cours. Attendez sa fin avant de réessayer.'})[error?.code] || 'Les PDF n’ont pas pu être enregistrés. Réessayez avec la trousse familiale.';
}

export function mountFamilyLibraryImport(root, profiles, services = {}) {
  const host = mountRoot(root, 'family-library-import');
  if (!host) return {destroy(){}};
  const api = {...storage, ...services};
  const form = host.querySelector('[data-fl-import-form]'), fileInput = host.querySelector('[data-fl-file]');
  const submit = host.querySelector('[data-fl-import-button]'), cancel = host.querySelector('[data-fl-cancel]');
  const progress = host.querySelector('[data-fl-progress]'), status = host.querySelector('[data-fl-import-status]');
  const selected = host.querySelector('[data-fl-selected]'), stored = host.querySelector('[data-fl-stored]');
  const remove = host.querySelector('[data-fl-delete]'), confirmation = host.querySelector('[data-fl-confirm]');
  const confirmRemove = host.querySelector('[data-fl-confirm-delete]'), keep = host.querySelector('[data-fl-keep]');
  let alive = true, busy = false, count = 0, readVersion = 0, controller = null;
  function controls() {
    fileInput.disabled = busy;
    submit.disabled = busy || !fileInput.files?.[0];
    cancel.hidden = !controller;
    cancel.disabled = !!controller?.signal.aborted;
    remove.disabled = busy || !count;
    confirmRemove.disabled = busy;
    keep.disabled = busy;
    form.setAttribute('aria-busy', String(busy));
  }
  async function refreshCount() {
    const ticket = ++readVersion;
    try {
      const documents = await api.listLocalDocuments();
      if (!alive || ticket !== readVersion) return;
      const known = new Set(LIBRARY_ITEMS.map(item => item.id));
      count = new Set(documents.filter(document => known.has(document.id)).map(document => document.id)).size;
      stored.textContent = `${plural(count, 'PDF enregistré')} sur cet appareil · ${LIBRARY_ITEMS.length} dans la trousse`;
    } catch {
      if (!alive || ticket !== readVersion) return;
      count = 0;
      stored.textContent = 'Les copies locales ne sont pas accessibles pour le moment. Les liens Alloprof restent disponibles.';
    }
    if (alive && ticket === readVersion) controls();
  }
  function chooseFile() {
    if (!alive || busy) return;
    const file = fileInput.files?.[0];
    selected.textContent = file ? `${file.name} · ${fileSize(file.size)}` : 'Aucune trousse choisie.';
    status.textContent = '';
    progress.hidden = true;
    confirmation.hidden = true;
    controls();
  }
  async function importFile(event) {
    event.preventDefault();
    const file = fileInput.files?.[0];
    if (!alive || busy || !file) return;
    busy = true;
    const operation = new AbortController();
    controller = operation;
    readVersion++;
    confirmation.hidden = true;
    progress.hidden = false;
    progress.value = 0;
    progress.max = LIBRARY_ITEMS.length;
    status.textContent = 'Vérification de la trousse familiale…';
    controls();
    try {
      const result = await api.importFamilyZip(file, {signal:operation.signal, onProgress(update = {}) {
        if (!alive || controller !== operation || operation.signal.aborted) return;
        const total = integer(update.total) || LIBRARY_ITEMS.length;
        progress.max = total;
        progress.value = Math.min(total, integer(update.completed));
        status.textContent = update.phase === 'enregistrement' ? 'Enregistrement des PDF sur cet appareil…' : update.phase === 'termine' ? 'La trousse est enregistrée.' : `Vérification des PDF : ${progress.value} sur ${total}.`;
      }});
      if (!alive || controller !== operation) return;
      progress.max = integer(result.count) || LIBRARY_ITEMS.length;
      progress.value = progress.max;
      status.textContent = `${plural(integer(result.count), 'PDF ajouté')} sur cet appareil. Les copies sont disponibles dans la bibliothèque de chaque enfant.`;
      fileInput.value = '';
      selected.textContent = 'La trousse a été ajoutée.';
      await refreshCount();
    } catch (error) {
      if (!alive || controller !== operation) return;
      status.textContent = errorMessage(error);
      progress.hidden = true;
      await refreshCount();
    } finally {
      if (alive && controller === operation) {
        controller = null;
        busy = false;
        controls();
      }
    }
  }
  function cancelImport() {
    if (!alive || !controller) return;
    controller.abort();
    status.textContent = 'Annulation de l’import…';
    controls();
  }
  function askRemove() {
    if (!alive || busy || !count) return;
    confirmation.hidden = false;
    keep.focus();
  }
  function keepCopies() {
    if (!alive || busy) return;
    confirmation.hidden = true;
    remove.focus();
  }
  async function removeCopies() {
    if (!alive || busy || confirmation.hidden) return;
    busy = true;
    readVersion++;
    controls();
    status.textContent = 'Retrait des copies de cet appareil…';
    try {
      await api.clearFamilyLibrary();
      if (!alive) return;
      confirmation.hidden = true;
      status.textContent = 'Les copies ont été retirées de cet appareil. Les PDF restent accessibles chez Alloprof.';
      await refreshCount();
    } catch (error) {
      if (alive) status.textContent = error?.code === 'STORAGE_UNAVAILABLE' ? errorMessage(error) : 'Les copies n’ont pas pu être retirées. Réessayez dans ce navigateur.';
    } finally {
      if (alive) {
        busy = false;
        controls();
      }
    }
  }
  const listeners = [[fileInput, 'change', chooseFile], [form, 'submit', importFile], [cancel, 'click', cancelImport], [remove, 'click', askRemove], [keep, 'click', keepCopies], [confirmRemove, 'click', removeCopies]];
  for (const [element, type, listener] of listeners) element.addEventListener(type, listener);
  refreshCount();
  return {destroy() {
    alive = false;
    readVersion++;
    controller?.abort();
    controller = null;
    for (const [element, type, listener] of listeners) element.removeEventListener(type, listener);
  }};
}

export function mountFamilyLibrary(root, profile, services = {}) {
  const host = mountRoot(root, 'family-library-view');
  if (!host) return {destroy(){}};
  const api = {...storage, ...services}, urlAPI = services.urlAPI || globalThis.URL;
  const search = host.querySelector('[data-fl-search]'), category = host.querySelector('[data-fl-category]');
  const results = host.querySelector('[data-fl-results]'), count = host.querySelector('[data-fl-count]'), status = host.querySelector('[data-fl-local-status]');
  const guide = host.querySelector('[data-fl-guide]');
  const allowed = libraryItemsFor(profile), allowedIds = new Set(allowed.map(item => item.id));
  let alive = true, prepareVersion = 0, localIds = new Set(), prepared = null;
  let activePath = preferredPath(profile, services.track), guideMessage = '';
  function releasePrepared() {
    if (!prepared) return;
    const previous = prepared;
    prepared = null;
    // A tab that has just opened a PDF needs time to consume its Blob URL.
    if (previous.openedAt) {
      const delay = Math.max(0, OPENED_URL_LIFETIME - (Date.now() - previous.openedAt));
      const timer = setTimeout(() => urlAPI.revokeObjectURL(previous.url), delay);
      timer?.unref?.();
    } else urlAPI.revokeObjectURL(previous.url);
  }
  function filteredItems() { return libraryItemsFor(profile, {query:search.value, category:category.value}); }
  function renderGuide() {
    if (!guide) return;
    const expanded = expandedDetails(guide);
    guide.hidden = !pathsFor(profile).length;
    guide.innerHTML = guidedMarkup(profile, activePath, localIds, guideMessage);
    restoreDetails(guide, expanded);
  }
  function renderResults() {
    const expanded = expandedDetails(results);
    const laterOpen = !!results.querySelector('[data-fl-later]')?.open;
    const items = filteredItems();
    results.innerHTML = resultsMarkup(items, localIds, laterOpen || !!search.value.trim());
    restoreDetails(results, expanded);
    const later = items.filter(item => item.later).length;
    count.textContent = `${summary(items)}${later ? `, dont ${later} pour plus tard` : ''}`;
  }
  function filterChanged() {
    if (!alive) return;
    prepareVersion++;
    releasePrepared();
    renderGuide();
    renderResults();
    status.textContent = localIds.size ? `${plural(localIds.size, 'copie disponible', 'copies disponibles')} sur cet appareil. Prépare une copie, puis ouvre-la.` : 'Les PDF s’ouvrent chez Alloprof dans un nouvel onglet.';
  }
  function localSlot(id, key) {
    return [...host.querySelectorAll('[data-fl-local]')].find(element => element.dataset.flLocal === id && (!key || element.dataset.flLocalKey === key));
  }
  function refreshPath(message) {
    prepareVersion++;
    releasePrepared();
    guideMessage = message;
    renderGuide();
    renderResults();
  }
  function savePath(message) {
    try {
      if (services.save?.() === false) message = 'Ton repère est gardé pour cette session seulement. Ce navigateur n’a pas pu l’enregistrer.';
    } catch { message = 'Ton repère est gardé pour cette session seulement. Ce navigateur n’a pas pu l’enregistrer.'; }
    refreshPath(message);
    guide?.querySelector('[data-fl-step-heading]')?.focus();
  }
  async function click(event) {
    if (!alive) return;
    const opened = event.target.closest?.('[data-fl-open]');
    if (opened && host.contains(opened) && prepared?.id === opened.dataset.flOpen && (!opened.dataset.flKey || prepared.key === opened.dataset.flKey)) {
      prepared.openedAt = Date.now();
      return;
    }
    if (event.type === 'auxclick') return;
    const pathButton = event.target.closest?.('[data-fl-path]');
    if (pathButton && host.contains(pathButton) && pathsFor(profile).some(path => path.id === pathButton.dataset.flPath)) {
      activePath = pathButton.dataset.flPath;
      refreshPath('');
      [...(guide?.querySelectorAll('[data-fl-path]') || [])].find(button => button.dataset.flPath === activePath)?.focus();
      services.onTrackChange?.(activePath);
      return;
    }
    const review = event.target.closest?.('[data-fl-step-status]');
    if (review && host.contains(review) && pathProgress(profile, activePath).step?.id === review.dataset.flStepId && recordPathStep(profile, activePath, review.dataset.flStepId, review.dataset.flStepStatus)) {
      savePath(review.dataset.flStepStatus === 'ready' ? 'Repère enregistré avec ton parent. Tu peux découvrir la suite à ton rythme.' : review.dataset.flStepStatus === 'with-help' ? 'Ton essai avec de l’aide est gardé. Tu peux reprendre cette étape tranquillement.' : 'Cette étape reste à reprendre. Prends ton temps, tu peux essayer de nouveau.');
      return;
    }
    const start = event.target.closest?.('[data-fl-start-apply]');
    if (start && host.contains(start) && setPathStart(profile, activePath, guide?.querySelector('[data-fl-start-step]')?.value)) {
      savePath('Le point de départ a été choisi avec ton parent. Les autres repères sont conservés.');
      return;
    }
    const practice = event.target.closest?.('[data-fl-practice]');
    if (practice && host.contains(practice) && pathProgress(profile, activePath).step?.practice === practice.dataset.flPractice) {
      const step=pathProgress(profile, activePath).step;
      services.onPractice?.(step.practice,{number:step.practiceNumber});
      return;
    }
    const button = event.target.closest?.('[data-fl-prepare]');
    if (!button || !host.contains(button)) return;
    const id = button.dataset.flPrepare;
    if (!allowedIds.has(id) || !localIds.has(id)) return;
    const key = button.dataset.flKey || `catalog-${id}`, page = integer(Number(button.dataset.flPage));
    const ticket = ++prepareVersion;
    releasePrepared();
    renderGuide();
    renderResults();
    const slot = localSlot(id, key), item = allowed.find(candidate => candidate.id === id);
    const currentButton = slot?.querySelector('button');
    if (currentButton) { currentButton.disabled = true; currentButton.textContent = 'Préparation…'; }
    status.textContent = `Préparation de « ${item.title} »…`;
    try {
      const blob = await api.getLocalDocument(id);
      if (!alive || ticket !== prepareVersion) return;
      if (!blob) {
        localIds.delete(id);
        renderGuide();
        renderResults();
        status.textContent = 'Cette copie n’est plus disponible ici. Ouvre le PDF chez Alloprof ou ajoute de nouveau la trousse avec un parent.';
        return;
      }
      const url = urlAPI.createObjectURL(blob);
      prepared = {id, key, url, openedAt:0};
      const currentSlot = localSlot(id, key);
      if (!currentSlot) { releasePrepared(); return; }
      currentSlot.innerHTML = `<a class="fl-local-open" data-fl-open="${escape(id)}" data-fl-key="${escape(key)}" href="${escape(`${url}${page ? `#page=${page}` : ''}`)}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir la copie sur cet appareil${page ? `, page ${page}` : ''}, nouvel onglet : ${escape(item.title)}">Ouvrir ma copie <span aria-hidden="true">↗</span></a>`;
      currentSlot.querySelector('a')?.focus();
      status.textContent = 'Ta copie est prête. Touche « Ouvrir ma copie » pour la lire dans un nouvel onglet.';
    } catch {
      if (!alive || ticket !== prepareVersion) return;
      releasePrepared();
      renderGuide();
      renderResults();
      status.textContent = 'Cette copie ne peut pas être ouverte ici. Le bouton « Ouvrir le PDF » reste disponible.';
    }
  }
  search.addEventListener('input', filterChanged);
  category.addEventListener('change', filterChanged);
  host.addEventListener('click', click);
  host.addEventListener('auxclick', click);
  renderGuide();
  (async () => {
    try {
      const documents = await api.listLocalDocuments();
      if (!alive) return;
      localIds = new Set(documents.filter(document => allowedIds.has(document.id)).map(document => document.id));
      renderGuide();
      renderResults();
      status.textContent = localIds.size ? `${plural(localIds.size, 'copie disponible', 'copies disponibles')} sur cet appareil. Prépare une copie, puis ouvre-la.` : 'Les PDF s’ouvrent chez Alloprof dans un nouvel onglet. Ton parent peut ajouter la trousse sur cet appareil.';
    } catch {
      if (alive) status.textContent = 'Les copies de cet appareil ne sont pas accessibles pour le moment. Tu peux ouvrir les PDF chez Alloprof.';
    }
  })();
  return {destroy() {
    alive = false;
    prepareVersion++;
    search.removeEventListener('input', filterChanged);
    category.removeEventListener('change', filterChanged);
    host.removeEventListener('click', click);
    host.removeEventListener('auxclick', click);
    releasePrepared();
  }};
}
