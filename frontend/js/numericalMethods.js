// ==========================================
// CALCURA - NUMERICAL METHODS
// ==========================================

// ------------------------------------------
// Evaluate dy/dx expression
// ------------------------------------------

function evaluateDerivative(expression, x, y) {

    let exp = expression;

    // Replace x and y
    exp = exp.replace(/\bx\b/g, `(${x})`);
    exp = exp.replace(/\by\b/g, `(${y})`);

    // Constants
    exp = exp.replace(/\bpi\b/gi, "Math.PI");
    exp = exp.replace(/\be\b/g, "Math.E");

    // Powers
    exp = exp.replace(
        /(\([^()]+\)|\d+(?:\.\d+)?)\^(-?\d+(?:\.\d+)?)/g,
        "Math.pow($1,$2)"
    );

    // Basic scientific functions
    exp = exp.replace(
        /\bsqrt\(([^()]*)\)/gi,
        "Math.sqrt($1)"
    );

    exp = exp.replace(
        /\babs\(([^()]*)\)/gi,
        "Math.abs($1)"
    );

    exp = exp.replace(
        /\bsin\(([^()]*)\)/gi,
        "Math.sin(($1)*Math.PI/180)"
    );

    exp = exp.replace(
        /\bcos\(([^()]*)\)/gi,
        "Math.cos(($1)*Math.PI/180)"
    );

    exp = exp.replace(
        /\btan\(([^()]*)\)/gi,
        "Math.tan(($1)*Math.PI/180)"
    );

    exp = exp.replace(
        /\blog\(([^()]*)\)/gi,
        "Math.log10($1)"
    );

    exp = exp.replace(
        /\bln\(([^()]*)\)/gi,
        "Math.log($1)"
    );

    // Safety check
    const safeExpression =
        /^(?:[0-9+\-*/().,\s]|Math\.(?:sin|cos|tan|log10|log|sqrt|abs|pow)|Math\.PI|Math\.E)+$/;

    if (!safeExpression.test(exp)) {
        throw new Error("Invalid derivative expression");
    }

    const result = Function(
        `"use strict"; return (${exp})`
    )();

    if (!Number.isFinite(result)) {
        throw new Error("Invalid numerical result");
    }

    return result;
}


// ==========================================
// EULER METHOD
// ==========================================

function solveEuler({
    derivative,
    x0,
    y0,
    h,
    targetX
}) {

    if (!derivative) {
        throw new Error("Derivative equation is required");
    }

    if (!Number.isFinite(x0)) {
        throw new Error("Invalid x0");
    }

    if (!Number.isFinite(y0)) {
        throw new Error("Invalid y0");
    }

    if (!Number.isFinite(h) || h === 0) {
        throw new Error("Invalid step size");
    }

    if (!Number.isFinite(targetX)) {
        throw new Error("Invalid target X");
    }

    const results = [];

    let x = x0;
    let y = y0;

    results.push({
        step: 0,
        x: x,
        y: y
    });

    let step = 0;

    const direction = targetX >= x0 ? 1 : -1;
    const stepSize = Math.abs(h) * direction;

    const maxSteps = 10000;

    while (
        (direction === 1 && x < targetX) ||
        (direction === -1 && x > targetX)
    ) {

        let currentStep = stepSize;

        // Prevent going beyond target X
        if (
            direction === 1 &&
            x + currentStep > targetX
        ) {
            currentStep = targetX - x;
        }

        if (
            direction === -1 &&
            x + currentStep < targetX
        ) {
            currentStep = targetX - x;
        }

        const derivativeValue =
            evaluateDerivative(
                derivative,
                x,
                y
            );

        // Euler formula
        const newY =
            y + currentStep * derivativeValue;

        const newX =
            x + currentStep;

        step++;

        x = newX;
        y = newY;

        results.push({
            step: step,
            x: x,
            y: y
        });

        if (step >= maxSteps) {
            throw new Error(
                "Too many Euler steps"
            );
        }
    }

    return {
        method: "Euler Method",
        derivative: derivative,
        x0: x0,
        y0: y0,
        h: h,
        targetX: targetX,
        result: y,
        steps: results
    };
}


// ==========================================
// TEST FUNCTION
// ==========================================

function testEuler() {

    const result = solveEuler({
        derivative: "x + y",
        x0: 0,
        y0: 1,
        h: 0.1,
        targetX: 1
    });

    console.log("Euler Method Result:");
    console.table(result.steps);

    console.log(
        "Final Result:",
        result.result
    );

    return result;
}
// ==========================================
// EULER VOICE INPUT PARSER
// ==========================================

function parseEulerVoice(text) {

    let input = text.toLowerCase();

    // Remove punctuation
    input = input.replace(/[?,!]/g, " ");

    // Convert common number words
    const numberWords = {
        "zero": "0",
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "ten": "10"
    };

    for (const word in numberWords) {
        input = input.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            numberWords[word]
        );
    }

    // Convert "point one" -> "0.1"
    input = input.replace(
        /\b(\d+)\s+point\s+(\d+)\b/g,
        "$1.$2"
    );

    // Remove "dy by dx"
    input = input.replace(
        /dy\s+by\s+dx/g,
        "dydx"
    );

    // Check Euler method
    if (!input.includes("euler method")) {
        return null;
    }

    // --------------------------------------
    // Get derivative
    // --------------------------------------

    const derivativeMatch = input.match(
        /dy dx equals\s*(.*?)\s+initial x/i
    );

    let derivative;

    if (derivativeMatch) {
        derivative = derivativeMatch[1].trim();
    } else {

        const alternateMatch = input.match(
            /dydx equals\s*(.*?)\s+initial x/i
        );

        if (alternateMatch) {
            derivative = alternateMatch[1].trim();
        }
    }

    if (!derivative) {
        throw new Error(
            "Could not understand dy/dx equation"
        );
    }

    // --------------------------------------
    // Get initial X
    // --------------------------------------

    const xMatch = input.match(
        /initial x\s+is\s+(-?\d+(?:\.\d+)?)/i
    );

    if (!xMatch) {
        throw new Error(
            "Initial X not found"
        );
    }

    const x0 = Number(xMatch[1]);

    // --------------------------------------
    // Get initial Y
    // --------------------------------------

    const yMatch = input.match(
        /initial y\s+is\s+(-?\d+(?:\.\d+)?)/i
    );

    if (!yMatch) {
        throw new Error(
            "Initial Y not found"
        );
    }

    const y0 = Number(yMatch[1]);

    // --------------------------------------
    // Get step size
    // --------------------------------------

    const hMatch = input.match(
    /step\s+size\s+(?:is\s+|equals\s+)?(-?\d+(?:\.\d+)?)/i
);

    if (!hMatch) {
        throw new Error(
            "Step size not found"
        );
    }

    const h = Number(hMatch[1]);

    // --------------------------------------
    // Get target X
    // --------------------------------------

    const targetMatch = input.match(
        /point y\s+at\s+x\s*(-?\d+(?:\.\d+)?)/i
    );

    if (!targetMatch) {
        throw new Error(
            "Target X not found"
        );
    }

    const targetX = Number(targetMatch[1]);

    // --------------------------------------
    // Return Euler data
    // --------------------------------------
// Convert spoken operators to mathematical operators

derivative = derivative.replace(/\bplus\b/g, "+");
derivative = derivative.replace(/\bminus\b/g, "-");
derivative = derivative.replace(/\btimes\b/g, "*");
derivative = derivative.replace(/\bmultiplied by\b/g, "*");
derivative = derivative.replace(/\bdivided by\b/g, "/");
derivative = derivative.replace(/\bdivide by\b/g, "/");
    return {
        method: "Euler Method",
        derivative: derivative,
        x0: x0,
        y0: y0,
        h: h,
        targetX: targetX
    };
}
// ==========================================
// MODIFIED EULER METHOD
// ==========================================

function solveModifiedEuler({
    derivative,
    x0,
    y0,
    h,
    targetX
}) {

    const results = [];

    let x = x0;
    let y = y0;

    results.push({
        step: 0,
        x: x,
        y: y
    });

    let step = 0;

    const direction = targetX >= x0 ? 1 : -1;
    const stepSize = Math.abs(h) * direction;

    const maxSteps = 10000;

    while (
        (direction === 1 && x < targetX) ||
        (direction === -1 && x > targetX)
    ) {

        let currentStep = stepSize;

        if (
            direction === 1 &&
            x + currentStep > targetX
        ) {
            currentStep = targetX - x;
        }

        if (
            direction === -1 &&
            x + currentStep < targetX
        ) {
            currentStep = targetX - x;
        }

        // f(xn, yn)
        const k1 = evaluateDerivative(
            derivative,
            x,
            y
        );

        // Predictor
        const predictor =
            y + currentStep * k1;

        // f(xn + h, predictor)
        const k2 = evaluateDerivative(
            derivative,
            x + currentStep,
            predictor
        );

        // Corrector
        const newY =
            y + (currentStep / 2) * (k1 + k2);

        const newX =
            x + currentStep;

        step++;

        x = newX;
        y = newY;

        results.push({
            step: step,
            x: x,
            y: y,
            k1: k1,
            k2: k2
        });

        if (step >= maxSteps) {
            throw new Error(
                "Too many Modified Euler steps"
            );
        }
    }

    return {
        method: "Modified Euler Method",
        derivative: derivative,
        x0: x0,
        y0: y0,
        h: h,
        targetX: targetX,
        result: y,
        steps: results
    };
}
// ==========================================
// MODIFIED EULER VOICE INPUT PARSER
// ==========================================

function parseModifiedEulerVoice(text) {

    let input = text.toLowerCase();

    // Remove punctuation
    input = input.replace(/[?,!]/g, " ");

    // --------------------------------------
    // Number words
    // --------------------------------------

    const numberWords = {
        "zero": "0",
        "one": "1",
        "two": "2",
        "three": "3",
        "four": "4",
        "five": "5",
        "six": "6",
        "seven": "7",
        "eight": "8",
        "nine": "9",
        "ten": "10"
    };

    for (const word in numberWords) {

        input = input.replace(
            new RegExp("\\b" + word + "\\b", "g"),
            numberWords[word]
        );

    }

    // --------------------------------------
    // Decimal numbers
    // Example: zero point one → 0.1
    // --------------------------------------

    input = input.replace(
        /\b(\d+)\s+point\s+(\d+)\b/g,
        "$1.$2"
    );

    // --------------------------------------
    // Check Modified Euler
    // --------------------------------------

    if (
        !input.includes("modified euler") &&
        !input.includes("modify euler")
    ) {
        return null;
    }

    // --------------------------------------
    // Convert dy by dx
    // --------------------------------------

    input = input.replace(
        /dy\s+by\s+dx/g,
        "dydx"
    );

    // --------------------------------------
    // Get derivative
    // --------------------------------------

    const derivativeMatch = input.match(
    /dydx\s+equals\s+(.+?)(?=\s+at\s+|\s+initial\s+x|\s+find\s+y)/i
);

    if (!derivativeMatch) {

        throw new Error(
            "Could not understand dy/dx equation"
        );

    }

    let derivative =
        derivativeMatch[1].trim();

    // --------------------------------------
    // Convert spoken operators
    // --------------------------------------

    derivative = derivative.replace(
        /\bplus\b/g,
        "+"
    );

    derivative = derivative.replace(
        /\bminus\b/g,
        "-"
    );

    derivative = derivative.replace(
        /\btimes\b/g,
        "*"
    );

    derivative = derivative.replace(
        /\bmultiplied by\b/g,
        "*"
    );

    derivative = derivative.replace(
        /\bdivided by\b/g,
        "/"
    );

    derivative = derivative.replace(
        /\bdivide by\b/g,
        "/"
    );

   // --------------------------------------
// Initial X and Initial Y
// Supports:
// x = 0, y = 1
// at 0 = 1
// initial x is 0, initial y is 1
// --------------------------------------

let x0;
let y0;

const initialXYMatch = input.match(
    /at\s+(-?\d+(?:\.\d+)?)\s*(?:=|is\s+equal\s+to)\s*(-?\d+(?:\.\d+)?)/i
);

if (initialXYMatch) {

    x0 = Number(initialXYMatch[1]);
    y0 = Number(initialXYMatch[2]);

} else {

    const xMatch = input.match(
        /initial\s+x\s+(?:is|equals)\s+(-?\d+(?:\.\d+)?)/i
    );

    const yMatch = input.match(
        /initial\s+y\s+(?:is|equals)\s+(-?\d+(?:\.\d+)?)/i
    );

    if (!xMatch) {
        throw new Error("Initial X not found");
    }

    if (!yMatch) {
        throw new Error("Initial Y not found");
    }

    x0 = Number(xMatch[1]);
    y0 = Number(yMatch[1]);
}
    // --------------------------------------
    // Step Size
    // --------------------------------------

    const hMatch = input.match(
        /step size\s+(-?\d+(?:\.\d+)?)/i
    );

    if (!hMatch) {

        throw new Error(
            "Step size not found"
        );

    }

    const h = Number(hMatch[1]);

    // --------------------------------------
    // Target X
    // --------------------------------------

    const targetMatch = input.match(
    /(?:find\s+y\s+at|point\s+y\s+at(?:\s+x)?)\s*(-?\d+(?:\.\d+)?)/i
);

    if (!targetMatch) {

        throw new Error(
            "Target X not found"
        );

    }

    const targetX =
        Number(targetMatch[1]);

    // --------------------------------------
    // Return Modified Euler data
    // --------------------------------------

    return {

        method: "Modified Euler Method",

        derivative: derivative,

        x0: x0,

        y0: y0,

        h: h,

        targetX: targetX

    };
}