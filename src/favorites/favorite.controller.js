const Favorite = require('./favorite.model');
const { Book } = require('../books/book.model');

exports.getUserFavorites = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching favorites for userId:', userId); // เพิ่ม logging

        const favorite = await Favorite.findOne({ userId }).populate('books');
        
        res.status(200).json(favorite ? favorite.books : []);
    } catch (error) {
        console.error('Error in getUserFavorites:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserFavorites = async (req, res) => {
    try {
        const { userId } = req.params;
        const { bookIds } = req.body;
        
        if (!Array.isArray(bookIds)) {
            return res.status(400).json({ message: "bookIds must be an array" });
        }

        // ลบ duplicates
        const uniqueBookIds = [...new Set(bookIds)];

        const validBooks = await Book.find({ '_id': { $in: uniqueBookIds } });
        if (validBooks.length !== uniqueBookIds.length) {
            return res.status(400).json({ message: "Some book IDs are invalid" });
        }

        const favorite = await Favorite.findOneAndUpdate(
            { userId },
            { userId, books: uniqueBookIds },
            { upsert: true, new: true }
        ).populate('books');
        
        res.status(200).json(favorite.books);
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to update favorites", 
            error: error.message 
        });
    }
};