import assert from 'node:assert/strict';
import {flashRange,flashCards,flashStage,MinuteRound,improvementMessage} from '../../src/minute-math.js';
const p={id:'p1',grade:1,minuteMath:[]};
const win=(range,variant,extra={})=>({format:'cards',operation:'mixed',range,variant,count:10,correct:8,incorrect:1,unanswered:1,paused:false,ms:60000,limitMs:range===5?300000:240000,...extra});
assert.equal(flashRange(p),5);p.minuteMath.push(win(5,0));assert.equal(flashRange(p),5);p.minuteMath.push(win(5,0));assert.equal(flashRange(p),5);p.minuteMath.push(win(5,1,{paused:true}));assert.equal(flashRange(p),5);p.minuteMath.push(win(5,1));assert.equal(flashRange(p),8);assert.equal(flashRange(p,'+'),5);p.minuteMath.push(win(8,0),win(8,1));assert.equal(flashRange(p),12);assert.equal(flashRange({id:'p1',grade:1,minuteMath:[]}),5);
for(const range of [5,8,12]){const cards=flashCards({older:false,range,count:1000});assert.ok(cards.some(q=>q.text===`${range} + ${range}`));assert.ok(cards.every(q=>q.value<=range*2));}
assert.equal(flashRange({...p,minuteMath:[win(5,0,{correct:2,incorrect:0,unanswered:8}),win(5,1,{correct:2,incorrect:0,unanswered:8})]}),5);
console.log('Progression: distinct variants, whole-series accuracy, pauses, operation/profile isolation passed');

assert.equal(flashStage({id:'p1',grade:1}).seconds,300);
let t=0;const round=new MinuteRound(flashCards({older:false}),()=>t,300000);round.start();t=60000;assert.equal(round.tick(),'playing');t=299999;assert.equal(round.tick(),'playing');t=300000;assert.equal(round.tick(),'done');
const all={id:'p1',grade:1,minuteMath:[]};for(const [range,limitMs] of [[5,300000],[8,240000],[12,180000],[12,120000]])all.minuteMath.push(win(range,0,{limitMs}),win(range,1,{limitMs}));assert.equal(flashStage(all).seconds,60);

const old={...win(5,0),correct:10,incorrect:0,unanswered:0,ms:50000};const better={...old,ms:40000};assert.match(improvementMessage([old],better),/10 secondes/);assert.equal(improvementMessage([old],{...better,variant:1}),'');assert.equal(improvementMessage([old],{...better,paused:true}),'');assert.equal(improvementMessage([old],{...better,correct:8,incorrect:2}),'');assert.equal(improvementMessage([old,{...better,ms:35000}],better),'');assert.match(improvementMessage([win(5,0)],{...win(5,0),correct:9,incorrect:0}),/1 bonne réponse de plus/);
