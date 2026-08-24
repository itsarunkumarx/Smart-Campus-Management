const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const {
  getSecurityEvents,
  getSecurityStats,
  getAnomalies
} = require('../controllers/securityController');

router.get('/events', protect, authorizeRoles('admin'), getSecurityEvents);
router.get('/stats', protect, authorizeRoles('admin'), getSecurityStats);
router.get('/anomalies', protect, authorizeRoles('admin'), getAnomalies);

module.exports = router;
