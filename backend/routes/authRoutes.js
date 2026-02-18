const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    checkUsername,
    searchUsers,
    followUser,
    unfollowUser,
    getUserById,
    googleLogin,
    deactivateAccount,
    deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/google', googleLogin);
router.get('/check-username/:username', checkUsername);
router.get('/search', protect, searchUsers);
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);
router.get('/user/:id', protect, getUserById);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/deactivate', protect, deactivateAccount);
router.delete('/delete', protect, deleteAccount);

module.exports = router;
