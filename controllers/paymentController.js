const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('express-async-handler');
const appError = require('../utils/appError');
const Payment = require('../models/payment');

const paymentsFilePath = path.join(__dirname, '../data/payments.json');

const getLocalPayments = () => {
    try {
        if (!fs.existsSync(paymentsFilePath)) {
            fs.writeFileSync(paymentsFilePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(paymentsFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
};

const saveLocalPayments = (payments) => {
    fs.writeFileSync(paymentsFilePath, JSON.stringify(payments, null, 2));
};

exports.createPayment = catchAsync(async (req, res, next) => {
    const { cardNumber, expiryDate, cvv, cardName } = req.body;
    const amount = Number(req.body.amount || req.body.price);

    if (!cardNumber || !expiryDate || !cvv) {
        return next(new appError('All payment fields are required.', 400));
    }

    req.body.status = 'success';
    req.body.amount = isNaN(amount) ? 0 : amount;

    // Mask card number for security (keep only last 4 digits)
    const cleanCard = cardNumber.replace(/\s+/g, '');
    const maskedCard = '****-****-****-' + cleanCard.slice(-4);

    if (mongoose.connection.readyState === 1) {
        const paymentData = {
            ...req.body,
            cardNumber: maskedCard
        };
        const result = await Payment.create(paymentData);
        return res.status(200).json({
            status: 'success',
            message: 'Payment processed successfully',
            data: { result }
        });
    }

    // Local fallback
    const payments = getLocalPayments();
    const newPayment = {
        _id: 'pay_' + Date.now(),
        cardNumber: maskedCard,
        expiryDate,
        cardName: cardName || 'Customer',
        amount: isNaN(amount) ? 0 : amount,
        status: 'success',
        createdAt: new Date().toISOString()
    };

    payments.push(newPayment);
    saveLocalPayments(payments);

    res.status(200).json({
        status: 'success',
        message: 'Payment processed successfully',
        data: { result: newPayment }
    });
});

exports.getAllPayment = catchAsync(async (req, res, next) => {
    if (mongoose.connection.readyState === 1) {
        const result = await Payment.find();
        return res.status(200).json({
            status: 'success',
            data: { result }
        });
    }

    const result = getLocalPayments();
    res.status(200).json({
        status: 'success',
        data: { result }
    });
});
