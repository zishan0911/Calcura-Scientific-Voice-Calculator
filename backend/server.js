const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const connectDatabase = require("./config/database");

// =====================================================
// ROUTES
// =====================================================
const formulaRoutes = require("./routes/formulaRoutes");
const authRoutes = require("./routes/authRoutes");
const calculationRoutes = require("./routes/calculationRoutes");
const savedRoutes = require("./routes/savedRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminUsersRoutes = require("./routes/adminUsersRoutes");
const adminCalculationsRoutes = require("./routes/adminCalculationsRoutes");
const adminFormulaRoutes = require("./routes/adminFormulaRoutes");
const adminSubscriptionRoutes = require("./routes/adminSubscriptionRoutes");
const adminReportsRoutes = require("./routes/adminReportsRoutes");
const adminActivityLogsRoutes = require("./routes/adminActivityLogsRoutes");
const systemSettingsRoutes = require("./routes/systemSettingsRoutes");
const websiteContentRoutes = require("./routes/websiteContentRoutes");
const publicPlanRoutes = require("./routes/publicPlanRoutes");
const graphRoutes = require("./routes/graphRoutes");
const converterRoutes = require("./routes/converterRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

// Serve frontend
app.use(express.static("../frontend"));

app.use(
    "/api/formulas",
    formulaRoutes
);
// =====================================================
// API ROUTES
// =====================================================

// Authentication
app.use("/api/auth", authRoutes);

// Calculations
app.use("/api/calculations", calculationRoutes);

// Saved Calculations
app.use("/api/saved", savedRoutes);

// Graphs
app.use("/api/graphs", graphRoutes);

//Converter
app.use("/api/converter", converterRoutes);

// Payments
app.use("/api/payments", paymentRoutes);

// AI
app.use("/api/ai", aiRoutes);

// =====================================================
// ADMIN ROUTES
// =====================================================

// Admin Dashboard
app.use("/api/admin", adminRoutes);

// Admin Users Management
app.use("/api/admin/users", adminUsersRoutes);

//Admin Calculations
app.use("/api/admin/calculations",adminCalculationsRoutes);

//Admin Formulas
app.use("/api/admin/formulas",adminFormulaRoutes);

//Admin Subscription
app.use("/api/admin/subscriptions",adminSubscriptionRoutes);

//subscription plans
app.use("/api/subscription-plans",publicPlanRoutes);

//Admin Reports
app.use("/api/admin/reports", adminReportsRoutes);

//Admin Activity Logs
app.use("/api/admin/activity-logs",adminActivityLogsRoutes);

//Admin System Settings
app.use("/api/admin/system-settings",systemSettingsRoutes);

//Admin Website Content
app.use("/api/admin/website-content",websiteContentRoutes);
// =====================================================
// CONNECT DATABASE
// =====================================================

connectDatabase();

// =====================================================
// TEST API
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Calcura API is running successfully"
    });
});

// =====================================================
// SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Calcura server running on http://localhost:${PORT}`
    );
});