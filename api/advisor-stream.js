// Expose only public text deltas and a verified completion state, never raw
// provider events, metadata, reasoning, credentials or error details.
export function streamAdvisorResult(upstream, clientSignal) {
 const reader=upstream.body?.getReader();
 if(!reader)return Response.json({error:'The advisor is temporarily unavailable.'},{status:502});
 const encoder=new TextEncoder(), decoder=new TextDecoder();
 let aborted=false;
 const cancel=()=>{aborted=true;void reader.cancel().catch(()=>{});};
 const stream=new ReadableStream({
  async start(controller){
   let buffer='',text='',completed=false;
   const emit=value=>controller.enqueue(encoder.encode(JSON.stringify(value)+'\n'));
   const process=frame=>{
    const data=frame.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trimStart()).join('\n');
    if(!data||data==='[DONE]')return;
    const event=JSON.parse(data);
    if(event.type==='response.output_text.delta'&&typeof event.delta==='string'){
     text+=event.delta;if(text.length>12000)throw new Error('Output limit');
     emit({type:'delta',text:event.delta});
    }else if(event.type==='response.completed')completed=true;
    else if(['error','response.failed','response.incomplete'].includes(event.type))throw new Error('Incomplete output');
   };
   clientSignal?.addEventListener('abort',cancel,{once:true});
   try{
    if(clientSignal?.aborted)cancel();
    while(!aborted){
     const {value,done}=await reader.read();
     buffer=(buffer+decoder.decode(value||new Uint8Array(),{stream:!done})).replace(/\r\n/g,'\n');
     if(buffer.length>250000)throw new Error('Event limit');
     let boundary;
     while((boundary=buffer.indexOf('\n\n'))!==-1){process(buffer.slice(0,boundary));buffer=buffer.slice(boundary+2);}
     if(done){if(buffer.trim())process(buffer);break;}
    }
    if(!aborted){
     if(!completed||!text.trim())throw new Error('Missing completion');
     emit({type:'done'});
    }
   }catch{
    if(!aborted)emit({type:'error'});
   }finally{
    clientSignal?.removeEventListener('abort',cancel);
    await reader.cancel().catch(()=>{});
    try{controller.close();}catch{/* The downstream may already be cancelled. */}
   }
  },
  cancel,
 });
 return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
