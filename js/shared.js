/**
 * Our Little Universe - Shared Couple Space Logic
 * Handles partner invitations, acceptance, couple profile customization, and unlinking.
 */

document.addEventListener('DOMContentLoaded', async () => {
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

  // 3D Background
  if (window.Universe3D && typeof window.Universe3D.initBackground === 'function') {
    window.Universe3D.initBackground('universe-bg-canvas');
  }

  // DOM Views
  const unlinkedView = document.getElementById('couple-unlinked-view');
  const linkedView = document.getElementById('couple-linked-view');

  // Unlinked elements
  const btnGenerateInvite = document.getElementById('btn-generate-invite');
  const generatedInviteBox = document.getElementById('generated-invite-box');
  const inviteLinkInput = document.getElementById('invite-link-input');
  const btnCopyInvite = document.getElementById('btn-copy-invite');
  const inviteExpiryText = document.getElementById('invite-expiry-text');
  const inputInviteCode = document.getElementById('input-invite-code');
  const btnRedeemInvite = document.getElementById('btn-redeem-invite');
  const redeemStatusMsg = document.getElementById('redeem-status-msg');

  // Linked elements
  const coupleUser1Name = document.getElementById('couple-user1-name');
  const coupleUser2Name = document.getElementById('couple-user2-name');
  const coupleNicknamesTitle = document.getElementById('couple-nicknames-title');
  const coupleAnniversaryText = document.getElementById('couple-anniversary-text');
  const btnEditCoupleProfile = document.getElementById('btn-edit-couple-profile');
  const btnUnlinkPartner = document.getElementById('btn-unlink-partner');

  // Edit Modal
  const editCoupleModal = document.getElementById('edit-couple-modal');
  const inputCoupleNicknames = document.getElementById('input-couple-nicknames');
  const inputCoupleAnniversary = document.getElementById('input-couple-anniversary');
  const btnCloseCoupleModal = document.getElementById('btn-close-couple-modal');
  const btnCancelCoupleEdit = document.getElementById('btn-cancel-couple-edit');
  const btnSaveCoupleEdit = document.getElementById('btn-save-couple-edit');
  const coupleModalStatus = document.getElementById('couple-modal-status');

  let currentCouple = null;

  // Check URL query param for incoming invite code (e.g. shared.html?invite=cupid_...)
  const urlParams = new URLSearchParams(window.location.search);
  const incomingInvite = urlParams.get('invite');
  if (incomingInvite && inputInviteCode) {
    inputInviteCode.value = incomingInvite;
  }

  // Fetch couple status
  async function checkCoupleStatus() {
    try {
      const res = await fetch('/api/couple/status');
      if (res.ok) {
        const data = await res.json();
        if (data.inCouple && data.couple) {
          currentCouple = data.couple;
          renderLinkedDashboard(data.couple);
        } else {
          renderUnlinkedView();
        }
      } else {
        renderUnlinkedView();
      }
    } catch (e) {
      renderUnlinkedView();
    }
  }

  function renderUnlinkedView() {
    if (linkedView) linkedView.style.display = 'none';
    if (unlinkedView) unlinkedView.style.display = 'block';
  }

  function renderLinkedDashboard(couple) {
    if (unlinkedView) unlinkedView.style.display = 'none';
    if (linkedView) linkedView.style.display = 'block';

    if (coupleUser1Name) coupleUser1Name.textContent = couple.user1Name || 'Partner 1';
    if (coupleUser2Name) coupleUser2Name.textContent = couple.user2Name || 'Partner 2';
    if (coupleNicknamesTitle) coupleNicknamesTitle.textContent = couple.coupleNicknames || `${couple.user1Name} & ${couple.user2Name}`;

    if (coupleAnniversaryText) {
      if (couple.anniversaryDate) {
        const d = new Date(couple.anniversaryDate);
        coupleAnniversaryText.innerHTML = `<span>📅</span> Anniversary: <strong>${d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</strong>`;
        
        // Update Relationship Analyzer active days if valid
        const diffDays = Math.max(1, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
        const statDaysEl = document.getElementById('stat-active-days');
        if (statDaysEl && !isNaN(diffDays)) {
          statDaysEl.textContent = `${diffDays} Days`;
        }
      } else {
        coupleAnniversaryText.innerHTML = '<span>📅</span> Anniversary: <em>Set your special date in Edit Profile</em>';
      }
    }
  }

  // Generate Invite
  if (btnGenerateInvite) {
    btnGenerateInvite.addEventListener('click', async () => {
      btnGenerateInvite.disabled = true;
      try {
        const res = await fetch('/api/couple/invite', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          const fullUrl = `${window.location.origin}${data.inviteUrl}`;
          inviteLinkInput.value = fullUrl;
          inviteExpiryText.textContent = `Expires ${new Date(data.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Single-use security`;
          generatedInviteBox.style.display = 'block';
        } else {
          alert(data.error || 'Failed to generate invite.');
        }
      } catch (e) {
        alert('Network error while generating invite.');
      } finally {
        btnGenerateInvite.disabled = false;
      }
    });
  }

  // Copy Invite
  if (btnCopyInvite) {
    btnCopyInvite.addEventListener('click', () => {
      if (!inviteLinkInput.value) return;
      inviteLinkInput.select();
      navigator.clipboard.writeText(inviteLinkInput.value);
      const originalText = btnCopyInvite.textContent;
      btnCopyInvite.textContent = 'Copied! ✨';
      setTimeout(() => { btnCopyInvite.textContent = originalText; }, 2000);
    });
  }

  // Redeem Invite
  if (btnRedeemInvite) {
    btnRedeemInvite.addEventListener('click', async () => {
      let code = inputInviteCode.value.trim();
      if (!code) {
        redeemStatusMsg.innerHTML = '<span style="color: #c62828;">Please enter or paste an invite code.</span>';
        return;
      }

      // If user pasted full URL, extract code
      if (code.includes('invite=')) {
        try {
          const u = new URL(code);
          code = u.searchParams.get('invite') || code;
        } catch (e) {}
      }

      btnRedeemInvite.disabled = true;
      redeemStatusMsg.innerHTML = '<span style="color: var(--color-plum);">Connecting universes... 💕</span>';

      try {
        const res = await fetch('/api/couple/accept-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inviteCode: code })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          redeemStatusMsg.innerHTML = '<span style="color: #2e7d32; font-weight: bold;">Linked successfully! 💖 Welcome to your shared space!</span>';
          setTimeout(() => {
            checkCoupleStatus();
          }, 1200);
        } else {
          redeemStatusMsg.innerHTML = `<span style="color: #c62828;">${data.error || 'Invalid or expired invite.'}</span>`;
        }
      } catch (e) {
        redeemStatusMsg.innerHTML = '<span style="color: #c62828;">Network error.</span>';
      } finally {
        btnRedeemInvite.disabled = false;
      }
    });
  }

  // Edit Profile Modal
  if (btnEditCoupleProfile) {
    btnEditCoupleProfile.addEventListener('click', () => {
      if (!currentCouple) return;
      inputCoupleNicknames.value = currentCouple.coupleNicknames || '';
      inputCoupleAnniversary.value = currentCouple.anniversaryDate || '';
      coupleModalStatus.textContent = '';
      editCoupleModal.style.display = 'flex';
      inputCoupleNicknames.focus();
    });
  }

  function closeCoupleModal() {
    if (editCoupleModal) editCoupleModal.style.display = 'none';
  }
  if (btnCloseCoupleModal) btnCloseCoupleModal.addEventListener('click', closeCoupleModal);
  if (btnCancelCoupleEdit) btnCancelCoupleEdit.addEventListener('click', closeCoupleModal);

  if (btnSaveCoupleEdit) {
    btnSaveCoupleEdit.addEventListener('click', async () => {
      const nicknames = inputCoupleNicknames.value.trim();
      const anniversary = inputCoupleAnniversary.value;

      btnSaveCoupleEdit.disabled = true;
      coupleModalStatus.textContent = 'Saving...';

      try {
        const res = await fetch('/api/couple/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coupleNicknames: nicknames,
            anniversaryDate: anniversary
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeCoupleModal();
          checkCoupleStatus();
        } else {
          coupleModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to update.'}</span>`;
        }
      } catch (e) {
        coupleModalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
      } finally {
        btnSaveCoupleEdit.disabled = false;
      }
    });
  }

  // Unlink Partner
  if (btnUnlinkPartner) {
    btnUnlinkPartner.addEventListener('click', async () => {
      const confirmed = confirm('Are you sure you want to unlink from your partner? You will both return to your personal spaces. All private notes and photos remain completely safe.');
      if (!confirmed) return;

      try {
        const res = await fetch('/api/couple/unlink', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          alert('You have successfully unlinked. Returning to personal view.');
          checkCoupleStatus();
        } else {
          alert(data.error || 'Failed to unlink.');
        }
      } catch (e) {
        alert('Network error.');
      }
    });
  }

  // Run initial status check
  checkCoupleStatus();
});
