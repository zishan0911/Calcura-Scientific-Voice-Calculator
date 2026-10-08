const mongoose = require("mongoose");

const websiteContentSchema = new mongoose.Schema(
    {
        pageTitle: {
            type: String,
            required: true,
            trim: true
        },

        section: {
            type: String,
            required: true,
            enum: [
                "Home",
                "About",
                "Help",
                "Upgrade",
                "Payment",
                "Success"
            ]
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        content: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },

        status: {
            type: String,
            enum: [
                "Published",
                "Draft"
            ],
            default: "Published"
        },

        views: {
            type: Number,
            default: 0,
            min: 0
        },

        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "WebsiteContent",
    websiteContentSchema
);