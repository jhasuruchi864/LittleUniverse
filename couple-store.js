const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const COUPLES_FILE = path.join(DATA_DIR, 'couples.json');
const INVITATIONS_FILE = path.join(DATA_DIR, 'invitations.json');
const DIARY_FILE = path.join(DATA_DIR, 'diary.json');
const LETTERS_FILE = path.join(DATA_DIR, 'letters.json');
const TIMELINE_FILE = path.join(DATA_DIR, 'timeline.json');
const ROOM_SETTINGS_FILE = path.join(DATA_DIR, 'room_settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(filePath, defaultVal = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
  }
  return defaultVal;
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Error saving ${filePath}:`, e.message);
  }
}

let couples = loadJSON(COUPLES_FILE, {});
let invitations = loadJSON(INVITATIONS_FILE, {});
let diaryEntries = loadJSON(DIARY_FILE, {});
let letters = loadJSON(LETTERS_FILE, {});
let timelineItems = loadJSON(TIMELINE_FILE, {});
let roomSettings = loadJSON(ROOM_SETTINGS_FILE, {});

// ==========================================
// 1. COUPLE SPACE & PARTNER INVITATION LOGIC
// ==========================================

function getCoupleForUser(userId) {
  for (const coupleId in couples) {
    const c = couples[coupleId];
    if (c.user1Id === userId || c.user2Id === userId) {
      return c;
    }
  }
  return null;
}

function createPartnerInvite(inviterUser) {
  // Check if inviter already has a linked partner
  const existingCouple = getCoupleForUser(inviterUser.id);
  if (existingCouple && existingCouple.user2Id) {
    return { success: false, error: 'You are already linked in a couple space. Unlink first to invite someone else.' };
  }

  // Generate a secure, single-use, 24-hour expiring invitation token
  const inviteCode = `cupid_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

  invitations[inviteCode] = {
    code: inviteCode,
    inviterId: inviterUser.id,
    inviterEmail: inviterUser.email,
    inviterName: inviterUser.displayName || 'Your Soulmate',
    createdAt: Date.now(),
    expiresAt: expiresAt,
    used: false
  };

  saveJSON(INVITATIONS_FILE, invitations);

  return {
    success: true,
    inviteCode,
    inviteUrl: `/shared.html?invite=${inviteCode}`,
    expiresAt: new Date(expiresAt).toISOString()
  };
}

function getInviteDetails(inviteCode) {
  const inv = invitations[inviteCode];
  if (!inv) return { success: false, error: 'Invitation not found or invalid.' };
  if (inv.used) return { success: false, error: 'This invitation has already been used.' };
  if (Date.now() > inv.expiresAt) return { success: false, error: 'This invitation link has expired. Please ask your partner for a fresh invite.' };

  return {
    success: true,
    invite: {
      code: inv.code,
      inviterName: inv.inviterName,
      inviterEmail: inv.inviterEmail,
      expiresAt: new Date(inv.expiresAt).toISOString()
    }
  };
}

function acceptPartnerInvite(inviteCode, acceptingUser) {
  const inv = invitations[inviteCode];
  if (!inv) return { success: false, error: 'Invitation not found.' };
  if (inv.used) return { success: false, error: 'This invitation has already been redeemed.' };
  if (Date.now() > inv.expiresAt) return { success: false, error: 'Invitation expired.' };
  if (inv.inviterId === acceptingUser.id) return { success: false, error: 'You cannot accept your own invitation!' };

  // Check if acceptor is already in a couple
  const existingCouple = getCoupleForUser(acceptingUser.id);
  if (existingCouple && existingCouple.user2Id) {
    return { success: false, error: 'You already belong to a linked couple space. Please unlink your previous partner first.' };
  }

  // Create or link the Couple Space
  const coupleId = `couple_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newCouple = {
    id: coupleId,
    user1Id: inv.inviterId,
    user1Name: inv.inviterName,
    user2Id: acceptingUser.id,
    user2Name: acceptingUser.displayName || 'Soulmate',
    anniversaryDate: null,
    coupleNicknames: `${inv.inviterName} & ${acceptingUser.displayName || 'Soulmate'}`,
    theme: 'pink-dream',
    createdAt: new Date().toISOString()
  };

  couples[coupleId] = newCouple;
  inv.used = true;
  inv.usedAt = Date.now();
  inv.usedBy = acceptingUser.id;

  saveJSON(COUPLES_FILE, couples);
  saveJSON(INVITATIONS_FILE, invitations);

  return {
    success: true,
    couple: newCouple,
    message: 'Partner successfully linked! Welcome to your shared universe.'
  };
}

function unlinkCouple(userId) {
  const couple = getCoupleForUser(userId);
  if (!couple) return { success: false, error: 'You are not in a couple space.' };

  delete couples[couple.id];
  saveJSON(COUPLES_FILE, couples);

  return { success: true, message: 'You have unlinked from your couple space. All personal data remains safe and private.' };
}

function updateCoupleProfile(userId, { anniversaryDate, coupleNicknames, theme }) {
  const couple = getCoupleForUser(userId);
  if (!couple) return { success: false, error: 'Not in a couple space.' };

  if (anniversaryDate !== undefined) couple.anniversaryDate = anniversaryDate;
  if (coupleNicknames !== undefined) couple.coupleNicknames = coupleNicknames.trim();
  if (theme !== undefined) couple.theme = theme;
  couple.updatedAt = new Date().toISOString();

  saveJSON(COUPLES_FILE, couples);
  return { success: true, couple };
}

// ==========================================
// 2. SECRET DIARY & OPEN-WHEN LETTERS
// ==========================================

function getDiaryEntries(userId) {
  const couple = getCoupleForUser(userId);
  const coupleId = couple ? couple.id : null;

  const results = [];
  for (const id in diaryEntries) {
    const entry = diaryEntries[id];
    // Rule: Show if it's user's personal entry OR if it is marked shared in their current couple
    if (entry.authorId === userId) {
      results.push(entry);
    } else if (entry.visibility === 'shared' && coupleId && entry.coupleId === coupleId) {
      results.push(entry);
    }
  }

  return results.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
}

function saveDiaryEntry(userId, { id, title, content, mood = 'happy', tag = 'Moment', visibility = 'personal', date }) {
  if (!content || !content.trim()) return { success: false, error: 'Diary entry content cannot be empty.' };

  const couple = getCoupleForUser(userId);
  const entryId = id || `diary_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  const entry = {
    id: entryId,
    authorId: userId,
    coupleId: couple ? couple.id : null,
    title: (title || 'Secret Thought 💗').trim(),
    content: content.trim(),
    mood: mood || 'happy',
    tag: tag || 'Moment',
    visibility: (visibility === 'shared' && couple) ? 'shared' : 'personal',
    date: date || new Date().toISOString().split('T')[0],
    createdAt: diaryEntries[entryId] ? diaryEntries[entryId].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  diaryEntries[entryId] = entry;
  saveJSON(DIARY_FILE, diaryEntries);
  return { success: true, entry };
}

function deleteDiaryEntry(userId, entryId) {
  const entry = diaryEntries[entryId];
  if (!entry) return { success: false, error: 'Diary entry not found.' };
  if (entry.authorId !== userId) return { success: false, error: 'Only the author can delete this entry.' };

  delete diaryEntries[entryId];
  saveJSON(DIARY_FILE, diaryEntries);
  return { success: true, message: 'Diary entry deleted.' };
}

// Letters ("Open When" Letters)
function getLetters(userId) {
  const couple = getCoupleForUser(userId);
  const coupleId = couple ? couple.id : null;

  const results = [];
  const now = Date.now();

  for (const id in letters) {
    const l = letters[id];
    const isAuthor = l.authorId === userId;
    const isRecipient = (couple && (couple.user1Id === userId || couple.user2Id === userId) && l.coupleId === couple.id && l.authorId !== userId);

    if (isAuthor || isRecipient) {
      // Backend reveal check: If letter has revealDate in future and user is recipient, lock the content!
      const isLocked = Boolean(!isAuthor && l.revealDate && new Date(l.revealDate).getTime() > now);
      results.push({
        ...l,
        content: isLocked ? '🔒 This romantic letter is sealed until its special reveal date!' : l.content,
        isLocked
      });
    }
  }

  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function saveLetter(userId, { templateKey, title, content, recipientName, revealDate, visibility = 'shared' }) {
  if (!content || !content.trim()) return { success: false, error: 'Letter message cannot be empty.' };

  const couple = getCoupleForUser(userId);
  const letterId = `letter_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const letter = {
    id: letterId,
    authorId: userId,
    coupleId: couple ? couple.id : null,
    templateKey: templateKey || 'miss-you',
    title: (title || 'Open When You Miss Me 💌').trim(),
    content: content.trim(),
    recipientName: (recipientName || 'My Love').trim(),
    revealDate: revealDate || null,
    visibility: (visibility === 'shared' && couple) ? 'shared' : 'personal',
    createdAt: new Date().toISOString()
  };

  letters[letterId] = letter;
  saveJSON(LETTERS_FILE, letters);
  return { success: true, letter };
}

function deleteLetter(userId, letterId) {
  const letter = letters[letterId];
  if (!letter) return { success: false, error: 'Letter not found.' };
  if (letter.authorId !== userId) return { success: false, error: 'Only the author can delete this letter.' };

  delete letters[letterId];
  saveJSON(LETTERS_FILE, letters);
  return { success: true, message: 'Letter deleted.' };
}

// ==========================================
// 3. LOVE TIMELINE & MILESTONES
// ==========================================

const DEFAULT_TIMELINE = [
  { id: 'mile_def_1', title: 'The Day We Met ✨', date: '2024-02-14', description: 'When our universes aligned and everything changed.', icon: '✨', visibility: 'shared' },
  { id: 'mile_def_2', title: 'Our First Official Date ☕', date: '2024-03-01', description: 'Laughing over warm coffee and sweet strawberry cakes.', icon: '☕', visibility: 'shared' },
  { id: 'mile_def_3', title: 'Became Official Partners 💕', date: '2024-04-18', description: 'Two souls holding hands in our little universe.', icon: '💕', visibility: 'shared' }
];

function getTimeline(userId) {
  const couple = getCoupleForUser(userId);
  const coupleId = couple ? couple.id : null;

  const results = [];
  for (const id in timelineItems) {
    const item = timelineItems[id];
    if (item.authorId === userId) {
      results.push(item);
    } else if (item.visibility === 'shared' && coupleId && item.coupleId === coupleId) {
      results.push(item);
    }
  }

  if (results.length === 0) {
    return DEFAULT_TIMELINE;
  }

  return results.sort((a, b) => new Date(a.date) - new Date(b.date));
}

function saveTimelineMilestone(userId, { title, date, description, icon = '💖', visibility = 'shared' }) {
  if (!title || !date) return { success: false, error: 'Milestone title and date are required.' };

  const couple = getCoupleForUser(userId);
  const milestoneId = `mile_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const milestone = {
    id: milestoneId,
    authorId: userId,
    coupleId: couple ? couple.id : null,
    title: title.trim(),
    date: date,
    description: (description || '').trim(),
    icon: icon || '💖',
    visibility: (visibility === 'shared' && couple) ? 'shared' : 'personal',
    createdAt: new Date().toISOString()
  };

  timelineItems[milestoneId] = milestone;
  saveJSON(TIMELINE_FILE, timelineItems);
  return { success: true, milestone };
}

function deleteTimelineMilestone(userId, milestoneId) {
  const milestone = timelineItems[milestoneId];
  if (!milestone) return { success: false, error: 'Milestone not found.' };
  if (milestone.authorId !== userId) return { success: false, error: 'Unauthorized.' };

  delete timelineItems[milestoneId];
  saveJSON(TIMELINE_FILE, timelineItems);
  return { success: true, message: 'Milestone deleted.' };
}

// ==========================================
// 4. 3D LOVE ROOM & GALAXY CUSTOMIZATION
// ==========================================

const DEFAULT_ROOM_SETTINGS = {
  theme: 'pink-dream', // pink-dream, lavender-night, moonlight, cozy-cafe, starry-sky
  lightingColor: '#ffb6d5',
  ambientVolume: 0.6,
  showChibiCouple: true,
  furnitureLayout: 'cozy',
  fairyLights: true,
  currentAnimation: 'idle' // idle, wave, hug, dance, hands
};

function getRoomSettings(userId) {
  const couple = getCoupleForUser(userId);
  const key = couple ? couple.id : userId;
  return roomSettings[key] || { ...DEFAULT_ROOM_SETTINGS, coupleMode: Boolean(couple) };
}

function saveRoomSettings(userId, settings) {
  const couple = getCoupleForUser(userId);
  const key = couple ? couple.id : userId;
  roomSettings[key] = {
    ...DEFAULT_ROOM_SETTINGS,
    ...(roomSettings[key] || {}),
    ...settings,
    updatedAt: new Date().toISOString()
  };
  saveJSON(ROOM_SETTINGS_FILE, roomSettings);
  return { success: true, settings: roomSettings[key] };
}

module.exports = {
  getCoupleForUser,
  createPartnerInvite,
  getInviteDetails,
  acceptPartnerInvite,
  unlinkCouple,
  updateCoupleProfile,
  getDiaryEntries,
  saveDiaryEntry,
  deleteDiaryEntry,
  getLetters,
  saveLetter,
  deleteLetter,
  getTimeline,
  saveTimelineMilestone,
  deleteTimelineMilestone,
  getRoomSettings,
  saveRoomSettings
};
