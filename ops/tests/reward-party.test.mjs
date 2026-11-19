import test from 'node:test';import assert from 'node:assert/strict';
import {pendingCelebration,markCelebrated,celebrationMarkup,rewardState,claimReward,tierFor,nextReward,chooseReward,rewardStatus,rewardsKid,rewardsParent,restartRewards,syncGifts,ownerOf,giveReward,toggleAsk,resetCelebrations} from '../../src/rewards.js';
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
 assert.match(html,/data-party-now/);assert.match(html,/data-party-save/);assert.match(html,/garde tes étoiles/);assert.match(html,/utilise ses étoiles/);assert.match(html,/Parc de trampolines/);assert.match(html,/encore 130/);
 assert.doesNotMatch(celebrationMarkup({icon:'<b>',title:'<img onerror=1>'},'x'),/<img onerror/);
});
test('sans récompense suivante, un seul geste suffit',()=>{
 const html=celebrationMarkup({icon:'🏨',title:'Hôtel'},'Mely-Ann',{points:2100,next:null,tier:3});
 assert.match(html,/data-party-close/);assert.doesNotMatch(html,/data-party-save/);assert.match(html,/rp-t3/);assert.match(html,/Super récompense/);
});
test('l\'ambiance grandit avec le niveau : plus de confettis, feux d\'artifice et rayons',()=>{
 const n=(tier)=>{const h=celebrationMarkup({icon:'x',title:'y'},'z',{points:1,tier});return {c:(h.match(/class="rp-c /g)||[]).length,fw:(h.match(/class="rp-burst"/g)||[]).length};};
 assert.ok(n(1).c<n(2).c&&n(2).c<n(3).c);assert.ok(n(1).fw>=3&&n(2).fw>n(1).fw&&n(3).fw>n(2).fw);
 const p=kid();assert.deepEqual(['r0','r1','r2','r3','r4','r5'].map(id=>tierFor(p,id)),[1,1,2,2,3,3]);
});
test('garder ses étoiles ou la prendre : le choix est mémorisé, visible au coffre et pour le parent, et ne dépense aucune étoile',()=>{
 const p=kid();p.name='Liana';rewardState(p).base=-100;const before=rewardStatus(p).points;
 assert.equal(nextReward(p,'r0').id,'r1');assert.equal(chooseReward(p,'r0','save'),true);assert.equal(rewardStatus(p).points,before);
 assert.match(rewardsKid(p),/Je garde mes étoiles/);assert.match(rewardsParent(p),/garde ses étoiles pour la prochaine/);
 assert.equal(chooseReward(p,'r0','now'),true);assert.match(rewardsKid(p),/Demandée/);assert.match(rewardsParent(p),/la veut maintenant/);
 assert.equal(chooseReward(p,'r0','autre'),false);assert.equal(chooseReward(p,'inconnu','now'),false);
 assert.ok(claimReward(p,'r0'));assert.equal(rewardStatus(p).points,0);assert.doesNotMatch(rewardsParent(p),/data-reward-claim="r0"/);
});
test('si plusieurs récompenses sont atteintes d\'un coup, la fête célèbre la plus haute une seule fois',()=>{
 const p=kid();rewardState(p).base=-600;const r=pendingCelebration(p);assert.equal(r.id,'r3');markCelebrated(p,r.id);assert.equal(pendingCelebration(p),null);
 rewardState(p).base=-1000;assert.equal(pendingCelebration(p).id,'r4');
});
test('elle peut choisir une récompense de niveau inférieur déjà gagnée, et les étoiles sont retirées seulement quand le parent confirme « Remis »',()=>{
 const p=kid();p.name='Liana';rewardState(p).base=-600; // 600 étoiles : McDo, trampolines, cinéma, sushi atteints
 const top=pendingCelebration(p);assert.equal(top.id,'r3');
 const lower=rewardStatus(p).items.filter(x=>x.reached&&!x.claimed&&x.cost<top.cost);assert.deepEqual(lower.map(x=>x.id),['r0','r1','r2']);
 const html=celebrationMarkup(top,'Liana',{points:600,next:nextReward(p,top.id),tier:2,lower});
 assert.match(html,/data-party-pick="r0"/);assert.match(html,/data-party-pick="r2"/);assert.match(html,/plus petite/);assert.match(html,/data-party-later/);assert.match(html,/−100 ⭐/);
 // elle choisit le cinéma (400) : rien n'est retiré avant la confirmation
 assert.equal(chooseReward(p,'r2','now'),true);assert.equal(rewardStatus(p).points,600);assert.match(rewardsParent(p),/Remis aux deux filles ✓ \(−400 ⭐\)/);
 assert.equal(claimReward(p,'r2'),true);assert.equal(rewardStatus(p).points,200);
 const st=rewardStatus(p);assert.equal(st.items.find(x=>x.id==='r2').times,1);assert.equal(st.items.find(x=>x.id==='r3').reached,false);// le sushi n'est plus atteint
 assert.equal(st.items.find(x=>x.id==='r0').reached,true);assert.equal(claimReward(p,'r3'),false);// plus assez d'étoiles
});
test('remettre deux récompenses d\'affilée retire les deux coûts; un nouveau parcours efface les choix',()=>{
 const p=kid();rewardState(p).base=-700;assert.ok(claimReward(p,'r0'));assert.ok(claimReward(p,'r1'));assert.equal(rewardStatus(p).points,350);assert.equal(rewardState(p).spent,350);
 chooseReward(p,'r2','save');markCelebrated(p,'r2');assert.ok(restartRewards(p));
 assert.deepEqual(rewardState(p).choice,{});assert.deepEqual(rewardState(p).celebrated,{});assert.equal(rewardState(p).spent,0);assert.equal(rewardStatus(p).items.every(r=>!r.claimed),true);
});
test('la fille choisit tout de suite parmi les petites récompenses sans prochaine récompense',()=>{
 const html=celebrationMarkup({id:'r5',icon:'🏨',title:'Hôtel',cost:2000},'Mely-Ann',{points:2100,next:null,tier:3,lower:[{id:'r0',icon:'🍟',title:'McDo',cost:100}]});
 assert.match(html,/data-party-now/);assert.match(html,/data-party-pick="r0"/);assert.doesNotMatch(html,/data-party-save/);
});
test('un avion tire une banderole « Félicitations » avec le prénom de la fille, protégé contre le HTML',()=>{
 const html=celebrationMarkup({icon:'🍟',title:'McDo'},'Mely-Ann',{points:100,tier:1});
 assert.match(html,/class="rp-plane"/);assert.match(html,/Félicitations Mely-Ann!/);assert.match(html,/class="rp-fireworks"/);assert.match(html,/voyage-soeurs\.webp/);
 assert.doesNotMatch(celebrationMarkup({icon:'x',title:'y'},'<script>alert(1)</script>',{}),/<script>/);
});

const duo=()=>{const a={id:'p1',name:'Mely-Ann',history:[]},b={id:'p2',name:'Liana',history:[]};return [a,b];};
test('une récompense gagnée par une fille est donnée aux deux filles (cadeau pour la sœur, sans dépenser ses étoiles)',()=>{
 const [a,b]=duo();rewardState(a).base=-100;
 assert.equal(syncGifts([a,b]),true);assert.equal(syncGifts([a,b]),false);
 const sb=rewardStatus(b).items.find(x=>x.id==='r0');assert.equal(sb.reached,true);assert.equal(sb.own,false);assert.equal(sb.gift,'Mely-Ann');assert.equal(rewardStatus(b).points,0);
 assert.equal(pendingCelebration(b).id,'r0');assert.match(rewardsKid(b),/Cadeau de Mely-Ann/);assert.match(rewardsParent(b),/cadeau de Mely-Ann/);
 assert.equal(ownerOf([a,b],b,'r0'),a);assert.equal(ownerOf([a,b],a,'r0'),a);
});
test('« Remis » donne la récompense aux deux, retire les étoiles seulement à celle qui l\'a gagnée, même depuis la fiche de la sœur',()=>{
 const [a,b]=duo();rewardState(a).base=-300;syncGifts([a,b]);
 assert.equal(giveReward([a,b],b,'r0')?.name,'Mely-Ann');
 assert.equal(rewardStatus(a).points,200);assert.equal(rewardStatus(b).points,0);
 assert.equal(rewardStatus(a).items.find(x=>x.id==='r0').times,1);assert.equal(rewardStatus(b).items.find(x=>x.id==='r0').times,1);
 syncGifts([a,b]);assert.equal(rewardState(b).gifts?.r0,undefined);// pas de nouveau cadeau tout de suite
 assert.equal(giveReward([a,b],a,'r0')?.name,'Mely-Ann');assert.equal(rewardStatus(a).points,100);// McDo une deuxième fois, payée par la gagnante
 assert.equal(rewardStatus(b).items.find(x=>x.id==='r0').times,2);
 // le trampolines (250) est encore gagné par a (200 < 250 : non) -> pas de cadeau
 assert.equal(rewardStatus(b).items.find(x=>x.id==='r1').reached,false);
});
test('un cadeau disparaît si la fille qui l\'avait gagné dépense ses étoiles autrement',()=>{
 const [a,b]=duo();rewardState(a).base=-600;syncGifts([a,b]);assert.equal(rewardStatus(b).items.find(x=>x.id==='r3').reached,true);
 assert.equal(giveReward([a,b],a,'r2'),a);syncGifts([a,b]); // a a dépensé 400 : il lui reste 200
 assert.equal(rewardStatus(b).items.find(x=>x.id==='r3').reached,false);assert.equal(rewardStatus(b).items.find(x=>x.id==='r0').reached,true);
});
test('la fête nomme les deux filles sur la banderole; la sœur voit un cadeau sans choix',()=>{
 const mine=celebrationMarkup({icon:'🍟',title:'McDo',cost:100},'Mely-Ann',{points:100,tier:1,names:['Mely-Ann','Liana'],next:{icon:'x',title:'y',missing:5}});
 assert.match(mine,/Félicitations Mely-Ann et Liana!/);assert.match(mine,/Tu offres aussi cette récompense à Liana/);assert.match(mine,/data-party-now/);
 const gift=celebrationMarkup({icon:'🍟',title:'McDo',cost:100},'Liana',{points:0,tier:1,names:['Mely-Ann','Liana'],gift:'Mely-Ann',next:{icon:'x',title:'y',missing:5}});
 assert.match(gift,/Un cadeau de Mely-Ann!/);assert.doesNotMatch(gift,/data-party-count|0 étoiles/);assert.match(gift,/Pour toi!/);assert.match(gift,/Cadeau de Mely-Ann pour Liana!/);assert.match(gift,/Ta sœur Mely-Ann t'offre cette récompense/);assert.match(gift,/data-party-close/);assert.doesNotMatch(gift,/data-party-now|data-party-save|data-party-pick/);
});
test('l\'ouverture commence par un cadeau qui éclate dans un flash avant de révéler les filles',()=>{
 const html=celebrationMarkup({icon:'🍟',title:'McDo'},'Liana',{points:100,tier:1});
 assert.match(html,/class="rp-intro"/);assert.match(html,/class="rp-box"/);assert.match(html,/class="rp-flash"/);
 assert.ok(html.indexOf('rp-photo')<html.indexOf('rp-intro'));
});

test('c\'est la fille qui décide : elle touche une récompense gagnée pour la demander, et touche encore pour annuler',()=>{
 const p=kid();p.name='Liana';rewardState(p).base=-300;
 assert.match(rewardsKid(p),/data-reward-ask="r0"/);assert.match(rewardsKid(p),/data-reward-ask="r1"/);assert.doesNotMatch(rewardsKid(p),/data-reward-ask="r2"/);assert.match(rewardsKid(p),/c’est toi qui décides/);
 assert.equal(toggleAsk(p,'r1'),'now');assert.equal(rewardStatus(p).waiting,1);assert.match(rewardsKid(p),/Demandée/);assert.match(rewardsParent(p),/la veut maintenant/);
 assert.equal(toggleAsk(p,'r1'),'');assert.equal(rewardStatus(p).waiting,0);assert.equal(toggleAsk(p,'r4'),'');// pas gagnée : rien
 toggleAsk(p,'r0');claimReward(p,'r0');assert.equal(rewardState(p).choice.r0,undefined);// la demande disparaît à la remise
});
test('une récompense peut refaire la fête après avoir été dépensée puis regagnée',()=>{
 const p=kid();rewardState(p).base=-100;const r=pendingCelebration(p);markCelebrated(p,r.id);assert.equal(pendingCelebration(p),null);
 claimReward(p,'r0');assert.equal(resetCelebrations(p),true);// plus atteinte : on oublie la fête
 rewardState(p).base=-100+0;assert.equal(rewardStatus(p).items[0].reached,true);assert.equal(pendingCelebration(p).id,'r0');// regagnée : la fête rejoue
});
