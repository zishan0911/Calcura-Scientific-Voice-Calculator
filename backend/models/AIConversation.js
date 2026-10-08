const mongoose = require("mongoose");

const aiMessageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true,
        _id: true
    }
);


const aiConversationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            default: "New AI Chat",
            trim: true,
            maxlength: 150
        },

        messages: {
            type: [aiMessageSchema],
            default: []
        },

        isSaved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model(
    "AIConversation",
    aiConversationSchema
);