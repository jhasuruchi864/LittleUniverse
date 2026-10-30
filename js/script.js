/**
 * OUR LITTLE UNIVERSE 💗 - MAIN SCRIPT
 * Vanilla JavaScript for all interactions, animations, and sound
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. GLOBAL STATE & HELPERS
  // ==========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // Helper for safe DOM selection
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  // Dynamic Year in Footer
  const footerYear = $('#footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  // Toast Notification System
  const toastMsg = $('#toast-msg');
  const toastText = $('#toast-text');
  let toastTimer = null;

  function showToast(text, duration = 3000) {
    if (!toastMsg || !toastText) return;
    toastText.textContent = text;
    toastMsg.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, duration);
  }

  // ==========================================================================
  // 2. UNIVERSE BACKGROUND CANVAS (Floating Hearts, Stars, Pastel Clouds)
  // ==========================================================================
  const canvas = $('#universe-bg-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;

    const PARTICLE_COUNT = window.innerWidth < 768 ? 25 : 45;
    const COLORS = ['#FFD6E7', '#FFB6D5', '#DCD6FF', '#FFF8F2', '#FFE29A', '#FF5C8A'];

    function resizeCanvas() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }

    class UniverseParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 30;
        this.size = Math.random() * 14 + 8;
        this.speedY = -(Math.random() * 0.7 + 0.3);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.45 + 0.2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.type = Math.random() > 0.45 ? 'heart' : (Math.random() > 0.5 ? 'star' : 'sparkle');
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
        this.sway = Math.random() * 0.02;
        this.swayAngle = Math.random() * Math.PI * 2;
      }

      update() {
        this.y += this.speedY;
        this.swayAngle += this.sway;
        this.x += this.speedX + Math.sin(this.swayAngle) * 0.4;
        this.rotation += this.rotSpeed;

        if (this.y < -40 || this.x < -40 || this.x > width + 40) {
          this.reset(false);
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.type === 'heart') {
          // Draw cute vector heart
          const s = this.size * 0.55;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.3, s * 0.4, 0, s * 1.3);
          ctx.bezierCurveTo(s * 1.3, s * 0.4, s, -s * 0.5, 0, s * 0.3);
          ctx.fill();
        } else if (this.type === 'star') {
          // Draw 4-point glowing star
          const s = this.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Sparkle dot
          ctx.beginPath();
          ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    function initCanvas() {
      resizeCanvas();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new UniverseParticle());
      }
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animateCanvas);
    }

    initCanvas();
    animateCanvas();

    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Performance: Pause canvas when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animateCanvas();
      }
    });
  }

  // ==========================================================================
  // 3. MOUSE SPARKLE TRAIL (Desktop Only)
  // ==========================================================================
  if (!isTouchDevice && !prefersReducedMotion) {
    let lastSparkleTime = 0;
    const SPARKLE_CHARS = ['✨', '💖', '⭐', '🌸', '💕'];

    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSparkleTime < 55) return; // limit frequency to protect 60fps
      lastSparkleTime = now;

      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-particle';
      sparkle.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
      sparkle.style.left = `${e.clientX}px`;
      sparkle.style.top = `${e.clientY}px`;
      sparkle.style.fontSize = `${Math.random() * 12 + 12}px`;
      document.body.appendChild(sparkle);

      setTimeout(() => {
        sparkle.remove();
      }, 750);
    }, { passive: true });
  }

  // Heart Burst Utility Function
  function triggerHeartBurst(originX, originY, count = 18) {
    if (prefersReducedMotion) return;
    const symbols = ['💗', '💖', '✨', '💕', '🌸', '⭐'];

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'sparkle-particle';
      p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;
      p.style.fontSize = `${Math.random() * 16 + 18}px`;
      p.style.zIndex = '9999';

      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const distance = Math.random() * 90 + 50;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      p.animate([
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1.3) rotate(${Math.random() * 360}deg)`, opacity: 0.9, offset: 0.6 },
        { transform: `translate(calc(-50% + ${targetX * 1.2}px), calc(-50% + ${targetY * 1.2 + 25}px)) scale(0.2)`, opacity: 0 }
      ], {
        duration: 900 + Math.random() * 300,
        easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
      }).onfinish = () => p.remove();

      document.body.appendChild(p);
    }
  }

  // ==========================================================================
  // 4. NAVIGATION, SCROLLSPY & MOBILE MENU
  // ==========================================================================
  const siteHeader = $('#site-header');
  const navToggleBtn = $('#nav-toggle-btn');
  const navLinksMenu = $('#nav-links-menu');
  const navLinks = $$('.nav-link');

  // Header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader?.classList.add('scrolled');
    } else {
      siteHeader?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Toggle mobile menu
  if (navToggleBtn && navLinksMenu) {
    navToggleBtn.addEventListener('click', () => {
      const isExpanded = navToggleBtn.getAttribute('aria-expanded') === 'true';
      navToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      navToggleBtn.classList.toggle('open');
      navLinksMenu.classList.toggle('open');
    });

    // Close on click link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggleBtn.setAttribute('aria-expanded', 'false');
        navToggleBtn.classList.remove('open');
        navLinksMenu.classList.remove('open');
      });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!siteHeader.contains(e.target)) {
        navToggleBtn.setAttribute('aria-expanded', 'false');
        navToggleBtn.classList.remove('open');
        navLinksMenu.classList.remove('open');
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinksMenu.classList.contains('open')) {
        navToggleBtn.setAttribute('aria-expanded', 'false');
        navToggleBtn.classList.remove('open');
        navLinksMenu.classList.remove('open');
        navToggleBtn.focus();
      }
    });
  }

  // Scrollspy via IntersectionObserver
  const sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    };

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const rawHref = link.getAttribute('href') || '';
            if (rawHref.startsWith('#')) {
              const href = rawHref.replace('#', '');
              if (href === currentId) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => navObserver.observe(sec));
  }

  // Scroll Reveal Animations
  const revealElements = $$('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Back To Top Button
  const btnBackToTop = $('#btn-back-to-top');
  if (btnBackToTop) {
    btnBackToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // 5. HERO SECTION INTERACTIONS
  // ==========================================================================
  const heroHeartTrigger = $('#hero-heart-trigger');
  if (heroHeartTrigger) {
    const handleHeartClick = (e) => {
      const rect = heroHeartTrigger.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      triggerHeartBurst(centerX, centerY, 22);
      playHeartSound();
    };

    heroHeartTrigger.addEventListener('click', handleHeartClick);
    heroHeartTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleHeartClick(e);
      }
    });
  }

  // "Enter Our Universe" Smooth Scroll
  const btnEnterUniverse = $('#btn-enter-universe');
  if (btnEnterUniverse) {
    btnEnterUniverse.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#memories');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // "I Have a Surprise" button in Hero
  const btnHeroSurprise = $('#btn-hero-surprise');
  if (btnHeroSurprise) {
    btnHeroSurprise.addEventListener('click', () => {
      openSurpriseModal();
    });
  }

  // ==========================================================================
  // 6. PHOTOS & MEMORIES GALLERY (SCRAPBOOK & LIGHTBOX)
  // ==========================================================================
  const memoryItems = [
    {
      img: 'assets/images/memory-1.svg',
      title: 'A day to remember',
      desc: 'Warm cocoa, cozy whispers and the gentle glow of fairy lights under the starlit sky ☕'
    },
    {
      img: 'assets/images/memory-2.svg',
      title: 'Little moments, big feelings',
      desc: 'Walking hand in hand where the pastel waves kiss the shore at sunset 🌊'
    },
    {
      img: 'assets/images/memory-3.svg',
      title: 'My favorite kind of chaos',
      desc: 'Sweet macaroons, silly snapshots, and beautiful laughter that never ends 📸'
    },
    {
      img: 'assets/images/memory-4.svg',
      title: 'Smiles that never get old',
      desc: 'Pedaling through cherry blossoms with heart-shaped balloons dancing in the breeze 🌸'
    },
    {
      img: 'assets/images/memory-5.svg',
      title: 'A memory worth keeping',
      desc: 'Under the cosmic nebula, every star whispers our favorite wishes ✨'
    },
    {
      img: 'assets/images/memory-6.svg',
      title: 'Our tiny happy place',
      desc: 'A cozy blanket fort, soft cuddly bears, and quiet moments filled with warmth 🧸'
    }
  ];

  const polaroidCards = $$('.polaroid-card');
  const lightboxModal = $('#lightbox-modal');
  const lightboxImg = $('#lightbox-img');
  const lightboxCaption = $('#lightbox-caption');
  const lightboxDesc = $('#lightbox-desc');
  const lightboxCloseBtn = $('#lightbox-close-btn');

  function openLightbox(index) {
    const item = memoryItems[index];
    if (!item || !lightboxModal || !lightboxImg) return;

    lightboxImg.src = item.img;
    lightboxImg.alt = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = item.desc;

    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lightboxCloseBtn?.focus();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  polaroidCards.forEach(card => {
    const idx = parseInt(card.getAttribute('data-index') || '0', 10);
    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal?.classList.contains('active')) {
      closeLightbox();
    }
  });

  // ==========================================================================
  // 7. SECRET LOVE LETTER (Typewriter, Custom Edit, Send Hearts, Copy)
  // ==========================================================================
  const envelopeWrapper = $('#envelope-wrapper');
  const revealedLetterCard = $('#revealed-letter-card');
  const letterTypewriterText = $('#letter-typewriter-text');
  const letterCustomBadge = $('#letter-custom-badge');
  const letterEditBox = $('#letter-edit-box');
  const letterEditTextarea = $('#letter-edit-textarea');
  const letterCharCount = $('#letter-char-count');
  const letterViewControls = $('#letter-view-controls');
  const letterEditControls = $('#letter-edit-controls');
  const btnEditLetter = $('#btn-edit-letter');
  const btnReadAgain = $('#btn-read-again');
  const btnSendHeart = $('#btn-send-heart');
  const btnCopyLetter = $('#btn-copy-letter');
  const btnResetLetter = $('#btn-reset-letter');
  const btnSaveLetter = $('#btn-save-letter');
  const btnCancelEditLetter = $('#btn-cancel-edit-letter');
  const btnResetEditLetter = $('#btn-reset-edit-letter');

  const LOVE_LETTER_CONTENT = 
`Hey, you! 💗

Welcome to this tiny little universe.
There are stars in the sky, flowers in the garden, and a million little things that make this world beautiful.

And then there is the simple joy of making someone smile.

May your days be full of laughter, your heart be full of happiness, and your life be full of beautiful little surprises.

Keep smiling, keep dreaming, and never forget how special you are. ✨

Sending you a pocketful of hugs and a universe full of hearts! 💕`;

  const STORAGE_KEY_CUSTOM_LETTER = 'universe_custom_love_letter';
  let activeLetterText = localStorage.getItem(STORAGE_KEY_CUSTOM_LETTER) || LOVE_LETTER_CONTENT;

  let typewriterTimer = null;
  let isLetterOpened = false;

  function updateLetterBadge() {
    const isCustom = Boolean(localStorage.getItem(STORAGE_KEY_CUSTOM_LETTER));
    if (letterCustomBadge) {
      letterCustomBadge.style.display = isCustom ? 'inline-flex' : 'none';
    }
    if (btnResetLetter) {
      btnResetLetter.style.display = isCustom ? 'inline-flex' : 'none';
    }
  }

  function runTypewriter(text, targetEl, speed = 24) {
    if (!targetEl) return;
    clearTimeout(typewriterTimer);
    targetEl.innerHTML = '<span class="typewriter-cursor"></span>';
    let charIndex = 0;

    function step() {
      if (charIndex < text.length) {
        const currentSlice = text.slice(0, charIndex + 1);
        targetEl.innerHTML = escapeHtml(currentSlice) + '<span class="typewriter-cursor"></span>';
        charIndex++;
        typewriterTimer = setTimeout(step, speed);
      } else {
        targetEl.innerHTML = escapeHtml(text);
      }
    }

    step();
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function openLetterEnvelope() {
    if (isLetterOpened) return;
    isLetterOpened = true;

    envelopeWrapper?.classList.add('opened');
    triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);

    setTimeout(() => {
      if (revealedLetterCard) {
        revealedLetterCard.classList.add('active');
        revealedLetterCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      updateLetterBadge();
      runTypewriter(activeLetterText, letterTypewriterText);
    }, 700);
  }

  if (envelopeWrapper) {
    envelopeWrapper.addEventListener('click', openLetterEnvelope);
    envelopeWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLetterEnvelope();
      }
    });
  }

  // --- Read Again Action ---
  if (btnReadAgain) {
    btnReadAgain.addEventListener('click', () => {
      if (letterTypewriterText) {
        runTypewriter(activeLetterText, letterTypewriterText);
        showToast('Reading again with warm smiles... 💌');
      }
    });
  }

  // --- Send a Heart Action ---
  if (btnSendHeart) {
    btnSendHeart.addEventListener('click', () => {
      const rect = btnSendHeart.getBoundingClientRect();
      triggerHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 28);
      showToast('A bouquet of hearts sent to you! 💖');
      playHeartSound();
    });
  }

  // --- Copy Letter Action ---
  if (btnCopyLetter) {
    btnCopyLetter.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(activeLetterText);
        } else {
          const ta = document.createElement('textarea');
          ta.value = activeLetterText;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        showToast('Love letter copied to clipboard! 💌');
      } catch (err) {
        showToast('Letter selected! Feel free to copy. 💗');
      }
    });
  }

  // --- Edit Mode Transitions ---
  function enterEditMode() {
    clearTimeout(typewriterTimer);
    if (letterEditTextarea) {
      letterEditTextarea.value = activeLetterText;
      if (letterCharCount) {
        letterCharCount.textContent = activeLetterText.length;
      }
    }
    if (letterTypewriterText) letterTypewriterText.style.display = 'none';
    if (letterViewControls) letterViewControls.style.display = 'none';
    if (letterEditBox) letterEditBox.style.display = 'block';
    if (letterEditControls) letterEditControls.style.display = 'flex';
    letterEditTextarea?.focus();
  }

  function exitEditMode() {
    if (letterEditBox) letterEditBox.style.display = 'none';
    if (letterEditControls) letterEditControls.style.display = 'none';
    if (letterTypewriterText) letterTypewriterText.style.display = 'block';
    if (letterViewControls) letterViewControls.style.display = 'flex';
  }

  if (btnEditLetter) {
    btnEditLetter.addEventListener('click', enterEditMode);
  }

  if (btnCancelEditLetter) {
    btnCancelEditLetter.addEventListener('click', () => {
      exitEditMode();
      if (letterTypewriterText) {
        letterTypewriterText.innerHTML = escapeHtml(activeLetterText);
      }
      showToast('Editing cancelled 🌸');
    });
  }

  if (letterEditTextarea && letterCharCount) {
    letterEditTextarea.addEventListener('input', () => {
      letterCharCount.textContent = letterEditTextarea.value.length;
    });
  }

  // Quick Emoji Stickers in Editor
  $$('.btn-emoji-sticker').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji');
      if (!emoji || !letterEditTextarea) return;

      const start = letterEditTextarea.selectionStart || letterEditTextarea.value.length;
      const end = letterEditTextarea.selectionEnd || letterEditTextarea.value.length;
      const val = letterEditTextarea.value;
      letterEditTextarea.value = val.slice(0, start) + emoji + val.slice(end);
      letterEditTextarea.selectionStart = letterEditTextarea.selectionEnd = start + emoji.length;
      letterEditTextarea.focus();

      if (letterCharCount) {
        letterCharCount.textContent = letterEditTextarea.value.length;
      }
    });
  });

  // --- Save Custom Letter ---
  if (btnSaveLetter) {
    btnSaveLetter.addEventListener('click', () => {
      if (!letterEditTextarea) return;
      const newText = letterEditTextarea.value.trim();
      if (!newText) {
        showToast('Please write at least a few sweet words! 💗');
        letterEditTextarea.focus();
        return;
      }

      activeLetterText = newText;
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_LETTER, newText);
      } catch (e) {}

      updateLetterBadge();
      exitEditMode();

      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 22);
      showToast('Your sweet letter was saved! 💾💖');
      playHeartSound();

      runTypewriter(activeLetterText, letterTypewriterText, 22);
    });
  }

  // --- Reset to Original Letter ---
  function resetLetterToOriginal() {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_LETTER);
    } catch (e) {}
    activeLetterText = LOVE_LETTER_CONTENT;
    updateLetterBadge();

    if (letterEditTextarea) {
      letterEditTextarea.value = LOVE_LETTER_CONTENT;
      if (letterCharCount) letterCharCount.textContent = LOVE_LETTER_CONTENT.length;
    }

    showToast('Restored the original sweet letter! 🌸');
    triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 15);

    if (letterEditBox && letterEditBox.style.display !== 'none') {
      // In edit mode: keep editor open with reset content
    } else {
      // In view mode: re-type default letter
      runTypewriter(LOVE_LETTER_CONTENT, letterTypewriterText, 22);
    }
  }

  if (btnResetLetter) {
    btnResetLetter.addEventListener('click', () => {
      if (confirm('Restore the original sweet poem letter?')) {
        resetLetterToOriginal();
      }
    });
  }

  if (btnResetEditLetter) {
    btnResetEditLetter.addEventListener('click', () => {
      if (confirm('Reset your draft back to the original letter?')) {
        resetLetterToOriginal();
      }
    });
  }

  // ==========================================================================
  // 8. FUN LOVE CALCULATOR (Deterministic Magic Match)
  // ==========================================================================
  const calcForm = $('#calc-form');
  const calcName1 = $('#calc-name1');
  const calcName2 = $('#calc-name2');
  const calcLoadingBox = $('#calc-loading-box');
  const calcResultBox = $('#calc-result-box');
  const calcScoreNumber = $('#calc-score-number');
  const calcCoupleNames = $('#calc-couple-names');
  const calcScoreMessage = $('#calc-score-message');
  const btnCalcReset = $('#btn-calc-reset');

  // Deterministic Hash Function based on two names (order-independent & case-insensitive)
  function calculateLoveScore(nameA, nameB) {
    const cleanA = nameA.trim().toLowerCase();
    const cleanB = nameB.trim().toLowerCase();

    // Sort alphabetically so order doesn't change score
    const pair = [cleanA, cleanB].sort().join('&');

    let hash = 0;
    for (let i = 0; i < pair.length; i++) {
      const char = pair.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }

    // Map to 70 - 100 with occasional full range for maximum cuteness
    const rawVal = Math.abs(hash) % 100;
    
    // Scale slightly higher so results are sweet and encouraging (between 45% and 100%)
    let score = Math.floor(45 + (rawVal * 0.55));
    if (score > 100) score = 100;

    // Special match for identical or legendary pairs
    if (rawVal === 0 || rawVal === 77) score = 100;

    return score;
  }

  function getScoreMessage(score) {
    if (score <= 20) return "A little mystery makes life interesting! 🌷";
    if (score <= 40) return "A cute beginning to a fun story! 💕";
    if (score <= 60) return "The universe is feeling playful today! ✨";
    if (score <= 80) return "That's a whole lot of lovely energy! 💗";
    if (score <= 99) return "Someone brought extra sparkle into this universe! 🌟";
    return "Maximum cuteness unlocked! 💖";
  }

  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const n1 = calcName1?.value.trim() || '';
      const n2 = calcName2?.value.trim() || '';

      if (!n1 || !n2) {
        showToast('Please whisper both names first! 🌸');
        if (!n1) calcName1?.focus();
        else calcName2?.focus();
        return;
      }

      calcForm.style.display = 'none';
      calcResultBox?.classList.remove('active');
      calcLoadingBox?.classList.add('active');

      setTimeout(() => {
        const score = calculateLoveScore(n1, n2);
        calcLoadingBox?.classList.remove('active');

        if (calcScoreNumber) calcScoreNumber.textContent = `${score}%`;
        if (calcCoupleNames) calcCoupleNames.textContent = `${n1} & ${n2}`;
        if (calcScoreMessage) calcScoreMessage.textContent = getScoreMessage(score);

        calcResultBox?.classList.add('active');
        
        // Burst celebration
        const rect = calcResultBox?.getBoundingClientRect();
        if (rect) {
          triggerHeartBurst(rect.left + rect.width / 2, rect.top + 80, 26);
        }
      }, 1100);
    });
  }

  if (btnCalcReset) {
    btnCalcReset.addEventListener('click', () => {
      calcResultBox?.classList.remove('active');
      calcForm.style.display = 'block';
      if (calcName1) calcName1.value = '';
      if (calcName2) calcName2.value = '';
      calcName1?.focus();
    });
  }

  // ==========================================================================
  // 9. CUTE INTERACTIVE QUESTIONS (QUIZ)
  // ==========================================================================
  const quizData = [
    {
      question: "Pick your perfect happy place!",
      options: [
        { text: "A cozy café ☕", vibe: "cozy" },
        { text: "A dreamy beach 🌊", vibe: "dreamy" },
        { text: "A magical garden 🌷", vibe: "blooming" },
        { text: "A blanket fort at home 🧸", vibe: "cuddle" }
      ]
    },
    {
      question: "Choose a little love-language vibe!",
      options: [
        { text: "Sweet words 💌", vibe: "dreamy" },
        { text: "Thoughtful surprises 🎁", vibe: "blooming" },
        { text: "Quality time 🌙", vibe: "cozy" },
        { text: "Cute little gestures 💗", vibe: "cuddle" }
      ]
    },
    {
      question: "What would make a perfect day?",
      options: [
        { text: "Watching the stars ✨", vibe: "dreamy" },
        { text: "Eating yummy food 🍓", vibe: "cozy" },
        { text: "Going on a tiny adventure 🎡", vibe: "blooming" },
        { text: "Laughing at silly jokes 😂", vibe: "cuddle" }
      ]
    },
    {
      question: "Pick a magical power!",
      options: [
        { text: "Make flowers bloom 🌸", vibe: "blooming" },
        { text: "Freeze a happy moment ⏳", vibe: "cozy" },
        { text: "Spread happiness everywhere 🌈", vibe: "cuddle" },
        { text: "Travel through the stars 🚀", vibe: "dreamy" }
      ]
    }
  ];

  const quizResultProfiles = {
    cozy: {
      badge: "☕",
      title: "Cozy Soulmates",
      desc: "Warm blankets, late-night tea talks, and peaceful silence together make your universe feel like home. You find joy in gentle everyday comforts."
    },
    dreamy: {
      badge: "🌙",
      title: "Cosmic Dreamers",
      desc: "Your love is woven with shooting stars, midnight poetry, and endless curiosity. You make each other believe that miracles happen every day."
    },
    blooming: {
      badge: "🌸",
      title: "Sunny Adventurers",
      desc: "Spontaneous road trips, blooming gardens, and thoughtful little surprises keep your connection vibrant and eternally youthful."
    },
    cuddle: {
      badge: "🧸",
      title: "Playful Sweethearts",
      desc: "Silly inside jokes, giggles until your cheeks hurt, and warm bear hugs are your superpowers. You bring sunshine everywhere you go."
    }
  };

  let currentQuestionIdx = 0;
  const userAnswers = [];

  const quizQuestionView = $('#quiz-question-view');
  const quizResultView = $('#quiz-result-view');
  const quizProgressLabel = $('#quiz-progress-label');
  const quizProgressFill = $('#quiz-progress-fill');
  const quizQuestionText = $('#quiz-question-text');
  const quizOptionsGrid = $('#quiz-options-grid');
  const btnQuizBack = $('#btn-quiz-back');
  const btnQuizNext = $('#btn-quiz-next');
  const btnQuizRestart = $('#btn-quiz-restart');
  const btnQuizPlayAgain = $('#btn-quiz-play-again');

  function renderQuizQuestion() {
    const q = quizData[currentQuestionIdx];
    if (!q) return;

    if (quizProgressLabel) quizProgressLabel.textContent = `Question ${currentQuestionIdx + 1} of ${quizData.length}`;
    if (quizProgressFill) {
      const pct = ((currentQuestionIdx + 1) / quizData.length) * 100;
      quizProgressFill.style.width = `${pct}%`;
    }

    if (quizQuestionText) quizQuestionText.textContent = q.question;

    if (quizOptionsGrid) {
      quizOptionsGrid.innerHTML = '';
      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', userAnswers[currentQuestionIdx] === idx ? 'true' : 'false');
        btn.textContent = opt.text;

        if (userAnswers[currentQuestionIdx] === idx) {
          btn.classList.add('selected');
        }

        btn.addEventListener('click', () => {
          userAnswers[currentQuestionIdx] = idx;
          $$('.quiz-option-btn', quizOptionsGrid).forEach(b => {
            b.classList.remove('selected');
            b.setAttribute('aria-checked', 'false');
          });
          btn.classList.add('selected');
          btn.setAttribute('aria-checked', 'true');
          if (btnQuizNext) {
            btnQuizNext.disabled = false;
            setTimeout(() => {
              if (btnQuizNext && !btnQuizNext.disabled) {
                btnQuizNext.click();
              }
            }, 360);
          }
        });

        quizOptionsGrid.appendChild(btn);
      });
    }

    if (btnQuizBack) btnQuizBack.disabled = currentQuestionIdx === 0;
    if (btnQuizNext) {
      btnQuizNext.disabled = userAnswers[currentQuestionIdx] === undefined;
      btnQuizNext.textContent = currentQuestionIdx === quizData.length - 1 ? 'Reveal Our Vibe ✨' : 'Next →';
    }
  }

  function renderQuizResult() {
    quizQuestionView.style.display = 'none';
    quizResultView.classList.add('active');

    // Tally vibes
    const tally = { cozy: 0, dreamy: 0, blooming: 0, cuddle: 0 };
    userAnswers.forEach((ansIdx, qIdx) => {
      const vibe = quizData[qIdx].options[ansIdx]?.vibe || 'dreamy';
      tally[vibe] = (tally[vibe] || 0) + 1;
    });

    let topVibe = 'dreamy';
    let maxCount = -1;
    Object.keys(tally).forEach(k => {
      if (tally[k] > maxCount) {
        maxCount = tally[k];
        topVibe = k;
      }
    });

    const result = quizResultProfiles[topVibe] || quizResultProfiles.dreamy;
    const badgeEl = $('#quiz-result-badge');
    const titleEl = $('#quiz-result-title');
    const descEl = $('#quiz-result-desc');

    if (badgeEl) badgeEl.textContent = result.badge;
    if (titleEl) titleEl.textContent = result.title;
    if (descEl) descEl.textContent = result.desc;

    const rect = quizResultView.getBoundingClientRect();
    triggerHeartBurst(rect.left + rect.width / 2, rect.top + 80, 24);
  }

  if (btnQuizNext) {
    btnQuizNext.addEventListener('click', () => {
      if (userAnswers[currentQuestionIdx] === undefined) {
        showToast('Please pick an answer that speaks to your heart! 💗');
        return;
      }
      if (currentQuestionIdx < quizData.length - 1) {
        currentQuestionIdx++;
        renderQuizQuestion();
      } else {
        renderQuizResult();
      }
    });
  }

  if (btnQuizBack) {
    btnQuizBack.addEventListener('click', () => {
      if (currentQuestionIdx > 0) {
        currentQuestionIdx--;
        renderQuizQuestion();
      }
    });
  }

  function restartQuiz() {
    currentQuestionIdx = 0;
    userAnswers.length = 0;
    quizResultView.classList.remove('active');
    quizQuestionView.style.display = 'block';
    renderQuizQuestion();
  }

  if (btnQuizRestart) btnQuizRestart.addEventListener('click', restartQuiz);
  if (btnQuizPlayAgain) btnQuizPlayAgain.addEventListener('click', restartQuiz);

  // Initialize Quiz
  renderQuizQuestion();

  // ==========================================================================
  // 10. LIVE RELATIONSHIP COUNTDOWN
  // ==========================================================================
  const datetimeInput = $('#countdown-datetime-input');
  const btnStartTimer = $('#btn-start-timer');
  const btnCountdownReset = $('#btn-countdown-reset');
  const countdownStatusBadge = $('#countdown-status-badge');
  const countdownCelebration = $('#countdown-celebration');
  const elDays = $('#counter-days');
  const elHours = $('#counter-hours');
  const elMinutes = $('#counter-minutes');
  const elSeconds = $('#counter-seconds');

  let countdownInterval = null;
  let targetDate = null;

  // Format date helper for input (YYYY-MM-DDTHH:mm)
  function formatDateForInput(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  // Set default datetime: exactly 100 days ago so visitor sees immediate rich elapsed time!
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 100);
  defaultDate.setHours(12, 0, 0, 0);

  // Load stored date or default
  const storedDateStr = localStorage.getItem('universe_countdown_date');
  if (storedDateStr && !isNaN(new Date(storedDateStr).getTime())) {
    targetDate = new Date(storedDateStr);
  } else {
    targetDate = defaultDate;
  }

  if (datetimeInput) {
    datetimeInput.value = formatDateForInput(targetDate);
  }

  function updateLiveCounter() {
    if (!targetDate) return;
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const diffMs = target - now;

    const isFuture = diffMs > 0;
    const absDiff = Math.abs(diffMs);

    // If within 1 second of arrival (for future timers)
    if (isFuture && absDiff < 1000) {
      if (countdownCelebration) countdownCelebration.classList.add('active');
    } else {
      if (countdownCelebration) countdownCelebration.classList.remove('active');
    }

    // Status message
    if (countdownStatusBadge) {
      if (isFuture) {
        countdownStatusBadge.textContent = '✨ Counting down to our special upcoming moment! ✨';
      } else {
        countdownStatusBadge.textContent = '💗 Cherishing every sweet second shared together 💗';
      }
    }

    const totalSeconds = Math.floor(absDiff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');

    if (elDays) elDays.textContent = pad(days);
    if (elHours) elHours.textContent = pad(hours);
    if (elMinutes) elMinutes.textContent = pad(minutes);
    if (elSeconds) elSeconds.textContent = pad(seconds);
  }

  function startCountdownTimer(date) {
    targetDate = date;
    localStorage.setItem('universe_countdown_date', date.toISOString());
    clearInterval(countdownInterval);
    updateLiveCounter();
    countdownInterval = setInterval(updateLiveCounter, 1000);
  }

  if (btnStartTimer && datetimeInput) {
    btnStartTimer.addEventListener('click', () => {
      const val = datetimeInput.value;
      if (!val) {
        showToast('Please select a meaningful date & time first! ⏳');
        datetimeInput.focus();
        return;
      }
      const selected = new Date(val);
      if (isNaN(selected.getTime())) {
        showToast('Invalid date format. Please pick a valid moment. 🌸');
        return;
      }
      startCountdownTimer(selected);
      showToast('Timer started! Every second is special. 💗');
    });
  }

  if (btnCountdownReset && datetimeInput) {
    btnCountdownReset.addEventListener('click', () => {
      datetimeInput.value = '';
      datetimeInput.focus();
      showToast('Pick any past or future moment! ⏳');
    });
  }

  // Start timer initially if countdown elements exist on this page
  if (elDays && elHours) {
    startCountdownTimer(targetDate);
  }

  // Pause counter when tab is hidden to save power
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(countdownInterval);
    } else if (elDays && elHours && targetDate) {
      updateLiveCounter();
      countdownInterval = setInterval(updateLiveCounter, 1000);
    }
  });

  // ==========================================================================
  // 11. MAGICAL SURPRISE SECTION (Cute Gift Box Unboxing Engine)
  // ==========================================================================
  const surpriseModal = $('#surprise-modal');
  const btnOpenGiftBox = $('#btn-open-gift-box');
  const btnOpenSurpriseModal = $('#btn-open-surprise-modal');
  const btnCloseSurprise = $('#btn-close-surprise');
  const btnDismissSurprise = $('#btn-dismiss-surprise');
  const btnReplaySurprise = $('#btn-replay-surprise');
  const btnNextSurprise = $('#btn-next-surprise');
  const giftBoxLid = $('#gift-box-lid');
  const giftBoxPopItem = $('#gift-box-pop-item');
  const surpriseBadgeTitle = $('#surprise-badge-title');
  const surpriseCounterBadge = $('#surprise-counter-badge');
  const surpriseCenterIcon = $('#surprise-center-icon');
  const surpriseRevealedText = $('#surprise-revealed-text');

  // Adorable collection of rotating cute surprises
  const CUTE_SURPRISES = [
    {
      icon: '🧸',
      title: 'Fluffy Cuddle Bear Unboxed! 🧸',
      message: 'A soft and cuddly plushie bear to hold tight whenever you miss each other. Infinite warm hugs enclosed! 💗'
    },
    {
      icon: '🧁',
      title: 'Sweet Strawberry Cupcake! 🧁',
      message: 'Freshly baked with love, rainbow sprinkles, and extra frosting because you make everyday life so sweet! 🍓✨'
    },
    {
      icon: '🌸',
      title: 'Everlasting Blossoms! 🌸',
      message: 'A fragrant bundle of spring cherry blossoms and pink roses that will never ever fade! 💐💖'
    },
    {
      icon: '🍫',
      title: 'Box of Heart Truffles! 🍫',
      message: 'Melt-in-your-mouth hazelnut and cocoa chocolates, handpicked to bring an instant smile to your face! 💝'
    },
    {
      icon: '💍',
      title: 'Starlight Promise Ring! 💍',
      message: 'A glowing ring woven from pure starlight and promises of sweet, tender tomorrows together. ✨💍'
    },
    {
      icon: '☕',
      title: 'Warm Strawberry Latte! ☕',
      message: 'Steaming cozy latte with a little foam heart floating right on top to warm your soul and heart. ☕💕'
    },
    {
      icon: '🎈',
      title: 'Floating Wish Balloon! 🎈',
      message: 'A rosy heart balloon carrying all your sweetest dreams high into the starry pink clouds. Float happily! 🎈✨'
    },
    {
      icon: '🌙',
      title: 'Jar of Wishing Stars! 🌙',
      message: 'A glowing glass jar filled with night moonlight so you are never in the dark. Sweet dreams! 🌟'
    },
    {
      icon: '💌',
      title: 'Secret Tiny Love Scroll! 💌',
      message: 'You make ordinary little moments feel magical. Keep being wonderfully you. 💗'
    },
    {
      icon: '🐱',
      title: 'Gentle Little Kitty! 🐱',
      message: 'A tiny marshmallow kitten doing gentle nose boops and giving you soft, cozy purrs of comfort! 🐾🌸'
    },
    {
      icon: '🥞',
      title: 'Golden Heart Pancakes! 🥞',
      message: 'Fluffy buttermilk pancakes dripping with warm honey, fresh strawberries, and morning love! 🍯🍓'
    },
    {
      icon: '🎧',
      title: 'Sweet Romance Mixtape! 🎧',
      message: 'Side A & Side B filled with all the gentle acoustic songs that play whenever I think of you! 🎶💖'
    },
    {
      icon: '👑',
      title: 'Little Universe Tiara! 👑',
      message: 'A sparkling golden tiara because you truly rule every star and corner of this little universe! 👑✨'
    },
    {
      icon: '📸',
      title: 'Fairy-Tale Polaroid! 📸',
      message: 'A candid golden-hour snapshot that captures your brightest, sweetest smile forever in time! 🖼️💕'
    },
    {
      icon: '🍓',
      title: 'Sweet Rose Macarons! 🍓',
      message: 'Crispy French strawberry and vanilla macarons with a note: You are always my favorite sweetness! 🌸'
    },
    {
      icon: '💘',
      title: 'Golden Cupid Sparkle! 💘',
      message: 'A little sprinkle of stardust that guarantees sweet laughs, warm cuddles, and hand-holding today! 🏹💖'
    }
  ];

  let currentSurpriseIndex = -1;
  let totalOpenedCount = 0;

  function getNextSurprise() {
    // Ensure every single open gives a DIFFERENT cute surprise!
    let nextIdx = (currentSurpriseIndex + 1 + Math.floor(Math.random() * (CUTE_SURPRISES.length - 1))) % CUTE_SURPRISES.length;
    currentSurpriseIndex = nextIdx;
    totalOpenedCount++;
    return CUTE_SURPRISES[currentSurpriseIndex];
  }

  function displaySurpriseItem(item) {
    if (surpriseCenterIcon) {
      surpriseCenterIcon.textContent = item.icon;
      surpriseCenterIcon.classList.remove('pop-enter');
      // Trigger CSS reflow to restart cute pop-out bounce
      void surpriseCenterIcon.offsetWidth;
      surpriseCenterIcon.classList.add('pop-enter');
    }

    if (surpriseBadgeTitle) {
      surpriseBadgeTitle.textContent = item.title;
    }

    if (surpriseCounterBadge) {
      const displayNum = ((totalOpenedCount - 1) % CUTE_SURPRISES.length) + 1;
      surpriseCounterBadge.textContent = `Surprise ${displayNum} of ${CUTE_SURPRISES.length} ✨`;
    }

    if (surpriseRevealedText) {
      surpriseRevealedText.textContent = item.message;
    }
  }

  function openSurpriseModal() {
    const item = getNextSurprise();

    // 1. Pop out flying mini item from the 3D gift box on page
    if (giftBoxPopItem) {
      giftBoxPopItem.textContent = item.icon;
      giftBoxPopItem.classList.remove('popping');
      void giftBoxPopItem.offsetWidth;
      giftBoxPopItem.classList.add('popping');
    }

    // 2. Open box lid with joyful rotation
    if (giftBoxLid) {
      giftBoxLid.style.transform = 'translateY(-48px) rotate(-22deg) scale(1.05)';
    }

    triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 25);
    try {
      playHeartSound();
    } catch (e) {}

    // 3. Reveal modal with the new cute surprise
    setTimeout(() => {
      displaySurpriseItem(item);

      if (surpriseModal) {
        surpriseModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 35);
        showToast(`Unboxed: ${item.title} 🎁✨`);
      }
    }, 280);
  }

  function closeSurpriseModal() {
    if (!surpriseModal) return;
    surpriseModal.classList.remove('active');
    document.body.style.overflow = '';

    if (giftBoxPopItem) {
      giftBoxPopItem.classList.remove('popping');
    }

    if (giftBoxLid) {
      setTimeout(() => {
        giftBoxLid.style.transform = '';
      }, 350);
    }
  }

  if (btnOpenGiftBox) btnOpenGiftBox.addEventListener('click', openSurpriseModal);
  if (btnOpenSurpriseModal) btnOpenSurpriseModal.addEventListener('click', openSurpriseModal);
  if (btnCloseSurprise) btnCloseSurprise.addEventListener('click', closeSurpriseModal);
  if (btnDismissSurprise) btnDismissSurprise.addEventListener('click', closeSurpriseModal);

  // --- Open Another Surprise inside Modal ---
  if (btnNextSurprise) {
    btnNextSurprise.addEventListener('click', () => {
      const item = getNextSurprise();
      displaySurpriseItem(item);
      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 30);
      showToast(`Next Surprise: ${item.title} 🎁`);
      try {
        playHeartSound();
      } catch (e) {}
    });
  }

  // --- Replay Magic Action ---
  if (btnReplaySurprise) {
    btnReplaySurprise.addEventListener('click', () => {
      if (surpriseCenterIcon) {
        surpriseCenterIcon.classList.remove('pop-enter');
        void surpriseCenterIcon.offsetWidth;
        surpriseCenterIcon.classList.add('pop-enter');
      }
      triggerHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 32);
      showToast('Sparkling magic shower for you! ✨💖');
      try {
        playHeartSound();
      } catch (e) {}
    });
  }

  if (surpriseModal) {
    surpriseModal.addEventListener('click', (e) => {
      if (e.target === surpriseModal) {
        closeSurpriseModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && surpriseModal?.classList.contains('active')) {
      closeSurpriseModal();
    }
  });

  // ==========================================================================
  // 12. FLOATING BACKGROUND MUSIC PLAYER & AUDIO SYNTHESIZER FALLBACK
  // ==========================================================================
  const floatingMusicPlayer = $('#floating-music-player');
  const musicVinylDisc = $('#music-vinyl-disc');
  const musicStatusText = $('#music-status-text');
  const btnMusicPlay = $('#btn-music-play');
  const musicPlayIcon = $('#music-play-icon');
  const btnMusicMute = $('#btn-music-mute');
  const musicMuteIcon = $('#music-mute-icon');
  const btnMusicHelp = $('#btn-music-help');
  const musicHelpModal = $('#music-help-modal');
  const btnCloseMusicHelp = $('#btn-close-music-help');
  const btnDismissMusicHelp = $('#btn-dismiss-music-help');
  const bgAudio = $('#bg-audio');

  let isAudioPlaying = false;
  let isMuted = false;
  let audioContext = null;
  let synthLoopTimer = null;
  let isUsingSynth = false;

  // Romantic Music Box Web Audio Synthesizer (Zero-dependency fallback)
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(freq, startTime, duration = 1.2, gainVal = 0.2) {
    if (!audioContext || isMuted) return;
    try {
      const osc = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Sweet bell-like chime envelope
      gainNode.gain.setValueAtTime(gainVal, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (err) {
      // safe ignore
    }
  }

  function playHeartSound() {
    initAudioContext();
    if (!audioContext || isMuted) return;
    const now = audioContext.currentTime;
    playTone(587.33, now, 0.4, 0.12); // D5
    playTone(880.00, now + 0.08, 0.6, 0.14); // A5
  }

  function runSynthLullaby() {
    isUsingSynth = true;
    initAudioContext();
    if (!audioContext) return;

    // Sweet romantic celesta arpeggio in F major / D minor
    const notes = [
      523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
      698.46, 880.00, 1046.50, 1318.51, // F5, A5, C6, E6
      587.33, 783.99, 987.77, 1174.66, // D5, G5, B5, D6
      659.25, 880.00, 1046.50, 1318.51  // E5, A5, C6, E6
    ];

    let step = 0;
    const intervalMs = 600;

    function playNext() {
      if (!isAudioPlaying || !isUsingSynth) return;
      if (audioContext && !isMuted) {
        const now = audioContext.currentTime;
        playTone(notes[step % notes.length], now, 1.4, 0.18);
        // Add soft harmonic fifth occasionally
        if (step % 2 === 0) {
          playTone(notes[step % notes.length] * 1.5, now + 0.04, 1.0, 0.07);
        }
      }
      step++;
      synthLoopTimer = setTimeout(playNext, intervalMs);
    }

    playNext();
  }

  function stopSynthLullaby() {
    clearTimeout(synthLoopTimer);
    isUsingSynth = false;
  }

  async function togglePlayMusic() {
    initAudioContext();

    if (isAudioPlaying) {
      // Pause
      isAudioPlaying = false;
      if (bgAudio) bgAudio.pause();
      stopSynthLullaby();

      floatingMusicPlayer?.classList.remove('playing');
      musicVinylDisc?.classList.remove('spinning');
      if (musicPlayIcon) musicPlayIcon.textContent = '▶';
      if (musicStatusText) musicStatusText.textContent = 'Paused ⏸';
    } else {
      // Play
      isAudioPlaying = true;
      floatingMusicPlayer?.classList.add('playing');
      musicVinylDisc?.classList.add('spinning');
      if (musicPlayIcon) musicPlayIcon.textContent = '⏸';
      if (musicStatusText) musicStatusText.textContent = 'Playing 🎶';

      if (bgAudio) {
        try {
          bgAudio.muted = isMuted;
          await bgAudio.play();
          isUsingSynth = false;
        } catch (err) {
          // If mp3 fails or is blocked, switch seamlessly to gentle web audio music box!
          runSynthLullaby();
        }
      } else {
        runSynthLullaby();
      }
    }
  }

  function toggleMuteMusic() {
    isMuted = !isMuted;
    if (bgAudio) bgAudio.muted = isMuted;
    if (musicMuteIcon) musicMuteIcon.textContent = isMuted ? '🔇' : '🔊';
    showToast(isMuted ? 'Music muted 🔇' : 'Music unmuted 🔊');
  }

  if (btnMusicPlay) btnMusicPlay.addEventListener('click', togglePlayMusic);
  if (btnMusicMute) btnMusicMute.addEventListener('click', toggleMuteMusic);

  // Auto-play music on first user click or tap anywhere on the universe card
  const handleFirstInteraction = () => {
    if (!isAudioPlaying) {
      togglePlayMusic();
    }
  };
  window.addEventListener('click', handleFirstInteraction, { once: true });
  window.addEventListener('touchstart', handleFirstInteraction, { once: true });

  // Music Help Modal
  function openMusicHelp() {
    if (musicHelpModal) {
      musicHelpModal.classList.add('active');
    }
  }

  function closeMusicHelp() {
    if (musicHelpModal) {
      musicHelpModal.classList.remove('active');
    }
  }

  if (btnMusicHelp) btnMusicHelp.addEventListener('click', openMusicHelp);
  if (btnCloseMusicHelp) btnCloseMusicHelp.addEventListener('click', closeMusicHelp);
  if (btnDismissMusicHelp) btnDismissMusicHelp.addEventListener('click', closeMusicHelp);

  if (musicHelpModal) {
    musicHelpModal.addEventListener('click', (e) => {
      if (e.target === musicHelpModal) closeMusicHelp();
    });
  }

  // ==========================================================================
  // 9. ADORABLE 3D COUPLE EXPERIENCE & VIRTUAL DATE NIGHT
  // ==========================================================================
  const coupleStatusBadge = $('#couple-status-badge');
  const btnCoupleHug = $('#btn-couple-hug');
  const btnCoupleKiss = $('#btn-couple-kiss');
  const btnCoupleHands = $('#btn-couple-hands');
  const btnCoupleDance = $('#btn-couple-dance');
  const btnCoupleWave = $('#btn-couple-wave');
  const btnCoupleIdle = $('#btn-couple-idle');

  const btnSceneCafe = $('#btn-scene-cafe');
  const btnScenePicnic = $('#btn-scene-picnic');
  const btnSceneMoonlight = $('#btn-scene-moonlight');
  const btnSceneStargazing = $('#btn-scene-stargazing');
  const btnSceneRain = $('#btn-scene-rain');

  let coupleActionCooldown = false;

  // Clean reaction system: No distracting emojis or huge hearts blocking the view!
  function spawnReactionFX() {
    // Intentionally kept clean as requested - focus is 100% on smooth 3D character motion!
  }

  function executeCoupleAction(actionName, message) {
    if (coupleActionCooldown) return;
    coupleActionCooldown = true;

    // Trigger smooth 3D character action
    if (window.Universe3D) {
      if (window.Universe3D.coupleController && typeof window.Universe3D.coupleController.playAction === 'function') {
        window.Universe3D.coupleController.playAction(actionName);
      } else if (typeof window.Universe3D.playCoupleAction === 'function') {
        window.Universe3D.playCoupleAction(actionName);
      }
    }

    // Update romantic status speech bubble
    if (coupleStatusBadge) {
      coupleStatusBadge.innerHTML = message;
      coupleStatusBadge.classList.add('pulse-badge');
      setTimeout(() => coupleStatusBadge.classList.remove('pulse-badge'), 500);
    }

    setTimeout(() => {
      coupleActionCooldown = false;
    }, 600);
  }

  if (btnCoupleHug) {
    btnCoupleHug.addEventListener('click', () => {
      executeCoupleAction('hug', '<span>🤗</span> Dudu &amp; Budu are sharing a warm, cozy hug!');
    });
  }

  if (btnCoupleKiss) {
    btnCoupleKiss.addEventListener('click', () => {
      executeCoupleAction('kiss', '<span>💋</span> Mwah! A sweet romantic kiss between Dudu &amp; Budu!');
    });
  }

  if (btnCoupleHands) {
    btnCoupleHands.addEventListener('click', () => {
      executeCoupleAction('hands', '<span>🫶</span> Dudu &amp; Budu holding paws tight... feeling the sweet love magic!');
    });
  }

  if (btnCoupleDance) {
    btnCoupleDance.addEventListener('click', () => {
      executeCoupleAction('dance', '<span>💃</span> Dudu &amp; Budu dancing together to a sweet romantic rhythm!');
    });
  }

  if (btnCoupleWave) {
    btnCoupleWave.addEventListener('click', () => {
      executeCoupleAction('wave', '<span>👋</span> Dudu &amp; Budu are waving to you with big sweet smiles!');
    });
  }

  if (btnCoupleIdle) {
    btnCoupleIdle.addEventListener('click', () => {
      executeCoupleAction('idle', '<span>🧍</span> Dudu &amp; Budu resting happily in their little universe.');
    });
  }

  // Virtual Date Night Scene Switching
  const sceneTabs = [
    {
      btn: btnSceneCafe,
      id: 'cafe',
      brand: '☕ Dudu &amp; Budu\'s Romantic Café',
      sub: 'Sitting together at our cozy café table 💗',
      msg: '<span>☕</span> Cozy Café Date: Dudu &amp; Budu sipping coffee with heart latte art.',
      bg: 'radial-gradient(ellipse at 50% 30%, #fff0f5 0%, #fee2e8 45%, #fce7f3 75%, #f3e8ff 100%)'
    },
    {
      btn: btnScenePicnic,
      id: 'picnic',
      brand: '🌸 Cherry Blossom Picnic Date',
      sub: 'Gentle sakura petals drifting in the spring breeze 💗',
      msg: '<span>🌸</span> Cherry Blossom Picnic: Spring breeze and gentle falling petals.',
      bg: 'radial-gradient(ellipse at top, #ffd1dc 0%, #ffedf3 45%, #bbf7d0 100%)'
    },
    {
      btn: btnSceneMoonlight,
      id: 'moonlight',
      brand: '🌙 Romantic Moonlight Walk',
      sub: 'Walking hand in paw under the glowing crescent moon 💗',
      msg: '<span>🌙</span> Moonlight Walk: Walking hand in hand under the glowing streetlamp and moon.',
      bg: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
    },
    {
      btn: btnSceneStargazing,
      id: 'stargazing',
      brand: '✨ Stargazing Galaxy Night',
      sub: 'Counting shooting stars together in our little universe 💗',
      msg: '<span>✨</span> Stargazing: Looking through the telescope and admiring twinkling constellations.',
      bg: 'radial-gradient(ellipse at center, #2e1065 0%, #170936 50%, #090314 100%)'
    },
    {
      btn: btnSceneRain,
      id: 'rain',
      brand: '☔ Cozy Rainy Umbrella Date',
      sub: 'Sharing one sweet umbrella under the soothing rain 💗',
      msg: '<span>☔</span> Rainy-Day Umbrella: Sheltered together under our pastel umbrella.',
      bg: 'radial-gradient(ellipse at top, #475569 0%, #334155 55%, #1e293b 100%)'
    }
  ];

  const toolbarBrand = document.getElementById('couple-toolbar-brand');
  const toolbarSub = document.getElementById('couple-toolbar-subtitle');

  sceneTabs.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener('click', () => {
        sceneTabs.forEach(t => {
          if (t.btn) {
            t.btn.classList.remove('active');
            t.btn.setAttribute('aria-selected', 'false');
          }
        });
        item.btn.classList.add('active');
        item.btn.setAttribute('aria-selected', 'true');

        // 1. Switch 3D WebGL scene lighting and props
        if (window.Universe3D) {
          if (window.Universe3D.coupleController && typeof window.Universe3D.coupleController.setScene === 'function') {
            window.Universe3D.coupleController.setScene(item.id);
          } else if (typeof window.Universe3D.setCoupleScene === 'function') {
            window.Universe3D.setCoupleScene(item.id);
          }
        }

        // 2. Visually transform stage background
        const wrapperEl = document.getElementById('couple-canvas-wrapper');
        if (wrapperEl) {
          wrapperEl.style.background = item.bg;
        }

        // 3. Update toolbar titles and status badge
        if (toolbarBrand && item.brand) toolbarBrand.innerHTML = item.brand;
        if (toolbarSub && item.sub) toolbarSub.innerHTML = item.sub;
        if (coupleStatusBadge) {
          coupleStatusBadge.innerHTML = item.msg;
          coupleStatusBadge.classList.add('pulse-badge');
          setTimeout(() => coupleStatusBadge.classList.remove('pulse-badge'), 500);
        }
      });
    }
  });

  // ==========================================================================
  // DUDU & BUDU: UPGRADED CUSTOMIZE LOOK MODAL LOGIC (6 Working Categories)
  // ==========================================================================

  const modalCustomizeLook = $('#modal-customize-look');
  const btnOpenCustomizeLook = $('#btn-open-customize-look');
  const btnCloseCustomizeLook = $('#btn-close-customize-look');

  const tabLookBudu = $('#tab-look-budu');
  const tabLookDudu = $('#tab-look-dudu');
  const contentLookBudu = $('#content-look-budu');
  const contentLookDudu = $('#content-look-dudu');

  let activeCustomChar = 'budu';

  function focusCharacterIn3D(charKey) {
    if (window.Universe3D && window.Universe3D.coupleController && typeof window.Universe3D.coupleController.focusCharacter === 'function') {
      window.Universe3D.coupleController.focusCharacter(charKey);
    }
  }

  function updateCharBlocksVisibility() {
    document.querySelectorAll('.char-panel-block[id$="-budu"]').forEach(el => {
      el.style.display = (activeCustomChar === 'budu') ? 'block' : 'none';
    });
    document.querySelectorAll('.char-panel-block[id$="-dudu"]').forEach(el => {
      el.style.display = (activeCustomChar === 'dudu') ? 'block' : 'none';
    });
  }

  if (btnOpenCustomizeLook && modalCustomizeLook) {
    btnOpenCustomizeLook.addEventListener('click', () => {
      modalCustomizeLook.style.display = 'flex';
      focusCharacterIn3D(activeCustomChar);
      syncCustomizerUITo3DState();
    });
  }

  function closeCustomizeLookModal() {
    if (modalCustomizeLook) modalCustomizeLook.style.display = 'none';
    focusCharacterIn3D(null); // return camera to full couple stage view
  }

  if (btnCloseCustomizeLook) btnCloseCustomizeLook.addEventListener('click', closeCustomizeLookModal);

  // Character Switcher (Budu / Dudu)
  if (tabLookBudu && tabLookDudu) {
    tabLookBudu.addEventListener('click', () => {
      activeCustomChar = 'budu';
      tabLookBudu.classList.add('active');
      tabLookDudu.classList.remove('active');
      updateCharBlocksVisibility();
      focusCharacterIn3D('budu');
    });
    tabLookDudu.addEventListener('click', () => {
      activeCustomChar = 'dudu';
      tabLookDudu.classList.add('active');
      tabLookBudu.classList.remove('active');
      updateCharBlocksVisibility();
      focusCharacterIn3D('dudu');
    });
  }

  // Category Tabs (Outfit, Hair, Makeup, Accessories, Colours, Expressions)
  document.querySelectorAll('.cat-tab-btn[data-cattab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
      const cat = tabBtn.getAttribute('data-cattab');
      document.querySelectorAll('.custom-category-panel').forEach(panel => {
        panel.style.display = 'none';
        panel.classList.remove('active');
      });
      const activePanel = document.getElementById(`panel-cat-${cat}`);
      if (activePanel) {
        activePanel.style.display = 'block';
        activePanel.classList.add('active');
      }
      updateCharBlocksVisibility();
    });
  });

  // 1. OUTFIT STYLE CARDS
  document.querySelectorAll('[data-group="budu-style"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-style"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const style = card.getAttribute('data-style');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduOutfitStyle(style);
      }
    });
  });

  document.querySelectorAll('[data-group="dudu-style"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="dudu-style"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const style = card.getAttribute('data-style');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduOutfitStyle(style);
      }
    });
  });

  // 2. HAIR & EARS CARDS
  document.querySelectorAll('[data-group="budu-hair"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-hair"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hair = card.getAttribute('data-hair');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduHair(hair);
      }
    });
  });

  document.querySelectorAll('[data-group="dudu-hair"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="dudu-hair"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const hair = card.getAttribute('data-hair');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduHair(hair);
      }
    });
  });

  // 3. ACCESSORIES CARDS
  document.querySelectorAll('[data-group="budu-acc"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-acc"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const acc = card.getAttribute('data-acc');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduAccessory(acc);
      }
    });
  });

  document.querySelectorAll('[data-group="dudu-acc"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="dudu-acc"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const acc = card.getAttribute('data-acc');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduAccessory(acc);
      }
    });
  });

  // 4. EXPRESSIONS CARDS
  document.querySelectorAll('[data-group="char-expression"] .option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-group="char-expression"] .option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const expr = card.getAttribute('data-expr');
      if (window.Universe3D && window.Universe3D.coupleController) {
        if (activeCustomChar === 'budu') {
          window.Universe3D.coupleController.setBuduExpression(expr);
        } else {
          window.Universe3D.coupleController.setDuduExpression(expr);
        }
      }
    });
  });

  // 5. BLUSH & MAKEUP CONTROLS
  const sliderBuduBlush = $('#slider-budu-blush');
  const labelBuduBlushVal = $('#label-budu-blush-val');
  if (sliderBuduBlush) {
    sliderBuduBlush.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelBuduBlushVal) labelBuduBlushVal.textContent = Math.round(val * 100) + '%';
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduBlush(val);
      }
    });
  }

  document.querySelectorAll('[data-group="budu-blush-color"] .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-blush-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduBlush(undefined, hex);
      }
    });
  });

  document.querySelectorAll('[data-group="budu-lip-color"] .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-lip-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduLipColor(hex);
      }
    });
  });

  const sliderDuduBlush = $('#slider-dudu-blush');
  const labelDuduBlushVal = $('#label-dudu-blush-val');
  if (sliderDuduBlush) {
    sliderDuduBlush.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (labelDuduBlushVal) labelDuduBlushVal.textContent = Math.round(val * 100) + '%';
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduBlush(val);
      }
    });
  }

  document.querySelectorAll('[data-group="dudu-blush-color"] .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="dudu-blush-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduBlush(undefined, hex);
      }
    });
  });

  // 6. COLOURS & NATIVE PICKERS
  const pickerBuduColor = $('#picker-budu-color');
  document.querySelectorAll('[data-group="budu-color"] .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="budu-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      if (pickerBuduColor) pickerBuduColor.value = hex;
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduOutfitColor(hex);
      }
    });
  });
  if (pickerBuduColor) {
    pickerBuduColor.addEventListener('input', (e) => {
      const hex = e.target.value;
      document.querySelectorAll('[data-group="budu-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setBuduOutfitColor(hex);
      }
    });
  }

  const pickerDuduColor = $('#picker-dudu-color');
  document.querySelectorAll('[data-group="dudu-color"] .swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-group="dudu-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const hex = btn.getAttribute('data-color');
      if (pickerDuduColor) pickerDuduColor.value = hex;
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduOutfitColor(hex);
      }
    });
  });
  if (pickerDuduColor) {
    pickerDuduColor.addEventListener('input', (e) => {
      const hex = e.target.value;
      document.querySelectorAll('[data-group="dudu-color"] .swatch-btn').forEach(b => b.classList.remove('active'));
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.setDuduOutfitColor(hex);
      }
    });
  }

  // Synchronize UI Controls with 3D State
  function syncCustomizerUITo3DState() {
    if (!window.Universe3D || !window.Universe3D.coupleController) return;
    const state = window.Universe3D.coupleController.getState();

    if (pickerBuduColor) pickerBuduColor.value = state.buduOutfitColor || '#ff9ebb';
    if (sliderBuduBlush) {
      sliderBuduBlush.value = state.buduBlushIntensity !== undefined ? state.buduBlushIntensity : 0.85;
      if (labelBuduBlushVal) labelBuduBlushVal.textContent = Math.round((state.buduBlushIntensity || 0.85) * 100) + '%';
    }

    if (pickerDuduColor) pickerDuduColor.value = state.duduOutfitColor || '#2b2220';
    if (sliderDuduBlush) {
      sliderDuduBlush.value = state.duduBlushIntensity !== undefined ? state.duduBlushIntensity : 0.75;
      if (labelDuduBlushVal) labelDuduBlushVal.textContent = Math.round((state.duduBlushIntensity || 0.75) * 100) + '%';
    }
  }

  // Customizer Footer Actions
  const btnResetActiveChar = $('#btn-reset-active-char');
  const btnResetBothChars = $('#btn-reset-both-chars');
  const btnSaveLook = $('#btn-save-look');
  const btnLoadSavedLook = $('#btn-load-saved-look');
  const btnApplyLook = $('#btn-apply-look');

  if (btnResetActiveChar) {
    btnResetActiveChar.addEventListener('click', () => {
      if (window.Universe3D && window.Universe3D.coupleController) {
        if (activeCustomChar === 'budu') {
          window.Universe3D.coupleController.resetBudu();
        } else {
          window.Universe3D.coupleController.resetDudu();
        }
        syncCustomizerUITo3DState();
      }
      if (coupleStatusBadge) {
        coupleStatusBadge.innerHTML = `<span>🔄</span> Reset ${activeCustomChar === 'budu' ? 'Budu' : 'Dudu'} to original appearance!`;
      }
    });
  }

  if (btnResetBothChars) {
    btnResetBothChars.addEventListener('click', () => {
      if (window.Universe3D && window.Universe3D.coupleController) {
        window.Universe3D.coupleController.resetBoth();
        syncCustomizerUITo3DState();
      }
      if (coupleStatusBadge) {
        coupleStatusBadge.innerHTML = '<span>✨</span> Both Dudu &amp; Budu reset to default look!';
      }
    });
  }

  if (btnSaveLook) {
    btnSaveLook.addEventListener('click', () => {
      if (window.Universe3D && window.Universe3D.coupleController) {
        const state = window.Universe3D.coupleController.getState();
        try {
          localStorage.setItem('universe_dudu_budu_customization', JSON.stringify(state));
        } catch (e) {}
      }
      if (coupleStatusBadge) {
        coupleStatusBadge.innerHTML = '<span>💾</span> Look saved! Your custom styling is safely stored.';
        coupleStatusBadge.classList.add('pulse-badge');
        setTimeout(() => coupleStatusBadge.classList.remove('pulse-badge'), 500);
      }
    });
  }

  if (btnLoadSavedLook) {
    btnLoadSavedLook.addEventListener('click', () => {
      try {
        const raw = localStorage.getItem('universe_dudu_budu_customization');
        if (raw && window.Universe3D && window.Universe3D.coupleController) {
          const saved = JSON.parse(raw);
          if (saved.buduOutfitColor) window.Universe3D.coupleController.setBuduOutfitColor(saved.buduOutfitColor);
          if (saved.buduOutfitStyle) window.Universe3D.coupleController.setBuduOutfitStyle(saved.buduOutfitStyle);
          if (saved.buduHair) window.Universe3D.coupleController.setBuduHair(saved.buduHair);
          if (saved.buduBlushIntensity !== undefined) window.Universe3D.coupleController.setBuduBlush(saved.buduBlushIntensity, saved.buduBlushColor);
          if (saved.buduAccessory) window.Universe3D.coupleController.setBuduAccessory(saved.buduAccessory);
          if (saved.buduLipColor) window.Universe3D.coupleController.setBuduLipColor(saved.buduLipColor);
          if (saved.buduExpression) window.Universe3D.coupleController.setBuduExpression(saved.buduExpression);

          if (saved.duduOutfitColor) window.Universe3D.coupleController.setDuduOutfitColor(saved.duduOutfitColor);
          if (saved.duduOutfitStyle) window.Universe3D.coupleController.setDuduOutfitStyle(saved.duduOutfitStyle);
          if (saved.duduHair) window.Universe3D.coupleController.setDuduHair(saved.duduHair);
          if (saved.duduBlushIntensity !== undefined) window.Universe3D.coupleController.setDuduBlush(saved.duduBlushIntensity, saved.duduBlushColor);
          if (saved.duduAccessory) window.Universe3D.coupleController.setDuduAccessory(saved.duduAccessory);
          if (saved.duduExpression) window.Universe3D.coupleController.setDuduExpression(saved.duduExpression);

          syncCustomizerUITo3DState();
        }
      } catch (e) {}
      if (coupleStatusBadge) {
        coupleStatusBadge.innerHTML = '<span>📂</span> Loaded your previously saved couple look!';
      }
    });
  }

  if (btnApplyLook) {
    btnApplyLook.addEventListener('click', () => {
      if (coupleStatusBadge) {
        coupleStatusBadge.innerHTML = '<span>💗</span> Couple look applied! Looking absolutely adorable.';
        coupleStatusBadge.classList.add('pulse-badge');
        setTimeout(() => coupleStatusBadge.classList.remove('pulse-badge'), 500);
      }
      closeCustomizeLookModal();
    });
  }

  // Keyboard and Overlay backdrop dismiss
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCustomizeLookModal();
    }
  });

  if (modalCustomizeLook) {
    modalCustomizeLook.addEventListener('click', (e) => {
      if (e.target === modalCustomizeLook) closeCustomizeLookModal();
    });
  }

})();


