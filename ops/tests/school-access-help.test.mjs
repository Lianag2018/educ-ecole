import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fresh} from '../../src/engine.js';
import {worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
import {SCHOOL_HELP,showSchoolHelp} from '../../src/school-access-help.js';
test('the correct official login guide appears for each profile',()=>{
 const [young,older]=fresh().profiles;
 assert.match(worldHome(young),/data-school-help="nougat"/);
 assert.match(ecranMely(),/data-school-help="nougat"/);
 assert.match(worldHome(older),/data-school-help="cec"/);
 assert.doesNotMatch(worldHome(older),/data-school-help="nougat"/);
 assert.equal(SCHOOL_HELP.nougat.fields.length,3);
 assert.equal(SCHOOL_HELP.cec.fields.length,2);
});
test('school help is parent gated and never collects student passwords',()=>{
 assert.equal(showSchoolHelp('nougat',{gate:()=>false}),false);
 assert.equal(showSchoolHelp('missing',{gate:()=>true}),false);
 const source=readFileSync(new URL('../../src/school-access-help.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/createElement\('input'\)|localStorage|sessionStorage|fetch\(/);
 assert.match(source,/dialog\.showModal\(\)/);
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/showSchoolHelp\(a\.dataset\.schoolHelp,\{gate:parentAdditionGate\}\)/);
});
