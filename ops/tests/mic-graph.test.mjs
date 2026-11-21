import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {MIC_GAINS,loadMicGain,saveMicGain,openMic,levelOf}=await import('../../src/mic-graph.js');
test('trois sensibilités, mémorisées sur l’appareil, jamais une valeur inconnue',()=>{
 assert.deepEqual(MIC_GAINS.map(g=>g[1]),['Normale','Forte','Très forte']);assert.equal(loadMicGain(),1);
 saveMicGain(8);assert.equal(loadMicGain(),8);saveMicGain(99);assert.equal(loadMicGain(),8);localStorage.setItem('atelier-mots-mic-gain','abc');assert.equal(loadMicGain(),1);
});
test('sans Web Audio, le micro est enregistré tel quel (pas de plantage)',()=>{
 const stream={id:'s'},m=openMic(stream,8);assert.equal(m.recordStream,stream);assert.equal(m.amplified,false);assert.equal(m.analyser,null);m.close();assert.equal(levelOf(null,new Float32Array(4)),0);
});
