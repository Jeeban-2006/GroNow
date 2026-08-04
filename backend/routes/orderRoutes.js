const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================
// CREATE ORDER (Customer Only)
// ======================================

router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), orderController.createOrder);
router.get("/", authMiddleware, roleMiddleware("CUSTOMER"), orderController.getOrders);
router.put("/:id/cancel", authMiddleware, roleMiddleware("CUSTOMER"), orderController.cancelOrder);

module.exports = router;
