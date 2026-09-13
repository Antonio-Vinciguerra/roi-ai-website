import {readFile} from 'node:fs/promises';
import {transformHTML,quotedStrings} from './i18n-utils.mjs';
import {content} from '../content.mjs';
import {experiences} from '../experience-data.mjs';
const values=new Set();
const add=s=>{s=s.trim();if(/[A-Za-z]{2}/.test(s))values.add(s);return s;};
for(const page of ['index','operate','grow','invest','agritech','trade','investing','operations','commercial','detail','404'])transformHTML(await readFile(new URL('../dist/'+page+'.html',import.meta.url),'utf8'),add);
function walk(o){for(const v of Object.values(o))if(typeof v==='string'){if(v.includes(' ')&&!v.startsWith('assets/'))add(v);}else if(v&&typeof v==='object')walk(v);}
walk(content);walk(experiences);
for(const file of ['experience.js','advisor.js','advisor-demo.mjs'])for(const s of quotedStrings(await readFile(new URL('../'+file,import.meta.url),'utf8')))if(s.includes(' ')&&!/[{}=<>]|\.query|\.html|^\//.test(s)&&!s.startsWith('aria-')&&!s.startsWith('data-'))add(s);
console.log(JSON.stringify([...values]));
