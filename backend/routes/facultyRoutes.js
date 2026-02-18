const express = require('express');
const {
    getDashboard,
    createAnnouncement,
    markAttendance,
    markBulkAttendance,
    getStudents,
} = require('../controllers/facultyController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes are protected and faculty-only
router.use(protect, authorizeRoles('faculty'));

router.get('/dashboard', getDashboard);
router.post('/announcement', createAnnouncement);
router.post('/attendance', markAttendance);
router.post('/attendance/bulk', markBulkAttendance);
router.get('/students', getStudents);

module.exports = router;
