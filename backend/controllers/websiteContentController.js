const WebsiteContent = require("../models/WebsiteContent");

// =========================================================
// HELPERS
// =========================================================

const allowedPages = [
    {
        pageTitle: "Home Page",
        section: "Home",
        slug: "home"
    },
    {
        pageTitle: "About Us",
        section: "About",
        slug: "about"
    },
    {
        pageTitle: "Help & Support",
        section: "Help",
        slug: "help"
    },
    {
        pageTitle: "Upgrade Page",
        section: "Upgrade",
        slug: "upgrade"
    },
    {
        pageTitle: "Payment Page",
        section: "Payment",
        slug: "payment"
    },
    {
        pageTitle: "Success Page",
        section: "Success",
        slug: "success"
    }
];


// =========================================================
// GET ALL WEBSITE CONTENT
// =========================================================

const getWebsiteContent = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            search = "",
            section = "All",
            status = "All"
        } = req.query;

        const pageNumber =
            Math.max(
                parseInt(page) || 1,
                1
            );

        const limitNumber =
            Math.max(
                parseInt(limit) || 10,
                1
            );

        const skip =
            (pageNumber - 1) *
            limitNumber;


        // =====================================================
        // FILTER QUERY - ONLY FOR TABLE
        // =====================================================

        const query = {};

        if (search.trim()) {

            query.$or = [

                {
                    pageTitle: {
                        $regex:
                            search.trim(),
                        $options: "i"
                    }
                },

                {
                    slug: {
                        $regex:
                            search.trim(),
                        $options: "i"
                    }
                },

                {
                    section: {
                        $regex:
                            search.trim(),
                        $options: "i"
                    }
                }

            ];

        }


        if (
            section &&
            section !== "All"
        ) {

            query.section =
                section;

        }


        if (
            status &&
            status !== "All"
        ) {

            query.status =
                status;

        }


        // =====================================================
        // TABLE DATA
        // =====================================================

        const total =
            await WebsiteContent.countDocuments(
                query
            );


        const contents =
            await WebsiteContent.find(
                query
            )
                .populate(
                    "lastUpdatedBy",
                    "name email"
                )
                .sort({
                    updatedAt: -1
                })
                .skip(skip)
                .limit(limitNumber)
                .lean();


        // =====================================================
        // GLOBAL STATS
        // IMPORTANT:
        // These DO NOT use the filter query
        // =====================================================

        const totalPages =
            await WebsiteContent.countDocuments();


        const publishedPages =
            await WebsiteContent.countDocuments({
                status: "Published"
            });


        const viewsResult =
            await WebsiteContent.aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: {
                            $sum: "$views"
                        }
                    }
                }
            ]);


        const totalViews =
            viewsResult.length > 0
                ? viewsResult[0].totalViews
                : 0;


        const latestUpdated =
            await WebsiteContent.findOne()
                .populate(
                    "lastUpdatedBy",
                    "name email"
                )
                .sort({
                    updatedAt: -1
                })
                .lean();


        // =====================================================
        // RESPONSE
        // =====================================================

        res.status(200).json({

            success: true,

            data: contents,

            pagination: {

                currentPage:
                    pageNumber,

                totalPages:
                    Math.ceil(
                        total /
                        limitNumber
                    ),

                totalItems:
                    total,

                limit:
                    limitNumber

            },

            stats: {

                totalPages,

                publishedPages,

                totalViews,

                lastUpdated:
                    latestUpdated
                        ? latestUpdated.updatedAt
                        : null,

                lastUpdatedBy:
                    latestUpdated
                        ? latestUpdated.lastUpdatedBy
                        : null

            }

        });


    } catch (error) {

        console.error(
            "GET WEBSITE CONTENT ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load website content.",

            error:
                error.message

        });

    }
};


// =========================================================
// GET WEBSITE CONTENT BY ID
// =========================================================

const getWebsiteContentById = async (
    req,
    res
) => {
    try {
        const content =
            await WebsiteContent.findById(
                req.params.id
            ).populate(
                "lastUpdatedBy",
                "name email"
            );

        if (!content) {
            return res.status(404).json({
                success: false,
                message:
                    "Website content not found."
            });
        }

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {
        console.error(
            "GET WEBSITE CONTENT BY ID ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to load website content.",
            error: error.message
        });
    }
};


// =========================================================
// CREATE WEBSITE CONTENT
// =========================================================

const createWebsiteContent = async (
    req,
    res
) => {
    try {
        const {
            pageTitle,
            section,
            slug,
            content = {},
            status = "Published"
        } = req.body;

        if (
            !pageTitle ||
            !section ||
            !slug
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Page title, section and slug are required."
            });
        }

        const existing =
            await WebsiteContent.findOne({
                slug: slug
                    .trim()
                    .toLowerCase()
            });

        if (existing) {
            return res.status(409).json({
                success: false,
                message:
                    "A page with this slug already exists."
            });
        }

        const newContent =
            await WebsiteContent.create({
                pageTitle:
                    pageTitle.trim(),

                section,

                slug:
                    slug
                        .trim()
                        .toLowerCase(),

                content,

                status,

                lastUpdatedBy:
                    req.user?._id || null
            });

        res.status(201).json({
            success: true,
            message:
                "Website content created successfully.",
            data: newContent
        });

    } catch (error) {
        console.error(
            "CREATE WEBSITE CONTENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to create website content.",
            error: error.message
        });
    }
};


// =========================================================
// UPDATE WEBSITE CONTENT
// =========================================================

const updateWebsiteContent = async (
    req,
    res
) => {
    try {
        const {
            pageTitle,
            section,
            slug,
            content,
            status
        } = req.body;

        const existing =
            await WebsiteContent.findById(
                req.params.id
            );

        if (!existing) {
            return res.status(404).json({
                success: false,
                message:
                    "Website content not found."
            });
        }

        // Prevent changing slug to another
        // existing page
        if (
            slug &&
            slug
                .trim()
                .toLowerCase() !==
                existing.slug
        ) {
            const duplicate =
                await WebsiteContent.findOne({
                    slug:
                        slug
                            .trim()
                            .toLowerCase(),

                    _id: {
                        $ne:
                            existing._id
                    }
                });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Another page already uses this slug."
                });
            }

            existing.slug =
                slug
                    .trim()
                    .toLowerCase();
        }

        if (pageTitle !== undefined) {
            existing.pageTitle =
                pageTitle.trim();
        }

        if (section !== undefined) {
            existing.section =
                section;
        }

        if (content !== undefined) {
            existing.content =
                content;
        }

        if (status !== undefined) {
            existing.status =
                status;
        }

        existing.lastUpdatedBy =
            req.user?._id || null;

        const updated =
            await existing.save();

        res.status(200).json({
            success: true,
            message:
                "Website content updated successfully.",
            data: updated
        });

    } catch (error) {
        console.error(
            "UPDATE WEBSITE CONTENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update website content.",
            error: error.message
        });
    }
};


// =========================================================
// DELETE WEBSITE CONTENT
// =========================================================

const deleteWebsiteContent = async (
    req,
    res
) => {
    try {
        const content =
            await WebsiteContent.findById(
                req.params.id
            );

        if (!content) {
            return res.status(404).json({
                success: false,
                message:
                    "Website content not found."
            });
        }

        await WebsiteContent.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message:
                "Website content deleted successfully."
        });

    } catch (error) {
        console.error(
            "DELETE WEBSITE CONTENT ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to delete website content.",
            error: error.message
        });
    }
};


// =========================================================
// INCREMENT PAGE VIEWS
// =========================================================

const incrementWebsiteView = async (
    req,
    res
) => {
    try {
        const content =
            await WebsiteContent.findByIdAndUpdate(
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

        if (!content) {
            return res.status(404).json({
                success: false,
                message:
                    "Website content not found."
            });
        }

        res.status(200).json({
            success: true,
            data: {
                views:
                    content.views
            }
        });

    } catch (error) {
        console.error(
            "INCREMENT WEBSITE VIEW ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update page views.",
            error: error.message
        });
    }
};
// =========================================================
// SYNC ACTUAL CALCURA CONTENT PAGES
// =========================================================

const syncWebsitePages = async (
    req,
    res
) => {

    try {

        let created = 0;
        let updated = 0;

        for (
            const page of allowedPages
        ) {

            const existing =
                await WebsiteContent.findOne({
                    slug: page.slug
                });

            // =============================================
            // UPDATE EXISTING PAGE
            // =============================================

            if (existing) {

                existing.pageTitle =
                    page.pageTitle;

                existing.section =
                    page.section;

                existing.slug =
                    page.slug;

                if (!existing.status) {
                    existing.status =
                        "Published";
                }

                existing.lastUpdatedBy =
                    req.user?._id ||
                    existing.lastUpdatedBy ||
                    null;

                await existing.save();

                updated++;

                continue;
            }


            // =============================================
            // CREATE MISSING PAGE
            // =============================================

            await WebsiteContent.create({

                pageTitle:
                    page.pageTitle,

                section:
                    page.section,

                slug:
                    page.slug,

                content: {},

                status:
                    "Published",

                views: 0,

                lastUpdatedBy:
                    req.user?._id ||
                    null

            });

            created++;

        }


        res.status(200).json({

            success: true,

            message:
                "Calcura website content pages synced successfully.",

            created,

            updated,

            total:
                allowedPages.length

        });


    } catch (error) {

        console.error(
            "SYNC WEBSITE PAGES ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to sync website pages.",

            error:
                error.message

        });

    }

};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getWebsiteContent,
    getWebsiteContentById,
    createWebsiteContent,
    updateWebsiteContent,
    deleteWebsiteContent,
    incrementWebsiteView,
    syncWebsitePages
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    getWebsiteContent,
    getWebsiteContentById,
    createWebsiteContent,
    updateWebsiteContent,
    deleteWebsiteContent,
    incrementWebsiteView,
    syncWebsitePages
};