const User = require('../models/userModel');
const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const Notification = require('../models/notificationModel');
const Story = require('../models/storyModel');
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
        
        // Calculate active users (users who have posted, commented, or been active in the last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsers = await User.countDocuments({
            $or: [
                { createdAt: { $gte: thirtyDaysAgo } },
                { _id: { $in: await Post.distinct('creator', { createdAt: { $gte: thirtyDaysAgo } }) } },
                { _id: { $in: await Comment.distinct('creator.creatorId', { createdAt: { $gte: thirtyDaysAgo } }) } }
            ]
        });

        res.json({
            totalUsers,
            totalComments,
            totalPosts,
            activeUsers
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

        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return next(new HttpError('User not found', 404));
        }

        // Prevent admin from deleting themselves
        if (userId === req.user.id) {
            return next(new HttpError('Cannot delete your own account', 400));
        }

        // Prevent deletion of other admins (optional safety measure)
        if (user.role === 'admin' && req.user.role === 'admin') {
            return next(new HttpError('Cannot delete another admin account', 400));
        }

        // Start a session for transaction
        const session = await User.startSession();
        session.startTransaction();

        try {
            // 1. Delete all posts by the user
            const userPosts = await Post.find({ creator: userId });
            const postIds = userPosts.map(post => post._id);
            
            // Delete all comments on user's posts
            await Comment.deleteMany({ postId: { $in: postIds } }, { session });
            
            // Delete all posts
            await Post.deleteMany({ creator: userId }, { session });

            // 2. Delete all comments by the user
            await Comment.deleteMany({ 'creator.creatorId': userId }, { session });

            // 3. Delete all conversations involving the user
            const userConversations = await Conversation.find({ 
                participants: userId 
            });
            const conversationIds = userConversations.map(conv => conv._id);
            
            // Delete all messages in these conversations
            await Message.deleteMany({ 
                conversationId: { $in: conversationIds } 
            }, { session });
            
            // Delete the conversations
            await Conversation.deleteMany({ participants: userId }, { session });

            // 4. Delete all notifications related to the user
            await Notification.deleteMany({
                $or: [
                    { recipient: userId },
                    { sender: userId }
                ]
            }, { session });

            // 5. Delete all stories by the user
            await Story.deleteMany({ user: userId }, { session });

            // 6. Remove user from other users' followers/following lists
            await User.updateMany(
                { followers: userId },
                { $pull: { followers: userId } },
                { session }
            );
            
            await User.updateMany(
                { following: userId },
                { $pull: { following: userId } },
                { session }
            );

            // 7. Remove user's bookmarks from other users' posts
            await Post.updateMany(
                { likes: userId },
                { $pull: { likes: userId } },
                { session }
            );

            // 8. Remove user from story views
            await Story.updateMany(
                { views: userId },
                { $pull: { views: userId } },
                { session }
            );

            // 9. Remove user's bookmarks from their own bookmarks list
            await User.updateMany(
                { bookmarks: { $exists: true } },
                { $pull: { bookmarks: { $in: postIds } } },
                { session }
            );

            // 10. Remove user from other users' bookmarks
            await User.updateMany(
                { bookmarks: { $exists: true } },
                { $pull: { bookmarks: { $in: postIds } } },
                { session }
            );

            // 11. Clean up any remaining references in posts (comments array)
            await Post.updateMany(
                { comments: { $exists: true } },
                { $pull: { comments: { $in: await Comment.find({ 'creator.creatorId': userId }).distinct('_id') } } },
                { session }
            );

            // 12. Finally, delete the user
            await User.findByIdAndDelete(userId, { session });

            // Commit the transaction
            await session.commitTransaction();
            
            res.json({ 
                message: 'User and all related data deleted successfully',
                deletedData: {
                    posts: userPosts.length,
                    conversations: userConversations.length,
                    followers: user.followers.length,
                    following: user.following.length
                }
            });

        } catch (error) {
            // Rollback the transaction on error
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }

    } catch (error) {
        console.error('Error deleting user:', error);
        next(new HttpError('Error deleting user and related data', 500));
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
            .populate('postId', 'body creator')
            .populate('postId.creator', 'fullName')
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
            .populate('creator', 'fullName email')
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

// Get user statistics for deletion preview
exports.getUserStats = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        const userId = req.params.id;

        // Check if user exists
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return next(new HttpError('User not found', 404));
        }

        // Get statistics
        const [
            postsCount,
            commentsCount,
            conversationsCount,
            notificationsCount,
            storiesCount,
            followersCount,
            followingCount
        ] = await Promise.all([
            Post.countDocuments({ creator: userId }),
            Comment.countDocuments({ 'creator.creatorId': userId }),
            Conversation.countDocuments({ participants: userId }),
            Notification.countDocuments({
                $or: [
                    { recipient: userId },
                    { sender: userId }
                ]
            }),
            Story.countDocuments({ user: userId }),
            User.countDocuments({ followers: userId }),
            User.countDocuments({ following: userId })
        ]);

        res.json({
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            },
            stats: {
                posts: postsCount,
                comments: commentsCount,
                conversations: conversationsCount,
                notifications: notificationsCount,
                stories: storiesCount,
                followers: followersCount,
                following: followingCount
            }
        });

    } catch (error) {
        console.error('Error getting user stats:', error);
        next(new HttpError('Error getting user statistics', 500));
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return next(new HttpError('Admin access required', 403));
        }

        // Get recent user registrations (last 5)
        const recentUsers = await User.find()
            .select('fullName email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent posts (last 5)
        const recentPosts = await Post.find()
            .populate('creator', 'fullName')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get recent comments (last 5)
        const recentComments = await Comment.find()
            .populate('postId', 'body')
            .sort({ createdAt: -1 })
            .limit(5);

        // Combine and format activities
        const activities = [];

        // Add user registrations
        recentUsers.forEach(user => {
            activities.push({
                _id: user._id,
                type: 'user_registration',
                userName: user.fullName,
                userEmail: user.email,
                createdAt: user.createdAt,
                description: `${user.fullName} joined the platform`
            });
        });

        // Add recent posts
        recentPosts.forEach(post => {
            activities.push({
                _id: post._id,
                type: 'post',
                userName: post.creator?.fullName || 'Unknown',
                postContent: post.body?.substring(0, 50) + (post.body?.length > 50 ? '...' : ''),
                createdAt: post.createdAt,
                description: `${post.creator?.fullName || 'Unknown'} created a new post`
            });
        });

        // Add recent comments
        recentComments.forEach(comment => {
            activities.push({
                _id: comment._id,
                type: 'comment',
                userName: comment.creator?.creatorName || 'Unknown',
                commentContent: comment.comment?.substring(0, 50) + (comment.comment?.length > 50 ? '...' : ''),
                postContent: comment.postId?.body?.substring(0, 30) + (comment.postId?.body?.length > 30 ? '...' : ''),
                createdAt: comment.createdAt,
                description: `${comment.creator?.creatorName || 'Unknown'} commented on a post`
            });
        });

        // Sort all activities by creation date (most recent first) and limit to 15
        activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const recentActivities = activities.slice(0, 15);

        res.json(recentActivities);

    } catch (error) {
        console.error('Error getting recent activities:', error);
        next(new HttpError('Error getting recent activities', 500));
    }
}; 