import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {nadonWords,giassonWords,wordsForChild,pickRound,recordRound,ROUND,PASS}=await import('../../src/word-challenge.js');
test('listes sans doublons et plus complètes pour la plus grande',()=>{assert.equal(new Set(nadonWords).size,nadonWords.length);assert.ok(nadonWords.length>=100);assert.ok(giassonWords.includes('vouloir'));assert.ok(wordsForChild(true).length>wordsForChild(false).length);assert.ok(wordsForChild(true).includes('vouloir')&&!wordsForChild(false).includes('vouloir'));assert.ok(!nadonWords.some(w=>/'$/.test(w)));});
test('un tour de 10 mots, les mots ratés reviennent en premier',()=>{const r=pickRound(nadonWords,{known:{},missed:['chat','livre']});assert.equal(r.length,ROUND);assert.deepEqual(r.slice(0,2),['chat','livre']);assert.equal(new Set(r).size,ROUND);});
test('étoile seulement si assez de mots, maximum 3 tours par jour',()=>{const ok=Array.from({length:10},(_,i)=>[nadonWords[i],true]),bad=ok.map((x,i)=>[x[0],i<PASS-1]);
 assert.equal(recordRound('p1',bad,'2026-11-20').star,false);
 for(let i=0;i<3;i++)assert.equal(recordRound('p1',ok,'2026-11-20').star,true);
 assert.equal(recordRound('p1',ok,'2026-11-20').star,false);assert.equal(recordRound('p2',ok,'2026-11-20').star,true);});
