const voice = document.createElement('aside');
voice.id = 'roi-voice';
voice.innerHTML = `<button class="voice-launch" aria-label="Open voice conversation"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M8.5 21h7" stroke-linecap="round"/></svg>VOICE</button><section class="voice-panel" aria-label="ROI AI voice advisor"><div class="voice-top"><div><p class="voice-kicker">ROI AI / Voice conversation</p><h2>Speak naturally.<br />I’ll listen.</h2></div><button class="voice-close" aria-label="Close voice advisor">×</button></div><div class="voice-orb"><button aria-label="Start listening">⌁</button></div><p class="voice-status">Start a voice conversation about the decision in front of you.</p><div class="voice-transcript"><span>Conversation</span><div class="voice-text">Your words will appear here.</div></div><button class="voice-switch">Prefer to type? Open chat ↗</button><p class="voice-note">VOICE PREVIEW · BROWSER SPEECH · LIVE REALTIME CONNECTION TO FOLLOW</p></section>`;
document.body.append(voice);
const voicePanel = voice.querySelector('.voice-panel');
const voiceButton = voice.querySelector('.voice-launch');
const voiceClose = voice.querySelector('.voice-close');
const listenButton = voice.querySelector('.voice-orb button');
const voiceOrb = voice.querySelector('.voice-orb');
const voiceStatus = voice.querySelector('.voice-status');
const voiceText = voice.querySelector('.voice-text');
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speak = (text) => { if (!('speechSynthesis' in window)) return; window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(text)); };
const openVoice = () => { voicePanel.classList.add('open'); };
voiceButton.addEventListener('click', openVoice);
voiceClose.addEventListener('click', () => voicePanel.classList.remove('open'));
voice.querySelector('.voice-switch').addEventListener('click', () => { voicePanel.classList.remove('open'); document.querySelector('.advisor-launch')?.click(); });
listenButton.addEventListener('click', () => {
  if (!Recognition) { voiceStatus.textContent = 'Voice input is not available in this browser. You can still use the text advisor.'; return; }
  const recognition = new Recognition(); recognition.lang = 'en-GB'; recognition.interimResults = true; recognition.continuous = false;
  recognition.onstart = () => { voiceOrb.classList.add('listening'); voiceStatus.textContent = 'Listening… speak naturally.'; voiceText.textContent = ''; };
  recognition.onresult = (event) => { const transcript = Array.from(event.results).map((result) => result[0].transcript).join(''); voiceText.textContent = transcript; if (event.results[0].isFinal) { const reply = window.roiAdvisorReply ? window.roiAdvisorReply(transcript) : 'Tell me more about the decision in front of you.'; voiceStatus.textContent = 'ROI AI is responding…'; window.setTimeout(() => { voiceText.textContent = reply; voiceStatus.textContent = 'Tap the centre to continue.'; speak(reply); }, 350); } };
  recognition.onerror = () => { voiceStatus.textContent = 'I could not hear that. Please try again, or use chat.'; voiceOrb.classList.remove('listening'); };
  recognition.onend = () => voiceOrb.classList.remove('listening'); recognition.start();
});
