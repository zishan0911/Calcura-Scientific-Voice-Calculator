"use strict";

/* =========================================================
   CALCURA ADMIN — CALCULATIONS
   Real MongoDB Data
========================================================= */

const API_BASE =
    "http://localhost:5000/api/admin/calculations";

const TOKEN_KEY = "calcuraToken";

let currentPage = 1;
let pageLimit = 10;
let totalPages = 1;

let searchTimer = null;

const state = {
    calculations: [],
    users: [],
    typeCounts: {},
    daily: [],
    stats: {}
};


/* =========================================================
   AUTH TOKEN
========================================================= */

function getToken() {
    return (
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}


function authHeaders() {

    const token = getToken();

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`
    };
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   INITIAL
========================================================= */

function getInitial(name) {

    const value =
        String(name || "U").trim();

    return (
        value.charAt(0).toUpperCase() ||
        "U"
    );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
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


function formatTime(value) {

    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleTimeString(
        "en-IN",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   CATEGORY CLASS
========================================================= */

function getCategoryClass(category) {

    const classes = {

        "Basic Arithmetic":
            "type-basic",

        "Trigonometry":
            "type-trig",

        "Algebra":
            "type-algebra",

        "Calculus":
            "type-calculus",

        "Graph/Plot":
            "type-graph",

        "Matrix":
            "type-matrix",

        "Log & Exp":
            "type-log"

    };

    return (
        classes[category] ||
        "type-other"
    );
}


/* =========================================================
   QUERY PARAMETERS
========================================================= */

function buildQuery() {

    const params =
        new URLSearchParams();

    const search =
        document
            .getElementById(
                "calculationSearch"
            )
            ?.value
            .trim();

    const user =
        document
            .getElementById(
                "userFilter"
            )
            ?.value;

    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            ?.value;

    const status =
        document
            .getElementById(
                "statusFilter"
            )
            ?.value;

    const dateFrom =
        document
            .getElementById(
                "dateFrom"
            )
            ?.value;

    const dateTo =
        document
            .getElementById(
                "dateTo"
            )
            ?.value;

    const range =
        Number(
            document
                .getElementById(
                    "activityRange"
                )
                ?.value
        ) || 30;


    params.set(
        "page",
        currentPage
    );

    params.set(
        "limit",
        pageLimit
    );

    params.set(
        "days",
        range
    );


    if (search) {
        params.set(
            "search",
            search
        );
    }


    if (
        user &&
        user !== "all"
    ) {
        params.set(
            "userId",
            user
        );
    }


    if (
        category &&
        category !== "all"
    ) {
        params.set(
            "category",
            category
        );
    }


    if (
        status &&
        status !== "all"
    ) {
        params.set(
            "status",
            status
        );
    }


    if (dateFrom) {
        params.set(
            "from",
            dateFrom
        );
    }


    if (dateTo) {
        params.set(
            "to",
            dateTo
        );
    }


    return params;
}


/* =========================================================
   LOAD CALCULATIONS
========================================================= */

async function loadCalculations() {

    const tbody =
        document.getElementById(
            "calculationsTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="loading-cell"
            >
                <i class="fa-solid fa-spinner fa-spin"></i>
                &nbsp;
                Loading real MongoDB calculations...
            </td>
        </tr>
    `;


    try {

        const query =
            buildQuery();


        const response =
            await fetch(
                `${API_BASE}?${query.toString()}`,
                {
                    method: "GET",
                    headers: {
                        ...authHeaders()
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load calculations"
            );
        }


        state.calculations =
            data.calculations || [];


        state.users =
            data.users || [];


        state.typeCounts =
            data.typeCounts || {};


        state.daily =
            data.daily || [];


        state.stats =
            data.stats || {};


        currentPage =
            data.pagination?.page ||
            currentPage;


        totalPages =
            data.pagination?.pages ||
            1;


        state.total =
            data.pagination?.total ||
            0;


        renderAll();

    }
    catch (error) {

        console.error(
            "Calculations loading error:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-cell"
                >
                    ${escapeHTML(
                        error.message
                    )}
                </td>
            </tr>
        `;
    }
}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderStats();

    renderUsers();

    renderTable();

    renderTypeChart();

    renderDailyChart();

    renderPopularTypes();

    renderPagination();
}


/* =========================================================
   STATISTICS
========================================================= */

function renderStats() {

    const stats =
        state.stats || {};


    const total =
        Number(
            stats.totalCalculations || 0
        );


    const unique =
        Number(
            stats.uniqueUsers || 0
        );


    const saved =
        Number(
            stats.savedCalculations || 0
        );


    const totalElement =
        document.getElementById(
            "totalCalculations"
        );


    const uniqueElement =
        document.getElementById(
            "uniqueUsers"
        );


    const savedElement =
        document.getElementById(
            "savedCalculations"
        );


    const deletedElement =
        document.getElementById(
            "deletedCalculations"
        );


    if (totalElement) {

        totalElement.textContent =
            total.toLocaleString(
                "en-IN"
            );
    }


    if (uniqueElement) {

        uniqueElement.textContent =
            unique.toLocaleString(
                "en-IN"
            );
    }


    if (savedElement) {

        savedElement.textContent =
            saved.toLocaleString(
                "en-IN"
            );
    }


   if (deletedElement) {

    const deleted =
        Number(
            stats.deletedCalculations || 0
        );

    deletedElement.textContent =
        deleted.toLocaleString(
            "en-IN"
        );
}


    const totalChange =
        document.getElementById(
            "totalChange"
        );


    if (totalChange) {

        if (
            stats.totalChange ===
            null ||
            stats.totalChange ===
            undefined
        ) {

            totalChange.textContent =
                "Live database data";

        } else {

            totalChange.textContent =
                `${
                    stats.totalChange >= 0
                        ? "↑"
                        : "↓"
                } ${
                    Math.abs(
                        stats.totalChange
                    )
                }% vs previous period`;
        }
    }


    const uniqueChange =
        document.getElementById(
            "uniqueChange"
        );


    if (uniqueChange) {

        if (
            stats.uniqueChange ===
            null ||
            stats.uniqueChange ===
            undefined
        ) {

            uniqueChange.textContent =
                "Users who made calculations";

        } else {

            uniqueChange.textContent =
                `${
                    stats.uniqueChange >= 0
                        ? "↑"
                        : "↓"
                } ${
                    Math.abs(
                        stats.uniqueChange
                    )
                }% vs previous period`;
        }
    }
}


/* =========================================================
   USER FILTER
========================================================= */

function renderUsers() {

    const select =
        document.getElementById(
            "userFilter"
        );


    if (!select) {
        return;
    }


    const current =
        select.value;


    select.innerHTML = `
        <option value="all">
            All Users
        </option>
    `;


    state.users.forEach(
        user => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                user._id;


            option.textContent =
                `${user.name || "Unknown User"} — ${
                    user.email || ""
                }`;


            select.appendChild(
                option
            );
        }
    );


    const exists =
        Array.from(
            select.options
        ).some(
            option =>
                option.value === current
        );


    select.value =
        exists
            ? current
            : "all";
}


/* =========================================================
   TABLE
========================================================= */

function renderTable() {

    const tbody =
        document.getElementById(
            "calculationsTableBody"
        );


    if (!tbody) {
        return;
    }


    const rows =
        state.calculations || [];


    if (!rows.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-cell"
                >
                    No real calculations found
                    for the selected filters.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        rows
            .map(
                (item, index) => {

                    const name =
                        item.userName ||
                        "Unknown User";


                    const category =
                        item.category ||
                        "Other";


                    const bookmarkKey =
                        `calcura-admin-bookmark-${item._id}`;


                    const bookmarked =
                        localStorage.getItem(
                            bookmarkKey
                        ) === "1";


                    const rowNumber =
                        (
                            (currentPage - 1) *
                            pageLimit
                        ) +
                        index +
                        1;


                    return `
                        <tr>

                            <td>
                                ${rowNumber}
                            </td>


                            <td>

                                <div
                                    class="user-cell"
                                >

                                    <div
                                        class="user-avatar"
                                    >
                                        ${escapeHTML(
                                            getInitial(
                                                name
                                            )
                                        )}
                                    </div>


                                    <div
                                        class="user-name"
                                    >

                                        <strong>
                                            ${escapeHTML(
                                                name
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeHTML(
                                                item.email ||
                                                "—"
                                            )}
                                        </small>

                                    </div>

                                </div>

                            </td>


                            <td>

                                <div
                                    class="expression"
                                    title="${escapeHTML(
                                        item.expression
                                    )}"
                                >
                                    ${escapeHTML(
                                        item.expression
                                    )}
                                </div>

                            </td>


                            <td>

                                <span
                                    class="result-text"
                                >
                                    ${escapeHTML(
                                        item.result
                                    )}
                                </span>

                            </td>


                            <td>

                                <span
                                    class="type-badge ${
                                        getCategoryClass(
                                            category
                                        )
                                    }"
                                >
                                    ${escapeHTML(
                                        category
                                    )}
                                </span>

                            </td>


                            <td>

                                ${formatDate(
                                    item.createdAt
                                )}

                                <br>

                                <small>
                                    ${formatTime(
                                        item.createdAt
                                    )}
                                </small>

                            </td>


                            <td>

                                <span
                                    class="status-badge"
                                >
                                    Completed
                                </span>

                            </td>


                            <td>

                                <div
                                    class="action-buttons"
                                >


                                    <button
                                        type="button"
                                        class="action-btn"
                                        title="View Details"
                                        data-action="view"
                                        data-id="${escapeHTML(
                                            item._id
                                        )}"
                                    >
                                        <i
                                            class="fa-solid fa-eye"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn action-bookmark"
                                        title="${
                                            bookmarked
                                                ? "Remove Bookmark"
                                                : "Bookmark"
                                        }"
                                        data-action="bookmark"
                                        data-id="${escapeHTML(
                                            item._id
                                        )}"
                                    >
                                        <i
                                            class="fa-${
                                                bookmarked
                                                    ? "solid"
                                                    : "regular"
                                            } fa-bookmark"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn"
                                        title="Copy Calculation"
                                        data-action="copy"
                                        data-id="${escapeHTML(
                                            item._id
                                        )}"
                                    >
                                        <i
                                            class="fa-regular fa-copy"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-btn action-delete"
                                        title="Delete Calculation"
                                        data-action="delete"
                                        data-id="${escapeHTML(
                                            item._id
                                        )}"
                                    >
                                        <i
                                            class="fa-solid fa-trash"
                                        ></i>
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   TYPE CHART
========================================================= */

function renderTypeChart() {

    const counts =
        state.typeCounts || {};


    const entries =
        Object.entries(
            counts
        )
        .sort(
            (a, b) =>
                Number(b[1]) -
                Number(a[1])
        );


    const total =
        entries.reduce(
            (sum, item) =>
                sum +
                Number(item[1] || 0),
            0
        );


    const donutTotal =
        document.getElementById(
            "donutTotal"
        );


    const typeTotal =
        document.getElementById(
            "typeTotal"
        );


    if (donutTotal) {

        donutTotal.textContent =
            total.toLocaleString(
                "en-IN"
            );
    }


    if (typeTotal) {

        typeTotal.textContent =
            `${total.toLocaleString(
                "en-IN"
            )} total`;
    }


    const donut =
        document.getElementById(
            "typeDonut"
        );


    const legend =
        document.getElementById(
            "typeLegend"
        );


    const colors = [
        "#168cff",
        "#713cff",
        "#ff3fc7",
        "#ff9d2f",
        "#00d6a8",
        "#f2c51d",
        "#9b60ff",
        "#8299b9"
    ];


    if (!entries.length) {

        if (donut) {
            donut.style.background =
                "#17345d";
        }

        if (legend) {
            legend.innerHTML =
                `
                <span
                    style="color:#8398b8"
                >
                    No calculation data
                </span>
                `;
        }

        return;
    }


    let current =
        0;


    const gradientParts =
        [];


    entries.forEach(
        ([name, value], index) => {

            const percentage =
                total
                    ? (
                        Number(value) /
                        total
                    ) *
                    100
                    : 0;


            gradientParts.push(
                `${
                    colors[
                        index %
                        colors.length
                    ]
                } ${current}% ${
                    current +
                    percentage
                }%`
            );


            current +=
                percentage;
        }
    );


    if (donut) {

        donut.style.background =
            `conic-gradient(
                ${gradientParts.join(",")}
            )`;
    }


    if (legend) {

        legend.innerHTML =
            entries
                .map(
                    (
                        [name, value],
                        index
                    ) => {

                        const percentage =
                            total
                                ? Math.round(
                                    (
                                        Number(
                                            value
                                        ) /
                                        total
                                    ) *
                                    100
                                )
                                : 0;


                        return `
                            <div
                                class="legend-row"
                            >

                                <i
                                    class="legend-dot"
                                    style="
                                        background:${
                                            colors[
                                                index %
                                                colors.length
                                            ]
                                        };
                                    "
                                ></i>

                                <span>
                                    ${escapeHTML(
                                        name
                                    )}
                                </span>

                                <b>
                                    ${percentage}%
                                </b>

                            </div>
                        `;
                    }
                )
                .join("");
    }
}


/* =========================================================
   DAILY CHART
========================================================= */

function renderDailyChart() {

    const chart =
        document.getElementById(
            "dailyChart"
        );


    if (!chart) {
        return;
    }


    const data =
        state.daily || [];


    if (!data.length) {

        chart.innerHTML =
            `
            <div
                class="empty-cell"
                style="width:100%;"
            >
                No daily calculation data
            </div>
            `;

        return;
    }


    const rangeElement =
    document.getElementById(
        "activityRange"
    );

const selectedRange =
    Number(
        rangeElement?.value
    ) || 30;

const visible =
    data.slice(-selectedRange);


    const max =
        Math.max(
            ...visible.map(
                item =>
                    Number(
                        item.count || 0
                    )
            ),
            1
        );


    chart.innerHTML =
        visible
            .map(
                item => {

                    const count =
                        Number(
                            item.count || 0
                        );


                    const height =
                        count === 0
                            ? 2
                            : Math.max(
                                5,
                                Math.round(
                                    (
                                        count /
                                        max
                                    ) *
                                    145
                                )
                            );


                    return `
                        <div
                            class="bar-item"
                        >

                            <b>
                                ${count}
                            </b>

                            <div
                                class="bar"
                                style="
                                    height:${height}px;
                                "
                            ></div>

                            <small>
                                ${escapeHTML(
                                    item.label ||
                                    ""
                                )}
                            </small>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   POPULAR TYPES
========================================================= */

function renderPopularTypes() {

    const container =
        document.getElementById(
            "popularTypes"
        );


    if (!container) {
        return;
    }


    const entries =
        Object.entries(
            state.typeCounts || {}
        )
        .sort(
            (a, b) =>
                Number(b[1]) -
                Number(a[1])
        )
        .slice(0, 7);


    if (!entries.length) {

        container.innerHTML =
            `
            <span
                style="color:#8398b8"
            >
                No calculation data
            </span>
            `;

        return;
    }


    const max =
        Math.max(
            ...entries.map(
                item =>
                    Number(
                        item[1] || 0
                    )
            ),
            1
        );


    container.innerHTML =
        entries
            .map(
                ([name, value]) => {

                    const width =
                        Math.round(
                            (
                                Number(value) /
                                max
                            ) *
                            100
                        );


                    return `
                        <div
                            class="popular-row"
                        >

                            <span>
                                ${escapeHTML(
                                    name
                                )}
                            </span>


                            <div
                                class="popular-track"
                            >

                                <div
                                    class="popular-fill"
                                    style="
                                        width:${width}%;
                                    "
                                ></div>

                            </div>


                            <b>
                                ${value}
                            </b>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination() {

    const container =
        document.getElementById(
            "paginationControls"
        );


    const info =
        document.getElementById(
            "paginationInfo"
        );


    if (!container) {
        return;
    }


    const total =
        Number(
            state.total || 0
        );


    const from =
        total === 0
            ? 0
            : (
                (currentPage - 1) *
                pageLimit
            ) + 1;


    const to =
        Math.min(
            currentPage *
                pageLimit,
            total
        );


    if (info) {

        info.textContent =
            `Showing ${from} to ${to} of ${
                total.toLocaleString(
                    "en-IN"
                )
            } calculations`;
    }


    container.innerHTML = "";


    function addPageButton(
        text,
        page,
        active = false,
        disabled = false
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            `page-btn${
                active
                    ? " active"
                    : ""
            }`;


        button.disabled =
            disabled;


        button.innerHTML =
            text;


        button.addEventListener(
            "click",
            () => {

                if (
                    disabled ||
                    page < 1 ||
                    page > totalPages ||
                    page === currentPage
                ) {
                    return;
                }


                currentPage =
                    page;


                loadCalculations();
            }
        );


        container.appendChild(
            button
        );
    }


    addPageButton(
        `<i class="fa-solid fa-chevron-left"></i>`,
        currentPage - 1,
        false,
        currentPage <= 1
    );


    const start =
        Math.max(
            1,
            currentPage - 2
        );


    const end =
        Math.min(
            totalPages,
            start + 4
        );


    for (
        let page = start;
        page <= end;
        page++
    ) {

        addPageButton(
            String(page),
            page,
            page === currentPage,
            false
        );
    }


    addPageButton(
        `<i class="fa-solid fa-chevron-right"></i>`,
        currentPage + 1,
        false,
        currentPage >= totalPages
    );
}


/* =========================================================
   VIEW DETAILS
========================================================= */

function openCalculationDetails(id) {

    const item =
        state.calculations.find(
            calculation =>
                String(
                    calculation._id
                ) === String(id)
        );


    if (!item) {
        return;
    }


    const details =
        document.getElementById(
            "calculationDetails"
        );


    if (!details) {
        return;
    }


    details.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <span>
                    User
                </span>

                <strong>
                    ${escapeHTML(
                        item.userName ||
                        "Unknown User"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        item.email ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Expression
                </span>

                <strong>
                    ${escapeHTML(
                        item.expression
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Result
                </span>

                <strong>
                    ${escapeHTML(
                        item.result
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Type
                </span>

                <strong>
                    ${escapeHTML(
                        item.category ||
                        "Other"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Date & Time
                </span>

                <strong>
                    ${formatDate(
                        item.createdAt
                    )}
                    ${formatTime(
                        item.createdAt
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Calculation ID
                </span>

                <strong>
                    ${escapeHTML(
                        item._id
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Status
                </span>

                <strong>
                    Completed
                </strong>

            </div>

        </div>
    `;


    document
        .getElementById(
            "calculationModal"
        )
        ?.classList.remove(
            "hidden"
        );
}


/* =========================================================
   BOOKMARK
========================================================= */

function toggleBookmark(id) {

    const key =
        `calcura-admin-bookmark-${id}`;


    if (
        localStorage.getItem(
            key
        ) === "1"
    ) {

        localStorage.removeItem(
            key
        );


        showToast(
            "Bookmark removed"
        );

    } else {

        localStorage.setItem(
            key,
            "1"
        );


        showToast(
            "Calculation bookmarked"
        );
    }


    renderTable();
}


/* =========================================================
   COPY
========================================================= */

async function copyCalculation(id) {

    const item =
        state.calculations.find(
            calculation =>
                String(
                    calculation._id
                ) === String(id)
        );


    if (!item) {
        return;
    }


    const text =
        `${item.expression} = ${item.result}`;


    try {

        await navigator
            .clipboard
            .writeText(text);


        showToast(
            "Calculation copied"
        );

    }
    catch (error) {

        console.error(
            error
        );


        showToast(
            "Unable to copy calculation",
            true
        );
    }
}


/* =========================================================
   DELETE
========================================================= */

async function deleteCalculation(id) {

    const item =
        state.calculations.find(
            calculation =>
                String(
                    calculation._id
                ) === String(id)
        );


    if (!item) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete this calculation?\n\n${
                item.expression
            } = ${
                item.result
            }`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        ...authHeaders()
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete calculation"
            );
        }


        showToast(
            "Calculation deleted successfully"
        );


        await loadCalculations();

    }
    catch (error) {

        console.error(
            error
        );


        showToast(
            error.message,
            true
        );
    }
}


/* =========================================================
   TABLE ACTIONS
========================================================= */

function setupTableActions() {

    const tbody =
        document.getElementById(
            "calculationsTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const action =
                button.dataset.action;


            if (action === "view") {

                openCalculationDetails(
                    id
                );

            }


            else if (
                action === "bookmark"
            ) {

                toggleBookmark(
                    id
                );

            }


            else if (
                action === "copy"
            ) {

                copyCalculation(
                    id
                );

            }


            else if (
                action === "delete"
            ) {

                deleteCalculation(
                    id
                );
            }
        }
    );
}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const filterIds = [
        "userFilter",
        "categoryFilter",
        "statusFilter",
        "dateFrom",
        "dateTo",
        "activityRange"
    ];


    filterIds.forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );


            if (!element) {
                return;
            }


            element.addEventListener(
                "change",
                () => {

                    currentPage =
                        1;

                    loadCalculations();
                }
            );
        }
    );


    const search =
        document.getElementById(
            "calculationSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            () => {

                clearTimeout(
                    searchTimer
                );


                searchTimer =
                    setTimeout(
                        () => {

                            currentPage =
                                1;

                            loadCalculations();

                        },
                        300
                    );
            }
        );
    }


    const reset =
        document.getElementById(
            "resetButton"
        );


    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                if (search) {
                    search.value =
                        "";
                }


                document.getElementById(
                    "userFilter"
                ).value =
                    "all";


                document.getElementById(
                    "categoryFilter"
                ).value =
                    "all";


                document.getElementById(
                    "statusFilter"
                ).value =
                    "all";


                document.getElementById(
                    "dateFrom"
                ).value =
                    "";


                document.getElementById(
                    "dateTo"
                ).value =
                    "";


                document.getElementById(
                    "activityRange"
                ).value =
                    "30";


                currentPage =
                    1;


                loadCalculations();
            }
        );
    }
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function setupGlobalSearch() {

    const search =
        document.getElementById(
            "globalSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }


            const value =
                search.value
                    .trim()
                    .toLowerCase();


            if (!value) {
                return;
            }


            if (
                value.includes(
                    "dashboard"
                )
            ) {

                window.location.href =
                    "dashboard.html";

                return;
            }


            if (
                value.includes(
                    "user"
                )
            ) {

                window.location.href =
                    "users.html";

                return;
            }


            if (
                value.includes(
                    "formula"
                )
            ) {

                window.location.href =
                    "formulas.html";

                return;
            }


            if (
                value.includes(
                    "subscription"
                )
            ) {

                window.location.href =
                    "subscriptions.html";

                return;
            }


            /*
               If it is a calculation query,
               put it directly into the
               calculation search box.
            */

            const calculationSearch =
                document.getElementById(
                    "calculationSearch"
                );


            if (
                calculationSearch
            ) {

                calculationSearch.value =
                    search.value;


                currentPage =
                    1;


                loadCalculations();

                calculationSearch
                    .focus();
            }
        }
    );
}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );


    const toggle =
        document.getElementById(
            "sidebarToggle"
        );


    if (
        !sidebar ||
        !toggle
    ) {
        return;
    }


    toggle.addEventListener(
        "click",
        () => {

            /*
               DESKTOP
            */

            if (
                window.innerWidth >
                900
            ) {

                sidebar.classList.toggle(
                    "collapsed"
                );


                const state =
                    sidebar.classList.contains(
                        "collapsed"
                    )
                        ? "collapsed"
                        : "open";


                localStorage.setItem(
                    "calcuraAdminSidebar",
                    state
                );

            }


            /*
               MOBILE
            */

            else {

                sidebar.classList.toggle(
                    "open"
                );
            }
        }
    );


    /*
       Restore desktop state
    */

    if (
        window.innerWidth >
        900
    ) {

        if (
            localStorage.getItem(
                "calcuraAdminSidebar"
            ) ===
            "collapsed"
        ) {

            sidebar.classList.add(
                "collapsed"
            );
        }
    }


    /*
       Responsive behaviour
    */

    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth >
                900
            ) {

                sidebar.classList.remove(
                    "open"
                );


                if (
                    localStorage.getItem(
                        "calcuraAdminSidebar"
                    ) ===
                    "collapsed"
                ) {

                    sidebar.classList.add(
                        "collapsed"
                    );

                } else {

                    sidebar.classList.remove(
                        "collapsed"
                    );
                }

            }

            else {

                sidebar.classList.remove(
                    "collapsed"
                );
            }
        }
    );
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    const token =
        getToken();


    if (!token) {

        console.warn(
            "No authentication token found."
        );

        return;
    }


    /*
       Try the actual auth/me endpoint.
    */

    try {

        const response =
            await fetch(
                "http://localhost:5000/api/auth/me",
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.ok
        ) {

            const data =
                await response.json();


            const user =
                data.user ||
                data;


            applyAdminProfile(
                user
            );


            return;
        }

    }
    catch (error) {

        console.warn(
            "Auth profile request failed:",
            error
        );
    }


    /*
       Fallback:
       Read user information from
       localStorage if your login page
       already stores it.
    */

    const possibleKeys = [
        "user",
        "currentUser",
        "calcuraUser",
        "loggedInUser"
    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const raw =
                localStorage.getItem(
                    key
                );


            if (!raw) {
                continue;
            }


            const user =
                JSON.parse(raw);


            if (user) {

                applyAdminProfile(
                    user
                );

                return;
            }

        }
        catch (error) {

            console.warn(
                `Unable to read ${key}`,
                error
            );
        }
    }
}


/* =========================================================
   APPLY ADMIN PROFILE
========================================================= */

function applyAdminProfile(
    user
) {

    if (!user) {
        return;
    }


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "Admin";


    const avatar =
        document.getElementById(
            "adminAvatar"
        );


    const nameElement =
        document.getElementById(
            "adminName"
        );


    const roleElement =
        document.getElementById(
            "adminRole"
        );


    if (nameElement) {

        nameElement.textContent =
            name;
    }


    if (avatar) {

        avatar.textContent =
            getInitial(name);
    }


    if (roleElement) {

        roleElement.textContent =
            user.role === "admin"
                ? "Administrator"
                : "User";
    }
}


/* =========================================================
   MODAL
========================================================= */

function setupModal() {

    const modal =
        document.getElementById(
            "calculationModal"
        );


    const close =
        document.getElementById(
            "modalClose"
        );


    if (!modal) {
        return;
    }


    if (close) {

        close.addEventListener(
            "click",
            () => {

                modal.classList.add(
                    "hidden"
                );
            }
        );
    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                modal.classList.add(
                    "hidden"
                );
            }
        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                modal.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    isError = false
) {

    const toast =
        document.getElementById(
            "adminToast"
        );


    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !messageElement
    ) {
        return;
    }


    messageElement.textContent =
        message;


    const icon =
        toast.querySelector(
            "i"
        );


    if (icon) {

        icon.className =
            isError
                ? "fa-solid fa-circle-exclamation"
                : "fa-solid fa-circle-check";
    }


    toast.classList.remove(
        "hidden"
    );


    clearTimeout(
        window.calcuraToastTimer
    );


    window.calcuraToastTimer =
        setTimeout(
            () => {

                toast.classList.add(
                    "hidden"
                );

            },
            2800
        );
}


/* =========================================================
   EXPORT
========================================================= */

async function exportCalculations() {

    try {

        const params =
            buildQuery();


        /*
           Pagination should not
           limit exported data.
        */

        params.delete(
            "page"
        );

        params.delete(
            "limit"
        );


        const response =
            await fetch(
                `${API_BASE}/export?${params.toString()}`,
                {
                    method: "GET",

                    headers: {
                        ...authHeaders()
                    }
                }
            );


        if (!response.ok) {

            const data =
                await response.json()
                    .catch(
                        () => ({})
                    );


            throw new Error(
                data.message ||
                "Export failed"
            );
        }


        const blob =
            await response.blob();


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "calcura-calculations.csv";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        showToast(
            "Calculation data exported successfully"
        );

    }
    catch (error) {

        console.error(
            error
        );


        showToast(
            error.message,
            true
        );
    }
}


/* =========================================================
   NOTIFICATION
========================================================= */

function setupNotification() {

    const button =
        document.getElementById(
            "notificationButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            showToast(
                "No new notifications."
            );
        }
    );
}


/* =========================================================
   PROFILE BUTTON
========================================================= */

function setupProfileButton() {

    const button =
        document.getElementById(
            "adminProfileButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                "user-accounts.html";
        }
    );
}


/* =========================================================
   EXPORT BUTTON
========================================================= */

function setupExport() {

    const button =
        document.getElementById(
            "exportButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        exportCalculations
    );
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupSidebar();

        setupFilters();

        setupTableActions();

        setupGlobalSearch();

        setupModal();

        setupNotification();

        setupProfileButton();

        setupExport();


        await loadAdminProfile();

        await loadCalculations();
    }
);