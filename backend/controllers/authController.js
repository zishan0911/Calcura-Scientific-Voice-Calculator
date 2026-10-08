const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ===============================
// REGISTER USER
// ===============================

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
            });
        }

        // Check whether user already exists
        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword
        });

        // Send response
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while creating account"
        });
    }
};


// ===============================
// LOGIN USER
// ===============================

const loginUser = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;


        // Check required fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });

        }
// ==========================================
// FIXED ADMIN LOGIN FROM .ENV
// ==========================================

if (
    email.trim().toLowerCase() ===
        process.env.ADMIN_EMAIL.trim().toLowerCase() &&
    password === process.env.ADMIN_PASSWORD
) {

    const adminUser = await User.findOne({
        email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
        role: "admin"
    });

    if (!adminUser) {
        return res.status(401).json({
            success: false,
            message: "Admin account not found"
        });
    }

    if (adminUser.blocked) {
        return res.status(403).json({
            success: false,
            message: "Admin account is blocked"
        });
    }

    const token = jwt.sign(
        {
            userId: adminUser._id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return res.status(200).json({
        success: true,
        message: "Admin login successful",
        token: token,
        user: {
            id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email,
            role: "admin"
        }
    });
}

        // Find user
        const user = await User.findOne({
            email: email.toLowerCase()
        });


        if (!user) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });

        }


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });

        }


        // =================================================
        // BLOCKED ACCOUNT CHECK
        // =================================================

        if (user.blocked) {

            return res.status(403).json({
                success: false,
                message:
                    "Your account has been blocked. Please contact support."
            });

        }


        // =================================================
        // LOGIN TRACKING
        // =================================================

        const userAgent =
            req.headers["user-agent"] || "";


        let device =
            "Unknown";


        let browser =
            "Unknown";


        // -------------------------------------------------
        // DEVICE DETECTION
        // -------------------------------------------------

        if (
            /Android/i.test(
                userAgent
            )
        ) {

            device =
                "Android";

        }

        else if (
            /iPhone|iPad/i.test(
                userAgent
            )
        ) {

            device =
                "iPhone";

        }

        else if (
            /Macintosh|Mac OS/i.test(
                userAgent
            )
        ) {

            device =
                "Mac";

        }

        else if (
            /Windows/i.test(
                userAgent
            )
        ) {

            device =
                "Windows";

        }


        // -------------------------------------------------
        // BROWSER DETECTION
        // -------------------------------------------------

        if (
            /Edg/i.test(
                userAgent
            )
        ) {

            browser =
                "Edge";

        }

        else if (
            /Chrome/i.test(
                userAgent
            )
        ) {

            browser =
                "Chrome";

        }

        else if (
            /Firefox/i.test(
                userAgent
            )
        ) {

            browser =
                "Firefox";

        }

        else if (
            /Safari/i.test(
                userAgent
            )
        ) {

            browser =
                "Safari";

        }


        // -------------------------------------------------
        // IP ADDRESS
        // -------------------------------------------------

        const forwardedFor =
            req.headers[
                "x-forwarded-for"
            ];


        const loginIp =
            forwardedFor
                ? forwardedFor
                    .split(",")[0]
                    .trim()
                : req.ip || null;


        // -------------------------------------------------
        // SAVE LOGIN INFORMATION
        // -------------------------------------------------

        user.lastLoginAt =
            new Date();

        user.lastLoginIp =
            loginIp;

        user.lastLoginDevice =
            device;

        user.lastLoginBrowser =
            browser;


        await user.save();


        // =================================================
        // CREATE JWT TOKEN
        // =================================================

        const token =
            jwt.sign(
                {
                    userId:
                        user._id
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        "7d"
                }
            );


        // =================================================
        // SEND RESPONSE
        // =================================================

        res.status(200).json({

            success: true,

            message:
                "Login successful",

            token:
                token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while logging in"

        });

    }
};


// ===============================
// UPDATE PROFILE
// ===============================

const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name.trim()
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Update profile error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};


// ===============================
// CHANGE PASSWORD
// ===============================

const changePassword = async (req, res) => {
    try {
        const {
            currentPassword,
            newPassword
        } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 8 characters"
            });
        }

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Current password is incorrect"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                12
            );

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message:
                "Password changed successfully"
        });

    } catch (error) {
        console.error(
            "Change password error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while changing password"
        });
    }
};


// ===============================
// GET USER SETTINGS
// ===============================

const getSettings = async (req, res) => {
    try {

        const user = await User.findById(
            req.user._id
        ).select("settings");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            settings: user.settings
        });

    } catch (error) {

        console.error(
            "Get settings error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while loading settings"
        });
    }
};

// ===============================
// RESET PASSWORD
// ===============================

const resetPassword = async (req, res) => {
    try {

        const {
            email,
            newPassword
        } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 8 characters"
            });
        }

        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least one number"
            });
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must contain one special character"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "No account found with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            12
        );

        user.password = hashedPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password reset successfully"
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while resetting password"
        });
    }
};

// ===============================
// UPDATE USER SETTINGS
// ===============================

const updateSettings = async (req, res) => {
    try {

        const {
            theme,
            language,
            angleMode,
            numberFormat,
            soundEffects,
            autoSave,
            voiceEnabled,
            decimalPrecision,
            calculationNotifications,
            updateNotifications,
            welcomeTips,
            offlineMode,
            usageAnalytics,
            emailUpdates
        } = req.body;


        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }


        // Keep existing settings
        // and update only the settings
        // received from frontend.

        const currentSettings =
            user.settings
                ? user.settings.toObject()
                : {};


        user.settings = {
            ...currentSettings,

            ...(theme !== undefined && {
                theme
            }),

            ...(language !== undefined && {
                language
            }),

            ...(angleMode !== undefined && {
                angleMode
            }),

            ...(numberFormat !== undefined && {
                numberFormat
            }),

            ...(soundEffects !== undefined && {
                soundEffects
            }),

            ...(autoSave !== undefined && {
                autoSave
            }),

            ...(voiceEnabled !== undefined && {
                voiceEnabled
            }),

            ...(decimalPrecision !== undefined && {
                decimalPrecision
            }),

            ...(calculationNotifications !== undefined && {
                calculationNotifications
            }),

            ...(updateNotifications !== undefined && {
                updateNotifications
            }),

            ...(welcomeTips !== undefined && {
                welcomeTips
            }),

            ...(offlineMode !== undefined && {
                offlineMode
            }),

            ...(usageAnalytics !== undefined && {
                usageAnalytics
            }),

            ...(emailUpdates !== undefined && {
                emailUpdates
            })
        };


        await user.save();


        res.status(200).json({
            success: true,
            message: "Settings saved successfully",
            settings: user.settings
        });

    } catch (error) {

        console.error(
            "Update settings error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error while saving settings"
        });
    }
};


// ===============================
// EXPORT FUNCTIONS
// ===============================

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    changePassword,
    resetPassword,
    getSettings,
    updateSettings
};