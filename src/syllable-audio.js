import {kaluluUrl,kaluluSyllables} from './kalulu-bank.js';
const sounds=Object.freeze({m:'m-m',a:'a-a',l:'l-l',i:'i-i',u:'u-y',o:'o-o',f:'f-f',s:'s-s',p:'p-p',t:'t-t',n:'n-n',b:'b-b',d:'d-d',v:'v-v',j:'j-cap.z',r:'r-cap.r',ch:'ch-cap.s',ou:'ou-u'});
const syllableSet=new Set(kaluluSyllables);
const tokens=q=>q?.skill==='syllabes'&&typeof q.text==='string'?q.text.trim().toLowerCase().split(/\s*\+\s*/):[];
export function syllablePartsFor(q){
 const parts=tokens(q);if(parts.length<2||parts.length>5)return [];
 return parts.map(label=>{
  const phoneme=sounds[label];
  if(phoneme&&label.length<=2&&kaluluUrl('sons',phoneme))return {label,category:'sons',id:phoneme};
  if(syllableSet.has(label)&&kaluluUrl('syllabes',label))return {label,category:'syllabes',id:label};
  return null;
 });
}
export function syllableAudioFor(q){
 const parts=tokens(q);if(parts.length===0||parts.length>5)return null;
 const whole=parts.join('');
 if(!syllableSet.has(whole)||!kaluluUrl('syllabes',whole))return null;
 return {parts:syllablePartsFor(q).filter(Boolean).map(({label,id})=>({label,id})),whole};
}
export function syllableChoiceAudio(q,choice){
 if(q?.skill!=='syllabes'||typeof choice!=='string')return null;
 const word=choice.trim().toLowerCase();
 return syllableSet.has(word)&&kaluluUrl('syllabes',word)?word:null;
}

const localSoundIds=Object.freeze({
 'm-m':'m','a-a':'a','l-l':'l','i-i':'i','u-y':'u','o-o':'o',
 'f-f':'f','s-s':'s','p-p':'p','t-t':'t','n-n':'n','b-b':'b',
 'd-d':'d','v-v':'v','j-cap.z':'j','r-cap.r':'r','ch-cap.s':'ch','ou-u':'ou'
});
export function localPhonemeForKalulu(id){
 return typeof id==='string'&&Object.hasOwn(localSoundIds,id)?localSoundIds[id]:null;
}
