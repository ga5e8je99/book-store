const User = require('../models/userModel');
const catchAsync = require('express-async-handler');
const appError = require('../utils/appError')
const { promisify } = require('util')
const jwt = require('jsonwebtoken');



const createSendToken = (res, result, statusCode) => {

    const token = result.generateToken(result._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure : true,
    }

    //if(process.env.NODE_ENV=="production") 
    //cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions)

    result.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            result
        }
    })
}

const signup = catchAsync(async (req, res, next) => {
    
    if (!req.body.email ||!req.body.password || !req.body.name) {
        return next(new appError('please enter a valid name or email or password', 400))

    }else{
        const result = await User.create(req.body)

        createSendToken(res, result, 200)
    }

    
})

const login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new appError('please enter a valid email or password', 400))
    }
    const result = await User.findOne({ email }).select('+password')

    if (!result || !(await result.correctPassword(password, result.password))) {
        return next(new appError('Incorrect Email or Password', 401))
    }

    createSendToken(res, result, 200)
})


const logout = catchAsync(async (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() - 1 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
})


module.exports = { signup, login, logout }
