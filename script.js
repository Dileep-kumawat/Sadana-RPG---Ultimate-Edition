const quests = [
  {id:"mantra", icon:"🧘", name:"Mantra Meditation — 10 rounds", xp:200, type:"MAIN QUEST"},
  {id:"project", icon:"💻", name:"Project Work", xp:150, type:"CAREER QUEST"},
  {id:"internship", icon:"📊", name:"BragSheet Internship", xp:150, type:"CAREER QUEST"},
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
  {id:"mantra7", icon:"🔥", title:"7-Day Flame", desc:"Reach a 7-day Mantra streak.", test:s=>s.mantraStreak>=7},
  {id:"mantra30", icon:"💎", title:"30-Day Sadhaka", desc:"Reach a 30-day Mantra streak.", test:s=>s.mantraStreak>=30},
  {id:"dsa10", icon:"📚", title:"Scholar", desc:"Complete DSA 10 times.", test:s=>s.counts.dsa>=10},
  {id:"dsa30", icon:"⚔️", title:"Problem Solver", desc:"Complete DSA 30 times.", test:s=>s.counts.dsa>=30},
  {id:"project10", icon:"🚀", title:"Builder", desc:"Complete Project Work 10 times.", test:s=>s.counts.project>=10},
  {id:"exercise10", icon:"💪", title:"10-Day Engine", desc:"Complete Exercise 10 times.", test:s=>s.counts.exercise>=10},
  {id:"xp10k", icon:"👑", title:"Focused", desc:"Earn 10,000 lifetime XP.", test:s=>s.totalXP>=10000},
  {id:"xp50k", icon:"🐉", title:"Sadhana Legend", desc:"Earn 50,000 lifetime XP.", test:s=>s.totalXP>=50000},
];

const bosses = [
  {name:"The Procrastination Demon", icon:"👹", target:3000, desc:"Earn 3,000 XP this week.", obj:["3,000 XP this week"]},
  {name:"The Distraction Beast", icon:"👾", target:4000, desc:"Earn 4,000 XP + 7 Mantra sessions.", obj:["4,000 XP this week","7 Mantra sessions"]},
  {name:"The Laziness Titan", icon:"🗿", target:5000, desc:"Earn 5,000 XP with a strong study/career week.", obj:["5,000 XP this week","4 Project sessions","3 DSA sessions"]},
  {name:"The Chaos Dragon", icon:"🐉", target:6000, desc:"The ultimate weekly challenge.", obj:["6,000 XP this week","7 Mantra sessions","5 career/academic sessions"]}
];

const titles = ["Beginner","Initiate","Disciplined","Focused","Consistent","Dedicated","Relentless","Elite","Master","Sadhana Legend"];
const STORAGE = "sadhana-rpg-ultimate-v1";

const blankState = () => ({
  totalXP:0, totalCompletions:0, counts:Object.fromEntries(quests.map(q=>[q.id,0])),
  days:{}, weeks:{}, mantraStreak:0, sadhanaStreak:0, lastDay:null, sound:true
});
let state = load();

function dateKey(d=new Date()){ return d.toISOString().slice(0,10); }
function weekKey(d=new Date()){
  const x = new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day);
  return x.toISOString().slice(0,10);
}
function todayData(){ const k=dateKey(); if(!state.days[k]) state.days[k]={done:[], xp:0}; return state.days[k]; }
function currentWeekXP(){ return state.days ? Object.entries(state.days).filter(([k])=>k>=weekKey()).reduce((a,[,v])=>a+(v.xp||0),0):0; }
function save(){ localStorage.setItem(STORAGE,JSON.stringify(state)); }
function load(){ try{ return {...blankState(),...JSON.parse(localStorage.getItem(STORAGE)||"{}")}; }catch{return blankState()} }

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
  document.getElementById("mantraStreak").textContent=state.mantraStreak||0;

  let tier="Start your run", chest="Reach 300 XP to unlock Bronze.";
  if(today>=1120){tier="👑 LEGENDARY DAY";chest="Legendary Chest unlocked."}
  else if(today>=900){tier="💎 DIAMOND DAY";chest="Diamond Chest unlocked."}
  else if(today>=700){tier="🥇 GOLD DAY";chest="Gold Chest unlocked."}
  else if(today>=500){tier="🥈 SILVER DAY";chest="Silver Chest unlocked."}
  else if(today>=300){tier="🥉 BRONZE DAY";chest="Bronze Chest unlocked."}
  document.getElementById("todayTier").textContent=tier;
  document.getElementById("chestText").textContent=chest;

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
  if(idx>=0){ done.splice(idx,1); toast("Quest undone — your earned XP remains safe."); render(); return; }
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
  render();
}

function updateMantraStreak(){
  const keys=Object.keys(state.days).sort().reverse();
  let s=0, cursor=new Date();
  for(const k of keys){
    const target=dateKey(cursor); if(k!==target) break;
    if((state.days[k].done||[]).includes("mantra")){s++;cursor.setDate(cursor.getDate()-1)} else break;
  }
  const prev=state.mantraStreak||0; state.mantraStreak=s;
  if(s>prev){ const b=streakBonus("mantra",s); if(b){state.totalXP+=b; toast(`🔥 Mantra milestone: +${b.toLocaleString()} XP`);}}
}
function updateSadhanaStreak(){
  const keys=Object.keys(state.days).sort().reverse(); let s=0, cursor=new Date();
  for(const k of keys){
    const target=dateKey(cursor); if(k!==target) break;
    if((state.days[k].xp||0)>=500){s++;cursor.setDate(cursor.getDate()-1)} else break;
  }
  const prev=state.sadhanaStreak||0; state.sadhanaStreak=s;
  if(s>prev){ const b=streakBonus("sadhana",s); if(b){state.totalXP+=b; toast(`🔥 Sadhana streak ${s}: +${b.toLocaleString()} XP`);}}
}

function renderAchievements(){
  const unlocked=achievements.filter(a=>a.test(state)).length;
  document.getElementById("achievementCount").textContent=`${unlocked} / ${achievements.length}`;
  document.getElementById("achievementGrid").innerHTML=achievements.map(a=>`
    <div class="achievement ${a.test(state)?"unlocked":"locked"}">
      <div class="medal">${a.icon}</div><b>${a.title}</b><small>${a.desc}</small>
    </div>`).join("");
}
let knownAchievements = new Set();
function checkAchievements(){
  achievements.forEach(a=>{
    if(a.test(state) && !knownAchievements.has(a.id)){
      knownAchievements.add(a.id);
      openModal(a.icon,`Achievement Unlocked`,a.title+" — "+a.desc);
    }
  });
}
function renderBoss(){
  const weekXP=currentWeekXP();
  const weekIndex=Math.floor(state.totalXP/5000)%bosses.length;
  const boss=bosses[weekIndex];
  document.getElementById("bossAvatar").textContent=boss.icon;
  document.getElementById("bossName").textContent=boss.name;
  document.getElementById("bossDesc").textContent=boss.desc;
  document.getElementById("bossCurrent").textContent=weekXP.toLocaleString();
  document.getElementById("bossTarget").textContent=boss.target.toLocaleString();
  document.getElementById("bossHP").style.width=Math.min(100,weekXP/boss.target*100)+"%";
  document.getElementById("bossObjectives").innerHTML=boss.obj.map(x=>`<div class="objective"><span>${x}</span><b>⚔️</b></div>`).join("");
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
  const el=document.getElementById("streakTrack"), now=new Date(); now.setDate(now.getDate()-13);
  el.innerHTML=Array.from({length:14},(_,i)=>{
    const d=new Date(now);d.setDate(now.getDate()+i);const k=dateKey(d);
    const active=(state.days[k]?.xp||0)>=500; const today=k===dateKey();
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
document.getElementById("soundBtn").onclick=()=>{state.sound=!state.sound;document.getElementById("soundBtn").textContent=state.sound?"🔊":"🔇";save();toast(state.sound?"Sounds on":"Sounds off")};
document.getElementById("resetBtn").onclick=()=>{
  if(confirm("Reset ALL Sadhana RPG progress? This cannot be undone.")){state=blankState();knownAchievements=new Set();save();render();toast("Fresh save created. New adventure begins!")}
};
document.getElementById("bossBtn").onclick=()=>openModal("👹","Weekly Boss Battle","Your boss is defeated by consistency, not perfection. Reach the target XP and complete the listed objectives.");
document.getElementById("greeting").textContent = `Welcome, Sadhaka.`;
document.getElementById("soundBtn").textContent=state.sound?"🔊":"🔇";
achievements.forEach(a=>{if(a.test(state))knownAchievements.add(a.id)});
render();
