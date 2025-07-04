const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

const {
    registerUser,
    changeUserAvatar,
    changeUserBanner,
    editUser,
    loginUser,
    getUser,
    getUsers,
    followUnfollowUser,
    getFollowers,
    getFollowing,
    removeFollower,
    searchUsers,
    removeUserAvatar
} = require('../controllers/userController')

const {
    createPost,
    updatePost,
    deletePost,
    getPost,
    getPosts,
    getUserPosts,
    getUserBookmarks,
    createBookmark,
    likeDislikePost,
    getFollowingPosts,
    getUserLikedPosts
} = require('../controllers/postController')


const {createComment, getPostComments, deleteComment} = require('../controllers/commentController')

const {getConversations, getMessages, createMessage, deleteConversation} = require('../controllers/messageController')

const notificationController = require('../controllers/notificationController')


// User routes

router.post('/users/register', registerUser)
router.post('/users/login', loginUser)
router.get('/users/bookmarks', authMiddleware, getUserBookmarks)
router.get('/users/:id', authMiddleware, getUser)
router.get('/users', authMiddleware, getUsers)
router.patch('/users/:id', authMiddleware, editUser)
router.get('/users/:id/follow-unfollow', authMiddleware, followUnfollowUser)
router.post('/users/avatar', authMiddleware, changeUserAvatar)
router.post('/users/banner', authMiddleware, changeUserBanner)
router.get('/users/:id/posts', authMiddleware, getUserPosts)
router.get('/users/:id/likes', authMiddleware, getUserLikedPosts)
router.get('/users/:id/followers', authMiddleware, getFollowers)
router.get('/users/:id/following', authMiddleware, getFollowing)
router.delete('/users/:id/remove-follower', authMiddleware, removeFollower)
router.get('/search/users', authMiddleware, searchUsers)
router.delete('/users/avatar', authMiddleware, removeUserAvatar)


// Post routes
router.post('/posts', authMiddleware, createPost)
router.get('/posts/following', authMiddleware, getFollowingPosts)
router.get('/posts/:id', authMiddleware, getPost)
router.get('/posts', authMiddleware, getPosts)
router.patch('/posts/:id', authMiddleware, updatePost)
router.delete('/posts/:id', authMiddleware, deletePost)
router.get('/posts/:id/like', authMiddleware, likeDislikePost)
router.get('/posts/:id/bookmark', authMiddleware, createBookmark)


// Comment routes
router.post('/comments/:postId', authMiddleware, createComment)
router.get('/comments/:postId', authMiddleware, getPostComments)
router.delete('/comments/:commentId', authMiddleware, deleteComment)


// Message routes
router.post('/messages/:receiverId', authMiddleware, createMessage)
router.get('/messages/:receiverId', authMiddleware, getMessages)
router.get('/conversations', authMiddleware, getConversations)
router.delete('/conversations/:conversationId', authMiddleware, deleteConversation)


// Notification routes
router.get('/notifications', authMiddleware, notificationController.getNotifications)
router.patch('/notifications/:id/read', authMiddleware, notificationController.markAsRead)
router.patch('/notifications/read-all', authMiddleware, notificationController.markAllAsRead)
router.delete('/notifications/:id', authMiddleware, notificationController.deleteNotification)

module.exports = router

