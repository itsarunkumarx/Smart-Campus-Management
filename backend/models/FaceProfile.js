const mongoose = require('mongoose');

const faceProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    embedding: {
      type: [Number],
      required: true,
      select: false,
    },
    embeddings: {
      type: [[Number]],
      default: [],
      select: false,
    },
    modelVersion: {
      type: String,
      default: 'face-api-v1',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FaceProfile', faceProfileSchema);
