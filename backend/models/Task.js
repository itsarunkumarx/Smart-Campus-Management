const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Please add a task title'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        deadline: {
            type: Date,
            required: [true, 'Please set a deadline'],
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed'],
            default: 'pending',
        },
        isArchived: {
            type: Boolean,
            default: false,
        },
        notified: {
            type: Boolean,
            default: false,
        },
        alarmSound: {
            type: String,
            default: 'digital_alarm',
        },
        isAlarmEnabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying by user and deadline
taskSchema.index({ user: 1, deadline: 1 });

module.exports = mongoose.model('Task', taskSchema);
