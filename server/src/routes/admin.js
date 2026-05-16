const router = require('express').Router();
const User = require('../models/User');
const Comment = require('../models/Comment');
const Bill = require('../models/Bill');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/admin/users
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/toggle
router.patch('/users/:id/toggle', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'enabled' : 'disabled'}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalBills, totalComments, analyzed] = await Promise.all([
      User.countDocuments(),
      Bill.countDocuments(),
      Comment.countDocuments(),
      Comment.countDocuments({ status: 'completed' }),
    ]);
    res.json({ totalUsers, totalBills, totalComments, analyzed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;