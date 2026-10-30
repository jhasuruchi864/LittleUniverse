/**
 * Our Little Universe - Private Love Vault Logic
 * Handles locked/unlocked views, folder CRUD, image management, and private media viewing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & User Account Pill ---
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

  // --- Initialize 3D Floating Hearts Background ---
  if (window.Universe3D && typeof window.Universe3D.initBackground === 'function') {
    window.Universe3D.initBackground('universe-bg-canvas');
  }

  // --- Vault State ---
  const state = {
    isUnlocked: false,
    activeFolderId: null,
    folders: [],
    images: [],
    activeImage: null, // For fullscreen viewer & move
    editingFolderId: null
  };

  // --- DOM Elements ---
  const lockedScreen = document.getElementById('vault-locked-screen');
  const unlockedScreen = document.getElementById('vault-unlocked-screen');
  const safeDoor = document.getElementById('safe-door');
  const heartPadlock = document.getElementById('heart-padlock');
  const btnQuickUnlock = document.getElementById('btn-quick-unlock');
  const btnTogglePinForm = document.getElementById('btn-toggle-pin-form');
  const vaultPinForm = document.getElementById('vault-pin-form');
  const pinDigits = [
    document.getElementById('pin-digit-1'),
    document.getElementById('pin-digit-2'),
    document.getElementById('pin-digit-3'),
    document.getElementById('pin-digit-4')
  ];
  const pinErrorMsg = document.getElementById('pin-error-msg');
  const btnLockVault = document.getElementById('btn-lock-vault');

  // Folders & Shelf
  const foldersShelfGrid = document.getElementById('vault-folders-grid');
  const foldersCountText = document.getElementById('folders-count-text');
  const activeFolderIcon = document.getElementById('active-folder-icon');
  const activeFolderTitle = document.getElementById('active-folder-title');
  const activeFolderCount = document.getElementById('active-folder-count');
  const vaultImagesGrid = document.getElementById('vault-images-grid');
  const vaultEmptyState = document.getElementById('vault-empty-state');
  const btnNewFolder = document.getElementById('btn-new-folder');
  const btnRenameCurrentFolder = document.getElementById('btn-rename-current-folder');
  const btnDeleteCurrentFolder = document.getElementById('btn-delete-current-folder');
  const btnConfigurePin = document.getElementById('btn-configure-pin');

  // Modals
  const viewerModal = document.getElementById('polaroid-viewer-modal');
  const viewerFullImage = document.getElementById('viewer-full-image');
  const viewerImageTitle = document.getElementById('viewer-image-title');
  const viewerStyleTag = document.getElementById('viewer-style-tag');
  const viewerSceneTag = document.getElementById('viewer-scene-tag');
  const viewerDateText = document.getElementById('viewer-date-text');
  const viewerCaptionText = document.getElementById('viewer-caption-text');
  const btnViewerDownload = document.getElementById('btn-viewer-download');
  const btnViewerMove = document.getElementById('btn-viewer-move');
  const btnViewerDelete = document.getElementById('btn-viewer-delete');
  const btnCloseViewer = document.getElementById('btn-close-viewer');

  const folderModal = document.getElementById('folder-form-modal');
  const folderModalTitle = document.getElementById('folder-modal-title');
  const folderNameInput = document.getElementById('folder-name-input');
  const emojiPickerButtons = document.querySelectorAll('.emoji-pick-btn');
  const btnCloseFolderModal = document.getElementById('btn-close-folder-modal');
  const btnCancelFolder = document.getElementById('btn-cancel-folder');
  const btnSaveFolder = document.getElementById('btn-save-folder');
  const folderModalStatus = document.getElementById('folder-modal-status');
  let selectedFolderEmoji = '💗';

  const moveModal = document.getElementById('move-image-modal');
  const moveTargetFolderSelect = document.getElementById('move-target-folder-select');
  const btnCloseMoveModal = document.getElementById('btn-close-move-modal');
  const btnCancelMove = document.getElementById('btn-cancel-move');
  const btnConfirmMove = document.getElementById('btn-confirm-move');

  const pinModal = document.getElementById('pin-modal');
  const setPinInput = document.getElementById('set-pin-input');
  const btnClosePinModal = document.getElementById('btn-close-pin-modal');
  const btnCancelSetPin = document.getElementById('btn-cancel-set-pin');
  const btnSavePin = document.getElementById('btn-save-pin');
  const pinModalStatus = document.getElementById('pin-modal-status');

  // --- 1. PIN Input Auto-Advance ---
  pinDigits.forEach((digitInput, idx) => {
    if (!digitInput) return;
    digitInput.addEventListener('input', (e) => {
      if (digitInput.value.length === 1 && idx < pinDigits.length - 1) {
        pinDigits[idx + 1].focus();
      }
    });
    digitInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !digitInput.value && idx > 0) {
        pinDigits[idx - 1].focus();
      }
    });
  });

  if (btnTogglePinForm && vaultPinForm) {
    btnTogglePinForm.addEventListener('click', () => {
      const isVisible = vaultPinForm.style.display !== 'none';
      vaultPinForm.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible && pinDigits[0]) {
        pinDigits[0].focus();
      }
    });
  }

  // --- 2. Vault Unlock Flow ---
  async function unlockVault(pin = '') {
    try {
      const res = await fetch('/api/vault/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        state.isUnlocked = true;
        if (pinErrorMsg) pinErrorMsg.textContent = '';

        // Play smooth unlock animation
        if (heartPadlock) heartPadlock.classList.add('padlock-unlocked');
        if (safeDoor) safeDoor.classList.add('safe-opened');

        setTimeout(async () => {
          lockedScreen.style.display = 'none';
          unlockedScreen.style.display = 'block';
          await loadFolders();
        }, 600);
      } else {
        if (pinErrorMsg) {
          pinErrorMsg.textContent = data.error || 'Incorrect PIN. Try again or quick-unlock.';
        } else {
          alert(data.error || 'Unlock failed.');
        }
      }
    } catch (e) {
      if (pinErrorMsg) pinErrorMsg.textContent = 'Server error during unlock.';
    }
  }

  if (btnQuickUnlock) {
    btnQuickUnlock.addEventListener('click', () => unlockVault(''));
  }

  if (vaultPinForm) {
    vaultPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = pinDigits.map(d => d.value).join('');
      unlockVault(enteredPin);
    });
  }

  // Relock Vault
  if (btnLockVault) {
    btnLockVault.addEventListener('click', () => {
      state.isUnlocked = false;
      state.activeImage = null;
      if (heartPadlock) heartPadlock.classList.remove('padlock-unlocked');
      if (safeDoor) safeDoor.classList.remove('safe-opened');
      pinDigits.forEach(d => { if (d) d.value = ''; });
      unlockedScreen.style.display = 'none';
      lockedScreen.style.display = 'block';
    });
  }

  // --- 3. Folders Management ---
  async function loadFolders() {
    try {
      const res = await fetch('/api/vault/folders');
      if (res.ok) {
        const data = await res.json();
        state.folders = data.folders || [];
        renderFolders();

        // Select first folder if none active
        if (!state.activeFolderId && state.folders.length > 0) {
          selectFolder(state.folders[0].id);
        } else if (state.activeFolderId) {
          selectFolder(state.activeFolderId);
        }
      }
    } catch (e) {
      console.error('Failed to load folders:', e);
    }
  }

  function renderFolders() {
    foldersShelfGrid.innerHTML = '';
    foldersCountText.textContent = `${state.folders.length} Folder${state.folders.length === 1 ? '' : 's'}`;

    state.folders.forEach(folder => {
      const card = document.createElement('div');
      card.className = `vault-folder-card ${folder.id === state.activeFolderId ? 'active' : ''}`;
      card.setAttribute('data-id', folder.id);

      card.innerHTML = `
        <div class="folder-card-top">
          <span class="folder-card-icon">${folder.icon || '📁'}</span>
          <span class="folder-card-count">${folder.imageCount || 0}</span>
        </div>
        <div class="folder-card-name" title="${folder.name}">${folder.name}</div>
      `;

      card.addEventListener('click', () => {
        selectFolder(folder.id);
      });

      foldersShelfGrid.appendChild(card);
    });
  }

  async function selectFolder(folderId) {
    state.activeFolderId = folderId;
    const folder = state.folders.find(f => f.id === folderId);
    if (!folder) return;

    // Update active UI cards
    document.querySelectorAll('.vault-folder-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-id') === folderId);
    });

    activeFolderIcon.textContent = folder.icon || '📁';
    activeFolderTitle.textContent = folder.name;

    await loadImages(folderId);
  }

  // New Folder Modal
  if (btnNewFolder) {
    btnNewFolder.addEventListener('click', () => {
      state.editingFolderId = null;
      folderModalTitle.innerHTML = '<span>📂</span> New Memory Folder';
      folderNameInput.value = '';
      folderModalStatus.textContent = '';
      selectedFolderEmoji = '💗';
      emojiPickerButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-emoji') === '💗'));
      folderModal.style.display = 'flex';
      folderNameInput.focus();
    });
  }

  // Rename Current Folder
  if (btnRenameCurrentFolder) {
    btnRenameCurrentFolder.addEventListener('click', () => {
      const folder = state.folders.find(f => f.id === state.activeFolderId);
      if (!folder) return;
      state.editingFolderId = folder.id;
      folderModalTitle.innerHTML = '<span>✏️</span> Rename Folder';
      folderNameInput.value = folder.name;
      folderModalStatus.textContent = '';
      selectedFolderEmoji = folder.icon || '💗';
      emojiPickerButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-emoji') === selectedFolderEmoji));
      folderModal.style.display = 'flex';
      folderNameInput.focus();
    });
  }

  // Emoji picker
  emojiPickerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiPickerButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFolderEmoji = btn.getAttribute('data-emoji') || '💗';
    });
  });

  function closeFolderModal() {
    folderModal.style.display = 'none';
  }
  if (btnCloseFolderModal) btnCloseFolderModal.addEventListener('click', closeFolderModal);
  if (btnCancelFolder) btnCancelFolder.addEventListener('click', closeFolderModal);

  // Save / Update Folder
  if (btnSaveFolder) {
    btnSaveFolder.addEventListener('click', async () => {
      const name = folderNameInput.value.trim();
      if (!name) {
        folderModalStatus.innerHTML = '<span style="color: #c62828;">Folder name is required.</span>';
        return;
      }

      btnSaveFolder.disabled = true;
      try {
        let res;
        if (state.editingFolderId) {
          // Update
          res = await fetch(`/api/vault/folders/${state.editingFolderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          });
        } else {
          // Create
          res = await fetch('/api/vault/folders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, icon: selectedFolderEmoji })
          });
        }

        const data = await res.json();
        if (res.ok && data.success) {
          closeFolderModal();
          btnSaveFolder.disabled = false;
          await loadFolders();
          if (data.folder && !state.editingFolderId) {
            selectFolder(data.folder.id);
          }
        } else {
          folderModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to save folder.'}</span>`;
          btnSaveFolder.disabled = false;
        }
      } catch (err) {
        folderModalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
        btnSaveFolder.disabled = false;
      }
    });
  }

  // Delete Folder
  if (btnDeleteCurrentFolder) {
    btnDeleteCurrentFolder.addEventListener('click', async () => {
      const folder = state.folders.find(f => f.id === state.activeFolderId);
      if (!folder) return;
      if (state.folders.length <= 1) {
        alert('You must have at least one folder in your vault.');
        return;
      }

      const confirmed = confirm(`Are you sure you want to delete the folder "${folder.name}"? Any images inside will be moved to another folder.`);
      if (!confirmed) return;

      try {
        const res = await fetch(`/api/vault/folders/${folder.id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok && data.success) {
          state.activeFolderId = null;
          await loadFolders();
        } else {
          alert(data.error || 'Failed to delete folder.');
        }
      } catch (e) {
        alert('Error connecting to server.');
      }
    });
  }

  // --- 4. Images Grid Management ---
  async function loadImages(folderId) {
    try {
      const res = await fetch(`/api/vault/images?folderId=${encodeURIComponent(folderId)}`);
      if (res.ok) {
        const data = await res.json();
        state.images = data.images || [];
        renderImages();
      }
    } catch (e) {
      console.error('Failed to load images:', e);
    }
  }

  function renderImages() {
    vaultImagesGrid.innerHTML = '';
    activeFolderCount.textContent = `${state.images.length} picture${state.images.length === 1 ? '' : 's'}`;

    if (state.images.length === 0) {
      vaultEmptyState.style.display = 'block';
      vaultImagesGrid.style.display = 'none';
      return;
    }

    vaultEmptyState.style.display = 'none';
    vaultImagesGrid.style.display = 'grid';

    state.images.forEach(img => {
      const card = document.createElement('div');
      card.className = 'vault-polaroid-card';

      const formattedDate = new Date(img.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      card.innerHTML = `
        <div class="polaroid-photo-frame">
          <img src="${img.fileUrl}" alt="${img.title}" loading="lazy" class="polaroid-img">
          <div class="polaroid-hover-overlay">
            <span class="hover-view-icon">🔍 View Full Size</span>
          </div>
        </div>
        <div class="polaroid-info-pane">
          <h4 class="polaroid-title" title="${img.title}">${img.title}</h4>
          <div class="polaroid-meta-row">
            <span class="polaroid-style-chip">${img.style || 'Couple Art'}</span>
            <span class="polaroid-date-text">${formattedDate}</span>
          </div>
          ${img.caption ? `<p class="polaroid-caption-preview">${img.caption}</p>` : ''}
          <div class="polaroid-action-buttons">
            <button type="button" class="btn-polaroid-action btn-move-img" title="Move to another folder">📁 Move</button>
            <a href="${img.fileUrl}" download="${img.title}.png" class="btn-polaroid-action" title="Download">📥 Save</a>
            <button type="button" class="btn-polaroid-action btn-del-img" title="Delete image">🗑️</button>
          </div>
        </div>
      `;

      // Click card to open full-size lightbox
      const photoFrame = card.querySelector('.polaroid-photo-frame');
      photoFrame.addEventListener('click', () => {
        openViewerModal(img);
      });

      // Move button
      const btnMove = card.querySelector('.btn-move-img');
      btnMove.addEventListener('click', (e) => {
        e.stopPropagation();
        openMoveModal(img);
      });

      // Delete button
      const btnDel = card.querySelector('.btn-del-img');
      btnDel.addEventListener('click', async (e) => {
        e.stopPropagation();
        await deleteImage(img.id);
      });

      vaultImagesGrid.appendChild(card);
    });
  }

  // --- 5. Fullscreen Polaroid Viewer Modal ---
  function openViewerModal(img) {
    state.activeImage = img;
    viewerFullImage.src = img.fileUrl;
    viewerImageTitle.textContent = img.title;
    viewerStyleTag.textContent = img.style || 'Couple Studio Art';
    viewerSceneTag.textContent = img.scene || 'Romantic Universe';
    viewerDateText.textContent = new Date(img.createdAt).toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    viewerCaptionText.textContent = img.caption || 'No romantic caption provided.';
    btnViewerDownload.href = img.fileUrl;
    viewerModal.style.display = 'flex';
  }

  function closeViewerModal() {
    viewerModal.style.display = 'none';
  }
  if (btnCloseViewer) btnCloseViewer.addEventListener('click', closeViewerModal);

  if (btnViewerMove) {
    btnViewerMove.addEventListener('click', () => {
      closeViewerModal();
      if (state.activeImage) openMoveModal(state.activeImage);
    });
  }

  if (btnViewerDelete) {
    btnViewerDelete.addEventListener('click', async () => {
      if (state.activeImage) {
        closeViewerModal();
        await deleteImage(state.activeImage.id);
      }
    });
  }

  // --- 6. Move Image Modal ---
  function openMoveModal(img) {
    state.activeImage = img;
    moveTargetFolderSelect.innerHTML = '';
    state.folders.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = `${f.icon} ${f.name}`;
      if (f.id === img.folderId) opt.selected = true;
      moveTargetFolderSelect.appendChild(opt);
    });
    moveModal.style.display = 'flex';
  }

  function closeMoveModal() {
    moveModal.style.display = 'none';
  }
  if (btnCloseMoveModal) btnCloseMoveModal.addEventListener('click', closeMoveModal);
  if (btnCancelMove) btnCancelMove.addEventListener('click', closeMoveModal);

  if (btnConfirmMove) {
    btnConfirmMove.addEventListener('click', async () => {
      if (!state.activeImage) return;
      const targetFolderId = moveTargetFolderSelect.value;
      try {
        const res = await fetch(`/api/vault/images/${state.activeImage.id}/move`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderId: targetFolderId })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeMoveModal();
          await loadFolders();
          if (state.activeFolderId) await loadImages(state.activeFolderId);
        } else {
          alert(data.error || 'Failed to move image.');
        }
      } catch (err) {
        alert('Network error while moving image.');
      }
    });
  }

  // --- 7. Delete Image ---
  async function deleteImage(imageId) {
    const confirmed = confirm('Are you sure you want to delete this memory from your private vault? This cannot be undone.');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/vault/images/${imageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadFolders();
        if (state.activeFolderId) await loadImages(state.activeFolderId);
      } else {
        alert(data.error || 'Failed to delete image.');
      }
    } catch (e) {
      alert('Network error while deleting image.');
    }
  }

  // --- 8. Set / Change PIN Modal ---
  if (btnConfigurePin) {
    btnConfigurePin.addEventListener('click', () => {
      setPinInput.value = '';
      pinModalStatus.textContent = '';
      pinModal.style.display = 'flex';
      setPinInput.focus();
    });
  }

  function closePinModal() {
    pinModal.style.display = 'none';
  }
  if (btnClosePinModal) btnClosePinModal.addEventListener('click', closePinModal);
  if (btnCancelSetPin) btnCancelSetPin.addEventListener('click', closePinModal);

  if (btnSavePin) {
    btnSavePin.addEventListener('click', async () => {
      const pin = setPinInput.value.trim();
      if (pin && !/^\d{4}$/.test(pin)) {
        pinModalStatus.innerHTML = '<span style="color: #c62828;">PIN must be exactly 4 numeric digits.</span>';
        return;
      }

      btnSavePin.disabled = true;
      try {
        const res = await fetch('/api/vault/set-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          pinModalStatus.innerHTML = '<span style="color: #2e7d32; font-weight: bold;">Love PIN updated! 💖</span>';
          setTimeout(() => {
            closePinModal();
            btnSavePin.disabled = false;
          }, 1200);
        } else {
          pinModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to update PIN.'}</span>`;
          btnSavePin.disabled = false;
        }
      } catch (e) {
        pinModalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
        btnSavePin.disabled = false;
      }
    });
  }

});
