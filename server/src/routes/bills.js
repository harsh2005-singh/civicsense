const router = require('express').Router();
const Bill = require('../models/Bill');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/bills — get all bills
router.get('/', verifyToken, async (req, res) => {
  try {
    const bills = await Bill.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json({ bills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bills/:id — get single bill
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bills — create bill (admin/analyst only)
router.post('/', verifyToken, requireRole('admin', 'analyst'), async (req, res) => {
  try {
    const { title, description, billNumber, category } = req.body;
    if (!title || !description || !billNumber) {
      return res.status(400).json({ error: 'Title, description and billNumber are required' });
    }
    const bill = await Bill.create({
      title,
      description,
      billNumber,
      category,
      createdBy: req.user._id,
    });
    res.status(201).json({ message: 'Bill created successfully', bill });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Bill number already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bills/:id/status
router.patch('/:id/status', verifyToken, requireRole('admin', 'analyst'), async (req, res) => {
  try {
    const { status } = req.body;
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!bill) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Status updated', bill });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bills/:id/status already exists
// Add this new GET for timeline
router.get('/:id/timeline', verifyToken, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: 'Bill not found' });

    const allStatuses = ['draft', 'open', 'closed', 'archived'];
    const currentIndex = allStatuses.indexOf(bill.status);

    const timeline = allStatuses.map((status, i) => ({
      status,
      completed: i <= currentIndex,
      current: i === currentIndex,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    }));

    res.json({ timeline, currentStatus: bill.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;