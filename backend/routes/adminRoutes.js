const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/metrics", authMiddleware, roleMiddleware("ADMIN"), adminController.getMetrics);
router.get("/stores/pending", authMiddleware, roleMiddleware("ADMIN"), adminController.getPendingStores);
router.put("/stores/:id/verify", authMiddleware, roleMiddleware("ADMIN"), adminController.verifyStore);
router.get("/fleet", authMiddleware, roleMiddleware("ADMIN"), adminController.getFleet);
router.get("/orders", authMiddleware, roleMiddleware("ADMIN"), adminController.getOrders);
router.get("/nodes", authMiddleware, roleMiddleware("ADMIN"), adminController.getNodes);
router.put("/nodes/:id/status", authMiddleware, roleMiddleware("ADMIN"), adminController.toggleNodeStatus);
router.get("/config", authMiddleware, roleMiddleware("ADMIN"), adminController.getConfig);
router.put("/config", authMiddleware, roleMiddleware("ADMIN"), adminController.updateConfig);

module.exports = router;
