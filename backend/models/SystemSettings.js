const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
    {
        websiteName: {
            type: String,
            default: "Calcura"
        },

        websiteURL: {
            type: String,
            default: "http://localhost:5500"
        },

        contactEmail: {
            type: String,
            default: "admin@calcura.com"
        },

        supportEmail: {
            type: String,
            default: "support@calcura.com"
        },

        timezone: {
            type: String,
            default: "(GMT+05:30) India Standard Time"
        },

        defaultLanguage: {
            type: String,
            default: "English"
        },


        twoFactor: {
            type: Boolean,
            default: true
        },

        loginLimit: {
            type: String,
            default: "30 minutes"
        },

        loginLimitEnabled: {
            type: Boolean,
            default: true
        },

        sessionTimeout: {
            type: String,
            default: "90 days"
        },

        ipWhitelist: {
            type: Boolean,
            default: false
        },

        activityLogging: {
            type: Boolean,
            default: true
        },


        smtpHost: {
            type: String,
            default: "smtp.gmail.com"
        },

        smtpPort: {
            type: String,
            default: "587"
        },

        smtpUsername: {
            type: String,
            default: "your-email@gmail.com"
        },

        smtpPassword: {
            type: String,
            default: ""
        },

        fromEmail: {
            type: String,
            default: "noreply@calcura.com"
        },

        fromName: {
            type: String,
            default: "Calcura"
        },

        registrationEmails: {
            type: Boolean,
            default: true
        },

        subscriptionEmails: {
            type: Boolean,
            default: true
        },

        systemAlerts: {
            type: Boolean,
            default: true
        },


        paymentGateway: {
            type: String,
            default: "Razorpay"
        },

        razorpayKey: {
            type: String,
            default: ""
        },

        currency: {
            type: String,
            default: "INR (₹)"
        },

        planDuration: {
            type: String,
            default: "Monthly"
        },

        enableSubscriptions: {
            type: Boolean,
            default: true
        },

        enableFreePlan: {
            type: Boolean,
            default: true
        },

        autoRenew: {
            type: Boolean,
            default: false
        },


        strongPasswords: {
            type: Boolean,
            default: true
        },

        security2FA: {
            type: Boolean,
            default: true
        },

        sessionProtection: {
            type: Boolean,
            default: true
        },

        securityAlerts: {
            type: Boolean,
            default: true
        },


        emailRegistrationTab: {
            type: Boolean,
            default: true
        },

        emailSubscriptionTab: {
            type: Boolean,
            default: true
        },

        emailSystemTab: {
            type: Boolean,
            default: true
        },


        adminTheme: {
            type: String,
            default: "Dark Neon Navy"
        },

        accentColor: {
            type: String,
            default: "Blue / Purple"
        },


        googleIntegration: {
            type: Boolean,
            default: false
        },

        emailIntegration: {
            type: Boolean,
            default: true
        },

        paymentIntegration: {
            type: Boolean,
            default: true
        },


        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }

    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "SystemSettings",
        systemSettingsSchema
    );