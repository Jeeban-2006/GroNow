const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const storeRoutes = require("./routes/storeRoutes");

require("dotenv").config();

require("./config/db"); // Import the database connection
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BBSR Smart Grocery Delivery API Running 🚀"
    });
});

app.get("/api/profile", authMiddleware, (req, res) => {

    res.status(200).json({

        success: true,

        message: "Protected Route Accessed Successfully",

        user: req.user

    });

});

app.get(
    "/api/customer",
    authMiddleware,
    roleMiddleware("CUSTOMER"),
    (req, res) => {

        res.json({
            message: "Welcome Customer"
        });

    }
);

app.get(
    "/api/owner",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    (req, res) => {

        res.json({
            message: "Welcome Store Owner"
        });

    }
);

app.get(
    "/api/delivery",
    authMiddleware,
    roleMiddleware("DELIVERY_PARTNER"),
    (req, res) => {

        res.json({
            message: "Welcome Delivery Partner"
        });

    }
);



module.exports = app;