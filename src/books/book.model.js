const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    trending: {
        type: Boolean,
        default: false
    },
    recommended: {
        type: Boolean,
        default: false
    },
    coverImage: {
        type: String,
        required: [true, 'Cover image is required']
    },
    coverImages: {
        type: [String],
        default: []
    },
    oldPrice: {
        type: Number,
        required: [true, 'Old price is required'],
        min: [0, 'Price cannot be negative']
    },
    newPrice: {
        type: Number,
        required: [true, 'New price is required'],
        min: [0, 'Price cannot be negative']
    }
}, {
    timestamps: true
});

// เพิ่ม index สำหรับการค้นหา
bookSchema.index({ title: 'text', author: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;