const {Schema, model} = require('mongoose');

const userSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    profilePhoto: {type: String, default: "https://res.cloudinary.com/deaqvu2on/image/upload/v1749465286/Sample_User_Icon_qmu5gw.png"},
    bannerImage: {type: String, default: ""},
    profileBackground: {type: String, default: ""},
    theme: {type: String, default: "default"},
    website: {type: String, default: ""},
    location: {type: String, default: ""},
    socialLinks: {
        twitter: {type: String, default: ""},
        facebook: {type: String, default: ""},
        instagram: {type: String, default: ""},
        linkedin: {type: String, default: ""}
    },
    bio: {type: String, default: 'no bio yet'},
    role: {type: String, enum: ['user', 'admin'], default: 'user'},
    followers: [{type: Schema.Types.ObjectId, ref: "User"}],
    following: [{type: Schema.Types.ObjectId, ref: "User"}],
    bookmarks: [{type: Schema.Types.ObjectId, ref: "Post"}],
    posts: [{type: Schema.Types.ObjectId, ref: "Post"}],
}, {timestamps: true});

module.exports = model("User", userSchema);