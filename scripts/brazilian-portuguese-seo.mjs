import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = 'https://headingsouth.ai';
const pages = {
  index: {title: 'Estratégia de IA, sistemas e crescimento mensurável | Heading South', description: 'A Heading South ajuda organizações a transformar tecnologia e IA em decisões mais claras, sistemas mais sólidos e crescimento mensurável.'},
  operate: {title: 'IA operacional e desenho de sistemas | Heading South', description: 'Reduza atritos operacionais, melhore decisões e desenvolva sistemas que as pessoas adotem com a Heading South.'},
  grow: {title: 'Crescimento comercial e inteligência de clientes | Heading South', description: 'Transforme sinais de mercado e entendimento dos clientes em prioridades comerciais mais fortes e crescimento mensurável.'},
  invest: {title: 'Decisões de investimento e tecnologia | Heading South', description: 'Tome decisões de investimento em tecnologia com mais clareza, evidências, julgamento independente e valor mensurável.'},
  agritech: {title: 'Sistemas para agronegócio e AgriTech | Heading South', description: 'Use dados, sistemas e inteligência operacional para melhorar decisões no agronegócio e em AgriTech.'},
  trade: {title: 'Inteligência para exportação e comércio | Heading South', description: 'Apoie decisões de exportação e comércio mais rápidas e bem fundamentadas com inteligência de mercado e prioridades claras.'},
  investing: {title: 'Due diligence tecnológica e investimento | Heading South', description: 'Ajude equipes de investimento a avaliar tecnologia, evidências e criação de valor com mais clareza.'},
  operations: {title: 'Operações, cadeia de suprimentos e sistemas | Heading South', description: 'Melhore o fluxo operacional, a visibilidade e as decisões entre equipes, processos e cadeias de suprimentos.'},
  commercial: {title: 'Sistemas de crescimento comercial e inteligência de clientes | Heading South', description: 'Transforme conhecimento sobre clientes e mercados em prioridades comerciais, propostas e oportunidades mais claras.'}
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const urlFor = route => `${site}/${route}.pt-BR`;
const englishUrlFor = route => route === 'index' ? `${site}/` : `${site}/${route}`;
const italianUrlFor = route => `${site}/${route}.it`;
const frenchUrlFor = route => `${site}/${route}.fr`;
const spanishUrlFor = route => `${site}/${route}.es`;

function metadata(route, page) {
  const url = urlFor(route);
  const pageSchema = {'@context': 'https://schema.org', '@type': 'WebPage', name: page.title, description: page.description, url, inLanguage: 'pt-BR', isPartOf: {'@type': 'WebSite', name: 'Heading South', url: `${site}/`}};
  const schema = route === 'index'
    ? {'@context': 'https://schema.org', '@graph': [
      {'@type': 'Organization', name: 'Heading South', url: `${site}/`, logo: `${site}/assets/heading-south-logo.png`},
      {'@type': 'WebSite', name: 'Heading South', url: `${site}/`, inLanguage: 'pt-BR'},
      {...pageSchema, '@context': undefined}
    ]}
    : pageSchema;
  return [
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="en" href="${englishUrlFor(route)}">`,
    `<link rel="alternate" hreflang="it" href="${italianUrlFor(route)}">`,
    `<link rel="alternate" hreflang="fr" href="${frenchUrlFor(route)}">`,
    `<link rel="alternate" hreflang="es" href="${spanishUrlFor(route)}">`,
    `<link rel="alternate" hreflang="pt-BR" href="${url}">`,
    `<link rel="alternate" hreflang="x-default" href="${englishUrlFor(route)}">`,
    '<meta property="og:locale" content="pt_BR">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Heading South">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${json(schema)}</script>`
  ].join('');
}

export async function applyBrazilianPortugueseSeo(out) {
  const urls = [];
  for (const [route, page] of Object.entries(pages)) {
    const file = resolve(out, `${route}.pt-BR.html`);
    let html = await readFile(file, 'utf8');
    html = html
      .replaceAll('<meta name="robots" content="noindex,nofollow">', '')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>?(?:\n)?/, `<meta name="description" content="${escape(page.description)}">`)
      .replace('</head>', `${metadata(route, page)}</head>`);
    await writeFile(file, html);
    urls.push(urlFor(route));
  }
  await writeFile(resolve(out, 'sitemap-pt-BR.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
}
