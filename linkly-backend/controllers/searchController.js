const HttpError = require('../models/errorModel');
const UserModel = require('../models/userModel');

const searchUsers = async (req, res, next) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.json([]);
        }

        const users = await UserModel.find({
            $or: [
                { fullName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        })
        .select('fullName profilePhoto email')
        .limit(5);

        res.json(users);
    } catch (error) {
        return next(new HttpError(error));
    }
};

module.exports = {
    searchUsers
}; 