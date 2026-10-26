import test from 'node:test';
import assert from 'node:assert/strict';
import {mountWelcomeVideo} from '../../src/welcome-video.js';
test('welcome video respects pause, background, reduced motion and cleanup',()=>{
 const oldWindow=globalThis.window,oldDocument=globalThis.document;
 const video=new EventTarget(),toggle=new EventTarget(),reduce=new EventTarget(),doc=new EventTarget();
 let plays=0,pauses=0,loads=0;const classes=new Set();
 Object.assign(video,{play(){plays++;return Promise.resolve();},pause(){pauses++;},load(){loads++;},removeAttribute(){},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)}});
 toggle.checked=true;reduce.matches=false;doc.hidden=false;
 globalThis.window={matchMedia:()=>reduce};globalThis.document=doc;
 try{
  const mount=mountWelcomeVideo({querySelector:s=>s==='[data-welcome-video]'?video:toggle});
  assert.equal(plays,1);assert.equal(video.muted,true);assert.equal(classes.size,0);
  video.dispatchEvent(new Event('playing'));assert.ok(classes.has('welcome-video-ready'));
  toggle.checked=false;toggle.dispatchEvent(new Event('change'));assert.equal(plays,1);assert.equal(pauses,1);
  toggle.checked=true;reduce.matches=true;toggle.dispatchEvent(new Event('change'));assert.equal(plays,1);
  reduce.matches=false;reduce.dispatchEvent(new Event('change'));assert.equal(plays,2);
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(plays,2);
  video.dispatchEvent(new Event('error'));assert.equal(classes.size,0);
  mount.destroy();assert.equal(loads,1);doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));toggle.dispatchEvent(new Event('change'));assert.equal(plays,2);
 }finally{globalThis.window=oldWindow;globalThis.document=oldDocument;}
});
