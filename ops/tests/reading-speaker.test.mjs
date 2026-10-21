import test from 'node:test';
import assert from 'node:assert/strict';
import {ReadingSpeaker} from '../../src/speech.js';
function fixture(){
 const calls=[],states=[],timers=new Map();let next=0;
 const synth={paused:true,cancel(){calls.push('cancel');},resume(){this.paused=false;calls.push('resume');},getVoices(){return [{voiceURI:'a',name:'Amélie',lang:'fr-CA'}];},speak(u){assert.equal(this.paused,false);calls.push(u);}};
 const reader=new ReadingSpeaker({synth,Utterance:class{constructor(text){this.text=text;}},setTimer:f=>{timers.set(++next,f);return next;},clearTimer:id=>timers.delete(id)});
 return {reader,calls,states,timers,synth,opts:{onState:(...s)=>states.push(s)}};
}
test('paused engine resumes synchronously and retains slow French utterance',()=>{
 const f=fixture();f.reader.speak('lapin',f.opts);const u=f.reader.current;
 assert.deepEqual(f.calls.slice(0,2),['cancel','resume']);assert.equal(f.calls[2],u);assert.equal(u.text,'lapin');assert.equal(u.rate,.65);assert.equal(u.lang,'fr-CA');
 u.onstart();assert.equal(f.timers.size,0);u.onend();assert.equal(f.reader.current,null);assert.equal(f.states.at(-1)[0],'ended');
});
test('stale callbacks cannot overwrite new reading or restart after stop',()=>{
 const f=fixture();f.reader.speak('un',f.opts);const old=f.reader.current;f.reader.speak('deux',f.opts);const current=f.reader.current;
 old.onerror({error:'canceled'});old.onend();assert.equal(f.reader.current,current);assert.equal(f.states.at(-1)[0],'starting');
 f.reader.stop();current.onstart();assert.equal(f.reader.current,null);assert.equal(f.timers.size,0);
});
test('unavailable voice offers explicit system fallback',()=>{
 const f=fixture();f.reader.speak('lapin',f.opts);f.reader.current.onerror({error:'voice-unavailable'});assert.equal(f.states.at(-1)[0],'error');
 f.reader.speak('lapin',{...f.opts,systemVoice:true});assert.equal(f.reader.current.voice,undefined);assert.equal(f.reader.current.lang,'fr-CA');
});
test('silent startup fails visibly and clears pending speech',()=>{
 const f=fixture();f.reader.speak('lapin',f.opts);[...f.timers.values()][0]();assert.equal(f.states.at(-1)[0],'error');assert.equal(f.reader.current,null);assert.equal(f.timers.size,0);
});
