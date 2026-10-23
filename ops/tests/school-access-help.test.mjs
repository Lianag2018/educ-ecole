import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../../src/engine.js';
import {worldHome,schoolMathLinks} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
test('one tap opens official Nougat and CEC login, no photo dialog or parent gate',()=>{
 const [young,older]=fresh().profiles;
 for(const markup of [worldHome(young),ecranMely()]){
  assert.match(markup,/https:\/\/www\.iplusinteractif\.com\/primaire\/login\?lang=fr_CA/);
  assert.match(markup,/target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(markup,/data-school-help|data-school-login/);
 }
 const olderLinks=schoolMathLinks(older);
 assert.match(olderLinks,/app\.mazonecec\.com\/login/);
 assert.doesNotMatch(olderLinks,/data-school-help|data-school-login/);
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/\[data-school-resource\]/);
 assert.doesNotMatch(app,/showSchoolHelp\(|openSchoolLogin\(/);
 assert.match(app,/parentAdditionGate\(\)/);
});
test('no student credentials embedded in school links',()=>{
 const [young]=fresh().profiles;
 const markup=worldHome(young)+ecranMely();
 assert.doesNotMatch(markup,/type="password"|data-school-credential/);
});
