import {readFile,writeFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {dictionary,locales,nativeNames} from '../i18n/catalogue.mjs';
import {transformHTML,transformJS,encode} from './i18n-utils.mjs';
export const pages=['index','operate','grow','invest','agritech','trade','investing','operations','commercial','detail','404'];
export async function buildLocales(root,out) {
 const originals=Object.fromEntries(await Promise.all(pages.map(async name=>[name,await readFile(resolve(out,name+'.html'),'utf8')])));
 const scripts=['experience.js','experience-data.mjs','advisor.js','advisor-demo.mjs'];
 for(const locale of locales){
  const map=dictionary(locale);
  const t=value=>{const trimmed=value.trim();return map[trimmed]!==undefined?value.replace(trimmed,map[trimmed]):value;};
  const suffix='.'+locale;
  for(const file of scripts){
   const source=await readFile(resolve(root,file),'utf8');
   let translated=locale==='en'?source:transformJS(source,t);
   translated=translated.replaceAll('./advisor-demo.mjs','./advisor-demo'+suffix+'.mjs').replaceAll('./experience-data.mjs','./experience-data'+suffix+'.mjs');
   if(file==='experience.js')translated=translated.replaceAll("'.html?scenario='",JSON.stringify(suffix+'.html?scenario='));
   await writeFile(resolve(out,file.replace(/\.(js|mjs)$/,suffix+'.$1')),translated);
  }
  await writeFile(resolve(out,'legacy-route'+suffix+'.js'),`const topic=new URLSearchParams(location.search).get('topic');if(${JSON.stringify(pages)}.includes(topic)){const url=new URL(location.href);url.pathname=url.pathname.replace(/[^/]*$/,topic+${JSON.stringify(suffix+'.html')});url.searchParams.delete('topic');location.replace(url.href);}`);
  for(const name of pages){
   let html=locale==='en'?originals[name]:transformHTML(originals[name],t);
   html=html.replace(/href="([a-z]+)\.html([?#][^"]*)?"/g,(whole,page,tail='')=>pages.includes(page)?`href="${page}${suffix}.html${tail}"`:whole);
   for(const script of ['experience.js','advisor.js','legacy-route.js'])html=html.replaceAll('src="'+script+'"','src="'+script.replace('.js',suffix+'.js')+'"');
   html=html.replace('<html lang="en"','<html lang="'+locale+'" data-language-edition');
   const links=locales.map(lang=>`<a href="${name}.${lang}.html" data-language="${lang}" lang="${lang}" hreflang="${lang}"${lang===locale?' aria-current="true"':''}>${nativeNames[lang]}</a>`).join('');
   const menu=`<details class="language-menu"><summary aria-label="${encode(t('Language'))}">${locale==='pt-BR'?'PT-BR':locale.toUpperCase()}</summary><div class="language-options">${links}<button type="button" data-language-auto>${encode(t('Use browser language'))}</button></div></details>`;
   html=html.replace('</nav>','</nav>'+menu);
   html=html.replace('</head>',`<link rel="stylesheet" href="language.css?v=1"><script src="language.js?v=1"></script></head>`);
   if(locale!=='en') {
    const missing=[];transformHTML(originals[name],value=>{if(/[A-Za-z]{2}/.test(value)&&!map[value])missing.push(value);return value;});
    if(missing.length)throw new Error('Untranslated '+name+' '+locale+': '+JSON.stringify(missing));
   }
   await writeFile(resolve(out,name+suffix+'.html'),html);
   if(locale==='en')await writeFile(resolve(out,name+'.html'),html.replace(' data-language-edition',''));
  }
 }
 for(const file of ['language.js','language.css'])await copyFile(resolve(root,file),resolve(out,file));
}
