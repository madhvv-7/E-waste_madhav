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

/**
 * GET /api/admin/users - View all system users
 * Returns all users with their role and status for admin management
 * Admin approval workflow: Only agent and recycler roles require approval
 */
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * GET /api/admin/pending-accounts - View pending accounts (agent and recycler only)
 * Returns only agent and recycler accounts with 'pending' status that need admin approval
 */
router.get('/pending-accounts', protect, authorize('admin'), async (req, res) => {
  try {
    // Only show pending accounts for roles that require approval (agent, recycler)
    const pendingAccounts = await User.find({
      status: 'pending',
      role: { $in: ['agent', 'recycler'] },
    })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(pendingAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/approve-account/:id - Approve a pending account
 * Changes account status from 'pending' to 'active', allowing login
 * Only works for agent and recycler roles
 */
router.put('/approve-account/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'Account is not pending approval' });
    }

    // Only agent and recycler roles require approval workflow
    if (!['agent', 'recycler'].includes(user.role)) {
      return res.status(400).json({ message: 'This account type does not require approval' });
    }

    // Approve account: change status to 'active'
    user.status = 'active';
    await user.save();

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Account approved successfully',
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/reject-account/:id - Reject a pending account
 * Changes account status from 'pending' to 'rejected', preventing login
 * Only works for agent and recycler roles
 */
router.put('/reject-account/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'Account is not pending approval' });
    }

    // Only agent and recycler roles require approval workflow
    if (!['agent', 'recycler'].includes(user.role)) {
      return res.status(400).json({ message: 'This account type does not require approval' });
    }

    // Reject account: change status to 'rejected'
    user.status = 'rejected';
    await user.save();

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Account rejected successfully',
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
