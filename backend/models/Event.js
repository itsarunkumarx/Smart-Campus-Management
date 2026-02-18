const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
            maxlength: 2000,
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        location: {
            type: String,
            required: [true, 'Event location is required'],
        },
        capacity: {
            type: Number,
            default: 100,
        },
        registeredUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        category: {
            type: String,
            enum: ['academic', 'cultural', 'sports', 'placement', 'other'],
            default: 'other',
        },
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
eventSchema.index({ date: -1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
