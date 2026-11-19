import test from 'node:test';import assert from 'node:assert/strict';
import {trickEntries,trickBookMarkup,trickPages,firstPageToShow} from '../../src/trick-book.js';
import {markJourney} from '../../src/journey.js';
const mely={id:'p1',schoolContext:{stage:'1re année'}},liana={id:'p2',schoolContext:{stage:'3e année'}};
test('les trucs sont cachés tant que l\'aventure n\'est pas terminée, puis découverts',()=>{
 const p={...mely};let e=trickEntries(p);assert.ok(e.length>=36);assert.equal(e.filter(x=>x.found).length,0);
 assert.match(trickBookMarkup(p,0),/🔒/);assert.doesNotMatch(trickBookMarkup(p,0),/data-trick-read/);
 markJourney(p,'story:eacute','2026-11-19');e=trickEntries(p);assert.equal(e.filter(x=>x.found).length,1);
 assert.match(trickBookMarkup(p,0),/data-trick-read/);assert.match(trickBookMarkup(p,0),/1 \/ \d+ trucs/);
 assert.equal(firstPageToShow(e),0);assert.ok(trickPages(e)>=9);
});
test('Liana reçoit aussi les trucs des mystères d\'orthographe',()=>{
 const p={...liana};markJourney(p,'lab:bdpq','2026-11-19');const f=trickEntries(p).filter(x=>x.found);assert.equal(f.length,3);assert.match(f[0].title,/poings/);
});
