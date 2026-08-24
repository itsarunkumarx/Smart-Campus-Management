const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
  getAttendanceAnalytics,
  getSecurityAnalytics
} = require('../controllers/analyticsController');

router.get('/attendance', protect, authorizeRoles('admin', 'faculty'), getAttendanceAnalytics);
router.get('/security', protect, authorizeRoles('admin'), getSecurityAnalytics);

module.exports = router;
