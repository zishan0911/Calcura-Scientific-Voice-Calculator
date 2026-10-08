const Graph = require("../models/Graph");

// ==========================================
// CREATE / SAVE GRAPH
// ==========================================

const createGraph = async (req, res) => {
    try {
        const {
            title,
            mode,
            functionExpression,
            parametricX,
            parametricY,
            polarExpression,
            graph3DExpression,
            range,
            settings
        } = req.body;

        const graph = await Graph.create({
            user: req.user._id,

            title:
                title && title.trim()
                    ? title.trim()
                    : "Untitled Graph",

            mode: mode || "function",

            functionExpression:
                functionExpression || "",

            parametricX:
                parametricX || "",

            parametricY:
                parametricY || "",

            polarExpression:
                polarExpression || "",

            graph3DExpression:
                graph3DExpression || "",

            range: {
                xMin:
                    range?.xMin !== undefined
                        ? Number(range.xMin)
                        : -10,

                xMax:
                    range?.xMax !== undefined
                        ? Number(range.xMax)
                        : 10,

                yMin:
                    range?.yMin !== undefined
                        ? Number(range.yMin)
                        : -10,

                yMax:
                    range?.yMax !== undefined
                        ? Number(range.yMax)
                        : 10
            },

            settings: {
                showGrid:
                    settings?.showGrid !== undefined
                        ? Boolean(settings.showGrid)
                        : true,

                showAxes:
                    settings?.showAxes !== undefined
                        ? Boolean(settings.showAxes)
                        : true,

                multipleFunctions:
                    settings?.multipleFunctions !== undefined
                        ? Boolean(settings.multipleFunctions)
                        : false,

                showLegend:
                    settings?.showLegend !== undefined
                        ? Boolean(settings.showLegend)
                        : true,

                showPoints:
                    settings?.showPoints !== undefined
                        ? Boolean(settings.showPoints)
                        : false,

                lineColor:
                    settings?.lineColor || "#1688ff",

                lineWidth:
                    settings?.lineWidth !== undefined
                        ? Number(settings.lineWidth)
                        : 3,

                lineStyle:
                    settings?.lineStyle || "solid"
            }
        });

        res.status(201).json({
            success: true,
            message: "Graph saved successfully",
            graph
        });

    } catch (error) {
        console.error("Create graph error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while saving graph"
        });
    }
};


// ==========================================
// GET USER GRAPHS
// ==========================================

const getGraphs = async (req, res) => {
    try {
        const graphs = await Graph.find({
            user: req.user._id
        })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            graphs
        });

    } catch (error) {
        console.error("Get graphs error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while loading graphs"
        });
    }
};


// ==========================================
// GET SINGLE GRAPH
// ==========================================

const getGraphById = async (req, res) => {
    try {
        const graph = await Graph.findOne({
            _id: req.params.id,
            user: req.user._id
        }).lean();

        if (!graph) {
            return res.status(404).json({
                success: false,
                message: "Graph not found"
            });
        }

        res.status(200).json({
            success: true,
            graph
        });

    } catch (error) {
        console.error("Get graph error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while loading graph"
        });
    }
};


// ==========================================
// DELETE GRAPH
// ==========================================

const deleteGraph = async (req, res) => {
    try {
        const graph = await Graph.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!graph) {
            return res.status(404).json({
                success: false,
                message: "Graph not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Graph deleted successfully"
        });

    } catch (error) {
        console.error("Delete graph error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting graph"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createGraph,
    getGraphs,
    getGraphById,
    deleteGraph
};