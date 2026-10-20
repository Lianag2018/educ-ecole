import {runtime} from './server/runtime.mjs';
import {createSessionEndpoint} from './server/session.mjs';
const sessionEndpoint=createSessionEndpoint(); // deny by default; no environment or secret auto-loading
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

const root = resolve(process.argv[2] || '.');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png':'image/png', '.webmanifest':'application/manifest+json',
};
const handle=runtime();
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if(pathname.startsWith('/api/')) {
      let body={}; const controller=new AbortController();req.on('aborted',()=>controller.abort());res.on('close',()=>{if(!res.writableEnded)controller.abort();});
      if(req.method==='POST'){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>1300000){res.writeHead(413);res.end();return;}chunks.push(chunk);}try{body=JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{res.writeHead(400);res.end();return;}}
      const result=pathname==='/api/voice/session'?await sessionEndpoint({method:req.method}):await handle({path:pathname,method:req.method,headers:req.headers,body,signal:controller.signal});
      res.writeHead(result.status,{'Content-Type':'application/json','Cache-Control':'no-store',...result.headers});res.end(JSON.stringify(result.body));return;
    }
    // Never serve server code, config, tests or credentials from the app directory.
    if(pathname!=='/' && pathname!=='/index.html' && pathname!=='/manifest.webmanifest' && !/^\/icons\/[a-z0-9-]+\.png$/.test(pathname) && !/^\/src\/[a-z-]+\.(js|css)$/.test(pathname)) throw Error('Invalid path');
    const path = resolve(root, '.' + pathname);
    if (!path.startsWith(root + '/') && path !== root) throw Error('Invalid path');
    const file = path === root ? root + '/index.html' : path;
    const data = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Introuvable');
  }
});
server.on('error', error => {
  console.error(`Serveur indisponible (${error.code}). Vérifiez le port 5173 et les permissions réseau locales.`);
  process.exitCode = 1;
});
server.listen(5173, '127.0.0.1', () => console.log('http://localhost:5173'));
