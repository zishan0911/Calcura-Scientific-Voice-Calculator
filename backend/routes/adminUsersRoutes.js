const express = require("express");

const router = express.Router();

const {
    getAdminUsers,
    getAdminUser,
    updateAdminUser,
    deleteAdminUser
} = require("../controllers/adminUsersController");

const adminOnly = require("../middleware/adminMiddleware");

// =====================================================
// GET ALL USERS
// =====================================================

router.get(
    "/",
    adminOnly,
    getAdminUsers
);

// =====================================================
// GET SINGLE USER
// =====================================================

router.get(
    "/:id",
    adminOnly,
    getAdminUser
);

// =====================================================
// UPDATE USER
// =====================================================

router.put(
    "/:id",
    adminOnly,
    updateAdminUser
);

// =====================================================
// DELETE USER
// =====================================================

router.delete(
    "/:id",
    adminOnly,
    deleteAdminUser
);

module.exports = router;