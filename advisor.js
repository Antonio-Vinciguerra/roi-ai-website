(async () => {
 const { advisorLocale, advisorSpeechLocale, advisorLanguageChangedMessage, requestedAdvisorLocale } = await import('./advisor-language.mjs');
 const { advisorCopy } = await import('./advisor-copy.mjs?v=20261104-discovery');
 const endpoint = window.ROI_ADVISOR_API_URL || '';
 const live = Boolean(endpoint);
 const language = advisorLocale(document.documentElement.lang);
 const copy=advisorCopy[language];
 const routeText = {
  en: { nextSteps: 'Conversation next steps', ready: 'When you are ready', placeholder: 'What would you like to make clearer?' },
  it: { nextSteps: 'Prossimi passi della conversazione', ready: 'Quando sei pronto', placeholder: 'Cosa vorresti rendere più chiaro?' },
  fr: { nextSteps: 'Prochaines étapes de la conversation', ready: 'Lorsque vous serez prêt', placeholder: 'Que souhaitez-vous clarifier ?' },
  es: { nextSteps: 'Próximos pasos de la conversación', ready: 'Cuando estés listo', placeholder: '¿Qué te gustaría aclarar?' },
  'pt-BR': { nextSteps: 'Próximos passos da conversa', ready: 'Quando estiver pronto', placeholder: 'O que você gostaria de esclarecer?' },
 }[language] || { nextSteps: 'Conversation next steps', ready: 'When you are ready', placeholder: 'What would you like to make clearer?' };
 const launcher = document.createElement('button');
 launcher.className = 'advisor-launcher';
 launcher.setAttribute('aria-haspopup','dialog');
 launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.4"/><path d="M7 11h.01M11 11h.01M15 11h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Ask Heading South</span>';
 const dialog = document.createElement('dialog');
 dialog.className='advisor-dialog';
 dialog.setAttribute('aria-labelledby','advisor-title');
 dialog.innerHTML = `<div class="advisor-shell"><header class="advisor-head"><p class="eyebrow">Heading South / First conversation</p><h2 id="advisor-title">A clearer starting point.</h2><button class="advisor-close" aria-label="Close advisor">×</button><div class="advisor-tabs" role="tablist" aria-label="Conversation mode"><button id="chat-tab" role="tab" aria-selected="true" aria-controls="chat-panel">Type a message</button><button id="voice-tab" role="tab" aria-selected="false" aria-controls="voice-panel" tabindex="-1">Speak with us</button></div></header><div class="advisor-main"><div class="advisor-log" role="log" aria-label="Conversation" aria-live="off" aria-relevant="additions" tabindex="0"></div><button type="button" class="advisor-latest" hidden>${copy.latest} ↓</button><div class="advisor-prompts"><button>How do you work?</button><button>Explore my sector</button></div><nav class="advisor-routes" aria-label="${routeText.nextSteps}"><p>${routeText.ready}</p><a href="https://tally.so/r/J9Nd1X" target="_blank" rel="noopener">Share the context <span aria-hidden="true">↗</span></a><a href="https://meetings-eu1.hubspot.com/avinciguerra" data-callback-open>Book a 30-minute call <span aria-hidden="true">↗</span></a></nav><div class="advisor-pending" hidden aria-hidden="true"><span></span><span></span><span></span></div><p class="advisor-status" role="status" aria-atomic="true"></p><div class="advisor-response-controls"><button type="button" class="advisor-stop" hidden>${copy.stop}</button><button type="button" class="advisor-retry" hidden>${copy.retry}</button></div><section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><form class="advisor-compose"><label class="sr-only" for="advisor-input">Your message</label><textarea id="advisor-input" placeholder="${routeText.placeholder}" rows="2" maxlength="2000" required></textarea><button class="advisor-send" aria-label="Send message">↑</button></form></section><section class="advisor-voice" id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" hidden><button class="voice-action" aria-pressed="false"><span class="voice-indicator" aria-hidden="true"></span><span class="voice-label">Start voice preview</span></button><p class="voice-interim" aria-live="polite"></p><p class="voice-notice">Browser voice preview. Your browser may process audio with its speech provider. Use headphones for a clearer conversation.</p></section></div><p class="advisor-foot">${live ? copy.foot : 'Guided demo · No live AI or knowledge base connected.'}</p></div>`;
 document.body.append(launcher,dialog);
 const $ = selector => dialog.querySelector(selector);
 const log=$('.advisor-log'), input=$('#advisor-input'), status=$('.advisor-status');
 const chatTab=$('#chat-tab'), voiceTab=$('#voice-tab');
 const voiceButton=$('.voice-action'), voiceLabel=$('.voice-label'), interim=$('.voice-interim');
 const messages=[];
 let conversationLocale=language;
 let selectedContext='',pendingContext='',failedTurn=null,followLatest=true;
 let stopRequested=false,replyArticle=null;
 let mode='chat', active=false, recognition=null, busy=false, speaking=false, returnFocus=null, controller=null;
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const supported=Boolean(SpeechRecognition && window.speechSynthesis);
 function appendInline(parent,text) {
  const fragment=document.createDocumentFragment();
  const parts=String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  for(const part of parts){
   if(part.startsWith('**')&&part.endsWith('**')){const strong=document.createElement('strong');strong.textContent=part.slice(2,-2);fragment.append(strong);}
   else if(part.startsWith('`')&&part.endsWith('`')){const code=document.createElement('code');code.textContent=part.slice(1,-1);fragment.append(code);}
   else fragment.append(document.createTextNode(part));
  }
  parent.append(fragment);
 }
 function renderReply(container,text) {
  let list=null;
  for(const rawLine of String(text).split(/\r?\n/)){
   const line=rawLine.trim();
   if(!line){list=null;continue;}
   const heading=line.match(/^#{1,3}\s+(.+)/);
   const bullet=line.match(/^[-*]\s+(.+)/);
   const numbered=line.match(/^\d+[.)]\s+(.+)/);
   if(heading){list=null;const node=document.createElement('h3');appendInline(node,heading[1]);container.append(node);continue;}
   if(bullet||numbered){const type=bullet?'ul':'ol';if(!list||list.tagName.toLowerCase()!==type){list=document.createElement(type);container.append(list);}const item=document.createElement('li');appendInline(item,(bullet||numbered)[1]);list.append(item);continue;}
   list=null;const paragraph=document.createElement('p');appendInline(paragraph,line);container.append(paragraph);
  }
 }
 function addMessage(role,text) {
  const article=document.createElement('div'); article.className='advisor-message '+role;
  const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='user'?copy.you:'Heading South';
  article.append(speaker);
  if(role==='assistant')renderReply(article,text);else{const paragraph=document.createElement('p');paragraph.textContent=text;article.append(paragraph);}
  log.append(article);scrollLatest();return article;
 }
 const latest=$('.advisor-latest'),pending=$('.advisor-pending'),stopButton=$('.advisor-stop'),retryButton=$('.advisor-retry');
 function scrollLatest(){if(followLatest){log.scrollTop=log.scrollHeight;latest.hidden=true;}else latest.hidden=false;}
 log.addEventListener('scroll',()=>{followLatest=log.scrollHeight-log.scrollTop-log.clientHeight<72;if(followLatest)latest.hidden=true;});
 latest.addEventListener('click',()=>{followLatest=true;scrollLatest();});
 stopButton.addEventListener('click',()=>{stopRequested=true;controller?.abort();});
 retryButton.addEventListener('click',()=>{if(failedTurn)void send(failedTurn.text);});
 addMessage('assistant',live ? copy.greeting : 'Hello—good to meet you. This is a guided demo, not a live assistant.');

 function stopVoice() {
  active=false;speaking=false;
  if(recognition){recognition.onend=null;recognition.abort();recognition=null;}
  window.speechSynthesis?.cancel();
  voiceButton.setAttribute('aria-pressed','false');voiceLabel.textContent='Start voice preview';interim.textContent='';
 }
 function setMode(next) {
  stopVoice();mode=next;status.textContent='';
  for(const [tab,value] of [[chatTab,'chat'],[voiceTab,'voice']]) {tab.setAttribute('aria-selected',String(value===mode));tab.tabIndex=value===mode?0:-1;}
  $('#chat-panel').hidden=mode!=='chat';$('#voice-panel').hidden=mode!=='voice';
  if(mode==='voice'&&!supported) {voiceButton.disabled=true;$('.voice-notice').textContent='Voice preview is not supported in this browser. Text chat is available. Live Realtime voice will be connected in a later release.';}
 }
 chatTab.addEventListener('click',()=>setMode('chat'));voiceTab.addEventListener('click',()=>setMode('voice'));
 $('.advisor-tabs').addEventListener('keydown',event=>{
  if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();setMode(event.key==='Home'?'chat':event.key==='End'?'voice':mode==='chat'?'voice':'chat');(mode==='chat'?chatTab:voiceTab).focus();}
 });
 const open=button=>{
  returnFocus=button;
  const context=(button.dataset.advisorContext||document.body.dataset.pageContext||'').slice(0,180);
  if(context&&context!==selectedContext){
   selectedContext=context;pendingContext=context;
   addMessage('assistant',copy.context+' '+context+'. '+copy.contextQuestion);

   $('.advisor-prompts').hidden=true;
  }
  dialog.showModal();(matchMedia('(pointer:coarse)').matches?$('.advisor-close'):(mode==='chat'?input:voiceButton)).focus();
 };
 launcher.addEventListener('click',()=>open(launcher));
 document.addEventListener('click',event=>{const button=event.target.closest('[data-advisor-open]');if(button)open(button);});
 $('.advisor-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{stopVoice();controller?.abort();status.textContent='';returnFocus?.focus();});
 addEventListener('pagehide',()=>{stopVoice();controller?.abort();});
 function listen() {
  if(!active||!dialog.open||busy||speaking)return;
  recognition=new SpeechRecognition();recognition.lang=advisorSpeechLocale(conversationLocale);
  recognition.interimResults=true;recognition.continuous=false;
  voiceLabel.textContent='Listening · End voice';status.textContent='Listening…';
  let heard=false;
  let capturedTranscript='';
  recognition.onresult=event=>{
   // Safari may give us a useful interim transcript, then end recognition
   // without emitting a final result. Keep the complete phrase so onend can
   // submit it instead of silently losing the visitor's message.
   capturedTranscript=Array.from(event.results, result=>result[0]?.transcript||'').join('');
   if(Array.from(event.results).some(result=>result.isFinal)&&!heard){heard=true;void send(capturedTranscript);}
   interim.textContent=capturedTranscript;
  };
  recognition.onerror=event=>{if(event.error!=='aborted'){stopVoice();status.textContent=event.error==='not-allowed'?'Microphone access was not granted. You can keep typing.':'Voice could not hear you. Try starting again, or use text chat.';}};
  recognition.onend=()=>{
   recognition=null;
   if(active&&!heard&&!busy&&!speaking&&capturedTranscript.trim()){
    heard=true;
    void send(capturedTranscript);
    return;
   }
   if(active&&!heard&&!busy&&!speaking){stopVoice();status.textContent='I didn’t catch that. Start voice again when you’re ready.';}
  };
  try{recognition.start();}catch{stopVoice();status.textContent='Voice is unavailable here. Please use text chat.';}
 }
 function speak(text) {
  if(!active||!dialog.open)return;
  recognition?.abort();recognition=null;speaking=true;
  voiceLabel.textContent='Speaking · End voice';status.textContent='Speaking…';
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=advisorSpeechLocale(conversationLocale);utterance.rate=1;
  utterance.onend=()=>{speaking=false;if(active)listen();};
  utterance.onerror=()=>{stopVoice();status.textContent='Audio playback was unavailable. The answer is in the conversation above.';};
  window.speechSynthesis.speak(utterance);
 }
 voiceButton.addEventListener('click',()=>{
  if(active){stopVoice();status.textContent='Voice ended. Your conversation is still here.';return;}
  if(!supported||busy)return;active=true;voiceButton.setAttribute('aria-pressed','true');listen();
 });
 async function send(raw) {
  const text=raw.trim().slice(0,2000);if(!text||busy)return;
  const retry=failedTurn?.text===text;
  busy=true;stopRequested=false;$('.advisor-send').disabled=true;$('.advisor-prompts').hidden=true;retryButton.hidden=true;
  recognition?.abort();recognition=null;
  if(!retry){followLatest=true;addMessage('user',text);}
  const requestedLocale=requestedAdvisorLocale(text);
  if(requestedLocale)conversationLocale=requestedLocale;
  const contextMessage=pendingContext?[{role:'user',content:'Website section selected (illustrative, not business data): '+pendingContext}]:[];
  const turn=[...messages,...contextMessage,{role:'user',content:text}];
  const sentDraft=text;input.value='';status.textContent=copy.thinking;pending.hidden=false;stopButton.hidden=!live;
  replyArticle=null;
  try {
   let reply='';
   if(live){
    const url=new URL(endpoint,location.href);
    if(url.origin!==location.origin)throw new Error('Invalid endpoint');
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),30000);
    try {
     const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:turn.slice(-20),locale:conversationLocale,stream:true}),signal:controller.signal});
     if(!response.ok)throw new Error('Advisor unavailable');
     if(response.headers.get('content-type')?.includes('application/x-ndjson')){
      const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',complete=false;
      const processLine=line=>{
       if(!line.trim())return;
       const event=JSON.parse(line);
       if(event.type==='error')throw new Error('Incomplete response');
       if(event.type==='done'){complete=true;return;}
       if(event.type!=='delta'||typeof event.text!=='string')return;
       reply+=event.text;if(reply.length>12000)throw new Error('Output limit');
       pending.hidden=true;status.textContent='';
       if(!replyArticle)replyArticle=addMessage('assistant','');
       let paragraph=replyArticle.querySelector('.advisor-streaming');
       if(!paragraph){paragraph=document.createElement('div');paragraph.className='advisor-streaming';replyArticle.append(paragraph);}
       paragraph.textContent=reply.replace(/\*\*/g,'');scrollLatest();
      };
      try{
       while(true){const {value,done}=await reader.read();buffer+=decoder.decode(value||new Uint8Array(),{stream:!done});let boundary;while((boundary=buffer.indexOf('\n'))!==-1){processLine(buffer.slice(0,boundary));buffer=buffer.slice(boundary+1);}if(done){if(buffer.trim())processLine(buffer);break;}}
      }finally{await reader.cancel().catch(()=>{});}
      if(!complete)throw new Error('Missing completion');
     }else{
      // Compatible with the previous backend during an atomic rolling release.
      const body=await response.json();reply=body.reply;
     }
     if(typeof reply!=='string'||!reply.trim())throw new Error('Empty response');
    } finally {clearTimeout(timeout);controller=null;}
   } else if(requestedLocale)reply=advisorLanguageChangedMessage(conversationLocale);
   else {const demo=await import('./advisor-demo.'+conversationLocale+'.mjs');reply=demo.demoReply(text,selectedContext);}
   if(replyArticle){replyArticle.querySelector('.advisor-streaming')?.remove();renderReply(replyArticle,reply);scrollLatest();}else addMessage('assistant',reply);
   messages.push(...contextMessage,{role:'user',content:text},{role:'assistant',content:reply});pendingContext='';failedTurn=null;
   status.textContent=copy.complete;
   busy=false;if(mode==='voice'&&active)speak(reply);
  } catch(error) {
   if(replyArticle)replyArticle.remove();
   failedTurn={text};
   if(!input.value)input.value=sentDraft;
   if(dialog.open){status.textContent=stopRequested?copy.stopped:copy.error;retryButton.hidden=stopRequested;}
   stopVoice();
  } finally {pending.hidden=true;stopButton.hidden=true;busy=false;$('.advisor-send').disabled=false;}
 }
 $('.advisor-compose').addEventListener('submit',event=>{event.preventDefault();void send(input.value);});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(input.value);}});
 $('.advisor-prompts').addEventListener('click',event=>{if(event.target.tagName==='BUTTON')void send(event.target.textContent);});
})();
