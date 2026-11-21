import test from 'node:test';import assert from 'node:assert/strict';
globalThis.localStorage={_:{},getItem(k){return this._[k]??null},setItem(k,v){this._[k]=String(v)}};
const {denoise,encodeWav,DENOISE_LEVELS,loadDenoise,saveDenoise}=await import('../../src/denoise.js');
let seed=1;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296-.5;};
const rms=(a,i,j)=>{let s=0;for(let k=i;k<j;k++)s+=a[k]*a[k];return Math.sqrt(s/(j-i));};
// 3 s : bruit de pièce (souffle) partout, voix (voyelle à 300 Hz + harmoniques) de 1 s à 2 s
function signal(rate=44100){const n=rate*3,s=new Float32Array(n);for(let i=0;i<n;i++){s[i]=rnd()*0.06;if(i>=rate&&i<2*rate){const t=i/rate;s[i]+=0.3*Math.sin(2*Math.PI*300*t)+0.15*Math.sin(2*Math.PI*600*t)+0.08*Math.sin(2*Math.PI*900*t);}}return s;}
test('le bruit de la pièce baisse nettement, la voix reste',()=>{
 const rate=44100,s=signal(rate),d=denoise(s,rate,1.5);assert.equal(d.length,s.length);
 const before=rms(s,0,rate-2000),after=rms(d,0,rate-2000);
 assert.ok(after<before*0.45,`bruit seul : ${before.toFixed(4)} → ${after.toFixed(4)} (au moins −7 dB)`);
 const v0=rms(s,rate+4000,2*rate-4000),v1=rms(d,rate+4000,2*rate-4000);assert.ok(v1>v0*0.8,`voix conservée : ${v0.toFixed(3)} → ${v1.toFixed(3)}`);
 const strong=denoise(s,rate,3);assert.ok(rms(strong,0,rate-2000)<=after+1e-9,'« Forte » enlève au moins autant que « Normale »');
});
test('sans réduction ou son trop court, rien ne change; WAV valide; réglage mémorisé',()=>{
 const s=Float32Array.from({length:5000},(_,i)=>Math.sin(i/10)*0.3);assert.deepEqual(Array.from(denoise(s,44100,0)),Array.from(s));assert.equal(denoise(new Float32Array(500),44100,3).length,500);
 const w=new DataView(encodeWav(s,44100));assert.equal(String.fromCharCode(w.getUint8(0),w.getUint8(1),w.getUint8(2),w.getUint8(3)),'RIFF');assert.equal(w.getUint32(24,true),44100);assert.equal(w.getUint32(40,true),10000);
 assert.deepEqual(DENOISE_LEVELS.map(l=>l[1]),['Aucune','Normale','Forte']);assert.equal(loadDenoise(),1.5);saveDenoise(3);assert.equal(loadDenoise(),3);saveDenoise(0);assert.equal(loadDenoise(),0);saveDenoise(7);assert.equal(loadDenoise(),0);
});
