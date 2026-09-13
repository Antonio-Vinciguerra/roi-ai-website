import { experiences } from './experience-data.es.mjs';
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
   const img=lens.querySelector('[data-lens-image]');img.src='assets/'+e.image+'.webp';img.alt=e.name+" imagen editorial";
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
  const link=lens.querySelector('[data-lens-link]');if(link){link.href=key+".es.html?scenario="+selection;link.textContent="Explorar "+e.name+' ↗';}
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
 time:["¿Qué decisión recurrente o traspaso de trabajo consume esfuerzo sin crear valor?","Mapea un flujo de trabajo. Identifica el tiempo, las correcciones y el criterio humano necesarios."],
 growth:["¿Qué necesidad del cliente o hipótesis comercial sigue pendiente de verificación?","Empieza por las conversaciones con clientes y la prueba útil más pequeña de la demanda."],
 capital:["¿Qué hipótesis debe cumplirse para justificar esta inversión?","Compara el coste de todo el ciclo de vida, las necesidades de adopción y las evidencias necesarias para avanzar."]
};
document.querySelectorAll('[data-problem]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-problem]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const [question,evidence]=problemFrames[button.dataset.problem];
 document.querySelector('[data-problem-question]').textContent=question;
 document.querySelector('[data-problem-evidence]').textContent=evidence;
}));
const phases=[
 {type:"Tu informe de decisión",title:"Un problema claro.\nUna razón para actuar.",description:"La oportunidad, sus evidencias y las hipótesis que hay que comprobar antes de elegir una solución.",items:["Decisión y responsable","Evidencias y limitaciones","Hipótesis de valor y próxima prueba"]},
 {type:"El diseño de tu solución",title:"La respuesta adecuada.\nDiseñada para el trabajo real.",description:"Un diseño práctico que conecta personas, información y sistemas, con adopción y responsabilidades integradas en el plan.",items:["Flujo de trabajo y revisión humana","Adecuación de sistemas y dependencias","Piloto, adopción y responsabilidades"]},
 {type:"Tu evaluación del valor",title:"Evidencias de progreso.\nUna razón para continuar.",description:"Una visión compartida de lo que cambió, lo que costó y lo que se aprendió, para basar la siguiente decisión en evidencias.",items:["Referencia y medidas acordadas","Valor realizado y costes totales","Continuar, adaptar o detenerse"]}
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
 build:["Construir","Una necesidad realmente distinta.","Considera un desarrollo a medida cuando el flujo de trabajo genera un valor diferencial y las soluciones existentes no cumplen sus requisitos.","Confirma el valor esperado, los datos, el responsable y la capacidad de mantenimiento."],
 buy:["Comprar","Ya existe una solución adecuada y probada.","Considera un producto existente cuando la necesidad esté clara y una solución adecuada pueda adoptarse sin cambios desproporcionados.","Prueba la adecuación al trabajo real, verifica los costes del ciclo de vida y evalúa la dependencia del proveedor."],
 integrate:["Integrar","Las piezas deben trabajar juntas.","Considera la integración cuando ya existan sistemas útiles, pero la información y las decisiones se pierdan entre ellos.","Confirma la calidad de los datos, los permisos de acceso, las responsabilidades y la gestión de fallos."],
 wait:["O no hacerlo","La evidencia no lo justifica.","A veces, la decisión más valiosa es simplificar el proceso, hacer una prueba más pequeña o no invertir todavía en tecnología.","Define qué debería cambiar, qué evidencias faltan y cuándo revisar la decisión."]
};
document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-decision]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const values=decisions[button.dataset.decision];
 ['node','title','copy','check'].forEach((name,i)=>document.querySelector('[data-decision-'+name+']').textContent=values[i]);
 const panel=document.querySelector('.decision-verdict');panel.setAttribute('aria-live','polite');
 if(!reduced.matches)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:380});
}));
