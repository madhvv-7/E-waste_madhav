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

/**
 * GET /api/admin/agents - Get all active collection agents
 * Returns only agents with 'active' status for assignment dropdown
 * Admin-only endpoint for secure agent list access
 */
router.get('/agents', protect, authorize('admin'), async (req, res) => {
  try {
    // Debug: Log query conditions
    console.log('[DEBUG] Fetching agents with role: agent, status: active');
    
    // First, check all users with agent role to see what we have
    const allAgentUsers = await User.find({ role: 'agent' }).select('_id name email status role');
    console.log('[DEBUG] All users with role=agent:', allAgentUsers.length);
    allAgentUsers.forEach((user) => {
      console.log(`[DEBUG] User: ${user.name} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
    });
    
    // Query for active agents - use simple equality (Mongoose handles exact match)
    // This ensures we get agents with role='agent' and status='active'
    const agents = await User.find({
      role: 'agent',
      status: 'active',
    })
      .select('_id name email role status')
      .sort({ name: 1 })
      .lean(); // Use lean() for better performance and to ensure clean JSON
    
    // Debug: Log found agents
    console.log('[DEBUG] Found active agents:', agents.length);
    if (agents.length > 0) {
      console.log('[DEBUG] Active agent data:', JSON.stringify(agents, null, 2));
      agents.forEach((agent) => {
        console.log(`[DEBUG] Active Agent: ${agent.name} (${agent.email}) - Role: ${agent.role} - Status: ${agent.status}`);
      });
    } else {
      console.log('[DEBUG] No active agents found. Checking status values...');
      const statusCounts = await User.aggregate([
        { $match: { role: 'agent' } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      console.log('[DEBUG] Agent status distribution:', statusCounts);
    }
    
    // Return only _id, name, email for frontend
    const agentList = agents.map((agent) => ({
      _id: agent._id,
      name: agent.name,
      email: agent.email,
    }));
    
    console.log('[DEBUG] Returning agent list:', agentList.length, 'agents');
    res.json(agentList);
  } catch (error) {
    console.error('[DEBUG] Error fetching agents:', error);
    console.error('[DEBUG] Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/assign/:id - Assign agent to pickup request
 * 
 * Status-based assignment rules:
 * - Only 'Requested' status requests can be assigned (assignable state)
 * - Terminal statuses ('Recycled') are read-only and cannot be modified
 * - Prevents reassignment of completed requests
 */
router.put('/assign/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ message: 'Agent ID is required' });
    }

    // Verify agent exists and is active
    const agent = await User.findOne({ _id: agentId, role: 'agent', status: 'active' });
    if (!agent) {
      return res.status(400).json({ message: 'Invalid or inactive agent selected' });
    }

    const request = await PickupRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    // Guard: Prevent assignment of terminal status requests (read-only)
    const terminalStatuses = ['Recycled'];
    if (terminalStatuses.includes(request.status)) {
      return res.status(403).json({
        message: 'Cannot assign agent to a request with terminal status. This request is read-only.',
      });
    }

    // Guard: Only allow assignment for assignable states
    const assignableStatuses = ['Requested'];
    if (!assignableStatuses.includes(request.status)) {
      return res.status(400).json({
        message: `Cannot assign agent to a request with status '${request.status}'. Only 'Requested' requests can be assigned.`,
      });
    }

    request.assignedAgentId = agentId;
    await request.save();

    // Populate agent info for response
    await request.populate('assignedAgentId', 'name email');

    res.json({
      message: 'Agent assigned successfully',
      request,
    });
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
 * State transition: pending → active
 * Allows login for agent and recycler roles after approval
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

    // Approve account: change status to 'active' (allows login)
    user.status = 'active';
    await user.save();

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
 * PUT /api/admin/reject-account/:id - Reject an account
 * State transitions: pending → rejected, active → rejected
 * Prevents login access for agent and recycler roles
 */
router.put('/reject-account/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only agent and recycler roles can be rejected
    if (!['agent', 'recycler'].includes(user.role)) {
      return res.status(400).json({ message: 'This account type cannot be rejected' });
    }

    // Allow rejection from pending or active status
    if (!['pending', 'active'].includes(user.status)) {
      return res.status(400).json({ message: 'Account cannot be rejected from current status' });
    }

    // Reject account: change status to 'rejected' (blocks login)
    user.status = 'rejected';
    await user.save();

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

/**
 * PUT /api/admin/deactivate-account/:id - Deactivate an account
 * State transition: active → deactivated
 * Restricts system access for any role (user, agent, recycler, admin)
 */
router.put('/deactivate-account/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can only deactivate active accounts
    if (user.status !== 'active') {
      return res.status(400).json({ message: 'Only active accounts can be deactivated' });
    }

    // Deactivate account: change status to 'deactivated' (blocks login)
    user.status = 'deactivated';
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Account deactivated successfully',
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * PUT /api/admin/reactivate-account/:id - Reactivate an account
 * State transitions: rejected → active, deactivated → active
 * Restores system access for any role
 */
router.put('/reactivate-account/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Can reactivate from rejected or deactivated status
    if (!['rejected', 'deactivated'].includes(user.status)) {
      return res.status(400).json({ message: 'Account cannot be reactivated from current status' });
    }

    // Reactivate account: change status to 'active' (allows login)
    user.status = 'active';
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({
      message: 'Account reactivated successfully',
      user: userData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
