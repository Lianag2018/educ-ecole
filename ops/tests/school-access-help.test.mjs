import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../../src/engine.js';
import {worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
import {SCHOOL_HELP,showSchoolHelp} from '../../src/school-access-help.js';
test('each child gets her own photo-viewing link',()=>{
 const [young,older]=fresh().profiles;
 assert.match(worldHome(young),/data-school-help="nougat"/);
 assert.match(ecranMely(),/data-school-help="nougat"/);
 assert.match(worldHome(older),/data-school-help="cec"/);
 assert.doesNotMatch(worldHome(older),/data-school-help="nougat"/);
 assert.match(SCHOOL_HELP.nougat.url,/iplusinteractif/);
 assert.match(SCHOOL_HELP.cec.url,/mazonecec/);
});
test('photo stays on device and no second parental prompt blocks access',()=>{
 assert.equal(showSchoolHelp('missing'),false);
 const src=readFileSync(new URL('../../src/school-access-help.js',import.meta.url),'utf8');
 assert.match(src,/reader\.readAsDataURL\(selected\)/);
 assert.match(src,/photoData=null/);
 assert.match(src,/photoWindow\?\.close\(\)/);
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|createElement\('input'\).*password/);
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/showSchoolHelp\(a\.dataset\.schoolHelp\)/);
 assert.doesNotMatch(app,/showSchoolHelp\(a\.dataset\.schoolHelp,\{gate:parentAdditionGate\}\)/);
});
