const Calculation = require("../models/Calculation");

// ==========================================
// CREATE CALCULATION
// ==========================================

const createCalculation = async (req, res) => {
    try {
        const {
            expression,
            result,
            type
        } = req.body;

        if (!expression || result === undefined) {
            return res.status(400).json({
                success: false,
                message: "Expression and result are required"
            });
        }

        const calculation = await Calculation.create({
            user: req.user._id,
            expression: expression,
            result: String(result),
            type: type || "calculator"
        });

        res.status(201).json({
            success: true,
            message: "Calculation saved successfully",
            calculation: calculation
        });

    } catch (error) {
        console.error(
            "Create calculation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET USER CALCULATIONS
// ==========================================

const getCalculations = async (req, res) => {
    try {
        const calculations = await Calculation
            .find({
                user: req.user._id
            })
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            calculations: calculations
        });

    } catch (error) {
        console.error(
            "Get calculations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// DELETE ONE CALCULATION
// ==========================================

const deleteCalculation = async (req, res) => {
    try {
        const calculation =
            await Calculation.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

        if (!calculation) {
            return res.status(404).json({
                success: false,
                message: "Calculation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Calculation deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete calculation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// CLEAR ALL CALCULATIONS
// ==========================================

const clearCalculations = async (req, res) => {
    try {
        await Calculation.deleteMany({
            user: req.user._id
        });

        res.status(200).json({
            success: true,
            message: "Calculation history cleared"
        });

    } catch (error) {
        console.error(
            "Clear calculations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createCalculation,
    getCalculations,
    deleteCalculation,
    clearCalculations
};