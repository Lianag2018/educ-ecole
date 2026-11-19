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
 ou:'bou-ton sou-pe pou-le mou-che chou cou fou loup ours roue bou-le dou-che tou-pie fou-lard jou-et',
 on:'bon-bon mai-son pont pan-ta-lon bon son non pom-pon bal-lon ci-tron sa-von dra-gon rond pois-son lion mon-tre',
 ch:'chat cha-peau mou-che chan-son chien chou che-val chai-se ro-che ni-che va-che',
 a:'a-mi ba-na-ne pa-pa ca-rot-te sac lac chat bras ta-ble a-vi-on ar-bre bal-le',
 i:'sou-ris li-vre ti-gre mi-di ski riz vie vi-de lit ti-mi-de mi-nu-te',
 u:'lu-ne mur plu-me tu-li-pe dur rue jus ju-pe ru-ban fu-sée cu-be mu-si-que',
 f:'fée fro-ma-ge fleur fa-ri-ne fil feu fou fa-ci-le fe-nê-tre fraise four fi-ni',
 v:'va-che vé-lo ver-re vo-leur vie vol vent vase vert vi-de vi-an-de ves-te',
 m:'ma-man me-lon mou-ton mi-roir mur mer ma-da-me mu-si-que mon-tre moi pom-me ci-né-ma',
 l:'lu-ne lit la-pin li-vre lac lait loup lu-net-te sa-lon pel-le bal-le ai-le',
 s:'sac sa-pin sou-pe sa-la-de sel sou su-cre sa-lon so-leil sou-ris sa-von sor-ciè-re',
 in:'la-pin sa-pin ma-tin dau-phin pin fin lin vin pain main jar-din bien',
 eacute:'bé-bé clé fée é-co-le blé dé thé pré é-to-i-le lé-gu-me é-lé-phant é-lè-ve',
 egrave:'mè-re frè-re rè-gle lu-miè-re pè-re lè-vre piè-ge bar-riè-re fou-gè-re che-vreuil',
 o:'mo-to dos ra-di-o ro-bot mot nom pot zé-ro ro-se cho-co-lat po-ta-ge au-to',
 oopen:'pom-me por-te col-le ro-be sol col bon-ne no-te golf cor-de co-que',
 eu:'feu deux bleu jeu yeux peu heu-re peur cou-leur',
 oe:'œuf bœuf cœur sœur chœur é-cu-reuil fleur vœu nœud',
 e:'le pe-tit re-nard se-mai-ne me de ce que je re-pas ce-ri-se',
 'a-back':'pâ-te châ-teau gâ-teau bâ-ton mât tâ-che râ-teau pâ-que',
 an:'o-ran-ge dent vent en-fant banc blanc grand ten-te an-ge lam-pe chan-te gant',
 un:'un lun-di brun cha-cun com-mun au-cun jun-gle quel-qu’un',
 p:'pa-pa pom-me pou-le pi-ra-te pi-pe pa-pil-lon pat-te ta-pis plu-me pei-ne',
 b:'bal-lon ba-teau bé-bé bou-che bol bus bou-ton bou-gie ro-be',
 t:'ta-ble tor-tue ten-te to-ma-te tour toit ti-ge tas tu-que tou-pie té-lé-pho-ne',
 d:'dé do-do dou-che di-van dos doux dur dent di-no-sau-re dra-gon do-mi-no des-sin',
 k:'ca-deau col-le ki-wi qua-tre cou cuir car-te ca-ge ko-a-la ka-ra-té ka-yak',
 g:'gom-me gui-ta-re gar-de-rie go-ril-le gaz gant ga-zon gla-ce gâ-teau ma-ga-sin grand',
 n:'nei-ge nua-ge nid noix noir nez ni-che nou-veau na-ge-ur ba-na-ne ca-ne',
 gn:'mon-ta-gne li-gne a-rai-gnée cam-pa-gne si-gne pei-gne ros-si-gnol cham-pi-gnon',
 z:'zè-bre zé-ro zoo piz-za gaz zig-zag zo-ne zin-zin zé-bu',
 j:'jam-be jour ju-pe jau-ne jeu jus joue jar-din jo-li ju-meau',
 r:'ra-di-o ro-be ri-deau ru-ban riz rat roi ru-che ra-ci-ne',
 y:'a-beil-le fil-le ba-tail-le gre-nouil-le fa-mil-le pa-pil-lon bou-teil-le so-leil ail',
 w:'oi-seau boi-re poi-re voir roi moi toi voi-le toi-le',
 ui:'nuit huit fruit cui-si-ne bruit cuir pluie lui puis ap-pui'
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
export const WORDS_PER_PAGE=6;
export const wordPages=id=>Math.max(1,Math.ceil(wordsFor(id).length/WORDS_PER_PAGE));
export function wordsStepMarkup(story,idx=0,round=0){
 const all=wordsFor(story.id),pages=wordPages(story.id),at=round%pages,list=all.slice(at*WORDS_PER_PAGE,(at+1)*WORDS_PER_PAGE);
 const items=list.map(w=>`<button type="button" class="ss-word" data-lesson-word="${esc(w.plain)}" aria-label="${esc(w.plain)}">${w.syllables.map(s=>`<span>${esc(s)}</span>`).join('<i aria-hidden="true">·</i>')}</button>`).join('');
 return `<div class="ss-page ss-words" style="--ss:${story.color}"><h2 class="ss-step">👀 Lis les mots, syllabe par syllabe</h2><div class="ss-wordlist">${items}</div><p class="ss-tip" data-story-read>💡 ${esc(tipFor(idx+at))}</p>${pages>1?`<button type="button" class="ss-again" data-lesson-more>🔄 Autres mots (${at+1} / ${pages})</button>`:''}`;
}
