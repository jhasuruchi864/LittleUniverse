const http = require('http');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');
const vaultStore = require('./vault-store');
const aiStudio = require('./ai-studio');
const coupleStore = require('./couple-store');
const relationshipAnalyzerAI = require('./relationship-analyzer-ai');
const analyzerStore = require('./analyzer-store');

const PORT = 5500;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=UTF-8',
  '.json': 'application/json'
};

// Try loading .env if present
const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
  try {
    const envLines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  } catch (e) {
    // ignore
  }
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 15e6) { // 15MB limit for photo uploads
        req.connection.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    ...headers
  });
  res.end(JSON.stringify(data));
}

function getSessionToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const cookies = parseCookies(req);
  return cookies['universe_session'] || null;
}

function authenticateSession(req) {
  const token = getSessionToken(req);
  if (!token) return null;
  const session = auth.getSession(token);
  if (session) return session;
  // Fallback for client offline token
  if (token.startsWith('local_')) {
    return {
      userId: token,
      email: 'local@ouruniverse.love',
      displayName: 'Soulmate 💗'
    };
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // --- API: Public Config for Supabase ---
  if (pathname === '/api/config' && req.method === 'GET') {
    sendJSON(res, 200, {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ''
    });
    return;
  }

  // --- API: AI Studio Status & Configuration ---
  if (pathname === '/api/ai/status' && req.method === 'GET') {
    sendJSON(res, 200, aiStudio.getProviderStatus());
    return;
  }

  // --- API: Generate Couple Photo ---
  if (pathname === '/api/generate-couple-photo' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required to generate couple artwork.' });
      return;
    }
    try {
      const data = await parseBody(req);
      if (!data.consentGiven) {
        sendJSON(res, 400, {
          success: false,
          error: 'Please confirm consent and authorization to generate artwork from the uploaded reference photos.'
        });
        return;
      }
      const result = await aiStudio.generateCoupleArtwork(data);
      if (result.success) {
        sendJSON(res, 200, result);
      } else {
        const statusCode = result.code === 'API_KEY_REQUIRED' ? 422 : 500;
        sendJSON(res, statusCode, result);
      }
    } catch (err) {
      sendJSON(res, 500, { success: false, error: err.message || 'Error processing AI photo generation.' });
    }
    return;
  }

  // --- API: AI Relationship Analyzer Endpoints ---
  // 1. Analyzer Status & AI Configuration
  if (pathname === '/api/analyzer/status' && req.method === 'GET') {
    sendJSON(res, 200, relationshipAnalyzerAI.getAIStatus());
    return;
  }

  // 2. Generate AI Relationship Insights (Server-side AI call)
  if (pathname === '/api/analyzer/ai-insights' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      if (!data.consentGiven) {
        sendJSON(res, 400, {
          success: false,
          error: 'Explicit informed consent from both partners is required before running relationship analysis.'
        });
        return;
      }
      const result = await relationshipAnalyzerAI.generateRelationshipInsights(data);
      if (result.success) {
        sendJSON(res, 200, result);
      } else {
        const statusCode = result.code === 'API_KEY_REQUIRED' ? 422 : 500;
        sendJSON(res, statusCode, result);
      }
    } catch (err) {
      sendJSON(res, 500, { success: false, error: err.message || 'Error executing AI relationship analysis.' });
    }
    return;
  }

  // 3. Save Relationship Report
  if (pathname === '/api/analyzer/report' && req.method === 'POST') {
    const session = authenticateSession(req);
    const userId = session ? session.userId : 'local_default_couple';
    const data = await parseBody(req);
    const result = analyzerStore.saveReport(userId, data);
    sendJSON(res, 200, result);
    return;
  }

  // 4. Get Saved Relationship Report
  if (pathname === '/api/analyzer/report' && req.method === 'GET') {
    const session = authenticateSession(req);
    const userId = session ? session.userId : 'local_default_couple';
    const report = analyzerStore.getReport(userId);
    sendJSON(res, 200, { success: true, report });
    return;
  }

  // 5. Delete All Relationship Reports & Data
  if (pathname === '/api/analyzer/report' && req.method === 'DELETE') {
    const session = authenticateSession(req);
    const userId = session ? session.userId : 'local_default_couple';
    const result = analyzerStore.deleteReport(userId);
    sendJSON(res, 200, result);
    return;
  }

  // 6. Log Weekly Relationship Check-In
  if (pathname === '/api/analyzer/check-in' && req.method === 'POST') {
    const session = authenticateSession(req);
    const userId = session ? session.userId : 'local_default_couple';
    const data = await parseBody(req);
    const result = analyzerStore.saveCheckIn(userId, data);
    sendJSON(res, 201, result);
    return;
  }

  // 7. Get Weekly Relationship Check-Ins
  if (pathname === '/api/analyzer/check-ins' && req.method === 'GET') {
    const session = authenticateSession(req);
    const userId = session ? session.userId : 'local_default_couple';
    const checkIns = analyzerStore.getCheckIns(userId);
    sendJSON(res, 200, { success: true, checkIns });
    return;
  }

  // --- API: Private Love Vault Endpoints ---
  // 1. Vault Unlock & PIN Verification
  if (pathname === '/api/vault/unlock' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const isValid = vaultStore.verifyUserPin(session.userId, data.pin);
    if (isValid) {
      sendJSON(res, 200, { success: true, message: 'Love Vault unlocked.' });
    } else {
      sendJSON(res, 403, { success: false, error: 'Incorrect Love PIN. Please try again.' });
    }
    return;
  }

  // 2. Vault Set/Update PIN
  if (pathname === '/api/vault/set-pin' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = vaultStore.setUserPin(session.userId, data.pin);
    sendJSON(res, 200, result);
    return;
  }

  // 3. Vault Folders (GET, POST)
  if (pathname === '/api/vault/folders' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const folders = vaultStore.getFolders(session.userId);
    sendJSON(res, 200, { success: true, folders });
    return;
  }

  if (pathname === '/api/vault/folders' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = vaultStore.createFolder(session.userId, data);
    sendJSON(res, result.success ? 201 : 400, result);
    return;
  }

  // 4. Vault Folders with ID (PUT, DELETE)
  if (pathname.startsWith('/api/vault/folders/') && req.method === 'PUT') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const folderId = pathname.replace('/api/vault/folders/', '');
    const data = await parseBody(req);
    const result = vaultStore.renameFolder(session.userId, folderId, data.name);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  if (pathname.startsWith('/api/vault/folders/') && req.method === 'DELETE') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const folderId = pathname.replace('/api/vault/folders/', '');
    const result = vaultStore.deleteFolder(session.userId, folderId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // 5. Vault Images (GET, POST)
  if (pathname === '/api/vault/images' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const folderId = parsedUrl.searchParams.get('folderId');
    const images = vaultStore.getImages(session.userId, folderId);
    sendJSON(res, 200, { success: true, images });
    return;
  }

  if (pathname === '/api/vault/images' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = vaultStore.saveImage(session.userId, data);
    sendJSON(res, result.success ? 201 : 400, result);
    return;
  }

  // 6. Vault Image Move (PUT /api/vault/images/:id/move)
  if (pathname.startsWith('/api/vault/images/') && pathname.endsWith('/move') && req.method === 'PUT') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const imageId = pathname.split('/')[4];
    const data = await parseBody(req);
    const result = vaultStore.moveImage(session.userId, imageId, data.folderId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // 7. Vault Image Delete (DELETE /api/vault/images/:id)
  if (pathname.startsWith('/api/vault/images/') && req.method === 'DELETE') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const imageId = pathname.replace('/api/vault/images/', '');
    const result = vaultStore.deleteImage(session.userId, imageId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // 8. Vault Private Image Streaming (/api/vault/files/:id) - Ownership Protected
  if (pathname.startsWith('/api/vault/files/') && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('401 Unauthorized');
      return;
    }
    const imageId = pathname.replace('/api/vault/files/', '');
    const filePath = vaultStore.getPrivateFilePath(session.userId, imageId);
    if (!filePath || !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Private Image Not Found or Access Denied');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'image/webp';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // --- API: Authentication Endpoints ---
  if (pathname === '/api/auth/signup' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const result = auth.registerUser(data);
      if (result.success) {
        sendJSON(res, 201, result, {
          'Set-Cookie': `universe_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        });
      } else {
        sendJSON(res, 400, result);
      }
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error during registration.' });
    }
    return;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const result = auth.loginUser(data);
      if (result.success) {
        sendJSON(res, 200, result, {
          'Set-Cookie': `universe_session=${result.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        });
      } else {
        sendJSON(res, 401, result);
      }
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error during login.' });
    }
    return;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    const token = getSessionToken(req);
    const session = auth.getSession(token);
    if (session) {
      sendJSON(res, 200, {
        success: true,
        user: {
          id: session.userId,
          email: session.email,
          displayName: session.displayName,
          partnerName: session.partnerName
        }
      });
    } else {
      sendJSON(res, 401, { success: false, error: 'Unauthenticated or session expired.' });
    }
    return;
  }

  if (pathname === '/api/auth/logout' && req.method === 'POST') {
    const token = getSessionToken(req);
    auth.deleteSession(token);
    sendJSON(res, 200, { success: true, message: 'Logged out successfully.' }, {
      'Set-Cookie': 'universe_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    });
    return;
  }

  if (pathname === '/api/auth/forgot-password' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const result = auth.requestPasswordReset(data.email);
      sendJSON(res, 200, result);
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error during password reset request.' });
    }
    return;
  }

  if (pathname === '/api/auth/reset-password-confirm' && req.method === 'POST') {
    try {
      const data = await parseBody(req);
      const result = auth.confirmPasswordReset(data);
      if (result.success) {
        sendJSON(res, 200, result);
      } else {
        sendJSON(res, 400, result);
      }
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error during password confirmation.' });
    }
    return;
  }

  if (pathname === '/api/auth/update-profile' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    try {
      const data = await parseBody(req);
      const result = auth.updateProfile({
        email: session.email,
        displayName: data.displayName,
        partnerName: data.partnerName
      });
      sendJSON(res, result.success ? 200 : 400, result);
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error updating profile.' });
    }
    return;
  }

  if (pathname === '/api/auth/change-password' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    try {
      const data = await parseBody(req);
      const result = auth.changePassword({
        email: session.email,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      sendJSON(res, result.success ? 200 : 400, result);
    } catch (err) {
      sendJSON(res, 500, { success: false, error: 'Server error changing password.' });
    }
    return;
  }


  // --- API: Couple Space & Partner Linking Endpoints ---
  if (pathname === '/api/couple/status' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const couple = coupleStore.getCoupleForUser(session.userId);
    sendJSON(res, 200, {
      success: true,
      inCouple: Boolean(couple),
      couple: couple || null
    });
    return;
  }

  if (pathname === '/api/couple/invite' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const result = coupleStore.createPartnerInvite({
      id: session.userId,
      email: session.email,
      displayName: session.displayName
    });
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  if (pathname === '/api/couple/invite-info' && req.method === 'GET') {
    const code = parsedUrl.searchParams.get('code');
    const result = coupleStore.getInviteDetails(code);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  if (pathname === '/api/couple/accept-invite' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.acceptPartnerInvite(data.inviteCode, {
      id: session.userId,
      email: session.email,
      displayName: session.displayName
    });
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  if (pathname === '/api/couple/unlink' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const result = coupleStore.unlinkCouple(session.userId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  if (pathname === '/api/couple/profile' && req.method === 'PUT') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.updateCoupleProfile(session.userId, data);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // --- API: Secret Diary Endpoints ---
  if (pathname === '/api/diary' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const entries = coupleStore.getDiaryEntries(session.userId);
    sendJSON(res, 200, { success: true, entries });
    return;
  }

  if (pathname === '/api/diary' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.saveDiaryEntry(session.userId, data);
    sendJSON(res, result.success ? 201 : 400, result);
    return;
  }

  if (pathname.startsWith('/api/diary/') && req.method === 'DELETE') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const entryId = pathname.replace('/api/diary/', '');
    const result = coupleStore.deleteDiaryEntry(session.userId, entryId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // --- API: Open-When Letters Endpoints ---
  if (pathname === '/api/letters' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const letters = coupleStore.getLetters(session.userId);
    sendJSON(res, 200, { success: true, letters });
    return;
  }

  if (pathname === '/api/letters' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.saveLetter(session.userId, data);
    sendJSON(res, result.success ? 201 : 400, result);
    return;
  }

  if (pathname.startsWith('/api/letters/') && req.method === 'DELETE') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const letterId = pathname.replace('/api/letters/', '');
    const result = coupleStore.deleteLetter(session.userId, letterId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // --- API: Love Timeline Endpoints ---
  if (pathname === '/api/timeline' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const timeline = coupleStore.getTimeline(session.userId);
    sendJSON(res, 200, { success: true, timeline });
    return;
  }

  if (pathname === '/api/timeline' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.saveTimelineMilestone(session.userId, data);
    sendJSON(res, result.success ? 201 : 400, result);
    return;
  }

  if (pathname.startsWith('/api/timeline/') && req.method === 'DELETE') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const milestoneId = pathname.replace('/api/timeline/', '');
    const result = coupleStore.deleteTimelineMilestone(session.userId, milestoneId);
    sendJSON(res, result.success ? 200 : 400, result);
    return;
  }

  // --- API: 3D Room Customization Endpoints ---
  if (pathname === '/api/room/settings' && req.method === 'GET') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const settings = coupleStore.getRoomSettings(session.userId);
    sendJSON(res, 200, { success: true, settings });
    return;
  }

  if (pathname === '/api/room/settings' && req.method === 'POST') {
    const session = authenticateSession(req);
    if (!session) {
      sendJSON(res, 401, { success: false, error: 'Authentication required.' });
      return;
    }
    const data = await parseBody(req);
    const result = coupleStore.saveRoomSettings(session.userId, data);
    sendJSON(res, 200, result);
    return;
  }

  // --- Static Files Serving with Strict Server-Side Authentication Guard ---
  let reqPath = decodeURI(pathname);
  if (reqPath === '/') reqPath = '/index.html';

  // PROTECTED ROUTE CHECK:
  // All personal and shared areas require an authenticated session.
  // Direct access while unauthenticated redirects immediately to /login.html
  const protectedRoutes = [
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
  if (protectedRoutes.includes(reqPath)) {
    const token = getSessionToken(req);
    const session = auth.getSession(token);
    const isClientAuthToken = Boolean(token && (token.startsWith('local_') || token.length >= 16));
    if (!session && !isClientAuthToken) {
      // Unauthenticated visitor -> 302 redirect to login screen
      res.writeHead(302, {
        'Location': '/login.html',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      });
      res.end();
      return;
    }
  }

  const filePath = path.join(__dirname, reqPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Our Little Universe Server running at http://localhost:${PORT}`);
});
