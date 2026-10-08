const mongoose = require("mongoose");

const User = require("../models/User");
const Calculation = require("../models/Calculation");


// ======================================================
// HELPERS
// ======================================================

function getLastActiveDate(userId, calculationMap) {

    return (
        calculationMap.get(
            String(userId)
        ) || null
    );

}


function isActiveUser(lastActive) {

    if (!lastActive) {
        return false;
    }

    const thirtyDaysAgo =
        new Date();

    thirtyDaysAgo.setDate(
        thirtyDaysAgo.getDate() - 30
    );

    return (
        new Date(lastActive) >=
        thirtyDaysAgo
    );

}


function formatUser(
    user,
    calculationMap
) {

    const lastActive =
        getLastActiveDate(
            user._id,
            calculationMap
        );


    return {

        _id:
            user._id,

        name:
            user.name,

        email:
            user.email,

        /*
         * Older users may not have a role
         * stored in MongoDB.
         *
         * Such users are normal users.
         */
        role:
            user.role ||
            "user",

        plan:
            user.plan ||
            "free",

        subscriptionStatus:
            user.subscriptionStatus ||
            "inactive",

                blocked:
            user.blocked || false,

        lastLoginAt:
            user.lastLoginAt || null,

        lastLoginIp:
            user.lastLoginIp || null,

        lastLoginDevice:
            user.lastLoginDevice || null,

        lastLoginBrowser:
            user.lastLoginBrowser || null,

        createdAt:
            user.createdAt,

        updatedAt:
            user.updatedAt,

        lastActive,

        status:
            isActiveUser(
                lastActive
            )
                ? "active"
                : "inactive"

    };

}


// ======================================================
// GET USERS
// ======================================================

const getAdminUsers = async (
    req,
    res
) => {

    try {

        const {
    page = 1,
    limit = 10,
    search = "",
    role = "all",
    plan = "all",
    status = "all",
    blocked = "all",
    registrationDate = ""
} = req.query;


        const currentPage =
            Math.max(
                Number(page) || 1,
                1
            );


        const perPage =
            Math.min(
                Math.max(
                    Number(limit) || 10,
                    1
                ),
                100
            );


        // ==================================================
        // BUILD FILTER CONDITIONS
        // ==================================================

        const conditions = [];


        // ==================================================
        // SEARCH
        // ==================================================

        if (
            typeof search === "string" &&
            search.trim()
        ) {

            const searchRegex =
                new RegExp(
                    search.trim(),
                    "i"
                );


            conditions.push({

                $or: [

                    {
                        name:
                            searchRegex
                    },

                    {
                        email:
                            searchRegex
                    }

                ]

            });

        }


        // ==================================================
        // ROLE FILTER
        // ==================================================

        if (role === "admin") {

            conditions.push({

                role: "admin"

            });

        }


        else if (role === "user") {

            /*
             * Treat users without a role field
             * as normal users.
             */

            conditions.push({

                $or: [

                    {
                        role: "user"
                    },

                    {
                        role: {
                            $exists: false
                        }
                    },

                    {
                        role: null
                    },

                    {
                        role: ""
                    }

                ]

            });

        }


        // ==================================================
        // PLAN FILTER
        // ==================================================

        if (
            [
                "free",
                "pro",
                "student"
            ].includes(plan)
        ) {

            conditions.push({

                plan: plan

            });

        }

        // ==================================================
// BLOCKED ACCOUNT FILTER
// ==================================================

if (blocked === "true") {

    conditions.push({
        blocked: true
    });

}

else if (blocked === "false") {

    conditions.push({
        $or: [
            {
                blocked: false
            },
            {
                blocked: {
                    $exists: false
                }
            }
        ]
    });

}

        // ==================================================
        // REGISTRATION DATE FILTER
        // ==================================================

        if (
            typeof registrationDate === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(
                registrationDate
            )
        ) {

            /*
             * The frontend sends:
             *
             * YYYY-MM-DD
             *
             * We compare the date in
             * Asia/Kolkata timezone so that
             * MongoDB UTC timestamps are
             * displayed correctly for Calcura.
             */

            conditions.push({

                $expr: {

                    $eq: [

                        {
                            $dateToString: {

                                format:
                                    "%Y-%m-%d",

                                date:
                                    "$createdAt",

                                timezone:
                                    "Asia/Kolkata"

                            }

                        },

                        registrationDate

                    ]

                }

            });

        }


        // ==================================================
        // FINAL QUERY
        // ==================================================

        const query =
            conditions.length
                ? {
                    $and:
                        conditions
                }
                : {};


        // ==================================================
        // GET MATCHING USERS
        // ==================================================

        const allMatchingUsers =
            await User.find(query)

                .select(
    "_id name email role plan subscriptionStatus blocked lastLoginAt lastLoginIp lastLoginDevice lastLoginBrowser createdAt updatedAt"
)
                .sort({
                    createdAt: -1
                })

                .lean();


        // ==================================================
        // GET LAST CALCULATION
        // ==================================================

        const allUserIds =
            allMatchingUsers.map(
                user => user._id
            );


        const calculations =
            allUserIds.length
                ? await Calculation.aggregate([

                    {
                        $match: {

                            user: {
                                $in:
                                    allUserIds
                            }

                        }

                    },

                    {
                        $sort: {

                            createdAt: -1

                        }

                    },

                    {
                        $group: {

                            _id:
                                "$user",

                            lastActive: {

                                $first:
                                    "$createdAt"

                            }

                        }

                    }

                ])
                : [];


        const calculationMap =
            new Map();


        calculations.forEach(
            item => {

                calculationMap.set(

                    String(
                        item._id
                    ),

                    item.lastActive

                );

            }
        );


        // ==================================================
        // FORMAT USERS
        // ==================================================

        let formattedUsers =
            allMatchingUsers.map(
                user =>
                    formatUser(
                        user,
                        calculationMap
                    )
            );


        // ==================================================
        // STATUS FILTER
        // ==================================================

        if (
            [
                "active",
                "inactive"
            ].includes(status)
        ) {

            formattedUsers =
                formattedUsers.filter(
                    user =>
                        user.status ===
                        status
                );

        }


        // ==================================================
        // TOTAL AFTER ALL FILTERS
        // ==================================================

        const totalUsers =
            formattedUsers.length;


        // ==================================================
        // PAGINATION
        // ==================================================

        const startIndex =
            (currentPage - 1) *
            perPage;


        const paginatedUsers =
            formattedUsers.slice(
                startIndex,
                startIndex + perPage
            );


        // ==================================================
        // STATISTICS
        // ==================================================

        const totalAllUsers =
            await User.countDocuments();


        const activeCalculationUsers =
            await Calculation.aggregate([

                {

                    $match: {

                        createdAt: {

                            $gte:
                                new Date(
                                    Date.now() -
                                    30 *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                                )

                        }

                    }

                },

                {

                    $group: {

                        _id:
                            "$user"

                    }

                }

            ]);


        const activeUsers =
            activeCalculationUsers.length;


        const premiumUsers =
            await User.countDocuments({

                plan: {

                    $in: [
                        "pro",
                        "student"
                    ]

                },

                subscriptionStatus:
                    "active"

            });


        const inactiveUsers =
            Math.max(
                totalAllUsers -
                activeUsers,
                0
            );


        // ==================================================
        // RESPONSE
        // ==================================================

        res.status(200).json({

            success: true,

            users:
                paginatedUsers,

            pagination: {

                page:
                    currentPage,

                limit:
                    perPage,

                total:
                    totalUsers,

                pages:
                    Math.ceil(
                        totalUsers /
                        perPage
                    )

            },

            stats: {

                totalUsers:
                    totalAllUsers,

                activeUsers,

                inactiveUsers,

                premiumUsers

            }

        });

    }

    catch (error) {

        console.error(
            "Admin Users Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load users",

            error:
                error.message

        });

    }

};


// ======================================================
// GET SINGLE USER
// ======================================================

const getAdminUser = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.params.id
            )

            .select(
                "-password"
            )

            .lean();


        if (!user) {

            return res.status(
                404
            ).json({

                success: false,

                message:
                    "User not found"

            });

        }


        const lastCalculation =
            await Calculation.findOne({

                user:
                    user._id

            })

            .sort({

                createdAt: -1

            })

            .select(
                "createdAt expression result type"
            )

            .lean();


        res.status(200).json({

            success: true,

            user: {

                ...user,

                role:
                    user.role ||
                    "user",

                plan:
                    user.plan ||
                    "free",

                subscriptionStatus:
                    user.subscriptionStatus ||
                    "inactive",

                lastActive:
                    lastCalculation
                        ?.createdAt ||
                    null,

                status:
                    isActiveUser(
                        lastCalculation
                            ?.createdAt
                    )
                        ? "active"
                        : "inactive"

            }

        });

    }

    catch (error) {

        console.error(
            "Get Admin User Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load user"

        });

    }

};


// ======================================================
// UPDATE USER
// ======================================================

const updateAdminUser = async (
    req,
    res
) => {

    try {

       const {
    name,
    email,
    role,
    plan,
    subscriptionStatus,
    blocked
} = req.body;


        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(
                404
            ).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // ==================================================
        // ROLE CHANGE
        // ==================================================

        if (
            role &&
            role !== user.role
        ) {

            if (
                role === "admin"
            ) {

                const existingAdmin =
                    await User.findOne({

                        role:
                            "admin",

                        _id: {

                            $ne:
                                user._id

                        }

                    });


                if (existingAdmin) {

                    return res.status(
                        409
                    ).json({

                        success: false,

                        message:
                            "Only one administrator is allowed."

                    });

                }

            }


            if (
                user.role === "admin" &&
                role === "user"
            ) {

                const adminCount =
                    await User.countDocuments({

                        role:
                            "admin"

                    });


                if (
                    adminCount <= 1
                ) {

                    return res.status(
                        400
                    ).json({

                        success: false,

                        message:
                            "The last administrator cannot be removed."

                    });

                }

            }

        }


        // ==================================================
        // NAME
        // ==================================================

        if (
            name !== undefined
        ) {

            if (
                !name ||
                !name.trim()
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Name is required"

                });

            }


            user.name =
                name.trim();

        }


        // ==================================================
        // EMAIL
        // ==================================================

        if (
            email !== undefined
        ) {

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingEmail =
                await User.findOne({

                    email:
                        normalizedEmail,

                    _id: {

                        $ne:
                            user._id

                    }

                });


            if (existingEmail) {

                return res.status(
                    409
                ).json({

                    success: false,

                    message:
                        "Email already exists"

                });

            }


            user.email =
                normalizedEmail;

        }


        // ==================================================
        // ROLE
        // ==================================================

        if (role) {

            user.role =
                role;

        }


        // ==================================================
        // PLAN
        // ==================================================

        if (plan) {

            user.plan =
                plan;

        }


        // ==================================================
        // SUBSCRIPTION
        // ==================================================

        if (
            subscriptionStatus
        ) {

            user.subscriptionStatus =
                subscriptionStatus;

        }

        if (blocked !== undefined) {
    user.blocked = Boolean(blocked);
}


        await user.save();


        res.status(200).json({

            success: true,

            message:
                "User updated successfully",

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role ||
                    "user",

                plan:
                    user.plan ||
                    "free",

                subscriptionStatus:
                    user.subscriptionStatus ||
                    "inactive"

            }

        });

    }

    catch (error) {

        console.error(
            "Update Admin User Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update user",

            error:
                error.message

        });

    }

};


// ======================================================
// DELETE USER
// ======================================================

const deleteAdminUser = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.params.id
            );


        if (!user) {

            return res.status(
                404
            ).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // NEVER DELETE LAST ADMIN

        if (
            user.role === "admin"
        ) {

            const adminCount =
                await User.countDocuments({

                    role:
                        "admin"

                });


            if (
                adminCount <= 1
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "The administrator account cannot be deleted."

                });

            }

        }


        // Delete calculations

        await Calculation.deleteMany({

            user:
                user._id

        });


        // Delete user

        await User.deleteOne({

            _id:
                user._id

        });


        res.status(200).json({

            success: true,

            message:
                "User deleted successfully"

        });

    }

    catch (error) {

        console.error(
            "Delete Admin User Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete user"

        });

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAdminUsers,

    getAdminUser,

    updateAdminUser,

    deleteAdminUser

};