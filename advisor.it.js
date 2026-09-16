(async () => {
 const { demoReply } = await import('./advisor-demo.it.mjs');
 const endpoint = window.ROI_ADVISOR_API_URL || '';
 const live = Boolean(endpoint);
 const launcher = document.createElement('button');
 launcher.className = 'advisor-launcher';
 launcher.setAttribute('aria-haspopup','dialog');
 launcher.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z\" stroke=\"currentColor\" stroke-width=\"1.4\"/><path d=\"M7 11h.01M11 11h.01M15 11h.01\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg><span>Chiedi a Heading South</span>";
 const dialog = document.createElement('dialog');
 dialog.className='advisor-dialog';
 dialog.setAttribute('aria-labelledby','advisor-title');
 dialog.innerHTML = `<div class="advisor-shell"><header class="advisor-head"><p class="eyebrow">Heading South / Prima conversazione</p><h2 id="advisor-title">Un punto di partenza più chiaro.</h2><button class="advisor-close" aria-label="Chiudi il consulente">×</button><div class="advisor-tabs" role="tablist" aria-label="Modalità di conversazione"><button id="chat-tab" role="tab" aria-selected="true" aria-controls="chat-panel">Scrivi un messaggio</button><button id="voice-tab" role="tab" aria-selected="false" aria-controls="voice-panel" tabindex="-1">Parla con noi</button></div></header><div class="advisor-main"><div class="advisor-log" role="log" aria-label="Conversazione" aria-live="polite" aria-relevant="additions" tabindex="0"></div><div class="advisor-prompts"><button>Come lavorate?</button><button>Esplora il mio settore</button></div><p class="advisor-status" role="status"></p><section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><form class="advisor-compose"><label class="sr-only" for="advisor-input">Il tuo messaggio</label><textarea id="advisor-input" placeholder="Di cosa vorresti parlare?" rows="2" maxlength="2000" required></textarea><button class="advisor-send" aria-label="Invia messaggio">↑</button></form></section><section class="advisor-voice" id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" hidden><button class="voice-action" aria-pressed="false"><span class="voice-indicator" aria-hidden="true"></span><span class="voice-label">Avvia la prova vocale</span></button><p class="voice-interim" aria-live="polite"></p><p class="voice-notice">Prova vocale del browser. Il browser potrebbe elaborare l’audio tramite il proprio fornitore vocale. Usa le cuffie per una conversazione più chiara.</p></section></div><p class="advisor-foot">${live ? "Consulente AI · Non condividere informazioni riservate." : "Demo guidata · Nessuna AI live o base di conoscenza collegata."}</p></div>`;
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
  const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='user'?"Tu":'Heading South';
  article.append(speaker,document.createTextNode(text));log.append(article);log.scrollTop=log.scrollHeight;
 }
 addMessage('assistant',live ? "Ciao. Su cosa vorresti fare chiarezza riguardo alla tua impresa o ai tuoi progetti tecnologici?" : "Ciao, benvenuto in Heading South. Puoi esplorare il nostro approccio e dove potremmo aiutare la tua impresa. Questa anteprima usa risposte guidate; il consulente AI arriverà in seguito.");
 function stopVoice() {
  active=false;speaking=false;
  if(recognition){recognition.onend=null;recognition.abort();recognition=null;}
  window.speechSynthesis?.cancel();
  voiceButton.setAttribute('aria-pressed','false');voiceLabel.textContent="Avvia la prova vocale";interim.textContent='';
 }
 function setMode(next) {
  stopVoice();mode=next;status.textContent='';
  for(const [tab,value] of [[chatTab,'chat'],[voiceTab,'voice']]) {tab.setAttribute('aria-selected',String(value===mode));tab.tabIndex=value===mode?0:-1;}
  $('#chat-panel').hidden=mode!=='chat';$('#voice-panel').hidden=mode!=='voice';
  if(mode==='voice'&&!supported) {voiceButton.disabled=true;$('.voice-notice').textContent="La prova vocale non è supportata in questo browser. La chat testuale è disponibile. La voce Realtime sarà collegata in una versione successiva.";}
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
   addMessage('assistant',"Hai esplorato "+context+". L’esempio è illustrativo, non una valutazione della tua impresa. Cosa è simile o diverso nella tua situazione?");
   if(!input.value)input.value="Vorrei esplorare "+context.toLowerCase()+" per la mia impresa.";
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
  voiceLabel.textContent="In ascolto · Termina voce";status.textContent="In ascolto…";
  let heard=false;
  recognition.onresult=event=>{
   let transcript='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    transcript+=event.results[i][0].transcript;
    if(event.results[i].isFinal&&!heard){heard=true;void send(transcript);}
   }
   interim.textContent=transcript;
  };
  recognition.onerror=event=>{if(event.error!=='aborted'){stopVoice();status.textContent=event.error==='not-allowed'?"L’accesso al microfono non è stato autorizzato. Puoi continuare a scrivere.":"Non siamo riusciti a sentirti. Prova a riavviare o usa la chat testuale.";}};
  recognition.onend=()=>{recognition=null;if(active&&!heard&&!busy&&!speaking){stopVoice();status.textContent="Non ho capito. Riavvia la voce quando sei pronto.";}};
  try{recognition.start();}catch{stopVoice();status.textContent="La voce non è disponibile qui. Usa la chat testuale.";}
 }
 function speak(text) {
  if(!active||!dialog.open)return;
  recognition?.abort();recognition=null;speaking=true;
  voiceLabel.textContent="Risposta vocale · Termina voce";status.textContent="Risposta vocale…";
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=document.documentElement.lang==='en'?'en-GB':document.documentElement.lang;utterance.rate=1;
  utterance.onend=()=>{speaking=false;if(active)listen();};
  utterance.onerror=()=>{stopVoice();status.textContent="L’audio non era disponibile. La risposta è nella conversazione qui sopra.";};
  window.speechSynthesis.speak(utterance);
 }
 voiceButton.addEventListener('click',()=>{
  if(active){stopVoice();status.textContent="Voce terminata. La conversazione è ancora qui.";return;}
  if(!supported||busy)return;active=true;voiceButton.setAttribute('aria-pressed','true');listen();
 });
 async function send(raw) {
  const text=raw.trim().slice(0,2000);if(!text||busy)return;
  busy=true;$('.advisor-send').disabled=true;$('.advisor-prompts').hidden=true;
  recognition?.abort();recognition=null;
  addMessage('user',text);
  if(pendingContext)messages.push({role:'user',content:"Esempio del sito selezionato (illustrativo, non dati aziendali): "+pendingContext});
  messages.push({role:'user',content:text});pendingContext='';input.value='';status.textContent=live?"Sto riflettendo…":"Preparazione di una risposta guidata…";
  try {
   let reply;
   if(live){
    const url=new URL(endpoint,location.href);
    if(url.origin!==location.origin)throw new Error("L’endpoint del consulente deve essere su questo sito.");
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    try {
     const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.slice(-8)}),signal:controller.signal});
     if(!response.ok)throw new Error("Consulente non disponibile");
     const body=await response.json();if(typeof body.reply!=='string'||!body.reply.trim())throw new Error("Risposta vuota");reply=body.reply;
    } finally {clearTimeout(timeout);controller=null;}
   } else reply=demoReply(text,selectedContext);
   messages.push({role:'assistant',content:reply});addMessage('assistant',reply);status.textContent='';
   busy=false;if(mode==='voice'&&active)speak(reply);
  } catch(error) {
   if(dialog.open){const message="Il consulente live non è riuscito a connettersi. Riprova. Il tuo messaggio non è stato sostituito con una risposta demo.";addMessage('assistant',message);status.textContent="Connessione non disponibile.";}
   stopVoice();
  } finally {busy=false;$('.advisor-send').disabled=false;}
 }
 $('.advisor-compose').addEventListener('submit',event=>{event.preventDefault();void send(input.value);});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(input.value);}});
 $('.advisor-prompts').addEventListener('click',event=>{if(event.target.tagName==='BUTTON')void send(event.target.textContent);});
})();
