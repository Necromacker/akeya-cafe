const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const auth = require('../middleware/auth');
const crypto = require('crypto');

let razorpay = null;

function isPaymentsConfigured() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    return Boolean(
        keyId &&
        keySecret &&
        keyId !== 'your_razorpay_key_id' &&
        keySecret !== 'your_razorpay_key_secret'
    );
}

function getRazorpay() {
    if (!isPaymentsConfigured()) {
        return null;
    }
    if (!razorpay) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpay;
}

function paymentsUnavailable(res) {
    return res.status(503).json({
        message:
            'Payments are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env (Razorpay Dashboard → API Keys).',
    });
}

// Get Razorpay Key
router.get('/key', (req, res) => {
    if (!isPaymentsConfigured()) {
        return paymentsUnavailable(res);
    }
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
    const instance = getRazorpay();
    if (!instance) {
        return paymentsUnavailable(res);
    }

    const { amount } = req.body; // Amount in INR

    const options = {
        amount: amount * 100, // Razorpay works in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error('Razorpay order creation failed:', err.message);
        res.status(500).json({ message: 'Razorpay order creation failed' });
    }
});

// Verify signature
router.post('/verify', auth, (req, res) => {
    if (!isPaymentsConfigured()) {
        return paymentsUnavailable(res);
    }

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest === razorpay_signature) {
        res.json({ status: 'ok' });
    } else {
        res.status(400).json({ status: 'failed' });
    }
});

module.exports = router;
