const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
let cached=new Response(new Uint8Array([0,1,2,3,4,5,6,7,8,9]),{headers:{'Content-Type':'audio/mpeg'}});
const c=vm.createContext({Response,Headers,URL,fetch:()=>{throw Error('Unexpected network access')},caches:{open:async()=>({match:async()=>cached.clone()})},self:{addEventListener(){}},location:{origin:'https://example.test'}});
vm.runInContext(fs.readFileSync('sw.js','utf8'),c);
(async()=>{
 const assets=vm.runInContext('ASSETS',c);
 assert.equal(assets.filter(p=>p.endsWith('.mp3')).length,21);
 for(const p of assets)if(p!=='./')assert.ok(fs.existsSync(p));
 for(const [range,status,expected] of [[null,200,[0,1,2,3,4,5,6,7,8,9]],['bytes=2-5',206,[2,3,4,5]],['bytes=7-',206,[7,8,9]],['bytes=-3',206,[7,8,9]],['bytes=50-',416,[]]]){
 c.request={url:'https://example.test/TheLastLantern/audio/test.mp3',headers:new Headers(range?{range}:{})};
 const response=await vm.runInContext('cachedResponse(request)',c);
 assert.equal(response.status,status);assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],expected);
 }
 console.log('PASS: 21 cached clips, all cache paths exist, offline full and partial audio responses');
})().catch(e=>{console.error(e);process.exitCode=1});
