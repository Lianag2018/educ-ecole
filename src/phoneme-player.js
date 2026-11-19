// Recorded phonemes only: never synthesize a letter name as an audio fallback.
// Les enregistrements de consonnes de l'Université Laval sont de la forme « a-consonne-a » (ex. « acha »). Pour ces sons, on joue
// la version isolée (sans les voyelles autour) : « chhhh », « ssss », « mmmm ». Les originaux restent inchangés (voir solo-sources.json).
export const SOLO_PHONEMES=Object.freeze(['ch','s','z','j','f','v','m','n','r']);
export const phonemeSrc=id=>SOLO_PHONEMES.includes(id)?`/icons/phonemes/${id}-solo.mp3`:`/icons/phonemes/${id}.mp3`;
export class PhonemePlayer {
 constructor({createAudio=src=>new Audio(src),onState=()=>{}}={}){this.createAudio=createAudio;this.onState=onState;this.epoch=0;this.audio=null;}
 stop(){this.epoch++;if(this.audio){this.audio.pause();this.audio.removeAttribute('src');this.audio.load();this.audio=null;}this.onState('idle');}
 async play(id){
  this.stop();const epoch=this.epoch;
  if(!/^[a-z][a-z-]*$/.test(id)){this.onState('error');return;}
  const audio=this.createAudio(phonemeSrc(id));this.audio=audio;
  const update=state=>{if(epoch===this.epoch)this.onState(state);};
  audio.onplaying=()=>update('playing');audio.onended=()=>update('ended');audio.onerror=()=>update('error');
  audio.preload='auto';audio.playbackRate=1;this.onState('loading');
  try{await audio.play();}catch{update('error');}
 }
}
