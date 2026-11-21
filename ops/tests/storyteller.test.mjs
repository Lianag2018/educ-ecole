import test from 'node:test';import assert from 'node:assert/strict';
const {splitForTelling,classify,tell,KIND_PARAMS}=await import('../../src/storyteller.js');
test('chaque phrase reçoit l’expression de son sens',()=>{
 assert.equal(classify('Il était une fois une petite fille.'),'narration');
 assert.equal(classify('Où vas-tu, petit lapin ?'),'question');
 assert.equal(classify('Quelle belle surprise !'),'exclaim');
 assert.equal(classify('« Viens jouer avec moi », dit le chat.'),'dialogue');
 assert.equal(classify('Et là, tout à coup...'),'trail');
 assert.equal(classify('(Chut, ne réveille pas le bébé.)'),'whisper');
});
test('le texte est découpé en phrases avec leur position et de vraies pauses; jamais de pause après la dernière',()=>{
 const t='Le chat dort. Dors-tu aussi ? Oui ! Et puis...';const s=splitForTelling(t);
 assert.deepEqual(s.map(x=>x.kind),['narration','question','exclaim','trail']);
 for(const x of s)assert.equal(t.slice(x.start,x.start+x.text.length),x.text);
 assert.ok(s.slice(0,-1).every(x=>x.pause>=500));assert.equal(s.at(-1).pause,0);
 assert.deepEqual(splitForTelling('   '),[]);assert.deepEqual(splitForTelling('...'),[]);
});
test('une réplique entre guillemets est lue à part, sans les guillemets, et sa suite reste avec la narration',()=>{
 const t='Le loup appelle. « Maman ! » crie-t-il. « Où es-tu ? » Il pleure.';const s=splitForTelling(t);
 assert.deepEqual(s.map(x=>[x.text,x.kind]),[['Le loup appelle.','narration'],['Maman !','exclaim'],['crie-t-il.','narration'],['Où es-tu ?','question'],['Il pleure.','narration']]);
 for(const x of s)assert.equal(t.slice(x.start,x.start+x.text.length),x.text);
 assert.equal(s[1].pause,220,'court silence avant « crie-t-il »');assert.ok(s[3].pause>=500);
 assert.equal(splitForTelling('« Bonjour, dit-elle').at(0).kind,'dialogue');
});
test('toutes les voix restent douces : débit lent, hauteur et volume mesurés',()=>{
 for(const [k,p] of Object.entries(KIND_PARAMS)){assert.ok(p.rate>=.7&&p.rate<=.9,k+' débit');assert.ok(p.pitch>=.9&&p.pitch<=1.12,k+' hauteur');assert.ok(p.volume>=.6&&p.volume<=1,k+' volume');assert.ok(p.pause>=500,k+' pause');}
 assert.ok(KIND_PARAMS.whisper.volume<KIND_PARAMS.narration.volume);assert.ok(KIND_PARAMS.question.pitch>KIND_PARAMS.narration.pitch);
});
test('la lecture enchaîne les phrases dans l’ordre, avec le surlignage décalé, et peut être arrêtée',async()=>{
 const said=[],prog=[],states=[],timers=[];let cur=null;
 const h=tell('Un. Deux ? Trois !',{speakOne:(seg,cb)=>{said.push(seg.text);cur=cb;cb.onProgress({charIndex:1});},onProgress:e=>prog.push(e.charIndex),onState:(s)=>states.push(s),schedule:(f)=>{timers.push(f);return timers.length;},cancel:()=>{}});
 assert.deepEqual(said,['Un.']);cur.onState('ended');timers.shift()();assert.deepEqual(said,['Un.','Deux ?']);
 assert.deepEqual(prog,[1,5],'le surlignage tient compte de la position de la phrase dans le texte');
 h.stop();cur.onState('ended');assert.equal(timers.length,0,'arrêtée : plus rien ne suit');assert.deepEqual(said,['Un.','Deux ?']);
 const said2=[];let c2=null;const st2=[];tell('Seule phrase.',{speakOne:(seg,cb)=>{said2.push(seg.text);c2=cb;},onState:s=>st2.push(s)});c2.onState('ended');assert.deepEqual(st2,['ended']);
});
