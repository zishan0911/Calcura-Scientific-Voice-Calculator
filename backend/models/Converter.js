const mongoose = require("mongoose");

const converterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        category: {
            type: String,
            enum: [
                "length",
                "weight",
                "temperature",
                "time",
                "area",
                "volume",
                "speed",
                "energy",
                "data",
                "marks"
            ],
            required: true
        },

        inputValue: {
            type: String,
            required: true
        },

        fromUnit: {
            type: String,
            required: true
        },

        outputValue: {
            type: String,
            required: true
        },

        toUnit: {
            type: String,
            required: true
        },

        result: {
            type: String,
            required: true
        },

        formula: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Converter",
    converterSchema
);