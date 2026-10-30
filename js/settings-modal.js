/**
 * OUR LITTLE UNIVERSE 💗 - INSTAGRAM-STYLE SETTINGS & PROFILE MODAL
 * Provides live Display Name Change, Password Change, Emoji Avatar Customizer, and Logout.
 */

(() => {
  'use strict';

  function ensureSettingsModalDOM() {
    let modalBackdrop = document.getElementById('settings-modal');
    if (!modalBackdrop) {
      modalBackdrop = document.createElement('div');
      modalBackdrop.className = 'settings-modal-backdrop';
      modalBackdrop.id = 'settings-modal';
      modalBackdrop.setAttribute('aria-hidden', 'true');
      modalBackdrop.setAttribute('role', 'dialog');
      modalBackdrop.setAttribute('aria-labelledby', 'settings-modal-title');
      modalBackdrop.innerHTML = `
    <div class="settings-modal-dialog">
      <!-- Modal Header -->
      <div class="settings-modal-header">
        <div class="settings-modal-title-box">
          <span class="settings-title-icon" aria-hidden="true">⚙️</span>
          <h2 class="settings-modal-title" id="settings-modal-title">Settings & Profile</h2>
        </div>
        <button type="button" class="settings-modal-close" id="btn-close-settings" aria-label="Close settings">✕</button>
      </div>

      <!-- Instagram Profile Card -->
      <div class="settings-profile-card">
        <div class="settings-avatar-wrapper">
          <div class="settings-avatar-ring">
            <span class="settings-avatar-emoji" id="settings-avatar-display">🌸</span>
          </div>
        </div>
        <div class="settings-profile-info">
          <div class="settings-profile-name-row">
            <h3 class="settings-profile-name" id="settings-profile-name-display">Luna 💗</h3>
            <span class="settings-verified-badge" title="Soulmate Verified">✓</span>
          </div>
          <p class="settings-profile-email" id="settings-profile-email-display">luna@ouruniverse.love</p>
        </div>
      </div>

      <!-- Quick Avatar Chooser -->
      <div class="settings-avatar-picker-section">
        <label class="settings-section-label">Choose Avatar Emoji</label>
        <div class="settings-avatar-picker-row" id="avatar-picker-row">
          <button type="button" class="avatar-option-btn active" data-avatar="🌸" aria-label="Avatar cherry blossom">🌸</button>
          <button type="button" class="avatar-option-btn" data-avatar="🧸" aria-label="Avatar teddy bear">🧸</button>
          <button type="button" class="avatar-option-btn" data-avatar="🐱" aria-label="Avatar cute kitten">🐱</button>
          <button type="button" class="avatar-option-btn" data-avatar="🐰" aria-label="Avatar sweet bunny">🐰</button>
          <button type="button" class="avatar-option-btn" data-avatar="💖" aria-label="Avatar sparkling heart">💖</button>
          <button type="button" class="avatar-option-btn" data-avatar="🍓" aria-label="Avatar sweet strawberry">🍓</button>
          <button type="button" class="avatar-option-btn" data-avatar="👑" aria-label="Avatar royal crown">👑</button>
          <button type="button" class="avatar-option-btn" data-avatar="✨" aria-label="Avatar starlight sparkles">✨</button>
        </div>
      </div>

      <!-- Settings Sections Tabs / Content -->
      <div class="settings-tabs-content">
        <!-- Section 1: Edit Profile (Name Change) -->
        <div class="settings-card-section">
          <div class="settings-card-header">
            <span class="settings-card-icon" aria-hidden="true">✏️</span>
            <h4>Edit Profile (Change Name)</h4>
          </div>
          <form id="settings-profile-form" class="settings-form" onsubmit="return false;">
            <div class="settings-input-group">
              <label for="settings-name-input" class="settings-input-label">Your Display Name</label>
              <input type="text" id="settings-name-input" class="settings-input" placeholder="e.g. Luna 💗" maxlength="40" required autocomplete="name">
            </div>
            <div class="settings-input-group">
              <label for="settings-partner-input" class="settings-input-label">Partner's Name (Optional)</label>
              <input type="text" id="settings-partner-input" class="settings-input" placeholder="e.g. Oliver" maxlength="40" autocomplete="off">
            </div>
            <button type="submit" class="btn-settings-action primary" id="btn-save-profile">
              <span>Save Name Changes</span> 💾
            </button>
            <div class="settings-feedback-msg" id="profile-feedback-msg" aria-live="polite"></div>
          </form>
        </div>

        <!-- Section 2: Password & Security (Change Password) -->
        <div class="settings-card-section">
          <div class="settings-card-header">
            <span class="settings-card-icon" aria-hidden="true">🔒</span>
            <h4>Password & Security</h4>
          </div>
          <form id="settings-password-form" class="settings-form" onsubmit="return false;">
            <div class="settings-input-group">
              <label for="settings-current-password" class="settings-input-label">Current Password</label>
              <input type="password" id="settings-current-password" class="settings-input" placeholder="Enter current password" autocomplete="current-password" required>
            </div>
            <div class="settings-input-group">
              <label for="settings-new-password" class="settings-input-label">New Password</label>
              <input type="password" id="settings-new-password" class="settings-input" placeholder="Min. 8 characters" autocomplete="new-password" minlength="8" required>
            </div>
            <div class="settings-input-group">
              <label for="settings-confirm-password" class="settings-input-label">Confirm New Password</label>
              <input type="password" id="settings-confirm-password" class="settings-input" placeholder="Re-type new password" autocomplete="new-password" minlength="8" required>
            </div>
            <button type="submit" class="btn-settings-action secondary" id="btn-save-password">
              <span>Update Password</span> 🔐
            </button>
            <div class="settings-feedback-msg" id="password-feedback-msg" aria-live="polite"></div>
          </form>
        </div>

        <!-- Section 3: Instagram-Style Account Actions (Logout) -->
        <div class="settings-card-section logout-section">
          <div class="settings-card-header">
            <span class="settings-card-icon" aria-hidden="true">🚪</span>
            <h4>Account Session</h4>
          </div>
          <p class="settings-logout-note">Log out of your account on this device. Your romantic moments and love vault remain safely protected.</p>
          <button type="button" class="btn-logout instagram-logout-btn" id="btn-logout" aria-label="Log Out of Our Little Universe">
            <span>Log Out of Our Universe</span> 🚪
          </button>
        </div>
      </div>
    </div>`;
      document.body.appendChild(modalBackdrop);
    }
    return modalBackdrop;
  }

  function initSettingsModal() {
    const modalBackdrop = ensureSettingsModalDOM();
    const closeBtn = document.getElementById('btn-close-settings');
    const profileForm = document.getElementById('settings-profile-form');
    const passwordForm = document.getElementById('settings-password-form');
    const nameInput = document.getElementById('settings-name-input');
    const partnerInput = document.getElementById('settings-partner-input');
    const profileFeedback = document.getElementById('profile-feedback-msg');
    const passwordFeedback = document.getElementById('password-feedback-msg');
    const currentPassInput = document.getElementById('settings-current-password');
    const newPassInput = document.getElementById('settings-new-password');
    const confirmPassInput = document.getElementById('settings-confirm-password');
    const avatarBtns = document.querySelectorAll('.avatar-option-btn');
    const avatarDisplay = document.getElementById('settings-avatar-display');
    const navAvatar = document.getElementById('nav-user-avatar');
    const profileNameDisplay = document.getElementById('settings-profile-name-display');
    const profileEmailDisplay = document.getElementById('settings-profile-email-display');
    const btnLogout = document.getElementById('btn-logout');
    const btnModalLogout = document.getElementById('btn-modal-logout');

    // Load saved avatar if any
    const savedAvatar = localStorage.getItem('universe_user_avatar') || '🌸';
    applyAvatar(savedAvatar);

    function applyAvatar(avatar) {
      if (avatarDisplay) avatarDisplay.textContent = avatar;
      if (navAvatar) navAvatar.textContent = avatar;
      document.querySelectorAll('.user-avatar').forEach(el => {
        el.textContent = avatar;
      });
      avatarBtns.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-avatar') === avatar);
      });
      try {
        localStorage.setItem('universe_user_avatar', avatar);
      } catch (e) {}
    }

    // Avatar chooser clicks
    avatarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.getAttribute('data-avatar');
        if (chosen) {
          applyAvatar(chosen);
        }
      });
    });

    // Populate modal with current user state
    async function refreshUserData() {
      try {
        if (!window.UniverseAuth) return;
        const user = await window.UniverseAuth.getSession();
        if (user) {
          const displayName = user.displayName || user.email.split('@')[0];
          if (nameInput) nameInput.value = displayName;
          if (partnerInput) partnerInput.value = user.partnerName || '';
          if (profileNameDisplay) profileNameDisplay.textContent = displayName;
          if (profileEmailDisplay) profileEmailDisplay.textContent = user.email || 'luna@ouruniverse.love';

          // Update navbar display name
          const navNameEl = document.getElementById('user-display-name');
          if (navNameEl) navNameEl.textContent = displayName;

          // Update welcome banner on hero
          const welcomeName = document.getElementById('welcome-user-name');
          if (welcomeName) welcomeName.textContent = displayName;
        }
      } catch (e) {}
    }

    function openModal() {
      refreshUserData();
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (profileFeedback) profileFeedback.textContent = '';
      if (passwordFeedback) passwordFeedback.textContent = '';
    }

    function closeModal() {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Bind all trigger buttons (navbar button or profile pill)
    const triggers = document.querySelectorAll('#nav-settings-btn, .user-settings-trigger');
    triggers.forEach(tr => {
      tr.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('active')) {
        closeModal();
      }
    });

    // Support click & tap toggle on Chapters dropdown button across all pages
    document.addEventListener('click', (e) => {
      const dropdownBtn = e.target.closest('.nav-dropdown-btn');
      if (dropdownBtn) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = dropdownBtn.closest('.nav-dropdown');
        if (dropdown) {
          const isNowOpen = dropdown.classList.toggle('open');
          dropdownBtn.setAttribute('aria-expanded', String(isNowOpen));
        }
        return;
      }
      // Tap outside closes any open dropdown
      if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown.open').forEach(d => {
          d.classList.remove('open');
          const b = d.querySelector('.nav-dropdown-btn');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    });

    // 1. Submit Profile (Change Name)
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = nameInput.value.trim();
        const partnerName = partnerInput ? partnerInput.value.trim() : '';

        if (!newName) {
          showFeedback(profileFeedback, 'Please enter a name! 💗', 'error');
          return;
        }

        showFeedback(profileFeedback, 'Saving changes...', '');

        try {
          if (window.UniverseAuth && typeof window.UniverseAuth.updateProfile === 'function') {
            const res = await window.UniverseAuth.updateProfile({ displayName: newName, partnerName });
            if (res.success) {
              showFeedback(profileFeedback, 'Profile updated successfully! 💗 ✨', 'success');
              if (profileNameDisplay) profileNameDisplay.textContent = newName;
              const navNameEl = document.getElementById('user-display-name');
              if (navNameEl) navNameEl.textContent = newName;
              const welcomeName = document.getElementById('welcome-user-name');
              if (welcomeName) welcomeName.textContent = newName;
            } else {
              showFeedback(profileFeedback, res.error || 'Could not update name.', 'error');
            }
          } else {
            // Local fallback
            let cached = {};
            try {
              cached = JSON.parse(localStorage.getItem('universe_cached_user') || '{}');
            } catch (err) {}
            cached.displayName = newName;
            if (partnerName) cached.partnerName = partnerName;
            localStorage.setItem('universe_cached_user', JSON.stringify(cached));

            const navNameEl = document.getElementById('user-display-name');
            if (navNameEl) navNameEl.textContent = newName;
            if (profileNameDisplay) profileNameDisplay.textContent = newName;
            const welcomeName = document.getElementById('welcome-user-name');
            if (welcomeName) welcomeName.textContent = newName;

            showFeedback(profileFeedback, 'Profile updated successfully! 💗 ✨', 'success');
          }
        } catch (err) {
          showFeedback(profileFeedback, 'Failed to save changes. Please try again.', 'error');
        }
      });
    }

    // 2. Submit Password Change
    if (passwordForm) {
      passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = currentPassInput.value;
        const newPassword = newPassInput.value;
        const confirmPassword = confirmPassInput.value;

        if (!currentPassword) {
          showFeedback(passwordFeedback, 'Please enter your current password.', 'error');
          return;
        }
        if (newPassword.length < 8) {
          showFeedback(passwordFeedback, 'New password must be at least 8 characters long.', 'error');
          return;
        }
        if (newPassword !== confirmPassword) {
          showFeedback(passwordFeedback, 'New passwords do not match!', 'error');
          return;
        }

        showFeedback(passwordFeedback, 'Updating password...', '');

        try {
          if (window.UniverseAuth && typeof window.UniverseAuth.changePassword === 'function') {
            const res = await window.UniverseAuth.changePassword({ currentPassword, newPassword });
            if (res.success) {
              showFeedback(passwordFeedback, 'Password updated successfully! 🔐 💗', 'success');
              currentPassInput.value = '';
              newPassInput.value = '';
              confirmPassInput.value = '';
            } else {
              showFeedback(passwordFeedback, res.error || 'Could not change password.', 'error');
            }
          } else {
            showFeedback(passwordFeedback, 'Password service unavailable.', 'error');
          }
        } catch (err) {
          showFeedback(passwordFeedback, 'Server error changing password. Please try again.', 'error');
        }
      });
    }

    // 3. Logout action
    const handleLogout = async (e) => {
      e.preventDefault();
      if (window.UniverseAuth) {
        await window.UniverseAuth.logout();
      }
      window.location.replace('login.html?logged_out=1');
    };

    if (btnLogout) {
      btnLogout.addEventListener('click', handleLogout);
    }
    if (btnModalLogout) {
      btnModalLogout.addEventListener('click', handleLogout);
    }

    function showFeedback(el, msg, type) {
      if (!el) return;
      el.textContent = msg;
      el.className = 'settings-feedback-msg ' + (type || '');
    }

    // Refresh initially
    refreshUserData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsModal);
  } else {
    initSettingsModal();
  }
})();
