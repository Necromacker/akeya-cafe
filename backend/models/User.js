const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
});

const cartItemSchema = new mongoose.Schema({
    productId: { type: String },
    name: String,
    imageLight: String,
    imageDark: String,
    quantity: { type: Number, default: 1 },
    size: String,
    price: Number
});

const orderSchema = new mongoose.Schema({
    items: [{
        productId: { type: String },
        name: String,
        quantity: Number,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentId: String,
    orderId: String,
    paymentStatus: { type: String, default: 'paid' },
    orderStatus: { type: String, default: 'processing' }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    profileDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for Google Auth users
        contact: { type: String, default: "" },
        isAdmin: { type: Boolean, default: false }
    },
    addresses: [addressSchema],
    cart: [cartItemSchema],
    orders: [orderSchema],
    googleId: { type: String }, // For Firebase Google Auth
    resetPasswordOTP: String,
    resetPasswordExpires: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
