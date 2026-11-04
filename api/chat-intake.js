// Consent-led CRM handoff. The browser receives a signed, short-lived receipt,
// never CRM credentials or unrestricted record identifiers.
const crmJson=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
const crmClean=(v,n=160)=>typeof v==='string'?v.trim().slice(0,n):'';
const crmHex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
async function receiptSignature(secret,value){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return crmHex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('chat-receipt-v1:'+value)));}
export async function createReceipt(data,secret){const encoded=btoa(unescape(encodeURIComponent(JSON.stringify({...data,exp:Date.now()+6*3600000}))));return encoded+'.'+await receiptSignature(secret,encoded);}
export async function readReceipt(receipt,secret){try{if(typeof receipt!=='string'||receipt.length>4000)return null;const [encoded,sig,...extra]=receipt.split('.');if(extra.length||!sig||sig!==await receiptSignature(secret,encoded))return null;const data=JSON.parse(decodeURIComponent(escape(atob(encoded))));return data.exp>Date.now()?data:null;}catch{return null;}}
export async function handleChatIntake(request,env={},fetcher=fetch){
 if(request.method!=='POST')return crmJson({error:'Method not allowed'},405);
 if(request.headers.get('origin')!==new URL(request.url).origin)return crmJson({error:'Origin not permitted'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return crmJson({error:'Expected JSON'},415);
 if(env.CALLBACK_ENABLED!=='true'||!env.CALLBACK_WEBHOOK_URL||!env.CALLBACK_WEBHOOK_TOKEN||!env.TURNSTILE_SECRET)return crmJson({error:'Contact handoff unavailable'},503);
 if(!env.allowCallbackRequest||!await env.allowCallbackRequest(request))return crmJson({error:'Please try again later'},429);
 let raw;try{raw=await request.text();}catch{return crmJson({error:'Invalid request'},400);}if(raw.length>65000)return crmJson({error:'Request too large'},413);
 let b;try{b=JSON.parse(raw);}catch{return crmJson({error:'Invalid JSON'},400);}
 if(!['en','it','fr','es','pt-BR'].includes(b.locale))return crmJson({error:'Invalid language'},400);
 let previous=null;if(b.receipt){previous=await readReceipt(b.receipt,env.CALLBACK_WEBHOOK_TOKEN);if(!previous)return crmJson({error:'Handoff expired; please submit your details again'},401);}
 const name=previous?.name||crmClean(b.name,120), email=previous?.email||crmClean(b.email,160).toLowerCase(),company=previous?.company||crmClean(b.company,160);
 if(!name||!/^\S+@\S+\.\S+$/.test(email)||(!previous&&!b.consent?.followUp))return crmJson({error:'Contact details and permission required'},400);
 if(!previous){
  let verified=false;try{if(env.verifyTurnstile)verified=await env.verifyTurnstile(b.turnstileToken);else{const r=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:b.turnstileToken||'',remoteip:request.headers.get('CF-Connecting-IP')||''}),signal:AbortSignal.timeout(8000)});verified=r.ok&&(await r.json()).success===true;}}catch{}
  if(!verified)return crmJson({error:'Verification failed'},403);
 }
 const transcript=Array.isArray(b.transcript)?b.transcript.filter(t=>['user','assistant'].includes(t?.role)&&typeof t.content==='string').slice(-40).map(t=>({role:t.role,content:t.content.slice(0,4000)})):[];
 if(!transcript.some(t=>t.role==='user')||JSON.stringify(transcript).length>50000)return crmJson({error:'A conversation is required'},400);
 const requestId=previous?.requestId||(/^[a-zA-Z0-9_-]{8,80}$/.test(b.requestId||'')?b.requestId:crypto.randomUUID());
 const capturedAt=previous?.capturedAt||new Date().toISOString();
 const payload={schemaVersion:1,source:'headingsouth.ai',channel:'chat',requestId,locale:b.locale,requestType:'information',contact:{name,email,company},consent:{followUp:true,capturedAt,wordingVersion:'chat-handoff-v1'},transcript,page:crmClean(b.page,240),...(previous?{crm:{contactId:previous.contactId,dealId:previous.dealId,noteId:previous.noteId}}:{})};
 try{const r=await fetcher(env.CALLBACK_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.CALLBACK_WEBHOOK_TOKEN},body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error();const result=await r.json();if(result.accepted!==true||!result.contactId||!result.dealId||!result.noteId)throw Error();const receipt=await createReceipt({requestId,name,email,company,capturedAt,contactId:String(result.contactId),dealId:String(result.dealId),noteId:String(result.noteId)},env.CALLBACK_WEBHOOK_TOKEN);return crmJson({accepted:true,receipt},202);}catch{return crmJson({error:'Your conversation could not be saved. Please retry or contact info@headingsouth.ai.'},502);}
}
