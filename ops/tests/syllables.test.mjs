import test from 'node:test';import assert from 'node:assert/strict';
import {syllabify,syllableCount} from '../../src/syllables.js';
const CASES={bibliothèque:'bi-bli-o-thè-que',lapin:'la-pin',ballon:'bal-lon',chapeau:'cha-peau',maison:'mai-son',livre:'li-vre',école:'é-co-le',jardin:'jar-din',poule:'pou-le',rose:'ro-se',tortue:'tor-tue',fée:'fée',papillon:'pa-pil-lon',montagne:'mon-ta-gne',orange:'o-ran-ge',chocolat:'cho-co-lat',journée:'jour-née',dinosaure:'di-no-sau-re',ordinateur:'or-di-na-teur',restaurant:'res-tau-rant',chat:'chat',fleur:'fleur',chien:'chien',étoile:'é-toi-le'};
test('le découpage en syllabes suit les règles d\'école',()=>{for(const [w,e] of Object.entries(CASES))assert.equal(syllabify(w).join('-'),e,w);});
test('les syllabes se recollent toujours au mot et jamais de syllabe vide',()=>{
 for(const w of ['bibliothèque','hélicoptère','grenouille','quelqu’un','pomme','arc-en-ciel','œuf','garçon','xylophone','bonjour']){const s=syllabify(w);assert.ok(s.every(Boolean),w);assert.equal(s.join('').replace(/-/g,''),w.replace(/-/g,''),w);}
 assert.equal(syllableCount('bibliothèque'),5);assert.equal(syllabify('').length,0);
});
