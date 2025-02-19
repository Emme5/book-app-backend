const Favorite = require('./favorite.model');
const Book = require('../books/book.model');
const mongoose = require('mongoose');

exports.getUserFavorites = async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('Fetching favorites for userId:', userId);
  
      const favorite = await Favorite.findOne({ userId }).populate({
        path: 'books',
        model: 'Book',
      });
  
      if (!favorite) {
        return res.status(200).json([]); // หากไม่พบรายการโปรดจะส่งกลับเป็นอาร์เรย์ว่าง
      } else {
        // ตรวจสอบว่า favorite.books เป็นอาร์เรย์ก่อนการใช้งาน find()
        if (!Array.isArray(favorite.books)) {
          favorite.books = [];
        }
  
        const populatedBooks = await Book.find({
          _id: { $in: favorite.books },
        });
  
        console.log('Found books:', populatedBooks.length);
        res.status(200).json(populatedBooks);
      }
    } catch (error) {
      console.error('Error in getUserFavorites:', error);
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.updateUserFavorites = async (req, res) => {
    try {
      const { userId } = req.params;
      const { bookIds } = req.body;
  
      let favorite = await Favorite.findOne({ userId });
      if (!favorite) {
        favorite = new Favorite({
          userId,
          books: bookIds,
        });
      } else {
        // Toggle books
        bookIds.forEach((bookId) => {
          const bookIndex = favorite.books.findIndex(
            (id) => id.toString() === bookId.toString()
          );
          if (bookIndex === -1) {
            favorite.books.push(bookId);
          } else {
            favorite.books.splice(bookIndex, 1);
          }
        });
      }
  
      await favorite.save();
  
      // ส่งกลับข้อมูลหนังสือที่มีการ populate แล้ว
      const populatedBooks = await Book.find({
        _id: { $in: favorite.books },
      });
  
      return res.status(200).json(populatedBooks);
    } catch (error) {
      console.error('Update Favorites Error:', error);
      return res.status(500).json({
        message: 'Unexpected error in updating favorites',
        error: error.message,
      });
    }
  };