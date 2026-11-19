// Leçon d'un son en cinq temps, adaptée de la démarche pédagogique de l'école : (1) voir et entendre l'histoire, (2) faire le GESTE avec le bruit,
// (3) lire quelques MOTS en les découpant en syllabes, (4) jouer l'activité, (5) réinvestir par la dictée magique.
// Tous les gestes et textes sont reformulés avec nos mots (le livre de l'école reste privé à la famille).
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const LESSON_STEPS=2;
export const gestures=Object.freeze({
 ou:['👻','Bouge les bras comme un fantôme fatigué et étire le son : « ou-ou-ou ».'],
 on:['🙊','Pose une main sur ta bouche, l’air désolé, et dis : « onnn ».'],
 ch:['🤫','Mets ton doigt devant ta bouche pour calmer un bébé : « chchch ».'],
 a:['😮','Ouvre grand la bouche, une main sur la joue, comme avec un mal de dents : « aaaa ».'],
 i:['🐭','Étire un grand sourire et fais le petit cri de la souris : « i-i, i-i ».'],
 u:['🐴','Secoue des rênes imaginaires devant toi : « u-u ».'],
 f:['🚲','Pompe un pneu de vélo avec tes mains : « f-f-f-f ».'],
 v:['🚢','Tire une corde de haut en bas comme la sirène d’un bateau : « vvvv-vvvv ».'],
 m:['😋','Frotte ton ventre en petits ronds : « mmm, c’est bon ».'],
 l:['❄️','Penche la tête en arrière et montre où va ta langue : « lllll ».'],
 s:['🐍','Fais onduler ta main en traçant un s, comme un serpent : « sssss ».'],
 in:['📺','Appuie sur un gros bouton imaginaire avec ta paume : « in! ».'],
 eacute:['🚴','Tiens un guidon, lève les yeux vers le haut de la côte : « héééé, hop! ».'],
 egrave:['😱','Regarde vers le bas d’une pente imaginaire et crie : « èèèèè! ».'],
 o:['🎅','Fais une bouche bien ronde et ris comme le père Noël : « oh-oh-oh ».'],
 oopen:['🍎','Arrondis la bouche un peu moins grand et dis « o » comme dans « pomme ».'],
 eu:['☝️','Lève le bras, pointe l’index vers de faux coupables : « eu-eu-eu ».'],
 oe:['🤔','Pose le menton sur tes mains comme quelqu’un qui cherche : « eu… ».'],
 e:['🧠','Cherche dans ta tête en fermant les yeux : « eee… eee… ».'],
 'a-back':['🥱','Ouvre la bouche haute et profonde, comme un bâillement : « âââ ».'],
 an:['🚶','Appuie une main sur une marchette imaginaire, l’autre en cornet à l’oreille : « an-an-an ».'],
 un:['☝️','Lève un seul doigt et dis : « un ».'],
 p:['🚤','Tire la corde du moteur de la chaloupe : « p-p-p, p-p-p-p-p ».'],
 b:['🤭','Une main sur le ventre, fais de tout petits hoquets : « b-b-b ».'],
 t:['🥁','Tape sur un tambour imaginaire : « t-t-t, t-t-t ».'],
 d:['🎲','Lance des dés dans les airs en bégayant : « d-d-d-d ».'],
 k:['🪵','Casse une petite branche entre tes mains : « k! ».'],
 g:['🥤','Fais semblant de boire en avalant : « g-g-g-g ».'],
 n:['😠','Secoue la tête et le doigt comme une gardienne fâchée : « n-n-n ».'],
 gn:['😝','Plisse le nez, pouce sur la tempe, et chantonne en te moquant : « gn-gn-gn ».'],
 z:['🐝','Trace un z dans l’air avec le doigt comme une abeille : « zzzzz ».'],
 j:['🪒','Fais semblant de passer un rasoir électrique sur ta joue : « jjjjj ».'],
 r:['🦁','Fais la patte d’un lion qui gronde : « rrr-rrr ».'],
 y:['🦖','Fais deux ou trois antennes avec tes doigts derrière ta tête et cligne des yeux : « i-e, i-e ».'],
 w:['🪿','Mets tes mains en cornet autour de la bouche et appelle l’oie : « oi-oi, oi-oi ».'],
 ui:['💧','Touche ton nez comme si une goutte tombait et dis : « ui, ui! ».']
});
// Quatre mots par son, découpés en syllabes avec des tirets. Mots courants.
export const lessonWords=Object.freeze({
 ou:'bou-ton sou-pe pou-le mou-che',on:'bon-bon mai-son pont pan-ta-lon',ch:'chat cha-peau mou-che chan-son',a:'a-mi ba-na-ne pa-pa ca-rot-te',
 i:'sou-ris li-vre ti-gre mi-di',u:'lu-ne mur plu-me tu-li-pe',f:'fée fro-ma-ge fleur fa-ri-ne',v:'va-che vé-lo ver-re vo-leur',
 m:'ma-man me-lon mou-ton mi-roir',l:'lu-ne lit la-pin li-vre',s:'sac sa-pin sou-pe sa-la-de',in:'la-pin sa-pin ma-tin dau-phin',
 eacute:'bé-bé clé fée é-co-le',egrave:'mè-re frè-re rè-gle lu-miè-re',o:'mo-to dos ra-di-o ro-bot',oopen:'pom-me por-te col-le ro-be',
 eu:'feu deux bleu jeu',oe:'œuf bœuf cœur sœur',e:'le pe-tit re-nard se-mai-ne','a-back':'pâ-te châ-teau gâ-teau bâ-ton',
 an:'o-ran-ge dent vent en-fant',un:'un lun-di brun cha-cun',p:'pa-pa pom-me pou-le pi-ra-te',b:'bal-lon ba-teau bé-bé bou-che',
 t:'ta-ble tor-tue ten-te to-ma-te',d:'dé do-do dou-che di-van',k:'ca-deau col-le ki-wi qua-tre',g:'gom-me gui-ta-re gar-de-rie go-ril-le',
 n:'nei-ge nua-ge nid noix',gn:'mon-ta-gne li-gne a-rai-gnée cam-pa-gne',z:'zè-bre zé-ro zoo piz-za',j:'jam-be jour ju-pe jau-ne',
 r:'ra-di-o ro-be ri-deau ru-ban',y:'a-beil-le fil-le ba-tail-le gre-nouil-le',w:'oi-seau boi-re poi-re voir',ui:'nuit huit fruit cui-si-ne'
});
// Conseils de lecture (reformulés) : on en montre un différent selon le son.
export const readingTips=Object.freeze([
 'Si le mot ne sonne pas comme un mot que tu connais, des lettres ont peut-être mal parlé. Regarde-le autrement!',
 'Découpe le mot en syllabes en tapant dans tes mains : ba-na-ne. Une tape, une syllabe.',
 'Deux lettres pareilles, comme nn ou mm, sont des jumeaux : ils restent ensemble et ne changent pas le son d’avant.',
 'Cherche d’abord les lettres qui vont ensemble, comme ou, on ou ch, avant de lire lettre par lettre.']);
export const gestureFor=id=>gestures[id]||['🖐️','Invente un geste pour ce son et dis-le bien fort.'];
export const wordsFor=id=>(lessonWords[id]||'').split(' ').filter(Boolean).map(w=>({syllables:w.split('-'),plain:w.replace(/-/g,'')}));
export const tipFor=idx=>readingTips[Math.abs(idx)%readingTips.length];
export const gestureText=id=>gestureFor(id)[1];
export const lessonNarrationLines=id=>[gestureText(id)];
export function gestureStepMarkup(story){
 const [icon,text]=gestureFor(story.id);
 return `<div class="ss-page ss-gesture" style="--ss:${story.color}"><button type="button" class="ss-scene" data-story-read aria-label="Relire le geste">${icon}<i class="ss-ear" aria-hidden="true">🔊</i></button><h2 class="ss-step">✋ Fais le geste du son « ${esc(story.label||story.sound)} »</h2><p class="ss-text">${esc(text)}</p><button type="button" class="ss-go" data-story-gesture>✋ Je l’ai fait!</button>`;
}
export function wordsStepMarkup(story,idx=0){
 const items=wordsFor(story.id).map(w=>`<button type="button" class="ss-word" data-lesson-word="${esc(w.plain)}" aria-label="${esc(w.plain)}">${w.syllables.map(s=>`<span>${esc(s)}</span>`).join('<i aria-hidden="true">·</i>')}</button>`).join('');
 return `<div class="ss-page ss-words" style="--ss:${story.color}"><h2 class="ss-step">👀 Lis les mots, syllabe par syllabe</h2><div class="ss-wordlist">${items}</div><p class="ss-tip" data-story-read>💡 ${esc(tipFor(idx))}</p>`;
}
