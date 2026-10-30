const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'galaxy.html', 'games.html', 'room.html', 'shared.html', 'diary.html', 'timeline.html', 'studio.html', 'vault.html', 'analyzer.html'];

console.log('=== Checking Duplicate IDs in HTML Files ===');
htmlFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  const ids = [];
  const regex = /id=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  const counts = {};
  ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
  const dupes = Object.entries(counts).filter(([id, count]) => count > 1);
  if (dupes.length > 0) {
    console.log(`[!] ${file} has duplicate IDs:`, dupes);
  } else {
    console.log(`[OK] ${file} has no duplicate IDs`);
  }
});

console.log('\n=== Checking Duplicate Sections / Texts in galaxy.html ===');
const galaxyContent = fs.readFileSync('galaxy.html', 'utf8');
// check repeated classes or blocks
const lines = galaxyContent.split('\n');
console.log(`galaxy.html total lines: ${lines.length}`);

console.log('\n=== Checking Duplicate Root Files ===');
const rootFiles = fs.readdirSync('.');
const jsFiles = fs.readdirSync('js');
rootFiles.forEach(f => {
  if (jsFiles.includes(f)) {
    console.log(`[!] Duplicate filename in root and js/: ${f}`);
  }
});

const dataFiles = fs.existsSync('data') ? fs.readdirSync('data') : [];
dataFiles.forEach(f => {
  if (jsFiles.includes(f)) {
    console.log(`[!] Duplicate filename in data/ and js/: ${f}`);
  }
});
