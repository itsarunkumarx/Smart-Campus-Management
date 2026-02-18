const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Please provide a title for the grievance'],
            maxlength: 100,
        },
        against: {
            type: String,
            required: [true, 'Please specify who the complaint is against'],
        },
        roleType: {
            type: String,
            enum: ['student', 'faculty', 'staff', 'other'],
            default: 'other',
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: 2000,
        },
        evidence: [
            {
                type: String, // URLs to uploaded files
            },
        ],
        status: {
            type: String,
            enum: ['pending', 'in_review', 'resolved', 'rejected'],
            default: 'pending',
        },
        adminResponse: {
            type: String,
            default: '',
        },
        handledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
complaintSchema.index({ raisedBy: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
