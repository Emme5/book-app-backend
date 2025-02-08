const Order = require("./order.model");

const createAOrder = async (req, res) => {
try {
    const newOrder = await Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
    } catch (error) {
        console.error("Error creating order", error);
        res.status(500).json({ message: "Failed to create order" });
    }
};

const getOrderByEmail = async (req, res) => {
    try {
        const {email} = req.params;
        const orders = await Order.find({email}).sort({createdAt: -1});
        if(!orders) {
            return res.status(404).json({message: "Orders not found"});
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// เพิ่มฟังก์ชันใหม่สำหรับดึงข้อมูล orders ทั้งหมด
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({createdAt: -1});
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching all orders", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

// เพิ่มฟังก์ชันใหม่สำหรับอัพเดทสถานะ
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};

module.exports = {
    createAOrder,
    getOrderByEmail,
    getAllOrders,
    updateOrderStatus
}