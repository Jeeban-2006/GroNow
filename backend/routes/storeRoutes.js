const express = require("express");

const router = express.Router();

const storeController = require("../controllers/storeController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

// ======================================
// CREATE STORE
// Only Store Owner can create a store
// ======================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.createStore
);

router.get(
    "/profile",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.getStoreProfile
);

router.put(
    "/profile",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.updateStoreProfile
);

router.get(
    "/orders",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.getActiveOrders
);

router.get(
    "/orders/history",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.getPastOrders
);

router.put(
    "/orders/:id/status",
    authMiddleware,
    roleMiddleware("STORE_OWNER"),
    storeController.updateOrderStatus
);

module.exports = router;