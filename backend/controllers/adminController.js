const User = require("../models/User");
const Calculation = require("../models/Calculation");
const SavedCalculation = require("../models/Saved");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

const getDashboardStats = async (req, res) => {
    try {

        // =================================================
        // DATE RANGE
        // =================================================

        const requestedDays =
            Number(req.query.days) || 30;

        const days = Math.min(
            Math.max(requestedDays, 1),
            365
        );

        const now = new Date();

        const startDate = new Date(now);

        startDate.setDate(
            startDate.getDate() - (days - 1)
        );

        startDate.setHours(0, 0, 0, 0);


        // =================================================
        // TOTAL USERS
        // =================================================

        const totalUsers =
            await User.countDocuments();


        // =================================================
        // TOTAL CALCULATIONS
        // =================================================

        const totalCalculations =
            await Calculation.countDocuments();


        // =================================================
        // TOTAL SAVED
        // =================================================

        const totalSaved =
            await SavedCalculation.countDocuments();


        // =================================================
        // ACTIVE USERS
        //
        // Users who performed at least one
        // calculation in selected period
        // =================================================

        const activeUserIds =
            await Calculation.distinct(
                "user",
                {
                    createdAt: {
                        $gte: startDate,
                        $lte: now
                    }
                }
            );

        const activeUsers =
            activeUserIds.length;


        // =================================================
        // ACTIVE SUBSCRIPTIONS
        // =================================================

        const activeSubscriptions =
            await User.countDocuments({
                subscriptionStatus: "active",
                plan: {
                    $ne: "free"
                }
            });


        // =================================================
        // RECENT USERS
        // =================================================

        const recentUsers =
            await User.find()
                .select(
                    "_id name email role plan subscriptionStatus createdAt updatedAt"
                )
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .lean();


        // =================================================
        // RECENT CALCULATIONS
        // =================================================

        const calculationDocs =
            await Calculation.find()
                .populate(
                    "user",
                    "name email"
                )
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .lean();


        const recentCalculations =
            calculationDocs.map(
                function (item) {

                    return {
                        _id: item._id,

                        userName:
                            item.user?.name ||
                            "Unknown User",

                        email:
                            item.user?.email ||
                            "",

                        expression:
                            item.expression ||
                            "",

                        result:
                            item.result ??
                            "",

                        type:
                            item.type ||
                            "calculator",

                        createdAt:
                            item.createdAt
                    };

                }
            );


        // =================================================
        // RECENT ACTIVITY
        // =================================================

        const userActivity =
            recentUsers.map(
                function (user) {

                    return {
                        kind: "user",

                        title:
                            "New user registered",

                        detail:
                            user.email,

                        createdAt:
                            user.createdAt
                    };

                }
            );


        const calculationActivity =
            recentCalculations.map(
                function (item) {

                    return {
                        kind: "calculation",

                        title:
                            "Calculation performed",

                        detail:
                            `${item.userName} • ${item.expression}`,

                        createdAt:
                            item.createdAt
                    };

                }
            );


        const recentActivity =
            [
                ...userActivity,
                ...calculationActivity
            ]
                .sort(
                    function (a, b) {

                        return (
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                        );

                    }
                )
                .slice(0, 10);


        // =================================================
        // USER ACTIVITY CHART
        // =================================================

        const dateKeyFormat =
            "%Y-%m-%d";


        // NEW USERS PER DAY
        const usersByDay =
            await User.aggregate([

                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: now
                        }
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format:
                                    dateKeyFormat,

                                date:
                                    "$createdAt",

                                timezone:
                                    "Asia/Kolkata"
                            }
                        },

                        count: {
                            $sum: 1
                        }

                    }
                }

            ]);


        // CALCULATIONS PER DAY
        const calculationsByDay =
            await Calculation.aggregate([

                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: now
                        }
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format:
                                    dateKeyFormat,

                                date:
                                    "$createdAt",

                                timezone:
                                    "Asia/Kolkata"
                            }
                        },

                        count: {
                            $sum: 1
                        }

                    }
                }

            ]);


        // ACTIVE USERS PER DAY
        const activeUsersByDay =
            await Calculation.aggregate([

                {
                    $match: {
                        createdAt: {
                            $gte: startDate,
                            $lte: now
                        }
                    }
                },

                {
                    $group: {

                        _id: {
                            day: {
                                $dateToString: {
                                    format:
                                        dateKeyFormat,

                                    date:
                                        "$createdAt",

                                    timezone:
                                        "Asia/Kolkata"
                                }
                            },

                            users: "$user"
                        }

                    }
                },

                {
                    $group: {

                        _id: "$_id.day",

                        activeUsers: {
                            $sum: 1
                        }

                    }

                }

            ]);


        // Convert aggregation results to maps
        const newUserMap = {};

        usersByDay.forEach(
            function (item) {

                newUserMap[item._id] =
                    item.count;

            }
        );


        const calculationMap = {};

        calculationsByDay.forEach(
            function (item) {

                calculationMap[item._id] =
                    item.count;

            }
        );


        const activeUserMap = {};

        activeUsersByDay.forEach(
            function (item) {

                activeUserMap[item._id] =
                    item.activeUsers;

            }
        );


        // Build complete series
        // including days with zero activity
        const chart = [];

        for (
            let i = 0;
            i < days;
            i++
        ) {

            const currentDate =
                new Date(startDate);

            currentDate.setDate(
                startDate.getDate() + i
            );


            const year =
                currentDate.getFullYear();

            const month =
                String(
                    currentDate.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    currentDate.getDate()
                ).padStart(2, "0");


            const key =
                `${year}-${month}-${day}`;


            chart.push({

                label:
                    currentDate.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short"
                        }
                    ),

                newUsers:
                    newUserMap[key] || 0,

                activeUsers:
                    activeUserMap[key] || 0,

                calculations:
                    calculationMap[key] || 0

            });

        }


        // =================================================
        // CALCULATIONS BY TYPE
        // =================================================

        const calculationsByType =
            await Calculation.aggregate([

                {
                    $group: {

                        _id: "$type",

                        count: {
                            $sum: 1
                        }

                    }
                },

                {
                    $sort: {
                        count: -1
                    }
                }

            ]);


        // =================================================
        // FINAL RESPONSE
        // =================================================

        res.status(200).json({

            success: true,

            stats: {

                totalUsers,

                activeUsers,

                totalCalculations,

                activeSubscriptions,

                totalSaved

            },

            recentActivity,

            recentCalculations,

            chart,

            calculationsByType

        });

    }

    catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load admin dashboard",

            error:
                error.message

        });

    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getDashboardStats
};