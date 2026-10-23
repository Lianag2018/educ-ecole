import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../../src/engine.js';
import {worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
test('Mely-Ann and Liana have direct official school links without blockers',()=>{
 const [young,older]=fresh().profiles;
 const home=worldHome(young),book=ecranMely(),liana=worldHome(older);
 for(const markup of [home,book]){
  assert.match(markup,/https:\/\/www\.iplusinteractif\.com\/primaire\/login\?lang=fr_CA/);
  assert.match(markup,/target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(markup,/data-school-help|data-school-login/);
 }
 assert.match(liana,/https:\/\/app\.mazonecec\.com\/login/);
 assert.doesNotMatch(liana,/data-school-help|data-school-login/);
});
test('school links navigate directly while the microphone still requires parent approval',()=>{
 const src=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(src,/\[data-school-resource\]/);
 assert.doesNotMatch(src,/showSchoolHelp\(|openSchoolLogin\(/);
 assert.match(src,/parentAdditionGate\(\)/);
 assert.match(src,/if\(!parentAdditionGate\(\)\)/);
});
