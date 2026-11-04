const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The draft stays in this closure. No localStorage, URL, log or child sync.
export function reviewPlanDraft(root,result,{signal,request,profileId}){
 return new Promise((resolve,reject)=>{
  if(signal.aborted)return reject(Error('aborted'));
  if(!root||typeof result.draft!=='string'||result.preview?.profileId!==profileId)return reject(Error('draft_invalid'));
  root.innerHTML=`<section class="panel"><h3>À vérifier avant de rendre disponible</h3><p>Semaine du ${escape(result.preview.week)}. Vérifie les notions pour cet enfant. Ce brouillon expire dans 30 minutes et disparaît si tu quittes cette page.</p><ul>${result.preview.tasks.map(t=>`<li><strong>${escape(t.subject)} · ${escape(t.topic)}</strong><p>${escape(t.instruction)}</p>${t.words.length?`<p>Mots : ${t.words.map(escape).join(', ')}</p>`:''}${t.tables.length?`<p>Tables : ${t.tables.map(escape).join(', ')} · ${t.operations.map(escape).join(', ')}</p>`:''}${t.missing?'<p>Page ou mots à fournir : aucune activité créée pour cette notion.</p>':''}</li>`).join('')}</ul><p data-review-status role="status"></p><button type="button" data-review-approve>Valider et rendre disponible</button> <button type="button" data-review-cancel>Annuler ce brouillon</button></section>`;
  const yes=root.querySelector('[data-review-approve]'),no=root.querySelector('[data-review-cancel]'),status=root.querySelector('[data-review-status]');
  let done=false;
  const finish=(error,plan)=>{if(done)return;done=true;signal.removeEventListener('abort',abort);yes.onclick=no.onclick=null;root.replaceChildren();error?reject(Error(error)):resolve(plan);};
  const abort=()=>finish('aborted');signal.addEventListener('abort',abort,{once:true});
  no.onclick=()=>finish('draft_cancelled');
  yes.onclick=async()=>{
   if(yes.disabled||done)return;yes.disabled=no.disabled=true;status.textContent='Validation et sauvegarde privée…';
   try{const data=await request('/api/plans/approve',{profileId,draft:result.draft,approved:true});if(!done)finish(null,data.plan);}
   catch(e){if(done)return;status.textContent=e.message==='draft_invalid'?'Brouillon expiré ou invalide. Annule-le et prépare une nouvelle demande.':e.message==='parent_login_required'?'La session parent a expiré. Reconnecte-toi avant de valider.':'Validation non confirmée. Tu peux réessayer : cela ne relance pas OpenAI.';yes.disabled=e.message==='draft_invalid';no.disabled=false;}
  };
 });
}
