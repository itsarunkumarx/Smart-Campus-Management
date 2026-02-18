const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        jobRole: {
            type: String,
            required: [true, 'Job role is required'],
        },
        package: {
            type: String,
            required: true,
        },
        eligibility: {
            type: String,
            required: true,
        },
        deadline: {
            type: Date,
            required: [true, 'Application deadline is required'],
        },
        applicants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                status: {
                    type: String,
                    enum: ['applied', 'shortlisted', 'selected', 'rejected'],
                    default: 'applied',
                },
                appliedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        selectedStudents: [
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
    },
    {
        timestamps: true,
    }
);

// Indexes
placementSchema.index({ deadline: 1 });
placementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Placement', placementSchema);
