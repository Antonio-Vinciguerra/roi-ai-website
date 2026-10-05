(() => {
  const storageKey = 'headingSouthAttribution';
  const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid'];

  const readAttribution = () => {
    try { return JSON.parse(sessionStorage.getItem(storageKey) || '{}'); }
    catch { return {}; }
  };
  const saveAttribution = value => {
    try { sessionStorage.setItem(storageKey, JSON.stringify(value)); }
    catch { /* Storage may be unavailable in private browsing. */ }
  };
  const sendEvent = (event, detail = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event, ...detail});
  };

  const landingParams = new URLSearchParams(location.search);
  const attribution = readAttribution();
  let hasNewAttribution = false;
  for (const key of attributionKeys) {
    const value = landingParams.get(key);
    if (value) {
      attribution[key] = value;
      hasNewAttribution = true;
    }
  }
  if (hasNewAttribution) saveAttribution(attribution);

  sendEvent('hs_page_view', {
    page_path: location.pathname,
    language: document.documentElement.lang || 'en'
  });

  const leadType = href => {
    const url = new URL(href, location.href);
    if (url.hostname === 'tally.so') return 'share_context';
    if (url.hostname === 'meetings-eu1.hubspot.com') return 'book_call';
    if (url.protocol === 'mailto:') return 'email';
    return null;
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const type = leadType(link.href);
    if (!type) return;

    if (type === 'share_context' || type === 'book_call') {
      const url = new URL(link.href);
      for (const key of attributionKeys) {
        if (attribution[key] && !url.searchParams.has(key)) url.searchParams.set(key, attribution[key]);
      }
      link.href = url.href;
    }

    sendEvent('hs_lead_cta_click', {
      lead_type: type,
      page_path: location.pathname,
      language: document.documentElement.lang || 'en'
    });
  });
})();
