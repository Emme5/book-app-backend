const Order = require("./order.model");

const createAOrder = async (req, res) => {
    try {
        console.log("Request body:", req.body);

        const { name, email, address, phone, productIds, totalPrice, paymentStatus } = req.body;
        
        if (!name || !email || !phone || !productIds || !totalPrice || !address) {
            return res.status(400).json({
                message: "ข้อมูลไม่ครบถ้วน",
                requiredFields: ["name", "email", "address", "phone", "productIds", "totalPrice"]
            });
        }

        const newOrder = new Order({
            name,
            email,
            address: {
                fullAddress: address.fullAddress,
                district: address.district,
                amphure: address.amphure,
                province: address.province,
                zipcode: address.zipcode
            },
            phone,
            productIds,
            totalPrice: Number(totalPrice),
            status: 'รอดำเนินการ',
            paymentStatus: paymentStatus || 'pending'  // เพิ่มบรรทัดนี้
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error("Error in createAOrder:", error);
        res.status(500).json({
            message: "ไม่สามารถสร้างออเดอร์ได้",
            error: error.message
        });
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

const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { paymentStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating payment status", error);
        res.status(500).json({ message: "Failed to update payment status" });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        
        if (!deletedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Error deleting order", error);
        res.status(500).json({ message: "Failed to delete order" });
    }
};

module.exports = {
    createAOrder,
    getOrderByEmail,
    getAllOrders,
    updateOrderStatus,
    deleteOrder,
    updatePaymentStatus
}