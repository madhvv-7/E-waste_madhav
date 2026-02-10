const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Appeal = require('../models/Appeal');

const router = express.Router();

/**
 * POST /api/appeals
 * Public endpoint to submit an appeal/contact request.
 * Requires an email, subject (optional) and message.
 * Only users with status 'rejected' or 'deactivated' are allowed to submit appeals.
 */
router.post('/', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ message: 'Email and message are required' });
    }

    const sanitizedEmail = (email || '').toLowerCase().trim();
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow appeals for rejected or deactivated users
    if (!['rejected', 'deactivated'].includes(user.status)) {
      return res.status(400).json({ message: 'Appeals are allowed only for rejected or deactivated accounts' });
    }

    const appeal = await Appeal.create({
      userId: user._id,
      role: user.role,
      currentStatus: user.status,
      subject: subject || '',
      message: message.trim(),
    });

    res.status(201).json({ message: 'Appeal submitted successfully', appeal });
  } catch (error) {
    console.error('Error creating appeal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/appeals
 * Admin-only endpoint to list appeals
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const appeals = await Appeal.find()
      .populate('userId', 'name email role status')
      .sort({ createdAt: -1 });
    res.json(appeals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/appeals/:id/resolve
 * Admin-only endpoint to resolve an appeal.
 * Body: { action: 'approve' | 'reject' }
 * - 'approve' will set user's status to 'active' and mark appeal resolved
 * - 'reject' will mark appeal resolved without changing user status
 */
router.put('/:id/resolve', protect, authorize('admin'), async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const appeal = await Appeal.findById(req.params.id);
    if (!appeal) {
      return res.status(404).json({ message: 'Appeal not found' });
    }

    if (appeal.resolved) {
      return res.status(400).json({ message: 'Appeal already resolved' });
    }

    if (action === 'approve') {
      // Activate the user if not already active
      const user = await User.findById(appeal.userId);
      if (user && user.status !== 'active') {
        user.status = 'active';
        await user.save();
      }
    }

    appeal.resolved = true;
    await appeal.save();

    res.json({ message: 'Appeal resolved', appeal });
  } catch (error) {
    console.error('Error resolving appeal:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

