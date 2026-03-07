const express = require('express');
const router = express.Router();
const {
    allMessages,
    sendMessage,
    clearMessages,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:chatId').get(allMessages);
router.route('/').post(sendMessage);
router.route('/clear/:chatId').delete(clearMessages);

module.exports = router;
