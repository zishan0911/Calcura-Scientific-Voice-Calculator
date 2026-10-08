/* =========================================================
   CALCURA DASHBOARD.JS
   All dashboard functionality in one file
   ========================================================= */


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const welcomeName =
        document.getElementById("welcomeName");

    const profileName =
        document.getElementById("profileName");

    const headerUserName =
        document.getElementById("headerUserName");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const expressionInput =
        document.getElementById("dashboardExpression");

    const resultDisplay =
        document.getElementById("dashboardResult");

    const calculateButton =
        document.getElementById("dashboardCalculate") ||
        document.querySelector(".dashboard-calculate-button");

    const micButton =
        document.getElementById("dashboardMic");

    const keyboardButton =
        document.getElementById("dashboardKeyboard");

    const copyButton =
        document.getElementById("copyResult");

    const fullscreenButton =
        document.getElementById("expandResult");

    const searchInput =
        document.getElementById("globalSearch") ||
        document.querySelector(".dashboard-search input");

    const notificationButton =
        document.getElementById("notificationButton") ||
        document.querySelector(".header-icon-button");



    /* =====================================================
       1. USER INFORMATION
       ===================================================== */

    loadUserInformation();



    async function loadUserInformation() {

        const savedUser =
            getSavedUser();

        /*
         * User is not logged in
         */

        if (!savedUser) {

            window.location.href =
                "../login.html";

            return;

        }


        const name =
            savedUser.name || "User";


        /*
         * Display saved user immediately
         */

        setUserName(name);


        /*
         * Verify user with backend
         */

        try {

            const currentUser =
                await getCurrentUser();


            if (!currentUser) {
                return;
            }


            const userData =
                currentUser.user ||
                currentUser;


            if (
                userData &&
                userData.name
            ) {

                setUserName(
                    userData.name
                );

            }

        } catch (error) {

            console.error(
                "User verification error:",
                error
            );

        }

    }



    function setUserName(name) {

        if (welcomeName) {

            welcomeName.textContent =
                name;

        }


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (headerUserName) {

            headerUserName.textContent =
                name;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();

        }

    }



    /* =====================================================
       2. RECENT HISTORY FROM MONGODB
       ===================================================== */

    loadRecentCalculations();



    async function loadRecentCalculations() {

        const container =
            document.getElementById(
                "recentCalculations"
            );


        if (!container) {
            return;
        }


        const token =
            localStorage.getItem(
                "calcuraToken"
            );


        if (!token) {
            return;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/calculations",
                    {

                        method: "GET",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        }

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to load calculations"
                );

            }


            const calculations =
                data.calculations || [];


            /*
             * Latest 5
             */

            const recent =
                calculations.slice(
                    0,
                    5
                );


            /*
             * Empty history
             */

            if (recent.length === 0) {

                container.innerHTML = `

                    <div class="empty-state">

                        <div class="empty-icon">
                            ∑
                        </div>

                        <h3>
                            No calculations yet
                        </h3>

                        <p>
                            Start using the calculator
                            to see your recent
                            calculations here.
                        </p>

                        <a
                            href="calculator.html"
                            class="dashboard-secondary-button"
                        >
                            Start Calculating
                        </a>

                    </div>

                `;

                return;

            }


            /*
             * Clear old content
             */

            container.innerHTML = "";


            /*
             * Display calculations
             */

            recent.forEach(function (item) {

    const card =
        document.createElement("div");

    card.className =
        "recent-calculation-card";


    /* =================================================
       HISTORY CONTENT
    ================================================= */

    card.innerHTML = `

        <div class="recent-calculation-top">

            <span class="recent-type">
                ${escapeDashboardHTML(
                    item.type || "calculator"
                )}
            </span>

            <span class="recent-date">
                ${
                    item.createdAt
                        ? formatRecentTime(
                            item.createdAt
                        )
                        : ""
                }
            </span>

        </div>


        <div class="recent-expression">

            ${escapeDashboardHTML(
                item.expression || ""
            )}

        </div>


        <div class="recent-result">

            = ${escapeDashboardHTML(
                String(item.result || "")
            )}

        </div>


        <!-- THREE DOT BUTTON -->

        <button
            class="recent-menu-button"
            type="button"
            title="More options"
        >
            ⋮
        </button>


        <!-- THREE DOT MENU -->

        <div class="recent-menu">

            <button
                type="button"
                class="recent-menu-copy"
            >
                📋 Copy
            </button>

            <button
                type="button"
                class="recent-menu-save"
            >
                🔖 Save
            </button>

            <button
                type="button"
                class="recent-menu-delete"
            >
                🗑 Delete
            </button>

        </div>

    `;


    /* =================================================
       THREE DOT BUTTON
    ================================================= */

    const menuButton =
        card.querySelector(
            ".recent-menu-button"
        );


    const menu =
        card.querySelector(
            ".recent-menu"
        );


    menuButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            /*
             * Close other open menus
             */

            document
                .querySelectorAll(
                    ".recent-menu.open"
                )
                .forEach(function (otherMenu) {

                    if (otherMenu !== menu) {

                        otherMenu.classList.remove(
                            "open"
                        );

                    }

                });


            menu.classList.toggle(
                "open"
            );

        }
    );


    /* =================================================
       COPY
    ================================================= */

    const copyHistoryButton =
        card.querySelector(
            ".recent-menu-copy"
        );


    copyHistoryButton.addEventListener(
        "click",
        async function () {

            const expression =
                item.expression || "";


            try {

                await navigator.clipboard.writeText(
                    expression
                );


                alert(
                    "Expression copied!"
                );


            } catch (error) {

                console.error(
                    "History copy error:",
                    error
                );

            }


            menu.classList.remove(
                "open"
            );

        }
    );


    /* =================================================
       SAVE
    ================================================= */

    const saveHistoryButton =
        card.querySelector(
            ".recent-menu-save"
        );


    saveHistoryButton.addEventListener(
        "click",
        async function () {

            await saveHistoryItem(
                item
            );


            menu.classList.remove(
                "open"
            );

        }
    );


    /* =================================================
       DELETE
    ================================================= */

    const deleteHistoryButton =
        card.querySelector(
            ".recent-menu-delete"
        );


    deleteHistoryButton.addEventListener(
        "click",
        async function () {

            const confirmDelete =
                confirm(
                    "Delete this calculation from history?"
                );


            if (!confirmDelete) {

                return;

            }


            await deleteHistoryItem(
                item._id
            );


            menu.classList.remove(
                "open"
            );

        }
    );


    container.appendChild(
        card
    );

});


        } catch (error) {

            console.error(
                "Recent calculations error:",
                error
            );

        }

    }



    /* =====================================================
       3. HTML SECURITY
       ===================================================== */

    function escapeDashboardHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       4. POPULAR EXAMPLES
       ===================================================== */

    document
        .querySelectorAll(
            ".popular-card, .hint-example"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const expression =
                            button.dataset.expression;


                        if (!expressionInput) {
                            return;
                        }


                        /*
                         * Integration / differentiation
                         * go to AI Calculator.
                         */

                        if (
                            expression &&
                            (
                                expression
                                    .toLowerCase()
                                    .includes("integrate")
                                ||
                                expression
                                    .toLowerCase()
                                    .includes("derivative")
                            )
                        ) {

                            window.location.href =
                                "ai-calculator.html";

                            return;

                        }


                        expressionInput.value =
                            expression || "";


                        expressionInput.focus();

                    }
                );

            }
        );



    /* =====================================================
       5. VOICE BUTTON
       ===================================================== */
/* =====================================================
   5. DASHBOARD VOICE INPUT
===================================================== */

/* =====================================================
   5. DASHBOARD VOICE INPUT
===================================================== */

const dashboardMic =
    document.getElementById("dashboardMic");

const dashboardResult =
    document.getElementById("dashboardResult");


if (dashboardMic && expressionInput) {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        dashboardMic.addEventListener(
            "click",
            function () {

                alert(
                    "Voice recognition is not supported. Please use Google Chrome."
                );

            }
        );

    } else {

        const recognition =
            new SpeechRecognition();


        recognition.lang = "en-US";

        recognition.continuous = false;

        recognition.interimResults = false;


        let isListening = false;


        /* ==========================================
           START / STOP MICROPHONE
        ========================================== */

        dashboardMic.addEventListener(
            "click",
            function () {

                if (isListening) {

                    recognition.stop();

                    return;

                }


                try {

                    recognition.start();

                    isListening = true;

                    dashboardMic.classList.add(
                        "listening"
                    );

                    dashboardMic.innerHTML = `
    <span class="voice-wave">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </span>
`;

                } catch (error) {

                    console.error(
                        "Microphone error:",
                        error
                    );

                }

            }
        );


        /* ==========================================
           VOICE RESULT
        ========================================== */

        recognition.onresult = function (event) {

    const alternatives = [];

    for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript);
    }

    // Same engine as Voice Input
    const bestText = chooseBestVoiceResult(alternatives);

    const expression = convertVoiceToMath(bestText);

    expressionInput.value = expression;

    currentExpression = expression;

    calculateDashboardVoice();
};

        /* ==========================================
           MICROPHONE STARTED
        ========================================== */

        recognition.onstart =
            function () {

                dashboardMic.classList.add(
                    "listening"
                );

               recognition.onstart =
    function () {

        dashboardMic.classList.add(
            "listening"
        );

        dashboardMic.innerHTML = `
            <span class="voice-wave">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </span>
        `;

    };

            };


        /* ==========================================
           MICROPHONE ENDED
        ========================================== */

        recognition.onend =
            function () {

                isListening = false;

                dashboardMic.classList.remove(
                    "listening"
                );

                dashboardMic.innerHTML =
                    '<i class="fa-solid fa-microphone"></i>';

            }
        /* ==========================================
           MICROPHONE ERROR
        ========================================== */

        recognition.onerror =
            function (event) {

                console.error(
                    "Voice recognition error:",
                    event.error
                );


                isListening = false;

                dashboardMic.classList.remove(
                    "listening"
                );

                dashboardMic.innerHTML =
                    '<i class="fa-solid fa-microphone"></i>';


                if (
                    event.error ===
                    "not-allowed"
                ) {

                    alert(
                        "Please allow microphone permission in Chrome."
                    );

                }

            };

    }

}


/* =====================================================
   CONVERT VOICE TO MATH
===================================================== */

function convertDashboardVoiceToMath(
    input
) {

    let text =
        input
            .toLowerCase()
            .trim();


    /* ---------------------------------
       REMOVE PUNCTUATION
    --------------------------------- */

    text =
        text.replace(
            /[?,!]/g,
            " "
        );


    /* ---------------------------------
       BRACKETS
    --------------------------------- */

    text =
        text.replace(
            /\bopen bracket\b/g,
            "("
        );

    text =
        text.replace(
            /\bclose bracket\b/g,
            ")"
        );

    text =
        text.replace(
            /\bopen parenthesis\b/g,
            "("
        );

    text =
        text.replace(
            /\bclose parenthesis\b/g,
            ")"
        );


    /* ---------------------------------
       MULTIPLICATION
    --------------------------------- */

    text =
        text.replace(
            /\bmultiplied by\b/g,
            "*"
        );

    text =
        text.replace(
            /\bmultiply by\b/g,
            "*"
        );

    text =
        text.replace(
            /\btimes\b/g,
            "*"
        );

    /*
     * IMPORTANT:
     * User wants "into"
     * for multiplication.
     */

    text =
        text.replace(
            /\binto\b/g,
            "*"
        );


    /* ---------------------------------
       DIVISION
    --------------------------------- */

    text =
        text.replace(
            /\bdivided by\b/g,
            "/"
        );

    text =
        text.replace(
            /\bdivide by\b/g,
            "/"
        );

    text =
        text.replace(
            /\bover\b/g,
            "/"
        );


    /* ---------------------------------
       ADDITION
    --------------------------------- */

    text =
        text.replace(
            /\bplus\b/g,
            "+"
        );

    text =
        text.replace(
            /\badd\b/g,
            "+"
        );


    /* ---------------------------------
       SUBTRACTION
    --------------------------------- */

    text =
        text.replace(
            /\bminus\b/g,
            "-"
        );

    text =
        text.replace(
            /\bsubtract\b/g,
            "-"
        );


    /* ---------------------------------
       POWERS
    --------------------------------- */

    text =
        text.replace(
            /\bto the power of\b/g,
            "^"
        );

    text =
        text.replace(
            /\bpower of\b/g,
            "^"
        );


    /* ---------------------------------
       SQUARE ROOT
    --------------------------------- */

    text =
        text.replace(
            /\bsquare root of\b/g,
            "sqrt"
        );

    text =
        text.replace(
            /\bsquare root\b/g,
            "sqrt"
        );


    /* ---------------------------------
       TRIGONOMETRY
    --------------------------------- */

    text =
        text.replace(
            /\bsine\b/g,
            "sin"
        );

    text =
        text.replace(
            /\bcosine\b/g,
            "cos"
        );

    text =
        text.replace(
            /\btangent\b/g,
            "tan"
        );


    /* ---------------------------------
       REMOVE "OF"
       FROM FUNCTIONS
    --------------------------------- */

    text =
        text.replace(
            /\b(sin|cos|tan|sqrt)\s+of\b/g,
            "$1"
        );


    /* ---------------------------------
       EXTRA SPACES
    --------------------------------- */

    text =
        text.replace(
            /\s+/g,
            " "
        )
        .trim();


    /*
     * Add brackets automatically for
     * simple functions:
     *
     * sqrt 144 -> sqrt(144)
     * sin 30  -> sin(30)
     */

    text =
        text.replace(
            /\bsqrt\s+(-?\d+(?:\.\d+)?)/g,
            "sqrt($1)"
        );

    text =
        text.replace(
            /\b(sin|cos|tan)\s+(-?\d+(?:\.\d+)?)/g,
            "$1($2)"
        );


    return text;
}


/* =====================================================
   AUTOMATIC DASHBOARD CALCULATION
===================================================== */

function calculateDashboardVoice() {

    if (!expressionInput) {
        return;
    }


    const expression =
        expressionInput.value.trim();


    if (!expression) {
        return;
    }


    /*
     * If dashboard already has a Calculate
     * button, use it.
     */

    const calculateButton =
        document.querySelector(
            "#dashboardCalculate"
        );


    if (calculateButton) {

        calculateButton.click();


        /*
         * Wait for the existing calculator
         * to update the result.
         */

        setTimeout(
            function () {

                speakDashboardResult();

            },
            300
        );


        return;

    }


    /*
     * Fallback calculation for basic
     * arithmetic.
     */

    try {

        const safeExpression =
            expression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/\^/g, "**");


        if (
            !/^[0-9+\-*/().\s*]+$/.test(
                safeExpression
            )
        ) {

            console.log(
                "Dashboard calculator button not found."
            );

            return;

        }


        const answer =
            Function(
                `"use strict"; return (${safeExpression})`
            )();


        if (
            !Number.isFinite(answer)
        ) {

            throw new Error(
                "Invalid result"
            );

        }


        if (dashboardResult) {

            dashboardResult.textContent =
                Number(
                    answer.toFixed(10)
                ).toString();

        }


        speakDashboardAnswer(
            answer
        );


    } catch (error) {

        console.error(
            "Voice calculation error:",
            error
        );

    }

}


/* =====================================================
   SPEAK RESULT
===================================================== */

function speakDashboardResult() {

    if (!dashboardResult) {
        return;
    }


    const result =
        dashboardResult.textContent.trim();


    if (
        !result ||
        result === "0" ||
        result === "—" ||
        result === "Error"
    ) {

        return;

    }


    speakDashboardAnswer(
        result
    );

}


/* =====================================================
   TEXT TO SPEECH
===================================================== */

function speakDashboardAnswer(
    answer
) {

    if (
        !("speechSynthesis" in window)
    ) {

        console.log(
            "Text-to-Speech is not supported."
        );

        return;

    }


    /*
     * Stop previous speech.
     */

    window.speechSynthesis.cancel();


    const speechText =
        `The answer is ${answer}`;


    const utterance =
        new SpeechSynthesisUtterance(
            speechText
        );


    utterance.lang =
        "en-US";


    utterance.rate =
        0.9;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}    /* =====================================================
       6. KEYBOARD BUTTON
       ===================================================== */

    if (keyboardButton) {

        keyboardButton.addEventListener(
            "click",
            function () {

                if (!expressionInput) {
                    return;
                }


                expressionInput.focus();


                expressionInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    }



    /* =====================================================
       7. COPY RESULT
       ===================================================== */

    if (copyButton) {

        copyButton.addEventListener(
            "click",
            async function () {

                if (!resultDisplay) {
                    return;
                }


                const result =
                    resultDisplay.textContent.trim();


                if (!result) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        result
                    );


                    const oldText =
                        copyButton.textContent;


                    copyButton.textContent =
                        "✓";


                    setTimeout(
                        function () {

                            copyButton.textContent =
                                oldText || "▣";

                        },
                        1500
                    );


                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                    alert(
                        "Could not copy the result."
                    );

                }

            }
        );

    }



    /* =====================================================
       8. FULLSCREEN RESULT
       ===================================================== */

    if (fullscreenButton) {

        fullscreenButton.addEventListener(
            "click",
            async function () {

                const resultBox =
                    document.querySelector(
                        ".dashboard-result-box"
                    );


                if (!resultBox) {
                    return;
                }


                try {

                    if (
                        !document.fullscreenElement
                    ) {

                        await resultBox.requestFullscreen();

                    } else {

                        await document.exitFullscreen();

                    }

                } catch (error) {

                    console.error(
                        "Fullscreen error:",
                        error
                    );

                }

            }
        );

    }



    /* =====================================================
       9. AI ASSISTANT TAB
       ===================================================== */

    const aiTab =
        document.querySelector(
            '[data-mode="ai"]'
        );


    if (aiTab) {

        aiTab.addEventListener(
            "click",
            function () {

                window.location.href =
                    "ai-calculator.html";

            }
        );

    }



    /* =====================================================
       10. CALCULATOR TABS
       ===================================================== */

    document
        .querySelectorAll(
            ".calculator-tab"
        )
        .forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        const mode =
                            tab.dataset.mode;


                        /*
                         * AI
                         */

                        if (
                            mode === "ai"
                        ) {

                            window.location.href =
                                "ai-calculator.html";

                            return;

                        }


                        /*
                         * Graphing
                         */

                        if (
                            mode === "graphing"
                        ) {

                            window.location.href =
                                "graph.html";

                            return;

                        }


                        /*
                         * Other calculator modes
                         *
                         * Open the main calculator
                         * where the actual scientific
                         * calculator exists.
                         */

                        if (
                            mode === "standard" ||
                            mode === "scientific" ||
                            mode === "matrix" ||
                            mode === "equation"
                        ) {

                            window.location.href =
                                "calculator.html";

                        }

                    }
                );

            }
        );



    /* =====================================================
       11. DASHBOARD CALCULATE BUTTON
       ===================================================== */

    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            calculateDashboardExpression
        );

    }



    async function calculateDashboardExpression() {

        if (
            !expressionInput ||
            !resultDisplay
        ) {

            return;

        }


        const expression =
            expressionInput.value.trim();


        if (!expression) {

            resultDisplay.textContent =
                "Enter an expression";

            return;

        }


        try {

            const answer =
                evaluateDashboardExpression(
                    expression
                );


            resultDisplay.textContent =
                formatDashboardResult(
                    answer
                );


            /*
             * Save to MongoDB
             */

            await saveDashboardCalculation(
                expression,
                answer
            );


            /*
             * Refresh Recent History
             */

            loadRecentCalculations();


        } catch (error) {

            console.error(
                "Dashboard calculation error:",
                error
            );


            resultDisplay.textContent =
                "Error";

        }

    }
/* =====================================================
   RECENT HISTORY TIME
===================================================== */

function formatRecentTime(dateValue) {

    const date =
        new Date(dateValue);

    const now =
        new Date();

    const difference =
        Math.floor(
            (now - date) / 1000
        );


    if (difference < 60) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            difference / 60
        );


    if (minutes < 60) {

        return minutes === 1
            ? "1 min ago"
            : `${minutes} mins ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return hours === 1
            ? "1 hour ago"
            : `${hours} hours ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    return days === 1
        ? "1 day ago"
        : `${days} days ago`;

}



/* =====================================================
   SAVE HISTORY ITEM
===================================================== */

async function saveHistoryItem(item) {

    const token =
        localStorage.getItem(
            "calcuraToken"
        );


    if (!token) {

        alert(
            "Please login first."
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

                        expression:
                            item.expression,

                        result:
                            String(
                                item.result || ""
                            )

                    })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save"
            );

        }


        alert(
            "✓ Calculation saved!"
        );


    } catch (error) {

        console.error(
            "Save history error:",
            error
        );


        alert(
            "Could not save calculation."
        );

    }

}



/* =====================================================
   DELETE HISTORY ITEM
===================================================== */

async function deleteHistoryItem(
    calculationId
) {

    const token =
        localStorage.getItem(
            "calcuraToken"
        );


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/calculations/${calculationId}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Delete failed"
            );

        }


        /*
         * Refresh history immediately
         */

        loadRecentCalculations();


    } catch (error) {

        console.error(
            "Delete history error:",
            error
        );


        alert(
            "Could not delete calculation."
        );

    }

}



    /* =====================================================
       12. CALCULATOR ENGINE
       ===================================================== */

   function evaluateDashboardExpression(input) {

    let expression = input.trim();

    // Mathematical symbols
    expression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");

    // Percentage
    expression = expression.replace(
        /(\d+(?:\.\d+)?)%/g,
        "($1/100)"
    );

    // Constants
    expression = expression.replace(
        /\bpi\b/gi,
        "Math.PI"
    );

    expression = expression.replace(
        /\be\b/g,
        "Math.E"
    );

    // Square root
    expression = expression.replace(
        /sqrt\s*\(/gi,
        "Math.sqrt("
    );

    // Cube root
    expression = expression.replace(
        /cbrt\s*\(/gi,
        "Math.cbrt("
    );

    // Trigonometry - degrees
    expression = expression.replace(
        /sin\s*\(([^()]*)\)/gi,
        "(Math.sin(($1)*Math.PI/180))"
    );

    expression = expression.replace(
        /cos\s*\(([^()]*)\)/gi,
        "(Math.cos(($1)*Math.PI/180))"
    );

    expression = expression.replace(
        /tan\s*\(([^()]*)\)/gi,
        "(Math.tan(($1)*Math.PI/180))"
    );

    // Inverse trigonometry - result in degrees
    expression = expression.replace(
        /asin\s*\(([^()]*)\)/gi,
        "(Math.asin($1)*180/Math.PI)"
    );

    expression = expression.replace(
        /acos\s*\(([^()]*)\)/gi,
        "(Math.acos($1)*180/Math.PI)"
    );

    expression = expression.replace(
        /atan\s*\(([^()]*)\)/gi,
        "(Math.atan($1)*180/Math.PI)"
    );

    // Logarithms
    expression = expression.replace(
        /log\s*\(/gi,
        "Math.log10("
    );

    expression = expression.replace(
        /ln\s*\(/gi,
        "Math.log("
    );

    // Power
    expression = expression.replace(
        /\^/g,
        "**"
    );

    // Factorial
    expression = expression.replace(
        /(\d+(?:\.\d+)?)!/g,
        function (match, number) {
            return factorial(Number(number));
        }
    );

    // Combination: nCr(5,2)
    expression = expression.replace(
        /nCr\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
        function (match, n, r) {
            return combination(
                Number(n),
                Number(r)
            );
        }
    );

    // Permutation: nPr(5,2)
    expression = expression.replace(
        /nPr\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
        function (match, n, r) {
            return permutation(
                Number(n),
                Number(r)
            );
        }
    );

    // Security validation
    const allowed =
        /^[0-9+\-*/().,\sA-Za-z_*]+$/;

    if (!allowed.test(expression)) {
        throw new Error("Invalid expression");
    }

    // Calculate
    const calculate =
        new Function(
            `"use strict"; return (${expression});`
        );

    const result = calculate();

    // Result validation
    if (
        typeof result !== "number" ||
        !Number.isFinite(result)
    ) {
        throw new Error("Invalid result");
    }

    return result;
}



    /* =====================================================
       13. FACTORIAL
       ===================================================== */

    function factorial(number) {

        if (
            !Number.isInteger(number) ||
            number < 0
        ) {

            throw new Error(
                "Invalid factorial"
            );

        }


        if (number > 170) {

            throw new Error(
                "Number too large"
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
    function combination(n, r) {
    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        r < 0 ||
        n < 0 ||
        r > n
    ) {
        throw new Error("Invalid combination");
    }

    return factorial(n) /
        (factorial(r) * factorial(n - r));
}


function permutation(n, r) {
    if (
        !Number.isInteger(n) ||
        !Number.isInteger(r) ||
        r < 0 ||
        n < 0 ||
        r > n
    ) {
        throw new Error("Invalid permutation");
    }

    return factorial(n) /
        factorial(n - r);
}



    /* =====================================================
       14. FORMAT RESULT
       ===================================================== */

    function formatDashboardResult(
        value
    ) {

        if (
            Math.abs(value) < 1e-12
        ) {

            value = 0;

        }


        if (
            Number.isInteger(value)
        ) {

            return String(value);

        }


        return Number(
            value.toFixed(10)
        ).toString();

    }



    /* =====================================================
       15. SAVE CALCULATION TO MONGODB
       ===================================================== */

    async function saveDashboardCalculation(
        expression,
        result
    ) {

        const token =
            localStorage.getItem(
                "calcuraToken"
            );


        if (!token) {
            return;
        }


        try {

            const response =
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

                            expression:
                                expression,

                            result:
                                String(result),

                            type:
                                "calculator"

                        })

                    }
                );


            if (!response.ok) {

                const data =
                    await response.json();

                console.error(
                    "Calculation save failed:",
                    data.message
                );

            }

        } catch (error) {

            console.error(
                "MongoDB save error:",
                error
            );

        }

    }



    /* =====================================================
       16. SEARCH
       ===================================================== */

    if (searchInput) {

        searchInput.setAttribute(
            "autocomplete",
            "off"
        );


        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Enter"
                ) {

                    return;

                }


                const query =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!query) {
                    return;
                }


                /*
                 * Calculator
                 */

                if (
                    query.includes(
                        "calculator"
                    ) ||
                    query.includes(
                        "calculate"
                    ) ||
                    query.includes(
                        "math"
                    )
                ) {

                    window.location.href =
                        "calculator.html";

                    return;

                }


                /*
                 * Voice
                 */

                if (
                    query.includes(
                        "voice"
                    ) ||
                    query.includes(
                        "speak"
                    )
                ) {

                    window.location.href =
                        "voice-input.html";

                    return;

                }


                /*
                 * Graph
                 */

                if (
                    query.includes(
                        "graph"
                    ) ||
                    query.includes(
                        "plot"
                    )
                ) {

                    window.location.href =
                        "graph.html";

                    return;

                }


                /*
                 * Formula
                 */

                if (
                    query.includes(
                        "formula"
                    )
                ) {

                    window.location.href =
                        "formulas.html";

                    return;

                }


                /*
                 * Converter
                 */

                if (
                    query.includes(
                        "converter"
                    ) ||
                    query.includes(
                        "conversion"
                    ) ||
                    query.includes(
                        "unit"
                    )
                ) {

                    window.location.href =
                        "converter.html";

                    return;

                }


                /*
                 * History
                 */

                if (
                    query.includes(
                        "history"
                    )
                ) {

                    window.location.href =
                        "history.html";

                    return;

                }


                /*
                 * Saved
                 */

                if (
                    query.includes(
                        "saved"
                    )
                ) {

                    window.location.href =
                        "saved.html";

                    return;

                }


                /*
                 * Settings
                 */

                if (
                    query.includes(
                        "setting"
                    )
                ) {

                    window.location.href =
                        "settings.html";

                    return;

                }


                /*
                 * Profile
                 */

                if (
                    query.includes(
                        "profile"
                    )
                ) {

                    window.location.href =
                        "profile.html";

                    return;

                }


                /*
                 * AI
                 */

                if (
                    query.includes(
                        "ai"
                    )
                ) {

                    window.location.href =
                        "ai-calculator.html";

                    return;

                }


                /*
                 * Help
                 */

                if (
                    query.includes(
                        "help"
                    )
                ) {

                    window.location.href =
                        "help.html";

                    return;

                }


                alert(
                    "No matching Calcura tool found."
                );

            }
        );

    }



    /* =====================================================
       17. NOTIFICATION
       ===================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                alert(
                    "🔔 No new notifications."
                );

            }
        );

    }



    /* =====================================================
       18. KEYBOARD SHORTCUT
       ===================================================== */

    if (expressionInput) {

        expressionInput.addEventListener(
            "keydown",
            function (event) {

                /*
                 * Ctrl + Enter
                 */

                if (
                    event.key === "Enter" &&
                    event.ctrlKey
                ) {

                    event.preventDefault();

                    calculateDashboardExpression();

                }

            }
        );

    }

});
