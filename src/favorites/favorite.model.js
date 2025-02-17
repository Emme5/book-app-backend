const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: { 
        type: String,  // เปลี่ยนเป็น String
        required: true,
        ref: 'User'
    },
    books: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book' 
    }]
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);