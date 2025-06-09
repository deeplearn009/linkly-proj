const router = require("express").Router();
const authMiddleware = require('../middleware/authMiddleware')

const {registerUser, changeUserAvatar, editUser, loginUser, getUser, getUsers, followUnfollowUser} = require('../controllers/userController')

const {createPost, updatePost, deletePost, getPost, getPosts, getUserPosts, getUserBookmarks, createBookmark, likeDislikePost, getFollowingPosts} = require('../controllers/postController')


// User routes

router.post('/users/register', registerUser)
router.post('/users/login', loginUser)
router.get('/users/bookmarks',authMiddleware, getUserBookmarks)
router.get('/users/:id', authMiddleware, getUser)
router.get('/users', authMiddleware,getUsers)
router.patch('/users/:id', authMiddleware ,editUser)
router.get('/users/:id/follow-unfollow', authMiddleware,followUnfollowUser)
router.post('/users/avatar', authMiddleware,changeUserAvatar)
router.get('/users/:id/posts', authMiddleware,getUserPosts)


// Post routes
router.post('/posts', authMiddleware,createPost)
router.get('/posts/following', authMiddleware,getFollowingPosts)
router.get('/posts/:id', authMiddleware,getPost)
router.get('/posts', authMiddleware, getPosts)
router.patch('/posts/:id', authMiddleware,updatePost)
router.delete('/posts/:id', authMiddleware, deletePost)
router.get('/posts/:id/like', authMiddleware, likeDislikePost)
router.get('/posts/:id/bookmark', authMiddleware, createBookmark)



module.exports = router

