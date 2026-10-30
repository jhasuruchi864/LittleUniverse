/**
 * Our Little Universe - Love Timeline Logic
 * Chronological milestone journey, upcoming countdown, and modal creation.
 */

document.addEventListener('DOMContentLoaded', () => {
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

  // Timeline DOM
  const timelineNodesList = document.getElementById('timeline-nodes-list');
  const nextMilestoneTitle = document.getElementById('next-milestone-title');
  const nextMilestoneDays = document.getElementById('next-milestone-days');
  const btnAddMilestone = document.getElementById('btn-add-milestone');

  // Modal
  const modal = document.getElementById('milestone-modal');
  const inputTitle = document.getElementById('milestone-title-input');
  const inputDate = document.getElementById('milestone-date-input');
  const inputDesc = document.getElementById('milestone-desc-input');
  const emojiButtons = document.querySelectorAll('#milestone-emoji-picker .emoji-pick-btn');
  const modalStatus = document.getElementById('milestone-modal-status');
  const btnCloseModal = document.getElementById('btn-close-milestone-modal');
  const btnCancel = document.getElementById('btn-cancel-milestone');
  const btnSave = document.getElementById('btn-save-milestone');

  let selectedEmoji = '💖';

  emojiButtons.forEach(b => {
    b.addEventListener('click', () => {
      emojiButtons.forEach(btn => btn.classList.remove('active'));
      b.classList.add('active');
      selectedEmoji = b.getAttribute('data-emoji') || '💖';
    });
  });

  async function loadTimeline() {
    try {
      const res = await fetch('/api/timeline');
      if (res.ok) {
        const data = await res.json();
        renderTimeline(data.timeline || []);
      }
    } catch (e) {
      console.error('Failed to load timeline:', e);
    }
  }

  function renderTimeline(milestones) {
    timelineNodesList.innerHTML = '';

    if (milestones.length === 0) {
      timelineNodesList.innerHTML = '<p class="text-center" style="color: var(--color-plum-light);">No milestones recorded yet. Add your first memory above!</p>';
      return;
    }

    // Sort chronologically
    const sorted = milestones.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate next milestone
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let nextMilestone = null;
    let minDays = Infinity;

    sorted.forEach((m, index) => {
      const mDate = new Date(m.date);
      const isPast = mDate <= today;
      const daysDiff = Math.ceil((mDate - today) / (1000 * 60 * 60 * 24));

      if (daysDiff >= 0 && daysDiff < minDays) {
        minDays = daysDiff;
        nextMilestone = m;
      }

      const node = document.createElement('div');
      node.className = `timeline-milestone-node ${index % 2 === 0 ? 'left' : 'right'}`;

      const formattedDate = mDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });

      node.innerHTML = `
        <div class="milestone-icon-bubble">${m.icon || '💖'}</div>
        <div class="glass-card milestone-content-card">
          <div class="milestone-date-badge">${formattedDate}</div>
          <h3 class="milestone-title">${m.title}</h3>
          ${m.description ? `<p class="milestone-desc">${m.description}</p>` : ''}
          <div class="milestone-status-tag ${isPast ? 'celebrated' : 'upcoming'}">
            ${isPast ? '🌸 Celebrated Memory' : `⏳ In ${daysDiff} days`}
          </div>
          ${m.id && !m.id.startsWith('mile_def') ? `<button type="button" class="btn-text-link btn-del-milestone" style="color: #c62828; margin-top: 0.5rem; font-size: 0.8rem;">Delete</button>` : ''}
        </div>
      `;

      const btnDel = node.querySelector('.btn-del-milestone');
      if (btnDel) {
        btnDel.addEventListener('click', async () => {
          if (confirm('Delete this milestone?')) {
            await fetch(`/api/timeline/${m.id}`, { method: 'DELETE' });
            loadTimeline();
          }
        });
      }

      timelineNodesList.appendChild(node);
    });

    if (nextMilestone) {
      nextMilestoneTitle.textContent = nextMilestone.title;
      nextMilestoneDays.textContent = minDays === 0 ? 'Happening Today! 💖' : `In ${minDays} days (${new Date(nextMilestone.date).toLocaleDateString()})`;
    } else {
      nextMilestoneTitle.textContent = 'Add your next anniversary or date!';
      nextMilestoneDays.textContent = 'Keep celebrating love ✨';
    }
  }

  if (btnAddMilestone) {
    btnAddMilestone.addEventListener('click', () => {
      inputTitle.value = '';
      inputDate.value = new Date().toISOString().split('T')[0];
      inputDesc.value = '';
      modalStatus.textContent = '';
      modal.style.display = 'flex';
      inputTitle.focus();
    });
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const title = inputTitle.value.trim();
      const date = inputDate.value;
      const description = inputDesc.value.trim();

      if (!title || !date) {
        modalStatus.innerHTML = '<span style="color: #c62828;">Title and date are required.</span>';
        return;
      }

      btnSave.disabled = true;
      try {
        const res = await fetch('/api/timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, date, description, icon: selectedEmoji })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeModal();
          loadTimeline();
        } else {
          modalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to save milestone.'}</span>`;
        }
      } catch (e) {
        modalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
      } finally {
        btnSave.disabled = false;
      }
    });
  }

  loadTimeline();
});
