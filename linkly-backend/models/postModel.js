const {Schema, model} = require('mongoose')

const postSchema = new Schema({
    creator: {type: Schema.Types.ObjectId, ref: 'User'},
    body: {type: String, required: true},
    image: {type: String, required: true},
    mediaType: {type: String, enum: ['image', 'video'], default: 'image'},
    likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}],
}, {timestamps: true})

module.exports = model('Post', postSchema)