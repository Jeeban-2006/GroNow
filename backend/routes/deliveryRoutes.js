const express = require("express");
const router = express.Router();
const deliveryController = require("../controllers/deliveryController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/assignments", authMiddleware, roleMiddleware("DELIVERY"), deliveryController.getAssignments);
router.get("/stats", authMiddleware, roleMiddleware("DELIVERY"), deliveryController.getStats);
router.put("/status", authMiddleware, roleMiddleware("DELIVERY"), deliveryController.updateStatus);
router.post("/tracking", authMiddleware, roleMiddleware("DELIVERY"), deliveryController.postTracking);
router.put("/availability", authMiddleware, roleMiddleware("DELIVERY"), deliveryController.updateAvailability);

module.exports = router;
