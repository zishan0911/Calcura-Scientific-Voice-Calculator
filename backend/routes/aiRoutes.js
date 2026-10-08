const express = require("express");

const {
    askCalcuraAI,
    getAIHistory,
    getAIConversation,
    toggleSavedConversation
} = require("../controllers/aiController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CALCURA AI
// =====================================================

// Ask Calcura AI
router.post("/ask", protect, askCalcuraAI);

// Get all AI conversations
router.get("/history", protect, getAIHistory);

// Get single conversation
router.get("/conversation/:id", protect, getAIConversation);

// Save / Unsave conversation
router.put(
    "/conversation/:id/save",
    protect,
    toggleSavedConversation
);

module.exports = router;