// Histoires des sons : de courts contes originaux, racontés page par page par la narratrice, puis une activité par son.
// Contenu 100 % original (aucun texte ni dessin d'éditeur). Les mots qui contiennent le son sont mis en couleur.
// La mise en couleur suit les mots, pas les syllabes : on ne prétend pas montrer la prononciation exacte.
import {moreStories} from './sound-stories-more.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// page = [texte raconté, scène en émojis, mots du son à colorer]
const stories=[
 {id:'ou',sound:'ou',title:'Loulou le loup',cover:'🐺',color:'#7452a8',intro:'Une histoire pour entendre le son ou.',
  pages:[
   ['Loulou le loup habite dans un trou, tout près d’un gros chou.','🐺🕳️🥬',['Loulou','loup','trou','tout','chou']],
   ['Chaque soir, il entend un hibou qui fait : hou, hou, hou !','🦉🌙',['hibou','hou']],
   ['Loulou a un peu peur. Il court vers sa cousine la poule.','🐺🏃🐔',['Loulou','court','cousine','poule']],
   ['Doucement, la poule lui dit : « N’aie pas peur, c’est juste un hibou ! »','🐔💬🦉',['Doucement','poule','hibou']],
   ['Alors Loulou rit tout doux, et il invite le hibou à manger un chou.','🐺😄🦉🥬',['Loulou','tout','doux','hibou','chou']],
   ['Depuis ce jour, ils sont de bons amis. Bravo, Loulou !','🐺🤝🦉',['jour','Loulou']]],
  words:['loup','hibou','trou','chou','clou','genou','poule'],
  activity:[
   {skill:'sons',prompt:'Quel mot contient le son « ou »?',text:'Écoute bien le milieu du mot.',right:'hibou',others:['chat','lune'],explanation:'Dans hibou, on entend « ou » à la fin. Les lettres o et u se lisent ensemble.'},
   {skill:'comprehension',prompt:'Où habite Loulou?',text:'Loulou le loup habite dans un trou, tout près d’un gros chou.',right:'dans un trou',others:['dans un arbre','dans une maison'],explanation:'Dans l’histoire : Loulou habite dans un trou.'},
   {skill:'sons',prompt:'Quel mot rime avec « hibou »?',text:'hibou',right:'trou',others:['lune','balle'],explanation:'Hibou et trou finissent par le même son : « ou ».'},
   {skill:'comprehension',prompt:'Qui fait « hou, hou, hou » le soir?',text:'Chaque soir, il entend un hibou qui fait : hou, hou, hou !',right:'un hibou',others:['une poule','un chou'],explanation:'Dans l’histoire : c’est un hibou qui fait hou, hou, hou.'}]},
 {id:'on',sound:'on',title:'Le ballon de Léon',cover:'🎈',color:'#e0603a',intro:'Une histoire pour entendre le son on.',
  pages:[
   ['Léon le lion a un gros ballon rond.','🦁🎈',['Léon','lion','ballon','rond']],
   ['Son ballon monte, monte, monte… jusqu’au plafond !','🎈⬆️🏠',['Son','ballon','monte','plafond']],
   ['Léon n’est pas content. Il appelle son oncle.','🦁😟📞',['Léon','content','son','oncle']],
   ['Son oncle monte sur une chaise et attrape le ballon.','👨🪑🎈',['Son','oncle','monte','ballon']],
   ['Merci, mon oncle ! dit Léon. Tu es vraiment très bon.','🦁🤗👨',['mon','oncle','Léon','bon']]],
  words:['ballon','savon','pont','mouton','citron','oncle'],
  activity:[
   {skill:'sons',prompt:'Quel mot contient le son « on »?',text:'Écoute bien la fin du mot.',right:'ballon',others:['lune','chat'],explanation:'Dans ballon, on entend « on » à la fin. Les lettres o et n se lisent ensemble.'},
   {skill:'comprehension',prompt:'Où va le ballon de Léon?',text:'Son ballon monte, monte, monte… jusqu’au plafond !',right:'Il monte jusqu’au plafond',others:['Il roule dehors','Il éclate'],explanation:'Dans l’histoire : le ballon monte jusqu’au plafond.'},
   {skill:'comprehension',prompt:'Qui aide Léon?',text:'Son oncle monte sur une chaise et attrape le ballon.',right:'son oncle',others:['sa tante','le chat'],explanation:'Dans l’histoire : son oncle attrape le ballon.'},
   {skill:'sons',prompt:'Quel mot rime avec « ballon »?',text:'ballon',right:'savon',others:['lune','sac'],explanation:'Ballon et savon finissent par le même son : « on ».'}]},
 {id:'ch',sound:'ch',title:'Charlot cherche son chapeau',cover:'🎩',color:'#2b8f7a',intro:'Une histoire pour entendre le son ch.',
  pages:[
   ['Charlot le chat cherche son chapeau chaud.','🐱🔍🎩',['Charlot','chat','cherche','chapeau','chaud']],
   ['Il cherche dans la cheminée. Chut ! Il y a un chien qui dort.','🐱🔥🐶💤',['cherche','cheminée','Chut','chien']],
   ['Le chien se réveille et dit : « Cherche encore, Charlot ! »','🐶💬🐱',['chien','Cherche','Charlot']],
   ['Charlot cherche sur une chaise. Voilà son chapeau !','🐱🪑🎩',['Charlot','cherche','chaise','chapeau']],
   ['Charlot met son chapeau chaud. Chic alors !','🐱🎩✨',['Charlot','chapeau','chaud','Chic']]],
  words:['chat','chapeau','chaise','chien','chaud','cheval'],
  activity:[
   {skill:'sons',prompt:'Quel mot commence par le son « ch »?',text:'Écoute bien le début du mot.',right:'chapeau',others:['souris','lapin'],explanation:'Dans chapeau, c et h se lisent ensemble au début : « ch ».'},
   {skill:'comprehension',prompt:'Que cherche Charlot?',text:'Charlot le chat cherche son chapeau chaud.',right:'son chapeau',others:['sa balle','son chien'],explanation:'Dans l’histoire : Charlot cherche son chapeau chaud.'},
   {skill:'comprehension',prompt:'Où trouve-t-il enfin son chapeau?',text:'Charlot cherche sur une chaise. Voilà son chapeau !',right:'sur une chaise',others:['dans la cheminée','sous le lit'],explanation:'Dans l’histoire : le chapeau est sur une chaise.'},
   {skill:'sons',prompt:'Quel mot contient le son « ch »?',text:'Pense au son que fait un chat qui chuchote : chhh.',right:'chaise',others:['table','lampe'],explanation:'Dans chaise, on entend « ch » au début.'}]}
];
const labels={ou:'ou',on:'on',ch:'ch'};
const converted=moreStories.map(([sound,label,title,cover,color,pages,activity])=>({id:sound,sound,label,title,cover,color,intro:`Une histoire pour entendre le son « ${label} ».`,
 pages,
 activity:activity.map(([skill,prompt,text,right,others,explanation])=>({skill,prompt,text,right,others,explanation}))}));
export const soundStories=Object.freeze([...stories.map(s=>({...s,label:labels[s.id]})),...converted].map(s=>Object.freeze({...s,pages:s.pages.map(([text,scene,words])=>Object.freeze({text,scene,words}))})));
export const storyFor=id=>soundStories.find(s=>s.id===id)||null;
export const hasStory=id=>Boolean(storyFor(id));
export const soundStoryNarrationTexts=Object.freeze([...new Set(soundStories.flatMap(s=>[s.intro,...s.pages.map(p=>p.text)]))]);
// Étapes : 0 = couverture, 1..n = pages, n+1 = fin (jouer avec le son).
export const lastStep=story=>story.pages.length+1;
// Colore les mots du son : on découpe en mots, on échappe tout, et on n'ajoute que notre balise.
export function highlight(text,words=[]){
 const set=new Set(words.map(w=>w.toLowerCase()));
 return String(text).split(/(\p{L}+)/gu).map(part=>/^\p{L}+$/u.test(part)&&set.has(part.toLowerCase())?`<mark class="ss-sound">${esc(part)}</mark>`:esc(part)).join('');
}
// Cartes d'activité (même format que les autres exercices; la bonne réponse change de place d'une carte à l'autre).
export function activityCards(story){
 return story.activity.map((a,i)=>{
  const choices=[a.right,...a.others];for(let k=0;k<(i+1)%choices.length;k++)choices.push(choices.shift());
  return {id:`sstory-${story.id}-${i}`,skill:a.skill,level:1,prompt:a.prompt,text:a.text,choices,answer:choices.indexOf(a.right),explanation:a.explanation,grade:1,storyActivity:true};
 });
}
export function soundStoryMarkup(story,{step=0,auto=true}={}){
 const n=story.pages.length,last=lastStep(story),dots=Array.from({length:n},(_,i)=>`<i class="${i+1<step?'done':i+1===step?'now':''}"></i>`).join('');
 let body;
 if(step<=0)body=`<div class="ss-cover" style="--ss:${story.color}"><span class="ss-big" aria-hidden="true">${story.cover}</span><h1>${esc(story.title)}</h1><p>${esc(story.intro)}</p><button class="ss-go" data-story-start>▶ Écouter l’histoire</button><button class="ss-again" data-story-sound>🔊 Écouter le son</button></div>`;
 else if(step>=last)body=`<div class="ss-cover" style="--ss:${story.color}"><span class="ss-big" aria-hidden="true">🌟</span><h1>Bravo !</h1><p>Tu as écouté toute l’histoire. Maintenant, joue avec le son !</p><button class="ss-go" data-story-play>🎯 Jouer avec le son</button><button class="ss-again" data-story-start>↺ Réécouter l’histoire</button></div>`;
 else{const page=story.pages[step-1];body=`<div class="ss-page" style="--ss:${story.color}"><div class="ss-scene" aria-hidden="true">${page.scene}</div><p class="ss-text" data-story-text>${highlight(page.text,page.words)}</p><div class="ss-dots" aria-label="Page ${step} sur ${n}">${dots}</div><div class="ss-controls"><button data-story-prev aria-label="Page précédente">◀</button><button class="ss-listen" data-story-listen>🔊 Écouter</button><button data-story-next aria-label="Page suivante">▶</button></div><label class="ss-auto"><input type="checkbox" data-story-auto ${auto?'checked':''}> La narratrice tourne les pages</label></div>`;}
 return `<section class="sound-story" aria-label="Histoire : ${esc(story.title)}"><div class="ss-top"><button data-action="sound-garden">‹ Jardin des sons</button><span>📖 ${esc(story.title)}</span></div>${body}</section>`;
}
