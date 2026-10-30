/**
 * OUR LITTLE UNIVERSE 💗 - 3D ROMANTIC WEBGL ENGINE
 * Powered by Three.js & CSS 3D Transforms
 * Featuring floating glass hearts, orbiting constellations, procedural clouds,
 * animated 3D butterflies, interactive depth tilt, and particle bursts.
 */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Check WebGL availability safely
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Create smooth 3D Puffy Heart Shape Geometry
  function createHeartGeometry(scale = 1, depth = 1.2) {
    const shape = new THREE.Shape();
    // Normalized smooth parametric heart curve
    const s = scale * 0.18;
    shape.moveTo(0, 3.2 * s);
    shape.bezierCurveTo(0, 3.2 * s, -1.8 * s, 6.2 * s, -5.2 * s, 6.2 * s);
    shape.bezierCurveTo(-9.2 * s, 6.2 * s, -9.2 * s, 1.2 * s, -9.2 * s, 1.2 * s);
    shape.bezierCurveTo(-9.2 * s, -3.2 * s, -5.2 * s, -7.8 * s, 0, -12.5 * s);
    shape.bezierCurveTo(5.2 * s, -7.8 * s, 9.2 * s, -3.2 * s, 9.2 * s, 1.2 * s);
    shape.bezierCurveTo(9.2 * s, 1.2 * s, 9.2 * s, 6.2 * s, 5.2 * s, 6.2 * s);
    shape.bezierCurveTo(1.8 * s, 6.2 * s, 0, 3.2 * s, 0, 3.2 * s);

    const extrudeSettings = {
      depth: depth * s * 3.5,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: s * 1.2,
      bevelThickness: s * 1.2
    };

    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geom.center();
    return geom;
  }

  // Create cute fluffy 3D Cloud
  function createCloudMesh(color = 0xffeef6, scale = 1) {
    const cloudGroup = new THREE.Group();
    const sphereGeom = new THREE.SphereGeometry(1.2 * scale, 12, 12);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
      flatShading: true
    });

    // Cluster of soft spheres
    const offsets = [
      [0, 0, 0, 1.4],
      [-1.4, -0.2, 0.2, 1.1],
      [1.4, -0.2, -0.2, 1.1],
      [-0.7, 0.6, 0.1, 1.2],
      [0.8, 0.5, -0.1, 1.2],
      [-2.2, -0.5, 0.1, 0.8],
      [2.2, -0.5, 0.1, 0.8]
    ];

    offsets.forEach(([x, y, z, r]) => {
      const mesh = new THREE.Mesh(sphereGeom, cloudMat);
      mesh.position.set(x * scale, y * scale, z * scale);
      mesh.scale.set(r, r * 0.85, r * 0.9);
      cloudGroup.add(mesh);
    });

    return cloudGroup;
  }

  // Create 3D Butterfly with flapping wings
  function createButterflyMesh(wingColor = 0xffaacc) {
    const butterfly = new THREE.Group();

    // Body
    const bodyGeom = new THREE.CylinderGeometry(0.08, 0.05, 0.8, 8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4a3b4e, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 4;
    butterfly.add(body);

    // Wings geometry (cute rounded triangular heart-like wing)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.bezierCurveTo(0.4, 0.8, 1.4, 1.2, 1.5, 0.4);
    wingShape.bezierCurveTo(1.6, -0.2, 1.1, -0.8, 0, 0);

    const wingGeom = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshStandardMaterial({
      color: wingColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      roughness: 0.3
    });

    const leftWingPivot = new THREE.Group();
    const leftWing = new THREE.Mesh(wingGeom, wingMat);
    leftWing.position.x = 0.05;
    leftWingPivot.add(leftWing);

    const rightWingPivot = new THREE.Group();
    const rightWing = new THREE.Mesh(wingGeom, wingMat);
    rightWing.scale.x = -1;
    rightWing.position.x = -0.05;
    rightWingPivot.add(rightWing);

    butterfly.add(leftWingPivot);
    butterfly.add(rightWingPivot);

    return {
      group: butterfly,
      leftWingPivot,
      rightWingPivot,
      update(time, speed = 14) {
        const flap = Math.sin(time * speed) * 0.7;
        leftWingPivot.rotation.y = flap;
        rightWingPivot.rotation.y = -flap;
      }
    };
  }

  // ==========================================================================
  // UNIVERSE 3D SYSTEM
  // ==========================================================================
  const Universe3D = {
    isSupported: isWebGLAvailable(),

    // ========================================================================
    // 1. IMMERSIVE 3D LOGIN SCENE
    // ========================================================================
    initLoginScene(canvasId = 'universe-3d-login-canvas') {
      if (!this.isSupported || typeof THREE === 'undefined') {
        console.log('🌸 Universe 3D: WebGL not active, using enhanced 2D canvas fallback.');
        return null;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;

      // Renderer setup with DPR clamp for high performance
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;

      // Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0, 16);

      // Ambient & Directional Lighting
      const ambientLight = new THREE.AmbientLight(0xfff0f5, 1.2);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
      dirLight.position.set(5, 8, 10);
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0xff69b4, 2.5, 25);
      pointLight.position.set(-2, 2, 5);
      scene.add(pointLight);

      const rimLight = new THREE.PointLight(0xdcd6ff, 2.0, 30);
      rimLight.position.set(4, -4, -4);
      scene.add(rimLight);

      // Central Glass Heart
      const heartGeom = createHeartGeometry(3.6, 1.6);
      const glassHeartMat = new THREE.MeshPhysicalMaterial({
        color: 0xff6b9d,
        emissive: 0xff2a6d,
        emissiveIntensity: 0.15,
        roughness: 0.12,
        metalness: 0.1,
        transmission: 0.65,
        transparent: true,
        opacity: 0.95,
        reflectivity: 0.8,
        clearcoat: 0.8,
        clearcoatRoughness: 0.1
      });
      const centralHeart = new THREE.Mesh(heartGeom, glassHeartMat);
      centralHeart.position.set(0, 1.2, 0);
      scene.add(centralHeart);

      // Orbiting Mini 3D Hearts
      const miniHearts = [];
      const miniHeartCount = 6;
      const miniGeom = createHeartGeometry(0.7, 0.8);
      const miniColors = [0xffb6c1, 0xff99bb, 0xffc0cb, 0xe6b8ff, 0xffd1dc, 0xff8da1];

      for (let i = 0; i < miniHeartCount; i++) {
        const miniMat = new THREE.MeshStandardMaterial({
          color: miniColors[i % miniColors.length],
          emissive: miniColors[i % miniColors.length],
          emissiveIntensity: 0.25,
          roughness: 0.25,
          metalness: 0.2
        });
        const mini = new THREE.Mesh(miniGeom, miniMat);
        const orbitRadius = 4.8 + (i % 3) * 1.2;
        const orbitSpeed = (i % 2 === 0 ? 1 : -1) * (0.4 + i * 0.08);
        const orbitTiltX = (i * 0.4) - 0.6;
        const orbitTiltZ = (i * 0.3) - 0.4;
        const phase = (i / miniHeartCount) * Math.PI * 2;

        scene.add(mini);
        miniHearts.push({
          mesh: mini,
          radius: orbitRadius,
          speed: orbitSpeed,
          tiltX: orbitTiltX,
          tiltZ: orbitTiltZ,
          phase
        });
      }

      // Background Soft Clouds
      const clouds = [];
      const cloudColors = [0xffedf6, 0xf6edff, 0xfff4e6, 0xf0f7ff];
      for (let i = 0; i < 5; i++) {
        const cloud = createCloudMesh(cloudColors[i % cloudColors.length], 0.7 + Math.random() * 0.6);
        cloud.position.set(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 10 - 2,
          -6 - Math.random() * 8
        );
        scene.add(cloud);
        clouds.push({
          mesh: cloud,
          speedX: 0.003 + Math.random() * 0.004,
          baseY: cloud.position.y,
          floatPhase: Math.random() * Math.PI * 2
        });
      }

      // Twinkling Starfield Particles
      const starCount = window.innerWidth < 768 ? 120 : 260;
      const starGeom = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);

      const colorPalette = [
        new THREE.Color(0xffd6e7),
        new THREE.Color(0xffb6d5),
        new THREE.Color(0xdcd6ff),
        new THREE.Color(0xffe29a),
        new THREE.Color(0xffffff)
      ];

      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 35;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        starColors[i * 3] = col.r;
        starColors[i * 3 + 1] = col.g;
        starColors[i * 3 + 2] = col.b;
      }

      starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.16,
        vertexColors: true,
        transparent: true,
        opacity: 0.85
      });
      const starField = new THREE.Points(starGeom, starMat);
      scene.add(starField);

      // Fluttering 3D Butterflies
      const butterflies = [];
      const butterflyColors = [0xff8da1, 0xb8b0ff, 0xffc482];
      for (let i = 0; i < 2; i++) {
        const bf = createButterflyMesh(butterflyColors[i]);
        bf.group.position.set(-6 + i * 12, 1 + i * 2, -2);
        bf.group.scale.setScalar(0.7);
        scene.add(bf.group);
        butterflies.push({
          obj: bf,
          angle: i * Math.PI,
          speed: 0.5 + i * 0.2,
          radiusX: 7 + i * 2,
          radiusY: 3.5,
          baseY: 0 + i * 2
        });
      }

      // Dynamic Particle Bursts on Click
      const burstParticles = [];
      function triggerHeartBurst(originX = 0, originY = 1.2, originZ = 0) {
        const burstCount = 28;
        const burstGeom = createHeartGeometry(0.35, 0.4);
        for (let i = 0; i < burstCount; i++) {
          const mat = new THREE.MeshStandardMaterial({
            color: miniColors[i % miniColors.length],
            emissive: miniColors[i % miniColors.length],
            emissiveIntensity: 0.5,
            roughness: 0.2
          });
          const p = new THREE.Mesh(burstGeom, mat);
          p.position.set(originX, originY, originZ);

          const phi = Math.random() * Math.PI * 2;
          const theta = (Math.random() - 0.5) * Math.PI;
          const speed = 0.15 + Math.random() * 0.22;

          burstParticles.push({
            mesh: p,
            velX: Math.cos(theta) * Math.cos(phi) * speed,
            velY: Math.sin(theta) * speed + 0.08,
            velZ: Math.cos(theta) * Math.sin(phi) * speed,
            rotVelX: (Math.random() - 0.5) * 0.2,
            rotVelY: (Math.random() - 0.5) * 0.2,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.01
          });
          scene.add(p);
        }
      }

      // Parallax Mouse / Pointer Tracking
      let mouseX = 0;
      let mouseY = 0;
      let targetRotX = 0;
      let targetRotY = 0;

      if (!isTouchDevice && !prefersReducedMotion) {
        window.addEventListener('mousemove', (e) => {
          mouseX = (e.clientX / window.innerWidth) * 2 - 1;
          mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
          targetRotY = mouseX * 0.35;
          targetRotX = mouseY * 0.2;
        }, { passive: true });
      }

      // Raycasting for Heart Click Interaction
      const raycaster = new THREE.Raycaster();
      const mouseVector = new THREE.Vector2();

      function onPointerClick(e) {
        mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouseVector, camera);

        const intersects = raycaster.intersectObject(centralHeart);
        if (intersects.length > 0) {
          triggerHeartBurst(centralHeart.position.x, centralHeart.position.y, centralHeart.position.z);
          // Scale bounce
          centralHeart.scale.set(1.2, 1.2, 1.2);
          setTimeout(() => centralHeart.scale.set(1, 1, 1), 300);
        }
      }
      window.addEventListener('click', onPointerClick);

      // Card 3D Tilt Integration
      const authCard = document.querySelector('.auth-card');
      if (authCard && !isTouchDevice && !prefersReducedMotion) {
        window.addEventListener('mousemove', (e) => {
          const rect = authCard.getBoundingClientRect();
          const cardX = e.clientX - rect.left - rect.width / 2;
          const cardY = e.clientY - rect.top - rect.height / 2;
          const tiltX = (cardY / (rect.height / 2)) * -6;
          const tiltY = (cardX / (rect.width / 2)) * 6;
          authCard.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
          authCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
      }

      // Responsive Resize
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onWindowResize);

      // Animation Loop with Visibility Pause
      let animationFrameId = null;
      let clock = new THREE.Clock();

      function animate() {
        if (document.hidden) {
          animationFrameId = requestAnimationFrame(animate);
          return;
        }

        const elapsedTime = clock.getElapsedTime();

        // Rotate & Float Central Heart
        centralHeart.rotation.y = elapsedTime * 0.35;
        centralHeart.rotation.z = Math.sin(elapsedTime * 0.8) * 0.08;
        centralHeart.position.y = 1.2 + Math.sin(elapsedTime * 1.5) * 0.35;

        // Smooth camera parallax
        camera.rotation.y += (targetRotY - camera.rotation.y) * 0.04;
        camera.rotation.x += (targetRotX - camera.rotation.x) * 0.04;

        // Orbiting Mini Hearts
        miniHearts.forEach((item) => {
          const t = elapsedTime * item.speed + item.phase;
          const x = Math.cos(t) * item.radius;
          const z = Math.sin(t) * item.radius;
          const y = Math.sin(t * 1.5) * 1.4;

          item.mesh.position.set(
            x * Math.cos(item.tiltZ) - y * Math.sin(item.tiltZ),
            y * Math.cos(item.tiltX) + z * Math.sin(item.tiltX) + 1.2,
            z * Math.cos(item.tiltX) - y * Math.sin(item.tiltX)
          );
          item.mesh.rotation.y = t * 1.5;
          item.mesh.rotation.x = t * 0.5;
        });

        // Drift Clouds
        clouds.forEach((c) => {
          c.mesh.position.x += c.speedX;
          c.mesh.position.y = c.baseY + Math.sin(elapsedTime * 0.6 + c.floatPhase) * 0.4;
          if (c.mesh.position.x > 18) c.mesh.position.x = -18;
        });

        // Twinkle Stars
        starField.rotation.y = elapsedTime * 0.02;

        // Butterflies
        butterflies.forEach((b) => {
          b.angle += 0.012 * b.speed;
          b.obj.group.position.x = Math.cos(b.angle) * b.radiusX;
          b.obj.group.position.z = Math.sin(b.angle) * 4 - 2;
          b.obj.group.position.y = b.baseY + Math.sin(b.angle * 2) * 1.8;
          b.obj.group.rotation.y = -b.angle + Math.PI / 2;
          b.obj.update(elapsedTime);
        });

        // Burst Particles Physics
        for (let i = burstParticles.length - 1; i >= 0; i--) {
          const p = burstParticles[i];
          p.mesh.position.x += p.velX;
          p.mesh.position.y += p.velY;
          p.mesh.position.z += p.velZ;
          p.velY -= 0.004; // Gentle gravity
          p.mesh.rotation.x += p.rotVelX;
          p.mesh.rotation.y += p.rotVelY;
          p.life -= p.decay;

          p.mesh.scale.setScalar(Math.max(0.01, p.life));
          if (p.life <= 0) {
            scene.remove(p.mesh);
            burstParticles.splice(i, 1);
          }
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
      }

      animate();

      return {
        scene,
        camera,
        renderer,
        triggerBurst: triggerHeartBurst,
        destroy() {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', onWindowResize);
          window.removeEventListener('click', onPointerClick);
        }
      };
    },

    // ========================================================================
    // 2. 3D WARP TRANSITION AFTER LOGIN
    // ========================================================================
    playLoginTransition(onComplete) {
      const overlay = document.createElement('div');
      overlay.className = 'universe-3d-portal-overlay';
      overlay.innerHTML = `
        <div class="portal-stars-burst"></div>
        <div class="portal-heart-vortex">
          <span class="portal-heart-icon">💖</span>
        </div>
        <div class="portal-welcome-text">
          <h2>Entering Our Little Universe... ✨</h2>
          <p>Gathering starlight &amp; sweet memories</p>
        </div>
      `;
      document.body.appendChild(overlay);

      // Trigger animation
      requestAnimationFrame(() => {
        overlay.classList.add('portal-active');
      });

      // Navigate after smooth cinematic duration
      setTimeout(() => {
        if (typeof onComplete === 'function') {
          onComplete();
        }
      }, 1000);
    },

    // ========================================================================
    // 3. 3D HOMEPAGE HERO SCENE
    // ========================================================================
    initHeroScene(canvasId = 'universe-3d-hero-canvas') {
      if (!this.isSupported || typeof THREE === 'undefined') {
        console.log('🌸 Hero 3D: WebGL not active, using enhanced 2D canvas fallback.');
        return null;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth || window.innerWidth, canvas.clientHeight || 650);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || 650), 0.1, 100);
      camera.position.set(0, 0, 15);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xfff5f8, 1.4);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 1.3);
      sunLight.position.set(6, 8, 8);
      scene.add(sunLight);

      const glowLight = new THREE.PointLight(0xff69b4, 2.8, 25);
      glowLight.position.set(0, 0, 4);
      scene.add(glowLight);

      // Central Heart Planet
      const heartGeom = createHeartGeometry(3.8, 1.8);
      const heartPlanetMat = new THREE.MeshPhysicalMaterial({
        color: 0xff6699,
        emissive: 0xff3366,
        emissiveIntensity: 0.18,
        roughness: 0.15,
        transmission: 0.5,
        transparent: true,
        opacity: 0.94,
        clearcoat: 0.7,
        clearcoatRoughness: 0.15
      });
      const heartPlanet = new THREE.Mesh(heartGeom, heartPlanetMat);
      heartPlanet.position.set(0, 0, 0);
      scene.add(heartPlanet);

      // Planetary Golden & Diamond Orbit Rings
      const ringGroup = new THREE.Group();
      const ringCount = 18;
      const ringGeom = new THREE.SphereGeometry(0.12, 8, 8);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffe29a,
        emissive: 0xffd27d,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });

      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2;
        const sphere = new THREE.Mesh(ringGeom, ringMat);
        sphere.position.set(Math.cos(angle) * 5.8, Math.sin(angle) * 1.8, Math.sin(angle) * 5.8);
        ringGroup.add(sphere);
      }
      ringGroup.rotation.x = Math.PI / 5;
      ringGroup.rotation.z = -Math.PI / 8;
      scene.add(ringGroup);

      // Orbiting Moons / Small Hearts
      const moons = [];
      const moonGeom = createHeartGeometry(0.65, 0.7);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xffb6d5,
        emissive: 0xff99bb,
        emissiveIntensity: 0.3
      });
      for (let i = 0; i < 4; i++) {
        const m = new THREE.Mesh(moonGeom, moonMat);
        scene.add(m);
        moons.push({
          mesh: m,
          radius: 5.2 + i * 1.4,
          speed: (i % 2 === 0 ? 1 : -1) * (0.35 + i * 0.1),
          phase: (i / 4) * Math.PI * 2
        });
      }

      // 3D Clouds in Hero Background
      const heroClouds = [];
      for (let i = 0; i < 4; i++) {
        const cl = createCloudMesh(0xffedf6, 0.8 + Math.random() * 0.5);
        cl.position.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 8 - 1, -5 - Math.random() * 6);
        scene.add(cl);
        heroClouds.push({
          mesh: cl,
          speedX: 0.004 + Math.random() * 0.003,
          baseY: cl.position.y
        });
      }

      // Parallax interaction
      let heroMouseX = 0;
      let heroMouseY = 0;
      if (!isTouchDevice && !prefersReducedMotion) {
        window.addEventListener('mousemove', (e) => {
          heroMouseX = (e.clientX / window.innerWidth) * 2 - 1;
          heroMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        }, { passive: true });
      }

      // Responsive
      function onResize() {
        const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
        const h = canvas.parentElement ? canvas.parentElement.clientHeight : 650;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      // Hero Animation Loop
      let heroFrameId = null;
      const heroClock = new THREE.Clock();

      function animateHero() {
        if (document.hidden) {
          heroFrameId = requestAnimationFrame(animateHero);
          return;
        }

        const t = heroClock.getElapsedTime();

        // Planet spin & hover
        heartPlanet.rotation.y = t * 0.4;
        heartPlanet.position.y = Math.sin(t * 1.2) * 0.35;

        // Ring spin
        ringGroup.rotation.y = t * 0.2;

        // Moons orbit
        moons.forEach((moon) => {
          const mt = t * moon.speed + moon.phase;
          moon.mesh.position.set(
            Math.cos(mt) * moon.radius,
            Math.sin(mt * 1.4) * 1.2,
            Math.sin(mt) * moon.radius
          );
          moon.mesh.rotation.y = mt * 2;
        });

        // Drift clouds
        heroClouds.forEach((c) => {
          c.mesh.position.x += c.speedX;
          if (c.mesh.position.x > 16) c.mesh.position.x = -16;
        });

        // Camera tilt towards mouse
        camera.rotation.y += (heroMouseX * 0.25 - camera.rotation.y) * 0.05;
        camera.rotation.x += (heroMouseY * 0.15 - camera.rotation.x) * 0.05;

        renderer.render(scene, camera);
        heroFrameId = requestAnimationFrame(animateHero);
      }

      animateHero();

      return {
        destroy() {
          cancelAnimationFrame(heroFrameId);
          window.removeEventListener('resize', onResize);
        }
      };
    },

    // ========================================================================
    // 4. INTERACTIVE 3D CHIBI COUPLE & VIRTUAL DATE NIGHT SCENE
    // ========================================================================
    coupleController: null,

    initCoupleScene(canvasId = 'universe-3d-couple-canvas') {
      if (!this.isSupported || typeof THREE === 'undefined') {
        console.log('🌸 Couple 3D: WebGL not active, using enhanced 2D fallback.');
        return null;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;

      // Ensure previous RAF loop is cleaned up if called again
      if (this.coupleController && typeof this.coupleController.destroy === 'function') {
        this.coupleController.destroy();
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      const width = canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : 800) || 800;
      const height = canvas.clientHeight || (canvas.parentElement ? canvas.parentElement.clientHeight : 540) || 540;
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0xfff0f5, 0.015);

      // --- CAMERA FRAMING (Characters fill 68-75% of viewport height) ---
      // Field of view 36 with camera distance 4.7 frames both full bodies with ears and feet perfectly!
      const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);

      let isDragging = false;
      let prevMouse = { x: 0, y: 0 };
      let camTheta = 0;              // horizontal orbit
      let camPhi = 0.08;             // eye-level slight pitch
      let camRadius = 4.7;           // base distance
      let targetCamRadius = 4.7;
      const camTarget = new THREE.Vector3(0, 1.25, 0); // centered on characters' chests/faces
      const targetCamCenter = new THREE.Vector3(0, 1.25, 0);

      function updateCameraPosition() {
        const x = camTarget.x + camRadius * Math.sin(camTheta) * Math.cos(camPhi);
        const y = camTarget.y + camRadius * Math.sin(camPhi);
        const z = camTarget.z + camRadius * Math.cos(camTheta) * Math.cos(camPhi);
        camera.position.set(x, y, z);
        camera.lookAt(camTarget);
      }
      updateCameraPosition();

      // Mouse drag orbit & click/tap detection
      let startMouse = { x: 0, y: 0 };
      let dragDist = 0;
      let onCanvasTap = null;

      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startMouse = { x: e.clientX, y: e.clientY };
        prevMouse = { x: e.clientX, y: e.clientY };
        dragDist = 0;
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        dragDist += Math.abs(dx) + Math.abs(dy);
        camTheta -= dx * 0.007;
        camPhi = Math.max(-0.15, Math.min(0.55, camPhi + dy * 0.005));
        prevMouse = { x: e.clientX, y: e.clientY };
      });
      window.addEventListener('mouseup', (e) => {
        if (isDragging && dragDist < 8 && typeof onCanvasTap === 'function') {
          onCanvasTap(e.clientX, e.clientY);
        }
        isDragging = false;
      });

      // Touch orbit & tap for mobile devices
      let touchStartPos = { x: 0, y: 0 };
      let touchMoved = false;

      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          touchMoved = false;
        }
      }, { passive: true });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) touchMoved = true;
        camTheta -= dx * 0.007;
        camPhi = Math.max(-0.15, Math.min(0.55, camPhi + dy * 0.005));
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });
      window.addEventListener('touchend', (e) => {
        if (isDragging && !touchMoved && e.changedTouches.length === 1 && typeof onCanvasTap === 'function') {
          onCanvasTap(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        }
        isDragging = false;
      });

      // Wheel Zoom
      canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetCamRadius = Math.max(3.0, Math.min(8.5, targetCamRadius + e.deltaY * 0.005));
      }, { passive: false });

      // --- HIGH QUALITY BALANCED LIGHTING RIG ---
      const ambientLight = new THREE.AmbientLight(0xfff6f8, 1.15);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xfffdf6, 1.25);
      mainLight.position.set(3.5, 7.5, 5.5);
      mainLight.castShadow = true;
      mainLight.shadow.mapSize.width = 1024;
      mainLight.shadow.mapSize.height = 1024;
      mainLight.shadow.camera.near = 0.5;
      mainLight.shadow.camera.far = 20;
      mainLight.shadow.camera.left = -4.5;
      mainLight.shadow.camera.right = 4.5;
      mainLight.shadow.camera.top = 4.5;
      mainLight.shadow.camera.bottom = -4.5;
      mainLight.shadow.bias = -0.0004;
      scene.add(mainLight);

      const fillLight = new THREE.DirectionalLight(0xffe6f0, 0.65);
      fillLight.position.set(-3.5, 5.0, 4.0);
      scene.add(fillLight);

      const romanticPoint = new THREE.PointLight(0xff70a6, 1.1, 16);
      romanticPoint.position.set(0, 2.2, 2.8);
      scene.add(romanticPoint);

      const rimLight = new THREE.DirectionalLight(0xffffff, 0.65);
      rimLight.position.set(0, 4.0, -4.5);
      scene.add(rimLight);

      // --- SCENIC GROUND PEDESTAL / STAGE ---
      const stageGeom = new THREE.CylinderGeometry(5.0, 5.4, 0.35, 40);
      const stageMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.04
      });
      const stage = new THREE.Mesh(stageGeom, stageMat);
      stage.position.y = -0.175;
      stage.receiveShadow = true;
      scene.add(stage);

      // Rose Gold Pedestal Rim
      const rimGeom = new THREE.TorusGeometry(5.0, 0.12, 12, 48);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, metalness: 0.55, roughness: 0.25 });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0;
      scene.add(rim);

      // Center Stage Rug Pad
      const rugGeom = new THREE.CylinderGeometry(2.7, 2.7, 0.02, 36);
      const rugMat = new THREE.MeshStandardMaterial({ color: 0xffcad4, roughness: 0.85 });
      const rug = new THREE.Mesh(rugGeom, rugMat);
      rug.position.set(0, 0.01, 0);
      rug.receiveShadow = true;
      scene.add(rug);

      // --- DUDU & BUDU CUSTOMIZATION STATE ---
      let savedDuduBuduCustom = {};
      try {
        const raw = localStorage.getItem('universe_dudu_budu_customization');
        if (raw) savedDuduBuduCustom = JSON.parse(raw);
      } catch (e) {}

      const duduBuduState = {
        buduOutfitStyle: savedDuduBuduCustom.buduOutfitStyle || 'knit',
        buduHair: savedDuduBuduCustom.buduHair || 'classic',
        buduOutfitColor: savedDuduBuduCustom.buduOutfitColor || '#ff9ebb',
        buduBlushColor: savedDuduBuduCustom.buduBlushColor || '#ff8da1',
        buduBlushIntensity: savedDuduBuduCustom.buduBlushIntensity !== undefined ? savedDuduBuduCustom.buduBlushIntensity : 0.85,
        buduLipColor: savedDuduBuduCustom.buduLipColor || '#9b334a',
        buduAccessory: savedDuduBuduCustom.buduAccessory || 'pink_bow',
        buduExpression: savedDuduBuduCustom.buduExpression || 'smile',

        duduOutfitStyle: savedDuduBuduCustom.duduOutfitStyle || 'hoodie',
        duduHair: savedDuduBuduCustom.duduHair || 'classic',
        duduOutfitColor: savedDuduBuduCustom.duduOutfitColor || '#2b2220',
        duduBlushColor: savedDuduBuduCustom.duduBlushColor || '#f4a261',
        duduBlushIntensity: savedDuduBuduCustom.duduBlushIntensity !== undefined ? savedDuduBuduCustom.duduBlushIntensity : 0.75,
        duduAccessory: savedDuduBuduCustom.duduAccessory || 'none',
        duduExpression: savedDuduBuduCustom.duduExpression || 'smile'
      };

      function persistDuduBuduState() {
        try {
          localStorage.setItem('universe_dudu_budu_customization', JSON.stringify(duduBuduState));
        } catch (e) {}
      }

      // ======================================================================
      // PROCEDURAL 3D PUPPET BUILDER: BUDU (Cute White Bear Girl)
      // ======================================================================
      function buildBudu() {
        const root = new THREE.Group();
        root.position.x = -1.25; // Sits neatly on left, no overlapping

        // Soft plush white cream fur
        const furMat = new THREE.MeshStandardMaterial({
          color: 0xfffdfa,
          roughness: 0.52,
          metalness: 0.02
        });

        // Cozy pink knit sweater / dress outfit
        const sweaterMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(duduBuduState.buduOutfitColor),
          roughness: 0.65,
          metalness: 0.02
        });

        // Pelvis / Hips Root
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.85;
        root.add(pelvis);

        // Chubby Body / Torso
        const bodyGeom = new THREE.CylinderGeometry(0.58, 0.78, 0.95, 20);
        const body = new THREE.Mesh(bodyGeom, sweaterMat);
        body.position.y = 0.25;
        body.castShadow = true;
        pelvis.add(body);

        // Turtleneck Collar Ring
        const collarGeom = new THREE.TorusGeometry(0.52, 0.11, 8, 20);
        const collar = new THREE.Mesh(collarGeom, sweaterMat);
        collar.position.set(0, 0.72, 0);
        collar.rotation.x = Math.PI / 2;
        pelvis.add(collar);

        // Flared Dress Skirt Hem (for dress style)
        const skirtGeom = new THREE.ConeGeometry(0.92, 0.42, 22, 1, true);
        const skirtMesh = new THREE.Mesh(skirtGeom, sweaterMat);
        skirtMesh.position.set(0, -0.08, 0);
        skirtMesh.visible = (duduBuduState.buduOutfitStyle === 'dress');
        pelvis.add(skirtMesh);

        // Neck Pivot -> Head
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.78, 0);
        pelvis.add(neckPivot);

        // Chubby Kawaii Head
        const headGeom = new THREE.SphereGeometry(1.02, 28, 24);
        headGeom.scale(1.18, 0.98, 1.05);
        const head = new THREE.Mesh(headGeom, furMat);
        head.position.y = 0.65;
        head.castShadow = true;
        neckPivot.add(head);

        // Round Cute Ears
        const earGeom = new THREE.SphereGeometry(0.36, 16, 14);
        earGeom.scale(1, 1.1, 0.6);
        const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xffd6e0, roughness: 0.7 });

        const leftEar = new THREE.Mesh(earGeom, furMat);
        leftEar.position.set(-0.85, 0.85, 0.12);
        leftEar.rotation.z = 0.35;
        const leftInner = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), innerEarMat);
        leftInner.position.set(0, 0, 0.12);
        leftEar.add(leftInner);

        const rightEar = new THREE.Mesh(earGeom, furMat);
        rightEar.position.set(0.85, 0.85, 0.12);
        rightEar.rotation.z = -0.35;
        const rightInner = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), innerEarMat);
        rightInner.position.set(0, 0, 0.12);
        rightEar.add(rightInner);

        head.add(leftEar, rightEar);

        // Hair / Tufts Group
        const hairGroup = new THREE.Group();
        head.add(hairGroup);

        // Signature Plush Pink Bow on Ear
        const bowMat = new THREE.MeshStandardMaterial({
          color: 0xff7096,
          roughness: 0.45,
          metalness: 0.05
        });
        const bowGroup = new THREE.Group();
        const bowKnot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), bowMat);
        const loopGeom = new THREE.SphereGeometry(0.26, 12, 10);
        loopGeom.scale(1.3, 0.85, 0.5);

        const leftLoop = new THREE.Mesh(loopGeom, bowMat);
        leftLoop.position.set(-0.3, 0.06, 0);
        leftLoop.rotation.z = 0.25;

        const rightLoop = new THREE.Mesh(loopGeom, bowMat);
        rightLoop.position.set(0.3, 0.06, 0);
        rightLoop.rotation.z = -0.25;

        bowGroup.add(bowKnot, leftLoop, rightLoop);
        bowGroup.position.set(-0.85, 0.9, 0.42);
        bowGroup.rotation.z = 0.2;
        head.add(bowGroup);

        // Glossy Kawaii Anime Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x140e16, roughness: 0.1 });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeGeom = new THREE.SphereGeometry(0.13, 16, 14);
        eyeGeom.scale(1, 1.3, 0.45);

        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.35, 0.02, 1.02);
        const leftHl1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeHighlightMat);
        leftHl1.position.set(-0.32, 0.07, 1.05);
        const leftHl2 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeHighlightMat);
        leftHl2.position.set(-0.37, -0.04, 1.04);
        leftEye.add(leftHl1, leftHl2);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.35, 0.02, 1.02);
        const rightHl1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeHighlightMat);
        rightHl1.position.set(0.38, 0.07, 1.05);
        const rightHl2 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeHighlightMat);
        rightHl2.position.set(0.33, -0.04, 1.04);
        rightEye.add(rightHl1, rightHl2);

        head.add(leftEye, rightEye);

        // Blushing Cheeks
        const blushMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(duduBuduState.buduBlushColor),
          roughness: 0.8,
          transparent: true,
          opacity: duduBuduState.buduBlushIntensity
        });
        const blushGeom = new THREE.SphereGeometry(0.17, 14, 12);
        blushGeom.scale(1.4, 0.75, 0.35);

        const leftBlush = new THREE.Mesh(blushGeom, blushMat);
        leftBlush.position.set(-0.5, -0.18, 0.98);
        const rightBlush = new THREE.Mesh(blushGeom, blushMat);
        rightBlush.position.set(0.5, -0.18, 0.98);
        head.add(leftBlush, rightBlush);

        // Cute Open / Smile Mouth
        const mouthGeom = new THREE.TorusGeometry(0.085, 0.024, 8, 14, Math.PI);
        const mouthMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(duduBuduState.buduLipColor) });
        const mouth = new THREE.Mesh(mouthGeom, mouthMat);
        mouth.position.set(0, -0.25, 1.04);
        mouth.rotation.x = Math.PI;
        head.add(mouth);

        // Accessories Group
        const accessoriesGroup = new THREE.Group();
        head.add(accessoriesGroup);

        // Left Arm Joint Chain (Shoulder -> UpperArm -> Elbow -> Forearm & Paw)
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.58, 0.55, 0.1);
        pelvis.add(leftShoulder);

        const armGeom = new THREE.CylinderGeometry(0.15, 0.14, 0.45, 12);
        armGeom.translate(0, -0.22, 0);
        const leftUpperArm = new THREE.Mesh(armGeom, sweaterMat);
        leftUpperArm.castShadow = true;
        leftShoulder.add(leftUpperArm);

        const leftElbow = new THREE.Group();
        leftElbow.position.set(0, -0.42, 0);
        leftUpperArm.add(leftElbow);

        const forearmGeom = new THREE.CylinderGeometry(0.14, 0.13, 0.35, 12);
        forearmGeom.translate(0, -0.17, 0);
        const leftForearm = new THREE.Mesh(forearmGeom, sweaterMat);
        const leftPaw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), furMat);
        leftPaw.position.set(0, -0.38, 0);
        leftElbow.add(leftForearm, leftPaw);

        // Right Arm Joint Chain (Shoulder -> UpperArm -> Elbow -> Forearm & Paw)
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.58, 0.55, 0.1);
        pelvis.add(rightShoulder);

        const rightUpperArm = new THREE.Mesh(armGeom, sweaterMat);
        rightUpperArm.castShadow = true;
        rightShoulder.add(rightUpperArm);

        const rightElbow = new THREE.Group();
        rightElbow.position.set(0, -0.42, 0);
        rightUpperArm.add(rightElbow);

        const rightForearm = new THREE.Mesh(forearmGeom, sweaterMat);
        const rightPaw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), furMat);
        rightPaw.position.set(0, -0.38, 0);
        rightElbow.add(rightForearm, rightPaw);

        // Left Leg Joint Chain (Hip -> UpperLeg -> Knee -> Foot Paw)
        const legGeom = new THREE.CylinderGeometry(0.16, 0.15, 0.42, 12);
        legGeom.translate(0, -0.21, 0);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.22, 0);
        pelvis.add(leftHip);

        const leftUpperLeg = new THREE.Mesh(legGeom, furMat);
        leftUpperLeg.castShadow = true;
        leftHip.add(leftUpperLeg);

        const leftKnee = new THREE.Group();
        leftKnee.position.set(0, -0.38, 0);
        leftUpperLeg.add(leftKnee);

        const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), furMat);
        leftFoot.scale.set(1, 0.7, 1.3);
        leftFoot.position.set(0, -0.18, 0.08);
        leftKnee.add(leftFoot);

        // Right Leg Joint Chain (Hip -> UpperLeg -> Knee -> Foot Paw)
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.22, 0);
        pelvis.add(rightHip);

        const rightUpperLeg = new THREE.Mesh(legGeom, furMat);
        rightUpperLeg.castShadow = true;
        rightHip.add(rightUpperLeg);

        const rightKnee = new THREE.Group();
        rightKnee.position.set(0, -0.38, 0);
        rightUpperLeg.add(rightKnee);

        const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), furMat);
        rightFoot.scale.set(1, 0.7, 1.3);
        rightFoot.position.set(0, -0.18, 0.08);
        rightKnee.add(rightFoot);

        return {
          root,
          pelvis,
          body,
          skirtMesh,
          neckPivot,
          head,
          sweaterMat,
          blushMat,
          mouthMat,
          mouth,
          leftEye,
          rightEye,
          bowGroup,
          hairGroup,
          accessoriesGroup,
          leftShoulder,
          leftElbow,
          leftPaw,
          rightShoulder,
          rightElbow,
          rightPaw,
          leftHip,
          leftKnee,
          rightHip,
          rightKnee,
          baseX: -1.25,
          gender: 'budu'
        };
      }

      // ======================================================================
      // PROCEDURAL 3D PUPPET BUILDER: DUDU (Cute Brown Bear Boy)
      // ======================================================================
      function buildDudu() {
        const root = new THREE.Group();
        root.position.x = 1.25; // Sits neatly on right, clear spacing

        // Rich warm cocoa brown fur
        const furMat = new THREE.MeshStandardMaterial({
          color: 0x8a523a,
          roughness: 0.58,
          metalness: 0.02
        });

        // Dark chocolate brown hoodie
        const hoodieMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(duduBuduState.duduOutfitColor),
          roughness: 0.65,
          metalness: 0.02
        });

        // Pants material
        const pantsMat = new THREE.MeshStandardMaterial({
          color: 0x33261f,
          roughness: 0.7
        });

        // Pelvis / Hips Root
        const pelvis = new THREE.Group();
        pelvis.position.y = 0.85;
        root.add(pelvis);

        // Chubby Body / Torso wearing hoodie
        const bodyGeom = new THREE.CylinderGeometry(0.58, 0.78, 0.95, 20);
        const body = new THREE.Mesh(bodyGeom, hoodieMat);
        body.position.y = 0.25;
        body.castShadow = true;
        pelvis.add(body);

        // White Hood Border Trim
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xf5f3f0, roughness: 0.5 });
        const hoodTrim = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.08, 8, 20), trimMat);
        hoodTrim.position.set(0, 0.72, -0.05);
        hoodTrim.rotation.x = Math.PI / 2;
        pelvis.add(hoodTrim);

        // Two Dangling White Drawstrings
        const stringGeom = new THREE.CylinderGeometry(0.018, 0.018, 0.32, 6);
        const leftString = new THREE.Mesh(stringGeom, trimMat);
        leftString.position.set(-0.15, 0.48, 0.58);
        const rightString = new THREE.Mesh(stringGeom, trimMat);
        rightString.position.set(0.15, 0.48, 0.58);
        pelvis.add(leftString, rightString);

        // Formal Tuxedo Bowtie (for formal style)
        const formalBowMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
        const bowtieGroup = new THREE.Group();
        const bKnot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), formalBowMat);
        const bWingL = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 6), formalBowMat);
        bWingL.rotation.z = Math.PI / 2;
        bWingL.position.x = -0.12;
        const bWingR = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 6), formalBowMat);
        bWingR.rotation.z = -Math.PI / 2;
        bWingR.position.x = 0.12;
        bowtieGroup.add(bKnot, bWingL, bWingR);
        bowtieGroup.position.set(0, 0.70, 0.54);
        bowtieGroup.visible = (duduBuduState.duduOutfitStyle === 'formal');
        pelvis.add(bowtieGroup);

        // Neck Pivot -> Head
        const neckPivot = new THREE.Group();
        neckPivot.position.set(0, 0.78, 0);
        pelvis.add(neckPivot);

        // Chubby Kawaii Head
        const headGeom = new THREE.SphereGeometry(1.02, 28, 24);
        headGeom.scale(1.18, 0.98, 1.05);
        const head = new THREE.Mesh(headGeom, furMat);
        head.position.y = 0.65;
        head.castShadow = true;
        neckPivot.add(head);

        // Round Cute Ears
        const earGeom = new THREE.SphereGeometry(0.36, 16, 14);
        earGeom.scale(1, 1.1, 0.6);
        const innerEarMat = new THREE.MeshStandardMaterial({ color: 0x6a3824, roughness: 0.75 });

        const leftEar = new THREE.Mesh(earGeom, furMat);
        leftEar.position.set(-0.85, 0.85, 0.12);
        leftEar.rotation.z = 0.35;
        const leftInner = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), innerEarMat);
        leftInner.position.set(0, 0, 0.12);
        leftEar.add(leftInner);

        const rightEar = new THREE.Mesh(earGeom, furMat);
        rightEar.position.set(0.85, 0.85, 0.12);
        rightEar.rotation.z = -0.35;
        const rightInner = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), innerEarMat);
        rightInner.position.set(0, 0, 0.12);
        rightEar.add(rightInner);

        head.add(leftEar, rightEar);

        // Hair / Tufts Group
        const hairGroup = new THREE.Group();
        head.add(hairGroup);

        // Glossy Kawaii Anime Eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x140e16, roughness: 0.1 });
        const eyeHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eyeGeom = new THREE.SphereGeometry(0.13, 16, 14);
        eyeGeom.scale(1, 1.3, 0.45);

        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.35, 0.02, 1.02);
        const leftHl1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeHighlightMat);
        leftHl1.position.set(-0.32, 0.07, 1.05);
        const leftHl2 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeHighlightMat);
        leftHl2.position.set(-0.37, -0.04, 1.04);
        leftEye.add(leftHl1, leftHl2);

        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.35, 0.02, 1.02);
        const rightHl1 = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), eyeHighlightMat);
        rightHl1.position.set(0.38, 0.07, 1.05);
        const rightHl2 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), eyeHighlightMat);
        rightHl2.position.set(0.33, -0.04, 1.04);
        rightEye.add(rightHl1, rightHl2);

        head.add(leftEye, rightEye);

        // Honey Peachy Blush Cheeks
        const blushMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(duduBuduState.duduBlushColor),
          roughness: 0.8,
          transparent: true,
          opacity: duduBuduState.duduBlushIntensity
        });
        const blushGeom = new THREE.SphereGeometry(0.17, 14, 12);
        blushGeom.scale(1.4, 0.75, 0.35);

        const leftBlush = new THREE.Mesh(blushGeom, blushMat);
        leftBlush.position.set(-0.5, -0.18, 0.98);
        const rightBlush = new THREE.Mesh(blushGeom, blushMat);
        rightBlush.position.set(0.5, -0.18, 0.98);
        head.add(leftBlush, rightBlush);

        // Happy Open Smile
        const mouthGeom = new THREE.TorusGeometry(0.09, 0.024, 8, 14, Math.PI);
        const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8a2b3f });
        const mouth = new THREE.Mesh(mouthGeom, mouthMat);
        mouth.position.set(0, -0.25, 1.04);
        mouth.rotation.x = Math.PI;
        head.add(mouth);

        // Accessories Group
        const accessoriesGroup = new THREE.Group();
        head.add(accessoriesGroup);

        // Left Arm Joint Chain
        const leftShoulder = new THREE.Group();
        leftShoulder.position.set(-0.58, 0.55, 0.1);
        pelvis.add(leftShoulder);

        const armGeom = new THREE.CylinderGeometry(0.15, 0.14, 0.45, 12);
        armGeom.translate(0, -0.22, 0);
        const leftUpperArm = new THREE.Mesh(armGeom, hoodieMat);
        leftUpperArm.castShadow = true;
        leftShoulder.add(leftUpperArm);

        const leftElbow = new THREE.Group();
        leftElbow.position.set(0, -0.42, 0);
        leftUpperArm.add(leftElbow);

        const forearmGeom = new THREE.CylinderGeometry(0.14, 0.13, 0.35, 12);
        forearmGeom.translate(0, -0.17, 0);
        const leftForearm = new THREE.Mesh(forearmGeom, hoodieMat);
        const leftPaw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), furMat);
        leftPaw.position.set(0, -0.38, 0);
        leftElbow.add(leftForearm, leftPaw);

        // Right Arm Joint Chain
        const rightShoulder = new THREE.Group();
        rightShoulder.position.set(0.58, 0.55, 0.1);
        pelvis.add(rightShoulder);

        const rightUpperArm = new THREE.Mesh(armGeom, hoodieMat);
        rightUpperArm.castShadow = true;
        rightShoulder.add(rightUpperArm);

        const rightElbow = new THREE.Group();
        rightElbow.position.set(0, -0.42, 0);
        rightUpperArm.add(rightElbow);

        const rightForearm = new THREE.Mesh(forearmGeom, hoodieMat);
        const rightPaw = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), furMat);
        rightPaw.position.set(0, -0.38, 0);
        rightElbow.add(rightForearm, rightPaw);

        // Left Leg Joint Chain
        const legGeom = new THREE.CylinderGeometry(0.16, 0.15, 0.42, 12);
        legGeom.translate(0, -0.21, 0);

        const leftHip = new THREE.Group();
        leftHip.position.set(-0.32, -0.22, 0);
        pelvis.add(leftHip);

        const leftUpperLeg = new THREE.Mesh(legGeom, pantsMat);
        leftUpperLeg.castShadow = true;
        leftHip.add(leftUpperLeg);

        const leftKnee = new THREE.Group();
        leftKnee.position.set(0, -0.38, 0);
        leftUpperLeg.add(leftKnee);

        const leftFoot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), furMat);
        leftFoot.scale.set(1, 0.7, 1.3);
        leftFoot.position.set(0, -0.18, 0.08);
        leftKnee.add(leftFoot);

        // Right Leg Joint Chain
        const rightHip = new THREE.Group();
        rightHip.position.set(0.32, -0.22, 0);
        pelvis.add(rightHip);

        const rightUpperLeg = new THREE.Mesh(legGeom, pantsMat);
        rightUpperLeg.castShadow = true;
        rightHip.add(rightUpperLeg);

        const rightKnee = new THREE.Group();
        rightKnee.position.set(0, -0.38, 0);
        rightUpperLeg.add(rightKnee);

        const rightFoot = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), furMat);
        rightFoot.scale.set(1, 0.7, 1.3);
        rightFoot.position.set(0, -0.18, 0.08);
        rightKnee.add(rightFoot);

        return {
          root,
          pelvis,
          body,
          hoodTrim,
          leftString,
          rightString,
          bowtieGroup,
          neckPivot,
          head,
          hoodieMat,
          blushMat,
          mouthMat,
          mouth,
          leftEye,
          rightEye,
          hairGroup,
          accessoriesGroup,
          leftShoulder,
          leftElbow,
          leftPaw,
          rightShoulder,
          rightElbow,
          rightPaw,
          leftHip,
          leftKnee,
          rightHip,
          rightKnee,
          baseX: 1.25,
          gender: 'dudu'
        };
      }

      const girl = buildBudu();
      scene.add(girl.root);

      const boy = buildDudu();
      scene.add(boy.root);

      // Facing gently toward each other
      girl.root.rotation.y = 0.22;
      boy.root.rotation.y = -0.22;

      // --- ACCESSORIES BUILDER ---
      function updateCharacterAccessory(charObj, accKey) {
        while (charObj.accessoriesGroup.children.length > 0) {
          charObj.accessoriesGroup.remove(charObj.accessoriesGroup.children[0]);
        }
        if (charObj.bowGroup) {
          charObj.bowGroup.visible = (accKey === 'pink_bow');
        }

        if (accKey === 'glasses') {
          const glassesGroup = new THREE.Group();
          const goldWireMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.7, roughness: 0.3 });
          const leftRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 22), goldWireMat);
          leftRim.position.set(-0.35, 0.02, 1.05);
          const rightRim = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.022, 8, 22), goldWireMat);
          rightRim.position.set(0.35, 0.02, 1.05);
          const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 6), goldWireMat);
          bridge.rotation.z = Math.PI / 2;
          bridge.position.set(0, 0.04, 1.05);
          glassesGroup.add(leftRim, rightRim, bridge);
          charObj.accessoriesGroup.add(glassesGroup);
        } else if (accKey === 'flower_crown') {
          const crownGroup = new THREE.Group();
          const stemMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });
          const stem = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.035, 6, 24, Math.PI * 0.8), stemMat);
          stem.rotation.x = Math.PI / 2;
          crownGroup.add(stem);
          const fCols = [0xff8da1, 0xffffff, 0xfecdd3, 0xffd166];
          for (let f = -3; f <= 3; f++) {
            const fMat = new THREE.MeshStandardMaterial({ color: fCols[Math.abs(f) % fCols.length] });
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), fMat);
            const a = f * 0.22;
            fl.position.set(Math.sin(a) * 0.85, 0.08, Math.cos(a) * 0.85);
            crownGroup.add(fl);
          }
          crownGroup.position.set(0, 0.85, 0.12);
          charObj.accessoriesGroup.add(crownGroup);
        } else if (accKey === 'tiara') {
          const tiaraGroup = new THREE.Group();
          const tiaraMat = new THREE.MeshStandardMaterial({ color: 0xffd166, metalness: 0.8, roughness: 0.2 });
          const baseBand = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 6, 24, Math.PI * 0.8), tiaraMat);
          baseBand.rotation.x = Math.PI / 2;
          const star = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.35, 6), tiaraMat);
          star.position.set(0, 0.18, 0.85);
          tiaraGroup.add(baseBand, star);
          tiaraGroup.position.set(0, 0.86, 0.1);
          charObj.accessoriesGroup.add(tiaraGroup);
        } else if (accKey === 'strawhat') {
          const hatGroup = new THREE.Group();
          const strawMat = new THREE.MeshStandardMaterial({ color: 0xe5c38d, roughness: 0.7 });
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.25, 0.06, 24), strawMat);
          const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.45, 20), strawMat);
          crown.position.y = 0.24;
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.1, 20), new THREE.MeshStandardMaterial({ color: 0x991b1b }));
          band.position.y = 0.12;
          hatGroup.add(brim, crown, band);
          hatGroup.position.set(0, 1.25, 0.05);
          hatGroup.rotation.x = -0.15;
          charObj.accessoriesGroup.add(hatGroup);
        } else if (accKey === 'beret') {
          const beretGroup = new THREE.Group();
          const beretMat = new THREE.MeshStandardMaterial({ color: 0x9b1c31, roughness: 0.6 });
          const beretCap = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 14), beretMat);
          beretCap.scale.set(1.15, 0.45, 1.15);
          beretGroup.add(beretCap);
          beretGroup.position.set(-0.25, 1.15, 0.05);
          beretGroup.rotation.z = -0.22;
          charObj.accessoriesGroup.add(beretGroup);
        } else if (accKey === 'headband') {
          const bandGroup = new THREE.Group();
          const hMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
          const bandRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 6, 24, Math.PI * 0.9), hMat);
          bandRing.rotation.x = Math.PI / 2;
          bandGroup.add(bandRing);
          bandGroup.position.set(0, 0.75, 0.12);
          charObj.accessoriesGroup.add(bandGroup);
        }
      }

      // --- HAIR / TUFTS BUILDER ---
      function updateCharacterHair(charObj, hairKey) {
        while (charObj.hairGroup.children.length > 0) {
          charObj.hairGroup.remove(charObj.hairGroup.children[0]);
        }
        if (hairKey === 'fluffy_tuft' || hairKey === 'cool_tuft') {
          const tuftMat = charObj.gender === 'budu'
            ? new THREE.MeshStandardMaterial({ color: 0xfffdfa, roughness: 0.5 })
            : new THREE.MeshStandardMaterial({ color: 0x8a523a, roughness: 0.6 });
          const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 8), tuftMat);
          tuft.position.set(0, 1.18, 0.35);
          tuft.rotation.x = -0.35;
          charObj.hairGroup.add(tuft);
        } else if (hairKey === 'bangs' || hairKey === 'messy_fringe') {
          const bMat = charObj.gender === 'budu'
            ? new THREE.MeshStandardMaterial({ color: 0xfffdfa, roughness: 0.5 })
            : new THREE.MeshStandardMaterial({ color: 0x8a523a, roughness: 0.6 });
          for (let i = -2; i <= 2; i++) {
            const f = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), bMat);
            f.scale.set(1.2, 0.6, 0.7);
            f.position.set(i * 0.18, 0.65, 0.95);
            charObj.hairGroup.add(f);
          }
        }
      }

      // --- EXPRESSION MANAGER ---
      function updateCharacterExpression(charObj, exprKey) {
        if (!charObj.rightEye || !charObj.mouth) return;
        if (exprKey === 'wink') {
          charObj.rightEye.scale.set(1.0, 0.12, 0.45); // cute wink
          charObj.mouth.rotation.x = Math.PI;
        } else if (exprKey === 'happy') {
          charObj.rightEye.scale.set(1.0, 1.3, 0.45);
          charObj.mouth.rotation.x = 0; // big happy mouth
          charObj.mouth.position.y = -0.22;
        } else if (exprKey === 'blush') {
          charObj.rightEye.scale.set(1.0, 1.3, 0.45);
          charObj.blushMat.opacity = 1.0;
        } else {
          charObj.rightEye.scale.set(1.0, 1.3, 0.45);
          charObj.mouth.rotation.x = Math.PI;
          charObj.mouth.position.y = -0.25;
        }
      }

      updateCharacterAccessory(girl, duduBuduState.buduAccessory);
      updateCharacterAccessory(boy, duduBuduState.duduAccessory);
      updateCharacterHair(girl, duduBuduState.buduHair);
      updateCharacterHair(boy, duduBuduState.duduHair);
      updateCharacterExpression(girl, duduBuduState.buduExpression);
      updateCharacterExpression(boy, duduBuduState.duduExpression);

      // --- 5 DISTINCT, RICH 3D DATE ENVIRONMENTS ---
      const scenesGroup = new THREE.Group();
      scene.add(scenesGroup);

      // 1. COZY CAFE
      const cafeGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.45 });
      // Bistro table placed slightly in front so it never clips into bodies!
      const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.06, 28), woodMat);
      tableTop.position.set(0, 0.65, 0.55);
      tableTop.receiveShadow = true;
      const tableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.65, 12), woodMat);
      tableLeg.position.set(0, 0.32, 0.55);
      const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.03, 20), woodMat);
      tableBase.position.set(0, 0.02, 0.55);
      cafeGroup.add(tableTop, tableLeg, tableBase);

      const pinkMug = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.16, 14), new THREE.MeshStandardMaterial({ color: 0xffadc2 }));
      pinkMug.position.set(-0.24, 0.76, 0.55);
      const brownMug = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.16, 14), new THREE.MeshStandardMaterial({ color: 0x5a3d28 }));
      brownMug.position.set(0.24, 0.76, 0.55);
      const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      candle.position.set(0, 0.74, 0.55);
      const flame = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffdf78 }));
      flame.position.set(0, 0.08, 0);
      candle.add(flame);
      cafeGroup.add(pinkMug, brownMug, candle);
      cafeGroup.visible = true;
      scenesGroup.add(cafeGroup);

      // 2. CHERRY BLOSSOM PICNIC
      const picnicGroup = new THREE.Group();
      // Checkered picnic blanket
      const blanketGeom = new THREE.BoxGeometry(2.8, 0.02, 1.8);
      const blanketMat = new THREE.MeshStandardMaterial({ color: 0xffccd5, roughness: 0.8 });
      const blanket = new THREE.Mesh(blanketGeom, blanketMat);
      blanket.position.set(0, 0.02, 0.2);
      picnicGroup.add(blanket);

      // Wicker Picnic Basket
      const basket = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.32), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }));
      basket.position.set(0, 0.17, 0.65);
      picnicGroup.add(basket);

      // Drifting Sakura Petals
      const petalCount = 28;
      const petalGeom = new THREE.PlaneGeometry(0.12, 0.16);
      const petalMat = new THREE.MeshBasicMaterial({ color: 0xffb7c5, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const petalsGroup = new THREE.Group();
      const petals = [];
      for (let i = 0; i < petalCount; i++) {
        const p = new THREE.Mesh(petalGeom, petalMat);
        p.position.set((Math.random() - 0.5) * 8, Math.random() * 6 + 0.5, (Math.random() - 0.5) * 6);
        p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        petalsGroup.add(p);
        petals.push({
          mesh: p,
          speedY: 0.012 + Math.random() * 0.018,
          rotSpeed: 0.02 + Math.random() * 0.02
        });
      }
      picnicGroup.add(petalsGroup);
      picnicGroup.visible = false;
      scenesGroup.add(picnicGroup);

      // 3. MOONLIGHT WALK (Props prominently positioned inside camera view)
      const moonlightGroup = new THREE.Group();
      const postMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8, roughness: 0.3 });
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.065, 2.2, 10), postMat);
      pole.position.set(1.75, 1.1, 0.2);
      const lanternTop = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.2, 6), postMat);
      lanternTop.position.set(1.75, 2.25, 0.2);
      const lanternGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.25, 6), new THREE.MeshBasicMaterial({ color: 0xffe29a, transparent: true, opacity: 0.9 }));
      lanternGlass.position.set(1.75, 2.05, 0.2);
      const lampLight = new THREE.PointLight(0xffdf88, 1.6, 7);
      lampLight.position.set(1.75, 2.05, 0.3);
      moonlightGroup.add(pole, lanternTop, lanternGlass, lampLight);

      // Crescent Moon in sky (prominently visible behind Budu)
      const moonMesh = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.2, 16, 28, Math.PI * 1.15), new THREE.MeshStandardMaterial({
        color: 0xfff3b0,
        emissive: 0xffe29a,
        emissiveIntensity: 0.9,
        roughness: 0.2
      }));
      moonMesh.position.set(-1.65, 2.25, -0.8);
      moonMesh.rotation.z = 0.55;
      moonlightGroup.add(moonMesh);
      moonlightGroup.visible = false;
      scenesGroup.add(moonlightGroup);

      // 4. STARGAZING GALAXY NIGHT
      const stargazingGroup = new THREE.Group();
      // Brass Telescope on Tripod beside Budu
      const teleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.75, roughness: 0.25 });
      const teleTube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.75, 12), teleMat);
      teleTube.rotation.x = Math.PI / 4.2;
      teleTube.rotation.y = 0.3;
      teleTube.position.set(-1.65, 1.05, 0.3);
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), woodMat);
      leg1.position.set(-1.75, 0.5, 0.3);
      leg1.rotation.z = 0.15;
      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), woodMat);
      leg2.position.set(-1.55, 0.5, 0.3);
      leg2.rotation.z = -0.15;
      stargazingGroup.add(teleTube, leg1, leg2);

      // Glowing Stardust Crystals beside Dudu
      const crystalMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0xa855f7, emissiveIntensity: 0.8, roughness: 0.2 });
      const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 5), crystalMat);
      crystal.position.set(1.65, 0.22, 0.4);
      const crystalLight = new THREE.PointLight(0xc084fc, 1.3, 5);
      crystalLight.position.set(1.65, 0.35, 0.4);
      stargazingGroup.add(crystal, crystalLight);
      stargazingGroup.visible = false;
      scenesGroup.add(stargazingGroup);

      // 5. RAINY DAY UMBRELLA
      const rainGroup = new THREE.Group();
      // Elevated shared umbrella sheltering both Dudu & Budu together
      const umbrellaTop = new THREE.Mesh(
        new THREE.SphereGeometry(1.85, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2.2),
        new THREE.MeshStandardMaterial({ color: 0xffa4c2, roughness: 0.3, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
      );
      umbrellaTop.scale.set(1.0, 0.7, 1.0);
      umbrellaTop.position.set(0, 2.28, 0);
      const umbrellaPole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x475569 }));
      umbrellaPole.position.set(0, 1.5, 0);
      rainGroup.add(umbrellaTop, umbrellaPole);
      rainGroup.visible = false;
      scenesGroup.add(rainGroup);

      // --- SCENE PROFILES CONTROLLER ---
      function setSceneProfile(sceneKey) {
        cafeGroup.visible = (sceneKey === 'cafe');
        picnicGroup.visible = (sceneKey === 'picnic');
        moonlightGroup.visible = (sceneKey === 'moonlight');
        stargazingGroup.visible = (sceneKey === 'stargazing');
        rainGroup.visible = (sceneKey === 'rain');

        if (sceneKey === 'cafe') {
          ambientLight.color.setHex(0xfff6f8);
          romanticPoint.color.setHex(0xffaa5e);
          stage.material.color.setHex(0xffffff);
          rim.material.color.setHex(0xffb6c1);
          rug.material.color.setHex(0xffcad4);
        } else if (sceneKey === 'picnic') {
          ambientLight.color.setHex(0xfff3f8);
          romanticPoint.color.setHex(0xff8da1);
          stage.material.color.setHex(0x4ade80);
          rim.material.color.setHex(0x86efac);
          rug.material.color.setHex(0xffe4e6);
        } else if (sceneKey === 'moonlight') {
          ambientLight.color.setHex(0xc7d2fe);
          romanticPoint.color.setHex(0xffd166);
          stage.material.color.setHex(0x1e1b4b);
          rim.material.color.setHex(0x4338ca);
          rug.material.color.setHex(0x312e81);
        } else if (sceneKey === 'stargazing') {
          ambientLight.color.setHex(0x1e1b4b);
          romanticPoint.color.setHex(0xd8b4fe);
          stage.material.color.setHex(0x0f172a);
          rim.material.color.setHex(0x6366f1);
          rug.material.color.setHex(0x1e293b);
        } else if (sceneKey === 'rain') {
          ambientLight.color.setHex(0x94a3b8);
          romanticPoint.color.setHex(0xfef08a);
          stage.material.color.setHex(0x334155);
          rim.material.color.setHex(0x64748b);
          rug.material.color.setHex(0x475569);
        }
      }

      // Raycaster Tap-To-React handler (No distracting 2D overlays, real 3D reactions!)
      const raycaster = new THREE.Raycaster();
      const mouseVec = new THREE.Vector2();

      onCanvasTap = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        mouseVec.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseVec, camera);

        const girlHits = raycaster.intersectObject(girl.root, true);
        if (girlHits.length > 0) {
          triggerAction('tap_budu');
          const badge = document.getElementById('couple-status-badge');
          if (badge) {
            badge.innerHTML = '<span>🌸</span> Budu: Heehee! That tickles! You made me blush! 💕';
            badge.classList.add('pulse-badge');
            setTimeout(() => badge.classList.remove('pulse-badge'), 500);
          }
          return;
        }

        const boyHits = raycaster.intersectObject(boy.root, true);
        if (boyHits.length > 0) {
          triggerAction('tap_dudu');
          const badge = document.getElementById('couple-status-badge');
          if (badge) {
            badge.innerHTML = '<span>🧸</span> Dudu: Rawr! I\'m your little bear, always right by your side! 💖';
            badge.classList.add('pulse-badge');
            setTimeout(() => badge.classList.remove('pulse-badge'), 500);
          }
          return;
        }

        triggerAction('tap_couple');
        const badge = document.getElementById('couple-status-badge');
        if (badge) {
          badge.innerHTML = '<span>✨</span> Dudu &amp; Budu share a sweet glance in their little universe! 💗';
          badge.classList.add('pulse-badge');
          setTimeout(() => badge.classList.remove('pulse-badge'), 500);
        }
      };

      // --- ANIMATION STATE & ACTION CONTROLLER ---
      let currentAction = 'idle';
      let actionStartTime = 0;

      function triggerAction(actionName) {
        currentAction = actionName;
        actionStartTime = clock.getElapsedTime();

        // Adjust cafe table visibility during hugging/kissing/dancing to keep view clear
        if (actionName === 'hug' || actionName === 'kiss' || actionName === 'dance' || actionName === 'hands') {
          cafeGroup.position.z = 2.4;
        } else {
          cafeGroup.position.z = 0;
        }

        if (actionName === 'hug') {
          setTimeout(() => { if (currentAction === 'hug') currentAction = 'idle'; }, 3800);
        } else if (actionName === 'kiss') {
          setTimeout(() => { if (currentAction === 'kiss') currentAction = 'idle'; }, 3400);
        } else if (actionName === 'dance') {
          setTimeout(() => { if (currentAction === 'dance') currentAction = 'idle'; }, 5500);
        } else if (actionName === 'hands') {
          setTimeout(() => { if (currentAction === 'hands') currentAction = 'idle'; }, 4500);
        } else if (actionName === 'wave') {
          setTimeout(() => { if (currentAction === 'wave') currentAction = 'idle'; }, 3200);
        } else if (actionName === 'tap_budu' || actionName === 'tap_dudu' || actionName === 'tap_couple') {
          setTimeout(() => { if (currentAction === actionName) currentAction = 'idle'; }, 2400);
        } else if (actionName === 'idle' || actionName === 'stop') {
          currentAction = 'idle';
        }
      }

      // Controller Interface
      const controller = {
        playAction: triggerAction,
        setScene: setSceneProfile,

        // Live Closeup Camera Framing for Customizer
        focusCharacter: (charKey) => {
          if (charKey === 'budu') {
            targetCamCenter.set(-1.15, 1.35, 0);
            targetCamRadius = 3.2;
          } else if (charKey === 'dudu') {
            targetCamCenter.set(1.15, 1.35, 0);
            targetCamRadius = 3.2;
          } else {
            targetCamCenter.set(0, 1.25, 0);
            targetCamRadius = 4.7;
          }
        },

        // Budu Styling
        setBuduOutfitStyle: (style) => {
          duduBuduState.buduOutfitStyle = style;
          if (girl.skirtMesh) girl.skirtMesh.visible = (style === 'dress');
          persistDuduBuduState();
        },
        setBuduHair: (hairKey) => {
          duduBuduState.buduHair = hairKey;
          updateCharacterHair(girl, hairKey);
          persistDuduBuduState();
        },
        setBuduOutfitColor: (hex) => {
          duduBuduState.buduOutfitColor = hex;
          girl.sweaterMat.color.set(hex);
          persistDuduBuduState();
        },
        setBuduBlush: (intensity, colorHex) => {
          if (intensity !== undefined) {
            duduBuduState.buduBlushIntensity = intensity;
            girl.blushMat.opacity = intensity;
          }
          if (colorHex) {
            duduBuduState.buduBlushColor = colorHex;
            girl.blushMat.color.set(colorHex);
          }
          persistDuduBuduState();
        },
        setBuduLipColor: (hex) => {
          duduBuduState.buduLipColor = hex;
          if (girl.mouthMat) girl.mouthMat.color.set(hex);
          persistDuduBuduState();
        },
        setBuduAccessory: (accKey) => {
          duduBuduState.buduAccessory = accKey;
          updateCharacterAccessory(girl, accKey);
          persistDuduBuduState();
        },
        setBuduExpression: (exprKey) => {
          duduBuduState.buduExpression = exprKey;
          updateCharacterExpression(girl, exprKey);
          persistDuduBuduState();
        },

        // Dudu Styling
        setDuduOutfitStyle: (style) => {
          duduBuduState.duduOutfitStyle = style;
          if (boy.bowtieGroup) boy.bowtieGroup.visible = (style === 'formal');
          persistDuduBuduState();
        },
        setDuduHair: (hairKey) => {
          duduBuduState.duduHair = hairKey;
          updateCharacterHair(boy, hairKey);
          persistDuduBuduState();
        },
        setDuduOutfitColor: (hex) => {
          duduBuduState.duduOutfitColor = hex;
          boy.hoodieMat.color.set(hex);
          persistDuduBuduState();
        },
        setDuduBlush: (intensity, colorHex) => {
          if (intensity !== undefined) {
            duduBuduState.duduBlushIntensity = intensity;
            boy.blushMat.opacity = intensity;
          }
          if (colorHex) {
            duduBuduState.duduBlushColor = colorHex;
            boy.blushMat.color.set(colorHex);
          }
          persistDuduBuduState();
        },
        setDuduAccessory: (accKey) => {
          duduBuduState.duduAccessory = accKey;
          updateCharacterAccessory(boy, accKey);
          persistDuduBuduState();
        },
        setDuduExpression: (exprKey) => {
          duduBuduState.duduExpression = exprKey;
          updateCharacterExpression(boy, exprKey);
          persistDuduBuduState();
        },

        // Resets
        resetBudu: () => {
          duduBuduState.buduOutfitStyle = 'knit';
          duduBuduState.buduHair = 'classic';
          duduBuduState.buduOutfitColor = '#ff9ebb';
          duduBuduState.buduBlushColor = '#ff8da1';
          duduBuduState.buduBlushIntensity = 0.85;
          duduBuduState.buduLipColor = '#9b334a';
          duduBuduState.buduAccessory = 'pink_bow';
          duduBuduState.buduExpression = 'smile';
          girl.sweaterMat.color.set('#ff9ebb');
          girl.blushMat.color.set('#ff8da1');
          girl.blushMat.opacity = 0.85;
          if (girl.mouthMat) girl.mouthMat.color.set('#9b334a');
          if (girl.skirtMesh) girl.skirtMesh.visible = false;
          updateCharacterAccessory(girl, 'pink_bow');
          updateCharacterHair(girl, 'classic');
          updateCharacterExpression(girl, 'smile');
          persistDuduBuduState();
        },
        resetDudu: () => {
          duduBuduState.duduOutfitStyle = 'hoodie';
          duduBuduState.duduHair = 'classic';
          duduBuduState.duduOutfitColor = '#2b2220';
          duduBuduState.duduBlushColor = '#f4a261';
          duduBuduState.duduBlushIntensity = 0.75;
          duduBuduState.duduAccessory = 'none';
          duduBuduState.duduExpression = 'smile';
          boy.hoodieMat.color.set('#2b2220');
          boy.blushMat.color.set('#f4a261');
          boy.blushMat.opacity = 0.75;
          if (boy.bowtieGroup) boy.bowtieGroup.visible = false;
          updateCharacterAccessory(boy, 'none');
          updateCharacterHair(boy, 'classic');
          updateCharacterExpression(boy, 'smile');
          persistDuduBuduState();
        },
        resetBoth: () => {
          controller.resetBudu();
          controller.resetDudu();
        },

        getState: () => ({ ...duduBuduState }),

        destroy: () => {
          cancelAnimationFrame(coupleFrameId);
          window.removeEventListener('resize', onCoupleResize);
        }
      };

      this.coupleController = controller;
      window.Universe3D.coupleController = controller;
      window.Universe3D.playCoupleAction = (act) => controller.playAction(act);
      window.Universe3D.setCoupleScene = (sc) => controller.setScene(sc);

      // Responsive Resize
      function onCoupleResize() {
        const w = canvas.clientWidth || (canvas.parentElement ? canvas.parentElement.clientWidth : 800) || 800;
        const h = canvas.clientHeight || (canvas.parentElement ? canvas.parentElement.clientHeight : 540) || 540;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onCoupleResize);

      if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
        const ro = new ResizeObserver(() => onCoupleResize());
        ro.observe(canvas.parentElement);
      }
      setTimeout(onCoupleResize, 80);
      setTimeout(onCoupleResize, 400);

      // ======================================================================
      // CONTINUOUS 3D ANIMATION LOOP (Delta-Time Bone Joint Lerping)
      // ======================================================================
      let coupleFrameId = null;
      const clock = new THREE.Clock();

      function animateCouple() {
        if (document.hidden) {
          coupleFrameId = requestAnimationFrame(animateCouple);
          return;
        }

        const delta = Math.min(clock.getDelta(), 0.1);
        const t = clock.getElapsedTime();

        // Smooth camera radius & focus interpolation
        camRadius += (targetCamRadius - camRadius) * (1.0 - Math.exp(-8.0 * delta));
        camTarget.lerp(targetCamCenter, 1.0 - Math.exp(-8.0 * delta));
        updateCameraPosition();

        // Target Root Positions & Orientations
        let girlTargetX = girl.baseX; // -1.25
        let boyTargetX = boy.baseX;   // 1.25
        let girlTargetY = 0;
        let boyTargetY = 0;
        let girlTargetRotY = 0.22;
        let boyTargetRotY = -0.22;

        // Neutral Standing Joint Angles
        let gLShoulder = { x: 0.15, y: 0, z: 0.25 };
        let gRShoulder = { x: 0.15, y: 0, z: -0.25 };
        let gLElbow = { x: 0, y: 0, z: 0 };
        let gRElbow = { x: 0, y: 0, z: 0 };
        let gHead = { x: 0, y: 0, z: Math.sin(t * 1.8) * 0.04 };
        let gLHip = { x: 0, y: 0, z: 0 };
        let gRHip = { x: 0, y: 0, z: 0 };

        let bLShoulder = { x: 0.15, y: 0, z: 0.25 };
        let bRShoulder = { x: 0.15, y: 0, z: -0.25 };
        let bLElbow = { x: 0, y: 0, z: 0 };
        let bRElbow = { x: 0, y: 0, z: 0 };
        let bHead = { x: 0, y: 0, z: -Math.sin(t * 1.8) * 0.04 };
        let bLHip = { x: 0, y: 0, z: 0 };
        let bRHip = { x: 0, y: 0, z: 0 };

        // 1. IDLE (Gentle breathing, subtle arm swaying, natural presence)
        if (currentAction === 'idle') {
          girlTargetY = Math.sin(t * 2.5) * 0.03;
          boyTargetY = Math.sin(t * 2.5 + 0.6) * 0.03;

          gRShoulder.z = -0.25 + Math.sin(t * 2.0) * 0.06;
          bLShoulder.z = 0.25 - Math.sin(t * 2.0) * 0.06;
        }

        // 2. HUG (Move together, bodies rotate into embrace, wrap arms around back)
        else if (currentAction === 'hug') {
          girlTargetX = -0.55;
          boyTargetX = 0.55;
          girlTargetRotY = 0.82;
          boyTargetRotY = -0.82;

          gRShoulder = { x: 0.5, y: 0.6, z: 0.85 };
          gRElbow = { x: 0, y: 0.75, z: 0 };
          gLShoulder = { x: 0.4, y: -0.3, z: 0.5 };
          gLElbow = { x: 0, y: 0.35, z: 0 };
          gHead = { x: 0.08, y: 0, z: -0.22 };

          bLShoulder = { x: 0.5, y: -0.6, z: -0.85 };
          bLElbow = { x: 0, y: -0.75, z: 0 };
          bRShoulder = { x: 0.4, y: 0.3, z: -0.5 };
          bRElbow = { x: 0, y: -0.35, z: 0 };
          bHead = { x: 0.08, y: 0, z: 0.22 };
        }

        // 3. KISS (Move close, turn facing, lean heads in for tender kiss)
        else if (currentAction === 'kiss') {
          girlTargetX = -0.58;
          boyTargetX = 0.58;
          girlTargetRotY = 0.95;
          boyTargetRotY = -0.95;

          girl.pelvis.rotation.x = 0.12;
          boy.pelvis.rotation.x = 0.12;

          gRShoulder = { x: 0.35, y: 0.3, z: 0.45 };
          bLShoulder = { x: 0.35, y: -0.3, z: -0.45 };

          gHead = { x: 0.12, y: 0.22, z: -0.15 };
          bHead = { x: 0.12, y: -0.22, z: 0.15 };
        }

        // 4. DANCE (Coordinated bounce, arm swings, stepping feet)
        else if (currentAction === 'dance') {
          const danceT = t * 6.5;
          girlTargetY = Math.abs(Math.sin(danceT)) * 0.22;
          boyTargetY = Math.abs(Math.cos(danceT)) * 0.22;

          girlTargetRotY = Math.sin(danceT * 0.5) * 0.5;
          boyTargetRotY = -Math.sin(danceT * 0.5) * 0.5;

          gLShoulder = { x: 0, y: 0, z: Math.sin(danceT) * 0.85 - 0.4 };
          gRShoulder = { x: 0, y: 0, z: -Math.sin(danceT) * 0.85 + 0.4 };
          bLShoulder = { x: 0, y: 0, z: Math.cos(danceT) * 0.85 - 0.4 };
          bRShoulder = { x: 0, y: 0, z: -Math.cos(danceT) * 0.85 + 0.4 };

          gLHip.x = Math.sin(danceT) * 0.4;
          gRHip.x = -Math.sin(danceT) * 0.4;
          bLHip.x = Math.cos(danceT) * 0.4;
          bRHip.x = -Math.cos(danceT) * 0.4;

          gHead.z = Math.sin(danceT) * 0.12;
          bHead.z = -Math.cos(danceT) * 0.12;
        }

        // 5. HOLD HANDS (Paws meet and clasp together in center)
        else if (currentAction === 'hands') {
          girlTargetX = -0.85;
          boyTargetX = 0.85;
          girlTargetRotY = 0.35;
          boyTargetRotY = -0.35;

          gRShoulder = { x: 0.25, y: 0.35, z: 0.7 };
          gRElbow = { x: 0, y: 0.4, z: 0 };

          bLShoulder = { x: 0.25, y: -0.35, z: -0.7 };
          bLElbow = { x: 0, y: -0.4, z: 0 };

          const sway = Math.sin(t * 2) * 0.035;
          girlTargetY = sway;
          boyTargetY = sway;
        }

        // 6. WAVE (Face forward and wave paw high)
        else if (currentAction === 'wave') {
          girlTargetRotY = 0.05;
          boyTargetRotY = -0.05;

          gRShoulder = { x: 0, y: 0, z: 2.3 + Math.sin(t * 14) * 0.38 };
          gRElbow = { x: 0, y: 0.3, z: 0 };
          gHead.z = -0.12 + Math.sin(t * 4) * 0.05;

          bLShoulder = { x: 0, y: 0, z: -2.3 - Math.sin(t * 14 + 0.5) * 0.38 };
          bLElbow = { x: 0, y: -0.3, z: 0 };
          bHead.z = 0.12 - Math.sin(t * 4) * 0.05;
        }

        // 7. TAP REACTIONS (Real 3D interactive character feedback)
        else if (currentAction === 'tap_budu') {
          const elapsed = t - actionStartTime;
          girlTargetY = Math.abs(Math.sin(elapsed * 9.0)) * 0.16;
          girlTargetRotY = 0.28;
          gHead = { x: 0.1, y: 0.15, z: Math.sin(elapsed * 9.0) * 0.18 };
          gRShoulder = { x: 0, y: 0, z: 2.1 + Math.sin(elapsed * 12.0) * 0.3 };
          gRElbow = { x: 0, y: 0.35, z: 0 };
          gLShoulder = { x: 0.2, y: 0, z: 0.4 };
          boyTargetRotY = -0.45;
          bHead = { x: 0, y: -0.25, z: 0.05 };
        }
        else if (currentAction === 'tap_dudu') {
          const elapsed = t - actionStartTime;
          boyTargetY = Math.abs(Math.sin(elapsed * 9.0)) * 0.16;
          boyTargetRotY = -0.28;
          bHead = { x: 0.1, y: -0.15, z: -Math.sin(elapsed * 9.0) * 0.18 };
          bLShoulder = { x: 0, y: 0, z: -2.1 - Math.sin(elapsed * 12.0) * 0.3 };
          bLElbow = { x: 0, y: -0.35, z: 0 };
          bRShoulder = { x: 0.2, y: 0, z: -0.4 };
          girlTargetRotY = 0.45;
          gHead = { x: 0, y: 0.25, z: -0.05 };
        }
        else if (currentAction === 'tap_couple') {
          const elapsed = t - actionStartTime;
          girlTargetX = -0.9;
          boyTargetX = 0.9;
          girlTargetRotY = 0.65;
          boyTargetRotY = -0.65;
          girlTargetY = Math.abs(Math.sin(elapsed * 6.0)) * 0.08;
          boyTargetY = Math.abs(Math.sin(elapsed * 6.0)) * 0.08;
          gRShoulder = { x: 0.4, y: 0.3, z: -0.35 };
          bLShoulder = { x: 0.4, y: -0.3, z: 0.35 };
        }

        // Smooth Position & Orientation Exponential Interpolation (Zero frame snapping)
        const lerpFactor = 1.0 - Math.exp(-9.0 * delta);
        girl.root.position.x += (girlTargetX - girl.root.position.x) * lerpFactor;
        girl.root.position.y += (girlTargetY - girl.root.position.y) * lerpFactor;
        girl.root.rotation.y += (girlTargetRotY - girl.root.rotation.y) * lerpFactor;

        boy.root.position.x += (boyTargetX - boy.root.position.x) * lerpFactor;
        boy.root.position.y += (boyTargetY - boy.root.position.y) * lerpFactor;
        boy.root.rotation.y += (boyTargetRotY - boy.root.rotation.y) * lerpFactor;

        // Smooth Joint Angle Interpolations
        function lerpRot(meshGroup, target) {
          meshGroup.rotation.x += (target.x - meshGroup.rotation.x) * lerpFactor;
          meshGroup.rotation.y += (target.y - meshGroup.rotation.y) * lerpFactor;
          meshGroup.rotation.z += (target.z - meshGroup.rotation.z) * lerpFactor;
        }

        lerpRot(girl.leftShoulder, gLShoulder);
        lerpRot(girl.rightShoulder, gRShoulder);
        lerpRot(girl.leftElbow, gLElbow);
        lerpRot(girl.rightElbow, gRElbow);
        lerpRot(girl.head, gHead);
        lerpRot(girl.leftHip, gLHip);
        lerpRot(girl.rightHip, gRHip);

        lerpRot(boy.leftShoulder, bLShoulder);
        lerpRot(boy.rightShoulder, bRShoulder);
        lerpRot(boy.leftElbow, bLElbow);
        lerpRot(boy.rightElbow, bRElbow);
        lerpRot(boy.head, bHead);
        lerpRot(boy.leftHip, bLHip);
        lerpRot(boy.rightHip, bRHip);

        // Animate Cherry Blossom Petals (picnic scene)
        if (picnicGroup.visible) {
          petals.forEach(p => {
            p.mesh.position.y -= p.speedY;
            p.mesh.position.x += Math.sin(t * 2 + p.mesh.position.y) * 0.01;
            p.mesh.rotation.x += p.rotSpeed;
            p.mesh.rotation.y += p.rotSpeed * 0.7;
            if (p.mesh.position.y < -0.2) p.mesh.position.y = 6.5;
          });
        }

        renderer.render(scene, camera);
        coupleFrameId = requestAnimationFrame(animateCouple);
      }

      animateCouple();

      return controller;
    },
    // 5. INTERACTIVE 3D COMPONENT ENHANCEMENTS (CSS 3D Depth)
    // ========================================================================
        init3DCardTilts() {
      if (isTouchDevice || prefersReducedMotion) return;

      // 3D Tilt for Scrapbook Polaroid Cards
      const polaroids = document.querySelectorAll('.scrapbook-card');
      polaroids.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          const tiltX = (y / (rect.height / 2)) * -12;
          const tiltY = (x / (rect.width / 2)) * 12;
          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(16px) scale3d(1.04, 1.04, 1.04)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });

      // 3D Tilt for Interactive Surprise Box
      const giftBox = document.getElementById('surprise-box');
      if (giftBox) {
        giftBox.addEventListener('mousemove', (e) => {
          const rect = giftBox.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          giftBox.style.transform = `perspective(1000px) rotateX(${(y / rect.height) * -20}deg) rotateY(${(x / rect.width) * 20}deg) translateZ(10px)`;
        });

        giftBox.addEventListener('mouseleave', () => {
          giftBox.style.transform = '';
        });
      }
    },

    // ========================================================================
    // 6. FLOATING UNIVERSE CANVAS BACKGROUND
    // ========================================================================
    initBackground(canvasId = 'universe-bg-canvas') {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      let width = window.innerWidth;
      let height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      window.addEventListener('resize', () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      });

      const count = window.innerWidth < 768 ? 20 : 35;
      const colors = ['#FFD6E7', '#FFB6D5', '#DCD6FF', '#FFF8F2', '#FFE29A', '#FF5C8A'];
      const particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 12 + 6,
          speedY: -(Math.random() * 0.6 + 0.2),
          speedX: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.4 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02
        });
      }

      let animId;
      function render() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += p.rotSpeed;
          if (p.y < -20) p.y = height + 20;
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          const s = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.3, s * 0.4, 0, s * 1.3);
          ctx.bezierCurveTo(s * 1.3, s * 0.4, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
          ctx.restore();
        });
        animId = requestAnimationFrame(render);
      }
      render();

      return {
        destroy() {
          cancelAnimationFrame(animId);
        }
      };
    }
  };

  window.Universe3D = Universe3D;
})();
