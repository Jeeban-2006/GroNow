const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

require("./config/db"); // Import the database connection

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BBSR Smart Grocery Delivery API Running 🚀"
    });
});

module.exports = app;