const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const VAULT_FILE = path.join(DATA_DIR, 'vaults.json');
const VAULT_FILES_DIR = path.join(DATA_DIR, 'vault_files');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(VAULT_FILES_DIR)) fs.mkdirSync(VAULT_FILES_DIR, { recursive: true });

function loadVaults() {
  try {
    if (fs.existsSync(VAULT_FILE)) {
      return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading vaults.json:', err.message);
  }
  return {};
}

function saveVaults(data) {
  try {
    fs.writeFileSync(VAULT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing vaults.json:', err.message);
  }
}

let vaults = loadVaults();

const DEFAULT_FOLDERS = [
  { id: 'folder_default_1', name: 'Our Cute Moments 💗', icon: '💗', isDefault: true },
  { id: 'folder_default_2', name: 'Chibi Couple 🧸', icon: '🧸', isDefault: true },
  { id: 'folder_default_3', name: 'Date Night 🌙', icon: '🌙', isDefault: true },
  { id: 'folder_default_4', name: 'Favorite Pictures 📸', icon: '📸', isDefault: true },
  { id: 'folder_default_5', name: 'Secret Memories 💌', icon: '💌', isDefault: true },
  { id: 'folder_default_6', name: 'Matching Wallpapers 🎀', icon: '🎀', isDefault: true }
];

function getUserVault(userId) {
  if (!vaults[userId]) {
    vaults[userId] = {
      userId,
      pinHash: null,
      pinSalt: null,
      folders: DEFAULT_FOLDERS.map(f => ({ ...f, createdAt: new Date().toISOString() })),
      images: []
    };
    saveVaults(vaults);
  }

  // Ensure default folders exist if user has empty folders
  if (!vaults[userId].folders || vaults[userId].folders.length === 0) {
    vaults[userId].folders = DEFAULT_FOLDERS.map(f => ({ ...f, createdAt: new Date().toISOString() }));
    saveVaults(vaults);
  }

  return vaults[userId];
}

function verifyUserPin(userId, pin) {
  const vault = getUserVault(userId);
  if (!vault.pinHash) {
    // No custom PIN set -> default to account owner access granted
    return true;
  }
  if (!pin) return false;
  const verifyHash = crypto.pbkdf2Sync(pin, vault.pinSalt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(vault.pinHash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

function setUserPin(userId, pin) {
  const vault = getUserVault(userId);
  if (!pin) {
    vault.pinHash = null;
    vault.pinSalt = null;
  } else {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(pin, salt, 10000, 64, 'sha512').toString('hex');
    vault.pinHash = hash;
    vault.pinSalt = salt;
  }
  saveVaults(vaults);
  return { success: true, hasPin: Boolean(vault.pinHash) };
}

function getFolders(userId) {
  const vault = getUserVault(userId);
  // Calculate image counts per folder
  const counts = {};
  vault.images.forEach(img => {
    counts[img.folderId] = (counts[img.folderId] || 0) + 1;
  });

  return vault.folders.map(f => ({
    ...f,
    imageCount: counts[f.id] || 0
  }));
}

function createFolder(userId, { name, icon = '📁' }) {
  if (!name || !name.trim()) {
    return { success: false, error: 'Folder name is required.' };
  }
  const vault = getUserVault(userId);
  const cleanName = name.trim();
  const folderId = `folder_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const newFolder = {
    id: folderId,
    name: cleanName,
    icon: icon.trim() || '📁',
    isDefault: false,
    createdAt: new Date().toISOString()
  };
  vault.folders.push(newFolder);
  saveVaults(vaults);
  return { success: true, folder: { ...newFolder, imageCount: 0 } };
}

function renameFolder(userId, folderId, newName) {
  if (!newName || !newName.trim()) {
    return { success: false, error: 'New folder name cannot be empty.' };
  }
  const vault = getUserVault(userId);
  const folder = vault.folders.find(f => f.id === folderId);
  if (!folder) {
    return { success: false, error: 'Folder not found.' };
  }
  folder.name = newName.trim();
  folder.updatedAt = new Date().toISOString();
  saveVaults(vaults);
  return { success: true, folder };
}

function deleteFolder(userId, folderId) {
  const vault = getUserVault(userId);
  const folderIndex = vault.folders.findIndex(f => f.id === folderId);
  if (folderIndex === -1) {
    return { success: false, error: 'Folder not found.' };
  }
  // Move any images from this folder to the first remaining default folder or delete them
  const fallbackFolder = vault.folders.find(f => f.id !== folderId) || vault.folders[0];
  vault.images.forEach(img => {
    if (img.folderId === folderId) {
      if (fallbackFolder) {
        img.folderId = fallbackFolder.id;
      }
    }
  });

  vault.folders.splice(folderIndex, 1);
  saveVaults(vaults);
  return { success: true, message: 'Folder deleted successfully.' };
}

function getImages(userId, folderId = null) {
  const vault = getUserVault(userId);
  let imgs = vault.images;
  if (folderId) {
    imgs = imgs.filter(img => img.folderId === folderId);
  }
  // Sort latest first
  return imgs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function saveImage(userId, { folderId, title, caption, style, scene, dataUrl, buffer, ext = 'webp' }) {
  const vault = getUserVault(userId);
  
  // Verify target folder exists
  let targetFolder = vault.folders.find(f => f.id === folderId);
  if (!targetFolder) {
    targetFolder = vault.folders[0];
  }

  const imageId = `img_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const userDir = path.join(VAULT_FILES_DIR, userId);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

  const fileName = `${imageId}.${ext}`;
  const filePath = path.join(userDir, fileName);

  if (buffer) {
    fs.writeFileSync(filePath, buffer);
  } else if (dataUrl && dataUrl.startsWith('data:image/')) {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  } else {
    return { success: false, error: 'Invalid image data provided.' };
  }

  const newImage = {
    id: imageId,
    folderId: targetFolder.id,
    folderName: targetFolder.name,
    title: (title || 'Romantic Memory').trim(),
    caption: (caption || '').trim(),
    style: style || 'Couple Studio Art',
    scene: scene || 'Romantic Universe',
    fileName: fileName,
    fileUrl: `/api/vault/files/${imageId}`,
    createdAt: new Date().toISOString()
  };

  vault.images.push(newImage);
  saveVaults(vaults);
  return { success: true, image: newImage };
}

function moveImage(userId, imageId, newFolderId) {
  const vault = getUserVault(userId);
  const image = vault.images.find(img => img.id === imageId);
  if (!image) {
    return { success: false, error: 'Image not found.' };
  }
  const folder = vault.folders.find(f => f.id === newFolderId);
  if (!folder) {
    return { success: false, error: 'Destination folder does not exist.' };
  }
  image.folderId = folder.id;
  image.folderName = folder.name;
  image.updatedAt = new Date().toISOString();
  saveVaults(vaults);
  return { success: true, image };
}

function deleteImage(userId, imageId) {
  const vault = getUserVault(userId);
  const imageIndex = vault.images.findIndex(img => img.id === imageId);
  if (imageIndex === -1) {
    return { success: false, error: 'Image not found.' };
  }
  const [removed] = vault.images.splice(imageIndex, 1);
  saveVaults(vaults);

  // Remove binary file if present
  try {
    const filePath = path.join(VAULT_FILES_DIR, userId, removed.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error removing file:', err.message);
  }

  return { success: true, message: 'Image deleted successfully.' };
}

function getPrivateFilePath(userId, imageId) {
  const vault = getUserVault(userId);
  const image = vault.images.find(img => img.id === imageId);
  if (!image) return null;
  const filePath = path.join(VAULT_FILES_DIR, userId, image.fileName);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  return null;
}

module.exports = {
  getUserVault,
  verifyUserPin,
  setUserPin,
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder,
  getImages,
  saveImage,
  moveImage,
  deleteImage,
  getPrivateFilePath
};
