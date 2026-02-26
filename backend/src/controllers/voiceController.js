const db = require('../config/db');
const actionController = require('./actionController');
const searchController = require('./searchController');
const itemController = require('./itemController');

/**
 * Simple Intent Parser and Slot Extractor (NLU Mock)
 * Matches transcripts to core intents and extracts slots using regex.
 */
function parseIntent(transcript) {
  // Normalize text: lowercase, trim, and remove basic punctuation (but KEEP dots for decimals!)
  let text = transcript.toLowerCase().trim();
  
  // Fix common encoding issues (e.g., UTF-8 £ interpreted as CP437/Win1252 ┬ú)
  text = text.replace(/┬ú/g, '£');
  text = text.replace(/[?!,]/g, '');
  
  console.log(`[VoiceController] Normalizing text: "${text}"`);
  
  let intent = 'misc';
  let slots = {};
  let confidence = 0.5;

  // 1. Intent Detection Keywords
  const bookingKeywords = ['book', 'meeting', 'appointment', 'calendar', 'schedule', 'diary', 'booked', 'meet', 'visit'];
  const receiptKeywords = ['receipt', 'fuel', 'food', 'spend', 'petrol', 'parking', 'materials', 'bought', 'purchase', 'buy', 'cost', 'expense', 'spent'];
  const invoiceKeywords = ['invoice', 'bill', 'charge', 'invoiced', 'billing'];
  const quoteKeywords = ['quote', 'estimate', 'quoted', 'pro forma', 'proposal'];
  const paymentKeywords = ['payment', 'paid', 'received', 'income', 'pay', 'transferred', 'settled'];
  const noteKeywords = ['note', 'remind', 'memo', 'reminder', 'remember', 'diary', 'journal'];
  const photoKeywords = ['photo', 'picture', 'camera', 'snap', 'shot'];

  const isQuery = text.includes('show') || text.includes('list') || text.includes('view') || text.includes('find') || text.includes('me') || text.includes('summary');

  // 2. Intent Matching (Prioritize specific actions)
  if (isQuery && receiptKeywords.some(k => text.includes(k))) {
    intent = 'view_expenses';
    confidence = 0.95;
  } else if (isQuery && text.includes('vat')) {
    intent = 'view_vat';
    confidence = 0.95;
  } else if (isQuery && (text.includes('unpaid') || text.includes('outstanding') || text.includes('overdue'))) {
    intent = 'view_unpaid';
    confidence = 0.95;
  } else if (isQuery && (text.includes('quote') || text.includes('estimate') || text.includes('pro forma'))) {
    intent = 'view_quotes';
    confidence = 0.95;
  } else if (isQuery && (text.includes('attention') || text.includes('required') || text.includes('urgent') || text.includes('needs'))) {
    intent = 'view_attention';
    confidence = 0.95;
  } else if (isQuery && (bookingKeywords.some(k => text.includes(k)) || text.includes('schedule') || text.includes('diary'))) {
    intent = 'view_bookings';
    confidence = 0.95;
  } else if (isQuery && (text.includes('interaction') || text.includes('last') || text.includes('contact') || text.includes('activity'))) {
    intent = 'view_interactions';
    confidence = 0.95;
  } else if (bookingKeywords.some(k => text.includes(k))) {
    intent = 'capture_booking';
    confidence = 0.95;
  } else if (invoiceKeywords.some(k => text.includes(k))) {
    intent = 'capture_invoice';
    confidence = 0.95;
  } else if (paymentKeywords.some(k => text.includes(k))) {
    intent = 'capture_payment';
    confidence = 0.95;
  } else if (receiptKeywords.some(k => text.includes(k))) {
    intent = 'capture_receipt';
    confidence = 0.95;
  } else if (quoteKeywords.some(k => text.includes(k))) {
    intent = 'capture_quote';
    confidence = 0.95;
  } else if (noteKeywords.some(k => text.includes(k))) {
    intent = 'create_note';
    confidence = 0.95;
  } else if (photoKeywords.some(k => text.includes(k))) {
    intent = 'capture_photo';
    confidence = 0.95;
  } else if (text.includes('undo') || text.includes('remove last') || text.includes('delete last')) {
    intent = 'undo_last_action';
    confidence = 1.0;
  } else if (text.includes('search') || text.includes('find')) {
    intent = 'search_items';
    confidence = 0.9;
  } else if (text.includes('summarise') || text.includes('summary') || text.includes('total')) {
    intent = 'summarise_today';
    confidence = 0.9;
  } else if (text.includes('repeat')) {
    intent = 'repeat_last';
    confidence = 1.0;
  } else if (text.includes('cancel') || text.includes('stop')) {
    intent = 'cancel_action';
    confidence = 1.0;
  } else if (text.includes('skip')) {
    intent = 'skip_clarification';
    confidence = 1.0;
  }

  console.log(`[VoiceController] Intent matched: ${intent}`);

  // 3. Slot Extraction (Amount)
  // Match if it has a currency symbol, OR is a decimal, OR followed by currency words, OR preceded by 'spent/paid/for'
  const amountMatch = text.match(/(?:£|\$)\s*(\d+(?:\.\d{1,2})?)|(\d+\.\d{2})|(\d+)\s*(?:pounds|gbp|dollars|usd|quid)|(?:\bspent\b|\bpaid\b|\bfor\b)\s+(\d+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    slots.amount = parseFloat(amountMatch[1] || amountMatch[2] || amountMatch[3] || amountMatch[4]);
    console.log(`[VoiceController] Slot extracted: amount=${slots.amount}`);
  }

  // 4. Slot Extraction (Date/Time / Temporal)
  const datePatterns = [
    { pattern: /tomorrow/i, get: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d; } },
    { pattern: /yesterday/i, get: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { pattern: /today/i, get: () => new Date() },
    { pattern: /this\s+week/i, get: () => 'this_week' },
    { pattern: /last\s+week/i, get: () => 'last_week' },
    { pattern: /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i, get: (match) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const target = days.indexOf(match[1].toLowerCase());
        const d = new Date();
        const current = d.getDay();
        let diff = target - current;
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);
        return d;
    }},
    { pattern: /on\s+the\s+(\d{1,2})(?:st|nd|rd|th)?/i, get: (match) => {
        const d = new Date();
        d.setDate(parseInt(match[1]));
        if (d < new Date()) d.setMonth(d.getMonth() + 1);
        return d;
    }}
  ];

  for (const dp of datePatterns) {
    const match = text.match(dp.pattern);
    if (match) {
      const res = dp.get(match);
      if (res instanceof Date) {
        slots.date = res.toISOString().split('T')[0];
      } else {
        slots.time_period = res; // e.g. 'this_week'
      }
      console.log(`[VoiceController] Slot extracted: date/period=${slots.date || slots.time_period}`);
      break;
    }
  }

  // Time Extraction (e.g. 5pm, 17:00)
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] || '00';
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
    
    if (!ampm && hours > 0 && hours < 8) hours += 12;

    slots.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    console.log(`[VoiceController] Slot extracted: time=${slots.time}`);
  }

  // 5. Slot Extraction (Client/Counterparty)
  // Better extraction handling possessives and trailing prepositions
  const clientMatch = text.match(/(?:with|for|at|to|book|call|meet|by|from)\s+([a-zA-Z\s]{2,40}?)(?:\s+(?:on|at|tomorrow|today|yesterday|next|this|last|for\s+\d|£|\$|am|pm|meeting|appointment|booking|receipt|invoice|interactions)|$)/);
  if (clientMatch) {
    let name = clientMatch[1].trim();
    // Handle possessives like "Sarah's"
    name = name.replace(/'s$/i, '');
    
    while (name.match(/\s+(?:with|for|at|on|to|a|an|the|by|from|about)$/i) || name.match(/^(?:with|for|at|on|to|a|an|the|by|from)\s+/i)) {
      name = name.replace(/\s+(?:with|for|at|on|to|a|an|the|by|from|about)$/i, '').trim();
      name = name.replace(/^(?:with|for|at|on|to|a|an|the|by|from)\s+/i, '').trim();
    }
    
    const stopWords = ['fuel', 'materials', 'food', 'parking', 'vat', 'tax', 'receipt', 'invoice', 'meeting', 'appointment', 'booking', 'expenses', 'unpaid', 'quotes', 'attention', 'interactions', 'today', 'yesterday', 'tomorrow'];
    if (!stopWords.includes(name) && name.length > 1) {
      // Capitalize first letter of each word
      name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      slots.client_name = name;
      console.log(`[VoiceController] Slot extracted: client_name=${slots.client_name}`);
    }
  }

  // 6. Slot Extraction (Labels/Keywords)
  const commonLabels = ['fuel', 'materials', 'food', 'parking', 'vat', 'tax', 'before photo', 'after photo', 'urgent'];
  slots.labels = commonLabels.filter(label => text.includes(label));
  if (slots.labels.length > 0) {
    console.log(`[VoiceController] Slots extracted: labels=${slots.labels.join(',')}`);
  }

  // 7. Confidence Penalty System
  const criticalIntents = ['capture_receipt', 'capture_payment', 'capture_invoice', 'capture_quote'];
  if (criticalIntents.includes(intent) && !slots.amount) {
    confidence -= 0.3; // Heavy penalty for missing amount in financial item
    console.log(`[VoiceController] Confidence penalized to ${confidence} due to missing amount`);
  }
  
  if (['capture_booking', 'view_interactions', 'view_attention'].includes(intent) && !slots.client_name) {
    confidence -= 0.2; // Penalty for missing client in contextual command
    console.log(`[VoiceController] Confidence penalized to ${confidence} due to missing client name`);
  }

  console.log(`[VoiceController] Final Parse: intent=${intent}, confidence=${confidence}`);
  return { intent, slots, confidence };
}

/**
 * Voice Processing Endpoint Controller
 */
const processVoice = async (req, res) => {
  const { transcript, device_id } = req.body;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript in request body' });
  }

  console.log(`[VoiceController] Incoming transcript: "${transcript}" from device: ${device_id}`);

  const captureIntents = {
    'capture_receipt': 'receipt',
    'capture_invoice': 'invoice',
    'capture_payment': 'payment',
    'capture_booking': 'booking',
    'capture_quote': 'quote',
    'create_note': 'note',
    'capture_photo': 'image'
  };

  try {
    const text = transcript.toLowerCase();
    let { intent, slots, confidence } = parseIntent(transcript);
    console.log(`[VoiceController] Parsed: intent=${intent}, confidence=${confidence}, slots=${JSON.stringify(slots)}`);

    // Check for pending session state for this device
    const sessionRes = await db.query('SELECT * FROM voice_sessions WHERE device_id = $1', [device_id]);
    const session = sessionRes.rows[0];

    // Handle "Skip"
    if (intent === 'skip_clarification' && session) {
      intent = session.pending_intent;
      slots = session.pending_slots;
      confidence = 0.85;
      await db.query('DELETE FROM voice_sessions WHERE device_id = $1', [device_id]);
    }

    // Handle Clarification Responses
    if (intent === 'misc' && session && Object.keys(slots).length > 0) {
      const mergedSlots = { ...session.pending_slots, ...slots };
      intent = session.pending_intent;
      slots = mergedSlots;
      confidence = 0.9;
      await db.query('DELETE FROM voice_sessions WHERE device_id = $1', [device_id]);
    }

    let actionStatus = 'none';
    let confirmationText = '';
    let actionResultForDB = 'failure';

    if (intent === 'cancel_action') {
      await db.query('DELETE FROM voice_sessions WHERE device_id = $1', [device_id]);
      return res.status(200).json({
        transcript, intent, slots: {}, confidence: 1.0,
        confirmation_text: "Cancelled.", action_status: 'stop'
      });
    }

    if (intent === 'repeat_last') {
      const lastEventRes = await db.query('SELECT confirmation_text FROM voice_events WHERE confirmation_text IS NOT NULL ORDER BY created_at DESC LIMIT 1');
      return res.status(200).json({
        transcript, intent, slots: {}, confidence: 1.0,
        confirmation_text: lastEventRes.rows[0]?.confirmation_text || "Nothing to repeat.",
        action_status: 'execute'
      });
    }

    if (confidence >= 0.8) {
      actionStatus = 'execute';
      actionResultForDB = 'success';
      
      if (intent === 'undo_last_action') return actionController.undoLastAction(req, res);
      if (intent === 'search_items') {
        req.body.query = transcript.replace(/show|search|find|me/gi, '').trim();
        return searchController.searchItems(req, res);
      }

      if (captureIntents[intent]) {
        const itemData = {
          type: captureIntents[intent],
          status: 'confirmed',
          amount: slots.amount,
          raw_note: transcript,
          device_id: device_id,
          labels: slots.labels,
          voice_command_source_text: transcript,
          voice_action_confidence: confidence,
          client_name: slots.client_name,
          user_id: userId,
          payment_status: 'draft'
        };
        
        if (slots.client_name) itemData.extracted_text = `Client: ${slots.client_name}`;

        await itemController.createItemInternal(itemData);
        
        if (intent === 'capture_booking' && slots.date) {
          const eventTitle = slots.client_name ? `Booking with ${slots.client_name}` : `New Booking: ${transcript}`;
          const startTime = slots.time ? `${slots.date}T${slots.time}:00` : slots.date;
          await db.query(
            'INSERT INTO calendar_events (title, description, start_at, end_at, event_type, user_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [eventTitle, transcript, startTime, startTime, 'booking', userId]
          );
        }

        confirmationText = `Saved ${captureIntents[intent]}.`;
        if (slots.amount) confirmationText += ` Amount £${slots.amount.toFixed(2)}.`;
        if (slots.client_name) confirmationText += ` Linked to ${slots.client_name}.`;
        if (slots.time) confirmationText += ` Time set for ${slots.time}.`;
      } 
      else if (intent === 'summarise_today') {
        const summary = await itemController.getDailySummary(device_id);
        if (summary.length === 0) {
          confirmationText = "You haven't captured anything today.";
        } else {
          const parts = summary.map(s => `${s.count} ${s.type}${s.count > 1 ? 's' : ''}`);
          const total = summary.reduce((sum, s) => sum + parseFloat(s.total), 0);
          confirmationText = `Today: ${parts.join(', ')}. Total £${total.toFixed(2)}.`;
        }
      } else {
        confirmationText = "Command recognized.";
      }

    } else if (confidence >= 0.55) {
      actionStatus = 'clarification_needed';
      actionResultForDB = 'clarification_needed';
      await db.query(
        'INSERT INTO voice_sessions (device_id, pending_intent, pending_slots) VALUES ($1, $2, $3) ON CONFLICT (device_id) DO UPDATE SET pending_intent = $2, pending_slots = $3',
        [device_id, intent, JSON.stringify(slots)]
      );
      confirmationText = "I caught that, but I need more detail. Could you repeat or say skip?";
    } else {
      actionStatus = 'retry';
      actionResultForDB = 'failure';
      confirmationText = "Please say that again.";
    }

    await db.query(
      'INSERT INTO voice_events (intent_transcript, intent_name, slot_data, confidence, action_result, confirmation_text) VALUES ($1, $2, $3, $4, $5, $6)',
      [transcript, intent, JSON.stringify(slots), confidence, actionResultForDB, confirmationText]
    );

    res.status(200).json({
      transcript, intent, slots, confidence,
      confirmation_text: confirmationText, action_status: actionStatus
    });
  } catch (err) {
    console.error('[VoiceController] Error:', err);
    res.status(500).json({ error: 'Internal Voice Error' });
  }
};

module.exports = { processVoice };
