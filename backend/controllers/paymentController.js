const crypto = require("crypto");
const Razorpay = require("razorpay");

const User = require("../models/User");
const Plan = require("../models/Plan");
const PaymentTransaction = require("../models/PaymentTransaction");

// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =====================================================
// CREATE SUBSCRIPTION
// =====================================================

const createSubscription = async (req, res) => {

    try {

        const { plan } = req.body;


        // -------------------------------------------------
        // VALIDATE PLAN SLUG
        // -------------------------------------------------

        if (!plan) {

            return res.status(400).json({
                success: false,
                message: "Subscription plan is required"
            });

        }


        // -------------------------------------------------
        // GET ACTIVE PLAN FROM MONGODB
        // -------------------------------------------------

        const selectedPlan = await Plan.findOne({

            slug: String(plan)
                .trim()
                .toLowerCase(),

            status: "active"

        });


        if (!selectedPlan) {

            return res.status(404).json({
                success: false,
                message: "Subscription plan not found or inactive"
            });

        }


        // -------------------------------------------------
        // FREE PLAN
        // -------------------------------------------------

        if (Number(selectedPlan.price) <= 0) {

            return res.status(400).json({
                success: false,
                message: "Free plan does not require payment"
            });

        }


        // -------------------------------------------------
        // RAZORPAY PLAN ID REQUIRED
        // -------------------------------------------------

        if (!selectedPlan.razorpayPlanId) {

            return res.status(400).json({
                success: false,
                message:
                    "Razorpay Plan ID is not configured for this plan"
            });

        }


        // -------------------------------------------------
        // GET USER
        // -------------------------------------------------

        const user = await User.findById(
            req.user._id
        );


        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        // -------------------------------------------------
        // CREATE RAZORPAY SUBSCRIPTION
        // -------------------------------------------------

        const subscription =
            await razorpay.subscriptions.create({

                plan_id:
                    selectedPlan.razorpayPlanId,

                total_count: 12,

                quantity: 1,

                customer_notify: 1,

                notes: {

                    userId:
                        String(user._id),

                    planId:
                        String(selectedPlan._id),

                    plan:
                        selectedPlan.slug,

                    planName:
                        selectedPlan.name,

                    email:
                        user.email

                }

            });


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            subscriptionId:
                subscription.id,

            keyId:
                process.env.RAZORPAY_KEY_ID,

            plan:
                selectedPlan.slug,

            planId:
                String(selectedPlan._id),

            planName:
                selectedPlan.name,

            price:
                Number(selectedPlan.price),

            currency:
                selectedPlan.currency || "INR"

        });


    } catch (error) {

        console.error(
            "Create subscription error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error?.error?.description ||
                error?.description ||
                "Unable to create Razorpay subscription"

        });

    }

};


// =====================================================
// VERIFY SUBSCRIPTION
// =====================================================

const verifySubscription = async (
    req,
    res
) => {

    try {

        const {

            razorpay_payment_id,

            razorpay_subscription_id,

            razorpay_signature,

            plan

        } = req.body;


        // -------------------------------------------------
        // VALIDATE PAYMENT DATA
        // -------------------------------------------------

        if (

            !razorpay_payment_id ||

            !razorpay_subscription_id ||

            !razorpay_signature ||

            !plan

        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification data is incomplete"

            });

        }


        // -------------------------------------------------
        // FIND ACTIVE PLAN
        // -------------------------------------------------

        const selectedPlan =
            await Plan.findOne({

                slug:
                    String(plan)
                        .trim()
                        .toLowerCase(),

                status: "active"

            });


        if (!selectedPlan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found or inactive"

            });

        }


        // -------------------------------------------------
        // VERIFY RAZORPAY SIGNATURE
        // -------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_subscription_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        // -------------------------------------------------
        // COMPARE SIGNATURE
        // -------------------------------------------------

        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature"

            });

        }


        // -------------------------------------------------
        // UPDATE USER
        // -------------------------------------------------

        const user =
            await User.findByIdAndUpdate(

                req.user._id,

                {

                    plan:
                        selectedPlan.slug,

                    subscriptionId:
                        razorpay_subscription_id,

                    paymentId:
                        razorpay_payment_id,

                    subscriptionStatus:
                        "active"

                },

                {

                    new: true

                }

            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }

// =====================================================
// SAVE VERIFIED PAYMENT TRANSACTION
// =====================================================

try {

    await PaymentTransaction.create({

        user: user._id,

        paymentId:
            razorpay_payment_id,

        subscriptionId:
            razorpay_subscription_id,

        plan:
            selectedPlan.slug,

        planName:
            selectedPlan.name,

        amount:
            Number(selectedPlan.price),

        currency:
            selectedPlan.currency || "INR",

        status:
            "captured",

        paidAt:
            new Date()

    });

} catch (transactionError) {

    // Duplicate payment should not break
    // an already verified subscription.

    if (
        transactionError?.code !== 11000
    ) {

        console.error(
            "Payment transaction save error:",
            transactionError
        );

    }

}
        // -------------------------------------------------
        // SUCCESS RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            plan:
                selectedPlan.slug,

            planName:
                selectedPlan.name,

            price:
                Number(selectedPlan.price),

            subscriptionId:
                razorpay_subscription_id,

            paymentId:
                razorpay_payment_id

        });


    } catch (error) {

        console.error(
            "Verify subscription error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed"

        });

    }

};
// =====================================================
// CREATE RAZORPAY STANDARD CHECKOUT ORDER
// =====================================================

const createOrder = async (req, res) => {

    try {

        const { plan } = req.body;

        // -------------------------------------------------
        // VALIDATE PLAN
        // -------------------------------------------------

        if (!plan) {

            return res.status(400).json({
                success: false,
                message: "Plan is required"
            });

        }

        // -------------------------------------------------
        // GET ACTIVE PLAN FROM MONGODB
        // -------------------------------------------------

        const selectedPlan = await Plan.findOne({

            slug: String(plan)
                .trim()
                .toLowerCase(),

            status: "active"

        });

        if (!selectedPlan) {

            return res.status(404).json({
                success: false,
                message: "Subscription plan not found or inactive"
            });

        }

        // -------------------------------------------------
        // FREE PLAN
        // -------------------------------------------------

        if (Number(selectedPlan.price) <= 0) {

            return res.status(400).json({
                success: false,
                message: "Free plan does not require payment"
            });

        }

        // -------------------------------------------------
        // GET USER
        // -------------------------------------------------

        const user = await User.findById(
            req.user._id
        );

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // -------------------------------------------------
        // CONVERT RUPEES TO PAISE
        // -------------------------------------------------

        const amountInPaise =
            Math.round(
                Number(selectedPlan.price) * 100
            );

        if (
            !Number.isFinite(amountInPaise) ||
            amountInPaise < 100
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }

        // -------------------------------------------------
        // CREATE RAZORPAY ORDER
        // -------------------------------------------------

        const order =
            await razorpay.orders.create({

                amount:
                    amountInPaise,

                currency:
                    selectedPlan.currency || "INR",

                receipt:
                    `calcura_${Date.now()}`,

                notes: {

                    userId:
                        String(user._id),

                    planId:
                        String(selectedPlan._id),

                    plan:
                        selectedPlan.slug,

                    planName:
                        selectedPlan.name,

                    email:
                        user.email

                }

            });

        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            order_id:
                order.id,

            amount:
                order.amount,

            currency:
                order.currency,

            keyId:
                process.env.RAZORPAY_KEY_ID,

            plan:
                selectedPlan.slug,

            planName:
                selectedPlan.name,

            price:
                Number(selectedPlan.price)

        });

    } catch (error) {

        console.error(
            "Create Razorpay order error:",
            error
        );

        return res.status(
            error?.statusCode === 400 ||
            error?.statusCode === 401
                ? error.statusCode
                : 500
        ).json({

            success: false,

            message:
                error?.error?.description ||
                error?.description ||
                error?.message ||
                "Unable to create Razorpay order"

        });

    }

};


/// =====================================================
// VERIFY RAZORPAY STANDARD CHECKOUT PAYMENT
// =====================================================

const verifyPayment = async (req, res) => {

    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            plan

        } = req.body;

        // -------------------------------------------------
        // VALIDATE PAYMENT DATA
        // -------------------------------------------------

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature ||
            !plan
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification data is incomplete"

            });

        }

        // -------------------------------------------------
        // FIND ACTIVE PLAN
        // -------------------------------------------------

        const selectedPlan =
            await Plan.findOne({

                slug:
                    String(plan)
                        .trim()
                        .toLowerCase(),

                status: "active"

            });

        if (!selectedPlan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found or inactive"

            });

        }

        // -------------------------------------------------
        // GENERATE SIGNATURE
        // -------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");

        // -------------------------------------------------
        // COMPARE SIGNATURE
        // -------------------------------------------------

        if (
            generatedSignature !==
            razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature"

            });

        }

        // -------------------------------------------------
        // UPDATE USER PLAN
        // -------------------------------------------------

        const user =
            await User.findByIdAndUpdate(

                req.user._id,

                {

                    plan:
                        selectedPlan.slug,

                    paymentId:
                        razorpay_payment_id,

                    subscriptionStatus:
                        "active"

                },

                {
                    new: true
                }

            );

        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }

        // -------------------------------------------------
        // SAVE PAYMENT TRANSACTION
        // -------------------------------------------------

        try {

            await PaymentTransaction.create({

                user:
                    user._id,

                paymentId:
                    razorpay_payment_id,

                plan:
                    selectedPlan.slug,

                planName:
                    selectedPlan.name,

                amount:
                    Number(selectedPlan.price),

                currency:
                    selectedPlan.currency ||
                    "INR",

                status:
                    "captured",

                paidAt:
                    new Date()

            });

        } catch (transactionError) {

            if (
                transactionError?.code !== 11000
            ) {

                console.error(
                    "Payment transaction save error:",
                    transactionError
                );

            }

        }

        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            plan:
                selectedPlan.slug,

            planName:
                selectedPlan.name,

            price:
                Number(selectedPlan.price),

            orderId:
                razorpay_order_id,

            paymentId:
                razorpay_payment_id

        });

    } catch (error) {

        console.error(
            "Verify Razorpay payment error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Payment verification failed"

        });

    }

};

// =====================================================
// RAZORPAY PUBLIC CONFIG
// =====================================================

const getRazorpayConfig = async (req, res) => {

    return res.status(200).json({

        success: true,

        keyId:
            process.env.RAZORPAY_KEY_ID

    });

};


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createSubscription,

    verifySubscription,

    createOrder,

    verifyPayment,

    getRazorpayConfig

};