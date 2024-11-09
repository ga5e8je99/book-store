const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");

require("dotenv").config();

// Initialize express app
const app = express();

// Import utilities
const appError = require("./utils/appError");
const err = require("./controllers/errorControllers");

//Routes
const auth = require("./controllers/authControllers")
const payment = require("./controllers/paymentController")


// Development logging
    app.use(morgan("dev"));



// Body parsers and URL encoding
app.use(bodyParser.json({ type: 'application/json; charset=utf-8' }));
app.use(express.json({limit:"10kb"}));
app.use(express.urlencoded({extended:true}));

// Cookie parser
app.use(cookieParser());

app.use(cors());
app.options('*', cors());




app.post("/api/signup",auth.signup)//name email password
app.post("/api/login",auth.login)//email password
app.get("/api/logout",auth.logout)

app.post('/api/payments',payment.createPayment)//cardNumber expiryDate cvv  cardName  amount
app.get('/api/payments',payment.getAllPayment)


// Handle undefined routes
app.all('*', (req, res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler
app.use(err);

module.exports = app;
