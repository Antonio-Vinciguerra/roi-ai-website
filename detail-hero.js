// A little depth in the photograph, never in the reading surface. Native scroll
// stays in control; reduced motion, offscreen pages and hidden tabs do no work.
const hero=document.querySelector('[data-detail-hero]');
if(hero){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,inView=true;
 const update=()=>{
  frame=0;
  if(document.hidden||!inView)return;
  const rect=hero.getBoundingClientRect();
  const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)));
  // Always stay inside the extra image coverage from the 1.06 scale.
  const distance=Math.min(24,rect.height*.025);
  hero.style.setProperty('--detail-depth',reduced.matches?'0px':(progress*distance).toFixed(2)+'px');
 };
 const schedule=()=>{if(!frame&&!reduced.matches&&inView&&!document.hidden)frame=requestAnimationFrame(update);};
 const header=()=>{
  document.documentElement.style.setProperty('--detail-header',(document.querySelector('.site-header')?.offsetHeight||66)+'px');
  schedule();
 };
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',header,{passive:true});
 addEventListener('pageshow',header);
 document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{hero.style.setProperty('--detail-depth','0px');schedule();});
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)schedule();}).observe(hero);
 document.fonts.ready.then(header);
 header();
}
