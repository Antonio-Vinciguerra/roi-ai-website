import { advisorLocale } from './advisor-language.mjs';

const locale = advisorLocale(document.documentElement.lang);
const endpoint = window.ROI_CALLBACK_API_URL || '';
const turnstileSiteKey = window.ROI_TURNSTILE_SITE_KEY || '';

const copy = {
  en: {
    eyebrow: 'Heading South / Call back', title: 'Choose the next conversation.',
    intro: 'Tell us what would be useful and when to call. We will review every request before any outbound call is made.',
    reason: 'What would you like help with?', discovery: '30-minute discovery call', discoveryNote: 'Explore a business decision or opportunity.',
    support: 'Existing customer support', supportNote: 'Get help with an active Heading South engagement.',
    information: 'Product or service information', informationNote: 'Understand our approach, services or fit.',
    timing: 'When should we call?', soon: 'Request a call now', soonNote: 'We will aim to call as soon as possible during business hours.',
    schedule: 'Choose a day and time', scheduleNote: 'We will call in the time zone you select.',
    details: 'Your details', name: 'Name', email: 'Work email', phone: 'Phone number', company: 'Company (optional)',
    date: 'Preferred date', time: 'Preferred time', notes: 'Anything we should know? (optional)',
    consent: 'I agree that Heading South may call me on this number about this request.', privacy: 'Privacy Notice',
    submit: 'Request a call back', sending: 'Sending your request…', success: 'Thank you. Your request has been received. We will confirm the next step shortly.',
    unavailable: 'Callback requests are not available at the moment. Please use the booking link or email us directly.',
    failed: 'We could not send the request. Please try again or use the booking link.', future: 'Please choose a future date and time.', close: 'Close callback request', timezone: 'Time zone',
  },
  it: {
    eyebrow: 'Heading South / Richiedi una chiamata', title: 'Scegli il prossimo confronto.',
    intro: 'Dicci di cosa hai bisogno e quando preferisci essere chiamato. Ogni richiesta viene valutata prima di effettuare una chiamata in uscita.',
    reason: 'In cosa possiamo esserti utili?', discovery: 'Confronto conoscitivo di 30 minuti', discoveryNote: 'Esplora una decisione o un’opportunità per la tua impresa.',
    support: 'Supporto per clienti esistenti', supportNote: 'Ricevi assistenza su un’attività Heading South in corso.',
    information: 'Informazioni su servizi e approccio', informationNote: 'Scopri approccio, servizi o compatibilità.',
    timing: 'Quando preferisci ricevere la chiamata?', soon: 'Richiedi una chiamata ora', soonNote: 'Cercheremo di chiamarti al più presto durante l’orario lavorativo.',
    schedule: 'Scegli giorno e orario', scheduleNote: 'Ti chiameremo nel fuso orario indicato.',
    details: 'I tuoi dati', name: 'Nome e cognome', email: 'Email di lavoro', phone: 'Numero di telefono', company: 'Azienda (facoltativo)',
    date: 'Data preferita', time: 'Orario preferito', notes: 'C’è altro che dovremmo sapere? (facoltativo)',
    consent: 'Acconsento a essere contattato telefonicamente da Heading South in merito a questa richiesta.', privacy: 'Informativa sulla privacy',
    submit: 'Richiedi una chiamata', sending: 'Invio della richiesta in corso…', success: 'Grazie. Abbiamo ricevuto la tua richiesta e ti confermeremo a breve il prossimo passo.',
    unavailable: 'Le richieste di chiamata non sono disponibili al momento. Puoi usare il link per prenotare o scriverci direttamente.',
    failed: 'Non siamo riusciti a inviare la richiesta. Riprova o usa il link per prenotare.', future: 'Scegli una data e un orario futuri.', close: 'Chiudi la richiesta di chiamata', timezone: 'Fuso orario',
  },
  fr: {
    eyebrow: 'Heading South / Être rappelé', title: 'Choisissez la suite de l’échange.',
    intro: 'Indiquez-nous ce qui vous serait utile et le moment où vous appeler. Chaque demande est examinée avant tout appel sortant.',
    reason: 'Comment pouvons-nous vous aider ?', discovery: 'Échange découverte de 30 minutes', discoveryNote: 'Explorer une décision ou une opportunité pour votre entreprise.',
    support: 'Support pour client existant', supportNote: 'Obtenir de l’aide sur une mission Heading South en cours.',
    information: 'Information sur nos services', informationNote: 'Comprendre notre approche, nos services ou leur pertinence.',
    timing: 'Quand souhaitez-vous être appelé ?', soon: 'Demander un rappel maintenant', soonNote: 'Nous essaierons de vous appeler au plus vite pendant les heures ouvrées.',
    schedule: 'Choisir un jour et une heure', scheduleNote: 'Nous vous appellerons dans le fuseau horaire indiqué.',
    details: 'Vos coordonnées', name: 'Nom complet', email: 'E-mail professionnel', phone: 'Numéro de téléphone', company: 'Entreprise (facultatif)',
    date: 'Date souhaitée', time: 'Heure souhaitée', notes: 'Y a-t-il autre chose à savoir ? (facultatif)',
    consent: 'J’accepte que Heading South m’appelle à ce numéro au sujet de cette demande.', privacy: 'Politique de confidentialité',
    submit: 'Demander un rappel', sending: 'Envoi de votre demande…', success: 'Merci. Votre demande a bien été reçue. Nous confirmerons la prochaine étape prochainement.',
    unavailable: 'Les demandes de rappel ne sont pas disponibles pour le moment. Vous pouvez utiliser le lien de réservation ou nous écrire directement.',
    failed: 'Nous n’avons pas pu envoyer votre demande. Réessayez ou utilisez le lien de réservation.', future: 'Choisissez une date et une heure dans le futur.', close: 'Fermer la demande de rappel', timezone: 'Fuseau horaire',
  },
  es: {
    eyebrow: 'Heading South / Solicitar una llamada', title: 'Elige la siguiente conversación.',
    intro: 'Cuéntanos qué te resultaría útil y cuándo llamarte. Revisamos cada solicitud antes de realizar cualquier llamada saliente.',
    reason: '¿Cómo podemos ayudarte?', discovery: 'Llamada de descubrimiento de 30 minutos', discoveryNote: 'Explora una decisión u oportunidad para tu negocio.',
    support: 'Soporte para clientes actuales', supportNote: 'Recibe ayuda con un proyecto de Heading South en curso.',
    information: 'Información sobre productos o servicios', informationNote: 'Conoce nuestro enfoque, servicios o encaje.',
    timing: '¿Cuándo quieres que te llamemos?', soon: 'Solicitar una llamada ahora', soonNote: 'Intentaremos llamarte lo antes posible en horario laboral.',
    schedule: 'Elegir día y hora', scheduleNote: 'Te llamaremos en la zona horaria que indiques.',
    details: 'Tus datos', name: 'Nombre completo', email: 'Correo profesional', phone: 'Número de teléfono', company: 'Empresa (opcional)',
    date: 'Fecha preferida', time: 'Hora preferida', notes: '¿Hay algo más que debamos saber? (opcional)',
    consent: 'Acepto que Heading South me llame a este número en relación con esta solicitud.', privacy: 'Aviso de privacidad',
    submit: 'Solicitar una llamada', sending: 'Enviando tu solicitud…', success: 'Gracias. Hemos recibido tu solicitud y confirmaremos el siguiente paso en breve.',
    unavailable: 'Las solicitudes de llamada no están disponibles en este momento. Puedes usar el enlace de reserva o escribirnos directamente.',
    failed: 'No hemos podido enviar la solicitud. Inténtalo de nuevo o usa el enlace de reserva.', future: 'Elige una fecha y hora futuras.', close: 'Cerrar solicitud de llamada', timezone: 'Zona horaria',
  },
  'pt-BR': {
    eyebrow: 'Heading South / Solicitar uma ligação', title: 'Escolha a próxima conversa.',
    intro: 'Conte-nos o que seria útil e quando devemos ligar. Revisamos cada pedido antes de fazer qualquer ligação de saída.',
    reason: 'Como podemos ajudar?', discovery: 'Conversa de descoberta de 30 minutos', discoveryNote: 'Explore uma decisão ou oportunidade para a sua empresa.',
    support: 'Suporte para clientes existentes', supportNote: 'Obtenha ajuda em um trabalho da Heading South em andamento.',
    information: 'Informações sobre serviços', informationNote: 'Entenda nossa abordagem, serviços ou aderência.',
    timing: 'Quando devemos ligar?', soon: 'Solicitar uma ligação agora', soonNote: 'Tentaremos ligar o mais rápido possível, em horário comercial.',
    schedule: 'Escolher dia e horário', scheduleNote: 'Ligaremos no fuso horário que você indicar.',
    details: 'Seus dados', name: 'Nome completo', email: 'E-mail profissional', phone: 'Número de telefone', company: 'Empresa (opcional)',
    date: 'Data preferida', time: 'Horário preferido', notes: 'Há algo mais que devemos saber? (opcional)',
    consent: 'Concordo que a Heading South entre em contato por telefone neste número sobre esta solicitação.', privacy: 'Aviso de privacidade',
    submit: 'Solicitar uma ligação', sending: 'Enviando sua solicitação…', success: 'Obrigado. Recebemos sua solicitação e confirmaremos o próximo passo em breve.',
    unavailable: 'As solicitações de ligação não estão disponíveis neste momento. Use o link de agendamento ou escreva para nós diretamente.',
    failed: 'Não foi possível enviar sua solicitação. Tente novamente ou use o link de agendamento.', future: 'Escolha uma data e horário no futuro.', close: 'Fechar solicitação de ligação', timezone: 'Fuso horário',
  },
}[locale] || null;

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const safeText = (value, max) => String(value || '').trim().replace(/[<>]/g, '').slice(0, max);
const attribution = () => {
  try { return JSON.parse(sessionStorage.getItem('headingSouthAttribution') || '{}'); }
  catch { return {}; }
};

function createDialog() {
  const dialog = document.createElement('dialog');
  dialog.className = 'callback-dialog';
  dialog.setAttribute('aria-labelledby', 'callback-title');
  dialog.innerHTML = `<div class="callback-shell">
    <button class="callback-close" type="button" aria-label="${escape(copy.close)}">×</button>
    <p class="callback-eyebrow">${escape(copy.eyebrow)}</p>
    <h2 id="callback-title">${escape(copy.title)}</h2>
    <p class="callback-intro">${escape(copy.intro)}</p>
    <form class="callback-form" novalidate>
      <fieldset class="callback-set"><legend>${escape(copy.reason)}</legend><div class="callback-options">
        <label class="callback-option"><input type="radio" name="requestType" value="discovery" checked><strong>${escape(copy.discovery)}</strong><small>${escape(copy.discoveryNote)}</small></label>
        <label class="callback-option"><input type="radio" name="requestType" value="support"><strong>${escape(copy.support)}</strong><small>${escape(copy.supportNote)}</small></label>
        <label class="callback-option"><input type="radio" name="requestType" value="information"><strong>${escape(copy.information)}</strong><small>${escape(copy.informationNote)}</small></label>
      </div></fieldset>
      <fieldset class="callback-set"><legend>${escape(copy.timing)}</legend><div class="callback-options">
        <label class="callback-option"><input type="radio" name="timing" value="now" checked><strong>${escape(copy.soon)}</strong><small>${escape(copy.soonNote)}</small></label>
        <label class="callback-option"><input type="radio" name="timing" value="scheduled"><strong>${escape(copy.schedule)}</strong><small>${escape(copy.scheduleNote)}</small></label>
      </div></fieldset>
      <div class="callback-schedule" hidden><div class="callback-grid">
        <label class="callback-field"><span>${escape(copy.date)}</span><input name="date" type="date"></label>
        <label class="callback-field"><span>${escape(copy.time)}</span><input name="time" type="time"></label>
        <label class="callback-field full"><span>${escape(copy.timezone)}</span><input name="timezone" readonly></label>
      </div></div>
      <fieldset class="callback-set"><legend>${escape(copy.details)}</legend><div class="callback-grid">
        <label class="callback-field"><span>${escape(copy.name)}</span><input name="name" autocomplete="name" maxlength="120" required></label>
        <label class="callback-field"><span>${escape(copy.email)}</span><input name="email" autocomplete="email" type="email" maxlength="160" required></label>
        <label class="callback-field"><span>${escape(copy.phone)}</span><input name="phone" autocomplete="tel" type="tel" inputmode="tel" maxlength="32" required></label>
        <label class="callback-field"><span>${escape(copy.company)}</span><input name="company" autocomplete="organization" maxlength="160"></label>
        <label class="callback-field full"><span>${escape(copy.notes)}</span><textarea name="notes" maxlength="1000"></textarea></label>
      </div></fieldset>
      <label class="callback-consent"><input name="consent" type="checkbox" required><span>${escape(copy.consent)}</span></label>
      <p class="callback-privacy"><a href="privacy.html">${escape(copy.privacy)}</a></p>
      <div class="callback-turnstile" aria-live="polite"></div>
      <button class="button callback-submit" type="submit">${escape(copy.submit)}</button>
      <p class="callback-status" role="status" aria-live="polite"></p>
    </form>
  </div>`;
  document.body.append(dialog);
  return dialog;
}

async function loadTurnstile() {
  if (!turnstileSiteKey) return false;
  if (window.turnstile) return true;
  return new Promise(resolve => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => resolve(Boolean(window.turnstile));
    script.onerror = () => resolve(false);
    document.head.append(script);
  });
}

async function init() {
  if (!copy) return;
  document.querySelectorAll('.contact footer').forEach(footer => {
    if (footer.querySelector('[data-privacy-link]')) return;
    const link = document.createElement('a');
    link.href = 'privacy.html';
    link.dataset.privacyLink = 'true';
    link.textContent = copy.privacy;
    footer.append(link);
  });
  const dialog = createDialog();
  const form = dialog.querySelector('form');
  const status = dialog.querySelector('.callback-status');
  const submit = dialog.querySelector('.callback-submit');
  const schedule = dialog.querySelector('.callback-schedule');
  const date = form.elements.date;
  const time = form.elements.time;
  const timezone = form.elements.timezone;
  timezone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  date.min = new Date().toISOString().slice(0, 10);
  let returnFocus = null;
  let token = '';

  const setStatus = (message, state = '') => { status.textContent = message; status.dataset.state = state; };
  const updateTiming = () => {
    const scheduled = form.elements.timing.value === 'scheduled';
    schedule.hidden = !scheduled;
    date.required = scheduled;
    time.required = scheduled;
  };
  form.addEventListener('change', event => { if (event.target.name === 'timing') updateTiming(); });
  updateTiming();

  dialog.querySelector('.callback-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => returnFocus?.focus());

  if (await loadTurnstile()) {
    window.turnstile.render(dialog.querySelector('.callback-turnstile'), {
      sitekey: turnstileSiteKey,
      callback: value => { token = value; },
      'expired-callback': () => { token = ''; },
    });
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-callback-open]');
    if (!trigger || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    returnFocus = trigger;
    setStatus('');
    dialog.showModal();
    form.elements.name.focus();
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const scheduled = form.elements.timing.value === 'scheduled';
    const scheduledAt = scheduled ? new Date(`${date.value}T${time.value}`) : null;
    if (scheduled && (!scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date())) {
      setStatus(copy.future, 'error'); return;
    }
    if (!endpoint || !turnstileSiteKey || !token) {
      setStatus(copy.unavailable, 'error'); return;
    }
    const payload = {
      schemaVersion: 1, source: 'website', requestType: form.elements.requestType.value,
      timing: form.elements.timing.value, scheduledFor: scheduledAt?.toISOString() || null,
      timezone: timezone.value, locale, name: safeText(form.elements.name.value, 120),
      email: safeText(form.elements.email.value, 160).toLowerCase(), phone: safeText(form.elements.phone.value, 32),
      company: safeText(form.elements.company.value, 160), notes: safeText(form.elements.notes.value, 1000),
      consent: { call: true, capturedAt: new Date().toISOString(), wordingVersion: 'callback-v1' },
      attribution: attribution(), page: location.pathname, turnstileToken: token,
    };
    submit.disabled = true; setStatus(copy.sending);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status !== 202) throw new Error('callback request unavailable');
      setStatus(copy.success, 'success');
      form.reset(); updateTiming(); token = '';
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'hs_callback_requested', request_type: payload.requestType, timing: payload.timing, language: locale });
    } catch { setStatus(copy.failed, 'error'); }
    finally { submit.disabled = false; }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init(); }, { once: true });
else void init();
