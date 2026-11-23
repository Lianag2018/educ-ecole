import test from 'node:test';import assert from 'node:assert/strict';
import {stretchSamples,trimSilence,normalize,isStretchable,defaultStretchMs,STOP_SOUNDS} from '../../src/sound-stretch.js';
const RATE=44100;
const noise=(ms,amp=0.5)=>Float32Array.from({length:Math.round(RATE*ms/1000)},(_,i)=>amp*Math.sin(i*0.37)*Math.cos(i*0.011));
test('un « ch » de 0,34 s est étiré à environ 1 seconde, sans trou ni dépassement',()=>{
 const src=noise(340),out=stretchSamples(src,RATE,1000);
 assert.ok(Math.abs(out.length/RATE-1)<0.02,'durée '+out.length/RATE);
 let peak=0,nan=0;for(const v of out){peak=Math.max(peak,Math.abs(v));if(!Number.isFinite(v))nan++;}
 assert.equal(nan,0);assert.ok(peak<=1.0001);
 // pas de silence au milieu : l'énergie reste présente partout
 const w=Math.round(RATE*0.1);for(let s=0;s+w<out.length-w;s+=w){let e=0;for(let i=s;i<s+w;i++)e+=out[i]*out[i];assert.ok(e/w>0.005,'trou à '+s/RATE);}
});
test('un son déjà long reste tel quel; les bornes de durée sont respectées',()=>{
 const src=noise(1500);assert.equal(stretchSamples(src,RATE,1000).length,src.length);
 assert.ok(stretchSamples(noise(200),RATE,99999).length/RATE<=2.02);assert.ok(stretchSamples(noise(200),RATE,1).length/RATE>=0.25);
});
test('les consonnes qui éclatent (p b t d k g) ne s\'étirent pas',()=>{
 for(const id of STOP_SOUNDS){assert.equal(isStretchable(id),false);assert.equal(defaultStretchMs(id),0);}
 for(const id of ['ch','s','z','m','r'])assert.equal(defaultStretchMs(id),1000);
 for(const id of ['a','e','i','ou','on','an','eacute','y','w'])assert.equal(isStretchable(id),false,id+' est une voyelle : jouée telle qu’enregistrée, sans répétition');
});
test('on retire le silence autour d\'un enregistrement et on le normalise',()=>{
 const body=noise(200,0.5),src=new Float32Array(RATE);src.set(body,Math.round(RATE*0.3));
 const t=trimSilence(src,RATE);assert.ok(t.length<RATE*0.3&&t.length>body.length*0.9);
 const n=normalize(Float32Array.from([0.1,-0.2,0.05]));assert.ok(Math.abs(Math.abs(n[1])-0.9)<1e-6);
});
