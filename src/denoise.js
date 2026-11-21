// Réduction du bruit ambiant : soustraction spectrale. On apprend le bruit de la pièce dans les moments les plus calmes de la prise
// (début et fin, entre les sons), puis on le retire de chaque instant, en gardant la voix. Tout se passe dans l'appareil.
export const DENOISE_LEVELS=Object.freeze([[0,'Aucune'],[1.5,'Normale'],[3,'Forte']]);
const KEY='atelier-mots-denoise';
const store=()=>{try{return globalThis.localStorage||null;}catch{return null;}};
export const loadDenoise=()=>{const v=store()?.getItem(KEY);const n=Number(v);return v!==null&&DENOISE_LEVELS.some(l=>l[0]===n)?n:1.5;};
export function saveDenoise(v){if(DENOISE_LEVELS.some(l=>l[0]===Number(v)))try{store()?.setItem(KEY,String(Number(v)));}catch{}}
function fft(re,im,inverse){
 const n=re.length;
 for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){let t=re[i];re[i]=re[j];re[j]=t;t=im[i];im[i]=im[j];im[j]=t;}}
 for(let len=2;len<=n;len<<=1){const ang=2*Math.PI/len*(inverse?-1:1),wr=Math.cos(ang),wi=Math.sin(ang);
  for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let k=0;k<len/2;k++){const a=i+k,b=a+len/2,tr=re[b]*cr-im[b]*ci,ti=re[b]*ci+im[b]*cr;re[b]=re[a]-tr;im[b]=im[a]-ti;re[a]+=tr;im[a]+=ti;const nr=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=nr;}}}
 if(inverse)for(let i=0;i<n;i++){re[i]/=n;im[i]/=n;}
}
// strength : 0 = rien; 1,5 = normale; 3 = forte. Renvoie un nouveau Float32Array de même longueur.
export function denoise(samples,rate,strength=1.5){
 const N=1024,H=256;
 if(!strength||samples.length<N*2)return Float32Array.from(samples);
 // coupe-bas : retire le ronflement grave (< ~90 Hz) avant l'analyse
 const x=new Float64Array(samples.length+2*N);{const a=Math.exp(-2*Math.PI*90/rate);let py=0,px=0;for(let i=0;i<samples.length;i++){const v=samples[i],y=a*(py+v-px);px=v;py=y;x[N+i]=y;}}
 const win=new Float64Array(N);for(let i=0;i<N;i++)win[i]=Math.sqrt(0.5-0.5*Math.cos(2*Math.PI*i/N));
 const frames=Math.floor((x.length-N)/H)+1,R=[],I=[],E=new Float64Array(frames);
 for(let f=0;f<frames;f++){const re=new Float64Array(N),im=new Float64Array(N);let e=0;for(let i=0;i<N;i++){const v=x[f*H+i]*win[i];re[i]=v;e+=v*v;}fft(re,im,false);R.push(re);I.push(im);E[f]=e;}
 // profil de bruit : moyenne des modules des 15 % de moments les plus calmes (au moins 4)
 const order=[...E.keys()].sort((a,b)=>E[a]-E[b]),take=Math.max(4,Math.round(frames*0.15)),noise=new Float64Array(N/2+1);
 for(let t=0;t<take;t++){const f=order[t];for(let k=0;k<=N/2;k++)noise[k]+=Math.hypot(R[f][k],I[f][k])/take;}
 const out=new Float64Array(x.length),g=new Float64Array(N/2+1),FLOOR=0.08;
 for(let f=0;f<frames;f++){
  const re=R[f],im=I[f];
  for(let k=0;k<=N/2;k++){const m=Math.hypot(re[k],im[k]);g[k]=Math.max(FLOOR,1-strength*noise[k]/(m+1e-12));}
  const s=new Float64Array(N/2+1);for(let k=0;k<=N/2;k++)s[k]=(g[Math.max(0,k-1)]+g[k]*2+g[Math.min(N/2,k+1)])/4; // lisse entre les fréquences
  for(let k=0;k<=N/2;k++){re[k]*=s[k];im[k]*=s[k];if(k>0&&k<N/2){re[N-k]=re[k];im[N-k]=-im[k];}}
  fft(re,im,true);for(let i=0;i<N;i++)out[f*H+i]+=re[i]*win[i]/2;
 }
 const res=new Float32Array(samples.length);for(let i=0;i<samples.length;i++)res[i]=out[N+i];return res;
}
// WAV 16 bits mono : lisible partout (Safari compris), sans dépendre du format d'enregistrement de l'appareil.
export function encodeWav(samples,rate){
 const n=samples.length,buf=new ArrayBuffer(44+n*2),v=new DataView(buf),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){const s=Math.max(-1,Math.min(1,samples[i]));v.setInt16(44+i*2,s<0?s*0x8000:s*0x7fff,true);}
 return buf;
}
