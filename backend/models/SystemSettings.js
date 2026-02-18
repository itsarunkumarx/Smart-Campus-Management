const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema(
    {
        ai: {
            isEnabled: { type: Boolean, default: true },
            defaultTone: { type: String, enum: ['professional', 'friendly', 'casual'], default: 'friendly' },
            usageLimitPerUser: { type: Number, default: 50 }, // queries per day
            totalUsageCount: { type: Number, default: 0 },
        },
        globalAnnouncements: {
            isEnabled: { type: Boolean, default: true },
        },
        registrationEnabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
