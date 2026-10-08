const express = require("express");

const {
    createCalculation,
    getCalculations,
    deleteCalculation,
    clearCalculations
} = require("../controllers/calculationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CALCULATION ROUTES
// ==========================================

// Save calculation
router.post(
    "/",
    protect,
    createCalculation
);


// Get user's calculations
router.get(
    "/",
    protect,
    getCalculations
);


// Delete one calculation
router.delete(
    "/:id",
    protect,
    deleteCalculation
);


// Clear all calculations
router.delete(
    "/",
    protect,
    clearCalculations
);


module.exports = router;