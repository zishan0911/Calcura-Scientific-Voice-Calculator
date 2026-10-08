const express = require("express");

const router = express.Router();

const {
    createConversion,
    getConversions,
    getConversionById,
    deleteConversion
} = require("../controllers/converterController");

const {
    protect
} = require("../middleware/authMiddleware");


// ==========================================
// CREATE CONVERSION
// ==========================================
router.post(
    "/",
    protect,
    createConversion
);


// ==========================================
// GET ALL USER CONVERSIONS
// ==========================================
router.get(
    "/",
    protect,
    getConversions
);


// ==========================================
// GET SINGLE CONVERSION
// ==========================================
router.get(
    "/:id",
    protect,
    getConversionById
);


// ==========================================
// DELETE SINGLE CONVERSION
// ==========================================
router.delete(
    "/:id",
    protect,
    deleteConversion
);


module.exports = router;