/* =========================================================
   CALCURA - SAVED CALCULATIONS
   REAL USER + BACKEND
========================================================= */


/* =========================================================
   STATE
========================================================= */

let allSavedItems = [];

let filteredSavedItems = [];

let currentPage = 1;

const itemsPerPage = 6;

let activeType = "all";


/* =========================================================
   ELEMENTS
========================================================= */

const savedList =
    document.getElementById("savedList");

const savedSearch =
    document.getElementById("savedSearch");

const savedTabs =
    document.querySelectorAll(".saved-tab");

const paginationInfo =
    document.getElementById("paginationInfo");

const savedPageButtons =
    document.getElementById("savedPageButtons");

const prevPage =
    document.getElementById("prevPage");

const nextPage =
    document.getElementById("nextPage");

const totalSaved =
    document.getElementById("totalSaved");

const totalCalculations =
    document.getElementById("totalCalculations");

const totalGraphs =
    document.getElementById("totalGraphs");

const totalNotes =
    document.getElementById("totalNotes");

const totalConversions =
    document.getElementById("totalConversions");

const clearAllSaved =
    document.getElementById("clearAllSaved");

const exportSaved =
    document.getElementById("exportSaved");

const syncSaved =
    document.getElementById("syncSaved");

const globalSearch =
    document.getElementById("globalSearch");

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");


/* =========================================================
   API BASE
========================================================= */

const API_BASE =
    "http://localhost:5000";


/* =========================================================
   GET TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem(
        "calcuraToken"
    );

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
   LOAD REAL USER
========================================================= */

async function loadRealUser() {

    try {

        const savedUser =
            typeof getSavedUser === "function"
                ? getSavedUser()
                : null;


        if (savedUser) {

            updateUserUI(
                savedUser
            );

        }


        if (
            typeof getCurrentUser ===
            "function"
        ) {

            const currentUser =
                await getCurrentUser();


            if (currentUser) {

                const userData =
                    currentUser.user ||
                    currentUser;


                updateUserUI(
                    userData
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


/* =========================================================
   UPDATE USER UI
========================================================= */

function updateUserUI(user) {

    if (!user) return;


    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "User";


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   LOAD SAVED DATA FROM BACKEND
========================================================= */

async function loadSavedItems() {

    const token =
        getToken();


    if (!token) {

        if (savedList) {

            savedList.innerHTML = `

                <div class="saved-empty">

                    <i class="fa-solid fa-lock"></i>

                    <strong>
                        Login required
                    </strong>

                    <span>
                        Please login to view your saved calculations.
                    </span>

                    <a href="../login.html"
                       class="saved-pro-btn">

                        Login

                    </a>

                </div>

            `;

        }

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/api/saved`,
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


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "calcuraToken"
            );

            window.location.href =
                "../login.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load saved items"
            );

        }


        /*
         * Support common backend response names.
         */

        allSavedItems =
            data.saved ||
            data.savedCalculations ||
            data.items ||
            data.calculations ||
            [];


        if (!Array.isArray(allSavedItems)) {

            allSavedItems = [];

        }


        /*
         * Newest first
         */

        allSavedItems.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt ||
                        a.updatedAt ||
                        a.date ||
                        0
                    );

                const dateB =
                    new Date(
                        b.createdAt ||
                        b.updatedAt ||
                        b.date ||
                        0
                    );

                return dateB - dateA;

            }
        );


        filteredSavedItems =
            [...allSavedItems];


        updateStats();

        applyFilters();

    } catch (error) {

        console.error(
            "Saved loading error:",
            error
        );


        if (savedList) {

            savedList.innerHTML = `

                <div class="saved-empty">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Unable to load saved calculations
                    </strong>

                    <span>
                        ${escapeHTML(error.message)}
                    </span>

                </div>

            `;

        }

    }

}


/* =========================================================
   GET ITEM TYPE
========================================================= */

function getItemType(item) {

    const raw =
        String(
            item.type ||
            item.category ||
            item.kind ||
            "calculation"
        )
        .toLowerCase();


    if (
        raw.includes("graph") ||
        raw.includes("plot")
    ) {

        return "graph";

    }


    if (
        raw.includes("formula")
    ) {

        return "formula";

    }

    if (
    raw.includes("converter") ||
    raw.includes("conversion")
    ) {

    return "conversion";

    }

    if (
        raw.includes("note")
    ) {

        return "note";

    }


    return "calculation";

}


/* =========================================================
   TYPE LABEL
========================================================= */

function getTypeLabel(type) {

    const labels = {

        calculation:
            "Calculation",

        graph:
            "Graph",

        formula:
            "Formula",

        note:
            "Note",
        
        conversion:
            "Conversion"

    };


    return labels[type] ||
        "Calculation";

}


/* =========================================================
   TYPE ICON
========================================================= */

function getTypeIcon(type) {

    const icons = {

        calculation:
            "fa-calculator",

        graph:
            "fa-chart-line",

        formula:
            "fa-book-open",

        conversion:
             "fa-right-left",

        note:
            "fa-note-sticky"

    };


    return icons[type] ||
        "fa-calculator";

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatSavedDate(item) {

    const dateValue =
        item.createdAt ||
        item.updatedAt ||
        item.date ||
        item.timestamp;


    if (!dateValue) {

        return "Date unavailable";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date unavailable";

    }


    return date.toLocaleString(
        "en-IN",
        {

            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}


/* =========================================================
   TITLE
========================================================= */

function getItemTitle(item) {

    return (
        item.title ||
        item.name ||
        item.expression ||
        "Saved Calculation"
    );

}


/* =========================================================
   EXPRESSION / RESULT
========================================================= */

function getItemDescription(item) {

    if (item.description) {

        return item.description;

    }


    const expression =
        item.expression ||
        "";


    const result =
        item.result;


    if (
        expression &&
        result !== undefined &&
        result !== null &&
        String(result).trim() !== ""
    ) {

        return `${expression} = ${result}`;

    }


    if (expression) {

        return expression;

    }


    return "Saved calculation";

}


/* =========================================================
   RENDER ITEMS
========================================================= */

function renderSavedItems() {

    if (!savedList) return;


    const total =
        filteredSavedItems.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total / itemsPerPage
            )
        );


    if (
        currentPage >
        totalPages
    ) {

        currentPage =
            totalPages;

    }


    const start =
        (currentPage - 1) *
        itemsPerPage;


    const end =
        Math.min(
            start + itemsPerPage,
            total
        );


    const pageItems =
        filteredSavedItems.slice(
            start,
            end
        );


    if (!pageItems.length) {

        savedList.innerHTML = `

            <div class="saved-empty">

                <i class="fa-regular fa-bookmark"></i>

                <strong>
                    No saved calculations found
                </strong>

                <span>
                    Save calculations from the calculator to see them here.
                </span>

            </div>

        `;

        updatePagination(
            total,
            start,
            end,
            totalPages
        );

        return;

    }


    savedList.innerHTML =
        pageItems
            .map(
                item =>
                    createSavedCard(
                        item
                    )
            )
            .join("");


    updatePagination(
        total,
        start,
        end,
        totalPages
    );

}


/* =========================================================
   CREATE CARD
========================================================= */

function createSavedCard(item) {

    const id =
        item._id ||
        item.id ||
        "";


    const type =
        getItemType(item);


    const title =
        getItemTitle(item);


    const description =
        getItemDescription(item);


    const date =
        formatSavedDate(item);


    return `

        <article
            class="saved-card"
            data-id="${escapeHTML(id)}">


            <div class="
                saved-card-icon
                ${type}
            ">

                <i class="
                    fa-solid
                    ${getTypeIcon(type)}
                "></i>

            </div>


            <div class="saved-card-info">

                <h3 class="saved-card-title">

                    ${escapeHTML(title)}

                </h3>

                <p class="saved-card-expression">

                    ${escapeHTML(description)}

                </p>

            </div>


            <div>

                <span class="
                    saved-type-badge
                    ${type}
                ">

                    ${escapeHTML(
                        getTypeLabel(type)
                    )}

                </span>

            </div>


            <div class="saved-card-date">

                <i class="fa-regular fa-calendar"></i>

                <span>
                    ${escapeHTML(date)}
                </span>

            </div>


            <div class="saved-card-actions">


                <button
                    type="button"
                    class="saved-card-action open"
                    title="Open"
                    data-action="open"
                    data-id="${escapeHTML(id)}">

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </button>


                <button
                    type="button"
                    class="saved-card-action copy"
                    title="Copy"
                    data-action="copy"
                    data-id="${escapeHTML(id)}">

                    <i class="fa-regular fa-copy"></i>

                </button>


                <button
                    type="button"
                    class="saved-card-action delete"
                    title="Delete"
                    data-action="delete"
                    data-id="${escapeHTML(id)}">

                    <i class="fa-regular fa-trash-can"></i>

                </button>


            </div>

        </article>

    `;

}


/* =========================================================
   UPDATE PAGINATION
========================================================= */

function updatePagination(
    total,
    start,
    end,
    totalPages
) {

    if (paginationInfo) {

        paginationInfo.textContent =
            total === 0

                ? "Showing 0 to 0 of 0 saved items"

                : `Showing ${
                    start + 1
                } to ${
                    end
                } of ${
                    total
                } saved items`;

    }


    if (!savedPageButtons) return;


    let html = `

        <button
            type="button"
            class="saved-page-btn"
            id="prevPage"
            ${currentPage === 1 ? "disabled" : ""}>

            <i class="fa-solid fa-chevron-left"></i>

        </button>

    `;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `

            <button
                type="button"
                class="
                    saved-page-btn
                    ${page === currentPage ? "active" : ""}
                "
                data-page="${page}">

                ${page}

            </button>

        `;

    }


    html += `

        <button
            type="button"
            class="saved-page-btn"
            id="nextPage"
            ${currentPage === totalPages ? "disabled" : ""}>

            <i class="fa-solid fa-chevron-right"></i>

        </button>

    `;


    savedPageButtons.innerHTML =
        html;

}


/* =========================================================
   PAGINATION CLICK
========================================================= */

if (savedPageButtons) {

    savedPageButtons.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".saved-page-btn"
                );


            if (!button) return;


            if (
                button.id ===
                "prevPage"
            ) {

                if (
                    currentPage >
                    1
                ) {

                    currentPage--;

                    renderSavedItems();

                }

                return;

            }


            if (
                button.id ===
                "nextPage"
            ) {

                const totalPages =
                    Math.max(
                        1,
                        Math.ceil(
                            filteredSavedItems.length /
                            itemsPerPage
                        )
                    );


                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderSavedItems();

                }

                return;

            }


            const page =
                Number(
                    button.dataset.page
                );


            if (
                Number.isFinite(page)
            ) {

                currentPage =
                    page;

                renderSavedItems();

            }

        }
    );

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    const total =
        allSavedItems.length;


    const calculations =
        allSavedItems.filter(
            item =>
                getItemType(item) ===
                "calculation"
        ).length;


    const graphs =
        allSavedItems.filter(
            item =>
                getItemType(item) ===
                "graph"
        ).length;


    const conversions =
    allSavedItems.filter(
        item =>
            getItemType(item) ===
            "conversion"
    ).length;

    if (totalSaved) {

        totalSaved.textContent =
            total;

    }


    if (totalCalculations) {

        totalCalculations.textContent =
            calculations;

    }


    if (totalGraphs) {

        totalGraphs.textContent =
            graphs;

    }


    if (totalConversions) {

        totalConversions.textContent =
            conversions;

    }

}


/* =========================================================
   FILTER
========================================================= */

function applyFilters() {

    const search =
        savedSearch
            ? savedSearch.value
                .trim()
                .toLowerCase()
            : "";


    filteredSavedItems =
        allSavedItems.filter(
            item => {

                const type =
                    getItemType(item);


                const title =
                    getItemTitle(item)
                        .toLowerCase();


                const description =
                    getItemDescription(item)
                        .toLowerCase();


                const typeMatch =
                    activeType === "all" ||
                    type === activeType;


                const searchMatch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search) ||
                    type.includes(search);


                return (
                    typeMatch &&
                    searchMatch
                );

            }
        );


    currentPage = 1;

    renderSavedItems();

}


/* =========================================================
   TABS
========================================================= */

savedTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                savedTabs.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                activeType =
                    tab.dataset.type ||
                    "all";


                applyFilters();

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (savedSearch) {

    savedSearch.addEventListener(
        "input",
        applyFilters
    );

}


/* =========================================================
   CARD ACTIONS
========================================================= */

if (savedList) {

    savedList.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    ".saved-card-action"
                );


            if (!button) return;


            const id =
                button.dataset.id;


            const action =
                button.dataset.action;


            const item =
                allSavedItems.find(
                    savedItem =>
                        String(
                            savedItem._id ||
                            savedItem.id
                        ) === String(id)
                );


            if (!item) return;


            /* COPY */

            if (
                action ===
                "copy"
            ) {

                const text =
                    getItemDescription(
                        item
                    );


                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    button.innerHTML =
                        `<i class="fa-solid fa-check"></i>`;

                    setTimeout(
                        () => {

                            button.innerHTML =
                                `<i class="fa-regular fa-copy"></i>`;

                        },
                        1200
                    );

                } catch (error) {

                    console.error(
                        "Copy error:",
                        error
                    );

                }

                return;

            }


            /* OPEN */

            if (
                action ===
                "open"
            ) {

                const expression =
                    item.expression ||
                    "";


                if (expression) {

                    window.location.href =
                        `calculator.html?expression=${encodeURIComponent(
                            expression
                        )}`;

                }

                return;

            }


            /* DELETE */

            if (
                action ===
                "delete"
            ) {

                await deleteSavedItem(
                    id
                );

            }

        }
    );

}


/* =========================================================
   DELETE ONE SAVED ITEM
========================================================= */

async function deleteSavedItem(
    id
) {

    const token =
        getToken();


    if (!token) {

        alert(
            "Please login first."
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete this saved calculation?"
        );


    if (!confirmed) return;


    try {

        const response =
            await fetch(
                `${API_BASE}/api/saved/${id}`,
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


        allSavedItems =
            allSavedItems.filter(
                item =>
                    String(
                        item._id ||
                        item.id
                    ) !== String(id)
            );


        updateStats();

        applyFilters();

    } catch (error) {

        console.error(
            "Delete saved error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete saved calculation."
        );

    }

}


/* =========================================================
   CLEAR ALL
========================================================= */

if (clearAllSaved) {

    clearAllSaved.addEventListener(
        "click",
        async () => {

            if (
                !allSavedItems.length
            ) {

                alert(
                    "There are no saved calculations."
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete all saved calculations?"
                );


            if (!confirmed) return;


            const token =
                getToken();


            if (!token) {

                alert(
                    "Please login first."
                );

                return;

            }


            try {

                /*
                 * Try common DELETE endpoint.
                 */

                const response =
                    await fetch(
                        `${API_BASE}/api/saved`,
                        {

                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

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
                        "Clear all failed"
                    );

                }


                allSavedItems = [];

                filteredSavedItems = [];

                updateStats();

                renderSavedItems();

            } catch (error) {

                console.error(
                    "Clear all error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to clear saved items."
                );

            }

        }
    );

}


/* =========================================================
   EXPORT
========================================================= */

if (exportSaved) {

    exportSaved.addEventListener(
        "click",
        () => {

            if (
                !allSavedItems.length
            ) {

                alert(
                    "No saved calculations to export."
                );

                return;

            }


            const exportData =
                allSavedItems.map(
                    item => ({

                        title:
                            getItemTitle(item),

                        expression:
                            item.expression || "",

                        result:
                            item.result || "",

                        type:
                            getTypeLabel(
                                getItemType(item)
                            ),

                        date:
                            formatSavedDate(
                                item
                            )

                    })
                );


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            exportData,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


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
                "calcura-saved-calculations.json";


            document.body.appendChild(
                link
            );

            link.click();

            link.remove();


            URL.revokeObjectURL(
                url
            );

        }
    );

}


/* =========================================================
   SYNC
========================================================= */

if (syncSaved) {

    syncSaved.addEventListener(
        "click",
        async () => {

            await loadSavedItems();

            alert(
                "Saved calculations synced."
            );

        }
    );

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

if (globalSearch) {

    globalSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) return;


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

                calculator:
                    "calculator.html",

                voice:
                    "voice-input.html",

                "voice input":
                    "voice-input.html",

                graph:
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

                settings:
                    "settings.html",

                profile:
                    "profile.html",

                help:
                    "help.html",

                upgrade:
                    "upgrade.html"

            };


            if (pages[query]) {

                window.location.href =
                    pages[query];

            }

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadRealUser();

        await loadSavedItems();

    }
);