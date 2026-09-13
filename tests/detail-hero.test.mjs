import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,stat } from 'node:fs/promises';
import { detailScenes } from '../detail-scenes.mjs';
import { content } from '../content.mjs';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('all eight pages open with the approved photo and preserve their message and examples',async()=>{
 assert.deepEqual(Object.keys(detailScenes).sort(),Object.keys(content).sort());
 for(const [key,scene] of Object.entries(detailScenes)){
  const html=await read('dist/'+key+'.html');
  assert.match(html,/class="detail-hero detail-immersive"/);
  assert.match(html,/id="page-title"/);
  assert.ok(html.includes(content[key].title));assert.ok(html.includes(content[key].lede));
  assert.ok(html.includes('href="assets/'+scene.image+'.webp" fetchpriority="high"'));
  assert.ok(html.includes('--scene-mobile:'+scene.mobile));
  assert.match(html,/<details class="detail-example"><summary>Explore a practical example/);
  assert.ok(html.indexOf('id="opportunity"')<html.indexOf('class="detail-lab'));
  assert.match(html,/href="#opportunity"/);assert.match(html,/data-advisor-context=/);
  await stat(new URL('../dist/assets/'+scene.image+'.webp',import.meta.url));
 }
 const home=await read('dist/index.html');
 assert.doesNotMatch(home,/detail-hero.css|detail-hero.js|data-detail-hero/);
});
test('portrait layout uses its own crop, grows with text, and disables depth for reduced motion',async()=>{
 const css=await read('detail-hero.css');
 assert.match(css,/min-height:calc\(100svh - var\(--detail-header\)\)/);
 assert.match(css,/max-width:700px/);assert.match(css,/object-position:var\(--scene-mobile\)/);
 assert.match(css,/safe-area-inset-bottom/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/overflow-wrap:break-word/);assert.match(css,/a:focus-visible/);
 assert.doesNotMatch(css,/background-attachment:fixed|scroll-snap|height:100vh/);
 const js=await read('detail-hero.js');
 assert.match(js,/document.hidden/);assert.match(js,/IntersectionObserver/);
 assert.doesNotMatch(js,/preventDefault|setInterval|scrollTo|setTimeout/);
 // Maximum downward displacement remains within the image's scaled top bleed.
 for(const height of [320,568,667,844,1024,1440]){
  assert.ok(Math.min(24,height*.025)<height*.06*.65);
 }
});
test('mobile scrim protects normal-size text even over a white image',()=>{
 const linear=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
 const luminance=rgb=>rgb.map(v=>linear(v/255)).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
 const bg=[10,20,18].map(v=>v*.62+255*.38);
 assert.ok((luminance([242,240,235])+.05)/(luminance(bg)+.05)>=4.5);
});
