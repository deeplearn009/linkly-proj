const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Admin dashboard statistics
router.get('/stats', authMiddleware, checkAdmin, adminController.getStats);
router.get('/recent-activities', authMiddleware, checkAdmin, adminController.getRecentActivities);

// User management
router.get('/users', authMiddleware, checkAdmin, adminController.getUsers);
router.get('/users/:id/stats', authMiddleware, checkAdmin, adminController.getUserStats);
router.delete('/users/:id', authMiddleware, checkAdmin, adminController.deleteUser);
router.put('/users/:id', authMiddleware, checkAdmin, adminController.updateUser);

// Comment management
router.get('/comments', authMiddleware, checkAdmin, adminController.getComments);
router.delete('/comments/:id', authMiddleware, checkAdmin, adminController.deleteComment);
router.put('/comments/:id/approve', authMiddleware, checkAdmin, adminController.approveComment);
router.put('/comments/bulk-approve', authMiddleware, checkAdmin, adminController.bulkApproveComments);

// Post management
router.get('/posts', authMiddleware, checkAdmin, adminController.getPosts);
router.delete('/posts/:id', authMiddleware, checkAdmin, adminController.deletePost);

module.exports = router; 