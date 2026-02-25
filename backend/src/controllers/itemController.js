const db = require('../config/db');
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

/**
 * List items with basic filtering
 * GET /api/v1/items?type=receipt&status=draft
 */
const getItems = async (req, res) => {
  const { type, status, client_id, limit = 50, offset = 0 } = req.query;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  
  let queryText = `
    SELECT ci.*, ca.file_path as attachment_path 
    FROM capture_items ci
    LEFT JOIN capture_item_attachments ca ON ci.id = ca.item_id
    WHERE ci.status != $1 AND ci.user_id = $2 AND ci.deleted_at IS NULL
  `;
  let params = ['archived', userId];
  let count = 3;

  if (type) {
    queryText += ` AND type = $${count++}`;
    params.push(type);
  }

  if (status) {
    queryText += ` AND status = $${count++}`;
    params.push(status);
  }

  if (client_id) {
    queryText += ` AND client_id = $${count++}`;
    params.push(client_id);
  }

  queryText += ` ORDER BY created_at DESC LIMIT $${count++} OFFSET $${count++}`;
  params.push(limit, offset);

  try {
    const result = await db.query(queryText, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('[ItemController] Error in getItems:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

/**
 * Get single item by ID
 * GET /api/v1/items/:id
 */
const getItemById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  try {
    const result = await db.query(
      'SELECT * FROM capture_items WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL', 
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or access denied' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('[ItemController] Error in getItemById:', err);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

/**
 * Calculate VAT and gross/net amounts
 */
const calculateVATDetails = (item) => {
  let { type, amount, net_amount, vat_amount, gross_amount, vat_rate, created_at } = item;
  
  // Default values
  const rate = parseFloat(vat_rate) || 20; // 20% default
  const date = created_at ? new Date(created_at) : new Date();
  
  // Quarter reference
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const quarter = Math.ceil(month / 3);
  item.quarter_ref = `Q${quarter}-${year}`;

  // VAT type (Input for receipts/expenses, Output for invoices/income)
  const outputTypes = ['invoice', 'quote', 'payment'];
  item.vat_type = outputTypes.includes(type) ? 'Output' : 'Input';

  // Calculations
  if (amount) {
    // If only total 'amount' is provided, treat it as gross
    item.gross_amount = parseFloat(amount);
    item.net_amount = item.gross_amount / (1 + (rate / 100));
    item.vat_amount = item.gross_amount - item.net_amount;
  } else if (net_amount) {
    item.net_amount = parseFloat(net_amount);
    item.vat_amount = item.net_amount * (rate / 100);
    item.gross_amount = item.net_amount + item.vat_amount;
  }

  // Rounding
  if (item.net_amount) item.net_amount = Math.round(item.net_amount * 100) / 100;
  if (item.vat_amount) item.vat_amount = Math.round(item.vat_amount * 100) / 100;
  if (item.gross_amount) item.gross_amount = Math.round(item.gross_amount * 100) / 100;

  return item;
};

/**
 * Internal logic for creating an item (re-usable by other controllers like Voice)
 */
const createItemInternal = async (itemData) => {
  let { 
    type, status, amount, currency, tax_flag, vat_amount, 
    due_date, client_id, job_id, extracted_text, raw_note, 
    device_id, labels, voice_command_source_text, voice_action_confidence,
    client_name, net_amount, vat_rate, user_id
  } = itemData;

  const userId = user_id || '00000000-0000-0000-0000-000000000000';

  // Perform financial calculations
  const details = calculateVATDetails({ 
    type, amount, net_amount, vat_amount, vat_rate 
  });

  const cleanUUID = (uuid) => (uuid && uuid.trim() !== '' ? uuid : null);

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    let resolvedClientId = cleanUUID(client_id);

    // Auto-Lookup/Create Client if client_name is provided and no client_id
    if (!resolvedClientId && client_name) {
      const findClient = await client.query(
        'SELECT id FROM clients WHERE name ILIKE $1 AND user_id = $2', 
        [client_name, userId]
      );
      if (findClient.rows.length > 0) {
        resolvedClientId = findClient.rows[0].id;
      } else {
        const createClient = await client.query(
          'INSERT INTO clients (name, user_id) VALUES ($1, $2) RETURNING id', 
          [client_name, userId]
        );
        resolvedClientId = createClient.rows[0].id;
        console.log(`[ItemController] Created new client: ${client_name} (${resolvedClientId})`);
      }
    }

    const insertQuery = `
      INSERT INTO capture_items (
        type, status, amount, currency, tax_flag, vat_amount, 
        due_date, client_id, job_id, extracted_text, raw_note, device_id,
        voice_command_source_text, voice_action_confidence,
        net_amount, gross_amount, vat_rate, vat_type, quarter_ref, user_id,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;
    const insertValues = [
      type, status || 'draft', details.gross_amount || amount, currency || 'GBP', tax_flag || false, 
      details.vat_amount || vat_amount,
      due_date, resolvedClientId, cleanUUID(job_id), extracted_text, raw_note, device_id,
      voice_command_source_text, voice_action_confidence,
      details.net_amount, details.gross_amount, details.vat_rate || 20,
      details.vat_type, details.quarter_ref, userId,
      type === 'invoice' ? (itemData.payment_status || 'draft') : null
    ];
    const itemResult = await client.query(insertQuery, insertValues);
    const newItem = itemResult.rows[0];

    // Create Audit Event
    const auditQuery = `
      INSERT INTO audit_events (action_type, entity_name, entity_id, user_id, device_id, diff_log)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const auditValues = [
      'create', 'capture_items', newItem.id, userId, device_id, 
      JSON.stringify({ new: newItem })
    ];
    await client.query(auditQuery, auditValues);

    // Handle labels if provided
    if (labels && Array.isArray(labels)) {
      for (const label of labels) {
        await client.query(
          'INSERT INTO capture_item_labels (item_id, label_name) VALUES ($1, $2)',
          [newItem.id, label]
        );
      }
      newItem.labels = labels;
    }

    await client.query('COMMIT');
    return newItem;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Create a new capture item
 * POST /api/v1/items
 */
const createItem = async (req, res) => {
  const { type, device_id } = req.body;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  if (!type || !device_id) {
    return res.status(400).json({ error: 'Missing required fields: type, device_id' });
  }

  try {
    const newItem = await createItemInternal({ ...req.body, user_id: userId });
    res.status(201).json(newItem);
  } catch (err) {
    console.error('[ItemController] Error in createItem:', err);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

/**
 * Update capture item (labels, status, link)
 * PATCH /api/v1/items/:id
 */
const updateItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  const updates = req.body;
  const { labels, ...directFields } = updates;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // Update direct fields on capture_items
    if (Object.keys(directFields).length > 0) {
      const setClause = Object.keys(directFields).map((key, i) => `${key} = $${i + 3}`).join(', ');
      const updateValues = [id, userId, ...Object.values(directFields)];
      await client.query(
        `UPDATE capture_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2`, 
        updateValues
      );
    }

    // Update labels if provided (REPLACE strategy)
    if (labels && Array.isArray(labels)) {
      // First verify ownership
      const checkRes = await client.query('SELECT id FROM capture_items WHERE id = $1 AND user_id = $2', [id, userId]);
      if (checkRes.rows.length === 0) throw new Error('Item not found or access denied');

      await client.query('DELETE FROM capture_item_labels WHERE item_id = $1', [id]);
      for (const label of labels) {
        await client.query(
          'INSERT INTO capture_item_labels (item_id, label_name) VALUES ($1, $2)',
          [id, label]
        );
      }
    }

    await client.query('COMMIT');
    
    // Fetch and return the updated item
    const finalResult = await client.query('SELECT * FROM capture_items WHERE id = $1 AND user_id = $2', [id, userId]);
    res.status(200).json(finalResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ItemController] Error in updateItem:', err);
    res.status(500).json({ error: 'Failed to update item' });
  } finally {
    client.release();
  }
};

/**
 * Archive item (Soft Delete)
 * DELETE /api/v1/items/:id
 */
const archiveItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  try {
    const result = await db.query(
      "UPDATE capture_items SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found or access denied' });
    }
    res.status(200).json({ message: 'Item deleted successfully', id: result.rows[0].id });
  } catch (err) {
    console.error('[ItemController] Error in archiveItem:', err);
    res.status(500).json({ error: 'Failed to archive item' });
  }
};

/**
 * Get a summary of items captured today
 * (Used for voice summary)
 */
const getDailySummary = async (device_id) => {
  const query = `
    SELECT 
      type, 
      COUNT(*) as count, 
      SUM(COALESCE(amount, 0)) as total
    FROM capture_items 
    WHERE device_id = $1 
    AND created_at >= CURRENT_DATE
    AND status != 'archived'
    AND deleted_at IS NULL
    GROUP BY type
  `;
  const result = await db.query(query, [device_id]);
  return result.rows;
};

/**
 * Handle image upload and create capture_item + attachment
 * POST /api/v1/items/upload
 */
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const { device_id = 'unknown' } = req.body;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'bizpa-uploads';

  try {
    const itemData = {
      type: 'image',
      status: 'draft',
      raw_note: `Uploaded image: ${req.file.originalname}`,
      device_id: device_id,
      user_id: userId
    };

    const newItem = await createItemInternal(itemData);

    // Upload to Supabase Storage
    const fileContent = fs.readFileSync(req.file.path);
    const fileName = `${userId}/${newItem.id}-${req.file.originalname}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileContent, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('[Supabase Storage] Upload Error:', uploadError);
      // Fallback: use local path if cloud fails
    }

    const finalPath = uploadData?.path ? uploadData.path : req.file.path;
    const isCloud = !!uploadData?.path;

    // Add attachment
    const attachmentQuery = `
      INSERT INTO capture_item_attachments (item_id, kind, file_path, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const attachmentValues = [
      newItem.id, 
      'image', 
      finalPath, 
      JSON.stringify({ 
        originalName: req.file.originalname, 
        size: req.file.size,
        storage: isCloud ? 'supabase' : 'local',
        bucket: bucketName
      })
    ];
    await db.query(attachmentQuery, attachmentValues);

    // Cleanup local file if successfully uploaded to cloud
    if (isCloud) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.warn('[Storage] Failed to cleanup local file:', req.file.path);
      }
    }

    res.status(201).json({ ...newItem, attachment_path: finalPath, storage: isCloud ? 'supabase' : 'local' });
  } catch (err) {
    console.error('[ItemController] Error in uploadImage:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

/**
 * Convert Quote to Invoice
 * POST /api/v1/items/:id/convert
 */
const convertQuoteToInvoice = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch the quote
    const quoteRes = await client.query(
      'SELECT * FROM capture_items WHERE id = $1 AND user_id = $2 AND type = $3 AND deleted_at IS NULL',
      [id, userId, 'quote']
    );

    if (quoteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found or already converted' });
    }

    const quote = quoteRes.rows[0];

    // 2. Create the invoice based on quote details
    const invoiceQuery = `
      INSERT INTO capture_items (
        type, status, amount, currency, tax_flag, vat_amount, 
        due_date, client_id, job_id, extracted_text, raw_note, device_id,
        user_id, net_amount, gross_amount, vat_rate, vat_type, quarter_ref,
        converted_from_id, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `;
    
    // Set due date to 30 days from now by default if not set
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoiceValues = [
      'invoice', 'confirmed', quote.amount, quote.currency, quote.tax_flag, quote.vat_amount,
      dueDate.toISOString().split('T')[0], quote.client_id, quote.job_id, 
      `Converted from Quote ${quote.reference_number}: ${quote.extracted_text}`, 
      quote.raw_note, quote.device_id, userId, quote.net_amount, quote.gross_amount, 
      quote.vat_rate, 'Output', quote.quarter_ref, quote.id, 'sent'
    ];

    const invoiceRes = await client.query(invoiceQuery, invoiceValues);
    const invoice = invoiceRes.rows[0];

    // 3. Update the quote status to confirmed/archived or similar
    await client.query(
      "UPDATE capture_items SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [quote.id]
    );

    await client.query('COMMIT');
    res.status(201).json(invoice);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ItemController] Error in convertQuoteToInvoice:', err);
    res.status(500).json({ error: 'Failed to convert quote' });
  } finally {
    client.release();
  }
};

/**
 * Trigger overdue status update
 * GET /api/v1/items/maintenance/check-overdue
 */
const checkOverdueItems = async (req, res) => {
  try {
    const count = await db.query('SELECT update_overdue_statuses() as count');
    res.status(200).json({ updated_count: count.rows[0].count });
  } catch (err) {
    console.error('[ItemController] Error in checkOverdueItems:', err);
    res.status(500).json({ error: 'Failed to update overdue statuses' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  createItemInternal,
  getDailySummary,
  updateItem,
  archiveItem,
  uploadImage,
  convertQuoteToInvoice,
  checkOverdueItems
};
