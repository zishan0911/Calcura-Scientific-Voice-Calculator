const mongoose = require("mongoose");

const Calculation = require("../models/Calculation");
const User = require("../models/User");
const Graph = require("../models/Graph");
const Converter = require("../models/Converter");
const Saved = require("../models/Saved");

// ======================================================
// DELETION TRACKING MODEL
// ======================================================

const deletionLogSchema = new mongoose.Schema(
    {
        recordId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        recordType: {
            type: String,
            enum: [
                "calculation",
                "graph",
                "converter"
            ],
            required: true
        },

        deletedAt: {
            type: Date,
            default: Date.now
        }
    }
);

const CalculationDeletion =
    mongoose.models.CalculationDeletion ||
    mongoose.model(
        "CalculationDeletion",
        deletionLogSchema
    );

// ======================================================
// HELPERS
// ======================================================

function escapeRegex(value = "") {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


// ======================================================
// DATE QUERY
// ======================================================

function buildDateQuery(from, to, days) {

    if (from || to) {

        const createdAt = {};

        if (from) {

            const fromDate =
                new Date(`${from}T00:00:00`);

            if (!isNaN(fromDate.getTime())) {
                createdAt.$gte = fromDate;
            }
        }

        if (to) {

            const toDate =
                new Date(`${to}T23:59:59.999`);

            if (!isNaN(toDate.getTime())) {
                createdAt.$lte = toDate;
            }
        }

        return createdAt;
    }


    const numberOfDays =
        Math.max(
            Number(days) || 30,
            1
        );


    const startDate = new Date();

    startDate.setDate(
        startDate.getDate() -
        numberOfDays
    );


    return {
        $gte: startDate
    };
}


// ======================================================
// CALCULATION TYPE DETECTION
// ======================================================

function detectCalculationType(calculation) {

    const expression =
        String(
            calculation.expression || ""
        )
            .trim()
            .toLowerCase();


    const storedType =
        String(
            calculation.type || ""
        )
            .trim()
            .toLowerCase();


    // GRAPH / PLOT

    if (
        storedType.includes("graph") ||
        storedType.includes("plot") ||
        expression.startsWith("y=") ||
        expression.startsWith("y =")
    ) {
        return "Graph/Plot";
    }


    // MATRIX

    if (
        storedType.includes("matrix") ||
        expression.includes("matrix") ||
        expression.includes("det(") ||
        expression.includes("inv(")
    ) {
        return "Matrix";
    }


    // NUMERICAL METHODS

    if (
        storedType.includes("numerical") ||
        expression.includes("simpson") ||
        expression.includes("trapezoidal") ||
        expression.includes("trapezoid") ||
        expression.includes("euler") ||
        expression.includes("runge") ||
        expression.includes("rk4")
    ) {
        return "Numerical Methods";
    }


    // CALCULUS

    if (
        storedType.includes("calculus") ||
        storedType.includes("derivative") ||
        storedType.includes("integral") ||
        expression.includes("derivative") ||
        expression.includes("integral") ||
        expression.includes("differentiate") ||
        expression.includes("integrate") ||
        expression.includes("diff(") ||
        expression.includes("deriv(")
    ) {
        return "Calculus";
    }


    // LOG & EXP

    if (
        storedType.includes("log") ||
        storedType.includes("exp") ||
        expression.includes("log(") ||
        expression.includes("ln(") ||
        expression.includes("log10(") ||
        expression.includes("log2(") ||
        expression.includes("exp(")
    ) {
        return "Log & Exp";
    }


    // TRIGONOMETRY

    const trigFunctions = [
        "sin(",
        "cos(",
        "tan(",
        "asin(",
        "acos(",
        "atan(",
        "sinh(",
        "cosh(",
        "tanh(",
        "sec(",
        "csc(",
        "cot("
    ];


    if (
        storedType.includes("trig") ||
        trigFunctions.some(
            fn => expression.includes(fn)
        )
    ) {
        return "Trigonometry";
    }


    // ALGEBRA

    if (
        storedType.includes("algebra") ||
        expression.includes("solve(") ||
        expression.includes("simplify(") ||
        expression.includes("factor(") ||
        expression.includes("expand(")
    ) {
        return "Algebra";
    }


    // BASIC

    if (
        storedType === "calculator" ||
        storedType === "basic" ||
        storedType === "basic arithmetic"
    ) {
        return "Basic Arithmetic";
    }


    if (
        /^[0-9+\-*/%^().πpie\s]+$/i.test(
            expression
        )
    ) {
        return "Basic Arithmetic";
    }


    if (
        expression.includes("sqrt(") ||
        expression.includes("cbrt(") ||
        expression.includes("abs(")
    ) {
        return "Basic Arithmetic";
    }


    return "Other";
}


// ======================================================
// GET USER
// ======================================================

function getRecordUser(record) {

    if (
        record.user &&
        typeof record.user === "object" &&
        record.user._id
    ) {
        return record.user;
    }

    return null;
}


// ======================================================
// GET USER ID
// ======================================================

function getUserId(record) {

    const user =
        getRecordUser(record);

    if (user && user._id) {
        return String(user._id);
    }


    if (
        record.userId &&
        mongoose.Types.ObjectId.isValid(
            record.userId
        )
    ) {
        return String(record.userId);
    }


    if (
        record.user &&
        mongoose.Types.ObjectId.isValid(
            record.user
        )
    ) {
        return String(record.user);
    }


    return null;
}


// ======================================================
// STATUS
// ======================================================

function getStatus(record) {

    if (record.deleted === true) {
        return "deleted";
    }

    if (record.status) {
        return String(
            record.status
        ).toLowerCase();
    }

    return "completed";
}


// ======================================================
// NORMAL CALCULATION NORMALIZER
// ======================================================

function normalizeCalculation(calculation) {

    const user =
        getRecordUser(calculation);


    return {

        ...calculation,

        recordType: "calculation",

        category:
            detectCalculationType(
                calculation
            ),

        status:
            getStatus(
                calculation
            ),

        expression:
            calculation.expression ||
            "",

        result:
            calculation.result ||
            "",

        userName:
            user
                ? user.name
                : "Unknown User",

        username:
            user
                ? user.name
                : "Unknown User",

        email:
            user
                ? user.email
                : "",

        userInfo:
            user
                ? {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                : null
    };
}


// ======================================================
// GRAPH NORMALIZER
// ======================================================

function normalizeGraph(graph) {

    const user =
        getRecordUser(graph);


    let expression = "";


    if (
        graph.mode === "function"
    ) {

        expression =
            graph.functionExpression ||
            "";

    }

    else if (
        graph.mode === "parametric"
    ) {

        expression =
            `x(t) = ${graph.parametricX || ""}, y(t) = ${graph.parametricY || ""}`;

    }

    else if (
        graph.mode === "polar"
    ) {

        expression =
            `r = ${graph.polarExpression || ""}`;

    }

    else if (
        graph.mode === "3d"
    ) {

        expression =
            `z = ${graph.graph3DExpression || ""}`;

    }


    return {

        ...graph,

        recordType: "graph",

        category: "Graph/Plot",

        status: "completed",

        expression,

        result:
            graph.title ||
            "Graph Plot",

        graphMode:
            graph.mode ||
            "function",

        graphTitle:
            graph.title ||
            "Untitled Graph",

        userName:
            user
                ? user.name
                : "Unknown User",

        username:
            user
                ? user.name
                : "Unknown User",

        email:
            user
                ? user.email
                : "",

        userInfo:
            user
                ? {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                : null
    };
}


// ======================================================
// CONVERTER NORMALIZER
// ======================================================

function normalizeConverter(converter) {

    const user =
        getRecordUser(converter);


    /*
     * Converter field names can differ between
     * converter versions.
     *
     * We safely check the common fields.
     */

    const category =
        converter.category ||
        converter.type ||
        converter.conversionType ||
        "Unit Conversion";


    const fromValue =
        converter.fromValue ??
        converter.inputValue ??
        converter.value ??
        "";


    const toValue =
        converter.toValue ??
        converter.outputValue ??
        converter.result ??
        "";


    const fromUnit =
        converter.fromUnit ||
        converter.sourceUnit ||
        "";


    const toUnit =
        converter.toUnit ||
        converter.targetUnit ||
        "";


    const expression =
        fromValue !== "" &&
        (fromUnit || toUnit)
            ? `${fromValue} ${fromUnit} → ${toUnit}`
            : (
                converter.expression ||
                "Unit Conversion"
            );


    return {

        ...converter,

        recordType: "converter",

        category: "Unit Converter",

        status: "completed",

        expression,

        result:
            toValue !== ""
                ? String(toValue)
                : (
                    converter.result ||
                    ""
                ),

        converterCategory:
            category,

        fromValue,

        toValue,

        fromUnit,

        toUnit,

        userName:
            user
                ? user.name
                : "Unknown User",

        username:
            user
                ? user.name
                : "Unknown User",

        email:
            user
                ? user.email
                : "",

        userInfo:
            user
                ? {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
                : null
    };
}


// ======================================================
// GET ADMIN CALCULATIONS
// ======================================================

const getAdminCalculations =
    async (
        req,
        res
    ) => {

        try {

            const {
                page = 1,
                limit = 10,
                days = 30,
                search = "",
                userId = "all",
                category = "all",
                status = "all",
                from = "",
                to = ""
            } = req.query;


            const currentPage =
                Math.max(
                    Number(page) || 1,
                    1
                );


            const perPage =
                Math.min(
                    Math.max(
                        Number(limit) || 10,
                        1
                    ),
                    100
                );


            // ==================================================
            // DATE QUERY
            // ==================================================

            const dateQuery =
                buildDateQuery(
                    from,
                    to,
                    days
                );


            // ==================================================
            // USER QUERY
            // ==================================================

            let userObjectId = null;


            if (
                userId &&
                userId !== "all" &&
                mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                userObjectId =
                    new mongoose.Types.ObjectId(
                        userId
                    );
            }


            // ==================================================
            // LOAD NORMAL CALCULATIONS
            // ==================================================

            const calculationQuery = {
                createdAt: dateQuery
            };


            if (userObjectId) {
                calculationQuery.user =
                    userObjectId;
            }


            let calculations =
                await Calculation.find(
                    calculationQuery
                )
                    .sort({
                        createdAt: -1
                    })
                    .populate(
                        "user",
                        "name email"
                    )
                    .lean();


            calculations =
                calculations.map(
                    normalizeCalculation
                );


            // ==================================================
            // LOAD GRAPHS
            // ==================================================

            const graphQuery = {
                createdAt: dateQuery
            };


            if (userObjectId) {
                graphQuery.user =
                    userObjectId;
            }


            let graphs =
                await Graph.find(
                    graphQuery
                )
                    .sort({
                        createdAt: -1
                    })
                    .populate(
                        "user",
                        "name email"
                    )
                    .lean();


            graphs =
                graphs.map(
                    normalizeGraph
                );


            // ==================================================
            // LOAD CONVERTERS
            // ==================================================

            const converterQuery = {
                createdAt: dateQuery
            };


            if (userObjectId) {
                converterQuery.user =
                    userObjectId;
            }


            let converters = [];


            try {

                converters =
                    await Converter.find(
                        converterQuery
                    )
                        .sort({
                            createdAt: -1
                        })
                        .populate(
                            "user",
                            "name email"
                        )
                        .lean();

            } catch (converterError) {

                console.error(
                    "Converter collection error:",
                    converterError.message
                );

                converters = [];
            }


            converters =
                converters.map(
                    normalizeConverter
                );


            // ==================================================
            // COMBINE ALL RECORDS
            // ==================================================

            let records = [

                ...calculations,

                ...graphs,

                ...converters

            ];


            // ==================================================
            // SEARCH
            // ==================================================

            if (
                search &&
                search.trim()
            ) {

                const regex =
                    new RegExp(
                        escapeRegex(
                            search.trim()
                        ),
                        "i"
                    );


                records =
                    records.filter(
                        record => {

                            return (

                                regex.test(
                                    String(
                                        record.expression ||
                                        ""
                                    )
                                ) ||

                                regex.test(
                                    String(
                                        record.result ||
                                        ""
                                    )
                                ) ||

                                regex.test(
                                    String(
                                        record.category ||
                                        ""
                                    )
                                ) ||

                                regex.test(
                                    String(
                                        record.userName ||
                                        ""
                                    )
                                ) ||

                                regex.test(
                                    String(
                                        record.email ||
                                        ""
                                    )
                                ) ||

                                regex.test(
                                    String(
                                        record.graphTitle ||
                                        ""
                                    )
                                )

                            );

                        }
                    );
            }


            // ==================================================
            // CATEGORY FILTER
            // ==================================================

            if (
                category &&
                category !== "all"
            ) {

                records =
                    records.filter(
                        record =>
                            record.category ===
                            category
                    );
            }


            // ==================================================
            // STATUS FILTER
            // ==================================================

            if (
                status &&
                status !== "all"
            ) {

                records =
                    records.filter(
                        record =>
                            record.status ===
                            status
                    );
            }


            // ==================================================
            // SORT ALL RECORDS
            // ==================================================

            records.sort(
                (a, b) =>
                    new Date(
                        b.createdAt
                    ) -
                    new Date(
                        a.createdAt
                    )
            );


            // ==================================================
            // TOTAL
            // ==================================================

            const total =
                records.length;


            // ==================================================
            // PAGINATION
            // ==================================================

            const totalPages =
                Math.max(
                    Math.ceil(
                        total /
                        perPage
                    ),
                    1
                );


            const safePage =
                Math.min(
                    currentPage,
                    totalPages
                );


            const startIndex =
                (
                    safePage - 1
                ) *
                perPage;


            const paginatedRecords =
                records.slice(
                    startIndex,
                    startIndex +
                    perPage
                );


            // ==================================================
            // UNIQUE USERS
            // ==================================================

            const uniqueUserIds =
                new Set();


            records.forEach(
                record => {

                    const id =
                        getUserId(
                            record
                        );


                    if (id) {
                        uniqueUserIds.add(id);
                    }

                }
            );


            // ==================================================
            // TYPE COUNTS
            // ==================================================

            const typeCounts = {};


            records.forEach(
                record => {

                    const type =
                        record.category ||
                        "Other";


                    typeCounts[type] =
                        (
                            typeCounts[type] ||
                            0
                        ) + 1;

                }
            );

// ======================================================
// DAILY ACTIVITY
// ======================================================

const dailyMap = {};

const numberOfDays =
    Math.max(
        Number(days) || 30,
        1
    );


// ======================================================
// CREATE EVERY DAY
// ======================================================

for (
    let i = numberOfDays - 1;
    i >= 0;
    i--
) {

    const date = new Date();

    date.setHours(
        12,
        0,
        0,
        0
    );

    date.setDate(
        date.getDate() - i
    );

    const key =
        new Intl.DateTimeFormat(
            "en-CA",
            {
                timeZone: "Asia/Kolkata",

                year: "numeric",

                month: "2-digit",

                day: "2-digit"
            }
        ).format(date);

    dailyMap[key] = 0;
}


// ======================================================
// COUNT ALL RECORDS
// CALCULATION + GRAPH + CONVERTER
// ======================================================

records.forEach(
    record => {

        if (
            !record.createdAt
        ) {
            return;
        }

        const date =
            new Date(
                record.createdAt
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return;
        }

        const key =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Kolkata",

                    year: "numeric",

                    month: "2-digit",

                    day: "2-digit"
                }
            ).format(date);


        if (
            Object.prototype.hasOwnProperty.call(
                dailyMap,
                key
            )
        ) {

            dailyMap[key] += 1;

        }

    }
);


// ======================================================
// FINAL DAILY DATA
// ======================================================

const daily =
    Object.keys(dailyMap)
        .sort()
        .map(
            date => ({
                date: date,

                count:
                    dailyMap[date]
            })
        );
// ==========================================
// SAVED CALCULATIONS
// ==========================================

let savedCount = 0;

try {

    savedCount =
        await Saved.countDocuments();

} catch (error) {

    console.error(
        "Saved calculations count error:",
        error.message
    );

    savedCount = 0;

}

            // ==================================================
            // STATS
            // ==================================================

            const stats = {

                totalCalculations:
                    total,

                uniqueUsers:
                    uniqueUserIds.size,

                savedCalculations:
                    savedCount,

                deletedCalculations:
    await CalculationDeletion.countDocuments(),

                totalChange: 0,

                uniqueChange: 0

            };


            // ==================================================
            // USERS FOR FILTER
            // ==================================================

            const users =
                await User.find({

                    role: {
                        $ne: "admin"
                    }

                })
                    .select(
                        "_id name email"
                    )
                    .sort({
                        name: 1
                    })
                    .lean();


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.json({

                success: true,

                calculations:
                    paginatedRecords,

                users,

                typeCounts,

                daily,

                stats,

                pagination: {

                    page:
                        safePage,

                    pages:
                        totalPages,

                    total,

                    limit:
                        perPage

                }

            });

        } catch (error) {

            console.error(
                "Admin calculations error:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Failed to load admin calculations",

                error:
                    error.message

            });

        }

    };


// ======================================================
// DELETE ADMIN RECORD
// ======================================================

const deleteAdminCalculation =
    async (
        req,
        res
    ) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.Types.ObjectId.isValid(
                    id
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid record ID"

                });

            }


            // ==================================================
            // CHECK CALCULATION
            // ==================================================

            const calculation =
                await Calculation.findById(
                    id
                );

            if (calculation) {

                await CalculationDeletion.create({

                    recordId:
                        calculation._id,

                    user:
                        calculation.user || null,

                    recordType:
                        "calculation",

                    deletedAt:
                        new Date()

                });


                await Calculation.findByIdAndDelete(
                    id
                );


                return res.json({

                    success: true,

                    message:
                        "Calculation deleted successfully"

                });

            }


            // ==================================================
            // CHECK GRAPH
            // ==================================================

            const graph =
                await Graph.findById(
                    id
                );

            if (graph) {

                await CalculationDeletion.create({

                    recordId:
                        graph._id,

                    user:
                        graph.user || null,

                    recordType:
                        "graph",

                    deletedAt:
                        new Date()

                });


                await Graph.findByIdAndDelete(
                    id
                );


                return res.json({

                    success: true,

                    message:
                        "Graph deleted successfully"

                });

            }


            // ==================================================
            // CHECK CONVERTER
            // ==================================================

            const converter =
                await Converter.findById(
                    id
                );

            if (converter) {

                await CalculationDeletion.create({

                    recordId:
                        converter._id,

                    user:
                        converter.user || null,

                    recordType:
                        "converter",

                    deletedAt:
                        new Date()

                });


                await Converter.findByIdAndDelete(
                    id
                );


                return res.json({

                    success: true,

                    message:
                        "Conversion deleted successfully"

                });

            }


            // ==================================================
            // NOT FOUND
            // ==================================================

            return res.status(404).json({

                success: false,

                message:
                    "Record not found"

            });

        } catch (error) {

            console.error(
                "Delete admin record error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to delete record",

                error:
                    error.message

            });

        }

    };
// ======================================================
// EXPORT ALL RECORDS
// ======================================================

const exportAdminCalculations =
    async (
        req,
        res
    ) => {

        try {

            const {
                search = "",
                userId = "all",
                category = "all",
                status = "all",
                from = "",
                to = "",
                days = 30
            } = req.query;


            const dateQuery =
                buildDateQuery(
                    from,
                    to,
                    days
                );


            let userObjectId = null;


            if (
                userId &&
                userId !== "all" &&
                mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                userObjectId =
                    new mongoose.Types.ObjectId(
                        userId
                    );
            }


            // ==================================================
            // CALCULATIONS
            // ==================================================

            const calculationQuery = {
                createdAt: dateQuery
            };


            if (userObjectId) {
                calculationQuery.user =
                    userObjectId;
            }


            let calculations =
                await Calculation.find(
                    calculationQuery
                )
                    .populate(
                        "user",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            calculations =
                calculations.map(
                    normalizeCalculation
                );


            // ==================================================
            // GRAPHS
            // ==================================================

            const graphQuery = {
                createdAt: dateQuery
            };


            if (userObjectId) {
                graphQuery.user =
                    userObjectId;
            }


            let graphs =
                await Graph.find(
                    graphQuery
                )
                    .populate(
                        "user",
                        "name email"
                    )
                    .sort({
                        createdAt: -1
                    })
                    .lean();


            graphs =
                graphs.map(
                    normalizeGraph
                );


            // ==================================================
            // CONVERTERS
            // ==================================================

            let converters = [];


            try {

                converters =
                    await Converter.find(
                        {
                            createdAt:
                                dateQuery,
                            ...(userObjectId
                                ? {
                                    user:
                                        userObjectId
                                }
                                : {})
                        }
                    )
                        .populate(
                            "user",
                            "name email"
                        )
                        .sort({
                            createdAt: -1
                        })
                        .lean();

            } catch (error) {

                console.error(
                    "Converter export error:",
                    error.message
                );

                converters = [];
            }


            converters =
                converters.map(
                    normalizeConverter
                );


            // ==================================================
            // COMBINE
            // ==================================================

            let records = [

                ...calculations,

                ...graphs,

                ...converters

            ];


            // ==================================================
            // SEARCH
            // ==================================================

            if (
                search &&
                search.trim()
            ) {

                const regex =
                    new RegExp(
                        escapeRegex(
                            search.trim()
                        ),
                        "i"
                    );


                records =
                    records.filter(
                        record =>

                            regex.test(
                                String(
                                    record.expression ||
                                    ""
                                )
                            ) ||

                            regex.test(
                                String(
                                    record.result ||
                                    ""
                                )
                            ) ||

                            regex.test(
                                String(
                                    record.category ||
                                    ""
                                )
                            ) ||

                            regex.test(
                                String(
                                    record.userName ||
                                    ""
                                )
                            )

                    );
            }


            // ==================================================
            // CATEGORY
            // ==================================================

            if (
                category &&
                category !== "all"
            ) {

                records =
                    records.filter(
                        record =>
                            record.category ===
                            category
                    );
            }


            // ==================================================
            // STATUS
            // ==================================================

            if (
                status &&
                status !== "all"
            ) {

                records =
                    records.filter(
                        record =>
                            record.status ===
                            status
                    );
            }


            // ==================================================
            // CSV
            // ==================================================

            const rows = [

                [
                    "ID",
                    "Record Type",
                    "User",
                    "Email",
                    "Expression",
                    "Result",
                    "Category",
                    "Status",
                    "Date"
                ]

            ];


            records.forEach(
                record => {

                    rows.push([

                        String(
                            record._id
                        ),

                        record.recordType ||
                            "",

                        record.userName ||
                            "Unknown User",

                        record.email ||
                            "",

                        record.expression ||
                            "",

                        record.result ||
                            "",

                        record.category ||
                            "Other",

                        record.status ||
                            "completed",

                        record.createdAt
                            ? new Date(
                                record.createdAt
                            ).toLocaleString(
                                "en-IN"
                            )
                            : ""

                    ]);

                }
            );


            const csv =
                rows
                    .map(
                        row =>
                            row
                                .map(
                                    value =>
                                        `"${String(
                                            value
                                        ).replace(
                                            /"/g,
                                            '""'
                                        )}"`
                                )
                                .join(",")
                    )
                    .join("\n");


            res.setHeader(
                "Content-Type",
                "text/csv; charset=utf-8"
            );


            res.setHeader(
                "Content-Disposition",
                "attachment; filename=calcura-calculations.csv"
            );


            return res.send(csv);

        } catch (error) {

            console.error(
                "Export calculations error:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Failed to export calculations",

                error:
                    error.message

            });

        }

    };


// ======================================================
// EXPORTS
// ======================================================

module.exports = {

    getAdminCalculations,

    deleteAdminCalculation,

    exportAdminCalculations

};