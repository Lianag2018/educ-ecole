import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createKaluluPlayer,kaluluUrl} from '../../src/kalulu-bank.js';

test('the correct model for m + a is the complete recorded syllable ma',()=>{
 const u=kaluluUrl('syllabes','ma');
 assert.ok(u.endsWith('/ma.mp3'));
 assert.ok(!u.includes('m-m.mp3'));
});
test('speaker uses one recording rather than mmm then aaa',()=>{
 const app=readFileSync(new URL('../../src/app.js',import.meta.url),'utf8');
 assert.match(app,/q\.text\.replace\(\/\\s\/g,''\)==='m\+a'/);
 assert.match(app,/blendedSyllablePlayer\.play\('syllabes','ma'/);
 assert.doesNotMatch(app,/BlendPilot|data-blend-pilot|Oscillator/);
 assert.match(app,/function cleanup\(stopOral=true\)\{blendedSyllablePlayer\.stop\(\)/);
 assert.match(app,/function speakText\(.*\)\{blendedSyllablePlayer\.stop\(\)/);
});
test('one click starts exactly one whole syllable and next click stops old audio',async()=>{
 const audios=[];
 const p=createKaluluPlayer({createAudio:src=>{const a={src,paused:false,play(){return Promise.resolve();},pause(){this.paused=true;},removeAttribute(){},load(){}};audios.push(a);return a;}});
 p.play('syllabes','ma');assert.equal(audios.length,1);assert.ok(audios[0].src.endsWith('/ma.mp3'));
 p.play('syllabes','ma');assert.equal(audios.length,2);assert.equal(audios[0].paused,true);
 p.stop();assert.equal(audios[1].paused,true);
});
