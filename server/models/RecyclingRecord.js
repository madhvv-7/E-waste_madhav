const mongoose = require('mongoose');

const recyclingRecordSchema = new mongoose.Schema(
  {
    pickupRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PickupRequest',
      required: true,
    },
    recyclerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recyclingMethod: {
      type: String,
      trim: true,
    },
    completionDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RecyclingRecord', recyclingRecordSchema);

