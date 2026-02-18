const Complaint = require('../models/Complaint');

// @desc    Create a complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    try {
        const { title, against, roleType, description, evidence } = req.body;

        const complaint = await Complaint.create({
            raisedBy: req.user._id,
            title,
            against,
            roleType,
            description,
            evidence: evidence || [],
        });

        const populatedComplaint = await Complaint.findById(complaint._id).populate(
            'raisedBy',
            'name email role'
        );

        res.status(201).json(populatedComplaint);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get complaints (user's own or all for admin)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
    try {
        let filter = {};

        // Students/Faculty see only their own complaints
        if (req.user.role !== 'admin') {
            filter.raisedBy = req.user._id;
        }

        const complaints = await Complaint.find(filter)
            .populate('raisedBy', 'name email role')
            .populate('handledBy', 'name')
            .sort({ createdAt: -1 });

        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update complaint (admin only - handled in admin controller)
// Route is defined in admin routes

module.exports = {
    createComplaint,
    getComplaints,
};
