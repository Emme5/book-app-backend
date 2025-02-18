const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY

const verifyAdminToken = (req, res, next) => {
    try {
        // Check JWT_SECRET first
        if (!JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables');
            return res.status(500).json({
                message: "Server configuration error: JWT_SECRET not configured"
            });
        }

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

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                // Handle specific JWT errors
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        message: "Token has expired",
                        error: err.message
                    });
                }
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({
                        message: "Invalid token format",
                        error: err.message
                    });
                }
                
                console.error('JWT Verification Error:', err);
                return res.status(403).json({
                    message: "Token verification failed",
                    error: err.message
                });
            }
            
            if (!user || user.role !== 'admin') {
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
            message: "Internal server error during token verification",
            error: error.message
        });
    }
};

module.exports = verifyAdminToken;