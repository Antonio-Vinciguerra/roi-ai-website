import {handleCallback,handlePostCall} from '../api/callback.js';
import {handleChatIntake} from '../api/chat-intake.js';
async function digest(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function withinRateLimit(request, context) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = 'https://callback-rate-limit.internal/' + await digest(ip);
  const now = Date.now();
  const cached = await caches.default.match(key);
  let counter = cached ? await cached.json().catch(() => null) : null;
  if (!counter || now - counter.started > 600000) counter = { started: now, count: 0 };
  counter.count += 1;
  if (counter.count > 5) return false;
  context.waitUntil(caches.default.put(key, new Response(JSON.stringify(counter), {
    headers: { 'Cache-Control': 'max-age=600' },
  })));
  return true;
}


export default {async fetch(request,env,context){
 const path=new URL(request.url).pathname;
 const configured={...env,allowCallbackRequest:()=>withinRateLimit(request,context)};
 if(path==='/api/callback')return handleCallback(request,configured);
 if(path==='/api/callback/chat'){
  const origin=request.headers.get('Origin')||'';
  const allowed=origin==='https://headingsouth.ai'||origin==='https://www.headingsouth.ai';
  if(!allowed)return new Response('Origin not permitted',{status:403});
  const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const result=await handleChatIntake(request,configured);const merged=new Headers(result.headers);
  for(const [key,value] of Object.entries(headers))merged.set(key,value);
  return new Response(result.body,{status:result.status,headers:merged});
 }
 if(path==='/api/callback/post-call')return handlePostCall(request,configured);
 return new Response('Not found',{status:404});
}};
