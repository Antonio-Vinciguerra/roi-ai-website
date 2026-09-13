import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {execFileSync} from 'node:child_process';
import {dictionary,locales,messages} from '../i18n/catalogue.mjs';
import {pages} from '../scripts/build-locales.mjs';
import {transformHTML,transformJS} from '../scripts/i18n-utils.mjs';
const dist=new URL('../dist/',import.meta.url);
test('all five editions have complete catalogue coverage and pre-rendered content',async()=>{
 for(const locale of locales){
  const map=dictionary(locale);assert.ok(messages.every(s=>map[s]));
  for(const page of pages){
   const html=await readFile(new URL(`${page}.${locale}.html`,dist),'utf8');
   assert.ok(html.includes(`lang="${locale}" data-language-edition`));
   assert.match(html,/<details class="language-menu">/);
   assert.ok(html.includes(`href="${page}.pt-BR.html"`));
   assert.ok(html.indexOf('language.js')<html.indexOf('<body'));
   if(locale!=='en')assert.ok(!html.includes('Skip to content'));
  }
 }
});
test('translation respects markup, quotes, apostrophes and source syntax',()=>{
 const t=s=>({'Hello':'Ciao','He said "yes"':'Ha detto "sì"'}[s]||s);
 assert.equal(transformHTML('<p title="Hello">Hello</p>',t),'<p title="Ciao">Ciao</p>');
 assert.equal(transformJS("const x='Hello'; // Hello\nconst y=/Hello/;",t),'const x="Ciao"; // Hello\nconst y=/Hello/;');
});
test('all generated scripts parse and all demo language responses are localized',async()=>{
 for(const file of await readdir(dist))if(/\.(js|mjs)$/.test(file))execFileSync(process.execPath,['--check',new URL(file,dist).pathname]);
 const greetings={en:'Hello',it:'Ciao',fr:'Bonjour',es:'Hola','pt-BR':'Olá'};
 const prompts={en:'How do you work?',it:'Come lavorate?',fr:'Comment travaillez-vous ?',es:'¿Cómo trabajan?','pt-BR':'Como vocês trabalham?'};
 for(const locale of locales){
  const {demoReply}=await import(new URL(`advisor-demo.${locale}.mjs`,dist));
  const map=dictionary(locale);
  assert.equal(demoReply(greetings[locale]),map[messages[506]]);
  assert.equal(demoReply(prompts[locale]),map[messages[513]]);
  const {experiences}=await import(new URL(`experience-data.${locale}.mjs`,dist));
  assert.equal(experiences.trade.scenarios[1].observe,map[messages[396]]);
  const advisor=await readFile(new URL(`advisor.${locale}.js`,dist),'utf8');
  assert.ok(advisor.includes(map[messages[522]]));
  assert.match(advisor,/utterance\.lang=document\.documentElement\.lang/);
 }
});
async function languageHarness({url='https://example.com/roi-ai-website/',languages=['en'],saved=null,explicit=false,blocked=false}={}){
 const listeners={},storage=new Map(saved?[['roi-language',saved]]:[]),navigation=[];
 const location=new URL(url);location.replace=href=>navigation.push(href);location.assign=href=>navigation.push(href);
 const menuListeners={},links=locales.map(locale=>({dataset:{language:locale},listeners:{},addEventListener(k,fn){this.listeners[k]=fn;}}));
 const auto={addEventListener(k,fn){this[k]=fn;}};
 const menu={open:true,contains:()=>false,querySelectorAll:()=>links,querySelector:s=>s==='[data-language-auto]'?auto:{focus(){}},addEventListener(k,fn){menuListeners[k]=fn;}};
 const document={documentElement:{hasAttribute:()=>explicit,setAttribute(){},removeAttribute(){}},addEventListener:(k,fn)=>listeners[k]=fn,querySelector:()=>menu};
 const localStorage={getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k);},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v);},removeItem:k=>storage.delete(k)};
 runInNewContext(await readFile(new URL('../language.js',import.meta.url),'utf8'),{document,navigator:{languages,language:languages[0]},location,localStorage,URL,setTimeout:()=>0,addEventListener:(k,fn)=>listeners[k]=fn});
 return {navigation,listeners,storage,links,auto,location};
}
test('browser preference, regional matching, fallback and explicit URLs have deterministic precedence',async()=>{
 for(const tag of ['pt-BR','pt-PT','pt-AO'])assert.equal((await languageHarness({languages:[tag]})).navigation[0],'https://example.com/roi-ai-website/index.pt-BR.html');
 assert.match((await languageHarness({languages:['it-IT']})).navigation[0],/index.it.html$/);
 assert.match((await languageHarness({languages:['de-DE','fr-CA']})).navigation[0],/index.fr.html$/);
 assert.deepEqual((await languageHarness({languages:['ja-JP']})).navigation,[]);
 assert.match((await languageHarness({languages:['it'],saved:'es'})).navigation[0],/index.es.html$/);
 assert.deepEqual((await languageHarness({languages:['it'],saved:'en'})).navigation,[]);
 assert.deepEqual((await languageHarness({languages:['it'],explicit:true})).navigation,[]);
 assert.match((await languageHarness({languages:['it'],blocked:true})).navigation[0],/index.it.html$/);
});
test('manual choice preserves current route, query and fragment on Pages and clean Sites URLs',async()=>{
 for(const path of ['/roi-ai-website/trade.it.html','/trade.it']){
  const h=await languageHarness({url:'https://example.com'+path+'?scenario=2#opportunity',explicit:true,languages:['it']});
  h.listeners.DOMContentLoaded();h.location.hash='#contact';
  const link=h.links.find(l=>l.dataset.language==='pt-BR');link.listeners.click();
  assert.match(link.href,/trade.pt-BR.html\?scenario=2#contact$/);assert.equal(h.storage.get('roi-language'),'pt-BR');
  h.auto.click();assert.equal(h.storage.has('roi-language'),false);assert.match(h.navigation[0],/trade.it.html\?scenario=2#contact$/);
 }
});
