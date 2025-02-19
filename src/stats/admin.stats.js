const mongoose = require('mongoose');
const express = require('express');
const Order = require('../orders/order.model');
const Book = require('../books/book.model');
const verifyAdminToken = require('../middleware/verifyAdminToken');
const router = express.Router();

// function to calculate admin stats
router.get("/", async (req, res) => {
    try {
        // Debug logs
        console.log('MongoDB State:', mongoose.connection.readyState);
        console.log('Models available:', Object.keys(mongoose.models));
        console.log('Order model:', typeof Order);
        console.log('Book model:', typeof Book);

        // Check DB connection
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection is not ready');
        }

        // Individual try-catch for each operation
        let statsData = {
            totalOrders: 0,
            totalSales: 0,
            trendingBooks: 0,
            totalBooks: 0,
            trendingBooksPercentage: 0,
            monthlySales: []
        };

        try {
            statsData.totalOrders = await Order.countDocuments() || 0;
            console.log('Total Orders:', statsData.totalOrders);

            const salesResult = await Order.aggregate([{
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }]);
            statsData.totalSales = salesResult[0]?.total || 0;
            console.log('Total Sales:', statsData.totalSales);

            statsData.totalBooks = await Book.countDocuments() || 0;
            console.log('Total Books:', statsData.totalBooks);

            const trendingCount = await Book.find({ trending: true }).countDocuments();
            statsData.trendingBooks = trendingCount || 0;
            console.log('Trending Books:', statsData.trendingBooks);

            if (statsData.totalBooks > 0) {
                statsData.trendingBooksPercentage = (
                    (statsData.trendingBooks / statsData.totalBooks) * 100
                ).toFixed(1);
            }

            const monthlyData = await Order.aggregate([{
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalSales: { $sum: "$totalPrice" },
                    count: { $sum: 1 }
                }
            }, {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            }]);
            statsData.monthlySales = monthlyData;
            console.log('Monthly Sales:', monthlyData);

        } catch (queryError) {
            console.error('Query Error:', queryError);
            throw new Error(`Database query failed: ${queryError.message}`);
        }

        console.log('Sending response:', statsData);
        res.status(200).json(statsData);

    } catch (error) {
        console.error("Admin stats error:", {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        res.status(500).json({
            message: "Failed to fetch admin stats",
            error: error.message,
            details: error.stack
        });
    }
});

module.exports = router;