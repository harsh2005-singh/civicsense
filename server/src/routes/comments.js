const router = require('express').Router();
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const Comment = require('../models/Comment');
const Bill = require('../models/Bill');
const { verifyToken } = require('../middleware/auth');
//const { addToQueue } = require('../workers/commentQueue');

// multer config — save CSV to /uploads folder temporarily
const upload = multer({ dest: 'uploads/' });

// POST /api/comments — submit comments as JSON array
router.post('/', verifyToken, async (req, res) => {
  try {
    const { billId, comments } = req.body;

    // validate bill exists
    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return res.status(400).json({ error: 'Comments array is required' });
    }

    const results = { inserted: 0, duplicates: 0, errors: [] };
    const insertedIds = [];

    for (const text of comments) {
      try {
        const comment = await Comment.create({
          text: text.trim(),
          billId,
          source: 'manual',
          submittedBy: req.user.name,
        });
        insertedIds.push(comment._id);
        results.inserted++;
      } catch (err) {
        if (err.code === 11000) {
          results.duplicates++;
        } else {
          results.errors.push({ text, error: err.message });
        }
      }
    }

    // update bill comment count
    await Bill.findByIdAndUpdate(billId, {
      $inc: { totalComments: results.inserted }
    });

    // add to Bull queue for AI processing
    // if (insertedIds.length > 0) {
    //   await addToQueue({ commentIds: insertedIds, billId });
    // }
    console.log('Queue disabled until Redis is running');

    res.status(201).json({
      message: 'Comments submitted',
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/comments/csv — upload CSV file
router.post('/csv', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { billId } = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

    const results = { inserted: 0, duplicates: 0, errors: [] };
    const insertedIds = [];
    const rows = [];

    // parse CSV file
    const parser = fs
      .createReadStream(req.file.path)
      .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }));

    for await (const row of parser) {
      rows.push(row);
    }

    // delete temp file
    fs.unlinkSync(req.file.path);

    // expect CSV to have a "text" column
    for (const row of rows) {
      const text = row.text || row.comment || row.feedback;
      if (!text) {
        results.errors.push({ row, error: 'No text/comment/feedback column found' });
        continue;
      }
      try {
        const comment = await Comment.create({
          text: text.trim(),
          billId,
          source: 'csv',
          submittedBy: row.name || 'anonymous',
        });
        insertedIds.push(comment._id);
        results.inserted++;
      } catch (err) {
        if (err.code === 11000) {
          results.duplicates++;
        } else {
          results.errors.push({ text, error: err.message });
        }
      }
    }

    await Bill.findByIdAndUpdate(billId, {
      $inc: { totalComments: results.inserted }
    });

    if (insertedIds.length > 0) {
      await addToQueue({ commentIds: insertedIds, billId });
    }

    res.status(201).json({ message: 'CSV processed', results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/comments?billId=X — get comments for a bill
router.get('/', verifyToken, async (req, res) => {
  try {
    const { billId, status, page = 1, limit = 20 } = req.query;
    if (!billId) return res.status(400).json({ error: 'billId is required' });

    const mongoose = require('mongoose');
    const filter = { billId: new mongoose.Types.ObjectId(billId) };
    if (status) filter.status = status;

    const comments = await Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEBUG - remove later
router.get('/debug', verifyToken, async (req, res) => {
  try {
    const all = await Comment.find({});
    res.json({ total: all.length, comments: all });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;