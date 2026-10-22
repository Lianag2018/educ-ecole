import test from 'node:test';
import assert from 'node:assert/strict';
import {LIBRARY_ITEMS} from '../../src/family-library-data.js';
import {familyLibraryPanel, familyLibraryScreen, libraryItemsFor, mountFamilyLibrary, mountFamilyLibraryImport} from '../../src/family-library.js';
import {pathsFor, pathProgress, recordPathStep, setPathStart} from '../../src/family-library-paths.js';
import {childName} from '../../src/worlds.js';

const p1 = {id:'p1', name:'Nora'}, p2 = {id:'p2', name:'Zoé'};
const ids = items => items.map(item => item.id).sort();
const visibleIds = html => [...html.matchAll(/data-library-document="([^"]+)"/g)].map(match => match[1]).sort();
const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return {promise, resolve, reject}; }
function detailsSection(html, className) {
  const start = html.indexOf(`<details class="${className}"`);
  if (start < 0) return '';
  let depth = 0;
  for (const match of html.slice(start).matchAll(/<\/?details\b[^>]*>/g)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, start + match.index + match[0].length);
  }
  throw new Error('Unclosed details element');
}

test('each child sees her own documents and the family shelf, including accurate page totals', () => {
  assert.equal(LIBRARY_ITEMS.length, 78);
  assert.deepEqual(['p1', 'p2', 'family'].map(profile => LIBRARY_ITEMS.filter(item => item.profile === profile).length), [28, 42, 8]);
  for (const [profile, expectedCount, otherName] of [[p1, 36, 'Zoé'], [p2, 50, 'Nora']]) {
    const expected = LIBRARY_ITEMS.filter(item => [profile.id, 'family'].includes(item.profile));
    const html = familyLibraryScreen(profile);
    assert.deepEqual(visibleIds(html), ids(expected));
    assert.match(html, new RegExp(`${expectedCount} documents · ${expected.reduce((total, item) => total + item.pages, 0)} pages`));
    assert.ok(!html.includes(otherName));
    assert.ok(!html.includes('data-action="weekly"'));
  }
  assert.deepEqual(ids(libraryItemsFor({id:'unknown'})), ids(LIBRARY_ITEMS.filter(item => item.profile === 'family')));
  for (const profile of [{id:'p1', name:'Lectrice 1'}, {id:'p2', name:'Lectrice 2'}]) {
    const expectedName = childName(profile);
    assert.ok(familyLibraryScreen(profile).includes(`Les fiches de ${expectedName}`));
    assert.ok(familyLibraryScreen({id:profile.id}).includes(`Les fiches de ${expectedName}`));
    assert.ok(familyLibraryPanel().includes(`<strong>${expectedName}</strong>`));
  }
  assert.ok(familyLibraryScreen().includes('Les fiches de la famille'));
  assert.ok(familyLibraryScreen({id:'unknown', name:'Lectrice 1'}).includes('Les fiches de Lectrice 1'));
});

test('search is accent-insensitive and combines category and profile filters without changing the catalog', () => {
  const before = JSON.stringify(LIBRARY_ITEMS);
  const maths = libraryItemsFor(p2, {query:'MATHEMATIQUES', category:'Mathématiques'});
  assert.ok(maths.length > 0);
  assert.ok(maths.every(item => item.category === 'Mathématiques' && ['p2', 'family'].includes(item.profile)));
  const reading = libraryItemsFor(p1, {query:'lecture son'});
  assert.ok(reading.some(item => item.title === 'Apprivoiser la lecture, un son à la fois'));
  assert.ok(reading.every(item => ['p1', 'family'].includes(item.profile)));
  assert.deepEqual(libraryItemsFor(p1, {query:'mot-introuvable-19493'}), []);
  assert.deepEqual(libraryItemsFor(p1, {category:'catégorie inconnue'}), []);
  assert.equal(JSON.stringify(LIBRARY_ITEMS), before);
});

test('later documents appear only in the separate collapsed shelf and never as weekly tasks', () => {
  for (const id of ['p2-5b8af668e45e', 'p2-818529086e43', 'p2-17d71fc9a99f', 'p2-7703dfe87ee1', 'p2-0a61a7e760ae']) assert.equal(LIBRARY_ITEMS.find(item => item.id === id)?.later, true);
  for (const profile of [p1, p2]) {
    const html = familyLibraryScreen(profile), expected = libraryItemsFor(profile);
    const later = detailsSection(html, 'fl-later');
    const main = html.replace(later, '');
    assert.deepEqual(visibleIds(later), ids(expected.filter(item => item.later)));
    assert.deepEqual(visibleIds(main), ids(expected.filter(item => !item.later)));
    if (later) {
      assert.match(later, /Pour plus tard/);
      assert.match(later, /ne font pas partie des défis de la semaine/);
      assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(later));
    }
  }
});

test('every document has its official PDF and source links immediately, with safe new-tab attributes', () => {
  for (const profile of [p1, p2]) {
    const html = familyLibraryScreen(profile);
    const links = [...html.matchAll(/<a\b([^>]+)>/g)].map(match => match[1]);
    const catalog = [...html.matchAll(/<article class="fl-document"[\s\S]*?<\/article>/g)].map(match => match[0]).join('');
    assert.equal([...catalog.matchAll(/<a\b/g)].length, libraryItemsFor(profile).length * 2);
    for (const attributes of links) {
      const url = new URL(decode(attributes.match(/href="([^"]+)"/)[1]));
      assert.equal(url.protocol, 'https:');
      assert.ok(['alloprof.qc.ca', 'www.alloprof.qc.ca', 'cms.alloprof.qc.ca'].includes(url.hostname));
      assert.match(attributes, /target="_blank"/);
      assert.match(attributes, /rel="noopener noreferrer"/);
    }
    for (const item of libraryItemsFor(profile)) {
      assert.ok(links.some(link => decode(link).includes(`href="${item.downloadUrl}"`)));
      assert.ok(links.some(link => decode(link).includes(`href="${item.sourceUrl}"`)));
    }
    assert.ok(!html.includes('blob:'));
  }
});

test('names and catalog text are escaped, and nonofficial or executable URLs are excluded', () => {
  const base = {...LIBRARY_ITEMS[0], id:'id" onclick="bad()', title:'<img src=x onerror=bad()> & "Titre"', category:'<script>bad()</script>'};
  const items = [
    {...base, downloadUrl:'javascript:bad()', sourceUrl:'https://alloprof.qc.ca.evil.example/'},
    {...base, id:'credential', downloadUrl:'https://user:pass@cms.alloprof.qc.ca/test.pdf', sourceUrl:'https://evil.example/'},
    {...base, id:'insecure', downloadUrl:'http://cms.alloprof.qc.ca/test.pdf', sourceUrl:'https://www.alloprof.qc.ca:444/test'},
  ];
  const html = familyLibraryScreen({...p1, name:'<svg onload=bad()> & "Nom"'}, items);
  assert.ok(!/<(?:img|svg|script)\b/.test(html));
  assert.ok(!html.includes('href='));
  assert.ok(!html.includes(' onclick="bad()'));
  assert.match(html, /&lt;svg onload=bad\(\)&gt; &amp; &quot;Nom&quot;/);
  assert.match(html, /id&quot; onclick=&quot;bad\(\)/);
  assert.match(html, /&lt;img src=x onerror=bad\(\)&gt; &amp; &quot;Titre&quot;/);
});

test('the parent panel explains the optional local ZIP, all 78 documents, and explicit copy removal', () => {
  const html = familyLibraryPanel([{...p1, name:'<script>name</script>'}, p2]);
  assert.match(html, /id="family-library-import"/);
  for (const text of ['78 PDF', '28 documents', '42 documents', '8 documents', 'ne se synchronisent pas', 'Effacer les données du navigateur']) assert.ok(html.includes(text));
  assert.match(html, /type="file" accept="\.zip,/);
  assert.match(html, /<progress[^>]+aria-label=/);
  assert.match(html, /data-fl-confirm hidden role="group"/);
  assert.match(html, /Oui, retirer les PDF/);
  assert.match(html, /Garder les PDF/);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('data-action='));
});

test('shared documents use the selected child’s guidance without changing files, and answer keys stay in parent details', () => {
  const item = {...LIBRARY_ITEMS[0], id:'shared-test', profile:'family', pages:6, guidance:{objective:'Base commune', childPages:[1], parentPages:[], notes:''}, guidanceByProfile:{p1:{objective:'Observer les unités', childPages:[2, 3], parentPages:[1]}, p2:{objective:'Observer les centaines', childPages:[1, 2, 3], parentPages:[]}}};
  const before = JSON.stringify(item), young = libraryItemsFor(p1, {}, [item])[0], older = libraryItemsFor(p2, {}, [item])[0];
  assert.deepEqual(young.guidance.childPages, [2, 3]); assert.deepEqual(older.guidance.childPages, [1, 2, 3]);
  for (const selected of [young, older]) for (const key of ['id', 'path', 'profile', 'sourceUrl', 'downloadUrl', 'sha256']) assert.equal(selected[key], item[key]);
  assert.equal(JSON.stringify(item), before);
  assert.match(familyLibraryScreen(p1, [item]), /Avec toi : Pages 2–3 du PDF/);
  const parentOnly = {...item, guidanceByProfile:undefined, guidance:{childPages:[], parentPages:[1, 2, 3, 4, 5, 6], objective:'Corrigé pour le parent', notes:'<img src=x onerror=bad()>', prerequisites:'Lire les consignes'}};
  const html = familyLibraryScreen(p1, [parentOnly]), folded = detailsSection(html, 'fl-parent-only');
  assert.match(folded, /Ouvrir avec mon parent/); assert.match(folded, /href="https:/);
  assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(folded));
  assert.ok(!html.includes('<img src=x'));
  assert.match(html, /Avant de commencer : Lire les consignes/);
});

// A small DOM surface keeps asynchronous lifecycle tests independent of browser packages.
class Element {
  constructor({id = '', dataset = {}, parent = null} = {}) {
    this.id = id; this.dataset = dataset; this.parent = parent; this.elements = new Map(); this.listeners = new Map();
    this._value = ''; this._html = ''; this.textContent = ''; this.hidden = false; this.disabled = false; this.files = [];
  }
  get value() { return this._value; }
  set value(value) { this._value = value; if (this.isFile && value === '') this.files = []; }
  get innerHTML() { return this._html; }
  set innerHTML(html) { this._html = html; }
  querySelector(selector) { return this.elements.get(selector) || null; }
  querySelectorAll(selector) { return this.elements.has(selector) ? [this.elements.get(selector)] : [...new Set(this.elements.values())].flatMap(element => element.querySelectorAll(selector)); }
  setAttribute(name, value) { this[name] = value; }
  addEventListener(type, listener) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(listener); }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  contains(element) { return element === this || !!element?.parent && this.contains(element.parent); }
  closest(selector) {
    const key = selector.match(/^\[data-(.+)\]$/)?.[1]?.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    return key && Object.hasOwn(this.dataset, key) ? this : this.parent?.closest(selector) || null;
  }
  focus() { this.focused = true; }
  async emit(type, values = {}) { const event = {type, target:this, preventDefault(){}, ...values}; await Promise.all([...(this.listeners.get(type) || [])].map(listener => listener(event))); }
}

class LocalSlot extends Element {
  get innerHTML() { return this._html; }
  set innerHTML(html) {
    this._html = html; this.elements.clear();
    const ready = html.match(/data-fl-open="([^"]+)"[^>]*href="([^"]+)"/);
    const key = decode(html.match(/data-fl-key="([^"]+)"/)?.[1] || '');
    if (ready) { const link = new Element({parent:this, dataset:{flOpen:decode(ready[1]), flKey:key}}); link.href = decode(ready[2]); this.elements.set('a', link); }
    else if (html.includes('data-fl-prepare=')) this.elements.set('button', new Element({parent:this, dataset:{flPrepare:this.dataset.flLocal, flKey:key, flPage:html.match(/data-fl-page="([^"]+)"/)?.[1] || '0'}}));
  }
}

class Results extends Element {
  get innerHTML() { return this._html; }
  set innerHTML(html) {
    this._html = html; this.slots = []; this.elements.clear();
    for (const match of html.matchAll(/<span class="fl-local-control" data-fl-local="([^"]+)"([^>]*)>([\s\S]*?)<\/span>/g)) {
      const key = decode(match[2].match(/data-fl-local-key="([^"]+)"/)?.[1] || '');
      const slot = new LocalSlot({parent:this, dataset:{flLocal:decode(match[1]), flLocalKey:key}}); slot.innerHTML = match[3]; this.slots.push(slot);
    }
    const later = html.match(/<details[^>]*data-fl-later[^>]*>/);
    if (later) { const element = new Element({parent:this}); element.open = /\sopen(?:\s|>)/.test(later[0]); this.elements.set('[data-fl-later]', element); }
  }
  querySelectorAll(selector) { return selector === '[data-fl-local]' ? this.slots || [] : super.querySelectorAll(selector); }
}

class Guide extends Results {
  get innerHTML() { return this._html; }
  set innerHTML(html) {
    super.innerHTML = html; this.controls = new Map();
    for (const [attribute, key] of [['path', 'flPath'], ['step-status', 'flStepStatus'], ['start-apply', 'flStartApply'], ['practice', 'flPractice']]) {
      const selector = `[data-fl-${attribute}]`, matches = [];
      for (const match of html.matchAll(new RegExp(`<button[^>]*data-fl-${attribute}(?:="([^"]*)")?([^>]*)>`, 'g'))) {
        const node = new Element({parent:this, dataset:{[key]:decode(match[1] || '')}});
        if (attribute === 'step-status') node.dataset.flStepId = decode(match[2].match(/data-fl-step-id="([^"]+)"/)?.[1] || '');
        matches.push(node);
      }
      this.controls.set(selector, matches);
      if (matches[0]) this.elements.set(selector, matches[0]);
    }
    const select = html.match(/<select[^>]*data-fl-start-step[^>]*>([\s\S]*?)<\/select>/);
    if (select) {
      const node = new Element({parent:this});
      node.value = decode(select[1].match(/<option value="([^"]+)" selected>/)?.[1] || select[1].match(/<option value="([^"]+)"/)?.[1] || '');
      this.elements.set('[data-fl-start-step]', node);
    }
  }
  querySelectorAll(selector) { return this.controls?.get(selector) || super.querySelectorAll(selector); }
}

function makeHost(id, selectors) {
  const host = new Element({id});
  for (const selector of selectors) host.elements.set(`[data-fl-${selector}]`, new Element({parent:host}));
  return host;
}
function childHost() {
  const host = makeHost('family-library-view', ['search', 'category', 'count', 'local-status']);
  const results = new Results({parent:host}); results.innerHTML = '';
  const guide = new Guide({parent:host}); guide.innerHTML = '';
  host.elements.set('[data-fl-results]', results);
  host.elements.set('[data-fl-guide]', guide);
  return {host, results, guide, search:host.querySelector('[data-fl-search]'), status:host.querySelector('[data-fl-local-status]'), slot:id => results.slots.find(slot => slot.dataset.flLocal === id)};
}
function parentHost() {
  const names = ['import-form', 'file', 'import-button', 'cancel', 'progress', 'import-status', 'selected', 'stored', 'delete', 'confirm', 'confirm-delete', 'keep'];
  const host = makeHost('family-library-import', names), nodes = Object.fromEntries(names.map(name => [name, host.querySelector(`[data-fl-${name}]`)]));
  nodes.file.isFile = true; nodes.confirm.hidden = true;
  return {host, nodes};
}

test('local documents are loaded only after selection and require an explicit ready link', async () => {
  const ui = childHost(), first = libraryItemsFor(p1)[0], second = libraryItemsFor(p1)[1], requests = [], urls = [], revoked = [];
  const pending = deferred();
  const mounted = mountFamilyLibrary(ui.host, p1, {
    listLocalDocuments:async () => [{id:first.id}, {id:second.id}, {id:LIBRARY_ITEMS.find(item => item.profile === 'p2').id}],
    getLocalDocument:id => { requests.push(id); return pending.promise; },
    urlAPI:{createObjectURL:blob => { urls.push(blob); return 'blob:local-selected'; }, revokeObjectURL:url => revoked.push(url)},
  });
  await flush();
  assert.deepEqual(requests, []);
  assert.match(ui.status.textContent, /^2 copies disponibles/);
  const preparing = ui.host.emit('click', {target:ui.slot(first.id).querySelector('button')});
  assert.deepEqual(requests, [first.id]);
  assert.equal(ui.slot(first.id).querySelector('a'), null);
  assert.equal(ui.slot(first.id).querySelector('button').disabled, true);
  const blob = new Blob(['%PDF-test'], {type:'application/pdf'}); pending.resolve(blob); await preparing;
  assert.deepEqual(urls, [blob]);
  assert.equal(ui.slot(first.id).querySelector('a').href, 'blob:local-selected');
  assert.match(ui.slot(first.id).innerHTML, /target="_blank" rel="noopener noreferrer"/);
  assert.match(ui.status.textContent, /Touche « Ouvrir ma copie »/);
  mounted.destroy();
  assert.deepEqual(revoked, ['blob:local-selected']);
});

test('leaving or filtering during preparation prevents stale PDF links and late UI updates', async () => {
  for (const leave of [true, false]) {
    const ui = childHost(), item = libraryItemsFor(p1)[0], pending = deferred(), urls = [];
    const mounted = mountFamilyLibrary(ui.host, p1, {listLocalDocuments:async () => [{id:item.id}], getLocalDocument:() => pending.promise, urlAPI:{createObjectURL:blob => urls.push(blob), revokeObjectURL(){}}});
    await flush();
    const preparing = ui.host.emit('click', {target:ui.slot(item.id).querySelector('button')});
    if (leave) mounted.destroy();
    else { ui.search.value = 'introuvable-test'; await ui.search.emit('input'); }
    const before = [ui.results.innerHTML, ui.status.textContent];
    pending.resolve(new Blob(['%PDF-test'])); await preparing;
    assert.deepEqual(urls, []);
    assert.deepEqual([ui.results.innerHTML, ui.status.textContent], before);
    mounted.destroy();
  }
});

test('a just-opened PDF URL survives navigation long enough for the new tab to consume it', async context => {
  const timers = [], revoked = [], ui = childHost(), item = libraryItemsFor(p1)[0];
  context.mock.method(globalThis, 'setTimeout', (callback, delay) => { timers.push({callback, delay}); return {unref(){}}; });
  const mounted = mountFamilyLibrary(ui.host, p1, {listLocalDocuments:async () => [{id:item.id}], getLocalDocument:async () => new Blob(['%PDF-test']), urlAPI:{createObjectURL:() => 'blob:opened', revokeObjectURL:url => revoked.push(url)}});
  await flush(); await ui.host.emit('click', {target:ui.slot(item.id).querySelector('button')});
  await ui.host.emit('click', {target:ui.slot(item.id).querySelector('a')});
  mounted.destroy();
  assert.deepEqual(revoked, []);
  assert.equal(timers.length, 1);
  assert.ok(timers[0].delay > 59000 && timers[0].delay <= 60000);
  timers[0].callback();
  assert.deepEqual(revoked, ['blob:opened']);
});

test('destroyed screens ignore pending local-document discovery', async () => {
  for (const type of ['child', 'parent']) {
    const pending = deferred(), ui = type === 'child' ? childHost() : parentHost();
    const mounted = type === 'child' ? mountFamilyLibrary(ui.host, p1, {listLocalDocuments:() => pending.promise}) : mountFamilyLibraryImport(ui.host, [p1, p2], {listLocalDocuments:() => pending.promise});
    mounted.destroy(); pending.resolve(LIBRARY_ITEMS.map(({id, bytes}) => ({id, bytes}))); await flush();
    if (type === 'child') { assert.equal(ui.results.innerHTML, ''); assert.equal(ui.status.textContent, ''); }
    else assert.equal(ui.nodes.stored.textContent, '');
    assert.ok([...ui.host.listeners.values()].every(listeners => !listeners.size));
  }
});

test('ZIP import reports progress, preserves old count on cancellation, and stops updating after navigation', async () => {
  const ui = parentHost(), pending = deferred(), oldDocuments = LIBRARY_ITEMS.slice(0, 2), imports = [];
  const mounted = mountFamilyLibraryImport(ui.host, [p1, p2], {listLocalDocuments:async () => oldDocuments, importFamilyZip:(file, options) => { imports.push({file, options}); return pending.promise; }});
  await flush();
  assert.match(ui.nodes.stored.textContent, /^2 PDF enregistrés/);
  const file = {name:'famille.zip', size:1000}; ui.nodes.file.files = [file]; await ui.nodes.file.emit('change');
  assert.equal(ui.nodes['import-button'].disabled, false);
  const importing = ui.nodes['import-form'].emit('submit');
  assert.equal(imports.length, 1); assert.equal(imports[0].file, file); assert.equal(ui.nodes.file.disabled, true);
  imports[0].options.onProgress({phase:'validation', completed:12, total:78, bytes:2000});
  assert.equal(ui.nodes.progress.value, 12); assert.match(ui.nodes['import-status'].textContent, /12 sur 78/);
  await ui.nodes.cancel.emit('click');
  assert.equal(imports[0].options.signal.aborted, true);
  pending.reject(Object.assign(new Error('cancelled'), {code:'ABORTED'})); await importing;
  assert.match(ui.nodes['import-status'].textContent, /PDF déjà enregistrés sont conservés/);
  assert.match(ui.nodes.stored.textContent, /^2 PDF enregistrés/);
  assert.equal(ui.nodes['delete'].disabled, false);
  assert.equal(ui.nodes.file.disabled, false);
  mounted.destroy();

  const next = parentHost(), waiting = deferred(); let options;
  const later = mountFamilyLibraryImport(next.host, [], {listLocalDocuments:async () => [], importFamilyZip:(_, value) => { options = value; return waiting.promise; }});
  await flush(); next.nodes.file.files = [file]; await next.nodes.file.emit('change');
  const operation = next.nodes['import-form'].emit('submit'); later.destroy();
  assert.equal(options.signal.aborted, true);
  const status = next.nodes['import-status'].textContent;
  options.onProgress({phase:'termine', completed:78, total:78}); waiting.resolve({count:78, bytes:1000}); await operation;
  assert.equal(next.nodes['import-status'].textContent, status);
});

test('successful import clears the picker, and local copies can be removed only after confirmation', async () => {
  const ui = parentHost(); let documents = [], clearCalls = 0;
  const mounted = mountFamilyLibraryImport(ui.host, [p1, p2], {
    listLocalDocuments:async () => documents,
    importFamilyZip:async (_, {onProgress}) => { onProgress({phase:'enregistrement', completed:78, total:78}); documents = LIBRARY_ITEMS; return {count:78, bytes:1000}; },
    clearFamilyLibrary:async () => { clearCalls++; documents = []; },
  });
  await flush(); ui.nodes.file.files = [{name:'famille.zip', size:1000}]; await ui.nodes.file.emit('change'); await ui.nodes['import-form'].emit('submit');
  assert.match(ui.nodes['import-status'].textContent, /^78 PDF ajoutés/);
  assert.match(ui.nodes.stored.textContent, /^78 PDF enregistrés/);
  assert.equal(ui.nodes.file.files.length, 0); assert.equal(ui.nodes['import-button'].disabled, true);
  await ui.nodes['confirm-delete'].emit('click'); assert.equal(clearCalls, 0);
  await ui.nodes['delete'].emit('click'); assert.equal(clearCalls, 0); assert.equal(ui.nodes.confirm.hidden, false);
  await ui.nodes.keep.emit('click'); assert.equal(clearCalls, 0); assert.equal(ui.nodes.confirm.hidden, true);
  await ui.nodes['delete'].emit('click'); await ui.nodes['confirm-delete'].emit('click');
  assert.equal(clearCalls, 1); assert.match(ui.nodes.stored.textContent, /^0 PDF enregistrés/);
  assert.match(ui.nodes['import-status'].textContent, /PDF restent accessibles chez Alloprof/);
  assert.equal(ui.nodes['delete'].disabled, true);
  mounted.destroy();
});

test('guided steps precede the catalog and open the intended PDF pages for the selected child', () => {
  for (const profile of [p1, p2]) {
    const paths = pathsFor(profile); assert.equal(paths.length, 3);
    const html = familyLibraryScreen(profile), first = pathProgress(profile, paths[0].id).step;
    assert.ok(first);
    assert.ok(html.indexOf('data-fl-guide') < html.indexOf('data-fl-catalog'));
    assert.match(html, new RegExp(`data-fl-current-step="${first.id}"`));
    assert.ok(!/<details class="fl-catalog"[^>]*\sopen(?:\s|>)/.test(html));
    const allowed = new Map(libraryItemsFor(profile).map(item => [item.id, item]));
    for (const id of [...html.matchAll(/data-library-guided-document="([^"]+)"/g)].map(match => match[1])) assert.ok(allowed.has(id));
    for (const reference of first.documents.filter(reference => reference.role === 'activity')) {
      const item = allowed.get(reference.id); assert.ok(item && !item.later);
      assert.ok(html.includes(`${item.downloadUrl}#page=${reference.pages[0]}`));
    }
    const numberPath = paths.find(path => path.id === 'numbers'); assert.ok(numberPath);
    assert.ok(familyLibraryScreen(profile, LIBRARY_ITEMS, {track:'numbers'}).includes(`data-fl-current-step="${numberPath.steps[0].id}"`));
    const readingPath = paths.find(path => path.id === 'reading'); assert.ok(readingPath);
    assert.ok(familyLibraryScreen(profile, LIBRARY_ITEMS, {track:'reading'}).includes(`data-fl-current-step="${readingPath.steps[0].id}"`));
  }
});

test('opening a PDF or practising does not advance a step; only the explicit parent readiness choice advances it', async () => {
  const profile = structuredClone(p2), sister = structuredClone(p1), untouched = JSON.stringify(sister), ui = childHost();
  const path = pathsFor(profile)[0]; assert.ok(path?.steps.length > 1);
  let saves = 0; const practices = [], tracks = [];
  const mounted = mountFamilyLibrary(ui.host, profile, {listLocalDocuments:async () => [], save:() => saves++, onPractice:value => practices.push(value), onTrackChange:value => tracks.push(value)});
  await flush();
  await ui.host.emit('click', {target:new Element({parent:ui.guide})});
  const practice = ui.guide.querySelector('[data-fl-practice]');
  assert.ok(practice); await ui.host.emit('click', {target:practice});
  assert.equal(saves, 0); assert.equal(profile.familyLibraryProgress, undefined);
  assert.deepEqual(practices, [path.steps[0].practice]);
  await ui.host.emit('click', {target:ui.guide.querySelectorAll('[data-fl-step-status]').find(button => button.dataset.flStepStatus === 'with-help')});
  assert.equal(saves, 1); assert.equal(pathProgress(profile, path.id).index, 0);
  assert.equal(pathProgress(profile, path.id).statuses[path.steps[0].id], 'with-help');
  await ui.host.emit('click', {target:ui.guide.querySelectorAll('[data-fl-step-status]').find(button => button.dataset.flStepStatus === 'ready')});
  assert.equal(saves, 2); assert.equal(pathProgress(profile, path.id).index, 1);
  assert.equal(pathProgress(profile, path.id).statuses[path.steps[0].id], 'ready');
  await ui.host.emit('click', {target:ui.guide.querySelectorAll('[data-fl-path]').find(button => button.dataset.flPath !== path.id)});
  assert.equal(saves, 2); assert.equal(pathProgress(profile, path.id).index, 1);
  assert.deepEqual(tracks, [pathsFor(profile)[1].id]);
  assert.equal(JSON.stringify(sister), untouched);
  mounted.destroy();
});

test('number practice opens a value aligned with the current step and leaves pattern work in its PDF', async () => {
  const profile = structuredClone(p2), ui = childHost(), practices = [];
  const mounted = mountFamilyLibrary(ui.host, profile, {track:'numbers', listLocalDocuments:async () => [], onPractice:(kind, context) => practices.push({kind, ...context})});
  await flush();
  await ui.host.emit('click', {target:ui.guide.querySelector('[data-fl-practice]')});
  assert.deepEqual(practices, [{kind:'numbers', number:462}]);
  ui.guide.querySelector('[data-fl-start-step]').value = 'p2-numbers-zero';
  await ui.host.emit('click', {target:ui.guide.querySelector('[data-fl-start-apply]')});
  await ui.host.emit('click', {target:ui.guide.querySelector('[data-fl-practice]')});
  assert.deepEqual(practices.at(-1), {kind:'numbers', number:1204});
  ui.guide.querySelector('[data-fl-start-step]').value = 'p2-numbers-patterns';
  await ui.host.emit('click', {target:ui.guide.querySelector('[data-fl-start-apply]')});
  assert.equal(ui.guide.querySelector('[data-fl-practice]'), null);
  assert.match(ui.guide.innerHTML, /data-library-guided-document/);
  assert.equal(practices.length, 2);
  mounted.destroy();
});

test('the parent can choose a starting step without erasing earlier or other-path progress', async () => {
  const profile = structuredClone(p1), paths = pathsFor(profile), path = paths[0]; assert.ok(path?.steps.length >= 3);
  recordPathStep(profile, path.id, path.steps[0].id, 'ready');
  recordPathStep(profile, paths[1].id, paths[1].steps[0].id, 'with-help');
  const otherProgress = structuredClone(profile.familyLibraryProgress[paths[1].id]), ui = childHost(); let saves = 0;
  const mounted = mountFamilyLibrary(ui.host, profile, {listLocalDocuments:async () => [], save:() => saves++});
  await flush();
  ui.guide.querySelector('[data-fl-start-step]').value = path.steps[2].id;
  await ui.host.emit('click', {target:ui.guide.querySelector('[data-fl-start-apply]')});
  assert.equal(saves, 1);
  assert.equal(pathProgress(profile, path.id).startIndex, 2);
  assert.equal(pathProgress(profile, path.id).step.id, path.steps[2].id);
  assert.equal(pathProgress(profile, path.id).statuses[path.steps[0].id], 'ready');
  assert.deepEqual(profile.familyLibraryProgress[paths[1].id], otherProgress);
  mounted.destroy();
});

test('a refused save is described as session-only instead of a successfully saved milestone', async () => {
  const profile = structuredClone(p1), ui = childHost();
  const mounted = mountFamilyLibrary(ui.host, profile, {listLocalDocuments:async () => [], save:() => false});
  await flush();
  await ui.host.emit('click', {target:ui.guide.querySelectorAll('[data-fl-step-status]').find(button => button.dataset.flStepStatus === 'with-help')});
  assert.match(ui.guide.innerHTML, /pour cette session seulement/);
  assert.match(ui.guide.innerHTML, /n’a pas pu l’enregistrer/);
  assert.ok(!ui.guide.innerHTML.includes('Ton essai avec de l’aide est gardé.'));
  assert.equal(pathProgress(profile, pathsFor(profile)[0].id).index, 0);
  mounted.destroy();
});

test('the guide prepares only its chosen document and retains its page without changing the catalog control or progress', async () => {
  const profile = structuredClone(p1), path = pathsFor(profile)[0], step = pathProgress(profile, path.id).step;
  const referenceIndex = step.documents.findIndex(reference => reference.role === 'activity'), reference = step.documents[referenceIndex]; assert.ok(reference);
  const ui = childHost(), requested = [], revoked = []; let saves = 0;
  const mounted = mountFamilyLibrary(ui.host, profile, {listLocalDocuments:async () => [{id:reference.id}], getLocalDocument:async id => { requested.push(id); return new Blob(['%PDF-test']); }, save:() => saves++, urlAPI:{createObjectURL:() => 'blob:guided-page', revokeObjectURL:url => revoked.push(url)}});
  await flush();
  const key = `guided-${path.id}-${step.id}-${referenceIndex}`;
  const slot = () => ui.guide.slots.find(slot => slot.dataset.flLocalKey === key);
  assert.ok(slot()?.querySelector('button'));
  await ui.host.emit('click', {target:slot().querySelector('button')});
  assert.deepEqual(requested, [reference.id]);
  assert.equal(slot().querySelector('a').href, `blob:guided-page#page=${reference.pages[0]}`);
  assert.ok(ui.slot(reference.id).querySelector('button'));
  assert.equal(saves, 0); assert.equal(profile.familyLibraryProgress, undefined);
  mounted.destroy(); assert.deepEqual(revoked, ['blob:guided-page']);
});

test('a pedagogical page order of 3 then 2 opens page 3 in both official and local copies', async () => {
  const profile = structuredClone(p1), path = pathsFor(profile).find(path => path.id === 'numbers');
  const step = path.steps.find(step => step.id === 'p1-numbers-first-ten'); assert.ok(step);
  const referenceIndex = step.documents.findIndex(reference => reference.pages[0] === 3 && reference.pages[1] === 2);
  const reference = step.documents[referenceIndex]; assert.ok(reference);
  const item = LIBRARY_ITEMS.find(item => item.id === reference.id);
  setPathStart(profile, path.id, step.id);
  const html = familyLibraryScreen(profile, LIBRARY_ITEMS, {track:'numbers'});
  assert.ok(html.includes(`${item.downloadUrl}#page=3`));
  assert.ok(html.includes(reference.note));
  const ui = childHost();
  const mounted = mountFamilyLibrary(ui.host, profile, {track:'numbers', listLocalDocuments:async () => [{id:item.id}], getLocalDocument:async () => new Blob(['%PDF-test']), urlAPI:{createObjectURL:() => 'blob:ordered-pages', revokeObjectURL(){}}});
  await flush();
  const key = `guided-${path.id}-${step.id}-${referenceIndex}`, slot = () => ui.guide.slots.find(slot => slot.dataset.flLocalKey === key);
  await ui.host.emit('click', {target:slot().querySelector('button')});
  assert.equal(slot().querySelector('a').href, 'blob:ordered-pages#page=3');
  mounted.destroy();
});
