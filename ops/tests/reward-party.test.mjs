import test from 'node:test';import assert from 'node:assert/strict';
import {pendingCelebration,markCelebrated,celebrationMarkup,rewardState,claimReward} from '../../src/rewards.js';
const kid=()=>({id:'p1',name:'Mely-Ann',history:[]});
test('la fête n\'apparaît qu\'une fois, quand une récompense est atteinte',()=>{
 const p=kid();assert.equal(pendingCelebration(p),null);
 rewardState(p).base=-100;const r=pendingCelebration(p);assert.equal(r.id,'r0');
 markCelebrated(p,r.id);assert.equal(pendingCelebration(p),null);
 rewardState(p).base=-250;assert.equal(pendingCelebration(p).id,'r1');
});
test('une récompense déjà remise par un parent ne déclenche plus de fête',()=>{
 const p=kid();rewardState(p).base=-100;assert.ok(claimReward(p,'r0'));assert.equal(pendingCelebration(p),null);
});
test('l\'ouverture montre la photo des deux filles qui volent, le nom de la récompense et deux boutons',()=>{
 const html=celebrationMarkup({icon:'🍟',title:'McDo'},'Liana');
 assert.match(html,/voyage-soeurs\.webp/);assert.match(html,/Récompense obtenue/);assert.match(html,/McDo/);assert.match(html,/Bravo Liana/);assert.match(html,/data-party-close/);assert.match(html,/data-party-chest/);
 assert.doesNotMatch(celebrationMarkup({icon:'<b>',title:'<img onerror=1>'},'x'),/<img onerror/);
});
