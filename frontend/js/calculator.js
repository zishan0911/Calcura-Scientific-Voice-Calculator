/* =========================================================
   CALCURA SCIENTIFIC CALCULATOR
========================================================= */

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const historyList =
    document.getElementById("historyList");

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");

const profilePlan =
    document.getElementById("profilePlan");


/* =========================================================
   STATE
========================================================= */

let expression = "";
let lastAnswer = 0;
let angleMode = "DEG";

let calculationHistory = [];


/* =========================================================
   USER
========================================================= */

async function loadCalculatorUser() {

    const savedUser =
        typeof getSavedUser === "function"
            ? getSavedUser()
            : null;

    if (!savedUser) {

        window.location.href =
            "../login.html";

        return;
    }

    setCalculatorUser(savedUser);

    try {

        if (typeof getCurrentUser === "function") {

            const currentUser =
                await getCurrentUser();

            if (currentUser) {

                setCalculatorUser(
                    currentUser.user ||
                    currentUser
                );

            }

        }

    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

    }

}


function setCalculatorUser(user) {

    const name =
        typeof user === "string"
            ? user
            : user?.name;

    if (!name) return;

    const cleanName =
        name.trim();

    if (profileName) {
        profileName.textContent =
            cleanName;
    }

    if (profileAvatar) {

        profileAvatar.textContent =
            cleanName
                .charAt(0)
                .toUpperCase();

    }

    if (
        profilePlan &&
        typeof user === "object" &&
        user.plan
    ) {

        profilePlan.textContent =
            user.plan
                .charAt(0)
                .toUpperCase() +
            user.plan.slice(1) +
            " Plan";

    }

}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "0";

}


function formatResult(value) {

    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {

        return "Error";

    }

    if (Math.abs(value) < 1e-12) {

        value = 0;

    }

    return Number(
        value.toPrecision(12)
    ).toString();

}


/* =========================================================
   ANGLE
========================================================= */

function toRadians(value) {

    if (angleMode === "DEG") {

        return value *
            Math.PI /
            180;

    }

    return value;

}


function fromRadians(value) {

    if (angleMode === "DEG") {

        return value *
            180 /
            Math.PI;

    }

    return value;

}


/* =========================================================
   FACTORIAL
========================================================= */

function factorial(number) {

    if (
        !Number.isFinite(number) ||
        number < 0 ||
        !Number.isInteger(number)
    ) {

        throw new Error(
            "Factorial requires a non-negative integer"
        );

    }

    if (number > 170) {

        throw new Error(
            "Number is too large"
        );

    }

    let result = 1;

    for (
        let i = 2;
        i <= number;
        i++
    ) {

        result *= i;

    }

    return result;

}


/* =========================================================
   nPr / nCr
========================================================= */

function permutation(n, r) {

    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        n < 0 ||
        r < 0 ||
        r > n
    ) {

        throw new Error(
            "Invalid nPr values"
        );

    }

    return (
        factorial(n) /
        factorial(n - r)
    );

}


function combination(n, r) {

    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        n < 0 ||
        r < 0 ||
        r > n
    ) {

        throw new Error(
            "Invalid nCr values"
        );

    }

    return (
        factorial(n) /
        (
            factorial(r) *
            factorial(n - r)
        )
    );

}


/* =========================================================
   SCIENTIFIC FUNCTIONS
========================================================= */

const funcs = {

    sin: x =>
        Math.sin(toRadians(x)),

    cos: x =>
        Math.cos(toRadians(x)),

    tan: x =>
        Math.tan(toRadians(x)),

    asin: x =>
        fromRadians(Math.asin(x)),

    acos: x =>
        fromRadians(Math.acos(x)),

    atan: x =>
        fromRadians(Math.atan(x)),

    sinh: x =>
        Math.sinh(x),

    cosh: x =>
        Math.cosh(x),

    tanh: x =>
        Math.tanh(x),

    sec: x =>
        1 / Math.cos(toRadians(x)),

    csc: x =>
        1 / Math.sin(toRadians(x)),

    cot: x =>
        1 / Math.tan(toRadians(x)),

    sqrt: x =>
        Math.sqrt(x),

    cbrt: x =>
        Math.cbrt(x),

    abs: x =>
        Math.abs(x),

    log: x =>
        Math.log10(x),

    ln: x =>
        Math.log(x),

    exp: x =>
        Math.exp(x),

    tenpower: x =>
        Math.pow(10, x),

    fact: factorial,

    npr: permutation,

    ncr: combination

};


const allowedWords = [
    ...Object.keys(funcs),
    "pow",
    "PI",
    "E",
    "ANS"
];


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeExpression(input) {

    let exp = String(input);

    exp = exp.replace(/×/g, "*");
    exp = exp.replace(/÷/g, "/");
    exp = exp.replace(/−/g, "-");

    exp = exp.replace(
        /π/g,
        "PI"
    );

    exp = exp.replace(
        /²/g,
        "^2"
    );

    exp = exp.replace(
        /³/g,
        "^3"
    );

    exp = exp.replace(
        /⁻¹/g,
        "^-1"
    );

    exp = exp.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    exp = exp.replace(
        /(\d+(?:\.\d+)?|\([^()]*\)|PI|E|ANS)!/g,
        "fact($1)"
    );

    exp = exp.replace(
        /\^/g,
        "**"
    );

    return exp;

}


/* =========================================================
   IMPLICIT MULTIPLICATION
========================================================= */

function addImplicitMultiplication(exp) {

    exp = exp.replace(
        /(\d|\))(?=(PI|E|ANS|[A-Za-z_]+\())/g,
        "$1*"
    );

    exp = exp.replace(
        /(PI|E|ANS)(?=\d|\()/g,
        "$1*"
    );

    exp = exp.replace(
        /(\))(?=\d|PI|E|ANS)/g,
        "$1*"
    );

    return exp;

}


/* =========================================================
   VALIDATION
========================================================= */

function validateExpression(exp) {

    if (
        !/^[0-9+\-*/().,\sA-Za-z_]+$/.test(exp)
    ) {

        throw new Error(
            "Invalid characters"
        );

    }

    const words =
        exp.match(/[A-Za-z_]+/g) || [];

    words.forEach(word => {

        if (
            !allowedWords.includes(word)
        ) {

            throw new Error(
                "Unknown function: " +
                word
            );

        }

    });

}


/* =========================================================
   EVALUATE
========================================================= */

function evaluateExpression(input) {

    let exp =
        normalizeExpression(input);

    exp =
        addImplicitMultiplication(exp);

    validateExpression(exp);

    const scope = {

        ...funcs,

        pow: Math.pow,

        PI: Math.PI,

        E: Math.E,

        ANS: lastAnswer

    };

    const names =
        Object.keys(scope);

    const values =
        Object.values(scope);

    const evaluator =
        new Function(
            ...names,
            `"use strict"; return (${exp});`
        );

    const value =
        evaluator(...values);

    if (
        typeof value !== "number" ||
        !Number.isFinite(value)
    ) {

        throw new Error(
            "Invalid calculation"
        );

    }

    return value;

}


/* =========================================================
   HISTORY
========================================================= */

function loadHistory() {

    try {

        calculationHistory =
            JSON.parse(
                localStorage.getItem(
                    "calcuraHistory"
                )
            ) || [];

    } catch {

        calculationHistory = [];

    }

    renderHistory();

}


function formatRecentTime(value) {

    const date =
        new Date(value);

    const seconds =
        Math.floor(
            (
                Date.now() -
                date.getTime()
            ) / 1000
        );

    if (seconds < 60) {

        return "Just now";

    }

    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {

        return (
            minutes +
            " min" +
            (
                minutes === 1
                    ? ""
                    : "s"
            ) +
            " ago"
        );

    }

    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {

        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }
        );

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


function addToHistory(
    expressionValue,
    resultValue
) {

    calculationHistory.unshift({

        expression:
            expressionValue,

        result:
            resultValue,

        time:
            new Date().toISOString()

    });

    calculationHistory =
        calculationHistory.slice(
            0,
            30
        );

    localStorage.setItem(
        "calcuraHistory",
        JSON.stringify(
            calculationHistory
        )
    );

    renderHistory();

}


function renderHistory() {

    if (!historyList) return;

    historyList.innerHTML = "";

    if (
        calculationHistory.length === 0
    ) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div class="empty-history-icon">
                    ∑
                </div>

                <h3>
                    No calculations yet
                </h3>

                <p>
                    Your recent calculations
                    will appear here.
                </p>
            </div>
        `;

        return;

    }

    calculationHistory
        .slice(0, 6)
        .forEach(
            (item, index) => {

                const article =
                    document.createElement(
                        "article"
                    );

                article.className =
                    "history-item";

                article.innerHTML = `

                    <div class="history-item-top">

                        <div class="history-expression"></div>

                        <button
                            type="button"
                            class="history-menu-button">

                            <i class="fa-solid fa-ellipsis-vertical"></i>

                        </button>

                    </div>

                    <div class="history-result">
                        = ${escapeHtml(item.result)}
                    </div>

                    <div class="history-time">
                        ${formatRecentTime(item.time)}
                    </div>

                    <div class="history-menu">

                        <button
                            type="button"
                            data-menu="copy">

                            <i class="fa-regular fa-copy"></i>
                            <span>Copy</span>

                        </button>

                        <button
                            type="button"
                            data-menu="save">

                            <i class="fa-regular fa-bookmark"></i>
                            <span>Save</span>

                        </button>

                        <button
                            type="button"
                            data-menu="delete">

                            <i class="fa-regular fa-trash-can"></i>
                            <span>Delete</span>

                        </button>

                    </div>
                `;

                article
                    .querySelector(
                        ".history-expression"
                    )
                    .textContent =
                    item.expression;


                const menuButton =
                    article.querySelector(
                        ".history-menu-button"
                    );

                menuButton.addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        document
                            .querySelectorAll(
                                ".history-item.menu-open"
                            )
                            .forEach(item2 => {

                                if (
                                    item2 !== article
                                ) {

                                    item2.classList
                                        .remove(
                                            "menu-open"
                                        );

                                }

                            });

                        article.classList.toggle(
                            "menu-open"
                        );

                    }
                );


                article
                    .querySelector(
                        '[data-menu="copy"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            navigator.clipboard?.writeText(
                                `${item.expression} = ${item.result}`
                            );

                            article.classList.remove(
                                "menu-open"
                            );

                        }
                    );


                article
                    .querySelector(
                        '[data-menu="save"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            saveToDatabase(
                                item.expression,
                                item.result
                            );

                        }
                    );


                article
                    .querySelector(
                        '[data-menu="delete"]'
                    )
                    .addEventListener(
                        "click",
                        () => {

                            calculationHistory
                                .splice(
                                    index,
                                    1
                                );

                            localStorage.setItem(
                                "calcuraHistory",
                                JSON.stringify(
                                    calculationHistory
                                )
                            );

                            renderHistory();

                        }
                    );


                historyList.appendChild(
                    article
                );

            }
        );

}


function escapeHtml(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            char => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[char])
        );

}


/* =========================================================
   SAVE
========================================================= */

async function saveToDatabase(
    exp,
    res
) {

    const token =
        localStorage.getItem(
            "calcuraToken"
        );

    if (!token) {

        alert(
            "Please login first to save calculations."
        );

        return;

    }

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/saved",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        expression: exp,

                        result: String(res),

                        type: "calculator"

                    })

                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to save calculation"
            );

        }

        alert(
            "Calculation saved successfully."
        );

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "Failed to save calculation."
        );

    }

}


/* =========================================================
   CALCULATE
========================================================= */

function calculate() {

    if (!expression.trim()) return;

    try {

        const value =
            evaluateExpression(
                expression
            );

        const formatted =
            formatResult(value);

        lastAnswer = value;

        resultDisplay.textContent =
            formatted;

        addToHistory(
            expression,
            formatted
        );

        saveCalculationToDatabase(
            expression,
            formatted
        );

    } catch (error) {

        resultDisplay.textContent =
            "Error";

        console.error(
            "Calculation error:",
            error
        );

    }

}


async function saveCalculationToDatabase(
    exp,
    result
) {

    const token =
        localStorage.getItem(
            "calcuraToken"
        );

    if (!token) return;

    try {

        await fetch(
            "http://localhost:5000/api/calculations",
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body: JSON.stringify({

                    expression: exp,

                    result: String(result),

                    type: "calculator"

                })

            }
        );

    } catch (error) {

        console.error(
            "Database save error:",
            error
        );

    }

}


/* =========================================================
   ACTIONS
========================================================= */

function handleAction(action) {

    const append = {

        pi: "π",
        e: "E",
        ans: "ANS",

        square: "^2",
        cube: "^3",
        inverse: "^-1",
        power: "^",

        sqrt: "sqrt(",
        cbrt: "cbrt(",
        abs: "abs(",

        log: "log(",
        ln: "ln(",
        exp: "exp(",
        tenPower: "tenpower(",

        sin: "sin(",
        cos: "cos(",
        tan: "tan(",

        asin: "asin(",
        acos: "acos(",
        atan: "atan(",

        sinh: "sinh(",
        cosh: "cosh(",
        tanh: "tanh(",

        sec: "sec(",
        csc: "csc(",
        cot: "cot(",

        factorial: "!",
        npr: "npr(",
        ncr: "ncr(",

        percent: "%",

        openBracket: "(",
        closeBracket: ")"

    };


    if (
        action === "clear" ||
        action === "clearEntry"
    ) {

        expression = "";

        resultDisplay.textContent =
            "0";

        updateDisplay();

        return;

    }


    if (action === "delete") {

        expression =
            expression.slice(
                0,
                -1
            );

        updateDisplay();

        return;

    }


    if (action === "negate") {

        if (expression) {

            expression =
                `-(${expression})`;

        }

        updateDisplay();

        return;

    }


    if (action === "calculate") {

        calculate();

        return;

    }


    if (append[action]) {

        expression +=
            append[action];

        updateDisplay();

    }

}


/* =========================================================
   TABS
========================================================= */

function initTabs() {

    const tabs =
        document.querySelectorAll(
            ".calculator-tab"
        );

    const panels =
        document.querySelectorAll(
            ".calculator-panel"
        );


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                tabs.forEach(
                    item =>
                        item.classList
                            .remove("active")
                );

                panels.forEach(
                    panel =>
                        panel.classList
                            .remove("active")
                );


                tab.classList.add(
                    "active"
                );


                const panel =
                    document.querySelector(
                        `[data-panel="${tab.dataset.tab}"]`
                    );

                if (panel) {

                    panel.classList.add(
                        "active"
                    );

                }

            }
        );

    });

}


/* =========================================================
   BUTTONS
========================================================= */

document
    .querySelectorAll(
        ".calc-btn[data-value]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                expression +=
                    button.dataset.value;

                updateDisplay();

            }
        );

    });


document
    .querySelectorAll(
        ".calc-btn[data-action]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                handleAction(
                    button.dataset.action
                );

            }
        );

    });


/* =========================================================
   DEG / RAD
========================================================= */

const displayAngle =
    document.getElementById(
        "displayAngle"
    );

const angleDropdown =
    document.querySelector(
        ".angle-dropdown"
    );

const displayAngleText =
    document.getElementById(
        "displayAngleText"
    );


displayAngle?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        angleDropdown.classList.toggle(
            "open"
        );

    }
);


document
    .querySelectorAll(
        ".angle-option"
    )
    .forEach(option => {

        option.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                angleMode =
                    option.dataset.angle;

                displayAngleText.textContent =
                    angleMode;


                document
                    .querySelectorAll(
                        ".angle-option"
                    )
                    .forEach(
                        item =>
                            item.classList
                                .remove("active")
                    );


                option.classList.add(
                    "active"
                );


                angleDropdown.classList.remove(
                    "open"
                );


                if (expression) {

                    try {

                        resultDisplay.textContent =
                            formatResult(
                                evaluateExpression(
                                    expression
                                )
                            );

                    } catch {

                        resultDisplay.textContent =
                            "0";

                    }

                }

            }
        );

    });


document.addEventListener(
    "click",
    event => {

        if (
            angleDropdown &&
            !angleDropdown.contains(
                event.target
            )
        ) {

            angleDropdown.classList.remove(
                "open"
            );

        }

    }
);


/* =========================================================
   DISPLAY CLEAR
========================================================= */

document
    .getElementById(
        "displayClear"
    )
    ?.addEventListener(
        "click",
        () => {

            handleAction(
                "clear"
            );

        }
    );


/* =========================================================
   MATRIX
========================================================= */

function parseMatrix(text) {

    const rows =
        String(text)
            .trim()
            .split(";")
            .map(
                row =>
                    row
                        .split(",")
                        .map(Number)
            );


    if (
        !rows.length ||
        rows.some(
            row =>
                !row.length ||
                row.some(
                    number =>
                        !Number.isFinite(
                            number
                        )
                )
        )
    ) {

        throw new Error(
            "Invalid matrix"
        );

    }


    const columns =
        rows[0].length;


    if (
        rows.some(
            row =>
                row.length !==
                columns
        )
    ) {

        throw new Error(
            "All matrix rows must have the same length"
        );

    }


    return rows;

}


function sameSize(a, b) {

    return (
        a.length === b.length &&
        a[0].length === b[0].length
    );

}


function matrixAdd(a, b, sign) {

    if (!sameSize(a, b)) {

        throw new Error(
            "Matrices must have the same size"
        );

    }

    return a.map(
        (row, i) =>
            row.map(
                (value, j) =>
                    value +
                    sign *
                    b[i][j]
            )
    );

}


function matrixMultiply(a, b) {

    if (
        a[0].length !==
        b.length
    ) {

        throw new Error(
            "Invalid matrix dimensions"
        );

    }

    return a.map(
        row =>
            b[0].map(
                (_, column) =>
                    row.reduce(
                        (sum, value, index) =>
                            sum +
                            value *
                            b[index][column],
                        0
                    )
            )
    );

}


function minor(
    matrix,
    row,
    column
) {

    return matrix
        .filter(
            (_, i) =>
                i !== row
        )
        .map(
            rowData =>
                rowData.filter(
                    (_, j) =>
                        j !== column
                )
        );

}


function determinant(matrix) {

    if (
        matrix.length !==
        matrix[0].length
    ) {

        throw new Error(
            "Determinant requires a square matrix"
        );

    }

    if (matrix.length === 1) {

        return matrix[0][0];

    }

    if (matrix.length === 2) {

        return (
            matrix[0][0] *
            matrix[1][1] -
            matrix[0][1] *
            matrix[1][0]
        );

    }

    return matrix[0].reduce(
        (sum, value, column) =>
            sum +
            value *
            cofactor(
                matrix,
                0,
                column
            ),
        0
    );

}


function cofactor(
    matrix,
    row,
    column
) {

    return (
        (
            (row + column) % 2
                ? -1
                : 1
        ) *
        determinant(
            minor(
                matrix,
                row,
                column
            )
        )
    );

}


function transpose(matrix) {

    return matrix[0].map(
        (_, column) =>
            matrix.map(
                row =>
                    row[column]
            )
    );

}


function inverseMatrix(matrix) {

    const det =
        determinant(matrix);

    if (
        Math.abs(det) < 1e-15
    ) {

        throw new Error(
            "Matrix is singular"
        );

    }

    return transpose(
        matrix.map(
            (_, row) =>
                matrix.map(
                    (__, column) =>
                        cofactor(
                            matrix,
                            row,
                            column
                        )
                )
        )
    ).map(
        row =>
            row.map(
                value =>
                    value / det
            )
    );

}


function matrixString(matrix) {

    return matrix
        .map(
            row =>
                row
                    .map(
                        value =>
                            formatResult(
                                value
                            )
                    )
                    .join("    ")
        )
        .join("\n");

}


function runMatrix(action) {

    try {

        const matrixA =
            parseMatrix(
                document.getElementById(
                    "matrixA"
                ).value
            );

        const matrixB =
            parseMatrix(
                document.getElementById(
                    "matrixB"
                ).value
            );


        let output;


        if (action === "add") {

            output =
                matrixAdd(
                    matrixA,
                    matrixB,
                    1
                );

        }

        else if (
            action === "subtract"
        ) {

            output =
                matrixAdd(
                    matrixA,
                    matrixB,
                    -1
                );

        }

        else if (
            action === "multiply"
        ) {

            output =
                matrixMultiply(
                    matrixA,
                    matrixB
                );

        }

        else if (
            action === "determinant"
        ) {

            output =
                determinant(
                    matrixA
                );

        }

        else if (
            action === "inverse"
        ) {

            output =
                inverseMatrix(
                    matrixA
                );

        }

        else if (
            action === "transpose"
        ) {

            output =
                transpose(
                    matrixA
                );

        }

        else {

            output =
                determinant(
                    matrixA
                );

        }


       const matrixResult =
    document.getElementById("matrixResult");

        if (matrixResult) {
    matrixResult.textContent =
        Array.isArray(output)
            ? matrixString(output)
            : formatResult(output);
    }


    } catch (error) {

        alert(
            error.message
        );

    }

}


document
    .querySelectorAll(
        "[data-matrix-action]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () =>
                runMatrix(
                    button.dataset
                        .matrixAction
                )
        );

    });


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() ===
                "k"
        ) {

            event.preventDefault();

            document
                .getElementById(
                    "globalSearch"
                )
                ?.focus();

            return;

        }


        if (
            ["INPUT", "TEXTAREA"]
                .includes(
                    document.activeElement?.tagName
                )
        ) {

            return;

        }


        if (
            /^[0-9.]$/.test(
                event.key
            )
        ) {

            expression +=
                event.key;

            updateDisplay();

            return;

        }


        if (
            ["+", "-", "*", "/",
             "(", ")", "%"]
                .includes(
                    event.key
                )
        ) {

            expression +=
                event.key;

            updateDisplay();

            return;

        }


        if (
            event.key === "Enter" ||
            event.key === "="
        ) {

            event.preventDefault();

            calculate();

            return;

        }


        if (
            event.key === "Backspace"
        ) {

            expression =
                expression.slice(
                    0,
                    -1
                );

            updateDisplay();

            return;

        }


        if (
            event.key === "Escape"
        ) {

            handleAction(
                "clear"
            );

        }

    }
);


/* =========================================================
   VOICE INPUT - FINAL
========================================================= */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;


/* ---------------------------------------------------------
   NUMBER WORDS
--------------------------------------------------------- */

function convertNumberWords(text) {

    const numbers = {
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
        "ten": "10",
        "eleven": "11",
        "twelve": "12",
        "thirteen": "13",
        "fourteen": "14",
        "fifteen": "15",
        "sixteen": "16",
        "seventeen": "17",
        "eighteen": "18",
        "nineteen": "19",
        "twenty": "20",
        "thirty": "30",
        "forty": "40",
        "fifty": "50",
        "sixty": "60",
        "seventy": "70",
        "eighty": "80",
        "ninety": "90"
    };

    Object.keys(numbers)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {

            const value = numbers[word];

            text = text.replace(
                new RegExp(`\\b${word}\\b`, "g"),
                value
            );

        });

    return text;
}


/* ---------------------------------------------------------
   CLOSE SCIENTIFIC FUNCTIONS
--------------------------------------------------------- */

function closeVoiceFunctions(text) {

    const functions = [
        "sqrt",
        "cbrt",
        "abs",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "sinh",
        "cosh",
        "tanh",
        "sec",
        "csc",
        "cot",
        "log",
        "ln",
        "exp",
        "tenpower",
        "fact"
    ];

    functions.forEach(fn => {

        const regex =
            new RegExp(
                `\\b${fn}\\s*\\(\\s*(-?[0-9.]+)\\s*\\)?`,
                "g"
            );

        text = text.replace(
            regex,
            `${fn}($1)`
        );

    });

    return text;
}


/* ---------------------------------------------------------
   SPOKEN → CALCULATOR EXPRESSION
--------------------------------------------------------- */

function spokenToExpression(text) {

    let speech = String(text || "")
        .toLowerCase()
        .trim();


    /* NUMBER WORDS */

    speech = convertNumberWords(speech);


    /* COMMON SPEECH RECOGNITION CORRECTIONS */

    speech = speech
        .replace(/\bmultiplied by\b/g, " * ")
        .replace(/\bmultiply by\b/g, " * ")
        .replace(/\btimes\b/g, " * ")

        .replace(/\bdivided by\b/g, " / ")
        .replace(/\bdivide by\b/g, " / ")

        .replace(/\bplus\b/g, " + ")
        .replace(/\badd\b/g, " + ")

        .replace(/\bminus\b/g, " - ")
        .replace(/\bsubtract\b/g, " - ")

        .replace(/\bto the power of\b/g, " ^ ")
        .replace(/\bto the power\b/g, " ^ ")
        .replace(/\bpower of\b/g, " ^ ")
        .replace(/\bpower\b/g, " ^ ")


        /* ROOTS */

        .replace(
            /\bsquare root of\b/g,
            "sqrt("
        )

        .replace(
            /\bsquare root\b/g,
            "sqrt("
        )

        .replace(
            /\bcube root of\b/g,
            "cbrt("
        )

        .replace(
            /\bcube root\b/g,
            "cbrt("
        )


        /* TRIGONOMETRY */

        .replace(/\bsine\b/g, "sin")
        .replace(/\bsin\b/g, "sin")

        .replace(/\bcosine\b/g, "cos")
        .replace(/\bcos\b/g, "cos")

        .replace(/\btangent\b/g, "tan")
        .replace(/\btan\b/g, "tan")

        .replace(/\binverse sine\b/g, "asin")
        .replace(/\binverse sin\b/g, "asin")
        .replace(/\barcsine\b/g, "asin")
        .replace(/\barcsin\b/g, "asin")

        .replace(/\binverse cosine\b/g, "acos")
        .replace(/\binverse cos\b/g, "acos")
        .replace(/\barccosine\b/g, "acos")
        .replace(/\barccos\b/g, "acos")

        .replace(/\binverse tangent\b/g, "atan")
        .replace(/\binverse tan\b/g, "atan")
        .replace(/\barctangent\b/g, "atan")
        .replace(/\barctan\b/g, "atan")


        /* HYPERBOLIC */

        .replace(/\bhyperbolic sine\b/g, "sinh")
        .replace(/\bhyperbolic sin\b/g, "sinh")

        .replace(/\bhyperbolic cosine\b/g, "cosh")
        .replace(/\bhyperbolic cos\b/g, "cosh")

        .replace(/\bhyperbolic tangent\b/g, "tanh")
        .replace(/\bhyperbolic tan\b/g, "tanh")


        /* SEC / CSC / COT */

        .replace(/\bsecant\b/g, "sec")
        .replace(/\bsec\b/g, "sec")

        .replace(/\bcosecant\b/g, "csc")
        .replace(/\bcosec\b/g, "csc")
        .replace(/\bcsc\b/g, "csc")

        .replace(/\bcotangent\b/g, "cot")
        .replace(/\bcot\b/g, "cot")


        /* LOGARITHMS */

        .replace(
            /\bnatural logarithm\b/g,
            "ln"
        )

        .replace(
            /\bnatural log\b/g,
            "ln"
        )

        .replace(/\blogarithm\b/g, "log")
        .replace(/\blog\b/g, "log")


        /* EXPONENTIAL */

        .replace(
            /\be to the power of\b/g,
            "E ^ "
        )

        .replace(
            /\be power of\b/g,
            "E ^ "
        )

        .replace(
            /\be power\b/g,
            "E ^ "
        )

        .replace(
            /\bten to the power of\b/g,
            "10 ^ "
        )

        .replace(
            /\bten power\b/g,
            "tenpower("
        )


        /* CONSTANTS */

        .replace(/\bpi\b/g, "π")
        .replace(/\bpie\b/g, "π")

        .replace(/\beuler's number\b/g, "E")
        .replace(/\beulers number\b/g, "E")

        .replace(/\banswer\b/g, "ANS")
        .replace(/\bprevious answer\b/g, "ANS")
        .replace(/\blast answer\b/g, "ANS")


        /* ABSOLUTE VALUE */

        .replace(
            /\babsolute value of\b/g,
            "abs("
        )

        .replace(
            /\babsolute of\b/g,
            "abs("
        )


        /* RECIPROCAL */

        .replace(
            /\breciprocal of\b/g,
            "1 / "
        )

        .replace(
            /\binverse of\b/g,
            "1 / "
        )


        /* FACTORIAL */

        .replace(
            /\bfactorial of\b/g,
            "fact("
        )

        .replace(
            /\bfactorial\b/g,
            "!"
        )


        /* SQUARE / CUBE */

        .replace(
            /\bsquared\b/g,
            "^2"
        )

        .replace(
            /\bsquare\b/g,
            "^2"
        )

        .replace(
            /\bcubed\b/g,
            "^3"
        )

        .replace(
            /\bcube\b/g,
            "^3"
        )


        /* N PERMUTATION R */

        .replace(
            /\bn\s*pr\b/g,
            "npr"
        )

        .replace(
            /\bpermutation\b/g,
            "npr"
        )


        /* N COMBINATION R */

        .replace(
            /\bn\s*cr\b/g,
            "ncr"
        )

        .replace(
            /\bcombination\b/g,
            "ncr"
        )


        /* BRACKETS */

        .replace(
            /\bopen bracket\b/g,
            " ( "
        )

        .replace(
            /\bopen parenthesis\b/g,
            " ( "
        )

        .replace(
            /\bclose bracket\b/g,
            " ) "
        )

        .replace(
            /\bclose parenthesis\b/g,
            " ) "
        )


        /* DECIMAL */

        .replace(
            /\bpoint\b/g,
            "."
        )

        .replace(
            /\bdecimal\b/g,
            "."
        )


        /* PERCENT */

        .replace(
            /\bpercent\b/g,
            "%"
        )

        .replace(
            /\bpercentage\b/g,
            "%"
        )


        /* REMOVE DEGREES */

        .replace(
            /\bdegrees?\b/g,
            ""
        );


    /* -----------------------------------------------------
       FUNCTION ARGUMENTS
    ----------------------------------------------------- */

    speech = speech
        .replace(
            /\b(sin|cos|tan|asin|acos|atan|sinh|cosh|tanh|sec|csc|cot|log|ln)\s+(-?[0-9.]+)/g,
            "$1($2)"
        );


    /* ROOT / ABS / FACT */

    speech = speech
        .replace(
            /\b(sqrt|cbrt|abs|fact)\s+(-?[0-9.]+)/g,
            "$1($2)"
        );


    /* NPr / NCr */

    speech = speech
        .replace(
            /(-?[0-9]+)\s*npr\s*(-?[0-9]+)/g,
            "npr($1,$2)"
        )

        .replace(
            /(-?[0-9]+)\s*ncr\s*(-?[0-9]+)/g,
            "ncr($1,$2)"
        );


    /* TEN POWER */

    speech = speech
        .replace(
            /\btenpower\s+(-?[0-9.]+)/g,
            "tenpower($1)"
        );


    /* -----------------------------------------------------
       CLEAN SPACES
    ----------------------------------------------------- */

    speech = speech
        .replace(/\s+/g, " ")
        .trim();


    /* -----------------------------------------------------
       FIX ROOT / FUNCTION OPEN BRACKETS
    ----------------------------------------------------- */

    speech = closeVoiceFunctions(speech);


    /* -----------------------------------------------------
       AUTO CLOSE FUNCTION BRACKETS
    ----------------------------------------------------- */

    const functionNames = [
        "sqrt",
        "cbrt",
        "abs",
        "sin",
        "cos",
        "tan",
        "asin",
        "acos",
        "atan",
        "sinh",
        "cosh",
        "tanh",
        "sec",
        "csc",
        "cot",
        "log",
        "ln",
        "exp",
        "tenpower",
        "fact"
    ];

    functionNames.forEach(fn => {

        const pattern =
            new RegExp(
                `\\b${fn}\\((-?[0-9.]+)\\)(?!\\))`,
                "g"
            );

        speech = speech.replace(
            pattern,
            `${fn}($1)`
        );

    });


    /* -----------------------------------------------------
       BALANCE BASIC BRACKETS
    ----------------------------------------------------- */

    const openCount =
        (speech.match(/\(/g) || []).length;

    const closeCount =
        (speech.match(/\)/g) || []).length;

    if (openCount > closeCount) {

        speech += ")".repeat(
            openCount - closeCount
        );

    }


    return speech;
}


/* ---------------------------------------------------------
   START VOICE
--------------------------------------------------------- */

function startVoice() {

    if (!SpeechRecognition) {

        alert(
            "Voice input is not supported in this browser. Please use Google Chrome."
        );

        return;
    }


    /* Stop previous recognition */

    if (recognition) {

        try {
            recognition.abort();
        } catch (error) {
            console.log(error);
        }

    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        3;


    const button =
        document.getElementById(
            "startListening"
        );

    const mic =
        document.getElementById(
            "calculatorMic"
        );

    const status =
        document.getElementById(
            "voiceStatus"
        );


    button?.classList.add(
        "listening"
    );

    mic?.classList.add(
        "listening"
    );


    if (status) {

        status.textContent =
            "Listening...";

    }


    recognition.onresult =
        event => {

            const spoken =
                event.results[0][0]
                    .transcript
                    .trim();


            console.log(
                "Voice input:",
                spoken
            );


            expression =
                spokenToExpression(
                    spoken
                );


            console.log(
                "Converted expression:",
                expression
            );


            updateDisplay();


            if (status) {

                status.textContent =
                    `Heard: ${spoken}`;

            }


            /* ---------------------------------------------
               AUTOMATIC CALCULATION
            --------------------------------------------- */

            try {

                calculate();

            } catch (error) {

                console.error(
                    "Voice calculation error:",
                    error
                );

                resultDisplay.textContent =
                    "Error";

            }

        };


    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            if (status) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    status.textContent =
                        "Microphone permission denied.";

                } else if (
                    event.error ===
                    "no-speech"
                ) {

                    status.textContent =
                        "No speech detected. Try again.";

                } else {

                    status.textContent =
                        "Voice input error: " +
                        event.error;

                }

            }

        };


    recognition.onend =
        () => {

            button?.classList.remove(
                "listening"
            );

            mic?.classList.remove(
                "listening"
            );

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Could not start voice recognition:",
            error
        );

    }

}


/* ---------------------------------------------------------
   VOICE BUTTONS
--------------------------------------------------------- */

document
    .getElementById(
        "startListening"
    )
    ?.addEventListener(
        "click",
        startVoice
    );


document
    .getElementById(
        "calculatorMic"
    )
    ?.addEventListener(
        "click",
        startVoice
    );

/* =========================================================
   SEARCH
========================================================= */

document
    .getElementById(
        "globalSearch"
    )
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                event.target.value.trim()
            ) {

                const search =
                    event.target.value
                        .trim()
                        .toLowerCase();


                const tab =
                    [
                        ...document
                            .querySelectorAll(
                                ".calculator-tab"
                            )
                    ]
                    .find(
                        item =>
                            item.textContent
                                .toLowerCase()
                                .includes(
                                    search
                                )
                    );


                if (tab) {

                    tab.click();

                }

            }

        }
    );


/* =========================================================
   INITIALIZE
========================================================= */

initTabs();

loadHistory();

loadCalculatorUser();

updateDisplay();