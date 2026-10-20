import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', {recursive:true, force:true});
await mkdir('dist');
for (const file of ['index.html','src','icons','manifest.webmanifest']) await cp(file, `dist/${file}`, {recursive:true});
console.log('Static production build: dist/');
