const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const catchAsync = require('express-async-handler');
const appError = require('../utils/appError');
const User = require('../models/userModel');

const usersFilePath = path.join(__dirname, '../data/users.json');

// Helper to read local users
const getLocalUsers = () => {
    try {
        if (!fs.existsSync(usersFilePath)) {
            fs.writeFileSync(usersFilePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (e) {
        return [];
    }
};

// Helper to save local users
const saveLocalUsers = (users) => {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const createSendToken = (res, result, statusCode) => {
    let token;
    if (typeof result.generateToken === 'function') {
        token = result.generateToken(result._id);
    } else {
        token = jwt.sign(
            { id: result._id },
            process.env.JWT_SECRET || 'jwt-higt-security',
            { expiresIn: process.env.JWT_EXPIRE_IN || '3d' }
        );
    }

    const cookieOptions = {
        expires: new Date(Date.now() + (Number(process.env.JWT_COOKIE_EXPIRE_IN) || 10) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.cookie('jwt', token, cookieOptions);

    const safeResult = { ...result };
    delete safeResult.password;

    res.status(statusCode).json({
        status: 'success',
        success: true,
        token,
        data: {
            result: safeResult
        }
    });
};

const signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!email || !password || !name) {
        return next(new appError('Please provide name, email, and password.', 400));
    }

    if (!validator.isEmail(email)) {
        return next(new appError('Please provide a valid email address.', 400));
    }

    if (password.length < 6) {
        return next(new appError('Password must be at least 6 characters long.', 400));
    }

    // If MongoDB is connected (readyState === 1)
    if (mongoose.connection.readyState === 1) {
        try {
            const result = await User.create(req.body);
            return createSendToken(res, result, 201);
        } catch (dbErr) {
            if (dbErr.code === 11000) {
                return next(new appError('Email or name already exists.', 400));
            }
            return next(dbErr);
        }
    }

    // Fallback: Local file storage
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return next(new appError('An account with this email already exists.', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    createSendToken(res, newUser, 201);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new appError('Please provide email and password.', 400));
    }

    // If MongoDB is connected
    if (mongoose.connection.readyState === 1) {
        const result = await User.findOne({ email }).select('+password');
        if (!result || !(await result.correctPassword(password, result.password))) {
            return next(new appError('Incorrect Email or Password', 401));
        }
        return createSendToken(res, result, 200);
    }

    // Fallback: Local storage
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return next(new appError('Incorrect Email or Password', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new appError('Incorrect Email or Password', 401));
    }

    createSendToken(res, user, 200);
});

const logout = catchAsync(async (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() - 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success', success: true });
});

module.exports = { signup, login, logout };
