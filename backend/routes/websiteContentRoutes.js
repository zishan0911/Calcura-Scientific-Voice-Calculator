const express = require("express");

const router = express.Router();


// =========================================================
// CONTROLLER
// =========================================================

const {
    getWebsiteContent,
    getWebsiteContentById,
    createWebsiteContent,
    updateWebsiteContent,
    deleteWebsiteContent,
    incrementWebsiteView,
    syncWebsitePages
} = require("../controllers/websiteContentController");


// =========================================================
// AUTH MIDDLEWARE
// =========================================================

const {
    protect
} = require("../middleware/authMiddleware");


// =========================================================
// ADMIN WEBSITE CONTENT ROUTES
// =========================================================

// Get all website content
router.get(
    "/",
    protect,
    getWebsiteContent
);


// Sync actual Calcura content pages
router.post(
    "/sync",
    protect,
    syncWebsitePages
);


// Get single content
router.get(
    "/:id",
    protect,
    getWebsiteContentById
);


// Create new content
router.post(
    "/",
    protect,
    createWebsiteContent
);


// Update content
router.put(
    "/:id",
    protect,
    updateWebsiteContent
);


// Delete content
router.delete(
    "/:id",
    protect,
    deleteWebsiteContent
);


// Increment page views
router.patch(
    "/:id/view",
    incrementWebsiteView
);


module.exports = router;