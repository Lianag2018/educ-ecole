// Étirer un son enregistré (par exemple « chhhh ») pour qu'il dure environ une seconde et soit reconnaissable.
// On garde le début et la fin du son tels quels et on répète le milieu avec un fondu enchaîné : pas de changement de hauteur ni de « robot ».
export const STOP_SOUNDS=Object.freeze(['p','b','t','d','k','g']);
export const DEFAULT_STRETCH_MS=1000,MIN_STRETCH_MS=300,MAX_STRETCH_MS=2000;
// Deux façons d'allonger un son : les sons réguliers (« chhhh », « ssss », « mmmm ») répètent leur milieu avec un fondu (invisible à l'oreille);
// les voyelles (e, ou, a, i, on…) sont étirées en continu, sans répéter un morceau (stretchVowel) : on n'entend plus « e-e-e ».
export const STEADY_SOUNDS=Object.freeze(['ch','s','z','j','f','v','m','n','r','l']);
export const isStretchable=id=>!STOP_SOUNDS.includes(id);
export const defaultStretchMs=id=>isStretchable(id)?DEFAULT_STRETCH_MS:0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
// Retire le silence au début et à la fin (utile pour les enregistrements de la famille).
// Seuil relatif : un enregistrement faible (micro d'iPhone) ne doit jamais être coupé en entier. Le seuil ne dépasse pas 6 % de la crête.
export function peakOf(samples){let m=0;for(let i=0;i<samples.length;i++){const v=Math.abs(samples[i]);if(v>m)m=v;}return m;}
// Un son est « vide » si sa crête est presque nulle (micro coupé) ou s'il dure moins de 0,25 s.
export const SILENT_PEAK=0.003;
export const isEmptyTake=(samples,rate)=>peakOf(samples)<SILENT_PEAK||samples.length/rate<0.25;
export function trimSilence(samples,rate,{threshold=0.02,keepMs=15}={}){
 threshold=Math.min(threshold,Math.max(1e-5,peakOf(samples)*0.06));
 let a=0,b=samples.length-1;
 while(a<b&&Math.abs(samples[a])<threshold)a++;
 while(b>a&&Math.abs(samples[b])<threshold)b--;
 const keep=Math.round(rate*keepMs/1000);a=Math.max(0,a-keep);b=Math.min(samples.length-1,b+keep);
 return samples.slice(a,b+1);
}
export function normalize(samples,peak=0.9){
 let m=0;for(const v of samples)m=Math.max(m,Math.abs(v));
 if(!m)return samples;const g=peak/m,out=new Float32Array(samples.length);for(let i=0;i<samples.length;i++)out[i]=samples[i]*g;return out;
}
export function stretchSamples(samples,rate,targetMs){
 const n=samples.length,targetN=Math.round(rate*clamp(targetMs,MIN_STRETCH_MS,MAX_STRETCH_MS)/1000);
 if(n<8||n>=targetN)return Float32Array.from(samples);
 const a=Math.floor(n*0.30),b=Math.floor(n*0.70),L=Math.max(1,b-a),X=Math.max(1,Math.min(Math.floor(L*0.4),Math.floor(rate*0.03)));
 const out=new Float32Array(targetN+L+n);let len=0;
 const put=(src,from,to,fade)=>{ // ajoute src[from,to) avec fondu enchaîné sur les X premiers échantillons
  const m=Math.min(fade?X:0,len,to-from);
  for(let i=0;i<m;i++){const t=(i+1)/(m+1),g1=Math.cos(t*Math.PI/2),g2=Math.sin(t*Math.PI/2);out[len-m+i]=out[len-m+i]*g1+src[from+i]*g2;}
  for(let i=m;i<to-from;i++)out[len++]=src[from+i];
 };
 put(samples,0,b,false);
 const releaseN=n-b;
 while(len<targetN-releaseN)put(samples,a,b,true);
 put(samples,b,n,true);
 const end=Math.min(len,targetN),fadeN=Math.min(end,Math.round(rate*0.02)),res=out.slice(0,end);
 for(let i=0;i<fadeN;i++)res[end-1-i]*=i/fadeN;
 return res;
}

// Étirement continu (WSOLA) : on avance dans le son plus lentement que dans le résultat, en recollant de petites fenêtres de 30 ms
// choisies pour qu'elles s'enchaînent sans saut (même hauteur, même forme d'onde). Rien n'est répété à l'identique : le son est allongé.
export function stretchVowel(samples,rate,targetMs){
 const n=samples.length,targetN=Math.round(rate*clamp(targetMs,MIN_STRETCH_MS,MAX_STRETCH_MS)/1000);
 const frame=Math.round(rate*0.03)&~1,hop=frame/2,tol=Math.round(rate*0.012);
 if(n<frame*2||n>=targetN)return n<8||n>=targetN?Float32Array.from(samples):stretchSamples(samples,rate,targetMs);
 const ratio=targetN/n,win=new Float32Array(frame);for(let i=0;i<frame;i++)win[i]=0.5-0.5*Math.cos(2*Math.PI*(i+0.5)/frame);
 const out=new Float32Array(targetN+frame),norm=new Float32Array(targetN+frame),step=3;
 const add=(pos,at,first)=>{for(let i=0;i<frame;i++){const w=first&&i<hop?1:win[i];if(at+i>=out.length)break;out[at+i]+=samples[pos+i]*w;norm[at+i]+=w;}};
 let prev=0;add(0,0,true);
 for(let k=1;k*hop<targetN;k++){
  const at=k*hop,nominal=Math.min(n-frame,Math.round(at/ratio)),follow=prev+hop;
  let best=nominal,bestScore=-Infinity;
  const lo=Math.max(0,nominal-tol),hi=Math.min(n-frame,nominal+tol);
  if(follow+frame<=n){
   for(let c=lo;c<=hi;c+=2){let dot=0,e=0;for(let i=0;i<frame;i+=step){const a=samples[follow+i],b=samples[c+i];dot+=a*b;e+=b*b;}const sc=dot/Math.sqrt(e+1e-9);if(sc>bestScore){bestScore=sc;best=c;}}
  }
  add(best,at,false);prev=best;
 }
 const res=new Float32Array(targetN);for(let i=0;i<targetN;i++)res[i]=norm[i]>1e-3?out[i]/norm[i]:0;
 const fadeN=Math.min(targetN,Math.round(rate*0.02));for(let i=0;i<fadeN;i++)res[targetN-1-i]*=i/fadeN;
 return res;
}
