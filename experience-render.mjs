import { experiences, sectors } from './experience-data.mjs';
export const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export function diagram(kind) {
 const paths = {
  field:'M120 125 L320 90 L520 180 L440 370 L200 400 Z M320 90 L290 265 L200 400 M120 125 L290 265 L520 180 M290 265 L440 370',
  route:'M100 350 C180 70 330 80 410 230 S600 460 710 130 M100 350 C310 480 580 30 710 130',
  evidence:'M120 110 H290 Q340 110 340 160 V240 H550 M120 240 H550 M120 370 H290 Q340 370 340 320 V240 M550 240 H710',
  flow:'M90 250 H230 Q265 250 265 210 V130 H450 Q490 130 490 170 V250 H710 M265 250 V360 H490 V250'
 };
 return '<svg class="lens-diagram" viewBox="0 0 800 480" fill="none" aria-hidden="true"><path d="'+paths[kind]+'" /><path class="diagram-trace" d="'+paths[kind]+'" pathLength="1" /></svg>';
}
export function renderLens(key='agritech',all=false) {
 const e=experiences[key], s=e.scenarios[0], id=all?'sector-lens':'detail-lens';
 const sectorTabs=all?'<div class="sector-selector" role="group" aria-label="Explore sectors">'+sectors.map((k,i)=>'<button type="button" data-sector="'+k+'" aria-pressed="'+(k===key)+'"><span>0'+(i+1)+'</span>'+escape(experiences[k].name)+'</button>').join('')+'</div>':'';
 return `<div class="intelligence-lens" id="${id}" data-lens data-key="${key}">
 ${sectorTabs}<div class="lens-topline"><span data-lens-label>${escape(e.label)}</span><span>Interactive perspective / <span data-lens-counter>01</span></span></div>
 <div class="lens-stage"><div class="lens-visual" data-kind="${e.kind}">
 <img data-lens-image src="assets/${e.image}.webp" alt="${escape(e.name)} editorial landscape with a conceptual decision overlay" width="1600" height="900" loading="lazy">
 <div data-lens-diagram>${diagram(e.kind)}</div><div class="lens-points" data-lens-points>${e.scenarios.map((s,i)=>'<button type="button" class="lens-point point-'+i+'" data-scenario="'+i+'" aria-pressed="'+(i===0)+'"><span>0'+(i+1)+'</span><b>'+escape(s.point)+'</b></button>').join('')}</div>
 <div class="lens-image-caption"><span data-lens-name>${escape(e.name)}</span><span>Conceptual overlay<br>Not live measurements</span></div></div>
 <div class="lens-console"><p class="eyebrow">A question worth exploring</p><h3 data-lens-question>${escape(e.question)}</h3>
 <div class="scenario-selector" role="group" aria-label="Choose an example" data-scenario-selector>${e.scenarios.map((s,i)=>'<button type="button" data-scenario="'+i+'" aria-pressed="'+(i===0)+'">'+escape(s.label)+'</button>').join('')}</div>
 <div class="lens-reading" aria-live="polite" aria-atomic="true"><span class="reading-label">The signal</span><p data-lens-observe>${escape(s.observe)}</p><span class="reading-label">The distinction</span><p data-lens-interpret>${escape(s.interpret)}</p></div>
 <p class="lens-disclaimer">Illustrative scenario. No client data or live AI analysis.</p></div></div>
 <div class="lens-conclusion"><div><span class="reading-label">The next useful move</span><p data-lens-action>${escape(s.act)}</p></div><div><span class="reading-label">What would prove the value?</span><p data-lens-measure>${escape(s.measure)}</p></div></div>
 <div class="lens-bottom"><p data-lens-inputs>${escape(e.inputs)}</p>${all?'<a class="text-link" data-lens-link href="'+key+'.html">Explore '+escape(e.name)+' <span>↗</span></a>':'<button class="text-link context-link" data-advisor-open data-advisor-context="'+escape(e.name+': '+s.label)+'">Explore this for your business <span>↗</span></button>'}</div>
 ${all?'<noscript><p>Explore each sector: '+sectors.map(k=>'<a href="'+k+'.html">'+escape(experiences[k].name)+'</a>').join(' · ')+'</p></noscript>':''}</div>`;
}

export function problemLens(){
 return '<div class="problem-lens"><div class="problem-options" role="group" aria-label="Choose a business challenge"><button data-problem="time" aria-pressed="true">Time lost</button><button data-problem="growth" aria-pressed="false">Opportunity missed</button><button data-problem="capital" aria-pressed="false">Capital at risk</button></div><div aria-live="polite" aria-atomic="true"><span class="reading-label">A better first question</span><p data-problem-question>Which recurring decision or handoff consumes effort without creating value?</p></div><div><span class="reading-label">Begin with evidence</span><p data-problem-evidence>Map one workflow. Establish the time, rework and human judgment involved.</p></div></div>';
}
export function workbench(){
 return '<div class="approach-workbench"><div class="workbench-index"><span class="eyebrow">What we put in your hands</span><div class="workbench-controls" role="group" aria-label="Explore engagement deliverables"><button data-phase="0" aria-pressed="true">01 / Find</button><button data-phase="1" aria-pressed="false">02 / Build</button><button data-phase="2" aria-pressed="false">03 / Prove</button></div></div><div class="workbench-document" aria-live="polite" aria-atomic="true"><div><span class="reading-label" data-phase-type>Your decision brief</span><h3 data-phase-title>A clear problem.<br>A case for acting.</h3><p data-phase-description>The opportunity, its evidence and the assumptions that need to be tested—before a solution is chosen.</p></div><ol data-phase-items><li><span>01</span>Decision &amp; owner</li><li><span>02</span>Evidence &amp; constraints</li><li><span>03</span>Value hypothesis &amp; next test</li></ol></div><div class="workbench-foot"><span>A shared working record, not a presentation that ends the conversation.</span><span>ROI AI / Working together</span></div></div>';
}
export function decisionLens(){
 return '<div class="decision-verdict" aria-live="polite" aria-atomic="true"><div class="decision-schema" aria-hidden="true"><span>Business need</span><i></i><span>Evidence of fit</span><i></i><span data-decision-node>Build</span></div><span class="reading-label">When it earns its place</span><h3 data-decision-title>A genuinely different need.</h3><p data-decision-copy>Consider a custom build when the workflow creates distinct value and existing solutions cannot meet its requirements.</p><div class="decision-check"><span>Before committing</span><p data-decision-check>Confirm the value case, the data, the owner and the capacity to maintain it.</p></div><p class="decision-note">A decision framework—not a recommendation about your business.</p></div>';
}
export function capabilityCards(){
 const cards=[
 ['operate','01','Operate smarter','Reimagine how work moves through the organisation—reducing friction, improving decisions and making teams more effective.','From handoff to flow.'],
 ['grow','02','Grow further','Use intelligence to sharpen customer understanding, unlock new propositions and turn momentum into durable growth.','From signal to opportunity.'],
 ['invest','03','Invest better','Bring clarity to technology choices so capital, attention and ambition are placed where they can compound.','From assumption to evidence.']];
 return '<div class="capability-gallery">'+cards.map(([key,n,title,copy,tag])=>'<a class="capability-card" href="'+key+'.html"><div class="capability-art"><img src="assets/'+experiences[key].image+'.webp" alt="" width="1600" height="900" loading="lazy">'+diagram(experiences[key].kind)+'<span>'+n+' / '+tag+'</span></div><div class="capability-card-title"><h3>'+title+'</h3><span aria-hidden="true">↗</span></div><p>'+copy+'</p><span class="capability-explore">Explore the work</span></a>').join('')+'</div>';
}
