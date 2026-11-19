import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {checkPin,setPin}=await import('../../src/pin-gate.js');
test('codes par défaut des deux filles',async()=>{assert.equal(await checkPin(0,'1302'),true);assert.equal(await checkPin(1,'1111'),true);assert.equal(await checkPin(0,'1111'),false);assert.equal(await checkPin(1,'1302'),false);});
test('un code changé remplace le défaut',async()=>{assert.equal(await setPin(1,'2468'),true);assert.equal(await checkPin(1,'2468'),true);assert.equal(await checkPin(1,'1111'),false);assert.equal(await setPin(1,'12'),false);});
