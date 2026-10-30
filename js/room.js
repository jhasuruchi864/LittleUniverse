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

    // Helper: Build single kawaii chibi character with arms, hands, cute face & hair
    function createChibi(outfitColor, hairColor, blushColor, isBoy = false) {
      const chibi = new THREE.Group();

      // Soft Warm Peach Skin Material
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xffebd9,
        roughness: 0.55,
        metalness: 0.02
      });

      // Outfit Material
      const outfitMat = new THREE.MeshStandardMaterial({
        color: outfitColor,
        roughness: 0.62,
        metalness: 0.02
      });

      // White Accent Material (collars, lace, sneakers)
      const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4
      });

      // Shoes Material
      const shoeMat = new THREE.MeshStandardMaterial({
        color: isBoy ? 0xffffff : 0xff5c8a,
        roughness: 0.45
      });

      // --- Body / Torso ---
      const bodyGroup = new THREE.Group();
      chibi.add(bodyGroup);

      // Torso (soft rounded cute sweater)
      const bodyGeo = new THREE.CylinderGeometry(0.32, 0.44, 0.76, 20);
      const body = new THREE.Mesh(bodyGeo, outfitMat);
      body.position.y = 0.52;
      body.castShadow = true;
      bodyGroup.add(body);

      // Turtleneck / Collar Ring
      const collarGeo = new THREE.TorusGeometry(0.30, 0.07, 10, 20);
      const collar = new THREE.Mesh(collarGeo, isBoy ? whiteMat : outfitMat);
      collar.position.set(0, 0.88, 0);
      collar.rotation.x = Math.PI / 2;
      bodyGroup.add(collar);

      // Outfit Specific Details
      if (!isBoy) {
        // Luna: Flared Sweet Dress Skirt
        const skirtGeo = new THREE.ConeGeometry(0.54, 0.36, 22, 1, true);
        const skirt = new THREE.Mesh(skirtGeo, outfitMat);
        skirt.position.set(0, 0.28, 0);
        bodyGroup.add(skirt);

        // Skirt White Lace Hem
        const laceGeo = new THREE.TorusGeometry(0.53, 0.035, 8, 24);
        const lace = new THREE.Mesh(laceGeo, whiteMat);
        lace.position.set(0, 0.11, 0);
        lace.rotation.x = Math.PI / 2;
        bodyGroup.add(lace);

        // Tiny Heart Chest Emblem
        const heartMat = new THREE.MeshBasicMaterial({ color: 0xff3366 });
        const heartBadge = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), heartMat);
        heartBadge.position.set(0, 0.65, 0.36);
        heartBadge.scale.set(1.2, 1, 0.4);
        bodyGroup.add(heartBadge);
      } else {
        // Oliver: Hoodie pocket / pouch
        const pocketMat = new THREE.MeshStandardMaterial({ color: 0x82aaff, roughness: 0.6 });
        const pocketGeo = new THREE.BoxGeometry(0.34, 0.16, 0.08);
        const pocket = new THREE.Mesh(pocketGeo, pocketMat);
        pocket.position.set(0, 0.40, 0.38);
        bodyGroup.add(pocket);
      }

      // --- Little Cute Feet / Shoes ---
      [-0.16, 0.16].forEach(x => {
        // Little Leg Pants/Socks
        const legGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.22, 12);
        const leg = new THREE.Mesh(legGeo, isBoy ? new THREE.MeshStandardMaterial({ color: 0x3d4a5d }) : skinMat);
        leg.position.set(x, 0.14, 0);
        bodyGroup.add(leg);

        // Cute Rounded Shoe
        const shoeGeo = new THREE.SphereGeometry(0.12, 12, 10);
        shoeGeo.scale(1, 0.7, 1.4);
        const shoe = new THREE.Mesh(shoeGeo, shoeMat);
        shoe.position.set(x, 0.07, 0.06);
        shoe.castShadow = true;
        bodyGroup.add(shoe);
      });

      // --- Head & Neck ---
      const neckGroup = new THREE.Group();
      neckGroup.position.set(0, 0.92, 0);
      chibi.add(neckGroup);

      // Chubby Kawaii Chibi Head
      const headGeo = new THREE.SphereGeometry(0.50, 28, 24);
      headGeo.scale(1.12, 1.0, 1.04);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 0.42;
      head.castShadow = true;
      neckGroup.add(head);

      // Cute Little Ears
      [-0.54, 0.54].forEach(x => {
        const earGeo = new THREE.SphereGeometry(0.12, 10, 10);
        earGeo.scale(0.5, 1, 0.8);
        const ear = new THREE.Mesh(earGeo, skinMat);
        ear.position.set(x, 0.42, 0);
        neckGroup.add(ear);
      });

      // Cute Button Nose
      const noseGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const noseMat = new THREE.MeshStandardMaterial({ color: 0xffc4b8, roughness: 0.6 });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0.38, 0.52);
      neckGroup.add(nose);

      // Sweet Smiling Mouth (curved pink line)
      const mouthGeo = new THREE.TorusGeometry(0.07, 0.02, 8, 12, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0xd94368 });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, 0.28, 0.51);
      mouth.rotation.x = Math.PI;
      neckGroup.add(mouth);

      // Rosy Blushing Cheeks (soft glow)
      [-0.30, 0.30].forEach(x => {
        const blushGeo = new THREE.SphereGeometry(0.11, 14, 12);
        blushGeo.scale(1.3, 0.7, 0.4);
        const blushMat = new THREE.MeshBasicMaterial({
          color: blushColor,
          transparent: true,
          opacity: 0.78
        });
        const blush = new THREE.Mesh(blushGeo, blushMat);
        blush.position.set(x, 0.33, 0.47);
        neckGroup.add(blush);
      });

      // Glossy Anime Kawaii Eyes (Dark plum with multi-layered sparkle highlights)
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1024, roughness: 0.1 });
      const eyeSparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      [-0.20, 0.20].forEach((x, idx) => {
        const eyeGroup = new THREE.Group();
        eyeGroup.position.set(x, 0.45, 0.48);

        // Pupil / Base Eye
        const eyeGeo = new THREE.SphereGeometry(0.088, 16, 14);
        eyeGeo.scale(1, 1.25, 0.4);
        const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
        eyeGroup.add(eyeMesh);

        // Major Top Sparkle Catch
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeSparkleMat);
        s1.position.set(idx === 0 ? -0.02 : 0.02, 0.045, 0.04);
        eyeGroup.add(s1);

        // Minor Bottom Secondary Sparkle
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyeSparkleMat);
        s2.position.set(idx === 0 ? 0.03 : -0.03, -0.04, 0.035);
        eyeGroup.add(s2);

        // Cute Eyelash line
        const lashGeo = new THREE.BoxGeometry(0.14, 0.025, 0.02);
        const lash = new THREE.Mesh(lashGeo, eyeMat);
        lash.position.set(0, 0.10, 0.02);
        lash.rotation.z = idx === 0 ? 0.12 : -0.12;
        eyeGroup.add(lash);

        neckGroup.add(eyeGroup);
      });

      // --- Beautiful Chibi Hair & Hairstyles ---
      const hairMat = new THREE.MeshStandardMaterial({
        color: hairColor,
        roughness: 0.72,
        metalness: 0.04
      });
      const hairGroup = new THREE.Group();
      neckGroup.add(hairGroup);

      if (!isBoy) {
        // --- Luna's Hair: Sleek bob with bangs & 2 adorable puffy buns + pink ribbon ---
        // Back Hair Dome
        const backHairGeo = new THREE.SphereGeometry(0.53, 20, 18);
        backHairGeo.scale(1.14, 1.05, 1.08);
        const backHair = new THREE.Mesh(backHairGeo, hairMat);
        backHair.position.set(0, 0.48, -0.04);
        hairGroup.add(backHair);

        // Front Bangs
        const bangGeo = new THREE.CylinderGeometry(0.52, 0.54, 0.22, 16, 1, false, -1.6, 3.2);
        const bangs = new THREE.Mesh(bangGeo, hairMat);
        bangs.position.set(0, 0.68, 0.08);
        hairGroup.add(bangs);

        // Side hair locks framing face
        [-0.48, 0.48].forEach(x => {
          const sideLockGeo = new THREE.ConeGeometry(0.12, 0.42, 10);
          const sideLock = new THREE.Mesh(sideLockGeo, hairMat);
          sideLock.position.set(x, 0.40, 0.24);
          sideLock.rotation.z = x < 0 ? -0.15 : 0.15;
          sideLock.rotation.x = 0.2;
          hairGroup.add(sideLock);
        });

        // Two Cute Odango Twin Hair Buns!
        [-0.44, 0.44].forEach((x, idx) => {
          const bunGeo = new THREE.SphereGeometry(0.20, 14, 14);
          const bun = new THREE.Mesh(bunGeo, hairMat);
          bun.position.set(x, 0.88, -0.05);
          hairGroup.add(bun);

          // Signature Pink Ribbon / Bow on her left bun!
          if (idx === 0) {
            const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xff3366, roughness: 0.4 });
            const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), ribbonMat);
            bowKnot.position.set(x - 0.08, 0.94, 0.14);
            const bowWingGeo = new THREE.SphereGeometry(0.12, 8, 8);
            bowWingGeo.scale(1.4, 0.8, 0.4);
            const bowL = new THREE.Mesh(bowWingGeo, ribbonMat);
            bowL.position.set(x - 0.18, 0.96, 0.14);
            bowL.rotation.z = 0.3;
            const bowR = new THREE.Mesh(bowWingGeo, ribbonMat);
            bowR.position.set(x + 0.02, 0.96, 0.14);
            bowR.rotation.z = -0.3;
            hairGroup.add(bowKnot, bowL, bowR);
          }
        });
      } else {
        // --- Oliver's Hair: Fluffy layered anime boy cut with stylish bangs & cowlick ---
        // Back / Top hair helmet
        const boyHairGeo = new THREE.SphereGeometry(0.53, 20, 18);
        boyHairGeo.scale(1.14, 1.06, 1.08);
        const boyHair = new THREE.Mesh(boyHairGeo, hairMat);
        boyHair.position.set(0, 0.48, -0.02);
        hairGroup.add(boyHair);

        // Fluffy parted bangs falling over brow
        [-0.24, -0.08, 0.10, 0.26].forEach((x, i) => {
          const bangTuftGeo = new THREE.ConeGeometry(0.11, 0.28, 8);
          const tuft = new THREE.Mesh(bangTuftGeo, hairMat);
          tuft.position.set(x, 0.70, 0.44);
          tuft.rotation.x = 2.4;
          tuft.rotation.z = (i - 1.5) * 0.25;
          hairGroup.add(tuft);
        });

        // Cute Anime Cowlick Sprout at the top!
        const sproutGeo = new THREE.ConeGeometry(0.08, 0.24, 8);
        const sprout = new THREE.Mesh(sproutGeo, hairMat);
        sprout.position.set(0.05, 1.04, 0.02);
        sprout.rotation.z = -0.35;
        sprout.rotation.x = -0.2;
        hairGroup.add(sprout);
      }

      // =========================================================
      // --- ARTICULATED ARMS AND HANDS ("iska hand nhi hai") ---
      // =========================================================
      // Left Arm Chain (Shoulder -> Upper Arm / Sleeve -> Hand / Paw)
      const leftShoulder = new THREE.Group();
      leftShoulder.position.set(-0.36, 0.72, 0);
      chibi.add(leftShoulder);

      const armGeo = new THREE.CylinderGeometry(0.11, 0.10, 0.34, 12);
      armGeo.translate(0, -0.17, 0);
      const leftArm = new THREE.Mesh(armGeo, outfitMat);
      leftArm.castShadow = true;
      leftShoulder.add(leftArm);

      // Sleeve Cuff Ring
      const cuffGeo = new THREE.TorusGeometry(0.11, 0.025, 8, 14);
      const cuffL = new THREE.Mesh(cuffGeo, isBoy ? outfitMat : whiteMat);
      cuffL.position.set(0, -0.34, 0);
      cuffL.rotation.x = Math.PI / 2;
      leftShoulder.add(cuffL);

      // Cute Round Chibi Hand with Tiny Thumb
      const handGroupL = new THREE.Group();
      handGroupL.position.set(0, -0.42, 0);
      const handMeshL = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), skinMat);
      handMeshL.castShadow = true;
      handGroupL.add(handMeshL);
      // Thumb
      const thumbL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
      thumbL.position.set(0.07, 0.02, 0.03);
      handGroupL.add(thumbL);
      leftShoulder.add(handGroupL);

      // Right Arm Chain (Shoulder -> Upper Arm / Sleeve -> Hand / Paw)
      const rightShoulder = new THREE.Group();
      rightShoulder.position.set(0.36, 0.72, 0);
      chibi.add(rightShoulder);

      const rightArm = new THREE.Mesh(armGeo, outfitMat);
      rightArm.castShadow = true;
      rightShoulder.add(rightArm);

      const cuffR = new THREE.Mesh(cuffGeo, isBoy ? outfitMat : whiteMat);
      cuffR.position.set(0, -0.34, 0);
      cuffR.rotation.x = Math.PI / 2;
      rightShoulder.add(cuffR);

      const handGroupR = new THREE.Group();
      handGroupR.position.set(0, -0.42, 0);
      const handMeshR = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 10), skinMat);
      handMeshR.castShadow = true;
      handGroupR.add(handMeshR);
      // Thumb
      const thumbR = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
      thumbR.position.set(-0.07, 0.02, 0.03);
      handGroupR.add(thumbR);
      rightShoulder.add(handGroupR);

      // Expose joints on chibi for animations
      chibi.leftShoulder = leftShoulder;
      chibi.rightShoulder = rightShoulder;
      chibi.leftArm = leftArm;
      chibi.rightArm = rightArm;
      chibi.neckGroup = neckGroup;
      chibi.head = head;
      chibi.bodyGroup = bodyGroup;

      return chibi;
    }

    // Luna (Left) - Cute pink sweater dress, chocolate hair, rosy cheeks
    const luna = createChibi(0xff8da1, 0x422823, 0xff5c8a, false);
    luna.position.x = -0.65;
    luna.name = 'luna';
    group.add(luna);

    // Oliver (Right) - Cute baby-blue hoodie, mocha hair, warm blush
    const oliver = createChibi(0x90b4fe, 0x2b1e1a, 0xff758f, true);
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

    // Character Animations State Machine (Expressive Arm & Hand Gestures)
    if (chibiCoupleGroup) {
      const luna = chibiCoupleGroup.getObjectByName('luna');
      const oliver = chibiCoupleGroup.getObjectByName('oliver');

      if (luna && oliver) {
        switch (state.currentAnimation) {
          case 'wave':
            // Luna waves her right hand high in the air!
            if (luna.rightShoulder) {
              luna.rightShoulder.rotation.x = -0.4;
              luna.rightShoulder.rotation.z = -2.2 + Math.sin(time * 12) * 0.45;
            }
            if (luna.leftShoulder) {
              luna.leftShoulder.rotation.z = 0.2 + Math.sin(time * 2) * 0.05;
              luna.leftShoulder.rotation.x = 0;
            }
            if (luna.neckGroup) {
              luna.neckGroup.rotation.z = -0.15 + Math.sin(time * 4) * 0.08;
            }

            // Oliver waves his left hand back happily!
            if (oliver.leftShoulder) {
              oliver.leftShoulder.rotation.x = -0.4;
              oliver.leftShoulder.rotation.z = 2.2 - Math.sin(time * 12) * 0.45;
            }
            if (oliver.rightShoulder) {
              oliver.rightShoulder.rotation.z = -0.2 - Math.sin(time * 2) * 0.05;
              oliver.rightShoulder.rotation.x = 0;
            }
            if (oliver.neckGroup) {
              oliver.neckGroup.rotation.z = 0.15 - Math.sin(time * 4) * 0.08;
            }

            luna.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.12;
            oliver.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.12;
            break;

          case 'hug':
            luna.position.x = -0.28;
            oliver.position.x = 0.28;
            luna.rotation.y = 0.45;
            oliver.rotation.y = -0.45;

            // Arms wrap around each other warmly
            if (luna.leftShoulder && luna.rightShoulder) {
              luna.leftShoulder.rotation.set(-1.25, 0.45, -0.35 + Math.sin(time * 3) * 0.08);
              luna.rightShoulder.rotation.set(-1.25, -0.40, 0.30 + Math.sin(time * 3) * 0.08);
            }
            if (oliver.leftShoulder && oliver.rightShoulder) {
              oliver.leftShoulder.rotation.set(-1.25, 0.40, -0.30 - Math.sin(time * 3) * 0.08);
              oliver.rightShoulder.rotation.set(-1.25, -0.45, 0.35 - Math.sin(time * 3) * 0.08);
            }

            if (luna.neckGroup) luna.neckGroup.rotation.z = 0.15;
            if (oliver.neckGroup) oliver.neckGroup.rotation.z = -0.15;
            luna.position.y = 0.05 + Math.sin(time * 2) * 0.03;
            oliver.position.y = 0.05 + Math.sin(time * 2) * 0.03;
            break;

          case 'dance':
            luna.position.x = -0.65 + Math.sin(time * 3) * 0.45;
            oliver.position.x = 0.65 - Math.sin(time * 3) * 0.45;
            luna.rotation.y = time * 3;
            oliver.rotation.y = -time * 3;

            // Arms swing up and down with lively rhythm!
            if (luna.leftShoulder && luna.rightShoulder) {
              luna.leftShoulder.rotation.z = Math.sin(time * 6) * 0.65 + 0.3;
              luna.rightShoulder.rotation.z = -Math.sin(time * 6) * 0.65 - 0.3;
            }
            if (oliver.leftShoulder && oliver.rightShoulder) {
              oliver.leftShoulder.rotation.z = -Math.sin(time * 6) * 0.65 + 0.3;
              oliver.rightShoulder.rotation.z = Math.sin(time * 6) * 0.65 - 0.3;
            }

            luna.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.18;
            oliver.position.y = 0.05 + Math.abs(Math.sin(time * 6)) * 0.18;
            break;

          case 'hands':
            luna.position.x = -0.40;
            oliver.position.x = 0.40;
            luna.rotation.set(0, 0.15, -0.04);
            oliver.rotation.set(0, -0.15, 0.04);

            // Extend inner arms towards each other to hold hands in the center!
            if (luna.rightShoulder && luna.leftShoulder) {
              luna.rightShoulder.rotation.set(-0.65, -0.20, 0.82 + Math.sin(time * 2) * 0.04);
              luna.leftShoulder.rotation.set(0, 0, 0.15);
            }
            if (oliver.leftShoulder && oliver.rightShoulder) {
              oliver.leftShoulder.rotation.set(-0.65, 0.20, -0.82 - Math.sin(time * 2) * 0.04);
              oliver.rightShoulder.rotation.set(0, 0, -0.15);
            }

            if (luna.neckGroup) luna.neckGroup.rotation.y = 0.25;
            if (oliver.neckGroup) oliver.neckGroup.rotation.y = -0.25;
            luna.position.y = 0.05 + Math.sin(time * 2) * 0.02;
            oliver.position.y = 0.05 + Math.sin(time * 2) * 0.02;
            break;

          case 'kiss':
            luna.position.x = -0.26;
            oliver.position.x = 0.26;
            luna.rotation.set(0.12, 0.40, 0);
            oliver.rotation.set(0.12, -0.40, 0);

            // Gentle embrace and lean
            if (luna.leftShoulder && luna.rightShoulder) {
              luna.leftShoulder.rotation.set(-0.75, 0.3, -0.25);
              luna.rightShoulder.rotation.set(-0.85, -0.2, 0.35);
            }
            if (oliver.leftShoulder && oliver.rightShoulder) {
              oliver.leftShoulder.rotation.set(-0.85, 0.2, -0.35);
              oliver.rightShoulder.rotation.set(-0.75, -0.3, 0.25);
            }

            if (luna.neckGroup) luna.neckGroup.rotation.set(0.1, 0.15, 0.12);
            if (oliver.neckGroup) oliver.neckGroup.rotation.set(0.1, -0.15, -0.12);
            luna.position.y = 0.05 + Math.sin(time * 4) * 0.02;
            oliver.position.y = 0.05 + Math.sin(time * 4) * 0.02;
            break;

          default: // Idle gentle breathing
            luna.position.x = -0.65;
            oliver.position.x = 0.65;
            luna.rotation.set(0, 0, 0);
            oliver.rotation.set(0, 0, 0);

            // Arms resting naturally by sides with gentle breathing swing
            if (luna.leftShoulder && luna.rightShoulder) {
              luna.leftShoulder.rotation.set(Math.sin(time * 2) * 0.05, 0, 0.12);
              luna.rightShoulder.rotation.set(-Math.sin(time * 2) * 0.05, 0, -0.12);
            }
            if (oliver.leftShoulder && oliver.rightShoulder) {
              oliver.leftShoulder.rotation.set(-Math.sin(time * 2 + 0.5) * 0.05, 0, 0.12);
              oliver.rightShoulder.rotation.set(Math.sin(time * 2 + 0.5) * 0.05, 0, -0.12);
            }

            if (luna.neckGroup) luna.neckGroup.rotation.set(0, Math.sin(time * 1.5) * 0.08, Math.sin(time * 2) * 0.03);
            if (oliver.neckGroup) oliver.neckGroup.rotation.set(0, -Math.sin(time * 1.5) * 0.08, -Math.sin(time * 2) * 0.03);

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
