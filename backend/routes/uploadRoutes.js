const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// @desc    Upload institutional image/video
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No archive detected for transmission.' });
    }

    // Return the relative URL for frontend consumption
    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(200).json({
        message: 'Asset archived successfully.',
        url: fileUrl,
        type: req.file.mimetype.startsWith('image') ? 'image' : 'video'
    });
});

module.exports = router;
