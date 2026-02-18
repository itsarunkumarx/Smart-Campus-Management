const Placement = require('../models/Placement');
const Scholarship = require('../models/Scholarship');

// @desc    Get all placements
// @route   GET /api/placements
// @access  Private
const getPlacements = async (req, res) => {
    try {
        const placements = await Placement.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(placements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all scholarships
// @route   GET /api/scholarships
// @access  Private
const getScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find()
            .populate('applicants.userId', 'name email academicInfo')
            .sort({ createdAt: -1 });

        res.json(scholarships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPlacements,
    getScholarships,
};
