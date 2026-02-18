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

// All routes require authentication
router.use(protect);

router.post('/', createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id/like', toggleLike);
router.post('/:id/comment', addComment);
router.put('/:id/report', reportPost);
router.delete('/:id', deletePost);

module.exports = router;
