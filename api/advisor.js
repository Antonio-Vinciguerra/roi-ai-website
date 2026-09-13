import persona from '../advisor-persona.js';

// Standards-based Request/Response handler. Mount behind same-origin, server-side
// rate limiting before enabling. This file is NOT shipped in the static build.
export async function handleAdvisor(request, env = {}, fetcher = fetch) {
 const json = (body,status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(request.method !== 'POST') return json({error:'Method not allowed'},405);
 const origin=request.headers.get('origin');
 if(!origin || origin !== new URL(request.url).origin) return json({error:'Origin not permitted'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Expected JSON'},415);
 if(env.ADVISOR_ENABLED !== 'true' || !env.OPENAI_API_KEY || !env.OPENAI_MODEL)
  return json({error:'The live advisor is not configured.'},503);
 // Fail closed until the deployment supplies a real, shared rate limiter.
 if(typeof env.allowRequest !== 'function' || !await env.allowRequest(request))
  return json({error:'Please try again later.'},429);
 if(Number(request.headers.get('content-length')||0)>20000) return json({error:'Message too large'},413);
 let body;
 try {
  const reader=request.body?.getReader();if(!reader)return json({error:'A message is required'},400);
  const chunks=[];let bytes=0;
  while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>20000){await reader.cancel();return json({error:'Message too large'},413);}chunks.push(value);}
  const joined=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}
  body=JSON.parse(new TextDecoder().decode(joined));
 } catch {return json({error:'Invalid JSON'},400);}
 const messages=body?.messages;
 if(!Array.isArray(messages)||!messages.length||messages.length>8||
  messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>2000)||
  messages.at(-1).role!=='user') return json({error:'Invalid conversation'},400);
 try {
  const result=await fetcher('https://api.openai.com/v1/responses',{
   method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+env.OPENAI_API_KEY},
   body:JSON.stringify({model:env.OPENAI_MODEL,instructions:persona,input:messages.map(({role,content})=>({role,content})),store:false,max_output_tokens:600}),
   signal:AbortSignal.timeout(20000)
  });
  if(!result.ok)return json({error:'The advisor is temporarily unavailable.'},502);
  const data=await result.json();
  const reply=(data.output||[]).filter(item=>item.type==='message').flatMap(item=>item.content||[]).filter(item=>item.type==='output_text').map(item=>item.text).join('\n').trim();
  if(!reply)return json({error:'The advisor could not form a response.'},502);
  return json({reply});
 }catch{return json({error:'The advisor is temporarily unavailable.'},502);}
}
export default handleAdvisor;
