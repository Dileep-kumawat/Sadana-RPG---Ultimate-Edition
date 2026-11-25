const quests = [
  {id:"mantra", icon:"🧘", name:"Mantra Meditation - 4 rounds", xp:200, type:"MAIN QUEST"},
  {id:"project", icon:"💻", name:"Project Work", xp:150, type:"CAREER QUEST"},
  {id:"internship", icon:"📊", name:"Micro Tools Development", xp:150, type:"CAREER QUEST"},
  {id:"dsa", icon:"🧠", name:"DSA", xp:120, type:"ACADEMIC QUEST"},
  {id:"class", icon:"📖", name:"Bhagavatnam Class", xp:100, type:"WISDOM QUEST"},
  {id:"exercise", icon:"🏃", name:"Exercises", xp:100, type:"HEALTH QUEST"},
  {id:"college", icon:"🎓", name:"College Works", xp:90, type:"ACADEMIC QUEST"},
  {id:"mangala", icon:"🛕", name:"Mangala Aarti", xp:80, type:"SPIRITUAL QUEST"},
  {id:"yoga", icon:"🧘", name:"Yoga", xp:70, type:"BALANCE QUEST"},
  {id:"darshan", icon:"🛕", name:"Darshan Aarti", xp:60, type:"SPIRITUAL QUEST"}
];

const achievements = [
  {id:"first", icon:"🌱", title:"First Step", desc:"Complete your first quest.", test:s=>s.totalCompletions>=1},
  {id:"mantra1", icon:"🕉️", title:"First Mantra", desc:"Complete Mantra Meditation once.", test:s=>s.counts.mantra>=1},
  {id:"mantra7", icon:"🔥", title:"7-Day Flame", desc:"Reach a 7-day Mantra streak.", test:s=>Math.max(s.mantraStreak||0,s.maxMantraStreak||0)>=7},
  {id:"mantra30", icon:"💎", title:"30-Day Sadhaka", desc:"Reach a 30-day Mantra streak.", test:s=>Math.max(s.mantraStreak||0,s.maxMantraStreak||0)>=30},
  {id:"dsa10", icon:"📚", title:"Scholar", desc:"Complete DSA 10 times.", test:s=>s.counts.dsa>=10},
  {id:"dsa30", icon:"⚔️", title:"Problem Solver", desc:"Complete DSA 30 times.", test:s=>s.counts.dsa>=30},
  {id:"project10", icon:"🚀", title:"Builder", desc:"Complete Project Work 10 times.", test:s=>s.counts.project>=10},
  {id:"exercise10", icon:"💪", title:"10-Day Engine", desc:"Complete Exercise 10 times.", test:s=>s.counts.exercise>=10},
  {id:"xp10k", icon:"👑", title:"Focused", desc:"Earn 10,000 lifetime XP.", test:s=>s.totalXP>=10000},
  {id:"xp50k", icon:"🐉", title:"Sadhana Legend", desc:"Earn 50,000 lifetime XP.", test:s=>s.totalXP>=50000},
];

const bosses = [
  {
    name:"The Procrastination Demon", icon:"👹", target:3000, desc:"Earn 3,000 XP this week.",
    obj:[
      {label:"3,000 XP this week", check:xp=>xp>=3000, progress:xp=>`${Math.min(xp,3000).toLocaleString()}/3,000`}
    ]
  },
  {
    name:"The Distraction Beast", icon:"👾", target:4000, desc:"Earn 4,000 XP + 7 Mantra sessions.",
    obj:[
      {label:"4,000 XP this week", check:xp=>xp>=4000, progress:xp=>`${Math.min(xp,4000).toLocaleString()}/4,000`},
      {label:"7 Mantra sessions", check:(_,c)=>(c.mantra||0)>=7, progress:(_,c)=>`${Math.min(c.mantra||0,7)}/7`}
    ]
  },
  {
    name:"The Laziness Titan", icon:"🗿", target:5000, desc:"Earn 5,000 XP with a strong study/career week.",
    obj:[
      {label:"5,000 XP this week", check:xp=>xp>=5000, progress:xp=>`${Math.min(xp,5000).toLocaleString()}/5,000`},
      {label:"4 Project sessions", check:(_,c)=>(c.project||0)>=4, progress:(_,c)=>`${Math.min(c.project||0,4)}/4`},
      {label:"3 DSA sessions", check:(_,c)=>(c.dsa||0)>=3, progress:(_,c)=>`${Math.min(c.dsa||0,3)}/3`}
    ]
  },
  {
    name:"The Chaos Dragon", icon:"🐉", target:6000, desc:"The ultimate weekly challenge.",
    obj:[
      {label:"6,000 XP this week", check:xp=>xp>=6000, progress:xp=>`${Math.min(xp,6000).toLocaleString()}/6,000`},
      {label:"7 Mantra sessions", check:(_,c)=>(c.mantra||0)>=7, progress:(_,c)=>`${Math.min(c.mantra||0,7)}/7`},
      {label:"5 career/academic sessions", check:(_,c)=>((c.project||0)+(c.internship||0)+(c.dsa||0)+(c.college||0))>=5, progress:(_,c)=>`${Math.min((c.project||0)+(c.internship||0)+(c.dsa||0)+(c.college||0),5)}/5`}
    ]
  }
];

const titles = ["Beginner","Initiate","Disciplined","Focused","Consistent","Dedicated","Relentless","Elite","Master","Sadhana Legend"];
const STORAGE = "sadhana-rpg-ultimate-v1";

const blankState = () => ({
  totalXP:0, totalCompletions:0, counts:Object.fromEntries(quests.map(q=>[q.id,0])),
  days:{}, weeks:{}, mantraStreak:0, sadhanaStreak:0, maxMantraStreak:0, maxSadhanaStreak:0,
  unlockedAchievements:[], defeatedBosses:{}, lastDay:null, sound:true
});
let state = load();

function effectiveDate(d=new Date()){
  const x=new Date(d);
  x.setHours(x.getHours()-2);
  return x;
}
function localDateStr(x){
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
}
function dateKey(d=new Date()){ return localDateStr(effectiveDate(d)); }
function weekKey(d=new Date()){
  const x=effectiveDate(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day);
  return localDateStr(x);
}
function todayData(){ const k=dateKey(); if(!state.days[k]) state.days[k]={done:[], xp:0}; return state.days[k]; }
function currentWeekXP(){ return state.days ? Object.entries(state.days).filter(([k])=>k>=weekKey()).reduce((a,[,v])=>a+(v.xp||0),0):0; }
function currentWeekCounts(){
  const wk=weekKey(), counts={};
  for(const [k,v] of Object.entries(state.days||{})){
    if(k>=wk) for(const id of (v.done||[])) counts[id]=(counts[id]||0)+1;
  }
  return counts;
}
function computeMaxStreak(days, predicate){
  const keys=Object.keys(days||{}).sort();
  let best=0, cur=0, prev=null;
  for(const k of keys){
    if(!predicate(days[k])){ cur=0; prev=null; continue; }
    if(prev){
      const d=new Date(prev+"T00:00:00Z"); d.setUTCDate(d.getUTCDate()+1);
      cur = d.toISOString().slice(0,10)===k ? cur+1 : 1;
    } else cur=1;
    prev=k; if(cur>best) best=cur;
  }
  return best;
}
function normalizeState(raw){
  const s={...blankState(),...(raw||{})};
  s.unlockedAchievements=Array.isArray(s.unlockedAchievements)?s.unlockedAchievements:[];
  s.defeatedBosses=s.defeatedBosses&&typeof s.defeatedBosses==="object"?s.defeatedBosses:{};
  s.maxMantraStreak=Math.max(s.maxMantraStreak||0,s.mantraStreak||0,computeMaxStreak(s.days,d=>(d.done||[]).includes("mantra")));
  s.maxSadhanaStreak=Math.max(s.maxSadhanaStreak||0,s.sadhanaStreak||0,computeMaxStreak(s.days,d=>(d.xp||0)>=500));
  return s;
}
function save(){ localStorage.setItem(STORAGE,JSON.stringify(state)); }
function load(){
  try{ return normalizeState(JSON.parse(localStorage.getItem(STORAGE)||"{}")); }
  catch{ return blankState(); }
}

function levelInfo(xp){
  const level=Math.floor(xp/5000)+1;
  const base=(level-1)*5000;
  const progress=Math.min(100,((xp-base)/5000)*100);
  return {level,title:titles[Math.min(level-1,titles.length-1)] || "Sadhana Legend",base,next:base+5000,progress};
}

function comboBonus(doneCount){
  if(doneCount>=6) return 150;
  if(doneCount===5) return 100;
  if(doneCount===4) return 75;
  if(doneCount===3) return 50;
  if(doneCount===2) return 25;
  return 0;
}
function sacredBonus(done){
  return ["mantra","yoga","exercise"].every(x=>done.includes(x)) ? 200 : 0;
}
function streakBonus(type, streak){
  const map=type==="mantra"?{7:500,14:1000,30:2000,60:3500,100:5000}:{3:100,7:500,14:1000,30:3000,100:10000};
  return map[streak]||0;
}

const chestTiers = [
  {id:"bronze", min:300, bonus:50, icon:"🥉", name:"Bronze", tier:"🥉 BRONZE DAY"},
  {id:"silver", min:500, bonus:100, icon:"🥈", name:"Silver", tier:"🥈 SILVER DAY"},
  {id:"gold", min:700, bonus:150, icon:"🥇", name:"Gold", tier:"🥇 GOLD DAY"},
  {id:"diamond", min:900, bonus:250, icon:"💎", name:"Diamond", tier:"💎 DIAMOND DAY"},
  {id:"legendary", min:1120, bonus:400, icon:"👑", name:"Legendary", tier:"👑 LEGENDARY DAY"}
];
function getChestState(today){
  const t=todayData();
  const claimed=Array.isArray(t.claimedChests)?t.claimedChests:[];
  const unlocked=chestTiers.filter(c=>today>=c.min);
  const claimable=unlocked.filter(c=>!claimed.includes(c.id));
  const next=chestTiers.find(c=>today<c.min);
  const highest=unlocked[unlocked.length-1]||null;
  return {t, claimed, unlocked, claimable, next, highest};
}
function claimDailyChest(){
  const t=todayData(), done=t.done||[];
  const today=done.reduce((a,id)=>a+(quests.find(q=>q.id===id)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
  const {claimable, next}=getChestState(today);
  if(!claimable.length){
    toast(next?`Reach ${next.min.toLocaleString()} XP to unlock ${next.name} Chest.`:"All daily chests claimed today!");
    return;
  }
  if(!Array.isArray(t.claimedChests)) t.claimedChests=[];
  const bonus=claimable.reduce((a,c)=>a+c.bonus,0);
  claimable.forEach(c=>t.claimedChests.push(c.id));
  state.totalXP += bonus;
  const top=claimable[claimable.length-1];
  spawnXP(bonus); beep();
  openModal(top.icon,"Daily Chest Claimed!",`Unlocked ${claimable.map(c=>c.name).join(" + ")} Chest! +${bonus.toLocaleString()} Bonus XP added.`);
  checkAchievements();
  checkBossDefeat();
  render();
}
function render(){
  const t=todayData(), done=t.done||[], baseXP=done.reduce((a,id)=>a+(quests.find(q=>q.id===id)?.xp||0),0);
  const combo=comboBonus(done.length), sacred=sacredBonus(done), today=baseXP+combo+sacred;
  const lvl=levelInfo(state.totalXP);

  document.getElementById("levelNumber").textContent=`LV ${lvl.level}`;
  document.getElementById("levelTitle").textContent=lvl.title;
  document.getElementById("levelXP").textContent=state.totalXP.toLocaleString();
  document.getElementById("nextLevelXP").textContent=lvl.next.toLocaleString();
  document.getElementById("levelProgress").style.width=lvl.progress+"%";
  document.getElementById("lifetimeXP").textContent=state.totalXP.toLocaleString();
  document.getElementById("todayXP").textContent=today.toLocaleString();
  document.getElementById("todayProgress").style.width=Math.min(100,today/1120*100)+"%";
  document.getElementById("todayPercent").textContent=Math.min(100,Math.round(today/1120*100))+"%";
  document.getElementById("comboBadge").textContent=`COMBO ×${Math.min(done.length,6)}`;
  document.getElementById("comboNote").textContent = sacred ? "🕉️ Sacred Combo active: +200 XP" : combo ? `⚡ Combo bonus active: +${combo} XP` : "Complete quests to build your combo.";
  document.getElementById("sadhanaStreak").textContent=state.sadhanaStreak||0;
  document.getElementById("maxSadhanaStreak").textContent=state.maxSadhanaStreak||0;
  document.getElementById("mantraStreak").textContent=state.mantraStreak||0;
  document.getElementById("maxMantraStreak").textContent=state.maxMantraStreak||0;

  const {claimable, next, highest}=getChestState(today);
  const chestEl=document.getElementById("chest");
  const chestTitleEl=document.getElementById("chestTitle");
  const chestTextEl=document.getElementById("chestText");
  document.getElementById("todayTier").textContent=highest?highest.tier:"Start your run";
  chestEl.classList.toggle("claimable",claimable.length>0);
  chestEl.classList.toggle("claimed",Boolean(highest)&&claimable.length===0);
  if(claimable.length>0){
    const bonus=claimable.reduce((a,c)=>a+c.bonus,0);
    chestTitleEl.textContent=`${claimable[claimable.length-1].name} Chest Ready!`;
    chestTextEl.textContent=`Click to claim +${bonus} Bonus XP`;
  } else if(highest){
    chestTitleEl.textContent=`${highest.name} Chest Claimed ✅`;
    chestTextEl.textContent=next?`Next: ${next.name} Chest at ${next.min.toLocaleString()} XP.`:"All daily chests claimed today!";
  } else {
    chestTitleEl.textContent="Daily Chest";
    chestTextEl.textContent="Reach 300 XP to unlock Bronze.";
  }

  renderQuests(done);
  renderAchievements();
  renderBoss();
  renderLeaderboard();
  renderStreak();
  save();
}

function renderQuests(done){
  document.getElementById("questList").innerHTML=quests.map(q=>`
    <div class="quest ${done.includes(q.id)?"done":""}" data-id="${q.id}">
      <div class="check">${done.includes(q.id)?"✓":""}</div>
      <div><div class="quest-name">${q.icon} ${q.name}</div><div class="quest-type">${q.type}</div></div>
      <div class="quest-xp">+${q.xp}</div>
    </div>`).join("");
  document.querySelectorAll(".quest").forEach(el=>el.addEventListener("click",()=>toggleQuest(el.dataset.id)));
}

function toggleQuest(id){
  const t=todayData(), done=t.done||[], idx=done.indexOf(id);
  if(idx>=0){
    const oldXP=t.xp||0;
    done.splice(idx,1);
    t.done=done;
    t.xp=done.reduce((a,x)=>a+(quests.find(q=>q.id===x)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
    const delta=oldXP-t.xp;
    state.totalXP=Math.max(0,state.totalXP-delta);
    state.totalCompletions=Math.max(0,state.totalCompletions-1);
    state.counts[id]=Math.max(0,(state.counts[id]||0)-1);
    if(id==="mantra") updateMantraStreak(false);
    updateSadhanaStreak(false);
    toast(`Quest undone (-${delta} XP). Past days remain safe.`);
    render();
    return;
  }
  const q=quests.find(x=>x.id===id); done.push(id);
  const oldBase=t.xp||0;
  t.done=done; t.xp=done.reduce((a,x)=>a+(quests.find(q=>q.id===x)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
  const delta=t.xp-oldBase;
  state.totalXP += delta; state.totalCompletions++; state.counts[id]++;
  if(id==="mantra") updateMantraStreak();
  updateSadhanaStreak();
  spawnXP(delta); beep();
  toast(`+${delta} XP — ${q.name}`);
  checkAchievements();
  checkBossDefeat();
  render();
}

function calcStreak(predicate){
  const cur=effectiveDate();
  if(!predicate(state.days[localDateStr(cur)]||{})) cur.setDate(cur.getDate()-1);
  let s=0;
  while(predicate(state.days[localDateStr(cur)]||{})){
    s++;
    cur.setDate(cur.getDate()-1);
  }
  return s;
}
function updateMantraStreak(awardBonus=true){
  const s=calcStreak(d=>(d.done||[]).includes("mantra"));
  const prev=state.mantraStreak||0; state.mantraStreak=s;
  state.maxMantraStreak=Math.max(state.maxMantraStreak||0,s);
  if(awardBonus && s>prev){ const b=streakBonus("mantra",s); if(b){state.totalXP+=b; toast(`🔥 Mantra milestone: +${b.toLocaleString()} XP`);}}
}
function updateSadhanaStreak(awardBonus=true){
  const s=calcStreak(d=>(d.xp||0)>=500);
  const prev=state.sadhanaStreak||0; state.sadhanaStreak=s;
  state.maxSadhanaStreak=Math.max(state.maxSadhanaStreak||0,s);
  if(awardBonus && s>prev){ const b=streakBonus("sadhana",s); if(b){state.totalXP+=b; toast(`🔥 Sadhana streak ${s}: +${b.toLocaleString()} XP`);}}
}

function isAchievementUnlocked(a){
  return (state.unlockedAchievements||[]).includes(a.id) || a.test(state);
}
function renderAchievements(){
  const unlocked=achievements.filter(isAchievementUnlocked).length;
  document.getElementById("achievementCount").textContent=`${unlocked} / ${achievements.length}`;
  document.getElementById("achievementGrid").innerHTML=achievements.map(a=>`
    <div class="achievement ${isAchievementUnlocked(a)?"unlocked":"locked"}">
      <div class="medal">${a.icon}</div><b>${a.title}</b><small>${a.desc}</small>
    </div>`).join("");
}
let knownAchievements = new Set();
function checkAchievements(){
  if(!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements=[];
  achievements.forEach(a=>{
    if(isAchievementUnlocked(a)){
      if(!state.unlockedAchievements.includes(a.id)) state.unlockedAchievements.push(a.id);
      if(!knownAchievements.has(a.id)){
        knownAchievements.add(a.id);
        openModal(a.icon,`Achievement Unlocked`,a.title+" — "+a.desc);
      }
    }
  });
}
function getBossState(){
  const weekXP=currentWeekXP(), wc=currentWeekCounts();
  const weekIndex=Math.floor(state.totalXP/5000)%bosses.length;
  const boss=bosses[weekIndex];
  const defeated=boss.obj.every(o=>o.check(weekXP,wc));
  return {boss, weekXP, wc, defeated};
}
function checkBossDefeat(){
  const {boss, defeated}=getBossState();
  if(!defeated) return;
  const key=`${weekKey()}:${boss.name}`;
  if(!state.defeatedBosses) state.defeatedBosses={};
  if(!state.defeatedBosses[key]){
    state.defeatedBosses[key]=true;
    openModal("🏆","Weekly Boss Defeated!",`You defeated ${boss.name}! All weekly objectives are complete.`);
  }
}
function renderBoss(){
  const {boss, weekXP, wc, defeated}=getBossState();
  const panel=document.getElementById("bossPanel");
  const badge=document.getElementById("bossBadge");
  const btn=document.getElementById("bossBtn");
  panel.classList.toggle("defeated",defeated);
  badge.textContent=defeated?"✅ DEFEATED":"ACTIVE";
  btn.textContent=defeated?"🏆 Boss Defeated!":"⚔️ View Boss";
  document.getElementById("bossAvatar").textContent=defeated?"🏆":boss.icon;
  document.getElementById("bossName").textContent=boss.name;
  document.getElementById("bossDesc").textContent=defeated?"Weekly boss defeated! Consistency wins.":boss.desc;
  document.getElementById("bossCurrent").textContent=weekXP.toLocaleString();
  document.getElementById("bossTarget").textContent=boss.target.toLocaleString();
  document.getElementById("bossHP").style.width=Math.min(100,weekXP/boss.target*100)+"%";
  document.getElementById("bossObjectives").innerHTML=boss.obj.map(o=>{
    const ok=o.check(weekXP,wc);
    return `<div class="objective ${ok?"done":""}"><span>${o.label}</span><b>${ok?"✅":o.progress(weekXP,wc)+" ⚔️"}</b></div>`;
  }).join("");
}
function renderLeaderboard(){
  const thisWeek=currentWeekXP();
  const previous=Object.entries(state.days).filter(([k])=>k>=weekKey(new Date(Date.now()-7*86400000)) && k<weekKey()).reduce((a,[,v])=>a+(v.xp||0),0);
  const allWeeks={...state.weeks}; allWeeks[weekKey()]=thisWeek;
  const best=Math.max(0,...Object.values(allWeeks));
  const rows=[{name:"This Week",xp:thisWeek,current:true},{name:"Best Week",xp:best},{name:"Last Week",xp:previous}].sort((a,b)=>b.xp-a.xp);
  document.getElementById("leaderboard").innerHTML=rows.map((r,i)=>`<div class="rank ${r.current?"current":""}"><div class="place">${["🥇","🥈","🥉"][i]||"🏅"}</div><div><b>${r.name}</b><small>${r.current?"Your current run":"Your previous record"}</small></div><div class="score">${r.xp.toLocaleString()} XP</div></div>`).join("");
  document.getElementById("weekXP").textContent=thisWeek.toLocaleString()+" XP";
  document.getElementById("bestWeek").textContent=best.toLocaleString()+" XP";
  document.getElementById("weekChange").textContent=(thisWeek-previous>=0?"+":"")+((thisWeek-previous).toLocaleString())+" XP";
}
function renderStreak(){
  const el=document.getElementById("streakTrack"), base=effectiveDate(); base.setDate(base.getDate()-13);
  const todayK=dateKey();
  el.innerHTML=Array.from({length:14},(_,i)=>{
    const d=new Date(base);d.setDate(base.getDate()+i);const k=localDateStr(d);
    const active=(state.days[k]?.xp||0)>=500; const today=k===todayK;
    return `<div class="day-dot ${active?"active":""} ${today?"today":""}"><div class="dot"></div><small>${d.toLocaleDateString(undefined,{weekday:"narrow"})}</small></div>`;
  }).join("");
}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.toastT);window.toastT=setTimeout(()=>el.classList.remove("show"),2200)}
function spawnXP(n){const e=document.createElement("div");e.className="spark";e.textContent=`+${n} XP`;e.style.left=(window.innerWidth/2+Math.random()*80-40)+"px";e.style.top=(window.innerHeight/2+Math.random()*40-20)+"px";document.body.appendChild(e);setTimeout(()=>e.remove(),900)}
function beep(){if(!state.sound)return;try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=660;g.gain.value=.035;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.08)}catch{}}
function openModal(icon,title,text){document.getElementById("modalIcon").textContent=icon;document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;document.getElementById("modalBackdrop").classList.add("open")}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("open")}
document.getElementById("modalClose").onclick=closeModal;
document.getElementById("modalOK").onclick=closeModal;
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
document.getElementById("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`sadhana-rpg-backup-${dateKey()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast("Backup exported!");
};
document.getElementById("importBtn").onclick=()=>document.getElementById("importFile").click();
document.getElementById("importFile").addEventListener("change",e=>{
  const file=e.target.files?.[0];
  e.target.value="";
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      if(!parsed || typeof parsed!=="object" || typeof parsed.days!=="object"){
        toast("Invalid backup file."); return;
      }
      state=normalizeState(parsed);
      knownAchievements=new Set();
      achievements.forEach(a=>{
        if(isAchievementUnlocked(a)){
          if(!state.unlockedAchievements.includes(a.id)) state.unlockedAchievements.push(a.id);
          knownAchievements.add(a.id);
        }
      });
      updateMantraStreak(false);
      updateSadhanaStreak(false);
      save();
      render();
      toast("Backup restored!");
    }catch{ toast("Could not read backup file."); }
  };
  reader.readAsText(file);
});
document.getElementById("soundBtn").onclick=()=>{state.sound=!state.sound;document.getElementById("soundBtn").textContent=state.sound?"🔊":"🔇";save();toast(state.sound?"Sounds on":"Sounds off")};
document.getElementById("resetBtn").onclick=()=>{
  if(confirm("Reset ALL Sadhana RPG progress? This cannot be undone.")){state=blankState();knownAchievements=new Set();save();render();toast("Fresh save created. New adventure begins!")}
};
document.getElementById("chest").onclick=claimDailyChest;
document.getElementById("bossBtn").onclick=()=>{
  const {boss, defeated}=getBossState();
  if(defeated) openModal("🏆","Weekly Boss Defeated!",`You defeated ${boss.name} this week! Keep up the consistency.`);
  else openModal(boss.icon,"Weekly Boss Battle","Your boss is defeated by consistency, not perfection. Reach the target XP and complete the listed objectives.");
};
document.getElementById("greeting").textContent = `Welcome, Sadhaka.`;
document.getElementById("soundBtn").textContent=state.sound?"🔊":"🔇";
updateMantraStreak(false);
updateSadhanaStreak(false);
achievements.forEach(a=>{
  if(isAchievementUnlocked(a)){
    if(!state.unlockedAchievements.includes(a.id)) state.unlockedAchievements.push(a.id);
    knownAchievements.add(a.id);
  }
});
render();
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js").catch(()=>{}); }
