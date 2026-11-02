import {verifiedReadingPosition} from './reading-timing.js';
import {mathSpeech} from './math-speech.js';
import {playbackSpeed} from './speech.js';
import {numberWords,numberParts} from './numbers.js';
import {planNumberAudio} from './number-audio.js';
const numberByWords=new Map(Array.from({length:2000},(_,n)=>[numberWords(n),n]));

function validSegment(segment){
 if(!segment||typeof segment.text!=='string'||typeof segment.src!=='string')return false;
 if(segment.source==='narration')return /^\/audio\/[a-f0-9]{64}\.mp3$/.test(segment.src);
 if(segment.source!=='pedagofa')return false;
 try{
  const url=new URL(segment.src);
  return url.protocol==='https:'&&url.hostname==='pedagofa.cssdm.gouv.qc.ca'&&!url.port&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname.startsWith('/wp-content/uploads/')&&url.pathname.endsWith('.mp3');
 }catch{return false;}
}
function checkedNumberPlan(plan){
 return plan&&typeof plan.text==='string'&&Array.isArray(plan.segments)&&plan.segments.length&&plan.segments.every(validSegment)?{text:plan.text,segments:plan.segments,numeric:true}:null;
}
function narrationPlan(key,clips){
 const parts=clips[key]?[key]:key.split('. ').filter(Boolean);
 const segments=parts.flatMap(text=>clips[text]?[{text,file:clips[text]}]:numberByWords.has(text)?numberParts(numberByWords.get(text)).map(part=>({text:part,file:clips[part]})):[{text,file:null}]);
 if(!segments.length||segments.some(segment=>typeof segment.file!=='string'||!/^[a-f0-9]{64}\.mp3$/.test(segment.file)))return null;
 return {text:key,numeric:false,segments:segments.map(({text,file})=>({text,src:'/audio/'+file,source:'narration'}))};
}

// Page-sized excerpts reuse the original narration and its word timestamps.
// Never invent an audio cut when either boundary is missing from the alignment.
export function narrationExcerpt(key,clips,alignments){
 if(key.trim().split(/\s+/).length<2)return null;
 for(const [file,alignment] of Object.entries(alignments)){
  const source=alignment?.text,cues=alignment?.cues;
  if(typeof source!=='string'||clips[source]!==file||!/^[a-f0-9]{64}\.mp3$/.test(file)||!Array.isArray(cues))continue;
  const offset=source.indexOf(key);if(offset<0)continue;
  if(/[\p{L}\p{N}]/u.test(source[offset-1]||'')||/[\p{L}\p{N}]/u.test(source[offset+key.length]||''))continue;
  const words=Array.from(key.matchAll(/[\p{L}\p{N}]+/gu));if(!words.length)continue;
  const firstIndex=offset+words[0].index,lastWord=words.at(-1),lastEnd=offset+lastWord.index+lastWord[0].length;
  const first=cues.find(c=>c.charIndex===firstIndex),lastIndex=cues.findIndex(c=>c.charEnd===lastEnd),last=cues[lastIndex];
  if(!first||!last||!Number.isFinite(first.start)||!Number.isFinite(last.end)||first.start<0||last.end<=first.start)continue;
  const next=cues[lastIndex+1];
  const tail=(alignment.syllables||[]).filter(c=>c.charIndex>=last.charEnd&&c.charEnd<=offset+key.length&&Number.isFinite(c.end)).reduce((end,c)=>Math.max(end,c.end),last.end);
  const end=next&&Number.isFinite(next.start)&&next.start>=last.end?next.start:tail;
  return {text:key,numeric:false,segments:[{text:key,src:'/audio/'+file,source:'narration',excerpt:{offset,start:first.start,end,alignment}}]};
 }
 return null;
}

// Follow media time, never wall-clock timers: buffering, seeking and speed changes
// keep the same reading position. Optional syllable anchors must be measured.
export function mediaReadingEvent(text,cues,time){
 let cue=null;for(const c of cues){if(c.start>time)break;cue=c;}
 if(!cue)return {charIndex:-1,timing:'word',approximate:false};
 const pause=Number.isInteger(cue.charEnd)?text.slice(cue.charEnd).match(/^\s*([,!.?…;:])/):null;
 if(time>=cue.end&&pause)return {charIndex:cue.charEnd+pause[0].length-1,partIndex:0,timing:'word',approximate:false};
 if(time>=cue.end)return {charIndex:-1,timing:'word',approximate:false};
 const parts=cue.syllables;
 if(Array.isArray(parts)&&parts.length&&parts.every((p,i)=>Number.isFinite(p.start)&&Number.isFinite(p.end)&&p.start>=cue.start&&p.end<=cue.end&&p.end>p.start&&(!i||p.start>=parts[i-1].end))){
  const partIndex=parts.findIndex(p=>time>=p.start&&time<p.end);
  return {charIndex:cue.charIndex,partIndex,timing:'syllable',approximate:false};
 }
 return {charIndex:cue.charIndex,charEnd:cue.charEnd,wordProgress:(time-cue.start)/Math.max(.001,cue.end-cue.start),timing:'word',approximate:false};
}

// Official number recordings stream from PédagoFA; other narration stays on this site.
// No user text or microphone data is sent to either media source.
export class NarrationSpeaker {
 constructor({fallback,AudioClass=globalThis.Audio,fetcher=globalThis.fetch,setTimer=(fn,ms)=>globalThis.setTimeout(fn,ms),clearTimer=id=>globalThis.clearTimeout(id)}={}){
  this.fallback=fallback;this.clips={};this.alignments={};this.epoch=0;this.segmentEpoch=0;this.audio=AudioClass?new AudioClass():null;
  this.setTimer=setTimer;this.clearTimer=clearTimer;this.loadingTimer=null;this.loadingTicket=null;
  if(this.audio){this.audio.preload='auto';this.audio.setAttribute?.('playsinline','');}
  this.alignmentReady=fetcher('/audio/alignment.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.version===1)this.alignments=m.clips||{};}).catch(()=>{});
  this.ready=fetcher('/audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{if(m?.version===1)this.clips=m.clips||{};}).catch(()=>{});
 }
 cancelLoading(){
  this.loadingTicket=null;
  if(this.loadingTimer!==null)this.clearTimer(this.loadingTimer);
  this.loadingTimer=null;
 }
 clearMedia(){
  globalThis.cancelAnimationFrame?.(this.readingFrame);this.readingFrame=null;
  this.segmentEpoch++;
  this.cancelLoading();
  if(!this.audio)return;
  this.audio.onplaying=null;this.audio.onended=null;this.audio.onerror=null;this.audio.ontimeupdate=null;this.audio.onwaiting=null;this.audio.onloadedmetadata=null;
  this.audio.pause();this.audio.removeAttribute?.('src');
  // Removing src alone does not abort a media resource's ongoing load.
  this.audio.load?.();
 }
 pause(){globalThis.cancelAnimationFrame?.(this.readingFrame);this.readingFrame=null;if(this.usingFallback)return this.fallback?.pause?.()||false;if(!this.audio||!this.activeState)return false;this.audio.pause();this.cancelLoading();this.activeState('paused','Lecture en pause.');return true;}
 resume(){
  if(this.usingFallback)return this.fallback?.resume?.()||false;
  if(!this.audio||!this.activeState)return false;
  const epoch=this.epoch,state=this.activeState;
  const fail=()=>{if(this.epoch!==epoch||this.activeState!==state)return;this.stop();state('error','La lecture ne peut pas reprendre. Touche Réécouter.');};
  try{this.audio.play()?.catch(fail);return true;}catch{fail();return false;}
 }
 stop(){this.activeState=null;this.epoch++;this.usingFallback=false;this.fallback?.stop();this.clearMedia();}
 setSpeed(value){this.speed=playbackSpeed(value);if(this.audio){this.audio.playbackRate=this.speed;this.audio.preservesPitch=true;}if(this.usingFallback)this.fallback?.setSpeed?.(value);}
 speak(text,options={}){
  this.stop();this.setSpeed(options.speed);
  const epoch=this.epoch,key=mathSpeech(String(text).trim()),onState=options.onState||(()=>{}),audio=this.audio;
  this.activeState=onState;
  let finished=false,retried=false,recoveryMessage='';
  const active=()=>this.epoch===epoch&&!finished;
  const message=value=>recoveryMessage?`${recoveryMessage} ${value}`:value;
  const fail=detail=>{
   if(!active())return;
   finished=true;this.stop();onState('error',detail);
  };
  const finish=()=>{
   if(!active())return;
   finished=true;this.activeState=null;globalThis.cancelAnimationFrame?.(this.readingFrame);this.readingFrame=null;this.segmentEpoch++;this.usingFallback=false;this.cancelLoading();
   if(audio){audio.onplaying=null;audio.onended=null;audio.onerror=null;audio.ontimeupdate=null;audio.onwaiting=null;audio.onloadedmetadata=null;}
   onState('ended',message('À ton tour! Tu peux réécouter aussi souvent que tu veux.'));
  };
  const useSystem=()=>{
   if(!active())return;
   this.clearMedia();this.usingFallback=true;
   if(!this.fallback?.speak){fail('Lecture audio indisponible. Réessaie avec une voix française dans les réglages de l’appareil.');return;}
   try{this.fallback.speak(key,{...options,speed:this.speed,onState:(status,detail)=>{
    if(!active())return;
    if(status==='ended'||status==='error'){finished=true;this.activeState=null;this.usingFallback=false;}
    onState(status,message(detail||''));
   },onProgress:event=>{if(active())options.onProgress?.(event);}});}
   catch{fail('La voix française ne peut pas démarrer. Touche Écouter pour réessayer.');}
  };
  const playPlan=plan=>{
   if(!active())return;
   this.clearMedia();this.usingFallback=false;
   const playSegment=index=>{
    if(!active())return;
    this.cancelLoading();
    const segment=plan.segments[index],token=++this.segmentEpoch;
    const current=()=>active()&&token===this.segmentEpoch;
    const sourceLabel=segment.source==='pedagofa'?'Enregistrement PédagoFA · CSSDM.':'Narratrice IA · français québécois · lecture douce.';
    const reject=error=>{
     if(!current())return;
     if(error?.name==='NotAllowedError'){
      fail('Le navigateur a bloqué la lecture. Touche Écouter pour démarrer le son.');return;
     }
     if(error?.name==='AbortError'){
      fail('La lecture a été interrompue. Touche Écouter pour la reprendre.');return;
     }
     if(segment.source==='pedagofa'&&!retried){
      retried=true;this.clearMedia();
      recoveryMessage='L’enregistrement PédagoFA est indisponible. La lecture de secours reprend depuis le début.';
      const replacement=checkedNumberPlan(planNumberAudio(key,this.clips,{preferOriginal:false}))||narrationPlan(key,this.clips);
      if(replacement)playPlan(replacement);else useSystem();
      return;
     }
     fail(message('Le son ne peut pas être lu. Réessaie ou choisis une voix système française.'));
    };
    const armLoading=()=>{
     if(!current()||this.loadingTicket)return;
     const ticket={};this.loadingTicket=ticket;
     const timer=this.setTimer(()=>{
      if(this.loadingTicket!==ticket||!current())return;
      this.loadingTicket=null;this.loadingTimer=null;
      reject({name:'TimeoutError'});
     },8000);
     if(this.loadingTicket===ticket)this.loadingTimer=timer;else this.clearTimer(timer);
     timer?.unref?.();
    };
    // Number sequences use an approximate overall position. Story anchors remain unchanged.
    const progress=()=>{
     if(!current()||!Number.isFinite(audio.duration)||audio.duration<=0)return;
     if(segment.excerpt&&audio.currentTime>=segment.excerpt.end){audio.pause();finish();return;}
     const fraction=Math.max(0,Math.min(1,audio.currentTime/audio.duration));
     if(plan.numeric){options.onProgress?.({progress:(index+fraction)/plan.segments.length,approximate:true});return;}
     if(plan.segments.length!==1)return;
     const aligned=segment.excerpt?.alignment||this.alignments[segment.src.slice('/audio/'.length)],cues=segment.excerpt||aligned?.text===key?aligned?.cues:null;
     const exact=aligned&&(segment.excerpt||aligned.text===key)?verifiedReadingPosition(aligned,aligned.text,audio.currentTime):null;
     if(exact||(Array.isArray(cues)&&cues.length)){
      const event=exact||mediaReadingEvent(aligned.text,cues,audio.currentTime);
      if(segment.excerpt){event.charIndex-=segment.excerpt.offset;if(Number.isInteger(event.charEnd))event.charEnd-=segment.excerpt.offset;if(event.charIndex<0||event.charIndex>=key.length)event.charIndex=-1;}
      options.onProgress?.(event);
     }else options.onProgress?.({progress:fraction,timing:'unavailable',approximate:true});
    };
    const frame=()=>{if(!current()||audio.paused)return;progress();if(current()&&!audio.paused)this.readingFrame=globalThis.requestAnimationFrame?.(frame);};
    audio.onplaying=()=>{if(current()){this.cancelLoading();onState('speaking',message(sourceLabel));globalThis.cancelAnimationFrame?.(this.readingFrame);frame();}};
    audio.ontimeupdate=progress;
    audio.onwaiting=armLoading;
    audio.onerror=()=>reject(audio.error);
    audio.onended=()=>{
     if(!current())return;
     this.segmentEpoch++;
     if(index+1<plan.segments.length)playSegment(index+1);else finish();
    };
    try{
     audio.src=segment.src;audio.playbackRate=this.speed;audio.preservesPitch=true;audio.volume=1;audio.muted=false;
     if(segment.excerpt){
      audio.currentTime=segment.excerpt.start;
      audio.onloadedmetadata=()=>{if(current())audio.currentTime=segment.excerpt.start;};
     }
     armLoading();
     // Safari requires play() inside the original user gesture. Do not call the
     // app's onState handler first: it rerenders the entire page synchronously.
     // Even a synchronous rerender can consume the iOS playback activation.
     const playing=audio.play();
     if(current())onState('starting',message(`Le son commence… ${sourceLabel}`));
     playing?.catch(reject);
    }catch(error){reject(error);}
   };
   playSegment(0);
  };
  if(options.systemVoice||!audio){useSystem();return;}
  const numeric=checkedNumberPlan(planNumberAudio(key,this.clips));
  if(numeric){playPlan(numeric);return;}
  if(options.preferredURI){useSystem();return;}
  const plan=narrationPlan(key,this.clips)||narrationExcerpt(key,this.clips,this.alignments);
  if(plan)playPlan(plan);else useSystem();
 }
}
