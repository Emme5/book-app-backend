const express = require('express');
const User = require('./user.model');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY

router.post("/admin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const admin = await User.findOne({username});
        if(!admin) {
            return res.status(404).send({message: "Admin Not Found!"});
        }
        if(admin.password !== password) {
            return res.status(401).send({message: "Invalid Password!"});
        }

        const token = jwt.sign(
            {id: admin._id, username: admin.username, role: admin.role},
            JWT_SECRET,
            {expiresIn: "1h"} // หมดอายุใน 1 ชั่วโมง
        )

        return res.status(200).json({
            message: "Authentication Successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        })

    } catch (error) {
        console.error("Failed To Login Admin", error);
        res.status(401).send({message: "Failed To Login Admin"});
    }
})

module.exports = router;