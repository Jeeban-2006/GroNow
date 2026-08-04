const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("STORE_OWNER"), inventoryController.getInventory);
router.put("/:id", authMiddleware, roleMiddleware("STORE_OWNER"), inventoryController.updateInventory);

module.exports = router;
