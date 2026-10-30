/**
 * Our Little Universe - 3D Love Room Logic
 * Three.js 3D cozy room, chibi couple character animations, theme switcher, and sound effects.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Navigation & User Account Pill
  const userDisplayName = document.getElementById('user-display-name');
  const btnLogout = document.getElementById('btn-logout');
  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const navLinksMenu = document.getElementById('nav-links-menu');

  if (window.UniverseAuth) {
    const cached = window.UniverseAuth.getCachedUser();
    if (cached && cached.displayName && userDisplayName) {
      userDisplayName.textContent = cached.displayName;
    }
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      if (window.UniverseAuth) {
        await window.UniverseAuth.logout();
      } else {
        window.location.replace('login.html?logged_out=1');
      }
    });
  }

  if (navToggleBtn && navLinksMenu) {
    navToggleBtn.addEventListener('click', () => {
      const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
      navToggleBtn.setAttribute('aria-expanded', !isExpanded);
      navLinksMenu.classList.toggle('nav-open');
    });
  }

  // DOM Controls
  const canvas = document.getElementById('room-3d-canvas');
  const speechBubble = document.getElementById('room-speech-bubble');
  const speechText = document.getElementById('room-speech-text');
  const themeTabs = document.querySelectorAll('.room-theme-tab');
  const btnToggleLights = document.getElementById('btn-toggle-fairy-lights');
  const lightsStatusText = document.getElementById('lights-status-text');
  const btnToggleAudio = document.getElementById('btn-toggle-room-audio');
  const audioStatusText = document.getElementById('audio-status-text');
  const btnSaveRoom = document.getElementById('btn-save-room-settings');
  const btnPlayGramophone = document.getElementById('btn-play-gramophone');

  // Animation buttons
  const btnWave = document.getElementById('btn-room-wave');
  const btnHug = document.getElementById('btn-room-hug');
  const btnDance = document.getElementById('btn-room-dance');
  const btnHands = document.getElementById('btn-room-hands');
  const btnKiss = document.getElementById('btn-room-kiss');
  const btnBurst = document.getElementById('btn-room-burst');

  // Room State
  const state = {
    theme: 'pink-dream',
    fairyLightsOn: true,
    audioPlaying: false,
    currentAnimation: 'idle'
  };

  // --- 1. Three.js 3D Room Setup ---
  let scene, camera, renderer, animationFrameId;
  let roomGroup, chibiCoupleGroup, fairyLightsGroup, particlesGroup;
  let pointLight, ambientLight, spotLight;

  const THEME_COLORS = {
    'pink-dream': { bg: 0xfff0f6, floor: 0xffd1e3, walls: 0xffe3ee, light: 0xff8fa3, ambient: 0xffe8f2 },
    'lavender-night': { bg: 0x1f1635, floor: 0x3d2c5e, walls: 0x2b1e45, light: 0xb197fc, ambient: 0x473b68 },
    'moonlight': { bg: 0x0f172a, floor: 0x1e293b, walls: 0x141e33, light: 0x93c5fd, ambient: 0x334155 },
    'cozy-cafe': { bg: 0xfdfbf7, floor: 0xe8d5c4, walls: 0xf3e9dc, light: 0xffb703, ambient: 0xffedd5 },
    'starry-sky': { bg: 0x0a0518, floor: 0x241442, walls: 0x180b30, light: 0xf472b6, ambient: 0x3b1c6e }
  };

  function init3DRoom() {
    if (!canvas || typeof THREE === 'undefined') return;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 480;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(THEME_COLORS[state.theme].bg);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3, 7.5);
    camera.lookAt(0, 0.8, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Room Group
    roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Floor
    const floorGeo = new THREE.BoxGeometry(10, 0.2, 8);
    const floorMat = new THREE.MeshStandardMaterial({ color: THEME_COLORS[state.theme].floor, roughness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Back Wall
    const wallGeo = new THREE.BoxGeometry(10, 6, 0.2);
    const wallMat = new THREE.MeshStandardMaterial({ color: THEME_COLORS[state.theme].walls, roughness: 0.8 });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 2.9, -4);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Cute Pastel Heart Rug on Floor
    const rugGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.05, 32);
    const rugMat = new THREE.MeshStandardMaterial({ color: 0xffb6d5, roughness: 0.9 });
    const rug = new THREE.Mesh(rugGeo, rugMat);
    rug.position.set(0, 0.03, 0.3);
    rug.receiveShadow = true;
    roomGroup.add(rug);

    // Lighting
    ambientLight = new THREE.AmbientLight(THEME_COLORS[state.theme].ambient, 0.8);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight(THEME_COLORS[state.theme].light, 1.2, 12);
    pointLight.position.set(0, 4.2, 0.5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    spotLight = new THREE.SpotLight(0xffffff, 0.6);
    spotLight.position.set(3, 5, 4);
    spotLight.lookAt(0, 0, 0);
    scene.add(spotLight);

    // Fairy Lights Strand
    fairyLightsGroup = new THREE.Group();
    for (let i = -4.5; i <= 4.5; i += 0.6) {
      const bulbGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const bulbMat = new THREE.MeshBasicMaterial({ color: (i % 2 === 0 ? 0xffd166 : 0xff8fa3) });
      const bulb = new THREE.Mesh(bulbGeo, bulbMat);
      bulb.position.set(i, 4.2 + Math.sin(i * 0.8) * 0.3, -3.8);
      fairyLightsGroup.add(bulb);
    }
    roomGroup.add(fairyLightsGroup);

    // Chibi Couple Group (Luna & Oliver)
    chibiCoupleGroup = build3DChibiCouple();
    chibiCoupleGroup.position.set(0, 0.05, 0.3);
    scene.add(chibiCoupleGroup);

    // Floating Starlight Particles
    particlesGroup = buildFloatingParticles();
    scene.add(particlesGroup);

    // Pointer drag rotation for 3D room
    let isRoomDragging = false;
    let prevPointer = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', (e) => {
      isRoomDragging = true;
      prevPointer = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', (e) => {
      if (!isRoomDragging || !roomGroup) return;
      const dx = e.clientX - prevPointer.x;
      const dy = e.clientY - prevPointer.y;
      roomGroup.rotation.y += dx * 0.006;
      roomGroup.rotation.x = Math.max(-0.25, Math.min(0.35, roomGroup.rotation.x + dy * 0.004));
      prevPointer = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { isRoomDragging = false; });
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isRoomDragging = true;
        prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!isRoomDragging || !roomGroup || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevPointer.x;
      const dy = e.touches[0].clientY - prevPointer.y;
      roomGroup.rotation.y += dx * 0.006;
      roomGroup.rotation.x = Math.max(-0.25, Math.min(0.35, roomGroup.rotation.x + dy * 0.004));
      prevPointer = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    window.addEventListener('touchend', () => { isRoomDragging = false; });

    // Responsive resize
    window.addEventListener('resize', onWindowResize);
    setTimeout(onWindowResize, 150);
    setTimeout(onWindowResize, 500);

    // Animate
    animate();
  }

  function onWindowResize() {
    if (!canvas || !camera || !renderer) return;
    const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
    const width = canvas.clientWidth || parentWidth || 800;
    const height = canvas.clientHeight || 480;
    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }

  // --- 2. Build Chibi Characters ---
  function build3DChibiCouple() {
    const group = new THREE.Group();

    // Helper: Build single chibi
    function createChibi(outfitColor, hairColor, blushColor, isBoy = false) {
      const chibi = new THREE.Group();

      // Body (cute rounded capsule/cylinder)
      const bodyGeo = new THREE.CylinderGeometry(0.35, 0.45, 0.8, 16);
      const bodyMat = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.5 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.5;
      body.castShadow = true;
      chibi.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.5, 24, 24);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffecd1, roughness: 0.6 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.25;
      head.castShadow = true;
      chibi.add(head);

      // Hair
      const hairGeo = isBoy ? new THREE.SphereGeometry(0.52, 16, 16) : new THREE.CylinderGeometry(0.52, 0.6, 0.4, 16);
      const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.y = isBoy ? 1.4 : 1.35;
      chibi.add(hair);

      // Rosy Blush Cheeks
      [-0.28, 0.28].forEach(x => {
        const blushGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const blushMat = new THREE.MeshBasicMaterial({ color: blushColor, transparent: true, opacity: 0.85 });
        const blush = new THREE.Mesh(blushGeo, blushMat);
        blush.position.set(x, 1.15, 0.42);
        chibi.add(blush);
      });

      // Eyes
      [-0.18, 0.18].forEach(x => {
        const eyeGeo = new THREE.SphereGeometry(0.06, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x2b1b2f });
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.position.set(x, 1.28, 0.46);
        chibi.add(eye);
      });

      return chibi;
    }

    // Luna (Left)
    const luna = createChibi(0xff8fa3, 0x4a2e2b, 0xff5c8a, false);
    luna.position.x = -0.65;
    luna.name = 'luna';
    group.add(luna);

    // Oliver (Right)
    const oliver = createChibi(0xa0c4ff, 0x2b1e1a, 0xff758f, true);
    oliver.position.x = 0.65;
    oliver.name = 'oliver';
    group.add(oliver);

    return group;
  }

  function buildFloatingParticles() {
    const group = new THREE.Group();
    const count = 30;
    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xffb7d5 : 0xffd166,
        transparent: true,
        opacity: 0.7
      });
      const p = new THREE.Mesh(geo, mat);
      p.position.set(
        (Math.random() - 0.5) * 8,
        1 + Math.random() * 3.5,
        (Math.random() - 0.5) * 6
      );
      p.userData = { speed: 0.005 + Math.random() * 0.01, baseY: p.position.y };
      group.add(p);
    }
    return group;
  }

  // --- 3. Animation State Loop ---
  let clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Floating particles
    if (particlesGroup) {
      particlesGroup.children.forEach(p => {
        p.position.y = p.userData.baseY + Math.sin(time * 2 + p.position.x) * 0.2;
      });
    }

    // Character Animations State Machine
    if (chibiCoupleGroup) {
      const luna = chibiCoupleGroup.getObjectByName('luna');
      const oliver = chibiCoupleGroup.getObjectByName('oliver');

      if (luna && oliver) {
        switch (state.currentAnimation) {
          case 'wave':
            luna.rotation.z = Math.sin(time * 8) * 0.15;
            oliver.rotation.z = -Math.sin(time * 8) * 0.15;
            luna.position.y = 0.05 + Math.abs(Math.sin(time * 4)) * 0.1;
            oliver.position.y = 0.05 + Math.abs(Math.sin(time * 4)) * 0.1;
            break;

          case 'hug':
            luna.position.x = -0.25;
            oliver.position.x = 0.25;
            luna.rotation.y = 0.4;
            oliver.rotation.y = -0.4;
            luna.position.y = 0.05 + Math.sin(time * 2) * 0.03;
            oliver.position.y = 0.05 + Math.sin(time * 2) * 0.03;
            break;

          case 'dance':
            luna.position.x = -0.65 + Math.sin(time * 3) * 0.4;
            oliver.position.x = 0.65 - Math.sin(time * 3) * 0.4;
            luna.rotation.y = time * 3;
            oliver.rotation.y = -time * 3;
            luna.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.2;
            oliver.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.2;
            break;

          case 'hands':
            luna.position.x = -0.45;
            oliver.position.x = 0.45;
            luna.rotation.z = -0.05;
            oliver.rotation.z = 0.05;
            luna.position.y = 0.05 + Math.sin(time * 2) * 0.02;
            oliver.position.y = 0.05 + Math.sin(time * 2) * 0.02;
            break;

          case 'kiss':
            luna.position.x = -0.3;
            oliver.position.x = 0.3;
            luna.rotation.y = 0.3 + Math.sin(time * 5) * 0.05;
            oliver.rotation.y = -0.3 - Math.sin(time * 5) * 0.05;
            break;

          default: // Idle gentle breathing
            luna.position.x = -0.65;
            oliver.position.x = 0.65;
            luna.rotation.set(0, 0, 0);
            oliver.rotation.set(0, 0, 0);
            luna.position.y = 0.05 + Math.sin(time * 2) * 0.03;
            oliver.position.y = 0.05 + Math.sin(time * 2 + 0.5) * 0.03;
            break;
        }
      }
    }

    renderer.render(scene, camera);
  }

  // --- 4. Animation Actions ---
  function triggerAnimation(animName, message) {
    state.currentAnimation = animName;
    if (speechText) speechText.textContent = message;
    if (speechBubble) speechBubble.classList.add('pop-bubble');
    setTimeout(() => { if (speechBubble) speechBubble.classList.remove('pop-bubble'); }, 600);

    // Return to idle after 4 seconds
    setTimeout(() => {
      if (state.currentAnimation === animName) {
        state.currentAnimation = 'idle';
      }
    }, 4500);
  }

  if (btnWave) btnWave.addEventListener('click', () => triggerAnimation('wave', 'Luna and Oliver are waving happily at you! 👋'));
  if (btnHug) btnHug.addEventListener('click', () => triggerAnimation('hug', 'Warm loving hugs fill our room with sweet comfort 🤗'));
  if (btnDance) btnDance.addEventListener('click', () => triggerAnimation('dance', 'Dancing together to our favorite romantic melody 💃✨'));
  if (btnHands) btnHands.addEventListener('click', () => triggerAnimation('hands', 'Holding hands tightly, never letting go 🫶'));
  if (btnKiss) btnKiss.addEventListener('click', () => triggerAnimation('kiss', 'Sending sweet flying kisses across the starlight 💋'));
  if (btnBurst) btnBurst.addEventListener('click', () => {
    triggerAnimation('dance', 'Heart explosion of endless love! 💖✨');
    if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
      window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 25);
    }
  });

  // --- 5. Theme Switcher ---
  themeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      themeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const themeKey = tab.getAttribute('data-theme');
      applyRoomTheme(themeKey);
    });
  });

  function applyRoomTheme(themeKey) {
    state.theme = themeKey;
    const cfg = THEME_COLORS[themeKey] || THEME_COLORS['pink-dream'];
    if (scene) scene.background = new THREE.Color(cfg.bg);
    if (ambientLight) ambientLight.color.setHex(cfg.ambient);
    if (pointLight) pointLight.color.setHex(cfg.light);
  }

  // --- 6. Fairy Lights Toggle ---
  if (btnToggleLights) {
    btnToggleLights.addEventListener('click', () => {
      state.fairyLightsOn = !state.fairyLightsOn;
      if (fairyLightsGroup) fairyLightsGroup.visible = state.fairyLightsOn;
      if (lightsStatusText) lightsStatusText.textContent = state.fairyLightsOn ? 'On' : 'Off';
    });
  }

  // --- 7. Web Audio Synthesizer (Gramophone Chimes) ---
  let audioCtx = null;
  function playSweetChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const notes = [523.25, 659.25, 783.99, 1046.50, 880.00, 1318.51];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.22);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + i * 0.22 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.22 + 1.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + i * 0.22);
        osc.stop(audioCtx.currentTime + i * 0.22 + 1.3);
      });

      if (speechText) speechText.textContent = 'Playing sweet celesta chimes on the gramophone 🎶';
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  if (btnPlayGramophone) btnPlayGramophone.addEventListener('click', playSweetChime);
  if (btnToggleAudio) {
    btnToggleAudio.addEventListener('click', () => {
      playSweetChime();
      state.audioPlaying = !state.audioPlaying;
      if (audioStatusText) audioStatusText.textContent = state.audioPlaying ? 'Playing' : 'Muted';
    });
  }

  // --- 8. Save Room Settings ---
  if (btnSaveRoom) {
    btnSaveRoom.addEventListener('click', async () => {
      btnSaveRoom.disabled = true;
      try {
        const res = await fetch('/api/room/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            theme: state.theme,
            fairyLights: state.fairyLightsOn
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert('Our 3D Love Room settings saved successfully! 💖');
        } else {
          alert('Failed to save room look.');
        }
      } catch (e) {
        alert('Error saving room settings.');
      } finally {
        btnSaveRoom.disabled = false;
      }
    });
  }

  // Load existing room settings
  async function loadSavedRoomSettings() {
    try {
      const res = await fetch('/api/room/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (data.settings.theme) {
            applyRoomTheme(data.settings.theme);
            themeTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-theme') === data.settings.theme));
          }
          if (data.settings.fairyLights !== undefined) {
            state.fairyLightsOn = data.settings.fairyLights;
            if (fairyLightsGroup) fairyLightsGroup.visible = state.fairyLightsOn;
            if (lightsStatusText) lightsStatusText.textContent = state.fairyLightsOn ? 'On' : 'Off';
          }
        }
      }
    } catch (e) {}
  }

  // Initialize
  init3DRoom();
  loadSavedRoomSettings();
});
