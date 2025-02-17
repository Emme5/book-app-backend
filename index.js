const express = require('express');
const app = express();
const cors = require("cors");
const mongoose = require('mongoose');
const path = require('path');

const port = process.env.PORT || 5000;
require('dotenv').config();


app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://book-app-frontend-chi.vercel.app',
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

// routes
const bookRoutes = require('./src/books/book.route');
const orderRoutes = require('./src/orders/order.route');
const userRoutes = require('./src/users/user.route');
const adminRoutes = require('./src/stats/admin.stats');
const stripeRoutes = require('./src/stripe/stripe.route');
const favoriteRoutes = require('./src/favorites/favorite.route');

app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", stripeRoutes);
app.use("/api/favorites", favoriteRoutes);

async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('MongoDB connected');
}

main().catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});