/**
 * Our Little Universe - Personal Galaxy Logic
 * 3D Three.js interactive spiral galaxy with clickable memory stars and 2D accessible fallback.
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // DOM Elements
  const canvas = document.getElementById('galaxy-3d-canvas');
  const btnPersonal = document.getElementById('btn-personal-galaxy');
  const btnShared = document.getElementById('btn-shared-galaxy');
  const btnToggle2D = document.getElementById('btn-toggle-2d-mode');
  const viewportBox = document.getElementById('galaxy-viewport-box');
  const view2D = document.getElementById('galaxy-2d-view');
  const starsGrid = document.getElementById('galaxy-stars-grid');
  const starCountText = document.getElementById('star-count-text');

  // Modal
  const modal = document.getElementById('star-memory-modal');
  const modalTitle = document.getElementById('star-memory-title');
  const modalImg = document.getElementById('star-memory-img');
  const modalTag = document.getElementById('star-tag-constellation');
  const modalDate = document.getElementById('star-date-text');
  const modalNote = document.getElementById('star-note-text');
  const btnCloseModal = document.getElementById('btn-close-star-modal');
  const btnCloseAction = document.getElementById('btn-close-star-action');

  // Sample Memory Stars
  const MEMORY_STARS = [
    {
      id: 'star-1',
      title: 'The First Starlight Glance ✨',
      date: 'Feb 14, 2024',
      constellation: 'Heart Constellation',
      note: 'The very first time our eyes met and the entire universe seemed to quiet down.',
      img: 'assets/images/memory-1.svg',
      x: 1.8, y: 0.6, z: -1.2,
      color: 0xff8fa3
    },
    {
      id: 'star-2',
      title: 'Our Rainy Window Moment ☕',
      date: 'Mar 12, 2024',
      constellation: 'Sweet Blossom Constellation',
      note: 'Sitting together sipping hot chocolate while listening to gentle raindrops tapping on the glass.',
      img: 'assets/images/memory-2.svg',
      x: -2.2, y: -0.4, z: 1.5,
      color: 0xb197fc
    },
    {
      id: 'star-3',
      title: 'Under the Sakura Blossoms 🌸',
      date: 'Apr 05, 2024',
      constellation: 'Sakura Petal Cluster',
      note: 'Walking beneath falling pink petals, talking for hours without looking at the clock.',
      img: 'assets/images/memory-3.svg',
      x: 0.9, y: 1.3, z: 2.1,
      color: 0xffb703
    },
    {
      id: 'star-4',
      title: 'Secret Promise at Sunset 🌅',
      date: 'May 20, 2024',
      constellation: 'Golden Twilight Arm',
      note: 'Watching the golden sun dip below the waves and making our quiet forever promise.',
      img: 'assets/images/memory-4.svg',
      x: -1.5, y: 0.8, z: -2.3,
      color: 0x2ec4b6
    },
    {
      id: 'star-5',
      title: 'Dancing Under Fairy Lights 💃',
      date: 'Jun 15, 2024',
      constellation: 'Fairy Dance Nebula',
      note: 'Barefoot laughs and twirling under glowing lights in our cozy little room.',
      img: 'assets/images/memory-5.svg',
      x: 2.5, y: -1.1, z: 0.5,
      color: 0xff5c8a
    },
    {
      id: 'star-6',
      title: 'Starlight Dream Forever 💖',
      date: 'Jul 28, 2024',
      constellation: 'Infinite Love Core',
      note: 'Knowing deep in our hearts that no matter what, we will always be each other\'s home.',
      img: 'assets/images/memory-6.svg',
      x: 0.1, y: 0.2, z: 0.3,
      color: 0xffd166
    }
  ];

  // --- 1. Three.js Galaxy Setup ---
  let scene, camera, renderer, animationFrameId;
  let galaxyPoints, starMeshes = [];
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let galaxyGroup;

  // Build Our World & Time Travel State
  let decorationsGroup;
  let placedDecorations = [];
  let selectedDecorationId = null;

  let portalGroup;
  let isWarping = false;
  let warpProgress = 0;
  let warpTarget = null;
  let isResettingCamera = false;
  let cameraTargetLook = (typeof THREE !== 'undefined') ? new THREE.Vector3(0, 0, 0) : null;
  const defaultCamPos = (typeof THREE !== 'undefined') ? new THREE.Vector3(0, 3.5, 6.5) : null;
  let onWarpComplete = null;

  function initGalaxy() {
    if (!canvas || typeof THREE === 'undefined') return;

    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 520;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06030d); // Deep cosmic void

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 6.5);
    camera.lookAt(0, 0, 0);
    cameraTargetLook = new THREE.Vector3(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // Warm Romantic Lighting for Custom 3D Decorations
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffe4e6, 0.95);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    // 3D Custom Decorations Group inside Galaxy
    decorationsGroup = new THREE.Group();
    galaxyGroup.add(decorationsGroup);

    // 3D Portal Warp Group inside Scene
    portalGroup = new THREE.Group();
    scene.add(portalGroup);
    portalGroup.visible = false;

    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(0.3 + r * 0.45, 0.38 + r * 0.45, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? 0xff5c8a : 0xc084fc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      portalGroup.add(ringMesh);
    }


    // Build spiral galaxy particles
    const particleCount = 4000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const insideColor = new THREE.Color(0xff8fa3);
    const outsideColor = new THREE.Color(0x7048e8);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * 4.5;
      const spinAngle = radius * 2.2;
      const branchAngle = ((i % 3) * (2 * Math.PI)) / 3;

      const randomX = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3);
      const randomY = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3);
      const randomZ = (Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3);

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY * (4.5 - radius) * 0.4;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, radius / 4.5);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.045,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    galaxyPoints = new THREE.Points(geometry, material);
    galaxyGroup.add(galaxyPoints);

    // Add Interactive Memory Stars
    MEMORY_STARS.forEach(star => {
      const starGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const starMat = new THREE.MeshBasicMaterial({ color: star.color });
      const mesh = new THREE.Mesh(starGeo, starMat);
      mesh.position.set(star.x, star.y, star.z);
      mesh.userData = star;

      // Outer glow ring
      const haloGeo = new THREE.RingGeometry(0.18, 0.24, 16);
      const haloMat = new THREE.MeshBasicMaterial({ color: star.color, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(camera.position);
      mesh.add(halo);

      galaxyGroup.add(mesh);
      starMeshes.push(mesh);
    });

    // Pointer events for drag rotation & clicking stars
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('click', onClickStar);

    window.addEventListener('resize', onResize);
    setTimeout(onResize, 150);
    setTimeout(onResize, 500);

    animate();
  }

  function onResize() {
    if (!canvas || !camera || !renderer) return;
    const parentWidth = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
    const width = canvas.clientWidth || parentWidth || 800;
    const height = canvas.clientHeight || 520;
    if (width > 0 && height > 0) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }

  function onPointerDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    if (galaxyGroup) {
      galaxyGroup.rotation.y += deltaX * 0.005;
      galaxyGroup.rotation.x += deltaY * 0.005;
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onPointerUp() {
    isDragging = false;
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && galaxyGroup) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;
      galaxyGroup.rotation.y += deltaX * 0.005;
      galaxyGroup.rotation.x += deltaY * 0.005;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onClickStar(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(starMeshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.title) {
        openMemoryModal(hit.userData);
      }
    }
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Idle galaxy spin if not dragging and not warping
    if (galaxyGroup && !isDragging && !isWarping) {
      galaxyGroup.rotation.y += 0.0012; // slow mystical spin
    }

    // Floating micro-motion for custom decorations
    if (decorationsGroup && decorationsGroup.children.length > 0) {
      const t = Date.now() * 0.002;
      decorationsGroup.children.forEach((decObj, i) => {
        decObj.position.y = (decObj.userData.baseY || 0) + Math.sin(t + i * 1.5) * 0.06;
        decObj.rotation.y += 0.004;
      });
    }

    // Smooth Hyperspace Warp Animation for Time Travel
    if (isWarping && warpTarget) {
      warpProgress += 0.024;

      if (portalGroup) {
        portalGroup.visible = true;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        portalGroup.position.copy(camera.position).add(forward.multiplyScalar(1.2));
        portalGroup.lookAt(camera.position);
        portalGroup.rotation.z += 0.06;
        portalGroup.children.forEach((rg, idx) => {
          rg.rotation.z += (idx + 1) * 0.03;
          const s = 1 + Math.sin(warpProgress * 8 + idx) * 0.25;
          rg.scale.set(s, s, s);
        });
      }

      // Smooth camera translation & orientation interpolation
      camera.position.lerp(warpTarget.camPos, 0.07);
      cameraTargetLook.lerp(warpTarget.lookPos, 0.07);
      camera.lookAt(cameraTargetLook);

      // Dynamic FOV hyperspace stretch
      if (warpProgress < 0.5) {
        camera.fov = 50 + (warpProgress / 0.5) * 25; // expands to 75
      } else {
        camera.fov = 75 - ((warpProgress - 0.5) / 0.5) * 33; // settles to 42
      }
      camera.updateProjectionMatrix();

      if (camera.position.distanceTo(warpTarget.camPos) < 0.1 || warpProgress >= 1.0) {
        isWarping = false;
        if (portalGroup) portalGroup.visible = false;
        camera.position.copy(warpTarget.camPos);
        camera.lookAt(warpTarget.lookPos);
        camera.fov = 42;
        camera.updateProjectionMatrix();
        if (typeof onWarpComplete === 'function') {
          onWarpComplete();
          onWarpComplete = null;
        }
      }
    } else if (isResettingCamera) {
      camera.position.lerp(defaultCamPos, 0.08);
      cameraTargetLook.lerp(new THREE.Vector3(0, 0, 0), 0.08);
      camera.lookAt(cameraTargetLook);
      camera.fov = 50;
      camera.updateProjectionMatrix();
      if (camera.position.distanceTo(defaultCamPos) < 0.06) {
        isResettingCamera = false;
        camera.position.copy(defaultCamPos);
        camera.lookAt(0, 0, 0);
      }
    }

    renderer.render(scene, camera);
  }

  // --- 2. Memory Star Modal ---
  function openMemoryModal(star) {
    modalTitle.innerHTML = `<span>🌟</span> ${star.title}`;
    modalImg.src = star.img;
    modalTag.textContent = star.constellation;
    modalDate.textContent = star.date;
    modalNote.textContent = star.note;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCloseAction) btnCloseAction.addEventListener('click', closeModal);

  // --- 3. 2D Accessible List Fallback ---
  function render2DList() {
    starsGrid.innerHTML = '';
    starCountText.textContent = `${MEMORY_STARS.length} Memory Stars`;

    MEMORY_STARS.forEach(star => {
      const card = document.createElement('div');
      card.className = 'vault-polaroid-card';
      card.innerHTML = `
        <div class="polaroid-photo-frame" style="background: linear-gradient(135deg, #180b30, #3d1c5e); display: flex; align-items: center; justify-content: center;">
          <img src="${star.img}" alt="${star.title}" class="polaroid-img" style="object-fit: contain;">
        </div>
        <div class="polaroid-info-pane">
          <h4 class="polaroid-title">${star.title}</h4>
          <div class="polaroid-meta-row">
            <span class="polaroid-style-chip">${star.constellation}</span>
            <span class="polaroid-date-text">${star.date}</span>
          </div>
          <p class="polaroid-caption-preview">${star.note}</p>
        </div>
      `;
      card.addEventListener('click', () => openMemoryModal(star));
      starsGrid.appendChild(card);
    });
  }

  if (btnToggle2D) {
    btnToggle2D.addEventListener('click', () => {
      const is2D = view2D.style.display !== 'none';
      view2D.style.display = is2D ? 'none' : 'block';
      viewportBox.style.display = is2D ? 'block' : 'none';
      btnToggle2D.innerHTML = is2D ? '<span>📋</span> Switch to 2D List' : '<span>🌌</span> Switch to 3D Galaxy';
      if (!is2D) render2DList();
    });
  }

  // Personal vs Shared Toggle
  if (btnPersonal && btnShared) {
    btnPersonal.addEventListener('click', () => {
      btnPersonal.classList.add('active');
      btnShared.classList.remove('active');
      if (galaxyPoints) galaxyPoints.material.color.setHex(0xffffff);
    });
    btnShared.addEventListener('click', () => {
      btnShared.classList.add('active');
      btnPersonal.classList.remove('active');
      if (galaxyPoints) galaxyPoints.material.color.setHex(0xffd1e3);
    });
  }

  // =========================================================================
  // FEATURE 1: BUILD OUR WORLD 🏡 - 3D GALAXY WORLD CUSTOMIZER
  // =========================================================================
  const btnBuildWorld = document.getElementById('btn-build-world');
  const canvasBtnBuildWorld = document.getElementById('canvas-btn-build-world');
  const buildPanel = document.getElementById('build-world-panel');
  const btnCloseBuildPanel = document.getElementById('btn-close-build-panel');
  const paletteButtons = document.querySelectorAll('.palette-item-btn');
  const placedItemsList = document.getElementById('placed-items-list');
  const emptyPlacedNote = document.getElementById('empty-placed-note');
  const placedCountSpan = document.getElementById('placed-decorations-count');
  const adjustSection = document.getElementById('build-adjust-section');
  const selectedItemTitle = document.getElementById('selected-item-title');
  const angleSlider = document.getElementById('dec-angle-slider');
  const radiusSlider = document.getElementById('dec-radius-slider');
  const elevationSlider = document.getElementById('dec-elevation-slider');
  const scaleSlider = document.getElementById('dec-scale-slider');
  const angleVal = document.getElementById('dec-angle-val');
  const radiusVal = document.getElementById('dec-radius-val');
  const elevationVal = document.getElementById('dec-elevation-val');
  const scaleVal = document.getElementById('dec-scale-val');
  const btnSaveDecs = document.getElementById('btn-save-decorations');
  const btnClearDecs = document.getElementById('btn-clear-all-decorations');
  const btnRemoveSelected = document.getElementById('btn-remove-selected-item');
  const buildStatusMsg = document.getElementById('build-status-msg');

  const DECORATION_NAMES = {
    heart_crystal: 'Heart Crystal 💖',
    sakura_tree: 'Sakura Tree 🌸',
    ring_planet: 'Ring Planet 🪐',
    crystal_castle: 'Love Castle 🏰',
    space_bears: 'Space Bears 🧸',
    love_satellite: 'Love Satellite 🛸',
    starlight_comet: 'Star Comet 💫',
    rainbow_arch: 'Rainbow Arch 🌈'
  };

  function createDecorationMesh(type) {
    const group = new THREE.Group();
    switch (type) {
      case 'heart_crystal': {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.2);
        shape.bezierCurveTo(0, 0.35, -0.25, 0.5, -0.4, 0.5);
        shape.bezierCurveTo(-0.6, 0.5, -0.65, 0.25, -0.65, 0.15);
        shape.bezierCurveTo(-0.65, -0.05, -0.4, -0.3, 0, -0.6);
        shape.bezierCurveTo(0.4, -0.3, 0.65, -0.05, 0.65, 0.15);
        shape.bezierCurveTo(0.65, 0.25, 0.6, 0.5, 0.4, 0.5);
        shape.bezierCurveTo(0.25, 0.5, 0, 0.35, 0, 0.2);
        const extrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.center();
        const mat = new THREE.MeshPhongMaterial({
          color: 0xff4d88,
          emissive: 0xff1493,
          emissiveIntensity: 0.35,
          shininess: 90
        });
        const mesh = new THREE.Mesh(geo, mat);
        group.add(mesh);
        break;
      }
      case 'sakura_tree': {
        const trunkGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.4, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.2;
        group.add(trunk);
        const foliageGeo = new THREE.SphereGeometry(0.24, 12, 12);
        const foliageMat = new THREE.MeshPhongMaterial({ color: 0xffb7c5, emissive: 0xff85a2, emissiveIntensity: 0.25 });
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 0.45;
        group.add(foliage);
        const foliage2 = foliage.clone();
        foliage2.scale.set(0.65, 0.65, 0.65);
        foliage2.position.set(0.12, 0.52, 0.08);
        group.add(foliage2);
        break;
      }
      case 'ring_planet': {
        const sphereGeo = new THREE.SphereGeometry(0.26, 16, 16);
        const sphereMat = new THREE.MeshPhongMaterial({ color: 0xb388ff, emissive: 0x7c4dff, emissiveIntensity: 0.2 });
        const planet = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(planet);
        const ringGeo = new THREE.RingGeometry(0.35, 0.52, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd166, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI * 0.4;
        group.add(ring);
        break;
      }
      case 'crystal_castle': {
        const baseGeo = new THREE.BoxGeometry(0.32, 0.25, 0.32);
        const baseMat = new THREE.MeshPhongMaterial({ color: 0xfff0f5 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.125;
        group.add(base);
        const spireGeo = new THREE.ConeGeometry(0.12, 0.35, 8);
        const spireMat = new THREE.MeshPhongMaterial({ color: 0xff69b4, emissive: 0xff1493, emissiveIntensity: 0.4 });
        const spire = new THREE.Mesh(spireGeo, spireMat);
        spire.position.y = 0.42;
        group.add(spire);
        [-0.12, 0.12].forEach(ox => {
          [-0.12, 0.12].forEach(oz => {
            const tSpire = spire.clone();
            tSpire.scale.set(0.5, 0.5, 0.5);
            tSpire.position.set(ox, 0.3, oz);
            group.add(tSpire);
          });
        });
        break;
      }
      case 'space_bears': {
        const bubbleGeo = new THREE.SphereGeometry(0.28, 16, 16);
        const bubbleMat = new THREE.MeshPhongMaterial({ color: 0xffe4e6, transparent: true, opacity: 0.55, shininess: 100 });
        const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
        group.add(bubble);
        const bearHeadGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const bearHeadMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
        const bear = new THREE.Mesh(bearHeadGeo, bearHeadMat);
        group.add(bear);
        [-0.11, 0.11].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), bearHeadMat);
          ear.position.set(ex, 0.12, 0);
          group.add(ear);
        });
        break;
      }
      case 'love_satellite': {
        const bodyGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
        const bodyMat = new THREE.MeshPhongMaterial({ color: 0xff80ab, emissive: 0xff4081, emissiveIntensity: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);
        const wingGeo = new THREE.BoxGeometry(0.3, 0.02, 0.14);
        const wingMat = new THREE.MeshPhongMaterial({ color: 0x4fc3f7, emissive: 0x0288d1, emissiveIntensity: 0.2 });
        const wingL = new THREE.Mesh(wingGeo, wingMat);
        wingL.position.set(-0.25, 0, 0);
        const wingR = new THREE.Mesh(wingGeo, wingMat);
        wingR.position.set(0.25, 0, 0);
        group.add(wingL);
        group.add(wingR);
        break;
      }
      case 'starlight_comet': {
        const coreGeo = new THREE.SphereGeometry(0.16, 12, 12);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffeb3b });
        const core = new THREE.Mesh(coreGeo, coreMat);
        group.add(core);
        const tailGeo = new THREE.ConeGeometry(0.18, 0.6, 12);
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xff80ab, transparent: true, opacity: 0.6 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.rotation.x = Math.PI * 0.5;
        tail.position.z = -0.35;
        group.add(tail);
        break;
      }
      case 'rainbow_arch': {
        const arcGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 24, Math.PI);
        const arcMat = new THREE.MeshPhongMaterial({ color: 0xff69b4, emissive: 0xc084fc, emissiveIntensity: 0.35 });
        const arc = new THREE.Mesh(arcGeo, arcMat);
        group.add(arc);
        break;
      }
      default: {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xff5c8a }));
        group.add(cube);
      }
    }
    return group;
  }

  function addDecorationToScene(data, isNew = false) {
    if (!decorationsGroup) return;

    const id = data.id || ('dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6));
    const type = data.type || 'heart_crystal';
    const name = data.name || (DECORATION_NAMES[type] || 'Decoration');
    const angle = typeof data.angle === 'number' ? data.angle : Math.floor(Math.random() * 360);
    const radius = typeof data.radius === 'number' ? data.radius : (1.8 + Math.random() * 1.8);
    const elevation = typeof data.elevation === 'number' ? data.elevation : (Math.random() * 1.2 - 0.4);
    const scale = typeof data.scale === 'number' ? data.scale : 1.0;

    const mesh = createDecorationMesh(type);
    const rad = (angle * Math.PI) / 180;
    mesh.position.x = Math.cos(rad) * radius;
    mesh.position.z = Math.sin(rad) * radius;
    mesh.position.y = elevation;
    mesh.scale.setScalar(scale);

    mesh.userData = { id, type, name, angle, radius, elevation, scale, baseY: elevation };
    decorationsGroup.add(mesh);

    const record = { id, type, name, angle, radius, elevation, scale, mesh };
    placedDecorations.push(record);

    updatePlacedListUI();
    if (isNew) {
      selectDecoration(id);
      showBuildStatus(`Added ${name}! ✨ Use sliders below to move it.`);
    }
    return record;
  }

  function updatePlacedListUI() {
    if (!placedItemsList || !placedCountSpan) return;
    placedCountSpan.textContent = placedDecorations.length;

    if (placedDecorations.length === 0) {
      if (emptyPlacedNote) emptyPlacedNote.style.display = 'block';
      if (adjustSection) adjustSection.style.display = 'none';
      return;
    }

    if (emptyPlacedNote) emptyPlacedNote.style.display = 'none';
    placedItemsList.innerHTML = '';

    placedDecorations.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'placed-item-row' + (item.id === selectedDecorationId ? ' selected' : '');
      row.innerHTML = `
        <span class="placed-item-title">#${index + 1} ${item.name}</span>
        <button type="button" class="btn-remove-item" title="Remove this decoration">🗑️</button>
      `;

      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-remove-item')) {
          e.stopPropagation();
          removeDecoration(item.id);
        } else {
          selectDecoration(item.id);
        }
      });
      placedItemsList.appendChild(row);
    });
  }

  function selectDecoration(id) {
    selectedDecorationId = id;
    const item = placedDecorations.find(d => d.id === id);
    if (!item || !adjustSection) {
      if (adjustSection) adjustSection.style.display = 'none';
      return;
    }

    adjustSection.style.display = 'flex';
    if (selectedItemTitle) selectedItemTitle.textContent = item.name;

    if (angleSlider) angleSlider.value = item.angle;
    if (angleVal) angleVal.textContent = `${item.angle}°`;
    if (radiusSlider) radiusSlider.value = item.radius;
    if (radiusVal) radiusVal.textContent = item.radius.toFixed(1);
    if (elevationSlider) elevationSlider.value = item.elevation;
    if (elevationVal) elevationVal.textContent = item.elevation.toFixed(1);
    if (scaleSlider) scaleSlider.value = item.scale;
    if (scaleVal) scaleVal.textContent = `${item.scale.toFixed(1)}x`;

    // Highlight row
    document.querySelectorAll('.placed-item-row').forEach((r, idx) => {
      r.classList.toggle('selected', placedDecorations[idx] && placedDecorations[idx].id === id);
    });
  }

  function updateSelectedTransform() {
    if (!selectedDecorationId) return;
    const item = placedDecorations.find(d => d.id === selectedDecorationId);
    if (!item || !item.mesh) return;

    item.angle = parseFloat(angleSlider.value) || 0;
    item.radius = parseFloat(radiusSlider.value) || 2.5;
    item.elevation = parseFloat(elevationSlider.value) || 0;
    item.scale = parseFloat(scaleSlider.value) || 1;

    if (angleVal) angleVal.textContent = `${item.angle}°`;
    if (radiusVal) radiusVal.textContent = item.radius.toFixed(1);
    if (elevationVal) elevationVal.textContent = item.elevation.toFixed(1);
    if (scaleVal) scaleVal.textContent = `${item.scale.toFixed(1)}x`;

    const rad = (item.angle * Math.PI) / 180;
    item.mesh.position.x = Math.cos(rad) * item.radius;
    item.mesh.position.z = Math.sin(rad) * item.radius;
    item.mesh.position.y = item.elevation;
    item.mesh.userData.baseY = item.elevation;
    item.mesh.scale.setScalar(item.scale);
  }

  function removeDecoration(id) {
    const idx = placedDecorations.findIndex(d => d.id === id);
    if (idx === -1) return;
    const item = placedDecorations[idx];
    if (item.mesh && decorationsGroup) {
      decorationsGroup.remove(item.mesh);
    }
    placedDecorations.splice(idx, 1);
    if (selectedDecorationId === id) {
      selectedDecorationId = placedDecorations.length > 0 ? placedDecorations[0].id : null;
    }
    updatePlacedListUI();
    if (selectedDecorationId) {
      selectDecoration(selectedDecorationId);
    }
    showBuildStatus(`Removed ${item.name}.`);
  }

  function clearAllDecorations() {
    if (decorationsGroup) {
      while (decorationsGroup.children.length > 0) {
        decorationsGroup.remove(decorationsGroup.children[0]);
      }
    }
    placedDecorations = [];
    selectedDecorationId = null;
    updatePlacedListUI();
    showBuildStatus('Cleared all decorations. Add new ones from the palette! 🌸');
  }

  async function saveDecorations() {
    const payload = placedDecorations.map(d => ({
      id: d.id,
      type: d.type,
      name: d.name,
      angle: d.angle,
      radius: d.radius,
      elevation: d.elevation,
      scale: d.scale
    }));

    // Save to local storage for fast instant load
    try {
      localStorage.setItem('universe_galaxy_decorations', JSON.stringify(payload));
    } catch (e) {}

    // Save to backend API
    try {
      const res = await fetch('/api/galaxy/decorations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decorations: payload })
      });
      if (res.ok) {
        showBuildStatus('World Saved! 💖 Shared galaxy decorations are now live in our universe.');
        return;
      }
    } catch (e) {}

    showBuildStatus('Saved to browser storage! 💖');
  }

  async function loadSavedDecorations() {
    let loaded = false;
    // 1. Try server API
    try {
      const res = await fetch('/api/galaxy/decorations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.decorations) && data.decorations.length > 0) {
          data.decorations.forEach(dec => addDecorationToScene(dec, false));
          loaded = true;
        }
      }
    } catch (e) {}

    // 2. Try localStorage if server had no items
    if (!loaded) {
      try {
        const local = JSON.parse(localStorage.getItem('universe_galaxy_decorations') || '[]');
        if (Array.isArray(local) && local.length > 0) {
          local.forEach(dec => addDecorationToScene(dec, false));
          loaded = true;
        }
      } catch (e) {}
    }

    // 3. Default starter decoration if first time
    if (!loaded) {
      addDecorationToScene({ type: 'heart_crystal', name: 'Heart Crystal 💖', angle: 45, radius: 2.2, elevation: 0.3, scale: 1.1 }, false);
      addDecorationToScene({ type: 'ring_planet', name: 'Ring Planet 🪐', angle: 210, radius: 3.1, elevation: -0.2, scale: 1.0 }, false);
    }

    updatePlacedListUI();
  }

  function showBuildStatus(msg) {
    if (!buildStatusMsg) return;
    buildStatusMsg.textContent = msg;
    setTimeout(() => {
      if (buildStatusMsg && buildStatusMsg.textContent === msg) {
        buildStatusMsg.textContent = '';
      }
    }, 4000);
  }

  // Bind Build Our World UI
  function toggleBuildPanel() {
    if (!buildPanel) return;
    const isShown = buildPanel.style.display !== 'none';
    buildPanel.style.display = isShown ? 'none' : 'flex';
    if (btnBuildWorld) btnBuildWorld.classList.toggle('active', !isShown);
    if (canvasBtnBuildWorld) canvasBtnBuildWorld.classList.toggle('active', !isShown);
    // Hide Time Travel if active
    if (!isShown && timeTravelHud) {
      timeTravelHud.style.display = 'none';
      if (btnTimeTravel) btnTimeTravel.classList.remove('active');
      if (canvasBtnTimeTravel) canvasBtnTimeTravel.classList.remove('active');
    }
  }

  if (btnBuildWorld) btnBuildWorld.addEventListener('click', toggleBuildPanel);
  if (canvasBtnBuildWorld) canvasBtnBuildWorld.addEventListener('click', toggleBuildPanel);
  if (btnCloseBuildPanel) btnCloseBuildPanel.addEventListener('click', toggleBuildPanel);

  paletteButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      if (type) addDecorationToScene({ type }, true);
    });
  });

  [angleSlider, radiusSlider, elevationSlider, scaleSlider].forEach(sl => {
    if (sl) sl.addEventListener('input', updateSelectedTransform);
  });

  if (btnSaveDecs) btnSaveDecs.addEventListener('click', saveDecorations);
  if (btnClearDecs) btnClearDecs.addEventListener('click', clearAllDecorations);
  if (btnRemoveSelected) btnRemoveSelected.addEventListener('click', () => {
    if (selectedDecorationId) removeDecoration(selectedDecorationId);
  });

  // =========================================================================
  // FEATURE 2: TIME TRAVEL 🌀 - PORTAL TIMELINE & ACTUAL MEMORIES WARP
  // =========================================================================
  const btnTimeTravel = document.getElementById('btn-time-travel');
  const canvasBtnTimeTravel = document.getElementById('canvas-btn-time-travel');
  const timeTravelHud = document.getElementById('time-travel-hud');
  const btnCloseTimeTravel = document.getElementById('btn-close-time-travel');
  const timelineStrip = document.getElementById('time-travel-timeline-strip');
  const portalCurrentDest = document.getElementById('portal-current-dest');
  const revealCard = document.getElementById('time-travel-reveal-card');
  const revealDateBadge = document.getElementById('reveal-date-badge');
  const revealConstellationBadge = document.getElementById('reveal-constellation-badge');
  const revealTitleText = document.getElementById('reveal-title-text');
  const revealNoteText = document.getElementById('reveal-note-text');
  const btnRevealOpenModal = document.getElementById('btn-reveal-open-modal');
  const btnRevealReset = document.getElementById('btn-reveal-reset');

  let activeMemoryStar = null;

  function renderTimeTravelTimeline() {
    if (!timelineStrip) return;
    timelineStrip.innerHTML = '';

    MEMORY_STARS.forEach((star, idx) => {
      const node = document.createElement('div');
      node.className = 'time-travel-node' + (idx === 0 ? ' active' : '');
      node.innerHTML = `
        <span class="node-date">⏳ ${star.date}</span>
        <span class="node-title">${star.title}</span>
      `;
      node.addEventListener('click', () => {
        warpToMemory(star, node);
      });
      timelineStrip.appendChild(node);
    });
  }

  function warpToMemory(star, nodeElement) {
    if (!star || !camera) return;
    activeMemoryStar = star;

    // Update active node in strip
    if (timelineStrip) {
      timelineStrip.querySelectorAll('.time-travel-node').forEach(n => n.classList.remove('active'));
    }
    if (nodeElement) nodeElement.classList.add('active');

    if (portalCurrentDest) {
      portalCurrentDest.textContent = `Warping to ${star.date}... 🌀`;
    }
    if (revealCard) revealCard.style.display = 'none';

    // Compute destination camera vector hovering smoothly near the star
    const starWorldPos = new THREE.Vector3(star.x, star.y, star.z);
    if (galaxyGroup) {
      starWorldPos.applyMatrix4(galaxyGroup.matrixWorld);
    }

    const camOffset = new THREE.Vector3(0, 0.35, 1.35);
    const destCamPos = starWorldPos.clone().add(camOffset);

    warpTarget = {
      camPos: destCamPos,
      lookPos: starWorldPos.clone()
    };
    warpProgress = 0;
    isWarping = true;
    isResettingCamera = false;

    onWarpComplete = () => {
      if (portalCurrentDest) {
        portalCurrentDest.textContent = `${star.title} (${star.date}) ✨`;
      }
      if (revealCard) {
        revealCard.style.display = 'flex';
        if (revealDateBadge) revealDateBadge.textContent = star.date;
        if (revealConstellationBadge) revealConstellationBadge.textContent = star.constellation;
        if (revealTitleText) revealTitleText.textContent = star.title;
        if (revealNoteText) revealNoteText.textContent = star.note;
      }
    };
  }

  function resetTimeTravelView() {
    isWarping = false;
    isResettingCamera = true;
    if (portalGroup) portalGroup.visible = false;
    if (revealCard) revealCard.style.display = 'none';
    if (portalCurrentDest) {
      portalCurrentDest.textContent = 'Present Day (Orbit Overview) 🌌';
    }
  }

  function toggleTimeTravelHud() {
    if (!timeTravelHud) return;
    const isShown = timeTravelHud.style.display !== 'none';
    timeTravelHud.style.display = isShown ? 'none' : 'flex';
    if (btnTimeTravel) btnTimeTravel.classList.toggle('active', !isShown);
    if (canvasBtnTimeTravel) canvasBtnTimeTravel.classList.toggle('active', !isShown);

    if (!isShown) {
      renderTimeTravelTimeline();
      // Hide World Builder if active
      if (buildPanel) {
        buildPanel.style.display = 'none';
        if (btnBuildWorld) btnBuildWorld.classList.remove('active');
        if (canvasBtnBuildWorld) canvasBtnBuildWorld.classList.remove('active');
      }
      // Start at first memory
      if (MEMORY_STARS.length > 0) {
        const firstNode = timelineStrip ? timelineStrip.querySelector('.time-travel-node') : null;
        warpToMemory(MEMORY_STARS[0], firstNode);
      }
    } else {
      resetTimeTravelView();
    }
  }

  if (btnTimeTravel) btnTimeTravel.addEventListener('click', toggleTimeTravelHud);
  if (canvasBtnTimeTravel) canvasBtnTimeTravel.addEventListener('click', toggleTimeTravelHud);
  if (btnCloseTimeTravel) btnCloseTimeTravel.addEventListener('click', toggleTimeTravelHud);
  if (btnRevealReset) btnRevealReset.addEventListener('click', resetTimeTravelView);
  if (btnRevealOpenModal) {
    btnRevealOpenModal.addEventListener('click', () => {
      if (activeMemoryStar) {
        openMemoryModal(activeMemoryStar);
      }
    });
  }

  // Initialize Galaxy and Load Decorations
  initGalaxy();
  loadSavedDecorations();


  // =========================================================================
  // 4. OUR LITTLE WORLD GALAXY 💗 (Interactive 3D Universe)
  // =========================================================================
  function initOurWorldGalaxy() {
    const worldCanvas = document.getElementById('our-world-3d-canvas');
    if (!worldCanvas || typeof THREE === 'undefined') return;

    // DOM controls
    const hudStatusText = document.getElementById('hud-planet-status-text');
    const btnResetOrbit = document.getElementById('btn-world-reset-orbit');
    const planetCard = document.getElementById('world-planet-card');
    const planetCardIcon = document.getElementById('planet-card-icon');
    const planetCardType = document.getElementById('planet-card-type');
    const planetCardTitle = document.getElementById('planet-card-title');
    const planetCardDesc = document.getElementById('planet-card-desc');
    const planetCardStat = document.getElementById('planet-card-stat');
    const planetCardStatus = document.getElementById('planet-card-status');
    const btnPlanetExplore = document.getElementById('btn-planet-explore');
    const btnPlanetFocus = document.getElementById('btn-planet-focus');
    const btnCloseCard = document.getElementById('btn-close-planet-card');
    const planetPillsContainer = document.getElementById('our-world-planet-pills');

    // Real data helper (reads from actual saved localStorage data, no fake data)
    function getRealDataCount(key, fallbackText) {
      try {
        if (!key) return fallbackText;
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return `${parsed.length} Saved in Browser`;
          } else if (typeof parsed === 'object') {
            const count = Object.keys(parsed).length;
            return `${count} Active Items`;
          }
        }
      } catch (e) {}
      return fallbackText;
    }

    // Dynamic counts update on companion cards below canvas
    const countMemories = document.getElementById('count-memories');
    if (countMemories) countMemories.textContent = getRealDataCount('universe_memories', '6 Scrapbook Memories');

    const countLetters = document.getElementById('count-letters');
    if (countLetters) countLetters.textContent = getRealDataCount('universe_open_when_letters', '4 Love Letters Ready');

    const countDays = document.getElementById('count-days');
    if (countDays) countDays.textContent = getRealDataCount('universe_timeline_milestones', 'Our Love Timeline');

    const countVault = document.getElementById('count-vault');
    if (countVault) countVault.textContent = getRealDataCount('universe_vault_folders', 'PIN-Protected Vault');

    // 6 Interactive Planets Data Specification
    const PLANET_DEFINITIONS = [
      {
        id: 'memories',
        name: 'Our Memories',
        icon: '🌸',
        subtitle: 'Interactive Scrapbook & Photo Galaxy',
        desc: 'Revisit all our cherished snapshots, polaroid memories, and scrapbook highlights that make our love story timeless.',
        color: 0xff758f,
        radius: 0.62,
        orbitRadius: 4.2,
        orbitSpeed: 0.38,
        orbitAngle: 0.4,
        inclination: 0.12,
        hasRing: true,
        ringColor: 0xffb3c6,
        link: 'index.html#memories-gallery',
        statKey: 'universe_memories',
        defaultCount: '6 Photo Memories Recorded'
      },
      {
        id: 'letters',
        name: 'Love Letters',
        icon: '💌',
        subtitle: 'Diary & Open-When Letters',
        desc: 'Read secret romantic letters, open-when wax-sealed notes, and private diary entries written straight from the heart.',
        color: 0xffb703,
        radius: 0.54,
        orbitRadius: 5.8,
        orbitSpeed: 0.30,
        orbitAngle: 1.6,
        inclination: -0.15,
        hasRing: false,
        link: 'diary.html',
        statKey: 'universe_open_when_letters',
        defaultCount: '4 Romantic Letters Ready'
      },
      {
        id: 'special_days',
        name: 'Special Days',
        icon: '🎂',
        subtitle: 'Love Timeline & Milestones',
        desc: 'Track our first meeting, romantic anniversaries, milestone moments, and countdown to upcoming sweet celebrations.',
        color: 0xfb7185,
        radius: 0.64,
        orbitRadius: 7.4,
        orbitSpeed: 0.24,
        orbitAngle: 2.9,
        inclination: 0.20,
        hasRing: true,
        ringColor: 0xfecdd3,
        link: 'timeline.html',
        statKey: 'universe_timeline_milestones',
        defaultCount: 'Love Timeline & Milestones'
      },
      {
        id: 'dreams',
        name: 'Our Dreams',
        icon: '✨',
        subtitle: 'Date Wheel & Couple Games',
        desc: 'Spin the date wheel for cozy spontaneous adventures, play Truth or Dare, and conquer daily romantic couple challenges.',
        color: 0xa855f7,
        radius: 0.56,
        orbitRadius: 9.0,
        orbitSpeed: 0.19,
        orbitAngle: 4.2,
        inclination: -0.10,
        hasRing: false,
        link: 'games.html',
        statKey: null,
        defaultCount: 'Date Wheel & 200 Questions'
      },
      {
        id: 'moments',
        name: 'Our Moments',
        icon: '💗',
        subtitle: '3D Love Room Sanctuary',
        desc: 'Step into our interactive 3D couple bedroom with cozy fireplace warmth, glowing fairy lights, and soothing background music.',
        color: 0xf43f5e,
        radius: 0.68,
        orbitRadius: 10.6,
        orbitSpeed: 0.15,
        orbitAngle: 5.3,
        inclination: 0.16,
        hasRing: true,
        ringColor: 0xff99aa,
        link: 'room.html',
        statKey: null,
        defaultCount: '3D Love Room & Music'
      },
      {
        id: 'secret_world',
        name: 'Secret World',
        icon: '🔐',
        subtitle: 'Private Love Vault',
        desc: 'A secure PIN-protected vault safeguarding our most private polaroids, intimate letters, and confidential memories.',
        color: 0x6366f1,
        radius: 0.58,
        orbitRadius: 12.2,
        orbitSpeed: 0.12,
        orbitAngle: 0.9,
        inclination: -0.22,
        hasRing: true,
        ringColor: 0xc7d2fe,
        link: 'vault.html',
        statKey: 'universe_vault_folders',
        defaultCount: 'PIN-Protected Vault Safe'
      }
    ];

    // Three.js instances
    let worldScene, worldCamera, worldRenderer;
    let worldUniverseGroup;
    let interactiveMeshes = [];
    let planetMeshMap = {};
    let centralPlanetMesh;
    let centralRing;
    let charactersGroup;
    let miniHeart;
    let starPoints;

    const width = worldCanvas.clientWidth || 800;
    const height = worldCanvas.clientHeight || 540;

    worldScene = new THREE.Scene();
    worldScene.background = new THREE.Color(0x070312); // Midnight cosmic purple-blue

    worldCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const defaultCamPos = new THREE.Vector3(0, 9, 17);
    const defaultCamLook = new THREE.Vector3(0, 0, 0);
    worldCamera.position.copy(defaultCamPos);
    worldCamera.lookAt(defaultCamLook);

    worldRenderer = new THREE.WebGLRenderer({ canvas: worldCanvas, antialias: true, alpha: true });
    worldRenderer.setSize(width, height);
    worldRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    worldUniverseGroup = new THREE.Group();
    worldScene.add(worldUniverseGroup);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xe0d4fc, 0.7);
    worldScene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5f0, 1.2);
    sunLight.position.set(12, 16, 12);
    worldScene.add(sunLight);

    const coreLight = new THREE.PointLight(0xff758f, 1.4, 25);
    coreLight.position.set(0, 0, 0);
    worldScene.add(coreLight);

    // Background floating stars (1,200 particle stars)
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const palette = [
      new THREE.Color(0xffb6c1), // soft pink
      new THREE.Color(0xd8b4fe), // lavender
      new THREE.Color(0xfef08a), // starlight gold
      new THREE.Color(0xa7f3d0), // mint sparkle
      new THREE.Color(0xffffff)  // crisp diamond
    ];

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 25 + Math.random() * 35;

      starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      starColors[i3] = color.r;
      starColors[i3 + 1] = color.g;
      starColors[i3 + 2] = color.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    starPoints = new THREE.Points(starGeo, starMat);
    worldUniverseGroup.add(starPoints);

    // Nebula Cloud Ring in Background
    const nebulaGeo = new THREE.RingGeometry(14, 22, 32);
    const nebulaMat = new THREE.MeshBasicMaterial({
      color: 0x86198f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });
    const nebulaRing = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebulaRing.rotation.x = Math.PI / 2.3;
    worldUniverseGroup.add(nebulaRing);

    // =========================================================================
    // Central Shared Planet: Our Little Universe Core 💗 (with Dudu & Budu)
    // =========================================================================
    const centralPlanetGroup = new THREE.Group();
    worldUniverseGroup.add(centralPlanetGroup);

    // Central Sphere
    const centralGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const centralMat = new THREE.MeshStandardMaterial({
      color: 0xff8fa3,
      roughness: 0.5,
      metalness: 0.05
    });
    centralPlanetMesh = new THREE.Mesh(centralGeo, centralMat);
    centralPlanetMesh.userData = {
      isCentral: true,
      id: 'central_world',
      name: 'Our Shared Home World',
      icon: '🪐',
      subtitle: 'Where Dudu & Budu Live Forever',
      desc: 'The magical heart of our little universe where Dudu and Budu sit side by side, watching over every memory, love letter, and dream we share.',
      stat: '💗 2 Souls, 1 Universe',
      status: '✨ Forever Together',
      link: 'shared.html'
    };
    centralPlanetGroup.add(centralPlanetMesh);
    interactiveMeshes.push(centralPlanetMesh);

    // Central Atmosphere Glow Shell
    const auraGeo = new THREE.SphereGeometry(1.68, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xff9ebb,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    centralPlanetGroup.add(auraMesh);

    // Central Saturn-like Ring
    const centralRingGeo = new THREE.RingGeometry(2.1, 2.9, 48);
    const centralRingMat = new THREE.MeshBasicMaterial({
      color: 0xfecdd3,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45
    });
    centralRing = new THREE.Mesh(centralRingGeo, centralRingMat);
    centralRing.rotation.x = Math.PI / 2.5;
    centralRing.rotation.y = 0.2;
    centralPlanetGroup.add(centralRing);

    // Mini Dudu & Budu on Top of Central Planet!
    charactersGroup = new THREE.Group();
    charactersGroup.position.set(0, 1.48, 0); // Sits right on the top surface
    centralPlanetGroup.add(charactersGroup);

    // Helper: Cute Mini Teddy Builder
    function createMiniBear(furColor, clothesColor, isBudu) {
      const bear = new THREE.Group();

      // Body (chubby cylinder)
      const bBodyGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.32, 16);
      const bBodyMat = new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.6 });
      const bBody = new THREE.Mesh(bBodyGeo, bBodyMat);
      bBody.position.y = 0.16;
      bear.add(bBody);

      // Head
      const bHeadGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const bHeadMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.55 });
      const bHead = new THREE.Mesh(bHeadGeo, bHeadMat);
      bHead.position.y = 0.45;
      bear.add(bHead);

      // Ears (2 spheres)
      const earGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const earL = new THREE.Mesh(earGeo, bHeadMat);
      earL.position.set(-0.16, 0.62, 0);
      bear.add(earL);

      const earR = new THREE.Mesh(earGeo, bHeadMat);
      earR.position.set(0.16, 0.62, 0);
      bear.add(earR);

      // Snout / Muzzle
      const snoutGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const snoutMat = new THREE.MeshStandardMaterial({ color: isBudu ? 0xfff0f5 : 0xdfba9e, roughness: 0.6 });
      const snout = new THREE.Mesh(snoutGeo, snoutMat);
      snout.position.set(0, 0.42, 0.18);
      snout.scale.set(1.2, 0.9, 0.8);
      bear.add(snout);

      // Nose
      const noseGeo = new THREE.SphereGeometry(0.03, 8, 8);
      const noseMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
      const nose = new THREE.Mesh(noseGeo, noseMat);
      nose.position.set(0, 0.45, 0.25);
      bear.add(nose);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.025, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

      const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
      eyeL.position.set(-0.08, 0.48, 0.21);
      bear.add(eyeL);

      const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
      eyeR.position.set(0.08, 0.48, 0.21);
      bear.add(eyeR);

      // Blush
      const blushGeo = new THREE.CircleGeometry(0.04, 12);
      const blushMat = new THREE.MeshBasicMaterial({ color: isBudu ? 0xff8fa3 : 0xf4a261, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
      const blushL = new THREE.Mesh(blushGeo, blushMat);
      blushL.position.set(-0.14, 0.41, 0.19);
      bear.add(blushL);

      const blushR = new THREE.Mesh(blushGeo, blushMat);
      blushR.position.set(0.14, 0.41, 0.19);
      bear.add(blushR);

      // Signature Pink Bow for Budu
      if (isBudu) {
        const bowGroup = new THREE.Group();
        const bowMat = new THREE.MeshStandardMaterial({ color: 0xff3b6f, roughness: 0.4 });
        const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), bowMat);
        const bowL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 8), bowMat);
        bowL.rotation.z = Math.PI / 2;
        bowL.position.x = -0.06;

        const bowR = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.1, 8), bowMat);
        bowR.rotation.z = -Math.PI / 2;
        bowR.position.x = 0.06;

        bowGroup.add(bowCenter, bowL, bowR);
        bowGroup.position.set(0.12, 0.64, 0.08);
        bowGroup.rotation.z = -0.2;
        bear.add(bowGroup);
      }

      return bear;
    }

    // Budu: White cute bear with pink sweater & bow
    const buduBear = createMiniBear(0xfffdfa, 0xff9ebb, true);
    buduBear.position.set(-0.35, 0, 0);
    buduBear.rotation.y = 0.3;
    charactersGroup.add(buduBear);

    // Dudu: Warm brown bear with dark chocolate hoodie
    const duduBear = createMiniBear(0x6b4423, 0x3e2723, false);
    duduBear.position.set(0.35, 0, 0);
    duduBear.rotation.y = -0.3;
    charactersGroup.add(duduBear);

    // Floating heart between Dudu & Budu
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.05, -0.1, -0.05, -0.1, 0.05);
    heartShape.bezierCurveTo(-0.1, 0.15, 0, 0.22, 0, 0.28);
    heartShape.bezierCurveTo(0, 0.22, 0.1, 0.15, 0.1, 0.05);
    heartShape.bezierCurveTo(0.1, -0.05, 0, -0.05, 0, 0);

    const heartGeo = new THREE.ShapeGeometry(heartShape);
    const heartMat = new THREE.MeshBasicMaterial({ color: 0xff3b6f, side: THREE.DoubleSide });
    miniHeart = new THREE.Mesh(heartGeo, heartMat);
    miniHeart.position.set(0, 0.82, 0.1);
    miniHeart.rotation.z = Math.PI; // flip rightside up
    charactersGroup.add(miniHeart);

    // =========================================================================
    // Orbiting Interactive Planets (6 Unique Worlds)
    // =========================================================================
    const planetObjects = [];

    PLANET_DEFINITIONS.forEach(def => {
      // Orbit Track Line
      const orbitCurve = new THREE.EllipseCurve(
        0, 0,
        def.orbitRadius, def.orbitRadius,
        0, 2 * Math.PI,
        false, 0
      );
      const orbitPoints = orbitCurve.getPoints(64);
      const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitLineMat = new THREE.LineBasicMaterial({
        color: 0xff8fb1,
        transparent: true,
        opacity: 0.25
      });
      const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
      orbitLine.rotation.x = Math.PI / 2 + def.inclination;
      worldUniverseGroup.add(orbitLine);

      // Planet Orbit Pivot
      const pivot = new THREE.Group();
      pivot.rotation.x = def.inclination;
      worldUniverseGroup.add(pivot);

      // Planet Mesh Container
      const planetAnchor = new THREE.Group();
      pivot.add(planetAnchor);

      // Planet Sphere Mesh
      const pGeo = new THREE.SphereGeometry(def.radius, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: def.color,
        roughness: 0.45,
        metalness: 0.1
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.userData = {
        isPlanet: true,
        id: def.id,
        name: def.name,
        icon: def.icon,
        subtitle: def.subtitle,
        desc: def.desc,
        stat: getRealDataCount(def.statKey, def.defaultCount),
        status: '✨ Connected & Active',
        link: def.link,
        anchor: planetAnchor,
        orbitRadius: def.orbitRadius
      };
      planetAnchor.add(pMesh);
      interactiveMeshes.push(pMesh);
      planetMeshMap[def.id] = pMesh;

      // Outer Glow Halo
      const haloGeo = new THREE.RingGeometry(def.radius * 1.15, def.radius * 1.45, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: def.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.lookAt(worldCamera.position);
      planetAnchor.add(halo);

      // Optional Ring
      if (def.hasRing) {
        const ringGeo = new THREE.RingGeometry(def.radius * 1.35, def.radius * 1.9, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: def.ringColor || def.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.55
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        planetAnchor.add(ring);
      }

      planetObjects.push({
        def,
        pivot,
        anchor: planetAnchor,
        mesh: pMesh,
        halo,
        angle: def.orbitAngle
      });
    });

    // =========================================================================
    // Camera Controls, Raycasting & Planet Focus
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let spherical = { radius: 17, theta: 0, phi: Math.PI / 3.2 };

    let targetLookAt = new THREE.Vector3(0, 0, 0);
    let currentLookAt = new THREE.Vector3(0, 0, 0);
    let focusedMesh = null;
    let hoveredMesh = null;

    function updateCameraFromSpherical() {
      const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      const y = spherical.radius * Math.cos(spherical.phi);
      const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      worldCamera.position.set(x + currentLookAt.x, y + currentLookAt.y, z + currentLookAt.z);
      worldCamera.lookAt(currentLookAt);
    }

    worldCanvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        spherical.theta -= dx * 0.006;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.006));
        prevMouse = { x: e.clientX, y: e.clientY };
      }

      // Check Hover on canvas
      const rect = worldCanvas.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, worldCamera);
        const hits = raycaster.intersectObjects(interactiveMeshes, false);
        if (hits.length > 0) {
          worldCanvas.style.cursor = 'pointer';
          const hitMesh = hits[0].object;
          if (hoveredMesh !== hitMesh) {
            hoveredMesh = hitMesh;
            if (hudStatusText && hitMesh.userData) {
              hudStatusText.textContent = `${hitMesh.userData.icon || '🪐'} ${hitMesh.userData.name} • Click to Explore`;
            }
          }
        } else {
          worldCanvas.style.cursor = isDragging ? 'grabbing' : 'grab';
          if (hoveredMesh) {
            hoveredMesh = null;
            if (hudStatusText && !focusedMesh) {
              hudStatusText.textContent = '🪐 6 Interactive Planets • Central Home World';
            }
          }
        }
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      worldCanvas.style.cursor = 'grab';
    });

    worldCanvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      spherical.radius = Math.max(6, Math.min(26, spherical.radius + e.deltaY * 0.015));
    }, { passive: false });

    // Touch support for mobile
    worldCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    worldCanvas.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        spherical.theta -= dx * 0.008;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy * 0.008));
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    worldCanvas.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Planet Focus & Card Display
    function selectPlanet(planetData, mesh) {
      focusedMesh = mesh;
      planetCardIcon.textContent = planetData.icon || '🪐';
      planetCardType.textContent = planetData.isCentral ? 'Central Shared World' : 'Interactive Celestial Planet';
      planetCardTitle.textContent = planetData.name;
      planetCardDesc.textContent = planetData.desc;
      planetCardStat.textContent = planetData.stat;
      planetCardStatus.textContent = planetData.status;
      btnPlanetExplore.href = planetData.link;
      planetCard.style.display = 'block';

      if (hudStatusText) {
        hudStatusText.textContent = `${planetData.icon} Focusing ${planetData.name} • Ready to Explore`;
      }

      // Update pills
      if (planetPillsContainer) {
        planetPillsContainer.querySelectorAll('.planet-pill-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-planet-id') === planetData.id);
        });
      }

      // Move camera closer to planet
      spherical.radius = planetData.isCentral ? 8 : 7;
    }

    function resetOrbitView() {
      focusedMesh = null;
      targetLookAt.set(0, 0, 0);
      spherical.radius = 17;
      spherical.theta = 0;
      spherical.phi = Math.PI / 3.2;
      planetCard.style.display = 'none';
      if (hudStatusText) {
        hudStatusText.textContent = '🪐 6 Interactive Planets • Central Home World';
      }
      if (planetPillsContainer) {
        planetPillsContainer.querySelectorAll('.planet-pill-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-planet-id') === 'all');
        });
      }
    }

    worldCanvas.addEventListener('click', (e) => {
      const rect = worldCanvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, worldCamera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj.userData) {
          selectPlanet(hitObj.userData, hitObj);
        }
      }
    });

    if (btnCloseCard) {
      btnCloseCard.addEventListener('click', () => {
        planetCard.style.display = 'none';
      });
    }

    if (btnResetOrbit) {
      btnResetOrbit.addEventListener('click', resetOrbitView);
    }

    if (btnPlanetFocus) {
      btnPlanetFocus.addEventListener('click', () => {
        if (focusedMesh) {
          spherical.radius = 5.5;
        }
      });
    }

    // Connect Top Planet Filter Pills
    if (planetPillsContainer) {
      planetPillsContainer.querySelectorAll('.planet-pill-btn').forEach(pill => {
        pill.addEventListener('click', () => {
          const planetId = pill.getAttribute('data-planet-id');
          if (planetId === 'all') {
            resetOrbitView();
          } else {
            const mesh = planetMeshMap[planetId];
            if (mesh && mesh.userData) {
              selectPlanet(mesh.userData, mesh);
            }
          }
        });
      });
    }

    // Connect Companion Cards below 3D viewport
    document.querySelectorAll('.our-world-planet-item').forEach(item => {
      const key = item.getAttribute('data-planet-key');
      item.addEventListener('mouseenter', () => {
        const mesh = planetMeshMap[key];
        if (mesh && mesh.userData) {
          selectPlanet(mesh.userData, mesh);
        }
      });
    });

    // Window Resize Handler
    function onWorldResize() {
      if (!worldCanvas || !worldCamera || !worldRenderer) return;
      const pWidth = worldCanvas.parentElement ? worldCanvas.parentElement.clientWidth : 0;
      const w = worldCanvas.clientWidth || pWidth || 800;
      const h = worldCanvas.clientHeight || 540;
      if (w > 0 && h > 0) {
        worldCamera.aspect = w / h;
        worldCamera.updateProjectionMatrix();
        worldRenderer.setSize(w, h);
      }
    }

    window.addEventListener('resize', onWorldResize);
    setTimeout(onWorldResize, 200);

    // Animation Loop
    let clock = new THREE.Clock();

    function animateOurWorld() {
      requestAnimationFrame(animateOurWorld);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Spin central planet and starlight
      if (centralPlanetMesh) {
        centralPlanetMesh.rotation.y += 0.004;
      }
      if (centralRing) {
        centralRing.rotation.z += 0.002;
      }
      if (starPoints) {
        starPoints.rotation.y += 0.0003;
      }

      // Gentle breathing / love pulse for Dudu & Budu
      if (charactersGroup) {
        charactersGroup.position.y = 1.48 + Math.sin(elapsed * 2.5) * 0.02;
      }
      if (miniHeart) {
        miniHeart.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.15);
      }

      // Orbit and spin each interactive planet
      planetObjects.forEach(p => {
        p.angle += p.def.orbitSpeed * delta * 0.5;
        const x = Math.cos(p.angle) * p.def.orbitRadius;
        const z = Math.sin(p.angle) * p.def.orbitRadius;
        p.anchor.position.set(x, 0, z);

        p.mesh.rotation.y += 0.02;
        if (p.halo) {
          p.halo.lookAt(worldCamera.position);
        }
      });

      // Camera Smooth Follow if focused
      if (focusedMesh) {
        const worldPos = new THREE.Vector3();
        focusedMesh.getWorldPosition(worldPos);
        targetLookAt.lerp(worldPos, 0.08);
      } else {
        targetLookAt.lerp(defaultCamLook, 0.05);
      }

      currentLookAt.lerp(targetLookAt, 0.1);
      updateCameraFromSpherical();

      worldRenderer.render(worldScene, worldCamera);
    }

    animateOurWorld();
  }

  initOurWorldGalaxy();
});
