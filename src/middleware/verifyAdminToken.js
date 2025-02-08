const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY

const verifyAdminToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // ดึง Token ออกจาก Header
    console.log('JWT Token:',token)

    if (!token) {
        return res.status(401).send({message: "Access Denied No token provided!"});
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({message: "Invalid Credientials!"});
        }
        req.user = user; // เก็บข้อมูล User สำหรับการตรวจสอบเพิ่มเติม
        next(); // อนุญาตให้ผ่านไปยัง Endpoint ถัดไป
    })
}

module.exports = verifyAdminToken;