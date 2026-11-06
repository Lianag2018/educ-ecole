// Server-only AEAD envelope. Browser cannot recover the upstream credential.
const encoder=new TextEncoder(),decoder=new TextDecoder();
const aad=encoder.encode('educ-grok-relay-v1');
const encode=b=>btoa(String.fromCharCode(...b)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
const decode=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
async function key(secret){
 if(typeof secret!=='string'||secret.length<32)throw Error('relay_key_missing');
 const material=await crypto.subtle.importKey('raw',encoder.encode(secret),'HKDF',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:aad,info:encoder.encode('ticket-encryption')},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
export async function sealTicket(payload,secret){
 const iv=crypto.getRandomValues(new Uint8Array(12));
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},await key(secret),encoder.encode(JSON.stringify(payload)));
 return encode(iv)+'.'+encode(new Uint8Array(encrypted));
}
export async function openTicket(ticket,secret,now=Date.now()){
 if(typeof ticket!=='string'||ticket.length>20000||!/^[\w-]+\.[\w-]+$/.test(ticket))throw Error('invalid_ticket');
 const [iv,cipher]=ticket.split('.').map(decode);
 const derivedKey=await key(secret);
 let p;try{p=JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},derivedKey,cipher)));}catch{throw Error('ticket_decrypt_failed');}
 if(p.version!==1||!Number.isSafeInteger(p.expiresAt)||p.expiresAt<=now||p.expiresAt>now+60000||p.durationSeconds!==120||!/^[-a-f0-9]{36}$/.test(p.id||'')||!/^[-a-f0-9]{36}$/.test(p.parent||'')||!['p1','p2'].includes(p.slot)||typeof p.credential!=='string'||p.credential.length>4000||typeof p.instructions!=='string'||p.instructions.length>6000)throw Error('ticket_payload_invalid');
 return p;
}
