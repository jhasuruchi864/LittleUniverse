/**
 * Our Little Universe - Diary & Letters Logic
 * Handles diary entry creation, editing, deletion, open-when letters, and animated letter reveals.
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

  // Tab switching: Diary vs Letters
  const tabBtnDiary = document.getElementById('tab-btn-diary');
  const tabBtnLetters = document.getElementById('tab-btn-letters');
  const panelDiary = document.getElementById('panel-diary');
  const panelLetters = document.getElementById('panel-letters');

  tabBtnDiary.addEventListener('click', () => {
    tabBtnDiary.classList.add('active');
    tabBtnLetters.classList.remove('active');
    panelDiary.style.display = 'block';
    panelLetters.style.display = 'none';
  });

  tabBtnLetters.addEventListener('click', () => {
    tabBtnLetters.classList.add('active');
    tabBtnDiary.classList.remove('active');
    panelLetters.style.display = 'block';
    panelDiary.style.display = 'none';
  });

  // --- 1. Diary Entries Management ---
  const diaryGrid = document.getElementById('diary-entries-grid');
  const diaryCountText = document.getElementById('diary-count-text');
  const btnNewDiary = document.getElementById('btn-new-diary-entry');

  const diaryModal = document.getElementById('diary-modal');
  const diaryTitleInput = document.getElementById('diary-title-input');
  const diaryContentInput = document.getElementById('diary-content-input');
  const diaryMoodSelect = document.getElementById('diary-mood-select');
  const diaryVisibilitySelect = document.getElementById('diary-visibility-select');
  const btnCloseDiaryModal = document.getElementById('btn-close-diary-modal');
  const btnCancelDiary = document.getElementById('btn-cancel-diary');
  const btnSaveDiary = document.getElementById('btn-save-diary');
  const diaryModalStatus = document.getElementById('diary-modal-status');

  const MOOD_ICONS = {
    'happy': '💖',
    'cozy': '☕',
    'missing': '🥺',
    'excited': '✨'
  };

  async function loadDiaryEntries() {
    try {
      const res = await fetch('/api/diary');
      if (res.ok) {
        const data = await res.json();
        renderDiaryEntries(data.entries || []);
      }
    } catch (e) {
      console.error('Failed to load diary:', e);
    }
  }

  function renderDiaryEntries(entries) {
    diaryGrid.innerHTML = '';
    diaryCountText.textContent = `${entries.length} Entr${entries.length === 1 ? 'y' : 'ies'}`;

    if (entries.length === 0) {
      diaryGrid.innerHTML = `
        <div class="vault-empty-folder-state" style="grid-column: 1 / -1;">
          <div class="empty-chibi-badge">📔</div>
          <h3>Your diary is blank and waiting for your thoughts</h3>
          <p>Click "Write New Entry" above to jot down a sweet thought or memory.</p>
        </div>
      `;
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'glass-card diary-card';

      const moodIcon = MOOD_ICONS[entry.mood] || '💖';
      const isShared = entry.visibility === 'shared';

      card.innerHTML = `
        <div class="diary-card-header">
          <div class="diary-meta-left">
            <span class="diary-mood-badge">${moodIcon}</span>
            <span class="diary-visibility-badge ${isShared ? 'shared' : 'personal'}">${isShared ? '💕 Shared' : '🔒 Personal'}</span>
          </div>
          <span class="diary-date">${new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <h3 class="diary-title">${entry.title}</h3>
        <p class="diary-content">${entry.content}</p>
        <div class="diary-card-footer">
          <button type="button" class="btn-text-link btn-del-diary" style="color: #c62828;">Delete Entry</button>
        </div>
      `;

      card.querySelector('.btn-del-diary').addEventListener('click', async () => {
        if (confirm('Delete this diary entry?')) {
          await fetch(`/api/diary/${entry.id}`, { method: 'DELETE' });
          loadDiaryEntries();
        }
      });

      diaryGrid.appendChild(card);
    });
  }

  if (btnNewDiary) {
    btnNewDiary.addEventListener('click', () => {
      diaryTitleInput.value = '';
      diaryContentInput.value = '';
      diaryModalStatus.textContent = '';
      diaryModal.style.display = 'flex';
      diaryTitleInput.focus();
    });
  }

  function closeDiaryModal() {
    diaryModal.style.display = 'none';
  }
  if (btnCloseDiaryModal) btnCloseDiaryModal.addEventListener('click', closeDiaryModal);
  if (btnCancelDiary) btnCancelDiary.addEventListener('click', closeDiaryModal);

  if (btnSaveDiary) {
    btnSaveDiary.addEventListener('click', async () => {
      const title = diaryTitleInput.value.trim() || 'Secret Thought 💗';
      const content = diaryContentInput.value.trim();
      const mood = diaryMoodSelect.value;
      const visibility = diaryVisibilitySelect.value;

      if (!content) {
        diaryModalStatus.innerHTML = '<span style="color: #c62828;">Please write some thoughts before saving.</span>';
        return;
      }

      btnSaveDiary.disabled = true;
      try {
        const res = await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, mood, visibility })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeDiaryModal();
          loadDiaryEntries();
        } else {
          diaryModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to save.'}</span>`;
        }
      } catch (e) {
        diaryModalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
      } finally {
        btnSaveDiary.disabled = false;
      }
    });
  }

  // --- 2. Open-When Letters Management ---
  const lettersGrid = document.getElementById('letters-envelopes-grid');
  const lettersCountText = document.getElementById('letters-count-text');
  const btnComposeLetter = document.getElementById('btn-compose-letter');

  const letterModal = document.getElementById('letter-modal');
  const letterTemplateSelect = document.getElementById('letter-template-select');
  const letterTitleInput = document.getElementById('letter-title-input');
  const letterContentInput = document.getElementById('letter-content-input');
  const letterRevealDate = document.getElementById('letter-reveal-date');
  const btnCloseLetterModal = document.getElementById('btn-close-letter-modal');
  const btnCancelLetter = document.getElementById('btn-cancel-letter');
  const btnSaveLetter = document.getElementById('btn-save-letter');
  const letterModalStatus = document.getElementById('letter-modal-status');

  // Read Letter Modal
  const readLetterModal = document.getElementById('read-letter-modal');
  const readLetterTitle = document.getElementById('read-letter-title');
  const readLetterText = document.getElementById('read-letter-text');
  const btnCloseReadLetter = document.getElementById('btn-close-read-letter');
  const btnFoldLetter = document.getElementById('btn-fold-letter');

  const TEMPLATE_TITLES = {
    'miss-you': 'Open When You Miss Me 💖',
    'sad': 'Open When You Feel Sad 🌧️',
    'anniversary': 'Open On Our Anniversary 🥂',
    'encouragement': 'Open When You Need Encouragement 🌟',
    'surprise': 'Open When You Want a Sweet Surprise 🎁'
  };

  letterTemplateSelect.addEventListener('change', () => {
    letterTitleInput.value = TEMPLATE_TITLES[letterTemplateSelect.value] || 'Open When You Miss Me 💌';
  });

  async function loadLetters() {
    try {
      const res = await fetch('/api/letters');
      if (res.ok) {
        const data = await res.json();
        renderLetters(data.letters || []);
      }
    } catch (e) {
      console.error('Failed to load letters:', e);
    }
  }

  function renderLetters(letters) {
    lettersGrid.innerHTML = '';
    lettersCountText.textContent = `${letters.length} Letter${letters.length === 1 ? '' : 's'}`;

    if (letters.length === 0) {
      lettersGrid.innerHTML = `
        <div class="vault-empty-folder-state" style="grid-column: 1 / -1;">
          <div class="empty-chibi-badge">💌</div>
          <h3>No sealed letters in your mailbox yet</h3>
          <p>Click "Compose a Love Letter" above to write an open-when letter for your partner.</p>
        </div>
      `;
      return;
    }

    letters.forEach(letter => {
      const card = document.createElement('div');
      card.className = `glass-card letter-envelope-card ${letter.isLocked ? 'locked-letter' : ''}`;

      const dateStr = letter.revealDate
        ? `Sealed until ${new Date(letter.revealDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Open Anytime 🌸';

      card.innerHTML = `
        <div class="envelope-top-seal">
          <span class="seal-icon">${letter.isLocked ? '🔒' : '💌'}</span>
        </div>
        <h3 class="letter-envelope-title">${letter.title}</h3>
        <p class="letter-envelope-date">${dateStr}</p>
        <div class="letter-card-actions">
          <button type="button" class="btn btn-primary btn-sm btn-open-envelope">${letter.isLocked ? 'Sealed 🔒' : 'Unseal & Read 💕'}</button>
          <button type="button" class="btn-text-link btn-del-letter" style="color: #c62828; margin-top: 0.5rem; font-size: 0.8rem;">Delete</button>
        </div>
      `;

      card.querySelector('.btn-open-envelope').addEventListener('click', () => {
        if (letter.isLocked) {
          alert('This letter is sealed until its special reveal date!');
          return;
        }
        openLetterModal(letter);
      });

      card.querySelector('.btn-del-letter').addEventListener('click', async () => {
        if (confirm('Delete this letter?')) {
          await fetch(`/api/letters/${letter.id}`, { method: 'DELETE' });
          loadLetters();
        }
      });

      lettersGrid.appendChild(card);
    });
  }

  function openLetterModal(letter) {
    readLetterTitle.innerHTML = `<span>💌</span> ${letter.title}`;
    readLetterText.textContent = letter.content;
    readLetterModal.style.display = 'flex';
  }

  function closeReadLetter() {
    readLetterModal.style.display = 'none';
  }
  if (btnCloseReadLetter) btnCloseReadLetter.addEventListener('click', closeReadLetter);
  if (btnFoldLetter) btnFoldLetter.addEventListener('click', closeReadLetter);

  if (btnComposeLetter) {
    btnComposeLetter.addEventListener('click', () => {
      letterContentInput.value = '';
      letterRevealDate.value = '';
      letterModalStatus.textContent = '';
      letterModal.style.display = 'flex';
      letterContentInput.focus();
    });
  }

  function closeLetterModal() {
    letterModal.style.display = 'none';
  }
  if (btnCloseLetterModal) btnCloseLetterModal.addEventListener('click', closeLetterModal);
  if (btnCancelLetter) btnCancelLetter.addEventListener('click', closeLetterModal);

  if (btnSaveLetter) {
    btnSaveLetter.addEventListener('click', async () => {
      const templateKey = letterTemplateSelect.value;
      const title = letterTitleInput.value.trim() || 'Open When You Miss Me 💌';
      const content = letterContentInput.value.trim();
      const revealDate = letterRevealDate.value || null;

      if (!content) {
        letterModalStatus.innerHTML = '<span style="color: #c62828;">Please write your letter message.</span>';
        return;
      }

      btnSaveLetter.disabled = true;
      try {
        const res = await fetch('/api/letters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateKey, title, content, revealDate, visibility: 'shared' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          closeLetterModal();
          loadLetters();
        } else {
          letterModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to seal letter.'}</span>`;
        }
      } catch (e) {
        letterModalStatus.innerHTML = '<span style="color: #c62828;">Network error.</span>';
      } finally {
        btnSaveLetter.disabled = false;
      }
    });
  }

  // Initial loads
  loadDiaryEntries();
  loadLetters();
});
