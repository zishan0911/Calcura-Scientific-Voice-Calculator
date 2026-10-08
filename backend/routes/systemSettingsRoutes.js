const express =
    require("express");

const router =
    express.Router();

const {
    getSystemSettings,
    updateSystemSettings
} =
    require("../controllers/systemSettingsController");

const {
    protect
} =
    require("../middleware/authMiddleware");


/* =========================================================
   ADMIN SYSTEM SETTINGS
========================================================= */

router.get(
    "/",
    protect,
    getSystemSettings
);


router.put(
    "/",
    protect,
    updateSystemSettings
);


module.exports =
    router;