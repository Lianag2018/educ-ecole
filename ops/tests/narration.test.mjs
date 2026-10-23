import test from 'node:test';
import assert from 'node:assert/strict';
import {NarrationSpeaker} from '../../src/narration.js';
import {ReadingSpeaker} from '../../src/speech.js';
import {narrationCatalog} from '../narration-catalog.mjs';
import {numberWords,numberParts} from '../../src/numbers.js';
const file='a'.repeat(64)+'.mp3';
class FakeAudio {pause(){}setAttribute(){}removeAttribute(){}play(){this.played=(this.played||0)+1;return Promise.resolve();}}
test('catalog includes every requested number, first word and fictional stories, without child records',()=>{
 const c=narrationCatalog(),texts=new Set(c.map(x=>x.text));
 for(let n=0;n<=1999;n++)assert.ok(texts.has(numberWords(n))||numberParts(n).every(s=>texts.has(s)));
 assert.ok(texts.has('lapin'));assert.ok(c.some(x=>x.text.startsWith('Deux sœurs rêvent.')));
 assert.ok(c.every(x=>!x.text.includes('Liana')&&!x.text.includes('Mely-Ann')));
 assert.ok(c.length<=2300);assert.ok(c.reduce((n,x)=>n+x.text.length,0)<=150000);
});
test('all numbers can play in short spoken groups when a complete recording is absent',async()=>{
 const clips=Object.fromEntries(narrationCatalog().map(c=>[c.text,file]));delete clips[numberWords(1999)];
 const p=new NarrationSpeaker({fallback:{stop(){},speak(){throw Error('fallback unexpected');}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips})})});
 await p.ready;p.speak('1999');assert.equal(p.audio.played,1);p.audio.onended();p.audio.onended();assert.equal(p.audio.played,3);
 assert.deepEqual(numberParts(1001),['mille','un']);assert.deepEqual(numberParts(307),['trois cents','sept']);
});
test('non-numeric recorded speech starts in the tap handler and stale callbacks cannot resume it',async()=>{
 let fallback=0;const states=[];const player=new NarrationSpeaker({fallback:{stop(){},speak(){fallback++;}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{'trois cent sept':file,'lapin':file}})})});
 await player.ready;player.speak('lapin',{onState:s=>states.push(s)});assert.equal(player.audio.played,1);assert.equal(fallback,0);assert.equal(player.audio.src,'/audio/'+file);
 player.audio.onplaying();assert.equal(states.at(-1),'speaking');const ended=player.audio.onended;player.stop();ended();assert.equal(states.at(-1),'speaking');
 player.speak('texte scolaire privé');assert.equal(fallback,1);
});
test('line reading queues known audio only and respects stop',async()=>{
 const p=new NarrationSpeaker({fallback:{stop(){},speak(){throw Error('fallback unexpected');}},AudioClass:FakeAudio,fetcher:async()=>({ok:true,json:async()=>({version:1,clips:{mille:file,'mille un':file}})})});
 await p.ready;p.speak('mille. mille un');assert.equal(p.audio.played,1);p.audio.onended();assert.equal(p.audio.played,2);p.stop();
});

const originalZero='https://pedagofa.cssdm.gouv.qc.ca/wp-content/uploads/sites/2/2021/01/o1-09-a.mp3';
const originalOne='https://pedagofa.cssdm.gouv.qc.ca/wp-content/uploads/sites/2/2021/01/o1-09-b.mp3';
function controlled({clips={},alignments={},fallback,fetcher}={}){
 const instances=[],native=[],timers=[];
 class Audio{
  constructor(){instances.push(this);this.calls=[];this.pauses=0;this.loads=0;this.attributes={};}
  setAttribute(name,value){this.attributes[name]=value;}
  removeAttribute(name){if(name==='src')this.src='';delete this.attributes[name];}
  pause(){this.pauses++;}
  load(){this.loads++;}
  play(){
   let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
   this.calls.push({src:this.src,speed:this.playbackRate,playing:this.onplaying,ended:this.onended,error:this.onerror,progress:this.ontimeupdate,waiting:this.onwaiting,resolve,reject});
   return promise;
  }
 }
 const player=new NarrationSpeaker({AudioClass:Audio,fallback:fallback||{stop(){},speak(text,options){native.push({text,options});}},fetcher:fetcher|| (async url=>({ok:true,json:async()=>({version:1,clips:url.includes('alignment')?alignments:clips})})),setTimer(fn,ms){const timer={fn,ms,cancelled:false};timers.push(timer);return timer;},clearTimer(timer){if(timer)timer.cancelled=true;}});
 return {player,instances,native,timers,audio:player.audio};
}

test('official numbers start synchronously before manifests load and override a saved native preference',()=>{
 const {player,audio,instances,native}=controlled({fetcher:()=>new Promise(()=>{})});
 const states=[];
 player.speak('0',{preferredURI:'saved-french-voice',speed:.8,onState:state=>states.push(state)});
 assert.equal(audio.calls.length,1);assert.equal(audio.calls[0].src,originalZero);assert.equal(audio.calls[0].speed,.8);
 assert.equal(native.length,0);assert.equal(audio.crossOrigin,undefined);
 audio.calls[0].playing();assert.equal(states.at(-1),'speaking');
 player.speak('un');assert.equal(audio.calls[1].src,originalOne);assert.equal(instances.length,1);
 player.stop();assert.equal(audio.src,'');assert.ok(audio.loads>0);
});

test('an explicit system-voice request still overrides official number recordings',()=>{
 const {player,audio,native}=controlled();
 player.speak('20',{systemVoice:true});
 assert.equal(audio.calls.length,0);assert.equal(native.length,1);assert.equal(native[0].text,'vingt');assert.equal(native[0].options.systemVoice,true);
});

test('an incomplete numeric plan keeps an existing complete narration as its fallback',async()=>{
 const {player,audio,native}=controlled({clips:{'cinquante-six plus vingt':file}});
 await player.ready;player.speak('56 + 20');
 assert.equal(audio.calls.length,1);assert.equal(audio.calls[0].src,'/audio/'+file);assert.equal(native.length,0);
});

test('stop and replay invalidate previous events and rejected play promises',async()=>{
 const {player,audio,native}=controlled(),states=[],cues=[];
 const options={onState:state=>states.push(state),onProgress:event=>cues.push(event)};
 player.speak('0',options);const old=audio.calls[0];
 player.speak('1',options);const current=audio.calls[1],count=states.length;
 audio.duration=1;audio.currentTime=.5;
 old.playing();old.ended();old.error();old.progress();old.reject(new Error('late network error'));await Promise.resolve();
 assert.equal(audio.calls.length,2);assert.equal(audio.src,originalOne);assert.equal(states.length,count);assert.equal(cues.length,0);assert.equal(native.length,0);
 player.stop();current.playing();current.ended();current.error();current.progress();current.reject(new Error('late after stop'));await Promise.resolve();
 assert.equal(audio.calls.length,2);assert.equal(states.length,count);assert.equal(cues.length,0);assert.equal(audio.src,'');
});

test('a finished segment cannot skip the next segment or reject it later, and ended occurs once',async()=>{
 const {player,audio}=controlled(),states=[];
 player.speak('zéro. un',{onState:state=>states.push(state)});
 const first=audio.calls[0];assert.equal(first.src,originalZero);first.ended();
 const last=audio.calls[1];assert.equal(last.src,originalOne);
 first.ended();first.error();first.reject(new Error('late previous segment'));await Promise.resolve();
 assert.equal(audio.calls.length,2);assert.ok(!states.includes('error'));
 last.ended();last.ended();last.error();last.reject(new Error('late after final end'));await Promise.resolve();
 assert.equal(states.filter(state=>state==='ended').length,1);assert.equal(audio.calls.length,2);assert.ok(!states.includes('error'));
});

test('an original network failure restarts the entire plan once and keeps the current speed',async()=>{
 const secondFile='b'.repeat(64)+'.mp3';
 const {player,audio,native}=controlled({clips:{'zéro':file,'un':secondFile}}),messages=[];
 await player.ready;player.speak('zéro. un',{speed:1,onState:(state,message)=>messages.push({state,message})});
 audio.calls[0].ended();const original=audio.calls[1];
 player.setSpeed(.6);original.reject(new Error('network unavailable'));await Promise.resolve();
 assert.equal(audio.calls.length,3);assert.equal(audio.calls[2].src,'/audio/'+file);assert.equal(audio.calls[2].speed,.6);
 assert.ok(messages.some(({message})=>/PédagoFA.*indisponible.*depuis le début/.test(message)));
 original.error();original.ended();assert.equal(audio.calls.length,3);
 audio.calls[2].ended();assert.equal(audio.calls[3].src,'/audio/'+secondFile);assert.equal(audio.calls[3].speed,.6);
 audio.calls[3].error();audio.calls[3].error();
 assert.equal(audio.calls.length,4);assert.equal(messages.filter(({state})=>state==='error').length,1);assert.equal(native.length,0);
});

test('NotAllowedError reports a required gesture without automatic fallback or retry',async()=>{
 const {player,audio,native}=controlled({clips:{'zéro':file}}),messages=[];
 await player.ready;player.speak('0',{onState:(state,message)=>messages.push({state,message})});
 const blocked=audio.calls[0];blocked.reject(Object.assign(new Error('permission denied'),{name:'NotAllowedError'}));await Promise.resolve();
 assert.equal(audio.calls.length,1);assert.equal(native.length,0);assert.equal(messages.at(-1).state,'error');assert.match(messages.at(-1).message,/bloqué.*Touche Écouter/);
 blocked.error();blocked.ended();assert.equal(audio.calls.length,1);
});

test('without local clips, failed originals use the French-only system fallback and never an English voice',async()=>{
 let spoken=0;
 const fallback=new ReadingSpeaker({synth:{cancel(){},getVoices(){return [{lang:'en-US',name:'English',voiceURI:'english'}];},speak(){spoken++;}},Utterance:class {constructor(text){this.text=text;}},setTimer(){},clearTimer(){}});
 const {player,audio}=controlled({fallback}),messages=[];
 await player.ready;player.speak('0',{onState:(state,message)=>messages.push({state,message})});
 audio.calls[0].error();
 assert.equal(audio.calls.length,1);assert.equal(spoken,0);assert.equal(messages.at(-1).state,'error');
 assert.match(messages.at(-1).message,/PédagoFA.*indisponible/);assert.match(messages.at(-1).message,/Aucune voix française/);
});

test('system-fallback callbacks cannot finish or animate a replacement reading',()=>{
 const {player,audio,native}=controlled(),states=[],cues=[];
 player.speak('texte privé',{onState:state=>states.push(state),onProgress:event=>cues.push(event)});
 const old=native[0];player.speak('0',{onState:state=>states.push(state),onProgress:event=>cues.push(event)});
 const count=states.length;old.options.onState('ended','old');old.options.onState('error','old');old.options.onProgress({progress:.5});
 assert.equal(states.length,count);assert.equal(cues.length,0);assert.equal(audio.calls.length,1);assert.equal(audio.calls[0].src,originalZero);
});

test('number progress stays approximate and speed changes do not restart or reset the current media',async()=>{
 const {player,audio}=controlled({clips:{'zéro':file},alignments:{[file]:{text:'zéro',cues:[{start:0,end:1,charIndex:0}]}}}),cues=[];
 await Promise.all([player.ready,player.alignmentReady]);player.speak('0',{onProgress:event=>cues.push(event)});
 audio.duration=2;audio.currentTime=1;audio.calls[0].progress();
 assert.deepEqual(cues.at(-1),{progress:.5,approximate:true});
 player.setSpeed(.7);assert.equal(audio.playbackRate,.7);assert.equal(audio.preservesPitch,true);assert.equal(audio.currentTime,1);assert.equal(audio.calls.length,1);
});

test('a silent eight-second loading timeout uses the one fallback, then a local timeout reports an error',async()=>{
 const {player,audio,timers,native}=controlled({clips:{'zéro':file}}),states=[];
 await player.ready;player.speak('0',{onState:state=>states.push(state)});
 assert.equal(timers[0].ms,8000);timers[0].fn();
 assert.equal(audio.calls.length,2);assert.equal(audio.calls[1].src,'/audio/'+file);
 timers[0].fn();assert.equal(audio.calls.length,2);
 assert.equal(timers[1].ms,8000);timers[1].fn();timers[1].fn();
 assert.equal(states.filter(state=>state==='error').length,1);assert.equal(audio.calls.length,2);assert.equal(native.length,0);
});

test('playing cancels startup and buffering timers, including stale callbacks from cancelled timers',()=>{
 const {player,audio,timers}=controlled(),states=[];
 player.speak('0',{onState:state=>states.push(state)});const current=audio.calls[0],startup=timers[0];
 current.playing();assert.equal(startup.cancelled,true);startup.fn();assert.equal(audio.calls.length,1);
 current.waiting();current.waiting();assert.equal(timers.length,2);
 const waiting=timers[1];current.playing();assert.equal(waiting.cancelled,true);waiting.fn();assert.equal(audio.calls.length,1);
 current.waiting();const last=timers[2];current.ended();assert.equal(last.cancelled,true);last.fn();
 assert.equal(states.filter(state=>state==='ended').length,1);assert.ok(!states.includes('error'));
});

test('segment changes, stop and replacement readings invalidate pending timeouts',()=>{
 const {player,audio,timers,native}=controlled();
 player.speak('zéro. un');const first=audio.calls[0],firstTimer=timers[0];first.ended();
 const second=audio.calls[1],secondTimer=timers[1];assert.equal(firstTimer.cancelled,true);
 firstTimer.fn();assert.equal(audio.calls.length,2);
 player.stop();assert.equal(secondTimer.cancelled,true);secondTimer.fn();second.waiting();assert.equal(timers.length,2);
 player.speak('0');firstTimer.fn();secondTimer.fn();
 assert.equal(audio.calls.length,3);assert.equal(audio.calls[2].src,originalZero);assert.equal(native.length,0);
});
