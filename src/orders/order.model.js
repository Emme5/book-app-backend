const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        fullAddress: String,
        district: String,
        amphure: String,
        province: String,
        zipcode: String
    },
    phone: {
        type: String,
        required: true,
    },
    productIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['รอดำเนินการ', 'กำลังจัดเตรียมสินค้า', 'กำลังจัดส่ง', 'จัดส่งสำเร็จ', 'มีปัญหาในการจัดส่ง', 'ยกเลิกการจัดส่ง' , 'ชำระเงินแล้ว'],
        default: 'รอดำเนินการ'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'ชำระเงินแล้ว', 'ยกเลิก'],
        default: 'pending'
    },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;