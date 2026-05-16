const router = require('express').Router();
const Comment = require('../models/Comment');
const Bill = require('../models/Bill');
const { verifyToken } = require('../middleware/auth');

// GET /api/analysis/sentiment?billId=X
router.get('/sentiment', verifyToken, async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    const comments = await Comment.find({ billId, status: 'completed' });

    const stats = { positive: 0, neutral: 0, negative: 0 };
    let totalScore = 0;

    comments.forEach((c) => {
      if (c.sentimentLabel) stats[c.sentimentLabel]++;
      if (c.sentimentScore) totalScore += c.sentimentScore;
    });

    res.json({
      billId,
      stats,
      averageScore: comments.length ? (totalScore / comments.length).toFixed(2) : 0,
      totalAnalyzed: comments.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/keywords?billId=X
router.get('/keywords', verifyToken, async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const comments = await Comment.find({ billId, status: 'completed' });

    // aggregate all keywords across comments
    const keywordMap = {};
    comments.forEach((c) => {
      c.keywords.forEach((kw) => {
        if (keywordMap[kw.word]) {
          keywordMap[kw.word].weight += kw.weight;
          keywordMap[kw.word].count++;
        } else {
          keywordMap[kw.word] = {
            word: kw.word,
            weight: kw.weight,
            count: 1,
            entityType: kw.entityType,
          };
        }
      });
    });

    const keywords = Object.values(keywordMap)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 50);

    res.json({ billId, keywords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/summary?billId=X
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    res.json({
      billId,
      summary: bill.summary || 'Summary not yet generated',
      topics: bill.topics || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/export?billId=X — export comments as CSV
router.get('/export', verifyToken, async (req, res) => {
  try {
    const { billId } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const comments = await Comment.find({ billId, status: 'completed' });

    const rows = [
      ['Text', 'Sentiment', 'Score', 'Keywords', 'Submitted By', 'Date'],
      ...comments.map(c => [
        `"${c.text.replace(/"/g, '""')}"`,
        c.sentimentLabel || '',
        c.sentimentScore || '',
        `"${c.keywords.map(k => k.word).join(', ')}"`,
        c.submittedBy || 'anonymous',
        new Date(c.createdAt).toLocaleDateString(),
      ])
    ];

    const csv = rows.map(r => r.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=comments-${billId}.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/globalstats — for landing page
router.get('/globalstats', async (req, res) => {
  try {
    const Bill = require('../models/Bill');
    const totalBills = await Bill.countDocuments();
    const totalComments = await Comment.countDocuments();
    const analyzed = await Comment.countDocuments({ status: 'completed' });
    const positive = await Comment.countDocuments({ sentimentLabel: 'positive' });
    res.json({ totalBills, totalComments, analyzed, positive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;