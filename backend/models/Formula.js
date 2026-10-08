const mongoose = require("mongoose");


// ======================================================
// CALCURA FORMULA SCHEMA
// ======================================================

const formulaSchema = new mongoose.Schema(
    {

        // ==================================================
        // FORMULA NAME
        // ==================================================

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },


        // ==================================================
        // FORMULA EXPRESSION
        // ==================================================

        expression: {
            type: String,
            required: true,
            trim: true
        },


        // ==================================================
        // DESCRIPTION
        // ==================================================

        description: {
            type: String,
            trim: true,
            default: ""
        },


        // ==================================================
        // CATEGORY
        // ==================================================

        category: {
            type: String,
            required: true,
            trim: true,
            index: true
        },


        // ==================================================
        // LEVEL
        // ==================================================

        level: {
            type: String,

            enum: [
                "School",
                "College"
            ],

            default: "College"
        },


        // ==================================================
        // DIFFICULTY
        // ==================================================

        difficulty: {
            type: String,

            enum: [
                "Easy",
                "Medium",
                "Hard"
            ],

            default: "Medium"
        },


        // ==================================================
        // TAGS
        // ==================================================

        tags: [
            {
                type: String,
                trim: true
            }
        ],


        // ==================================================
        // STATUS
        // ==================================================

        status: {
            type: String,

            enum: [
                "active",
                "hidden"
            ],

            default: "active",

            index: true
        },


        // ==================================================
        // VIEWS
        // ==================================================

        views: {
            type: Number,
            default: 0,
            min: 0
        },


        // ==================================================
        // ICON
        // ==================================================

        icon: {
            type: String,
            default: "fa-book"
        },


        // ==================================================
        // CREATED BY ADMIN
        // ==================================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // ==================================================
        // UPDATED BY ADMIN
        // ==================================================

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


// ======================================================
// SEARCH INDEX
// ======================================================

formulaSchema.index({
    name: "text",
    expression: "text",
    description: "text",
    category: "text",
    tags: "text"
});


// ======================================================
// EXPORT
// ======================================================

module.exports =
    mongoose.model(
        "Formula",
        formulaSchema
    );