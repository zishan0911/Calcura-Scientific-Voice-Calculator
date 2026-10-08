const Plan = require("../models/Plan");

const getPublicPlan = async (req, res) => {
    try {

        const slug =
            String(req.params.slug || "")
                .trim()
                .toLowerCase();

        if (!slug) {
            return res.status(400).json({
                success: false,
                message: "Plan slug is required"
            });
        }

        const plan =
            await Plan.findOne({
                slug,
                status: "active"
            }).lean();

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found"
            });
        }

        return res.status(200).json({
            success: true,
            plan: {
                id: String(plan._id),
                name: plan.name,
                slug: plan.slug,
                price: Number(plan.price || 0),
                currency: plan.currency || "USD",
                duration: plan.duration || "Monthly",
                description: plan.description || "",
                features: Array.isArray(plan.features)
                    ? plan.features
                    : [],
                status: plan.status
            }
        });

    } catch (error) {

        console.error(
            "Public Plan Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load subscription plan"
        });
    }
};

module.exports = {
    getPublicPlan
};