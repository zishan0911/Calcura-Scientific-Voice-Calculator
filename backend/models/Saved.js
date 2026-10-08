const mongoose = require("mongoose");

const savedSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        expression: {
            type: String,
            required: true,
            trim: true
        },

        result: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "calculator",
                "voice",
                "ai",
                "numerical",
                "graph",
                "converter"
            ],
            default: "calculator"
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model("Saved", savedSchema);