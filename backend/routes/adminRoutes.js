const express = require('express');
const {
    getDashboard,
    getUsers,
    toggleSuspendUser,
    deleteUser,
    createPlacement,
    createScholarship,
    updateScholarshipApplicant,
    createAnnouncement,
    getComplaints,
    updateComplaint,
    removePost,
    addFaculty,
    getAISummary,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes are protected and admin-only
router.use(protect, authorizeRoles('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/user/:id/suspend', toggleSuspendUser);
router.delete('/user/:id', deleteUser);
router.post('/placement', createPlacement);
router.post('/scholarship', createScholarship);
router.put('/scholarship/:scholarshipId/applicant/:applicantId', updateScholarshipApplicant);
router.post('/announcement', createAnnouncement);
router.get('/complaints', getComplaints);
router.put('/complaint/:id', updateComplaint);
router.delete('/post/:id', removePost);
router.post('/faculty/add', addFaculty);
router.get('/ai-summary', getAISummary);

module.exports = router;
