import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = 'https://headingsouth.ai';
const pages = {
  index: {
    title: 'Strategia IA, sistemi e crescita misurabile | Heading South',
    description: 'Heading South affianca organizzazioni e team decisionali per trasformare tecnologia e IA in crescita misurabile.'
  },
  operate: {
    title: 'Operazioni e processi: valore misurabile | Heading South',
    description: 'Heading South aiuta le organizzazioni a ridurre gli attriti operativi, migliorare le decisioni e progettare sistemi adottabili.'
  },
  grow: {
    title: 'Strategia di crescita e intelligence clienti | Heading South',
    description: 'Trasformiamo segnali di mercato e conoscenza dei clienti in priorità commerciali, sistemi e crescita misurabile.'
  },
  invest: {
    title: 'Decisioni di investimento e tecnologia | Heading South',
    description: 'Heading South aiuta i team di investimento a valutare opportunità, sistemi e valore tecnologico con maggiore chiarezza.'
  },
  agritech: {
    title: 'Agroalimentare e AgriTech: decisioni migliori | Heading South',
    description: 'Dati, operazioni e sistemi per l’agroalimentare e l’AgriTech: rendere più chiare le decisioni che contano.'
  },
  trade: {
    title: 'Export e commercio: intelligence e priorità | Heading South',
    description: 'Per team export e commerciali: market intelligence, flussi e priorità per decisioni più rapide e fondate.'
  },
  investing: {
    title: 'Finanza e investimenti: decisioni tecnologiche | Heading South',
    description: 'Supporto ai team finanziari e di investimento per organizzare le evidenze e valutare il valore della tecnologia.'
  },
  operations: {
    title: 'Operazioni e supply chain: sistemi e flussi | Heading South',
    description: 'Dove i flussi rallentano, Heading South aiuta a progettare processi, sistemi e visibilità più efficaci.'
  },
  commercial: {
    title: 'Crescita commerciale: insight clienti e opportunità | Heading South',
    description: 'Dalla conoscenza del mercato alle priorità commerciali: sistemi che aiutano i team a crescere con evidenze migliori.'
  }
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');

function metadata(route, page) {
  const url = `${site}/${route}.it`;
  const englishUrl = route === 'index' ? `${site}/` : `${site}/${route}`;
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url,
    inLanguage: 'it',
    isPartOf: {'@type': 'WebSite', name: 'Heading South', url: `${site}/`}
  };
  const schema = route === 'index'
    ? {'@context': 'https://schema.org', '@graph': [
      {'@type': 'Organization', name: 'Heading South', url: `${site}/`, logo: `${site}/assets/heading-south-logo.png`},
      {'@type': 'WebSite', name: 'Heading South', url: `${site}/`, inLanguage: 'it'},
      {...pageSchema, '@context': undefined}
    ]}
    : pageSchema;
  return [
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="en" href="${englishUrl}">`,
    `<link rel="alternate" hreflang="it" href="${url}">`,
    `<link rel="alternate" hreflang="x-default" href="${englishUrl}">`,
    '<meta property="og:locale" content="it_IT">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Heading South">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${json(schema)}</script>`
  ].join('');
}

export async function applyItalianSeo(out) {
  const urls = [];
  for (const [route, page] of Object.entries(pages)) {
    const file = resolve(out, `${route}.it.html`);
    let html = await readFile(file, 'utf8');
    html = html
      .replaceAll('<meta name="robots" content="noindex,nofollow">', '')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>(?:\n)?/, `<meta name="description" content="${escape(page.description)}">`)
      .replace('</head>', `${metadata(route, page)}</head>`);
    await writeFile(file, html);
    urls.push(`${site}/${route}.it`);
  }
  await writeFile(resolve(out, 'sitemap-it.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
}
