import {prepareObservations,mergeObservations,validateAdvice,strategyLabels} from './learning-memory.js';
import {skills} from './content.js';
import {escapePlan,installPlan,planMissions} from './school-plan.js';

export function learningPanel(p){
 const e=escapePlan,a=p.learningAdvice;
 const pending=(p.schoolPlans||[]).slice(-1).flatMap(plan=>planMissions(plan).unsupported);
 return `<section class="panel" id="learning-sync"><h2>Sauvegarde et adaptation</h2><p>Avec ton compte parent, sauvegarde les réponses de cet enfant sur le serveur privé. OpenAI peut utiliser un bilan de ses réponses et ses notions scolaires pour choisir des priorités. Les révisions et son année scolaire restent respectées.</p><p>Les photos, les noms et les codes d’accès ne font pas partie de cette sauvegarde des réponses. Les plans scolaires déjà analysés peuvent être récupérés sur cet appareil.</p><button id="learning-enable">${p.learningCloud?.enabled?'Synchroniser maintenant':'Activer pour cet enfant'}</button>${p.learningCloud?.enabled?'<button id="learning-pause">Suspendre sur cet appareil</button>':''}<p id="learning-sync-status" role="status">${e(p.learningCloud?.message||'Sauvegarde locale. Connecte le compte parent puis active la sauvegarde privée.')}</p>${a?`<p>Dernière proposition IA · ${e(a.asOf)} : ${a.priorities.filter(s=>Object.hasOwn(skills,s)).map(s=>e(skills[s])).join(', ')||'courte pratique'}.</p><p>${e(strategyLabels[a.strategy]||'')}</p>`:''}${pending.length?`<h3>À préciser avec un parent</h3><ul>${pending.map(s=>`<li>${e(s)}</li>`).join('')}</ul>`:''}<p class="small">Si la connexion parent expire, les réponses restent sur cet appareil et seront envoyées à la prochaine connexion. Une analyse automatique au plus par enfant et par jour, dans le budget familial partagé.</p></section>`;
}

export class LearningSync {
 constructor({getState,save,request=(...args)=>fetch(...args),onStatus=()=>{},delay=1500}){Object.assign(this,{getState,save,request,onStatus,delay});this.epoch=0;this.running=false;}
 schedule(){clearTimeout(this.timer);this.timer=setTimeout(()=>this.sync(),this.delay);}
 stop(){clearTimeout(this.timer);this.epoch++;this.controller?.abort();}
 message(p,text){p.learningCloud.message=text;this.save();this.onStatus(p,text);}
 async post(path,body,signal){const r=await this.request(path,{method:'POST',credentials:'same-origin',signal,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.code);return data;}
 async sync(){
  if(this.running){this.again=true;return;}
  this.running=true;this.again=false;const epoch=this.epoch;this.controller=new AbortController();
  const signal=AbortSignal.any([this.controller.signal,AbortSignal.timeout(55000)]);
  try{for(const p of this.getState().profiles){
   if(!p.learningCloud?.enabled)continue;
   const current=()=>epoch===this.epoch&&this.getState().profiles.includes(p)&&p.learningCloud.enabled&&!signal.aborted;
   if(!current())break;
   try{
    const cloud=p.learningCloud,events=prepareObservations(p),known=new Set(cloud.accepted||[]);
    if(!this.save())throw Error('local_save_failed'); // IDs must survive retry/reload.
    const unsent=events.filter(e=>!known.has(e.syncId));let offset=0,more=true,auto=false;
    this.message(p,'Synchronisation en cours…');
    while(current()&&(offset<unsent.length||more)){
     const batch=unsent.slice(offset,offset+100),data=await this.post('/api/learning/sync',{profileId:p.id,events:batch,after:cloud.cursor||0},signal);
     if(!current())break;
     if(!Array.isArray(data.events)||!Array.isArray(data.accepted)||!Number.isSafeInteger(data.cursor)||data.cursor<(cloud.cursor||0)||typeof data.more!=='boolean')throw Error('invalid_response');
     mergeObservations(p,data.events);for(const id of data.accepted)known.add(id);for(const e of data.events)known.add(e.syncId);
     cloud.accepted=[...known];cloud.cursor=data.cursor;
     if(data.advice){const {asOf,revision,...advice}=data.advice;validateAdvice(advice);if(/^\d{4}-\d{2}-\d{2}$/.test(asOf))p.learningAdvice={...advice,asOf,revision};}
     if(!this.save())throw Error('local_save_failed');
     offset+=batch.length;more=data.more;auto=data.autoAvailable===true;
    }
    if(!current())continue;
    // Restore already analysed plans: this endpoint never calls OpenAI.
    const plans=await this.post('/api/plans/list',{profileId:p.id},signal);
    if(!current())continue;
    for(const plan of [...plans.plans].reverse())installPlan(p,plan,{append:true});
    if(!this.save())throw Error('local_save_failed');
    this.message(p,auto?'Réponses sauvegardées. Adaptation automatique disponible.':'Réponses sauvegardées. L’analyse automatique reste à configurer.');
    if(auto){const result=await this.post('/api/learning/evolve',{profileId:p.id},signal);if(current()&&result.result==='updated'){const data=await this.post('/api/learning/sync',{profileId:p.id,events:[],after:cloud.cursor||0},signal);if(current()&&data.advice){const {asOf,revision,...advice}=data.advice;p.learningAdvice={...validateAdvice(advice),asOf,revision};this.message(p,'Réponses sauvegardées et priorités actualisées.');}}}
   }catch(e){if(current())this.message(p,e.message==='parent_login_required'?'Réponses conservées ici. Reconnecte le compte parent pour les synchroniser.':e.message==='learning_setup_required'?'Le serveur de sauvegarde reste à configurer. Les réponses sont conservées ici.':e.message==='local_save_failed'?'Le navigateur refuse la sauvegarde. Garde cette page ouverte.':'Synchronisation ou adaptation incomplète. Les réponses locales sont conservées; réessaie à la prochaine connexion.');}
  }}finally{this.running=false;if(this.again)this.schedule();}
 }
 mount(root,p){
  root.querySelector('#learning-enable')?.addEventListener('click',()=>{p.learningCloud={...p.learningCloud,enabled:true};this.save();this.sync();});
  root.querySelector('#learning-pause')?.addEventListener('click',()=>{this.stop();p.learningCloud.enabled=false;this.message(p,'Synchronisation suspendue ici. Les réponses déjà sauvegardées restent sur le serveur.');});
 }
}
