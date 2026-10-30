/**
 * chat-parsers.js
 * Comprehensive Multi-Format Chat Importer & Redaction Utility
 * Supports: WhatsApp TXT, WhatsApp ZIP, Instagram JSON, Instagram HTML, CSV/JSON & Gmail Export
 * Part of Our Little Universe 💗 AI Relationship Analyzer
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChatParsers = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {

  // --- Regexes for WhatsApp Date / Time / Sender Headers ---
  // Format 1: [DD/MM/YY, HH:MM:SS AM/PM] Name: or [DD/MM/YYYY, HH:MM:SS] Name:
  const RE_WA_BRACKET = /^\[(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]\s+([^:]+):\s*(.*)$/;
  // Format 2: DD/MM/YY, HH:MM - Name: or MM/DD/YYYY, HH:MM AM/PM - Name:
  const RE_WA_HYPHEN = /^(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\s*[-–—]\s*([^:]+):\s*(.*)$/;

  // System message triggers to filter out
  const SYSTEM_PATTERNS = [
    /Messages and calls are end-to-end encrypted/i,
    /created group/i,
    /added you/i,
    /joined using this group's invite link/i,
    /changed the subject/i,
    /changed this group's icon/i,
    /changed their phone number/i,
    /security code changed/i,
    /This message was deleted/i,
    /You deleted this message/i,
    /Missed voice call/i,
    /Missed video call/i,
    /Waiting for this message/i
  ];

  // Media omission patterns to filter or tag
  const MEDIA_PATTERNS = [
    /<Media omitted>/i,
    /image omitted/i,
    /video omitted/i,
    /audio omitted/i,
    /sticker omitted/i,
    /GIF omitted/i,
    /document omitted/i,
    /Contact card omitted/i,
    /Location:\s*https?:\/\//i
  ];

  function isSystemMessage(text) {
    if (!text) return true;
    return SYSTEM_PATTERNS.some(rx => rx.test(text));
  }

  function isMediaPlaceholder(text) {
    if (!text) return false;
    return MEDIA_PATTERNS.some(rx => rx.test(text.trim()));
  }

  /**
   * Parse a flexible date string (e.g. 15/02/2024 or 02/15/2024 or 2024-02-15) and time
   */
  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return new Date();
    try {
      const cleanDate = dateStr.replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
      const cleanTime = (timeStr || '').replace(/[\u200e\u200f\u202a-\u202e]/g, '').trim();
      
      const parts = cleanDate.split(/[-/. ]/);
      let day, month, year;
      
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10) - 1;
          day = parseInt(parts[2], 10);
        } else {
          const num1 = parseInt(parts[0], 10);
          const num2 = parseInt(parts[1], 10);
          let y = parseInt(parts[2], 10);
          if (y < 100) y += 2000;
          year = y;

          // If first number is > 12, it's definitely DD/MM/YYYY
          if (num1 > 12) {
            day = num1;
            month = num2 - 1;
          } else if (num2 > 12) {
            // Definitely MM/DD/YYYY
            month = num1 - 1;
            day = num2;
          } else {
            // Default to day-first (international standard for WhatsApp)
            day = num1;
            month = num2 - 1;
          }
        }
      }

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (cleanTime) {
        const isPM = /[Pp][Mm]/.test(cleanTime);
        const isAM = /[Aa][Mm]/.test(cleanTime);
        const timeNums = cleanTime.replace(/[APap][Mm]/g, '').trim().split(':');
        
        hours = parseInt(timeNums[0] || '0', 10);
        minutes = parseInt(timeNums[1] || '0', 10);
        seconds = parseInt(timeNums[2] || '0', 10);

        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
      }

      if (year && month !== undefined && day) {
        const d = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(d.getTime())) return d;
      }

      // Fallback native parse
      const direct = new Date(`${dateStr} ${timeStr}`);
      if (!isNaN(direct.getTime())) return direct;
    } catch (e) {
      // Fallback
    }
    return new Date();
  }

  /**
   * 1. WHATSAPP TXT PARSER
   */
  function parseWhatsAppTxt(rawText) {
    if (!rawText || typeof rawText !== 'string') {
      return { success: false, error: 'Empty or invalid text provided.' };
    }

    // Strip invisible Unicode RTL / formatting marks
    const cleanedText = rawText.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
    const lines = cleanedText.split(/\r?\n/);
    const messages = [];
    const participantsSet = new Set();

    let currentMsg = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trimEnd();
      if (!line.trim()) continue;

      let match = line.match(RE_WA_BRACKET);
      if (!match) match = line.match(RE_WA_HYPHEN);

      if (match) {
        // Save previous message if valid
        if (currentMsg && !isSystemMessage(currentMsg.text) && !isMediaPlaceholder(currentMsg.text)) {
          messages.push(currentMsg);
          participantsSet.add(currentMsg.sender);
        }

        const dateStr = match[1].trim();
        const timeStr = match[2].trim();
        const sender = match[3].trim();
        const content = match[4] || '';

        // Check if sender line itself is a WhatsApp system event
        if (isSystemMessage(sender) || isSystemMessage(content)) {
          currentMsg = null;
          continue;
        }

        currentMsg = {
          id: 'wa_' + (messages.length + 1),
          sender: sender,
          timestamp: parseDateTime(dateStr, timeStr),
          text: content.trim(),
          source: 'whatsapp'
        };
      } else {
        // Multi-line continuation of current message
        if (currentMsg) {
          currentMsg.text += '\n' + line;
        }
      }
    }

    // Push the final message
    if (currentMsg && !isSystemMessage(currentMsg.text) && !isMediaPlaceholder(currentMsg.text)) {
      messages.push(currentMsg);
      participantsSet.add(currentMsg.sender);
    }

    if (messages.length === 0) {
      return {
        success: false,
        error: 'No valid messages could be parsed from this WhatsApp export file. Please ensure the file contains exported chat history.'
      };
    }

    return {
      success: true,
      format: 'whatsapp-txt',
      participants: Array.from(participantsSet),
      messages: messages,
      totalCount: messages.length
    };
  }

  /**
   * 2. WHATSAPP ZIP PARSER (Extracts _chat.txt or any .txt from ZIP)
   * Uses browser native DecompressionStream / zlib or uncompressed ZIP entries
   */
  async function parseWhatsAppZip(arrayBuffer) {
    if (!arrayBuffer) {
      return { success: false, error: 'No ZIP file data provided.' };
    }

    try {
      const bytes = new Uint8Array(arrayBuffer);
      const text = await extractTextFromZip(bytes);
      if (!text) {
        return {
          success: false,
          error: 'No readable chat transcript (_chat.txt) found inside the uploaded WhatsApp ZIP file.'
        };
      }
      const parsed = parseWhatsAppTxt(text);
      if (parsed.success) parsed.format = 'whatsapp-zip';
      return parsed;
    } catch (err) {
      return { success: false, error: 'Error reading ZIP archive: ' + err.message };
    }
  }

  /**
   * Lightweight in-memory ZIP reader for client-side chat text extraction
   */
  async function extractTextFromZip(bytes) {
    let offset = 0;
    const len = bytes.length;

    while (offset + 30 <= len) {
      // Signature 0x04034b50 -> 'PK\x03\x04'
      if (bytes[offset] === 0x50 && bytes[offset + 1] === 0x4b && bytes[offset + 2] === 0x03 && bytes[offset + 3] === 0x04) {
        const compMethod = bytes[offset + 8] | (bytes[offset + 9] << 8);
        const compSize = bytes[offset + 18] | (bytes[offset + 19] << 8) | (bytes[offset + 20] << 16) | (bytes[offset + 21] << 24);
        const fileNameLen = bytes[offset + 26] | (bytes[offset + 27] << 8);
        const extraLen = bytes[offset + 28] | (bytes[offset + 29] << 8);

        const fileNameBytes = bytes.slice(offset + 30, offset + 30 + fileNameLen);
        const fileName = new TextDecoder('utf-8').decode(fileNameBytes);

        const dataStart = offset + 30 + fileNameLen + extraLen;
        const dataEnd = dataStart + compSize;

        if (fileName.endsWith('.txt') || fileName === '_chat.txt') {
          const compData = bytes.slice(dataStart, dataEnd);
          if (compMethod === 0) {
            // Uncompressed / Stored
            return new TextDecoder('utf-8').decode(compData);
          } else if (compMethod === 8) {
            // Deflate compression
            // In Node.js environment:
            if (typeof require === 'function') {
              try {
                const zlib = require('zlib');
                const decomp = zlib.inflateRawSync(compData);
                return new TextDecoder('utf-8').decode(decomp);
              } catch (e) {}
            }
            // In modern browser environment:
            if (typeof DecompressionStream !== 'undefined') {
              try {
                const stream = new Response(compData).body.pipeThrough(new DecompressionStream('deflate-raw'));
                return await new Response(stream).text();
              } catch (e) {}
            }
          }
        }
        offset = dataEnd;
      } else {
        offset++;
      }
    }
    return null;
  }

  /**
   * 3. INSTAGRAM JSON PARSER (Instagram Data Download format)
   * Fixes Instagram's Latin-1/UTF-8 mojibake encoding
   */
  function fixInstagramEncoding(str) {
    if (!str) return '';
    try {
      const bytes = new Uint8Array(str.length);
      for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i) & 0xff;
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      return str;
    }
  }

  function parseInstagramJson(jsonData) {
    let data = jsonData;
    if (typeof jsonData === 'string') {
      try {
        data = JSON.parse(jsonData);
      } catch (e) {
        return { success: false, error: 'Invalid JSON format for Instagram export.' };
      }
    }

    if (!data || !Array.isArray(data.messages)) {
      return {
        success: false,
        error: 'Instagram JSON structure missing "messages" list. Ensure this is message_1.json from your Instagram data export.'
      };
    }

    const participantsSet = new Set();
    if (Array.isArray(data.participants)) {
      data.participants.forEach(p => {
        if (p && p.name) participantsSet.add(fixInstagramEncoding(p.name));
      });
    }

    const messages = [];
    // Instagram messages array is in reverse chronological order (newest first)
    const rawList = [...data.messages].reverse();

    for (let i = 0; i < rawList.length; i++) {
      const m = rawList[i];
      const text = fixInstagramEncoding(m.content || '');
      const sender = fixInstagramEncoding(m.sender_name || 'Participant');

      if (!text || isSystemMessage(text)) continue;

      participantsSet.add(sender);
      messages.push({
        id: 'ig_' + (messages.length + 1),
        sender: sender,
        timestamp: new Date(m.timestamp_ms || Date.now()),
        text: text,
        source: 'instagram-json'
      });
    }

    if (messages.length === 0) {
      return { success: false, error: 'No text messages found in Instagram JSON export.' };
    }

    return {
      success: true,
      format: 'instagram-json',
      participants: Array.from(participantsSet),
      messages: messages,
      totalCount: messages.length
    };
  }

  /**
   * 4. INSTAGRAM HTML PARSER
   */
  function parseInstagramHtml(htmlString) {
    if (!htmlString || typeof htmlString !== 'string') {
      return { success: false, error: 'Empty Instagram HTML content.' };
    }

    const messages = [];
    const participantsSet = new Set();

    // Browser DOMParser or Node regex matching
    if (typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        // Match message blocks across Instagram HTML export versions
        const items = doc.querySelectorAll('div._a6-g, div.pam, div._3-96._2let');
        items.forEach((el, idx) => {
          const senderEl = el.querySelector('div._a6-h, h4, div._2lel');
          const textEl = el.querySelector('div._a6-p, p, div._2lem');
          const timeEl = el.querySelector('div._a6-o, div._3-94, div._2len');

          const sender = senderEl ? senderEl.textContent.trim() : '';
          const text = textEl ? textEl.textContent.trim() : '';
          const timeStr = timeEl ? timeEl.textContent.trim() : '';

          if (sender && text && !isSystemMessage(text)) {
            participantsSet.add(sender);
            messages.push({
              id: 'ig_html_' + (idx + 1),
              sender: sender,
              timestamp: timeStr ? new Date(timeStr) : new Date(),
              text: text,
              source: 'instagram-html'
            });
          }
        });
      } catch (e) {}
    }

    // Fallback regex parser for HTML if DOMParser fails or in Node test environment
    if (messages.length === 0) {
      const rx = /<div[^>]*class="[^"]*(?:_a6-h|_2lel)[^"]*"[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class="[^"]*(?:_a6-p|_2lem)[^"]*"[^>]*>([^<]+)<\/div>/gi;
      let match;
      let idx = 0;
      while ((match = rx.exec(htmlString)) !== null) {
        idx++;
        const sender = match[1].trim();
        const text = match[2].trim();
        if (sender && text && !isSystemMessage(text)) {
          participantsSet.add(sender);
          messages.push({
            id: 'ig_html_' + idx,
            sender: sender,
            timestamp: new Date(),
            text: text,
            source: 'instagram-html'
          });
        }
      }
    }

    if (messages.length === 0) {
      return { success: false, error: 'Could not parse messages from Instagram HTML. Try exporting in JSON format for best results.' };
    }

    return {
      success: true,
      format: 'instagram-html',
      participants: Array.from(participantsSet),
      messages: messages,
      totalCount: messages.length
    };
  }

  /**
   * 5. CSV & GENERIC JSON CHAT PARSER
   */
  function parseGenericJson(jsonStr) {
    try {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      const list = Array.isArray(parsed) ? parsed : (parsed.messages || parsed.chat || []);
      if (!Array.isArray(list) || list.length === 0) {
        return { success: false, error: 'JSON does not contain a message array.' };
      }

      const messages = [];
      const participantsSet = new Set();

      list.forEach((m, idx) => {
        const sender = m.sender || m.author || m.user || m.from || 'Participant';
        const text = m.text || m.message || m.content || m.body || '';
        const rawTime = m.timestamp || m.date || m.time || Date.now();

        if (text && !isSystemMessage(text)) {
          participantsSet.add(sender);
          messages.push({
            id: 'json_' + (idx + 1),
            sender: sender,
            timestamp: new Date(rawTime),
            text: text,
            source: 'generic-json'
          });
        }
      });

      return {
        success: true,
        format: 'generic-json',
        participants: Array.from(participantsSet),
        messages: messages,
        totalCount: messages.length
      };
    } catch (e) {
      return { success: false, error: 'Invalid JSON format: ' + e.message };
    }
  }

  function parseCsvChat(csvText) {
    if (!csvText || typeof csvText !== 'string') {
      return { success: false, error: 'Empty CSV content.' };
    }

    const lines = csvText.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return { success: false, error: 'CSV requires at least a header and one message row.' };
    }

    // Parse header to find column indices
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    let dateIdx = header.findIndex(h => h.includes('date') || h.includes('time') || h.includes('timestamp'));
    let senderIdx = header.findIndex(h => h.includes('sender') || h.includes('author') || h.includes('user') || h.includes('from') || h.includes('name'));
    let textIdx = header.findIndex(h => h.includes('message') || h.includes('text') || h.includes('content') || h.includes('body'));

    if (senderIdx === -1 || textIdx === -1) {
      // Default fallback: column 0 = date, 1 = sender, 2 = text
      senderIdx = 1;
      textIdx = 2;
      dateIdx = 0;
    }

    const messages = [];
    const participantsSet = new Set();

    for (let i = 1; i < lines.length; i++) {
      // Simple CSV quote-aware splitter
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanRow = row.map(c => c.trim().replace(/^["']|["']$/g, ''));

      const sender = cleanRow[senderIdx] || 'Participant';
      const text = cleanRow[textIdx] || '';
      const timeVal = dateIdx !== -1 ? cleanRow[dateIdx] : new Date();

      if (text && !isSystemMessage(text)) {
        participantsSet.add(sender);
        messages.push({
          id: 'csv_' + i,
          sender: sender,
          timestamp: new Date(timeVal),
          text: text,
          source: 'csv'
        });
      }
    }

    return {
      success: true,
      format: 'csv',
      participants: Array.from(participantsSet),
      messages: messages,
      totalCount: messages.length
    };
  }

  /**
   * 6. GMAIL / EMAIL CONVERSATION PARSER
   * Extracts 'From: ...', 'Date: ...', and message body
   */
  function parseGmailExport(emailText) {
    if (!emailText || typeof emailText !== 'string') {
      return { success: false, error: 'Empty email text.' };
    }

    const blocks = emailText.split(/(?=From:\s*)/i);
    const messages = [];
    const participantsSet = new Set();

    blocks.forEach((block, idx) => {
      const fromMatch = block.match(/From:\s*([^<\r\n]+)(?:<([^>]+)>)?/i);
      const dateMatch = block.match(/Date:\s*([^\r\n]+)/i);

      if (fromMatch) {
        const sender = fromMatch[1].trim() || 'Email Sender';
        const dateStr = dateMatch ? dateMatch[1].trim() : '';
        
        // Strip header block lines to get message body
        const bodyLines = block.split(/\r?\n/).filter(line => {
          return !/^(From|To|Date|Subject|Cc|Bcc|Reply-To|Message-ID):/i.test(line);
        });
        const text = bodyLines.join('\n').trim();

        if (text) {
          participantsSet.add(sender);
          messages.push({
            id: 'email_' + (idx + 1),
            sender: sender,
            timestamp: dateStr ? new Date(dateStr) : new Date(),
            text: text,
            source: 'gmail'
          });
        }
      }
    });

    if (messages.length === 0) {
      return { success: false, error: 'Could not extract email messages. Ensure text contains standard "From:" and "Date:" headers.' };
    }

    return {
      success: true,
      format: 'gmail',
      participants: Array.from(participantsSet),
      messages: messages,
      totalCount: messages.length
    };
  }

  /**
   * 7. CLIENT-SIDE PRIVACY REDACTION UTILITY
   */
  function redactText(text, options = {}) {
    if (!text || typeof text !== 'string') return text;
    let result = text;

    // Phone numbers: +1 234 567 8900 or 10-digit numbers
    if (options.redactPhone !== false) {
      result = result.replace(/(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, '[PHONE REDACTED]');
    }

    // Email addresses
    if (options.redactEmail !== false) {
      result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REDACTED]');
    }

    // URLs & Links
    if (options.redactUrls) {
      result = result.replace(/https?:\/\/[^\s]+/g, '[LINK REDACTED]');
    }

    // Custom Sensitive Keywords
    if (Array.isArray(options.customTerms)) {
      options.customTerms.forEach(term => {
        if (term && term.trim()) {
          const escaped = term.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          result = result.replace(new RegExp(escaped, 'gi'), '[REDACTED]');
        }
      });
    }

    return result;
  }

  function redactMessages(messages, options = {}) {
    if (!Array.isArray(messages)) return [];
    return messages.map(m => ({
      ...m,
      text: redactText(m.text, options)
    }));
  }

  return {
    parseWhatsAppTxt,
    parseWhatsAppZip,
    parseInstagramJson,
    parseInstagramHtml,
    parseGenericJson,
    parseCsvChat,
    parseGmailExport,
    redactText,
    redactMessages,
    isSystemMessage,
    isMediaPlaceholder
  };
});
