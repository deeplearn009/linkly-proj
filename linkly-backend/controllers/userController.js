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
            profilePhoto: user?.profilePhoto
        }).status(200);

    } catch (err) {
        return next(new HttpError(err));
    }
}


const getUser = async (req, res, next) => {
    try {
        const {id} = req.params;
        const user = await UserModel.findById(id)
        res.json(user).status(200)

        if (!user) {
            return next(new HttpError('User notfound', 422));
        }

    } catch (err) {
        return next(new HttpError(err));
    }
}


const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.find().limit(10).sort({createdAt: -1})
        res.json(users)
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

module.exports = {registerUser, changeUserAvatar, editUser, loginUser, getUser, getUsers, followUnfollowUser}
