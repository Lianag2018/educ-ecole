import test from 'node:test';
import assert from 'node:assert/strict';
import {photoScope,photoInboxMarkup} from '../../src/school-photo-inbox.js';
test('Les photos sont séparées par profil et semaine avec des dates réelles',()=>{
 assert.notEqual(photoScope('p1','2026-10-26'),photoScope('p2','2026-10-26'));
 assert.notEqual(photoScope('p1','2026-10-26'),photoScope('p1','2026-11-02'));
 for(const [p,d] of [['p3','2026-10-26'],['p1','2026-02-30'],['p2','invalid']])assert.throws(()=>photoScope(p,d));
});
test('Le nom du profil dans le dossier photo est échappé',()=>{
 const html=photoInboxMarkup({name:'<img src=x onerror=alert(1)>'});
 assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('&lt;img'));
});
