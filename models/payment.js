const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    cardNumber: String,
    expiryDate: String,
    cvv: String,
    cardName: String,
    amount: Number,
    status: { type: String, default: 'pending' } // حالات الدفع: pending, success, failed
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment