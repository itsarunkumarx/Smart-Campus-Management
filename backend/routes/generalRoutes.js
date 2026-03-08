const express = require('express');
const { getPlacements, getScholarships } = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes that require authentication should use 'protect' individually if needed
// current routes are read-only and public


router.get('/placements', getPlacements);
router.get('/scholarships', getScholarships);

module.exports = router;
