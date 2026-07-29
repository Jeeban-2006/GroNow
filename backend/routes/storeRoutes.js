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

module.exports = router;