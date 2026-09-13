const advisor = document.createElement('aside');
advisor.id = 'roi-advisor';
advisor.innerHTML = `<button class="advisor-launch" aria-label="Open ROI AI advisor"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 18.5 3.7 21l3.2-.9A8.7 8.7 0 1 0 5 18.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke-linecap="round" stroke-width="2.5"/></svg></button><section class="advisor-panel" aria-label="ROI AI advisor"><div class="advisor-top"><div><p class="advisor-kicker">ROI AI / First conversation</p><h2>What are you trying to make happen?</h2></div><button class="advisor-close" aria-label="Close advisor">×</button></div><div class="advisor-feed"><div class="advisor-message assistant">I’m the ROI AI advisor. Tell me about the decision, friction or opportunity in front of you, and I’ll help you find the right starting point.</div></div><div class="advisor-prompts"><button>Where should we start?</button><button>How do you work?</button><button>Is this relevant to my sector?</button></div><form class="advisor-compose"><input aria-label="Ask the ROI AI advisor" placeholder="Ask a question…" /><button aria-label="Send question">↗</button></form><p class="advisor-note">DEMO ADVISOR · TEST EXPERIENCE · NO KNOWLEDGE BASE CONNECTED</p></section>`;
document.body.append(advisor);

const panel = advisor.querySelector('.advisor-panel');
const launch = advisor.querySelector('.advisor-launch');
const close = advisor.querySelector('.advisor-close');
const form = advisor.querySelector('.advisor-compose');
const input = form.querySelector('input');
const feed = advisor.querySelector('.advisor-feed');
const prompts = advisor.querySelectorAll('.advisor-prompts button');
const history = [];
const respond = (question) => {
  const q = question.toLowerCase();
  if (/how.*work|approach|process|engage/.test(q)) return 'We begin with the business problem, not a tool. Together, we find the highest-value opportunity, shape the right response, then define how return and adoption will be proven.';
  if (/agri|food|farm|drone|field|crop/.test(q)) return 'Agrifood & AgriTech is our first focus. We can explore precision operations, drone and geospatial intelligence, or supply-chain insight—always starting with the decision you need to improve.';
  if (/export|trade|logistic|supply/.test(q)) return 'For export and trade, the first useful question is usually where uncertainty or repeat friction is slowing commercial decisions. Market intelligence, compliance workflows and operational visibility are good places to begin.';
  if (/finance|invest|capital|portfolio/.test(q)) return 'For finance and investment, ROI AI helps bring more structure to the questions beneath an opportunity: where value can be created, what technology is required, and how the return will be evidenced.';
  if (/sector|relevant|industry/.test(q)) return 'Our starting point is not a predefined sector—it is the combination of complexity, data and an important decision. Agrifood is the first focus, but the same standard applies across trade, investment, operations and growth.';
  if (/start|help|hello|hi/.test(q)) return 'Start with the decision that currently feels expensive, slow, uncertain or full of untapped potential. Tell me what it is, and I’ll help frame a useful first conversation.';
  return 'That sounds like the kind of question worth exploring. In a live engagement, we would first clarify the decision, the people involved and the evidence of value—then decide whether AI has a meaningful role to play.';
};
const addMessage = (text, kind) => { const el = document.createElement('div'); el.className = `advisor-message ${kind}`; el.textContent = text; feed.append(el); feed.scrollTop = feed.scrollHeight; };
const ask = async (question) => {
  if (!question.trim()) return;
  addMessage(question, 'user');
  history.push({ role: 'user', content: question });
  input.value = '';
  const endpoint = window.ROI_ADVISOR_API_URL;
  if (!endpoint) { window.setTimeout(() => { const reply = respond(question); history.push({ role: 'assistant', content: reply }); addMessage(reply, 'assistant'); }, 300); return; }
  const thinking = document.createElement('div'); thinking.className = 'advisor-message assistant'; thinking.textContent = 'Considering the right place to begin…'; feed.append(thinking); feed.scrollTop = feed.scrollHeight;
  try {
    const result = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-8) }) });
    if (!result.ok) throw new Error('Advisor unavailable');
    const { reply } = await result.json();
    thinking.remove(); history.push({ role: 'assistant', content: reply }); addMessage(reply, 'assistant');
  } catch (error) { thinking.remove(); const reply = respond(question); history.push({ role: 'assistant', content: reply }); addMessage(reply, 'assistant'); }
};
launch.addEventListener('click', () => { panel.classList.add('open'); launch.setAttribute('aria-expanded','true'); input.focus(); });
close.addEventListener('click', () => { panel.classList.remove('open'); launch.setAttribute('aria-expanded','false'); });
form.addEventListener('submit', (event) => { event.preventDefault(); ask(input.value); });
prompts.forEach((button) => button.addEventListener('click', () => ask(button.textContent)));
