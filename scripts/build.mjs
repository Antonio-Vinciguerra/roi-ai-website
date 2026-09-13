import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import { renderLens, problemLens, workbench, decisionLens, capabilityCards } from '../experience-render.mjs';
import { content } from '../content.mjs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'dist');
await mkdir(out, { recursive: true });
const names = { agritech:'Agrifood & AgriTech', trade:'Export & Trade', investing:'Finance & Investment', operations:'Operations & Supply Chains', commercial:'Growth & Commercial', operate:'Operate smarter', grow:'Grow further', invest:'Invest better' };
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
let home = await readFile(resolve(root,'index.html'),'utf8');
home = home.replace('<!-- problem-lens -->',problemLens())
 .replace('<!-- workbench -->',workbench())
 .replace('<!-- decision-lens -->',decisionLens())
 .replace('<!-- capability-cards -->',capabilityCards())
 .replace('<!-- sector-lens -->',renderLens('agritech',true));
const routeLinks = html => html.replace(/detail\.html\?topic=([a-z]+)/g, '$1.html');
const header = home.match(/<header class="site-header">[\s\S]*?<\/header>/)[0].replaceAll('href="#','href="index.html#');
const head = (title, description) => `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f2f0eb"><meta name="robots" content="noindex,nofollow"><title>${escape(title)} — ROI AI</title><meta name="description" content="${escape(description)}"><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/fonts/manrope-medium.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="advisor.css"><link rel="stylesheet" href="experience.css"></head><body${Object.values(names).includes(title) ? ' data-page-context="'+escape(title)+'"' : ''}><a class="skip-link" href="#main">Skip to content</a>${header}`;
const scripts = '<script type="module" src="experience.js"></script><script src="script.js" defer></script><script src="advisor-config.js"></script><script src="advisor.js" defer></script>';
const footer = '<footer class="section"><a class="wordmark" href="index.html">ROI<span>AI</span></a><p>Technology is the means. ROI is the standard. Growth is the outcome.</p><a href="index.html#sectors">Explore the possibilities ↗</a></footer>';
await writeFile(resolve(out,'index.html'),routeLinks(home).replace('</head>','<meta name="robots" content="noindex,nofollow"></head>'));
for (const [key, page] of Object.entries(content)) {
 const group = ['operate','grow','invest'].includes(key) ? 'capabilities' : 'sectors';
 const html = `${head(names[key],page.lede)}<main id="main" tabindex="-1">
 <section class="detail-hero section"><a class="breadcrumb" href="index.html#${group}">← All ${group}</a><div class="detail-heading"><p class="eyebrow">${group === 'capabilities' ? 'Capability' : 'Sector'} / ${escape(names[key])}${key === 'agritech' ? ' · First focus' : ''}</p><h1 class="reveal">${escape(page.title)}</h1><p class="lede reveal">${escape(page.lede)}</p></div>
 </section><section class="detail-lab section" aria-label="Explore a ${escape(names[key])} example">${renderLens(key)}</section>
 <section class="opportunity section"><p class="section-label">The opportunity <span>01</span></p><div><h2 class="reveal">${escape(page.opportunityTitle)}</h2><p class="reveal">${escape(page.opportunityCopy)}</p></div></section>
 <section class="focus section panel-light"><p class="section-label">Where value is created <span>02</span></p><div class="focus-grid">${page.focus.map(([n,title,body])=>`<article class="reveal"><span class="step-number">${n}</span><h3>${escape(title)}</h3><p>${escape(body)}</p></article>`).join('')}</div></section>
 <section class="working section"><p class="section-label">How we work together <span>03</span></p><div class="working-head"><h2 class="reveal">From opportunity<br>to <em>proven return.</em></h2><p>We work beside your team—not around it—so the work stays connected to the decisions, people and outcomes that matter.</p></div><div class="steps">
 <article class="step reveal"><span class="step-number">01</span><h3>Find the<br><em>opportunity.</em></h3><p>Identify the few decisions and points of friction where change can be valuable.</p></article>
 <article class="step reveal"><span class="step-number">02</span><h3>Build the<br><em>right response.</em></h3><p>Design, buy, integrate—or stop—based on the work, not a vendor agenda.</p></article>
 <article class="step reveal"><span class="step-number">03</span><h3>Prove the<br><em>return.</em></h3><p>Make adoption and evidence of impact part of the plan from day one.</p></article></div>${workbench()}</section>
<section class="contact section dark-panel" id="contact"><p class="section-label">A long-term partner <span>04</span></p><div class="contact-content"><h2 class="display">The way forward<br><em>starts here.</em></h2><div class="contact-side"><p>Bring us the ambition, decision or opportunity in front of you. Together, we’ll make what comes next clear—and define the value it should create.</p><button class="button" data-advisor-open>Start a conversation <span>↗</span></button><noscript><p>The interactive advisor requires JavaScript. You can still explore every service and sector above.</p></noscript></div></div></section>
 </main>${footer}${scripts}</body></html>`;
 await writeFile(resolve(out,key+'.html'),html);
}
const legacy = `${head('Explore ROI AI','Our capabilities and sectors.')}<main id="main" class="section"><h1>Find your starting point.</h1><ul>${Object.entries(names).map(([key,name])=>`<li><a href="${key}.html">${escape(name)}</a></li>`).join('')}</ul></main>${footer}<script src="legacy-route.js"></script></body></html>`;
await writeFile(resolve(out,'detail.html'),legacy);
await writeFile(resolve(out,'legacy-route.js'),"const topic = new URLSearchParams(location.search).get('topic'); if ("+JSON.stringify(Object.keys(names))+".includes(topic)) location.replace(topic + '.html');");
await writeFile(resolve(out,'404.html'), head('Page not found','Return to ROI AI.')+'<main id="main" class="section"><p class="eyebrow">404 / A different direction</p><h1>Let’s find your<br>starting point.</h1><p><a class="text-link" href="index.html">Return to ROI AI →</a></p></main>'+footer+scripts+'</body></html>');
for (const file of ['experience.css','experience.js','experience-data.mjs','experience-render.mjs','style.css','script.js','advisor.css','advisor.js','advisor-demo.mjs','advisor-config.js']) await copyFile(resolve(root,file),resolve(out,file));
await mkdir(resolve(out,'assets/fonts'),{recursive:true});
for (const file of ['favicon.svg','agritech-aerial.webp','trade-port.webp','investment-table.webp']) await copyFile(resolve(root,'assets',file),resolve(out,'assets',file));
for (const file of await readdir(resolve(root,'assets/fonts'))) await copyFile(resolve(root,'assets/fonts',file),resolve(out,'assets/fonts',file));
console.log('Built homepage, 8 content pages, legacy routes and accessible advisor. No server secrets included.');
