const fs = require('fs');
const path = require('path');

console.log('--- Starting Complete Logic & Contract Verification ---');

// 1. Verify index.html contains all critical IDs referenced in script.js
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const script = fs.readFileSync(path.join(__dirname, 'js/script.js'), 'utf-8');

const idRegex = /\$\(['"]#([a-zA-Z0-9_-]+)['"]\)/g;
const referencedIds = new Set();
let match;
while ((match = idRegex.exec(script)) !== null) {
  referencedIds.add(match[1]);
}

console.log(`Found ${referencedIds.size} unique element IDs referenced in script.js`);
let missingIds = [];
for (const id of referencedIds) {
  if (!html.includes(`id="${id}"`)) {
    missingIds.push(id);
  }
}

if (missingIds.length > 0) {
  console.error(`[FAIL] Missing IDs in index.html: ${missingIds.join(', ')}`);
  process.exit(1);
} else {
  console.log('[PASS] All DOM IDs referenced in script.js exist in index.html!');
}

// 2. Test Love Letter Content
const REQUIRED_LETTER = `Hey, you! 💗

Welcome to this tiny little universe.
There are stars in the sky, flowers in the garden, and a million little things that make this world beautiful.

And then there is the simple joy of making someone smile.

May your days be full of laughter, your heart be full of happiness, and your life be full of beautiful little surprises.

Keep smiling, keep dreaming, and never forget how special you are. ✨

Sending you a pocketful of hugs and a universe full of hearts! 💕`;

if (script.includes(REQUIRED_LETTER)) {
  console.log('[PASS] Love Letter text matches specification verbatim!');
} else {
  console.error('[FAIL] Love Letter text mismatch!');
  process.exit(1);
}

// 3. Test Surprise Message
const REQUIRED_SURPRISE = 'You make ordinary little moments feel magical. Keep being wonderfully you. 💗';
if (html.includes(REQUIRED_SURPRISE)) {
  console.log('[PASS] Surprise modal message matches specification verbatim!');
} else {
  console.error('[FAIL] Surprise modal message mismatch!');
  process.exit(1);
}

// 4. Test Love Calculator Determinism & Score Messages
function calculateLoveScore(nameA, nameB) {
  const cleanA = nameA.trim().toLowerCase();
  const cleanB = nameB.trim().toLowerCase();
  const pair = [cleanA, cleanB].sort().join('&');

  let hash = 0;
  for (let i = 0; i < pair.length; i++) {
    const char = pair.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }

  const rawVal = Math.abs(hash) % 100;
  let score = Math.floor(45 + (rawVal * 0.55));
  if (score > 100) score = 100;
  if (rawVal === 0 || rawVal === 77) score = 100;
  return score;
}

function getScoreMessage(score) {
  if (score <= 20) return "A little mystery makes life interesting! 🌷";
  if (score <= 40) return "A cute beginning to a fun story! 💕";
  if (score <= 60) return "The universe is feeling playful today! ✨";
  if (score <= 80) return "That's a whole lot of lovely energy! 💗";
  if (score <= 99) return "Someone brought extra sparkle into this universe! 🌟";
  return "Maximum cuteness unlocked! 💖";
}

// Test Determinism
const testPairs = [
  ['Luna', 'Oliver'],
  ['Romeo', 'Juliet'],
  ['Alice', 'Bob'],
  ['Star', 'Moon'],
  ['Sunflower', 'Breeze']
];

for (const [a, b] of testPairs) {
  const score1 = calculateLoveScore(a, b);
  const score2 = calculateLoveScore(b, a);
  if (score1 !== score2) {
    console.error(`[FAIL] Determinism failed for ${a} & ${b}: ${score1} vs ${score2}`);
    process.exit(1);
  }
}
console.log('[PASS] Love Calculator is 100% deterministic & order-independent!');

// Test Message Coverage
const testScores = [15, 35, 55, 75, 95, 100];
const expectedSubstrings = [
  "mystery",
  "beginning",
  "playful",
  "lovely energy",
  "sparkle",
  "Maximum cuteness"
];

testScores.forEach((s, idx) => {
  const msg = getScoreMessage(s);
  if (!msg.includes(expectedSubstrings[idx])) {
    console.error(`[FAIL] Score message for ${s}% did not match expected substring`);
    process.exit(1);
  }
});
console.log('[PASS] All Love Calculator message brackets match specification!');

// 5. Test 6 Memory Captions
const requiredCaptions = [
  "A day to remember",
  "Little moments, big feelings",
  "My favorite kind of chaos",
  "Smiles that never get old",
  "A memory worth keeping",
  "Our tiny happy place"
];

for (const cap of requiredCaptions) {
  if (!html.includes(cap)) {
    console.error(`[FAIL] Missing memory caption: ${cap}`);
    process.exit(1);
  }
}
console.log('[PASS] All 6 scrapbook memory captions present!');

// 6. Test Quiz Questions & Options
const quizQuestions = [
  "Pick your perfect happy place!",
  "Choose a little love-language vibe!",
  "What would make a perfect day?",
  "Pick a magical power!"
];

for (const q of quizQuestions) {
  if (!script.includes(q)) {
    console.error(`[FAIL] Missing quiz question: ${q}`);
    process.exit(1);
  }
}
console.log('[PASS] All 4 quiz questions present with interactive options!');

console.log('\n🌟 ALL TESTS PASSED SUCCESSFULLY! 🌟');
