import test from 'node:test';
import assert from 'node:assert/strict';
import {numberCoachMarkup, wordCoachMarkup, parentCoachingPanel} from '../../src/learning-coach.js';

const plainNumber = text => Number(text.replace(/[\s\u00a0\u202f]/g, ''));
const places = html => [...html.matchAll(/<td>(\d)<\/td>/g)].map(match => Number(match[1]));

test('all 0–1999 place tables and explicit-zero decompositions represent the exact requested number', () => {
  for (let value = 0; value <= 1999; value++) {
    const html = numberCoachMarkup(value), digits = places(html);
    const weights = value < 100 ? [10, 1] : value < 1000 ? [100, 10, 1] : [1000, 100, 10, 1];
    assert.equal(digits.length, weights.length);
    assert.ok(digits.every(digit => digit >= 0 && digit <= 9));
    assert.equal(digits.reduce((total, digit, index) => total + digit * weights[index], 0), value);
    const equation = html.match(/class="lc-decomposition">([^<]+)<\/p>/)[1].split(' = ');
    assert.equal(plainNumber(equation[0]), value);
    const terms = equation[1].split(' + ').map(plainNumber);
    assert.equal(terms.length, weights.length); assert.equal(terms.reduce((sum, term) => sum + term, 0), value);
    assert.deepEqual(terms, digits.map((digit, index) => digit * weights[index]));
    const headings = [...html.matchAll(/<th scope="col">([^<]+)<\/th>/g)].map(match => match[1]);
    assert.deepEqual(headings, ['Milliers', 'Centaines', 'Dizaines', 'Unités'].slice(4 - weights.length)); assert.match(html, /<caption>/);
    assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(html));
  }
});

test('invalid numbers have no panel and are never rounded, coerced or replaced by another target', () => {
  for (const value of [undefined, null, '', '20', '1 999', NaN, Infinity, -1, 2000, 5.6, {}, [], true]) assert.equal(numberCoachMarkup(value), '');
  assert.deepEqual(places(numberCoachMarkup(-0)), [0, 0]);
});

test('concrete challenges distinguish an empty collection, single objects, groups of ten and drawn place values', () => {
  const zero = numberCoachMarkup(0); assert.match(zero, /boîte vide/); assert.match(zero, /0 objet/); assert.ok(!zero.includes('Prends 0'));
  assert.match(numberCoachMarkup(1), /Prends 1 petit objet\./);
  assert.match(numberCoachMarkup(9), /Prends 9 petits objets\./);
  assert.match(numberCoachMarkup(10), /Fais 1 groupe de 10 objets : il ne reste aucun objet seul/);
  assert.match(numberCoachMarkup(56), /Fais 5 groupes de 10 objets, puis ajoute 6 objets tout seuls/);
  assert.match(numberCoachMarkup(101), /Dessine 1 carré, 0 barre et 1 point/);
  assert.match(numberCoachMarkup(600), /Dessine 6 carrés, 0 barre et 0 point/);
  assert.match(numberCoachMarkup(1005), /1 cadre de 1 000, puis 0 carré, 0 barre et 5 points à l’extérieur/);
  assert.match(numberCoachMarkup(1999), /1 cadre de 1 000, puis 9 carrés, 9 barres et 9 points à l’extérieur/);
});

test('base-ten exchanges are exact and additional questions remain within the supported number range', () => {
  assert.ok(!numberCoachMarkup(9).includes('10 unités ='));
  assert.match(numberCoachMarkup(10), /10 unités = 1 dizaine\./);
  assert.match(numberCoachMarkup(100), /10 dizaines = 1 centaine\./);
  assert.match(numberCoachMarkup(1000), /10 centaines = 1 millier\./);
  for (const value of [0, 1, 9, 10, 56, 99, 100, 1000, 1999]) {
    const html = numberCoachMarkup(value), compared = html.match(/regarde ([\d\s\u00a0]+) et ([\d\s\u00a0]+)\./);
    assert.equal(plainNumber(compared[1]), value); const other = plainNumber(compared[2]);
    assert.ok(other >= 0 && other <= 1999 && other !== value); if (value < 100) assert.ok(other < 100);
    for (const prompt of ['Reformuler', 'Montrer', 'Écrire', 'Comparer', 'Une question au choix']) assert.ok(html.includes(prompt));
  }
});

test('word prompts preserve the whole word, escape supplied text and never infer syllables or a definition', () => {
  for (const word of ['lapin', 'animation', 'invitation', 'arc-en-ciel', 'la + pin']) {
    const html = wordCoachMarkup(word); assert.ok(html.includes(`« ${word} »`));
    for (const prompt of ['Relire', 'Expliquer', 'Mettre en contexte', 'Reprendre plus tard']) assert.ok(html.includes(prompt));
    assert.ok(!html.includes('syllabe')); assert.ok(!html.includes('data-action='));
    assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(html));
  }
  const unsafe = wordCoachMarkup('<img src=x onerror="bad()"> & \'mot\'');
  assert.ok(!unsafe.includes('<img')); assert.ok(unsafe.includes('&lt;img')); assert.ok(unsafe.includes('&quot;bad()&quot;')); assert.ok(unsafe.includes('&#39;mot&#39;'));
  for (const value of [undefined, null, '', '   ', 56, {}, 'a'.repeat(81)]) assert.equal(wordCoachMarkup(value), '');
});

test('parent guidance reflects the chosen school context without guessing a level or changing profile data', () => {
  const profiles = [
    {id:'p1', name:'Nora', schoolContext:{stage:'3e année', focus:'Montrer les dizaines'}, records:{a:{count:2}}, history:[{result:'correct'}]},
    {id:'p2', name:'Zoé', schoolContext:{stage:'1re année', focus:'Expliquer un mot'}, records:{}, history:[]}
  ];
  for (const profile of profiles) {
    const before = JSON.stringify(profile), html = parentCoachingPanel(profile);
    assert.ok(html.includes(profile.schoolContext.stage)); assert.ok(html.includes(profile.schoolContext.focus));
    assert.ok(!html.includes(profile.name)); assert.equal(JSON.stringify(profile), before);
    for (const text of ['Son petit profil', 'un seul objectif court', 'un modèle', 'Essayer ensemble', 'Réessayer seule', 'un autre jour', 'essai aidé', 'fatigue', 'ne changent pas les progrès automatiquement']) assert.ok(html.includes(text));
    assert.ok(!/<details[^>]*\sopen(?:\s|>)/.test(html));
  }
  for (const profile of [undefined, null, {}, {id:'p1'}, {id:'p2'}]) assert.ok(parentCoachingPanel(profile).includes('non précisé'));
  const unsafe = parentCoachingPanel({schoolContext:{stage:'<svg onload="bad()">', focus:'<script>bad()</script> & "objectif"'}});
  assert.ok(!unsafe.includes('<svg')); assert.ok(!unsafe.includes('<script>')); assert.ok(unsafe.includes('&lt;script&gt;')); assert.ok(unsafe.includes('&quot;objectif&quot;'));
});

test('parent references link to the official sources and clearly limit the scope of the guidance', () => {
  const html = parentCoachingPanel(), links = [...html.matchAll(/<a\b([^>]+)>/g)].map(match => match[1]);
  assert.equal(links.length, 4);
  const urls = links.map(attributes => {
    assert.match(attributes, /target="_blank"/); assert.match(attributes, /rel="noopener noreferrer"/);
    return new URL(attributes.match(/href="([^"]+)"/)[1]);
  });
  assert.ok(urls.every(url => url.protocol === 'https:' && ['www.quebec.ca', 'cdn-contenu.quebec.ca', 'www.ladoq.ca'].includes(url.hostname)));
  assert.ok(urls.some(url => url.pathname.endsWith('/mathematique'))); assert.ok(urls.some(url => url.pathname.endsWith('/francais-langue-enseignement')));
  assert.ok(urls.some(url => url.pathname.endsWith('/orthopedagogue'))); assert.ok(urls.some(url => url.pathname.endsWith('.pdf') && url.hash === '#page=5'));
  for (const text of ['Références pour l’adulte', 'programme complet', 'ni un diagnostic ni une évaluation orthopédagogique', 'ne certifient pas']) assert.ok(html.includes(text));
});

test('all panels are optional informational markup without answer submission or automatic progress controls', () => {
  for (const html of [numberCoachMarkup(56), wordCoachMarkup('lapin'), parentCoachingPanel()]) {
    assert.ok(!/<(?:script|form|input|button|audio|iframe)\b/.test(html));
    assert.ok(!/\s(?:onclick|onchange|oninput|data-action|data-result)=/.test(html));
  }
});
