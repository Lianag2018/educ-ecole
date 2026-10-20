import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {staticFiles} from '../educ-ecole-vercel.mjs';
const root=new URL('../../',import.meta.url);
test('standalone manifest, approved icon and exact iPad/icon sizes',async()=>{
 const m=JSON.parse(await readFile(new URL('manifest.webmanifest',root)));assert.equal(m.display,'standalone');assert.equal(m.name,'L’Atelier des mots');assert.equal(m.lang,'fr-CA');assert.equal(m.scope,'./');assert.equal(m.start_url,'./');
 const names=[['hibou-512',512],['apple-touch-icon',180],['icon-192',192],['favicon',32]];
 for(const [name,size]of names){const b=await readFile(new URL('icons/'+name+'.png',root));assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(b.readUInt32BE(16),size);assert.equal(b.readUInt32BE(20),size);}
 const html=await readFile(new URL('index.html',root),'utf8');assert.match(html,/apple-touch-icon/);assert.match(html,/apple-mobile-web-app-capable/);assert.match(html,/manifest.webmanifest/);
 const original=await readFile(new URL('icons/hibou-512.png',root));assert.equal(createHash('sha256').update(original).digest('hex'),'2edb21a6aba5d1fb0fc86329f27484f8d6d56692b1338c31f78c6ea10a91b2ae');
});
test('Vercel static allowlist includes icons/manifest and excludes API/server/ops',async()=>{
 await assert.rejects(staticFiles(root));
});

test('public upload contains approved PNGs and manifest, never server code',async()=>{
 const path=await mkdtemp('/tmp/atelier-public-');
 try{await mkdir(path+'/icons');await mkdir(path+'/src');
 for(const f of ['index.html','manifest.webmanifest','icons/hibou-512.png','icons/apple-touch-icon.png','icons/icon-192.png','icons/favicon.png','src/app.js'])await writeFile(path+'/'+f,await readFile(new URL(f,root)));
 const files=await staticFiles(new URL('file://'+path+'/'));assert.equal(files.length,7);assert.ok(files.find(f=>f.file==='icons/apple-touch-icon.png'));assert.ok(files.find(f=>f.file==='manifest.webmanifest'));
 await mkdir(path+'/api');await writeFile(path+'/api/private.mjs','secret-test');await assert.rejects(staticFiles(new URL('file://'+path+'/')));
 }finally{await rm(path,{recursive:true,force:true});}
});
