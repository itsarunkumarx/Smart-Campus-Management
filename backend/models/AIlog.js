const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userRole: {
            type: String,
            enum: ['student', 'faculty', 'admin'],
            required: true,
        },
        query: {
            type: String,
            required: true,
        },
        response: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['academic', 'career', 'casual', 'admin'],
            default: 'casual',
        },
        sessionId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for analytics
aiLogSchema.index({ userId: 1, createdAt: -1 });
aiLogSchema.index({ category: 1 });

module.exports = mongoose.model('AILog', aiLogSchema);
