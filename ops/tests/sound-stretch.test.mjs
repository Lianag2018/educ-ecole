import test from 'node:test';import assert from 'node:assert/strict';
import {stretchSamples,stretchVowel,trimSilence,normalize,isStretchable,defaultStretchMs,STOP_SOUNDS} from '../../src/sound-stretch.js';
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
 for(const id of ['a','e','i','ou','on','an'])assert.equal(defaultStretchMs(id),1000,id+' : les voyelles sont allongées à 1 s');
});
test('on retire le silence autour d\'un enregistrement et on le normalise',()=>{
 const body=noise(200,0.5),src=new Float32Array(RATE);src.set(body,Math.round(RATE*0.3));
 const t=trimSilence(src,RATE);assert.ok(t.length<RATE*0.3&&t.length>body.length*0.9);
 const n=normalize(Float32Array.from([0.1,-0.2,0.05]));assert.ok(Math.abs(Math.abs(n[1])-0.9)<1e-6);
});

// Voyelle synthétique courte : porteuse de 180 Hz avec une enveloppe en cloche (comme « e » ou « ou » enregistrés).
const vowel=(ms=480,rate=44100)=>{const n=Math.round(rate*ms/1000),x=new Float32Array(n);for(let i=0;i<n;i++){const t=i/n,env=Math.sin(Math.PI*t)**1.5;x[i]=0.8*env*(Math.sin(2*Math.PI*180*i/rate)+0.4*Math.sin(2*Math.PI*360*i/rate+0.5)+0.2*Math.sin(2*Math.PI*540*i/rate+1));}return x;};
test('une voyelle est étirée en continu à la durée demandée, sans valeur invalide ni saut brusque',()=>{
 const x=vowel(),out=stretchVowel(x,44100,1000);
 assert.ok(Math.abs(out.length/44100-1)<0.01,'durée 1 s');assert.ok(out.every(Number.isFinite));
 const peak=Math.max(...out.map(Math.abs));assert.ok(peak<=1.05&&peak>0.3,'volume raisonnable');
 let jump=0;for(let i=1;i<out.length;i++)jump=Math.max(jump,Math.abs(out[i]-out[i-1]));assert.ok(jump/peak<0.25,'pas de coupure : '+jump/peak);
});
test('l’étirement continu suit l’enveloppe du son d’origine (pas de pulsation « e-e-e »)',()=>{
 const R=44100,x=vowel(),out=stretchVowel(x,R,1000);
 const env=(y,b)=>{const o=[];for(let i=0;i+b<=y.length;i+=b){let s=0;for(let j=0;j<b;j++)s+=y[i+j]*y[i+j];o.push(Math.sqrt(s/b));}return o;};
 const a=env(x,441),b=env(out,441),ideal=Array.from({length:b.length},(_,i)=>{const t=i*(a.length-1)/(b.length-1),k=Math.floor(t),f=t-k;return a[k]*(1-f)+a[Math.min(k+1,a.length-1)]*f;});
 const m=v=>v.reduce((s,q)=>s+q,0)/v.length,ma=m(b),mi=m(ideal);let sab=0,sa=0,sb=0;for(let i=0;i<b.length;i++){sab+=(b[i]-ma)*(ideal[i]-mi);sa+=(b[i]-ma)**2;sb+=(ideal[i]-mi)**2;}
 assert.ok(sab/Math.sqrt(sa*sb)>0.9,'l’enveloppe suit celle de l’original étiré : '+(sab/Math.sqrt(sa*sb)).toFixed(2));
});
test('un son déjà assez long ou trop court pour l’étirement continu reste sain',()=>{
 const x=vowel(480);assert.equal(stretchVowel(x,44100,300).length,x.length);
 const tiny=new Float32Array(100).fill(0.2);assert.ok(stretchVowel(tiny,44100,1000).every(Number.isFinite));
});
