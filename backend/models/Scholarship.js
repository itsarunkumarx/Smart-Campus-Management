const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Scholarship name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: [true, 'Scholarship amount is required'],
        },
        eligibility: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
            required: [true, 'Application deadline is required'],
        },
        totalSlots: {
            type: Number,
            default: 10,
        },
        applicants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                documents: [String], // URLs to uploaded documents
                status: {
                    type: String,
                    enum: ['pending', 'approved', 'rejected'],
                    default: 'pending',
                },
                appliedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        approvedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Indexes
scholarshipSchema.index({ deadline: 1 });
scholarshipSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
