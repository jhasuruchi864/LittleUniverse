/**
 * Our Little Universe - Couple Studio Logic
 * Handles photo uploads, style/scene configuration, AI generation, and vault integration.
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

  // --- Studio State ---
  const state = {
    photo1DataUrl: null,
    photo2DataUrl: null,
    style: 'chibi',
    scene: 'heart-universe',
    aspect: 'square',
    customPrompt: '',
    generatedImage: null,
    providerConfigured: false
  };

  // --- DOM Elements ---
  const statusStrip = document.getElementById('studio-provider-status');
  const statusDot = document.getElementById('status-dot');
  const providerStatusText = document.getElementById('provider-status-text');
  const btnToggleSetup = document.getElementById('btn-toggle-setup-help');
  const setupDrawer = document.getElementById('setup-help-drawer');

  // Photo 1
  const inputPhoto1 = document.getElementById('input-photo-1');
  const dropzone1 = document.getElementById('dropzone-photo-1');
  const idle1 = document.getElementById('dropzone-idle-1');
  const previewBox1 = document.getElementById('dropzone-preview-1');
  const previewImg1 = document.getElementById('preview-img-1');
  const btnReplace1 = document.getElementById('btn-replace-1');
  const btnRemove1 = document.getElementById('btn-remove-1');

  // Photo 2
  const inputPhoto2 = document.getElementById('input-photo-2');
  const dropzone2 = document.getElementById('dropzone-photo-2');
  const idle2 = document.getElementById('dropzone-idle-2');
  const previewBox2 = document.getElementById('dropzone-preview-2');
  const previewImg2 = document.getElementById('preview-img-2');
  const btnReplace2 = document.getElementById('btn-replace-2');
  const btnRemove2 = document.getElementById('btn-remove-2');

  // Styles & Scenes
  const styleCards = document.querySelectorAll('.style-choice-card');
  const sceneChips = document.querySelectorAll('.scene-chip-btn');
  const aspectChoices = document.querySelectorAll('.aspect-choice');
  const customPromptInput = document.getElementById('custom-prompt-input');
  const consentCheckbox = document.getElementById('check-studio-consent');
  const btnGenerate = document.getElementById('btn-generate-artwork');

  // Showcase States
  const showcaseIdle = document.getElementById('showcase-idle');
  const showcaseGenerating = document.getElementById('showcase-generating');
  const showcaseError = document.getElementById('showcase-error');
  const showcaseSuccess = document.getElementById('showcase-success');

  const showcasePreviewStyle = document.getElementById('showcase-preview-style');
  const showcasePreviewScene = document.getElementById('showcase-preview-scene');
  const generatingStatusText = document.getElementById('generating-status-text');
  const generatingProgressFill = document.getElementById('generating-progress-fill');
  const errorTitleText = document.getElementById('error-title-text');
  const errorDescText = document.getElementById('error-desc-text');
  const btnShowEnvGuide = document.getElementById('btn-show-env-guide');
  const btnRetryGeneration = document.getElementById('btn-retry-generation');
  const generatedResultImg = document.getElementById('generated-result-image');
  const resultCaptionTitle = document.getElementById('result-caption-title');
  const btnDownloadArtwork = document.getElementById('btn-download-artwork');
  const btnRegenerate = document.getElementById('btn-regenerate-artwork');
  const btnSaveToVault = document.getElementById('btn-save-to-vault');

  // Save Modal
  const saveVaultModal = document.getElementById('save-vault-modal');
  const btnCloseSaveModal = document.getElementById('btn-close-save-modal');
  const btnCancelSave = document.getElementById('btn-cancel-save');
  const btnConfirmSaveVault = document.getElementById('btn-confirm-save-vault');
  const vaultFolderSelect = document.getElementById('vault-folder-select');
  const vaultImageTitle = document.getElementById('vault-image-title');
  const vaultImageCaption = document.getElementById('vault-image-caption');
  const saveModalStatus = document.getElementById('save-modal-status');

  // --- 1. Check AI Provider Status ---
  async function checkProviderStatus() {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        state.providerConfigured = data.configured;
        if (data.configured) {
          statusDot.className = 'status-indicator-dot online';
          providerStatusText.textContent = `Connected: ${data.activeProvider || 'AI Generation Engine'}`;
        } else {
          statusDot.className = 'status-indicator-dot offline';
          providerStatusText.textContent = 'AI Provider needs setup in .env (click Setup Guide)';
        }
      }
    } catch (e) {
      statusDot.className = 'status-indicator-dot offline';
      providerStatusText.textContent = 'Server status unavailable';
    }
  }
  checkProviderStatus();

  // Setup Guide Drawer Toggle
  if (btnToggleSetup && setupDrawer) {
    btnToggleSetup.addEventListener('click', () => {
      const isVisible = setupDrawer.style.display !== 'none';
      setupDrawer.style.display = isVisible ? 'none' : 'block';
    });
  }

  if (btnShowEnvGuide && setupDrawer) {
    btnShowEnvGuide.addEventListener('click', () => {
      setupDrawer.style.display = 'block';
      setupDrawer.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- 2. Photo Upload Handling ---
  function handlePhotoUpload(file, slotNumber) {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a JPG, PNG, or WebP image file.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo is too large! Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      if (slotNumber === 1) {
        state.photo1DataUrl = dataUrl;
        previewImg1.src = dataUrl;
        idle1.style.display = 'none';
        previewBox1.style.display = 'flex';
      } else {
        state.photo2DataUrl = dataUrl;
        previewImg2.src = dataUrl;
        idle2.style.display = 'none';
        previewBox2.style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  }

  // Slot 1 Events
  if (dropzone1 && inputPhoto1) {
    dropzone1.addEventListener('click', (e) => {
      if (e.target !== btnReplace1 && e.target !== btnRemove1) {
        inputPhoto1.click();
      }
    });

    inputPhoto1.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoUpload(e.target.files[0], 1);
      }
    });

    btnReplace1.addEventListener('click', (e) => {
      e.stopPropagation();
      inputPhoto1.click();
    });

    btnRemove1.addEventListener('click', (e) => {
      e.stopPropagation();
      state.photo1DataUrl = null;
      inputPhoto1.value = '';
      previewImg1.src = '';
      previewBox1.style.display = 'none';
      idle1.style.display = 'flex';
    });
  }

  // Slot 2 Events
  if (dropzone2 && inputPhoto2) {
    dropzone2.addEventListener('click', (e) => {
      if (e.target !== btnReplace2 && e.target !== btnRemove2) {
        inputPhoto2.click();
      }
    });

    inputPhoto2.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handlePhotoUpload(e.target.files[0], 2);
      }
    });

    btnReplace2.addEventListener('click', (e) => {
      e.stopPropagation();
      inputPhoto2.click();
    });

    btnRemove2.addEventListener('click', (e) => {
      e.stopPropagation();
      state.photo2DataUrl = null;
      inputPhoto2.value = '';
      previewImg2.src = '';
      previewBox2.style.display = 'none';
      idle2.style.display = 'flex';
    });
  }

  // Drag & drop support
  [dropzone1, dropzone2].forEach((box, idx) => {
    if (!box) return;
    const slot = idx + 1;
    ['dragenter', 'dragover'].forEach(evt => {
      box.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      box.addEventListener(evt, (e) => {
        e.preventDefault();
        e.stopPropagation();
        box.classList.remove('drag-over');
      });
    });
    box.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handlePhotoUpload(e.dataTransfer.files[0], slot);
      }
    });
  });

  // --- 3. Style & Scene Selection Handlers ---
  const STYLE_NAMES = {
    'chibi': 'Cute 3D Chibi',
    'anime': 'Dreamy Anime',
    'cartoon': 'Romantic Cartoon',
    'clay': 'Cute Clay 3D',
    'fairytale': 'Pastel Fairytale',
    'cherry-blossoms': 'Cherry Blossoms',
    'rainy-day': 'Cozy Rainy-Day',
    'moonlight': 'Moonlight Date',
    'hug': 'Sweet Warm Hug',
    'hands': 'Holding Hands',
    'polaroid': 'Romantic Polaroid',
    'matching-pfp': 'Matching Avatars'
  };

  const SCENE_NAMES = {
    'heart-universe': 'Magical Heart Universe',
    'clouds': 'Pink Cloud Kingdom',
    'garden': 'Secret Flower Garden',
    'cafe': 'Cozy Romantic Café',
    'stargazing': 'Starry Night Meadow',
    'sunset': 'Pastel Beach Sunset',
    'bedroom': 'Cute Dreamy Bedroom',
    'rainy-window': 'Cozy Rainy Window'
  };

  function updateMockupLabels() {
    if (showcasePreviewStyle) showcasePreviewStyle.textContent = STYLE_NAMES[state.style] || 'Cute Couple Artwork';
    if (showcasePreviewScene) showcasePreviewScene.textContent = `in ${SCENE_NAMES[state.scene] || 'Our Universe'}`;
  }

  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      styleCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        state.style = radio.value;
        updateMockupLabels();
      }
    });
  });

  sceneChips.forEach(chip => {
    chip.addEventListener('click', () => {
      sceneChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.scene = chip.getAttribute('data-scene');
      updateMockupLabels();
    });
  });

  aspectChoices.forEach(choice => {
    choice.addEventListener('click', () => {
      aspectChoices.forEach(c => c.classList.remove('active'));
      choice.classList.add('active');
      const radio = choice.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        state.aspect = radio.value;
      }
    });
  });

  // --- 4. Generation Pipeline ---
  function showShowcaseState(stateName) {
    showcaseIdle.style.display = stateName === 'idle' ? 'flex' : 'none';
    showcaseGenerating.style.display = stateName === 'generating' ? 'flex' : 'none';
    showcaseError.style.display = stateName === 'error' ? 'flex' : 'none';
    showcaseSuccess.style.display = stateName === 'success' ? 'flex' : 'none';
  }

  const GENERATING_STEPS = [
    { pct: 15, msg: 'Reading reference facial features and expressions...' },
    { pct: 35, msg: 'Synthesizing chosen pastel aesthetic and color palette...' },
    { pct: 60, msg: 'Rendering romantic chibi couple with gentle blush cheeks...' },
    { pct: 85, msg: 'Sprinkling starlight, glowing hearts, and fairytale magic...' },
    { pct: 95, msg: 'Polishing high-resolution couple artwork...' }
  ];

  async function triggerArtworkGeneration() {
    if (!consentCheckbox.checked) {
      alert('Please check the consent confirmation box before generating couple artwork.');
      consentCheckbox.focus();
      return;
    }

    state.customPrompt = (customPromptInput.value || '').trim();

    // Switch to generating progress state
    showShowcaseState('generating');
    generatingProgressFill.style.width = '10%';
    generatingStatusText.textContent = 'Preparing romantic synthesis...';

    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < GENERATING_STEPS.length) {
        const step = GENERATING_STEPS[stepIndex];
        generatingProgressFill.style.width = `${step.pct}%`;
        generatingStatusText.textContent = step.msg;
        stepIndex++;
      }
    }, 1400);

    try {
      const response = await fetch('/api/generate-couple-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleKey: state.style,
          sceneKey: state.scene,
          aspect: state.aspect,
          customPrompt: state.customPrompt,
          person1Photo: state.photo1DataUrl,
          person2Photo: state.photo2DataUrl,
          consentGiven: true
        })
      });

      clearInterval(progressInterval);

      const result = await response.json();

      if (response.ok && result.success && result.dataUrl) {
        generatingProgressFill.style.width = '100%';
        state.generatedImage = result.dataUrl;

        setTimeout(() => {
          generatedResultImg.src = result.dataUrl;
          btnDownloadArtwork.href = result.dataUrl;
          resultCaptionTitle.textContent = `${STYLE_NAMES[state.style]} in ${SCENE_NAMES[state.scene]}`;
          showShowcaseState('success');
        }, 400);
      } else {
        // Handle error / unconfigured state
        const isNotConfigured = result.code === 'API_KEY_REQUIRED' || response.status === 422;
        errorTitleText.textContent = isNotConfigured ? 'AI Provider Needs Configuration' : 'Generation Request Failed';
        errorDescText.textContent = result.error || 'The generation server encountered an issue. Please verify your settings and retry.';
        showShowcaseState('error');
      }
    } catch (err) {
      clearInterval(progressInterval);
      errorTitleText.textContent = 'Connection Error';
      errorDescText.textContent = 'Could not reach the generation server. Please make sure the server is running.';
      showShowcaseState('error');
    }
  }

  if (btnGenerate) btnGenerate.addEventListener('click', triggerArtworkGeneration);
  if (btnRetryGeneration) btnRetryGeneration.addEventListener('click', triggerArtworkGeneration);
  if (btnRegenerate) btnRegenerate.addEventListener('click', triggerArtworkGeneration);

  // --- 5. Save to Love Vault Modal Logic ---
  async function loadVaultFoldersIntoDropdown() {
    try {
      const res = await fetch('/api/vault/folders');
      if (res.ok) {
        const data = await res.json();
        vaultFolderSelect.innerHTML = '';
        if (data.folders && data.folders.length > 0) {
          data.folders.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f.id;
            opt.textContent = `${f.icon} ${f.name} (${f.imageCount} saved)`;
            vaultFolderSelect.appendChild(opt);
          });
        }
      }
    } catch (e) {
      console.error('Failed to load folders:', e);
    }
  }

  if (btnSaveToVault) {
    btnSaveToVault.addEventListener('click', async () => {
      if (!state.generatedImage) return;
      saveModalStatus.textContent = '';
      vaultImageTitle.value = `${STYLE_NAMES[state.style]} Moment 💕`;
      vaultImageCaption.value = `Created with love in Our Couple Studio, set in ${SCENE_NAMES[state.scene]}.`;
      await loadVaultFoldersIntoDropdown();
      saveVaultModal.style.display = 'flex';
    });
  }

  function closeSaveModal() {
    saveVaultModal.style.display = 'none';
  }

  if (btnCloseSaveModal) btnCloseSaveModal.addEventListener('click', closeSaveModal);
  if (btnCancelSave) btnCancelSave.addEventListener('click', closeSaveModal);

  if (btnConfirmSaveVault) {
    btnConfirmSaveVault.addEventListener('click', async () => {
      const folderId = vaultFolderSelect.value;
      const title = vaultImageTitle.value.trim() || 'Romantic Artwork';
      const caption = vaultImageCaption.value.trim();

      saveModalStatus.innerHTML = '<span style="color: var(--color-plum);">Saving to your private vault...</span>';
      btnConfirmSaveVault.disabled = true;

      try {
        const res = await fetch('/api/vault/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderId,
            title,
            caption,
            style: STYLE_NAMES[state.style],
            scene: SCENE_NAMES[state.scene],
            dataUrl: state.generatedImage
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          saveModalStatus.innerHTML = '<span style="color: #2e7d32; font-weight: bold;">Saved safely in your Love Vault! 💖 <a href="vault.html" style="text-decoration: underline; color: var(--color-plum);">View in Vault &rarr;</a></span>';
          setTimeout(() => {
            closeSaveModal();
            btnConfirmSaveVault.disabled = false;
          }, 1800);
        } else {
          saveModalStatus.innerHTML = `<span style="color: #c62828;">${data.error || 'Failed to save image.'}</span>`;
          btnConfirmSaveVault.disabled = false;
        }
      } catch (err) {
        saveModalStatus.innerHTML = '<span style="color: #c62828;">Network error while saving.</span>';
        btnConfirmSaveVault.disabled = false;
      }
    });
  }

});
