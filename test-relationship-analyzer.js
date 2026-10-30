/**
 * test-relationship-analyzer.js
 * Comprehensive Test Suite for AI Relationship Analyzer
 * Tests: Parsers, Redaction, Deterministic Statistics, Algorithmic Insights, Store & UI Markup
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

console.log('--- Starting Complete AI Relationship Analyzer Verification 💗 ---');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failedTests++;
  }
}

// 1. Modules existence
const chatParsers = require('./js/chat-parsers');
const statsEngine = require('./js/relationship-statistics');
const analyzerAI = require('./relationship-analyzer-ai');
const analyzerStore = require('./analyzer-store');

assert(typeof chatParsers.parseWhatsAppTxt === 'function', 'chat-parsers exports parseWhatsAppTxt');
assert(typeof chatParsers.parseWhatsAppZip === 'function', 'chat-parsers exports parseWhatsAppZip');
assert(typeof chatParsers.parseInstagramJson === 'function', 'chat-parsers exports parseInstagramJson');
assert(typeof chatParsers.parseInstagramHtml === 'function', 'chat-parsers exports parseInstagramHtml');
assert(typeof chatParsers.parseGenericJson === 'function', 'chat-parsers exports parseGenericJson');
assert(typeof chatParsers.parseCsvChat === 'function', 'chat-parsers exports parseCsvChat');
assert(typeof chatParsers.parseGmailExport === 'function', 'chat-parsers exports parseGmailExport');
assert(typeof chatParsers.redactText === 'function', 'chat-parsers exports redactText');

// 2. WhatsApp TXT Parser Testing
const waSample = `[12/02/2026, 10:00:00 AM] Messages and calls are end-to-end encrypted.
[12/02/2026, 10:05:00 AM] Dudu: Good morning love! How are you today?
Line 2 of multiline thought!
[12/02/2026, 10:08:00 AM] Budu: Good morning sweetheart! I am doing great 🥰
[12/02/2026, 10:10:00 AM] Dudu: <Media omitted>
[12/02/2026, 10:15:00 AM] Budu: This message was deleted
[13/02/2026, 14:00:00 PM] Dudu: I am so sorry for the delay! Work was busy.
[13/02/2026, 14:05:00 PM] Budu: Don't worry at all love! You got this! 💗`;

const waParsed = chatParsers.parseWhatsAppTxt(waSample);
assert(waParsed.success === true, 'WhatsApp TXT parsed successfully');
assert(waParsed.messages.length === 4, 'WhatsApp TXT correctly filtered out encryption note, deleted msg, and media omission (4 real messages remain)');
assert(waParsed.participants.includes('Dudu') && waParsed.participants.includes('Budu'), 'WhatsApp TXT accurately extracted participants Dudu & Budu');
assert(waParsed.messages[0].text.includes('Line 2 of multiline'), 'WhatsApp TXT preserved multi-line message content');

// 3. WhatsApp Hyphen Format
const waHyphen = `15/02/2026, 11:30 - Luna: Happy Anniversary Oliver! 💕
15/02/2026, 11:32 - Oliver: Happy Anniversary my queen! 💐`;
const waHyphenParsed = chatParsers.parseWhatsAppTxt(waHyphen);
assert(waHyphenParsed.success === true && waHyphenParsed.messages.length === 2, 'WhatsApp hyphen date-time format parsed accurately');

// 4. WhatsApp In-Memory ZIP Archive Testing
function createTestZipBuffer(fileName, content) {
  const contentBytes = Buffer.from(content, 'utf8');
  const compData = zlib.deflateRawSync(contentBytes);

  const nameBytes = Buffer.from(fileName, 'utf8');
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0); // PK\x03\x04
  header.writeUInt16LE(20, 4); // version needed
  header.writeUInt16LE(0, 6); // flags
  header.writeUInt16LE(8, 8); // compression method (deflate)
  header.writeUInt16LE(0, 10); // time
  header.writeUInt16LE(0, 12); // date
  header.writeUInt32LE(0, 14); // crc32
  header.writeUInt32LE(compData.length, 18); // compressed size
  header.writeUInt32LE(contentBytes.length, 22); // uncompressed size
  header.writeUInt16LE(nameBytes.length, 26); // file name length
  header.writeUInt16LE(0, 28); // extra field length

  return Buffer.concat([header, nameBytes, compData]);
}

(async () => {
  const zipBuf = createTestZipBuffer('_chat.txt', waSample);
  const zipParsed = await chatParsers.parseWhatsAppZip(zipBuf);
  assert(zipParsed.success === true, 'WhatsApp ZIP export decompressed and parsed successfully');
  assert(zipParsed.messages.length === 4, 'WhatsApp ZIP parsed correct message count');

  // 5. Instagram JSON Testing
  const igJson = {
    participants: [{ name: 'Luna' }, { name: 'Oliver' }],
    messages: [
      { sender_name: 'Oliver', timestamp_ms: 1770000200000, content: 'Can not wait to see you tonight! 🌹' },
      { sender_name: 'Luna', timestamp_ms: 1770000100000, content: 'Excited for dinner date! 🥰' }
    ]
  };
  const igParsed = chatParsers.parseInstagramJson(igJson);
  assert(igParsed.success === true, 'Instagram JSON parsed successfully');
  assert(igParsed.messages.length === 2, 'Instagram JSON extracted 2 messages in chronological order');
  assert(igParsed.messages[0].sender === 'Luna' && igParsed.messages[1].sender === 'Oliver', 'Instagram JSON sorted chronologically');

  // 6. CSV & Generic JSON Testing
  const csvSample = `timestamp,sender,message\n2026-02-14 10:00:00,Dudu,"Happy Valentine's day!"\n2026-02-14 10:02:00,Budu,"Love you too bear!"`;
  const csvParsed = chatParsers.parseCsvChat(csvSample);
  assert(csvParsed.success === true && csvParsed.messages.length === 2, 'CSV chat format parsed successfully');

  // 7. Privacy Redaction Testing
  const secretText = 'Call me at +1 555-123-4567 or email us at secret_couple@love.com! Check https://ouruniverse.love';
  const redacted = chatParsers.redactText(secretText, { redactPhone: true, redactEmail: true, redactUrls: true });
  assert(!redacted.includes('555-123-4567'), 'Privacy redaction masked phone numbers');
  assert(!redacted.includes('secret_couple@love.com'), 'Privacy redaction masked email addresses');
  assert(!redacted.includes('https://ouruniverse.love'), 'Privacy redaction masked URLs');
  assert(redacted.includes('[PHONE REDACTED]') && redacted.includes('[EMAIL REDACTED]'), 'Privacy redaction applied standard redaction tokens');

  // 8. Deterministic Statistics Engine Testing
  const stats = statsEngine.calculateStatistics(waParsed.messages, { partnerA: 'Dudu', partnerB: 'Budu' });
  assert(stats.totalMessages === 4, 'Stats engine calculated exact total message count (4)');
  assert(stats.partnerA.count === 2 && stats.partnerB.count === 2, 'Stats engine split messages evenly (2 for Dudu, 2 for Budu)');
  assert(stats.partnerA.percentage === 50 && stats.partnerB.percentage === 50, 'Stats engine calculated accurate 50-50 share');
  assert(stats.activeDays === 2, 'Stats engine identified 2 distinct active calendar days');
  assert(stats.dualActiveDays === 2, 'Stats engine identified 2 days where both partners sent messages');
  assert(stats.initiations.partnerA === 2, 'Stats engine identified 2 conversation sessions initiated by Dudu (>4h gap)');
  assert(stats.sentiment.positiveCount >= 2, 'Stats engine identified positive emotional expressions');
  assert(stats.sentiment.apologyCount >= 1, 'Stats engine identified apology expressions');
  assert(stats.sentiment.supportCount >= 1, 'Stats engine identified supportive affirmations');

  // 9. Algorithmic Insights Testing (Safe, non-blaming romantic heuristics)
  const insights = statsEngine.generateAlgorithmicInsights(stats, 'Dudu', 'Budu');
  assert(typeof insights.summary === 'string' && insights.summary.length > 20, 'Insights engine generated warm summary');
  assert(insights.partnerAInsights.name === 'Dudu', 'Partner A insights mapped to Dudu');
  assert(insights.partnerBInsights.name === 'Budu', 'Partner B insights mapped to Budu');
  assert(insights.partnerAInsights.appreciation.length > 0, 'Partner A has specific appreciation points');
  assert(insights.partnerBInsights.appreciation.length > 0, 'Partner B has specific appreciation points');
  assert(insights.conflictEvents.length >= 2, 'Insights engine produced constructive conflict resolution scenarios');
  assert(insights.conflictEvents[0].constructiveDialogueExample.length > 10, 'Scenario includes constructive alternative dialogue example');
  assert(insights.sharedImprovementPlan.length >= 3, 'Shared improvement plan has concrete relationship agreements');

  // 10. Server Store & Check-in Testing
  const reportSaveResult = analyzerStore.saveReport('test_user_123', { stats, insights });
  assert(reportSaveResult.success === true, 'analyzerStore saved relationship report successfully');
  const loadedReport = analyzerStore.getReport('test_user_123');
  assert(loadedReport !== null && loadedReport.stats.totalMessages === 4, 'analyzerStore retrieved saved relationship report');

  const checkInResult = analyzerStore.saveCheckIn('test_user_123', {
    harmonyRating: 5,
    celebration: 'Loved cooking pasta together!',
    growthGoal: 'Sending quick heads-up during meetings'
  });
  assert(checkInResult.success === true, 'analyzerStore logged weekly check-in successfully');
  const allCheckIns = analyzerStore.getCheckIns('test_user_123');
  assert(allCheckIns.length === 1 && allCheckIns[0].harmonyRating === 5, 'analyzerStore retrieved logged check-in history');

  const deleteResult = analyzerStore.deleteReport('test_user_123');
  assert(deleteResult.success === true, 'analyzerStore successfully purged user report and check-ins');
  assert(analyzerStore.getReport('test_user_123') === null, 'Verified user report is completely wiped after delete');

  // 11. Analyzer AI Status Testing
  const aiStatus = analyzerAI.getAIStatus();
  assert(typeof aiStatus.configured === 'boolean', 'analyzerAI getAIStatus returned configured flag');
  assert(typeof aiStatus.message === 'string', 'analyzerAI getAIStatus returned informative status message');

  // 12. Markup Verification in analyzer.html
  const analyzerHtmlPath = path.join(__dirname, 'analyzer.html');
  assert(fs.existsSync(analyzerHtmlPath), 'analyzer.html exists');
  const analyzerHtml = fs.readFileSync(analyzerHtmlPath, 'utf8');

  assert(analyzerHtml.includes('Our Relationship Insights 💗'), 'analyzer.html contains exact title "Our Relationship Insights 💗"');
  assert(analyzerHtml.includes('Understand your communication, celebrate your efforts, and grow together.'), 'analyzer.html contains exact subtitle');
  assert(analyzerHtml.includes('id="chat-dropzone"'), 'analyzer.html includes chat dropzone');
  assert(analyzerHtml.includes('id="btn-load-demo-chat"'), 'analyzer.html includes 1-click sample demo chat loader');
  assert(analyzerHtml.includes('id="select-partner-a"') && analyzerHtml.includes('id="select-partner-b"'), 'analyzer.html includes participant selectors');
  assert(analyzerHtml.includes('id="consent-agreement"'), 'analyzer.html includes informed consent agreement checkbox');
  assert(analyzerHtml.includes('id="consent-redact"'), 'analyzer.html includes personal info redaction checkbox');
  assert(analyzerHtml.includes('id="stat-total-messages"'), 'analyzer.html includes relationship statistics grid');
  assert(analyzerHtml.includes('id="bar-msgs-a"') && analyzerHtml.includes('id="bar-msgs-b"'), 'analyzer.html includes communication balance visual meter');
  assert(analyzerHtml.includes('id="section-positive"'), 'analyzer.html includes positive moments section');
  assert(analyzerHtml.includes('id="card-partner-a"') && analyzerHtml.includes('id="card-partner-b"'), 'analyzer.html includes separate partner needs cards');
  assert(analyzerHtml.includes('id="section-conflict"'), 'analyzer.html includes "What Could Both Partners Improve?" conflict section');
  assert(analyzerHtml.includes('id="section-plan"'), 'analyzer.html includes personalized improvement plan');
  assert(analyzerHtml.includes('id="section-checkin"'), 'analyzer.html includes weekly check-in progress tracker');
  assert(analyzerHtml.includes('id="btn-export-report"'), 'analyzer.html includes export report button');
  assert(analyzerHtml.includes('id="btn-delete-analysis"'), 'analyzer.html includes delete all data button');

  // Dead link check for analyzer.html
  const deadLinkRegex = /href=["']#["']/i;
  assert(!deadLinkRegex.test(analyzerHtml), 'analyzer.html has no dead href="#" links');

  console.log(`\n======================================================`);
  console.log(`SUMMARY: ${passedTests} passed, ${failedTests} failed.`);
  console.log(`======================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL AI RELATIONSHIP ANALYZER VERIFICATIONS PASSED 100%! 💗');
  }
})();
