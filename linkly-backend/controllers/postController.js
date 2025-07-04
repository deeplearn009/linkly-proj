const HttpError = require('../models/errorModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')
const Notification = require('../models/notificationModel')
const { io, getReceiverSocketId } = require('../socket/socket')

const {v4: uuid} = require('uuid')
const cloudinary = require('../utils/cloudinary');
const fs = require('fs')
const path = require('path')

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const createPost = async (req, res, next) => {
    try {
        const {body} = req.body

        if(!body) {
            return next(new HttpError('Fill in text field and choose media', 422));
        }

        if(!req.files.media) {
            return next(new HttpError('Please choose an image or video', 422));
        } else {
            const {media} = req.files;
            const fileExtension = media.name.split('.').pop().toLowerCase();
            const isVideo = ['mp4', 'mov', 'avi', 'wmv'].includes(fileExtension);
            const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);

            if (!isVideo && !isImage) {
                return next(new HttpError('Please upload a valid image or video file', 422));
            }

            let filename = media.name
            filename = filename.split('.')
            filename = filename[0] + uuid() + '.' + filename[filename.length - 1]
            await media.mv(path.join(__dirname, '..', 'uploads', filename), async (err) => {
                if(err) {
                    return next(new HttpError(err));
                }

                const result = await cloudinary.uploader.upload(
                    path.join(__dirname, '..', 'uploads', filename), 
                    {
                        resource_type: isVideo ? "video" : "image",
                        chunk_size: 6000000 // 6MB chunks for video uploads
                    }
                )

                if(!result.secure_url) {
                    return next(new HttpError(`Could not upload ${isVideo ? 'video' : 'image'} to cloudinary`, 422));
                }

                const newPost = await PostModel.create({
                    creator: req.user.id, 
                    body, 
                    image: result.secure_url,
                    mediaType: isVideo ? 'video' : 'image'
                })
                await UserModel.findByIdAndUpdate(newPost?.creator, {$push: {posts: newPost?._id}})
                res.json(newPost)

                // Clean up the temporary file
                fs.unlink(path.join(__dirname, '..', 'uploads', filename), (err) => {
                    if (err) console.error('Error deleting temporary file:', err);
                });
            })
        }

    } catch (error) {
        return next(new HttpError(error))
    }
}










const getPost = async (req, res, next) => {
    try {
        const {id} = req.params
        // const post = await PostModel.findById(id)

        const post = await PostModel.findById(id).populate('creator').populate({path: 'comments',options: {sort: {createdAt: -1}}})
        res.json(post)
    } catch (error) {
        return next(new HttpError(error))
    }
}

















const getPosts = async (req, res, next) => {
    try {
        const posts = await PostModel.find().sort({createdAt: -1})
        res.json(posts)
    } catch (error) {
        return next(new HttpError(error))
    }
}












const updatePost = async (req, res, next) => {
    try {
        const postId = req.params.id
        const {body} = req.body

        const post = await PostModel.findById(postId)

        if(post?.creator != req.user.id) {
            return next(new HttpError("You cant update the post since you are not a creator", 403))
        }

        const updatedPost = await PostModel.findByIdAndUpdate(postId, {body}, {new: true})
        res.json(updatedPost).status(200)

    } catch (error) {
        return next(new HttpError(error))
    }
}












const deletePost = async (req, res, next) => {
    try {
        const postId = req.params.id

        const post = await PostModel.findById(postId)

        if(post?.creator != req.user.id) {
            return next(new HttpError("You cant update the post since you are not a creator", 403))
        }

        const deletedPost = await PostModel.findByIdAndDelete(postId)
        await UserModel.findByIdAndUpdate(post?.creator, {$pull: {posts: post?._id}})
        res.json(deletedPost)

    } catch (error) {
        return next(new HttpError(error))
    }
}







const getFollowingPosts = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.user.id)

        const posts = await PostModel.find({creator: {$in: user?.following}} )

        res.json(posts)

    } catch (error) {
        return next(new HttpError(error))
    }
}
















const likeDislikePost = async (req, res, next) => {
    try {
        const {id} = req.params
        const post = await PostModel.findById(id)
        let updatedPost
        const isLiked = post?.likes.includes(req.user.id)
        if(isLiked) {
            updatedPost = await PostModel.findByIdAndUpdate(id, {$pull: {likes: req.user.id}}, {new: true})
        } else {
            updatedPost = await PostModel.findByIdAndUpdate(id, {$push: {likes: req.user.id}}, {new: true})
            // Create notification only if not liking own post
            if (post?.creator.toString() !== req.user.id) {
                const notification = await Notification.create({
                    recipient: post.creator,
                    sender: req.user.id,
                    type: 'like',
                    post: post._id
                });
                // Emit real-time notification
                const receiverSocketId = getReceiverSocketId(post.creator.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('notification', notification);
                }
            }
        }
        res.json(updatedPost)
    } catch (error) {
        return next(new HttpError(error))
    }
}








const getUserPosts = async (req, res, next) => {
    try {
        const userId = req.params.id

        const posts = await UserModel.findById(userId).populate({path: "posts", options: {sort: {createdAt: -1}}})

        res.json(posts)

    } catch (error) {
        return next(new HttpError(error))
    }
}









const createBookmark = async (req, res, next) => {
    try {
        const {id} = req.params

        //get user and check if post already in his bookmarks

        const user = await UserModel.findById(req.user.id)

        const postIsBookmarked = user?.bookmarks?.includes(id)

        if(postIsBookmarked) {
            const userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$pull: {bookmarks: id}}, {new: true})
            res.json(userBookmarks)
        } else {
            const userBookmarks = await UserModel.findByIdAndUpdate(req.user.id, {$push: {bookmarks: id}}, {new: true})
            res.json(userBookmarks)
        }

    } catch (error) {
        return next(new HttpError(error))
    }
}






const getUserBookmarks = async (req, res, next) => {
    try {
        const userBookmarks = await UserModel.findById(req.user.id).populate({path: "bookmarks", options: {sort: {createdAt: -1}}})
        res.json(userBookmarks)
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getUserLikedPosts = async (req, res, next) => {
    try {
        const userId = req.params.id;
        
        // Find all posts where the user's ID is in the likes array
        const posts = await PostModel.find({ likes: userId })
            .populate({
                path: 'creator',
                select: 'fullName profilePhoto email'
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'creator',
                    select: 'fullName profilePhoto'
                },
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        return next(new HttpError(error));
    }
}

module.exports = {createPost, updatePost, deletePost, getPost, getPosts, getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts, getUserLikedPosts}


