import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {parseSubject,saveLessons,lessonsFor,SUBJECTS}=await import('../../src/subjects.js');
test('trois matières, avec leur langue',()=>{assert.deepEqual(SUBJECTS.map(s=>s.id),['english','history','science']);assert.equal(SUBJECTS[0].lang,'en-US');});
test('un fichier de matière devient des leçons, avec phrases anglaises et questions',()=>{
 const r=parseSubject('# Anglais\npour: Liana\n## Les couleurs\nOn apprend les couleurs.\nen: red, blue, green\n? Comment dit-on « rouge » ? | red | blue | green\n? mal fait | seulement\n## Vide\n');
 assert.equal(r.subject,'english');assert.deepEqual(r.pids,['p2']);assert.equal(r.lessons.length,1);
 const l=r.lessons[0];assert.equal(l.title,'Les couleurs');assert.equal(l.paras.length,2);assert.equal(l.paras[1].en,true);assert.equal(l.quiz.length,1);assert.equal(l.quiz[0].a,'red');assert.deepEqual(l.quiz[0].w,['blue','green']);
});
test('le contenu est gardé par fille et par matière',()=>{
 const r=parseSubject('# Sciences\n## Les plantes\nUne plante a des racines.\n');assert.equal(r.subject,'science');assert.deepEqual(r.pids,['p1','p2']);
 saveLessons('science',['p1'],r.lessons);assert.equal(lessonsFor('science','p1').length,1);assert.equal(lessonsFor('science','p2').length,0);assert.equal(lessonsFor('history','p1').length,0);
});
