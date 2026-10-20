import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
// Direct execution also emits and runs individual tests in restricted Node hosts.
for(const f of readdirSync(new URL('./tests/',import.meta.url)).filter(f=>f.endsWith('.test.mjs')).sort()){
 const r=spawnSync(process.execPath,[new URL('./tests/'+f,import.meta.url).pathname],{stdio:'inherit'});
 if(r.status!==0)process.exit(r.status||1);
}
