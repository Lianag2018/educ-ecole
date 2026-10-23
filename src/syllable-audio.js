import {kaluluUrl,kaluluSyllables} from './kalulu-bank.js';
const sounds=Object.freeze({m:'m-m',a:'a-a',l:'l-l',i:'i-i',f:'f-f',s:'s-s',p:'p-p',t:'t-t',n:'n-n',b:'b-b',d:'d-d',v:'v-v',j:'j-cap.z',r:'r-cap.r',ch:'ch-cap.s',ou:'ou-u'});
const syllableSet=new Set(kaluluSyllables);
export function syllableAudioFor(q){
 if(q?.skill!=='syllabes'||typeof q.text!=='string')return null;
 const parts=q.text.split(/\s*\+\s*/).map(x=>x.trim().toLowerCase());
 if(parts.length!==2||parts.some(x=>!sounds[x]||!kaluluUrl('sons',sounds[x])))return null;
 const whole=parts.join('');
 if(!syllableSet.has(whole)||!kaluluUrl('syllabes',whole))return null;
 return {parts:parts.map((label,i)=>({label,id:sounds[parts[i]]})),whole};
}
export function syllableChoiceAudio(q,choice){
 if(q?.skill!=='syllabes'||typeof choice!=='string')return null;
 const word=choice.trim().toLowerCase();
 return syllableSet.has(word)&&kaluluUrl('syllabes',word)?word:null;
}
