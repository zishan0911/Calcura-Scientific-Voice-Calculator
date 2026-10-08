// ==========================================================
// CALCURA - HISTORY PAGE
// ==========================================================
let allHistory = [];
let filteredHistory = [];

let currentPage = 1;
let itemsPerPage = 10;


// ==========================================================
// DOM ELEMENTS
// ==========================================================

const historyList =
    document.getElementById("historyList");

const historySearch =
    document.getElementById("historySearch");

const historyTypeFilter =
    document.getElementById("historyTypeFilter");

const selectAllHistory =
    document.getElementById("selectAllHistory");

const deleteSelectedBtn =
    document.getElementById("deleteSelectedBtn");

// ==========================================================
// DELETE SELECTION MODE
// ==========================================================

let selectionMode = false;

const exportHistoryBtn =
    document.getElementById("exportHistoryBtn");

const historyPerPage =
    document.getElementById("historyPerPage");

const historyStart =
    document.getElementById("historyStart");

const historyEnd =
    document.getElementById("historyEnd");

const historyTotal =
    document.getElementById("historyTotal");

const totalCalculations =
    document.getElementById("totalCalculations");

const totalFormulas =
    document.getElementById("totalFormulas");

const totalConversions =
    document.getElementById("totalConversions");

const totalGraphs =
    document.getElementById("totalGraphs");

const recentActivity =
    document.getElementById("recentActivity");
// ==========================================================
// LOAD LOGGED-IN USER FROM BACKEND
// ==========================================================

async function loadHistoryUser() {

    const userNameElement =
        document.getElementById("historyUserName");

    const userAvatarElement =
        document.getElementById("historyUserAvatar");

    const userPlanElement =
        document.getElementById("historyUserPlan");


    if (
        !userNameElement ||
        !userAvatarElement
    ) {
        return;
    }


    try {

        // Get current logged-in user from backend
        const currentUser =
            await getCurrentUser();


        if (!currentUser) {
            return;
        }


        const userData =
            currentUser.user ||
            currentUser;


        // USER NAME
        if (userData.name) {

            userNameElement.textContent =
                userData.name;


            // USER AVATAR
            userAvatarElement.textContent =
                userData.name
                    .trim()
                    .charAt(0)
                    .toUpperCase();
        }


        // USER PLAN
        if (userPlanElement) {

            userPlanElement.textContent =
                userData.plan ||
                "Free Plan";
        }


    } catch (error) {

        console.error(
            "History user loading error:",
            error
        );

    }

}
// ==========================================================
// LOAD HISTORY
// ==========================================================

async function loadHistory() {

    try {

        const token =
            localStorage.getItem("calcuraToken");

        if (!token) {

            showLoginRequired();

            return;
        }


        // ==========================================
        // LOAD CALCULATION HISTORY
        // ==========================================

        const calculationsResponse =
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


        const calculationsData =
            await calculationsResponse.json();


        if (!calculationsResponse.ok) {

            throw new Error(
                calculationsData.message ||
                "Failed to load calculation history"
            );

        }


        // ==========================================
        // LOAD GRAPH HISTORY
        // ==========================================

        const graphsResponse =
            await fetch(
                "http://localhost:5000/api/graphs",
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


        const graphsData =
            await graphsResponse.json();


        if (!graphsResponse.ok) {

            throw new Error(
                graphsData.message ||
                "Failed to load graph history"
            );

        }


        // ==========================================
        // CALCULATIONS
        // ==========================================

        const calculations =
            calculationsData.calculations || [];


        // ==========================================
        // CONVERT GRAPHS TO HISTORY FORMAT
        // ==========================================

        const graphs =
            (graphsData.graphs || [])
                .map(graph => {

                    let expression = "";
                    let result = "Graph";

                    if (
                        graph.mode === "function"
                    ) {

                        expression =
                            `y = ${
                                graph.functionExpression || ""
                            }`;

                    }

                    else if (
                        graph.mode === "parametric"
                    ) {

                        expression =
                            `x(t) = ${
                                graph.parametricX || ""
                            }, y(t) = ${
                                graph.parametricY || ""
                            }`;

                    }

                    else if (
                        graph.mode === "polar"
                    ) {

                        expression =
                            `r = ${
                                graph.polarExpression || ""
                            }`;

                    }

                    else if (
                        graph.mode === "3d"
                    ) {

                        expression =
                            `z = ${
                                graph.graph3DExpression || ""
                            }`;

                    }

                    else {

                        expression =
                            graph.title ||
                            "Untitled Graph";

                    }


                    return {

                        _id:
                            graph._id,

                        expression:
                            expression,

                        result:
                            result,

                        type:
                            "Graph",

                        source:
                            "graph",

                        createdAt:
                            graph.createdAt,

                        graphData:
                            graph

                    };

                });

// ==========================================
// LOAD CONVERTER HISTORY
// ==========================================

const converterResponse =
    await fetch(
        "http://localhost:5000/api/converter",
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

const converterData =
    await converterResponse.json();

if (!converterResponse.ok) {

    throw new Error(
        converterData.message ||
        "Failed to load converter history"
    );
}


// ==========================================
// CONVERTER HISTORY
// ==========================================

const conversions =
    (converterData.conversions || [])
        .map(conversion => {

            return {

                _id:
                    conversion._id,

                expression:
                    `${conversion.inputValue} ${conversion.fromUnit} → ${conversion.outputValue} ${conversion.toUnit}`,

                result:
                    conversion.result,

                type:
                    "Unit Conversion",

                source:
                    "converter",

                createdAt:
                    conversion.createdAt,

                converterData:
                    conversion
            };

        });
        // ==========================================
        // COMBINE BOTH
        // ==========================================

        allHistory = [

            ...calculations,

            ...graphs,

            ...conversions

        ];


        // ==========================================
        // NEWEST FIRST
        // ==========================================

        allHistory.sort(
            (a, b) => {

                return new Date(
                    b.createdAt || 0
                ) -
                new Date(
                    a.createdAt || 0
                );

            }
        );


        filteredHistory =
            [...allHistory];


        // ==========================================
        // UPDATE PAGE
        // ==========================================

        updateOverview();

        updateRecentActivity();

        applyFilters();

    }


    catch (error) {

        console.error(
            "History error:",
            error
        );

        showError(
            error.message
        );

    }

}


// ==========================================================
// LOGIN REQUIRED
// ==========================================================

function showLoginRequired() {

    if (!historyList) return;

    historyList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                <i class="fa-solid fa-lock"></i>
            </div>

            <h2>Login Required</h2>

            <p>
                Please login to view your
                calculation history.
            </p>

            <a
                href="../login.html"
                class="calculator-btn"
            >
                Login
            </a>

        </div>

    `;
}


// ==========================================================
// ERROR
// ==========================================================

function showError(message) {

    if (!historyList) return;

    historyList.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>

            <h2>Unable to Load History</h2>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;
}


// ==========================================================
// DETERMINE CALCULATION TYPE
// ==========================================================

function getHistoryType(item) {

    const expression =
        String(
            item.expression || ""
        ).toLowerCase()
        .trim();

    const result =
        String(
            item.result || ""
        ).toLowerCase()
        .trim();

    const savedType =
        String(
            item.type || ""
        ).toLowerCase()
        .trim();

    const combined =
        `${expression} ${result}`;


    // ======================================================
    // USE SAVED TYPE WHEN IT IS SPECIFIC
    // ======================================================

    if (
        savedType === "trigonometry" ||
        savedType === "trig"
    ) {
        return "Trigonometry";
    }

    if (
        savedType === "calculus" ||
        savedType === "integration" ||
        savedType === "derivative"
    ) {
        return "Calculus";
    }

    if (
        savedType === "unit" ||
        savedType === "unit conversion" ||
        savedType === "conversion"
    ) {
        return "Unit Conversion";
    }

    if (
        savedType === "graph" ||
        savedType === "plot"
    ) {
        return "Graph";
    }

    if (
        savedType === "formula"
    ) {
        return "Formula";
    }

    if (
        savedType === "logarithm" ||
        savedType === "log"
    ) {
        return "Logarithm";
    }


    // ======================================================
    // UNIT CONVERSION
    // ======================================================

    if (
        /\b(km|m|cm|mm|mile|miles|meter|meters|ft|feet|in|inch|inches)\b/
            .test(combined) &&

        (
            /\b(to|in)\b/.test(combined) ||
            combined.includes("→")
        )
    ) {
        return "Unit Conversion";
    }

    if (
        /\b(kg|g|mg|lb|lbs|pound|pounds|oz)\b/
            .test(combined) &&

        (
            /\b(to|in)\b/.test(combined) ||
            combined.includes("→")
        )
    ) {
        return "Unit Conversion";
    }

    if (
        /\b(c|°c|fahrenheit|celsius|°f|f)\b/
            .test(combined) &&

        (
            /\b(to|in)\b/.test(combined) ||
            combined.includes("→")
        )
    ) {
        return "Unit Conversion";
    }

    if (
        /\b(mph|kmh|km\/h|speed)\b/
            .test(combined)
    ) {
        return "Unit Conversion";
    }


    // ======================================================
    // GRAPH
    // ======================================================

    if (
        /\b(plot|graph|curve|y\s*=|x\s*=)\b/
            .test(combined)
    ) {
        return "Graph";
    }


    // ======================================================
    // TRIGONOMETRY
    // ======================================================

    if (
        /\b(sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan)\b/
            .test(expression)
    ) {
        return "Trigonometry";
    }


    // ======================================================
    // LOGARITHM
    // ======================================================

    if (
        /\b(log|ln|log10)\b/
            .test(expression)
    ) {
        return "Logarithm";
    }


    // ======================================================
    // CALCULUS
    // ======================================================

    if (
        combined.includes("integrat") ||
        combined.includes("derivative") ||
        combined.includes("differentiat") ||
        combined.includes("limit") ||
        combined.includes("d/dx")
    ) {
        return "Calculus";
    }


    // ======================================================
    // FORMULA
    // ======================================================

    if (
        combined.includes("formula") ||
        combined.includes("quadratic formula") ||
        combined.includes("area of") ||
        combined.includes("volume of") ||
        combined.includes("perimeter of")
    ) {
        return "Formula";
    }


    // ======================================================
    // DEFAULT
    // ======================================================

    return "Basic";
}

// ==========================================================
// TYPE CLASS
// ==========================================================

function getTypeClass(type) {

    const classes = {

        "Basic":
            "type-basic",

        "Trigonometry":
            "type-trigonometry",

        "Calculus":
            "type-calculus",

        "Unit Conversion":
            "type-unit",

        "Graph":
            "type-graph",

        "Formula":
            "type-formula",

        "Logarithm":
            "type-log"

    };


    return classes[type] ||
        "type-basic";
}


// ==========================================================
// TYPE ICON
// ==========================================================

function getTypeIcon(type) {

    const icons = {

        "Basic":
            "fa-solid fa-calculator",

        "Trigonometry":
            "fa-solid fa-wave-square",

        "Calculus":
            "fa-solid fa-function",

        "Unit Conversion":
            "fa-solid fa-right-left",

        "Graph":
            "fa-solid fa-chart-line",

        "Formula":
            "fa-solid fa-book",

        "Logarithm":
            "fa-solid fa-square-root-variable"

    };


    return icons[type] ||
        "fa-solid fa-calculator";
}


// ==========================================================
// UPDATE HISTORY OVERVIEW
// ==========================================================

function updateOverview() {

    const total =
        allHistory.length;


    let formulas = 0;
    let conversions = 0;
    let graphs = 0;


    allHistory.forEach(
        function (item) {

            const type =
                getHistoryType(item);


            // Formula section includes
            // Formula + Calculus
            if (
                type === "Formula" ||
                type === "Calculus"
            ) {
                formulas++;
            }


            if (
                type === "Unit Conversion"
            ) {
                conversions++;
            }


            if (
                type === "Graph"
            ) {
                graphs++;
            }

        }
    );


    if (totalCalculations) {

        totalCalculations.textContent =
            total;

    }


    if (totalFormulas) {

        totalFormulas.textContent =
            formulas;

    }


    if (totalConversions) {

        totalConversions.textContent =
            conversions;

    }


    if (totalGraphs) {

        totalGraphs.textContent =
            graphs;

    }

}


// ==========================================================
// RECENT ACTIVITY
// ==========================================================

function updateRecentActivity() {

    if (!recentActivity) {
        return;
    }


    // No history
    if (allHistory.length === 0) {

        recentActivity.innerHTML = `

            <div class="recent-activity-empty">

                <i class="fa-regular fa-clock"></i>

                <p>
                    Recent calculations
                    will appear here.
                </p>

            </div>

        `;

        return;
    }


    // Show latest 5 calculations
    const recent =
        allHistory.slice(0, 5);


    recentActivity.innerHTML = "";


    recent.forEach(function (item) {

        const type =
            getHistoryType(item);


        const expression =
            item.expression ||
            "Calculation";


        const result =
            item.result ?? "";


        const date =
            item.createdAt
                ? new Date(item.createdAt)
                : null;


        const activity =
            document.createElement("div");


        activity.className =
            "recent-activity-item";


        activity.innerHTML = `

            <!-- ICON -->

            <div
                class="recent-activity-icon
                       ${getTypeClass(type)}"
            >

                <i
                    class="${getTypeIcon(type)}"
                ></i>

            </div>


            <!-- CONTENT -->

            <div class="recent-activity-content">

                <div class="recent-activity-expression">

                    ${escapeHTML(expression)}

                </div>


                <div class="recent-activity-result">

                    = ${escapeHTML(String(result))}

                </div>


                <div class="recent-activity-meta">

                    <span class="recent-activity-type">

                        ${escapeHTML(type)}

                    </span>

                    <span class="recent-activity-time">

                        ${formatRelativeTime(date)}

                    </span>

                </div>

            </div>

        `;


        recentActivity.appendChild(
            activity
        );

    });

}


// ==========================================================
// SEARCH + FILTER
// ==========================================================

function applyFilters() {

    const search =
        historySearch
            ? historySearch.value
                .trim()
                .toLowerCase()
            : "";


    const selectedType =
        historyTypeFilter
            ? historyTypeFilter.value
            : "all";


    filteredHistory =
        allHistory.filter(
            item => {

                const expression =
                    String(
                        item.expression || ""
                    ).toLowerCase();


                const result =
                    String(
                        item.result || ""
                    ).toLowerCase();


                const type =
                    getHistoryType(item);


                const matchesSearch =
                    !search ||
                    expression.includes(search) ||
                    result.includes(search) ||
                    type.toLowerCase()
                        .includes(search);


                const matchesType =
                    selectedType === "all" ||
                    typeMatchesFilter(
                        type,
                        selectedType
                    );


                return (
                    matchesSearch &&
                    matchesType
                );

            }
        );


    currentPage = 1;

    renderHistory();
}


// ==========================================================
// TYPE FILTER
// ==========================================================

function typeMatchesFilter(
    type,
    filter
) {

    const map = {

        basic:
            "Basic",

        trigonometry:
            "Trigonometry",

        calculus:
            "Calculus",

        unit:
            "Unit Conversion",

        graph:
            "Graph",

        formula:
            "Formula",

        logarithm:
            "Logarithm"

    };


    return map[filter] === type;
}


// ==========================================================
// RENDER HISTORY
// ==========================================================

function renderHistory() {

    if (!historyList) return;


    historyList.innerHTML = "";


    if (
        filteredHistory.length === 0
    ) {

        historyList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-regular fa-clock"></i>
                </div>

                <h2>
                    No Calculation History
                </h2>

                <p>
                    No calculations match
                    your current search or filter.
                </p>

                <a
                    href="calculator.html"
                    class="calculator-btn"
                >
                    Open Calculator
                </a>

            </div>

        `;


        updatePagination(
            0,
            0,
            0
        );

        return;
    }


    const total =
        filteredHistory.length;


    const start =
        (currentPage - 1) *
        itemsPerPage;


    const end =
        Math.min(
            start + itemsPerPage,
            total
        );


    const pageItems =
        filteredHistory.slice(
            start,
            end
        );


    pageItems.forEach(
        item => {

            historyList.appendChild(
                createHistoryRow(item)
            );

        }
    );


    updatePagination(
        start + 1,
        end,
        total
    );


    updateSelectAllState();
}


// ==========================================================
// CREATE HISTORY ROW
// ==========================================================

function createHistoryRow(item) {

    const row =
        document.createElement("div");


    row.className =
        "history-card";


    row.dataset.id =
        item._id || "";


    const type =
        getHistoryType(item);


    const expression =
        item.expression || "";


    const result =
        item.result ?? "";


    const date =
        item.createdAt
            ? new Date(item.createdAt)
            : null;


    const formattedDate =
        date
            ? date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            )
            : "—";


    const formattedTime =
        date
            ? date.toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "";


    row.innerHTML = `

        <!-- CHECKBOX -->

        <div class="history-row-checkbox">

            <input
                type="checkbox"
                class="history-item-checkbox"
                data-id="${escapeHTML(
                    item._id || ""
                )}"
            >

        </div>


        <!-- EXPRESSION -->

        <div class="history-expression">

            ${escapeHTML(
                expression
            )}

        </div>


        <!-- RESULT -->

        <div class="history-result">

            ${escapeHTML(
                String(result)
            )}

        </div>


        <!-- TYPE -->

        <div class="history-type-cell">

            <span
                class="history-type-badge
                ${getTypeClass(type)}"
            >

                <i
                    class="${getTypeIcon(type)}"
                ></i>

                ${escapeHTML(type)}

            </span>

        </div>


        <!-- DATE -->

        <div class="history-date">

            <span>
                ${formattedDate}
            </span>

            <small>
                ${formattedTime}
            </small>

        </div>


        <!-- ACTION -->

        <div class="history-row-action">

            <button
                type="button"
                class="history-menu-btn"
                data-id="${escapeHTML(
                    item._id || ""
                )}"
                title="Delete"
            >

                <i
                    class="fa-solid
                    fa-ellipsis-vertical"
                ></i>

            </button>

        </div>

    `;


    const menuButton =
        row.querySelector(
            ".history-menu-btn"
        );


    if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            showHistoryMenu(
                menuButton,
                item
            );

        }
    );

}
// ==========================================================
// HISTORY THREE-DOT MENU
// ==========================================================

function showHistoryMenu(button, item) {

    // Remove any already-open menu
    document
        .querySelectorAll(".history-action-menu")
        .forEach(menu => menu.remove());

    const menu = document.createElement("div");

    menu.className = "history-action-menu";

    menu.innerHTML = `
        <button
            type="button"
            data-action="save"
        >
            <i class="fa-regular fa-bookmark"></i>
            Save
        </button>

        <button
            type="button"
            data-action="delete"
        >
            <i class="fa-solid fa-trash"></i>
            Delete
        </button>
    `;

    document.body.appendChild(menu);

    const rect =
        button.getBoundingClientRect();

    menu.style.position = "fixed";
    menu.style.top =
        `${rect.bottom + 6}px`;

    menu.style.left =
        `${rect.right - 120}px`;

    menu.style.zIndex = "9999";


    // SAVE
    menu
        .querySelector(
            '[data-action="save"]'
        )
        .addEventListener(
            "click",
            async () => {

                menu.remove();

                await saveHistoryItem(item);

            }
        );


    // DELETE
    menu
        .querySelector(
            '[data-action="delete"]'
        )
        .addEventListener(
            "click",
            () => {

                menu.remove();

                deleteHistory(
                    item._id
                );

            }
        );


    // Close menu when clicking outside
    setTimeout(() => {

        document.addEventListener(
            "click",
            function closeMenu(event) {

                if (
                    !menu.contains(
                        event.target
                    ) &&
                    event.target !== button
                ) {

                    menu.remove();

                    document.removeEventListener(
                        "click",
                        closeMenu
                    );

                }

            },
            {
                once: true
            }
        );

    }, 0);

}


// ==========================================================
// SAVE HISTORY ITEM
// ==========================================================

async function saveHistoryItem(item) {

    const token =
        localStorage.getItem("calcuraToken");

    if (!token) {

        alert(
            "Please login first to save."
        );

        return;
    }

    try {

        const historyType =
            getHistoryType(item);

        let saveName =
            item.expression ||
            "Saved Calculation";

       if (historyType === "Graph") {

    saveName =
        `Graph - ${item.expression || "Untitled Graph"}`;

}

else if (item.source === "converter") {

    saveName =
        `Conversion - ${item.expression || "Unit Conversion"}`;

}

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

                        name:
                            saveName,

                        expression:
                            item.expression || "",

                        result:
                            String(
                                item.result ?? ""
                            ),

                        type:
                         item.source === "converter"
                                ? "converter"
                                : historyType.toLowerCase(),

                        category:
                            historyType === "Graph"
                                ? "Graph"
                                : "General"
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                "Saved API error:",
                data
            );

            throw new Error(
                data.message ||
                data.error ||
                "Failed to save"
            );
        }

        alert(
            "Saved successfully."
        );

    } catch (error) {

        console.error(
            "Save history error:",
            error
        );

        alert(
            error.message ||
            "Failed to save."
        );
    }
}


    return row;
}


// ==========================================================
// DELETE ONE HISTORY
// ==========================================================

async function deleteHistory(id) {

    try {

        const token =
            localStorage.getItem("calcuraToken");

        if (!token) {

            alert("Please login first.");

            return;
        }


        const confirmed =
            confirm(
                "Delete this calculation?"
            );

        if (!confirmed) return;


        // Find the actual history item
        const item =
            allHistory.find(
                historyItem =>
                    String(historyItem._id) ===
                    String(id)
            );


        if (!item) {

            throw new Error(
                "History item not found."
            );
        }


        // ==========================================
        // SELECT DELETE API
        // ==========================================

        let deleteUrl =
            `http://localhost:5000/api/calculations/${id}`;


        if (item.source === "graph") {

            deleteUrl =
                `http://localhost:5000/api/graphs/${id}`;

        }


        else if (item.source === "converter") {

            deleteUrl =
                `http://localhost:5000/api/converter/${id}`;

        }


        // ==========================================
        // DELETE
        // ==========================================

        const response =
            await fetch(
                deleteUrl,
                {
                    method: "DELETE",

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
                "Failed to delete history"
            );

        }


        // Reload everything
        await loadHistory();

    }


    catch (error) {

        console.error(
            "Delete history error:",
            error
        );


        alert(
            error.message ||
            "Failed to delete."
        );

    }

}


// ==========================================================
// DELETE SELECTED
// ==========================================================

async function deleteSelectedHistory() {

    const selected =
        document.querySelectorAll(
            ".history-item-checkbox:checked"
        );


    if (
        selected.length === 0
    ) {

        alert(
            "Please select at least one calculation."
        );

        return;
    }


    const confirmed =
        confirm(
            `Delete ${selected.length} selected calculation(s)?`
        );


    if (!confirmed) return;


    const ids =
        Array.from(selected)
            .map(
                checkbox =>
                    checkbox.dataset.id
            );


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

        for (
            const id of ids
        ) {

            const response =
                await fetch(
                    `http://localhost:5000/api/calculations/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {

                const data =
                    await response.json();

                throw new Error(
                    data.message ||
                    "Failed to delete selected history"
                );

            }

        }


        await loadHistory();

    }

    catch (error) {

        console.error(
            "Delete selected error:",
            error
        );

        alert(
            error.message
        );

    }
}


// ==========================================================
// CLEAR ALL HISTORY
// ==========================================================

async function clearHistory() {

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


    if (
        allHistory.length === 0
    ) {

        alert(
            "There is no history to clear."
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to clear all calculation history?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/calculations",
                {
                    method: "DELETE",

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
                "Failed to clear history"
            );
        }


        await loadHistory();

    }

    catch (error) {

        console.error(
            "Clear history error:",
            error
        );

        alert(
            error.message
        );

    }
}


// ==========================================================
// EXPORT HISTORY
// ==========================================================

function exportHistory() {

    if (
        allHistory.length === 0
    ) {

        alert(
            "There is no history to export."
        );

        return;
    }


    let csv =
        "Expression,Result,Type,Date & Time\n";


    allHistory.forEach(
        item => {

            const type =
                getHistoryType(item);


            const date =
                item.createdAt
                    ? new Date(
                        item.createdAt
                    ).toLocaleString()
                    : "";


            csv +=
                `"${csvEscape(
                    item.expression || ""
                )}",` +

                `"${csvEscape(
                    String(
                        item.result ?? ""
                    )
                )}",` +

                `"${csvEscape(
                    type
                )}",` +

                `"${csvEscape(
                    date
                )}"\n`;

        }
    );


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "calcura-history.csv";


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );
}


// ==========================================================
// CSV ESCAPE
// ==========================================================

function csvEscape(value) {

    return String(value)
        .replace(
            /"/g,
            '""'
        );
}


// ==========================================================
// PAGINATION
// ==========================================================

function updatePagination(
    start,
    end,
    total
) {

    if (historyStart) {

        historyStart.textContent =
            total === 0
                ? 0
                : start;
    }


    if (historyEnd) {

        historyEnd.textContent =
            end;
    }


    if (historyTotal) {

        historyTotal.textContent =
            total;
    }


    renderPageButtons(
        total
    );
}


// ==========================================================
// PAGE BUTTONS
// ==========================================================

function renderPageButtons(total) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / itemsPerPage
            )
        );


    const container =
        document.querySelector(
            ".history-page-buttons"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    // ======================================================
    // PREVIOUS BUTTON
    // ======================================================

    const previous =
        document.createElement("button");

    previous.type = "button";

    previous.className =
        "history-page-btn";

    previous.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;

    previous.disabled =
        currentPage === 1;

    previous.addEventListener(
        "click",
        function () {

            if (currentPage > 1) {

                currentPage--;

                renderHistory();

            }

        }
    );

    container.appendChild(previous);


    // ======================================================
    // SHOW ONLY 5 PAGE NUMBERS
    // ======================================================

    const pageGroup =
        Math.floor(
            (currentPage - 1) / 5
        );

    const startPage =
        pageGroup * 5 + 1;

    const endPage =
        Math.min(
            startPage + 4,
            totalPages
        );


    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        const button =
            document.createElement("button");


        button.type = "button";

        button.className =
            "history-page-btn";


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            function () {

                currentPage =
                    page;

                renderHistory();

            }
        );


        container.appendChild(button);

    }


    // ======================================================
    // NEXT BUTTON
    // ======================================================

    const next =
        document.createElement("button");


    next.type = "button";

    next.className =
        "history-page-btn";

    next.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    next.disabled =
        currentPage >= totalPages;


    next.addEventListener(
        "click",
        function () {

            if (
                currentPage < totalPages
            ) {

                // Move to next group of 5
                const nextGroupStart =
                    Math.floor(
                        (currentPage - 1) / 5
                    ) * 5 + 6;


                currentPage =
                    Math.min(
                        nextGroupStart,
                        totalPages
                    );


                renderHistory();

            }

        }
    );


    container.appendChild(next);

}
/* =========================================================
   CREATE PAGE BUTTON
========================================================= */

function createPageButton(page, container) {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "history-page-btn";

    if (page === currentPage) {
        button.classList.add("active");
    }

    button.textContent = page;

    button.addEventListener("click", () => {

        currentPage = page;

        renderHistory();

    });

    container.appendChild(button);
}


// ==========================================================
// SELECT ALL
// ==========================================================

function updateSelectAllState() {

    if (!selectAllHistory) return;


    const checkboxes =
        document.querySelectorAll(
            ".history-item-checkbox"
        );


    const checked =
        document.querySelectorAll(
            ".history-item-checkbox:checked"
        );


    selectAllHistory.checked =
        checkboxes.length > 0 &&
        checked.length ===
        checkboxes.length;
}


// ==========================================================
// RELATIVE TIME
// ==========================================================

function formatRelativeTime(date) {

    if (!date) {

        return "Unknown time";
    }


    const now =
        new Date();


    const difference =
        Math.max(
            0,
            now - date
        );


    const minutes =
        Math.floor(
            difference / 60000
        );


    if (minutes < 1) {

        return "Just now";
    }


    if (minutes < 60) {

        return `${minutes} min ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    return `${days} day${days > 1 ? "s" : ""} ago`;
}


// ==========================================================
// HTML SECURITY
// ==========================================================

function escapeHTML(value) {

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


// ==========================================================
// SEARCH EVENT
// ==========================================================

if (historySearch) {

    historySearch.addEventListener(
        "input",
        () => {

            applyFilters();

        }
    );
}


// ==========================================================
// FILTER EVENT
// ==========================================================

if (historyTypeFilter) {

    historyTypeFilter.addEventListener(
        "change",
        () => {

            applyFilters();

        }
    );
}


// ==========================================================
// SELECT ALL EVENT
// ==========================================================

if (selectAllHistory) {

    selectAllHistory.addEventListener(
        "change",
        function () {

            if (!selectionMode) {
                return;
            }


            const checkboxes =
                document.querySelectorAll(
                    ".history-item-checkbox"
                );


            checkboxes.forEach(
                function (checkbox) {

                    checkbox.checked =
                        selectAllHistory.checked;

                }
            );

        }
    );

}


// ==========================================================
// DELETE SELECTION MODE
// ==========================================================

if (deleteSelectedBtn) {

    deleteSelectedBtn.addEventListener("click", function () {

        // Selection mode OFF → show checkboxes
        if (!selectionMode) {

            selectionMode = true;

            document
                .querySelector(".history-page")
                ?.classList.add("selection-mode");

            deleteSelectedBtn.textContent = "Cancel Selection";

            return;
        }

        // Selection mode ON → check selected items
        const selected = document.querySelectorAll(
            ".history-item-checkbox:checked"
        );

        // Nothing selected → hide checkboxes
        if (selected.length === 0) {

            selectionMode = false;

            document
                .querySelector(".history-page")
                ?.classList.remove("selection-mode");

            if (selectAllHistory) {
                selectAllHistory.checked = false;
            }

            deleteSelectedBtn.textContent = "Delete Selected";

            return;
        }

        // Items selected → delete them
        deleteSelectedHistory();

    });

}


// ==========================================================
// EXPORT EVENT
// ==========================================================

if (exportHistoryBtn) {

    exportHistoryBtn.addEventListener(
        "click",
        exportHistory
    );
}


// ==========================================================
// ITEMS PER PAGE
// ==========================================================

if (historyPerPage) {

    historyPerPage.addEventListener(
        "change",
        () => {

            itemsPerPage =
                Number(
                    historyPerPage.value
                ) || 10;


            currentPage = 1;

            renderHistory();

        }
    );
}


// ==========================================================
// INITIAL LOAD
// ==========================================================

loadHistoryUser();
loadHistory();

// ==========================================
// SHOW LOGGED-IN USER NAME
// ==========================================

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");

const savedUser =
    localStorage.getItem("calcuraUser");

if (savedUser) {

    const user =
        JSON.parse(savedUser);

    const userName =
        user.name ||
        user.fullName ||
        user.username ||
        "User";

    if (profileName) {
        profileName.textContent =
            userName;
    }

    if (profileAvatar) {
        profileAvatar.textContent =
            userName.charAt(0).toUpperCase();
    }
}
