import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = 'https://headingsouth.ai';
const pages = {
  index: {title: 'Estrategia de IA, sistemas y crecimiento medible | Heading South', description: 'Heading South ayuda a las organizaciones a convertir la tecnología y la IA en decisiones más claras, sistemas sólidos y crecimiento medible.'},
  operate: {title: 'IA operativa y diseño de sistemas | Heading South', description: 'Reduce la fricción operativa, mejora las decisiones y diseña sistemas que las personas puedan adoptar con Heading South.'},
  grow: {title: 'Crecimiento comercial e inteligencia de clientes | Heading South', description: 'Convierte las señales del mercado y el conocimiento de clientes en prioridades comerciales más sólidas y crecimiento medible.'},
  invest: {title: 'Decisiones de inversión y tecnología | Heading South', description: 'Toma decisiones de inversión tecnológica más claras con evidencia, criterio independiente y valor medible.'},
  agritech: {title: 'Sistemas agroalimentarios y AgriTech | Heading South', description: 'Utiliza datos, sistemas e inteligencia operativa para mejorar las decisiones en el sector agroalimentario y AgriTech.'},
  trade: {title: 'Inteligencia de exportación y comercio internacional | Heading South', description: 'Apoya decisiones de exportación y comercio más ágiles y mejor fundamentadas con inteligencia de mercado y prioridades más claras.'},
  investing: {title: 'Due diligence tecnológica e inversión | Heading South', description: 'Ayuda a los equipos de inversión a evaluar la tecnología, la evidencia y la creación de valor con mayor claridad.'},
  operations: {title: 'Operaciones, cadena de suministro y sistemas | Heading South', description: 'Mejora el flujo operativo, la visibilidad y las decisiones en equipos, procesos y cadenas de suministro.'},
  commercial: {title: 'Sistemas de crecimiento comercial e inteligencia de clientes | Heading South', description: 'Convierte el conocimiento de clientes y mercados en prioridades comerciales, propuestas y oportunidades más claras.'}
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const urlFor = route => `${site}/${route}.es`;
const englishUrlFor = route => route === 'index' ? `${site}/` : `${site}/${route}`;
const italianUrlFor = route => `${site}/${route}.it`;
const frenchUrlFor = route => `${site}/${route}.fr`;

function metadata(route, page) {
  const url = urlFor(route);
  const pageSchema = {'@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url, inLanguage: 'es', isPartOf: {'@type': 'WebSite', name: 'Heading South', url: `${site}/`}};
  const schema = route === 'index'
    ? {'@context': 'https://schema.org', '@graph': [
      {'@type': 'Organization', name: 'Heading South', url: `${site}/`, logo: `${site}/assets/heading-south-logo.png`},
      {'@type': 'WebSite', name: 'Heading South', url: `${site}/`, inLanguage: 'es'},
      {...pageSchema, '@context': undefined}
    ]}
    : pageSchema;
  return [
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="en" href="${englishUrlFor(route)}">`,
    `<link rel="alternate" hreflang="it" href="${italianUrlFor(route)}">`,
    `<link rel="alternate" hreflang="fr" href="${frenchUrlFor(route)}">`,
    `<link rel="alternate" hreflang="es" href="${url}">`,
    `<link rel="alternate" hreflang="x-default" href="${englishUrlFor(route)}">`,
    '<meta property="og:locale" content="es_ES">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Heading South">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${json(schema)}</script>`
  ].join('');
}

export async function applySpanishSeo(out) {
  const urls = [];
  for (const [route, page] of Object.entries(pages)) {
    const file = resolve(out, `${route}.es.html`);
    let html = await readFile(file, 'utf8');
    html = html
      .replaceAll('<meta name="robots" content="noindex,nofollow">', '')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>(?:\n)?/, `<meta name="description" content="${escape(page.description)}">`)
      .replace('</head>', `${metadata(route, page)}</head>`);
    await writeFile(file, html);
    urls.push(urlFor(route));
  }
  await writeFile(resolve(out, 'sitemap-es.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
}
