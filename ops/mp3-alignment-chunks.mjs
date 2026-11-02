// Cut only at MPEG Layer III frame boundaries; retain the measured media offset.
// Overlap gives the decoder and recognizer context around each ownership window.
export function alignmentChunks(bytes,seconds=10,overlap=1){
 const frames=[];let offset=0,time=0;
 if(bytes.toString('ascii',0,3)==='ID3')offset=10+((bytes[6]&127)<<21)+((bytes[7]&127)<<14)+((bytes[8]&127)<<7)+(bytes[9]&127);
 while(offset+4<=bytes.length){
  if(bytes.toString('ascii',offset,offset+3)==='TAG')break;
  const h=bytes.readUInt32BE(offset),version=(h>>>19)&3,layer=(h>>>17)&3,rateIndex=(h>>>10)&3,bitIndex=(h>>>12)&15;
  if((h>>>21)!==2047||version===1||layer!==1||rateIndex===3||bitIndex===0||bitIndex===15)throw Error('invalid_mp3_frames');
  const rate=[44100,48000,32000][rateIndex]/(version===3?1:version===2?2:4);
  const bitrate=(version===3?[0,32,40,48,56,64,80,96,112,128,160,192,224,256,320]:[0,8,16,24,32,40,48,56,64,80,96,112,128,144,160])[bitIndex]*1000;
  const size=Math.floor((version===3?144:72)*bitrate/rate)+((h>>>9)&1),duration=(version===3?1152:576)/rate;
  if(offset+size>bytes.length)throw Error('truncated_mp3_frame');
  frames.push({offset,end:offset+size,start:time,finish:time+duration});offset+=size;time+=duration;
 }
 if(!frames.length||time>180)throw Error('invalid_mp3_duration');
 const chunks=[];
 for(let start=0;start<time;start+=seconds){
  const end=Math.min(time,start+seconds),selected=frames.filter(f=>f.finish>start-overlap&&f.start<end+overlap);
  chunks.push({bytes:bytes.subarray(selected[0].offset,selected.at(-1).end),offset:selected[0].start,start,end});
 }
 return chunks;
}
export function mergeChunkWords(chunks){
 return chunks.flatMap(c=>(c.words||[]).filter(w=>Number.isFinite(w.start)&&Number.isFinite(w.end)&&w.end>w.start).map(w=>({word:w.word,start:w.start+c.offset,end:w.end+c.offset})).filter(w=>(w.start+w.end)/2>=c.start&&(w.start+w.end)/2<c.end)).sort((a,b)=>a.start-b.start);
}
