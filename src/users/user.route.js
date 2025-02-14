const express = require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY

router.post("/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        // ค้นหา admin
        const admin = await User.findOne({ username, role: 'admin' });
        if (!admin) {
            return res.status(404).json({ message: "Admin Not Found!" });
        }

        // เปรียบเทียบรหัสผ่านโดยตรง แทนการใช้ bcrypt
        if (password !== admin.password) {
            return res.status(401).json({ message: "Invalid Password!" });
        }

        // สร้าง token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role 
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Authentication Successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Failed To Login Admin", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;