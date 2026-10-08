"use strict";

const User =
    require("../models/User");

const Calculation =
    require("../models/Calculation");

const PaymentTransaction =
    require("../models/PaymentTransaction");


/* =====================================================
   HELPERS
===================================================== */

function safeName(user) {

    if (!user) {
        return "Unknown User";
    }

    return (
        user.name ||
        user.email ||
        "Unknown User"
    );
}


function safeEmail(user) {

    return (
        user?.email ||
        "—"
    );
}


function getInitial(name) {

    return String(name || "U")
        .charAt(0)
        .toUpperCase();
}
/* =====================================================
   DETECT ACTUAL CALCULATION TYPE
===================================================== */

function detectCalculationType(calculation) {

    const expression =
        String(
            calculation.expression || ""
        )
            .trim()
            .toLowerCase();

    const storedType =
        String(
            calculation.type || ""
        )
            .trim()
            .toLowerCase();


    /* =================================================
       VOICE
    ================================================= */

    if (
        storedType === "voice" ||
        storedType.includes("voice")
    ) {
        return "Voice Calculation";
    }


    /* =================================================
       AI
    ================================================= */

    if (
        storedType === "ai" ||
        storedType.includes("ai")
    ) {
        return "AI Calculation";
    }


    /* =================================================
       GRAPH / PLOT
    ================================================= */

    if (
        storedType.includes("graph") ||
        storedType.includes("plot") ||
        expression.startsWith("y=") ||
        expression.startsWith("y =") ||
        expression.includes("plot(") ||
        expression.includes("graph")
    ) {
        return "Graph / Plot";
    }


    /* =================================================
       MATRIX
    ================================================= */

    if (
        storedType.includes("matrix") ||
        expression.includes("matrix") ||
        expression.includes("det(") ||
        expression.includes("inv(") ||
        expression.includes("transpose(") ||
        expression.includes("trace(")
    ) {
        return "Matrix";
    }


    /* =================================================
       NUMERICAL METHODS
    ================================================= */

    if (
        storedType.includes("numerical") ||
        expression.includes("simpson") ||
        expression.includes("trapezoidal") ||
        expression.includes("trapezoid") ||
        expression.includes("euler") ||
        expression.includes("runge") ||
        expression.includes("rk4") ||
        expression.includes("newton") ||
        expression.includes("lagrange")
    ) {
        return "Numerical Methods";
    }


    /* =================================================
       CALCULUS
    ================================================= */

    if (
        storedType.includes("calculus") ||
        storedType.includes("derivative") ||
        storedType.includes("integral") ||
        expression.includes("derivative") ||
        expression.includes("differentiate") ||
        expression.includes("integral") ||
        expression.includes("integrate") ||
        expression.includes("diff(") ||
        expression.includes("deriv(")
    ) {
        return "Calculus";
    }


    /* =================================================
       LOG & EXP
    ================================================= */

    if (
        storedType.includes("log") ||
        storedType.includes("exp") ||
        expression.includes("log(") ||
        expression.includes("ln(") ||
        expression.includes("log10(") ||
        expression.includes("log2(") ||
        expression.includes("exp(")
    ) {
        return "Log & Exp";
    }


    /* =================================================
       TRIGONOMETRY
    ================================================= */

    const trigFunctions = [
        "sin(",
        "cos(",
        "tan(",
        "asin(",
        "acos(",
        "atan(",
        "sinh(",
        "cosh(",
        "tanh(",
        "sec(",
        "csc(",
        "cot("
    ];

    if (
        storedType.includes("trig") ||
        trigFunctions.some(
            functionName =>
                expression.includes(functionName)
        )
    ) {
        return "Trigonometry";
    }


    /* =================================================
       ALGEBRA
    ================================================= */

    if (
        storedType.includes("algebra") ||
        expression.includes("solve(") ||
        expression.includes("simplify(") ||
        expression.includes("factor(") ||
        expression.includes("expand(") ||
        expression.includes("roots(")
    ) {
        return "Algebra";
    }


    /* =================================================
       BASIC ARITHMETIC
    ================================================= */

    if (
        storedType === "calculator" ||
        storedType === "basic" ||
        storedType === "basic arithmetic" ||
        storedType === ""
    ) {
        return "Basic Arithmetic";
    }


    /* =================================================
       FALLBACK
    ================================================= */

    return "Basic Arithmetic";
}

function formatActivityDate(date) {

    if (!date) {
        return null;
    }

    return new Date(date)
        .toLocaleString(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );
}


/* =====================================================
   CREATE LOG
===================================================== */

function makeLog({
    id,
    user,
    type,
    category,
    description,
    date,
    status = "success",
    ip = null,
    metadata = {}
}) {

    const userName =
        safeName(user);

    return {

        _id: id,

        user: {
            id:
                user?._id ||
                null,

            name:
                userName,

            email:
                safeEmail(user),

            initial:
                getInitial(userName)
        },

        activityType:
            type,

        category:
            category,

        description:
            description,

        ipAddress:
            ip ||
            "Not recorded",

        date:
            date,

        formattedDate:
            formatActivityDate(date),

        status:
            status,

        metadata:
            metadata
    };
}


/* =====================================================
   GET ACTIVITY LOGS
===================================================== */

const getActivityLogs =
    async (req, res) => {

        try {

            const page =
                Math.max(
                    1,
                    Number(
                        req.query.page || 1
                    )
                );


            const limit =
                Math.min(
                    50,
                    Math.max(
                        1,
                        Number(
                            req.query.limit || 10
                        )
                    )
                );


            const search =
                String(
                    req.query.search || ""
                )
                    .trim()
                    .toLowerCase();


            const category =
                String(
                    req.query.category || ""
                )
                    .trim()
                    .toLowerCase();


            const status =
                String(
                    req.query.status || ""
                )
                    .trim()
                    .toLowerCase();


            const userId =
                String(
                    req.query.userId || ""
                ).trim();


            const start =
                req.query.start
                    ? new Date(
                        `${req.query.start}T00:00:00`
                    )
                    : null;


            const end =
                req.query.end
                    ? new Date(
                        `${req.query.end}T23:59:59.999`
                    )
                    : null;


            /* =================================================
               FETCH REAL USERS
            ================================================= */

            const userQuery = {};

            if (start && !isNaN(start)) {

                userQuery.createdAt = {
                    $gte: start
                };

            }

            if (end && !isNaN(end)) {

                userQuery.createdAt = {
                    ...(userQuery.createdAt || {}),
                    $lte: end
                };

            }


            if (userId) {

                userQuery._id =
                    userId;

            }


            const users =
                await User.find(
                    userQuery
                )
                .select(
                    "_id name email role createdAt updatedAt"
                )
                .lean();


            const userMap =
                new Map();

            users.forEach(
                user => {

                    userMap.set(
                        String(user._id),
                        user
                    );

                }
            );


            /* =================================================
               CALCULATIONS
            ================================================= */

            const calculationQuery = {};

            if (start && !isNaN(start)) {

                calculationQuery.createdAt = {
                    $gte: start
                };

            }

            if (end && !isNaN(end)) {

                calculationQuery.createdAt = {
                    ...(calculationQuery.createdAt || {}),
                    $lte: end
                };

            }


            if (userId) {

                calculationQuery.user =
                    userId;

            }


            const calculations =
                await Calculation.find(
                    calculationQuery
                )
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .lean();


            /* =================================================
               PAYMENTS
            ================================================= */

            const paymentQuery = {
                status: "captured"
            };


            if (start && !isNaN(start)) {

                paymentQuery.paidAt = {
                    $gte: start
                };

            }

            if (end && !isNaN(end)) {

                paymentQuery.paidAt = {
                    ...(paymentQuery.paidAt || {}),
                    $lte: end
                };

            }


            if (userId) {

                paymentQuery.user =
                    userId;

            }


            let payments = [];

            try {

                payments =
                    await PaymentTransaction.find(
                        paymentQuery
                    )
                    .populate(
                        "user",
                        "name email"
                    )
                    .sort({
                        paidAt: -1
                    })
                    .lean();

            }
            catch (paymentError) {

                console.warn(
                    "Payment logs skipped:",
                    paymentError.message
                );

            }


            /* =================================================
               BUILD LOGS
            ================================================= */

            const logs = [];


            /* USER REGISTRATION */

            users.forEach(
                user => {

                    logs.push(
                        makeLog({
                            id:
                                `user-${user._id}`,

                            user:
                                user,

                            type:
                                "User Registration",

                            category:
                                "user",

                            description:
                                "New user registered",

                            date:
                                user.createdAt,

                            status:
                                "success"
                        })
                    );

                }
            );


            /* CALCULATIONS */

           /* =================================================
   CALCULATIONS
================================================= */

calculations.forEach(
    calculation => {

        /* -----------------------------------------
           DETECT ACTUAL CALCULATION TYPE
        ----------------------------------------- */

        const calculationName =
            detectCalculationType(
                calculation
            );


        /* -----------------------------------------
           DESCRIPTION
        ----------------------------------------- */

        let description =
            "Solved a calculation";


        if (
            calculationName ===
            "Voice Calculation"
        ) {

            description =
                "Solved a calculation using voice input";

        }

        else if (
            calculationName ===
            "AI Calculation"
        ) {

            description =
                "Solved a calculation using AI";

        }

        else {

            description =
                `Solved a ${calculationName.toLowerCase()} calculation`;

        }


        /* -----------------------------------------
           CREATE ACTIVITY LOG
        ----------------------------------------- */

        logs.push(

            makeLog({

                id:
                    `calculation-${calculation._id}`,

                user:
                    calculation.user,

                type:
                    calculationName,

                category:
                    "user",

                description:
                    description,

                date:
                    calculation.createdAt,

                status:
                    "success",

                metadata: {

                    expression:
                        calculation.expression ||
                        "—",

                    result:
                        calculation.result ||
                        "—",

                    type:
                        calculation.type ||
                        "calculator",

                    calculationType:
                        calculationName

                }

            })

        );

    }
);


            /* PAYMENTS */

            payments.forEach(
                payment => {

                    const amount =
                        Number(
                            payment.amount || 0
                        );


                    const currency =
                        payment.currency ||
                        "INR";


                    logs.push(
                        makeLog({
                            id:
                                `payment-${payment._id}`,

                            user:
                                payment.user,

                            type:
                                "Payment",

                            category:
                                "subscription",

                            description:
                                `Payment successful (${currency} ${amount})`,

                            date:
                                payment.paidAt ||
                                payment.createdAt,

                            status:
                                "success",

                            metadata: {
                                amount:
                                    amount,

                                currency:
                                    currency,

                                transactionId:
                                    payment.transactionId ||
                                    payment.razorpayPaymentId ||
                                    payment.paymentId ||
                                    "—"
                            }
                        })
                    );

                }
            );


            /* =================================================
               SEARCH
            ================================================= */

            let filtered =
                logs.filter(
                    log => {

                        if (
                            category &&
                            log.category !== category
                        ) {

                            return false;

                        }


                        if (
                            status &&
                            log.status !== status
                        ) {

                            return false;

                        }


                        if (search) {

                            const searchable = [
                                log.user?.name,
                                log.user?.email,
                                log.activityType,
                                log.description,
                                log.ipAddress
                            ]
                                .join(" ")
                                .toLowerCase();


                            if (
                                !searchable.includes(
                                    search
                                )
                            ) {

                                return false;

                            }

                        }


                        return true;

                    }
                );


            /* =================================================
               SORT
            ================================================= */

            filtered.sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );


            const total =
                filtered.length;


            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        total / limit
                    )
                );


            const safePage =
                Math.min(
                    page,
                    totalPages
                );


            const startIndex =
                (safePage - 1) *
                limit;


            const pageLogs =
                filtered.slice(
                    startIndex,
                    startIndex + limit
                );


            /* =================================================
               STATS
            ================================================= */

            const userActivities =
                logs.filter(
                    log =>
                        log.category === "user"
                ).length;


            const subscriptionActivities =
                logs.filter(
                    log =>
                        log.category ===
                        "subscription"
                ).length;


            const systemActivities =
                logs.filter(
                    log =>
                        log.category ===
                        "system"
                ).length;


            return res.json({

                success: true,

                logs:
                    pageLogs,

                pagination: {

                    page:
                        safePage,

                    limit:
                        limit,

                    total:
                        total,

                    totalPages:
                        totalPages

                },

                stats: {

                    totalLogs:
                        logs.length,

                    userActivities:
                        userActivities,

                    subscriptionActivities:
                        subscriptionActivities,

                    systemActivities:
                        systemActivities

                }

            });

        }
        catch (error) {

            console.error(
                "ACTIVITY LOG ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Unable to load activity logs.",

                error:
                    process.env.NODE_ENV ===
                    "development"
                        ? error.message
                        : undefined

            });

        }

    };


module.exports = {
    getActivityLogs
};
