const express = require("express");

const router = express.Router();

const {
    getAdminSubscriptions,
    getAdminSubscription,
    createAdminSubscription,
    updateAdminSubscription,
    deleteAdminSubscription
} = require("../controllers/adminSubscriptionController");

const adminOnly =
    require("../middleware/adminMiddleware");


// =====================================================
// GET ALL SUBSCRIPTION PLANS
// =====================================================

router.get(
    "/",
    adminOnly,
    getAdminSubscriptions
);


// =====================================================
// GET SINGLE SUBSCRIPTION PLAN
// =====================================================

router.get(
    "/:id",
    adminOnly,
    getAdminSubscription
);


// =====================================================
// CREATE SUBSCRIPTION PLAN
// =====================================================

router.post(
    "/",
    adminOnly,
    createAdminSubscription
);


// =====================================================
// UPDATE SUBSCRIPTION PLAN
// =====================================================

router.put(
    "/:id",
    adminOnly,
    updateAdminSubscription
);


// =====================================================
// DELETE SUBSCRIPTION PLAN
// =====================================================

router.delete(
    "/:id",
    adminOnly,
    deleteAdminSubscription
);


module.exports = router;