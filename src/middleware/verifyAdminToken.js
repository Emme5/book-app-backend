const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY

const verifyAdminToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: "No authorization header found"
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: "No token found in authorization header"
            });
        }

        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({
                message: "Server configuration error"
            });
        }

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                console.error('JWT Verification Error:', err);
                return res.status(403).json({
                    message: "Invalid token",
                    error: err.message
                });
            }
            if (!user.isAdmin) {
                return res.status(403).json({
                    message: "Access denied: Admin privileges required"
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Token Verification Error:', error);
        res.status(500).json({
            message: "Token verification failed",
            error: error.message
        });
    }
};

module.exports = verifyAdminToken;