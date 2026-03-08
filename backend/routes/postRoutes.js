const express = require('express');
const {
    createPost,
    getPosts,
    toggleLike,
    addComment,
    reportPost,
    deletePost,
    getPostById,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Authentication middleware is applied to specific routes


router.post('/', protect, createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.put('/:id/report', protect, reportPost);
router.delete('/:id', protect, deletePost);

module.exports = router;
