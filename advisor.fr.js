(async () => {
 const { demoReply } = await import('./advisor-demo.fr.mjs');
 const endpoint = window.ROI_ADVISOR_API_URL || '';
 const live = Boolean(endpoint);
 const launcher = document.createElement('button');
 launcher.className = 'advisor-launcher';
 launcher.setAttribute('aria-haspopup','dialog');
 launcher.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" aria-hidden=\"true\"><path d=\"M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z\" stroke=\"currentColor\" stroke-width=\"1.4\"/><path d=\"M7 11h.01M11 11h.01M15 11h.01\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"/></svg><span>Demandez à ROI AI</span>";
 const dialog = document.createElement('dialog');
 dialog.className='advisor-dialog';
 dialog.setAttribute('aria-labelledby','advisor-title');
 dialog.innerHTML = `<div class="advisor-shell"><header class="advisor-head"><p class="eyebrow">ROI AI / Premier échange</p><h2 id="advisor-title">Un point de départ plus clair.</h2><button class="advisor-close" aria-label="Fermer le conseiller">×</button><div class="advisor-tabs" role="tablist" aria-label="Mode de conversation"><button id="chat-tab" role="tab" aria-selected="true" aria-controls="chat-panel">Écrire un message</button><button id="voice-tab" role="tab" aria-selected="false" aria-controls="voice-panel" tabindex="-1">Parler avec nous</button></div></header><div class="advisor-main"><div class="advisor-log" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions" tabindex="0"></div><div class="advisor-prompts"><button>Comment travaillez-vous ?</button><button>Explorer mon secteur</button></div><p class="advisor-status" role="status"></p><section id="chat-panel" role="tabpanel" aria-labelledby="chat-tab"><form class="advisor-compose"><label class="sr-only" for="advisor-input">Votre message</label><textarea id="advisor-input" placeholder="De quoi souhaitez-vous parler ?" rows="2" maxlength="2000" required></textarea><button class="advisor-send" aria-label="Envoyer le message">↑</button></form></section><section class="advisor-voice" id="voice-panel" role="tabpanel" aria-labelledby="voice-tab" hidden><button class="voice-action" aria-pressed="false"><span class="voice-indicator" aria-hidden="true"></span><span class="voice-label">Démarrer l’essai vocal</span></button><p class="voice-interim" aria-live="polite"></p><p class="voice-notice">Essai vocal du navigateur. Celui-ci peut traiter l’audio via son fournisseur vocal. Utilisez un casque pour un échange plus clair.</p></section></div><p class="advisor-foot">${live ? "Conseiller IA · Ne partagez pas d’informations confidentielles." : "Démo guidée · Aucune IA en direct ni base de connaissances connectée."}</p></div>`;
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
  const speaker=document.createElement('span');speaker.className='speaker';speaker.textContent=role==='user'?"Vous":'ROI AI';
  article.append(speaker,document.createTextNode(text));log.append(article);log.scrollTop=log.scrollHeight;
 }
 addMessage('assistant',live ? "Bonjour. Que souhaitez-vous clarifier concernant votre entreprise ou vos projets technologiques ?" : "Bonjour, bienvenue chez ROI AI. Découvrez notre approche et comment nous pourrions aider votre entreprise. Cet aperçu utilise des réponses guidées ; le conseiller IA viendra ensuite.");
 function stopVoice() {
  active=false;speaking=false;
  if(recognition){recognition.onend=null;recognition.abort();recognition=null;}
  window.speechSynthesis?.cancel();
  voiceButton.setAttribute('aria-pressed','false');voiceLabel.textContent="Démarrer l’essai vocal";interim.textContent='';
 }
 function setMode(next) {
  stopVoice();mode=next;status.textContent='';
  for(const [tab,value] of [[chatTab,'chat'],[voiceTab,'voice']]) {tab.setAttribute('aria-selected',String(value===mode));tab.tabIndex=value===mode?0:-1;}
  $('#chat-panel').hidden=mode!=='chat';$('#voice-panel').hidden=mode!=='voice';
  if(mode==='voice'&&!supported) {voiceButton.disabled=true;$('.voice-notice').textContent="L’essai vocal n’est pas pris en charge par ce navigateur. Le chat écrit reste disponible. La voix Realtime sera connectée dans une prochaine version.";}
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
   addMessage('assistant',"Vous avez exploré "+context+". Cet exemple est illustratif, pas une évaluation de votre entreprise. Qu’est-ce qui est semblable ou différent dans votre situation ?");
   if(!input.value)input.value="Je voudrais explorer "+context.toLowerCase()+" pour mon entreprise.";
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
  voiceLabel.textContent="Écoute · Terminer la voix";status.textContent="Écoute…";
  let heard=false;
  recognition.onresult=event=>{
   let transcript='';
   for(let i=event.resultIndex;i<event.results.length;i++){
    transcript+=event.results[i][0].transcript;
    if(event.results[i].isFinal&&!heard){heard=true;void send(transcript);}
   }
   interim.textContent=transcript;
  };
  recognition.onerror=event=>{if(event.error!=='aborted'){stopVoice();status.textContent=event.error==='not-allowed'?"L’accès au microphone n’a pas été autorisé. Vous pouvez continuer à écrire.":"Nous n’avons pas pu vous entendre. Réessayez ou utilisez le chat écrit.";}};
  recognition.onend=()=>{recognition=null;if(active&&!heard&&!busy&&!speaking){stopVoice();status.textContent="Je n’ai pas compris. Relancez la voix quand vous le souhaitez.";}};
  try{recognition.start();}catch{stopVoice();status.textContent="La voix n’est pas disponible ici. Utilisez le chat écrit.";}
 }
 function speak(text) {
  if(!active||!dialog.open)return;
  recognition?.abort();recognition=null;speaking=true;
  voiceLabel.textContent="Réponse vocale · Terminer la voix";status.textContent="Réponse vocale…";
  const utterance=new SpeechSynthesisUtterance(text);utterance.lang=document.documentElement.lang==='en'?'en-GB':document.documentElement.lang;utterance.rate=1;
  utterance.onend=()=>{speaking=false;if(active)listen();};
  utterance.onerror=()=>{stopVoice();status.textContent="La lecture audio n’était pas disponible. La réponse figure dans la conversation ci-dessus.";};
  window.speechSynthesis.speak(utterance);
 }
 voiceButton.addEventListener('click',()=>{
  if(active){stopVoice();status.textContent="Voix terminée. Votre conversation reste disponible.";return;}
  if(!supported||busy)return;active=true;voiceButton.setAttribute('aria-pressed','true');listen();
 });
 async function send(raw) {
  const text=raw.trim().slice(0,2000);if(!text||busy)return;
  busy=true;$('.advisor-send').disabled=true;$('.advisor-prompts').hidden=true;
  recognition?.abort();recognition=null;
  addMessage('user',text);
  if(pendingContext)messages.push({role:'user',content:"Exemple du site sélectionné (illustratif, pas de données d’entreprise) : "+pendingContext});
  messages.push({role:'user',content:text});pendingContext='';input.value='';status.textContent=live?"Réflexion…":"Préparation d’une réponse guidée…";
  try {
   let reply;
   if(live){
    const url=new URL(endpoint,location.href);
    if(url.origin!==location.origin)throw new Error("Le point de connexion du conseiller doit se trouver sur ce site.");
    controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),25000);
    try {
     const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:messages.slice(-8)}),signal:controller.signal});
     if(!response.ok)throw new Error("Conseiller indisponible");
     const body=await response.json();if(typeof body.reply!=='string'||!body.reply.trim())throw new Error("Réponse vide");reply=body.reply;
    } finally {clearTimeout(timeout);controller=null;}
   } else reply=demoReply(text,selectedContext);
   messages.push({role:'assistant',content:reply});addMessage('assistant',reply);status.textContent='';
   busy=false;if(mode==='voice'&&active)speak(reply);
  } catch(error) {
   if(dialog.open){const message="Le conseiller en direct n’a pas pu se connecter. Réessayez. Votre message n’a pas été remplacé par une réponse de démonstration.";addMessage('assistant',message);status.textContent="Connexion indisponible.";}
   stopVoice();
  } finally {busy=false;$('.advisor-send').disabled=false;}
 }
 $('.advisor-compose').addEventListener('submit',event=>{event.preventDefault();void send(input.value);});
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();void send(input.value);}});
 $('.advisor-prompts').addEventListener('click',event=>{if(event.target.tagName==='BUTTON')void send(event.target.textContent);});
})();
