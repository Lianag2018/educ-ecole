import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {GAMES,gameIds,choosePairs,recordRound,deck,isMatch,knownCount}=await import('../../src/memory-pairs.js');
test('les doubles de 1 à 9 et les compléments de 10 sont justes',()=>{
 for(const p of GAMES.doubles.pairs()){const n=Number(p.id.slice(1));assert.equal(p.a.big,`${n} + ${n}`);assert.equal(p.b.big,String(2*n));assert.ok(p.say.includes(`égale ${2*n}`));assert.ok(p.tip.length>10);}
 assert.equal(GAMES.doubles.pairs().length,9);
 for(const p of GAMES.complements.pairs()){assert.equal(Number(p.a.big)+Number(p.b.big),10);assert.equal(p.a.frame+p.b.frame,10);}
 assert.equal(GAMES.complements.pairs().length,6);assert.deepEqual(gameIds,['doubles','complements']);
});
test('un paquet contient chaque paire deux fois et seule la bonne paire se jumelle',()=>{
 const pairs=choosePairs('doubles','p2',5),d=deck(pairs);assert.equal(d.length,10);
 for(const p of pairs){const two=d.filter(c=>c.pid===p.id);assert.equal(two.length,2);assert.equal(isMatch(two[0],two[1]),true);assert.equal(isMatch(two[0],two[0]),false);}
 const a=d.find(c=>c.pid===pairs[0].id),b=d.find(c=>c.pid!==pairs[0].id);assert.equal(isMatch(a,b),false);
});
test('les paires oubliées reviennent d’abord, les retenues passent après; le niveau suit la réussite',()=>{
 const all=GAMES.complements.pairs();let lvl=recordRound('complements','p2',all.slice(0,3),new Set([all[0].id]));
 const next=choosePairs('complements','p2',3,()=>0).map(p=>p.id);
 assert.deepEqual(next,[all[3].id,all[4].id,all[5].id],'les cartes jamais vues passent avant celles déjà jouées');
 const rest=choosePairs('complements','p2',4,()=>0).map(p=>p.id);assert.equal(rest[3],all[0].id,'la carte ratée revient avant les réussies');
 assert.equal(lvl,4,'une partie presque parfaite monte d’un niveau');
 assert.equal(knownCount('p2','complements'),0);
 lvl=recordRound('complements','p2',all.slice(0,3),new Set());assert.equal(lvl,5);assert.equal(knownCount('p2','complements'),2,'deux fois réussies = retenues');
 for(let i=0;i<8;i++)lvl=recordRound('complements','p1',all,new Set());assert.equal(lvl,6,'le niveau ne dépasse pas le maximum');
 for(let i=0;i<8;i++)lvl=recordRound('complements','p3',all.slice(0,4),new Set(all.slice(0,4).map(p=>p.id)));assert.equal(lvl,3,'et ne descend pas sous le départ');
});
