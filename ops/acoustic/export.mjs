import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {readingCues} from '../../src/guided-reading.js';
const [root,output]=process.argv.slice(2);if(!root||!output)throw Error('Usage: node ops/acoustic/export.mjs CORPUS_ROOT OUTPUT_JSON');
const plans=JSON.parse(await readFile(join(root,'tokens.json'),'utf8'));
const normalize=s=>s.toLowerCase().replaceAll('œ','oe').normalize('NFD').replace(/[^a-z0-9]/g,'');
const vowel=p=>/^[aeiouyɑɛɔœøəɐ]/u.test(p);
const round=t=>Math.round(t*1000)/1000;
const clips={},issues=[];let multi=0;
for(const [file,plan] of Object.entries(plans)){
 const data=JSON.parse(await readFile(join(root,'aligned/narrator',file.replace('.mp3','.json')),'utf8'));
 const {tokens}=readingCues(plan.text),lexical=tokens.filter(t=>normalize(t.text));
 const words=data.tiers.words.entries,phones=data.tiers.phones.entries;
 if(words.map(w=>normalize(w[2])).join('')!==normalize(plan.text))throw Error('Transcript differs: '+file);
 let at=0,position=0;const syllables=[],cues=[];
 for(const token of lexical){
  const begin=position;position+=normalize(token.text).length;let collected='',group=[];
  while(at<words.length&&collected.length<position-begin){group.push(words[at]);collected+=normalize(words[at++][2]);}
  if(collected!==normalize(token.text)){issues.push({file,word:token.text,reason:'token_boundary'});continue;}
  const start=group[0][0],end=group.at(-1)[1];const ph=phones.filter(p=>p[0]>=start-.001&&p[1]<=end+.001);
  if(!ph.length||ph.some(p=>p[2]==='spn')){issues.push({file,word:token.text,reason:'unknown_phone'});continue;}
  let nuclei=ph.map((p,i)=>vowel(p[2])?i:-1).filter(i=>i>=0),cuts=[0];
  if(token.parts.length>1){
   // A terminal schwa belongs to the preceding printed unit, never a new unit.
   if(nuclei.length===token.parts.length+1&&ph.at(-1)[2]==='ə')nuclei.pop();
   if(nuclei.length===token.parts.length){
    for(let v=1;v<nuclei.length;v++){
     const left=nuclei[v-1]+1,right=nuclei[v];let cut=right;
     if(right>left){cut=right-1;
      if(['j','w','ɥ'].includes(ph[cut][2])&&cut>left)cut--;
      if(['l','ʁ'].includes(ph[cut][2])&&cut>left&&['p','b','t','d','k','ɡ','f','v'].includes(ph[cut-1][2]))cut--;
     }
     cuts.push(cut);
    }
   }else{
    // Explicit reduced/glided pronunciations: boundaries are actual phone edges.
    const key=normalize(token.text),sequence=ph.map(p=>p[2]).join(' ');
    if(['nuage','nuages'].includes(key)&&sequence==='n ɥ a ʒ')cuts=[0,2];
    else if(key==='lendemain'&&sequence==='l ɑ̃ d m ɛ̃')cuts=[0,2,3];
    else{issues.push({file,word:token.text,parts:token.parts,phones:sequence,reason:'syllable_count'});continue;}
   }
   multi++;
  }
  cues.push({start:round(start),end:round(end),charIndex:token.start,charEnd:token.end});
  cuts.forEach((cut,i)=>syllables.push({start:round(ph[cut][0]),end:round(i+1<cuts.length?ph[cuts[i+1]][0]:end),charIndex:token.start,charEnd:token.end,partIndex:i}));
 }
 // Punctuation is highlighted during a measured silence, without timing guesses.
 for(let i=0;i<cues.length;i++){
  const c=cues[i],next=cues[i+1],stop=next?.start??data.end;
  const mark=tokens.find(t=>t.start>=c.charEnd&&t.end<=(next?.charIndex??plan.text.length)&&t.kind!=='word');
  if(mark&&stop-c.end>=.04)syllables.push({start:c.end,end:round(stop),charIndex:mark.start,charEnd:mark.end,partIndex:0});
 }
 syllables.sort((a,b)=>a.start-b.start);
 clips[file]={text:plan.text,source:'mfa-french-3.4.3',validated:true,audioSha256:createHash('sha256').update(await readFile(join(root,file))).digest('hex'),cues,syllables};
}
console.log(JSON.stringify({clips:Object.keys(clips).length,multisyllabicWords:multi,issues},null,2));
if(issues.length)process.exitCode=1;
else await writeFile(output,JSON.stringify({version:1,source:'mfa-french-3.4.3',model:'MontrealCorpusTools/french_mfa',clips}));
