const express = require("express");

const router = express.Router();

const {
    getAdminCalculations,
    deleteAdminCalculation,
    exportAdminCalculations
} = require("../controllers/adminCalculationsController");

const adminOnly = require("../middleware/adminMiddleware");


// ======================================================
// GET ALL CALCULATIONS
// ======================================================

router.get(
    "/",
    adminOnly,
    getAdminCalculations
);


// ======================================================
// EXPORT CALCULATIONS
// ======================================================

router.get(
    "/export",
    adminOnly,
    exportAdminCalculations
);


// ======================================================
// DELETE CALCULATION
// ======================================================

router.delete(
    "/:id",
    adminOnly,
    deleteAdminCalculation
);


module.exports = router;