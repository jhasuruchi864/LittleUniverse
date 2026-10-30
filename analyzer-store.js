/**
 * analyzer-store.js
 * In-memory / file-persisted Relationship Insights and Weekly Check-ins store
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'relationship-reports.json');
const CHECKINS_FILE = path.join(DATA_DIR, 'relationship-checkins.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
  }
  return fallback;
}

function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error(`Error saving ${filePath}:`, e.message);
    return false;
  }
}

const reportsStore = loadData(REPORTS_FILE, {});
const checkinsStore = loadData(CHECKINS_FILE, {});

const AnalyzerStore = {
  saveReport(userId, reportData) {
    if (!userId) return { success: false, error: 'User ID is required' };
    reportsStore[userId] = {
      ...reportData,
      updatedAt: new Date().toISOString()
    };
    saveData(REPORTS_FILE, reportsStore);
    return { success: true, message: 'Relationship report saved successfully.' };
  },

  getReport(userId) {
    if (!userId) return null;
    return reportsStore[userId] || null;
  },

  deleteReport(userId) {
    if (!userId) return { success: false, error: 'User ID is required' };
    delete reportsStore[userId];
    delete checkinsStore[userId];
    saveData(REPORTS_FILE, reportsStore);
    saveData(CHECKINS_FILE, checkinsStore);
    return { success: true, message: 'All relationship data, insights, and check-ins deleted successfully.' };
  },

  saveCheckIn(userId, checkInData) {
    if (!userId) return { success: false, error: 'User ID is required' };
    if (!checkinsStore[userId]) checkinsStore[userId] = [];
    
    const entry = {
      id: 'chk_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      date: new Date().toISOString(),
      harmonyRating: Number(checkInData.harmonyRating) || 5,
      celebration: checkInData.celebration || '',
      growthGoal: checkInData.growthGoal || '',
      notes: checkInData.notes || ''
    };

    checkinsStore[userId].unshift(entry);
    saveData(CHECKINS_FILE, checkinsStore);
    return { success: true, checkIn: entry };
  },

  getCheckIns(userId) {
    if (!userId) return [];
    return checkinsStore[userId] || [];
  }
};

module.exports = AnalyzerStore;
