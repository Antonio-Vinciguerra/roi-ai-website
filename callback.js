import { advisorLocale } from './advisor-language.mjs';

const locale = advisorLocale(document.documentElement.lang);
const endpoint = window.ROI_CALLBACK_API_URL || '';
const turnstileSiteKey = window.ROI_TURNSTILE_SITE_KEY || '';

const copy = {
  en: {
    eyebrow: 'Heading South / Call back', title: 'Request a call back.',
    intro: 'Tell us when to call and what language you prefer.',
    reason: 'What would you like help with?', discovery: '30-minute discovery call', discoveryNote: 'Explore a business decision or opportunity.',
    support: 'Existing customer support', supportNote: 'Get help with an active Heading South engagement.',
    information: 'Product or service information', informationNote: 'Understand our approach, services or fit.',
    timing: 'When should we call?', soon: 'Request a call now', soonNote: 'We will aim to call as soon as possible during business hours.',
    schedule: 'Choose a day and time', scheduleNote: 'We will call in the time zone you select.',
    details: 'Your details', name: 'Name', email: 'Work email', phone: 'Phone number', company: 'Company (optional)',
    callLanguage: 'Call language', languageNote: 'We’ll use this language for the call.',
    optionalDetails: 'Add a little context (optional)',
    date: 'Preferred date', time: 'Preferred time', notes: 'Anything we should know? (optional)',
    consent: 'I agree that Heading South may call me on this number about this request.', privacy: 'Privacy Notice',
    submit: 'Request a call back', sending: 'Sending your request…', nowSuccess: 'Thank you. Your advisor will call shortly.', scheduledSuccess: 'Thank you. Your callback has been scheduled.',
    unavailable: 'Callback requests are not available at the moment. Please use the booking link or email us directly.',
    failed: 'We could not send the request. Please try again or use the booking link.', future: 'Please choose a future date and time.', close: 'Close callback request', timezone: 'Time zone',
  },
  it: {
    eyebrow: 'Heading South / Richiedi una chiamata', title: 'Richiedi una chiamata.',
    intro: 'Indicaci quando chiamarti e in quale lingua.',
    reason: 'In cosa possiamo esserti utili?', discovery: 'Confronto conoscitivo di 30 minuti', discoveryNote: 'Esplora una decisione o un’opportunità per la tua impresa.',
    support: 'Supporto per clienti esistenti', supportNote: 'Ricevi assistenza su un’attività Heading South in corso.',
    information: 'Informazioni su servizi e approccio', informationNote: 'Scopri approccio, servizi o compatibilità.',
    timing: 'Quando preferisci ricevere la chiamata?', soon: 'Richiedi una chiamata ora', soonNote: 'Cercheremo di chiamarti al più presto durante l’orario lavorativo.',
    schedule: 'Scegli giorno e orario', scheduleNote: 'Ti chiameremo nel fuso orario indicato.',
    details: 'I tuoi dati', name: 'Nome e cognome', email: 'Email di lavoro', phone: 'Numero di telefono', company: 'Azienda (facoltativo)',
    callLanguage: 'Lingua della chiamata', languageNote: 'Useremo questa lingua per la chiamata.',
    optionalDetails: 'Aggiungi qualche dettaglio (facoltativo)',
    date: 'Data preferita', time: 'Orario preferito', notes: 'C’è altro che dovremmo sapere? (facoltativo)',
    consent: 'Acconsento a essere contattato telefonicamente da Heading South in merito a questa richiesta.', privacy: 'Informativa sulla privacy',
    submit: 'Richiedi una chiamata', sending: 'Invio della richiesta in corso…', nowSuccess: 'Grazie. Il tuo consulente ti chiamerà a breve.', scheduledSuccess: 'Grazie. La tua chiamata è stata programmata.',
    unavailable: 'Le richieste di chiamata non sono disponibili al momento. Puoi usare il link per prenotare o scriverci direttamente.',
    failed: 'Non siamo riusciti a inviare la richiesta. Riprova o usa il link per prenotare.', future: 'Scegli una data e un orario futuri.', close: 'Chiudi la richiesta di chiamata', timezone: 'Fuso orario',
  },
  fr: {
    eyebrow: 'Heading South / Être rappelé', title: 'Demander un rappel.',
    intro: 'Indiquez-nous quand vous appeler et dans quelle langue.',
    reason: 'Comment pouvons-nous vous aider ?', discovery: 'Échange découverte de 30 minutes', discoveryNote: 'Explorer une décision ou une opportunité pour votre entreprise.',
    support: 'Support pour client existant', supportNote: 'Obtenir de l’aide sur une mission Heading South en cours.',
    information: 'Information sur nos services', informationNote: 'Comprendre notre approche, nos services ou leur pertinence.',
    timing: 'Quand souhaitez-vous être appelé ?', soon: 'Demander un rappel maintenant', soonNote: 'Nous essaierons de vous appeler au plus vite pendant les heures ouvrées.',
    schedule: 'Choisir un jour et une heure', scheduleNote: 'Nous vous appellerons dans le fuseau horaire indiqué.',
    details: 'Vos coordonnées', name: 'Nom complet', email: 'E-mail professionnel', phone: 'Numéro de téléphone', company: 'Entreprise (facultatif)',
    callLanguage: 'Langue de l’appel', languageNote: 'Nous utiliserons cette langue pour l’appel.',
    optionalDetails: 'Ajouter un peu de contexte (facultatif)',
    date: 'Date souhaitée', time: 'Heure souhaitée', notes: 'Y a-t-il autre chose à savoir ? (facultatif)',
    consent: 'J’accepte que Heading South m’appelle à ce numéro au sujet de cette demande.', privacy: 'Politique de confidentialité',
    submit: 'Demander un rappel', sending: 'Envoi de votre demande…', nowSuccess: 'Merci. Votre interlocuteur vous appellera sous peu.', scheduledSuccess: 'Merci. Votre rappel est programmé.',
    unavailable: 'Les demandes de rappel ne sont pas disponibles pour le moment. Vous pouvez utiliser le lien de réservation ou nous écrire directement.',
    failed: 'Nous n’avons pas pu envoyer votre demande. Réessayez ou utilisez le lien de réservation.', future: 'Choisissez une date et une heure dans le futur.', close: 'Fermer la demande de rappel', timezone: 'Fuseau horaire',
  },
  es: {
    eyebrow: 'Heading South / Solicitar una llamada', title: 'Solicita que te llamemos.',
    intro: 'Indícanos cuándo llamarte y en qué idioma.',
    reason: '¿Cómo podemos ayudarte?', discovery: 'Llamada de descubrimiento de 30 minutos', discoveryNote: 'Explora una decisión u oportunidad para tu negocio.',
    support: 'Soporte para clientes actuales', supportNote: 'Recibe ayuda con un proyecto de Heading South en curso.',
    information: 'Información sobre productos o servicios', informationNote: 'Conoce nuestro enfoque, servicios o encaje.',
    timing: '¿Cuándo quieres que te llamemos?', soon: 'Solicitar una llamada ahora', soonNote: 'Intentaremos llamarte lo antes posible en horario laboral.',
    schedule: 'Elegir día y hora', scheduleNote: 'Te llamaremos en la zona horaria que indiques.',
    details: 'Tus datos', name: 'Nombre completo', email: 'Correo profesional', phone: 'Número de teléfono', company: 'Empresa (opcional)',
    callLanguage: 'Idioma de la llamada', languageNote: 'Usaremos este idioma durante la llamada.',
    optionalDetails: 'Añade algo de contexto (opcional)',
    date: 'Fecha preferida', time: 'Hora preferida', notes: '¿Hay algo más que debamos saber? (opcional)',
    consent: 'Acepto que Heading South me llame a este número en relación con esta solicitud.', privacy: 'Aviso de privacidad',
    submit: 'Solicitar una llamada', sending: 'Enviando tu solicitud…', nowSuccess: 'Gracias. Tu asesor te llamará en breve.', scheduledSuccess: 'Gracias. Tu llamada ha quedado programada.',
    unavailable: 'Las solicitudes de llamada no están disponibles en este momento. Puedes usar el enlace de reserva o escribirnos directamente.',
    failed: 'No hemos podido enviar la solicitud. Inténtalo de nuevo o usa el enlace de reserva.', future: 'Elige una fecha y hora futuras.', close: 'Cerrar solicitud de llamada', timezone: 'Zona horaria',
  },
  'pt-BR': {
    eyebrow: 'Heading South / Solicitar uma ligação', title: 'Solicite uma ligação.',
    intro: 'Diga-nos quando ligar e em qual idioma.',
    reason: 'Como podemos ajudar?', discovery: 'Conversa de descoberta de 30 minutos', discoveryNote: 'Explore uma decisão ou oportunidade para a sua empresa.',
    support: 'Suporte para clientes existentes', supportNote: 'Obtenha ajuda em um trabalho da Heading South em andamento.',
    information: 'Informações sobre serviços', informationNote: 'Entenda nossa abordagem, serviços ou aderência.',
    timing: 'Quando devemos ligar?', soon: 'Solicitar uma ligação agora', soonNote: 'Tentaremos ligar o mais rápido possível, em horário comercial.',
    schedule: 'Escolher dia e horário', scheduleNote: 'Ligaremos no fuso horário que você indicar.',
    details: 'Seus dados', name: 'Nome completo', email: 'E-mail profissional', phone: 'Número de telefone', company: 'Empresa (opcional)',
    callLanguage: 'Idioma da ligação', languageNote: 'Usaremos este idioma durante a ligação.',
    optionalDetails: 'Adicione um pouco de contexto (opcional)',
    date: 'Data preferida', time: 'Horário preferido', notes: 'Há algo mais que devemos saber? (opcional)',
    consent: 'Concordo que a Heading South entre em contato por telefone neste número sobre esta solicitação.', privacy: 'Aviso de privacidade',
    submit: 'Solicitar uma ligação', sending: 'Enviando sua solicitação…', nowSuccess: 'Obrigado. Seu consultor ligará em breve.', scheduledSuccess: 'Obrigado. Sua ligação foi agendada.',
    unavailable: 'As solicitações de ligação não estão disponíveis neste momento. Use o link de agendamento ou escreva para nós diretamente.',
    failed: 'Não foi possível enviar sua solicitação. Tente novamente ou use o link de agendamento.', future: 'Escolha uma data e horário no futuro.', close: 'Fechar solicitação de ligação', timezone: 'Fuso horário',
  },
}[locale] || null;

const callingCodes = [["AC","247"],["AD","376"],["AE","971"],["AF","93"],["AG","1"],["AI","1"],["AL","355"],["AM","374"],["AO","244"],["AR","54"],["AS","1"],["AT","43"],["AU","61"],["AW","297"],["AX","358"],["AZ","994"],["BA","387"],["BB","1"],["BD","880"],["BE","32"],["BF","226"],["BG","359"],["BH","973"],["BI","257"],["BJ","229"],["BL","590"],["BM","1"],["BN","673"],["BO","591"],["BQ","599"],["BR","55"],["BS","1"],["BT","975"],["BW","267"],["BY","375"],["BZ","501"],["CA","1"],["CC","61"],["CD","243"],["CF","236"],["CG","242"],["CH","41"],["CI","225"],["CK","682"],["CL","56"],["CM","237"],["CN","86"],["CO","57"],["CR","506"],["CU","53"],["CV","238"],["CW","599"],["CX","61"],["CY","357"],["CZ","420"],["DE","49"],["DJ","253"],["DK","45"],["DM","1"],["DO","1"],["DZ","213"],["EC","593"],["EE","372"],["EG","20"],["EH","212"],["ER","291"],["ES","34"],["ET","251"],["FI","358"],["FJ","679"],["FK","500"],["FM","691"],["FO","298"],["FR","33"],["GA","241"],["GB","44"],["GD","1"],["GE","995"],["GF","594"],["GG","44"],["GH","233"],["GI","350"],["GL","299"],["GM","220"],["GN","224"],["GP","590"],["GQ","240"],["GR","30"],["GT","502"],["GU","1"],["GW","245"],["GY","592"],["HK","852"],["HN","504"],["HR","385"],["HT","509"],["HU","36"],["ID","62"],["IE","353"],["IL","972"],["IM","44"],["IN","91"],["IO","246"],["IQ","964"],["IR","98"],["IS","354"],["IT","39"],["JE","44"],["JM","1"],["JO","962"],["JP","81"],["KE","254"],["KG","996"],["KH","855"],["KI","686"],["KM","269"],["KN","1"],["KP","850"],["KR","82"],["KW","965"],["KY","1"],["KZ","7"],["LA","856"],["LB","961"],["LC","1"],["LI","423"],["LK","94"],["LR","231"],["LS","266"],["LT","370"],["LU","352"],["LV","371"],["LY","218"],["MA","212"],["MC","377"],["MD","373"],["ME","382"],["MF","590"],["MG","261"],["MH","692"],["MK","389"],["ML","223"],["MM","95"],["MN","976"],["MO","853"],["MP","1"],["MQ","596"],["MR","222"],["MS","1"],["MT","356"],["MU","230"],["MV","960"],["MW","265"],["MX","52"],["MY","60"],["MZ","258"],["NA","264"],["NC","687"],["NE","227"],["NF","672"],["NG","234"],["NI","505"],["NL","31"],["NO","47"],["NP","977"],["NR","674"],["NU","683"],["NZ","64"],["OM","968"],["PA","507"],["PE","51"],["PF","689"],["PG","675"],["PH","63"],["PK","92"],["PL","48"],["PM","508"],["PR","1"],["PS","970"],["PT","351"],["PW","680"],["PY","595"],["QA","974"],["RE","262"],["RO","40"],["RS","381"],["RU","7"],["RW","250"],["SA","966"],["SB","677"],["SC","248"],["SD","249"],["SE","46"],["SG","65"],["SH","290"],["SI","386"],["SJ","47"],["SK","421"],["SL","232"],["SM","378"],["SN","221"],["SO","252"],["SR","597"],["SS","211"],["ST","239"],["SV","503"],["SX","1"],["SY","963"],["SZ","268"],["TA","290"],["TC","1"],["TD","235"],["TG","228"],["TH","66"],["TJ","992"],["TK","690"],["TL","670"],["TM","993"],["TN","216"],["TO","676"],["TR","90"],["TT","1"],["TV","688"],["TW","886"],["TZ","255"],["UA","380"],["UG","256"],["US","1"],["UY","598"],["UZ","998"],["VA","39"],["VC","1"],["VE","58"],["VG","1"],["VI","1"],["VN","84"],["VU","678"],["WF","681"],["WS","685"],["XK","383"],["YE","967"],["YT","262"],["ZA","27"],["ZM","260"],["ZW","263"]];
const regionNames = new Intl.DisplayNames([locale], {type: "region"});
const flag = region => [...region].map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
const defaultCountry = {en:'GB',it:'IT',fr:'FR',es:'ES','pt-BR':'BR'}[locale] || 'GB';
const countryPrompt = {en:"Choose country code",it:"Scegli il prefisso internazionale",fr:"Choisissez l’indicatif",es:"Elige el prefijo internacional", "pt-BR":"Escolha o código do país"}[locale];
const phoneHelp = { en: 'Include your country code, for example +39 333 123 4567.', it: 'Inserisci il prefisso internazionale, ad esempio +39 333 123 4567.', fr: 'Indiquez le préfixe international, par exemple +33 6 12 34 56 78.', es: 'Incluye el prefijo internacional, por ejemplo +34 600 123 456.', 'pt-BR': 'Inclua o código do país, por exemplo +55 11 99999 9999.' }[locale];

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
      <label class="callback-field callback-topic"><span>${escape(copy.reason)}</span><select name="requestType"><option value="discovery" selected>${escape(copy.discovery)}</option><option value="support">${escape(copy.support)}</option><option value="information">${escape(copy.information)}</option></select></label>
      <fieldset class="callback-set callback-timing"><legend>${escape(copy.timing)}</legend><div class="callback-segmented">
        <label><input type="radio" name="timing" value="now" checked><span>${escape(copy.soon)}</span></label>
        <label><input type="radio" name="timing" value="scheduled"><span>${escape(copy.schedule)}</span></label>
      </div></fieldset>
      <div class="callback-schedule" hidden><div class="callback-grid">
        <label class="callback-field"><span>${escape(copy.date)}</span><input name="date" type="date"></label>
        <label class="callback-field"><span>${escape(copy.time)}</span><input name="time" type="time"></label>
        <label class="callback-field full"><span>${escape(copy.timezone)}</span><input name="timezone" readonly></label>
      </div></div>
      <fieldset class="callback-set"><legend>${escape(copy.details)}</legend><div class="callback-grid">
        <label class="callback-field"><span>${escape(copy.name)}</span><input name="name" autocomplete="name" maxlength="120" required></label>
        <label class="callback-field"><span>${escape(copy.email)}</span><input name="email" autocomplete="email" type="email" maxlength="160" required></label>
        <div class="callback-field"><label for="callback-phone">${escape(copy.phone)}</label><div class="callback-phone"><div class="callback-country"><span class="callback-country-display" aria-hidden="true"></span><span class="callback-country-arrow" aria-hidden="true">⌄</span><select name="countryCode" aria-label="${escape(countryPrompt)}" required>${callingCodes.map(([region,code]) => `<option value="${region}:${code}" ${region === defaultCountry ? "selected" : ""}>${flag(region)} ${escape(regionNames.of(region) || region)} (+${code})</option>`).join('')}</select></div><input id="callback-phone" name="phone" autocomplete="tel-national" type="tel" inputmode="tel" maxlength="32" required></div></div>
        <label class="callback-field"><span>${escape(copy.callLanguage)}</span><select name="callLanguage" required><option value="en">English</option><option value="it">Italiano</option><option value="fr">Français</option><option value="es">Español</option><option value="pt-BR">Português (Brasil)</option></select><small>${escape(copy.languageNote)}</small></label>
      </div></fieldset>
      <details class="callback-more"><summary>${escape(copy.optionalDetails)}</summary><div class="callback-more-fields">
        <label class="callback-field"><span>${escape(copy.company)}</span><input name="company" autocomplete="organization" maxlength="160"></label>
        <label class="callback-field"><span>${escape(copy.notes)}</span><textarea name="notes" maxlength="1000"></textarea></label>
      </div></details>
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
  form.elements.callLanguage.value = locale;
  date.min = new Date().toISOString().slice(0, 10);
  let returnFocus = null;
  let token = '';
  let verificationWidget = null;
  let requestId = crypto.randomUUID();

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
    verificationWidget = window.turnstile.render(dialog.querySelector('.callback-turnstile'), {
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
    if (!window.matchMedia('(max-width: 560px)').matches) form.elements.name.focus();
  });

  const countryCode = form.elements.countryCode;
  const countryDisplay = dialog.querySelector('.callback-country-display');
  const updateCountry = () => { const [region, code] = countryCode.value.split(':'); countryDisplay.textContent = `${flag(region)} +${code}`; };
  countryCode.addEventListener('change', updateCountry);
  updateCountry();
  const phoneInput = form.elements.phone;
  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const phoneNumber = phoneInput.value.trim();
    const [region, code] = form.elements.countryCode.value.split(':');
    let national = phoneNumber.replace(/[\s().-]/g, '');
    if ((region === 'GB' || region === 'FR') && national.startsWith('0')) national = national.slice(1);
    const digits = code && /^\d+$/.test(national) ? '+' + code + national : '';
    phoneInput.setCustomValidity(!form.elements.countryCode.value || /^\+[1-9]\d{7,14}$/.test(digits) ? '' : phoneHelp);
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
      schemaVersion: 1, requestId, source: 'website', requestType: form.elements.requestType.value,
      timing: form.elements.timing.value, scheduledFor: scheduledAt?.toISOString() || null,
      timezone: timezone.value, locale: form.elements.callLanguage.value, name: safeText(form.elements.name.value, 120),
      email: safeText(form.elements.email.value, 160).toLowerCase(), phone: digits,
      company: safeText(form.elements.company.value, 160), notes: safeText(form.elements.notes.value, 1000),
      consent: { call: true, capturedAt: new Date().toISOString(), wordingVersion: 'callback-v1' },
      attribution: attribution(), page: location.pathname, turnstileToken: token,
    };
    submit.disabled = true; setStatus(copy.sending);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status !== 202) throw new Error('callback request unavailable');
      setStatus(scheduled ? copy.scheduledSuccess : copy.nowSuccess, 'success');
      requestId=crypto.randomUUID(); form.reset(); form.elements.callLanguage.value = locale; updateTiming(); updateCountry(); token = '';
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'hs_callback_requested', request_type: payload.requestType, timing: payload.timing, language: locale, call_language: payload.locale });
    } catch { setStatus(copy.failed, 'error'); }
    finally {
      // Tokens are single-use even when the downstream workflow fails.
      token = '';
      if (verificationWidget !== null) window.turnstile?.reset(verificationWidget);
      submit.disabled = false;
    }
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { void init(); }, { once: true });
else void init();
