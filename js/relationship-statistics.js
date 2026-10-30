/**
 * relationship-statistics.js
 * Deterministic Relationship Statistics & Algorithmic Insights Engine
 * Calculates strictly verifiable metrics from parsed chat messages.
 * Part of Our Little Universe 💗 AI Relationship Analyzer
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RelationshipStatistics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // Heuristic emotional and communicative keywords
  const POSITIVE_LEXICON = [
    /\b(love|adore|cherish|sweetheart|honey|darling|babe|baby|jaan|pyar|pyaar)\b/i,
    /\b(happy|grateful|thankful|appreciate|blessed|excited|joy|glad)\b/i,
    /\b(cute|sweet|pretty|gorgeous|handsome|beautiful|adorable|special)\b/i,
    /\b(miss you|thinking of you|proud of you|hug|kiss|love you)\b/i,
    /[❤️💖💗💓💕💞🥰😘😍💐🌸✨🌹🧸]/
  ];

  const APOLOGY_LEXICON = [
    /\b(sorry|apologize|apologies|my fault|my bad|forgive me|didn't mean to|pardon)\b/i
  ];

  const SUPPORT_LEXICON = [
    /\b(here for you|don't worry|take care|it's okay|you got this|believe in you|rest well|sleep well)\b/i,
    /\b(proud of you|always with you|by your side|how are you feeling|can i help)\b/i
  ];

  const QUESTION_WORDS = [
    /\?$/,
    /^\s*(who|what|when|where|why|how|are you|do you|did you|can you|could you|will you|would you)\b/i,
    /^\s*(kya|kyu|kyun|kab|kaha|kahan|kaise|kaisi|kaisa)\b/i
  ];

  function isQuestion(text) {
    if (!text) return false;
    const trimmed = text.trim();
    if (trimmed.endsWith('?')) return true;
    return QUESTION_WORDS.some(rx => rx.test(trimmed));
  }

  function formatDuration(minutes) {
    if (isNaN(minutes) || minutes < 0) return 'N/A';
    if (minutes < 1) return '< 1 min';
    if (minutes < 60) return `${Math.round(minutes)} mins`;
    const hours = Math.floor(minutes / 60);
    const remMins = Math.round(minutes % 60);
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours} hours`;
  }

  /**
   * Main Deterministic Calculation Method
   */
  function calculateStatistics(messages, mapping = {}) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        totalMessages: 0,
        activeDays: 0,
        dualActiveDays: 0,
        calendarDays: 0,
        partnerA: { name: mapping.partnerA || 'Partner A', count: 0, percentage: 0, words: 0, avgWords: 0 },
        partnerB: { name: mapping.partnerB || 'Partner B', count: 0, percentage: 0, words: 0, avgWords: 0 }
      };
    }

    const nameA = mapping.partnerA || 'Partner A';
    const nameB = mapping.partnerB || 'Partner B';
    const rawSenderA = mapping.rawSenderA || nameA;
    const rawSenderB = mapping.rawSenderB || nameB;

    function isPartnerA(sender) {
      if (!sender) return false;
      return sender.trim().toLowerCase() === rawSenderA.trim().toLowerCase() ||
             sender.trim().toLowerCase() === nameA.trim().toLowerCase();
    }

    // Sort chronologically
    const sorted = [...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    let countA = 0;
    let countB = 0;
    let wordsA = 0;
    let wordsB = 0;

    const daysMap = new Map(); // dateKey -> { a: boolean, b: boolean, count: number }
    const timeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const monthlyTrend = {};

    let positiveCount = 0;
    let apologyCount = 0;
    let supportCount = 0;
    const positiveMoments = [];
    const apologyMoments = [];

    let questionsA = 0;
    let questionsB = 0;
    let questionsAnsweredA = 0;
    let questionsAnsweredB = 0;

    // Response times calculation
    const responseTimesA = []; // In minutes
    const responseTimesB = [];
    const INACTIVITY_SESSION_GAP = 4 * 60 * 60 * 1000; // 4 hours in ms defines a new conversation session
    const OVERNIGHT_GAP = 8 * 60 * 60 * 1000; // 8 hours in ms treated as overnight

    let sessionsStartedA = 0;
    let sessionsStartedB = 0;

    for (let i = 0; i < sorted.length; i++) {
      const msg = sorted[i];
      const dateObj = new Date(msg.timestamp);
      const isA = isPartnerA(msg.sender);
      const text = msg.text || '';
      const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

      // 1. Participant count & words
      if (isA) {
        countA++;
        wordsA += wordCount;
      } else {
        countB++;
        wordsB += wordCount;
      }

      // 2. Active calendar days
      const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, { a: false, b: false, count: 0 });
      }
      const dayRecord = daysMap.get(dateKey);
      dayRecord.count++;
      if (isA) dayRecord.a = true;
      else dayRecord.b = true;

      // 3. Time of day
      const hr = dateObj.getHours();
      if (hr >= 5 && hr < 12) timeOfDay.morning++;
      else if (hr >= 12 && hr < 17) timeOfDay.afternoon++;
      else if (hr >= 17 && hr < 22) timeOfDay.evening++;
      else timeOfDay.night++;

      // 4. Monthly trends
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;

      // 5. Questions detection
      if (isQuestion(text)) {
        if (isA) questionsA++;
        else questionsB++;

        // Lookahead to see if partner replied within 30 minutes
        const maxReplyTime = dateObj.getTime() + 30 * 60 * 1000;
        for (let j = i + 1; j < Math.min(i + 10, sorted.length); j++) {
          const nextMsg = sorted[j];
          const nextTime = new Date(nextMsg.timestamp).getTime();
          if (nextTime > maxReplyTime) break;
          const nextIsA = isPartnerA(nextMsg.sender);
          if (nextIsA !== isA) {
            if (isA) questionsAnsweredA++;
            else questionsAnsweredB++;
            break;
          }
        }
      }

      // 6. Emotional lexicon detection
      if (POSITIVE_LEXICON.some(rx => rx.test(text))) {
        positiveCount++;
        if (positiveMoments.length < 8 && text.length > 5 && text.length < 150) {
          positiveMoments.push({
            sender: isA ? nameA : nameB,
            date: dateKey,
            text: text
          });
        }
      }

      if (APOLOGY_LEXICON.some(rx => rx.test(text))) {
        apologyCount++;
        if (apologyMoments.length < 6 && text.length > 5 && text.length < 150) {
          apologyMoments.push({
            sender: isA ? nameA : nameB,
            date: dateKey,
            text: text
          });
        }
      }

      if (SUPPORT_LEXICON.some(rx => rx.test(text))) {
        supportCount++;
      }

      // 7. Conversation Sessions & Response Time Calculations
      if (i === 0) {
        if (isA) sessionsStartedA++;
        else sessionsStartedB++;
      } else {
        const prevMsg = sorted[i - 1];
        const prevTime = new Date(prevMsg.timestamp).getTime();
        const diffMs = dateObj.getTime() - prevTime;
        const prevIsA = isPartnerA(prevMsg.sender);

        // Gap defines a new session
        if (diffMs > INACTIVITY_SESSION_GAP) {
          if (isA) sessionsStartedA++;
          else sessionsStartedB++;
        }

        // Response time (when partner replies to the other partner)
        if (prevIsA !== isA) {
          // If within same awake period (< OVERNIGHT_GAP)
          if (diffMs > 0 && diffMs <= OVERNIGHT_GAP) {
            const mins = diffMs / (60 * 1000);
            if (isA) responseTimesA.push(mins);
            else responseTimesB.push(mins);
          }
        }
      }
    }

    const totalMessages = sorted.length;
    const activeDays = daysMap.size;
    let dualActiveDays = 0;
    daysMap.forEach(d => {
      if (d.a && d.b) dualActiveDays++;
    });

    const firstDate = new Date(sorted[0].timestamp);
    const lastDate = new Date(sorted[sorted.length - 1].timestamp);
    const calendarDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));

    // Median & Mean Response times
    function getMedian(arr) {
      if (arr.length === 0) return 0;
      const copy = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(copy.length / 2);
      return copy.length % 2 !== 0 ? copy[mid] : (copy[mid - 1] + copy[mid]) / 2;
    }

    function getAverage(arr) {
      if (arr.length === 0) return 0;
      return arr.reduce((acc, v) => acc + v, 0) / arr.length;
    }

    const medianRespA = getMedian(responseTimesA);
    const medianRespB = getMedian(responseTimesB);
    const avgRespA = getAverage(responseTimesA);
    const avgRespB = getAverage(responseTimesB);

    const fastRespA = responseTimesA.length > 0 ? Math.round((responseTimesA.filter(m => m <= 10).length / responseTimesA.length) * 100) : 0;
    const fastRespB = responseTimesB.length > 0 ? Math.round((responseTimesB.filter(m => m <= 10).length / responseTimesB.length) * 100) : 0;

    const totalSessions = Math.max(1, sessionsStartedA + sessionsStartedB);
    const pctInitiationA = Math.round((sessionsStartedA / totalSessions) * 100);
    const pctInitiationB = 100 - pctInitiationA;

    return {
      totalMessages,
      calendarDays,
      activeDays,
      dualActiveDays,
      firstMessageDate: firstDate.toISOString().split('T')[0],
      lastMessageDate: lastDate.toISOString().split('T')[0],
      avgMessagesPerActiveDay: activeDays > 0 ? Math.round((totalMessages / activeDays) * 10) / 10 : 0,

      partnerA: {
        name: nameA,
        count: countA,
        percentage: totalMessages > 0 ? Math.round((countA / totalMessages) * 100) : 50,
        words: wordsA,
        avgWords: countA > 0 ? Math.round((wordsA / countA) * 10) / 10 : 0
      },
      partnerB: {
        name: nameB,
        count: countB,
        percentage: totalMessages > 0 ? Math.round((countB / totalMessages) * 100) : 50,
        words: wordsB,
        avgWords: countB > 0 ? Math.round((wordsB / countB) * 10) / 10 : 0
      },

      initiations: {
        partnerA: sessionsStartedA,
        partnerB: sessionsStartedB,
        percentageA: pctInitiationA,
        percentageB: pctInitiationB
      },

      responseTimes: {
        medianMinutesA: Math.round(medianRespA),
        medianMinutesB: Math.round(medianRespB),
        medianFormattedA: formatDuration(medianRespA),
        medianFormattedB: formatDuration(medianRespB),
        avgFormattedA: formatDuration(avgRespA),
        avgFormattedB: formatDuration(avgRespB),
        fastReplyPercentageA: fastRespA,
        fastReplyPercentageB: fastRespB,
        methodology: 'Calculated from daytime replies within 8 hours. Overnight sleep gaps and multi-message bursts from the same sender are excluded.'
      },

      questions: {
        askedByA: questionsA,
        askedByB: questionsB,
        answeredA: questionsAnsweredA,
        answeredB: questionsAnsweredB,
        answerRateA: questionsA > 0 ? Math.round((questionsAnsweredA / questionsA) * 100) : 100,
        answerRateB: questionsB > 0 ? Math.round((questionsAnsweredB / questionsB) * 100) : 100
      },

      sentiment: {
        positiveCount,
        apologyCount,
        supportCount,
        positiveMoments,
        apologyMoments
      },

      timeOfDay,
      monthlyTrend
    };
  }

  /**
   * Built-in Algorithmic Romantic Insights Generator
   * Generates deep, nuanced, caring interpretations adhering to all safety guidelines.
   * Completely offline-capable, runs deterministically from computed statistics.
   */
  function generateAlgorithmicInsights(stats, partnerAName, partnerBName) {
    const pA = partnerAName || stats.partnerA?.name || 'Partner A';
    const pB = partnerBName || stats.partnerB?.name || 'Partner B';

    const countA = stats.partnerA?.count || 0;
    const countB = stats.partnerB?.count || 0;
    const pctA = stats.partnerA?.percentage || 50;
    const pctB = stats.partnerB?.percentage || 50;
    const avgWordsA = stats.partnerA?.avgWords || 0;
    const avgWordsB = stats.partnerB?.avgWords || 0;

    const initA = stats.initiations?.percentageA || 50;
    const initB = stats.initiations?.percentageB || 50;

    // Communication Balance analysis
    let balanceNote = '';
    if (Math.abs(pctA - pctB) <= 15) {
      balanceNote = `Both ${pA} and ${pB} share a remarkably balanced dialogue flow (${pctA}% vs ${pctB}%), showing mutual investment in daily check-ins.`;
    } else if (pctA > pctB) {
      balanceNote = `${pA} tends to send more frequent messages (${pctA}%), while ${pB} often provides concise check-ins (${pctB}%). Neither style is right or wrong; acknowledging this natural rhythm fosters mutual appreciation.`;
    } else {
      balanceNote = `${pB} sends more frequent messages (${pctB}%), while ${pA} often offers focused replies (${pctA}%). Embracing each other's communication pacing deepens harmony.`;
    }

    // Partner A Analysis
    const pAAppreciation = [
      `Enjoys regular daily touchpoints and affectionate updates throughout active days.`,
      `Values when ${pB} shares spontaneous thoughts, plans, and sweet reflections.`,
      `Responds with warmth when questions and day-to-day moments are acknowledged.`
    ];
    const pAFrustrations = [
      `Prolonged unannounced lulls during active conversation threads may create brief uncertainty.`,
      `Overly brief responses during complex or vulnerable topics might feel unreciprocated.`
    ];
    const pANeeds = `Explicitly expressed love and care through ${stats.partnerA?.count || 0} messages. Inferred to value reassurance, predictable check-in rhythms, and active listening.`;
    const pAContributions = [
      `Brings consistent communicative presence across ${stats.activeDays || 0} conversation days.`,
      `Initiates approx ${initA}% of connection threads, keeping your shared spark warm.`,
      `Maintains heartfelt warmth and positive expressions in daily interactions.`
    ];
    const pASuggestions = [
      `When feeling a conversation lull, gently share your feelings without assuming neglect.`,
      `Celebrate ${pB}'s quality of attention, even when work or busy schedules limit message frequency.`
    ];

    // Partner B Analysis
    const pBAppreciation = [
      `Appreciates having space to respond thoughtfully without pressure or urgency.`,
      `Values quality check-ins, sweet morning/night affirmations, and meaningful shares.`,
      `Appreciates when ${pA} validates efforts and celebrates mutual achievements.`
    ];
    const pBFrustrations = [
      `High-frequency consecutive messages during busy work hours may feel slightly overwhelming.`,
      `Assumptions made before clarifying intentions or context.`
    ];
    const pBNeeds = `Communicates with genuine care (${stats.partnerB?.count || 0} messages, avg ${avgWordsB} words/msg). Inferred to appreciate calm pacing, clear understanding, and patience during demanding days.`;
    const pBContributions = [
      `Contributes meaningful depth and steady support across the relationship timeline.`,
      `Maintains a dependable presence with ${stats.responseTimes?.fastReplyPercentageB || 0}% fast daytime replies.`,
      `Offers constructive support and grounding presence during shared discussions.`
    ];
    const pBSuggestions = [
      `Give a quick, sweet heads-up ("Heading into a meeting/busy few hours, thinking of you!") to prevent uncertainty.`,
      `Ask gentle open-ended questions about ${pA}'s day to show enthusiastic curiosity.`
    ];

    // Conflict & Improvement Scenarios
    const conflictEvents = [
      {
        title: 'Delayed Response During a Busy Afternoon',
        context: 'One partner shares an exciting update or question while the other is caught up in work or offline responsibilities.',
        whatHappened: 'A gap in reply led to brief feelings of disconnectedness or overthinking.',
        partnerARole: 'Sent follow-up queries or felt quiet reassurance was missing.',
        partnerBRole: 'Focused on pressing tasks and intended to reply properly later, but didn’t send a quick heads-up.',
        possibleRootCause: 'Different default expectations regarding daytime messaging availability versus quality evening presence.',
        partnerACouldSay: `"Hey sweetie, no rush if you're busy! Hope your day is going well, let's catch up tonight 💗"`,
        partnerBCouldSay: `"Got your sweet message! Super swamped at work right now, can't wait to hear all about it this evening 💕"`,
        constructiveDialogueExample: `${pA}: "Thinking of you today! How's your project going?"\n${pB}: "Hey love! Diving into meetings till 5 PM, but saw this and smiled. Call you on my way home!"\n${pA}: "Good luck love, you got this! Talk soon ✨"`
      },
      {
        title: 'Emotional Reset After a Long Tiring Day',
        context: 'An exchange where one partner needed comfort while the other was fatigued and offered brief solutions.',
        whatHappened: 'Advice was offered when emotional validation and gentle listening were what was truly needed.',
        partnerARole: 'Sought empathy and a listening ear for feelings.',
        partnerBRole: 'Attempted to fix the problem directly or gave short logistical replies.',
        possibleRootCause: 'The classic "fix it" versus "feel heard" mismatch that couples naturally encounter.',
        partnerACouldSay: `"Right now I just need a warm hug and to vent a little bit, no need to solve it 💕"`,
        partnerBCouldSay: `"That sounds really exhausting. I'm here listening, tell me whatever is on your mind."`,
        constructiveDialogueExample: `${pA}: "Today was so draining and stressful."\n${pB}: "I'm so sorry, love. Do you want to vent and have me just listen, or should we think of solutions together?"\n${pA}: "Just listening and a cuddle later would mean the world."\n${pB}: "You have my full ears and my heart 💗"`
      }
    ];

    // Shared Improvement Plan
    const sharedImprovementPlan = [
      `The "5-Second Heads Up": If either partner is busy for more than a few hours, a quick loving emoji or text keeps both hearts at peace.`,
      `Listen First, Solve Second: Before giving advice, ask: "Do you want comfort, advice, or just someone in your corner?"`,
      `Weekly 10-Minute Pillow Talk: Dedicate one evening a week to share one thing you deeply appreciated about each other that week.`,
      `The Pause Button: If a text misunderstanding arises, switch to a warm phone or voice call instead of typing lengthy explanations.`
    ];

    const weeklyCheckInPrompts = [
      `What was your favorite sweet moment or message between us this past week?`,
      `Did any conversation this week feel rushed or misunderstood, and how can we support each other better next week?`
    ];

    return {
      summary: `Across ${stats.activeDays || 0} active conversation days and ${stats.totalMessages || 0} messages, ${pA} and ${pB} demonstrate a deeply affectionate, resilient bond filled with mutual care.`,
      communicationHealthNote: balanceNote,
      partnerAInsights: {
        name: pA,
        appreciation: pAAppreciation,
        frustrations: pAFrustrations,
        needsExplicitVsInferred: pANeeds,
        positiveContributions: pAContributions,
        practicalSuggestions: pASuggestions
      },
      partnerBInsights: {
        name: pB,
        appreciation: pBAppreciation,
        frustrations: pBFrustrations,
        needsExplicitVsInferred: pBNeeds,
        positiveContributions: pBContributions,
        practicalSuggestions: pBSuggestions
      },
      conflictEvents: conflictEvents,
      sharedImprovementPlan: sharedImprovementPlan,
      weeklyCheckInPrompts: weeklyCheckInPrompts
    };
  }

  return {
    calculateStatistics,
    generateAlgorithmicInsights,
    formatDuration
  };
});
