import {photoDimensions} from '../../src/school-photo-image.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {checkedPhotoBatch,photoAssociation,saveSchoolPhotos,listSchoolPhotos,getSchoolPhoto} from '../../src/school-photo-store.js';
import {schoolPhotosPanel,photoWeek,photoSizeLabel} from '../../src/school-photos.js';
import {fresh} from '../../src/engine.js';
const jpeg=()=>new Blob([new Uint8Array([255,216,255,...Array(110).fill(0)])],{type:'image/jpeg'});
const association={profileId:'p1',week:'2026-10-26',subject:'Français',game:'vocabulary',kind:'words',title:'Mes mots',note:'Première liste'};
test('each image has an explicit child, valid week, document kind and subject-compatible game',()=>{
 assert.deepEqual(photoAssociation(association,'p1'),association);
 for(const change of [{profileId:'p2'},{week:'2026-02-30'},{week:''},{game:''},{game:'maths'},{subject:'Maths'},{kind:'zip'},{title:' '},{note:'x'.repeat(301)}])assert.throws(()=>photoAssociation({...association,...change},'p1'),/association_invalid/);
 assert.throws(()=>photoAssociation(association,'p2'),/association_invalid/);
 assert.equal(photoAssociation({...association,subject:'Maths',game:'numbers',kind:'book'},'p1').game,'numbers');
});
test('a batch validates every image before opening storage and never changes existing profile results',async()=>{
 const state=fresh(),before=JSON.stringify(state),photos=[{...association,blob:jpeg()}];
 const checked=await checkedPhotoBatch('p1',photos);assert.equal(checked.length,1);assert.equal(checked[0].blob,photos[0].blob);
 let opens=0;const old=Object.getOwnPropertyDescriptor(globalThis,'indexedDB');Object.defineProperty(globalThis,'indexedDB',{configurable:true,value:{open(){opens++;throw Error('should not open');}}});
 try{
  await assert.rejects(saveSchoolPhotos('p1',[...photos,{...association,profileId:'p2',blob:jpeg()}]),/association_invalid/);
  await assert.rejects(saveSchoolPhotos('p1',[...photos,{...association,blob:new Blob(['<svg>bad</svg>'],{type:'image/jpeg'})}]),/photo_invalid/);
  assert.equal(opens,0);
 }finally{if(old)Object.defineProperty(globalThis,'indexedDB',old);else delete globalThis.indexedDB;}
 assert.equal(JSON.stringify(state),before);
});
test('photos reject ZIPs, wrong MIME, oversized images and batches, with profile-bound reads',async()=>{
 for(const photos of [[],Array(9).fill({...association,blob:jpeg()})])await assert.rejects(checkedPhotoBatch('p1',photos),/photos_required/);
 for(const blob of [new Blob([new Uint8Array(1200001)],{type:'image/jpeg'}),new Blob(['PK archive'],{type:'application/zip'}),new Blob(['bad image'.repeat(20)],{type:'image/jpeg'})])await assert.rejects(checkedPhotoBatch('p1',[{...association,blob}]),/photo_invalid/);
 assert.deepEqual(await listSchoolPhotos('unknown'),[]);assert.equal(await getSchoolPhoto('unknown','photo-example'),null);
});
test('parent import offers photos and camera with a visible storage limit; child view has no import controls',()=>{
 const p={id:'p1',name:'<M & A>',schoolContext:{stage:'1re année'}};
 const html=schoolPhotosPanel(p);assert.match(html,/type="file" accept="image\/jpeg,image\/png,image\/webp" multiple/);assert.match(html,/capture="environment"/);assert.match(html,/Asssocie|Associe/);assert.match(html,/ne sont pas envoyées à OpenAI/);assert.ok(html.includes('&lt;M &amp; A&gt;'));assert.ok(!html.includes('.zip'));
 const child=schoolPhotosPanel(p,{parent:false});assert.ok(!child.includes('type="file"'));assert.ok(!child.includes('data-photo-form'));assert.match(child,/Mes photos de devoirs/);
});
test('default school week uses local Monday across week and year boundaries',()=>{
 assert.equal(photoWeek(new Date(2026,9,28,12)),'2026-10-26');assert.equal(photoWeek(new Date(2026,9,25,12)),'2026-10-19');assert.equal(photoWeek(new Date(2027,0,1,12)),'2026-12-28');
});

test('photo optimization preserves aspect ratio, never enlarges, and reports actual bytes saved',()=>{
 assert.deepEqual(photoDimensions(4000,3000),{width:2000,height:1500});
 assert.deepEqual(photoDimensions(600,800),{width:600,height:800});
 assert.deepEqual(photoDimensions(3000,4000),{width:1500,height:2000});
 assert.throws(()=>photoDimensions(10000,10000),/photo_invalid/);
 assert.throws(()=>photoDimensions(0,800),/photo_invalid/);
 assert.match(photoSizeLabel({bytes:100000,originalBytes:1000000,width:1500,height:2000}),/90 %/);
 assert.ok(!photoSizeLabel({bytes:100000,originalBytes:10000}).includes('économisée'));
});
