const express = require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET_KEY;

router.post("/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        // เพิ่ม debug logs
        console.log('Received credentials:', { username, password });

        // ตรวจสอบว่ามีข้อมูลครบไหม
        if (!username || !password) {
            return res.status(400).json({ 
                message: "กรุณากรอกข้อมูลให้ครบ" 
            });
        }

        // หา admin ในฐานข้อมูล
        const admin = await User.findOne({ username });
        console.log('Found user:', admin);

        if (!admin || admin.role !== 'admin') {
            return res.status(404).json({ 
                message: "ไม่พบบัญชีผู้ดูแลระบบ" 
            });
        }

        // เช็ครหัสผ่านตรงๆ
        if (password !== admin.password) {
            return res.status(401).json({ 
                message: "รหัสผ่านไม่ถูกต้อง" 
            });
        }

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
            message: "เข้าสู่ระบบสำเร็จ",
            token,
            user: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ 
            message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
            error: error.message 
        });
    }
});

module.exports = router;