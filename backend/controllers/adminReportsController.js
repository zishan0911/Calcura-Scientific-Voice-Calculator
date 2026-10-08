"use strict";

const User =
    require("../models/User");

const Calculation =
    require("../models/Calculation");

const Formula =
    require("../models/Formula");

const PaymentTransaction =
    require("../models/PaymentTransaction");

const Graph =
    require("../models/Graph");

const Converter =
    require("../models/Converter");


// =====================================================
// CONSTANTS
// =====================================================

const TIME_ZONE =
    "Asia/Kolkata";

const DAY_MS =
    24 * 60 * 60 * 1000;


// =====================================================
// DATE HELPERS
// =====================================================

function getEndDate(req) {

    const now =
        new Date();

    const end =
        req.query.end
            ? new Date(req.query.end)
            : now;

    if (
        Number.isNaN(
            end.getTime()
        )
    ) {

        return now;

    }

    end.setHours(
        23,
        59,
        59,
        999
    );

    return end;
}


function getStartDate(req) {

    const endDate =
        getEndDate(req);

    if (
        req.query.start
    ) {

        const start =
            new Date(
                req.query.start
            );

        if (
            !Number.isNaN(
                start.getTime()
            )
        ) {

            return start;

        }

    }

    const days =
        Math.max(
            1,
            Math.min(
                365,
                Number(
                    req.query.days || 30
                )
            )
        );


    const start =
        new Date(
            endDate.getTime() -
            (days - 1) *
            DAY_MS
        );


    start.setHours(
        0,
        0,
        0,
        0
    );


    return start;
}


// =====================================================
// DATE KEY
// =====================================================

function dateKey(date) {

    return new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone:
                TIME_ZONE,

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit"
        }
    ).format(date);

}


// =====================================================
// MONTH KEY
// =====================================================

function monthKey(date) {

    const parts =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone:
                    TIME_ZONE,

                year:
                    "numeric",

                month:
                    "2-digit"
            }
        ).formatToParts(date);


    const year =
        parts.find(
            part =>
                part.type === "year"
        )?.value;


    const month =
        parts.find(
            part =>
                part.type === "month"
        )?.value;


    return `${year}-${month}`;
}


// =====================================================
// DISPLAY DATE
// =====================================================

function displayDate(
    key
) {

    if (!key) {
        return "";
    }


    const parts =
        key.split("-");


    if (
        parts.length !== 3
    ) {

        return key;

    }


    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


// =====================================================
// CREATE DAILY BUCKETS
// =====================================================

function createDailyBuckets(
    startDate,
    endDate
) {

    const buckets = [];

    const cursor =
        new Date(startDate);


    cursor.setHours(
        0,
        0,
        0,
        0
    );


    const finalDate =
        new Date(endDate);


    finalDate.setHours(
        0,
        0,
        0,
        0
    );


    while (
        cursor <= finalDate
    ) {

        const key =
            dateKey(cursor);


        buckets.push({
            key,
            label:
                displayDate(key),
            count:
                0,
            revenue:
                0
        });


        cursor.setDate(
            cursor.getDate() + 1
        );

    }


    return buckets;
}


// =====================================================
// ZERO FILL DAILY USERS
// =====================================================

function buildDailyUsers(
    raw,
    startDate,
    endDate
) {

    const buckets =
        createDailyBuckets(
            startDate,
            endDate
        );


    const map = {};


    raw.forEach(
        item => {

            map[
                item._id
            ] =
                Number(
                    item.count || 0
                );

        }
    );


    return buckets.map(
        bucket => ({

            _id:
                bucket.key,

            label:
                bucket.label,

            count:
                map[
                    bucket.key
                ] || 0

        })
    );
}


// =====================================================
// ZERO FILL DAILY CALCULATIONS
// =====================================================

function buildDailyCalculations(
    raw,
    startDate,
    endDate
) {

    const buckets =
        createDailyBuckets(
            startDate,
            endDate
        );


    const map = {};


    raw.forEach(
        item => {

            map[
                item._id
            ] =
                Number(
                    item.count || 0
                );

        }
    );


    return buckets.map(
        bucket => ({

            _id:
                bucket.key,

            label:
                bucket.label,

            count:
                map[
                    bucket.key
                ] || 0

        })
    );
}


// =====================================================
// ZERO FILL DAILY REVENUE
// =====================================================

function buildDailyRevenue(
    raw,
    startDate,
    endDate
) {

    const buckets =
        createDailyBuckets(
            startDate,
            endDate
        );


    const map = {};


    raw.forEach(
        item => {

            map[
                item._id
            ] =
                Number(
                    item.revenue || 0
                );

        }
    );


    return buckets.map(
        bucket => ({

            _id:
                bucket.key,

            label:
                bucket.label,

            revenue:
                map[
                    bucket.key
                ] || 0

        })
    );
}


// =====================================================
// WEEKLY AGGREGATION
// =====================================================

function buildWeekly(
    daily
) {

    const map = {};


    daily.forEach(
        item => {

            const date =
                new Date(
                    `${item._id}T00:00:00`
                );


            const day =
                date.getDay();


            const diff =
                day === 0
                    ? -6
                    : 1 - day;


            const monday =
                new Date(date);


            monday.setDate(
                date.getDate() +
                diff
            );


            const key =
                dateKey(monday);


            if (!map[key]) {

                map[key] = {

                    _id:
                        key,

                    count:
                        0,

                    revenue:
                        0

                };

            }


            map[key].count +=
                Number(
                    item.count || 0
                );


            map[key].revenue +=
                Number(
                    item.revenue || 0
                );

        }
    );


    return Object.values(
        map
    )
        .sort(
            (a, b) =>
                a._id.localeCompare(
                    b._id
                )
        )
        .map(
            item => ({

                _id:
                    item._id,

                count:
                    item.count,

                revenue:
                    item.revenue

            })
        );
}


// =====================================================
// MONTHLY AGGREGATION
// =====================================================

function buildMonthly(
    daily
) {

    const map = {};


    daily.forEach(
        item => {

            const key =
                item._id.slice(
                    0,
                    7
                );


            if (!map[key]) {

                map[key] = {

                    _id:
                        key,

                    count:
                        0,

                    revenue:
                        0

                };

            }


            map[key].count +=
                Number(
                    item.count || 0
                );


            map[key].revenue +=
                Number(
                    item.revenue || 0
                );

        }
    );


    return Object.values(
        map
    )
        .sort(
            (a, b) =>
                a._id.localeCompare(
                    b._id
                )
        );
}


// =====================================================
// MAIN REPORT
// =====================================================

const getReports =
    async (
        req,
        res
    ) => {

        try {

            const startDate =
                getStartDate(req);


            const endDate =
                getEndDate(req);


            // =================================================
            // ALL TIME KPI
            // =================================================

            const totalUsers =
                await User.countDocuments();


            const totalCalculations =
                await Calculation.countDocuments();


            const activeSubscriptions =
                await User.countDocuments({

                    subscriptionStatus:
                        "active",

                    plan: {
                        $in: [
                            "student",
                            "pro"
                        ]
                    }

                });


            // =================================================
// MONTHLY SUBSCRIPTION REVENUE
// =================================================

const activePlanRevenue = await User.aggregate([
    {
        $match: {
            subscriptionStatus: "active",
            plan: {
                $in: ["student", "pro"]
            }
        }
    },
    {
        $group: {
            _id: "$plan",
            subscribers: {
                $sum: 1
            }
        }
    }
]);

const PLAN_PRICES = {
    student: 4.99,
    pro: 9.99
};

let totalRevenue = 0;

activePlanRevenue.forEach(item => {
    const plan = String(item._id || "").toLowerCase();
    const subscribers = Number(item.subscribers || 0);
    const price = Number(PLAN_PRICES[plan] || 0);

    totalRevenue += subscribers * price;
});

const revenue = [
    {
        currency: "USD",
        amount: Number(totalRevenue.toFixed(2)),
        transactions: activePlanRevenue.reduce(
            (sum, item) =>
                sum + Number(item.subscribers || 0),
            0
        )
    }
];
            // =================================================
            // SELECTED RANGE
            // =================================================

            const rangeUserCount =
                await User.countDocuments({

                    createdAt: {

                        $gte:
                            startDate,

                        $lte:
                            endDate

                    }

                });


            const rangeCalculations =
                await Calculation.countDocuments({

                    createdAt: {

                        $gte:
                            startDate,

                        $lte:
                            endDate

                    }

                });


            // =================================================
            // ACTIVE USERS
            // =================================================

            const activeUsers =
                await Calculation.distinct(
                    "user",
                    {

                        createdAt: {

                            $gte:
                                startDate,

                            $lte:
                                endDate

                        }

                    }
                );


            // =================================================
            // RAW USER GROWTH
            // =================================================

            const rawUserGrowth =
                await User.aggregate([

                    {
                        $match: {

                            createdAt: {

                                $gte:
                                    startDate,

                                $lte:
                                    endDate

                            }

                        }

                    },

                    {
                        $group: {

                            _id: {

                                $dateToString: {

                                    format:
                                        "%Y-%m-%d",

                                    date:
                                        "$createdAt",

                                    timezone:
                                        TIME_ZONE

                                }

                            },

                            count: {

                                $sum:
                                    1

                            }

                        }

                    },

                    {
                        $sort: {
                            _id: 1
                        }
                    }

                ]);


            // =================================================
            // RAW CALCULATIONS
            // =================================================

            const rawCalculations =
                await Calculation.aggregate([

                    {
                        $match: {

                            createdAt: {

                                $gte:
                                    startDate,

                                $lte:
                                    endDate

                            }

                        }

                    },

                    {
                        $group: {

                            _id: {

                                $dateToString: {

                                    format:
                                        "%Y-%m-%d",

                                    date:
                                        "$createdAt",

                                    timezone:
                                        TIME_ZONE

                                }

                            },

                            count: {

                                $sum:
                                    1

                            }

                        }

                    },

                    {
                        $sort: {
                            _id: 1
                        }
                    }

                ]);


            // =================================================
            // RAW REVENUE
            // =================================================

            const rawRevenue =
                await PaymentTransaction.aggregate([

                    {
                        $match: {

                            status:
                                "captured",

                            paidAt: {

                                $gte:
                                    startDate,

                                $lte:
                                    endDate

                            }

                        }

                    },

                    {
                        $group: {

                            _id: {

                                $dateToString: {

                                    format:
                                        "%Y-%m-%d",

                                    date:
                                        "$paidAt",

                                    timezone:
                                        TIME_ZONE

                                }

                            },

                            revenue: {

                                $sum:
                                    "$amount"

                            },

                            transactions: {

                                $sum:
                                    1

                            }

                        }

                    },

                    {
                        $sort: {
                            _id: 1
                        }
                    }

                ]);


            // =================================================
            // BUILD FULL DAILY DATA
            // =================================================

            const dailyUsers =
                buildDailyUsers(
                    rawUserGrowth,
                    startDate,
                    endDate
                );


            const dailyCalculations =
                buildDailyCalculations(
                    rawCalculations,
                    startDate,
                    endDate
                );


            const dailyRevenue =
                buildDailyRevenue(
                    rawRevenue,
                    startDate,
                    endDate
                );


            // =================================================
            // WEEKLY DATA
            // =================================================

            const weeklyUsers =
                buildWeekly(
                    dailyUsers
                );


            const weeklyCalculations =
                buildWeekly(
                    dailyCalculations
                );


            const weeklyRevenue =
                buildWeekly(
                    dailyRevenue
                );


            // =================================================
            // MONTHLY DATA
            // =================================================

            const monthlyUsersTrend =
                buildMonthly(
                    dailyUsers
                );


            const monthlyCalculationsTrend =
                buildMonthly(
                    dailyCalculations
                );


            const monthlyRevenueTrend =
                buildMonthly(
                    dailyRevenue
                );
// =====================================================
// POPULAR CALCULATION TYPES
// =====================================================

const calculationTypes =
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


// =====================================================
// GRAPH + CONVERTER COUNTS
// =====================================================

let graphCount = 0;

let converterCount = 0;


// =====================================================
// GRAPH RECORDS
// =====================================================

try {

    graphCount =
        await Graph.countDocuments({});

}
catch (error) {

    console.warn(
        "Graph count skipped:",
        error.message
    );

}


// =====================================================
// CONVERTER RECORDS
// =====================================================

try {

    converterCount =
        await Converter.countDocuments({});

}
catch (error) {

    console.warn(
        "Converter count skipped:",
        error.message
    );

}


// =====================================================
// MERGE ALL TYPES
// =====================================================

const calculationTypeMap = {};


// Existing Calculation records
calculationTypes.forEach(
    item => {

        const key =
            String(
                item._id ||
                "other"
            )
                .trim()
                .toLowerCase();


        calculationTypeMap[key] =
            (
                calculationTypeMap[key] ||
                0
            ) +
            Number(
                item.count || 0
            );

    }
);


// Add Graph
if (graphCount > 0) {

    calculationTypeMap.graph =
        (
            calculationTypeMap.graph ||
            0
        ) +
        graphCount;

}


// Add Converter
if (converterCount > 0) {

    calculationTypeMap.converter =
        (
            calculationTypeMap.converter ||
            0
        ) +
        converterCount;

}


// =====================================================
// FINAL REPORT TYPES
// =====================================================

const reportCalculationTypes =
    Object.entries(
        calculationTypeMap
    )
        .map(
            ([type, count]) => ({

                _id:
                    type,

                count:
                    Number(count)

            })
        )
        .sort(
            (a, b) =>
                b.count -
                a.count
        );
/*
 * Convert to frontend format
 */
// =====================================================
// PLAN DISTRIBUTION
// =====================================================

const planDistribution =
    await User.aggregate([

        {
            $group: {

                _id: "$plan",

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
            // MONTHLY SUMMARY
            // =================================================

            const monthlyKeys =
                [
                    ...new Set([

                        ...monthlyUsersTrend
                            .map(
                                item =>
                                    item._id
                            ),

                        ...monthlyCalculationsTrend
                            .map(
                                item =>
                                    item._id
                            ),

                        ...monthlyRevenueTrend
                            .map(
                                item =>
                                    item._id
                            )

                    ])

                ].sort();


            const monthlySummary =
                await Promise.all(

                    monthlyKeys.map(
                        async month => {

                            const users =
                                monthlyUsersTrend
                                    .find(
                                        item =>
                                            item._id ===
                                            month
                                    )?.count ||
                                0;


                            const calculations =
                                monthlyCalculationsTrend
                                    .find(
                                        item =>
                                            item._id ===
                                            month
                                    )?.count ||
                                0;


                            const monthRevenue =
                                monthlyRevenueTrend
                                    .find(
                                        item =>
                                            item._id ===
                                            month
                                    )?.revenue ||
                                0;


                            const monthStart =
                                new Date(
                                    `${month}-01T00:00:00`
                                );


                            const nextMonth =
                                new Date(
                                    monthStart
                                );


                            nextMonth.setMonth(
                                nextMonth.getMonth() +
                                1
                            );


                            const activeSubscriptionsForMonth =
                                await User.countDocuments({

                                    subscriptionStatus:
                                        "active",

                                    plan: {

                                        $in: [
                                            "student",
                                            "pro"
                                        ]

                                    },

                                    createdAt: {

                                        $lt:
                                            nextMonth

                                    }

                                });


                            return {

                                month,

                                users:
                                    Number(
                                        users
                                    ),

                                calculations:
                                    Number(
                                        calculations
                                    ),

                                activeSubscriptions:
                                    Number(
                                        activeSubscriptionsForMonth
                                    ),

                                revenue:
                                    Number(
                                        monthRevenue
                                    ),

                                growth:
                                    0

                            };

                        }
                    )

                );


            // =====================================================
// POPULAR FORMULAS
// =====================================================

let popularFormulas = [];

try {

    popularFormulas =
        await Formula.find({

            status: "active"

        })
            .sort({

                views: -1,

                createdAt: -1

            })
            .limit(10)
            .select(
                "name expression category level views"
            )
            .lean();


}
catch (formulaError) {

    console.error(
        "Popular Formula Report Error:",
        formulaError
    );

    popularFormulas = [];

}
            // =================================================
            // RECENT USERS
            // =================================================

            const recentUsers =
                await User.find({})
                    .sort({
                        createdAt:
                            -1
                    })
                    .limit(5)
                    .select(
                        "name email role plan createdAt"
                    )
                    .lean();


            // =================================================
            // RECENT CALCULATIONS
            // =================================================

            const recentCalculations =
                await Calculation.find({})
                    .sort({
                        createdAt:
                            -1
                    })
                    .limit(5)
                    .populate(
                        "user",
                        "name email"
                    )
                    .lean();


            // =================================================
            // NOTIFICATIONS
            // =================================================

            const notifications = [];


            recentUsers.forEach(
                user => {

                    notifications.push({

                        type:
                            "user",

                        title:
                            "New user registered",

                        message:
                            `${user.name || user.email || "A user"} created an account.`,

                        date:
                            user.createdAt

                    });

                }
            );


            recentCalculations.forEach(
                calculation => {

                    notifications.push({

                        type:
                            "calculation",

                        title:
                            "New calculation",

                        message:
                            `A ${calculation.type || "calculator"} calculation was recorded.`,

                        date:
                            calculation.createdAt

                    });

                }
            );


            notifications.sort(
                (a, b) =>
                    new Date(
                        b.date
                    ) -
                    new Date(
                        a.date
                    )
            );


            // =================================================
            // RESPONSE
            // =================================================

            return res
                .status(200)
                .json({

                    success:
                        true,

                    generatedAt:
                        new Date(),

                    range: {

                        start:
                            startDate,

                        end:
                            endDate,

                        period:
                            "daily"

                    },


                    stats: {

                        totalUsers,

                        rangeUsers:
                            rangeUserCount,

                        rangeUserCount,

                        activeUsers:
                            activeUsers.length,

                        totalCalculations,

                        rangeCalculations,

                        activeSubscriptions,

                        totalRevenue,

                        revenue

                    },


                    // =================================================
                    // OLD FORMAT - KEEP FOR COMPATIBILITY
                    // =================================================

                    userGrowth:
                        dailyUsers,

                    calculationsTrend:
                        dailyCalculations,

                    revenueTrend:
                        dailyRevenue,


                    // =================================================
                    // NEW FORMAT - USED BY FRONTEND DROPDOWNS
                    // =================================================

                    trends: {

                        users: {

                            daily:
                                dailyUsers,

                            weekly:
                                weeklyUsers,

                            monthly:
                                monthlyUsersTrend

                        },


                        calculations: {

                            daily:
                                dailyCalculations,

                            weekly:
                                weeklyCalculations,

                            monthly:
                                monthlyCalculationsTrend

                        },


                        revenue: {

                            daily:
                                dailyRevenue,

                            weekly:
                                weeklyRevenue,

                            monthly:
                                monthlyRevenueTrend

                        }

                    },


                   calculationTypes:
                    reportCalculationTypes,

                    planDistribution,


                    monthlySummary,


                    popularFormulas,

                    recentUsers,

                    recentCalculations,

                    notifications

                });

        }


        catch (error) {

            console.error(
                "Admin Reports Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to load reports",

                    error:
                        error.message

                });

        }

    };


module.exports = {

    getReports

};