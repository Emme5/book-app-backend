const express = require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

router.post("/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Log สำหรับ debug
        console.log('Attempting admin login for username:', username);
        
        // ตรวจสอบว่ามีข้อมูลครบไหม
        if (!username || !password) {
            return res.status(400).json({ 
                message: "Please provide both username and password" 
            });
        }

        // ค้นหา admin
        const admin = await User.findOne({ username, role: 'admin' });
        if (!admin) {
            console.log('Admin not found for username:', username);
            return res.status(404).json({ 
                message: "ไม่พบบัญชีผู้ดูแลระบบ" 
            });
        }

        // เปรียบเทียบรหัสผ่านด้วย bcrypt
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            console.log('Invalid password for admin:', username);
            return res.status(401).json({ 
                message: "รหัสผ่านไม่ถูกต้อง" 
            });
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

        console.log('Admin login successful:', username);

        return res.status(200).json({
            message: "เข้าสู่ระบบสำเร็จ",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ 
            message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
            error: error.message 
        });
    }
});

module.exports = router;