const mongoose = require('mongoose');

const securityEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    eventType: {
      type: String,
      enum: [
        'face_login_success',
        'face_login_failed',
        'face_register',
        'unknown_face',
        'liveness_failure',
        'access_granted',
        'access_denied',
        'anomaly_detected',
        'face_attendance'
      ],
      required: true,
    },
    location: {
      type: String,
      default: 'Campus Portal',
    },
    confidence: {
      type: Number,
      default: 0,
    },
    livenessScore: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

securityEventSchema.index({ userId: 1, createdAt: -1 });
securityEventSchema.index({ eventType: 1 });

module.exports = mongoose.model('SecurityEvent', securityEventSchema);
