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
    importKnowledge,
    getKnowledgeItems,
    deleteKnowledgeItem,
    updateKnowledgeItem,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Restricted to admin only
router.get('/dashboard', protect, authorizeRoles('admin'), getDashboard);
router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.put('/user/:id/suspend', protect, authorizeRoles('admin'), toggleSuspendUser);
router.delete('/user/:id', protect, authorizeRoles('admin'), deleteUser);

// Restricted to admin and faculty
router.post('/placement', protect, authorizeRoles('admin', 'faculty'), createPlacement);
router.post('/scholarship', protect, authorizeRoles('admin', 'faculty'), createScholarship);
router.put('/scholarship/:scholarshipId/applicant/:applicantId', protect, authorizeRoles('admin', 'faculty'), updateScholarshipApplicant);

// Restricted to admin only
router.post('/announcement', protect, authorizeRoles('admin'), createAnnouncement);
router.get('/complaints', protect, authorizeRoles('admin'), getComplaints);
router.put('/complaint/:id', protect, authorizeRoles('admin'), updateComplaint);
router.delete('/post/:id', protect, authorizeRoles('admin'), removePost);
router.post('/faculty/add', protect, authorizeRoles('admin'), addFaculty);
router.get('/ai-summary', protect, authorizeRoles('admin'), getAISummary);

// AI Knowledge Management
router.post('/ai/knowledge/import', protect, authorizeRoles('admin'), importKnowledge);
router.get('/ai/knowledge', protect, authorizeRoles('admin'), getKnowledgeItems);
router.put('/ai/knowledge/:id', protect, authorizeRoles('admin'), updateKnowledgeItem);
router.delete('/ai/knowledge/:id', protect, authorizeRoles('admin'), deleteKnowledgeItem);

module.exports = router;
