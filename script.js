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
    relic:{id:"action_blade", icon:"🗡️", name:"Blade of Action"},
    obj:[
      {label:"3,000 XP this week", check:xp=>xp>=3000, progress:xp=>`${Math.min(xp,3000).toLocaleString()}/3,000`}
    ]
  },
  {
    name:"The Distraction Beast", icon:"👾", target:4000, desc:"Earn 4,000 XP + 7 Mantra sessions.",
    relic:{id:"focus_eye", icon:"🧿", name:"Eye of Focus"},
    obj:[
      {label:"4,000 XP this week", check:xp=>xp>=4000, progress:xp=>`${Math.min(xp,4000).toLocaleString()}/4,000`},
      {label:"7 Mantra sessions", check:(_,c)=>(c.mantra||0)>=7, progress:(_,c)=>`${Math.min(c.mantra||0,7)}/7`}
    ]
  },
  {
    name:"The Laziness Titan", icon:"🗿", target:5000, desc:"Earn 5,000 XP with a strong study/career week.",
    relic:{id:"resolve_core", icon:"🪨", name:"Core of Resolve"},
    obj:[
      {label:"5,000 XP this week", check:xp=>xp>=5000, progress:xp=>`${Math.min(xp,5000).toLocaleString()}/5,000`},
      {label:"4 Project sessions", check:(_,c)=>(c.project||0)>=4, progress:(_,c)=>`${Math.min(c.project||0,4)}/4`},
      {label:"3 DSA sessions", check:(_,c)=>(c.dsa||0)>=3, progress:(_,c)=>`${Math.min(c.dsa||0,3)}/3`}
    ]
  },
  {
    name:"The Chaos Dragon", icon:"🐉", target:6000, desc:"The ultimate weekly challenge.",
    relic:{id:"discipline_crown", icon:"🔥", name:"Crown of Discipline"},
    obj:[
      {label:"6,000 XP this week", check:xp=>xp>=6000, progress:xp=>`${Math.min(xp,6000).toLocaleString()}/6,000`},
      {label:"7 Mantra sessions", check:(_,c)=>(c.mantra||0)>=7, progress:(_,c)=>`${Math.min(c.mantra||0,7)}/7`},
      {label:"5 career/academic sessions", check:(_,c)=>((c.project||0)+(c.internship||0)+(c.dsa||0)+(c.college||0))>=5, progress:(_,c)=>`${Math.min((c.project||0)+(c.internship||0)+(c.dsa||0)+(c.college||0),5)}/5`}
    ]
  }
];

const themes = [
  {id:"void", name:"Midnight Void", level:1, icon:"🌌"},
  {id:"saffron", name:"Saffron Dawn", level:2, icon:"🌅"},
  {id:"emerald", name:"Vrindavan Emerald", level:3, icon:"🌿"},
  {id:"tapasya", name:"Royal Tapasya", level:5, icon:"🔥"}
];

const titles = ["Beginner","Initiate","Disciplined","Focused","Consistent","Dedicated","Relentless","Elite","Master","Sadhana Legend"];
const STORAGE = "sadhana-rpg-ultimate-v1";

const blankState = () => ({
  totalXP:0, totalCompletions:0, counts:Object.fromEntries(quests.map(q=>[q.id,0])),
  days:{}, weeks:{}, mantraStreak:0, sadhanaStreak:0, maxMantraStreak:0, maxSadhanaStreak:0,
  shields:0, shieldMilestones:[], shieldUsedDays:[], relics:[], theme:"void",
  quests:quests.map(q=>({...q})), anchorQuestId:"mantra",
  restMode:false, restDays:[], nudgeEnabled:false, nudgeHour:21, lastNudgeDay:null,
  cloudSync:{token:"", gistId:"", lastSync:null},
  unlockedAchievements:[], defeatedBosses:{}, lastDay:null, sound:true
});
let state = load();
function getQuests(){ return (state.quests||quests).filter(q=>!q.archived); }
function findQuest(id){ return (state.quests||quests).find(q=>q.id===id) || quests.find(q=>q.id===id); }

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
  s.shieldMilestones=Array.isArray(s.shieldMilestones)?s.shieldMilestones:[];
  s.shieldUsedDays=Array.isArray(s.shieldUsedDays)?s.shieldUsedDays:[];
  s.relics=Array.isArray(s.relics)?s.relics:[];
  s.shields=Math.min(2,Math.max(0,Number(s.shields)||0));
  s.theme=typeof s.theme==="string"?s.theme:"void";
  s.quests=Array.isArray(s.quests)&&s.quests.length?s.quests:quests.map(q=>({...q}));
  s.anchorQuestId=typeof s.anchorQuestId==="string"?s.anchorQuestId:"mantra";
  s.restMode=Boolean(s.restMode);
  s.restDays=Array.isArray(s.restDays)?s.restDays:[];
  s.nudgeEnabled=Boolean(s.nudgeEnabled);
  s.nudgeHour=Number(s.nudgeHour)||21;
  s.cloudSync=s.cloudSync&&typeof s.cloudSync==="object"?{token:s.cloudSync.token||"",gistId:s.cloudSync.gistId||"",lastSync:s.cloudSync.lastSync||null}:{token:"",gistId:"",lastSync:null};
  s.counts=s.counts&&typeof s.counts==="object"?s.counts:{};
  s.quests.forEach(q=>{ if(typeof s.counts[q.id]!=="number") s.counts[q.id]=0; });
  s.maxMantraStreak=Math.max(s.maxMantraStreak||0,s.mantraStreak||0,computeMaxStreak(s.days,d=>(d.done||[]).includes(s.anchorQuestId||"mantra")));
  s.maxSadhanaStreak=Math.max(s.maxSadhanaStreak||0,s.sadhanaStreak||0,computeMaxStreak(s.days,d=>(d.xp||0)>=500));
  return s;
}
function applyTheme(){
  const lvl=levelInfo(state.totalXP).level;
  const active=themes.find(t=>t.id===state.theme && lvl>=t.level)?.id || "void";
  if(active==="void") document.body.removeAttribute("data-theme");
  else document.body.setAttribute("data-theme",active);
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
  const today=done.reduce((a,id)=>a+(findQuest(id)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
  const {claimable, next}=getChestState(today);
  if(!claimable.length){
    toast(next?`Reach ${next.min.toLocaleString()} XP to unlock ${next.name} Chest.`:"All daily chests claimed today!");
    return;
  }
  if(!Array.isArray(t.claimedChests)) t.claimedChests=[];
  const bonus=claimable.reduce((a,c)=>a+c.bonus,0);
  const prevLvl=levelInfo(state.totalXP).level;
  claimable.forEach(c=>t.claimedChests.push(c.id));
  state.totalXP += bonus;
  const top=claimable[claimable.length-1];
  spawnXP(bonus); playSound(levelInfo(state.totalXP).level>prevLvl?"level":"chest");
  openModal(top.icon,"Daily Chest Claimed!",`Unlocked ${claimable.map(c=>c.name).join(" + ")} Chest! +${bonus.toLocaleString()} Bonus XP added.`);
  checkAchievements();
  checkBossDefeat();
  render();
}
function render(){
  const t=todayData(), done=t.done||[], baseXP=done.reduce((a,id)=>a+(findQuest(id)?.xp||0),0);
  if(state.restMode && !state.restDays.includes(dateKey())) state.restDays.push(dateKey());
  document.getElementById("restBanner").hidden=!state.restMode;
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
  const anchorQ=state.anchorQuestId?findQuest(state.anchorQuestId):null;
  document.getElementById("anchorStreakPill").style.display=anchorQ?"":"none";
  document.getElementById("anchorMaxPill").style.display=anchorQ?"":"none";
  if(anchorQ){
    const shortName=anchorQ.id==="mantra"?"Mantra":anchorQ.name.split(" - ")[0];
    document.querySelector("#anchorStreakPill span").textContent=anchorQ.icon;
    document.getElementById("anchorStreakLabel").textContent=`${shortName} streak`;
    document.getElementById("anchorMaxLabel").textContent=`Max ${shortName}`;
  }
  document.getElementById("mantraStreak").textContent=state.mantraStreak||0;
  document.getElementById("maxMantraStreak").textContent=state.maxMantraStreak||0;
  document.getElementById("shieldCount").textContent=state.shields||0;
  const sankalpaEl=document.getElementById("sankalpaInput");
  if(document.activeElement!==sankalpaEl) sankalpaEl.value=t.sankalpa||"";
  const reflectEl=document.getElementById("reflectionInput");
  if(document.activeElement!==reflectEl) reflectEl.value=t.reflection||"";
  applyTheme();

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
  document.getElementById("questList").innerHTML=getQuests().map(q=>`
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
    t.xp=done.reduce((a,x)=>a+(findQuest(x)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
    const delta=oldXP-t.xp;
    state.totalXP=Math.max(0,state.totalXP-delta);
    state.totalCompletions=Math.max(0,state.totalCompletions-1);
    state.counts[id]=Math.max(0,(state.counts[id]||0)-1);
    if(id===state.anchorQuestId) updateMantraStreak(false);
    updateSadhanaStreak(false);
    playSound("undo");
    toast(`Quest undone (-${delta} XP). Past days remain safe.`);
    render();
    return;
  }
  const q=findQuest(id); if(!q) return; done.push(id);
  const oldBase=t.xp||0, prevLvl=levelInfo(state.totalXP).level;
  t.done=done; t.xp=done.reduce((a,x)=>a+(findQuest(x)?.xp||0),0)+comboBonus(done.length)+sacredBonus(done);
  const delta=t.xp-oldBase;
  state.totalXP += delta; state.totalCompletions++; state.counts[id]=(state.counts[id]||0)+1;
  if(id===state.anchorQuestId) updateMantraStreak();
  updateSadhanaStreak();
  spawnXP(delta);
  const leveledUp=levelInfo(state.totalXP).level>prevLvl;
  playSound(leveledUp?"level":"quest");
  toast(leveledUp?`Level Up! LV ${levelInfo(state.totalXP).level}`:`+${delta} XP — ${q.name}`);
  checkAchievements();
  checkBossDefeat();
  render();
}

function calcStreak(predicate, allowShield=true){
  const cur=effectiveDate(), todayK=localDateStr(cur);
  if(!predicate(state.days[todayK]||{})) cur.setDate(cur.getDate()-1);
  let s=0;
  while(true){
    const k=localDateStr(cur);
    if(predicate(state.days[k]||{})){
      s++; cur.setDate(cur.getDate()-1); continue;
    }
    if(state.restDays.includes(k)){
      cur.setDate(cur.getDate()-1); continue;
    }
    if(state.shieldUsedDays.includes(k)){
      s++; cur.setDate(cur.getDate()-1); continue;
    }
    if(allowShield && k<todayK && state.shields>0){
      const prev=new Date(cur); prev.setDate(prev.getDate()-1);
      if(predicate(state.days[localDateStr(prev)]||{})){
        state.shields--;
        state.shieldUsedDays.push(k);
        toast("🛡️ Streak Shield activated! Your streak was saved.");
        s++; cur.setDate(cur.getDate()-1); continue;
      }
    }
    break;
  }
  return s;
}
function grantShieldIfEarned(type, streak){
  if(![14,30,60,100].includes(streak)) return;
  const key=`${type}:${streak}`;
  if(state.shieldMilestones.includes(key)) return;
  state.shieldMilestones.push(key);
  if(state.shields<2){
    state.shields++;
    toast("🛡️ Earned +1 Streak Shield!");
  }
}
function updateMantraStreak(awardBonus=true){
  if(!state.anchorQuestId){ state.mantraStreak=0; return; }
  const s=calcStreak(d=>(d.done||[]).includes(state.anchorQuestId));
  const prev=state.mantraStreak||0; state.mantraStreak=s;
  state.maxMantraStreak=Math.max(state.maxMantraStreak||0,s);
  grantShieldIfEarned("mantra",s);
  if(awardBonus && s>prev){ const b=streakBonus("mantra",s); if(b){state.totalXP+=b; toast(`🔥 Anchor milestone: +${b.toLocaleString()} XP`);}}
}
function updateSadhanaStreak(awardBonus=true){
  const s=calcStreak(d=>(d.xp||0)>=500);
  const prev=state.sadhanaStreak||0; state.sadhanaStreak=s;
  state.maxSadhanaStreak=Math.max(state.maxSadhanaStreak||0,s);
  grantShieldIfEarned("sadhana",s);
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
  if(boss.relic && !state.relics.includes(boss.relic.id)) state.relics.push(boss.relic.id);
  if(!state.defeatedBosses[key]){
    state.defeatedBosses[key]=true;
    playSound("boss");
    openModal("🏆","Weekly Boss Defeated!",`You defeated ${boss.name}! Relic unlocked: ${boss.relic.icon} ${boss.relic.name}.`);
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
  document.getElementById("relicShelf").innerHTML=bosses.map(b=>{
    const has=state.relics.includes(b.relic.id);
    return `<span class="relic-pill ${has?"":"locked"}" title="${has?"Unlocked":"Defeat "+b.name}">${b.relic.icon} ${b.relic.name}</span>`;
  }).join("");
}
let insightTab="weekly";
function renderLeaderboard(){
  document.getElementById("insightsTitle").textContent=insightTab==="monthly"?"Monthly Insights":"Weekly Leaderboard";
  document.querySelectorAll("#insightTabs .seg-btn").forEach(b=>b.classList.toggle("active",b.dataset.tab===insightTab));
  if(insightTab==="monthly"){
    const mPrefix=dateKey().slice(0,7);
    const mDays=Object.entries(state.days||{}).filter(([k])=>k.startsWith(mPrefix));
    const totalMonthXP=mDays.reduce((a,[,v])=>a+(v.xp||0),0);
    const sadhanaDays=mDays.filter(([,v])=>(v.xp||0)>=500).length;
    const activeDays=mDays.filter(([,v])=>(v.xp||0)>0).length;
    const avgXP=activeDays?Math.round(totalMonthXP/activeDays):0;
    const qCounts={};
    mDays.forEach(([,v])=>(v.done||[]).forEach(id=>qCounts[id]=(qCounts[id]||0)+1));
    const topQ=Object.entries(qCounts).sort((a,b)=>b[1]-a[1]).slice(0,3);
    document.getElementById("leaderboard").innerHTML=topQ.length?topQ.map(([id,cnt],i)=>{
      const q=findQuest(id)||{icon:"✨",name:id};
      return `<div class="rank ${i===0?"current":""}"><div class="place">${["🥇","🥈","🥉"][i]}</div><div><b>${q.icon} ${q.name}</b><small>Most consistent this month</small></div><div class="score">${cnt}×</div></div>`;
    }).join(""):`<div class="rank"><div class="place">📅</div><div><b>No activity yet this month</b><small>Complete quests to see top habits</small></div><div class="score">0×</div></div>`;
    document.getElementById("sumLbl1").textContent="Month XP";
    document.getElementById("sumLbl2").textContent="Sadhana days";
    document.getElementById("sumLbl3").textContent="Avg / day";
    document.getElementById("weekXP").textContent=totalMonthXP.toLocaleString()+" XP";
    document.getElementById("bestWeek").textContent=`${sadhanaDays} days`;
    document.getElementById("weekChange").textContent=avgXP.toLocaleString()+" XP";
    return;
  }
  const thisWeek=currentWeekXP();
  const previous=Object.entries(state.days).filter(([k])=>k>=weekKey(new Date(Date.now()-7*86400000)) && k<weekKey()).reduce((a,[,v])=>a+(v.xp||0),0);
  const allWeeks={...state.weeks}; allWeeks[weekKey()]=thisWeek;
  const best=Math.max(0,...Object.values(allWeeks));
  const rows=[{name:"This Week",xp:thisWeek,current:true},{name:"Best Week",xp:best},{name:"Last Week",xp:previous}].sort((a,b)=>b.xp-a.xp);
  document.getElementById("leaderboard").innerHTML=rows.map((r,i)=>`<div class="rank ${r.current?"current":""}"><div class="place">${["🥇","🥈","🥉"][i]||"🏅"}</div><div><b>${r.name}</b><small>${r.current?"Your current run":"Your previous record"}</small></div><div class="score">${r.xp.toLocaleString()} XP</div></div>`).join("");
  document.getElementById("sumLbl1").textContent="This week";
  document.getElementById("sumLbl2").textContent="Best week";
  document.getElementById("sumLbl3").textContent="Change";
  document.getElementById("weekXP").textContent=thisWeek.toLocaleString()+" XP";
  document.getElementById("bestWeek").textContent=best.toLocaleString()+" XP";
  document.getElementById("weekChange").textContent=(thisWeek-previous>=0?"+":"")+((thisWeek-previous).toLocaleString())+" XP";
}
function openDayModal(k){
  const d=state.days[k]||{};
  const xp=d.xp||0;
  const shielded=state.shieldUsedDays.includes(k);
  const isRest=state.restDays.includes(k);
  const doneNames=(d.done||[]).map(id=>findQuest(id)).filter(Boolean).map(q=>`${q.icon} ${q.name}`);
  const statusNote=shielded?" · Protected by Shield":isRest?" · Rest / Travel Day":"";
  const rows=[
    `<div class="day-chip"><b>XP Earned:</b> ${xp.toLocaleString()} XP${statusNote}</div>`,
    d.sankalpa?`<div class="day-chip"><b>🕉️ Sankalpa:</b> ${d.sankalpa.replace(/</g,"&lt;")}</div>`:"",
    d.reflection?`<div class="day-chip"><b>✍️ Reflection:</b> ${d.reflection.replace(/</g,"&lt;")}</div>`:"",
    `<div class="day-chip"><b>Completed Quests (${doneNames.length}):</b><br>${doneNames.length?doneNames.join("<br>"):"None recorded"}</div>`
  ].filter(Boolean).join("");
  openModal("📅",k,xp>=500?"Sadhana Day achieved!":isRest?"Rest / Travel Day":"Activity summary",`<div class="day-summary">${rows}</div>`);
}
function renderStreak(){
  const el=document.getElementById("streakTrack"), base=effectiveDate(); base.setDate(base.getDate()-27);
  const todayK=dateKey();
  el.innerHTML=Array.from({length:28},(_,i)=>{
    const d=new Date(base);d.setDate(base.getDate()+i);const k=localDateStr(d);
    const xp=state.days[k]?.xp||0;
    const shielded=state.shieldUsedDays.includes(k);
    const isRest=state.restDays.includes(k);
    const cls=xp>=900?"legend":xp>=500?"active":xp>0?"partial":shielded?"shielded":isRest?"rest":"";
    const today=k===todayK;
    return `<div class="day-dot ${cls} ${today?"today":""}" data-day="${k}" title="${k}: ${xp} XP"><div class="dot">${shielded?"🛡️":isRest?"⏸":""}</div><small>${d.getDate()}</small></div>`;
  }).join("");
  el.querySelectorAll(".day-dot").forEach(dot=>dot.addEventListener("click",()=>openDayModal(dot.dataset.day)));
}
function toast(msg){const el=document.getElementById("toast");el.textContent=msg;el.classList.add("show");clearTimeout(window.toastT);window.toastT=setTimeout(()=>el.classList.remove("show"),2200)}
function spawnXP(n){const e=document.createElement("div");e.className="spark";e.textContent=`+${n} XP`;e.style.left=(window.innerWidth/2+Math.random()*80-40)+"px";e.style.top=(window.innerHeight/2+Math.random()*40-20)+"px";document.body.appendChild(e);setTimeout(()=>e.remove(),900)}
let audioCtx=null;
function playSound(type="quest"){
  if(!state.sound) return;
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended") audioCtx.resume();
    const seq={
      quest:[[523,.06,0],[659,.09,.06]],
      undo:[[440,.06,0],[349,.08,.06]],
      chest:[[523,.07,0],[659,.07,.07],[784,.08,.14],[1046,.14,.21]],
      level:[[523,.08,0],[659,.08,.08],[784,.08,.16],[1046,.2,.24]],
      boss:[[392,.1,0],[523,.1,0.09],[659,.1,0.18],[784,.22,0.27]]
    }[type]||[[660,.08,0]];
    seq.forEach(([freq,dur,delay])=>{
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type="triangle"; o.frequency.value=freq;
      const t0=audioCtx.currentTime+delay;
      g.gain.setValueAtTime(0.001,t0);
      g.gain.exponentialRampToValueAtTime(0.045,t0+0.015);
      g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(t0); o.stop(t0+dur+0.02);
    });
  }catch{}
}
const ICONS = {
  settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  volOn:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  volOff:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  reset:'<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  edit:'<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  chevUp:'<polyline points="18 15 12 9 6 15"/>',
  chevDown:'<polyline points="6 9 12 15 18 9"/>',
  cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  moon:'<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
};
function ico(name,size=16){
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||""}</svg>`;
}
function openModal(icon,title,text,extraHtml=""){
  const iconEl=document.getElementById("modalIcon");
  if(icon && icon.startsWith("<svg")) iconEl.innerHTML=icon;
  else iconEl.textContent=icon;
  document.getElementById("modalTitle").textContent=title;
  document.getElementById("modalText").textContent=text;
  document.getElementById("modalExtra").innerHTML=extraHtml;
  document.getElementById("modalBackdrop").classList.add("open");
}
function openThemeModal(){
  const lvl=levelInfo(state.totalXP).level;
  const html=`<div class="theme-grid">${themes.map(t=>{
    const unlocked=lvl>=t.level, active=state.theme===t.id;
    return `<button class="theme-option ${active?"active":""} ${unlocked?"":"locked"}" data-theme="${t.id}" ${unlocked?"":"disabled"}><span>${t.icon} ${t.name}</span><small>${unlocked?(active?"Active":"Select"):`Unlocks LV ${t.level}`}</small></button>`;
  }).join("")}</div>`;
  openModal(ico("palette",36),"Choose Theme","Unlock new themes as you level up.",html);
  document.querySelectorAll(".theme-option:not([disabled])").forEach(btn=>btn.onclick=()=>{
    state.theme=btn.dataset.theme;
    applyTheme(); save(); closeModal();
    toast("Theme updated!");
  });
}
function closeModal(){document.getElementById("modalBackdrop").classList.remove("open")}
document.getElementById("modalClose").onclick=closeModal;
document.getElementById("modalOK").onclick=closeModal;
document.getElementById("modalBackdrop").addEventListener("click",e=>{if(e.target.id==="modalBackdrop")closeModal()});
function openSettingsModal(){
  const activeQuests=getQuests();
  const options=[
    ...activeQuests.map(q=>`<option value="${q.id}" ${state.anchorQuestId===q.id?"selected":""}>${q.icon} ${q.name}</option>`),
    `<option value="" ${!state.anchorQuestId?"selected":""}>None (Hide 2nd streak)</option>`
  ].join("");
  const html=`<div class="settings-list">
    <div class="setting-row">
      <div><label for="anchorSelect">Anchor Streak Quest</label><small>Protected from accidental delete</small></div>
      <select id="anchorSelect">${options}</select>
    </div>
    <button class="setting-btn" id="settingsQuestsBtn"><span>Manage Quests (Reorder / Add / Edit)</span><span class="setting-val">${ico("list",16)}</span></button>
    <button class="setting-btn" id="settingsRestBtn"><span>Rest / Travel Mode</span><span class="setting-val">${ico("moon",16)} ${state.restMode?"On":"Off"}</span></button>
    <div class="setting-row">
      <div><label for="nudgeSelect">Evening Streak Nudge</label><small>Remind before 2:00 AM cutoff</small></div>
      <select id="nudgeSelect">
        <option value="off" ${!state.nudgeEnabled?"selected":""}>Off</option>
        ${[20,21,22,23].map(h=>`<option value="${h}" ${state.nudgeEnabled&&state.nudgeHour===h?"selected":""}>${h>12?`${h-12}:00 PM`:`${h}:00`}</option>`).join("")}
      </select>
    </div>
    <button class="setting-btn" id="settingsCloudBtn"><span>Cloud Sync (GitHub Gist)</span><span class="setting-val">${ico("cloud",16)}</span></button>
    <button class="setting-btn" id="settingsSoundBtn"><span>Sound Effects</span><span class="setting-val">${ico(state.sound?"volOn":"volOff",16)} ${state.sound?"On":"Off"}</span></button>
    <button class="setting-btn" id="settingsExportBtn"><span>Export Backup (JSON)</span><span class="setting-val">${ico("download",16)}</span></button>
    <button class="setting-btn" id="settingsImportBtn"><span>Import Backup (JSON)</span><span class="setting-val">${ico("upload",16)}</span></button>
    <button class="setting-btn danger" id="settingsResetBtn"><span>Reset All Progress</span><span>${ico("reset",16)}</span></button>
  </div>`;
  openModal(ico("settings",36),"Settings","Manage your quests, streaks, cloud sync, and backups.",html);
  document.getElementById("settingsQuestsBtn").onclick=()=>{editingQuestId=null;openQuestsModal();};
  document.getElementById("settingsRestBtn").onclick=()=>{
    state.restMode=!state.restMode;
    if(state.restMode && !state.restDays.includes(dateKey())) state.restDays.push(dateKey());
    save(); render(); openSettingsModal();
    toast(state.restMode?"Rest Mode enabled — streaks paused.":"Rest Mode disabled.");
  };
  document.getElementById("nudgeSelect").onchange=async e=>{
    const val=e.target.value;
    if(val==="off"){ state.nudgeEnabled=false; save(); toast("Evening nudge off."); return; }
    state.nudgeEnabled=true; state.nudgeHour=Number(val);
    if("Notification" in window && Notification.permission==="default"){
      try{ await Notification.requestPermission(); }catch{}
    }
    save(); toast(`Evening nudge set for ${state.nudgeHour>12?state.nudgeHour-12:state.nudgeHour}:00 PM.`);
  };
  document.getElementById("settingsCloudBtn").onclick=openCloudSyncModal;
  document.getElementById("anchorSelect").onchange=e=>{
    state.anchorQuestId=e.target.value;
    updateMantraStreak(false);
    save(); render();
    toast(state.anchorQuestId?"Anchor quest updated!":"Anchor streak hidden.");
  };
  document.getElementById("settingsSoundBtn").onclick=()=>{
    state.sound=!state.sound; save(); openSettingsModal();
    toast(state.sound?"Sounds on":"Sounds off");
  };
  document.getElementById("settingsExportBtn").onclick=()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download=`sadhana-rpg-backup-${dateKey()}.json`; a.click(); URL.revokeObjectURL(a.href);
    toast("Backup exported!");
  };
  document.getElementById("settingsImportBtn").onclick=()=>document.getElementById("importFile").click();
  document.getElementById("settingsResetBtn").onclick=()=>{
    if(confirm("Reset ALL Sadhana RPG progress? This cannot be undone.")){
      state=blankState(); knownAchievements=new Set(); save(); closeModal(); render();
      toast("Fresh save created. New adventure begins!");
    }
  };
}
function openCloudSyncModal(){
  const cs=state.cloudSync||{token:"",gistId:"",lastSync:null};
  const lastText=cs.lastSync?`Last synced: ${new Date(cs.lastSync).toLocaleString()}`:"Not synced yet.";
  const html=`<div class="cloud-form">
    <input id="csToken" type="password" value="${(cs.token||"").replace(/"/g,"&quot;")}" placeholder="GitHub Personal Access Token (gist scope)" />
    <input id="csGist" type="text" value="${(cs.gistId||"").replace(/"/g,"&quot;")}" placeholder="Gist ID (leave blank to auto-create)" />
    <div class="cloud-actions">
      <button class="primary-btn" id="csPushBtn" type="button">Push to Cloud</button>
      <button class="setting-btn" id="csPullBtn" type="button" style="justify-content:center">Pull from Cloud</button>
    </div>
  </div>`;
  openModal(ico("cloud",36),"Cloud Sync",lastText,html);
  const saveInputs=()=>{
    state.cloudSync.token=document.getElementById("csToken").value.trim();
    state.cloudSync.gistId=document.getElementById("csGist").value.trim();
    save();
  };
  document.getElementById("csPushBtn").onclick=async ()=>{
    saveInputs();
    if(!state.cloudSync.token){ toast("Enter your GitHub token first."); return; }
    try{
      const payload={...state, cloudSync:{...state.cloudSync, token:""}};
      const body={description:"Sadhana RPG Save Backup", public:false, files:{"sadhana-rpg-backup.json":{content:JSON.stringify(payload,null,2)}}};
      const url=state.cloudSync.gistId?`https://api.github.com/gists/${state.cloudSync.gistId}`:"https://api.github.com/gists";
      const res=await fetch(url,{
        method:state.cloudSync.gistId?"PATCH":"POST",
        headers:{Authorization:`Bearer ${state.cloudSync.token}`,Accept:"application/vnd.github+json","Content-Type":"application/json"},
        body:JSON.stringify(body)
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      state.cloudSync.gistId=data.id;
      state.cloudSync.lastSync=Date.now();
      save(); openCloudSyncModal();
      toast("Synced to GitHub Gist!");
    }catch(err){ toast(`Sync failed (${err.message}).`); }
  };
  document.getElementById("csPullBtn").onclick=async ()=>{
    saveInputs();
    if(!state.cloudSync.gistId){ toast("Enter a Gist ID to pull from."); return; }
    try{
      const headers={Accept:"application/vnd.github+json"};
      if(state.cloudSync.token) headers.Authorization=`Bearer ${state.cloudSync.token}`;
      const res=await fetch(`https://api.github.com/gists/${state.cloudSync.gistId}`,{headers});
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      const raw=data.files?.["sadhana-rpg-backup.json"]?.content;
      if(!raw) throw new Error("Backup file missing");
      const parsed=JSON.parse(raw);
      if(!parsed || typeof parsed.days!=="object") throw new Error("Invalid data");
      const keptSync={...state.cloudSync, lastSync:Date.now()};
      state=normalizeState(parsed);
      state.cloudSync=keptSync;
      knownAchievements=new Set();
      achievements.forEach(a=>{
        if(isAchievementUnlocked(a)){
          if(!state.unlockedAchievements.includes(a.id)) state.unlockedAchievements.push(a.id);
          knownAchievements.add(a.id);
        }
      });
      updateMantraStreak(false); updateSadhanaStreak(false);
      save(); closeModal(); render();
      toast("Restored from Cloud!");
    }catch(err){ toast(`Pull failed (${err.message}).`); }
  };
}
let editingQuestId=null;
function openQuestsModal(){
  const types=["MAIN QUEST","SPIRITUAL QUEST","CAREER QUEST","ACADEMIC QUEST","HEALTH QUEST","WISDOM QUEST","BALANCE QUEST","CUSTOM QUEST"];
  const eq=editingQuestId?findQuest(editingQuestId):null;
  const active=getQuests();
  const listHtml=active.map((q,idx)=>{
    const isAnchor=q.id===state.anchorQuestId;
    return `<div class="quest-mgr-item">
      <div><b>${q.icon} ${q.name}</b><small>+${q.xp} XP · ${q.type}${isAnchor?" · Anchor":""}</small></div>
      <div class="quest-mgr-actions">
        <button class="icon-mini" data-move="${q.id}:-1" title="Move up" ${idx===0?"disabled style='opacity:.3'":""}>${ico("chevUp",14)}</button>
        <button class="icon-mini" data-move="${q.id}:1" title="Move down" ${idx===active.length-1?"disabled style='opacity:.3'":""}>${ico("chevDown",14)}</button>
        <button class="icon-mini" data-edit="${q.id}" title="Edit">${ico("edit",14)}</button>
        ${isAnchor?`<span class="icon-mini" title="Anchor quest protected">${ico("lock",14)}</span>`:`<button class="icon-mini" data-del="${q.id}" title="Remove">${ico("trash",14)}</button>`}
      </div>
    </div>`;
  }).join("");
  const html=`<div class="quest-mgr">
    <form class="quest-form" id="questForm">
      <input id="qfIcon" type="text" maxlength="4" value="${eq?eq.icon:"✨"}" placeholder="✨" required />
      <input id="qfName" type="text" maxlength="45" value="${eq?eq.name.replace(/"/g,"&quot;"):""}" placeholder="Quest name..." required />
      <input id="qfXP" type="number" min="10" max="1000" step="10" value="${eq?eq.xp:100}" required />
      <select id="qfType">${types.map(t=>`<option ${eq&&eq.type===t?"selected":""}>${t}</option>`).join("")}</select>
      <button class="primary-btn" type="submit">${eq?"Save Quest Changes":"+ Add New Quest"}</button>
    </form>
    <div class="quest-mgr-list">${listHtml}</div>
  </div>`;
  openModal(ico("list",36),"Manage Quests","Add new quests or edit existing ones. Anchor quest cannot be deleted.",html);
  document.getElementById("questForm").onsubmit=e=>{
    e.preventDefault();
    const icon=(document.getElementById("qfIcon").value||"✨").trim();
    const name=document.getElementById("qfName").value.trim();
    const xp=Math.max(10,Math.min(1000,Number(document.getElementById("qfXP").value)||50));
    const type=document.getElementById("qfType").value;
    if(!name) return;
    if(editingQuestId){
      const target=findQuest(editingQuestId);
      if(target){ target.icon=icon; target.name=name; target.xp=xp; target.type=type; }
      editingQuestId=null; toast("Quest updated!");
    } else {
      const id="q_"+Date.now().toString(36);
      state.quests.push({id,icon,name,xp,type});
      state.counts[id]=0;
      toast("Quest added!");
    }
    save(); render(); openQuestsModal();
  };
  document.querySelectorAll("[data-move]").forEach(b=>b.onclick=()=>{
    const [id,dirStr]=b.dataset.move.split(":"), dir=Number(dirStr);
    const activeIds=getQuests().map(q=>q.id);
    const pos=activeIds.indexOf(id), swapPos=pos+dir;
    if(swapPos<0 || swapPos>=activeIds.length) return;
    const i1=state.quests.findIndex(q=>q.id===activeIds[pos]);
    const i2=state.quests.findIndex(q=>q.id===activeIds[swapPos]);
    [state.quests[i1],state.quests[i2]]=[state.quests[i2],state.quests[i1]];
    save(); render(); openQuestsModal();
  });
  document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{editingQuestId=b.dataset.edit; openQuestsModal();});
  document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{
    const q=findQuest(b.dataset.del);
    if(!q || q.id===state.anchorQuestId) return;
    q.archived=true;
    save(); render(); openQuestsModal();
    toast(`Removed ${q.name}`);
  });
}
document.getElementById("themeBtn").onclick=openThemeModal;
document.getElementById("settingsBtn").onclick=openSettingsModal;
document.getElementById("sankalpaInput").addEventListener("input",e=>{todayData().sankalpa=e.target.value;save();});
document.getElementById("reflectionInput").addEventListener("input",e=>{todayData().reflection=e.target.value;save();});
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
      closeModal();
      render();
      toast("Backup restored!");
    }catch{ toast("Could not read backup file."); }
  };
  reader.readAsText(file);
});
document.getElementById("chest").onclick=claimDailyChest;
document.getElementById("bossBtn").onclick=()=>{
  const {boss, defeated}=getBossState();
  if(defeated) openModal("🏆","Weekly Boss Defeated!",`You defeated ${boss.name} this week! Keep up the consistency.`);
  else openModal(boss.icon,"Weekly Boss Battle","Your boss is defeated by consistency, not perfection. Reach the target XP and complete the listed objectives.");
};
document.querySelectorAll("#insightTabs .seg-btn").forEach(b=>b.onclick=()=>{insightTab=b.dataset.tab;renderLeaderboard();});
function checkEveningNudge(){
  if(!state.nudgeEnabled || state.restMode) return;
  const now=new Date(), hr=now.getHours(), tk=dateKey();
  if(hr<state.nudgeHour || hr<2 || state.lastNudgeDay===tk) return;
  const t=todayData(), done=t.done||[];
  const needsSadhana=(t.xp||0)<500;
  const needsAnchor=state.anchorQuestId && !done.includes(state.anchorQuestId);
  if(!needsSadhana && !needsAnchor) return;
  state.lastNudgeDay=tk; save();
  const msg="Your daily Sadhana streak is waiting! Complete your quests before 2:00 AM.";
  if("Notification" in window && Notification.permission==="granted"){
    try{ new Notification("Sadhana RPG",{body:msg,icon:"./android-chrome-192x192.png"}); }catch{ toast(msg); }
  } else toast(msg);
}
document.getElementById("greeting").textContent = `Welcome, Sadhaka.`;
updateMantraStreak(false);
updateSadhanaStreak(false);
achievements.forEach(a=>{
  if(isAchievementUnlocked(a)){
    if(!state.unlockedAchievements.includes(a.id)) state.unlockedAchievements.push(a.id);
    knownAchievements.add(a.id);
  }
});
render();
checkEveningNudge();
setInterval(checkEveningNudge,60000);
if("serviceWorker" in navigator){ navigator.serviceWorker.register("./sw.js").catch(()=>{}); }
