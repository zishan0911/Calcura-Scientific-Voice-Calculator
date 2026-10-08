const AIConversation = require("../models/AIConversation");
const User = require("../models/User");


/* =========================================================
   CALCURA LOCAL AI CONTROLLER
   =========================================================
   No OpenAI API
   No API Key

   Features:
   - Arithmetic
   - Percentage
   - Powers
   - Square roots
   - Trigonometry
   - Linear equations
   - Quadratic equations
   - Derivatives
   - Integrals
   - Limits
   - Chain rule
   - Product rule
   - Quotient rule
   - Unit conversion
   - Matrices
   - Eigenvalues
   - Taylor series
   - Maclaurin series
   - Graph/function explanation
   - Practice questions
   - Concept explanations
   - Conversation history
   ========================================================= */


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {
        return String(number);
    }

    if (Math.abs(number) < 0.0000000001) {
        number = 0;
    }

    return Number(
        number.toFixed(10)
    ).toString();
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanMessage(message) {

    return String(message || "")
        .trim()
        .replace(/\s+/g, " ");
}


/* =========================================================
   GET / CREATE CONVERSATION
   ========================================================= */

const getOrCreateConversation = async (
    userId,
    conversationId
) => {

    if (conversationId) {

        const conversation =
            await AIConversation.findOne({
                _id: conversationId,
                user: userId
            });

        if (conversation) {
            return conversation;
        }
    }

    return await AIConversation.create({

        user: userId,

        title: "New AI Chat",

        messages: []

    });
};


/* =========================================================
   SAFE EXPRESSION CALCULATOR
   ========================================================= */

function calculateExpression(expression) {

    let exp = String(expression)

        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/\^/g, "**")
        .replace(/π/gi, "Math.PI")
        .replace(/√/g, "Math.sqrt");


    /* -----------------------------------------
       WORD NORMALIZATION
       ----------------------------------------- */

    exp = exp

        .replace(/\bsquare root of\b/gi, "Math.sqrt")
        .replace(/\bsqrt\b/gi, "Math.sqrt")

        .replace(/\bsin\b/gi, "Math.sin")
        .replace(/\bcos\b/gi, "Math.cos")
        .replace(/\btan\b/gi, "Math.tan")

        .replace(/\blog10\b/gi, "Math.log10")
        .replace(/\blog\b/gi, "Math.log10")
        .replace(/\bln\b/gi, "Math.log")

        .replace(/\babs\b/gi, "Math.abs");


    /* -----------------------------------------
       REMOVE DEGREE SYMBOL
       ----------------------------------------- */

    exp = exp.replace(/°/g, "");


    /* -----------------------------------------
       SECURITY VALIDATION
       ----------------------------------------- */

    const allowed =
        /^[0-9+\-*/%().,\s_*A-Za-z]+$/;


    if (!allowed.test(exp)) {

        throw new Error(
            "Expression contains unsupported characters."
        );
    }


    const blockedWords = [

        "constructor",
        "prototype",
        "__proto__",
        "require",
        "process",
        "global",
        "globalThis",
        "window",
        "document",
        "eval",
        "Function",
        "fetch",
        "import",
        "module",
        "exports"

    ];


    for (const word of blockedWords) {

        if (
            exp
                .toLowerCase()
                .includes(word.toLowerCase())
        ) {

            throw new Error(
                "Unsupported expression."
            );
        }
    }


    try {

        const result =
            Function(
                `"use strict"; return (${exp})`
            )();


        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {

            throw new Error(
                "Invalid mathematical result."
            );
        }


        return result;

    }

    catch (error) {

        throw new Error(
            "Unable to calculate this expression."
        );
    }
}


/* =========================================================
   NORMALIZE MATHEMATICAL WORDS
   ========================================================= */

function normalizeMathWords(text) {

    return String(text)

        .replace(/\bx\s+square\b/gi, "x^2")
        .replace(/\bx\s+squared\b/gi, "x^2")

        .replace(/\bx\s+cube\b/gi, "x^3")
        .replace(/\bx\s+cubed\b/gi, "x^3")

        .replace(/\bsquare\s+root\s+of\b/gi, "sqrt")

        .replace(/\bplus\b/gi, "+")
        .replace(/\bminus\b/gi, "-")
        .replace(/\btimes\b/gi, "*")
        .replace(/\bmultiplied\s+by\b/gi, "*")
        .replace(/\bdivided\s+by\b/gi, "/")

        .replace(/\bto\s+the\s+power\s+of\b/gi, "^")

        .replace(/\bpi\b/gi, "π")

        .trim();
}


/* =========================================================
   ARITHMETIC
   ========================================================= */

function solveArithmetic(message) {

    let cleaned =
        normalizeMathWords(message)

            .toLowerCase()

            .replace(/\bwhat is\b/g, "")
            .replace(/\bcalculate\b/g, "")
            .replace(/\bsolve\b/g, "")
            .replace(/\bfind\b/g, "")
            .replace(/\banswer\b/g, "")
            .replace(/\?$/g, "")
            .trim();


    const mathPattern =
        /^[0-9+\-*/%().×÷−^π\s]+$/i;


    if (!mathPattern.test(cleaned)) {
        return null;
    }


    try {

        const result =
            calculateExpression(cleaned);


        return [

            "### Step-by-step solution",

            "",

            `Expression: **${cleaned}**`,

            "",

            `Result = **${formatNumber(result)}**`

        ].join("\n");

    }

    catch (error) {

        return null;
    }
}


/* =========================================================
   PERCENTAGE
   ========================================================= */

function solvePercentage(message) {

    let match =
        message.match(
            /(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i
        );


    if (match) {

        const percent =
            Number(match[1]);

        const number =
            Number(match[2]);


        const result =
            (percent / 100) * number;


        return [

            "### Step-by-step solution",

            "",

            `Given: **${percent}% of ${number}**`,

            "",

            `= (${percent} / 100) × ${number}`,

            "",

            `= **${formatNumber(result)}**`

        ].join("\n");
    }


    match =
        message.match(
            /what\s+percent\s+of\s+(\d+(?:\.\d+)?)\s+is\s+(\d+(?:\.\d+)?)/i
        );


    if (match) {

        const total =
            Number(match[1]);

        const value =
            Number(match[2]);


        if (total === 0) {

            return (
                "Percentage cannot be calculated " +
                "because the total is zero."
            );
        }


        const result =
            (value / total) * 100;


        return [

            "### Step-by-step solution",

            "",

            `Percentage = (${value} / ${total}) × 100`,

            "",

            `= **${formatNumber(result)}%**`

        ].join("\n");
    }


    return null;
}


/* =========================================================
   TRIGONOMETRY
   ========================================================= */

function solveTrigonometry(message) {

    const match =
        message.match(
            /\b(sin|cos|tan)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*°?\s*\)?/i
        );


    if (!match) {
        return null;
    }


    const fn =
        match[1].toLowerCase();

    const degree =
        Number(match[2]);


    const radians =
        degree * Math.PI / 180;


    let result;


    if (fn === "sin") {
        result = Math.sin(radians);
    }

    else if (fn === "cos") {
        result = Math.cos(radians);
    }

    else {
        result = Math.tan(radians);
    }


    return [

        "### Step-by-step solution",

        "",

        `Given: **${fn}(${degree}°)**`,

        "",

        "Convert degrees to radians:",

        "",

        `radians = ${degree} × π / 180`,

        "",

        `radians ≈ ${formatNumber(radians)}`,

        "",

        `Therefore:`,

        "",

        `**${fn}(${degree}°) = ${formatNumber(result)}**`

    ].join("\n");
}


/* =========================================================
   SQUARE ROOT
   ========================================================= */

function solveSquareRoot(message) {

    const match =
        message.match(
            /(?:square root of|sqrt)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/i
        );


    if (!match) {
        return null;
    }


    const number =
        Number(match[1]);


    if (number < 0) {

        return (
            "The square root of a negative " +
            "number is not a real number."
        );
    }


    const result =
        Math.sqrt(number);


    return [

        "### Step-by-step solution",

        "",

        `Given: √${number}`,

        "",

        `√${number} = **${formatNumber(result)}**`

    ].join("\n");
}


/* =========================================================
   POWER
   ========================================================= */

function solvePower(message) {

    const match =
        message.match(
            /(-?\d+(?:\.\d+)?)\s*(?:\^|to the power of)\s*(-?\d+(?:\.\d+)?)/i
        );


    if (!match) {
        return null;
    }


    const base =
        Number(match[1]);

    const exponent =
        Number(match[2]);


    const result =
        Math.pow(base, exponent);


    return [

        "### Step-by-step solution",

        "",

        `Base = ${base}`,

        "",

        `Exponent = ${exponent}`,

        "",

        `${base}^${exponent} = ${formatNumber(result)}`,

        "",

        "### Answer",

        "",

        `**${formatNumber(result)}**`

    ].join("\n");
}


/* =========================================================
   LINEAR EQUATION
   ========================================================= */

function solveLinearEquation(message) {

    const normalized =
        message
            .replace(/\s+/g, " ")
            .trim();


    const match =
        normalized.match(
            /(-?\d+(?:\.\d+)?)\s*x\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*(-?\d+(?:\.\d+)?)/i
        );


    if (!match) {
        return null;
    }


    const a =
        Number(match[1]);


    const b =
        match[2]
            ? Number(
                match[2]
                    .replace(/\s/g, "")
            )
            : 0;


    const c =
        Number(match[3]);


    if (a === 0) {
        return null;
    }


    const x =
        (c - b) / a;


    return [

        "### Step-by-step solution",

        "",

        `Given equation: **${a}x ${b >= 0 ? "+" : "-"} ${Math.abs(b)} = ${c}**`,

        "",

        "Move the constant term to the right side:",

        "",

        `x coefficient = ${a}`,

        "",

        `x = (${c} - ${b}) / ${a}`,

        "",

        `x = **${formatNumber(x)}**`

    ].join("\n");
}


/* =========================================================
   QUADRATIC EQUATION
   ========================================================= */

function solveQuadratic(message) {

    const normalized =
        normalizeMathWords(message)
            .replace(/\s+/g, " ")
            .trim();


    const match =
        normalized.match(
            /(-?\d+(?:\.\d+)?)\s*x\s*(?:\^|²)\s*2?\s*([+-]\s*\d+(?:\.\d+)?)\s*x\s*([+-]\s*\d+(?:\.\d+)?)?\s*=\s*0/i
        );


    if (!match) {
        return null;
    }


    const a =
        Number(match[1]);


    const b =
        Number(
            match[2].replace(/\s/g, "")
        );


    const c =
        match[3]
            ? Number(
                match[3].replace(/\s/g, "")
            )
            : 0;


    if (a === 0) {
        return null;
    }


    const discriminant =
        b * b - 4 * a * c;


    if (discriminant < 0) {

        return [

            "### Quadratic equation",

            "",

            `a = ${a}`,

            `b = ${b}`,

            `c = ${c}`,

            "",

            "Discriminant:",

            "",

            `D = b² - 4ac = ${formatNumber(discriminant)}`,

            "",

            "Since D < 0, the equation has no real roots."

        ].join("\n");
    }


    const sqrtD =
        Math.sqrt(discriminant);


    const x1 =
        (-b + sqrtD) / (2 * a);

    const x2 =
        (-b - sqrtD) / (2 * a);


    return [

        "### Step-by-step solution",

        "",

        `Equation: **${a}x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)} = 0**`,

        "",

        "Using the quadratic formula:",

        "",

        "x = (-b ± √(b² - 4ac)) / 2a",

        "",

        `Discriminant = ${formatNumber(discriminant)}`,

        "",

        `√D = ${formatNumber(sqrtD)}`,

        "",

        `x₁ = ${formatNumber(x1)}`,

        "",

        `x₂ = ${formatNumber(x2)}`,

        "",

        "### Answer",

        "",

        `**x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}**`

    ].join("\n");
}


/* =========================================================
   DERIVATIVE
   ========================================================= */

function solveDerivative(message) {

    let expression = null;


    const match =
        message.match(
            /(?:differentiate|derivative\s+of|derivative\s+of)\s+(.+)/i
        );


    if (match) {

        expression =
            normalizeMathWords(match[1])
                .replace(/\?$/, "")
                .trim();
    }


    if (!expression) {
        return null;
    }


    const compact =
        expression
            .replace(/\s/g, "")
            .toLowerCase();


    /* x^n */

    let powerMatch =
        compact.match(
            /^([+-]?\d+(?:\.\d+)?)?\*?x\^(\d+)$/
        );


    if (powerMatch) {

        const coefficient =
            powerMatch[1]
                ? Number(powerMatch[1])
                : 1;


        const power =
            Number(powerMatch[2]);


        const newCoefficient =
            coefficient * power;


        const newPower =
            power - 1;


        const answer =
            newPower === 0

                ? formatNumber(newCoefficient)

                : `${formatNumber(newCoefficient)}x^${newPower}`;


        return [

            "### Step-by-step solution",

            "",

            `Given: **${expression}**`,

            "",

            "Using the power rule:",

            "",

            "d/dx(xⁿ) = n xⁿ⁻¹",

            "",

            `Derivative = ${power} × ${coefficient}x^${power - 1}`,

            "",

            "### Answer",

            "",

            `**${answer}**`

        ].join("\n");
    }


    /* x² */

    if (
        compact === "x²" ||
        compact === "x^2"
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **x²**",

            "",

            "Using the power rule:",

            "",

            "d/dx(x²) = 2x",

            "",

            "### Answer",

            "",

            "**2x**"

        ].join("\n");
    }


    /* sin x */

    if (
        /^sin\(?x\)?$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **sin(x)**",

            "",

            "The derivative of sin(x) is cos(x).",

            "",

            "### Answer",

            "",

            "**cos(x)**"

        ].join("\n");
    }


    /* cos x */

    if (
        /^cos\(?x\)?$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **cos(x)**",

            "",

            "The derivative of cos(x) is -sin(x).",

            "",

            "### Answer",

            "",

            "**-sin(x)**"

        ].join("\n");
    }


    /* tan x */

    if (
        /^tan\(?x\)?$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **tan(x)**",

            "",

            "d/dx(tan x) = sec²(x)",

            "",

            "### Answer",

            "",

            "**sec²(x)**"

        ].join("\n");
    }


    /* e^x */

    if (
        /^e\^x$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **e^x**",

            "",

            "The derivative of e^x is e^x.",

            "",

            "### Answer",

            "",

            "**e^x**"

        ].join("\n");
    }


    return [

        "### Derivative",

        "",

        `Given expression: **${expression}**`,

        "",

        "Common rules:",

        "",

        "• d/dx(xⁿ) = nxⁿ⁻¹",

        "• d/dx(sin x) = cos x",

        "• d/dx(cos x) = -sin x",

        "• d/dx(tan x) = sec² x",

        "• d/dx(eˣ) = eˣ",

        "",

        "For this expression, use the appropriate derivative rule."

    ].join("\n");
}


/* =========================================================
   CHAIN RULE
   ========================================================= */

function solveChainRule(message) {

    if (
        !/chain\s+rule/i.test(message)
    ) {
        return null;
    }


    return [

        "### Chain Rule",

        "",

        "The **chain rule** is used to differentiate a composite function.",

        "",

        "If:",

        "",

        "**y = f(g(x))**",

        "",

        "then:",

        "",

        "**dy/dx = f'(g(x)) × g'(x)**",

        "",

        "### Example",

        "",

        "Let:",

        "",

        "**y = (x² + 1)³**",

        "",

        "Outer function:",

        "",

        "**u³**",

        "",

        "Inner function:",

        "",

        "**u = x² + 1**",

        "",

        "Differentiate the outer function:",

        "",

        "**3u²**",

        "",

        "Differentiate the inner function:",

        "",

        "**du/dx = 2x**",

        "",

        "Multiply them:",

        "",

        "**dy/dx = 3(x² + 1)² × 2x**",

        "",

        "### Answer",

        "",

        "**dy/dx = 6x(x² + 1)²**"

    ].join("\n");
}


/* =========================================================
   PRODUCT RULE
   ========================================================= */

function solveProductRule(message) {

    if (
        !/product\s+rule/i.test(message)
    ) {
        return null;
    }


    return [

        "### Product Rule",

        "",

        "The product rule is used when two functions are multiplied.",

        "",

        "If:",

        "",

        "**y = u × v**",

        "",

        "then:",

        "",

        "**dy/dx = u(dv/dx) + v(du/dx)**",

        "",

        "### Example",

        "",

        "For:",

        "",

        "**y = x² sin(x)**",

        "",

        "Let u = x² and v = sin(x).",

        "",

        "du/dx = 2x",

        "",

        "dv/dx = cos(x)",

        "",

        "Therefore:",

        "",

        "**dy/dx = x²cos(x) + 2xsin(x)**"

    ].join("\n");
}


/* =========================================================
   QUOTIENT RULE
   ========================================================= */

function solveQuotientRule(message) {

    if (
        !/quotient\s+rule/i.test(message)
    ) {
        return null;
    }


    return [

        "### Quotient Rule",

        "",

        "The quotient rule is used when one function is divided by another.",

        "",

        "If:",

        "",

        "**y = u / v**",

        "",

        "then:",

        "",

        "**dy/dx = (v du/dx - u dv/dx) / v²**",

        "",

        "Remember:",

        "",

        "**Low d-high minus high d-low, over low squared.**"

    ].join("\n");
}


/* =========================================================
   BASIC INTEGRATION
   ========================================================= */

function solveIntegral(message) {

    let match =
        message.match(
            /(?:integrate|integration\s+of)\s+(.+)/i
        );


    if (!match) {
        return null;
    }


    let expression =
        normalizeMathWords(match[1])
            .replace(/\s*dx\s*$/i, "")
            .replace(/\?$/, "")
            .trim();


    const compact =
        expression
            .replace(/\s/g, "")
            .toLowerCase();


    /* x^n */

    let powerMatch =
        compact.match(
            /^([+-]?\d+(?:\.\d+)?)?\*?x\^(\d+)$/
        );


    if (powerMatch) {

        const coefficient =
            powerMatch[1]
                ? Number(powerMatch[1])
                : 1;


        const power =
            Number(powerMatch[2]);


        const newPower =
            power + 1;


        const newCoefficient =
            coefficient / newPower;


        return [

            "### Step-by-step solution",

            "",

            `Given: **∫ ${expression} dx**`,

            "",

            "Using the power rule:",

            "",

            "∫xⁿ dx = xⁿ⁺¹ / (n + 1) + C",

            "",

            `= ${formatNumber(newCoefficient)}x^${newPower} + C`,

            "",

            "### Answer",

            "",

            `**${formatNumber(newCoefficient)}x^${newPower} + C**`

        ].join("\n");
    }


    /* x² */

    if (
        compact === "x²" ||
        compact === "x^2"
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **∫x² dx**",

            "",

            "Using the power rule:",

            "",

            "∫x² dx = x³/3 + C",

            "",

            "### Answer",

            "",

            "**x³/3 + C**"

        ].join("\n");
    }


    /* x */

    if (
        compact === "x"
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **∫x dx**",

            "",

            "Using the power rule:",

            "",

            "∫x dx = x²/2 + C",

            "",

            "### Answer",

            "",

            "**x²/2 + C**"

        ].join("\n");
    }


    /* sin x */

    if (
        /^sin\(?x\)?$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **∫sin(x) dx**",

            "",

            "The integral of sin(x) is -cos(x).",

            "",

            "### Answer",

            "",

            "**-cos(x) + C**"

        ].join("\n");
    }


    /* cos x */

    if (
        /^cos\(?x\)?$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **∫cos(x) dx**",

            "",

            "The integral of cos(x) is sin(x).",

            "",

            "### Answer",

            "",

            "**sin(x) + C**"

        ].join("\n");
    }


    /* e^x */

    if (
        /^e\^x$/.test(compact)
    ) {

        return [

            "### Step-by-step solution",

            "",

            "Given: **∫eˣ dx**",

            "",

            "The integral of eˣ is eˣ.",

            "",

            "### Answer",

            "",

            "**eˣ + C**"

        ].join("\n");
    }


    return [

        "### Integration",

        "",

        `Given: **${expression}**`,

        "",

        "Common integration rules:",

        "",

        "• ∫xⁿ dx = xⁿ⁺¹/(n+1) + C",

        "• ∫sin(x) dx = -cos(x) + C",

        "• ∫cos(x) dx = sin(x) + C",

        "• ∫eˣ dx = eˣ + C",

        "",

        "For more advanced integration, use the Calculator page."

    ].join("\n");
}


/* =========================================================
   LOGARITHM
   ========================================================= */

function solveLogarithm(message) {

    const match =
        message.match(
            /\b(log|ln)\s*\(?\s*(\d+(?:\.\d+)?)\s*\)?/i
        );


    if (!match) {
        return null;
    }


    const type =
        match[1].toLowerCase();


    const number =
        Number(match[2]);


    if (number <= 0) {

        return (
            "Logarithm is defined for positive numbers only."
        );
    }


    const result =
        type === "ln"

            ? Math.log(number)

            : Math.log10(number);


    return [

        "### Step-by-step solution",

        "",

        `${type}(${number})`,

        "",

        `= **${formatNumber(result)}**`

    ].join("\n");
}


/* =========================================================
   TEMPERATURE CONVERSION
   ========================================================= */

function solveTemperatureConversion(message) {

    let match =
        message.match(
            /(-?\d+(?:\.\d+)?)\s*°?\s*C(?:elsius)?\s*(?:to|in)\s*(?:°?\s*F|Fahrenheit)/i
        );


    if (match) {

        const celsius =
            Number(match[1]);


        const fahrenheit =
            (celsius * 9 / 5) + 32;


        return [

            "### Temperature Conversion",

            "",

            `Given: **${celsius}°C**`,

            "",

            "Formula:",

            "",

            "°F = (°C × 9/5) + 32",

            "",

            `°F = (${celsius} × 9/5) + 32`,

            "",

            `°F = **${formatNumber(fahrenheit)}°F**`

        ].join("\n");
    }


    match =
        message.match(
            /(-?\d+(?:\.\d+)?)\s*°?\s*F(?:ahrenheit)?\s*(?:to|in)\s*(?:°?\s*C|Celsius)/i
        );


    if (match) {

        const fahrenheit =
            Number(match[1]);


        const celsius =
            (fahrenheit - 32) * 5 / 9;


        return [

            "### Temperature Conversion",

            "",

            `Given: **${fahrenheit}°F**`,

            "",

            "Formula:",

            "",

            "°C = (°F - 32) × 5/9",

            "",

            `°C = (${fahrenheit} - 32) × 5/9`,

            "",

            `°C = **${formatNumber(celsius)}°C**`

        ].join("\n");
    }


    return null;
}


/* =========================================================
   MATRIX PARSER
   ========================================================= */

function parseMatrix(text) {

    const match =
        text.match(
            /\[\s*\[\s*([^;\]]+)\s*;\s*([^\]]+)\s*\]\s*\]/i
        );


    if (!match) {
        return null;
    }


    const row1 =
        match[1]
            .split(",")
            .map(Number);


    const row2 =
        match[2]
            .split(",")
            .map(Number);


    if (
        row1.length !== 2 ||
        row2.length !== 2 ||
        row1.some(Number.isNaN) ||
        row2.some(Number.isNaN)
    ) {

        return null;
    }


    return [
        row1,
        row2
    ];
}


/* =========================================================
   EIGENVALUES 2 x 2
   ========================================================= */

function solveEigenvalues(message) {

    if (
        !/eigenvalue|eigenvalues|eigenvector|eigenvectors/i.test(
            message
        )
    ) {
        return null;
    }


    const matrix =
        parseMatrix(message);


    if (!matrix) {

        return [

            "### Eigenvalues",

            "",

            "I can calculate eigenvalues for a 2 × 2 matrix.",

            "",

            "Enter it in this format:",

            "",

            "**[[a,b],[c,d]]**",

            "",

            "Example:",

            "",

            "**find eigenvalues of [[2,1],[1,2]]**"

        ].join("\n");
    }


    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];


    const trace =
        a + d;


    const determinant =
        a * d - b * c;


    const discriminant =
        trace * trace -
        4 * determinant;


    if (discriminant < 0) {

        return [

            "### Eigenvalues",

            "",

            `Matrix: **[[${a}, ${b}], [${c}, ${d}]]**`,

            "",

            `Trace = ${formatNumber(trace)}`,

            "",

            `Determinant = ${formatNumber(determinant)}`,

            "",

            `Discriminant = ${formatNumber(discriminant)}`,

            "",

            "The matrix has complex eigenvalues."

        ].join("\n");
    }


    const sqrtD =
        Math.sqrt(discriminant);


    const lambda1 =
        (trace + sqrtD) / 2;


    const lambda2 =
        (trace - sqrtD) / 2;


    return [

        "### Eigenvalues — Step-by-step",

        "",

        `Matrix: **[[${a}, ${b}], [${c}, ${d}]]**`,

        "",

        "For a 2 × 2 matrix:",

        "",

        "**|A - λI| = 0**",

        "",

        "Characteristic equation:",

        "",

        "**λ² - (trace)λ + determinant = 0**",

        "",

        `Trace = a + d = ${formatNumber(trace)}`,

        "",

        `Determinant = ad - bc = ${formatNumber(determinant)}`,

        "",

        `λ² - ${formatNumber(trace)}λ + ${formatNumber(determinant)} = 0`,

        "",

        `λ₁ = **${formatNumber(lambda1)}**`,

        "",

        `λ₂ = **${formatNumber(lambda2)}**`

    ].join("\n");
}


/* =========================================================
   TAYLOR SERIES
   ========================================================= */

function solveTaylorSeries(message) {

    if (
        !/taylor\s+series/i.test(message)
    ) {
        return null;
    }


    return [

        "### Taylor Series",

        "",

        "The Taylor series represents a function as an infinite polynomial around a point **a**.",

        "",

        "The general formula is:",

        "",

        "**f(x) = Σ [ f⁽ⁿ⁾(a) / n! ] (x - a)ⁿ**",

        "",

        "For expansion around **a = 0**, the Taylor series becomes the Maclaurin series.",

        "",

        "### Example: eˣ",

        "",

        "The derivatives of eˣ are all eˣ.",

        "",

        "At x = 0:",

        "",

        "f(0) = 1",

        "",

        "Therefore:",

        "",

        "**eˣ = 1 + x + x²/2! + x³/3! + x⁴/4! + ...**",

        "",

        "### Important",

        "",

        "Taylor series is useful for approximating functions using polynomial terms."

    ].join("\n");
}


/* =========================================================
   MACLAURIN SERIES
   ========================================================= */

function solveMaclaurinSeries(message) {

    if (
        !/maclaurin/i.test(message)
    ) {
        return null;
    }


    return [

        "### Maclaurin Series",

        "",

        "A Maclaurin series is a Taylor series centered at **x = 0**.",

        "",

        "General formula:",

        "",

        "**f(x) = f(0) + f'(0)x + f''(0)x²/2! + ...**",

        "",

        "Common examples:",

        "",

        "**eˣ = 1 + x + x²/2! + x³/3! + ...**",

        "",

        "**sin x = x - x³/3! + x⁵/5! - ...**",

        "",

        "**cos x = 1 - x²/2! + x⁴/4! - ...**"

    ].join("\n");
}


/* =========================================================
   LIMIT
   ========================================================= */

function solveLimit(message) {

    if (
        !/limit/i.test(message)
    ) {
        return null;
    }


    const match =
        message.match(
            /limit\s+(.*?)\s+(?:as\s+)?x\s*(?:approaches|->|tends to)\s*(-?\d+(?:\.\d+)?)/i
        );


    if (!match) {

        return [

            "### Limit",

            "",

            "Please provide a limit in a format such as:",

            "",

            "**limit (x² - 1)/(x - 1) as x approaches 1**"

        ].join("\n");
    }


    const expression =
        match[1].trim();


    const point =
        Number(match[2]);


    if (
        expression
            .replace(/\s/g, "") ===
        "(x²-1)/(x-1)"
    ) {

        return [

            "### Limit — Step-by-step",

            "",

            "Given:",

            "",

            "**lim x→1 [(x² - 1)/(x - 1)]**",

            "",

            "Factor the numerator:",

            "",

            "x² - 1 = (x - 1)(x + 1)",

            "",

            "Therefore:",

            "",

            "[(x - 1)(x + 1)] / (x - 1)",

            "",

            "= x + 1",

            "",

            "Substitute x = 1:",

            "",

            "**2**"

        ].join("\n");
    }


    return [

        "### Limit",

        "",

        `Expression: **${expression}**`,

        "",

        `As x approaches **${point}**`,

        "",

        "For this local version, common limit forms are supported."

    ].join("\n");
}


/* =========================================================
   GRAPH / FUNCTION
   ========================================================= */

function solveGraph(message) {

    if (
        !/plot|graph|plotting|visuali[sz]e/i.test(
            message
        )
    ) {
        return null;
    }


    const lower =
        message.toLowerCase();


    if (
        /sin\s*x/.test(lower)
    ) {

        return [

            "### Graph: y = sin(x)",

            "",

            "Function:",

            "",

            "**y = sin(x)**",

            "",

            "Suggested interval:",

            "",

            "**0 ≤ x ≤ 2π**",

            "",

            "Important points:",

            "",

            "• x = 0 → y = 0",

            "• x = π/2 → y = 1",

            "• x = π → y = 0",

            "• x = 3π/2 → y = -1",

            "• x = 2π → y = 0",

            "",

            "The function completes one complete sine wave over 0 to 2π.",

            "",

            "Use the Calcura Graph page to display the visual plot."

        ].join("\n");
    }


    if (
        /cos\s*x/.test(lower)
    ) {

        return [

            "### Graph: y = cos(x)",

            "",

            "Function:",

            "",

            "**y = cos(x)**",

            "",

            "Suggested interval:",

            "",

            "**0 ≤ x ≤ 2π**",

            "",

            "Important points:",

            "",

            "• x = 0 → y = 1",

            "• x = π/2 → y = 0",

            "• x = π → y = -1",

            "• x = 3π/2 → y = 0",

            "• x = 2π → y = 1",

            "",

            "Use the Calcura Graph page to visualize the curve."

        ].join("\n");
    }


    return [

        "### Graph",

        "",

        "I can recognize graph requests.",

        "",

        "Example:",

        "",

        "**plot y = x²**",

        "",

        "**plot sin x from 0 to 2π**",

        "",

        "For the visual graph, use the Calcura Graph page."

    ].join("\n");
}


/* =========================================================
   BASIC CONCEPT EXPLANATIONS
   ========================================================= */

function solveConcept(message) {

    const lower =
        message.toLowerCase();


    /* CHAIN RULE */

    if (
        /chain\s+rule/.test(lower)
    ) {
        return solveChainRule(message);
    }


    /* PRODUCT RULE */

    if (
        /product\s+rule/.test(lower)
    ) {
        return solveProductRule(message);
    }


    /* QUOTIENT RULE */

    if (
        /quotient\s+rule/.test(lower)
    ) {
        return solveQuotientRule(message);
    }


    /* TAYLOR */

    if (
        /taylor\s+series/.test(lower)
    ) {
        return solveTaylorSeries(message);
    }


    /* MACLAURIN */

    if (
        /maclaurin/.test(lower)
    ) {
        return solveMaclaurinSeries(message);
    }


    /* DERIVATIVE */

    if (
        /what is.*derivative|explain.*derivative|meaning.*derivative/.test(lower)
    ) {

        return [

            "### Derivative",

            "",

            "A derivative measures how quickly a function changes with respect to a variable.",

            "",

            "For example:",

            "",

            "**d/dx(x²) = 2x**",

            "",

            "The derivative gives the slope of a function at a particular point."

        ].join("\n");
    }


    /* INTEGRAL */

    if (
        /what is.*integral|explain.*integral|meaning.*integral/.test(lower)
    ) {

        return [

            "### Integral",

            "",

            "Integration is used to find an antiderivative or accumulated quantity.",

            "",

            "For example:",

            "",

            "**∫x dx = x²/2 + C**",

            "",

            "The constant **C** represents the constant of integration."

        ].join("\n");
    }


    /* QUADRATIC */

    if (
        /what is.*quadratic|explain.*quadratic/.test(lower)
    ) {

        return [

            "### Quadratic Equation",

            "",

            "A quadratic equation has the general form:",

            "",

            "**ax² + bx + c = 0**",

            "",

            "It can be solved using:",

            "",

            "**x = (-b ± √(b² - 4ac)) / 2a**"

        ].join("\n");
    }


    /* LIMIT */

    if (
        /what is.*limit|explain.*limit/.test(lower)
    ) {

        return [

            "### Limit",

            "",

            "A limit describes the value that a function approaches as the input approaches a particular value.",

            "",

            "For example:",

            "",

            "**lim x→2 (x + 3) = 5**"

        ].join("\n");
    }


    return null;
}


/* =========================================================
   PRACTICE QUESTIONS
   ========================================================= */

function solvePracticeQuestions(message) {

    if (
        !/generate.*question|practice.*question|practice\s+problems/i.test(
            message
        )
    ) {
        return null;
    }


    return [

        "### Practice Questions",

        "",

        "Try solving these:",

        "",

        "1. Solve: **2x + 5 = 15**",

        "",

        "2. Find the derivative of **x³**.",

        "",

        "3. Calculate: **sin(30°)**",

        "",

        "4. Integrate **x²**.",

        "",

        "5. Find **25% of 240**.",

        "",

        "6. Solve: **x² + 3x - 4 = 0**",

        "",

        "7. Explain the **chain rule**.",

        "",

        "8. Find the eigenvalues of **[[2,1],[1,2]]**.",

        "",

        "Send me any one question and I will solve it."

    ].join("\n");
}


/* =========================================================
   GENERAL LOCAL AI
   ========================================================= */

function generateLocalAIAnswer(
    message,
    action
) {

    const trimmed =
        cleanMessage(message);


    /* -----------------------------------------
       TEMPERATURE
       ----------------------------------------- */

    let answer =
        solveTemperatureConversion(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       EIGENVALUES
       ----------------------------------------- */

    answer =
        solveEigenvalues(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       TAYLOR
       ----------------------------------------- */

    answer =
        solveTaylorSeries(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       MACLAURIN
       ----------------------------------------- */

    answer =
        solveMaclaurinSeries(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       CHAIN RULE
       ----------------------------------------- */

    answer =
        solveChainRule(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       PRODUCT RULE
       ----------------------------------------- */

    answer =
        solveProductRule(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       QUOTIENT RULE
       ----------------------------------------- */

    answer =
        solveQuotientRule(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       LIMIT
       ----------------------------------------- */

    answer =
        solveLimit(
            trimmed
        );

    if (
        answer &&
        /limit/i.test(trimmed)
    ) {
        return answer;
    }


    /* -----------------------------------------
       GRAPH
       ----------------------------------------- */

    answer =
        solveGraph(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       PERCENTAGE
       ----------------------------------------- */

    answer =
        solvePercentage(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       SQUARE ROOT
       ----------------------------------------- */

    answer =
        solveSquareRoot(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       TRIGONOMETRY
       ----------------------------------------- */

    answer =
        solveTrigonometry(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       POWER
       ----------------------------------------- */

    answer =
        solvePower(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       QUADRATIC
       ----------------------------------------- */

    answer =
        solveQuadratic(
            normalizeMathWords(trimmed)
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       LINEAR EQUATION
       ----------------------------------------- */

    answer =
        solveLinearEquation(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       DERIVATIVE
       ----------------------------------------- */

    if (
        /differentiate|derivative/i.test(
            trimmed
        )
    ) {

        return solveDerivative(
            trimmed
        );
    }


    /* -----------------------------------------
       INTEGRATION
       ----------------------------------------- */

    if (
        /integrate|integration/i.test(
            trimmed
        )
    ) {

        return solveIntegral(
            trimmed
        );
    }


    /* -----------------------------------------
       LOGARITHM
       ----------------------------------------- */

    answer =
        solveLogarithm(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       ARITHMETIC
       ----------------------------------------- */

    answer =
        solveArithmetic(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       PRACTICE QUESTIONS
       ----------------------------------------- */

    answer =
        solvePracticeQuestions(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       CONCEPTS
       ----------------------------------------- */

    answer =
        solveConcept(
            trimmed
        );

    if (answer) {
        return answer;
    }


    /* -----------------------------------------
       ACTION FALLBACKS
       ----------------------------------------- */

    if (action === "simplify") {

        return [

            "### Simplification",

            "",

            "Please enter the mathematical expression you want to simplify.",

            "",

            "Example:",

            "",

            "**2x + 3x = 5x**"

        ].join("\n");
    }


    if (action === "graph") {

        return solveGraph(trimmed);
    }


    if (action === "homework") {

        return [

            "### Homework Help",

            "",

            "Send me the complete mathematics question.",

            "",

            "I will try to solve it step-by-step using the Calcura local mathematics engine."

        ].join("\n");
    }


    if (action === "explain") {

        return [

            "### Calcura AI",

            "",

            "I can explain mathematical concepts step-by-step.",

            "",

            "Try:",

            "",

            "• Explain chain rule",

            "• Explain Taylor series",

            "• Explain derivative",

            "• Explain quadratic equation",

            "• Explain integration"

        ].join("\n");
    }


    /* -----------------------------------------
       FINAL FALLBACK
       ----------------------------------------- */

    return [

        "### Calcura AI",

        "",

        "I couldn't identify the exact mathematical operation yet.",

        "",

        "Try questions such as:",

        "",

        "• 25 + 35 × 2",

        "• What is 25% of 200?",

        "• sin(30°)",

        "• square root of 144",

        "• 2x + 5 = 15",

        "• x² + 3x - 4 = 0",

        "• Differentiate sin x",

        "• Integrate x square dx",

        "• Explain chain rule",

        "• What is Taylor series?",

        "• Convert 25°C to Fahrenheit",

        "• Find eigenvalues of [[2,1],[1,2]]",

        "• Plot sin x from 0 to 2π"

    ].join("\n");
}


/* =========================================================
   ASK CALCURA AI
   ========================================================= */

const askCalcuraAI = async (
    req,
    res
) => {

    try {

        const {
            message,
            conversationId,
            action
        } = req.body;


        /* -----------------------------------------
           VALIDATION
           ----------------------------------------- */

        if (
            !message ||
            !String(message).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter a question."

            });
        }


        /* -----------------------------------------
           USER
           ----------------------------------------- */

        const user =
            await User.findById(
                req.user._id
            ).select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });
        }


        /* -----------------------------------------
           CONVERSATION
           ----------------------------------------- */

        const conversation =
            await getOrCreateConversation(
                user._id,
                conversationId
            );


        /* -----------------------------------------
           SAVE USER MESSAGE
           ----------------------------------------- */

        conversation.messages.push({

            role: "user",

            content:
                String(message).trim()

        });


        /* -----------------------------------------
           GENERATE LOCAL ANSWER
           ----------------------------------------- */

        const answer =
            generateLocalAIAnswer(

                String(message).trim(),

                action || "solve"

            );


        /* -----------------------------------------
           SAVE AI MESSAGE
           ----------------------------------------- */

        conversation.messages.push({

            role: "assistant",

            content: answer

        });


        /* -----------------------------------------
           CONVERSATION TITLE
           ----------------------------------------- */

        if (

            conversation.title ===
                "New AI Chat" &&

            conversation.messages.length >= 2

        ) {

            conversation.title =
                String(message)
                    .trim()
                    .substring(0, 60);
        }


        /* -----------------------------------------
           SAVE CONVERSATION
           ----------------------------------------- */

        await conversation.save();


        /* -----------------------------------------
           RESPONSE
           ----------------------------------------- */

        return res.status(200).json({

            success: true,

            conversationId:
                conversation._id,

            answer,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });

    }

    catch (error) {

        console.error(
            "Calcura Local AI Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Calcura AI could not process your question."

        });
    }
};


/* =========================================================
   GET USER AI HISTORY
   ========================================================= */

const getAIHistory = async (
    req,
    res
) => {

    try {

        const conversations =
            await AIConversation.find({

                user:
                    req.user._id

            })

            .sort({

                updatedAt: -1

            })

            .select(
                "title messages isSaved createdAt updatedAt"
            );


        return res.status(200).json({

            success: true,

            conversations

        });

    }

    catch (error) {

        console.error(
            "AI History Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load AI history."

        });
    }
};


/* =========================================================
   GET SINGLE CONVERSATION
   ========================================================= */

const getAIConversation = async (
    req,
    res
) => {

    try {

        const conversation =
            await AIConversation.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id

            });


        if (!conversation) {

            return res.status(404).json({

                success: false,

                message:
                    "AI conversation not found."

            });
        }


        return res.status(200).json({

            success: true,

            conversation

        });

    }

    catch (error) {

        console.error(
            "Get AI Conversation Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load conversation."

        });
    }
};


/* =========================================================
   SAVE / UNSAVE CONVERSATION
   ========================================================= */

const toggleSavedConversation = async (
    req,
    res
) => {

    try {

        const conversation =
            await AIConversation.findOne({

                _id:
                    req.params.id,

                user:
                    req.user._id

            });


        if (!conversation) {

            return res.status(404).json({

                success: false,

                message:
                    "AI conversation not found."

            });
        }


        conversation.isSaved =
            !conversation.isSaved;


        await conversation.save();


        return res.status(200).json({

            success: true,

            isSaved:
                conversation.isSaved

        });

    }

    catch (error) {

        console.error(
            "Save AI Conversation Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to save conversation."

        });
    }
};


/* =========================================================
   EXPORT
   ========================================================= */

module.exports = {

    askCalcuraAI,

    getAIHistory,

    getAIConversation,

    toggleSavedConversation

};