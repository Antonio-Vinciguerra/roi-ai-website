(async () => {
 const { demoReply } = await import('./advisor-demo.mjs');
 const endpoint = window.ROI_ADVISOR_API_URL || '';
 const live = Boolean(endpoint);
 const launcher = document.createElement('button');
 launcher.className = 'advisor-launcher';
 launcher.setAttribute('aria-haspopup','dialog');
 launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z" stroke="currentColor" stroke-width="1.4"/><path d="M7 11h.01M11 11h.01M15 11h.01" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg><span>Ask ROI AI</span>';
 const dialog = document.createElement('dialog');
 dialog.className='advisor-dialog';
 dialog.setAttribute('aria-labelledby','advisor-title');
 dialog.innerHTML = `<div class="advisor-shell"><header class="advisor-head"><p class="eyebrow">ROI AI / First conversation</p><h2 id="advisor-title">A clearer starting point.</h2><button class="advisor-close" aria-label="Close advisor">×</button><div class="advisor-tabs" role="tablist" aria-label="Conversation mode"><button id="chat-tab" role="tab" aria-selected="true" aria-controls="chat-panel">Type a message</button><button id="voice-tab" role="tab" aria-selected="false" aria-controls="voice-panel" tabindex="-1">Speak with us</button></div></header><div class="advisor-main"><div class="advisor-log" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" tabindex="0"></div><div class="advisor-prompts"><button>How do you work?</button><button>Explore my sector</button></div><p class="advisor-status" role="status"></p><section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><form class="advisor-compose"><label class="sr-only" for="advisor-input">Your message</label><textarea id="advisor-input" placeholder="What’s on your mind?" rows="2" maxlength="2000" required></textarea><button class="advisor-send" aria-label="Send message">↑</button></form></section><section class="advisor-voice" id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" hidden><button class="voice-action" aria-pressed="false"><span class="voice-indicator" aria-hidden="true"></span><span class="voice-label">Start voice preview</span></button><p class="voice-interim" aria-live="polite"></p><p class="voice-notice">Browser voice preview. Your browser may process audio with its speech provider. Use headphones for a clearer conversation.</p></section></div><p class="advisor-foot">${live ? 'AI advisor · Please don’t share confidential information.' : 'Guided demo · No live AI or knowledge base connected.'}</p></div>`;
 document.body.append(launcher,dialog);
 const $ = selector => dialog.querySelector(selector);
 const log=$('.advisor-log'), input=$('#advisor-input'), status=$('.advisor-status');
 const chatTab=$('#chat-tab'), voiceTab=$('#voice-tab');
 const voiceButton=$('.voice-action'), voiceLabel=$('.voice-label'), interim=$('.voice-interim');
 const messages=[];
 let mode='chat', active=false, recognition=null, busy=false, speaking=false, returnFocus=null, controller=null;
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const supported=Boolean(SpeechRecognition && window.speechSynthesis);
 function addMessage(role,text) {
  const article=document.createElement('div'); article.className='advisor-message '+role;
  const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='user'?'You':'ROI AI';
  article.append(speaker,document.createTextNode(text));log.append(article);log.scrollTop=log.scrollHeight;
 }
 addMessage('assistant',live ? 'Hello. What would you like to make clearer about your business or technology plans?' : 'Hello—welcome to ROI AI. You can explore our approach and where we could help your business. This preview uses guided answers; the live advisor comes next.');
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
 const open=event=>{returnFocus=event.currentTarget;dialog.showModal();(mode==='chat'?input:voiceButton).focus();};
 launcher.addEventListener('click',open);document.querySelectorAll('[data-advisor-open]').forEach(button=>button.addEventListener('click',open));
 $('.advisor-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{stopVoice();controller?.abort();status.textContent='';returnFocus?.focus();});
 addEventListener('pagehide',()=>{stopVoice();controller?.abort();});
 function listen() {
  if(!active||!dialog.open||busy||speaking)return;
  recognition=new SpeechRecognition();recognition.lang=document.documentElement.lang==='en'?'en-GB':document.documentElement.lang;
  recognition.interimResults=true;recognition.continuous=false;
  voiceLabel.textContent='Listening · End voice';status.textContent='Listening…';
  let heard=false;
  recognition.onresult=event=>{
   let transcript='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    transcript+=event.results[i][0].transcript;
    if(event.results[i].isFinal&&!heard){heard=true;void send(transcript);}
   }
   interim.textContent=transcript;
  };
  recognition.onerror=event=>{if(event.error!=='aborted'){stopVoice();status.textContent=event.error==='not-allowed'?'Microphone access was not granted. You can keep typing.':'Voice could not hear you. Try starting again, or use text chat.';}};
  recognition.onend=()=>{recognition=null;if(active&&!heard&&!busy&&!speaking){stopVoice();status.textContent='I didn’t catch that. Start voice again when you’re ready.';}};
  try{recognition.start();}catch{stopVoice();status.textContent='Voice is unavailable here. Please use text chat.';}
 }
 function speak(text) {
  if(!active||!dialog.open)return;
  recognition?.abort();recognition=null;speaking=true;
  voiceLabel.textContent='Speaking · End voice';status.textContent='Speaking…';
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-GB';utterance.rate=1;
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
  busy=true;$('.advisor-send').disabled=true;$('.advisor-prompts').hidden=true;
  recognition?.abort();recognition=null;
  addMessage('user',text);messages.push({role:'user',content:text});input.value='';status.textContent=live?'Thinking…':'Preparing a guided answer…';
  try {
   let reply;
   if(live){
    const url=new URL(endpoint,location.href);
    if(url.origin!==location.origin)throw new Error('The advisor endpoint must be on this site.');
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    try {
     const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.slice(-8)}),signal:controller.signal});
     if(!response.ok)throw new Error('Advisor unavailable');
     const body=await response.json();if(typeof body.reply!=='string'||!body.reply.trim())throw new Error('Empty response');reply=body.reply;
    } finally {clearTimeout(timeout);controller=null;}
   } else reply=demoReply(text);
   messages.push({role:'assistant',content:reply});addMessage('assistant',reply);status.textContent='';
   busy=false;if(mode==='voice'&&active)speak(reply);
  } catch(error) {
   if(dialog.open){const message='The live advisor couldn’t connect. Please try again. Your message has not been replaced with a demo answer.';addMessage('assistant',message);status.textContent='Connection unavailable.';}
   stopVoice();
  } finally {busy=false;$('.advisor-send').disabled=false;}
 }
 $('.advisor-compose').addEventListener('submit',event=>{event.preventDefault();void send(input.value);});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(input.value);}});
 $('.advisor-prompts').addEventListener('click',event=>{if(event.target.tagName==='BUTTON')void send(event.target.textContent);});
})();
