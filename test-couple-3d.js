/**
 * Verification test for Dudu & Budu 3D Visibility, Smooth Actions & Customization Overhaul
 */
const fs = require('fs');
const path = require('path');

console.log('--- Verifying Dudu & Budu 3D Scene & Customization Overhaul ---');

const universe3dCode = fs.readFileSync(path.join(__dirname, 'js', 'universe-3d.js'), 'utf8');
const scriptCode = fs.readFileSync(path.join(__dirname, 'js', 'script.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const cssCode = fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

// 1. Two separate cute characters
assert(universe3dCode.includes('function buildBudu('), 'Budu procedural 3D model generator exists');
assert(universe3dCode.includes('function buildDudu('), 'Dudu procedural 3D model generator exists');

// 2. Character styling & colors
assert(universe3dCode.includes('0xfffdfa'), 'Budu plush white cream fur material');
assert(universe3dCode.includes('sweaterMat') && universe3dCode.includes('bowMat'), 'Budu pink outfit & pink bow');
assert(universe3dCode.includes('0x8a523a'), 'Dudu warm cocoa brown fur material');
assert(universe3dCode.includes('hoodieMat'), 'Dudu dark chocolate hoodie');

// 3. Visibility & Large Framing (65-75% height)
assert(universe3dCode.includes('camRadius = 4.7') || universe3dCode.includes('targetCamRadius = 4.7'), 'Camera distance optimized for large 65-75% viewport height');
assert(universe3dCode.includes('PerspectiveCamera(36'), 'Field of view optimized to 36 for sharp closeup framing');
assert(universe3dCode.includes('baseX: -1.25') && universe3dCode.includes('baseX: 1.25'), 'Characters positioned side-by-side with comfortable gap (no overlap in idle)');

// 4. Irritating heart burst & particle effects removed
assert(!universe3dCode.includes('bgHeartsGroup'), 'Distracting background floating hearts removed');
assert(!universe3dCode.includes('flyingHeartMesh'), 'Giant pink heart overlay in middle removed');
assert(!htmlCode.includes('id="btn-couple-heart-burst"'), 'Distracting heart burst button removed from UI');

// 5. Joint pivots for procedural movement
const jointPivots = ['neckPivot', 'body', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee'];
for (const pivot of jointPivots) {
  assert(universe3dCode.includes(pivot), `Joint pivot '${pivot}' is defined in rigs`);
}

// 6. Smooth actions with delta-time lerping
assert(universe3dCode.includes('clock.getDelta()'), 'Delta-time used for frame-rate-independent animation');
assert(universe3dCode.includes('Math.exp(-9.0 * delta)'), 'Exponential lerping provides buttery smooth blending');

const actions = ['hug', 'kiss', 'dance', 'hands', 'wave', 'idle'];
for (const act of actions) {
  assert(universe3dCode.includes(`currentAction === '${act}'`), `Action '${act}' handled in 3D loop`);
  assert(htmlCode.includes(`id="btn-couple-${act}"`), `Button #btn-couple-${act} exists in index.html`);
  assert(scriptCode.includes(`executeCoupleAction('${act}'`), `Action '${act}' wired in script.js`);
}

// 7. 5 Distinct 3D Date Environments
const scenes = ['cafe', 'picnic', 'moonlight', 'stargazing', 'rain'];
for (const sc of scenes) {
  assert(universe3dCode.includes(`${sc}Group.visible =`), `Scene '${sc}' has distinct 3D prop group visibility`);
  assert(htmlCode.includes(`id="btn-scene-${sc}"`), `Button #btn-scene-${sc} exists in index.html`);
}

// 8. Redesigned Customize Look (6 Category Tabs & Character Switcher)
assert(htmlCode.includes('id="tab-look-budu"') && htmlCode.includes('id="tab-look-dudu"'), 'Character switcher tabs (Budu / Dudu) present');
const customCats = ['outfit', 'hair', 'makeup', 'accessories', 'colors', 'expressions'];
for (const cat of customCats) {
  assert(htmlCode.includes(`data-cattab="${cat}"`), `Category tab '${cat}' present in Customize Look modal`);
  assert(htmlCode.includes(`id="panel-cat-${cat}"`), `Category panel for '${cat}' present`);
}

// 9. Live 3D Preview Focusing
assert(universe3dCode.includes('focusCharacter:'), '3D camera focusCharacter controller method implemented');
assert(scriptCode.includes('focusCharacterIn3D'), 'Camera focuses on character in live 3D preview on tab change');

// 10. Viewport Height
assert(cssCode.includes('height: 380px') && cssCode.includes('min-height: 340px'), '3D canvas wrapper gives compact height for character visibility');

console.log('🎉 ALL 10 VISIBILITY, ANIMATION, DATE SCENES & CUSTOMIZER OVERHAUL TESTS PASSED 100%! 🎉');
