import test from 'node:test';
import assert from 'node:assert/strict';
import {teachingInstructions,narrationInstructions} from '../server/pedagogy.mjs';
import {createTurnEndpoint} from '../server/turn.mjs';
test('grade-specific guidance keeps transcription uncertainty and Québec pronunciation',()=>{
 assert.match(teachingInstructions('1re année'),/Une seule consigne/);
 assert.match(teachingInstructions('2e année'),/groupes de mots/);
 assert.match(teachingInstructions('3e année'),/inférences/);
 for(const grade of ['1re année','2e année','3e année']){
  assert.match(teachingInstructions(grade),/variantes québécoises/);
  assert.match(teachingInstructions(grade),/pas une analyse acoustique/);
  assert.match(teachingInstructions(grade),/jamais une réussite inventée/);
 }
});
test('narration direction distinguishes storytelling and sound practice',()=>{
 assert.match(narrationInstructions('story'),/Conteuse expressive/);
 assert.match(narrationInstructions('practice'),/sans ajouter de syllabe/);
 assert.match(narrationInstructions(),/Voix féminine/);
});
