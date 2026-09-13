export const decode = s => s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
export const encode = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const normal = s => decode(s).trim();
export function transformJS(js,translate) {
 const pattern=/\/\*[\s\S]*?\*\/|\/\/[^\n]*|\/(?![/*])(?:\\.|[^/\\\n])+\/[dgimsuvy]*|(`(?:\\.|[^`\\])*`)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
 return js.replace(pattern,(raw,template,literal)=>{
  if(template){const html=transformHTML(template.slice(1,-1),translate);return '`'+html.replace(/\$\{([^{}]*)\}/g,(_,expression)=>'${'+transformJS(expression,translate)+'}')+'`';}
  if(!literal)return raw;
  const value=Function('"use strict";return ('+literal+')')();
  const next=value.includes('<')?transformHTML(value,translate):translate(value);
  return next===value?raw:JSON.stringify(next);
 });
}
export function transformHTML(html, translate) {
 return html.replace(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g, token => {
  if(token.startsWith('<!--')) return token;
  if(token.startsWith('<')) return token.replace(/\b(aria-label|alt|placeholder|title|data-page-context|data-advisor-context)="([^"]*)"/g,(_,a,v)=>`${a}="${encode(translate(decode(v)))}"`)
   .replace(/(<meta\b[^>]*\bname="description"[^>]*\bcontent=")([^"]*)/g,(_,a,v)=>a+encode(translate(decode(v))));
  const value=normal(token);if(!value)return token;
  return token.replace(token.trim(),encode(translate(value)));
 });
}
export function quotedStrings(js) {
 const found=[];
 // Only complete JS literals; template HTML is handled separately.
 const pattern=/\/\*[\s\S]*?\*\/|\/\/[^\n]*|\/(?![/*])(?:\\.|[^/\\\n])+\/[dgimsuvy]*|(`(?:\\.|[^`\\])*`)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
 for(const match of js.matchAll(pattern)) {
  if(match[1]) {transformHTML(match[1].slice(1,-1),s=>{found.push(s);return s;});continue;}
  if(!match[2])continue;
  const raw=match[2];
  // JSON cannot decode single-quoted JS literals; this evaluator accepts only
  // the strictly matched literal, never arbitrary source or external input.
  const value=Function('"use strict";return ('+raw+')')();
  if(value.includes('<'))transformHTML(value,s=>{found.push(s);return s;});
  else found.push(value);
 }
 return found;
}
