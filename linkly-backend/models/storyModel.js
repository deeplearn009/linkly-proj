const { Schema, model } = require('mongoose');

const storySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 },
  views: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = model('Story', storySchema); 