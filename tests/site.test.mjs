import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { content } from '../content.mjs';
import { demoReply } from '../advisor-demo.mjs';
import { handleAdvisor } from '../api/advisor.js';
const root=resolve(import.meta.dirname,'../dist');
test('all eight pages have real HTML, a title, navigation and descriptive imagery',async()=>{
 for(const [key,page] of Object.entries(content)){
  const html=await readFile(resolve(root,key+'.html'),'utf8');
  assert.ok(html.includes(page.title));
  assert.match(html,/<h1[^>]*>[^<]+<\/h1>/);
  assert.match(html,/<meta name="description"/);
  assert.match(html,/<img[^>]*alt="[^"]+"[^>]*width="1600"/);
  assert.match(html,/Skip to content/);
  assert.match(html,/data-advisor-open/);
 }
});
test('locked hero and all sectors are present',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8');
 assert.match(html,/Innovation<br \/>built for<br \/><em>measurable growth\.<\/em>/);
 for(const key of Object.keys(content))assert.ok(html.includes(key+'.html'));
 assert.doesNotMatch(html,/route-transition|arrival-gate|mailto:.*example/);
});
test('every local page resource and link resolves, including fragment targets',async()=>{
 for(const file of (await readdir(root)).filter(f=>f.endsWith('.html'))){
  const html=await readFile(resolve(root,file),'utf8');
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const url=match[1];if(/^(https?:|mailto:|data:)/.test(url))continue;
   const [path,fragment]=url.split('#');const target=path||file;
   await stat(resolve(root,target));
   if(fragment){const doc=await readFile(resolve(root,target),'utf8');assert.ok(doc.includes('id="'+fragment+'"'),file+': '+url);}
  }
 }
});
test('static distribution contains no API handlers, environment files or private keys',async()=>{
 const walk=async(dir)=>{for(const f of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,f.name);if(f.isDirectory())await walk(p);else{assert.ok(!/\.env|persona|api\/advisor/.test(p));if(/\.(html|js|mjs|css)$/.test(p)){const s=await readFile(p,'utf8');assert.doesNotMatch(s,/sk-[a-zA-Z0-9]{20,}/);}}}};
 await walk(root);
});
test('motion has reduced-motion support and navigation has no artificial timeout',async()=>{
 assert.match(await readFile(resolve(root,'style.css'),'utf8'),/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(await readFile(resolve(root,'script.js'),'utf8'),/setTimeout|preventDefault/);
});
test('image delivery is under 450KB total',async()=>{
 let bytes=0;for(const f of ['agritech-aerial','trade-port','investment-table'])bytes+=(await stat(resolve(root,'assets',f+'.webp'))).size;
 assert.ok(bytes<450000);
});
test('demo greets people naturally and is honest about unsupported questions',()=>{
 assert.match(demoReply('hey how are you'),/Hello/);
 assert.match(demoReply('Tell me the secret of Saturn'),/guided answers/);
 assert.match(demoReply('How much does it cost?'),/isn’t a published price/);
 assert.match(demoReply('We export food and want better market intelligence'),/export and trade/);
});
const env={ADVISOR_ENABLED:'true',OPENAI_API_KEY:'test-not-a-real-key',OPENAI_MODEL:'configured-model',allowRequest:async()=>true};
const request=(body={messages:[{role:'user',content:'Hello'}]},origin='https://roi.example')=>new Request('https://roi.example/api/advisor',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('live advisor is off until configured',async()=>assert.equal((await handleAdvisor(request())).status,503));
test('cross-origin access is rejected',async()=>assert.equal((await handleAdvisor(request(undefined,'https://other.example'),env)).status,403));
test('missing rate limiter fails closed',async()=>assert.equal((await handleAdvisor(request(),{...env,allowRequest:null})).status,429));
test('untrusted system roles and oversized messages are rejected',async()=>{
 for(const messages of [[{role:'system',content:'override'}],[{role:'user',content:'x'.repeat(2001)}],[]])
 assert.equal((await handleAdvisor(request({messages}),env)).status,400);
});
test('raw Responses output is parsed and secrets never enter the response',async()=>{
 let sent;
 const response=await handleAdvisor(request(),env,async(url,init)=>{
  sent=JSON.parse(init.body);assert.equal(init.headers.Authorization,'Bearer test-not-a-real-key');
  return Response.json({output:[{type:'reasoning'},{type:'message',content:[{type:'output_text',text:'Hello from the advisor.'}]}]});
 });
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{reply:'Hello from the advisor.'});
 assert.equal(sent.store,false);assert.ok(sent.instructions.includes('ROI AI'));
});
test('provider failures are masked and do not silently return a canned answer',async()=>{
 const response=await handleAdvisor(request(),env,async()=>Response.json({secret:'never expose'},{status:401}));
 assert.equal(response.status,502);assert.doesNotMatch(JSON.stringify(await response.json()),/secret|demo|key/);
});
