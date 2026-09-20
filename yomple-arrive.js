/* Arriving from the hub, or from an address this app stamped for itself.

   Quiet Field was the one app in the household that read no URL at all: the hub's
   ?u=<name>&from=yomple&f=<CODE> was dropped on the floor and every visit started on the roster,
   even for a kid who had signed in a hundred times. This is the same handoff the sister apps run —
   the one in yomple/field, minus its read of the hub's own localStorage, which only works there
   because that copy is served from the same origin as the hub.

   Loaded after sync.js, so findAnyYomplePerson, yompleClaim, adoptPerson and applyCloudRow exist.
   A kid whose Yomple row has a PIN is asked for it once, by yompleClaim; a kid with no PIN set goes
   straight in. Either way it is one question, not a roster and then a question. */
function hubPerson(){
  var q = new URLSearchParams(location.search);
  // `u` is the hub's spelling and `who` the sister apps'; `f` and `family` likewise.
  var u = (q.get("u") || q.get("who") || "").trim();
  var f = (q.get("f") || q.get("family") || "").trim();
  if (!u && !f) return null;
  return { u: u, f: f, from: q.get("from") };
}
function hideFieldFind(){
  var card = document.getElementById("find-card") || document.querySelector("#screen-profiles .card");
  if (card) card.style.display = "none";
}
function consumeYompleHandoff(){
  var who = hubPerson();
  if (!who) return Promise.resolve(false);
  var f = String(who.f || "").trim().toUpperCase();
  // The household code is worth keeping even when nobody is named: it is what the parent panel and
  // the sister apps read, and re-asking for it is the whole complaint.
  if (f && f.indexOf("-") > 0) { store.familyCode = f; saveStore(); }
  if (!who.u) return Promise.resolve(false);
  var raw = String(who.u).trim();
  var username = (typeof slugName === "function" ? slugName(raw) : raw.toLowerCase());
  if (!username || username === "player") return Promise.resolve(false);
  window.YOMPLE_HANDSHAKE = true;
  window.YOMPLE_FROM_HUB = true;
  hideFieldFind();
  function land(){
    if (typeof showHome === "function") showHome();
    // Freeze the sign-in into the address bar, so a wiped phone reopening this link lands here.
    if (window.YompleStay) window.YompleStay.arrived(username, store.familyCode);
    return true;
  }
  var local = (store.profiles || []).find(function(p){
    return p.username === username || (typeof slugName === "function" && slugName(p.name) === username);
  });
  if (local) {
    store.activeId = local.id;
    if (!local.username) local.username = username;
    saveStore();
    return Promise.resolve(land());
  }
  var finder = (typeof findAnyYomplePerson === "function") ? findAnyYomplePerson(username) : Promise.resolve(null);
  return finder.then(function(hit){
    if (!hit || !hit.row) {
      if (typeof adoptPerson === "function") {
        adoptPerson({ username: username, display_name: raw, avatar: "🪔", family_code: store.familyCode || f }, {});
        if (typeof seedIntroduced === "function") seedIntroduced();
        if (typeof cloudSaveActive === "function") cloudSaveActive();
      }
      return land();
    }
    var claim = (typeof yompleClaim === "function") ? yompleClaim(hit.table, hit.row) : Promise.resolve(hit.row);
    return claim.then(function(row){
      // A refused PIN lands nowhere: the roster is still on screen and the kid can try again.
      if (!row) return false;
      if (hit.table === YOMPLE_TABLE && typeof applyCloudRow === "function") {
        applyCloudRow(row);
      } else if (typeof adoptPerson === "function") {
        adoptPerson(row, {});
        if (typeof seedIntroduced === "function") seedIntroduced();
        if (typeof cloudSaveActive === "function") cloudSaveActive();
      }
      return land();
    });
  }).catch(function(){
    // Offline, or the lookup failed: make the kid locally rather than stranding him on the roster.
    if (typeof adoptPerson === "function") {
      adoptPerson({ username: username, display_name: raw, family_code: store.familyCode || f }, {});
    }
    return land();
  });
}
if (typeof showProfiles === "function") {
  var _showProfilesField = showProfiles;
  showProfiles = function(){
    _showProfilesField();
    if (window.YOMPLE_HANDSHAKE || window.YOMPLE_FROM_HUB) hideFieldFind();
  };
}
// Whoever is signed in, the address bar says so, so that a bookmark or an Add to Home Screen icon
// taken at any moment comes back signed in. Stamping the same URL twice is a no-op.
if (typeof showHome === "function") {
  var _showHomeStay = showHome;
  showHome = function(){
    _showHomeStay();
    var me = typeof getActiveProfile === "function" ? getActiveProfile() : null;
    if (me && window.YompleStay) {
      window.YompleStay.stamp(me.username || (typeof slugName === "function" ? slugName(me.name) : ""), store.familyCode);
    }
  };
}
function startFieldHandoff(){
  consumeYompleHandoff();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startFieldHandoff);
} else {
  startFieldHandoff();
}
