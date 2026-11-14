require('dotenv').config();
const mongoose = require("mongoose");

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require("./app"); // Import the app instance from app.js
const port = process.env.PORT || 8000;

// Start server
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Website available at: http://localhost:${port}`);
});

// MongoDB connection
if (process.env.DB) {
    mongoose
        .connect(process.env.DB)
        .then(() => {
            console.log("DB connected Successfully"); 
        })
        .catch((error) => {
            console.error("Warning: Error connecting to MongoDB:", error.message);
            console.log("The server is running, but database features require a valid MongoDB connection in .env");
        });
}

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});
