import {runtime} from '../ops/server/runtime.mjs';
const handle=runtime();
export default async function handler(req,res){
 const controller=new AbortController();res.on('close',()=>{if(!res.writableEnded)controller.abort();});
 try{
  const body=req.body||{};
  if(Buffer.byteLength(JSON.stringify(body))>1300000){res.status(413).end();return;}
  const url=new URL(req.url,'https://localhost');
  const path=url.pathname==='/api/entry'?'/api/'+(url.searchParams.get('route')||''):url.pathname;
  const result=await handle({path,method:req.method,headers:req.headers,body,signal:controller.signal});
  res.setHeader('Cache-Control','no-store');for(const [k,v]of Object.entries(result.headers||{}))res.setHeader(k,v);
  res.status(result.status).json(result.body);
 }catch{res.status(503).json({code:'voice_unavailable'});}
}
export const config={maxDuration:60};
