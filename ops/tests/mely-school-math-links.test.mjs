import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../../src/engine.js';
import {schoolMathLinks,worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
test('Mely-Ann sees Nougat and Meteormath; Liana keeps CEC',()=>{
 const [mely,liana]=fresh().profiles;
 const home=worldHome(mely),book=ecranMely(),older=schoolMathLinks(liana);
 assert.match(home,/Retrouver 1·2·3 avec Nougat/);
 assert.match(book,/Ouvrir 1·2·3 avec Nougat/);
 assert.match(home,/meteormath-2/);
 assert.match(older,/MaZone CEC/);
 assert.doesNotMatch(older,/iplusinteractif/);
});
test('no school password is embedded in links',()=>{
 const [mely]=fresh().profiles;
 const markup=schoolMathLinks(mely)+ecranMely();
 assert.match(markup,/target="_blank" rel="noopener noreferrer"/);
 assert.doesNotMatch(markup,/type="password"|data-school-credential/);
});
