/**
 * Our Little Universe - Couple Games Logic
 * Interactive Date Wheel, Romantic Truth or Dare, Who Knows Whom Better, and Daily Challenges.
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

  // Tabs
  const tabSpin = document.getElementById('tab-game-spin');
  const tabTruth = document.getElementById('tab-game-truth');
  const tabWho = document.getElementById('tab-game-who');
  const tabChallenges = document.getElementById('tab-game-challenges');

  const panelSpin = document.getElementById('panel-spin');
  const panelTruth = document.getElementById('panel-truth');
  const panelWho = document.getElementById('panel-who');
  const panelChallenges = document.getElementById('panel-challenges');

  const tabs = [
    { btn: tabSpin, panel: panelSpin },
    { btn: tabTruth, panel: panelTruth },
    { btn: tabWho, panel: panelWho },
    { btn: tabChallenges, panel: panelChallenges }
  ];

  tabs.forEach(t => {
    t.btn.addEventListener('click', () => {
      tabs.forEach(item => {
        item.btn.classList.toggle('active', item === t);
        item.panel.style.display = (item === t) ? 'block' : 'none';
      });
    });
  });

  // --- 1. Spin-the-Wheel Date Planner ---
  const spinWheel = document.getElementById('spin-wheel');
  const btnSpinWheel = document.getElementById('btn-spin-wheel');
  const spinResultBox = document.getElementById('spin-result-box');
  const spinResultTitle = document.getElementById('spin-result-title');
  const spinResultDesc = document.getElementById('spin-result-desc');

  const DATE_IDEAS = [
    { title: 'Cozy Café & Heart Latte Date ☕', desc: 'Visit a cute bakery or brew warm strawberry lattes together at home.' },
    { title: 'Romantic Movie & Blanket Fort 🎬', desc: 'Build a fairy-light blanket fort, pop caramel popcorn, and watch a favorite romance.' },
    { title: 'Midnight Stargazing & Music ✨', desc: 'Step outside under the open night sky, listen to gentle songs, and talk about your dreams.' },
    { title: 'Bake Strawberry Cupcakes Together 🧁', desc: 'Put on cute matching aprons, bake sweet treats, and feed each other the first bite.' },
    { title: 'Sunset Beach or Park Stroll 🌅', desc: 'Walk hand-in-hand during the golden hour, watching the sky turn pink and lavender.' },
    { title: 'Bookstore & Poetry Exploration 📚', desc: 'Browse cozy library or bookstore aisles and pick out a sweet love poem for each other.' }
  ];

  let currentRotation = 0;
  let isSpinning = false;

  btnSpinWheel.addEventListener('click', () => {
    if (isSpinning) return;
    isSpinning = true;
    btnSpinWheel.disabled = true;

    const extraSpins = 5 + Math.floor(Math.random() * 4); // 5 to 8 full rotations
    const targetSector = Math.floor(Math.random() * 6);
    const sectorAngle = 60;
    const finalAngle = (extraSpins * 360) + (targetSector * sectorAngle) + 30;

    currentRotation += finalAngle;
    spinWheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
      isSpinning = false;
      btnSpinWheel.disabled = false;
      const selected = DATE_IDEAS[targetSector];
      spinResultTitle.textContent = selected.title;
      spinResultDesc.textContent = selected.desc;
      spinResultBox.style.display = 'block';

      if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
        window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 20);
      }
    }, 3800);
  });

  // --- 2. Romantic Truth or Dare ---
  const btnTruth = document.getElementById('btn-draw-truth');
  const btnDare = document.getElementById('btn-draw-dare');
  const promptBadge = document.getElementById('prompt-badge');
  const promptText = document.getElementById('prompt-text');
  const btnSkipPrompt = document.getElementById('btn-skip-prompt');

  const TRUTHS = [
    'What was the very first thought that crossed your mind when you saw me?',
    'What is your favorite memory of us when no one else was around?',
    'What is one silly habit of mine that secretly makes you smile?',
    'When did you realize you were falling deeply in love with me?',
    'If we had a free plane ticket to anywhere right now, where would we go?',
    'What song reminds you of our love whenever you hear it?'
  ];

  const DARES = [
    'Give your partner a gentle 15-second forehead kiss.',
    'Look deeply into your partner\'s eyes for 30 seconds without laughing.',
    'Whisper three things you admire most about your partner.',
    'Play your partner\'s favorite song and slow-dance right here.',
    'Send your partner a sweet text message describing your feelings in 5 emojis.',
    'Give your partner a soothing shoulder massage.'
  ];

  let lastPromptType = 'truth';

  function drawPrompt(type) {
    lastPromptType = type;
    const list = type === 'truth' ? TRUTHS : DARES;
    const chosen = list[Math.floor(Math.random() * list.length)];
    promptBadge.textContent = type === 'truth' ? 'Romantic Truth 💖' : 'Sweet Dare 🔥';
    promptBadge.className = `prompt-badge ${type}`;
    promptText.textContent = chosen;
  }

  btnTruth.addEventListener('click', () => drawPrompt('truth'));
  btnDare.addEventListener('click', () => drawPrompt('dare'));
  btnSkipPrompt.addEventListener('click', () => drawPrompt(lastPromptType));

  // --- 3. 200-Question Couple Quiz Engine ---
  const whoCounter = document.getElementById('who-counter');
  const whoQuestionTitle = document.getElementById('who-question-title');
  const whoCategoryTag = document.getElementById('who-category-tag');
  const whoCategoryIcon = document.getElementById('who-category-icon');
  const whoCategoryName = document.getElementById('who-category-name');
  const whoProgressBar = document.getElementById('who-progress-bar');
  const whoSensitiveBadge = document.getElementById('who-sensitive-badge');
  const whoOptionsContainer = document.getElementById('who-options-container');

  const whoCustomInputBox = document.getElementById('who-custom-input-box');
  const whoCustomText = document.getElementById('who-custom-text');
  const whoCustomHint = document.getElementById('who-custom-hint');

  const btnSubmitGuess = document.getElementById('btn-submit-guess');
  const btnRevealAnswer = document.getElementById('btn-reveal-answer');
  const btnSaveSelf = document.getElementById('btn-save-self');
  const btnSkipWho = document.getElementById('btn-skip-who');

  const whoRevealCard = document.getElementById('who-reveal-card');
  const revealUserGuess = document.getElementById('reveal-user-guess');
  const revealActualAnswer = document.getElementById('reveal-actual-answer');
  const revealResultBadge = document.getElementById('reveal-result-badge');
  const revealResultText = document.getElementById('reveal-result-text');
  const revealOverrideBox = document.getElementById('reveal-override-box');
  const btnAcceptCustom = document.getElementById('btn-accept-custom');
  const btnNextWho = document.getElementById('btn-next-who');

  const whoModeGuess = document.getElementById('who-mode-guess');
  const whoModeSelf = document.getElementById('who-mode-self');
  const whoActivePlayer = document.getElementById('who-active-player');
  const whoCategoryFilter = document.getElementById('who-category-filter');
  const whoSessionLength = document.getElementById('who-session-length');
  const whoPlayerLabelText = document.getElementById('who-player-label-text');
  const quizInfoText = document.getElementById('quiz-info-text');
  const btnRestartQuiz = document.getElementById('btn-restart-quiz');
  const btnManageAnswers = document.getElementById('btn-manage-answers');

  const whoScoreVal = document.getElementById('who-score-val');
  const whoCorrectCount = document.getElementById('who-correct-count');
  const whoAnsweredCount = document.getElementById('who-answered-count');
  const whoSkippedCount = document.getElementById('who-skipped-count');
  const btnViewScorecard = document.getElementById('btn-view-scorecard');

  const whoScorecardSection = document.getElementById('who-scorecard-section');
  const scorecardEvalLabel = document.getElementById('scorecard-eval-label');
  const scorecardPercentage = document.getElementById('scorecard-percentage');
  const scorecardTotalPoints = document.getElementById('scorecard-total-points');
  const scorecardCompletedCount = document.getElementById('scorecard-completed-count');
  const scorecardCorrectTotal = document.getElementById('scorecard-correct-total');
  const scorecardCategoriesGrid = document.getElementById('scorecard-categories-grid');
  const btnPlayAgain = document.getElementById('btn-play-again');
  const btnSwitchPartners = document.getElementById('btn-switch-partners');
  const btnCloseScorecard = document.getElementById('btn-close-scorecard');

  const whoAnswersModal = document.getElementById('who-answers-modal');
  const modalPartnerName = document.getElementById('modal-partner-name');
  const modalAnswersList = document.getElementById('modal-answers-list');
  const btnCloseAnswersModal = document.getElementById('btn-close-answers-modal');
  const btnDoneAnswersModal = document.getElementById('btn-done-answers-modal');
  const btnClearMyAnswers = document.getElementById('btn-clear-my-answers');

  // Fallback questions if external script fails to load
  const fallbackQuestions = [
    {
      id: 'q_fav_01',
      category: 'favourite_things',
      categoryName: 'Favourite Things',
      categoryIcon: '🍰',
      isSensitive: false,
      question: "What is your partner's all-time favourite dessert?",
      options: ['Warm chocolate lava cake', 'New York cheesecake with berries', 'Tiramisu', 'Strawberry gelato', 'Other (Type custom answer...)']
    }
  ];

  const ALL_QUESTIONS = (typeof window.COUPLE_QUIZ_QUESTIONS !== 'undefined' && Array.isArray(window.COUPLE_QUIZ_QUESTIONS) && window.COUPLE_QUIZ_QUESTIONS.length > 0)
    ? window.COUPLE_QUIZ_QUESTIONS
    : fallbackQuestions;

  // Local Storage Keys
  const STORAGE_KEY_ANSWERS = 'universe_quiz_answers';
  const STORAGE_KEY_SESSION = 'universe_quiz_session';

  function getStoredAnswers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ANSWERS);
      return raw ? JSON.parse(raw) : { partner1: {}, partner2: {} };
    } catch (e) {
      return { partner1: {}, partner2: {} };
    }
  }

  function saveStoredAnswers(data) {
    try {
      localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(data));
    } catch (e) {}
  }

  function getStoredSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveStoredSession(state) {
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(state));
    } catch (e) {}
  }

  // Quiz State
  let quizMode = 'guess'; // 'guess' or 'self'
  let targetPartner = 'partner2'; // In guess mode: partner being guessed. In self mode: partner answering.
  let selectedCategory = 'all';
  let sessionLength = 25;
  let activeQuestions = [];
  let currentQuestionIndex = 0;
  let selectedOption = null;
  let customAnswerText = '';
  let score = 0;
  let correctGuesses = 0;
  let answeredQuestions = 0;
  let skippedQuestions = 0;
  let categoryResults = {}; // { catKey: { correct: 0, total: 0 } }
  let currentGuessAwarded = false;

  // Initialize partner names if authenticated user is cached
  if (window.UniverseAuth) {
    const cachedUser = window.UniverseAuth.getCachedUser();
    if (cachedUser && cachedUser.displayName && whoActivePlayer) {
      whoActivePlayer.options[0].text = `🌸 Partner 1 (${cachedUser.displayName})`;
    }
  }

  function getPartnerDisplayName(partnerKey) {
    if (partnerKey === 'partner1') {
      const cached = window.UniverseAuth ? window.UniverseAuth.getCachedUser() : null;
      return cached && cached.displayName ? cached.displayName : 'Luna';
    }
    return 'Oliver';
  }

  function updateModeUI() {
    if (quizMode === 'guess') {
      whoModeGuess.classList.add('active');
      whoModeGuess.setAttribute('aria-selected', 'true');
      whoModeSelf.classList.remove('active');
      whoModeSelf.setAttribute('aria-selected', 'false');

      whoPlayerLabelText.textContent = 'Guessing About:';
      quizInfoText.innerHTML = `<strong>Guessing Mode:</strong> Choose what you think <strong>${getPartnerDisplayName(targetPartner)}</strong> answered. Then click <strong>Reveal Partner's Answer</strong> to see what they saved!`;

      btnSubmitGuess.style.display = 'inline-flex';
      btnRevealAnswer.style.display = 'none';
      btnSaveSelf.style.display = 'none';
    } else {
      whoModeSelf.classList.add('active');
      whoModeSelf.setAttribute('aria-selected', 'true');
      whoModeGuess.classList.remove('active');
      whoModeGuess.setAttribute('aria-selected', 'false');

      whoPlayerLabelText.textContent = 'Answering For:';
      quizInfoText.innerHTML = `<strong>Self-Answer Mode:</strong> You are answering privately as <strong>${getPartnerDisplayName(targetPartner)}</strong>. Select or type your true answers so your partner can guess later!`;

      btnSubmitGuess.style.display = 'none';
      btnRevealAnswer.style.display = 'none';
      btnSaveSelf.style.display = 'inline-flex';
    }
    whoRevealCard.style.display = 'none';
  }

  function buildActiveQuestionList() {
    let pool = ALL_QUESTIONS;
    if (selectedCategory !== 'all') {
      pool = ALL_QUESTIONS.filter(q => q.category === selectedCategory);
    }

    // Limit by session length
    const limit = Math.min(sessionLength, pool.length);
    activeQuestions = pool.slice(0, limit);
    currentQuestionIndex = 0;
  }

  function updateLiveScoreboard() {
    whoScoreVal.textContent = score;
    whoCorrectCount.textContent = correctGuesses;
    whoAnsweredCount.textContent = answeredQuestions;
    whoSkippedCount.textContent = skippedQuestions;
  }

  function renderCurrentQuestion() {
    if (activeQuestions.length === 0) {
      whoQuestionTitle.textContent = 'No questions found for this selection.';
      whoOptionsContainer.innerHTML = '';
      return;
    }

    if (currentQuestionIndex >= activeQuestions.length) {
      showScorecard();
      return;
    }

    const q = activeQuestions[currentQuestionIndex];
    selectedOption = null;
    customAnswerText = '';
    currentGuessAwarded = false;

    // Reset UI controls
    whoCounter.textContent = `Question ${currentQuestionIndex + 1} of ${activeQuestions.length}`;
    whoQuestionTitle.textContent = q.question;
    whoCategoryIcon.textContent = q.categoryIcon || '💖';
    whoCategoryName.textContent = q.categoryName || 'Couple Quiz';

    // Progress Bar
    const progressPct = Math.round(((currentQuestionIndex + 1) / activeQuestions.length) * 100);
    whoProgressBar.style.width = `${progressPct}%`;

    // Sensitive Badge
    if (q.isSensitive) {
      whoSensitiveBadge.style.display = 'inline-flex';
    } else {
      whoSensitiveBadge.style.display = 'none';
    }

    // Reset Custom Input Box
    whoCustomInputBox.style.display = 'none';
    whoCustomText.value = '';
    whoCustomHint.textContent = 'Please enter an answer before continuing.';
    whoCustomHint.classList.remove('error-shake');

    // Reset Reveal Card
    whoRevealCard.style.display = 'none';
    revealOverrideBox.style.display = 'none';

    // Buttons
    if (quizMode === 'guess') {
      btnSubmitGuess.style.display = 'inline-flex';
      btnSubmitGuess.disabled = false;
      btnRevealAnswer.style.display = 'none';
      btnSaveSelf.style.display = 'none';
    } else {
      btnSubmitGuess.style.display = 'none';
      btnRevealAnswer.style.display = 'none';
      btnSaveSelf.style.display = 'inline-flex';
      btnSaveSelf.disabled = false;
    }

    // Check if self-answer already exists in store for this question
    const storedAnswers = getStoredAnswers();
    const partnerData = storedAnswers[targetPartner] || {};
    const existingAnswer = partnerData[q.id];

    // Build Options Buttons
    whoOptionsContainer.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'who-choice-btn';
      btn.setAttribute('data-index', idx);
      btn.setAttribute('data-value', optText);

      const isOther = optText.toLowerCase().includes('other');
      btn.innerHTML = `
        <span class="choice-indicator">${String.fromCharCode(65 + idx)}</span>
        <span class="choice-text">${optText}</span>
      `;

      // Pre-select if in self-answer mode and answer exists
      if (quizMode === 'self' && existingAnswer) {
        if (existingAnswer.isCustom && isOther) {
          btn.classList.add('active');
          selectedOption = optText;
          whoCustomInputBox.style.display = 'block';
          whoCustomText.value = existingAnswer.answerText;
        } else if (!existingAnswer.isCustom && existingAnswer.answerText === optText) {
          btn.classList.add('active');
          selectedOption = optText;
        }
      }

      btn.addEventListener('click', () => {
        const allBtns = whoOptionsContainer.querySelectorAll('.who-choice-btn');
        allBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedOption = optText;

        if (isOther) {
          whoCustomInputBox.style.display = 'block';
          whoCustomText.focus();
        } else {
          whoCustomInputBox.style.display = 'none';
          whoCustomText.value = '';
          whoCustomHint.classList.remove('error-shake');
        }
      });

      whoOptionsContainer.appendChild(btn);
    });

    // Save session progress
    saveStoredSession({
      quizMode,
      targetPartner,
      selectedCategory,
      sessionLength,
      currentQuestionIndex,
      score,
      correctGuesses,
      answeredQuestions,
      skippedQuestions,
      categoryResults
    });
  }

  function validateSelection() {
    if (!selectedOption) {
      alert('Please select an option first! 💗');
      return false;
    }

    const isOther = selectedOption.toLowerCase().includes('other');
    if (isOther) {
      const text = whoCustomText.value.trim();
      if (!text) {
        whoCustomHint.textContent = '⚠️ Custom answer cannot be empty. Please type your answer!';
        whoCustomHint.classList.add('error-shake');
        whoCustomText.focus();
        return false;
      }
      customAnswerText = text;
    } else {
      customAnswerText = '';
    }
    return true;
  }

  function normalizeAnswer(str) {
    if (!str) return '';
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // --- Submit Guess Action ---
  btnSubmitGuess.addEventListener('click', () => {
    if (!validateSelection()) return;

    // Lock option choices
    const allBtns = whoOptionsContainer.querySelectorAll('.who-choice-btn');
    allBtns.forEach(b => { b.disabled = true; });
    whoCustomText.disabled = true;

    // Transition: hide Submit, show Reveal Partner's Answer
    btnSubmitGuess.style.display = 'none';
    btnRevealAnswer.style.display = 'inline-flex';
    btnRevealAnswer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // --- Reveal Partner's Answer Action ---
  btnRevealAnswer.addEventListener('click', () => {
    btnRevealAnswer.style.display = 'none';

    const q = activeQuestions[currentQuestionIndex];
    const isOther = selectedOption.toLowerCase().includes('other');
    const guessText = isOther ? customAnswerText : selectedOption;

    const stored = getStoredAnswers();
    const partnerData = stored[targetPartner] || {};
    const partnerAnswer = partnerData[q.id];

    revealUserGuess.textContent = guessText;

    // Track category in results
    if (!categoryResults[q.category]) {
      categoryResults[q.category] = { correct: 0, total: 0, name: q.categoryName };
    }
    categoryResults[q.category].total += 1;
    answeredQuestions += 1;

    if (!partnerAnswer) {
      // Partner hasn't answered yet
      revealActualAnswer.textContent = `Your partner (${getPartnerDisplayName(targetPartner)}) hasn't answered this question yet.`;
      revealResultBadge.className = 'reveal-result-status is-unanswered';
      revealResultBadge.innerHTML = `<span class="result-icon">💭</span> <span class="result-text">Waiting for Partner's Answer</span>`;
      revealOverrideBox.style.display = 'none';
    } else {
      const actualText = partnerAnswer.answerText;
      revealActualAnswer.textContent = actualText;

      const normGuess = normalizeAnswer(guessText);
      const normActual = normalizeAnswer(actualText);

      const isExact = (normGuess === normActual);
      const isSubMatch = (normGuess.length > 3 && normActual.includes(normGuess)) || (normActual.length > 3 && normGuess.includes(normActual));

      if (isExact || isSubMatch) {
        // Correct!
        score += 10;
        correctGuesses += 1;
        categoryResults[q.category].correct += 1;
        currentGuessAwarded = true;

        revealResultBadge.className = 'reveal-result-status is-correct';
        revealResultBadge.innerHTML = `<span class="result-icon">✨</span> <span class="result-text">Correct! +10 Points</span>`;
        revealOverrideBox.style.display = 'none';

        if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
          window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 18);
        }
      } else {
        // Not quite match
        revealResultBadge.className = 'reveal-result-status is-incorrect';
        revealResultBadge.innerHTML = `<span class="result-icon">💕</span> <span class="result-text">Not Quite — Sweet Try!</span>`;
        // Allow grace override for close or custom answers
        revealOverrideBox.style.display = 'block';
        btnAcceptCustom.disabled = false;
        btnAcceptCustom.textContent = '✨ Accept as Correct (+10 pts)';
      }
    }

    updateLiveScoreboard();
    whoRevealCard.style.display = 'block';
    whoRevealCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // --- Subjective Grace Override ---
  btnAcceptCustom.addEventListener('click', () => {
    if (currentGuessAwarded) return;
    currentGuessAwarded = true;

    score += 10;
    correctGuesses += 1;
    const q = activeQuestions[currentQuestionIndex];
    if (categoryResults[q.category]) {
      categoryResults[q.category].correct += 1;
    }

    revealResultBadge.className = 'reveal-result-status is-correct';
    revealResultBadge.innerHTML = `<span class="result-icon">💖</span> <span class="result-text">Accepted with Grace! +10 Points</span>`;
    btnAcceptCustom.disabled = true;
    btnAcceptCustom.textContent = 'Grace Points Granted! 🌸';

    updateLiveScoreboard();
    if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
      window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 15);
    }
  });

  // --- Self-Answer Save Action ---
  btnSaveSelf.addEventListener('click', () => {
    if (!validateSelection()) return;

    const q = activeQuestions[currentQuestionIndex];
    const isOther = selectedOption.toLowerCase().includes('other');
    const answerText = isOther ? customAnswerText : selectedOption;

    const stored = getStoredAnswers();
    if (!stored[targetPartner]) stored[targetPartner] = {};
    stored[targetPartner][q.id] = {
      answerText,
      isCustom: isOther,
      updatedAt: Date.now()
    };
    saveStoredAnswers(stored);

    btnSaveSelf.disabled = true;
    btnSaveSelf.textContent = 'Saved! 💾💖';

    if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
      window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 10);
    }

    setTimeout(() => {
      btnSaveSelf.textContent = '💾 Save My Answer';
      btnSaveSelf.disabled = false;
      currentQuestionIndex += 1;
      renderCurrentQuestion();
    }, 700);
  });

  // --- Next Question Action ---
  btnNextWho.addEventListener('click', () => {
    whoCustomText.disabled = false;
    currentQuestionIndex += 1;
    renderCurrentQuestion();
  });

  // --- Skip Question Action ---
  btnSkipWho.addEventListener('click', () => {
    skippedQuestions += 1;
    updateLiveScoreboard();
    currentQuestionIndex += 1;
    renderCurrentQuestion();
  });

  // --- Mode Switching ---
  whoModeGuess.addEventListener('click', () => {
    if (quizMode === 'guess') return;
    quizMode = 'guess';
    updateModeUI();
    renderCurrentQuestion();
  });

  whoModeSelf.addEventListener('click', () => {
    if (quizMode === 'self') return;
    quizMode = 'self';
    updateModeUI();
    renderCurrentQuestion();
  });

  // --- Controls Change Handlers ---
  whoActivePlayer.addEventListener('change', (e) => {
    targetPartner = e.target.value;
    updateModeUI();
    renderCurrentQuestion();
  });

  whoCategoryFilter.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    buildActiveQuestionList();
    renderCurrentQuestion();
  });

  whoSessionLength.addEventListener('change', (e) => {
    sessionLength = parseInt(e.target.value, 10) || 25;
    buildActiveQuestionList();
    renderCurrentQuestion();
  });

  btnRestartQuiz.addEventListener('click', () => {
    if (confirm('Restart this quiz session? Current points will be reset.')) {
      score = 0;
      correctGuesses = 0;
      answeredQuestions = 0;
      skippedQuestions = 0;
      categoryResults = {};
      buildActiveQuestionList();
      updateLiveScoreboard();
      renderCurrentQuestion();
    }
  });

  // --- Scorecard Presentation ---
  function showScorecard() {
    whoScorecardSection.style.display = 'block';
    whoQuestionBox.style.display = 'none';

    scorecardTotalPoints.textContent = score;
    scorecardCompletedCount.textContent = answeredQuestions;
    scorecardCorrectTotal.textContent = correctGuesses;

    const percentage = answeredQuestions > 0 ? Math.round((correctGuesses / answeredQuestions) * 100) : 0;
    scorecardPercentage.textContent = `${percentage}%`;

    // Empathetic Label Evaluation
    let evalText = 'Getting to Know You 💌';
    if (percentage >= 85) {
      evalText = 'Soulmate Harmony 💖 — You know each other inside and out!';
    } else if (percentage >= 65) {
      evalText = 'You Know Each Other Well 🌸 — Deeply tuned in with sweet surprises!';
    } else if (percentage >= 45) {
      evalText = 'Great Connection ✨ — Beautiful bond with exciting things to explore!';
    } else {
      evalText = 'Getting to Know You 💌 — The sweetest part of love is unwrapping mysteries!';
    }
    scorecardEvalLabel.textContent = evalText;

    // Category Breakdown Render
    scorecardCategoriesGrid.innerHTML = '';
    const keys = Object.keys(categoryResults);
    if (keys.length === 0) {
      scorecardCategoriesGrid.innerHTML = '<p style="font-size:0.85rem; color: var(--color-plum-light);">No answered questions in this session yet.</p>';
    } else {
      keys.forEach(k => {
        const item = categoryResults[k];
        const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
        const row = document.createElement('div');
        row.className = 'breakdown-item';
        row.innerHTML = `
          <div class="breakdown-item-top">
            <span>${item.name || k}</span>
            <span>${item.correct} / ${item.total} (${pct}%)</span>
          </div>
          <div class="breakdown-bar-track">
            <div class="breakdown-bar-fill" style="width: ${pct}%;"></div>
          </div>
        `;
        scorecardCategoriesGrid.appendChild(row);
      });
    }

    whoScorecardSection.scrollIntoView({ behavior: 'smooth' });
  }

  btnViewScorecard.addEventListener('click', showScorecard);

  btnCloseScorecard.addEventListener('click', () => {
    whoScorecardSection.style.display = 'none';
    whoQuestionBox.style.display = 'block';
  });

  btnPlayAgain.addEventListener('click', () => {
    whoScorecardSection.style.display = 'none';
    whoQuestionBox.style.display = 'block';
    score = 0;
    correctGuesses = 0;
    answeredQuestions = 0;
    skippedQuestions = 0;
    categoryResults = {};
    buildActiveQuestionList();
    updateLiveScoreboard();
    renderCurrentQuestion();
  });

  btnSwitchPartners.addEventListener('click', () => {
    whoScorecardSection.style.display = 'none';
    whoQuestionBox.style.display = 'block';
    targetPartner = (targetPartner === 'partner1') ? 'partner2' : 'partner1';
    whoActivePlayer.value = targetPartner;
    updateModeUI();
    score = 0;
    correctGuesses = 0;
    answeredQuestions = 0;
    skippedQuestions = 0;
    categoryResults = {};
    buildActiveQuestionList();
    updateLiveScoreboard();
    renderCurrentQuestion();
  });

  // --- Saved Answers Modal (Privacy & Review) ---
  btnManageAnswers.addEventListener('click', () => {
    modalPartnerName.textContent = getPartnerDisplayName(targetPartner);
    const stored = getStoredAnswers();
    const partnerData = stored[targetPartner] || {};
    const answeredIds = Object.keys(partnerData);

    modalAnswersList.innerHTML = '';
    if (answeredIds.length === 0) {
      modalAnswersList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-plum-light); font-size: 0.9rem;">
          No answers saved yet for ${getPartnerDisplayName(targetPartner)}. Switch to Self-Answer Mode to start recording! 🌸
        </div>
      `;
    } else {
      answeredIds.forEach(id => {
        const qObj = ALL_QUESTIONS.find(q => q.id === id);
        const ans = partnerData[id];
        const row = document.createElement('div');
        row.className = 'modal-answer-item';
        row.innerHTML = `
          <div class="modal-answer-info">
            <div class="modal-answer-q">${qObj ? qObj.question : id}</div>
            <div class="modal-answer-a">Answer: ${ans.answerText} ${ans.isCustom ? '<em>(Custom)</em>' : ''}</div>
          </div>
          <button type="button" class="btn-del-answer" title="Delete this answer">🗑️</button>
        `;

        const delBtn = row.querySelector('.btn-del-answer');
        delBtn.addEventListener('click', () => {
          delete partnerData[id];
          stored[targetPartner] = partnerData;
          saveStoredAnswers(stored);
          row.remove();
          if (Object.keys(partnerData).length === 0) {
            btnManageAnswers.click();
          }
        });

        modalAnswersList.appendChild(row);
      });
    }

    whoAnswersModal.style.display = 'flex';
  });

  function closeAnswersModal() {
    whoAnswersModal.style.display = 'none';
    renderCurrentQuestion();
  }

  btnCloseAnswersModal.addEventListener('click', closeAnswersModal);
  btnDoneAnswersModal.addEventListener('click', closeAnswersModal);

  btnClearMyAnswers.addEventListener('click', () => {
    if (confirm(`Are you sure you want to clear all saved answers for ${getPartnerDisplayName(targetPartner)}?`)) {
      const stored = getStoredAnswers();
      stored[targetPartner] = {};
      saveStoredAnswers(stored);
      btnManageAnswers.click();
    }
  });

  // Restore session if present, otherwise initialize fresh
  const savedSession = getStoredSession();
  if (savedSession && savedSession.quizMode) {
    quizMode = savedSession.quizMode;
    targetPartner = savedSession.targetPartner || 'partner2';
    selectedCategory = savedSession.selectedCategory || 'all';
    sessionLength = savedSession.sessionLength || 25;
    currentQuestionIndex = savedSession.currentQuestionIndex || 0;
    score = savedSession.score || 0;
    correctGuesses = savedSession.correctGuesses || 0;
    answeredQuestions = savedSession.answeredQuestions || 0;
    skippedQuestions = savedSession.skippedQuestions || 0;
    categoryResults = savedSession.categoryResults || {};

    if (whoActivePlayer) whoActivePlayer.value = targetPartner;
    if (whoCategoryFilter) whoCategoryFilter.value = selectedCategory;
    if (whoSessionLength) whoSessionLength.value = sessionLength.toString();

    updateModeUI();
    buildActiveQuestionList();
    updateLiveScoreboard();
    renderCurrentQuestion();
  } else {
    updateModeUI();
    buildActiveQuestionList();
    updateLiveScoreboard();
    renderCurrentQuestion();
  }

  // --- 4. Daily Romantic Challenges ---
  const challengesList = document.getElementById('challenges-list');
  const DAILY_CHALLENGES = [
    { title: 'Leave a Hidden Love Note', desc: 'Tuck a sweet handwritten post-it note in their bag, pocket, or beside their pillow.', icon: '💌' },
    { title: 'Voice Note Warmth', desc: 'Send a spontaneous 15-second audio message telling them why you appreciate them today.', icon: '🎙️' },
    { title: 'Compliment Trifecta', desc: 'Give them three compliments today: one about their smile, one about their mind, and one about their heart.', icon: '✨' },
    { title: 'Screen-Free Sunset', desc: 'Spend 20 quiet minutes together during sunset with no phones, just sweet conversation.', icon: '🌅' }
  ];

  DAILY_CHALLENGES.forEach(ch => {
    const item = document.createElement('div');
    item.className = 'challenge-card';
    item.innerHTML = `
      <div class="challenge-icon">${ch.icon}</div>
      <div class="challenge-info">
        <h4>${ch.title}</h4>
        <p>${ch.desc}</p>
      </div>
      <button type="button" class="btn btn-secondary btn-sm btn-complete-challenge">Mark Done ✨</button>
    `;

    const btnDone = item.querySelector('.btn-complete-challenge');
    btnDone.addEventListener('click', () => {
      btnDone.textContent = 'Completed! 💖';
      btnDone.classList.add('completed');
      btnDone.disabled = true;
      if (window.Universe3D && typeof window.Universe3D.burstHearts === 'function') {
        window.Universe3D.burstHearts(window.innerWidth / 2, window.innerHeight / 2, 15);
      }
    });

    challengesList.appendChild(item);
  });
});
