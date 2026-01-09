const mongoose = require('mongoose');

const pickupRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'EWasteItem',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    pickupAddress: {
      type: String,
      required: true,
      trim: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['Requested', 'Collected', 'SentToRecycler', 'Recycled'],
      default: 'Requested',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);

