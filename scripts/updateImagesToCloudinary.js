require('dotenv').config();
const Book = require('../src/books/book.model');
const cloudinary = require('../src/config/cloudinary');
const mongoose = require('mongoose');

async function updateImages() {
    try {
        if (!process.env.DB_URL) {
            throw new Error('DB_URL is not defined in environment variables');
        }

        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB');

        const books = await Book.find({});
        console.log(`Found ${books.length} books to update`);

        

        for (const update of imageUpdates) {
            const result = await Book.findOneAndUpdate(
                { title: update.title },
                { coverImage: update.imageUrl },
                { new: true } // ส่งคืนเอกสารที่อัปเดตแล้ว
            );

            if (result) {
                console.log(`Updated image for: ${update.title}`);
            } else {
                console.log(`No book found with title: ${update.title}`);
            }
        }

        console.log('All books updated successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        try {
            await mongoose.disconnect();
            console.log('Disconnected from MongoDB');
        } catch (disconnectError) {
            console.error('Error disconnecting from MongoDB:', disconnectError);
        }
    }
}

updateImages();