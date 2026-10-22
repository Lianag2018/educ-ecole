import {numberWords} from './numbers.js';
// Narrow grammar: never reinterpret a date, telephone number or syllable separator.
export function mathSpeech(value){
 const raw=String(value).trim();
 if(/^\d{1,4}$/.test(raw)&&Number(raw)<=1999)return numberWords(Number(raw));
 const m=raw.match(/^(\d{1,4})\s*([+−\-×÷=<>])\s*(\d{1,4})(?:\s*=\s*(\d{1,4}|\?))?\s*\??$/u);
 if(!m||[m[1],m[3],m[4]].filter(x=>x&&x!=='?').some(x=>Number(x)>1999))return raw;
 const op={'+':'plus','−':'moins','-':'moins','×':'fois','÷':'divisé par','=':'égale','<':'est plus petit que','>':'est plus grand que'}[m[2]];
 return `${numberWords(Number(m[1]))} ${op} ${numberWords(Number(m[3]))}`+(m[4]&&m[4]!=='?'?` égale ${numberWords(Number(m[4]))}`:'');
}
export const numericInstructions=' Lecture de nombres français uniquement. Chaque nombre est déjà écrit en toutes lettres : ne change aucun mot, ne traduis pas et n’ajoute aucun chiffre. Vingt seul se prononce avec la voyelle nasale de vin, sans t final; deux se prononce deux et ne remplace jamais vingt. Six seul et à la fin de cinquante-six se termine par le son s français, jamais par une prononciation anglaise. Prononce distinctement plus, moins, fois et égale. Garde une voix féminine naturelle et un débit régulier.';
