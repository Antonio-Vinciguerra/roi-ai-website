import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = 'https://headingsouth.ai';
const pages = {
  index: {
    title: 'Stratégie IA, systèmes et croissance mesurable | Heading South',
    description: 'Heading South aide les organisations à transformer la technologie et l’IA en décisions plus claires, systèmes solides et croissance mesurable.'
  },
  operate: {title: 'IA opérationnelle et conception de systèmes | Heading South', description: 'Réduire les frictions opérationnelles, améliorer les décisions et concevoir des systèmes adoptables avec Heading South.'},
  grow: {title: 'Croissance commerciale et intelligence client | Heading South', description: 'Transformer les signaux de marché et la connaissance client en priorités commerciales solides et croissance mesurable.'},
  invest: {title: 'Décisions d’investissement et technologie | Heading South', description: 'Prendre des décisions technologiques plus claires grâce aux preuves, au jugement indépendant et à une valeur mesurable.'},
  agritech: {title: 'Systèmes agroalimentaires et AgriTech | Heading South', description: 'Mettre les données, les systèmes et l’intelligence opérationnelle au service de meilleures décisions dans l’agroalimentaire et l’AgriTech.'},
  trade: {title: 'Intelligence export et commerce international | Heading South', description: 'Soutenir des décisions d’export et de commerce plus rapides et mieux informées grâce à l’intelligence de marché et à des priorités claires.'},
  investing: {title: 'Due diligence technologique et investissement | Heading South', description: 'Aider les équipes d’investissement à évaluer la technologie, les preuves et la création de valeur avec davantage de clarté.'},
  operations: {title: 'Opérations, supply chain et systèmes | Heading South', description: 'Améliorer les flux, la visibilité et les décisions au sein des équipes, des processus et des chaînes d’approvisionnement.'},
  commercial: {title: 'Systèmes de croissance commerciale et connaissance client | Heading South', description: 'Transformer la connaissance des clients et des marchés en priorités commerciales, propositions et opportunités plus claires.'}
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const urlFor = route => `${site}/${route}.fr`;
const englishUrlFor = route => route === 'index' ? `${site}/` : `${site}/${route}`;
const italianUrlFor = route => `${site}/${route}.it`;
const spanishUrlFor = route => `${site}/${route}.es`;

function metadata(route, page) {
  const url = urlFor(route);
  const pageSchema = {'@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url, inLanguage: 'fr', isPartOf: {'@type': 'WebSite', name: 'Heading South', url: `${site}/`}};
  const schema = route === 'index'
    ? {'@context': 'https://schema.org', '@graph': [
      {'@type': 'Organization', name: 'Heading South', url: `${site}/`, logo: `${site}/assets/heading-south-logo.png`},
      {'@type': 'WebSite', name: 'Heading South', url: `${site}/`, inLanguage: 'fr'},
      {...pageSchema, '@context': undefined}
    ]}
    : pageSchema;
  return [
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="en" href="${englishUrlFor(route)}">`,
    `<link rel="alternate" hreflang="it" href="${italianUrlFor(route)}">`,
    `<link rel="alternate" hreflang="fr" href="${url}">`,
    `<link rel="alternate" hreflang="es" href="${spanishUrlFor(route)}">`,
    `<link rel="alternate" hreflang="x-default" href="${englishUrlFor(route)}">`,
    '<meta property="og:locale" content="fr_FR">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Heading South">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${json(schema)}</script>`
  ].join('');
}

export async function applyFrenchSeo(out) {
  const urls = [];
  for (const [route, page] of Object.entries(pages)) {
    const file = resolve(out, `${route}.fr.html`);
    let html = await readFile(file, 'utf8');
    html = html
      .replaceAll('<meta name="robots" content="noindex,nofollow">', '')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>?(?:\n)?/, `<meta name="description" content="${escape(page.description)}">`)
      .replace('</head>', `${metadata(route, page)}</head>`);
    await writeFile(file, html);
    urls.push(urlFor(route));
  }
  await writeFile(resolve(out, 'sitemap-fr.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
}
