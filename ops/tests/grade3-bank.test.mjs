import test from 'node:test';import assert from 'node:assert/strict';
import {grade3Bank} from '../../src/grade3-bank.js';
import {readingBank,mathsFor} from '../../src/learning.js';
const liana={id:'p2',schoolContext:{stage:'3e année'},records:{},settings:{}};
test('banque de 3e année : cartes valides, sans réponse dans le texte',()=>{
 const cards=grade3Bank();assert.ok(cards.length>=35);
 assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
 for(const c of cards){
  assert.ok(c.choices.length>=2&&new Set(c.choices).size===c.choices.length,c.id);
  assert.ok(Number.isInteger(c.answer)&&c.choices[c.answer],c.id);
  assert.notEqual(c.text.trim().toLowerCase(),c.choices[c.answer].trim().toLowerCase(),c.id+' : la réponse est dans le texte');
 }
});
test('Liana a de quoi faire une série de 10 dans chaque matière',()=>{
 const bank=readingBank(liana);
 for(const skill of ['mots','sons','liaisons','intonation','comprehension'])assert.ok(bank.filter(q=>q.skill===skill).length>=4,skill);
 assert.ok(bank.length>=60);
});
