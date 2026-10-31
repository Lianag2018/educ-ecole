import assert from 'node:assert/strict';
import {flashCards,verticalCalculation,MinuteRound} from '../../src/minute-math.js';
for(const older of [true,false])for(const operation of ['+','−','mixed'])for(let variant=0;variant<6;variant++){
 const cards=flashCards({older,operation,variant,count:older?21:10});assert.equal(cards.length,older?21:10);assert.equal(new Set(cards.map(q=>q.id)).size,cards.length);
 for(const q of cards){const [a,op,b]=q.text.split(' ');assert.ok(+a<=(older?12:5)&&+b<=(older?12:5));assert.equal(q.value,op==='+'?+a+ +b:+a- +b);assert.ok(q.value>=0);if(operation!=='mixed')assert.equal(op,operation);assert.match(verticalCalculation(q),/flash-sign/);}
}
const all=flashCards({operation:'+',count:1000});assert.ok(all.some(q=>q.text==='10 + 9'&&q.value===19));assert.ok(all.some(q=>q.text==='12 + 12'&&q.value===24));
const minus=flashCards({operation:'−',count:1000});const zero=minus.find(q=>q.text==='12 − 12');assert.equal(zero.value,0);
let time=0;const game=new MinuteRound([zero,...minus.slice(0,3)],()=>time);game.start();game.input(0,'0');time=30000;game.input(1,String(game.cards[1].value));assert.equal(game.time(),30000);time=60000;assert.equal(game.input(2,'2'),false);assert.equal(game.results()[0].status,'correct');assert.equal(game.results()[2].status,'unanswered');
assert.equal(verticalCalculation({text:'<script>'}),'');
console.log('Flash cards: ranges, operations, zeros, uniqueness, vertical rendering and shared minute passed');
