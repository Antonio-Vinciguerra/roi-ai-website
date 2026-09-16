import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname,'../dist');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.ttf':'font/ttf','.txt':'text/plain'};
const server = createServer(async (req,res) => {
 try {
  const url = new URL(req.url, 'http://localhost');
  const requested = decodeURIComponent(url.pathname);
  const file = resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!file.startsWith(root+sep)) { res.writeHead(403); return res.end('Forbidden'); }
  const body = await readFile(file);
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});
  res.end(body);
 } catch { res.writeHead(404,{'Content-Type':'text/html'}); res.end(await readFile(resolve(root,'404.html'))); }
});
server.listen(4173,'127.0.0.1',()=>console.log('Heading South preview: http://127.0.0.1:4173'));
