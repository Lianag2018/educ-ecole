import test from 'node:test';
import assert from 'node:assert/strict';
import {schoolCredentialsEndpoint} from '../server/school-credentials.mjs';
import {runtime} from '../server/runtime.mjs';
const origin='https://school.example.test';
const raw=JSON.stringify({p1:{nougat:{group:'synthetic-group',username:'synthetic-student',password:'synthetic-é',extra:'never-return'}},p2:{cec:{username:'other-student',password:'other-secret'}}});
const parent={id:'parent',role:'parent',emailVerified:true,recentLogin:true,csrfVerified:true};
const req={method:'POST',headers:{origin},body:{profileId:'p1',resource:'nougat'}};
const deps=identity=>({origin,secrets:{p1:{nougat:JSON.stringify(JSON.parse(raw).p1.nougat)},p2:{cec:JSON.stringify(JSON.parse(raw).p2.cec)}},auth:{authenticateParent:async()=>identity}});
test('school passwords require a recent verified parent and same-origin POST',async()=>{
 for(const identity of [null,{...parent,role:'learner'},{...parent,recentLogin:false},{...parent,emailVerified:false},{...parent,csrfVerified:false}]){
  const r=await schoolCredentialsEndpoint(req,deps(identity));assert.equal(r.status,401);assert.doesNotMatch(JSON.stringify(r),/synthetic|other-secret/);
 }
 for(const patch of [{method:'GET'},{headers:{origin:'https://wrong.example.test'}},{headers:{}}]){
  const r=await schoolCredentialsEndpoint({...req,...patch},deps(parent));assert.ok([403,405].includes(r.status));assert.doesNotMatch(JSON.stringify(r),/synthetic/);
 }
});
test('credential response selects one allowed profile/resource, exact fields, and disables caching',async()=>{
 const r=await schoolCredentialsEndpoint(req,deps(parent));assert.equal(r.status,200);assert.equal(r.headers['Cache-Control'],'no-store');
 assert.deepEqual(r.body.values,{group:'synthetic-group',username:'synthetic-student',password:'synthetic-é'});
 const other=await schoolCredentialsEndpoint({...req,body:{profileId:'p2',resource:'cec'}},deps(parent));assert.equal(other.body.values.username,'other-student');
 for(const body of [{profileId:'p2',resource:'nougat'},{profileId:'p1',resource:'cec'},{profileId:'p1',resource:'nougat',parentId:'forged'}])assert.equal((await schoolCredentialsEndpoint({...req,body},deps(parent))).status,400);
 for(const value of ['broken','{}',JSON.stringify({p1:{nougat:{password:'partial'}}})])assert.equal((await schoolCredentialsEndpoint(req,{...deps(parent),secrets:{p1:{nougat:value}}})).status,404);
});
test('production runtime never exposes stored school credentials to an anonymous request',async()=>{
 const handle=runtime({EDUC_ORIGIN:origin,EDUC_SCHOOL_P1_NOUGAT_CREDENTIALS:JSON.stringify(JSON.parse(raw).p1.nougat)},async()=>{throw Error('must not call provider');});
 const r=await handle({...req,path:'/api/parent/school-access'});assert.equal(r.status,401);assert.doesNotMatch(JSON.stringify(r),/synthetic/);
});
