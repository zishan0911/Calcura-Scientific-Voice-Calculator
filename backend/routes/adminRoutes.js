const express = require("express");

const router = express.Router();

const {
    getDashboardStats
} = require("../controllers/adminController");

const adminOnly = require("../middleware/adminMiddleware");

// ==========================================
// ADMIN DASHBOARD STATS
// ==========================================

router.get(
    "/dashboard",
    adminOnly,
    getDashboardStats
);

module.exports = router;