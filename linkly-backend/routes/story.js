const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const storyController = require('../controllers/storyController');

// Create a new story (multiple supported)
router.post('/', authMiddleware, storyController.createStory);
// Get all stories (grouped by user)
router.get('/', authMiddleware, storyController.getStories);
// Get stories for a specific user
router.get('/:userId', authMiddleware, storyController.getUserStories);
// Delete a story
router.delete('/:id', authMiddleware, storyController.deleteStory);
// Mark a story as viewed
router.post('/:id/view', authMiddleware, storyController.markStoryViewed);
// Get viewers of a story
router.get('/:id/views', authMiddleware, storyController.getStoryViews);

module.exports = router; 