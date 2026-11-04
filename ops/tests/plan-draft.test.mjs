import test from 'node:test';
import assert from 'node:assert/strict';
import {issuePlanDraft,readPlanDraft} from '../server/plan-draft.mjs';
const plan={profileId:'p1',grade:1,week:'2026-11-02',tasks:[{subject:'Français',topic:'Mots',instruction:'Lire chat',words:['chat'],tables:[],operations:[],missing:false}]};
const args={key:'synthetic-only',parent:'test-parent',profile:'p1',grade:1,now:1000};
const token=issuePlanDraft({...args,digest:'a'.repeat(64),plan});
test('approval token is scoped to parent, profile, grade, key and thirty minutes',()=>{
 assert.deepEqual(readPlanDraft({...args,token}).plan,plan);
 for(const change of [{parent:'other'},{profile:'p2'},{grade:3},{key:'other'},{now:1801000},{token:'x'.repeat(50001)}])assert.throws(()=>readPlanDraft({...args,token,...change}));
});
test('editing the proposed tasks cannot authorize a changed activity',()=>{
 const [payload,signature]=token.split('.'),value=JSON.parse(Buffer.from(payload,'base64url'));
 value.plan.tasks[0].words=['autre'];
 const forged=Buffer.from(JSON.stringify(value)).toString('base64url')+'.'+signature;
 assert.throws(()=>readPlanDraft({...args,token:forged}));
});
