const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n--- Testing 200-Question Couple Quiz System 💗 ---');

// 1. Check data files exist
const jsFile = path.join(__dirname, 'js', 'couple-quiz-questions.js');
const dataFile = path.join(__dirname, 'data', 'couple-quiz-questions.js');

assert(fs.existsSync(jsFile), 'js/couple-quiz-questions.js exists');
assert(fs.existsSync(dataFile), 'data/couple-quiz-questions.js exists');

const { QUIZ_CATEGORIES, COUPLE_QUIZ_QUESTIONS } = require(jsFile);

// 2. Total Count
console.log(`Total questions loaded: ${COUPLE_QUIZ_QUESTIONS.length}`);
assert.strictEqual(COUPLE_QUIZ_QUESTIONS.length, 200, 'Question bank must contain exactly 200 questions');

// 3. Category Counts
const EXPECTED_CATEGORIES = {
  favourite_things: { name: 'Favourite Things', count: 25 },
  personality_habits: { name: 'Personality & Daily Habits', count: 20 },
  interests_dreams: { name: 'Interests & Dreams', count: 20 },
  feelings_needs: { name: 'Feelings & Emotional Needs', count: 25 },
  insecurities_fears: { name: 'Insecurities & Fears', count: 15 },
  love_language: { name: 'Love Language & Affection', count: 20 },
  relationship_prefs: { name: 'Relationship Preferences', count: 25 },
  fun_random: { name: 'Fun & Random', count: 20 },
  future_together: { name: 'Future Together', count: 15 },
  deep_connection: { name: 'Deep Connection', count: 15 }
};

const counts = {};
const seenIds = new Set();
const seenTexts = new Set();

COUPLE_QUIZ_QUESTIONS.forEach((q, index) => {
  // Check unique ID
  assert(!seenIds.has(q.id), `Question ID must be unique: ${q.id} at index ${index}`);
  seenIds.add(q.id);

  // Check unique question text
  const cleanQ = q.question.toLowerCase().trim();
  assert(!seenTexts.has(cleanQ), `Question text must be unique: "${q.question}"`);
  seenTexts.add(cleanQ);

  // Category counts
  counts[q.category] = (counts[q.category] || 0) + 1;

  // Mandatory "Other" option check
  assert(Array.isArray(q.options) && q.options.length >= 2, `Question ${q.id} must have options array`);
  const hasOther = q.options.some(opt => opt.toLowerCase().includes('other'));
  assert(hasOther, `Question ${q.id} MUST include an 'Other' option`);
});

// Verify category counts match prompt specification
console.log('\nVerifying Category breakdown:');
Object.entries(EXPECTED_CATEGORIES).forEach(([key, meta]) => {
  const actual = counts[key] || 0;
  console.log(`  - ${meta.name}: ${actual} / ${meta.count}`);
  assert.strictEqual(actual, meta.count, `Category '${key}' must have exactly ${meta.count} questions`);
});

// 4. Insecurities & Fears marked as sensitive/optional
const sensitiveQs = COUPLE_QUIZ_QUESTIONS.filter(q => q.category === 'insecurities_fears');
assert(sensitiveQs.every(q => q.isSensitive === true), 'All Insecurities & Fears questions must be flagged isSensitive');

// 5. Verify HTML UI elements in games.html
console.log('\nVerifying games.html UI markup:');
const gamesHtml = fs.readFileSync(path.join(__dirname, 'games.html'), 'utf8');

const requiredElements = [
  'id="panel-who"',
  'id="who-question-box"',
  'id="who-counter"',
  'id="who-question-title"',
  'id="who-options-container"',
  'id="who-custom-input-box"',
  'id="who-custom-text"',
  'id="btn-submit-guess"',
  'id="btn-reveal-answer"',
  'id="btn-save-self"',
  'id="btn-skip-who"',
  'id="who-reveal-card"',
  'id="reveal-user-guess"',
  'id="reveal-actual-answer"',
  'id="reveal-result-badge"',
  'id="btn-accept-custom"',
  'id="btn-next-who"',
  'id="who-mode-guess"',
  'id="who-mode-self"',
  'id="who-active-player"',
  'id="who-category-filter"',
  'id="who-session-length"',
  'id="btn-manage-answers"',
  'id="who-scorecard-section"',
  'id="scorecard-categories-grid"',
  'id="who-answers-modal"',
  'couple-quiz-questions.js'
];

requiredElements.forEach(el => {
  assert(gamesHtml.includes(el), `games.html must contain ${el}`);
  console.log(`  ✅ games.html contains ${el}`);
});

// 6. Verify games.js logic handlers
console.log('\nVerifying games.js quiz logic implementations:');
const gamesJs = fs.readFileSync(path.join(__dirname, 'js', 'games.js'), 'utf8');

const requiredLogic = [
  'COUPLE_QUIZ_QUESTIONS',
  'btnSubmitGuess.addEventListener',
  'btnRevealAnswer.addEventListener',
  'btnSaveSelf.addEventListener',
  'btnAcceptCustom.addEventListener',
  'btnSkipWho.addEventListener',
  'btnNextWho.addEventListener',
  'normalizeAnswer',
  'showScorecard',
  'universe_quiz_answers',
  'universe_quiz_session'
];

requiredLogic.forEach(term => {
  assert(gamesJs.includes(term), `js/games.js must implement ${term}`);
  console.log(`  ✅ js/games.js contains ${term}`);
});

console.log('\n🎉 ALL 200-QUESTION COUPLE QUIZ CHECKS PASSED PERFECTLY! 💗\n');
