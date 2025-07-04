const Story = require('../models/storyModel');
const User = require('../models/userModel');
const HttpError = require('../models/errorModel');
const cloudinary = require('../utils/cloudinary');
const { v4: uuid } = require('uuid');
const path = require('path');
const fs = require('fs');

// Create new stories (support multiple uploads)
exports.createStory = async (req, res, next) => {
  try {
    if (!req.files || !req.files.media) {
      return next(new HttpError('Please choose an image or video', 422));
    }
    let mediaFiles = req.files.media;
    if (!Array.isArray(mediaFiles)) mediaFiles = [mediaFiles];
    const createdStories = [];
    for (const media of mediaFiles) {
      const fileExtension = media.name.split('.').pop().toLowerCase();
      const isVideo = ['mp4', 'mov', 'avi', 'wmv'].includes(fileExtension);
      const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension);
      if (!isVideo && !isImage) {
        continue; // skip invalid file
      }
      let filename = media.name;
      filename = filename.split('.');
      filename = filename[0] + uuid() + '.' + filename[filename.length - 1];
      const uploadPath = path.join(__dirname, '..', 'uploads', filename);
      await new Promise((resolve, reject) => {
        media.mv(uploadPath, async (err) => {
          if (err) return reject(err);
          const result = await cloudinary.uploader.upload(
            uploadPath,
            {
              resource_type: isVideo ? 'video' : 'image',
              chunk_size: 6000000
            }
          );
          if (!result.secure_url) return reject(new Error('Cloudinary upload failed'));
          const newStory = await Story.create({
            user: req.user.id,
            mediaUrl: result.secure_url,
            mediaType: isVideo ? 'video' : 'image',
            views: [],
          });
          createdStories.push(newStory);
          fs.unlink(uploadPath, (err) => { if (err) console.error('Error deleting temp file:', err); });
          resolve();
        });
      });
    }
    if (createdStories.length === 0) {
      return next(new HttpError('No valid files uploaded', 422));
    }
    res.json(createdStories);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Delete a story (only by owner)
exports.deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return next(new HttpError('Story not found', 404));
    if (story.user.toString() !== req.user.id) {
      return next(new HttpError('Unauthorized', 403));
    }
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: 'Story deleted' });
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Mark a story as viewed
exports.markStoryViewed = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return next(new HttpError('Story not found', 404));
    if (!story.views.includes(req.user.id) && story.user.toString() !== req.user.id) {
      story.views.push(req.user.id);
      await story.save();
    }
    res.json({ message: 'Marked as viewed' });
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get users who viewed a story
exports.getStoryViews = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id).populate('views', 'fullName profilePhoto');
    if (!story) return next(new HttpError('Story not found', 404));
    if (story.user.toString() !== req.user.id) {
      return next(new HttpError('Unauthorized', 403));
    }
    res.json(story.views);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get all current stories, grouped by user
exports.getStories = async (req, res, next) => {
  try {
    const stories = await Story.find({})
      .populate('user', 'fullName profilePhoto')
      .sort({ createdAt: -1 });
    // Group by user
    const grouped = {};
    stories.forEach(story => {
      const userId = story.user._id.toString();
      if (!grouped[userId]) grouped[userId] = { user: story.user, stories: [] };
      grouped[userId].stories.push(story);
    });
    res.json(Object.values(grouped));
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get stories for a specific user
exports.getUserStories = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const stories = await Story.find({ user: userId })
      .populate('user', 'fullName profilePhoto')
      .sort({ createdAt: -1 });
    // Mark as viewed for each story if not owner
    if (req.user.id !== userId) {
      for (const story of stories) {
        if (!story.views.includes(req.user.id)) {
          story.views.push(req.user.id);
          await story.save();
        }
      }
    }
    res.json(stories);
  } catch (error) {
    return next(new HttpError(error));
  }
}; 