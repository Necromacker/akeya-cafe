const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST api/auth/signup
// @desc    Register user
router.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password, contact } = req.body;

    try {
        // Search both old and new email locations
        let userByEmail = await User.findOne({ 
            $or: [{ 'profileDetails.email': email }, { 'email': email }] 
        });
        
        if (userByEmail) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        if (contact) {
            let userByPhone = await User.findOne({ 
                $or: [{ 'profileDetails.contact': contact }, { 'contact': contact }] 
            });
            if (userByPhone) {
                return res.status(400).json({ message: 'User with this phone number already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            profileDetails: {
                firstName,
                lastName: lastName || ' ',
                email,
                password: hashedPassword,
                contact
            }
        });

        await user.save();

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                firstName: user.profileDetails.firstName,
                lastName: user.profileDetails.lastName,
                email: user.profileDetails.email
            }
        });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ 
            $or: [{ 'profileDetails.email': email }, { 'email': email }] 
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // AUTO-MIGRATION: If user is found but data is at root
        if (!user.profileDetails || !user.profileDetails.email) {
            console.log("Migrating old user profile for login:", email);
            const raw = user.toObject({ virtuals: false });
            user.profileDetails = {
                firstName: raw.firstName || "User",
                lastName: raw.lastName || " ",
                email: raw.email || email,
                password: raw.password,
                contact: raw.contact || "",
                isAdmin: raw.isAdmin || false
            };
            await user.save();
        }

        if (!user.profileDetails.password) {
            return res.status(400).json({ message: 'Please login using Google' });
        }

        const isMatch = await bcrypt.compare(password, user.profileDetails.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.profileDetails.firstName,
                lastName: user.profileDetails.lastName,
                email: user.profileDetails.email
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/forgot-password
// @desc    Send OTP for password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ 
            $or: [{ 'profileDetails.email': email }, { 'email': email }] 
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // AUTO-MIGRATION logic for password reset
        if (!user.profileDetails || !user.profileDetails.email) {
            console.log("Migrating user profile for forgot-password:", email);
            const raw = user.toObject({ virtuals: false });
            user.profileDetails = {
                firstName: raw.firstName || "User",
                lastName: raw.lastName || " ",
                email: raw.email || email,
                password: raw.password,
                contact: raw.contact || "",
                isAdmin: raw.isAdmin || false
            };
            await user.save();
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendEmail({
            email: user.profileDetails.email,
            subject: 'Password Reset OTP',
            html: `<h3>Your OTP for password reset is: <b>${otp}</b></h3><p>It is valid for 1 hour.</p>`
        });

        res.json({ message: 'OTP sent to email' });
    } catch (err) {
        console.error('forgot-password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ 'profileDetails.email': email }, { 'email': email }],
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // AUTO-MIGRATION logic for reset-password
        if (!user.profileDetails || !user.profileDetails.email) {
            console.log("Migrating user profile for reset-password:", email);
            const raw = user.toObject({ virtuals: false });
            user.profileDetails = {
                firstName: raw.firstName || "User",
                lastName: raw.lastName || " ",
                email: raw.email || email,
                password: raw.password,
                contact: raw.contact || "",
                isAdmin: raw.isAdmin || false
            };
        }

        user.profileDetails.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        console.error('reset-password error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST api/auth/google
// @desc    Login with Google
router.post('/google', async (req, res) => {
    const { email, firstName, lastName, googleId } = req.body;

    try {
        let user = await User.findOne({ 
            $or: [{ 'profileDetails.email': email }, { 'email': email }] 
        });

        if (user) {
            // AUTO-MIGRATION for Google Users
            if (!user.profileDetails || !user.profileDetails.email) {
                const raw = user.toObject({ virtuals: false });
                user.profileDetails = {
                    firstName: raw.firstName || firstName || "User",
                    lastName: raw.lastName || lastName || " ",
                    email: raw.email || email,
                    password: raw.password || crypto.randomBytes(16).toString('hex'),
                    contact: raw.contact || "",
                    isAdmin: raw.isAdmin || false
                };
            }

            if (!user.googleId) {
                user.googleId = googleId;
            }
            await user.save();
        } else {
            user = new User({
                profileDetails: {
                    firstName: firstName || 'User',
                    lastName: lastName || ' ',
                    email,
                    password: crypto.randomBytes(16).toString('hex')
                },
                googleId: googleId
            });
            await user.save();
        }

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.profileDetails.firstName,
                lastName: user.profileDetails.lastName,
                email: user.profileDetails.email
            }
        });
    } catch (err) {
        console.error('Google Auth Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// @route   POST api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
