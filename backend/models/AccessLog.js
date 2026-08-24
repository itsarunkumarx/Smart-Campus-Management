const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ['granted', 'denied'],
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    livenessResult: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

accessLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AccessLog', accessLogSchema);
