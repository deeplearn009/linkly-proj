const HttpError = require('../models/errorModel')
const ConversationModel = require('../models/conversationModel')
const MessageModel = require('../models/messageModel')
const {getReceiverSocketId, io} = require("../socket/socket");
const Notification = require('../models/notificationModel');


const createMessage = async (req, res, next) => {
    try {
        const {receiverId} = req.params
        const {messageBody} = req.body

        // Check if there's already a conversation

        let conversation = await ConversationModel.findOne({participants: {$all: [req.user.id, receiverId]}})

        // Create new conversation

        if(!conversation) {
            conversation = await ConversationModel.create({participants: [req.user.id, receiverId], lastMessage: {text: messageBody, senderId: req.user.id}})
        }

        // Create a new message

        const newMessage = await MessageModel.create({conversationId: conversation._id, senderId: req.user.id, text: messageBody})
        await conversation.updateOne({lastMessage: {text: messageBody, senderId: req.user.id}})

        const receiverSocketId = getReceiverSocketId(receiverId)

        if(receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        // Notify receiver if not self
        if (receiverId !== req.user.id) {
            const notification = await Notification.create({
                recipient: receiverId,
                sender: req.user.id,
                type: 'message',
                message: newMessage._id
            });
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('notification', notification);
            }
        }

        res.json(newMessage)

    } catch (err) {
        return next(new HttpError(err));
    }
}





const getMessages = async (req, res, next) => {
    try {
        const {receiverId} = req.params
        const conversation = await ConversationModel.findOne({participants: {$all: [req.user.id, receiverId]}})

        if(!conversation) {
            return next(new HttpError("You don't have any conversations yet.", 404))
        }

        const messages = await MessageModel.find({conversationId: conversation._id}).sort({createdAt: 1})

        res.json(messages)

    } catch (err) {
        return next(new HttpError(err));
    }

}





const getConversations = async (req, res, next) => {
    try {
        let conversations = await ConversationModel.find({participants: req.user.id}).populate({path: 'participants', select: 'fullName profilePhoto'}).sort({createdAt: -1})

        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter((participant) => participant._id.toString() !== req.user.id.toString())
        })

        res.json(conversations)

    } catch (err) {
        return next(new HttpError(err));
    }
}


module.exports = {getConversations, getMessages, createMessage}