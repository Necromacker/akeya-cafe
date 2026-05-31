const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        // AUTO-MIGRATION for existing sessions
        if (user && (!user.profileDetails || !user.profileDetails.email)) {
            const raw = user.toObject({ virtuals: false });
            user.profileDetails = {
                firstName: raw.firstName || "User",
                lastName: raw.lastName || " ",
                email: raw.email,
                password: raw.password,
                contact: raw.contact || "",
                isAdmin: raw.isAdmin || false
            };
            await user.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    const { firstName, lastName, contact } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (firstName) user.profileDetails.firstName = firstName;
        if (lastName) user.profileDetails.lastName = lastName;
        if (contact) user.profileDetails.contact = contact;
        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user addresses
router.get('/addresses', auth, async (req, res) => {
    res.json(req.user.addresses);
});

// Add address
router.post('/addresses', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses.push(req.body);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete address
router.delete('/addresses/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cart operations
router.get('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.cart);
    } catch (err) {
        console.error('Error fetching cart:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

router.post('/cart', auth, async (req, res) => {
    const { productId, name, imageLight, imageDark, quantity, size, price } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const cartItem = user.cart.find(item => item.productId === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
        } else {
            user.cart.push({ productId, name, imageLight, imageDark, quantity, size, price });
        }

        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/cart/:productId', auth, async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user.id);
        const cartItem = user.cart.find(item => item.productId === req.params.productId);

        if (cartItem) {
            cartItem.quantity = quantity;
            await user.save();
        }
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/cart/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.cart = user.cart.filter(item => item.productId !== req.params.productId);
        await user.save();
        res.json(user.cart);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Order operations (Moved from orders.js)
router.get('/orders', auth, async (req, res) => {
    try {
        // req.user is populated by auth middleware
        res.json(req.user.orders || []);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/orders', auth, async (req, res) => {
    const { items, totalAmount, shippingAddress, paymentId, orderId } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const newOrder = {
            items,
            totalAmount,
            shippingAddress,
            paymentId,
            orderId,
            paymentStatus: 'paid'
        };

        user.orders.push(newOrder);
        user.cart = []; // Clear cart
        await user.save();
        res.status(201).json(newOrder);
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
