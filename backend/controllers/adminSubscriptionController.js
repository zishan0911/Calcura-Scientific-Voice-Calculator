const Plan = require("../models/Plan");
const User = require("../models/User");


// =====================================================
// GET ALL SUBSCRIPTION PLANS
// =====================================================

const getAdminSubscriptions = async (req, res) => {

    try {

        const {
            search = "",
            status = "all"
        } = req.query;


        // =================================================
        // PLAN QUERY
        // =================================================

        const query = {};


        if (search.trim()) {

            const regex = new RegExp(
                search.trim().replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );


            query.$or = [

                {
                    name: regex
                },

                {
                    description: regex
                },

                {
                    slug: regex
                }

            ];

        }


        if (
            status !== "all" &&
            ["active", "inactive"].includes(status)
        ) {

            query.status = status;

        }


        // =================================================
        // GET PLANS
        // =================================================

        const plans = await Plan.find(query)
            .sort({
                sortOrder: 1,
                createdAt: 1
            })
            .lean();


        // =================================================
        // SUBSCRIBER COUNTS
        // =================================================

        const formattedPlans = await Promise.all(

            plans.map(async plan => {

                const subscriberCount =
                    await User.countDocuments({

                        plan: plan.slug,

                        subscriptionStatus:
                            "active"

                    });


                return {

                    ...plan,

                    id: String(plan._id),

                    subscriberCount

                };

            })

        );


        // =================================================
        // STATISTICS
        // =================================================

        const totalPlans =
            await Plan.countDocuments();


        const activePlans =
            await Plan.countDocuments({
                status: "active"
            });


        const totalSubscribers =
            await User.countDocuments({

                plan: {
                    $ne: "free"
                },

                subscriptionStatus:
                    "active"

            });


        // =================================================
        // MONTHLY REVENUE
        // =================================================

        let monthlyRevenue = 0;


        const activePlansList =
            await Plan.find({
                status: "active"
            }).lean();


        for (const plan of activePlansList) {

            const subscribers =
                await User.countDocuments({

                    plan: plan.slug,

                    subscriptionStatus:
                        "active"

                });


            monthlyRevenue +=
                subscribers *
                Number(plan.price || 0);

        }


        return res.status(200).json({

            success: true,

            stats: {

                totalPlans,

                activePlans,

                totalSubscribers,

                monthlyRevenue

            },

            plans:
                formattedPlans

        });

    }

    catch (error) {

        console.error(
            "Admin Subscription Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load subscription plans"

        });

    }

};



// =====================================================
// GET SINGLE PLAN
// =====================================================

const getAdminSubscription = async (
    req,
    res
) => {

    try {

        const plan =
            await Plan.findById(
                req.params.id
            ).lean();


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found"

            });

        }


        const subscriberCount =
            await User.countDocuments({

                plan: plan.slug,

                subscriptionStatus:
                    "active"

            });


        return res.status(200).json({

            success: true,

            plan: {

                ...plan,

                id:
                    String(plan._id),

                subscriberCount

            }

        });

    }

    catch (error) {

        console.error(
            "Get Subscription Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load subscription plan"

        });

    }

};



// =====================================================
// CREATE PLAN
// =====================================================

const createAdminSubscription = async (
    req,
    res
) => {

    try {

        const {

            name,

            slug,

            price,

            currency,

            duration,

            description,

            icon,

            iconClass,

            features,

            status,

            razorpayPlanId,

            sortOrder

        } = req.body;


        if (
            !name ||
            !slug ||
            price === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, slug and price are required"

            });

        }


        const normalizedSlug =
            String(slug)
                .trim()
                .toLowerCase();


        const existingPlan =
            await Plan.findOne({
                slug: normalizedSlug
            });


        if (existingPlan) {

            return res.status(409).json({

                success: false,

                message:
                    "A plan with this slug already exists"

            });

        }


        const plan =
            await Plan.create({

                name:
                    String(name).trim(),

                slug:
                    normalizedSlug,

                price:
                    Number(price),

                currency:
                    currency || "INR",

                duration:
                    duration || "Monthly",

                description:
                    description || "",

                icon:
                    icon || "fa-paper-plane",

                iconClass:
                    iconClass || "blue",

                features:
                    Array.isArray(features)
                        ? features
                        : [],

                status:
                    status || "active",

                razorpayPlanId:
                    razorpayPlanId || null,

                sortOrder:
                    Number(sortOrder || 0)

            });


        return res.status(201).json({

            success: true,

            message:
                "Subscription plan created successfully",

            plan

        });

    }

    catch (error) {

        console.error(
            "Create Subscription Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create subscription plan"

        });

    }

};



// =====================================================
// UPDATE PLAN
// =====================================================

const updateAdminSubscription = async (
    req,
    res
) => {

    try {

        const plan =
            await Plan.findById(
                req.params.id
            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found"

            });

        }


        const {

            name,

            slug,

            price,

            currency,

            duration,

            description,

            icon,

            iconClass,

            features,

            status,

            razorpayPlanId,

            sortOrder

        } = req.body;


        if (name !== undefined) {

            plan.name =
                String(name).trim();

        }


        if (slug !== undefined) {

            const normalizedSlug =
                String(slug)
                    .trim()
                    .toLowerCase();


            const duplicate =
                await Plan.findOne({

                    slug: normalizedSlug,

                    _id: {
                        $ne: plan._id
                    }

                });


            if (duplicate) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Another plan already uses this slug"

                });

            }


            plan.slug =
                normalizedSlug;

        }


        if (price !== undefined) {

            plan.price =
                Number(price);

        }


        if (currency !== undefined) {

            plan.currency =
                currency;

        }


        if (duration !== undefined) {

            plan.duration =
                duration;

        }


        if (description !== undefined) {

            plan.description =
                description;

        }


        if (icon !== undefined) {

            plan.icon =
                icon;

        }


        if (iconClass !== undefined) {

            plan.iconClass =
                iconClass;

        }


        if (Array.isArray(features)) {

            plan.features =
                features;

        }


        if (status !== undefined) {

            plan.status =
                status;

        }


        if (razorpayPlanId !== undefined) {

            plan.razorpayPlanId =
                razorpayPlanId || null;

        }


        if (sortOrder !== undefined) {

            plan.sortOrder =
                Number(sortOrder);

        }


        await plan.save();


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan updated successfully",

            plan

        });

    }

    catch (error) {

        console.error(
            "Update Subscription Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update subscription plan"

        });

    }

};



// =====================================================
// DELETE PLAN
// =====================================================

const deleteAdminSubscription = async (
    req,
    res
) => {

    try {

        const plan =
            await Plan.findById(
                req.params.id
            );


        if (!plan) {

            return res.status(404).json({

                success: false,

                message:
                    "Subscription plan not found"

            });

        }


        // Do not delete a plan that
        // currently has active subscribers.

        const activeSubscribers =
            await User.countDocuments({

                plan: plan.slug,

                subscriptionStatus:
                    "active"

            });


        if (activeSubscribers > 0) {

            return res.status(400).json({

                success: false,

                message:
                    `This plan has ${activeSubscribers} active subscriber(s). Deactivate the plan instead of deleting it.`

            });

        }


        await Plan.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message:
                "Subscription plan deleted successfully"

        });

    }

    catch (error) {

        console.error(
            "Delete Subscription Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete subscription plan"

        });

    }

};



module.exports = {

    getAdminSubscriptions,

    getAdminSubscription,

    createAdminSubscription,

    updateAdminSubscription,

    deleteAdminSubscription

};