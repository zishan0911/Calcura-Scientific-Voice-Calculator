const Formula = require("../models/Formula");

/* =========================================================
   GET PUBLIC FORMULAS
   Only ACTIVE formulas are visible on public website
========================================================= */

const getPublicFormulas = async (req, res) => {
    try {
        const {
            search = "",
            category = "all",
            level = "all",
            difficulty = "all"
        } = req.query;

        const query = {
            status: "active"
        };

        /* SEARCH */
        if (search.trim()) {
            const regex = new RegExp(
                search.trim().replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ),
                "i"
            );

            query.$or = [
                { name: regex },
                { expression: regex },
                { description: regex },
                { category: regex },
                { tags: regex }
            ];
        }

        /* CATEGORY */
        if (
            category &&
            category !== "all"
        ) {
            query.category = category;
        }

        /* LEVEL */
        if (
            level &&
            level !== "all"
        ) {
            query.level = level;
        }

        /* DIFFICULTY */
        if (
            difficulty &&
            difficulty !== "all"
        ) {
            query.difficulty = difficulty;
        }

        const formulas = await Formula.find(query)
            .sort({
                createdAt: -1
            })
            .lean();

        const formattedFormulas = formulas.map(
            formula => ({
                id: String(formula._id),

                _id: formula._id,

                name: formula.name,

                equation:
                    formula.expression,

                expression:
                    formula.expression,

                description:
                    formula.description || "",

                category:
                    formula.category,

                level:
                    formula.level,

                difficulty:
                    formula.difficulty,

                tags:
                    formula.tags || [],

                icon:
                    formula.icon ||
                    "fa-book",

                views:
                    Number(formula.views || 0),

                createdAt:
                    formula.createdAt,

                updatedAt:
                    formula.updatedAt
            })
        );

        return res.status(200).json({
            success: true,
            count: formattedFormulas.length,
            formulas: formattedFormulas
        });

    } catch (error) {
        console.error(
            "Public Formula Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load formulas"
        });
    }
};


/* =========================================================
   GET SINGLE PUBLIC FORMULA
========================================================= */

const getPublicFormula = async (
    req,
    res
) => {
    try {
        const formula =
            await Formula.findOne({
                _id: req.params.id,
                status: "active"
            }).lean();

        if (!formula) {
            return res.status(404).json({
                success: false,
                message:
                    "Formula not found"
            });
        }

        return res.status(200).json({
            success: true,
            formula: {
                id: String(formula._id),

                _id: formula._id,

                name: formula.name,

                equation:
                    formula.expression,

                expression:
                    formula.expression,

                description:
                    formula.description || "",

                category:
                    formula.category,

                level:
                    formula.level,

                difficulty:
                    formula.difficulty,

                tags:
                    formula.tags || [],

                icon:
                    formula.icon ||
                    "fa-book",

                views:
                    Number(formula.views || 0),

                createdAt:
                    formula.createdAt,

                updatedAt:
                    formula.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "Public Formula Detail Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load formula"
        });
    }
};


/* =========================================================
   INCREMENT PUBLIC FORMULA VIEWS
========================================================= */

const incrementPublicFormulaViews =
    async (req, res) => {

        try {
            const formula =
                await Formula.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        status: "active"
                    },
                    {
                        $inc: {
                            views: 1
                        }
                    },
                    {
                        new: true
                    }
                );

            if (!formula) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Formula not found"
                });
            }

            return res.status(200).json({
                success: true,
                views:
                    formula.views
            });

        } catch (error) {
            console.error(
                "Public Formula View Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update formula views"
            });
        }
    };


module.exports = {
    getPublicFormulas,
    getPublicFormula,
    incrementPublicFormulaViews
};