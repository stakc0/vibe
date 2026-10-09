import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,stat} from 'node:fs/promises';

const ROOT=path.dirname(fileURLToPath(import.meta.url));
const ORIGIN='https://www.vibepad.family';
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime','.svg':'image/svg+xml','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
const ALIASES={'/':'/index.html','/docs':'/docs.html','/connect-vercel':'/connect-vercel.html','/privacy':'/privacy.html','/support':'/support.html','/terms':'/terms.html'};
function safe(p){const decoded=decodeURIComponent(p);if(decoded.includes('\0')||decoded.includes('..'))return null;return path.resolve(ROOT,'.'+decoded);}
async function proxy(req,res,url){
  const target=new URL(url.pathname+url.search,ORIGIN);
  const headers={};
  for(const k of ['accept','content-type','cookie','authorization','user-agent','x-requested-with','next-action','rsc','next-router-state-tree','next-router-prefetch','next-url'])if(req.headers[k])headers[k]=req.headers[k];
  const chunks=[];for await(const c of req)chunks.push(c);
  const upstream=await fetch(target,{method:req.method,headers,body:chunks.length?Buffer.concat(chunks):undefined,redirect:'manual'});
  const out={};for(const [k,v] of upstream.headers){if(!['content-encoding','transfer-encoding','connection'].includes(k))out[k]=v;}
  res.writeHead(upstream.status,out);res.end(Buffer.from(await upstream.arrayBuffer()));
}
async function handler(req,res){
  try{
    const url=new URL(req.url,'http://localhost');
    if(req.method!=='GET'&&req.method!=='HEAD')return proxy(req,res,url);
    if(url.pathname==='/_next/image')return proxy(req,res,url);
    let file=safe(ALIASES[url.pathname]||url.pathname);
    try{const info=await stat(file);if(!info.isFile())throw 0;}
    catch{
      const routeFile=safe(url.pathname.replace(/\/$/,'')+'.html');
      try{const info=await stat(routeFile);if(!info.isFile())throw 0;file=routeFile;}
      catch{
        if(url.pathname.startsWith('/_next/')||url.pathname.includes('.'))return proxy(req,res,url);
        file=safe('/index.html');
      }
    }
    const data=await readFile(file);const ext=path.extname(file);
    const immutable=url.pathname.startsWith('/_next/')||['.png','.jpg','.jpeg','.webp','.gif','.mp4','.webm','.mov','.woff','.woff2'].includes(ext);
    res.writeHead(200,{'content-type':MIME[ext]||'application/octet-stream','cache-control':immutable?'public, max-age=31536000, immutable':'no-cache','accept-ranges':'bytes'});res.end(data);
  }catch(e){res.writeHead(502,{'content-type':'application/json'});res.end(JSON.stringify({error:e.message}));}
}
if(process.argv[1]===fileURLToPath(import.meta.url))http.createServer(handler).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('vibe clone on http://localhost:'+(process.env.PORT||3000)));
export {handler};
export default handler;
