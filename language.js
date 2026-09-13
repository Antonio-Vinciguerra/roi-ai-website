/* Browser preferences only. No location services, translation API or tracking. */
(() => {
 const supported=['en','it','fr','es','pt-BR'];
 const normalize=value=>{const base=String(value||'').toLowerCase().split(/[-_]/)[0];return base==='pt'?'pt-BR':supported.includes(base)?base:null;};
 const browserLanguage=()=>{for(const value of navigator.languages||[navigator.language]){const found=normalize(value);if(found)return found;}return 'en';};
 let saved;try{saved=localStorage.getItem('roi-language');}catch{}
 const route=location.pathname.split('/').pop()||'index.html';
 const base=route.replace(/\.(en|it|fr|es|pt-BR)(?:\.html)?$/,'').replace(/\.html$/,'');
 const pages=['index','operate','grow','invest','agritech','trade','investing','operations','commercial','detail','404'];
 const urlFor=locale=>{const url=new URL(location.href);url.pathname=url.pathname.slice(0,url.pathname.lastIndexOf('/')+1)+(pages.includes(base)?base:'index')+'.'+locale+'.html';return url;};
 // Explicit language links take precedence, so shared editions remain stable.
 if(!document.documentElement.hasAttribute('data-language-edition')&&pages.includes(base)){
  const selected=supported.includes(saved)?saved:browserLanguage();
  if(selected!=='en'){
   // Avoid displaying English while the saved edition is requested. A bounded
   // fallback restores the usable source page if navigation cannot complete.
   document.documentElement.setAttribute('data-language-resolving','');
   const restore=()=>document.documentElement.removeAttribute('data-language-resolving');
   setTimeout(restore,1800);addEventListener('pageshow',restore);
   location.replace(urlFor(selected).href);
  }
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const menu=document.querySelector('.language-menu');if(!menu)return;
  for(const link of menu.querySelectorAll('[data-language]')){
   const locale=link.dataset.language;
   link.href=urlFor(locale).href;
   link.addEventListener('click',()=>{link.href=urlFor(locale).href;try{localStorage.setItem('roi-language',locale);}catch{}});
  }
  const automatic=menu.querySelector('[data-language-auto]');
  automatic?.addEventListener('click',()=>{try{localStorage.removeItem('roi-language');}catch{}location.assign(urlFor(browserLanguage()).href);});
  menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});
  document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
  addEventListener('pageshow',()=>{menu.open=false;});
 });
})();
