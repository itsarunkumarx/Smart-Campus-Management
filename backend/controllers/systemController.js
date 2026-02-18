const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true
        });
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};
