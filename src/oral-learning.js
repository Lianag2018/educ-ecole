import {spokenActivity} from './speech.js';
export const syllables={lapin:['la','pin'],parasol:['pa','ra','sol'],matin:['ma','tin'],quartier:['quar','tier'],école:['é','cole'],bibliothèque:['bi','bli','o','thèque'],choisis:['choi','sis'],rapporte:['rap','porte'],après:['a','près'],lecture:['lec','ture']};
export const choiceSpeech=text=>({pain:'Du pain.',main:'Une main.',chat:'Un chat.',lune:'La lune.',pomme:'Une pomme.',ou:'Le son à la fin du mot loup.',eau:'Les lettres e, a et u.',oi:'Les lettres o et i.',z:'Le son au début du mot zéro.',t:'Le son au début du mot tapis.',n:'Le son au début du mot nez.','.':'Un point.','?':'Un point d’interrogation.','!':'Un point d’exclamation.'}[text]||text);
export const oralQuestion=q=>q.prompt+' Touche le haut-parleur pour écouter chaque choix, puis touche ta réponse.';
export const oralFeedback=(q,result)=>(result==='correct'?'Bravo! Tu as trouvé. ':result==='help'?'On apprend ensemble. ':'On va essayer encore. ')+q.explanation;
export const wordLesson=word=>{const parts=syllables[word.toLocaleLowerCase('fr-CA')];return parts?parts.join('. ')+'. '+word+'.':choiceSpeech(word);};
export function decodingWords(q){return [...new Set((spokenActivity(q).match(/[\p{L}]+/gu)||[]).map(w=>w.toLocaleLowerCase('fr-CA')))].filter(w=>syllables[w]);}
