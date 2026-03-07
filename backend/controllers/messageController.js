const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Private
const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', 'name profileImage email')
            .populate('chat');
        res.json(messages);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/message
// @access  Private
const sendMessage = async (req, res) => {
    const { content, chatId, fileUrl, fileType } = req.body;

    if (!chatId || (!content && !fileUrl)) {
        return res.status(400).json({ message: 'Invalid data passed into request' });
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
        fileUrl: fileUrl,
        fileType: fileType,
        readBy: [req.user._id],
    };

    try {
        var message = await Message.create(newMessage);

        message = await message.populate('sender', 'name profileImage');
        message = await message.populate('chat');
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name profileImage email',
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Clear all messages in a chat permanently
// @route   DELETE /api/message/clear/:chatId
// @access  Private
const clearMessages = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Only chat participants can clear
        const isMember = chat.users.some(u => u.toString() === req.user._id.toString());
        if (!isMember) return res.status(403).json({ message: 'Not authorised' });

        await Message.deleteMany({ chat: req.params.chatId });
        await Chat.findByIdAndUpdate(req.params.chatId, { latestMessage: null });

        res.json({ message: 'Chat cleared' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    allMessages,
    sendMessage,
    clearMessages,
};
