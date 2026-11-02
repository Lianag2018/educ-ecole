// Private hosting configuration only. Never return secrets to learner devices,
// public assets, logs, URLs or browser persistence.
export async function schoolCredentialsEndpoint(req,{auth,origin,secrets}={}){
 const reply=(status,body)=>({status,headers:{'Cache-Control':'no-store','Vary':'Cookie, Origin'},body});
 if(req.method!=='POST')return reply(405,{code:'method_not_allowed'});
 if(!origin||req.headers?.origin!==origin)return reply(403,{code:'origin_required'});
 let parent;try{parent=await auth?.authenticateParent(req);}catch{}
 if(!parent?.id||parent.role!=='parent'||!parent.emailVerified||!parent.recentLogin||!parent.csrfVerified)return reply(401,{code:'parent_login_required'});
 const b=req.body;
 if(!b||Object.keys(b).some(k=>!['profileId','resource'].includes(k))||!((b.profileId==='p1'&&b.resource==='nougat')||(b.profileId==='p2'&&b.resource==='cec')))return reply(400,{code:'invalid_request'});
 let entry;try{entry=JSON.parse(secrets?.[b.profileId]?.[b.resource]||'null');}catch{}
 const keys=b.resource==='nougat'?['group','username','password']:['username','password'];
 if(!entry||keys.some(k=>typeof entry[k]!=='string'||!entry[k].length||entry[k].length>256||/[\u0000-\u001f\u007f]/u.test(entry[k])))return reply(404,{code:'access_not_configured'});
 return reply(200,{values:Object.fromEntries(keys.map(k=>[k,entry[k]]))});
}
