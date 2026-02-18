const express = require('express');
const { getPlacements, getScholarships } = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/placements', getPlacements);
router.get('/scholarships', getScholarships);

module.exports = router;
