import { experiences } from './experience-data.it.mjs';
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
   const img=lens.querySelector('[data-lens-image]');img.src='assets/'+e.image+'.webp';img.alt=e.name+" immagine editoriale";
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
  const link=lens.querySelector('[data-lens-link]');if(link){link.href=key+".it.html?scenario="+selection;link.textContent="Esplora "+e.name+' ↗';}
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
 time:["Quale decisione ricorrente o passaggio di consegne assorbe energie senza creare valore?","Mappa un flusso di lavoro. Definisci tempi, rilavorazioni e giudizio umano coinvolti."],
 growth:["Quale bisogno del cliente o ipotesi commerciale attende ancora una verifica?","Parti dalle conversazioni con i clienti e dal più piccolo test utile della domanda."],
 capital:["Quale ipotesi deve essere vera perché questo investimento sia giustificato?","Confronta il costo nell’intero ciclo di vita, le esigenze di adozione e le evidenze necessarie per procedere."]
};
document.querySelectorAll('[data-problem]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-problem]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const [question,evidence]=problemFrames[button.dataset.problem];
 document.querySelector('[data-problem-question]').textContent=question;
 document.querySelector('[data-problem-evidence]').textContent=evidence;
}));
const phases=[
 {type:"La tua sintesi decisionale",title:"Un problema chiaro.\nUna ragione per agire.",description:"L’opportunità, le evidenze e le ipotesi da verificare, prima di scegliere una soluzione.",items:["Decisione e responsabile","Evidenze e vincoli","Ipotesi di valore e prossimo test"]},
 {type:"Il progetto della tua soluzione",title:"La risposta giusta.\nProgettata per il lavoro reale.",description:"Un progetto pratico che collega persone, informazioni e sistemi, con adozione e responsabilità integrate nel piano.",items:["Flusso di lavoro e revisione umana","Adeguatezza dei sistemi e dipendenze","Pilota, adozione e responsabilità"]},
 {type:"La tua verifica del valore",title:"Evidenze di progresso.\nUna ragione per continuare.",description:"Una visione condivisa di ciò che è cambiato, dei costi e di ciò che abbiamo imparato, per fondare la prossima decisione sulle evidenze.",items:["Base di riferimento e misure concordate","Valore realizzato e costi totali","Proseguire, adattare o fermarsi"]}
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
 build:["Costruire","Un’esigenza davvero diversa.","Valuta uno sviluppo su misura quando il flusso di lavoro crea un valore distintivo e le soluzioni esistenti non ne soddisfano i requisiti.","Conferma il valore atteso, i dati, il responsabile e la capacità di mantenere la soluzione."],
 buy:["Acquistare","Esiste già una soluzione adeguata e comprovata.","Valuta un prodotto esistente quando il bisogno è ben compreso e una soluzione adatta può essere adottata senza cambiamenti sproporzionati.","Verifica l’adeguatezza sul lavoro reale, i costi dell’intero ciclo di vita e le implicazioni della dipendenza dal fornitore."],
 integrate:["Integrare","Le parti devono lavorare insieme.","Valuta l’integrazione quando esistono già sistemi utili, ma informazioni e decisioni si perdono tra loro.","Conferma qualità dei dati, autorizzazioni di accesso, responsabilità chiare e gestione dei guasti."],
 wait:["Oppure no","Le evidenze non lo giustificano.","A volte la decisione di maggior valore è semplificare il processo, fare un test più piccolo o non investire ancora in tecnologia.","Definisci cosa dovrebbe cambiare, quali evidenze mancano e quando riesaminare la decisione."]
};
document.querySelectorAll('[data-decision]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-decision]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const values=decisions[button.dataset.decision];
 ['node','title','copy','check'].forEach((name,i)=>document.querySelector('[data-decision-'+name+']').textContent=values[i]);
 const panel=document.querySelector('.decision-verdict');panel.setAttribute('aria-live','polite');
 if(!reduced.matches)panel.animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'none'}],{duration:380});
}));
