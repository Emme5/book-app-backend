const express = require('express');
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const path = require('path');

const port = process.env.PORT || 'https://book-app-backend-alpha.vercel.app';
require('dotenv').config();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'https://book-store-app-th.vercel.app', // เพิ่มใช้นี้ http://localhost:5000 แทนหากจะแก้ไขในคอมตัวเอง
    'https://book-app-backend-alpha.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Set-Cookie']
}));

app.get('/health', (req, res) => {
  res.status(200).json({
      status: 'ok',
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// routes
const bookRoutes = require('./src/books/book.route');
const orderRoutes = require('./src/orders/order.route');
const userRoutes = require('./src/users/user.route');
const adminRoutes = require('./src/stats/admin.stats');
const stripeRoutes = require('./src/stripe/stripe.route');
const favoriteRoutes = require('./src/favorites/favorite.route');

const verifyAdminToken = require('./src/middleware/verifyAdminToken');

// เพิ่มหลัง routes ทั้งหมด

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", verifyAdminToken, adminRoutes);
app.use("/api", stripeRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
// MongoDB Connection
async function connectDB() {
  try {
      await mongoose.connect(process.env.DB_URL, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
      console.log('MongoDB connected successfully');
      
      // ทดสอบการเชื่อมต่อ
      const collections = await mongoose.connection.db.collections();
      console.log(`Connected to ${collections.length} collections`);
      
  } catch (error) {
      console.error('Detailed MongoDB error:', error);
      process.exit(1);
  }
}

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();