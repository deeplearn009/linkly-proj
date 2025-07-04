const { Schema, model } = require('mongoose');

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'comment', 'follow', 'message', 'admin'], required: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    message: { type: Schema.Types.ObjectId, ref: 'Message' },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = model('Notification', notificationSchema); 