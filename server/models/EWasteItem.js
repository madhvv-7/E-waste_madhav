const mongoose = require('mongoose');

const eWasteItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    estimatedWeight: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    isHazardous: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EWasteItem', eWasteItemSchema);

