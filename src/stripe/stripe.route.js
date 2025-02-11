const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../orders/order.model');

// สร้าง checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, orderId } = req.body;
        
        // เพิ่ม log เพื่อ debug
        console.log('Received request:', { items, orderId });

        if (!items || !orderId) {
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

        console.log('Line items:', lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'promptpay'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
            metadata: {
                orderId: orderId,
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
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // จัดการกับ events ต่างๆ
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const orderId = session.metadata.orderId;

                // อัพเดทสถานะออเดอร์
                await Order.findByIdAndUpdate(orderId, {
                    status: 'กำลังจัดเตรียมสินค้า',
                    paymentStatus: 'ชำระเงินแล้ว'
                });
                break;

            case 'payment_intent.payment_failed':
                const paymentIntent = event.data.object;
                const failedOrderId = paymentIntent.metadata.orderId;

                // อัพเดทสถานะเมื่อการชำระเงินล้มเหลว
                await Order.findByIdAndUpdate(failedOrderId, {
                    status: 'การชำระเงินล้มเหลว',
                    paymentStatus: 'ล้มเหลว'
                });
                break;
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(500).send(`Webhook Error: ${err.message}`);
    }
});

module.exports = router;