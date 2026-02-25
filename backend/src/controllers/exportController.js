const db = require('../config/db');

/**
 * Generate Structured CSV Export
 * GET /api/v1/export?format=xero&start=2026-01-01&end=2026-03-31
 */
const exportTransactions = async (req, res) => {
  const { format = 'generic', start, end, quarter_ref } = req.query;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  try {
    let queryText = `
      SELECT ci.*, c.name as client_name 
      FROM capture_items ci
      LEFT JOIN clients c ON ci.client_id = c.id
      WHERE ci.user_id = $1 AND ci.deleted_at IS NULL
    `;
    let params = [userId];
    let count = 2;

    if (start) {
      queryText += ` AND ci.created_at >= $${count++}`;
      params.push(start);
    }
    if (end) {
      queryText += ` AND ci.created_at <= $${count++}`;
      params.push(end);
    }
    if (quarter_ref) {
      queryText += ` AND ci.quarter_ref = $${count++}`;
      params.push(quarter_ref);
    }

    queryText += ` ORDER BY ci.created_at ASC`;

    const result = await db.query(queryText, params);
    const transactions = result.rows;

    let csvContent = '';
    let filename = `export_${format}_${new Date().toISOString().split('T')[0]}.csv`;

    if (format === 'xero') {
      csvContent = 'Date,Amount,Payee,Description,Reference,Check Number\n';
      transactions.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('en-GB');
        const amount = (t.vat_type === 'Input' ? -t.gross_amount : t.gross_amount);
        const payee = t.client_name || 'Misc';
        const desc = t.extracted_text || t.raw_note || '';
        const ref = t.reference_number || '';
        csvContent += `"${date}","${amount}","${payee}","${desc}","${ref}",""\n`;
      });
    } else if (format === 'quickbooks') {
      csvContent = 'Date,Description,Amount\n';
      transactions.forEach(t => {
        const date = new Date(t.created_at).toLocaleDateString('en-US');
        const amount = (t.vat_type === 'Input' ? -t.gross_amount : t.gross_amount);
        const desc = `${t.type.toUpperCase()}: ${t.client_name || ''} ${t.reference_number || ''}`;
        csvContent += `"${date}","${desc}","${amount}"\n`;
      });
    } else {
      // Generic
      csvContent = 'ID,Date,Type,Status,Reference,Client,Net,VAT,Gross,Currency,Labels,Note\n';
      transactions.forEach(t => {
        const date = new Date(t.created_at).toISOString();
        csvContent += `"${t.id}","${date}","${t.type}","${t.status}","${t.reference_number || ''}","${t.client_name || ''}","${t.net_amount}","${t.vat_amount}","${t.gross_amount}","${t.currency}","","${t.raw_note || ''}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.status(200).send(csvContent);

  } catch (err) {
    console.error('[ExportController] Export Error:', err);
    res.status(500).json({ error: 'Failed to generate export' });
  }
};

const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

/**
 * Generate VAT Pack (ZIP containing CSV + Attachments)
 * GET /api/v1/export/vat-pack?quarter_ref=Q1-2026
 */
const exportVATPack = async (req, res) => {
  const { quarter_ref } = req.query;
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

  if (!quarter_ref) {
    return res.status(400).json({ error: 'Missing quarter_ref' });
  }

  try {
    const queryText = `
      SELECT ci.*, c.name as client_name, ca.file_path as attachment_path 
      FROM capture_items ci
      LEFT JOIN clients c ON ci.client_id = c.id
      LEFT JOIN capture_item_attachments ca ON ci.id = ca.item_id
      WHERE ci.user_id = $1 AND ci.quarter_ref = $2 AND ci.deleted_at IS NULL
      ORDER BY ci.created_at ASC
    `;
    const result = await db.query(queryText, [userId, quarter_ref]);
    const transactions = result.rows;

    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `VAT_Pack_${quarter_ref}_${new Date().toISOString().split('T')[0]}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    archive.pipe(res);

    // 1. Add CSV
    let csvContent = 'Date,Type,Status,Reference,Client,Net,VAT,Gross,Attachment\n';
    transactions.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString('en-GB');
      const attachmentName = t.attachment_path ? path.basename(t.attachment_path) : '';
      csvContent += `"${date}","${t.type}","${t.status}","${t.reference_number || ''}","${t.client_name || ''}","${t.net_amount}","${t.vat_amount}","${t.gross_amount}","${attachmentName}"\n`;
      
      // 2. Add Attachment file if exists
      if (t.attachment_path && fs.existsSync(t.attachment_path)) {
        archive.file(t.attachment_path, { name: `attachments/${attachmentName}` });
      }
    });

    archive.append(csvContent, { name: 'transactions.csv' });
    await archive.finalize();

  } catch (err) {
    console.error('[ExportController] VAT Pack Error:', err);
    res.status(500).json({ error: 'Failed to generate VAT pack' });
  }
};

module.exports = {
  exportTransactions,
  exportVATPack
};
