import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { experiences, sectors, getScenario } from '../experience-data.mjs';
import { renderLens, heroInstrument, workbench, decisionLens, capabilityCards } from '../experience-render.mjs';
import { content } from '../content.mjs';
import { demoReply } from '../advisor-demo.mjs';
const root=resolve(import.meta.dirname,'../dist');
test('all capabilities and sectors have a distinct, complete experience',()=>{
 assert.deepEqual(Object.keys(experiences).sort(),Object.keys(content).sort());
 assert.equal(sectors.length,5);
 for(const [key,e] of Object.entries(experiences)){
  assert.ok(e.scenarios.length>=2);
  for(const scenario of e.scenarios)for(const field of ['label','point','observe','interpret','act','measure'])assert.ok(scenario[field]?.trim(),key+': '+field);
 }
});
test('invalid scenario selection returns the safe default',()=>{
 assert.equal(getScenario('trade',999),experiences.trade.scenarios[0]);
 assert.equal(getScenario('missing'),undefined);
});
test('every rendered experience is honestly labelled and opens the advisor with context',()=>{
 for(const key of Object.keys(experiences)){
  const html=renderLens(key);
  assert.match(html,/Illustrative scenario/);
  assert.match(html,/No client data or live AI analysis/);
  assert.match(html,/data-advisor-context/);
  assert.match(html,/aria-pressed="true"/);
 }
});
test('homepage renders all five sector navigation buttons and fallback links',()=>{
 const html=renderLens('agritech',true);
 for(const key of sectors){assert.ok(html.includes('data-sector="'+key+'"'));assert.ok(html.includes('href="'+key+'.html"'));}
});
test('all detail pages contain their live-in-browser example and company context',async()=>{
 for(const key of Object.keys(experiences)){
  const html=await readFile(resolve(root,key+'.html'),'utf8');
  assert.ok(html.includes('data-key="'+key+'"'));
  assert.match(html,/data-page-context=/);
  assert.match(html,/experience.js/);
  assert.match(html,/data-phase="2"/);
 }
});
test('homepage keeps the opening direct and includes purposeful interactive modules',async()=>{
 const html=await readFile(resolve(root,'index.html'),'utf8');
 for(const marker of ['hero-instrument','problem-lens','approach-workbench','decision-verdict','capability-gallery','intelligence-lens'])assert.ok(html.includes(marker));
 assert.doesNotMatch(html,/<!-- (hero-instrument|problem-lens|workbench|sector-lens) -->/);
 assert.doesNotMatch(heroInstrument(),/<button|preloader|gate/);
 assert.match(workbench(),/Your decision brief/);
 assert.match(decisionLens(),/decision framework/);
 assert.match(capabilityCards(),/operate.html/);
});
test('contextual demo does not imply a real assessment',()=>{
 const reply=demoReply('I’d like to explore this for my business.','Export & Trade: Market entry');
 assert.match(reply,/Export & Trade/);
 assert.match(reply,/not a conclusion/);
 assert.match(reply,/cannot yet analyse your business/);
});
test('primary reading colours meet normal text contrast',()=>{
 const luminance=hex=>{const rgb=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 for(const [fg,bg] of [['182321','f2f0eb'],['58665e','e8ebe4'],['c3cec6','182321'],['869b8d','182321']]){
  const a=luminance(fg),b=luminance(bg);assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,fg+' on '+bg);
 }
});
