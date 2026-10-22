export const schoolContext = p => ({stage:p.schoolContext?.stage||'non précisé',focus:p.schoolContext?.focus||''});
export function localHint(q,p) {
  if(q.hint)return q.hint;
  const focus=schoolContext(p).focus;
  const hints={syllabes:'Dis le mot lentement. Écoute ses petits morceaux.',sons:'Écoute le mot modèle, puis écoute chaque choix. Cherche le son qui se ressemble.',mots:'Écoute les mots doucement. Tu peux toucher chaque haut-parleur.',liaisons:'Lis les deux mots ensemble. Écoute comment ils se relient.',intonation:'Regarde le signe à la fin. Où ta voix peut-elle faire une pause?',comprehension:'Écoute encore la petite histoire. Cherche le passage qui t’aide.'};
  return `${hints[q.skill]||'Relis un petit bout à la fois.'}${focus?' Tu peux aussi reprendre la stratégie choisie avec ton parent.':''} À ton tour d’essayer!`;
}
// Resource lifecycle for future transport. No capture occurs while unavailable.
export class VoiceController {
  constructor({getUserMedia,onState=()=>{}}={}) {this.getUserMedia=getUserMedia;this.onState=onState;this.state='unavailable';this.epoch=0;}
  set(state){this.state=state;this.onState(state);}
  async start() {
    if(this.state!=='ready')return;
    const epoch=++this.epoch;this.set('requesting');
    try {const stream=await this.getUserMedia({audio:true});if(epoch!==this.epoch){stream.getTracks().forEach(t=>t.stop());return;}this.stream=stream;this.set('listening');}
    catch {if(epoch===this.epoch)this.set('error');}
  }
  stop(){this.epoch++;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.connection?.close();this.connection=null;this.output?.pause();if(this.output)this.output.srcObject=null;this.set('unavailable');}
}
