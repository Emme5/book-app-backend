const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY

const verifyAdminToken = (req, res, next) => {
    try {
        // เพิ่ม debugging
        console.log('Headers:', req.headers);
        const authHeader = req.headers['authorization'];
        console.log('Auth Header:', authHeader);

        const token = authHeader?.split(' ')[1];
        console.log('Extracted Token:', token);

        if (!token) {
            return res.status(401).json({
                message: "Access Denied: No token provided!"
            });
        }

        console.log('JWT_SECRET exists:', !!JWT_SECRET);

        jwt.verify(token, JWT_SECRET, (err, user) => {
                if (err) {
                    console.error('JWT Verification Error:', err);
                    return res.status(403).json({
                        message: "Invalid Credentials!",
                        error: err.message
                    });
                }
                req.user = user;
                next();
            });
        } catch (error) {
            console.error('Verification Error:', error);
            res.status(500).json({
                message: "Token verification failed",
                error: error.message
            });
        }
    };

module.exports = verifyAdminToken;