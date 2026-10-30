const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const sectionMatches = [...html.matchAll(/<section[^>]*id="([^"]+)"[^>]*>/g)];
console.log('--- Sections in index.html ---');
sectionMatches.forEach(m => console.log('Section ID:', m[1]));

const h2Matches = [...html.matchAll(/<h2[^>]*class="([^"]*)"[^>]*>(.*?)<\/h2>/g)];
console.log('\n--- H2 headings ---');
h2Matches.forEach(m => console.log(m[2].replace(/<[^>]+>/g, '').trim()));
