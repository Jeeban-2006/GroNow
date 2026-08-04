const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, roleMiddleware("STORE_OWNER"), productController.getStoreProducts);
router.post("/", authMiddleware, roleMiddleware("STORE_OWNER"), productController.addProduct);
router.put("/:id", authMiddleware, roleMiddleware("STORE_OWNER"), productController.updateProduct);
router.delete("/:id", authMiddleware, roleMiddleware("STORE_OWNER"), productController.deleteProduct);

module.exports = router;
