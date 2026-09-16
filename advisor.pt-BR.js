(async () => {
 const { demoReply } = await import('./advisor-demo.pt-BR.mjs');
 const endpoint = window.ROI_ADVISOR_API_URL || '';
 const live = Boolean(endpoint);
 const launcher = document.createElement('button');
 launcher.className = 'advisor-launcher';
 launcher.setAttribute('aria-haspopup','dialog');
 launcher.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z\" stroke=\"currentColor\" stroke-width=\"1.4\"/><path d=\"M7 11h.01M11 11h.01M15 11h.01\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg><span>Pergunte à Heading South</span>";
 const dialog = document.createElement('dialog');
 dialog.className='advisor-dialog';
 dialog.setAttribute('aria-labelledby','advisor-title');
 dialog.innerHTML = `<div class="advisor-shell"><header class="advisor-head"><p class="eyebrow">Heading South / Primeira conversa</p><h2 id="advisor-title">Um ponto de partida mais claro.</h2><button class="advisor-close" aria-label="Fechar o consultor">×</button><div class="advisor-tabs" role="tablist" aria-label="Modo de conversa"><button id="chat-tab" role="tab" aria-selected="true" aria-controls="chat-panel">Escrever uma mensagem</button><button id="voice-tab" role="tab" aria-selected="false" aria-controls="voice-panel" tabindex="-1">Falar conosco</button></div></header><div class="advisor-main"><div class="advisor-log" role="log" aria-label="Conversa" aria-live="polite" aria-relevant="additions" tabindex="0"></div><div class="advisor-prompts"><button>Como vocês trabalham?</button><button>Explorar meu setor</button></div><p class="advisor-status" role="status"></p><section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><form class="advisor-compose"><label class="sr-only" for="advisor-input">Sua mensagem</label><textarea id="advisor-input" placeholder="Sobre o que você gostaria de conversar?" rows="2" maxlength="2000" required></textarea><button class="advisor-send" aria-label="Enviar mensagem">↑</button></form></section><section class="advisor-voice" id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" hidden><button class="voice-action" aria-pressed="false"><span class="voice-indicator" aria-hidden="true"></span><span class="voice-label">Iniciar o teste de voz</span></button><p class="voice-interim" aria-live="polite"></p><p class="voice-notice">Teste de voz do navegador. O navegador pode processar o áudio com seu provedor de voz. Use fones de ouvido para uma conversa mais clara.</p></section></div><p class="advisor-foot">${live ? "Consultor de IA · Não compartilhe informações confidenciais." : "Demonstração guiada · Sem IA ao vivo nem base de conhecimento conectada."}</p></div>`;
 document.body.append(launcher,dialog);
 const $ = selector => dialog.querySelector(selector);
 const log=$('.advisor-log'), input=$('#advisor-input'), status=$('.advisor-status');
 const chatTab=$('#chat-tab'), voiceTab=$('#voice-tab');
 const voiceButton=$('.voice-action'), voiceLabel=$('.voice-label'), interim=$('.voice-interim');
 const messages=[];
 let selectedContext='',pendingContext='';
 let mode='chat', active=false, recognition=null, busy=false, speaking=false, returnFocus=null, controller=null;
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 const supported=Boolean(SpeechRecognition && window.speechSynthesis);
 function addMessage(role,text) {
  const article=document.createElement('div'); article.className='advisor-message '+role;
  const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='user'?"Você":'Heading South';
  article.append(speaker,document.createTextNode(text));log.append(article);log.scrollTop=log.scrollHeight;
 }
 addMessage('assistant',live ? "Olá. O que você gostaria de esclarecer sobre seu negócio ou seus planos de tecnologia?" : "Olá, boas-vindas à Heading South. Você pode explorar nossa abordagem e onde poderíamos ajudar seu negócio. Esta prévia usa respostas guiadas; o consultor de IA virá depois.");
 function stopVoice() {
  active=false;speaking=false;
  if(recognition){recognition.onend=null;recognition.abort();recognition=null;}
  window.speechSynthesis?.cancel();
  voiceButton.setAttribute('aria-pressed','false');voiceLabel.textContent="Iniciar o teste de voz";interim.textContent='';
 }
 function setMode(next) {
  stopVoice();mode=next;status.textContent='';
  for(const [tab,value] of [[chatTab,'chat'],[voiceTab,'voice']]) {tab.setAttribute('aria-selected',String(value===mode));tab.tabIndex=value===mode?0:-1;}
  $('#chat-panel').hidden=mode!=='chat';$('#voice-panel').hidden=mode!=='voice';
  if(mode==='voice'&&!supported) {voiceButton.disabled=true;$('.voice-notice').textContent="Este navegador não oferece suporte ao teste de voz. O chat de texto está disponível. A voz Realtime será conectada em uma versão futura.";}
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
   addMessage('assistant',"Você explorou "+context+". O exemplo é ilustrativo, não uma avaliação do seu negócio. O que é parecido ou diferente na sua situação?");
   if(!input.value)input.value="Gostaria de explorar "+context.toLowerCase()+" para meu negócio.";
   $('.advisor-prompts').hidden=true;
  }
  dialog.showModal();(mode==='chat'?input:voiceButton).focus();
 };
 launcher.addEventListener('click',()=>open(launcher));
 document.addEventListener('click',event=>{const button=event.target.closest('[data-advisor-open]');if(button)open(button);});
 $('.advisor-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{stopVoice();controller?.abort();status.textContent='';returnFocus?.focus();});
 addEventListener('pagehide',()=>{stopVoice();controller?.abort();});
 function listen() {
  if(!active||!dialog.open||busy||speaking)return;
  recognition=new SpeechRecognition();recognition.lang=document.documentElement.lang==='en'?'en-GB':document.documentElement.lang;
  recognition.interimResults=true;recognition.continuous=false;
  voiceLabel.textContent="Ouvindo · Encerrar voz";status.textContent="Ouvindo…";
  let heard=false;
  recognition.onresult=event=>{
   let transcript='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    transcript+=event.results[i][0].transcript;
    if(event.results[i].isFinal&&!heard){heard=true;void send(transcript);}
   }
   interim.textContent=transcript;
  };
  recognition.onerror=event=>{if(event.error!=='aborted'){stopVoice();status.textContent=event.error==='not-allowed'?"O acesso ao microfone não foi autorizado. Você pode continuar digitando.":"Não foi possível ouvir você. Tente iniciar novamente ou use o chat de texto.";}};
  recognition.onend=()=>{recognition=null;if(active&&!heard&&!busy&&!speaking){stopVoice();status.textContent="Não entendi. Inicie a voz novamente quando quiser.";}};
  try{recognition.start();}catch{stopVoice();status.textContent="A voz não está disponível aqui. Use o chat de texto.";}
 }
 function speak(text) {
  if(!active||!dialog.open)return;
  recognition?.abort();recognition=null;speaking=true;
  voiceLabel.textContent="Falando · Encerrar voz";status.textContent="Falando…";
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=document.documentElement.lang==='en'?'en-GB':document.documentElement.lang;utterance.rate=1;
  utterance.onend=()=>{speaking=false;if(active)listen();};
  utterance.onerror=()=>{stopVoice();status.textContent="O áudio não estava disponível. A resposta está na conversa acima.";};
  window.speechSynthesis.speak(utterance);
 }
 voiceButton.addEventListener('click',()=>{
  if(active){stopVoice();status.textContent="Voz encerrada. Sua conversa continua aqui.";return;}
  if(!supported||busy)return;active=true;voiceButton.setAttribute('aria-pressed','true');listen();
 });
 async function send(raw) {
  const text=raw.trim().slice(0,2000);if(!text||busy)return;
  busy=true;$('.advisor-send').disabled=true;$('.advisor-prompts').hidden=true;
  recognition?.abort();recognition=null;
  addMessage('user',text);
  if(pendingContext)messages.push({role:'user',content:"Exemplo do site selecionado (ilustrativo, não são dados do negócio): "+pendingContext});
  messages.push({role:'user',content:text});pendingContext='';input.value='';status.textContent=live?"Pensando…":"Preparando uma resposta guiada…";
  try {
   let reply;
   if(live){
    const url=new URL(endpoint,location.href);
    if(url.origin!==location.origin)throw new Error("O ponto de conexão do consultor deve estar neste site.");
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    try {
     const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.slice(-8)}),signal:controller.signal});
     if(!response.ok)throw new Error("Consultor indisponível");
     const body=await response.json();if(typeof body.reply!=='string'||!body.reply.trim())throw new Error("Resposta vazia");reply=body.reply;
    } finally {clearTimeout(timeout);controller=null;}
   } else reply=demoReply(text,selectedContext);
   messages.push({role:'assistant',content:reply});addMessage('assistant',reply);status.textContent='';
   busy=false;if(mode==='voice'&&active)speak(reply);
  } catch(error) {
   if(dialog.open){const message="O consultor ao vivo não conseguiu se conectar. Tente novamente. Sua mensagem não foi substituída por uma resposta de demonstração.";addMessage('assistant',message);status.textContent="Conexão indisponível.";}
   stopVoice();
  } finally {busy=false;$('.advisor-send').disabled=false;}
 }
 $('.advisor-compose').addEventListener('submit',event=>{event.preventDefault();void send(input.value);});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(input.value);}});
 $('.advisor-prompts').addEventListener('click',event=>{if(event.target.tagName==='BUTTON')void send(event.target.textContent);});
})();
