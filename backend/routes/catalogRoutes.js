const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/catalogController");
const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// FETCH CATALOG
// ======================================

router.get("/categories", authMiddleware, catalogController.getCategories);
router.get("/products", authMiddleware, catalogController.getProducts);

module.exports = router;
