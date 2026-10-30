const CACHE="last-lantern-v3-recordings";
const ASSETS=["./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest", "./icon.svg", "./icon-192.png", "./icon-512.png", "./audio/01-opening.mp3", "./audio/02-Setup.mp3", "./audio/03-Opening night close eyes.mp3", "./audio/04-Shades awaken.mp3", "./audio/05-Shades close their eyes.mp3", "./audio/06-Wake and begin council one.mp3", "./audio/07-Discussion ends; captain proposes.mp3", "./audio/08-Proposal time ends; players resolve the council.mp3", "./audio/09-Council comments.mp3", "./audio/10-Comments end; prepare the next council.mp3", "./audio/11-Council two begins.mp3", "./audio/12-Council three begins.mp3", "./audio/13-Final council ends; final discussion begins.mp3", "./audio/14-Final discussion ends; prepare to vote.mp3", "./audio/15-Final voting countdown.mp3", "./audio/16-Runoff discussion.mp3", "./audio/17-Runoff time ends; vote again.mp3", "./audio/18-Light victory.mp3", "./audio/19-Shade victory.mp3", "./audio/20-Optional extra minute.mp3", "./audio/21-Optional play again.mp3"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("last-lantern-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function cachedResponse(request) {
 const cache=await caches.open(CACHE);
 const hit=await cache.match(request.url);
 if(!hit)return fetch(request);
 const range=request.headers.get("range");
 if(!range)return hit;
 const match=/^bytes=(\d*)-(\d*)$/.exec(range);
 if(!match || (!match[1]&&!match[2]))return fetch(request);
 const body=await hit.arrayBuffer(),size=body.byteLength;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
 if(start>=size||start>end)return new Response(null,{status:416,headers:{"Content-Range":`bytes */${size}`}});
 const headers=new Headers(hit.headers);
 headers.set("Content-Range",`bytes ${start}-${end}/${size}`);
 headers.set("Content-Length",String(end-start+1));
 headers.set("Accept-Ranges","bytes");
 return new Response(body.slice(start,end+1),{status:206,headers});
}
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;e.respondWith(cachedResponse(e.request))});
