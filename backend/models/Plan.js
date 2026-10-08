const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true
        },

        duration: {
            type: String,
            enum: [
                "Monthly",
                "Yearly"
            ],
            default: "Monthly"
        },

        description: {
            type: String,
            trim: true,
            default: ""
        },

        icon: {
            type: String,
            default: "fa-paper-plane"
        },

        iconClass: {
            type: String,
            default: "blue"
        },

        features: [
            {
                text: {
                    type: String,
                    required: true,
                    trim: true
                },

                included: {
                    type: Boolean,
                    default: true
                }
            }
        ],

        status: {
            type: String,
            enum: [
                "active",
                "inactive"
            ],
            default: "active",
            index: true
        },

        razorpayPlanId: {
            type: String,
            default: null,
            trim: true
        },

        sortOrder: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Plan",
    planSchema
);