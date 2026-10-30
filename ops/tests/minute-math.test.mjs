import assert from 'node:assert/strict';
import {minuteCards,MinuteRound} from '../../src/minute-math.js';
import {guidedMarkup} from '../../src/guided-reading.js';
for(const older of [false,true])for(let variant=0;variant<6;variant++){
 const cards=minuteCards({older,variant,count:older?21:10,table:6});assert.equal(cards.length,older?21:10);assert.equal(new Set(cards.map(q=>q.id)).size,cards.length);
 for(const q of cards){const [a,op,b]=q.text.split(' ');assert.equal(q.value,op==='+'?+a+ +b:+a- +b);assert.ok(q.value>=0);if(!older)assert.ok(q.value<=10);}
}
assert.notDeepEqual(minuteCards({variant:0}),minuteCards({variant:1}));
let now=0;const g=new MinuteRound(minuteCards(),()=>now);g.start();assert.equal(g.input(0,''),true);assert.equal(g.input(0,'oops'),false);g.input(0,String(g.cards[0].value));now=59999;assert.equal(g.tick(),'playing');now=60000;assert.equal(g.input(1,'3'),false);assert.equal(g.phase,'done');assert.equal(g.results()[0].status,'correct');assert.equal(g.results()[1].status,'unanswered');
now=0;const paused=new MinuteRound(minuteCards(),()=>now);paused.start();now=10000;paused.pause();now=90000;assert.equal(paused.time(),10000);paused.resume();now=100000;assert.equal(paused.time(),20000);paused.finish();assert.equal(paused.paused,true);
const markup=guidedMarkup('Les animaux regardent les étoiles.');assert.match(markup,/liaison-letter/);assert.match(markup,/silent-letter/);assert.match(markup,/syllable-1/);assert.ok(!markup.includes('Petite balle'));
console.log('Minute worksheets, deadline, pause and reading cues passed');
