import { experiences } from './experience-data.fr.mjs';
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
   const img=lens.querySelector('[data-lens-image]');img.src='assets/'+e.image+'.webp';img.alt=e.name+" image éditoriale";
   lens.querySelector('.lens-visual').dataset.kind=e.kind;
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
  const link=lens.querySelector('[data-lens-link]');if(link){link.href=key+".fr.html?scenario="+selection;link.textContent="Explorer "+e.name+' ↗';}
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
 time:["Quelle décision récurrente ou quel passage de relais mobilise des efforts sans créer de valeur ?","Cartographiez un processus. Établissez le temps, les reprises et le jugement humain nécessaires."],
 growth:["Quel besoin client ou quelle hypothèse commerciale attend encore d’être vérifié ?","Commencez par les conversations clients et le plus petit test utile de la demande."],
 capital:["Quelle hypothèse doit être vraie pour justifier cet investissement ?","Comparez le coût sur le cycle de vie, les besoins d’adoption et les preuves nécessaires pour avancer."]
};
document.querySelectorAll('[data-problem]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-problem]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const [question,evidence]=problemFrames[button.dataset.problem];
 document.querySelector('[data-problem-question]').textContent=question;
 document.querySelector('[data-problem-evidence]').textContent=evidence;
}));
const phases=[
 {type:"Votre note de décision",title:"Un problème clair.\nUne raison d’agir.",description:"L’opportunité, les éléments probants et les hypothèses à tester, avant de choisir une solution.",items:["Décision et responsable","Éléments probants et contraintes","Hypothèse de valeur et prochain test"]},
 {type:"Votre plan de solution",title:"La bonne réponse.\nConçue pour le travail réel.",description:"Une conception pratique reliant personnes, informations et systèmes, avec l’adoption et les responsabilités intégrées au plan.",items:["Processus et revue humaine","Adéquation des systèmes et dépendances","Pilote, adoption et responsabilités"]},
 {type:"Votre bilan de valeur",title:"Des preuves de progrès.\nUne raison de continuer.",description:"Une vision partagée des changements, des coûts et des enseignements, pour ancrer la prochaine décision dans les faits.",items:["Référence et mesures convenues","Valeur réalisée et coûts totaux","Poursuivre, adapter ou arrêter"]}
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
  bench.dispatchEvent(new CustomEvent('phasechange',{detail:Number(button.dataset.phase),bubbles:true}));
 });
}
const decisions={
 build:["Construire","Un besoin réellement différent.","Envisagez un développement sur mesure lorsque le processus crée une valeur distinctive et que les solutions existantes ne répondent pas à ses exigences.","Confirmez la valeur attendue, les données, le responsable et la capacité de maintenance."],
 buy:["Acheter","Une solution adaptée et éprouvée existe déjà.","Envisagez un produit existant lorsque le besoin est bien compris et qu’une solution adaptée peut être adoptée sans changement disproportionné.","Testez l’adéquation au travail réel, vérifiez les coûts du cycle de vie et évaluez la dépendance au fournisseur."],
 integrate:["Intégrer","Les éléments doivent fonctionner ensemble.","Envisagez l’intégration lorsque des systèmes utiles existent déjà, mais que les informations et les décisions se perdent entre eux.","Confirmez la qualité des données, les droits d’accès, les responsabilités et la gestion des défaillances."],
 wait:["Ou s’abstenir","Les preuves ne le justifient pas.","Parfois, la décision la plus utile est de simplifier le processus, de réaliser un test plus limité ou de ne pas encore investir dans la technologie.","Précisez ce qui devrait changer, les preuves manquantes et la date de réexamen de la décision."]
};
document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-decision]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const values=decisions[button.dataset.decision];
 ['node','title','copy','check'].forEach((name,i)=>document.querySelector('[data-decision-'+name+']').textContent=values[i]);
 const panel=document.querySelector('.decision-verdict');panel.setAttribute('aria-live','polite');
 if(!reduced.matches)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:380});
}));
