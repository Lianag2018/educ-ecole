import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SCHOOL_LOGINS,openSchoolLogin} from '../../src/school-login.js';
import {fresh} from '../../src/engine.js';
import {worldHome} from '../../src/worlds.js';
import {ecranMely} from '../../src/mely-grade1.js';
test('school logins are distinct and have no embedded credentials',()=>{
 const [young,older]=fresh().profiles;
 const first=worldHome(young),second=worldHome(older);
 assert.match(first,/data-school-login="nougat"/);
 assert.match(second,/data-school-login="cec"/);
 assert.doesNotMatch(second,/data-school-login="nougat"/);
 assert.match(ecranMely(),/data-school-login="nougat"/);
 assert.deepEqual(SCHOOL_LOGINS.nougat.fields.map(x=>x[0]),['group','username','password']);
 assert.deepEqual(SCHOOL_LOGINS.cec.fields.map(x=>x[0]),['username','password']);
 assert.equal(SCHOOL_LOGINS.nougat.url,'https://www.iplusinteractif.com/primaire/login?lang=fr_CA');
 assert.ok(SCHOOL_LOGINS.nougat.fields.every(field=>field.length===2));
});
test('no popup without parent confirmation and no credentials persisted',()=>{
 assert.equal(openSchoolLogin('nougat',{gate:()=>false}),false);
 assert.equal(openSchoolLogin('unknown',{gate:()=>true}),false);
 const src=readFileSync(new URL('../../src/school-login.js',import.meta.url),'utf8');
 assert.doesNotMatch(src,/localStorage|sessionStorage|fetch\(|XMLHttpRequest|persist\(/);
 assert.match(src,/dialog\.showModal\(\)/);
 assert.match(src,/dialog\.addEventListener\('close'/);
});
test('links use a parent gate instead of navigating directly',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/e\.preventDefault\(\);cleanup\(\);openSchoolLogin\(a\.dataset\.schoolLogin,\{gate:parentAdditionGate\}\)/);
});
