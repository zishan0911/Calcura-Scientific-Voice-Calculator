const mongoose = require("mongoose");

const paymentTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        paymentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        subscriptionId: {
            type: String,
            default: null,
            index: true
        },

        plan: {
            type: String,
            enum: ["free", "student", "pro"],
            required: true
        },

        planName: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true
        },

        status: {
            type: String,
            enum: [
                "created",
                "captured",
                "failed",
                "refunded"
            ],
            default: "captured",
            index: true
        },

        paidAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

paymentTransactionSchema.index({
    paidAt: -1
});

paymentTransactionSchema.index({
    plan: 1,
    paidAt: -1
});

module.exports =
    mongoose.model(
        "PaymentTransaction",
        paymentTransactionSchema
    );