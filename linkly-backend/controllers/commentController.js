const HttpError = require('../models/errorModel')
const CommentModel = require("../models/commentModel");
const PostModel = require("../models/postModel");
const UserModel = require("../models/userModel");



const createComment = async (req, res, next) => {
    try {
        const { postId } = req.params;
        const {comment} = req.body;
        if(!comment) {
            return next(new HttpError('Please, enter a comment', 422));
        }

        // Get comment creator

        const commentCreator = await UserModel.findById(req.user.id)
        const newComment = await CommentModel.create({creator: {creatorId: req.user.id, creatorName: commentCreator?.fullName, creatorPhoto: commentCreator?.profilePhoto}, comment, postId})
        await PostModel.findByIdAndUpdate(postId, {$push: {comments: newComment?._id}}, {new: true})

        res.json(newComment)

    } catch (err) {
        return next(new HttpError(err));
    }
}




const getPostComments = async (req, res, next) => {
    try {
        const {postId} = req.params;
        const comment = await PostModel.findById(postId).populate({path: 'comments', options: {sort: {createdAt: -1}}});
        res.json(comment);
    } catch (err) {
        return next(new HttpError(err));
    }
}





const deleteComment = async (req, res, next) => {
    try {
        const {commentId} = req.params;

        // get the comment

        const comment = await CommentModel.findById(commentId)
        const commentCreator = await UserModel.findById(comment?.creator?.creatorId)

        // Only creator can delete

        if(commentCreator?._id != req.user.id) {
            return next(new HttpError("Unauthorized actions", 403));
        }

        // remove comment id from array

        await PostModel.findByIdAndUpdate(comment?.postId, {$pull: {comments: commentId}})
        const deletedComment = await CommentModel.findByIdAndDelete(commentId)
        res.json(deletedComment)
    } catch (err) {
        return next(new HttpError(err));
    }
}


module.exports = {createComment, getPostComments, deleteComment}