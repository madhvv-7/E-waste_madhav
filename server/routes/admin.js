const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');
const User = require('../models/User');
const RecyclingRecord = require('../models/RecyclingRecord');

const router = express.Router();

// GET /api/admin/requests - View all requests
router.get('/requests', protect, authorize('admin'), async (req, res) => {
  try {
    const requests = await PickupRequest.find()
      .populate('userId', 'name email')
      .populate('assignedAgentId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/admin/assign/:id - Assign agent
router.put('/assign/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { agentId } = req.body;

    const agent = await User.findOne({ _id: agentId, role: 'agent' });
    if (!agent) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }

    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    request.assignedAgentId = agentId;
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/reports - Basic stats
router.get('/reports', protect, authorize('admin'), async (req, res) => {
  try {
    const totalRequests = await PickupRequest.countDocuments();
    const statusCounts = await PickupRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalRecyclers = await User.countDocuments({ role: 'recycler' });

    const recyclingRecords = await RecyclingRecord.countDocuments();

    res.json({
      totalRequests,
      statusCounts,
      totalUsers,
      totalAgents,
      totalRecyclers,
      recyclingRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
