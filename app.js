var YOMPLE_MODULE = "field";
var YOMPLE_TABLE = "field_players";
var YOMPLE_STORE = "quiet-field-v1";
function slugName(s){
  return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,18) || "player";
}
var SISTER_KEYS = ["presidents-palace-v2","bloom.v1","word-garden-v1","star-map-v1","quiet-field-v1"];
var AVATARS = ["\ud83c\udfee","\ud83c\udf3e","\ud83e\udd85","\u2b50","\ud83d\udcd8","\ud83c\udf33","\ud83d\udd6f\ufe0f","\ud83d\uddfd"];

var store = { profiles:[], activeId:null, familyCode:"", parentEmail:"", progress:{}, fun:{}, lastFirst:false };
var currentPhrase = null;
var currentMode = "home";
var mixSet = [];

function loadStore(){
  try { store = Object.assign(store, JSON.parse(localStorage.getItem(YOMPLE_STORE) || "{}")); } catch(e){}
  if (!store.profiles) store.profiles = [];
  if (!store.progress) store.progress = {};
  if (!store.fun) store.fun = {};
  if (!store.familyCode) {
    for (var i=0;i<SISTER_KEYS.length;i++){
      try {
        var sib = JSON.parse(localStorage.getItem(SISTER_KEYS[i]) || "null");
        if (sib && sib.familyCode) { store.familyCode = sib.familyCode; break; }
      } catch(e){}
    }
  }
}
function saveStore(){
  localStorage.setItem(YOMPLE_STORE, JSON.stringify(store));
}
function toast(msg){
  var el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(function(){ el.classList.remove("show"); }, 2200);
}
function getActiveProfile(){
  return (store.profiles||[]).find(function(p){ return p.id === store.activeId; }) || null;
}
function pid(){ return store.activeId; }
function getProg(){
  if (!pid()) return {};
  if (!store.progress[pid()]) store.progress[pid()] = {};
  return store.progress[pid()];
}
function getFun(){
  if (!pid()) return { stars:0, mute:false, questDay:"", questN:0 };
  if (!store.fun[pid()]) store.fun[pid()] = { stars:0, mute:false, questDay:"", questN:0 };
  return store.fun[pid()];
}
function itemState(id){
  var p = getProg()[id];
  return p || { state:0, consec:0, introduced:false, last:0 };
}
function setItem(id, patch){
  var cur = itemState(id);
  store.progress[pid()][id] = Object.assign({}, cur, patch, { last: Date.now() });
  saveStore();
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("on"); });
  var el = document.getElementById(id);
  if (el) el.classList.add("on");
  var nav = document.getElementById("main-nav");
  var kid = id === "screen-home" || id === "screen-look" || id === "screen-echo" || id === "screen-walk" || id === "screen-mix";
  if (nav) nav.style.display = kid ? "flex" : "none";
  document.querySelectorAll("#main-nav button").forEach(function(b){ b.classList.remove("active"); });
  if (id === "screen-home") document.getElementById("nav-home").classList.add("active");
  if (id === "screen-walk") document.getElementById("nav-walk").classList.add("active");
  if (id === "screen-echo") document.getElementById("nav-echo").classList.add("active");
}
function showProfiles(){
  stopListen(); stopSpeak();
  showScreen("screen-profiles");
  var grid = document.getElementById("profile-grid");
  grid.innerHTML = "";
  (store.profiles||[]).forEach(function(p){
    var d = document.createElement("div");
    d.className = "face";
    d.innerHTML = "<span class='av'>"+(p.avatar||"\ud83c\udfee")+"</span>"+escapeHtml(p.name);
    d.onclick = function(){ pickPlayer(p); };
    grid.appendChild(d);
  });
}
function pickPlayer(p){
  if (p.pin) {
    var pin = window.prompt("PIN for "+p.name);
    if (pin !== p.pin) { toast("PIN did not match"); return; }
  }
  store.activeId = p.id;
  saveStore();
  showHome();
}
function showCreateProfile(){
  showScreen("screen-create");
  var box = document.getElementById("avatar-choices");
  box.innerHTML = "";
  box.dataset.selected = AVATARS[0];
  AVATARS.forEach(function(a,i){
    var s = document.createElement("span");
    s.textContent = a;
    if (i===0) s.className = "on";
    s.onclick = function(){
      box.dataset.selected = a;
      box.querySelectorAll("span").forEach(function(x){ x.className=""; });
      s.className = "on";
    };
    box.appendChild(s);
  });
}
function createProfile(){
  var name = document.getElementById("new-name").value.trim() || "Field walker";
  var avatar = document.getElementById("avatar-choices").dataset.selected || "\ud83c\udfee";
  var pin = (document.getElementById("new-pin") && document.getElementById("new-pin").value.trim()) || "";
  var username = slugName(name);
  var id = "u-"+username;
  if ((store.profiles||[]).some(function(p){ return p.username === username; })) {
    toast("That name is already here. Tap the face or Find.");
    return;
  }
  function finish(family){
    if (family) store.familyCode = family;
    store.profiles.push({ id:id, name:name, avatar:avatar, username:username, pin:pin, created: Date.now() });
    store.activeId = id;
    store.progress[id] = {};
    store.fun[id] = { stars:0, mute:false, questDay:"", questN:0 };
    seedIntroduced();
    if (typeof ensureFamily === "function") ensureFamily();
    saveStore();
    toast("Welcome, "+name);
    setTimeout(showHome, 400);
  }
  if (typeof findAnyYomplePerson === "function") {
    findAnyYomplePerson(username).then(function(hit){
      if (hit && hit.table === YOMPLE_TABLE) {
        toast("That name is already saved. Use Find.");
        return;
      }
      if (hit && hit.row) {
        store.familyCode = hit.row.family_code || store.familyCode;
        finish(hit.row.family_code);
        return;
      }
      finish();
    });
  } else finish();
}
function seedIntroduced(){
  var order = store.lastFirst ? INTRO_LAST_FIRST : INTRO_DEFAULT;
  var prog = getProg();
  var n = 0;
  order.forEach(function(id){
    if (n>=3) return;
    if (!prog[id]) {
      prog[id] = { state:0, consec:0, introduced:true, last:0 };
      n++;
    }
  });
}
function showHome(){
  stopListen(); stopSpeak();
  if (!getActiveProfile()) { showProfiles(); return; }
  showScreen("screen-home");
  var p = getActiveProfile();
  document.getElementById("current-kid-badge").innerHTML = (p.avatar||"\ud83c\udfee")+" "+escapeHtml(p.name);
  document.getElementById("star-count").textContent = getFun().stars || 0;
  renderSoundChip();
  renderField();
  paintNext();
  paintQuest();
}
function renderSoundChip(){
  var el = document.getElementById("sound-chip");
  if (el) el.textContent = getFun().mute ? "\ud83d\udd07" : "\ud83d\udd0a";
}
function toggleSound(){
  var f = getFun();
  f.mute = !f.mute;
  saveStore();
  renderSoundChip();
  if (f.mute) stopSpeak();
}
function renderField(){
  var box = document.getElementById("field");
  box.innerHTML = "";
  var shining = 0;
  PHRASES.forEach(function(ph){
    var st = itemState(ph.id);
    var d = document.createElement("div");
    var cls = "lantern";
    if (!st.introduced && st.state===0) cls += " new";
    if (st.state===1) cls += " s1";
    if (st.state===2) cls += " s2";
    if (st.state===3) { cls += " s3"; shining++; }
    d.className = cls;
    d.innerHTML = "<div class='pic'>"+ph.pic+"</div><div class='no'>"+ph.n+"</div>";
    d.onclick = function(){
      if (!st.introduced && st.state===0) { toast("That lantern is still ahead."); return; }
      startLook(ph.id, true);
    };
    box.appendChild(d);
  });
  var mon = document.getElementById("monument");
  if (shining >= 10) mon.textContent = "The little monument is shining.";
  else if (shining >= 4) mon.textContent = "The path is getting brighter.";
  else mon.textContent = "Twelve lanterns. One quiet field.";
}
function cookingIds(){
  return PHRASES.map(function(ph){ return ph.id; }).filter(function(id){
    var st = itemState(id);
    return st.introduced || st.state > 0;
  });
}
function nextNewId(){
  var order = store.lastFirst ? INTRO_LAST_FIRST : PHRASES.map(function(p){ return p.id; });
  if (!store.lastFirst) {
    var pref = INTRO_DEFAULT.slice();
    PHRASES.forEach(function(p){ if (pref.indexOf(p.id)<0) pref.push(p.id); });
    order = pref;
  }
  for (var i=0;i<order.length;i++){
    var st = itemState(order[i]);
    if (!st.introduced && st.state===0) return order[i];
  }
  return null;
}
function pickDue(){
  var now = Date.now();
  var due = cookingIds().filter(function(id){
    var st = itemState(id);
    if (st.state>=3) return (now - (st.last||0)) > 1000*60*60*20;
    if (st.state===2) return (now - (st.last||0)) > 1000*60*30;
    return true;
  });
  if (!due.length) due = cookingIds();
  due.sort(function(a,b){ return (itemState(a).last||0) - (itemState(b).last||0); });
  return due[0] || nextNewId();
}
function countStates(){
  var c = {0:0,1:0,2:0,3:0};
  PHRASES.forEach(function(ph){ c[itemState(ph.id).state]++; });
  return c;
}
function paintNext(){
  var why = document.getElementById("next-why");
  var btn = document.getElementById("next-btn");
  var cooking = cookingIds();
  var fresh = cooking.filter(function(id){ return itemState(id).state===0 && itemState(id).introduced; });
  var practicing = cooking.filter(function(id){ return itemState(id).state===1; });
  if (fresh.length) {
    why.textContent = "Look at this lantern. Hear it. Then hide the words.";
    btn.textContent = "Look";
    btn.onclick = function(){ startLook(fresh[0], false); };
    return;
  }
  if (cooking.length < 3 && nextNewId()) {
    why.textContent = "A new lantern is ready on the path.";
    btn.textContent = "Light the next lantern";
    btn.onclick = function(){ startLook(nextNewId(), false); };
    return;
  }
  if (practicing.length && cooking.filter(function(id){ return itemState(id).state>=1; }).length >= 4) {
    why.textContent = "Mix two lanterns. Which one comes first on the path?";
    btn.textContent = "Mix";
    btn.onclick = startMix;
    if ((Date.now() % 3) !== 0) {
      var due = pickDue();
      why.textContent = "Say the next lantern from memory.";
      btn.textContent = "Echo";
      btn.onclick = function(){ startEcho(due); };
    }
    return;
  }
  var due = pickDue();
  if (due) {
    why.textContent = "Hide the words and say this lantern.";
    btn.textContent = "Echo";
    btn.onclick = function(){ startEcho(due); };
    return;
  }
  why.textContent = "Walk the field in order.";
  btn.textContent = "Walk";
  btn.onclick = startWalk;
}
function paintQuest(){
  var el = document.getElementById("daily-quest");
  var f = getFun();
  var day = new Date().toISOString().slice(0,10);
  if (f.questDay !== day) { f.questDay = day; f.questN = 0; saveStore(); }
  el.textContent = "Today: light " + Math.min(f.questN,3) + " of 3 lanterns.";
}
function startLook(id, review){
  currentPhrase = phraseById(id);
  if (!currentPhrase) return;
  var st = itemState(id);
  if (!st.introduced) setItem(id, { introduced:true, state: Math.max(st.state,0) });
  showScreen("screen-look");
  document.getElementById("look-card").innerHTML =
    "<div class='kicker'>Lantern "+currentPhrase.n+"</div>"+
    "<div class='pic-hero'>"+currentPhrase.pic+"</div>"+
    "<p class='scene'>"+currentPhrase.scene+"</p>"+
    "<p class='phrase' id='look-text'>"+escapeHtml(currentPhrase.text)+"</p>"+
    "<p class='why'><strong>Why this line.</strong> "+currentPhrase.why+"</p>"+
    "<p class='gesture'><strong>A small gesture.</strong> "+currentPhrase.gesture+"</p>";
  document.getElementById("btn-hear").onclick = function(){ speakText(currentPhrase.text); };
  document.getElementById("btn-got-it").onclick = function(){
    var s = itemState(id);
    if (s.state===0) setItem(id, { state:1, consec:0, introduced:true });
    startEcho(id);
  };
  if (!review) speakText(currentPhrase.text);
}
function startEcho(id){
  currentPhrase = phraseById(id) || currentPhrase;
  if (!currentPhrase) return;
  currentMode = "echo";
  showScreen("screen-echo");
  var hide = true;
  var card = document.getElementById("echo-card");
  function paint(hidden){
    card.innerHTML =
      "<div class='kicker'>Echo \u00b7 lantern "+currentPhrase.n+"</div>"+
      "<div class='pic-hero'>"+currentPhrase.pic+"</div>"+
      "<p class='hint'>"+currentPhrase.hook+"</p>"+
      "<p class='phrase "+(hidden?"hidden":"")+"' id='echo-text'>"+escapeHtml(currentPhrase.text)+"</p>"+
      "<div id='heard-box' class='heard'>Mic is optional. You can also tap I said it.</div>";
  }
  paint(true);
  document.getElementById("btn-peek").onclick = function(){ hide = !hide; paint(hide); };
  document.getElementById("btn-hear-echo").onclick = function(){ speakText(currentPhrase.text); };
  document.getElementById("btn-said").onclick = function(){ markHit(currentPhrase.id, true); };
  var speakBtn = document.getElementById("btn-speak");
  if (!voiceSupported) {
    speakBtn.style.display = "none";
  } else {
    speakBtn.style.display = "";
    speakBtn.onclick = function(){
      document.getElementById("heard-box").innerHTML = "<span class='mic-dot'></span>Listening\u2026 say the lantern.";
      listenOnce(currentPhrase.text, function(sc){
        var box = document.getElementById("heard-box");
        if (!sc.heard) { box.textContent = "Did not catch that. Try another way, or tap I said it."; return; }
        box.textContent = "Heard: " + sc.heard + (sc.ok ? " \u2014 that was the lantern." : " \u2014 close. Peek, then try another way.");
        if (sc.ok) markHit(currentPhrase.id, true);
        else markHit(currentPhrase.id, false);
      });
    };
  }
}
function startWalk(){
  stopListen();
  var known = PHRASES.filter(function(ph){ return itemState(ph.id).introduced || itemState(ph.id).state>0; });
  if (!known.length) { toast("Light a lantern first."); return; }
  var i = 0;
  function step(){
    currentPhrase = known[i];
    showScreen("screen-walk");
    document.getElementById("walk-card").innerHTML =
      "<div class='kicker'>Walk \u00b7 "+(i+1)+" of "+known.length+"</div>"+
      "<div class='pic-hero'>"+currentPhrase.pic+"</div>"+
      "<p class='hint'>What does this lantern say?</p>"+
      "<p class='phrase hidden' id='walk-text'>"+escapeHtml(currentPhrase.text)+"</p>"+
      "<div class='btn-row'>"+
        "<button class='btn' id='w-peek'>Peek</button>"+
        "<button class='btn sage' id='w-said'>I said it</button>"+
        (voiceSupported ? "<button class='btn primary' id='w-speak'>Speak</button>" : "")+
      "</div>"+
      "<div id='heard-box' class='heard'></div>";
    document.getElementById("w-peek").onclick = function(){
      document.getElementById("walk-text").classList.toggle("hidden");
    };
    document.getElementById("w-said").onclick = function(){ markHit(currentPhrase.id, true); next(); };
    var sp = document.getElementById("w-speak");
    if (sp) sp.onclick = function(){
      document.getElementById("heard-box").innerHTML = "<span class='mic-dot'></span>Listening\u2026";
      listenOnce(currentPhrase.text, function(sc){
        document.getElementById("heard-box").textContent = sc.heard ? ("Heard: "+sc.heard) : "Try another way.";
        markHit(currentPhrase.id, !!sc.ok);
        if (sc.ok) next();
      });
    };
  }
  function next(){
    i++;
    if (i >= known.length) { toast("The path is walked."); showHome(); return; }
    step();
  }
  step();
}
function startMix(){
  var known = PHRASES.filter(function(ph){ return itemState(ph.id).state>=1; });
  if (known.length < 2) { toast("Echo a couple of lanterns first."); startEcho(pickDue()); return; }
  var a = known[Math.floor(Math.random()*known.length)];
  var b = known[Math.floor(Math.random()*known.length)];
  var guard = 0;
  while (b.id===a.id && guard++<8) b = known[Math.floor(Math.random()*known.length)];
  if (b.id===a.id) { startEcho(a.id); return; }
  mixSet = [a,b].sort(function(){ return Math.random()-0.5; });
  var first = a.n < b.n ? a : b;
  showScreen("screen-mix");
  document.getElementById("mix-card").innerHTML =
    "<div class='kicker'>Which lantern comes first?</div>"+
    "<div class='stones'></div>";
  var stones = document.querySelector("#mix-card .stones");
  mixSet.forEach(function(ph){
    var s = document.createElement("button");
    s.className = "stone";
    s.textContent = ph.pic + "  " + ph.hook;
    s.onclick = function(){
      if (ph.id === first.id) {
        s.classList.add("good");
        markHit(ph.id, true);
        toast("That one is earlier on the path.");
        setTimeout(showHome, 700);
      } else {
        toast("Try the other way. Listen for the path order.");
        markHit(ph.id, false);
      }
    };
    stones.appendChild(s);
  });
}
function markHit(id, ok){
  var st = itemState(id);
  var f = getFun();
  if (ok) {
    var consec = (st.consec||0)+1;
    var state = st.state||0;
    if (state===0) state = 1;
    if (consec>=2 && state<2) state = 2;
    if (consec>=3 && state<3) state = 3;
    setItem(id, { state:state, consec:consec, introduced:true });
    f.stars = (f.stars||0)+1;
    var day = new Date().toISOString().slice(0,10);
    if (f.questDay !== day) { f.questDay = day; f.questN = 0; }
    f.questN = (f.questN||0)+1;
    saveStore();
    if (state===3 && consec===3) toast("That lantern is shining.");
  } else {
    setItem(id, { consec:0, introduced:true, state: Math.max(st.state||0, 1) });
  }
}
function showHowTo(){
  showScreen("screen-howto");
}
function showParent(){
  showScreen("screen-parent");
  var c = countStates();
  document.getElementById("stats-text").innerHTML =
    "<p><strong>"+(getActiveProfile()&&getActiveProfile().name || "")+"</strong></p>"+
    "<p>New / waiting: "+c[0]+"<br>Practicing: "+c[1]+"<br>Getting solid: "+c[2]+"<br>Shining: "+c[3]+"</p>"+
    "<p>Stars collected: "+(getFun().stars||0)+"</p>"+
    "<p>Voice check is "+(voiceSupported?"available in this browser.":"not available here \u2014 tap I said it instead.")+"</p>";
  var tog = document.getElementById("last-first");
  if (tog) tog.checked = !!store.lastFirst;
  if (typeof paintFamilyPanel === "function") paintFamilyPanel();
}
function toggleLastFirst(){
  store.lastFirst = !!(document.getElementById("last-first") && document.getElementById("last-first").checked);
  saveStore();
  toast(store.lastFirst ? "New lanterns start near the last paragraph." : "New lanterns start with short lines plus Four score.");
}
function resetProgress(){
  if (!pid()) return;
  store.progress[pid()] = {};
  store.fun[pid()] = { stars:0, mute:getFun().mute, questDay:"", questN:0 };
  seedIntroduced();
  saveStore();
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return ({ "&":"&","<":"<",">":">","\"":""","'":"&#39;" })[c];
  });
}

loadStore();
if (store.activeId && getActiveProfile()) showHome();
else showProfiles();
