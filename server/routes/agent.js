const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');

const router = express.Router();

// GET /api/agent/requests - View assigned pickup requests
router.get('/requests', protect, authorize('agent'), async (req, res) => {
  try {
    const requests = await PickupRequest.find({
      assignedAgentId: req.user._id,
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/agent/collect/:id - Mark as collected
router.put('/collect/:id', protect, authorize('agent'), async (req, res) => {
  try {
    const request = await PickupRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (String(request.assignedAgentId) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: 'This request is not assigned to you' });
    }

    request.status = 'Collected';
    await request.save();

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/agent/send-to-recycler/:id - Mark as sent to recycler
router.put(
  '/send-to-recycler/:id',
  protect,
  authorize('agent'),
  async (req, res) => {
    try {
      const request = await PickupRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({ message: 'Pickup request not found' });
      }

      if (String(request.assignedAgentId) !== String(req.user._id)) {
        return res
          .status(403)
          .json({ message: 'This request is not assigned to you' });
      }

      request.status = 'SentToRecycler';
      await request.save();

      res.json(request);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
