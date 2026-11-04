import test from 'node:test';
import assert from 'node:assert/strict';
import {streamAdvisorResult} from '../api/advisor-stream.js';
import {handleAdvisor} from '../api/advisor.js';
const encode=new TextEncoder();
const frames=events=>events.map(event=>'data: '+JSON.stringify(event)+'\n\n').join('');
const read=async response=>(await response.text()).trim().split('\n').filter(Boolean).map(JSON.parse);
test('streams public deltas and completion without leaking other provider data',async()=>{
 const response=streamAdvisorResult(new Response(frames([
  {type:'response.created',response:{private:'must not leak'}},
  {type:'response.output_text.delta',delta:'Buongiorno '},
  {type:'response.output_text.delta',delta:'Maria.'},
  {type:'response.completed'},
 ])));
 assert.match(response.headers.get('content-type'),/x-ndjson/);
 assert.deepEqual(await read(response),[{type:'delta',text:'Buongiorno '},{type:'delta',text:'Maria.'},{type:'done'}]);
});
test('missing completion and provider failures cannot become a successful response',async()=>{
 for(const tail of [[],[{type:'response.failed',response:{error:'private upstream detail'}}]]){
  const events=await read(streamAdvisorResult(new Response(frames([{type:'response.output_text.delta',delta:'Partial'},...tail]))));
  assert.equal(events.at(-1).type,'error');
  assert.ok(!events.some(event=>event.type==='done'));
  assert.doesNotMatch(JSON.stringify(events),/private upstream/);
 }
});
test('SSE parser preserves UTF-8 and handles fragmented CRLF event boundaries',async()=>{
 const bytes=encode.encode(frames([{type:'response.output_text.delta',delta:'Olá, è così.'},{type:'response.completed'}]).replaceAll('\n','\r\n'));
 const source=new ReadableStream({start(controller){for(const byte of bytes)controller.enqueue(new Uint8Array([byte]));controller.close();}});
 assert.deepEqual(await read(streamAdvisorResult(new Response(source))),[{type:'delta',text:'Olá, è così.'},{type:'done'}]);
});
test('cancelled visitor requests cancel the upstream reader',async()=>{
 let cancelled=false;
 const source=new ReadableStream({pull(){},cancel(){cancelled=true;}});
 const abort=new AbortController();
 const output=streamAdvisorResult(new Response(source),abort.signal);
 abort.abort();await output.text();assert.equal(cancelled,true);
});
test('the configured handler requests streaming in the selected language and keeps credentials server side',async()=>{
 const req=new Request('https://headingsouth.ai/api/advisor',{method:'POST',headers:{Origin:'https://headingsouth.ai','Content-Type':'application/json'},body:JSON.stringify({locale:'pt-BR',stream:true,messages:[{role:'user',content:'Como podem ajudar?'}]})});
 let sent;
 const output=await handleAdvisor(req,{ADVISOR_ENABLED:'true',OPENAI_API_KEY:'synthetic-key',OPENAI_MODEL:'existing-model',allowRequest:async()=>true},async(_url,init)=>{
  sent=JSON.parse(init.body);
  return new Response(frames([{type:'response.output_text.delta',delta:'Olá.'},{type:'response.completed'}]));
 });
 assert.equal(sent.stream,true);assert.equal(sent.store,false);
 assert.match(sent.instructions,/Brazilian Portuguese/);
 const data=await read(output);assert.deepEqual(data.at(-1),{type:'done'});
 assert.doesNotMatch(JSON.stringify(data),/synthetic-key/);
});
