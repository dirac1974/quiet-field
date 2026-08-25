/* Bliss copy, chunked for kids and a microphone. */
var PHRASES = [
  {
    id: "p1",
    n: 1,
    text: "Four score and seven years ago our fathers brought forth on this continent a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.",
    hook: "87 years before 1863",
    pic: "📜",
    scene: "A rolled parchment and a tiny 1776 flag on the first stone.",
    why: "Four score means four twenties — 80 — plus seven is 87. Count back from 1863 and you land on 1776, when the country was born.",
    gesture: "Hold up four fingers, then seven. Sweep your other hand wide for this continent.",
    keys: ["four","score","seven","fathers","continent","nation","liberty","proposition","equal"]
  },
  {
    id: "p2",
    n: 2,
    text: "Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure.",
    hook: "A test the country is taking",
    pic: "⚔️",
    scene: "Two toy soldiers facing each other across a cracked fence.",
    why: "Lincoln is asking if a country built on liberty can last when it is fighting itself.",
    gesture: "Press your palms together, then pull them apart like a tug.",
    keys: ["engaged","civil","war","testing","nation","conceived","dedicated","endure"]
  },
  {
    id: "p3",
    n: 3,
    text: "We are met on a great battle-field of that war.",
    hook: "They are standing in the field",
    pic: "🌾",
    scene: "A quiet field with a wooden fence and evening gold.",
    why: "Gettysburg was a real battle three months earlier. The speech happens on that ground.",
    gesture: "Plant both feet. Point down at the floor.",
    keys: ["met","great","battle","field","war"]
  },
  {
    id: "p4",
    n: 4,
    text: "We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live.",
    hook: "A resting place",
    pic: "🪨",
    scene: "A small stone marker under an oak.",
    why: "They came to set aside a cemetery for the soldiers who died so the country could keep going.",
    gesture: "Bow your head once, then stand tall.",
    keys: ["dedicate","portion","field","resting","place","lives","nation","live"]
  },
  {
    id: "p5",
    n: 5,
    text: "It is altogether fitting and proper that we should do this.",
    hook: "This is the right thing",
    pic: "✓",
    scene: "A calm nod. No extra objects.",
    why: "Lincoln says honoring the dead is simply the right and decent thing to do.",
    gesture: "One small nod.",
    keys: ["altogether","fitting","proper","should"]
  },
  {
    id: "p6",
    n: 6,
    text: "But, in a larger sense, we can not dedicate — we can not consecrate — we can not hallow — this ground.",
    hook: "Words cannot make the ground holy",
    pic: "🌍",
    scene: "Hands open over the dirt. The ground is already bigger than the speech.",
    why: "Dedicate, consecrate, and hallow all mean make this place special. Lincoln says our words are too small for that.",
    gesture: "Open both hands, then drop them to your sides.",
    keys: ["larger","sense","dedicate","consecrate","hallow","ground"]
  },
  {
    id: "p7",
    n: 7,
    text: "The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract.",
    hook: "The soldiers already did it",
    pic: "🛡️",
    scene: "A shield leaning on a tree. Living and remembered.",
    why: "The people who fought here already made the ground sacred. Speeches cannot add to that or take it away.",
    gesture: "Hand on heart, then point to the field.",
    keys: ["brave","living","dead","struggled","consecrated","power","add","detract"]
  },
  {
    id: "p8",
    n: 8,
    text: "The world will little note, nor long remember what we say here, but it can never forget what they did here.",
    hook: "Deeds last longer than speeches",
    pic: "🕊️",
    scene: "A bird lifting off a fence post.",
    why: "Lincoln thought the speech would be forgotten. He was wrong about that — but he was right that the soldiers’ courage is the main thing.",
    gesture: "Tap your lips, then tap your heart.",
    keys: ["world","note","remember","say","forget","did"]
  },
  {
    id: "p9",
    n: 9,
    text: "It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced.",
    hook: "The living still have work",
    pic: "🛠️",
    scene: "A hammer and a half-built stone wall.",
    why: "The soldiers started a job. People still alive have to finish keeping the country free and fair.",
    gesture: "Roll up one sleeve.",
    keys: ["living","dedicated","unfinished","work","fought","nobly","advanced"]
  },
  {
    id: "p10",
    n: 10,
    text: "It is rather for us to be here dedicated to the great task remaining before us —",
    hook: "A job still in front of us",
    pic: "🌄",
    scene: "A path continuing over a low hill.",
    why: "The great task is keeping the nation Lincoln described — liberty and equality — actually going.",
    gesture: "Point forward down the path.",
    keys: ["rather","dedicated","great","task","remaining","before"]
  },
  {
    id: "p11",
    n: 11,
    text: "that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion —",
    hook: "They gave everything",
    pic: "💛",
    scene: "A small gold heart on a stone.",
    why: "The last full measure of devotion means they gave their whole lives. We answer by caring more, not less.",
    gesture: "Both hands offer something forward, then rest on your heart.",
    keys: ["honored","dead","increased","devotion","cause","last","full","measure"]
  },
  {
    id: "p12",
    n: 12,
    text: "that we here highly resolve that these dead shall not have died in vain — that this nation, under God, shall have a new birth of freedom — and that government of the people, by the people, for the people, shall not perish from the earth.",
    hook: "Of, by, and for the people",
    pic: "🗽",
    scene: "Three open doors side by side, all leading to the same light.",
    why: "In vain means for nothing. Lincoln asks us to make sure the deaths meant something: a country that belongs to its people and does not disappear.",
    gesture: "Open arms wide on of the people, by the people, for the people.",
    keys: ["resolve","vain","nation","birth","freedom","government","people","perish","earth"]
  }
];

var INTRO_DEFAULT = ["p3","p5","p1"];
var INTRO_LAST_FIRST = ["p6","p7","p8","p12","p11","p10","p9","p3","p5","p4","p2","p1"];

function phraseById(id){
  for (var i=0;i<PHRASES.length;i++) if (PHRASES[i].id === id) return PHRASES[i];
  return null;
}
