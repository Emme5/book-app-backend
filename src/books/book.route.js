const express = require('express');
const Book = require('./book.model');
const { postABook,
        getAllBooks,
        getSingleBook,
        UpdateBook,
        deleteABook,
        getBooksByIds
    } = require('./book.controller');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const upload = require('../../storage');
const router = express.Router();

// frontend => to backend server => controller => book schema => database => send to server =>
    //back to the frontend
// post = when submit something frontend to db
// get = when get something back from db
// put/patch = when edit or update something
// delete = when delete something

// post a book
router.post("/create-book", 
    // เพิ่ม error handling สำหรับ upload middleware
    (req, res, next) => {
        upload.fields([
            { name: 'coverImage', maxCount: 1 },
            { name: 'coverImages', maxCount: 4 }
        ])(req, res, (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(400).json({ 
                    message: "Error uploading files",
                    error: err.message 
                });
            }
            next();
        });
    },
    verifyAdminToken, 
    postABook
);

// get all books
router.get("/", getAllBooks);

//single book endpoint
router.get("/:id", getSingleBook);

// update a book endpoint
router.put("/edit/:id", 
    upload.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'coverImages', maxCount: 4 }
    ]),
    verifyAdminToken, 
    UpdateBook
    );

// delete a book endpoint
router.delete("/:id", verifyAdminToken, deleteABook);

// เพิ่ม route ใหม่สำหรับดึงข้อมูลหนังสือหลายเล่ม
router.post("/batch", getBooksByIds);

module.exports = router;