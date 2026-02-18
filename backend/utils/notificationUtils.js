const Notification = require('../models/Notification');

/**
 * Creates a personal or broadcast notification
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} params.type - like, comment, follow, task, info, etc.
 * @param {string} params.recipient - User ID (optional)
 * @param {string} params.targetRole - student, faculty, admin, all (optional)
 * @param {string} params.link - Frontend path to redirect to
 * @param {string} params.createdBy - User ID who triggered it
 */
const createNotification = async ({
    title,
    message,
    type = 'info',
    recipient = null,
    targetRole = 'personal',
    link = '',
    createdBy
}) => {
    try {
        const notification = await Notification.create({
            title,
            message,
            type,
            recipient,
            targetRole: recipient ? 'personal' : targetRole,
            link,
            createdBy
        });
        return notification;
    } catch (error) {
        console.error('Notification creation failed:', error);
        return null;
    }
};

module.exports = { createNotification };
