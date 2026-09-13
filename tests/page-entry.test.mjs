import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const source = await readFile(new URL('../page-entry.js',import.meta.url),'utf8');
function scene({detail=true,reduced=false,hash='',restored=false}={}) {
 const events={}, dataset={}, media={matches:reduced,addEventListener:(type,fn)=>events.motion=fn};
 runInNewContext(source,{
  document:{documentElement:{dataset,classList:{contains:()=>detail}}},
  matchMedia:()=>media,location:{hash},
  performance:{getEntriesByType:()=>[{type:restored?'back_forward':'navigate'}]},
  addEventListener:(type,fn)=>events[type]=fn,
 });
 let skips=0;
 const transition={ready:Promise.resolve(),skipTransition:()=>skips++};
 return {events,dataset,media,transition,get skips(){return skips;}};
}
test('native arrival replaces the fallback before capture, even if pageshow fired first',()=>{
 const s=scene();assert.equal(s.dataset.pageArrival,'soft');
 s.events.pageshow({persisted:false});
 s.events.pagereveal({viewTransition:s.transition});
 assert.equal(s.dataset.pageArrival,'native');assert.equal(s.skips,0);
 s.events.pageshow({persisted:false});assert.equal(s.dataset.pageArrival,'native');
});
test('direct/unsupported visits retain a soft arrival; homepage, hash and history bypass it',()=>{
 const s=scene();s.events.pagereveal({});assert.equal(s.dataset.pageArrival,'soft');
 for(const options of [{detail:false},{hash:'#contact'},{restored:true},{reduced:true}]){
  const v=scene(options);assert.equal(v.dataset.pageArrival,undefined);
  v.events.pagereveal({viewTransition:v.transition});
  assert.equal(v.dataset.pageArrival,'settled');assert.equal(v.skips,1);
 }
});
test('returning from history, keyboard focus and reduced motion never replay or block',()=>{
 const s=scene();s.events.pagereveal({viewTransition:s.transition});
 s.events.focusin();assert.equal(s.dataset.pageArrival,'settled');assert.equal(s.skips,1);
 s.events.pagehide();s.events.pagereveal({viewTransition:s.transition});
 s.events.pageshow({persisted:true});assert.equal(s.dataset.pageArrival,'settled');assert.equal(s.skips,2);
 const v=scene();v.events.pagereveal({viewTransition:v.transition});
 v.media.matches=true;v.events.motion();assert.equal(v.dataset.pageArrival,'settled');assert.equal(v.skips,1);
});
test('a skipped or failed native capture does not trigger another entrance',async()=>{
 const s=scene();s.events.pagereveal({viewTransition:{ready:Promise.reject(new Error('skip')),skipTransition(){}}});
 await Promise.resolve();assert.equal(s.dataset.pageArrival,'settled');
 assert.doesNotMatch(source,/preventDefault|setTimeout|location\.assign|pushState/);
});
