// Only join visual syllable separators in syllable activities: maths keeps its operators.
export function spokenActivity(activity) {
 const text=String(activity.text??'');
 return activity.skill==='syllabes' ? text.replace(/\s*\+\s*/gu,'') : text;
}
export function chooseReadingVoice(voices, preferredURI='') {
 const french=voices.filter(v=>/^fr(?:-|_)/i.test(v.lang));
 const preferred=french.find(v=>v.voiceURI===preferredURI);
 if(preferred)return preferred;
 // Voice APIs expose no gender. Prefer familiar French voice names when present;
 // the parent can choose another voice after listening on the actual device.
 const score=v=>(/^fr[-_]CA$/i.test(v.lang)?100:0)+(/am[eé]lie|julie|sylvie|ch[aâ]ntal/i.test(v.name)?40:0)+(/enhanced|premium|améliorée/i.test(v.name)?10:0);
 return french.slice().sort((a,b)=>score(b)-score(a))[0];
}

export const readingRate = mode => mode==='very-slow' ? .45 : .65;
