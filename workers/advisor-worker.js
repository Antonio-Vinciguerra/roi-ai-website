import {handleAdvisor} from '../api/advisor.js';

const ALLOWED_ORIGINS = new Set([
  'https://headingsouth.ai',
  'https://www.headingsouth.ai',
]);

const REQUEST_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const visitorRequests = new Map();


function isRateLimited(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  const existing = visitorRequests.get(ip) || [];

  const recent = existing.filter((time) => now - time < REQUEST_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    visitorRequests.set(ip, recent);
    return true;
  }

  recent.push(now);
  visitorRequests.set(ip, recent);
  return false;
}


export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  if(!ALLOWED_ORIGINS.has(origin))return new Response('Origin not permitted',{status:403});
  const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(new URL(request.url).pathname!=='/api/advisor')return new Response('Not found',{status:404});
  const response=await handleAdvisor(request,{...env,allowRequest:async()=>!isRateLimited(request)});
  const combined=new Headers(response.headers);for(const [key,value] of Object.entries(headers))combined.set(key,value);
  return new Response(response.body,{status:response.status,headers:combined});
 }
};
