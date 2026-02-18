const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            maxlength: 500,
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'urgent', 'like', 'comment', 'follow', 'task', 'message'],
            default: 'info',
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // If null, it's a broadcast based on targetRole
        },
        targetRole: {
            type: String,
            enum: ['all', 'student', 'faculty', 'admin', 'personal'],
            default: 'all',
        },
        link: {
            type: String, // Path to redirect to (e.g. /post/123)
            default: '',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        priority: {
            type: Number,
            default: 1,
            min: 1,
            max: 5,
        },
        expiryDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ targetRole: 1, createdAt: -1 });
notificationSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
