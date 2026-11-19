import test from 'node:test';import assert from 'node:assert/strict';
import {coachTip} from '../../src/coach.js';
import {checkWord} from '../../src/magic-dictation.js';
const tip=(t,a)=>coachTip(t,a,checkWord(t,a).wrong);
test('le prof donne le conseil de la règle en cause',()=>{
 assert.match(tip('été','ete'),/accent aigu/);assert.match(tip('pomme','pome'),/jumeaux/);assert.match(tip('jambe','janbe'),/m et non n/);
 assert.match(tip('garçon','garcon'),/cédille/);assert.match(tip('photo','foto'),/ph/);assert.match(tip('château','chato'),/spectateurs/);
});
test('le conseil finit toujours par la méthode des syllabes pour un mot long',()=>{
 assert.match(tip('bibliothèque','bibliotek'),/bi-bli-o-thè-que/);assert.match(tip('table','tabl'),/ta-ble/);
});
test('un mot vide reçoit un conseil simple',()=>{assert.match(coachTip('chat',''),/lettre par lettre/);});
