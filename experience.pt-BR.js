import { experiences } from './experience-data.pt-BR.mjs';
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
   const img=lens.querySelector('[data-lens-image]');img.src='assets/'+e.image+'.webp';img.alt=e.name+" imagem editorial";
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
  const link=lens.querySelector('[data-lens-link]');if(link){link.href=key+".pt-BR.html?scenario="+selection;link.textContent="Explorar "+e.name+' ↗';}
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
 time:["Qual decisão recorrente ou passagem de trabalho consome esforço sem criar valor?","Mapeie um fluxo de trabalho. Identifique o tempo, o retrabalho e o julgamento humano envolvidos."],
 growth:["Qual necessidade do cliente ou hipótese comercial ainda precisa ser verificada?","Comece pelas conversas com clientes e pelo menor teste útil da demanda."],
 capital:["Qual hipótese precisa ser verdadeira para justificar este investimento?","Compare o custo de todo o ciclo de vida, as necessidades de adoção e as evidências necessárias para avançar."]
};
document.querySelectorAll('[data-problem]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-problem]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const [question,evidence]=problemFrames[button.dataset.problem];
 document.querySelector('[data-problem-question]').textContent=question;
 document.querySelector('[data-problem-evidence]').textContent=evidence;
}));
const phases=[
 {type:"Seu documento de decisão",title:"Um problema claro.\nUma razão para agir.",description:"A oportunidade, suas evidências e as hipóteses a testar antes de escolher uma solução.",items:["Decisão e responsável","Evidências e restrições","Hipótese de valor e próximo teste"]},
 {type:"O projeto da sua solução",title:"A resposta certa.\nProjetada para o trabalho real.",description:"Um projeto prático que conecta pessoas, informações e sistemas, com adoção e responsabilidades integradas ao plano.",items:["Fluxo de trabalho e revisão humana","Adequação dos sistemas e dependências","Piloto, adoção e responsabilidades"]},
 {type:"Sua avaliação de valor",title:"Evidências de progresso.\nUma razão para continuar.",description:"Uma visão compartilhada do que mudou, dos custos e do que foi aprendido, para fundamentar a próxima decisão em evidências.",items:["Linha de base e medidas acordadas","Valor realizado e custos totais","Continuar, adaptar ou parar"]}
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
 build:["Construir","Uma necessidade realmente diferente.","Considere um desenvolvimento sob medida quando o fluxo de trabalho gera valor diferenciado e as soluções existentes não atendem aos requisitos.","Confirme o valor esperado, os dados, o responsável e a capacidade de manutenção."],
 buy:["Comprar","Já existe uma solução adequada e comprovada.","Considere um produto existente quando a necessidade estiver clara e uma solução adequada puder ser adotada sem mudanças desproporcionais.","Teste a adequação ao trabalho real, verifique os custos do ciclo de vida e avalie a dependência do fornecedor."],
 integrate:["Integrar","As partes precisam trabalhar juntas.","Considere a integração quando já existirem sistemas úteis, mas informações e decisões se perderem entre eles.","Confirme a qualidade dos dados, as permissões de acesso, as responsabilidades e a gestão de falhas."],
 wait:["Ou não","As evidências não justificam.","Às vezes, a decisão mais valiosa é simplificar o processo, fazer um teste menor ou ainda não investir em tecnologia.","Defina o que deveria mudar, quais evidências faltam e quando rever a decisão."]
};
document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-decision]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const values=decisions[button.dataset.decision];
 ['node','title','copy','check'].forEach((name,i)=>document.querySelector('[data-decision-'+name+']').textContent=values[i]);
 const panel=document.querySelector('.decision-verdict');panel.setAttribute('aria-live','polite');
 if(!reduced.matches)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:380});
}));
