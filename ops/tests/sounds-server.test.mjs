import test from 'node:test';import assert from 'node:assert/strict';
const {soundsEndpoint,validSoundData}=await import('../server/sounds.mjs');
const ORIGIN='https://educ-ecole.example';
const wav=Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(3000,5)]).toString('base64');
const mk=(role='parent')=>{const db=new Map(),calls=[];let ms={};
 const store={async list(p){return [...db].filter(([k])=>k.startsWith(p+'|')).map(([k,v])=>({id:k.split('|')[1],updatedAt:v.at}));},async settings(){return ms;},async get(p,id){const v=db.get(p+'|'+id);return v?{audio:v.audio,updatedAt:v.at}:null;},async put(p,id,a){const at='2026-11-23T01:00:00+00:00';db.set(p+'|'+id,{audio:a,at});calls.push(['put',id]);return at;},async remove(p,id){db.delete(p+'|'+id);calls.push(['del',id]);},async saveSettings(p,m){ms=m;}};
 const auth={authenticateParent:async()=>role==='parent'?{id:'P',role:'parent'}:null,authenticateLearner:async()=>role==='none'?null:{id:'P',role:role==='parent'?'parent':'family_device'}};
 return {ep:soundsEndpoint({auth,store,origin:ORIGIN}),db,calls};};
const req=(path,body,over={})=>({method:'POST',path,headers:{origin:ORIGIN},body,...over});
test('le parent écrit, la tablette autorisée lit',async()=>{
 const p=mk('parent');assert.equal((await p.ep(req('/api/sounds/put',{id:'ou',audio:wav}))).status,200);
 assert.deepEqual((await p.ep(req('/api/sounds/list',{}))).body.sounds.map(s=>s.id),['ou']);
 const t=mk('device');t.db.set('P|ou',{audio:wav,at:'x'});
 assert.equal((await t.ep(req('/api/sounds/list',{}))).status,200);assert.equal((await t.ep(req('/api/sounds/get',{id:'ou'}))).body.audio,wav);
});
test('une tablette autorisée ne peut jamais écrire, ni effacer, ni changer les durées',async()=>{
 const t=mk('device');
 for(const [path,body] of [['/api/sounds/put',{id:'ou',audio:wav}],['/api/sounds/delete',{id:'ou'}],['/api/sounds/settings',{ms:{ou:400}}]])assert.equal((await t.ep(req(path,body))).status,401,path);
 assert.equal(t.calls.length,0);
});
test('sans connexion, mauvaise origine ou méthode : refus',async()=>{
 assert.equal((await mk('none').ep(req('/api/sounds/list',{}))).status,401);
 assert.equal((await mk('parent').ep(req('/api/sounds/list',{},{headers:{origin:'https://autre.example'}}))).status,403);
 assert.equal((await mk('parent').ep(req('/api/sounds/list',{},{method:'GET'}))).status,405);
 assert.equal((await mk('parent').ep(req('/api/sounds/inconnu',{}))).status,404);
});
test('données invalides refusées (identifiant, taille, format, champs en trop, durées hors limites)',async()=>{
 const p=mk('parent');
 for(const body of [{id:'OU',audio:wav},{id:'../x',audio:wav},{id:'ou',audio:'AAAA'},{id:'ou',audio:'pas du base64!!'},{id:'ou',audio:wav,extra:1},{id:'ou',audio:Buffer.alloc(500000).toString('base64')}])assert.equal((await p.ep(req('/api/sounds/put',body))).status,400,JSON.stringify(body).slice(0,40));
 assert.equal((await p.ep(req('/api/sounds/settings',{ms:{ou:100}}))).status,400);assert.equal((await p.ep(req('/api/sounds/settings',{ms:{ou:400}}))).status,200);
 assert.equal(validSoundData(wav),true);assert.equal(validSoundData(''),false);
});
test('un son absent donne 404 et une panne de stockage donne 503 sans détail',async()=>{
 const p=mk('parent');assert.equal((await p.ep(req('/api/sounds/get',{id:'zz'}))).status,404);
 const bad=soundsEndpoint({auth:{authenticateParent:async()=>({id:'P',role:'parent'}),authenticateLearner:async()=>({id:'P',role:'parent'})},store:{list:async()=>{throw Error('SECRET detail');}},origin:ORIGIN});
 const r=await bad(req('/api/sounds/list',{}));assert.equal(r.status,503);assert.ok(!JSON.stringify(r.body).includes('SECRET'));
});
