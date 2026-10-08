const express = require("express");

const {
    createSubscription,
    verifySubscription,
    createOrder,
    verifyPayment,
    getRazorpayConfig
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// RAZORPAY SUBSCRIPTION
// =====================================================

router.post(
    "/create-subscription",
    protect,
    createSubscription
);

router.post(
    "/verify-subscription",
    protect,
    verifySubscription
);


// =====================================================
// RAZORPAY STANDARD CHECKOUT
// =====================================================

router.post(
    "/create-order",
    protect,
    createOrder
);

router.post(
    "/verify-payment",
    protect,
    verifyPayment
);

router.get(
    "/razorpay-config",
    protect,
    getRazorpayConfig
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;