import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tableFacts,tableRound,tableSongs} from '../../src/table-songs.js';
import {subjectHome} from '../../src/child-navigation.js';
import {fresh} from '../../src/engine.js';
test('all tables cover zero through ten and every round reaches every fact',()=>{for(let t=1;t<=10;t++){assert.deepEqual(tableFacts(t).map(f=>f.total),Array.from({length:11},(_,i)=>i*t));assert.equal(new Set(Array.from({length:4},(_,r)=>tableRound(t,r)).flat().map(f=>f.groups)).size,11);}assert.throws(()=>tableFacts(0));assert.throws(()=>tableFacts(11));});
test('requested song and profile separation',()=>{assert.equal(tableSongs[1],'g5EoCRYHgQQ');assert.equal(tableSongs[3],'eEtHFttLJyo');const {profiles}=fresh();assert.doesNotMatch(subjectHome(profiles[0],'maths'),/data-action="table-songs"/);assert.match(subjectHome(profiles[1],'maths'),/data-action="table-songs"/);});
