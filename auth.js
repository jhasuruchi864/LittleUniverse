const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const RESETS_FILE = path.join(DATA_DIR, 'resets.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(filePath, defaultValue = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

// In-memory caches backed by JSON
let users = loadJSON(USERS_FILE, {});
let sessions = loadJSON(SESSIONS_FILE, {});
let resetTokens = loadJSON(RESETS_FILE, {});

// Helper to hash password with PBKDF2 (10,000 rounds of SHA-512)
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

// Pre-seed a default demo lover account if no users exist
if (Object.keys(users).length === 0) {
  const demoSalt = crypto.randomBytes(16).toString('hex');
  const demoHash = crypto.pbkdf2Sync('CosmicLove2026!', demoSalt, 10000, 64, 'sha512').toString('hex');
  users['luna@ouruniverse.love'] = {
    id: 'user_luna_001',
    email: 'luna@ouruniverse.love',
    displayName: 'Luna 💗',
    partnerName: 'Oliver',
    passwordHash: demoHash,
    salt: demoSalt,
    createdAt: new Date().toISOString()
  };
  saveJSON(USERS_FILE, users);
}

// Clean up expired sessions (older than 7 days)
function cleanExpiredSessions() {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  let modified = false;
  for (const token in sessions) {
    if (now - sessions[token].createdAt > maxAge) {
      delete sessions[token];
      modified = true;
    }
  }
  if (modified) saveJSON(SESSIONS_FILE, sessions);
}

// Clean up expired reset tokens (older than 1 hour)
function cleanExpiredResets() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour
  let modified = false;
  for (const token in resetTokens) {
    if (now - resetTokens[token].createdAt > maxAge) {
      delete resetTokens[token];
      modified = true;
    }
  }
  if (modified) saveJSON(RESETS_FILE, resetTokens);
}

function createSession(user) {
  cleanExpiredSessions();
  const token = crypto.randomBytes(32).toString('hex');
  sessions[token] = {
    userId: user.id,
    email: user.email,
    displayName: user.displayName,
    partnerName: user.partnerName || '',
    createdAt: Date.now()
  };
  saveJSON(SESSIONS_FILE, sessions);
  return token;
}

function getSession(token) {
  if (!token) return null;
  const session = sessions[token];
  if (!session) return null;
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > maxAge) {
    delete sessions[token];
    saveJSON(SESSIONS_FILE, sessions);
    return null;
  }
  return session;
}

function deleteSession(token) {
  if (sessions[token]) {
    delete sessions[token];
    saveJSON(SESSIONS_FILE, sessions);
    return true;
  }
  return false;
}

function registerUser({ email, password, displayName, partnerName }) {
  if (!email || !password || !displayName) {
    return { success: false, error: 'Email, password, and display name are required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }
  if (users[cleanEmail]) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const { hash, salt } = hashPassword(password);
  const newUser = {
    id: `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: cleanEmail,
    displayName: displayName.trim(),
    partnerName: (partnerName || '').trim(),
    passwordHash: hash,
    salt: salt,
    createdAt: new Date().toISOString()
  };

  users[cleanEmail] = newUser;
  saveJSON(USERS_FILE, users);

  const token = createSession(newUser);
  return {
    success: true,
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      partnerName: newUser.partnerName
    }
  };
}

function loginUser({ email, password }) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = users[cleanEmail];
  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const token = createSession(user);
  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      partnerName: user.partnerName || ''
    }
  };
}

// Request a password reset
function requestPasswordReset(email) {
  cleanExpiredResets();
  if (!email) return { success: false, error: 'Email is required.' };
  const cleanEmail = email.trim().toLowerCase();
  const user = users[cleanEmail];
  
  // Even if user not found, respond with generic message for privacy
  if (!user) {
    return {
      success: true,
      message: 'If an account with this email exists, a reset link has been prepared.'
    };
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  resetTokens[resetToken] = {
    email: cleanEmail,
    createdAt: Date.now()
  };
  saveJSON(RESETS_FILE, resetTokens);

  return {
    success: true,
    message: 'A password reset token has been generated.',
    resetToken, // for testing / direct link in local dev mode
    resetUrl: `/reset-password.html?token=${resetToken}`
  };
}

// Confirm a password reset
function confirmPasswordReset({ token, newPassword }) {
  cleanExpiredResets();
  if (!token || !newPassword) {
    return { success: false, error: 'Reset token and new password are required.' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const record = resetTokens[token];
  if (!record) {
    return { success: false, error: 'Invalid or expired password reset link. Please request a new one.' };
  }

  const user = users[record.email];
  if (!user) {
    delete resetTokens[token];
    saveJSON(RESETS_FILE, resetTokens);
    return { success: false, error: 'User account not found.' };
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.updatedAt = new Date().toISOString();
  saveJSON(USERS_FILE, users);

  // Invalidate all existing sessions for this user for security
  for (const sToken in sessions) {
    if (sessions[sToken].email === user.email) {
      delete sessions[sToken];
    }
  }
  saveJSON(SESSIONS_FILE, sessions);

  // Delete used reset token
  delete resetTokens[token];
  saveJSON(RESETS_FILE, resetTokens);

  return { success: true, message: 'Password has been updated successfully! You can now log in.' };
}

// Update user profile (display name, partner name)
function updateProfile({ email, displayName, partnerName }) {
  if (!email || !displayName) {
    return { success: false, error: 'Display name is required.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = users[cleanEmail];
  if (!user) {
    return { success: false, error: 'User account not found.' };
  }
  user.displayName = displayName.trim();
  if (partnerName !== undefined) {
    user.partnerName = partnerName.trim();
  }
  user.updatedAt = new Date().toISOString();
  saveJSON(USERS_FILE, users);

  // Update active sessions
  for (const sToken in sessions) {
    if (sessions[sToken].email === cleanEmail) {
      sessions[sToken].displayName = user.displayName;
      if (partnerName !== undefined) sessions[sToken].partnerName = user.partnerName;
    }
  }
  saveJSON(SESSIONS_FILE, sessions);

  return {
    success: true,
    message: 'Profile updated successfully! 💗',
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      partnerName: user.partnerName
    }
  };
}

// Change user password
function changePassword({ email, currentPassword, newPassword }) {
  if (!email || !currentPassword || !newPassword) {
    return { success: false, error: 'Current and new password are required.' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = users[cleanEmail];
  if (!user) {
    return { success: false, error: 'User account not found.' };
  }
  const isValid = verifyPassword(currentPassword, user.passwordHash, user.salt);
  if (!isValid) {
    return { success: false, error: 'Current password is incorrect.' };
  }
  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.updatedAt = new Date().toISOString();
  saveJSON(USERS_FILE, users);

  return {
    success: true,
    message: 'Password changed successfully! 💗'
  };
}

module.exports = {
  registerUser,
  loginUser,
  getSession,
  deleteSession,
  requestPasswordReset,
  confirmPasswordReset,
  deleteUserAccount,
  updateProfile,
  changePassword
};

