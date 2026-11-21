// Sensibilité du micro : amplification numérique avant l'enregistrement (on ne peut pas changer le réglage matériel du micro).
// Le son passe par un gain puis un compresseur (pour ne pas saturer) avant d'être enregistré. Si l'appareil ne sait pas, on enregistre le micro tel quel.
export const MIC_GAINS=Object.freeze([[1,'Normale'],[3,'Forte'],[8,'Très forte']]);
const KEY='atelier-mots-mic-gain';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export const loadMicGain=()=>{const v=Number(store()?.getItem(KEY));return MIC_GAINS.some(g=>g[0]===v)?v:1;};
export function saveMicGain(v){if(MIC_GAINS.some(g=>g[0]===Number(v)))try{store()?.setItem(KEY,String(Number(v)));}catch{}}
export function openMic(stream,gain=1){
 const fallback={recordStream:stream,analyser:null,gain:1,amplified:false,close(){}};
 const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return fallback;
 let ctx;try{
  ctx=new C();const src=ctx.createMediaStreamSource(stream),g=ctx.createGain(),an=ctx.createAnalyser();g.gain.value=gain;an.fftSize=512;src.connect(g);g.connect(an);
  let rs=stream;
  if(gain>1&&ctx.createMediaStreamDestination){const dest=ctx.createMediaStreamDestination(),comp=ctx.createDynamicsCompressor?.();if(comp){comp.threshold.value=-12;comp.ratio.value=8;g.connect(comp);comp.connect(dest);}else g.connect(dest);rs=dest.stream;}
  return {recordStream:rs,analyser:an,gain,amplified:rs!==stream,close(){try{ctx.close();}catch{}}};
 }catch{try{ctx?.close?.();}catch{}return fallback;}
}
// Niveau instantané (crête 0..1) de l'analyseur.
export function levelOf(analyser,buf){if(!analyser)return 0;analyser.getFloatTimeDomainData(buf);let m=0;for(let i=0;i<buf.length;i++){const v=Math.abs(buf[i]);if(v>m)m=v;}return m;}
