const mongoose = require('mongoose');
const express = require('express');
const Order = require('../orders/order.model');
const { Book } = require('../books/book.model');
const router = express.Router();


// function to calculate admin stats
router.get("/", async (req, res) => {
    try {
        // เช็คการเชื่อมต่อ DB
        console.log('MongoDB State:', mongoose.connection.readyState);
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }

        // เช็ค Model ว่ามีอยู่จริง
        console.log('Models:', Object.keys(mongoose.models));
        console.log('Book Model:', Book);
        console.log('Order Model:', Order);

        // ทดสอบ query แต่ละตัวแยกกัน
        try {
            const totalOrders = await Order.countDocuments();
            console.log('Total Orders:', totalOrders);

            const totalSalesResult = await Order.aggregate([
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: "$totalPrice" }
                    }
                }
            ]);
            console.log('Total Sales:', totalSalesResult);

            const totalBooks = await Book.countDocuments();
            console.log('Total Books:', totalBooks);

            const trendingBooksCount = await Book.aggregate([
                { $match: { trending: true } },
                { $count: "trendingBooksCount" }
            ]);
            console.log('Trending Books:', trendingBooksCount);

            const monthlySales = await Order.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                        totalSales: { $sum: "$totalPrice" },
                        totalOrders: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
            console.log('Monthly Sales:', monthlySales);

            // ส่งข้อมูลกลับ
            res.status(200).json({
                totalOrders,
                totalSales: totalSalesResult[0]?.totalSales ?? 0,
                trendingBooks: trendingBooksCount[0]?.trendingBooksCount ?? 0,
                trendingBooksPercentage: totalBooks > 0 
                    ? ((trendingBooksCount[0]?.trendingBooksCount ?? 0) / totalBooks * 100).toFixed(1)
                    : 0,
                totalBooks,
                monthlySales
            });

        } catch (queryError) {
            console.error('Query Error:', queryError);
            throw queryError;
        }

    } catch (error) {
        console.error("Detailed Error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        if (error.name === 'MongooseError') {
            return res.status(500).json({
                message: "Database error",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to fetch admin stats",
            error: error.message,
            details: error.stack
        });
    }
});

module.exports = router;