const express = require('express');
const { 
    createAOrder, 
    getOrderByEmail,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    updatePaymentStatus
} = require('./order.controller');

const router = express.Router();

// create order endpoint
router.post("/", createAOrder);

// get orders by user email
router.get("/email/:email", getOrderByEmail);

// get all orders
router.get("/all", getAllOrders);

// update order status
router.patch("/status/:orderId", updateOrderStatus);

router.delete("/delete/:orderId", deleteOrder);

router.patch("/payment-status/:orderId", updatePaymentStatus);

module.exports = router;