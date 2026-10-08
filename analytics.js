(() => {
  const measurementId = 'G-JTJWL5TY3F';
  const consentKey = 'headingSouthAnalyticsConsent';
  const locale = document.documentElement.lang || 'en';
  const production = ['headingsouth.ai', 'www.headingsouth.ai'].includes(location.hostname);
  const labels = {
    en: ['Help us improve Heading South', 'With your permission, we use privacy-friendly analytics to understand which pages and journeys are useful. Analytics stays off until you choose.', 'Accept analytics', 'No thanks', 'Privacy Notice'],
    it: ['Ci aiuti a migliorare Heading South', 'Con il Suo consenso, utilizziamo analisi rispettose della privacy per capire quali pagine e percorsi risultano utili. Le analisi restano disattivate finché non effettua una scelta.', 'Accetta le analisi', 'No, grazie', 'Informativa sulla privacy'],
    fr: ['Aidez-nous à améliorer Heading South', 'Avec votre accord, nous utilisons des analyses respectueuses de votre vie privée afin de comprendre quelles pages et quels parcours sont utiles. Les analyses restent désactivées avant votre choix.', 'Accepter les analyses', 'Non merci', 'Politique de confidentialité'],
    es: ['Ayúdenos a mejorar Heading South', 'Con su permiso, usamos analítica respetuosa con su privacidad para comprender qué páginas y recorridos son útiles. La analítica permanece desactivada hasta que usted lo decida.', 'Aceptar analítica', 'No, gracias', 'Aviso de privacidad'],
    'pt-BR': ['Ajude-nos a melhorar a Heading South', 'Com a sua permissão, usamos análises que respeitam a sua privacidade para entender quais páginas e jornadas são úteis. A análise permanece desativada até que você escolha.', 'Aceitar análises', 'Não, obrigado', 'Aviso de privacidade'],
  };
  const text = labels[locale] || labels.en;
  let active = false;

  const consent = () => { try { return localStorage.getItem(consentKey); } catch { return null; } };
  const saveConsent = value => { try { localStorage.setItem(consentKey, value); } catch {} };
  const mapEvent = item => {
    if (!item || typeof item !== 'object' || !item.event) return null;
    const common = { language: item.language || locale, page_path: item.page_path || location.pathname };
    if (item.event === 'hs_callback_requested') return ['generate_lead', { ...common, lead_type: 'callback_request', request_type: item.request_type || 'unknown', timing: item.timing || 'unknown' }];
    if (item.event === 'hs_lead_cta_click') return ['select_content', { ...common, content_type: 'lead_cta', item_id: item.lead_type || 'unknown' }];
    return null;
  };
  const track = item => { const event = mapEvent(item); if (event && window.gtag) window.gtag('event', event[0], event[1]); };
  const observeDataLayer = () => {
    const layer = window.dataLayer = window.dataLayer || [];
    if (layer.__hsAnalyticsObserved) return layer;
    const push = layer.push.bind(layer);
    Object.defineProperty(layer, '__hsAnalyticsObserved', { value: true });
    layer.push = (...items) => { const result = push(...items); items.forEach(track); return result; };
    return layer;
  };
  const enable = () => {
    if (!production || active) return;
    active = true;
    const layer = observeDataLayer();
    window.gtag = (...args) => layer.push(args);
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { language: locale });
    layer.forEach(track);
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  };
  const dismiss = () => document.querySelector('.analytics-consent')?.remove();
  const show = () => {
    dismiss();
    const box = document.createElement('section');
    box.className = 'analytics-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', text[0]);
    box.innerHTML = `<div><strong>${text[0]}</strong><p>${text[1]}</p><a href="privacy.html">${text[4]}</a></div><div class="analytics-consent__actions"><button type="button" data-reject>${text[3]}</button><button type="button" data-accept>${text[2]}</button></div>`;
    box.querySelector('[data-accept]').onclick = () => { saveConsent('granted'); enable(); dismiss(); };
    box.querySelector('[data-reject]').onclick = () => { saveConsent('denied'); dismiss(); };
    document.body.append(box);
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-analytics-preferences]').forEach(button => { button.onclick = show; });
    if (consent() === 'granted') enable(); else if (!consent()) show();
  }, { once: true });
})();
