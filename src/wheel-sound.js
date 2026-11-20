// Sons de la roue : tic-tic qui ralentit comme une vraie machine à sous, ronron qui descend, puis « ding » et petite fanfare.
// Fabriqués par le navigateur (Web Audio), aucun fichier. Suit le même interrupteur que les sons de fête.
import {partyMuted,MASTER_VOLUME} from './party-sound.js';
// Courbe de la roue dans le CSS : cubic-bezier(.12,.75,.12,1). Sert à placer chaque tic au bon moment.
function bezier(x1,y1,x2,y2){const cx=3*x1,bx=3*(x2-x1)-cx,ax=1-cx-bx,cy=3*y1,by=3*(y2-y1)-cy,ay=1-cy-by;
 const X=t=>((ax*t+bx)*t+cx)*t,Y=t=>((ay*t+by)*t+cy)*t;
 return x=>{let lo=0,hi=1;for(let i=0;i<40;i++){const m=(lo+hi)/2;X(m)<x?lo=m:hi=m;}return Y((lo+hi)/2);};}
export const SPIN_EASE=bezier(.12,.75,.12,1);
// Instants (en secondes) où le rouleau passe devant chacune de ses `count` activités.
export function tickTimes(count,seconds=3.4){
 const out=[];for(let k=1;k<=count;k++){const target=k/count;let lo=0,hi=1;for(let i=0;i<40;i++){const m=(lo+hi)/2;SPIN_EASE(m)<target?lo=m:hi=m;}out.push(+(((lo+hi)/2)*seconds).toFixed(4));}
 return out;
}
export function startWheelSound({count=22,seconds=3.4,muted}={}){
 const noop={stop(){},resume(){},muted:true};
 const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C||(muted===undefined?partyMuted():muted))return noop;
 let ctx;try{ctx=new C();}catch{return noop;}
 const out=ctx.createGain();out.gain.value=MASTER_VOLUME;
 if(ctx.createDynamicsCompressor){const c=ctx.createDynamicsCompressor();out.connect(c);c.connect(ctx.destination);}else out.connect(ctx.destination);
 const t0=ctx.currentTime+.05;
 const tone=(type,f,at,len,vol,f2)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t0+at);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+at+len);
  g.gain.setValueAtTime(.0001,t0+at);g.gain.exponentialRampToValueAtTime(vol,t0+at+.006);g.gain.exponentialRampToValueAtTime(.0001,t0+at+len);o.connect(g);g.connect(out);o.start(t0+at);o.stop(t0+at+len+.02);};
 try{ctx.resume?.();
  // ronron de moteur qui descend pendant que la roue ralentit
  const motor=ctx.createOscillator(),mg=ctx.createGain(),lp=ctx.createBiquadFilter();motor.type='sawtooth';lp.type='lowpass';lp.frequency.value=420;
  motor.frequency.setValueAtTime(150,t0);motor.frequency.exponentialRampToValueAtTime(45,t0+seconds);mg.gain.setValueAtTime(.0001,t0);mg.gain.exponentialRampToValueAtTime(.05,t0+.15);mg.gain.exponentialRampToValueAtTime(.0001,t0+seconds);
  motor.connect(lp);lp.connect(mg);mg.connect(out);motor.start(t0);motor.stop(t0+seconds+.05);
  // tic-tic : un par activité qui défile
  tickTimes(count,seconds).forEach((at,k)=>tone('square',k%2?1250:1050,at,.045,.16));
  // arrêt : « ding » puis petite fanfare do-mi-sol-do
  tone('sine',1318,seconds,1.1,.28);tone('sine',1976,seconds,.9,.14);
  [523,659,784,1047].forEach((f,i)=>tone('triangle',f,seconds+.28+i*.13,.35,.2));
 }catch{try{ctx.close?.();}catch{}return noop;}
 return {muted:false,resume(){try{if(ctx.state==='suspended')ctx.resume();}catch{}},stop(){try{out.gain.setTargetAtTime(0,ctx.currentTime,.05);}catch{}setTimeout(()=>{try{ctx.close?.();}catch{}},500);}};
}
