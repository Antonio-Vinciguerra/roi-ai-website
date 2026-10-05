import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const site = 'https://headingsouth.ai';
const pages = {
  index: {
    title: 'AI strategy, systems & measurable growth | Heading South',
    description: 'Heading South helps organisations turn technology and AI into clearer decisions, stronger systems and measurable growth.'
  },
  operate: {
    title: 'Operational AI & systems design | Heading South',
    description: 'Reduce operational friction, improve decisions and design systems people can adopt with Heading South.'
  },
  grow: {
    title: 'Commercial growth & customer intelligence | Heading South',
    description: 'Turn market signals and customer understanding into stronger commercial priorities and measurable growth.'
  },
  invest: {
    title: 'AI investment & technology decisions | Heading South',
    description: 'Make clearer technology investment decisions with evidence, independent judgement and measurable value.'
  },
  agritech: {
    title: 'Agrifood & AgriTech systems | Heading South',
    description: 'Use data, systems and operational intelligence to improve decisions across agrifood and AgriTech.'
  },
  trade: {
    title: 'Export & trade intelligence | Heading South',
    description: 'Support faster, better-informed export and trade decisions with market intelligence and clearer priorities.'
  },
  investing: {
    title: 'Technology due diligence & investment insight | Heading South',
    description: 'Help investment teams assess technology, evidence and value creation with greater clarity.'
  },
  operations: {
    title: 'Operations & supply chain systems | Heading South',
    description: 'Improve operational flow, visibility and decisions across teams, processes and supply chains.'
  },
  commercial: {
    title: 'Commercial growth systems & customer insight | Heading South',
    description: 'Turn customer and market insight into clearer commercial priorities, propositions and opportunities.'
  }
};

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const json = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const urlFor = route => route === 'index' ? `${site}/` : `${site}/${route}`;
const italianUrlFor = route => `${site}/${route}.it`;
const frenchUrlFor = route => `${site}/${route}.fr`;

function metadata(route, page) {
  const url = urlFor(route);
  const italianUrl = italianUrlFor(route);
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url,
    inLanguage: 'en',
    isPartOf: {'@type': 'WebSite', name: 'Heading South', url: `${site}/`}
  };
  const schema = route === 'index'
    ? {'@context': 'https://schema.org', '@graph': [
      {'@type': 'Organization', name: 'Heading South', url: `${site}/`, logo: `${site}/assets/heading-south-logo.png`},
      {'@type': 'WebSite', name: 'Heading South', url: `${site}/`, inLanguage: 'en'},
      {...pageSchema, '@context': undefined}
    ]}
    : pageSchema;
  return [
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="en" href="${url}">`,
    `<link rel="alternate" hreflang="it" href="${italianUrl}">`,
    `<link rel="alternate" hreflang="fr" href="${frenchUrlFor(route)}">`,
    `<link rel="alternate" hreflang="x-default" href="${url}">`,
    '<meta property="og:locale" content="en_GB">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="Heading South">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${url}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${json(schema)}</script>`
  ].join('');
}

export async function applyEnglishSeo(out) {
  const urls = [];
  for (const [route, page] of Object.entries(pages)) {
    const file = resolve(out, `${route}.html`);
    let html = await readFile(file, 'utf8');
    html = html
      .replaceAll('<meta name="robots" content="noindex,nofollow">', '')
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>?(?:\n)?/, `<meta name="description" content="${escape(page.description)}">`)
      .replace('</head>', `${metadata(route, page)}</head>`);
    await writeFile(file, html);
    urls.push(urlFor(route));
  }
  await writeFile(resolve(out, 'sitemap-en.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${site}/sitemap-en.xml</loc></sitemap>\n  <sitemap><loc>${site}/sitemap-it.xml</loc></sitemap>\n  <sitemap><loc>${site}/sitemap-fr.xml</loc></sitemap>\n</sitemapindex>\n`);
  await writeFile(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
}
