const Notification = require('../models/notificationModel');
const HttpError = require('../models/errorModel');

// Get all notifications for the logged-in user
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'fullName profilePhoto')
            .populate('post', 'body image')
            .populate('comment', 'comment')
            .populate('message', 'text')
            .sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        next(new HttpError('Error fetching notifications', 500));
    }
};

// Mark a notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!notification) {
            return next(new HttpError('Notification not found', 404));
        }
        res.json(notification);
    } catch (error) {
        next(new HttpError('Error marking notification as read', 500));
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        next(new HttpError('Error marking all notifications as read', 500));
    }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user.id
        });
        if (!notification) {
            return next(new HttpError('Notification not found', 404));
        }
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        next(new HttpError('Error deleting notification', 500));
    }
}; 