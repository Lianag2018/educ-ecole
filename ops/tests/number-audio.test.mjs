import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planNumberAudio} from '../../src/number-audio.js';
import {PEDAGOFA_NUMBER_CLIPS} from '../../src/number-audio-data.js';
import {numberWords,numberParts} from '../../src/numbers.js';
import {narrationCatalog} from '../narration-catalog.mjs';

// Deterministic test filenames, using the real catalogue's available text keys.
// No generation service, network request, audio playback or listening is involved.
const hash=text=>createHash('sha256').update(text).digest('hex')+'.mp3';
const clips=Object.freeze(Object.fromEntries(narrationCatalog().map(({text})=>[text,hash(text)])));
const directNumbers=[...Array.from({length:21},(_,n)=>n),30,40,50,60,70,71,72,80,81,82,90,91,92,100,200,203,300,358,1000];
const originalsByUrl=new Map(Object.entries(PEDAGOFA_NUMBER_CLIPS).map(([number,clip])=>[clip.src,Number(number)]));
const neededNarrations=[21,22,23,24,25,26,27,28,29,31,41,51,61,500,600,800];
const operators=[['+','plus'],['−','moins'],['-','moins'],['×','fois'],['÷','divisé par'],['=','égale'],['<','est plus petit que'],['>','est plus grand que']];
const words=text=>text.replace(/[.-]/gu,' ').trim().replace(/\s+/gu,' ');

function sources(plan){return plan.segments.map(segment=>originalsByUrl.get(segment.src)??segment.text);}
function assertPlan(plan,text,{preferOriginal=true}={}){
 assert.ok(plan,`missing plan: ${text}, originals=${preferOriginal}`);
 assert.equal(plan.text,text);
 assert.ok(plan.segments.length>0);
 assert.equal(words(plan.segments.map(segment=>segment.text).join(' ')),words(text));
 assert.equal(plan.usesOriginals,plan.segments.some(segment=>segment.source==='pedagofa'));
 for(const segment of plan.segments){
  assert.ok(segment.text);
  if(segment.source==='pedagofa'){
   assert.equal(preferOriginal,true);
   assert.ok(originalsByUrl.has(segment.src),segment.src);
  }else{
   assert.equal(segment.source,'narration');
   assert.match(segment.src,/^\/audio\/[a-f0-9]{64}\.mp3$/u);
  }
 }
}

test('the forty originals retain their exact page-to-file mapping and canonical number labels',()=>{
 assert.deepEqual(Object.keys(PEDAGOFA_NUMBER_CLIPS).map(Number),directNumbers);
 const root='https://pedagofa.cssdm.gouv.qc.ca';
 const groups=[
  {numbers:Array.from({length:11},(_,n)=>n),month:'01',lesson:'09',letters:'abcdefghijk'},
  {numbers:Array.from({length:10},(_,n)=>n+11),month:'03',lesson:'13',letters:'abcdefghij'},
  {numbers:[30,40,50,60],month:'06',lesson:'55',letters:'defg'},
  {numbers:[70,71,72,80,81,82,90,91,92],month:'06',lesson:'64',letters:'abcdefghi'},
  {numbers:[100,200,203,300,358,1000],month:'06',lesson:'66',letters:'abcdef'},
 ];
 for(const group of groups)for(let i=0;i<group.numbers.length;i++){
  const number=group.numbers[i],clip=PEDAGOFA_NUMBER_CLIPS[number];
  assert.equal(clip.text,numberWords(number));
  assert.equal(clip.src,`${root}/wp-content/uploads/sites/2/2021/${group.month}/o1-${group.lesson}-${group.letters[i]}.mp3`);
  assert.equal(clip.sourcePage,`${root}/1o/1o-${group.lesson}/`);
  assert.match(clip.sha256,/^[a-f0-9]{64}$/u);
  assert.ok(Object.isFrozen(clip));
 }
 assert.equal(originalsByUrl.size,40);
 assert.ok(Object.isFrozen(PEDAGOFA_NUMBER_CLIPS));
});

test('every integer 0–1999 has an exact complete plan in both modes and both written spellings',()=>{
 for(let n=0;n<=1999;n++){
  const text=numberWords(n);
  for(const preferOriginal of [true,false]){
   const plan=planNumberAudio(n,clips,{preferOriginal});
   assertPlan(plan,text,{preferOriginal});
   assert.ok(plan.segments.length<=(preferOriginal?5:3));
   assert.deepEqual(planNumberAudio(String(n),clips,{preferOriginal}),plan);
   assert.deepEqual(planNumberAudio(text,clips,{preferOriginal}),plan);
   assert.deepEqual(planNumberAudio(text.replaceAll(' ','-'),clips,{preferOriginal}),plan);
  }
 }
});

test('the entire original-first range requires only sixteen existing narrated blocks',()=>{
 const minimal=Object.freeze(Object.fromEntries(neededNarrations.map(n=>[numberWords(n),clips[numberWords(n)]])));
 for(let n=0;n<=1999;n++)assertPlan(planNumberAudio(n,minimal),numberWords(n));
 for(const n of neededNarrations){
  const incomplete={...minimal};delete incomplete[numberWords(n)];
  assert.equal(planNumberAudio(n,incomplete),null,`must not split missing block ${n}`);
 }
});

test('all forty complete original clips win even when a complete narration is available',()=>{
 for(const n of directNumbers){
  const bank={...clips,[numberWords(n)]:hash('complete '+n)};
  const plan=planNumberAudio(n,bank);
  assert.equal(plan.segments.length,1);
  assert.equal(plan.segments[0].src,PEDAGOFA_NUMBER_CLIPS[n].src);
  assert.equal(plan.usesOriginals,true);
 }
 assert.deepEqual(sources(planNumberAudio(1203,clips)),[1000,203]);
 assert.deepEqual(sources(planNumberAudio(1358,clips)),[1000,358]);
});

test('safe compositions preserve dix-neuf and the required et constructions',()=>{
 for(const [number,expected] of [
  [56,[50,6]],[73,[60,13]],[79,[60,19]],[88,[80,8]],[93,[80,13]],[99,[80,19]],
  [1999,[1000,9,100,80,19]],
 ])assert.deepEqual(sources(planNumberAudio(number,clips)),expected,String(number));
 for(const n of [20,71,80,81,91])assert.deepEqual(sources(planNumberAudio(n,clips)),[n]);
 for(const n of [21,22,23,24,25,26,27,28,29,31,41,51,61]){
  const plan=planNumberAudio(n,clips);
  assert.deepEqual(plan.segments,[{text:numberWords(n),src:'/audio/'+clips[numberWords(n)],source:'narration'}]);
  assert.equal(plan.usesOriginals,false);
 }
 assert.equal(planNumberAudio(71,clips).text,'soixante et onze');
 assert.equal(planNumberAudio(81,clips).text,'quatre-vingt-un');
 assert.equal(planNumberAudio(91,clips).text,'quatre-vingt-onze');
});

test('centaines and mille keep context labels without splicing cinq, six or huit before cent',()=>{
 for(const [number,expected] of [
  [100,[100]],[101,[100,1]],[108,[100,8]],[111,[100,11]],
  [200,[200]],[201,[200,1]],[203,[203]],[300,[300]],[358,[358]],
  [400,[4,100]],[401,[4,100,1]],[700,[7,100]],[709,[7,100,9]],
  [900,[9,100]],[901,[9,100,1]],[1000,[1000]],[1001,[1000,1]],[1010,[1000,10]],
 ])assert.deepEqual(sources(planNumberAudio(number,clips)),expected,String(number));
 for(const hundreds of [500,600,800]){
  const text=numberWords(hundreds),src='/audio/'+clips[text];
  const whole=planNumberAudio(hundreds,clips);
  assert.deepEqual(whole.segments,[{text,src,source:'narration'}]);
  const compound=planNumberAudio(hundreds+1,clips);
  assert.equal(compound.segments[0].src,src);
  assert.equal(compound.segments[0].text,text.replace(/s$/u,''));
  assert.equal(compound.segments[1].src,PEDAGOFA_NUMBER_CLIPS[1].src);
  assert.deepEqual(planNumberAudio(hundreds+1000,clips).segments.map(s=>s.source),['pedagofa','narration']);
 }
 assert.deepEqual(planNumberAudio(400,clips).segments.map(s=>s.text),['quatre','cents']);
 assert.deepEqual(planNumberAudio(401,clips).segments.map(s=>s.text),['quatre','cent','un']);
 assert.deepEqual(planNumberAudio(201,clips).segments.map(s=>s.text),['deux cent','un']);
 assert.deepEqual(planNumberAudio(1999,clips).segments.map(s=>s.text),['mille','neuf','cent','quatre-vingt','dix-neuf']);
});

test('local-only retry uses an existing whole clip or the established numberParts, never an original',()=>{
 for(let n=0;n<=1999;n++){
  const text=numberWords(n),plan=planNumberAudio(n,clips,{preferOriginal:false});
  const names=clips[text]?[text]:numberParts(n);
  assert.equal(plan.usesOriginals,false);
  assert.deepEqual(plan.segments.map(s=>s.src),names.map(name=>'/audio/'+clips[name]));
 }
 const withoutWhole={...clips};delete withoutWhole[numberWords(1999)];
 assert.deepEqual(planNumberAudio(1999,withoutWhole,{preferOriginal:false}).segments.map(s=>s.src),
  ['mille','neuf cents','quatre-vingt-dix-neuf'].map(text=>'/audio/'+clips[text]));
 assert.equal(planNumberAudio(1999,{}, {preferOriginal:false}),null);
 assert.equal(planNumberAudio(0,{}, {preferOriginal:false}),null);
});

test('number lists retain order, require every part, and never emit a partial plan',()=>{
 const text='zéro. vingt et un. cinquante-six. mille neuf cent quatre-vingt-dix-neuf';
 const mixed=planNumberAudio('0. 21. 56. 1999',clips);
 assertPlan(mixed,text);
 assert.deepEqual(sources(mixed),[0,'vingt et un',50,6,1000,9,100,80,19]);
 assert.deepEqual(planNumberAudio(text,clips),mixed);
 assertPlan(planNumberAudio(text,clips,{preferOriginal:false}),text,{preferOriginal:false});
 assert.equal(planNumberAudio('zéro. vingt et un',{}),null);
 assert.equal(planNumberAudio('zéro. un',{'zéro':hash('zero')},{preferOriginal:false}),null);
 assert.equal(planNumberAudio('zéro. bonjour',clips),null);
});

test('all operands 0–1999 work with the seven operators in raw and spoken calculations',()=>{
 for(const [symbol,operator] of operators)for(let n=0;n<=1999;n++){
  const text=`${numberWords(n)} ${operator} un`;
  const plan=planNumberAudio(`${n} ${symbol} 1`,clips);
  assertPlan(plan,text);
  assert.ok(plan.segments.some(s=>s.source==='narration'&&s.src==='/audio/'+clips[operator]));
  assert.deepEqual(planNumberAudio(text,clips),plan);
  assertPlan(planNumberAudio(text,clips,{preferOriginal:false}),text,{preferOriginal:false});
 }
});

test('calculation results and unknown-answer prompts follow mathSpeech without changing the answer',()=>{
 const examples=[
  ['56+20=76','cinquante-six plus vingt égale soixante-seize'],
  ['56+20=74','cinquante-six plus vingt égale soixante-quatorze'],
  ['1999 − 999 = 1000','mille neuf cent quatre-vingt-dix-neuf moins neuf cent quatre-vingt-dix-neuf égale mille'],
  ['800÷8=100','huit cents divisé par huit égale cent'],
  ['3 × 7 = ?','trois fois sept'],['3+7?','trois plus sept'],
  ['20 < 71','vingt est plus petit que soixante et onze'],
  ['81 > 80','quatre-vingt-un est plus grand que quatre-vingts'],
  ['1000=1000','mille égale mille'],
 ];
 for(const [raw,text] of examples){
  assertPlan(planNumberAudio(raw,clips),text);
  assert.deepEqual(planNumberAudio(text,clips),planNumberAudio(raw,clips));
 }
 // A full old narration remains available when an isolated operator is absent.
 const text='cinquante-six plus vingt',onlyWhole={[text]:hash(text)};
 assert.equal(planNumberAudio('56+20',onlyWhole),null);
 assert.deepEqual(planNumberAudio('56+20',onlyWhole,{preferOriginal:false}),{
  text,segments:[{text,src:'/audio/'+hash(text),source:'narration'}],usesOriginals:false,
 });
 for(const [,operator] of operators){
  const bank={...clips};delete bank[operator];
  assert.equal(planNumberAudio(`un ${operator} deux`,bank),null);
 }
});

test('only strict own-property narration filenames can enter a plan',()=>{
 for(const file of ['short.mp3','A'.repeat(64)+'.mp3','../'+hash('x'),'/audio/'+hash('x'),
  'https://example.com/'+hash('x'),hash('x')+'?token=x',hash('x')+'\n',null,{},42]){
  assert.equal(planNumberAudio(21,{'vingt et un':file}),null,String(file));
 }
 assert.equal(planNumberAudio(21,Object.create({'vingt et un':hash('x')})),null);
 assert.equal(planNumberAudio(21,null),null);
 const bank=Object.create(null);bank['vingt et un']=hash('valid');
 assert.equal(planNumberAudio(21,bank).segments[0].src,'/audio/'+hash('valid'));
 const valid=planNumberAudio(1999,{});
 assert.equal(valid.segments.length,5);
 assert.equal(valid.usesOriginals,true);
});

test('case, Unicode composition, rectified hyphens and whitespace normalize to canonical speech',()=>{
 for(const [raw,n] of [
  ['  ZÉRO\n',0],['ze\u0301ro',0],['0001',1],['soixante-et-onze',71],
  ['soixante\u2011et\u2011onze',71],['mille-neuf-cent-quatre-vingt-dix-neuf',1999],
 ])assert.deepEqual(planNumberAudio(raw,clips),planNumberAudio(n,clips));
 assert.deepEqual(planNumberAudio('20\u00a0+\u00a01',clips),planNumberAudio('20 + 1',clips));
});

test('free text, malformed number names, complete dates, telephone numbers and out-of-range values are rejected',()=>{
 const invalid=[
  '',null,undefined,true,{},[],NaN,Infinity,-1,2000,1.5,'2000','-1','+1','1,5','1.5','1/2','1e3',
  '2026-10-22','22/10/2026','22.10.2026','514-555-0123','514 555 0123','+1 (514) 555-0123',
  'un chat','J’ai vingt et un ans.','Lis le nombre 56','la + pin','56 pommes','un million',
  'mille et un','cent et un','un mille','vingt un','soixante-onze','quatre-vingts-un',
  'quatre-vingt-et-un','quatre-vingt-et-onze','deux cents trois','quatre vingts',
  'un.','un.. deux','bonjour. un','1 + 2000','2000 + 1','un plus deux mille',
  'un plus deux plus trois','1+2+3','un plus deux égale deux mille','<script>1</script>',
 ];
 for(const raw of invalid){
  assert.equal(planNumberAudio(raw,clips),null,String(raw));
  assert.equal(planNumberAudio(raw,clips,{preferOriginal:false}),null,String(raw));
 }
 const prose='Lis le nombre un';
 assert.equal(planNumberAudio(prose,{[prose]:hash(prose)}),null);
});

test('planning is deterministic and neither mutates the clip bank nor shares mutable result segments',()=>{
 const original=JSON.stringify(clips),sourceData=JSON.stringify(PEDAGOFA_NUMBER_CLIPS);
 const first=planNumberAudio(1521,clips),second=planNumberAudio(1521,clips);
 assert.deepEqual(first,second);
 first.segments[0].text='changed';first.segments[1].src='changed';first.segments.push({});
 assert.deepEqual(planNumberAudio(1521,clips),second);
 assert.equal(JSON.stringify(clips),original);
 assert.equal(JSON.stringify(PEDAGOFA_NUMBER_CLIPS),sourceData);
});
