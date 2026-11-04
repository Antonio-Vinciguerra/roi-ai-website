import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const paths=['advisor-persona.js','advisor-knowledge-base.js','api/advisor-stream.js','api/advisor.js','workers/advisor-worker.js'];
const parts=[];
for(const path of paths){
 let source=await readFile(resolve(root,path),'utf8');
 source=source.replace(/^import .*?;\s*$/gm,'').replace(/^export default (?:persona|knowledgeBase|handleAdvisor);\s*$/gm,'').replace(/^export (?=(?:async )?function)/gm,'');
 parts.push('// '+path+'\n'+source);
}
await mkdir(resolve(root,'.release'),{recursive:true});
await writeFile(resolve(root,'.release/advisor-worker.js'),parts.join('\n'));
console.log('Built a single-file advisor Worker; existing environment secrets remain on Cloudflare.');
