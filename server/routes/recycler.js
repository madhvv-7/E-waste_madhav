const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const PickupRequest = require('../models/PickupRequest');
const RecyclingRecord = require('../models/RecyclingRecord');

const router = express.Router();

// GET /api/recycler/requests - View incoming + recycled e-waste for this recycler
router.get('/requests', protect, authorize('recycler'), async (req, res) => {
  try {
    // All SentToRecycler items are visible to every recycler (available to pick up)
    const incoming = await PickupRequest.find({
      status: 'SentToRecycler',
    }).sort({ createdAt: -1 });

    // Recycled items: only those processed by this recycler
    const records = await RecyclingRecord.find({ recyclerId: req.user._id });
    const recycledIds = records.map((r) => r.pickupRequestId);
    const recycled = await PickupRequest.find({
      _id: { $in: recycledIds },
      status: 'Recycled',
    }).sort({ createdAt: -1 });

    res.json([...incoming, ...recycled]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/recycler/recycle/:id - Mark as recycled and create record
router.put('/recycle/:id', protect, authorize('recycler'), async (req, res) => {
  try {
    const { recyclingMethod, remarks } = req.body;
    const request = await PickupRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    request.status = 'Recycled';
    await request.save();

    const record = await RecyclingRecord.create({
      pickupRequestId: request._id,
      recyclerId: req.user._id,
      recyclingMethod,
      completionDate: new Date(),
      remarks,
    });

    res.json({ request, record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
