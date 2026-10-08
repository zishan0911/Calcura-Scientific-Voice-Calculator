const mongoose = require("mongoose");

const graphSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            trim: true,
            maxlength: 150,
            default: "Untitled Graph"
        },

        mode: {
            type: String,
            enum: ["function", "parametric", "polar", "3d"],
            default: "function"
        },

        functionExpression: {
            type: String,
            default: ""
        },

        parametricX: {
            type: String,
            default: ""
        },

        parametricY: {
            type: String,
            default: ""
        },

        polarExpression: {
            type: String,
            default: ""
        },

        graph3DExpression: {
            type: String,
            default: ""
        },

        range: {
            xMin: {
                type: Number,
                default: -10
            },

            xMax: {
                type: Number,
                default: 10
            },

            yMin: {
                type: Number,
                default: -10
            },

            yMax: {
                type: Number,
                default: 10
            }
        },

        settings: {
            showGrid: {
                type: Boolean,
                default: true
            },

            showAxes: {
                type: Boolean,
                default: true
            },

            multipleFunctions: {
                type: Boolean,
                default: false
            },

            showLegend: {
                type: Boolean,
                default: true
            },

            showPoints: {
                type: Boolean,
                default: false
            },

            lineColor: {
                type: String,
                default: "#1688ff"
            },

            lineWidth: {
                type: Number,
                default: 3
            },

            lineStyle: {
                type: String,
                default: "solid"
            }
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Graph", graphSchema);