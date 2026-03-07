const Notification = require('../models/Notification');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;
        const now = new Date();
        const notExpired = { $or: [{ expiryDate: { $gte: now } }, { expiryDate: null }] };

        // Personal notifications (directly addressed to this user)
        const personal = await Notification.find({
            recipient: userId,
            ...notExpired
        }).populate('createdBy', 'name role').sort({ priority: -1, createdAt: -1 }).limit(50);

        // Broadcast notifications (by role, no specific recipient)
        const broadcast = await Notification.find({
            recipient: null,
            targetRole: { $in: ['all', userRole] },
            ...notExpired
        }).populate('createdBy', 'name role').sort({ priority: -1, createdAt: -1 }).limit(50);

        // Merge and deduplicate by _id — personal takes priority over broadcast
        const seen = new Set();
        const merged = [];
        for (const n of [...personal, ...broadcast]) {
            const id = n._id.toString();
            if (!seen.has(id)) {
                seen.add(id);
                // Compute per-user isRead correctly:
                //  - personal  → use isRead boolean
                //  - broadcast → check readBy array
                const isRead = n.recipient
                    ? n.isRead
                    : n.readBy.some(uid => uid.toString() === userId.toString());
                merged.push({ ...n.toObject(), isRead });
            }
        }

        // Re-sort merged result
        merged.sort((a, b) => b.priority - a.priority || new Date(b.createdAt) - new Date(a.createdAt));

        res.json(merged.slice(0, 50));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        if (!notification.readBy.includes(req.user._id)) {
            notification.readBy.push(req.user._id);
            await notification.save();
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
};
