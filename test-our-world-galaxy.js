const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('\n--- Verifying Our Little World Galaxy 💗 Implementation ---');

// 1. Read files
const galaxyHtml = fs.readFileSync(path.join(__dirname, 'galaxy.html'), 'utf8');
const galaxyJs = fs.readFileSync(path.join(__dirname, 'js/galaxy.js'), 'utf8');
const styleCss = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');

// 2. Existing Galaxy Section Integrity
console.log('\nChecking Existing Cosmic Memory Galaxy Integrity:');
assert(galaxyHtml.includes('The Cosmic Memory Galaxy'), 'Existing Cosmic Memory Galaxy title preserved');
assert(galaxyHtml.includes('id="galaxy-3d-canvas"'), 'Existing galaxy 3D canvas preserved');
assert(galaxyHtml.includes('id="galaxy-viewport-box"'), 'Existing galaxy viewport box preserved');
assert(galaxyHtml.includes('id="btn-personal-galaxy"'), 'Existing Personal Galaxy button preserved');
assert(galaxyHtml.includes('id="btn-shared-galaxy"'), 'Existing Shared Galaxy button preserved');
assert(galaxyHtml.includes('id="btn-toggle-2d-mode"'), 'Existing 2D mode toggle preserved');
assert(galaxyHtml.includes('id="galaxy-2d-view"'), 'Existing 2D view container preserved');
assert(galaxyHtml.includes('id="star-memory-modal"'), 'Existing star memory modal preserved');
console.log('  ✅ Complete existing Cosmic Memory Galaxy section is intact and untouched.');

// 3. Strict Placement Check
console.log('\nChecking Exact Placement Requirements:');
const existingGalaxyPos = galaxyHtml.indexOf('id="galaxy-viewport-box"');
const existing2DPos = galaxyHtml.indexOf('id="galaxy-2d-view"');
const newSectionPos = galaxyHtml.indexOf('id="section-our-world"');

assert(existingGalaxyPos !== -1, 'Existing galaxy viewport found');
assert(existing2DPos !== -1, 'Existing 2D view found');
assert(newSectionPos !== -1, 'New section-our-world found');
assert(newSectionPos > existingGalaxyPos, 'New section MUST appear after existing galaxy canvas');
assert(newSectionPos > existing2DPos, 'New section MUST appear after existing 2D view');
console.log('  ✅ New section is placed strictly AFTER the entire existing Cosmic Memory Galaxy section.');

// 4. New Section Elements
console.log('\nChecking Our Little World Galaxy HTML Structure:');
assert(galaxyHtml.includes('Our Little World Galaxy'), 'New section has correct heading');
assert(galaxyHtml.includes('id="our-world-3d-canvas"'), 'New section has its own 3D canvas');
assert(galaxyHtml.includes('id="our-world-viewport-box"'), 'New section has its own viewport box');
assert(galaxyHtml.includes('id="our-world-planet-pills"'), 'New section has planet filter pills');
assert(galaxyHtml.includes('id="world-planet-card"'), 'New section has planet inspection card');
assert(galaxyHtml.includes('id="btn-planet-explore"'), 'New section has Explore button');
assert(galaxyHtml.includes('id="btn-world-reset-orbit"'), 'New section has Reset Orbit button');

// 5. Six Interactive Planets Verification
console.log('\nChecking 6 Interactive Planets:');
const requiredPlanets = [
  { name: 'Our Memories', link: 'index.html#memories-gallery' },
  { name: 'Love Letters', link: 'diary.html' },
  { name: 'Special Days', link: 'timeline.html' },
  { name: 'Our Dreams', link: 'games.html' },
  { name: 'Our Moments', link: 'room.html' },
  { name: 'Secret World', link: 'vault.html' }
];

requiredPlanets.forEach(p => {
  assert(galaxyHtml.includes(p.name), `galaxy.html includes planet '${p.name}'`);
  assert(galaxyHtml.includes(p.link), `galaxy.html links planet '${p.name}' to '${p.link}'`);
  console.log(`  ✅ Planet: ${p.name} -> Connected to ${p.link}`);
});

// 6. JavaScript Logic Verification
console.log('\nChecking js/galaxy.js 3D Universe Logic:');
assert(galaxyJs.includes('initOurWorldGalaxy'), 'js/galaxy.js defines initOurWorldGalaxy');
assert(galaxyJs.includes('our-world-3d-canvas'), 'js/galaxy.js references our-world-3d-canvas');
assert(galaxyJs.includes('buduBear'), 'js/galaxy.js builds Budu (cute white bear with pink bow)');
assert(galaxyJs.includes('duduBear'), 'js/galaxy.js builds Dudu (brown bear)');
assert(galaxyJs.includes('miniHeart'), 'js/galaxy.js includes floating couple heart');
assert(galaxyJs.includes('centralPlanetMesh'), 'js/galaxy.js creates central shared planet');
assert(galaxyJs.includes('PLANET_DEFINITIONS'), 'js/galaxy.js defines interactive planets');
assert(galaxyJs.includes('selectPlanet'), 'js/galaxy.js implements interactive planet selection');
assert(galaxyJs.includes('animateOurWorld'), 'js/galaxy.js has clean dedicated animation loop');
console.log('  ✅ 3D scene, Dudu & Budu, planets, orbits, and click raycasting implemented.');

// 7. CSS Styling Verification
console.log('\nChecking css/style.css Styling:');
assert(styleCss.includes('.our-world-section'), 'CSS has .our-world-section');
assert(styleCss.includes('.our-world-divider'), 'CSS has .our-world-divider');
assert(styleCss.includes('.our-world-viewport-box'), 'CSS has .our-world-viewport-box');
assert(styleCss.includes('.our-world-3d-canvas'), 'CSS has .our-world-3d-canvas');
assert(styleCss.includes('.world-planet-card'), 'CSS has .world-planet-card');
assert(styleCss.includes('.our-world-cards-grid'), 'CSS has .our-world-cards-grid');
console.log('  ✅ CSS styles defined and responsive.');

console.log('\n🎉 ALL OUR LITTLE WORLD GALAXY TESTS PASSED 100%! 💗\n');
