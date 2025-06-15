const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const HttpError = require('../models/errorModel');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new HttpError('Admin access required', 403));
    }
    next();
};

// Get dashboard statistics
exports.getStats = async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const totalUsers = await User.countDocuments();
        const totalComments = await Comment.countDocuments();
        const totalPosts = await Post.countDocuments();

        res.json({
            totalUsers,
            totalComments,
            totalPosts
        });
    } catch (error) {
        next(new HttpError('Error fetching statistics', 500));
    }
};

// Get all users
exports.getUsers = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(new HttpError('Error fetching users', 500));
    }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return next(new HttpError('User not found', 404));
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(new HttpError('Error deleting user', 500));
    }
};

// Update user
exports.updateUser = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const { role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return next(new HttpError('User not found', 404));
        }
        res.json(user);
    } catch (error) {
        next(new HttpError('Error updating user', 500));
    }
};

// Get all comments
exports.getComments = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const comments = await Comment.find()
            .populate('creator.creatorId', 'username')
            .populate('postId', 'title')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        next(new HttpError('Error fetching comments', 500));
    }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const comment = await Comment.findByIdAndDelete(req.params.id);
        if (!comment) {
            return next(new HttpError('Comment not found', 404));
        }
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        next(new HttpError('Error deleting comment', 500));
    }
};

// Approve comment
exports.approveComment = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!comment) {
            return next(new HttpError('Comment not found', 404));
        }
        res.json(comment);
    } catch (error) {
        next(new HttpError('Error approving comment', 500));
    }
};

// Bulk approve comments
exports.bulkApproveComments = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const result = await Comment.updateMany(
            { status: 'pending' },
            { status: 'approved' }
        );
        res.json({ message: `${result.modifiedCount} comments approved successfully` });
    } catch (error) {
        next(new HttpError('Error bulk approving comments', 500));
    }
};

// Get all posts
exports.getPosts = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const posts = await Post.find()
            .populate('creator', 'fullName')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        next(new HttpError('Error fetching posts', 500));
    }
};

// Delete post
exports.deletePost = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const post = await Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return next(new HttpError('Post not found', 404));
        }
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        next(new HttpError('Error deleting post', 500));
    }
}; 