const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const authMiddleware = require("./middleware/authMiddleware");
const roleMiddleware = require("./middleware/roleMiddleware");
const storeRoutes = require("./routes/storeRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const adminRoutes = require("./routes/adminRoutes");

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
app.use("/api/catalog", catalogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BBSR Smart Grocery Delivery API Running 🚀"
    });
});

app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
        const pool = require("./config/db");
        const userRes = await pool.query("SELECT first_name, last_name, email, phone, role FROM users WHERE user_id = $1", [req.user.user_id]);
        if (userRes.rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
        
        let profile = userRes.rows[0];
        
        if (profile.role === 'CUSTOMER') {
            const custRes = await pool.query("SELECT address, city, state, pincode FROM customers WHERE user_id = $1", [req.user.user_id]);
            if (custRes.rows.length > 0) {
                profile = { ...profile, ...custRes.rows[0] };
            }
        } else if (profile.role === 'DELIVERY_PARTNER') {
            const dpRes = await pool.query("SELECT vehicle_type, vehicle_number, driving_license, aadhaar_number FROM delivery_partners WHERE user_id = $1", [req.user.user_id]);
            if (dpRes.rows.length > 0) {
                profile = { ...profile, ...dpRes.rows[0] };
            }
        }
        
        res.status(200).json({ success: true, user: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put("/api/profile", authMiddleware, async (req, res) => {
    try {
        const pool = require("./config/db");
        const user_id = req.user.user_id;
        const role = req.user.role;
        const { first_name, last_name, phone_number, address, city, state, pincode, vehicle_type, vehicle_number, driving_license, aadhaar_number } = req.body;

        await pool.query("UPDATE users SET first_name=$1, last_name=$2, phone=$3 WHERE user_id=$4", [first_name, last_name, phone_number || '', user_id]);
        
        if (role === 'CUSTOMER') {
            // Upsert customer profile
            const custRes = await pool.query("SELECT customer_id FROM customers WHERE user_id = $1", [user_id]);
            if (custRes.rows.length > 0) {
                await pool.query("UPDATE customers SET address=$1, city=$2, state=$3, pincode=$4 WHERE user_id=$5", [address, city, state, pincode, user_id]);
            } else {
                await pool.query("INSERT INTO customers (user_id, address, city, state, pincode) VALUES ($1, $2, $3, $4, $5)", [user_id, address || '', city || '', state || '', pincode || '']);
            }
        } else if (role === 'DELIVERY_PARTNER') {
            // Upsert delivery partner profile
            const dpRes = await pool.query("SELECT partner_id FROM delivery_partners WHERE user_id = $1", [user_id]);
            if (dpRes.rows.length > 0) {
                await pool.query("UPDATE delivery_partners SET vehicle_type=$1, vehicle_number=$2, driving_license=$3, aadhaar_number=$4 WHERE user_id=$5", [vehicle_type, vehicle_number, driving_license, aadhaar_number, user_id]);
            } else {
                await pool.query("INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, driving_license, aadhaar_number) VALUES ($1, $2, $3, $4, $5)", [user_id, vehicle_type || '', vehicle_number || '', driving_license || '', aadhaar_number || '']);
            }
        }

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
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