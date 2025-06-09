const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    profilePhoto: {type: String, default: 'https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png'},
    bio: {type: String, default: 'no bio yet'},
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],
    following: [{type: Schema.Types.ObjectId, ref: 'User'}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
}, {timestamps: true});

module.exports = model('User', userSchema);