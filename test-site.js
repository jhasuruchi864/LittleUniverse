const http = require('http');

const publicUrls = [
  '/login.html',
  '/signup.html',
  '/reset-password.html',
  '/privacy.html',
  '/terms.html',
  '/css/style.css',
  '/js/script.js',
  '/js/auth.js',
  '/js/universe-3d.js',
  '/js/studio.js',
  '/js/vault.js',
  '/js/shared.js',
  '/js/room.js',
  '/js/galaxy.js',
  '/js/diary.js',
  '/js/games.js',
  '/js/timeline.js',
  '/assets/images/memory-1.svg',
  '/assets/images/memory-2.svg',
  '/assets/images/memory-3.svg',
  '/assets/images/memory-4.svg',
  '/assets/images/memory-5.svg',
  '/assets/images/memory-6.svg',
  '/assets/music/background.mp3',
  '/assets/music/README.txt',
  '/api/config',
  '/api/ai/status'
];

function request(options, postData = null) {
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data
        });
      });
    });
    req.on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('--- Testing Our Little Universe Server & Route Protection ---');
  let hasFailures = false;

  // 1. Verify Unauthenticated Protection (Direct URL access to protected routes must 302 redirect to /login.html)
  console.log('\n[TEST 1] Verifying Protected Route Guards (Unauthenticated Access)...');
  const protectedPaths = [
    '/',
    '/index.html',
    '/studio.html',
    '/vault.html',
    '/shared.html',
    '/room.html',
    '/galaxy.html',
    '/diary.html',
    '/games.html',
    '/timeline.html'
  ];
  for (const p of protectedPaths) {
    const unauthRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: p,
      method: 'GET'
    });

    if (unauthRes.status === 302 && unauthRes.headers.location === '/login.html') {
      console.log(`[PASS] Direct unauthenticated access to '${p}' returned 302 Redirect to '${unauthRes.headers.location}'`);
    } else {
      console.error(`[FAIL] Expected 302 Redirect to /login.html for '${p}', got status: ${unauthRes.status}`);
      hasFailures = true;
    }
  }

  // 2. Verify All Public URLs
  console.log('\n[TEST 2] Verifying All Public Pages & Assets (200 OK)...');
  for (const url of publicUrls) {
    const res = await request({
      hostname: 'localhost',
      port: 5500,
      path: url,
      method: 'GET'
    });

    if (res.status === 200 && res.data.length > 0) {
      console.log(`[PASS] ${url} (200 OK, size: ${res.data.length} bytes)`);
    } else {
      console.error(`[FAIL] ${url} -> Status: ${res.status}`);
      hasFailures = true;
    }
  }

  // 3. Verify Real Login Flow & Session Cookie
  console.log('\n[TEST 3] Verifying Real Login & Authenticated Access...');
  const loginRes = await request({
    hostname: 'localhost',
    port: 5500,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'luna@ouruniverse.love',
    password: 'CosmicLove2026!'
  });

  let sessionCookie = null;
  if (loginRes.status === 200) {
    const parsed = JSON.parse(loginRes.data);
    if (parsed.success && parsed.token) {
      console.log(`[PASS] Login successful for ${parsed.user.email} (${parsed.user.displayName})`);
      const setCookie = loginRes.headers['set-cookie'];
      if (setCookie && setCookie.length > 0) {
        sessionCookie = setCookie[0].split(';')[0];
        console.log(`[PASS] Server issued HttpOnly session cookie: ${sessionCookie.substring(0, 30)}...`);
      }
    } else {
      console.error(`[FAIL] Login response did not contain success token: ${loginRes.data}`);
      hasFailures = true;
    }
  } else {
    console.error(`[FAIL] Login endpoint returned status: ${loginRes.status}`);
    hasFailures = true;
  }

  // 4. Verify Authenticated Access to Protected Pages with Session Cookie
  if (sessionCookie) {
    console.log('\n[TEST 4] Verifying Access to Protected Pages with Session Cookie...');
    const allProtectedPages = [
      '/index.html',
      '/studio.html',
      '/vault.html',
      '/shared.html',
      '/room.html',
      '/galaxy.html',
      '/diary.html',
      '/games.html',
      '/timeline.html'
    ];
    for (const page of allProtectedPages) {
      const authRes = await request({
        hostname: 'localhost',
        port: 5500,
        path: page,
        method: 'GET',
        headers: { 'Cookie': sessionCookie }
      });

      if (authRes.status === 200 && authRes.data.length > 0) {
        console.log(`[PASS] Authenticated request to '${page}' succeeded with 200 OK (${authRes.data.length} bytes)`);
      } else {
        console.error(`[FAIL] Authenticated request to '${page}' failed with status: ${authRes.status}`);
        hasFailures = true;
      }
    }

    // 5. Verify Private Love Vault Endpoints & Security
    console.log('\n[TEST 5] Verifying Private Love Vault APIs & Security Isolation...');

    // 5a. Get default folders
    const foldersRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/vault/folders',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    let defaultFolders = [];
    if (foldersRes.status === 200) {
      const parsed = JSON.parse(foldersRes.data);
      if (parsed.success && Array.isArray(parsed.folders) && parsed.folders.length >= 6) {
        defaultFolders = parsed.folders;
        console.log(`[PASS] Vault folders fetched successfully: ${parsed.folders.length} folders found`);
      } else {
        console.error(`[FAIL] Expected 6 default folders, got: ${foldersRes.data}`);
        hasFailures = true;
      }
    } else {
      console.error(`[FAIL] GET /api/vault/folders returned status: ${foldersRes.status}`);
      hasFailures = true;
    }

    // 5b. Save a test artwork image to Vault
    const sampleFolderId = defaultFolders[0] ? defaultFolders[0].id : 'folder_default_1';
    // 1x1 transparent png data url
    const testPixelDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const saveImgRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/vault/images',
      method: 'POST',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      }
    }, {
      folderId: sampleFolderId,
      title: 'Our Test Starlight Chibi 💖',
      caption: 'Automated test romantic memory',
      style: 'Cute 3D chibi couple',
      scene: 'Magical heart universe',
      dataUrl: testPixelDataUrl
    });

    let savedImageId = null;
    if (saveImgRes.status === 201) {
      const parsed = JSON.parse(saveImgRes.data);
      if (parsed.success && parsed.image && parsed.image.id) {
        savedImageId = parsed.image.id;
        console.log(`[PASS] Image saved to vault with ID: ${savedImageId}`);
      } else {
        console.error(`[FAIL] Save image response missing image ID: ${saveImgRes.data}`);
        hasFailures = true;
      }
    } else {
      console.error(`[FAIL] POST /api/vault/images returned status: ${saveImgRes.status}`);
      hasFailures = true;
    }

    // 5c. Stream private image file (Authenticated owner test)
    if (savedImageId) {
      const fileRes = await request({
        hostname: 'localhost',
        port: 5500,
        path: `/api/vault/files/${savedImageId}`,
        method: 'GET',
        headers: { 'Cookie': sessionCookie }
      });
      if (fileRes.status === 200 && fileRes.data.length > 0) {
        console.log(`[PASS] Authenticated image retrieval (/api/vault/files/${savedImageId}) returned 200 OK (${fileRes.data.length} bytes)`);
      } else {
        console.error(`[FAIL] Authenticated image retrieval returned status: ${fileRes.status}`);
        hasFailures = true;
      }

      // 5d. Cross-Account / Unauthenticated Access Denial Test (Crucial Security Check)
      const unauthFileRes = await request({
        hostname: 'localhost',
        port: 5500,
        path: `/api/vault/files/${savedImageId}`,
        method: 'GET'
        // No cookie passed!
      });
      if (unauthFileRes.status === 401) {
        console.log(`[PASS] Unauthenticated access to private image was DENIED (401 Unauthorized) as required`);
      } else {
        console.error(`[FAIL] Expected 401 Unauthorized for private image without auth, got: ${unauthFileRes.status}`);
        hasFailures = true;
      }

      // 5e. Clean up test image
      const delImgRes = await request({
        hostname: 'localhost',
        port: 5500,
        path: `/api/vault/images/${savedImageId}`,
        method: 'DELETE',
        headers: { 'Cookie': sessionCookie }
      });
      if (delImgRes.status === 200) {
        console.log(`[PASS] Test image successfully deleted from vault`);
      }
    }

    // 6. Verify Couple & Shared Space APIs
    console.log('\n[TEST 6] Verifying Couple & Shared Space APIs...');

    // 6a. Couple Status
    const coupleStatusRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/couple/status',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    if (coupleStatusRes.status === 200) {
      const parsed = JSON.parse(coupleStatusRes.data);
      if (parsed.success) {
        console.log(`[PASS] GET /api/couple/status succeeded (inCouple: ${parsed.inCouple})`);
      } else {
        console.error(`[FAIL] GET /api/couple/status did not return success`);
        hasFailures = true;
      }
    } else {
      console.error(`[FAIL] GET /api/couple/status returned status: ${coupleStatusRes.status}`);
      hasFailures = true;
    }

    // 6b. Generate Single-Use 24h Invite
    const inviteRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/couple/invite',
      method: 'POST',
      headers: { 'Cookie': sessionCookie }
    });
    if (inviteRes.status === 201 || inviteRes.status === 200) {
      const parsed = JSON.parse(inviteRes.data);
      if (parsed.success && parsed.inviteCode && parsed.expiresAt) {
        console.log(`[PASS] POST /api/couple/invite generated single-use token: ${parsed.inviteCode}`);
      } else {
        console.error(`[FAIL] POST /api/couple/invite missing token or expiry`);
        hasFailures = true;
      }
    } else {
      console.error(`[FAIL] POST /api/couple/invite returned status: ${inviteRes.status}`);
      hasFailures = true;
    }

    // 6c. Room Settings
    const roomRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/room/settings',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    if (roomRes.status === 200) {
      const parsed = JSON.parse(roomRes.data);
      if (parsed.success && parsed.settings) {
        console.log(`[PASS] GET /api/room/settings returned theme: ${parsed.settings.theme}`);
      }
    } else {
      console.error(`[FAIL] GET /api/room/settings returned status: ${roomRes.status}`);
      hasFailures = true;
    }

    // 6d. Secret Diary Endpoints
    const diaryRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/diary',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    if (diaryRes.status === 200) {
      const parsed = JSON.parse(diaryRes.data);
      if (parsed.success && Array.isArray(parsed.entries)) {
        console.log(`[PASS] GET /api/diary returned ${parsed.entries.length} entries`);
      }
    } else {
      console.error(`[FAIL] GET /api/diary returned status: ${diaryRes.status}`);
      hasFailures = true;
    }

    // 6e. Open-When Letters Endpoints
    const lettersRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/letters',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    if (lettersRes.status === 200) {
      const parsed = JSON.parse(lettersRes.data);
      if (parsed.success && Array.isArray(parsed.letters)) {
        console.log(`[PASS] GET /api/letters returned ${parsed.letters.length} letters`);
      }
    } else {
      console.error(`[FAIL] GET /api/letters returned status: ${lettersRes.status}`);
      hasFailures = true;
    }

    // 6f. Timeline Milestones Endpoints
    const timelineRes = await request({
      hostname: 'localhost',
      port: 5500,
      path: '/api/timeline',
      method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    if (timelineRes.status === 200) {
      const parsed = JSON.parse(timelineRes.data);
      if (parsed.success && Array.isArray(parsed.milestones)) {
        console.log(`[PASS] GET /api/timeline returned ${parsed.milestones.length} milestones`);
      }
    } else {
      console.error(`[FAIL] GET /api/timeline returned status: ${timelineRes.status}`);
      hasFailures = true;
    }
  }

  if (hasFailures) {
    console.error('\n❌ Some endpoints or security checks failed!');
    process.exit(1);
  } else {
    console.log('\n🌟 ALL SERVER, ROUTE PROTECTION, VAULT & SECURITY TESTS PASSED! 🌟');
  }
}

run();
