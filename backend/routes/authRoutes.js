const express = require("express");

const {
    registerUser,
    loginUser,
    updateProfile,
    changePassword,
    getSettings,
    updateSettings
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// REGISTER
// ===============================

router.post(
    "/register",
    registerUser
);


// ===============================
// LOGIN
// ===============================

router.post(
    "/login",
    loginUser
);


// ===============================
// UPDATE PROFILE
// ===============================

router.put(
    "/profile",
    protect,
    updateProfile
);


// ===============================
// CHANGE PASSWORD
// ===============================

router.put(
    "/change-password",
    protect,
    changePassword
);


// ===============================
// GET USER SETTINGS
// ===============================

router.get(
    "/settings",
    protect,
    getSettings
);


// ===============================
// UPDATE USER SETTINGS
// ===============================

router.put(
    "/settings",
    protect,
    updateSettings
);


// ===============================
// GET LOGGED-IN USER
// ===============================

router.get(
    "/me",
    protect,
    (req, res) => {

        res.status(200).json({
            success: true,
            user: req.user
        });

    }
);


module.exports = router;