const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late'],
            required: true,
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for fast queries
attendanceSchema.index({ studentId: 1, subject: 1, date: -1 });

// Virtual to calculate attendance percentage
attendanceSchema.statics.calculatePercentage = async function (studentId, subject) {
    const total = await this.countDocuments({ studentId, subject });
    const present = await this.countDocuments({
        studentId,
        subject,
        status: { $in: ['present', 'late'] },
    });

    return total > 0 ? ((present / total) * 100).toFixed(2) : 0;
};

module.exports = mongoose.model('Attendance', attendanceSchema);
