const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');

const router = express.Router();

// POST /api/pickup/request - Create pickup request (user)
router.post('/request', protect, authorize('user'), async (req, res) => {
  try {
    const { items, pickupAddress } = req.body;

    const request = await PickupRequest.create({
      userId: req.user._id,
      items,
      pickupAddress,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/pickup/my-requests - Get logged-in user's requests
router.get('/my-requests', protect, authorize('user'), async (req, res) => {
  try {
    const requests = await PickupRequest.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
