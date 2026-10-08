const express = require("express");

const {
    createSaved,
    getSaved,
    deleteSaved,
    clearSaved
} = require("../controllers/savedController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSaved);

router.get("/", protect, getSaved);

router.delete("/:id", protect, deleteSaved);

router.delete("/", protect, clearSaved);

module.exports = router;