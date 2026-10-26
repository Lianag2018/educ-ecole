import {spokenActivity} from './speech.js';
// Oral visual cues, never separate TTS inputs. Doubled spelling consonants are
// not doubled in speech: rapporte has the oral pieces ra / porte.
export const syllables={midi:['mi','di'],moto:['mo','to'],salami:['sa','la','mi'],domino:['do','mi','no'],lavabo:['la','va','bo'],tomate:['to','mate'],lapin:['la','pin'],parasol:['pa','ra','sol'],matin:['ma','tin'],quartier:['quar','tier'],école:['é','cole'],bibliothèque:['bi','bli','o','thèque'],choisis:['choi','sis'],rapporte:['ra','porte'],après:['a','près'],lecture:['lec','ture']};
const wordModels=Object.freeze({midi:'Il est midi. Midi.',moto:'Une moto. Moto.',salami:'Du salami. Salami.',domino:'Un domino. Domino.',lavabo:'Le lavabo. Lavabo.',tomate:'Une tomate. Tomate.',lapin:'Un lapin. Lapin.',parasol:'Un parasol. Parasol.',matin:'Le matin. Matin.',quartier:'Le quartier. Quartier.',école:'Une école. École.',bibliothèque:'La bibliothèque. Bibliothèque.',choisis:'Tu choisis. Choisis.',rapporte:'Rapporte le livre. Rapporte.',après:'Après la lecture. Après.',lecture:'La lecture. Lecture.'});
export const isFrenchWordModel=text=>Object.values(wordModels).includes(text)||/^Écoute le mot : [\p{L}’' -]+\.$/u.test(text);
export const choiceSpeech=text=>({pain:'Du pain.',main:'Une main.',chat:'Un chat.',lune:'La lune.',pomme:'Une pomme.',ou:'Le son à la fin du mot loup.',eau:'Les lettres e, a et u.',oi:'Les lettres o et i.',z:'Le son au début du mot zéro.',t:'Le son au début du mot tapis.',n:'Le son au début du mot nez.','.':'Un point.','?':'Un point d’interrogation.','!':'Un point d’exclamation.'}[text]||(/^[\p{L}’'-]+$/u.test(String(text))?wordLesson(text):text));
export const oralQuestion=q=>{
 const lesson=q.introLesson??q.lesson;
 return (lesson?lesson+' ':'')+(q.oralPrompt||q.prompt)+' Touche le haut-parleur pour écouter chaque choix, puis touche ta réponse.';
};
export const oralFeedback=(q,result)=>(result==='correct'?'Bravo! Tu as trouvé. ':result==='help'?'On apprend ensemble. ':'On va essayer encore. ')+q.explanation;
export const wordLesson=word=>wordModels[word.toLocaleLowerCase('fr-CA')]||`Écoute le mot : ${word}.`;
export function decodingWords(q){return [...new Set((spokenActivity(q).match(/[\p{L}]+/gu)||[]).map(w=>w.toLocaleLowerCase('fr-CA')))].filter(w=>syllables[w]);}
