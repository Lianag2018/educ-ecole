import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh} from '../../src/engine.js';
import {schoolMathLinks,worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
test('Mely-Ann has Nougat and Meteormath in her 1st-grade maths tools',()=>{
 const [mely,liana]=fresh().profiles;
 const home=worldHome(mely),workbook=ecranMely();
 for(const text of ['https://ipluseleve.ca/','meteormath-2','1re année'])assert.ok((home+workbook).includes(text),text);
 assert.match(home,/Retrouver 1·2·3 avec Nougat/);
 assert.match(workbook,/Ouvrir 1·2·3 avec Nougat/);
 assert.doesNotMatch(home,/tables de 1 à 6, selon le plan du 19 au 23 octobre/);
 assert.match(home,/aucun mot de passe scolaire n'est enregistré/i);
 assert.match(schoolMathLinks(liana),/Météormath 2/);
 assert.match(schoolMathLinks(liana),/MaZone CEC/);
 assert.doesNotMatch(schoolMathLinks(liana),/ipluseleve/);
});
test('school links open safely without embedding student credentials',()=>{
 const [mely]=fresh().profiles;
 const markup=schoolMathLinks(mely)+ecranMely();
 assert.match(markup,/target="_blank" rel="noopener noreferrer"/);
 assert.doesNotMatch(markup,/402059|Nom d.utilisateur\s*:\s*10|Mot de passe\s*:/);
});
