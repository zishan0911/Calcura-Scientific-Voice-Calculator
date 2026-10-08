const Converter = require("../models/Converter");

// ==========================================
// CREATE CONVERSION
// ==========================================
const createConversion = async (req, res) => {
    try {
        const {
            category,
            inputValue,
            fromUnit,
            outputValue,
            toUnit,
            result,
            formula
        } = req.body;

        if (
            !category ||
            inputValue === undefined ||
            !fromUnit ||
            outputValue === undefined ||
            !toUnit ||
            !result
        ) {
            return res.status(400).json({
                message: "Required conversion data is missing."
            });
        }

        const conversion = await Converter.create({
            user: req.user._id,
            category,
            inputValue: String(inputValue),
            fromUnit,
            outputValue: String(outputValue),
            toUnit,
            result,
            formula: formula || ""
        });

        res.status(201).json({
            message: "Conversion saved successfully.",
            conversion
        });

    } catch (error) {

        console.error(
            "Create conversion error:",
            error
        );

        res.status(500).json({
            message: "Failed to save conversion.",
            error: error.message
        });
    }
};


// ==========================================
// GET USER CONVERSIONS
// ==========================================
const getConversions = async (req, res) => {
    try {

        const conversions =
            await Converter.find({
                user: req.user._id
            })
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            conversions
        });

    } catch (error) {

        console.error(
            "Get conversions error:",
            error
        );

        res.status(500).json({
            message: "Failed to load conversions.",
            error: error.message
        });
    }
};


// ==========================================
// GET SINGLE CONVERSION
// ==========================================
const getConversionById = async (req, res) => {
    try {

        const conversion =
            await Converter.findOne({
                _id: req.params.id,
                user: req.user._id
            });

        if (!conversion) {
            return res.status(404).json({
                message: "Conversion not found."
            });
        }

        res.status(200).json({
            conversion
        });

    } catch (error) {

        console.error(
            "Get conversion error:",
            error
        );

        res.status(500).json({
            message: "Failed to load conversion.",
            error: error.message
        });
    }
};


// ==========================================
// DELETE SINGLE CONVERSION
// ==========================================
const deleteConversion = async (req, res) => {
    try {

        const conversion =
            await Converter.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

        if (!conversion) {
            return res.status(404).json({
                message: "Conversion not found."
            });
        }

        res.status(200).json({
            message: "Conversion deleted successfully."
        });

    } catch (error) {

        console.error(
            "Delete conversion error:",
            error
        );

        res.status(500).json({
            message: "Failed to delete conversion.",
            error: error.message
        });
    }
};


module.exports = {
    createConversion,
    getConversions,
    getConversionById,
    deleteConversion
};