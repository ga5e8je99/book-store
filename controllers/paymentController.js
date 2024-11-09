const Payment = require('../models/payment');
const catchAsync = require('express-async-handler');
const appError = require('../utils/appError')

exports.createPayment = catchAsync(async (req, res, next) => {
        
             req.body.status = 'success'
             result = await Payment.create(req.body)
    
    res.status(200).json({
        status: 'Payment processed successfully',
        data: {
            result
        }
    })

})

exports.getAllPayment = catchAsync(async (req, res, next) => {
        
    
    result = await Payment.find()

res.status(200).json({
status: 'printed all payment',
data: {
   result
}
})

})
