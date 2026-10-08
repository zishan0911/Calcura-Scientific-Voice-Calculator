const mongoose = require("mongoose");

const Formula = require("../models/Formula");


// ======================================================
// HELPERS
// ======================================================

function escapeRegex(value = "") {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// ======================================================
// GET ADMIN FORMULAS
// ======================================================

const getAdminFormulas = async (req, res) => {

    try {

        const {
            page = 1,
            limit = 10,
            search = "",
            category = "all",
            level = "all",
            difficulty = "all",
            status = "all",
            sort = "newest"
        } = req.query;


        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const perPage = Math.min(
            Math.max(
                Number(limit) || 10,
                1
            ),
            100
        );


        // ==================================================
        // QUERY
        // ==================================================

        const query = {};


        // SEARCH

        if (search.trim()) {

            const regex = new RegExp(
                escapeRegex(search.trim()),
                "i"
            );

            query.$or = [

                {
                    name: regex
                },

                {
                    expression: regex
                },

                {
                    description: regex
                },

                {
                    category: regex
                },

                {
                    tags: regex
                }

            ];

        }


        // CATEGORY

        if (
            category &&
            category !== "all"
        ) {

            query.category = category;

        }


        // LEVEL

        if (
            level &&
            level !== "all"
        ) {

            query.level = level;

        }


        // DIFFICULTY

        if (
            difficulty &&
            difficulty !== "all"
        ) {

            query.difficulty =
                difficulty;

        }


        // STATUS

        if (
            status &&
            status !== "all"
        ) {

            query.status = status;

        }


        // ==================================================
        // SORT
        // ==================================================

        let sortQuery = {
            createdAt: -1
        };


        if (sort === "oldest") {

            sortQuery = {
                createdAt: 1
            };

        }


        if (sort === "mostViewed") {

            sortQuery = {
                views: -1,
                createdAt: -1
            };

        }


        if (sort === "name") {

            sortQuery = {
                name: 1
            };

        }


        // ==================================================
        // TOTAL
        // ==================================================

        const totalFormulas =
            await Formula.countDocuments(
                query
            );


        // ==================================================
        // FORMULAS
        // ==================================================

        const formulas =
            await Formula.find(query)

                .sort(sortQuery)

                .skip(
                    (currentPage - 1) *
                    perPage
                )

                .limit(perPage)

                .lean();


        // ==================================================
        // FORMAT FORMULAS
        // ==================================================

        const formattedFormulas =
            formulas.map(
                (formula) => {

                    return {

                        _id:
                            formula._id,

                        name:
                            formula.name,

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

                        status:
                            formula.status,

                        views:
                            formula.views || 0,

                        icon:
                            formula.icon ||
                            "fa-book",

                        createdAt:
                            formula.createdAt,

                        updatedAt:
                            formula.updatedAt

                    };

                }
            );


        // ==================================================
        // ALL FORMULAS FOR STATS
        // ==================================================

        const allFormulas =
            await Formula.find({})
                .select(
                    "category status views createdAt"
                )
                .lean();


        // ==================================================
        // STATISTICS
        // ==================================================

        const totalCount =
            allFormulas.length;


        const activeCount =
            allFormulas.filter(
                formula =>
                    formula.status === "active"
            ).length;


        const hiddenCount =
            allFormulas.filter(
                formula =>
                    formula.status === "hidden"
            ).length;


        const categorySet =
            new Set();


        allFormulas.forEach(
            formula => {

                if (
                    formula.category &&
                    formula.category.trim()
                ) {

                    categorySet.add(
                        formula.category.trim()
                    );

                }

            }
        );


        const categoryCount =
            categorySet.size;


        const totalViews =
            allFormulas.reduce(
                (total, formula) =>
                    total +
                    Number(
                        formula.views || 0
                    ),
                0
            );


        // ==================================================
        // MOST VIEWED
        // ==================================================

      let mostViewed = null;

if (allFormulas.length > 0) {

    const mostViewedFormula =
        await Formula.findOne({
            views: {
                $gt: 0
            }
        })
            .sort({
                views: -1,
                createdAt: -1
            })
            .select(
                "name category views"
            )
            .lean();

    if (mostViewedFormula) {

        mostViewed = {

            name:
                mostViewedFormula.name,

            category:
                mostViewedFormula.category,

            views:
                Number(
                    mostViewedFormula.views || 0
                )

        };

    }

}


        // ==================================================
        // CATEGORY STATISTICS
        // ==================================================

        const categoryStats = {};


        allFormulas.forEach(
            formula => {

                const currentCategory =
                    formula.category ||
                    "Other";


                if (
                    !categoryStats[
                        currentCategory
                    ]
                ) {

                    categoryStats[
                        currentCategory
                    ] = 0;

                }


                categoryStats[
                    currentCategory
                ]++;

            }
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            success: true,

            formulas:
                formattedFormulas,

            categories:
                Array.from(
                    categorySet
                ).sort(),

            categoryStats,

            stats: {

                totalFormulas:
                    totalCount,

                categories:
                    categoryCount,

                activeFormulas:
                    activeCount,

                hiddenFormulas:
                    hiddenCount,

                totalViews,

                mostViewed

            },

            pagination: {

                page:
                    currentPage,

                limit:
                    perPage,

                total:
                    totalFormulas,

                pages:
                    Math.ceil(
                        totalFormulas /
                        perPage
                    )

            }

        });

    }

    catch (error) {

        console.error(
            "Admin Formula Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load formulas",

            error:
                error.message

        });

    }

};



// ======================================================
// GET SINGLE FORMULA
// ======================================================

const getAdminFormula = async (req, res) => {

    try {

        const formula =
            await Formula.findById(
                req.params.id
            ).lean();


        if (!formula) {

            return res.status(404).json({

                success: false,

                message:
                    "Formula not found"

            });

        }


        return res.status(200).json({

            success: true,

            formula

        });

    }

    catch (error) {

        console.error(
            "Get Formula Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to load formula",

            error:
                error.message

        });

    }

};



// ======================================================
// ADD NEW FORMULA
// ======================================================

const createAdminFormula = async (req, res) => {

    try {

        const {
            name,
            expression,
            description,
            category,
            level,
            difficulty,
            tags,
            status,
            icon
        } = req.body;


        // ==================================================
        // REQUIRED FIELDS
        // ==================================================

        if (
            !name ||
            !name.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Formula name is required"

            });

        }


        if (
            !expression ||
            !expression.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Formula expression is required"

            });

        }


        if (
            !category ||
            !category.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Formula category is required"

            });

        }


        // ==================================================
        // TAGS
        // ==================================================

        let cleanTags = [];


        if (Array.isArray(tags)) {

            cleanTags =
                tags
                    .map(
                        tag =>
                            String(tag)
                                .trim()
                    )
                    .filter(Boolean);

        }

        else if (
            typeof tags === "string"
        ) {

            cleanTags =
                tags
                    .split(",")
                    .map(
                        tag =>
                            tag.trim()
                    )
                    .filter(Boolean);

        }


        // ==================================================
        // CREATE
        // ==================================================

        const formula =
            new Formula({

                name:
                    name.trim(),

                expression:
                    expression.trim(),

                description:
                    description
                        ? description.trim()
                        : "",

                category:
                    category.trim(),

                level:
                    level || "College",

                difficulty:
                    difficulty || "Medium",

                tags:
                    cleanTags,

                status:
                    status || "active",

                icon:
                    icon || "fa-book",

                createdBy:
                    req.user?.id ||
                    req.user?._id ||
                    null

            });


        await formula.save();


        return res.status(201).json({

            success: true,

            message:
                "Formula added successfully",

            formula

        });

    }

    catch (error) {

        console.error(
            "Create Formula Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to add formula",

            error:
                error.message

        });

    }

};



// ======================================================
// UPDATE FORMULA
// ======================================================

const updateAdminFormula = async (req, res) => {

    try {

        const formula =
            await Formula.findById(
                req.params.id
            );


        if (!formula) {

            return res.status(404).json({

                success: false,

                message:
                    "Formula not found"

            });

        }


        const {
            name,
            expression,
            description,
            category,
            level,
            difficulty,
            tags,
            status,
            icon
        } = req.body;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            name !== undefined
        ) {

            if (
                !name ||
                !name.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Formula name is required"

                });

            }

            formula.name =
                name.trim();

        }


        if (
            expression !== undefined
        ) {

            if (
                !expression ||
                !expression.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Formula expression is required"

                });

            }

            formula.expression =
                expression.trim();

        }


        if (
            description !== undefined
        ) {

            formula.description =
                String(
                    description
                ).trim();

        }


        if (
            category !== undefined
        ) {

            if (
                !category ||
                !category.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Formula category is required"

                });

            }

            formula.category =
                category.trim();

        }


        if (
            level !== undefined
        ) {

            formula.level =
                level;

        }


        if (
            difficulty !== undefined
        ) {

            formula.difficulty =
                difficulty;

        }


        if (
            status !== undefined
        ) {

            formula.status =
                status;

        }


        if (
            icon !== undefined
        ) {

            formula.icon =
                icon || "fa-book";

        }


        // ==================================================
        // TAGS
        // ==================================================

        if (
            tags !== undefined
        ) {

            if (
                Array.isArray(tags)
            ) {

                formula.tags =
                    tags
                        .map(
                            tag =>
                                String(tag)
                                    .trim()
                        )
                        .filter(Boolean);

            }

            else if (
                typeof tags === "string"
            ) {

                formula.tags =
                    tags
                        .split(",")
                        .map(
                            tag =>
                                tag.trim()
                        )
                        .filter(Boolean);

            }

        }


        // ==================================================
        // UPDATED BY
        // ==================================================

        formula.updatedBy =
            req.user?.id ||
            req.user?._id ||
            null;


        await formula.save();


        return res.status(200).json({

            success: true,

            message:
                "Formula updated successfully",

            formula

        });

    }

    catch (error) {

        console.error(
            "Update Formula Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update formula",

            error:
                error.message

        });

    }

};



// ======================================================
// DELETE FORMULA
// ======================================================

const deleteAdminFormula = async (req, res) => {

    try {

        const formula =
            await Formula.findById(
                req.params.id
            );


        if (!formula) {

            return res.status(404).json({

                success: false,

                message:
                    "Formula not found"

            });

        }


        await Formula.deleteOne({

            _id:
                formula._id

        });


        return res.status(200).json({

            success: true,

            message:
                "Formula deleted successfully"

        });

    }

    catch (error) {

        console.error(
            "Delete Formula Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete formula",

            error:
                error.message

        });

    }

};



// ======================================================
// INCREMENT FORMULA VIEWS
// ======================================================

const incrementFormulaViews = async (req, res) => {

    try {

        const formula =
            await Formula.findByIdAndUpdate(

                req.params.id,

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

    }

    catch (error) {

        console.error(
            "Formula View Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update formula views",

            error:
                error.message

        });

    }

};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    getAdminFormulas,

    getAdminFormula,

    createAdminFormula,

    updateAdminFormula,

    deleteAdminFormula,

    incrementFormulaViews

};