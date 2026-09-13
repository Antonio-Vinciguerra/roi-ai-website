import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readingLines,lineFormation,readingFloor } from '../reveal-timing.mjs';
import { wordFormation,approachOpacity } from '../scene-math.mjs';

test('headline grouping follows rendered lines, not pairs that straddle line breaks',()=>{
 const desktop=readingLines([0,100,100,200,200].map(top=>({top,height:95})));
 assert.deepEqual(desktop,{order:[0,1,1,2,2],count:3});
 const phone=readingLines([0,45,45,90,135].map(top=>({top,height:42})));
 assert.deepEqual(phone,{order:[0,1,1,2,3],count:4});
 const zoom=readingLines([0,180,180.5,360,540].map(top=>({top,height:168})));
 assert.deepEqual(zoom.order,phone.order);
});
test('headline reveals top down while preserving the previous first/last timing envelope',()=>{
 for(let progress=0;progress<=1;progress+=.02){
  for(const count of [3,4,5]){
   for(let line=1;line<count;line++)assert.ok(lineFormation(progress,line-1,count)>=lineFormation(progress,line,count));
   assert.equal(lineFormation(progress,0,count),wordFormation(progress,0,5));
   assert.equal(lineFormation(progress,count-1,count),wordFormation(progress,4,5));
  }
 }
});
test('scroll copy is clear in the reading area at mobile and desktop heights',()=>{
 for(const viewport of [320,568,667,844,1080,1440]){
  assert.equal(readingFloor(viewport,viewport),0);
  assert.ok(readingFloor(viewport*.75,viewport)>0);
  assert.equal(readingFloor(viewport*.6,viewport),1);
 }
 assert.ok(approachOpacity(0,1,800,620)>approachOpacity(0,1,800,780));
});
test('headline geometry refreshes for fonts and resizing; hero pace and upward readability remain',async()=>{
 const js=await readFile(new URL('../reveal.js',import.meta.url),'utf8');
 assert.match(js,/record\.hero \? 1320 : 620/);
 assert.match(js,/document\.fonts\.ready\.then\(refreshLines\)/);
 assert.match(js,/addEventListener\('resize',[\s\S]*?refreshLines\(\)/);
 assert.match(js,/if \(!record\.hero && record\.seen\)/);
 assert.match(js,/direction < 0 && record\.seen/);
 assert.doesNotMatch(js,/translate|scrollTo|preventDefault/);
});
