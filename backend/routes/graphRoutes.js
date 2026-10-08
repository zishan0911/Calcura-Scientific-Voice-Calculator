const express = require("express");

const router = express.Router();

const graphController = require("../controllers/graphController");
const { protect } = require("../middleware/authMiddleware");

router.post(
    "/",
    protect,
    graphController.createGraph
);

router.get(
    "/",
    protect,
    graphController.getGraphs
);

router.get(
    "/:id",
    protect,
    graphController.getGraphById
);

router.delete(
    "/:id",
    protect,
    graphController.deleteGraph
);

module.exports = router;