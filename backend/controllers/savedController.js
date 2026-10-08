const Saved = require("../models/Saved");

// CREATE SAVED CALCULATION
const createSaved = async (req, res) => {
    try {
        const { expression, result, type } = req.body;

        if (!expression || result === undefined) {
            return res.status(400).json({
                success: false,
                message: "Expression and result are required"
            });
        }

        const saved = await Saved.create({
            user: req.user._id,
            expression: expression,
            result: String(result),
            type: type || "calculator"
        });

        res.status(201).json({
            success: true,
            message: "Calculation saved successfully",
            saved: saved
        });

    } catch (error) {
        console.error(
            "Create saved calculation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// GET SAVED CALCULATIONS
const getSaved = async (req, res) => {
    try {
        const saved = await Saved
            .find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            saved: saved
        });

    } catch (error) {
        console.error(
            "Get saved calculations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// DELETE ONE SAVED CALCULATION
const deleteSaved = async (req, res) => {
    try {
        const saved =
            await Saved.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

        if (!saved) {
            return res.status(404).json({
                success: false,
                message: "Saved calculation not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Saved calculation deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete saved calculation error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// CLEAR ALL SAVED CALCULATIONS
const clearSaved = async (req, res) => {
    try {
        await Saved.deleteMany({
            user: req.user._id
        });

        res.status(200).json({
            success: true,
            message: "Saved calculations cleared"
        });

    } catch (error) {
        console.error(
            "Clear saved calculations error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createSaved,
    getSaved,
    deleteSaved,
    clearSaved
};