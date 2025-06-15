const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Admin dashboard statistics
router.get('/stats', authMiddleware, adminController.getStats);

// User management
router.get('/users', authMiddleware, adminController.getUsers);
router.delete('/users/:id', authMiddleware, adminController.deleteUser);
router.put('/users/:id', authMiddleware, adminController.updateUser);

// Comment management
router.get('/comments', authMiddleware, adminController.getComments);
router.delete('/comments/:id', authMiddleware, adminController.deleteComment);
router.put('/comments/:id/approve', authMiddleware, adminController.approveComment);
router.put('/comments/bulk-approve', authMiddleware, adminController.bulkApproveComments);

// Post management
router.get('/posts', authMiddleware, adminController.getPosts);
router.delete('/posts/:id', authMiddleware, adminController.deletePost);

module.exports = router; 