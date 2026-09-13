import { experiences } from './experience-data.mjs';
import { diagram } from './experience-render.mjs';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
for(const lens of document.querySelectorAll('[data-lens]')){
 let key=lens.dataset.key, selection=0;
 const field=(name,value)=>{lens.querySelector('[data-lens-'+name+']').textContent=value;};
 function render(nextKey,index=0){
  const changed=key!==nextKey;key=nextKey;selection=index;const e=experiences[key],s=e.scenarios[index];
  lens.dataset.key=key;
  lens.querySelectorAll('[data-sector]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sector===key)));
  for(const [name,value] of Object.entries({label:e.label,name:e.name,question:e.question,observe:s.observe,interpret:s.interpret,action:s.act,measure:s.measure,inputs:e.inputs,counter:String(index+1).padStart(2,'0')}))field(name,value);
  if(changed){
   const img=lens.querySelector('[data-lens-image]');img.src='assets/'+e.image+'.webp';img.alt=e.name+' editorial image with a conceptual decision overlay';
   lens.querySelector('.lens-visual').dataset.kind=e.kind;
   lens.querySelector('[data-lens-diagram]').innerHTML=diagram(e.kind);
   for(const [selector,points] of [['[data-lens-points]',true],['[data-scenario-selector]',false]]){
    const container=lens.querySelector(selector);container.replaceChildren();
    e.scenarios.forEach((scenario,i)=>{
     const button=document.createElement('button');button.type='button';button.dataset.scenario=i;
     if(points){button.className='lens-point point-'+i;const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');const label=document.createElement('b');label.textContent=scenario.point;button.append(n,label);}
     else button.textContent=scenario.label;
     container.append(button);
    });
   }
  }
  lens.querySelectorAll('[data-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scenario)===selection)));
  const link=lens.querySelector('[data-lens-link]');if(link){link.href=key+'.html?scenario='+selection;link.textContent='Explore '+e.name+' ↗';}
  const advisor=lens.querySelector('[data-advisor-context]');if(advisor)advisor.dataset.advisorContext=e.name+': '+s.label;
  if(!reduced.matches){
   for(const el of lens.querySelectorAll('.lens-reading,.lens-conclusion'))el.animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:380,easing:'cubic-bezier(.2,.7,.2,1)'});
   if(changed)lens.querySelector('.lens-visual').animate([{opacity:.5},{opacity:1}],{duration:500});
  }
 }
 const initial=Number(new URLSearchParams(location.search).get('scenario')||0);
 if(lens.id==='detail-lens'&&Number.isInteger(initial)&&initial>=0&&initial<experiences[key].scenarios.length)render(key,initial);
 lens.addEventListener('click',event=>{
  const sector=event.target.closest('[data-sector]'),scenario=event.target.closest('[data-scenario]');
  if(sector)render(sector.dataset.sector);else if(scenario)render(key,Number(scenario.dataset.scenario));
 });
 lens.addEventListener('keydown',event=>{
  const group=event.target.closest('.sector-selector,.scenario-selector');
  if(!group||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const buttons=[...group.querySelectorAll('button')],i=buttons.indexOf(event.target);
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(i+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  buttons[next].focus();buttons[next].click();
 });
}

const problemFrames={
 time:['Which recurring decision or handoff consumes effort without creating value?','Map one workflow. Establish the time, rework and human judgment involved.'],
 growth:['Which customer need or commercial assumption is still waiting for evidence?','Start with customer conversations and the smallest useful test of demand.'],
 capital:['Which assumption has to be true for this investment to earn its place?','Compare the whole-life cost, adoption needs and the evidence required to proceed.']
};
document.querySelectorAll('[data-problem]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-problem]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const [question,evidence]=problemFrames[button.dataset.problem];
 document.querySelector('[data-problem-question]').textContent=question;
 document.querySelector('[data-problem-evidence]').textContent=evidence;
}));
const phases=[
 {type:'Your decision brief',title:'A clear problem.\nA case for acting.',description:'The opportunity, its evidence and the assumptions that need to be tested—before a solution is chosen.',items:['Decision & owner','Evidence & constraints','Value hypothesis & next test']},
 {type:'Your solution blueprint',title:'The right response.\nDesigned for real work.',description:'A practical design connecting people, information and systems, with adoption and ownership built into the plan.',items:['Workflow & human review','System fit & dependencies','Pilot, adoption & ownership']},
 {type:'Your value review',title:'Evidence of progress.\nA reason to continue.',description:'A shared view of what changed, what it cost and what was learned—so the next decision is grounded in evidence.',items:['Baseline & agreed measures','Realised value & total costs','Continue, adapt or stop']}
];
for(const bench of document.querySelectorAll('.approach-workbench')){
 bench.addEventListener('click',event=>{
  const button=event.target.closest('[data-phase]');if(!button)return;
  const phase=phases[Number(button.dataset.phase)];
  bench.querySelectorAll('[data-phase]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  for(const name of ['type','title','description'])bench.querySelector('[data-phase-'+name+']').textContent=phase[name];
  const items=bench.querySelector('[data-phase-items]');items.replaceChildren();
  phase.items.forEach((text,i)=>{const li=document.createElement('li'),n=document.createElement('span');n.textContent='0'+(i+1);li.append(n,document.createTextNode(text));items.append(li);});
  if(!reduced.matches)bench.querySelector('.workbench-document').animate([{opacity:.4,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'});
 });
}
const decisions={
 build:['Build','A genuinely different need.','Consider a custom build when the workflow creates distinct value and existing solutions cannot meet its requirements.','Confirm the value case, the data, the owner and the capacity to maintain it.'],
 buy:['Buy','A proven fit already exists.','Consider an existing product when the need is well understood and a suitable solution can be adopted without disproportionate change.','Test fit with real work, verify whole-life costs and assess the implications of vendor dependence.'],
 integrate:['Integrate','The pieces need to work together.','Consider integration when useful systems already exist but information and decisions get lost between them.','Confirm data quality, access permissions, clear ownership and how failures will be handled.'],
 wait:['Or don’t','The evidence does not justify it.','Sometimes the most valuable decision is to simplify the process, run a smaller test or make no technology investment yet.','Name what would have to change, what evidence is missing and when to review the decision.']
};
document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-decision]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const values=decisions[button.dataset.decision];
 ['node','title','copy','check'].forEach((name,i)=>document.querySelector('[data-decision-'+name+']').textContent=values[i]);
 const panel=document.querySelector('.decision-verdict');panel.setAttribute('aria-live','polite');
 if(!reduced.matches)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:380});
}));
