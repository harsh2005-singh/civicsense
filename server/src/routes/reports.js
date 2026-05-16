const router = require('express').Router();
const puppeteer = require('puppeteer');
const Bill = require('../models/Bill');
const Comment = require('../models/Comment');
const { verifyToken } = require('../middleware/auth');

router.get('/export', verifyToken, async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const bill = await Bill.findById(billId).populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    const comments = await Comment.find({ billId, status: 'completed' });

    const stats = { positive: 0, neutral: 0, negative: 0 };
    comments.forEach(c => { if (c.sentimentLabel) stats[c.sentimentLabel]++ });

    const allKeywords = {};
    comments.forEach(c => {
      c.keywords.forEach(kw => {
        allKeywords[kw.word] = (allKeywords[kw.word] || 0) + kw.weight;
      });
    });
    const topKeywords = Object.entries(allKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, weight]) => ({ word, weight }));

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; }
        .header { background: #1e40af; color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin-bottom: 8px; }
        .header p { font-size: 13px; opacity: 0.8; }
        .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
        .section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
        .section h2 { font-size: 16px; color: #1e40af; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
        .stats { display: flex; gap: 16px; }
        .stat-card { flex: 1; text-align: center; padding: 16px; border-radius: 8px; }
        .stat-card.positive { background: #ecfdf5; border: 1px solid #6ee7b7; }
        .stat-card.neutral  { background: #fffbeb; border: 1px solid #fcd34d; }
        .stat-card.negative { background: #fef2f2; border: 1px solid #fca5a5; }
        .stat-card.total    { background: #eff6ff; border: 1px solid #93c5fd; }
        .stat-num { font-size: 32px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
        .summary-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; border-radius: 0 8px 8px 0; font-size: 13px; line-height: 1.7; color: #334155; }
        .keywords { display: flex; flex-wrap: wrap; gap: 8px; }
        .keyword { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .comment-item { border-bottom: 1px solid #e2e8f0; padding: 12px 0; display: flex; gap: 12px; align-items: flex-start; }
        .comment-item:last-child { border-bottom: none; }
        .comment-text { font-size: 13px; color: #334155; flex: 1; line-height: 1.5; }
        .sentiment-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
        .positive-badge { background: #d1fae5; color: #065f46; }
        .neutral-badge  { background: #fef3c7; color: #92400e; }
        .negative-badge { background: #fee2e2; color: #991b1b; }
        .footer { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${bill.title}</h1>
        <p>${bill.description}</p>
        <span class="badge">${bill.billNumber}</span>
        <span class="badge" style="margin-left:8px">${bill.category || 'General'}</span>
        <span class="badge" style="margin-left:8px">Generated: ${new Date().toLocaleDateString()}</span>
      </div>

      <div class="section">
        <h2>Sentiment Overview</h2>
        <div class="stats">
          <div class="stat-card total">
            <div class="stat-num" style="color:#1e40af">${comments.length}</div>
            <div class="stat-label">Total Analyzed</div>
          </div>
          <div class="stat-card positive">
            <div class="stat-num" style="color:#065f46">${stats.positive}</div>
            <div class="stat-label">Positive</div>
          </div>
          <div class="stat-card neutral">
            <div class="stat-num" style="color:#92400e">${stats.neutral}</div>
            <div class="stat-label">Neutral</div>
          </div>
          <div class="stat-card negative">
            <div class="stat-num" style="color:#991b1b">${stats.negative}</div>
            <div class="stat-label">Negative</div>
          </div>
        </div>
      </div>

      ${bill.summary ? `
      <div class="section">
        <h2>AI Executive Summary</h2>
        <div class="summary-box">${bill.summary}</div>
      </div>` : ''}

      ${topKeywords.length > 0 ? `
      <div class="section">
        <h2>Top Keywords</h2>
        <div class="keywords">
          ${topKeywords.map(kw => `<span class="keyword">${kw.word}</span>`).join('')}
        </div>
      </div>` : ''}

      <div class="section">
        <h2>Analyzed Comments (${comments.length})</h2>
        ${comments.slice(0, 20).map(c => `
          <div class="comment-item">
            <span class="sentiment-badge ${c.sentimentLabel}-badge">${c.sentimentLabel}</span>
            <span class="comment-text">${c.text}</span>
          </div>
        `).join('')}
        ${comments.length > 20 ? `<p style="color:#94a3b8;font-size:12px;margin-top:12px">... and ${comments.length - 20} more comments</p>` : ''}
      </div>

      <div class="footer">
        Generated by CivicSense AI · ${new Date().toISOString()}
      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=civicsense-${bill.billNumber}.pdf`);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;