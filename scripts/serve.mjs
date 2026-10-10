import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
export function serve(port = 4173) {
  const base = resolve('.');
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8' };
  return createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
      const rel = file.slice(base.length + 1);
      if (!file.startsWith(base + sep) || rel.split(/[\\/]/).some(part => part.startsWith('.') || ['node_modules','tests','scripts'].includes(part))) {
        res.writeHead(403); res.end(); return;
      }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY', 'Cache-Control': 'no-store' });
      res.end(data);
    } catch { res.writeHead(404); res.end('Not found'); }
  }).listen(port, '127.0.0.1');
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  serve(); console.log('Local preview: http://127.0.0.1:4173');
}
