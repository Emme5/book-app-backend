const cloudinary = require('../config/cloudinary');
const Favorite = require('../favorites/favorite.model');
const Book = require('./book.model');

const mongoose = require('mongoose');

const postABook = async (req, res) => {
    try {
        if (!req.files || !req.files['coverImage']) {
            return res.status(400).send({ message: "Cover image is required" });
        }

        // อัพโหลดรูปหลักไป Cloudinary
        const mainImageResult = await cloudinary.uploader.upload(
            // เปลี่ยนจาก path เป็น buffer
            `data:${req.files.coverImage[0].mimetype};base64,${req.files.coverImage[0].buffer.toString('base64')}`,
            { folder: "book-store" }
        );

        // อัพโหลดรูปเพิ่มเติม
        const additionalImages = [];
        if (req.files.coverImages) {
            for (const file of req.files.coverImages) {
                const result = await cloudinary.uploader.upload(
                    `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                    { folder: "book-store" }
                );
                additionalImages.push(result.secure_url);
            }
        }

        const newBook = new Book({
            ...req.body,
            coverImage: mainImageResult.secure_url,
            coverImages: [mainImageResult.secure_url, ...additionalImages]
        });

        await newBook.save();
        res.status(201).send({ message: "Book posted successfully", book: newBook });
    } catch (error) {
        console.error('Error in postABook:', error);
        res.status(500).send({ message: "Failed to create book", error: error.message });
    }
};

const UpdateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // เพิ่มการตรวจสอบข้อมูลก่อนอัปเดต
        const fieldsToUpdate = [
            'title', 'author', 'description', 'category', 
            'trending', 'recommended',
            'oldPrice', 'newPrice'
        ];

        // กรองเฉพาะฟิลด์ที่ต้องการอัปเดต
        const filteredUpdateData = {};
        fieldsToUpdate.forEach(field => {
            if (updateData[field] !== undefined) {
                filteredUpdateData[field] = updateData[field];
            }
        });

        if (req.files) {
            if (req.files['coverImage']) {
                const mainImageResult = await cloudinary.uploader.upload(
                    `data:${req.files.coverImage[0].mimetype};base64,${req.files.coverImage[0].buffer.toString('base64')}`,
                    { folder: "book-store" }
                );
                filteredUpdateData.coverImage = mainImageResult.secure_url;
            }

            if (req.files['coverImages']) {
                const newAdditionalImages = await Promise.all(
                    req.files.coverImages.map(file => 
                        cloudinary.uploader.upload(
                            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                            { folder: "book-store" }
                        )
                    )
                );
                filteredUpdateData.coverImages = [
                    filteredUpdateData.coverImage || updateData.coverImage,
                    ...newAdditionalImages.map(img => img.secure_url)
                ];
            }
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id, 
            filteredUpdateData,
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).send({ message: "Book not found!" });
        }

        res.status(200).send({
            message: "Book updated successfully",
            book: updatedBook
        });
    } catch (error) {
        console.error('Error in UpdateBook:', error);
        res.status(500).send({
            message: "Failed to update book",
            error: error.message
        });
    }
};

const deleteABook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send({ message: "Book not found!" });
        }

        // ลบรูปจาก Cloudinary
        const imageUrls = [book.coverImage, ...book.coverImages];
        for (const url of imageUrls) {
            // ดึง public_id จาก URL
            const publicId = url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`book-store/${publicId}`);
        }

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: "Book and images deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Failed to delete book and images" });
    }
};

// Get all books
const getAllBooks = async (req, res) => {
    try {
        console.log('Starting getAllBooks...'); // เพิ่ม logging

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // แยก queries เพื่อง่ายต่อการ debug
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // เพิ่ม lean() เพื่อเพิ่มประสิทธิภาพ

        const total = await Book.countDocuments();

        console.log(`Found ${books.length} books out of ${total} total`); // เพิ่ม logging

        res.status(200).json({
            success: true, // เพิ่มเพื่อให้ frontend รู้ว่า request สำเร็จ
            books,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalBooks: total
        });
    } catch (error) {
        console.error('Detailed error:', error); // เพิ่ม detailed logging
        res.status(500).json({ 
            success: false,
            message: "Failed to fetch books",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Get a single book by ID
const getSingleBook = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid book ID format" });
        }

        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.status(200).json(book);
    } catch (error) {
        console.error('Error in getSingleBook:', error);
        res.status(500).json({ 
            message: "Failed to fetch book",
            error: error.message 
        });
    }
};

const getBooksByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).send({ message: "Invalid input: ids must be an array" });
        }
        const books = await Book.find({ '_id': { $in: ids } });
        res.status(200).send(books);
    } catch (error) {
        res.status(500).send({ message: "Failed to fetch books by ids" });
    }
};

module.exports = {
    postABook,
    getAllBooks,
    getSingleBook,
    UpdateBook,
    deleteABook,
    getBooksByIds,
};