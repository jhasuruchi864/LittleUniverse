/**
 * relationship-analyzer.js
 * Frontend Controller for Our Relationship Insights 💗 Dashboard
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let parsedRawMessages = [];
  let detectedParticipants = [];
  let detectedFormat = '';
  let activeStats = null;
  let activeInsights = null;

  // DOM Elements
  const stepImport = document.getElementById('step-import');
  const stepMapping = document.getElementById('step-mapping');
  const stepDashboard = document.getElementById('step-dashboard');

  const fileInput = document.getElementById('chat-file-input');
  const dropzone = document.getElementById('chat-dropzone');
  const btnLoadDemo = document.getElementById('btn-load-demo-chat');

  // Mapping & Consent elements
  const selectPartnerA = document.getElementById('select-partner-a');
  const selectPartnerB = document.getElementById('select-partner-b');
  const inputCustomNameA = document.getElementById('input-name-a');
  const inputCustomNameB = document.getElementById('input-name-b');
  const previewTotalMsgs = document.getElementById('mapping-preview-total');
  const previewDateRange = document.getElementById('mapping-preview-dates');
  const previewFormat = document.getElementById('mapping-preview-format');

  const chkConsent = document.getElementById('consent-agreement');
  const chkRedact = document.getElementById('consent-redact');
  const btnConfirmAnalyze = document.getElementById('btn-confirm-analyze');
  const btnCancelMapping = document.getElementById('btn-cancel-mapping');

  // Dashboard Containers
  const aiEngineBadge = document.getElementById('ai-engine-badge');
  const dashboardSubtitle = document.getElementById('dashboard-partner-names');
  const btnDeleteAll = document.getElementById('btn-delete-analysis');
  const btnExportReport = document.getElementById('btn-export-report');
  const btnNewAnalysis = document.getElementById('btn-new-analysis');

  // Weekly Check-in
  const checkinForm = document.getElementById('weekly-checkin-form');
  const checkinList = document.getElementById('checkin-history-list');

  // --- 1. SAMPLE DEMO CHAT DATA (Instant 1-Click Evaluation) ---
  const SAMPLE_DEMO_CHAT = `[12/02/2026, 09:15:20] Dudu: Good morning my sunshine! 🌸 Did you sleep well?
[12/02/2026, 09:18:45] Budu: Good morning bear! 🥰 Yes, had the sweetest dream about our trip. How are you feeling today?
[12/02/2026, 09:20:10] Dudu: Feeling great now that I'm talking to you. Have a big meeting at 11, slightly nervous!
[12/02/2026, 09:21:05] Budu: You got this! I believe in you so much, you worked so hard on this presentation. Sending you the biggest warm hug! 🤗💗
[12/02/2026, 12:45:10] Dudu: It went amazing! The client loved the whole roadmap!
[12/02/2026, 12:48:30] Budu: YAAAAY! I'm so proud of you honey! 🎉 Let's celebrate tonight! Coffee and pastries?
[12/02/2026, 12:50:00] Dudu: Absolutely, counting down the hours till 6 PM! ☕✨
[13/02/2026, 14:10:00] Budu: Hey love, are we still picking up groceries before the weekend?
[13/02/2026, 17:35:10] Dudu: Sorry for the late reply! Work was super hectic today. Yes, I'm heading out now!
[13/02/2026, 17:38:20] Budu: No worries at all, I figured you were swamped. Drive safe! ❤️
[14/02/2026, 08:30:15] Dudu: Happy Valentine's Day my little universe! 🌹 You make every single day brighter.
[14/02/2026, 08:35:50] Budu: Happy Valentine's Day! Love you endlessly bear! 🧸💕 Can't wait for our date night.
[15/02/2026, 19:10:12] Budu: Today was exhausting, feeling a bit overwhelmed by chores.
[15/02/2026, 19:12:05] Dudu: I'm so sorry love. Why don't you rest on the sofa and I'll take care of dinner and dishes?
[15/02/2026, 19:14:00] Budu: Really? That means the world to me, thank you for always being in my corner. 💖
[16/02/2026, 10:15:00] Dudu: What should we cook this Sunday? Thinking homemade pasta!
[16/02/2026, 10:20:18] Budu: Homemade pasta sounds dreamy! I'll make the garlic sauce. 🍝`;

  // --- 2. FILE DRAG & DROP & PARSING ---
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processUploadedFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processUploadedFile(files[0]);
      }
    });
  }

  if (btnLoadDemo) {
    btnLoadDemo.addEventListener('click', () => {
      const parsed = ChatParsers.parseWhatsAppTxt(SAMPLE_DEMO_CHAT);
      if (parsed.success) {
        onChatParsedSuccess(parsed, 'WhatsApp (Sample Demo Chat)');
      }
    });
  }

  async function processUploadedFile(file) {
    const fileName = file.name.toLowerCase();
    showToast(`Reading ${file.name}... ⏳`, 'info');

    // 15MB file size limit
    if (file.size > 15 * 1024 * 1024) {
      showToast('File too large (max 15MB). Please upload a smaller chat export.', 'error');
      return;
    }

    try {
      if (fileName.endsWith('.zip')) {
        const buffer = await file.arrayBuffer();
        const parsed = await ChatParsers.parseWhatsAppZip(buffer);
        handleParseResult(parsed, 'WhatsApp (.zip export)');
      } else if (fileName.endsWith('.json')) {
        const text = await file.text();
        // Try Instagram JSON first, then generic JSON
        let parsed = ChatParsers.parseInstagramJson(text);
        if (!parsed.success) {
          parsed = ChatParsers.parseGenericJson(text);
        }
        handleParseResult(parsed, 'JSON Chat Export');
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        const text = await file.text();
        const parsed = ChatParsers.parseInstagramHtml(text);
        handleParseResult(parsed, 'Instagram HTML Export');
      } else if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const parsed = ChatParsers.parseCsvChat(text);
        handleParseResult(parsed, 'CSV Chat Export');
      } else {
        // Default text or txt/eml
        const text = await file.text();
        let parsed = ChatParsers.parseWhatsAppTxt(text);
        if (!parsed.success) {
          parsed = ChatParsers.parseGmailExport(text);
        }
        handleParseResult(parsed, 'Chat Text / Export');
      }
    } catch (err) {
      showToast('Error processing file: ' + err.message, 'error');
    }
  }

  function handleParseResult(parsed, formatLabel) {
    if (!parsed || !parsed.success) {
      showToast(parsed?.error || 'Could not parse chat messages from this file.', 'error');
      return;
    }
    onChatParsedSuccess(parsed, formatLabel);
  }

  function onChatParsedSuccess(parsed, formatLabel) {
    parsedRawMessages = parsed.messages;
    detectedParticipants = parsed.participants;
    detectedFormat = formatLabel;

    // Populate participant selectors in step 2
    selectPartnerA.innerHTML = '';
    selectPartnerB.innerHTML = '';

    detectedParticipants.forEach((p, idx) => {
      const optA = document.createElement('option');
      optA.value = p;
      optA.textContent = p;
      if (idx === 0) optA.selected = true;
      selectPartnerA.appendChild(optA);

      const optB = document.createElement('option');
      optB.value = p;
      optB.textContent = p;
      if (idx === 1 || (idx === 0 && detectedParticipants.length === 1)) optB.selected = true;
      selectPartnerB.appendChild(optB);
    });

    inputCustomNameA.value = detectedParticipants[0] || 'Dudu';
    inputCustomNameB.value = detectedParticipants[1] || 'Budu';

    selectPartnerA.addEventListener('change', () => {
      inputCustomNameA.value = selectPartnerA.value;
    });
    selectPartnerB.addEventListener('change', () => {
      inputCustomNameB.value = selectPartnerB.value;
    });

    previewTotalMsgs.textContent = parsedRawMessages.length.toLocaleString();
    previewFormat.textContent = detectedFormat;

    const firstTime = new Date(parsedRawMessages[0].timestamp);
    const lastTime = new Date(parsedRawMessages[parsedRawMessages.length - 1].timestamp);
    previewDateRange.textContent = `${firstTime.toLocaleDateString()} — ${lastTime.toLocaleDateString()}`;

    // Switch view to Step 2 Mapping
    stepImport.style.display = 'none';
    stepMapping.style.display = 'block';
    stepDashboard.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Chat loaded! Please confirm partners & consent 💗', 'success');
  }

  // --- 3. CONFIRM & RUN ANALYSIS ---
  if (btnCancelMapping) {
    btnCancelMapping.addEventListener('click', () => {
      stepMapping.style.display = 'none';
      stepImport.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnConfirmAnalyze) {
    btnConfirmAnalyze.addEventListener('click', async () => {
      if (!chkConsent.checked) {
        showToast('Please confirm consent from both partners to proceed.', 'error');
        chkConsent.focus();
        return;
      }

      const partnerAName = inputCustomNameA.value.trim() || 'Partner A';
      const partnerBName = inputCustomNameB.value.trim() || 'Partner B';
      const rawSenderA = selectPartnerA.value;
      const rawSenderB = selectPartnerB.value;

      btnConfirmAnalyze.disabled = true;
      btnConfirmAnalyze.innerHTML = '<span>⏳</span> Analyzing Relationship Insights...';

      try {
        // Redaction if enabled
        let messagesForAnalysis = parsedRawMessages;
        if (chkRedact.checked) {
          messagesForAnalysis = ChatParsers.redactMessages(parsedRawMessages, {
            redactPhone: true,
            redactEmail: true,
            redactUrls: true
          });
        }

        // 1. Calculate deterministic statistics
        activeStats = RelationshipStatistics.calculateStatistics(messagesForAnalysis, {
          partnerA: partnerAName,
          partnerB: partnerBName,
          rawSenderA: rawSenderA,
          rawSenderB: rawSenderB
        });

        // 2. Check server AI availability or execute algorithmic insights
        let insights = null;
        try {
          const aiResponse = await fetch('/api/analyzer/ai-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consentGiven: true,
              partnerA: partnerAName,
              partnerB: partnerBName,
              stats: activeStats,
              sampleMoments: activeStats.sentiment.positiveMoments.concat(activeStats.sentiment.apologyMoments)
            })
          });

          const aiData = await aiResponse.json();
          if (aiData.success && aiData.insights) {
            insights = aiData.insights;
            aiEngineBadge.innerHTML = `<span>🤖</span> AI Nuance Engine Active (${aiData.provider || 'Gemini'})`;
            aiEngineBadge.className = 'status-pill-badge active-ai';
          }
        } catch (e) {
          console.log('Server AI offline, running algorithmic insights engine.');
        }

        // Graceful fallback to built-in algorithmic insights if AI not configured
        if (!insights) {
          insights = RelationshipStatistics.generateAlgorithmicInsights(activeStats, partnerAName, partnerBName);
          aiEngineBadge.innerHTML = '<span>🌟</span> High-Precision Algorithmic Engine Active';
          aiEngineBadge.className = 'status-pill-badge active-algo';
        }

        activeInsights = insights;

        // Render Dashboard
        renderDashboard(activeStats, activeInsights);

        // Auto-save report to store if possible
        try {
          fetch('/api/analyzer/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stats: activeStats,
              insights: activeInsights,
              mapping: { partnerA: partnerAName, partnerB: partnerBName }
            })
          });
        } catch (e) {}

        stepMapping.style.display = 'none';
        stepDashboard.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('Relationship Insights Ready! 💗', 'success');

      } catch (err) {
        showToast('Error during analysis: ' + err.message, 'error');
      } finally {
        btnConfirmAnalyze.disabled = false;
        btnConfirmAnalyze.innerHTML = '<span>✨</span> Confirm &amp; Generate Insights';
      }
    });
  }

  // --- 4. RENDER DASHBOARD UI ---
  function renderDashboard(stats, insights) {
    const pA = stats.partnerA.name;
    const pB = stats.partnerB.name;

    if (dashboardSubtitle) {
      dashboardSubtitle.textContent = `A celebration of communication and mutual growth for ${pA} & ${pB} 💗`;
    }

    // 1. Overview Stats Grid
    setElementText('stat-total-messages', stats.totalMessages.toLocaleString());
    setElementText('stat-active-days', stats.activeDays.toLocaleString());
    setElementText('stat-calendar-days', `${stats.calendarDays} days`);
    setElementText('stat-dual-days', stats.dualActiveDays.toLocaleString());
    setElementText('stat-avg-msgs', stats.avgMessagesPerActiveDay);
    setElementText('stat-date-span', `${stats.firstMessageDate} to ${stats.lastMessageDate}`);

    // 2. Communication Balance Visual Meters
    // Volume Meter
    setElementText('label-name-a', pA);
    setElementText('label-name-b', pB);
    setElementText('meter-val-msgs-a', `${stats.partnerA.percentage}% (${stats.partnerA.count.toLocaleString()})`);
    setElementText('meter-val-msgs-b', `${stats.partnerB.percentage}% (${stats.partnerB.count.toLocaleString()})`);
    setMeterWidth('bar-msgs-a', stats.partnerA.percentage);
    setMeterWidth('bar-msgs-b', stats.partnerB.percentage);

    // Initiations Meter
    setElementText('meter-val-init-a', `${stats.initiations.percentageA}% (${stats.initiations.partnerA})`);
    setElementText('meter-val-init-b', `${stats.initiations.percentageB}% (${stats.initiations.partnerB})`);
    setMeterWidth('bar-init-a', stats.initiations.percentageA);
    setMeterWidth('bar-init-b', stats.initiations.percentageB);

    // Response Times
    setElementText('resp-median-a', stats.responseTimes.medianFormattedA);
    setElementText('resp-median-b', stats.responseTimes.medianFormattedB);
    setElementText('resp-fast-a', `${stats.responseTimes.fastReplyPercentageA}% under 10m`);
    setElementText('resp-fast-b', `${stats.responseTimes.fastReplyPercentageB}% under 10m`);
    setElementText('resp-methodology', stats.responseTimes.methodology);

    // Questions Parity
    setElementText('questions-asked-a', stats.questions.askedByA);
    setElementText('questions-asked-b', stats.questions.askedByB);
    setElementText('questions-rate-a', `${stats.questions.answerRateA}% replied`);
    setElementText('questions-rate-b', `${stats.questions.answerRateB}% replied`);

    // Balance Commentary Note
    setElementText('balance-analysis-commentary', insights.communicationHealthNote);

    // 3. Positive Moments Highlights
    const positiveGrid = document.getElementById('positive-moments-grid');
    if (positiveGrid) {
      positiveGrid.innerHTML = '';
      const moments = stats.sentiment.positiveMoments;
      if (moments && moments.length > 0) {
        moments.slice(0, 6).forEach(m => {
          const card = document.createElement('div');
          card.className = 'moment-quote-card';
          card.innerHTML = `
            <div class="moment-quote-header">
              <span class="moment-quote-sender">🌸 ${escapeHtml(m.sender)}</span>
              <span class="moment-quote-date">📅 ${m.date}</span>
            </div>
            <p class="moment-quote-text">"${escapeHtml(m.text)}"</p>
          `;
          positiveGrid.appendChild(card);
        });
      } else {
        positiveGrid.innerHTML = '<p class="empty-hint">Messages are sweet and supportive across your active conversation timeline.</p>';
      }
    }

    // 4. Partner A & Partner B Separate Needs Cards
    renderPartnerCard('card-partner-a', insights.partnerAInsights, pA, stats.partnerA);
    renderPartnerCard('card-partner-b', insights.partnerBInsights, pB, stats.partnerB);

    // 5. Conflict Resolution & Communication Improvement Scenarios
    const conflictList = document.getElementById('conflict-events-list');
    if (conflictList) {
      conflictList.innerHTML = '';
      const events = insights.conflictEvents || [];
      if (events.length > 0) {
        events.forEach(ev => {
          const item = document.createElement('div');
          item.className = 'glass-card conflict-scenario-card';
          item.innerHTML = `
            <div class="scenario-header">
              <h4><span>💡</span> ${escapeHtml(ev.title)}</h4>
              <p class="scenario-context">${escapeHtml(ev.context)}</p>
            </div>
            <div class="scenario-body">
              <div class="scenario-col">
                <strong>What Happened:</strong>
                <p>${escapeHtml(ev.whatHappened)}</p>
                <strong>Possible Root Cause:</strong>
                <p>${escapeHtml(ev.possibleRootCause)}</p>
              </div>
              <div class="scenario-col dialogue-diff-box">
                <strong>Constructive Alternative Rephrasing:</strong>
                <div class="constructive-bubble">
                  ${escapeHtml(ev.constructiveDialogueExample || ev.partnerACouldSay).replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
          `;
          conflictList.appendChild(item);
        });
      }
    }

    // 6. Improvement Plan Checklist
    const planList = document.getElementById('improvement-plan-items');
    if (planList) {
      planList.innerHTML = '';
      const items = insights.sharedImprovementPlan || [];
      items.forEach((itemText, idx) => {
        const li = document.createElement('li');
        li.className = 'agreement-item';
        li.innerHTML = `
          <label class="agreement-checkbox-label">
            <input type="checkbox" class="agreement-chk" id="agree-chk-${idx}">
            <span class="agreement-text">${escapeHtml(itemText)}</span>
          </label>
        `;
        planList.appendChild(li);
      });
    }

    // 7. Load Check-ins
    loadCheckIns();
  }

  function renderPartnerCard(containerId, partnerInsights, partnerName, statsObj) {
    const card = document.getElementById(containerId);
    if (!card) return;

    card.innerHTML = `
      <div class="partner-card-header">
        <div class="partner-avatar-ring"><span>🧸</span></div>
        <div class="partner-title-box">
          <h3 class="partner-card-title">${escapeHtml(partnerName)}</h3>
          <span class="partner-stats-badge">${statsObj.count.toLocaleString()} messages • ${statsObj.avgWords} avg words</span>
        </div>
      </div>
      <div class="partner-card-content">
        <div class="insight-block">
          <h5><span>💖</span> What They May Appreciate:</h5>
          <ul>${(partnerInsights?.appreciation || []).map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
        </div>
        <div class="insight-block">
          <h5><span>🌧️</span> Potential Communication Friction:</h5>
          <ul>${(partnerInsights?.frustrations || []).map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
        </div>
        <div class="insight-block">
          <h5><span>💌</span> Expressed Needs &amp; Preferences:</h5>
          <p class="needs-text">${escapeHtml(partnerInsights?.needsExplicitVsInferred || 'Values loving presence and mutual responsiveness.')}</p>
        </div>
        <div class="insight-block">
          <h5><span>✨</span> Practical Ideas to Try:</h5>
          <ul>${(partnerInsights?.practicalSuggestions || []).map(s => `<li>${escapeHtml(s)}</li>`).join('')}</ul>
        </div>
      </div>
    `;
  }

  // --- 5. WEEKLY RELATIONSHIP CHECK-IN SYSTEM ---
  if (checkinForm) {
    checkinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = document.querySelector('input[name="harmony-rating"]:checked')?.value || 5;
      const celebration = document.getElementById('checkin-celebration')?.value || '';
      const growthGoal = document.getElementById('checkin-goal')?.value || '';

      if (!celebration.trim() && !growthGoal.trim()) {
        showToast('Please enter a moment of appreciation or goal for this week! 🌸', 'info');
        return;
      }

      try {
        const res = await fetch('/api/analyzer/check-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            harmonyRating: rating,
            celebration,
            growthGoal
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast('Weekly Relationship Check-In saved! 💗', 'success');
          checkinForm.reset();
          loadCheckIns();
        }
      } catch (err) {
        showToast('Error saving check-in.', 'error');
      }
    });
  }

  async function loadCheckIns() {
    if (!checkinList) return;
    try {
      const res = await fetch('/api/analyzer/check-ins');
      const data = await res.json();
      if (data.success && Array.isArray(data.checkIns)) {
        checkinList.innerHTML = '';
        if (data.checkIns.length === 0) {
          checkinList.innerHTML = '<p class="empty-hint">No weekly check-ins recorded yet. Log your first sweet weekly reflection above! ✨</p>';
          return;
        }

        data.checkIns.forEach(entry => {
          const item = document.createElement('div');
          item.className = 'checkin-history-card';
          const hearts = '💖'.repeat(Math.min(5, Math.max(1, entry.harmonyRating)));
          const dateStr = new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

          item.innerHTML = `
            <div class="checkin-card-header">
              <span class="checkin-date">📅 ${dateStr}</span>
              <span class="checkin-rating">${hearts}</span>
            </div>
            ${entry.celebration ? `<p><strong>🎉 What went well:</strong> ${escapeHtml(entry.celebration)}</p>` : ''}
            ${entry.growthGoal ? `<p><strong>🌱 Focus Goal:</strong> ${escapeHtml(entry.growthGoal)}</p>` : ''}
          `;
          checkinList.appendChild(item);
        });
      }
    } catch (e) {}
  }

  // --- 6. EXPORT REPORT & DELETE DATA ---
  if (btnExportReport) {
    btnExportReport.addEventListener('click', () => {
      window.print();
    });
  }

  if (btnNewAnalysis) {
    btnNewAnalysis.addEventListener('click', () => {
      stepDashboard.style.display = 'none';
      stepMapping.style.display = 'none';
      stepImport.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnDeleteAll) {
    btnDeleteAll.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to permanently delete all imported chat data, statistics, and relationship reports?')) {
        return;
      }

      try {
        await fetch('/api/analyzer/report', { method: 'DELETE' });
        parsedRawMessages = [];
        activeStats = null;
        activeInsights = null;

        stepDashboard.style.display = 'none';
        stepMapping.style.display = 'none';
        stepImport.style.display = 'block';

        showToast('All relationship data and reports permanently deleted. 🔒', 'info');
      } catch (e) {
        showToast('Error deleting data.', 'error');
      }
    });
  }

  // --- Helper Functions ---
  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setMeterWidth(id, pct) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    let toast = document.getElementById('universe-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'universe-toast';
      toast.className = 'universe-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `universe-toast show toast-${type}`;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.className = 'universe-toast';
    }, 4000);
  }
});
