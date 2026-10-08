const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ==========================================
// PROTECT ROUTES / AUTHENTICATION MIDDLEWARE
// ==========================================

const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;


        // ==========================================
        // CHECK AUTHORIZATION HEADER
        // ==========================================

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        // ==========================================
        // GET TOKEN
        // ==========================================

        const token =
            authHeader.split(" ")[1];


        // ==========================================
        // VERIFY TOKEN
        // ==========================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ==========================================
        // FIND USER
        // ==========================================

        const user =
            await User.findById(
                decoded.userId
            ).select("-password");


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }


        // ==========================================
        // ATTACH USER TO REQUEST
        // ==========================================

        req.user = user;


        // ==========================================
        // CONTINUE
        // ==========================================

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

// Supports:
// const protect = require("./authMiddleware");
//
// AND:
//
// const { protect } = require("./authMiddleware");

module.exports = protect;
module.exports.protect = protect;