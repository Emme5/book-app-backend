const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../orders/order.model');

// สร้าง checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'ไม่พบรายการสินค้า' });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'thb',
                product_data: {
                    name: item.title,
                },
                unit_amount: Math.round(item.price * 100), // แปลงเป็นสตางค์
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
                orderId: orderId
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ 
            error: error.message,
            message: 'ไม่สามารถสร้าง checkout session ได้'
        });
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
            // ตรวจสอบว่ามี orderId ใน metadata
            if (session.metadata?.orderId) {
                await Order.findByIdAndUpdate(
                    session.metadata.orderId,
                    {
                        status: 'กำลังจัดเตรียมสินค้า',
                        paymentStatus: 'ชำระเงินแล้ว',
                        paymentDetails: {
                            paymentId: session.payment_intent,
                            paymentMethod: session.payment_method_types[0],
                            paidAt: new Date()
                        }
                    }
                );
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;