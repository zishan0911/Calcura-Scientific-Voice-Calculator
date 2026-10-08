const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {

        // ==========================================
        // CHECK AUTHORIZATION HEADER
        // ==========================================

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // ==========================================
        // GET TOKEN
        // ==========================================

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing"
            });
        }

        // ==========================================
        // VERIFY JWT
        // ==========================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ==========================================
        // GET USER ID
        // ==========================================

        const userId =
            decoded.id ||
            decoded.userId ||
            decoded._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        // ==========================================
        // FIND USER IN MONGODB
        // ==========================================

        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // ==========================================
        // ADMIN CHECK
        // ==========================================

        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        // ==========================================
        // SAVE USER IN REQUEST
        // ==========================================

        req.user = user;

        // ==========================================
        // CONTINUE
        // ==========================================

        next();

    } catch (error) {

        console.error(
            "Admin Middleware Error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });
    }
};

module.exports = adminMiddleware;