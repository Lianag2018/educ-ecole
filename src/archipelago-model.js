import {select} from './engine.js';
import {gradeFor,mathsFor} from './learning.js';
import {beginnerCard} from './beginner-access.js';
import {islandCards} from './dominican-adventure.js';
import {planMissions,missionOpen} from './school-plan.js';
import {weekKey} from './garden.js';

export const islands=Object.freeze([
 {id:'cuba',name:'Cuba',detail:'La baie aux mille couleurs',position:'0% 0%',icon:'☀️'},
 {id:'mexique',name:'Mexique',detail:'Le secret du cénote',position:'100% 0%',icon:'🌿'},
 {id:'dominicaine',name:'République dominicaine',detail:'La plage des cocotiers',position:'0% 100%',icon:'🐚'},
 {id:'turques',name:'Îles Turques-et-Caïques',detail:'Le lagon de cristal',position:'100% 100%',icon:'🪸'}
]);
export const landmarks=Object.freeze([
 {x:29,y:52,name:'Le coquillage',icon:'🐚'},
 {x:68,y:43,name:'La perle',icon:'🔮'},
 {x:65,y:68,name:'Le coffre',icon:'🎁'}
]);
export const coconuts=Object.freeze([{x:37,y:65},{x:42,y:47},{x:56,y:37},{x:76,y:58},{x:57,y:72}]);
export const validIsland=id=>islands.some(i=>i.id===id);
export function landPosition(x,y){
 x=Number.isFinite(x)?x:50;y=Number.isFinite(y)?y:70;
 const dx=(x-50)/35,dy=(y-55)/23,d=Math.hypot(dx,dy);
 return d>1?{x:50+dx/d*35,y:55+dy/d*23}:{x,y};
}
export function walkToward(position,target,seconds){
 const goal=landPosition(target.x,target.y),dx=goal.x-position.x,dy=goal.y-position.y;
 const distance=Math.hypot(dx,dy),step=22*Math.max(0,Math.min(seconds,0.05));
 return distance<=step?goal:landPosition(position.x+dx/distance*step,position.y+dy/distance*step);
}
export function archipelagoState(p){
 if(!p.archipelago||p.archipelago.profileId!==p.id||p.archipelago.version!==1)p.archipelago={version:1,profileId:p.id,destination:'cuba',positions:{},routes:{},quiet:false};
 const s=p.archipelago;
 if(!validIsland(s.destination))s.destination='cuba';
 if(!s.positions||typeof s.positions!=='object'||Array.isArray(s.positions))s.positions={};
 if(!s.routes||typeof s.routes!=='object'||Array.isArray(s.routes))s.routes={};
 if(!s.baskets||typeof s.baskets!=='object'||Array.isArray(s.baskets))s.baskets={};
 return s;
}
export function collectCoconuts(p,id,position){
 if(!validIsland(id))return [];
 const s=archipelagoState(p);if(!Array.isArray(s.baskets[id]))s.baskets[id]=[];
 const found=[];
 coconuts.forEach((c,n)=>{if(!s.baskets[id].includes(n)&&Math.hypot(c.x-position.x,c.y-position.y)<3){s.baskets[id].push(n);found.push(n);}});
 return found;
}
export function positionFor(p,id=archipelagoState(p).destination){
 const pos=archipelagoState(p).positions[id];return landPosition(pos?.x,pos?.y);
}
export function moveExplorer(p,id,position){
 if(!validIsland(id))return false;
 archipelagoState(p).positions[id]=landPosition(position.x,position.y);return true;
}
function hash(value){let h=2166136261;for(const c of JSON.stringify(value))h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;return h.toString(36);}
const ready=q=>q&&typeof q.id==='string'&&typeof q.text==='string'&&Array.isArray(q.choices);
export function islandRoute(p,id,day){
 if(!validIsland(id))throw Error('unknown_island');
 const s=archipelagoState(p),grade=gradeFor(p),week=weekKey(new Date(day+'T17:00:00Z'));
 const plan=(p.schoolPlans||[]).find(x=>x.profileId===p.id&&x.grade===grade&&x.week===week);
 const revision=hash([p.id,grade,day,id,plan||null,p.assignments]);
 const old=s.routes[id];
 if(old?.revision===revision&&old.profileId===p.id&&old.items?.length===3&&old.items.every(ready)&&Array.isArray(old.explored))return old;
 const available=[],fallback=[],offset=islands.findIndex(i=>i.id===id)*3;
 const add=(list,q,subject,source)=>{if(ready(q)&&!list.some(x=>x.id===q.id)){const adapted=beginnerCard(q,p,subject);list.push({...adapted,travelSubject:adapted.travelSubject||subject,archipelagoSource:source});}};
 let unsupported=0;
 if(plan){try{
  const mapped=planMissions(plan);unsupported=mapped.unsupported.length;
  mapped.missions.forEach((m,index)=>{if(missionOpen(p,mapped.missions,index))m.items.forEach(q=>add(available,q,m.subject,'plan'));});
 }catch{unsupported=plan.tasks?.length||1;}}
 for(const q of select(p,day,{shortSession:true}))add(fallback,q,'Français','practice');
 const maths=mathsFor(p);if(maths.length)add(fallback,maths[offset%maths.length],'Maths','practice');
 for(const q of islandCards(p,['bateau','palmiers','plage'][islands.findIndex(i=>i.id===id)%3]))add(fallback,q,q.travelSubject||'Français','practice');
 const items=[];
 // Refresh from this child's newly imported plan even within the same day.
 for(let n=0;n<Math.min(3,available.length);n++)items.push(available[(offset+n)%available.length]);
 if(!items.length){
  const word=fallback.find(q=>q.travelSubject!=='Maths'),math=fallback.find(q=>q.travelSubject==='Maths');
  if(word)items.push(word);if(math)items.push(math);
 }
 for(const q of fallback)if(items.length<3&&!items.some(x=>x.id===q.id))items.push(q);
 const route={profileId:p.id,revision,day,grade,items,explored:[],unsupported,fromPlan:items.filter(q=>q.archipelagoSource==='plan').length};
 s.routes[id]=route;return route;
}
export function completeIslandMission(p,context,day){
 if(!context||context.profileId!==p.id||!validIsland(context.island))return false;
 const route=archipelagoState(p).routes[context.island];
 if(route?.revision!==context.revision||route.day!==day||!Number.isInteger(context.slot)||context.slot<0||context.slot>=route.items.length)return false;
 const q=route.items[context.slot];
 // A visit or animation is never an answer or a mastery credit.
 if(!p.history.some(h=>h.id===q.id&&h.day===day&&['correct','incorrect','help'].includes(h.result)))return false;
 if(!route.explored.includes(context.slot))route.explored.push(context.slot);
 return true;
}
