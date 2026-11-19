// Sons de la fête, fabriqués par le navigateur (aucun fichier audio) : cadeau qui tremble, éclat, fanfare, feux d'artifice, avion qui passe.
// Le temps est calé sur l'animation (src/simple-navigation.css) : éclat à 1,7 s, feux dès 2,3 s, avion dès 3,2 s.
const KEY='atelier-mots-party-sound';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export const partyMuted=()=>store()?.getItem(KEY)==='off';
export function setPartyMuted(off){try{store()?.setItem(KEY,off?'off':'on');}catch{}}
export const MASTER_VOLUME=.5;
// Planifie tout le son sur un contexte (en direct ou hors ligne). Renvoie la durée planifiée, en secondes.
export function scheduleParty(ctx,dest,{tier=1,delays=[0,.8,1.6],gift=false,seed=7}={}){
 const t0=ctx.currentTime+.05;let rnd=seed;const rand=()=>{rnd=(rnd*16807)%2147483647;return rnd/2147483647;};
 const rate=ctx.sampleRate||44100,nbuf=ctx.createBuffer(1,rate,rate),nd=nbuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=rand()*2-1;
 const at=s=>t0+s;
 const env=(g,t,dur,vol,a=.01)=>{g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+Math.max(a+.01,dur));};
 const tone=(type,f,s,dur,vol,{to=null,lp=null,a=.01,pan=null}={})=>{
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,at(s));if(to)o.frequency.exponentialRampToValueAtTime(to,at(s+dur));
  env(g,at(s),dur,vol,a);let n=o;if(lp){const b=ctx.createBiquadFilter();b.type='lowpass';b.frequency.value=lp;n.connect(b);n=b;}
  n.connect(g);g.connect(dest);o.start(at(s));o.stop(at(s+dur+.05));};
 const noise=(s,dur,vol,{lp=null,hp=null,band=null,a=.004}={})=>{
  const src=ctx.createBufferSource(),g=ctx.createGain();src.buffer=nbuf;src.loop=true;env(g,at(s),dur,vol,a);let n=src;
  for(const [type,f] of [['lowpass',lp],['highpass',hp],['bandpass',band]])if(f){const b=ctx.createBiquadFilter();b.type=type;b.frequency.value=f;n.connect(b);n=b;}
  n.connect(g);g.connect(dest);src.start(at(s));src.stop(at(s+dur+.05));};
 // 1) le cadeau tremble : petits tics de plus en plus rapprochés et sifflement qui monte
 [.25,.55,.8,1,1.18,1.33,1.46,1.56,1.64,1.69].forEach(s=>noise(s,.05,.22,{band:2600}));
 {const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(300,at(.3));o.frequency.exponentialRampToValueAtTime(1500,at(1.68));
  g.gain.setValueAtTime(.0001,at(.3));g.gain.linearRampToValueAtTime(.09,at(1.4));g.gain.exponentialRampToValueAtTime(.0001,at(1.72));o.connect(g);g.connect(dest);o.start(at(.3));o.stop(at(1.75));}
 // 2) l'éclat : pop, paillettes
 noise(1.7,.14,.5,{lp:3500});tone('sine',900,1.7,.2,.5,{to:80});
 for(let i=0;i<14;i++)tone('sine',1800+rand()*2400,1.76+i*.07,.12,.08);
 // 3) fanfare (trompettes) sur accord de do majeur; plus longue aux niveaux 2 et 3
 const trumpet=(f,s,d,v=.2)=>{tone('sawtooth',f,s,d,v,{lp:2600,a:.03});tone('square',f*2,s,d,v*.25,{lp:2000,a:.03});};
 [[392,1.8,.16],[523,1.97,.16],[659,2.14,.16],[784,2.31,.75]].forEach(([f,s,d])=>trumpet(f,s,d));
 [262,330,392].forEach(f=>tone('triangle',f,2.31,1,.07,{a:.05}));
 if(tier>=2){[[659,3.15,.14],[784,3.3,.14],[1047,3.45,.9]].forEach(([f,s,d])=>trumpet(f,s,d,.2));[523,659,784].forEach(f=>tone('triangle',f,3.45,1,.06,{a:.05}));}
 if(tier>=3){tone('sine',90,1.7,.6,.55,{to:45});tone('sine',90,3.45,.6,.5,{to:45});noise(1.75,.9,.12,{hp:6000,a:.01});noise(3.5,1,.12,{hp:6000,a:.01});}
 // 4) feux d'artifice : un « boum » grave et des crépitements, au rythme des éclats
 for(let k=0;k<6;k++)delays.forEach(d=>{const s=2.3+d+k*2.8+.3;if(s>20)return;
  tone('sine',130,s,.45,.38,{to:35});noise(s,.28,.22,{lp:900});
  for(let j=0;j<7;j++)noise(s+.14+j*.09+rand()*.05,.03,.07,{hp:3500});});
 // 5) l'avion qui passe : ronronnement qui traverse de gauche à droite
 if(ctx.createStereoPanner){const o=ctx.createOscillator(),lp=ctx.createBiquadFilter(),g=ctx.createGain(),pan=ctx.createStereoPanner();
  o.type='sawtooth';o.frequency.setValueAtTime(92,at(3.2));o.frequency.linearRampToValueAtTime(84,at(11));lp.type='lowpass';lp.frequency.value=520;
  g.gain.setValueAtTime(.0001,at(3.2));g.gain.linearRampToValueAtTime(.06,at(5));g.gain.linearRampToValueAtTime(.06,at(9));g.gain.linearRampToValueAtTime(.0001,at(11));
  pan.pan.setValueAtTime(-1,at(3.2));pan.pan.linearRampToValueAtTime(1,at(11));o.connect(lp);lp.connect(g);g.connect(pan);pan.connect(dest);o.start(at(3.2));o.stop(at(11.1));}
 return 20;
}
// En direct. Renvoie { stop, resume, muted }.
export function startPartySound(opts={}){
 const noop={stop(){},resume(){},muted:true};
 const C=globalThis.AudioContext||globalThis.webkitAudioContext;const muted=opts.muted===undefined?partyMuted():opts.muted;if(!C||muted)return noop;
 let ctx;try{ctx=new C();}catch{return noop;}
 const out=ctx.createGain();out.gain.value=MASTER_VOLUME;let dest=out;
 if(ctx.createDynamicsCompressor){const c=ctx.createDynamicsCompressor();out.connect(c);c.connect(ctx.destination);}else out.connect(ctx.destination);
 try{ctx.resume?.();scheduleParty(ctx,dest,opts);}catch{try{ctx.close?.();}catch{}return noop;}
 return {muted:false,
  resume(){try{if(ctx.state==='suspended')ctx.resume();}catch{}},
  stop(){try{out.gain.setTargetAtTime(0,ctx.currentTime,.05);}catch{}setTimeout(()=>{try{ctx.close?.();}catch{}},400);}};
}
