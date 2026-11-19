import test from 'node:test';import assert from 'node:assert/strict';
import {pendingCelebration,markCelebrated,celebrationMarkup,rewardState,claimReward,tierFor,nextReward,chooseReward,rewardStatus,rewardsKid,rewardsParent} from '../../src/rewards.js';
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
test('l\'ouverture montre la photo qui vole, les étoiles, la récompense et le choix de la fille',()=>{
 const html=celebrationMarkup({icon:'🍟',title:'McDo'},'Liana',{points:120,next:{icon:'🤸',title:'Parc de trampolines',missing:130},tier:1});
 assert.match(html,/voyage-soeurs\.webp/);assert.match(html,/Récompense obtenue/);assert.match(html,/McDo/);assert.match(html,/data-party-count="120"/);
 assert.match(html,/data-party-now/);assert.match(html,/data-party-save/);assert.match(html,/garder tes étoiles/);assert.match(html,/Parc de trampolines/);assert.match(html,/encore 130/);
 assert.doesNotMatch(celebrationMarkup({icon:'<b>',title:'<img onerror=1>'},'x'),/<img onerror/);
});
test('sans récompense suivante, un seul geste suffit',()=>{
 const html=celebrationMarkup({icon:'🏨',title:'Hôtel'},'Mely-Ann',{points:2100,next:null,tier:3});
 assert.match(html,/data-party-close/);assert.doesNotMatch(html,/data-party-save/);assert.match(html,/rp-t3/);assert.match(html,/Super récompense/);
});
test('l\'ambiance grandit avec le niveau : plus de confettis, feux d\'artifice et rayons',()=>{
 const n=(tier)=>{const h=celebrationMarkup({icon:'x',title:'y'},'z',{points:1,tier});return {c:(h.match(/class="rp-c /g)||[]).length,fw:(h.match(/class="rp-fw /g)||[]).length};};
 assert.ok(n(1).c<n(2).c&&n(2).c<n(3).c);assert.equal(n(1).fw,0);assert.ok(n(2).fw>0&&n(3).fw>n(2).fw);
 const p=kid();assert.deepEqual(['r0','r1','r2','r3','r4','r5'].map(id=>tierFor(p,id)),[1,1,2,2,3,3]);
});
test('garder ses étoiles ou la prendre : le choix est mémorisé, visible au coffre et pour le parent, et ne dépense aucune étoile',()=>{
 const p=kid();p.name='Liana';rewardState(p).base=-100;const before=rewardStatus(p).points;
 assert.equal(nextReward(p,'r0').id,'r1');assert.equal(chooseReward(p,'r0','save'),true);assert.equal(rewardStatus(p).points,before);
 assert.match(rewardsKid(p),/Je garde mes étoiles/);assert.match(rewardsParent(p),/garde ses étoiles pour la prochaine/);
 assert.equal(chooseReward(p,'r0','now'),true);assert.match(rewardsKid(p),/Demandée/);assert.match(rewardsParent(p),/la veut maintenant/);
 assert.equal(chooseReward(p,'r0','autre'),false);assert.equal(chooseReward(p,'inconnu','now'),false);
 assert.ok(claimReward(p,'r0'));assert.doesNotMatch(rewardsParent(p),/data-reward-claim="r0"/);
});
test('si plusieurs récompenses sont atteintes d\'un coup, la fête célèbre la plus haute une seule fois',()=>{
 const p=kid();rewardState(p).base=-600;const r=pendingCelebration(p);assert.equal(r.id,'r3');markCelebrated(p,r.id);assert.equal(pendingCelebration(p),null);
 rewardState(p).base=-1000;assert.equal(pendingCelebration(p).id,'r4');
});
