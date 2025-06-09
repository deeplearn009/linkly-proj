const HttpError = require('../models/errorModel')
const PostModel = require('../models/postModel')
const UserModel = require('../models/userModel')

const {v4: uuid} = require('uuid')
const cloudinary = require('../utils/cloudinary');
const fs = require('fs')
const path = require('path')

const createPost = async (req, res, next) => {
    try {
        const {body} = req.body

        if(!body) {
            return next(new HttpError('Fill in text field and choose image', 422));
        }

        if(!req.files.image) {
            return next(new HttpError('Please choose an image', 422));
        } else {
            const {image} = req.files;

            let filename = image.name
            filename = filename.split('.')
            filename = filename[0] + uuid() + '.' + filename[filename.length - 1]
            await image.mv(path.join(__dirname, '..', 'uploads', filename), async (err) => {
                if(err) {
                    return next(new HttpError(err));
                }

                const result = await cloudinary.uploader.upload(path.join(__dirname, '..', 'uploads', filename), {resource_type: "image"})

                if(!result.secure_url) {
                    return next(new HttpError("Could not upload image to cloudinary", 422));
                }

                const newPost = await PostModel.create({creator: req.user.id, body, image: result.secure_url})
                await UserModel.findByIdAndUpdate(newPost?.creator, {$push: {posts: newPost?._id}})
                res.json(newPost)


            })

        }

    } catch (error) {
        return next(new HttpError(error))
    }
}










const getPost = async (req, res, next) => {
    try {
        const {id} = req.params
        const post = await PostModel.findById(id)
        res.json(post)
        // const post = await PostModel.findById(id).populate('creator').populate({path: 'comments',options: {sort: {createdAt: -1}}})
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
        res.json("Delete Post")
    } catch (error) {
        return next(new HttpError(error))
    }
}


const getFollowingPosts = async (req, res, next) => {
    try {
        res.json("Get following Posts")
    } catch (error) {
        return next(new HttpError(error))
    }
}

const likeDislikePost = async (req, res, next) => {
    try {
        res.json("Like/Dislike Post")
    } catch (error) {
        return next(new HttpError(error))
    }
}



const getUserPosts = async (req, res, next) => {
    try {
        res.json("Get user Posts")
    } catch (error) {
        return next(new HttpError(error))
    }
}



const createBookmark = async (req, res, next) => {
    try {
        res.json("Create Bookmark")
    } catch (error) {
        return next(new HttpError(error))
    }
}


const getUserBookmarks = async (req, res, next) => {
    try {
        res.json("Get Bookmarks of user")
    } catch (error) {
        return next(new HttpError(error))
    }
}


module.exports = {createPost, updatePost, deletePost, getPost, getPosts, getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts}


