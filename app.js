const bundledAudio={"1": "./audio/01-opening.mp3", "2": "./audio/02-Setup.mp3", "3": "./audio/03-Opening night close eyes.mp3", "4": "./audio/04-Shades awaken.mp3", "5": "./audio/05-Shades close their eyes.mp3", "6": "./audio/06-Wake and begin council one.mp3", "7": "./audio/07-Discussion ends; captain proposes.mp3", "8": "./audio/08-Proposal time ends; players resolve the council.mp3", "9": "./audio/09-Council comments.mp3", "10": "./audio/10-Comments end; prepare the next council.mp3", "11": "./audio/11-Council two begins.mp3", "12": "./audio/12-Council three begins.mp3", "13": "./audio/13-Final council ends; final discussion begins.mp3", "14": "./audio/14-Final discussion ends; prepare to vote.mp3", "15": "./audio/15-Final voting countdown.mp3", "16": "./audio/16-Runoff discussion.mp3", "17": "./audio/17-Runoff time ends; vote again.mp3", "18": "./audio/18-Light victory.mp3", "19": "./audio/19-Shade victory.mp3", "20": "./audio/20-Optional extra minute.mp3", "21": "./audio/21-Optional play again.mp3"};
const $=id=>document.getElementById(id);
const clips={
1:"Silence! Do you not see the light is fading? Quickly, choose your captain... but try not to choose the idiot.",
2:"Give everyone one face-up character and one face-down allegiance. Use the team counts shown here. Privately check your allegiance, then keep it face down. Place three flames in the lantern. Set out unused ability markers. Give Bramble the shield and Hazel the reserve ember, if present. When ready, press Ready. I shall stand here getting older.",
3:"The woodland grows dark... Everyone, close your eyes. Yes, both of them.",
4:"Shades, open your eyes. Look for your fellow Shade. If you are alone, keep your secret. No waving. This is a conspiracy, not a village fête.",
5:"Shades, close your eyes. Everyone, keep your eyes closed. A little longer...",
6:"Everyone, open your eyes. The first council begins. You have one minute to discuss whom you trust and whom you suspect. Anyone may lie about their allegiance or what they have seen. Your minute begins now.",
7:"Time! Discussion is over. Captain, you have twenty seconds to name a willing investigator and their proposed target. Announce any special investigation and its cost. Make sure the lantern can afford it. Your twenty seconds begin now.",
8:"Time is up, Captain. Resolve your proposal now. Allow any shield before the approval vote. If the investigation goes ahead, pay the flames, inspect privately, and give your reports. If there is no valid proposal, or it is blocked or rejected, this council still counts. Use your character cards and rules to settle abilities. When everything is resolved, press Continue.",
9:"Well? Has that made anything clearer? No? How unexpected. You have thirty seconds for comments before we move on. Begin.",
10:"Time is up. This council is finished. Pass the captain marker one place clockwise and advance the round marker. Fresh leadership. That should solve absolutely everything. Press Ready when the next captain has the marker.",
11:"The second council begins. By now, you have heard some claims. Perhaps even a fact. Do try not to confuse the two. You have one minute to discuss. Begin.",
12:"The third and final council. This is your last opportunity to arrange an investigation before the final vote. The Shade needs only to escape your judgement. You have one minute. Begin.",
13:"Time is up. The councils are finished. No more investigations. You have one final minute to decide whom to accuse. Find one Shade, and the Light wins. Your final minute begins now.",
14:"Enough! Your discussion is over. Resolve any ability that must be declared before the final vote. Prepare to point at one other player. No voting for yourself. No abstaining. No changing your vote after the count. Press Vote when everyone is ready.",
15:"Choose your suspect. Point together on my command. Three... two... one... POINT! Hold your votes while they are counted. Follow the rules to resolve the result, then tell me who won. If a runoff is required, select Runoff.",
16:"A tie. Of course. If no flame remains, the Shade has already won: select that result. Otherwise, spend one flame. You have thirty seconds to discuss the tied players. This discussion cannot be extended. Begin.",
17:"Time is up. Vote again. Choose only among the tied players. Everyone votes. You may vote for yourself in this runoff if you are one of those players. Every vote counts once. Another tie means the Shade wins. Three... two... one... POINT! Count the votes, resolve the result, and select the winning side.",
18:"A Shade has been revealed! The Light wins! The last lantern is safe. Well done, you suspicious little woodland nuisances. I had almost no faith in you. Everyone may reveal their allegiance. Enjoy your victory. I shall be taking most of the credit.",
19:"The Shade wins. The lantern’s defenders have failed. All that talking... and the darkness still had the last word. I have seen better judgement from a moth approaching a candle. Everyone, reveal your allegiance. And you Shades... stop looking so pleased with yourselves.",
20:"Another minute? Very well. Sixty extra seconds have been added. Apparently, the first helping of nonsense was not enough. Carry on.",
21:"Another game? Brave. Or forgetful. Reset the flames and ability markers. Return the shield and reserve ember. Shuffle and deal again, and choose your next captain. No carrying grudges into the next game. Oh, who am I kidding?"
};
const phases={
opening:[1,"The lantern keeper","Choose your first captain.","Continue"],
setup:[2,"Prepare the woodland","Characters face up. Allegiances secret.","Ready"],
close:[3,"Night falls","Everyone closes their eyes.",null,2],
shades:[4,"The Shade awakens","Keep your eyes closed unless you are a Shade.",null,8],
sleep:[5,"Keep your eyes closed","Wait for the narrator.",null,2],
discussion:[6,"Council discussion","Trust is earned. Suspicion is free.","Finish discussion",60],
proposal:[7,"Captain’s proposal","Agree an investigator, target and affordable cost.","Proposal ready",20],
resolve:[8,"Resolve the council","Handle voting, abilities, inspections and reports at the table.","Continue"],
comments:[9,"A moment to reflect","Comments only. Then the council ends.","Finish comments",30],
pass:[10,"Pass the lantern","Move the captain marker clockwise.","Ready"],
final:[13,"One last discussion","Find one Shade to win.","Finish discussion",60],
prepare:[14,"Make your choice","Resolve any pre-vote ability at the table.","Vote"],
vote:[15,"The final accusation","Count votes and resolve the result using your rules."],
runoff:[16,"One flame. One more chance.","Only continue here if a flame remains. No extensions.","Vote now",30],
runoffVote:[17,"The deciding vote","Only tied players are eligible. A further tie means Shade wins."],
light:[18,"The light holds.","A Shade revealed. A woodland saved.","Play again"],
shade:[19,"The shadows prevail.","Secrets kept. Suspicions misplaced.","Play again"],
again:[21,"Another little mystery?","Reset your pieces and deal again.","Back to setup"]
};
let state=null,mode=localStorage.getItem("ll-mode")==="silent"?"silent":"recorded",audio=new Audio(),generation=0,speaking=false,tickAt=Date.now(),db,urls=new Map(),wake;
const saved=()=>{try{return JSON.parse(localStorage.getItem("ll-game"))}catch{return null}};
function save(){if(state)localStorage.setItem("ll-game",JSON.stringify(state));}
function teamText(n){return n+" players · "+(n-(n<7?1:2))+" Light · "+(n<7?1:2)+" Shade";}
function data(){const p=[...phases[state.phase]];if(state.phase==="discussion"){p[0]=state.round===1?6:state.round===2?11:12;p[1]="Council "+state.round+" discussion";}return p}
function stopAudio(){generation++;speaking=false;audio.pause();audio.onended=null;audio.onerror=null;}
async function narration(id,done){
stopAudio();const gen=generation;const finish=()=>{if(gen!==generation)return;speaking=false;done?.();render();};
if(mode==="silent"){finish();return}
let src=urls.get(id)||bundledAudio[id];
if(src){speaking=true;render();audio.src=src;audio.onended=finish;audio.onerror=()=>{if(gen===generation){$("status").textContent="Audio unavailable — follow the on-screen script.";finish();}};try{await audio.play()}catch{if(gen===generation){finish();$("status").textContent="Playback blocked — tap Replay, or follow the script.";}}}

else{finish()}
}
function enter(phase){stopAudio();state.phase=phase;state.remaining=phases[phase][4]||0;state.paused=false;state.running=false;save();render();narration(data()[0],()=>{state.running=!!state.remaining;tickAt=Date.now();save()});}
function next(){
const p=state.phase;
const map={opening:"setup",setup:"close",close:"shades",shades:"sleep",sleep:"discussion",discussion:"proposal",proposal:"resolve",resolve:"comments",final:"prepare",prepare:"vote",runoff:"runoffVote",light:"again",shade:"again",again:"setup"};
if(p==="comments")return enter(state.round<3?"pass":"final");
if(p==="pass"){state.round++;return enter("discussion")}
if(p==="again")state.round=1;
if(map[p])enter(map[p]);
}
function render(){
$("home").hidden=!!state;$("game").hidden=!state;
$("resume").hidden=!saved();$("teams").textContent=teamText(+$("players").value);
if(!state)return;
const [id,title,hint,label,duration]=data();
$("chapter").textContent=["light","shade"].includes(state.phase)?"THE STORY ENDS":teamText(state.players);
$("rounds").innerHTML=[1,2,3].map(n=>'<span class="'+(n<=state.round?"active":"")+'"></span>').join("");
$("title").textContent=title;$("hint").textContent=hint;$("words").textContent=clips[id];
$("clock").hidden=!duration;$("clock").textContent=Math.floor(Math.ceil(state.remaining)/60)+":"+String(Math.ceil(state.remaining)%60).padStart(2,"0");
$("status").textContent=speaking?"The lantern keeper is speaking…":state.paused?"Paused — take your time.":duration?"Timer running":mode==="recorded"&&!urls.has(id)&&!bundledAudio[id]?"Narration not recorded yet · follow the script":"Ready when you are.";
$("next").hidden=!label;$("next").textContent=label||"Continue";$("next").disabled=false;
$("pause").hidden=!duration&&!speaking;$("pause").textContent=state.paused?"Resume":"Pause";
$("extend").hidden=!["discussion","final"].includes(state.phase);
$("replay").disabled=false;$("results").hidden=!["vote","runoffVote","runoff"].includes(state.phase);
$("runoff").hidden=state.phase!=="vote";
}
async function keepAwake(){try{wake=await navigator.wakeLock?.request("screen")}catch{}}
$("start").onclick=()=>{if(saved()&&!confirm("Replace your saved game?"))return;state={players:+$("players").value,round:1};keepAwake();enter("opening")};
$("resume").onclick=()=>{state=saved();if(!state||!phases[state.phase]){state=null;localStorage.removeItem("ll-game");return render()}state.paused=true;state.running=false;render();keepAwake()};
$("players").onchange=render;
// The labelled phase button is the explicit action; embedded browsers may suppress confirm().
$("next").onclick=()=>{if(!state)return;next()};
$("pause").onclick=()=>{if(speaking){stopAudio();state.paused=true;state.running=false}else{state.paused=!state.paused;state.running=!state.paused&&state.remaining>0;tickAt=Date.now();}save();render()};
$("extend").onclick=()=>{const wasPaused=state.paused;state.remaining+=60;state.running=false;state.paused=wasPaused;save();narration(20,()=>{state.running=!state.paused;tickAt=Date.now();save()})};
$("replay").onclick=()=>{state.running=false;const wasPaused=state.paused;narration(data()[0],()=>{state.paused=wasPaused;state.running=!wasPaused&&state.remaining>0;tickAt=Date.now();save()})};
$("light").onclick=()=>enter("light");$("shade").onclick=()=>enter("shade");
$("runoff").onclick=()=>{if(confirm("Is the top vote tied AND is at least one flame left? Spend one flame to start the runoff."))enter("runoff")};
$("exit").onclick=()=>{stopAudio();state.paused=true;state.running=false;save();state=null;wake?.release();render()};
$("settingsBtn").onclick=()=>{if(state){stopAudio();state.paused=true;state.running=false;save();render()}$("settings").showModal()};
$("close").onclick=()=>$("settings").close();
$("voice").value=mode;$("voice").onchange=()=>{mode=$("voice").value;localStorage.setItem("ll-mode",mode)};
$("reset").onclick=()=>{if(confirm("Reset the saved game? Your recordings will be kept.")){stopAudio();state=null;localStorage.removeItem("ll-game");$("settings").close();render()}};
setInterval(()=>{const now=Date.now();if(state?.running&&!state.paused&&!speaking){state.remaining=Math.max(0,state.remaining-(now-tickAt)/1000);save();render();if(state.remaining<=0){state.running=false;next()}}tickAt=now},200);
document.addEventListener("visibilitychange",()=>{if(document.hidden&&state){stopAudio();state.paused=true;state.running=false;save();render()}else if(state)keepAwake()});
const req=indexedDB.open("last-lantern-audio",1);
req.onupgradeneeded=()=>req.result.createObjectStore("clips");
req.onsuccess=()=>{db=req.result;const cursor=db.transaction("clips").objectStore("clips").openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){urls.set(+c.key,URL.createObjectURL(c.value));c.continue()}$("importStatus").textContent=urls.size+" imported recording(s) available."}};
req.onerror=()=>$("importStatus").textContent="Local recording storage unavailable in this browser.";
$("import").onchange=async e=>{if(!db)return;let n=0;for(const f of e.target.files){const m=f.name.match(/^(\d{2})(?:[-_ .]|$)/);if(!m||+m[1]<1||+m[1]>21)continue;const id=+m[1];try{await new Promise((resolve,reject)=>{const t=db.transaction("clips","readwrite");t.objectStore("clips").put(f,id);t.oncomplete=resolve;t.onerror=reject});if(urls.has(id))URL.revokeObjectURL(urls.get(id));urls.set(id,URL.createObjectURL(f));n++}catch{$("importStatus").textContent="Could not store recording. Check device storage.";return}}$("importStatus").textContent=n+" imported. Name files 01-opening.mp3 through 21-play-again.mp3.";e.target.value=""};
$("clearAudio").onclick=()=>{if(!db||!confirm("Remove all locally imported recordings?"))return;const t=db.transaction("clips","readwrite");t.objectStore("clips").clear();t.oncomplete=()=>{for(const u of urls.values())URL.revokeObjectURL(u);urls.clear();$("importStatus").textContent="Imported recordings removed. All 21 bundled recordings retained."}};
if("serviceWorker"in navigator){navigator.serviceWorker.register("./sw.js").then(()=>navigator.serviceWorker.ready).then(()=>$("offline").textContent="Offline app and all 21 recordings ready. Browser storage can be cleared by the OS.").catch(()=>$("offline").textContent="Offline installation unavailable here. You can still play online.")}
render();
