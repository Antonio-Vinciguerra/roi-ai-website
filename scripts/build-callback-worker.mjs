import {readFile,writeFile,mkdir} from 'node:fs/promises';
await mkdir('.release',{recursive:true});
const parts=[];for(const path of ['api/callback.js','api/chat-intake.js','workers/callback-worker.js']){let s=await readFile(path,'utf8');s=s.replace(/^import .*?;$/gm,'').replace(/^export default handleCallback;$/gm,'').replace(/^export (?=(?:async )?function)/gm,'');parts.push('// '+path+'\n'+s);}
await writeFile('.release/callback-worker.js',parts.join('\n'));
