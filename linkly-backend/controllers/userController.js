const HttpError = require('../models/errorModel')
const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');
const cloudinary = require('../utils/cloudinary');


const registerUser = async (req, res, next) => {
    try {
        const {fullName, email, password, confirmPassword} = req.body;
        if (!fullName || !email || !password || !confirmPassword) {
            return next(new HttpError('Fill all fields required', 422));
        }

        //email lowercase

        const lowerCaseEmail = email.toLowerCase();

        //Check db for email exist

        const emailExists = await UserModel.findOne({email: lowerCaseEmail});
        if (emailExists) {
            return next(new HttpError('Email already exists', 422));
        }

        //Check if passwd match

        if (password !== confirmPassword) {
            return next(new HttpError('Passwords do not match', 422));
        }

        //Check passwd length

        if (password.length < 6) {
            return next(new HttpError('Password must be at least 6 characters', 422));
        }

        // hash passwd

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        //add user

        const newUser = await UserModel.create({fullName, email: lowerCaseEmail, password: hash})
        res.json(newUser).status(201);

    } catch (err) {
        return next(new HttpError(err));
    }
}


const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return next(new HttpError('Fill all fields required', 422));
        }

        // email lowercase
        const lowerCaseEmail = email.toLowerCase();

        //fetching user from db
        const user = await UserModel.findOne({email: lowerCaseEmail})

        if (!user) {
            return next(new HttpError('Invalid credentials', 422));
        }

        //compare passwd
        const comparedPassword = await bcrypt.compare(password, user?.password);

        if (!comparedPassword) {
            return next(new HttpError('Invalid credentials', 422));
        }

        const token = await jwt.sign({id: user?._id}, `${process.env.JWT_SECRET}`, {expiresIn: '1h'});
        res.json({
            token, 
            id: user?._id,
            fullName: user?.fullName,
            email: user?.email,
            profilePhoto: user?.profilePhoto,
            role: user?.role || 'user'
        }).status(200);

    } catch (err) {
        return next(new HttpError(err));
    }
}


const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await UserModel.findById(id).select("-password")

        if (!user) {
            return next(new HttpError('User notfound', 422));
        }
        res.json(user).status(200)
    } catch (err) {
        return next(new HttpError(err));
    }
}


const getUsers = async (req, res, next) => {
    try {
        // If user is admin, show all users
        if (req.user.role === 'admin') {
            const users = await UserModel.find()
                .select('-password')
                .sort({ createdAt: -1 });
            return res.json(users);
        }

        // For regular users, filter out admin users
        const users = await UserModel.find({ role: { $ne: 'admin' } })
            .select('-password')
            .limit(10)
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        return next(new HttpError(err));
    }
}


const editUser = async (req, res, next) => {
    try {
        const {fullName, bio} = req.body;
        const editedUser = await UserModel.findByIdAndUpdate(req.user.id,
            {fullName, bio}, {new: true})
        res.json(editedUser).status(200)

    } catch (err) {
        return next(new HttpError(err));
    }
}


const followUnfollowUser = async (req, res, next) => {
    try {
        const userToFollowId = req.params.id;
        if (req.user.id === userToFollowId) {
            return next(new HttpError('You cant follow yourself', 422));
        }

        const currentUser = await UserModel.findById(req.user.id)
        const isFollowing = currentUser?.following?.includes(userToFollowId);

        //follow if not following

        if (!isFollowing) {
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, {$push: {followers: req.user.id}}, {new: true})
            await UserModel.findByIdAndUpdate(req.user.id, {$push: {following: userToFollowId}}, {new: true})
            res.json(updatedUser).status(200)
        } else {
            const updatedUser = await UserModel.findByIdAndUpdate(userToFollowId, {$pull: {followers: req.user.id}}, {new: true})
            await UserModel.findByIdAndUpdate(req.user.id, {$pull: {following: userToFollowId}}, {new: true})
            res.json(updatedUser).status(200)
        }

    } catch (err) {
        return next(new HttpError(err));
    }
}


const changeUserAvatar = async (req, res, next) => {
    try {
        if (!req.files.avatar) {
            return next(new HttpError('Please choose an image', 422));
        }

        const {avatar} = req.files;

        let fileName = avatar.name
        let splittedFileName = fileName.split('.');
        let newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1];
        avatar.mv(path.join(__dirname, "..", "uploads", newFileName), async (err) => {
            if (err) {
                return next(new HttpError(err));
            }
            // store in cloudinary

            const result = await cloudinary.uploader.upload(path.join(__dirname, "..", "uploads", newFileName), {resource_type: "image"})

            if (!result.secure_url) {
                return next(new HttpError("Cannot upload an image to cloudinary", 422));
            }

            const updatedUser = await UserModel.findByIdAndUpdate(req.user.id, {profilePhoto: result?.secure_url}, {new: true})
            res.json(updatedUser).status(200)

        });


    } catch (err) {
        return next(new HttpError(err));
    }
}

const getFollowers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select('followers');
        
        if (!user) {
            return next(new HttpError('User not found', 422));
        }

        // Base query for followers
        const query = { _id: { $in: user.followers } };

        // If user is not admin, exclude admin users
        if (req.user.role !== 'admin') {
            query.role = { $ne: 'admin' };
        }

        const followers = await UserModel.find(query)
            .select('_id fullName email profilePhoto');
        
        res.json(followers).status(200);
    } catch (err) {
        return next(new HttpError(err));
    }
};

const getFollowing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select('following');
        
        if (!user) {
            return next(new HttpError('User not found', 422));
        }

        // Base query for following
        const query = { _id: { $in: user.following } };

        // If user is not admin, exclude admin users
        if (req.user.role !== 'admin') {
            query.role = { $ne: 'admin' };
        }

        const following = await UserModel.find(query)
            .select('_id fullName email profilePhoto');
        
        res.json(following).status(200);
    } catch (err) {
        return next(new HttpError(err));
    }
};

const removeFollower = async (req, res, next) => {
    try {
        const followerId = req.params.id;
        const currentUserId = req.user.id;

        // Remove follower from current user's followers list
        await UserModel.findByIdAndUpdate(currentUserId, {
            $pull: { followers: followerId }
        });

        // Remove current user from follower's following list
        await UserModel.findByIdAndUpdate(followerId, {
            $pull: { following: currentUserId }
        });

        res.json({ message: 'Follower removed successfully' }).status(200);
    } catch (err) {
        return next(new HttpError(err));
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.json([]);
        }

        // Base query for user search
        const searchQuery = {
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        // If user is not admin, exclude admin users from search
        if (req.user.role !== 'admin') {
            searchQuery.role = { $ne: 'admin' };
        }

        const users = await UserModel.find(searchQuery)
            .select('fullName profilePhoto email')
            .limit(5);

        res.json(users);
    } catch (error) {
        return next(new HttpError(error));
    }
};

module.exports = {
    registerUser,
    changeUserAvatar,
    editUser,
    loginUser,
    getUser,
    getUsers,
    followUnfollowUser,
    getFollowers,
    getFollowing,
    removeFollower,
    searchUsers
}
