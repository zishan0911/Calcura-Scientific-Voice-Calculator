const express = require("express");

const {
    getReports
} = require("../controllers/adminReportsController");

const adminOnly =
    require("../middleware/adminMiddleware");

const router =
    express.Router();


// =====================================================
// REPORTS & ANALYTICS
// =====================================================

router.get(
    "/",
    adminOnly,
    getReports
);


module.exports = router;