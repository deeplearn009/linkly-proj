const jwt = require('jsonwebtoken')
const HttpError = require('../models/errorModel')
const User = require('../models/userModel')

const authMiddleware = async (req, res, next) => {
    const Authorization = req.headers.Authorization || req.headers.authorization;

    if(Authorization && Authorization.startsWith('Bearer')) {
        const token = Authorization.split(' ')[1]
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new HttpError("User not found", 404));
            }

            req.user = {
                ...decoded,
                role: user.role
            };
            next();
        } catch (err) {
            return next(new HttpError("Unauthorized. Invalid Token", 403));
        }
    } else {
        return next(new HttpError("Unauthorized. No Token", 401));
    }
}

module.exports = authMiddleware;

