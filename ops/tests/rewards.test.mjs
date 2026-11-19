import test from 'node:test';import assert from 'node:assert/strict';
import {DEFAULT_REWARDS,rewardStatus,rewardPoints,claimReward,saveRewards,restartRewards,rewardsKid,rewardsParent} from '../../src/rewards.js';
const day=(n)=>`2026-11-${String(n).padStart(2,'0')}`;
const child=(good=0)=>({id:'p2',name:'Liana',history:Array.from({length:good},(_,i)=>({id:'q'+i,day:day(1+i%20),subject:'Français',result:'correct'}))});
test('les étoiles viennent du voyage (5 par bonne réponse) et font avancer le parcours',()=>{
 const p=child(10);assert.equal(rewardPoints(p),50);
 const st=rewardStatus(p);assert.equal(st.items[0].title,'McDo');assert.equal(st.next.id,'r0');assert.equal(st.next.missing,50);assert.equal(st.percent,50);
 const q=child(20);assert.equal(rewardStatus(q).items[0].reached,true);assert.equal(rewardStatus(q).waiting,0);
});
test('une récompense atteinte se remet autant de fois qu\'il y a assez d\'étoiles',()=>{
 const p=child(40);assert.equal(rewardPoints(p),200);assert.equal(claimReward(p,'r1'),false);// pas atteinte
 assert.equal(claimReward(p,'r0'),true);assert.equal(claimReward(p,'r0'),true);// McDo deux fois
 assert.equal(rewardPoints(p),0);assert.equal(claimReward(p,'r0'),false);// plus d'étoiles
 assert.equal(rewardStatus(p).items[0].times,2);assert.match(rewardsKid(p),/Reçu ×2/);
});
test('remettre une récompense retire ses étoiles du total',()=>{
 const p=child(30);assert.equal(rewardPoints(p),150);claimReward(p,'r0');assert.equal(rewardPoints(p),50);
});
test('le parent modifie la liste; les lignes invalides sont ignorées',()=>{
 const p=child(0);
 assert.equal(saveRewards(p,[{title:'  ',cost:50},{title:'Glace',cost:2},{title:'Glace',cost:50,icon:'🍦'},{title:'Zoo',cost:'300'}]),true);
 const names=rewardStatus(p).items.map(r=>r.title);assert.deepEqual(names,['Glace','Zoo']);
 assert.equal(saveRewards(p,[]),false);assert.equal(saveRewards(p,[{title:'',cost:10}]),false);assert.equal(rewardStatus(p).items.length,2);
});
test('un nouveau parcours repart à zéro sans effacer l\'historique',()=>{
 const p=child(30);claimReward(p,'r0');restartRewards(p);
 assert.equal(rewardPoints(p),0);assert.equal(p.history.length,30);assert.equal(rewardStatus(p).items.every(r=>!r.times),true);
 p.history.push({id:'neuf',day:day(25),subject:'Maths',result:'correct'});assert.equal(rewardPoints(p),5);
});
test('les pages enfant et parent affichent les récompenses sans HTML injecté',()=>{
 const p=child(20);saveRewards(p,[{title:'<img src=x onerror=alert(1)>',cost:10,icon:'<b>'}]);
 const html=rewardsKid(p)+rewardsParent(p);assert.ok(!/<img src=x/.test(html));assert.ok(html.includes('&lt;img src=x'));
 assert.equal(DEFAULT_REWARDS.length,6);
});
