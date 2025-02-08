const Book = require("./book.model");

// Create a new book
const postABook = async (req, res) => {
    try {
        console.log('Files:', req.files); // เพิ่ม log เพื่อดูข้อมูลไฟล์ที่ส่งมา
        
        if (!req.files || !req.files['coverImage']) {
            return res.status(400).send({ message: "Cover image is required" });
        }

        // รูปหลัก
        const mainImage = req.files['coverImage'][0];
        // รูปเพิ่มเติม
        const additionalImages = req.files['coverImages'] ? 
            req.files['coverImages'].map(file => file.filename) : [];

        const newBook = new Book({
            ...req.body,
            coverImage: mainImage.filename,
            coverImages: [mainImage.filename, ...additionalImages]
        });

        await newBook.save();
        res.status(201).send({ message: "Book posted successfully", book: newBook });
    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).send({ message: "Failed to create book", error: error.message });
    }
};

// Get all books
const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.status(200).send(books);
    } catch (error) {
        console.error("Error fetching books", error);
        res.status(500).send({ message: "Failed to fetch books" });
    }
};

// Get a single book by ID
const getSingleBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).send({ message: "Book not found!" });
        }
        res.status(200).send(book);
    } catch (error) {
        console.error("Error fetching book", error);
        res.status(500).send({ message: "Failed to fetch book" });
    }
};

// Update a book by ID
const UpdateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (req.files) {
            if (req.files['coverImage']) {
                updateData.coverImage = req.files['coverImage'][0].filename;
            }

            // ถ้ามีรูปเพิ่มเติมใหม่
            const newAdditionalImages = req.files['coverImages'] 
                ? req.files['coverImages'].map(file => file.filename) 
                : [];

            // รวมรูปเดิมที่เหลือกับรูปใหม่
            updateData.coverImages = [
                updateData.coverImage,
                ...newAdditionalImages
            ];
        }

        // ถ้าไม่มีรูปใหม่ แต่มีการส่ง existingImages มา
        if (req.body.existingImages) {
            const existingImages = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages];

            updateData.coverImage = existingImages[0];
            updateData.coverImages = existingImages;
        }

        const updatedBook = await Book.findByIdAndUpdate(
            id, 
            updateData,
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
        console.error("Error updating book:", error);
        res.status(500).send({
            message: "Failed to update book",
            error: error.message
        });
    }
};

// Delete a book by ID
const deleteABook = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBook = await Book.findByIdAndDelete(id);
        if (!deletedBook) {
            return res.status(404).send({ message: "Book not found!" });
        }
        res.status(200).send({ message: "Book deleted successfully", book: deletedBook });
    } catch (error) {
        console.error("Error deleting book", error);
        res.status(500).send({ message: "Failed to delete book" });
    }
};

// เพิ่มฟังก์ชันใหม่: Get multiple books by IDs
const getBooksByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        
        // ตรวจสอบว่า ids เป็น array หรือไม่
        if (!Array.isArray(ids)) {
            return res.status(400).send({ message: "Invalid input: ids must be an array" });
        }

        // ดึงข้อมูลหนังสือทั้งหมดที่มี id อยู่ใน array
        const books = await Book.find({ '_id': { $in: ids } });
        
        res.status(200).send(books);
    } catch (error) {
        console.error("Error fetching books by ids", error);
        res.status(500).send({ message: "Failed to fetch books by ids" });
    }
};

module.exports = {
    postABook,
    getAllBooks,
    getSingleBook,
    UpdateBook,
    deleteABook,
    getBooksByIds
};