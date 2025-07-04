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

const deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        
        // Find the conversation and verify the user is a participant
        const conversation = await ConversationModel.findOne({
            _id: conversationId,
            participants: req.user.id
        });

        if (!conversation) {
            return next(new HttpError("Conversation not found or you don't have permission to delete it.", 404));
        }

        // Start a session for transaction
        const session = await ConversationModel.startSession();
        session.startTransaction();

        try {
            // Delete all messages in the conversation
            await MessageModel.deleteMany({ conversationId: conversationId }, { session });
            
            // Delete the conversation
            await ConversationModel.findByIdAndDelete(conversationId, { session });

            // Commit the transaction
            await session.commitTransaction();
            
            res.json({ message: 'Conversation deleted successfully' });

        } catch (error) {
            // Rollback the transaction on error
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }

    } catch (err) {
        console.error('Error deleting conversation:', err);
        return next(new HttpError('Error deleting conversation', 500));
    }
}

module.exports = {getConversations, getMessages, createMessage, deleteConversation}