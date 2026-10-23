// Banque fournie par le parent et vérifiée : 105 correspondances, 223 entrées syllabiques.
// Kalulu / Excello, CC BY-SA 4.0, commit 185b6579effcc802d167c5525779bc1e13ed523a.
// Copie de production locale des 328 MP3, téléchargée au build depuis la source épinglée.
export const KALULU_SOURCE='https://media.githubusercontent.com/media/Excello-Recherche-Education/Kalulu-Languages/185b6579effcc802d167c5525779bc1e13ed523a/fr_FR/language_sounds/';
export const kaluluSounds="a-a,ai-cap.e,ai-e,aim-5,ain-5,am-at,an-at,au-cap.o,au-o,aî-cap.e,b-b,c-k,c-s,cc-k,ch-cap.s,d-d,dd-d,e-cap.e,e-e,e-pcent,eau-o,ei-cap.e,ein-5,em-at,en-at,er-e,es-cap.e,est-cap.e,et-cap.e,et-e,eu-2,eu-9,eu-y,ez-e,f-f,ff-f,g-cap.z,g-g,gg-g,gn-cap.n,gu-g,i-i,i-ij,i-j,ien-j5,il-j,ill-ij,ill-j,im-5,in-5,j-cap.z,k-k,l-l,ll-l,m-m,mm-m,n-n,nn-n,o-cap.o,o-o,oeu-2,oeu-9,oi-wa,oin-w5,om-para,on-para,ou-u,ou-w,oy-waj,oî-wa,où-u,oû-u,p-p,ph-f,pp-p,q-k,qu-k,r-cap.r,rr-cap.r,s-s,s-z,ss-s,t-s,t-t,tt-t,u-8,u-y,un-1,v-v,w-w,x-gz,x-ks,y-i,y-j,z-z,à-a,â-a,ç-s,è-cap.e,é-e,ê-cap.e,ë-cap.e,î-i,ô-o,û-y".split(',');
export const kaluluSyllables="a,ab,ac,ach,ad,af,agn,ai,ain,al,am,an,ap,ar,as,at,au,av,ax,az,ba,ban,bi,bo,bom,bon,bou,bu,bè,bé,bê,ca,ce,cha,che,chi,cho,chu,ci,co,cy,da,de,des,di,do,du,dè,e,eau,em,en,er,es,et,eu,fa,fai,fe,fi,fo,fou,fu,fé,ga,ge,gi,go,gou,gu,gue,gui,guy,gué,gy,i,ib,ic,id,if,ign,il,im,ip,ir,is,it,iv,ix,iz,iç,ja,je,ji,jo,jou,ju,ka,ki,ko,la,lai,le,lem,les,li,lo,lom,lou,lu,lé,ma,man,me,mem,mes,mi,mo,mon,mou,mu,mè,na,ne,ni,no,nu,né,o,ob,oc,od,of,ogn,oi,oin,oir,ol,om,op,or,os,ot,ou,oud,ouf,oul,oum,our,ous,ov,ox,oz,pa,pe,pem,pi,po,poi,pu,pè,pé,que,qui,ra,re,ri,ro,roi,rou,ru,sa,se,ses,si,so,soi,son,sou,su,sé,ta,tan,te,tem,tes,ti,to,ton,tu,té,tê,u,ub,uc,uch,uf,ul,up,ur,us,ut,uv,ux,uz,va,ve,vi,vo,vu,vé,xa,xi,xu,y,zo,zu,à,ça,ço,è,év,ê".split(',');
const allowed={sons:new Set(kaluluSounds),syllabes:new Set(kaluluSyllables)};
export function kaluluUrl(category,name){
 if(!Object.hasOwn(allowed,category)||!allowed[category].has(name))return null;
 return '/audio/kalulu/'+category+'/'+encodeURIComponent(name)+'.mp3';
}
export function kaluluRemoteUrl(category,name){
 if(!Object.hasOwn(allowed,category)||!allowed[category].has(name))return null;
 return KALULU_SOURCE+encodeURIComponent(name)+'.mp3';
}
const firstSyllables=['ma','mi','mou','la','li','lou','pa','pi','sa','si','fa','cha'];
const firstSounds=['m-m','a-a','l-l','i-i','p-p','ou-u','s-s','f-f','ch-cap.s','on-para'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
export function kaluluMarkup(){
 const options=(items)=>items.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join('');
 return '<details class="kalulu-bank" data-kalulu-bank><summary>🔊 Mes sons et mes syllabes · 328 enregistrements</summary>'+
 '<p>Commence avec un son, puis écoute une syllabe entière. Les sons sont différents des noms des lettres.</p>'+
 '<div class="kalulu-first"><strong>Mes premières syllabes</strong><div>'+firstSyllables.map(s=>'<button type="button" data-kalulu-play="syllabes" data-kalulu-name="'+esc(s)+'">▶ '+esc(s)+'</button>').join(' ')+'</div></div>'+
 '<div class="kalulu-first"><strong>Mes premiers sons</strong><div>'+firstSounds.map(s=>'<button type="button" data-kalulu-play="sons" data-kalulu-name="'+esc(s)+'">▶ '+esc(s.split('-')[0])+'</button>').join(' ')+'</div></div>'+
 '<div class="kalulu-all"><label>Autres sons <select data-kalulu-select="sons">'+options(kaluluSounds)+'</select></label><button type="button" data-kalulu-selected="sons">▶ Écouter ce son</button></div>'+
 '<div class="kalulu-all"><label>Autres syllabes <select data-kalulu-select="syllabes">'+options(kaluluSyllables)+'</select></label><button type="button" data-kalulu-selected="syllabes">▶ Écouter cette syllabe</button></div>'+
 '<button type="button" data-kalulu-stop>■ Arrêter</button><p role="status" aria-live="polite" data-kalulu-status></p>'+
 '<p class="small">Source : Kalulu / Excello, © 2026, français de France (pas une voix québécoise confirmée). <a href="https://github.com/Excello-Recherche-Education/Kalulu-Languages" target="_blank" rel="noopener noreferrer">Source</a> · <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">Licence CC BY-SA 4.0</a>. Sélection et classement adaptés; audio inchangé. Fichiers servis depuis l’application après installation du catalogue audio. Une écoute ne valide pas la maîtrise.</p></details>';
}
export function createKaluluPlayer({createAudio=src=>new Audio(src)}={}){
 let audio=null,seq=0;
 function stop(){seq++;if(audio){audio.pause();audio.removeAttribute?.('src');audio.load?.();audio=null;}}
 function play(category,name,notify=()=>{}){
  stop();const url=kaluluUrl(category,name);if(!url){notify('Son non disponible.');return false;}
  const token=seq;const a=createAudio(url);audio=a;a.preload='auto';a.onended=()=>{if(seq===token)notify('Tu peux essayer à ton tour!');};a.onerror=()=>{if(seq===token)notify('Le son est indisponible. Réessaie avec une connexion Internet.');};
  notify('Écoute attentivement…');try{Promise.resolve(a.play()).catch(()=>{if(seq===token)notify('Touche encore Écouter pour autoriser le son.');});}catch{if(seq===token)notify('Touche encore Écouter pour autoriser le son.');}return true;
 }
 return {play,stop};
}
export function mountKalulu(root,{player=createKaluluPlayer(),beforePlay=()=>{}}={}){
 const panel=root.querySelector('[data-kalulu-bank]');if(!panel)return ()=>{};
 const status=panel.querySelector('[data-kalulu-status]');const notify=msg=>{if(status?.isConnected)status.textContent=msg;};
 const play=(category,name)=>{beforePlay();player.play(category,name,notify);};
 panel.querySelectorAll('[data-kalulu-play]').forEach(b=>b.addEventListener('click',()=>play(b.dataset.kaluluPlay,b.dataset.kaluluName)));
 panel.querySelectorAll('[data-kalulu-selected]').forEach(b=>b.addEventListener('click',()=>play(b.dataset.kaluluSelected,panel.querySelector('[data-kalulu-select="'+b.dataset.kaluluSelected+'"]').value)));
 panel.querySelector('[data-kalulu-stop]')?.addEventListener('click',()=>{player.stop();notify('Écoute arrêtée.');});
 panel.addEventListener('toggle',()=>{if(!panel.open)player.stop();});
 return ()=>player.stop();
}
