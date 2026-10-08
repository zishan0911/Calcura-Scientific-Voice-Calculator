const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },

        // =================================================
        // CALCURA SUBSCRIPTION
        // =================================================

        plan: {
            type: String,
            enum: ["free", "pro", "student"],
            default: "free"
        },

        subscriptionId: {
            type: String,
            default: null
        },

        paymentId: {
            type: String,
            default: null
        },

        subscriptionStatus: {
            type: String,
            enum: [
                "inactive",
                "active",
                "cancelled",
                "expired"
            ],
            default: "inactive"
        },

                // =================================================
        // CALCURA ACCOUNT / LOGIN TRACKING
        // =================================================

        blocked: {
            type: Boolean,
            default: false
        },

        lastLoginAt: {
            type: Date,
            default: null
        },

        lastLoginIp: {
            type: String,
            default: null
        },

        lastLoginDevice: {
            type: String,
            default: null
        },

        lastLoginBrowser: {
            type: String,
            default: null
        },
        
        // =================================================
        // CALCURA USER SETTINGS
        // =================================================

        settings: {
            theme: {
                type: String,
                default: "dark"
            },

            language: {
                type: String,
                default: "en-US"
            },

            angleMode: {
                type: String,
                enum: ["DEG", "RAD", "GRAD"],
                default: "DEG"
            },

            numberFormat: {
                type: String,
                default: "standard"
            },

            soundEffects: {
                type: Boolean,
                default: true
            },

            autoSave: {
                type: Boolean,
                default: true
            },

            voiceEnabled: {
                type: Boolean,
                default: true
            },

            decimalPrecision: {
                type: Number,
                default: 8
            },

            calculationNotifications: {
                type: Boolean,
                default: true
            },

            updateNotifications: {
                type: Boolean,
                default: true
            },

            welcomeTips: {
                type: Boolean,
                default: true
            },

            offlineMode: {
                type: Boolean,
                default: true
            },

            usageAnalytics: {
                type: Boolean,
                default: false
            },

            emailUpdates: {
                type: Boolean,
                default: true
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "User",
    userSchema
);

userSchema.index(
    { role: 1 },
    {
        unique: true,
        partialFilterExpression: {
            role: "admin"
        }
    }
);