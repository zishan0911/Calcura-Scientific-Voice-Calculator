const express = require("express");

const {
    getPublicPlan
} = require("../controllers/publicPlanController");

const router = express.Router();

router.get(
    "/:slug",
    getPublicPlan
);

module.exports = router;