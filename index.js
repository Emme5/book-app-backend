const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://book-app-frontend-2w4o.vercel.app',
    'https://book-app-backend-brown.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// routes
const bookRoutes = require('./src/books/book.route');
const orderRoutes = require('./src/orders/order.route');
const userRoutes = require('./src/users/user.route');
const adminRoutes = require('./src/stats/admin.stats');
const stripeRoutes = require('./src/stripe/stripe.route');

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", stripeRoutes);

// ตั้งค่า Static Folder
const FILE_DIR = path.join(__dirname, 'public/uploads');
app.use('/uploads', express.static(FILE_DIR));

async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('MongoDB connected');
}

main().catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});