const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../orders/order.model');

// สร้าง checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.title,
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                orderData: JSON.stringify(req.body) // เก็บข้อมูล order ทั้งหมด
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ตรวจสอบสถานะการชำระเงินและอัพเดท order
router.get('/check-payment/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        
        // อัพเดทสถานะ order ถ้าชำระเงินสำเร็จ
        if (session.payment_status === 'paid') {
            const orderId = session.metadata.orderId;
            await Order.findByIdAndUpdate(orderId, {
                status: 'กำลังจัดเตรียมสินค้า',
                paymentStatus: 'ชำระเงินแล้ว'
            });
        }

        res.json({
            status: session.payment_status,
            orderId: session.metadata.orderId
        });
    } catch (error) {
        console.error('Error checking payment:', error);
        res.status(500).json({ error: 'Error checking payment status' });
    }
});

router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderData = JSON.parse(session.metadata.orderData);

            // สร้าง order เมื่อชำระเงินสำเร็จ
            const newOrder = new Order({
                ...orderData,
                status: 'กำลังจัดเตรียมสินค้า',
                paymentStatus: 'ชำระเงินแล้ว'
            });
            await newOrder.save();
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;