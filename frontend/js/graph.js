// ==========================================
// CALCURA - GRAPH CALCULATOR
// COMPLETE GRAPH.JS
// ==========================================

const canvas = document.getElementById("graphCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const functionInput = document.getElementById("functionInput");
const plotBtn = document.getElementById("plotBtn");
const graphStatus = document.getElementById("graphStatus");
const graphTitle = document.getElementById("graphTitle");

const xMinInput = document.getElementById("xMin");
const xMaxInput = document.getElementById("xMax");
const yMinInput = document.getElementById("yMin");
const yMaxInput = document.getElementById("yMax");


// ==========================================
// GRAPH SETTINGS
// ==========================================

window.calcuraGraphSettings = {
    showGrid:
        document.getElementById("showGrid")?.checked !== false,

    showAxes:
        document.getElementById("showAxes")?.checked !== false,

    multipleFunctions:
        document.getElementById("multipleFunctions")?.checked === true,

    showLegend:
        document.getElementById("showLegend")?.checked !== false,

    showPoints:
        document.getElementById("showPoints")?.checked === true,

    style:
        document.getElementById("lineStyle")?.value || "Solid"
};


let currentGraphMode = "function";
let lastPlotState = null;
let resizing = false;


// ==========================================
// BASIC HELPERS
// ==========================================

function setGraphStatus(message) {

    if (graphStatus) {
        graphStatus.textContent = message;
    }

}


function setGraphTitle(message) {

    if (graphTitle) {
        graphTitle.textContent = message;
    }

}


function getLineColor() {

    return (
        document.getElementById("lineColor")?.value ||
        "#1688ff"
    );

}


function getLineWidth() {

    const value = Number(
        document.getElementById("lineWidth")?.value || 3
    );

    return Number.isFinite(value)
        ? Math.max(1, value)
        : 3;

}


function getLineStyle() {

    return (
        document.getElementById("lineStyle")?.value ||
        "Solid"
    ).toLowerCase();

}


function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function numberOr(value, fallback) {

    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : fallback;

}


// ==========================================
// MATHEMATICAL FUNCTIONS
// ==========================================

const GRAPH_FUNCTIONS = {

    sqrt: args =>
        args.length === 1
            ? Math.sqrt(args[0])
            : NaN,

    cbrt: args =>
        args.length === 1
            ? Math.cbrt(args[0])
            : NaN,

    abs: args =>
        args.length === 1
            ? Math.abs(args[0])
            : NaN,


    sin: args =>
        args.length === 1
            ? Math.sin(args[0])
            : NaN,

    cos: args =>
        args.length === 1
            ? Math.cos(args[0])
            : NaN,

    tan: args =>
        args.length === 1
            ? Math.tan(args[0])
            : NaN,


    sec: args =>
        args.length === 1
            ? 1 / Math.cos(args[0])
            : NaN,

    csc: args =>
        args.length === 1
            ? 1 / Math.sin(args[0])
            : NaN,

    cot: args =>
        args.length === 1
            ? 1 / Math.tan(args[0])
            : NaN,


    asin: args =>
        args.length === 1
            ? Math.asin(args[0])
            : NaN,

    acos: args =>
        args.length === 1
            ? Math.acos(args[0])
            : NaN,

    atan: args =>
        args.length === 1
            ? Math.atan(args[0])
            : NaN,

    atan2: args =>
        args.length === 2
            ? Math.atan2(args[0], args[1])
            : NaN,


    sinh: args =>
        args.length === 1
            ? Math.sinh(args[0])
            : NaN,

    cosh: args =>
        args.length === 1
            ? Math.cosh(args[0])
            : NaN,

    tanh: args =>
        args.length === 1
            ? Math.tanh(args[0])
            : NaN,


    log: args => {

        if (args.length === 1) {
            return Math.log10(args[0]);
        }

        if (args.length === 2) {
            return (
                Math.log(args[0]) /
                Math.log(args[1])
            );
        }

        return NaN;

    },


    log10: args =>
        args.length === 1
            ? Math.log10(args[0])
            : NaN,

    log2: args =>
        args.length === 1
            ? Math.log2(args[0])
            : NaN,

    ln: args =>
        args.length === 1
            ? Math.log(args[0])
            : NaN,

    exp: args =>
        args.length === 1
            ? Math.exp(args[0])
            : NaN,


    floor: args =>
        args.length === 1
            ? Math.floor(args[0])
            : NaN,

    ceil: args =>
        args.length === 1
            ? Math.ceil(args[0])
            : NaN,

    round: args =>
        args.length === 1
            ? Math.round(args[0])
            : NaN,

    sign: args =>
        args.length === 1
            ? Math.sign(args[0])
            : NaN,


    min: args =>
        args.length
            ? Math.min(...args)
            : NaN,

    max: args =>
        args.length
            ? Math.max(...args)
            : NaN,

    pow: args =>
        args.length === 2
            ? Math.pow(args[0], args[1])
            : NaN

};


// ==========================================
// CONSTANTS
// ==========================================

const GRAPH_CONSTANTS = {

    pi: Math.PI,

    e: Math.E,

    tau: Math.PI * 2,

    phi:
        (1 + Math.sqrt(5)) / 2

};


// ==========================================
// NORMALIZE EXPRESSION
// ==========================================

function normalizeGraphExpression(expression) {

    let exp =
        String(expression ?? "")
            .trim()
            .toLowerCase();


    exp = exp

        .replaceAll("π", "pi")

        .replaceAll("×", "*")

        .replaceAll("÷", "/")

        .replaceAll("−", "-")

        .replace(/²/g, "^2")

        .replace(/³/g, "^3")

        .replace(/⁴/g, "^4")

        .replace(/⁵/g, "^5")

        .replace(/⁶/g, "^6")

        .replace(/⁷/g, "^7")

        .replace(/⁸/g, "^8")

        .replace(/⁹/g, "^9")

        .replace(/⁰/g, "^0")

        .replace(/\s+/g, "");


    // Voice aliases

    exp =
        exp

            .replace(/arcsin/g, "asin")

            .replace(/arccos/g, "acos")

            .replace(/arctan/g, "atan")

            .replace(/sine/g, "sin")

            .replace(/cosine/g, "cos")

            .replace(/tangent/g, "tan");


    // Degree notation

    exp = exp.replace(
        /(\d+(?:\.\d+)?)°/g,
        "($1*pi/180)"
    );


    return exp;

}


// ==========================================
// ASSIGNMENT HELPER
// x(t)=cos(t)
// y(t)=sin(t)
// ==========================================

function extractAssignedExpression(
    expression,
    variable
) {

    const text =
        String(expression ?? "").trim();


    const re =
        new RegExp(
            `^\\s*(?:${variable}|${variable}\\s*\\([^)]*\\))\\s*=\\s*(.+)$`,
            "i"
        );


    const match =
        text.match(re);


    return match
        ? match[1].trim()
        : text;

}


// ==========================================
// MULTIPLE FUNCTIONS
// ==========================================

function splitTopLevelExpressions(expression) {

    const result = [];

    let start = 0;

    let depth = 0;

    const text =
        String(expression ?? "");


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        const ch = text[i];


        if (ch === "(") {

            depth++;

        }

        else if (ch === ")") {

            depth =
                Math.max(0, depth - 1);

        }

        else if (
            (ch === "," ||
                ch === ";" ||
                ch === "\n") &&
            depth === 0
        ) {

            const part =
                text.slice(start, i).trim();


            if (part) {

                result.push(part);

            }


            start = i + 1;

        }

    }


    const last =
        text.slice(start).trim();


    if (last) {

        result.push(last);

    }


    return result;

}


// ==========================================
// TOKENIZER
// ==========================================

function tokenizeGraphExpression(expression) {

    const exp =
        normalizeGraphExpression(expression);


    const tokens = [];

    let i = 0;


    while (i < exp.length) {

        const ch = exp[i];


        // NUMBER

        if (/\d|\./.test(ch)) {

            const rest =
                exp.slice(i);


            const match =
                rest.match(
                    /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i
                );


            if (!match) {

                throw new Error(
                    "Invalid number"
                );

            }


            tokens.push({
                type: "number",
                value: Number(match[0])
            });


            i += match[0].length;

            continue;

        }


        // IDENTIFIER

        if (/[a-zA-Z_]/.test(ch)) {

            const rest =
                exp.slice(i);


            const match =
                rest.match(
                    /^[a-zA-Z_][a-zA-Z_0-9]*/
                );


            tokens.push({

                type: "identifier",

                value: match[0]

            });


            i += match[0].length;

            continue;

        }


        // OPERATORS

        if (
            "+-*/^%".includes(ch)
        ) {

            tokens.push({

                type: "operator",

                value: ch

            });


            i++;

            continue;

        }


        // LEFT PAREN

        if (ch === "(") {

            tokens.push({

                type: "leftParen",

                value: ch

            });


            i++;

            continue;

        }


        // RIGHT PAREN

        if (ch === ")") {

            tokens.push({

                type: "rightParen",

                value: ch

            });


            i++;

            continue;

        }


        // COMMA

        if (ch === ",") {

            tokens.push({

                type: "comma",

                value: ch

            });


            i++;

            continue;

        }


        throw new Error(
            `Unsupported symbol: ${ch}`
        );

    }


    tokens.push({

        type: "eof",

        value: ""

    });


    return tokens;

}


// ==========================================
// EXPRESSION PARSER
// ==========================================

class GraphExpressionParser {

    constructor(
        expression,
        variables = {}
    ) {

        this.tokens =
            tokenizeGraphExpression(
                expression
            );


        this.index = 0;

        this.variables =
            variables;

    }


    peek(offset = 0) {

        return (
            this.tokens[
                this.index + offset
            ] || {
                type: "eof",
                value: ""
            }
        );

    }


    consume() {

        return (
            this.tokens[
                this.index++
            ]
        );

    }


    match(
        type,
        value = null
    ) {

        const token = this.peek();


        return (
            token.type === type &&
            (
                value === null ||
                token.value === value
            )
        );

    }


    expect(
        type,
        value = null
    ) {

        if (
            !this.match(
                type,
                value
            )
        ) {

            throw new Error(
                "Invalid expression syntax"
            );

        }


        return this.consume();

    }


    parse() {

        if (
            this.match("eof")
        ) {

            throw new Error(
                "Empty expression"
            );

        }


        const value =
            this.parseAdditive();


        if (
            !this.match("eof")
        ) {

            throw new Error(
                "Unexpected token"
            );

        }


        return value;

    }


    parseAdditive() {

        let value =
            this.parseMultiplicative();


        while (
            this.match(
                "operator",
                "+"
            ) ||
            this.match(
                "operator",
                "-"
            )
        ) {

            const op =
                this.consume().value;


            const right =
                this.parseMultiplicative();


            value =
                op === "+"
                    ? value + right
                    : value - right;

        }


        return value;

    }


    isImplicitMultiplicationStart(
        token
    ) {

        return (

            token.type === "number" ||

            token.type ===
                "identifier" ||

            token.type ===
                "leftParen"

        );

    }


    parseMultiplicative() {

        let value =
            this.parseUnary();


        while (true) {


            // Explicit multiplication

            if (
                this.match(
                    "operator",
                    "*"
                ) ||
                this.match(
                    "operator",
                    "/"
                ) ||
                this.match(
                    "operator",
                    "%"
                )
            ) {

                const op =
                    this.consume().value;


                const right =
                    this.parseUnary();


                if (op === "*") {

                    value *= right;

                }

                else if (op === "/") {

                    value /= right;

                }

                else {

                    value %= right;

                }


                continue;

            }


            // Implicit multiplication
            //
            // 2x
            // 3sin(x)
            // 2(x+1)
            // (x+1)(x-1)
            // 2pi

            if (
                this.isImplicitMultiplicationStart(
                    this.peek()
                )
            ) {

                const right =
                    this.parseUnary();


                value *= right;


                continue;

            }


            break;

        }


        return value;

    }


    parseUnary() {

        if (
            this.match(
                "operator",
                "+"
            )
        ) {

            this.consume();


            return +
                this.parseUnary();

        }


        if (
            this.match(
                "operator",
                "-"
            )
        ) {

            this.consume();


            return -
                this.parseUnary();

        }


        return this.parsePower();

    }


    parsePower() {

        let value =
            this.parsePrimary();


        if (
            this.match(
                "operator",
                "^"
            )
        ) {

            this.consume();


            const exponent =
                this.parseUnary();


            value =
                Math.pow(
                    value,
                    exponent
                );

        }


        return value;

    }


    parsePrimary() {

        const token =
            this.peek();


        // NUMBER

        if (
            token.type === "number"
        ) {

            this.consume();


            return token.value;

        }


        // PARENTHESIS

        if (
            token.type ===
                "leftParen"
        ) {

            this.consume();


            const value =
                this.parseAdditive();


            this.expect(
                "rightParen"
            );


            return value;

        }


        // IDENTIFIER

        if (
            token.type ===
                "identifier"
        ) {

            const name =
                token.value;


            this.consume();


            // FUNCTION

            if (
                this.match(
                    "leftParen"
                )
            ) {

                if (
                    !(
                        name in
                        GRAPH_FUNCTIONS
                    )
                ) {

                    throw new Error(
                        `Unknown function: ${name}`
                    );

                }


                this.consume();


                const args = [];


                if (
                    !this.match(
                        "rightParen"
                    )
                ) {

                    args.push(
                        this.parseAdditive()
                    );


                    while (
                        this.match(
                            "comma"
                        )
                    ) {

                        this.consume();


                        args.push(
                            this.parseAdditive()
                        );

                    }

                }


                this.expect(
                    "rightParen"
                );


                return GRAPH_FUNCTIONS[
                    name
                ](args);

            }


            // VARIABLE

            if (
                Object.prototype
                    .hasOwnProperty.call(
                        this.variables,
                        name
                    )
            ) {

                return Number(
                    this.variables[name]
                );

            }


            // CONSTANT

            if (
                Object.prototype
                    .hasOwnProperty.call(
                        GRAPH_CONSTANTS,
                        name
                    )
            ) {

                return GRAPH_CONSTANTS[
                    name
                ];

            }


            // xy / xt / yt

            if (
                name.length > 1 &&
                [...name].every(
                    ch =>
                        Object.hasOwn(
                            this.variables,
                            ch
                        )
                )
            ) {

                let product = 1;


                for (
                    const ch of name
                ) {

                    product *= Number(
                        this.variables[ch]
                    );

                }


                return product;

            }


            throw new Error(
                `Unknown identifier: ${name}`
            );

        }


        throw new Error(
            "Invalid expression"
        );

    }

}


// ==========================================
// EVALUATE EXPRESSION
// ==========================================

function evaluateGraphExpression(
    expression,
    variables = {}
) {

    const parser =
        new GraphExpressionParser(
            expression,
            variables
        );


    const result =
        parser.parse();


    return Number(result);

}


// ==========================================
// FUNCTION EVALUATORS
// ==========================================

function evaluateFunction(
    expression,
    x
) {

    return evaluateGraphExpression(
        expression,
        { x }
    );

}


function evaluateParametricFunction(
    expression,
    t
) {

    return evaluateGraphExpression(
        expression,
        { t }
    );

}


function evaluate3DExpression(
    expression,
    x,
    y
) {

    return evaluateGraphExpression(
        expression,
        { x, y }
    );

}


// ==========================================
// OLD HELPER COMPATIBILITY
// ==========================================

function prepareFunction(
    expression
) {

    return normalizeGraphExpression(
        expression
    );

}


function prepareParametricFunction(
    expression
) {

    return normalizeGraphExpression(
        expression
    );

}


// ==========================================
// CANVAS COORDINATES
// ==========================================

function getCanvasX(
    x,
    xMin,
    xMax
) {

    return (
        (x - xMin) /
        (xMax - xMin)
    ) * canvas.width;

}


function getCanvasY(
    y,
    yMin,
    yMax
) {

    return (
        canvas.height -
        (
            (y - yMin) /
            (yMax - yMin)
        ) * canvas.height
    );

}


// ==========================================
// GRID STEP
// ==========================================

function calculateStep(
    min,
    max
) {

    const range =
        Math.abs(max - min);


    if (range <= 10) {

        return 1;

    }


    if (range <= 50) {

        return 5;

    }


    if (range <= 100) {

        return 10;

    }


    if (range <= 500) {

        return 50;

    }


    return 100;

}


// ==========================================
// FORMAT NUMBER
// ==========================================

function formatAxisNumber(
    value
) {

    if (
        Number.isInteger(value)
    ) {

        return String(value);

    }


    return value
        .toFixed(2)
        .replace(/\.?0+$/, "");

}


// ==========================================
// LINE STYLE
// ==========================================

function applyCanvasLineStyle() {

    ctx.setLineDash([]);


    const style =
        getLineStyle();


    if (
        style === "dashed"
    ) {

        ctx.setLineDash(
            [10, 7]
        );

    }


    if (
        style === "dotted"
    ) {

        ctx.setLineDash(
            [2, 6]
        );

    }

}


// ==========================================
// DRAW GRID
// ==========================================

function drawGrid(
    xMin,
    xMax,
    yMin,
    yMax
) {

    if (!ctx || !canvas) {

        return;

    }


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#020d1a";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const settings =
        window.calcuraGraphSettings;


    const xStep =
        calculateStep(
            xMin,
            xMax
        );


    const yStep =
        calculateStep(
            yMin,
            yMax
        );


    // GRID

    if (
        settings.showGrid
    ) {

        ctx.save();


        ctx.strokeStyle =
            "rgba(120,155,190,0.25)";


        ctx.lineWidth = 1;


        ctx.setLineDash(
            [4, 4]
        );


        for (
            let x =
                Math.ceil(
                    xMin / xStep
                ) * xStep;

            x <=
                xMax +
                xStep * 0.001;

            x += xStep
        ) {

            const cx =
                getCanvasX(
                    x,
                    xMin,
                    xMax
                );


            ctx.beginPath();


            ctx.moveTo(
                cx,
                0
            );


            ctx.lineTo(
                cx,
                canvas.height
            );


            ctx.stroke();

        }


        for (
            let y =
                Math.ceil(
                    yMin / yStep
                ) * yStep;

            y <=
                yMax +
                yStep * 0.001;

            y += yStep
        ) {

            const cy =
                getCanvasY(
                    y,
                    yMin,
                    yMax
                );


            ctx.beginPath();


            ctx.moveTo(
                0,
                cy
            );


            ctx.lineTo(
                canvas.width,
                cy
            );


            ctx.stroke();

        }


        ctx.restore();

    }


    // AXES

    if (
        settings.showAxes
    ) {

        ctx.save();


        ctx.strokeStyle =
            "#dce9f7";


        ctx.fillStyle =
            "#dce9f7";


        ctx.lineWidth = 2;


        ctx.setLineDash([]);


        // Y AXIS

        if (
            xMin <= 0 &&
            xMax >= 0
        ) {

            const zeroX =
                getCanvasX(
                    0,
                    xMin,
                    xMax
                );


            ctx.beginPath();


            ctx.moveTo(
                zeroX,
                0
            );


            ctx.lineTo(
                zeroX,
                canvas.height
            );


            ctx.stroke();


            ctx.font =
                "14px Arial";


            ctx.fillText(
                "y",
                zeroX + 8,
                16
            );

        }


        // X AXIS

        if (
            yMin <= 0 &&
            yMax >= 0
        ) {

            const zeroY =
                getCanvasY(
                    0,
                    yMin,
                    yMax
                );


            ctx.beginPath();


            ctx.moveTo(
                0,
                zeroY
            );


            ctx.lineTo(
                canvas.width,
                zeroY
            );


            ctx.stroke();


            ctx.font =
                "14px Arial";


            ctx.fillText(
                "x",
                canvas.width - 12,
                zeroY - 8
            );

        }


        ctx.fillStyle =
            "#a9bdd1";


        ctx.font =
            "12px Arial";


        // X NUMBERS

        if (
            yMin <= 0 &&
            yMax >= 0
        ) {

            const zeroY =
                getCanvasY(
                    0,
                    yMin,
                    yMax
                );


            for (
                let x =
                    Math.ceil(
                        xMin / xStep
                    ) * xStep;

                x <=
                    xMax +
                    xStep * 0.001;

                x += xStep
            ) {

                if (
                    Math.abs(x) < 1e-8
                ) {

                    continue;

                }


                ctx.fillText(

                    formatAxisNumber(
                        x
                    ),

                    getCanvasX(
                        x,
                        xMin,
                        xMax
                    ) + 4,

                    zeroY + 17

                );

            }

        }


        // Y NUMBERS

        if (
            xMin <= 0 &&
            xMax >= 0
        ) {

            const zeroX =
                getCanvasX(
                    0,
                    xMin,
                    xMax
                );


            for (
                let y =
                    Math.ceil(
                        yMin / yStep
                    ) * yStep;

                y <=
                    yMax +
                    yStep * 0.001;

                y += yStep
            ) {

                if (
                    Math.abs(y) < 1e-8
                ) {

                    continue;

                }


                ctx.fillText(

                    formatAxisNumber(
                        y
                    ),

                    zeroX + 7,

                    getCanvasY(
                        y,
                        yMin,
                        yMax
                    ) - 5

                );

            }

        }


        ctx.restore();

    }

}


// ==========================================
// LEGEND
// ==========================================

function drawGraphLegend(
    text,
    index = 0
) {

    if (
        !ctx ||
        !window
            .calcuraGraphSettings
            .showLegend
    ) {

        return;

    }


    ctx.save();


    const color =
        getLineColor();


    const legendX = 18;


    const legendY =
        22 +
        index * 24;


    ctx.setLineDash([]);


    ctx.strokeStyle =
        color;


    ctx.lineWidth = 3;


    ctx.shadowColor =
        color;


    ctx.shadowBlur = 6;


    ctx.beginPath();


    ctx.moveTo(
        legendX,
        legendY
    );


    ctx.lineTo(
        legendX + 28,
        legendY
    );


    ctx.stroke();


    ctx.shadowBlur = 0;


    ctx.fillStyle =
        "#dce9f7";


    ctx.font =
        "13px Arial";


    ctx.fillText(
        text,
        legendX + 40,
        legendY + 4
    );


    ctx.restore();

}


// ==========================================
// FUNCTION GRAPH
// ==========================================

function drawFunction(
    expression,
    xMin,
    xMax,
    yMin,
    yMax,
    functionIndex = 0
) {

    if (!ctx) {

        return;

    }


    const points =
        Math.max(
            600,
            Math.min(
                1600,
                Math.floor(
                    canvas.width * 1.2
                )
            )
        );


    let previousPoint = null;


    const color =
        getLineColor();


    const width =
        getLineWidth();


    const showPoints =
        window
            .calcuraGraphSettings
            .showPoints;


    ctx.save();


    applyCanvasLineStyle();


    ctx.lineWidth =
        width;


    ctx.strokeStyle =
        color;


    ctx.shadowColor =
        color;


    ctx.shadowBlur = 7;


    ctx.beginPath();


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const x =
            xMin +
            (i / points) *
            (xMax - xMin);


        let y;


        try {

            y =
                evaluateFunction(
                    expression,
                    x
                );

        }

        catch {

            previousPoint =
                null;

            continue;

        }


        if (
            !Number.isFinite(y)
        ) {

            previousPoint =
                null;

            continue;

        }


        if (
            Math.abs(y) >
            Math.max(
                10000,
                Math.abs(
                    yMin - yMax
                ) * 1000
            )
        ) {

            previousPoint =
                null;

            continue;

        }


        const canvasX =
            getCanvasX(
                x,
                xMin,
                xMax
            );


        const canvasY =
            getCanvasY(
                y,
                yMin,
                yMax
            );


        // Break at asymptotes

        if (previousPoint) {

            const jump =
                Math.abs(
                    canvasY -
                    previousPoint.y
                );


            if (
                jump >
                canvas.height * 1.5
            ) {

                previousPoint =
                    null;

            }

        }


        if (
            !previousPoint
        ) {

            ctx.moveTo(
                canvasX,
                canvasY
            );

        }

        else {

            ctx.lineTo(
                canvasX,
                canvasY
            );

        }


        if (
            showPoints &&
            i % 25 === 0
        ) {

            ctx.save();


            ctx.setLineDash([]);


            ctx.fillStyle =
                color;


            ctx.shadowColor =
                color;


            ctx.shadowBlur = 5;


            ctx.beginPath();


            ctx.arc(
                canvasX,
                canvasY,
                3,
                0,
                Math.PI * 2
            );


            ctx.fill();


            ctx.restore();

        }


        previousPoint = {

            x: canvasX,

            y: canvasY

        };

    }


    ctx.stroke();


    ctx.restore();


    drawGraphLegend(
        `y = ${expression}`,
        functionIndex
    );

}


// ==========================================
// EQUATION SPLIT
// ==========================================

function splitEquation(
    expression
) {

    const parts =
        String(expression)
            .split("=");


    if (
        parts.length !== 2
    ) {

        throw new Error(
            "Use one = sign"
        );

    }


    return [

        parts[0].trim(),

        parts[1].trim()

    ];

}


// ==========================================
// IMPLICIT EQUATION
// ==========================================

function evaluateImplicitEquation(
    left,
    right,
    x,
    y
) {

    return (

        evaluateGraphExpression(
            left,
            { x, y }
        )

        -

        evaluateGraphExpression(
            right,
            { x, y }
        )

    );

}


// ==========================================
// y = f(x)
// ==========================================

function drawExplicitYEquation(
    rhs,
    xMin,
    xMax,
    yMin,
    yMax
) {

    drawFunction(
        rhs,
        xMin,
        xMax,
        yMin,
        yMax,
        0
    );

}


// ==========================================
// x = f(y)
// ==========================================

function drawExplicitXEquation(
    rhs,
    xMin,
    xMax,
    yMin,
    yMax
) {

    const color =
        getLineColor();


    const width =
        getLineWidth();


    ctx.save();


    applyCanvasLineStyle();


    ctx.lineWidth =
        width;


    ctx.strokeStyle =
        color;


    ctx.shadowColor =
        color;


    ctx.shadowBlur = 7;


    ctx.beginPath();


    const points =
        Math.max(
            600,
            Math.min(
                1600,
                Math.floor(
                    canvas.height * 1.2
                )
            )
        );


    let previous = null;


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const y =
            yMin +
            (i / points) *
            (yMax - yMin);


        let x;


        try {

            x =
                evaluateGraphExpression(
                    rhs,
                    { y }
                );

        }

        catch {

            previous = null;

            continue;

        }


        if (
            !Number.isFinite(x) ||
            x < xMin ||
            x > xMax
        ) {

            previous = null;

            continue;

        }


        const px =
            getCanvasX(
                x,
                xMin,
                xMax
            );


        const py =
            getCanvasY(
                y,
                yMin,
                yMax
            );


        if (!previous) {

            ctx.moveTo(
                px,
                py
            );

        }

        else {

            ctx.lineTo(
                px,
                py
            );

        }


        previous = {

            x: px,

            y: py

        };

    }


    ctx.stroke();


    ctx.restore();


    drawGraphLegend(
        `x = ${rhs}`
    );

}


// ==========================================
// IMPLICIT GRAPH
// x²+y²=25
// ==========================================

function drawImplicitGraph(
    equation,
    xMin,
    xMax,
    yMin,
    yMax
) {

    const [
        left,
        right
    ] =
        splitEquation(
            equation
        );


    // y = f(x)

    if (
        left === "y"
    ) {

        drawExplicitYEquation(
            right,
            xMin,
            xMax,
            yMin,
            yMax
        );

        return;

    }


    if (
        right === "y"
    ) {

        drawExplicitYEquation(
            left,
            xMin,
            xMax,
            yMin,
            yMax
        );

        return;

    }


    // x = f(y)

    if (
        left === "x"
    ) {

        drawExplicitXEquation(
            right,
            xMin,
            xMax,
            yMin,
            yMax
        );

        return;

    }


    if (
        right === "x"
    ) {

        drawExplicitXEquation(
            left,
            xMin,
            xMax,
            yMin,
            yMax
        );

        return;

    }


    // Full implicit equation

    const columns = 180;

    const rows = 180;


    const dx =
        (xMax - xMin) /
        columns;


    const dy =
        (yMax - yMin) /
        rows;


    const values =
        Array.from(

            {
                length:
                    rows + 1
            },

            () =>
                new Float64Array(
                    columns + 1
                )

        );


    // Calculate grid values

    for (
        let row = 0;
        row <= rows;
        row++
    ) {

        const y =
            yMin +
            row * dy;


        for (
            let col = 0;
            col <= columns;
            col++
        ) {

            const x =
                xMin +
                col * dx;


            try {

                const value =
                    evaluateImplicitEquation(
                        left,
                        right,
                        x,
                        y
                    );


                values[row][col] =
                    Number.isFinite(value)
                        ? value
                        : NaN;

            }

            catch {

                values[row][col] =
                    NaN;

            }

        }

    }


    function edgePoint(
        x1,
        y1,
        v1,
        x2,
        y2,
        v2
    ) {

        if (
            !Number.isFinite(v1) ||
            !Number.isFinite(v2)
        ) {

            return null;

        }


        if (
            Math.abs(v1) <
            1e-12
        ) {

            return {
                x: x1,
                y: y1
            };

        }


        if (
            Math.abs(v2) <
            1e-12
        ) {

            return {
                x: x2,
                y: y2
            };

        }


        if (
            (
                v1 < 0 &&
                v2 > 0
            )
            ||
            (
                v1 > 0 &&
                v2 < 0
            )
        ) {

            const t =
                v1 /
                (v1 - v2);


            return {

                x:
                    x1 +
                    (x2 - x1) * t,

                y:
                    y1 +
                    (y2 - y1) * t

            };

        }


        return null;

    }


    ctx.save();


    applyCanvasLineStyle();


    ctx.lineWidth =
        getLineWidth();


    ctx.strokeStyle =
        getLineColor();


    ctx.shadowColor =
        getLineColor();


    ctx.shadowBlur = 6;


    ctx.beginPath();


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        const y0 =
            yMin +
            row * dy;


        const y1 =
            y0 + dy;


        for (
            let col = 0;
            col < columns;
            col++
        ) {

            const x0 =
                xMin +
                col * dx;


            const x1 =
                x0 + dx;


            const v00 =
                values[row][col];


            const v10 =
                values[row][col + 1];


            const v11 =
                values[row + 1][col + 1];


            const v01 =
                values[row + 1][col];


            const edges = [

                edgePoint(
                    x0,
                    y0,
                    v00,
                    x1,
                    y0,
                    v10
                ),

                edgePoint(
                    x1,
                    y0,
                    v10,
                    x1,
                    y1,
                    v11
                ),

                edgePoint(
                    x1,
                    y1,
                    v11,
                    x0,
                    y1,
                    v01
                ),

                edgePoint(
                    x0,
                    y1,
                    v01,
                    x0,
                    y0,
                    v00
                )

            ].filter(Boolean);


            const unique = [];


            for (
                const p of edges
            ) {

                if (
                    !unique.some(
                        q =>

                            Math.abs(
                                p.x - q.x
                            ) <
                            dx * 1e-6

                            &&

                            Math.abs(
                                p.y - q.y
                            ) <
                            dy * 1e-6
                    )
                ) {

                    unique.push(p);

                }

            }


            if (
                unique.length === 2
            ) {

                ctx.moveTo(

                    getCanvasX(
                        unique[0].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[0].y,
                        yMin,
                        yMax
                    )

                );


                ctx.lineTo(

                    getCanvasX(
                        unique[1].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[1].y,
                        yMin,
                        yMax
                    )

                );

            }


            else if (
                unique.length === 4
            ) {

                ctx.moveTo(

                    getCanvasX(
                        unique[0].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[0].y,
                        yMin,
                        yMax
                    )

                );


                ctx.lineTo(

                    getCanvasX(
                        unique[1].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[1].y,
                        yMin,
                        yMax
                    )

                );


                ctx.moveTo(

                    getCanvasX(
                        unique[2].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[2].y,
                        yMin,
                        yMax
                    )

                );


                ctx.lineTo(

                    getCanvasX(
                        unique[3].x,
                        xMin,
                        xMax
                    ),

                    getCanvasY(
                        unique[3].y,
                        yMin,
                        yMax
                    )

                );

            }

        }

    }


    ctx.stroke();


    ctx.restore();


    drawGraphLegend(
        equation
    );

}


// ==========================================
// PARAMETRIC GRAPH
// ==========================================

function drawParametricGraph(
    xExpression,
    yExpression,
    tMin,
    tMax,
    xMin,
    xMax,
    yMin,
    yMax
) {

    ctx.save();


    applyCanvasLineStyle();


    ctx.lineWidth =
        getLineWidth();


    ctx.strokeStyle =
        getLineColor();


    ctx.shadowColor =
        getLineColor();


    ctx.shadowBlur = 7;


    ctx.beginPath();


    const points =
        Math.max(
            800,
            Math.min(
                2200,
                Math.floor(
                    canvas.width * 1.6
                )
            )
        );


    let previous = null;


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const t =
            tMin +
            (i / points) *
            (tMax - tMin);


        let x;
        let y;


        try {

            x =
                evaluateParametricFunction(
                    xExpression,
                    t
                );


            y =
                evaluateParametricFunction(
                    yExpression,
                    t
                );

        }

        catch {

            previous = null;

            continue;

        }


        if (
            !Number.isFinite(x) ||
            !Number.isFinite(y)
        ) {

            previous = null;

            continue;

        }


        if (
            x < xMin ||
            x > xMax ||
            y < yMin ||
            y > yMax
        ) {

            previous = null;

            continue;

        }


        const px =
            getCanvasX(
                x,
                xMin,
                xMax
            );


        const py =
            getCanvasY(
                y,
                yMin,
                yMax
            );


        if (previous) {

            const jump =
                Math.hypot(

                    px -
                    previous.x,

                    py -
                    previous.y

                );


            if (
                jump >
                Math.max(
                    canvas.width,
                    canvas.height
                ) * 0.2
            ) {

                previous = null;

            }

        }


        if (!previous) {

            ctx.moveTo(
                px,
                py
            );

        }

        else {

            ctx.lineTo(
                px,
                py
            );

        }


        previous = {

            x: px,

            y: py

        };

    }


    ctx.stroke();


    ctx.restore();


    drawGraphLegend(

        `x(t)=${xExpression}, y(t)=${yExpression}`

    );

}


// ==========================================
// POLAR GRID
// ==========================================

function drawPolarGrid() {

    if (!ctx) return;


    const centerX =
        canvas.width / 2;


    const centerY =
        canvas.height / 2;


    const radius =
        Math.min(
            canvas.width,
            canvas.height
        ) * 0.46;


    // GRID

    if (
        window
            .calcuraGraphSettings
            .showGrid
    ) {

        ctx.save();


        ctx.strokeStyle =
            "rgba(120,155,190,0.22)";


        ctx.lineWidth = 1;


        ctx.setLineDash(
            [4, 4]
        );


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            ctx.beginPath();


            ctx.arc(

                centerX,

                centerY,

                (radius * i) / 5,

                0,

                Math.PI * 2

            );


            ctx.stroke();

        }


        for (
            let i = 0;
            i < 12;
            i++
        ) {

            const angle =
                (i / 12) *
                Math.PI * 2;


            ctx.beginPath();


            ctx.moveTo(
                centerX,
                centerY
            );


            ctx.lineTo(

                centerX +
                Math.cos(angle) *
                radius,

                centerY -
                Math.sin(angle) *
                radius

            );


            ctx.stroke();

        }


        ctx.restore();

    }


    // AXES

    if (
        window
            .calcuraGraphSettings
            .showAxes
    ) {

        ctx.save();


        ctx.strokeStyle =
            "#dce9f7";


        ctx.lineWidth = 2;


        ctx.setLineDash([]);


        ctx.beginPath();


        ctx.moveTo(

            centerX,

            centerY - radius

        );


        ctx.lineTo(

            centerX,

            centerY + radius

        );


        ctx.moveTo(

            centerX - radius,

            centerY

        );


        ctx.lineTo(

            centerX + radius,

            centerY

        );


        ctx.stroke();


        ctx.restore();

    }

}


// ==========================================
// POLAR CURVE
// ==========================================

function drawPolarCurve(
    expression,
    radiusPower = 1,
    sign = 1
) {

    const centerX =
        canvas.width / 2;


    const centerY =
        canvas.height / 2;


    const scale =
        (
            Math.min(
                canvas.width,
                canvas.height
            ) * 0.46
        ) / 5;


    const points = 1400;


    ctx.save();


    applyCanvasLineStyle();


    ctx.lineWidth =
        getLineWidth();


    ctx.strokeStyle =
        getLineColor();


    ctx.shadowColor =
        getLineColor();


    ctx.shadowBlur = 7;


    ctx.beginPath();


    let previous = null;


    for (
        let i = 0;
        i <= points;
        i++
    ) {

        const t =
            (i / points) *
            Math.PI * 2;


        let r;


        try {

            const value =
                evaluateGraphExpression(
                    expression,
                    { t }
                );


            if (
                radiusPower === 2
            ) {

                if (
                    value < 0
                ) {

                    previous = null;

                    continue;

                }


                r =
                    sign *
                    Math.sqrt(
                        value
                    );

            }


            else if (
                radiusPower === 3
            ) {

                r =
                    Math.cbrt(
                        value
                    );

            }


            else {

                r =
                    value;

            }

        }

        catch {

            previous = null;

            continue;

        }


        if (
            !Number.isFinite(r) ||
            Math.abs(r) > 1000
        ) {

            previous = null;

            continue;

        }


        const x =
            r *
            Math.cos(t);


        const y =
            r *
            Math.sin(t);


        const px =
            centerX +
            x * scale;


        const py =
            centerY -
            y * scale;


        if (
            px < -canvas.width ||
            px > canvas.width * 2 ||
            py < -canvas.height ||
            py > canvas.height * 2
        ) {

            previous = null;

            continue;

        }


        if (!previous) {

            ctx.moveTo(
                px,
                py
            );

        }

        else {

            ctx.lineTo(
                px,
                py
            );

        }


        previous = {

            x: px,

            y: py

        };

    }


    ctx.stroke();


    ctx.restore();

}


// ==========================================
// POLAR GRAPH
// ==========================================

function drawPolarGraph(
    expression
) {

    if (!ctx) return;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#020d1a";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // θ aliases

    let rhs =
        expression
            .trim()
            .replace(/θ/g, "t")
            .replace(
                /\btheta\b/gi,
                "t"
            );


    let power = 1;


    let title =
        `r = ${expression}`;


    if (
        rhs.includes("=")
    ) {

        const [
            left,
            right
        ] =
            splitEquation(rhs);


        const normalizedLeft =
            left.replace(
                /\s+/g,
                ""
            );


        rhs = right;


        // r² = f(t)

        if (
            normalizedLeft === "r2" ||
            normalizedLeft === "r^2"
        ) {

            power = 2;

            title =
                `${left} = ${right}`;

        }


        // r³ = f(t)

        else if (
            normalizedLeft === "r3" ||
            normalizedLeft === "r^3"
        ) {

            power = 3;

            title =
                `${left} = ${right}`;

        }


        // r = f(t)

        else if (
            normalizedLeft === "r"
        ) {

            title =
                `r = ${right}`;

        }

    }


    drawPolarGrid();


    if (
        power === 2
    ) {

        drawPolarCurve(
            rhs,
            2,
            1
        );


        drawPolarCurve(
            rhs,
            2,
            -1
        );

    }

    else {

        drawPolarCurve(
            rhs,
            power,
            1
        );

    }


    drawGraphLegend(
        title
    );


    setGraphTitle(
        `Polar: ${title}`
    );


    setGraphStatus(
        `Polar graph plotted: ${title}`
    );

}


// ==========================================
// 3D DOMAIN
// ==========================================

function get3DDomain() {

    let xMin =
        numberOr(
            xMinInput?.value,
            -3
        );


    let xMax =
        numberOr(
            xMaxInput?.value,
            3
        );


    let yMin =
        numberOr(
            yMinInput?.value,
            -3
        );


    let yMax =
        numberOr(
            yMaxInput?.value,
            3
        );


    if (
        xMin === -10 &&
        xMax === 10
    ) {

        xMin = -3;
        xMax = 3;

    }


    if (
        yMin === -10 &&
        yMax === 10
    ) {

        yMin = -3;
        yMax = 3;

    }


    const maxSpan = 10;


    if (
        xMax - xMin >
        maxSpan
    ) {

        const c =
            (xMin + xMax) /
            2;


        xMin =
            c -
            maxSpan / 2;


        xMax =
            c +
            maxSpan / 2;

    }


    if (
        yMax - yMin >
        maxSpan
    ) {

        const c =
            (yMin + yMax) /
            2;


        yMin =
            c -
            maxSpan / 2;


        yMax =
            c +
            maxSpan / 2;

    }


    return {

        xMin,
        xMax,
        yMin,
        yMax

    };

}


// ==========================================
// 3D GRAPH
// ==========================================

function draw3DGraph(
    expression
) {

    if (!ctx) return;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    ctx.fillStyle =
        "#020f1d";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    const domain =
        get3DDomain();


    const xMin =
        domain.xMin;


    const xMax =
        domain.xMax;


    const yMin =
        domain.yMin;


    const yMax =
        domain.yMax;


    const gridSize = 30;


    const centerX =
        canvas.width / 2;


    const centerY =
        canvas.height / 2 +
        20;


    const scale =
        Math.min(
            canvas.width,
            canvas.height
        )
        /
        Math.max(
            7,
            Math.max(
                xMax - xMin,
                yMax - yMin
            ) * 1.3
        );


    const points = [];


    // CALCULATE SURFACE

    for (
        let i = 0;
        i <= gridSize;
        i++
    ) {

        const row = [];


        const x =
            xMin +
            (i / gridSize) *
            (xMax - xMin);


        for (
            let j = 0;
            j <= gridSize;
            j++
        ) {

            const y =
                yMin +
                (j / gridSize) *
                (yMax - yMin);


            let z = 0;


            try {

                z =
                    evaluate3DExpression(
                        expression,
                        x,
                        y
                    );

            }

            catch {

                z = 0;

            }


            if (
                !Number.isFinite(z)
            ) {

                z = 0;

            }


            z =
                Math.max(
                    -20,
                    Math.min(
                        20,
                        z
                    )
                );


            row.push({

                x,
                y,
                z

            });

        }


        points.push(row);

    }


    function project(
        point
    ) {

        return {

            x:
                centerX +
                (
                    point.x -
                    point.y
                ) *
                scale *
                0.8,


            y:
                centerY +
                (
                    point.x +
                    point.y
                ) *
                scale *
                0.30 -

                point.z *
                scale *
                0.20

        };

    }


    // GROUND GRID

    if (
        window
            .calcuraGraphSettings
            .showGrid
    ) {

        ctx.save();


        ctx.strokeStyle =
            "rgba(120,155,190,0.25)";


        ctx.lineWidth = 1;


        ctx.setLineDash(
            [3, 4]
        );


        for (
            let i = 0;
            i <= gridSize;
            i += 3
        ) {

            ctx.beginPath();


            for (
                let j = 0;
                j <= gridSize;
                j++
            ) {

                const p =
                    project({

                        x:
                            xMin +
                            (i / gridSize) *
                            (xMax - xMin),

                        y:
                            yMin +
                            (j / gridSize) *
                            (yMax - yMin),

                        z: 0

                    });


                if (
                    j === 0
                ) {

                    ctx.moveTo(
                        p.x,
                        p.y
                    );

                }

                else {

                    ctx.lineTo(
                        p.x,
                        p.y
                    );

                }

            }


            ctx.stroke();

        }


        for (
            let j = 0;
            j <= gridSize;
            j += 3
        ) {

            ctx.beginPath();


            for (
                let i = 0;
                i <= gridSize;
                i++
            ) {

                const p =
                    project({

                        x:
                            xMin +
                            (i / gridSize) *
                            (xMax - xMin),

                        y:
                            yMin +
                            (j / gridSize) *
                            (yMax - yMin),

                        z: 0

                    });


                if (
                    i === 0
                ) {

                    ctx.moveTo(
                        p.x,
                        p.y
                    );

                }

                else {

                    ctx.lineTo(
                        p.x,
                        p.y
                    );

                }

            }


            ctx.stroke();

        }


        ctx.restore();

    }


    // SURFACE

    ctx.save();


    ctx.lineWidth =
        Math.max(
            1,
            getLineWidth() *
            0.55
        );


    ctx.strokeStyle =
        getLineColor();


    ctx.shadowColor =
        getLineColor();


    ctx.shadowBlur = 4;


    ctx.setLineDash([]);


    for (
        let i = 0;
        i <= gridSize;
        i++
    ) {

        ctx.beginPath();


        for (
            let j = 0;
            j <= gridSize;
            j++
        ) {

            const p =
                project(
                    points[i][j]
                );


            if (
                j === 0
            ) {

                ctx.moveTo(
                    p.x,
                    p.y
                );

            }

            else {

                ctx.lineTo(
                    p.x,
                    p.y
                );

            }

        }


        ctx.stroke();

    }


    for (
        let j = 0;
        j <= gridSize;
        j++
    ) {

        ctx.beginPath();


        for (
            let i = 0;
            i <= gridSize;
            i++
        ) {

            const p =
                project(
                    points[i][j]
                );


            if (
                i === 0
            ) {

                ctx.moveTo(
                    p.x,
                    p.y
                );

            }

            else {

                ctx.lineTo(
                    p.x,
                    p.y
                );

            }

        }


        ctx.stroke();

    }


    ctx.restore();


    // 3D AXES

    if (
        window
            .calcuraGraphSettings
            .showAxes
    ) {

        ctx.save();


        ctx.strokeStyle =
            "#dce9f7";


        ctx.lineWidth = 2;


        ctx.setLineDash([]);


        const origin =
            project({

                x: 0,
                y: 0,
                z: 0

            });


        const axis =
            Math.max(
                Math.abs(xMin),
                Math.abs(xMax),
                Math.abs(yMin),
                Math.abs(yMax)
            );


        const xAxis =
            project({

                x: axis,
                y: 0,
                z: 0

            });


        const yAxis =
            project({

                x: 0,
                y: axis,
                z: 0

            });


        const zAxis =
            project({

                x: 0,
                y: 0,
                z: 2

            });


        ctx.beginPath();


        ctx.moveTo(
            origin.x,
            origin.y
        );


        ctx.lineTo(
            xAxis.x,
            xAxis.y
        );


        ctx.moveTo(
            origin.x,
            origin.y
        );


        ctx.lineTo(
            yAxis.x,
            yAxis.y
        );


        ctx.moveTo(
            origin.x,
            origin.y
        );


        ctx.lineTo(
            zAxis.x,
            zAxis.y
        );


        ctx.stroke();


        ctx.font =
            "14px Arial";


        ctx.fillText(
            "x",
            xAxis.x,
            xAxis.y
        );


        ctx.fillText(
            "y",
            yAxis.x,
            yAxis.y
        );


        ctx.fillText(
            "z",
            zAxis.x,
            zAxis.y
        );


        ctx.restore();

    }


    drawGraphLegend(
        `z = ${expression}`
    );


    setGraphTitle(
        `3D: z = ${expression}`
    );


    setGraphStatus(
        `3D graph plotted: z = ${expression}`
    );

}


// ==========================================
// INPUT AREAS
// ==========================================

const graphModeTabs =
    document.querySelectorAll(
        ".graph-mode-tab"
    );


const functionInputArea =
    document.querySelector(
        ".graph-input-area"
    );


const parametricInputArea =
    document.getElementById(
        "parametricInputArea"
    );


const polarInputArea =
    document.getElementById(
        "polarInputArea"
    );


const graph3DInputArea =
    document.getElementById(
        "graph3DInputArea"
    );


function showInputArea(
    mode
) {

    if (
        functionInputArea
    ) {

        functionInputArea.style.display =
            mode === "function"
                ? "block"
                : "none";

    }


    if (
        parametricInputArea
    ) {

        parametricInputArea.style.display =
            mode === "parametric"
                ? "block"
                : "none";

    }


    if (
        polarInputArea
    ) {

        polarInputArea.style.display =
            mode === "polar"
                ? "block"
                : "none";

    }


    if (
        graph3DInputArea
    ) {

        graph3DInputArea.style.display =
            mode === "3d"
                ? "block"
                : "none";

    }

}


// ==========================================
// RANGE
// ==========================================

function getRanges() {

    const xMin =
        numberOr(
            xMinInput?.value,
            -10
        );


    const xMax =
        numberOr(
            xMaxInput?.value,
            10
        );


    const yMin =
        numberOr(
            yMinInput?.value,
            -10
        );


    const yMax =
        numberOr(
            yMaxInput?.value,
            10
        );


    if (
        xMin >= xMax ||
        yMin >= yMax
    ) {

        throw new Error(
            "Invalid graph range"
        );

    }


    return {

        xMin,
        xMax,
        yMin,
        yMax

    };

}


// ==========================================
// SAVE LAST GRAPH
// ==========================================

function rememberPlotState(
    state
) {

    lastPlotState =
        {
            ...state
        };

}


// ==========================================
// FUNCTION PLOT
// ==========================================

function plotFunctionMode() {

    const expression =
        functionInput?.value.trim() ||
        "";


    let range;


    try {

        range =
            getRanges();

    }

    catch {

        setGraphStatus(
            "Please enter valid graph ranges."
        );

        return;

    }


    drawGrid(

        range.xMin,
        range.xMax,
        range.yMin,
        range.yMax

    );


    if (!expression) {

        setGraphTitle(
            "Graph of y = f(x)"
        );


        setGraphStatus(
            "Enter a function and click Plot Graph."
        );


        lastPlotState = null;

        return;

    }


    const expressions =
        window
            .calcuraGraphSettings
            .multipleFunctions

            ?

        splitTopLevelExpressions(
            expression
        )

            :

        [expression];


    try {

        expressions.forEach(
            (item, index) => {

                if (
                    item.includes("=")
                ) {

                    drawImplicitGraph(

                        item,

                        range.xMin,
                        range.xMax,

                        range.yMin,
                        range.yMax

                    );

                }

                else {

                    drawFunction(

                        item,

                        range.xMin,
                        range.xMax,

                        range.yMin,
                        range.yMax,

                        index

                    );

                }

            }
        );


        setGraphTitle(
            `Graph of y = ${expression}`
        );


        setGraphStatus(

            expressions.length > 1

                ? `${expressions.length} functions plotted.`

                : `Graph plotted: y = ${expression}`

        );


        rememberPlotState({

            mode: "function",

            expression

        });

    }

    catch (error) {

        console.error(
            "Function graph error:",
            error
        );


        setGraphStatus(
            "Unable to plot this function."
        );

    }

}


// ==========================================
// PARAMETRIC PLOT
// ==========================================

function plotParametricMode() {

    const rawXExpression =
        document
            .getElementById(
                "parametricXInput"
            )
            ?.value.trim() || "";


    const rawYExpression =
        document
            .getElementById(
                "parametricYInput"
            )
            ?.value.trim() || "";


    const xExpression =
        extractAssignedExpression(
            rawXExpression,
            "x"
        );


    const yExpression =
        extractAssignedExpression(
            rawYExpression,
            "y"
        );


    if (
        !xExpression ||
        !yExpression
    ) {

        setGraphStatus(
            "Please enter both x(t) and y(t)."
        );

        return;

    }


    let range;


    try {

        range =
            getRanges();

    }

    catch {

        setGraphStatus(
            "Please enter valid graph ranges."
        );

        return;

    }


    let drawXMin =
        range.xMin;


    let drawXMax =
        range.xMax;


    let drawYMin =
        range.yMin;


    let drawYMax =
        range.yMax;


    // Better default for circle

    if (

        range.xMin === -10 &&

        range.xMax === 10 &&

        range.yMin === -10 &&

        range.yMax === 10

    ) {

        drawXMin = -2;

        drawXMax = 2;

        drawYMin = -2;

        drawYMax = 2;

    }


    drawGrid(

        drawXMin,
        drawXMax,

        drawYMin,
        drawYMax

    );


    try {

        drawParametricGraph(

            xExpression,

            yExpression,

            -2 * Math.PI,

            2 * Math.PI,

            drawXMin,
            drawXMax,

            drawYMin,
            drawYMax

        );


        setGraphTitle(
            "Parametric Graph"
        );


        setGraphStatus(

            `Parametric graph plotted: x(t) = ${xExpression}, y(t) = ${yExpression}`

        );


        rememberPlotState({

            mode: "parametric",

            xExpression,

            yExpression

        });

    }

    catch (error) {

        console.error(
            "Parametric graph error:",
            error
        );


        setGraphStatus(
            "Unable to plot this parametric graph."
        );

    }

}


// ==========================================
// POLAR PLOT
// ==========================================

function plotPolarMode() {

    const expression =
        document
            .getElementById(
                "polarInput"
            )
            ?.value.trim() || "";


    if (!expression) {

        setGraphStatus(
            "Please enter a polar equation."
        );

        return;

    }


    try {

        drawPolarGraph(
            expression
        );


        rememberPlotState({

            mode: "polar",

            expression

        });

    }

    catch (error) {

        console.error(
            "Polar graph error:",
            error
        );


        setGraphStatus(
            "Unable to plot this polar graph."
        );

    }

}


// ==========================================
// 3D PLOT
// ==========================================

function plot3DMode() {

    const expression =
        document
            .getElementById(
                "graph3DInput"
            )
            ?.value.trim() || "";


    if (!expression) {

        setGraphStatus(
            "Please enter a 3D function."
        );

        return;

    }


    const cleaned =
        /^z\s*=/i.test(
            expression
        )

            ?

        expression.replace(
            /^z\s*=\s*/i,
            ""
        )

            :

        expression;


    try {

        draw3DGraph(
            cleaned
        );


        rememberPlotState({

            mode: "3d",

            expression: cleaned

        });

    }

    catch (error) {

        console.error(
            "3D graph error:",
            error
        );


        setGraphStatus(
            "Unable to plot this 3D graph."
        );

    }

}


// ==========================================
// REDRAW CURRENT GRAPH
// ==========================================

function redrawCurrentGraph() {

    if (
        !ctx ||
        resizing
    ) {

        return;

    }


    try {

        if (
            currentGraphMode ===
            "function"
        ) {

            plotFunctionMode();

        }


        else if (
            currentGraphMode ===
            "parametric"
        ) {

            plotParametricMode();

        }


        else if (
            currentGraphMode ===
            "polar"
        ) {

            plotPolarMode();

        }


        else if (
            currentGraphMode ===
            "3d"
        ) {

            plot3DMode();

        }

    }

    catch (error) {

        console.error(
            "Graph redraw error:",
            error
        );

    }

}


// ==========================================
// MODE TABS
// ==========================================

graphModeTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                currentGraphMode =
                    tab.dataset.mode ||
                    "function";


                graphModeTabs.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                showInputArea(
                    currentGraphMode
                );


                if (
                    currentGraphMode ===
                    "function"
                ) {

                    setGraphTitle(
                        "Graph of y = f(x)"
                    );

                }


                if (
                    currentGraphMode ===
                    "parametric"
                ) {

                    setGraphTitle(
                        "Parametric Graph"
                    );

                }


                if (
                    currentGraphMode ===
                    "polar"
                ) {

                    setGraphTitle(
                        "Polar Graph"
                    );

                }


                if (
                    currentGraphMode ===
                    "3d"
                ) {

                    setGraphTitle(
                        "3D Graph"
                    );

                }

            }
        );

    }
);

// ==========================================
// SAVE PLOTTED GRAPH TO MONGODB
// ==========================================

async function savePlottedGraph() {
    try {
        const token = localStorage.getItem("calcuraToken");

        if (!token) {
            console.warn("Graph not saved: user is not logged in.");
            return;
        }

        if (!lastPlotState) {
            console.warn("Graph not saved: no plotted graph.");
            return;
        }

        const range = getRanges();

        let title = "Untitled Graph";

        let functionExpression = "";
        let parametricX = "";
        let parametricY = "";
        let polarExpression = "";
        let graph3DExpression = "";

        // FUNCTION
        if (lastPlotState.mode === "function") {
            functionExpression = lastPlotState.expression || "";
            title = `y = ${functionExpression}`;
        }

        // PARAMETRIC
        else if (lastPlotState.mode === "parametric") {
            parametricX = lastPlotState.xExpression || "";
            parametricY = lastPlotState.yExpression || "";

            title = `x(t) = ${parametricX}, y(t) = ${parametricY}`;
        }

        // POLAR
        else if (lastPlotState.mode === "polar") {
            polarExpression = lastPlotState.expression || "";

            title = `r = ${polarExpression}`;
        }

        // 3D
        else if (lastPlotState.mode === "3d") {
            graph3DExpression = lastPlotState.expression || "";

            title = `z = ${graph3DExpression}`;
        }

        const payload = {
            title: title
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 150),

            mode: lastPlotState.mode || "function",

            functionExpression: functionExpression,

            parametricX: parametricX,

            parametricY: parametricY,

            polarExpression: polarExpression,

            graph3DExpression: graph3DExpression,

            range: {
                xMin: range.xMin,
                xMax: range.xMax,
                yMin: range.yMin,
                yMax: range.yMax
            },

            settings: {
                showGrid:
                    window.calcuraGraphSettings?.showGrid ?? true,

                showAxes:
                    window.calcuraGraphSettings?.showAxes ?? true,

                multipleFunctions:
                    window.calcuraGraphSettings?.multipleFunctions ?? false,

                showLegend:
                    window.calcuraGraphSettings?.showLegend ?? true,

                showPoints:
                    window.calcuraGraphSettings?.showPoints ?? false,

                lineColor: getLineColor(),

                lineWidth: getLineWidth(),

                lineStyle: getLineStyle()
            }
        };

        const response = await fetch(
            "http://localhost:5000/api/graphs",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(payload)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to save graph"
            );
        }

        console.log(
            "Graph saved successfully:",
            data
        );

        return data;

    } catch (error) {
        console.error(
            "Graph database save error:",
            error
        );
    }
}
// ==========================================
// BUTTONS
// ==========================================

plotBtn?.addEventListener(
    "click",
    async () => {

        plotFunctionMode();

        if (lastPlotState) {
            await savePlottedGraph();
        }

    }
);


document
    .getElementById("parametricPlotBtn")
    ?.addEventListener(
        "click",
        async () => {

            plotParametricMode();

            if (lastPlotState) {
                await savePlottedGraph();
            }

        }
    );


document
    .getElementById("polarPlotBtn")
    ?.addEventListener(
        "click",
        async () => {

            plotPolarMode();

            if (lastPlotState) {
                await savePlottedGraph();
            }

        }
    );


document
    .getElementById("graph3DPlotBtn")
    ?.addEventListener(
        "click",
        async () => {

            plot3DMode();

            if (lastPlotState) {
                await savePlottedGraph();
            }

        }
    );

// ==========================================
// ENTER KEY
// ==========================================

functionInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
        ) {

            plotFunctionMode();

        }

    }
);


document
    .getElementById(
        "parametricXInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                plotParametricMode();

            }

        }
    );


document
    .getElementById(
        "parametricYInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                plotParametricMode();

            }

        }
    );


document
    .getElementById(
        "polarInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                plotPolarMode();

            }

        }
    );


document
    .getElementById(
        "graph3DInput"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                plot3DMode();

            }

        }
    );


// ==========================================
// RESIZE
// ==========================================

function resizeCanvas() {

    if (!canvas) return;


    const rect =
        canvas.getBoundingClientRect();


    const width =
        Math.max(
            1,
            Math.floor(
                rect.width
            )
        );


    const height =
        Math.max(
            1,
            Math.floor(
                rect.height
            )
        );


    resizing = true;


    canvas.width = width;

    canvas.height = height;


    resizing = false;


    if (lastPlotState) {

        setTimeout(
            () => {
                redrawCurrentGraph();
            },
            0
        );

    }

    else {

        try {

            const range =
                getRanges();


            drawGrid(

                range.xMin,
                range.xMax,

                range.yMin,
                range.yMax

            );

        }

        catch {

            drawGrid(
                -10,
                10,
                -10,
                10
            );

        }

    }

}


window.addEventListener(
    "resize",
    resizeCanvas
);


// ==========================================
// ZOOM
// ==========================================

function zoomGraph(
    factor
) {

    const range =
        getRanges();


    const xCenter =
        (range.xMin +
            range.xMax) / 2;


    const yCenter =
        (range.yMin +
            range.yMax) / 2;


    const xRange =
        (range.xMax -
            range.xMin) *
        factor;


    const yRange =
        (range.yMax -
            range.yMin) *
        factor;


    xMinInput.value =
        (
            xCenter -
            xRange / 2
        ).toFixed(2);


    xMaxInput.value =
        (
            xCenter +
            xRange / 2
        ).toFixed(2);


    yMinInput.value =
        (
            yCenter -
            yRange / 2
        ).toFixed(2);


    yMaxInput.value =
        (
            yCenter +
            yRange / 2
        ).toFixed(2);


    redrawCurrentGraph();

}


document
    .getElementById(
        "zoomInBtn"
    )
    ?.addEventListener(
        "click",
        () =>
            zoomGraph(0.75)
    );


document
    .getElementById(
        "zoomOutBtn"
    )
    ?.addEventListener(
        "click",
        () =>
            zoomGraph(1.33)
    );


// ==========================================
// RESET
// ==========================================

document
    .getElementById(
        "resetGraphBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            if (xMinInput)
                xMinInput.value = "-10";


            if (xMaxInput)
                xMaxInput.value = "10";


            if (yMinInput)
                yMinInput.value = "-10";


            if (yMaxInput)
                yMaxInput.value = "10";


            redrawCurrentGraph();

        }
    );


// ==========================================
// EXPORT
// ==========================================

document
    .getElementById(
        "exportGraphBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            try {

                const link =
                    document.createElement(
                        "a"
                    );


                link.download =
                    "calcura-graph.png";


                link.href =
                    canvas.toDataURL(
                        "image/png"
                    );


                link.click();


                setGraphStatus(
                    "Graph exported successfully."
                );

            }

            catch (error) {

                console.error(
                    "Export error:",
                    error
                );


                setGraphStatus(
                    "Unable to export graph."
                );

            }

        }
    );


// ==========================================
// FULL SCREEN
// ==========================================

const fullscreenGraphBtn =
    document.getElementById(
        "fullscreenGraphBtn"
    );


const graphCard =
    document.querySelector(
        ".graph-card"
    );


fullscreenGraphBtn?.addEventListener(
    "click",
    () => {

        if (!graphCard) return;


        const active =
            graphCard.classList.toggle(
                "graph-fullscreen"
            );


        fullscreenGraphBtn.innerHTML =
            active

                ?

            `
                <i class="fa-solid fa-compress"></i>
                <span>Exit Full Screen</span>
            `

                :

            `
                <i class="fa-solid fa-expand"></i>
                <span>Full Screen</span>
            `;


        setTimeout(
            () => {

                if (canvas) {

                    const rect =
                        canvas.getBoundingClientRect();


                    canvas.width =
                        Math.max(
                            1,
                            Math.floor(
                                rect.width
                            )
                        );


                    canvas.height =
                        Math.max(
                            1,
                            Math.floor(
                                rect.height
                            )
                        );

                }


                redrawCurrentGraph();

            },
            180
        );

    }
);


// ==========================================
// GRAPH SETTINGS
// ==========================================

function bindGraphOption(
    id,
    setting
) {

    const control =
        document.getElementById(
            id
        );


    if (!control) return;


    window
        .calcuraGraphSettings[
            setting
        ] =
        control.checked;


    control.addEventListener(
        "change",
        () => {

            window
                .calcuraGraphSettings[
                    setting
                ] =
                control.checked;


            redrawCurrentGraph();

        }
    );

}


bindGraphOption(
    "showGrid",
    "showGrid"
);


bindGraphOption(
    "showAxes",
    "showAxes"
);


bindGraphOption(
    "multipleFunctions",
    "multipleFunctions"
);


bindGraphOption(
    "showLegend",
    "showLegend"
);


bindGraphOption(
    "showPoints",
    "showPoints"
);


// ==========================================
// LINE STYLE
// ==========================================

document
    .getElementById(
        "lineStyle"
    )
    ?.addEventListener(
        "change",
        event => {

            window
                .calcuraGraphSettings
                .style =
                event.target.value;


            redrawCurrentGraph();

        }
    );


// ==========================================
// LINE WIDTH
// ==========================================

document
    .getElementById(
        "lineWidth"
    )
    ?.addEventListener(
        "input",
        event => {

            const value =
                Number(
                    event.target.value ||
                    3
                );


            const valueLabel =
                document.getElementById(
                    "lineWidthValue"
                );


            if (valueLabel) {

                valueLabel.textContent =
                    String(value);

            }


            redrawCurrentGraph();

        }
    );


// ==========================================
// LINE COLOR
// ==========================================

document
    .getElementById(
        "lineColor"
    )
    ?.addEventListener(
        "input",
        redrawCurrentGraph
    );


// ==========================================
// QUICK EXAMPLES
// ==========================================

document
    .querySelectorAll(
        ".quick-example-use"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const expression =
                        button
                            .closest(
                                ".quick-example-item"
                            )
                            ?.querySelector(
                                "span"
                            )
                            ?.textContent
                            ?.trim();


                    if (!expression)
                        return;


                    const functionTab =
                        document.querySelector(
                            '.graph-mode-tab[data-mode="function"]'
                        );


                    functionTab?.click();


                    if (
                        functionInput
                    ) {

                        functionInput.value =
                            expression;

                    }


                    plotFunctionMode();

                }
            );

        }
    );


// ==========================================
// NOTIFICATION
// ==========================================

const notificationButton =
    document.getElementById(
        "notificationButton"
    );


const notificationPanel =
    document.getElementById(
        "notificationPanel"
    );


if (
    notificationButton &&
    notificationPanel
) {

    notificationButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const isOpen =
                notificationPanel.style.display ===
                "block";


            notificationPanel.style.display =
                isOpen
                    ? "none"
                    : "block";

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (

                !notificationPanel
                    .contains(event.target)

                &&

                !notificationButton
                    .contains(event.target)

            ) {

                notificationPanel.style.display =
                    "none";

            }

        }
    );

}


// ==========================================
// USER PROFILE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const profileName =
            document.getElementById(
                "profileName"
            );


        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        try {

            if (
                typeof getSavedUser ===
                "function"
            ) {

                const savedUser =
                    getSavedUser();


                if (savedUser) {

                    const name =
                        savedUser.name ||
                        "User";


                    if (
                        profileName
                    ) {

                        profileName.textContent =
                            name;

                    }


                    if (
                        profileAvatar
                    ) {

                        profileAvatar.textContent =
                            name
                                .charAt(0)
                                .toUpperCase();

                    }

                }

            }


            if (
                typeof getCurrentUser ===
                "function"
            ) {

                const currentUser =
                    await getCurrentUser();


                const userData =
                    currentUser?.user ||
                    currentUser;


                if (
                    userData?.name
                ) {

                    if (
                        profileName
                    ) {

                        profileName.textContent =
                            userData.name;

                    }


                    if (
                        profileAvatar
                    ) {

                        profileAvatar.textContent =
                            userData.name
                                .charAt(0)
                                .toUpperCase();

                    }

                }

            }

        }

        catch (error) {

            console.error(
                "Graph user loading error:",
                error
            );

        }

    }
);


// ==========================================
// GLOBAL SEARCH
// ==========================================

const globalSearch =
    document.getElementById(
        "globalSearch"
    );


const searchSuggestions =
    document.getElementById(
        "searchSuggestions"
    );


const clearGlobalSearch =
    document.getElementById(
        "clearGlobalSearch"
    );


const searchItems = [

    [
        "Dashboard",
        "dashboard.html"
    ],

    [
        "Calculator",
        "calculator.html"
    ],

    [
        "Voice Input",
        "voice-input.html"
    ],

    [
        "Graph & Plot",
        "graph.html"
    ],

    [
        "Formula Library",
        "formulas.html"
    ],

    [
        "Unit Converter",
        "converter.html"
    ],

    [
        "History",
        "history.html"
    ],

    [
        "Saved Calculations",
        "saved.html"
    ],

    [
        "Settings",
        "settings.html"
    ],

    [
        "Profile",
        "profile.html"
    ],

    [
        "Help",
        "help.html"
    ],

    [
        "About",
        "about.html"
    ],

    [
        "Upgrade",
        "upgrade.html"
    ]

];


// ==========================================
// SEARCH SUGGESTIONS
// ==========================================

function updateSearchSuggestions() {

    if (
        !globalSearch ||
        !searchSuggestions
    ) {

        return;

    }


    const query =
        globalSearch.value
            .trim()
            .toLowerCase();


    searchSuggestions.innerHTML =
        "";


    if (!query) {

        searchSuggestions.style.display =
            "none";


        return;

    }


    const matches =
        searchItems.filter(
            ([name]) =>
                name
                    .toLowerCase()
                    .includes(
                        query
                    )
        );


    if (!matches.length) {

        searchSuggestions.innerHTML =
            `
                <div class="search-no-result">
                    No matching page found
                </div>
            `;


        searchSuggestions.style.display =
            "block";


        return;

    }


    matches.forEach(
        ([name, page]) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "search-suggestion-item";


            item.innerHTML =
                `
                    <span>
                        ${escapeHtml(name)}
                    </span>
                `;


            item.addEventListener(
                "click",
                () => {

                    window.location.href =
                        page;

                }
            );


            searchSuggestions.appendChild(
                item
            );

        }
    );


    searchSuggestions.style.display =
        "block";

}


globalSearch?.addEventListener(
    "input",
    updateSearchSuggestions
);


// ==========================================
// SEARCH ENTER
// ==========================================

globalSearch?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            if (
                searchSuggestions
            ) {

                searchSuggestions.style.display =
                    "none";

            }


            globalSearch.blur();


            return;

        }


        if (
            event.key !== "Enter"
        ) {

            return;

        }


        const query =
            globalSearch.value
                .trim()
                .toLowerCase();


        if (!query) return;


        const pages = {

            home:
                "dashboard.html",

            dashboard:
                "dashboard.html",

            voice:
                "voice-input.html",

            "voice input":
                "voice-input.html",

            "voice calculator":
                "voice-input.html",

            calculator:
                "calculator.html",

            graph:
                "graph.html",

            "graph plot":
                "graph.html",

            "graph & plot":
                "graph.html",

            formulas:
                "formulas.html",

            "formula library":
                "formulas.html",

            converter:
                "converter.html",

            "unit converter":
                "converter.html",

            history:
                "history.html",

            saved:
                "saved.html",

            "saved calculations":
                "saved.html",

            settings:
                "settings.html",

            profile:
                "profile.html",

            about:
                "about.html",

            help:
                "help.html",

            upgrade:
                "upgrade.html"

        };


        if (
            pages[query]
        ) {

            window.location.href =
                pages[query];


            return;

        }


        const match =
            Object.keys(pages)
                .find(
                    page =>
                        page.includes(
                            query
                        ) ||
                        query.includes(
                            page
                        )
                );


        if (match) {

            window.location.href =
                pages[match];

        }

        else {

            alert(
                "No matching page or tool found."
            );

        }

    }
);


// ==========================================
// CLOSE SEARCH
// ==========================================

document.addEventListener(
    "click",
    event => {

        if (
            !globalSearch ||
            !searchSuggestions
        ) {

            return;

        }


        if (

            !globalSearch
                .contains(event.target)

            &&

            !searchSuggestions
                .contains(event.target)

        ) {

            searchSuggestions.style.display =
                "none";

        }

    }
);


// ==========================================
// CLEAR SEARCH
// ==========================================

clearGlobalSearch?.addEventListener(
    "click",
    () => {

        if (globalSearch) {

            globalSearch.value =
                "";

        }


        if (
            searchSuggestions
        ) {

            searchSuggestions.innerHTML =
                "";


            searchSuggestions.style.display =
                "none";

        }


        clearGlobalSearch.style.display =
            "none";


        globalSearch?.focus();

    }
);


globalSearch?.addEventListener(
    "input",
    () => {

        if (
            clearGlobalSearch
        ) {

            clearGlobalSearch.style.display =

                globalSearch.value
                    .trim()

                    ?

                "flex"

                    :

                "none";

        }

    }
);


// ==========================================
// INITIALIZE
// ==========================================

showInputArea(
    currentGraphMode
);


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            requestAnimationFrame(
                resizeCanvas
            );

        }
    );

}

else {

    requestAnimationFrame(
        resizeCanvas
    );

}


// ==========================================
// PUBLIC API
// ==========================================

window.CalcuraGraph = {

    redraw:
        redrawCurrentGraph,

    plotFunction:
        plotFunctionMode,

    plotParametric:
        plotParametricMode,

    plotPolar:
        plotPolarMode,

    plot3D:
        plot3DMode,

    evaluate:
        evaluateGraphExpression

};