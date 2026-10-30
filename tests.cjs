const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();const el=id=>{if(!elements.has(id))elements.set(id,{value:id==='players'?'5':'',hidden:false,textContent:'',showModal(){},close(){}});return elements.get(id)};
let interval;const storage=new Map();
const c=vm.createContext({console,document:{getElementById:el,addEventListener(){}},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},Audio:class{pause(){}play(){return Promise.resolve()}},navigator:{},window:{},indexedDB:{open(){return {}}},URL:{},setInterval:f=>interval=f,Date,confirm:()=>true,SpeechSynthesisUtterance:class{}});
vm.runInContext(fs.readFileSync('app.js','utf8'),c);
const run=s=>vm.runInContext(s,c);
run('mode="silent"; state={players:8,round:1}; enter("opening")');
for(const expected of ['setup','close','shades','sleep','discussion','proposal','resolve','comments','pass','discussion']){
 run('next()');assert.equal(run('state.phase'),expected);
}
assert.equal(run('state.round'),2);
run('enter("discussion"); $("extend").onclick()');assert.equal(run('state.remaining'),120);
run('$("pause").onclick()');assert.equal(run('state.paused'),true);
run('$("pause").onclick()');assert.equal(run('state.running'),true);
run('state.remaining=.01; tickAt=Date.now()-1000');interval();assert.equal(run('state.phase'),'proposal');
run('state.round=3;enter("comments");next()');assert.equal(run('state.phase'),'final');
run('next();next()');assert.equal(run('state.phase'),'vote');
run('$("runoff").onclick()');assert.equal(run('state.phase'),'runoff');assert.equal(el('extend').hidden,true);
run('next()');assert.equal(run('state.phase'),'runoffVote');assert.equal(el('runoff').hidden,true);
run('$("light").onclick()');assert.equal(run('state.phase'),'light');
run('next();next()');assert.equal(run('state.phase'),'setup');assert.equal(run('state.round'),1);
run('enter("discussion");$("exit").onclick()');assert.equal(run('state'),null);run('$("resume").onclick()');assert.equal(run('state.paused'),true);
for(const file of ['index.html','style.css','app.js','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','audio/01-opening.mp3'])assert.ok(fs.existsSync(file));
console.log('PASS: round progression, timers, pause, extension, runoff, endings, replay setup, saved resume, PWA assets');

// Embedded browsers may reject native confirmation dialogs: phase buttons still work.
run('confirm=()=>{throw new Error("Native dialog must not be used for phase advancement")};state={players:5,round:1};');
for(const [from,to] of [['discussion','proposal'],['proposal','resolve'],['comments','pass'],['final','prepare'],['runoff','runoffVote']]){
 run('enter('+JSON.stringify(from)+');$("next").onclick()');
 assert.equal(run('state.phase'),to);
 assert.equal(run('speaking'),false);
 assert.equal(run('state.remaining'),run('phases[state.phase][4]||0'));
}
run('enter("discussion");$("pause").onclick();$("next").onclick()');
assert.equal(run('state.phase'),'proposal');assert.equal(run('state.paused'),false);
console.log('PASS: every early-finish button works without native dialogs, including paused timers');

assert.equal(run('mode="recorded"; Object.keys(bundledAudio).length'),21);
for(let id=1;id<=21;id++){
 const path=run(`bundledAudio[${id}]`);assert.ok(fs.existsSync(path));
 run(`narration(${id})`);assert.equal(run('audio.src'),path);assert.equal(run('speaking'),true);
 run('audio.onended()');assert.equal(run('speaking'),false);
}
run('state={players:5,round:1};enter("discussion")');
assert.equal(run('state.running'),false);run('audio.onended()');assert.equal(run('state.running'),true);
run('enter("discussion");oldEnd=audio.onended;$("next").onclick();oldEnd()');
assert.equal(run('state.phase'),'proposal');assert.equal(run('state.running'),false);
run('audio.onended()');assert.equal(run('state.running'),true);
assert.ok(!fs.readFileSync('app.js','utf8').includes('speechSynthesis'));
console.log('PASS: all 21 bundled recordings, narration-gated timers, stale audio callbacks, no TTS');
