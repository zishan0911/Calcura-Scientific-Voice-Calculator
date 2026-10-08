"use strict";

/* =========================================================
   CALCURA ADMIN — FORMULA LIBRARY
   REAL MONGODB DATA
========================================================= */

const API_BASE =
    "http://localhost:5000/api/admin/formulas";

const TOKEN_KEYS = [
    "calcuraToken",
    "token",
    "authToken"
];

let currentPage = 1;
let pageLimit = 10;
let totalPages = 1;
let searchTimer = null;

let editingFormula = false;

const state = {
    formulas: [],
    categories: [],
    stats: {},
    total: 0
};


/* =========================================================
   AUTH
========================================================= */

function getToken() {

    for (const key of TOKEN_KEYS) {

        const token =
            localStorage.getItem(key);

        if (token) {
            return token;
        }
    }

    return null;
}


function authHeaders() {

    const token = getToken();

    if (!token) {
        return {};
    }

    return {
        Authorization:
            `Bearer ${token}`
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
        String(name || "A")
            .trim();

    return (
        value.charAt(0)
            .toUpperCase() || "A"
    );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


/* =========================================================
   DIFFICULTY CLASS
========================================================= */

function getDifficultyClass(
    difficulty
) {

    const value =
        String(
            difficulty || "Medium"
        ).toLowerCase();

    if (value === "easy") {
        return "difficulty-easy";
    }

    if (value === "hard") {
        return "difficulty-hard";
    }

    return "difficulty-medium";
}


/* =========================================================
   QUERY
========================================================= */

function buildQuery() {

    const params =
        new URLSearchParams();


    const search =
        document
            .getElementById(
                "formulaSearch"
            )
            ?.value
            .trim();


    const category =
        document
            .getElementById(
                "categoryFilter"
            )
            ?.value;


    const level =
        document
            .getElementById(
                "levelFilter"
            )
            ?.value;


    const difficulty =
        document
            .getElementById(
                "difficultyFilter"
            )
            ?.value;


    const sort =
        document
            .getElementById(
                "sortFilter"
            )
            ?.value ||
        "newest";


    params.set(
        "page",
        currentPage
    );


    params.set(
        "limit",
        pageLimit
    );


    params.set(
        "sort",
        sort
    );


    if (search) {

        params.set(
            "search",
            search
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
        level &&
        level !== "all"
    ) {

        params.set(
            "level",
            level
        );
    }


    if (
        difficulty &&
        difficulty !== "all"
    ) {

        params.set(
            "difficulty",
            difficulty
        );
    }


    return params;
}


/* =========================================================
   LOAD FORMULAS
========================================================= */

async function loadFormulas() {

    const tbody =
        document.getElementById(
            "formulaTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = `
        <tr>
            <td
                colspan="7"
                class="loading-cell"
            >
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading real MongoDB formulas...
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
                "Unable to load formulas"
            );
        }


        state.formulas =
            data.formulas || [];


        state.categories =
            data.categories || [];


        state.stats =
            data.stats || {};


        state.total =
            data.pagination?.total ||
            0;


        currentPage =
            data.pagination?.page ||
            currentPage;


        totalPages =
            data.pagination?.pages ||
            1;


        renderAll();

    }
    catch (error) {

        console.error(
            "Formula loading error:",
            error
        );


        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-cell"
                >
                    <i class="fa-solid fa-triangle-exclamation"></i>
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

    renderCategories();

    renderTable();

    renderPagination();
}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    const stats =
        state.stats || {};


    const totalElement =
        document.getElementById(
            "totalFormulas"
        );


    const categoriesElement =
        document.getElementById(
            "totalCategories"
        );


    const mostViewedElement =
        document.getElementById(
            "mostViewedFormula"
        );


    const totalViewsElement =
        document.getElementById(
            "totalViews"
        );


    if (totalElement) {

        totalElement.textContent =
            Number(
                stats.totalFormulas || 0
            ).toLocaleString(
                "en-IN"
            );
    }


    if (categoriesElement) {

        categoriesElement.textContent =
            Number(
                stats.categories || 0
            ).toLocaleString(
                "en-IN"
            );
    }


    if (mostViewedElement) {

        const mostViewed =
            stats.mostViewed;


        if (mostViewed) {

            mostViewedElement.textContent =
                mostViewed.name ||
                "—";

            mostViewedElement.title =
                `${mostViewed.name || ""} — ${
                    mostViewed.views || 0
                } views`;

        }
        else {

            mostViewedElement.textContent =
                "—";
        }
    }


    if (totalViewsElement) {

        totalViewsElement.textContent =
            Number(
                stats.totalViews || 0
            ).toLocaleString(
                "en-IN"
            );
    }
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function renderCategories() {

    const select =
        document.getElementById(
            "categoryFilter"
        );


    if (!select) {
        return;
    }


    const current =
        select.value;


    select.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    state.categories
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category;


                option.textContent =
                    category;


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
                option.value ===
                current
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
            "formulaTableBody"
        );


    if (!tbody) {
        return;
    }


    const formulas =
        state.formulas || [];


    if (!formulas.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="empty-cell"
                >
                    <i class="fa-solid fa-book-open"></i>
                    No real formulas found.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        formulas
            .map(
                (formula, index) => {

                    const rowNumber =
                        (
                            (currentPage - 1) *
                            pageLimit
                        ) +
                        index +
                        1;


                    const difficultyClass =
                        getDifficultyClass(
                            formula.difficulty
                        );


                    const icon =
                        formula.icon ||
                        "fa-book";


                    const statusClass =
                        formula.status ===
                        "hidden"
                            ? "status-hidden"
                            : "status-active";


                    return `
                        <tr>

                            <td>
                                ${rowNumber}
                            </td>


                            <td>

                                <div
                                    class="formula-cell"
                                >

                                    <div
                                        class="formula-icon"
                                    >
                                        <i
                                            class="fa-solid ${
                                                escapeHTML(
                                                    icon
                                                )
                                            }"
                                        ></i>
                                    </div>


                                    <div
                                        class="formula-info"
                                    >

                                        <span
                                            class="formula-name"
                                        >
                                            ${escapeHTML(
                                                formula.name
                                            )}
                                        </span>


                                        <span
                                            class="formula-expression"
                                            title="${escapeHTML(
                                                formula.expression
                                            )}"
                                        >
                                            ${escapeHTML(
                                                formula.expression
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </td>


                            <td>

                                <span
                                    class="formula-badge category-badge"
                                >
                                    ${escapeHTML(
                                        formula.category ||
                                        "Other"
                                    )}
                                </span>

                            </td>


                            <td>

                                <span
                                    class="formula-badge level-badge"
                                >
                                    ${escapeHTML(
                                        formula.level ||
                                        "College"
                                    )}
                                </span>

                            </td>


                            <td>

                                <span
                                    class="formula-badge ${
                                        difficultyClass
                                    }"
                                >
                                    ${escapeHTML(
                                        formula.difficulty ||
                                        "Medium"
                                    )}
                                </span>

                            </td>


                            <td>

                                <div
                                    class="formula-date"
                                >
                                    ${formatDate(
                                        formula.createdAt
                                    )}
                                </div>

                            </td>


                            <td>

                                <div
                                    class="formula-actions"
                                >

                                    <button
                                        type="button"
                                        class="action-button view-button"
                                        title="View Formula"
                                        data-action="view"
                                        data-id="${escapeHTML(
                                            formula._id
                                        )}"
                                    >
                                        <i
                                            class="fa-solid fa-eye"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-button edit-button"
                                        title="Edit Formula"
                                        data-action="edit"
                                        data-id="${escapeHTML(
                                            formula._id
                                        )}"
                                    >
                                        <i
                                            class="fa-solid fa-pen"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-button delete-button"
                                        title="Delete Formula"
                                        data-action="delete"
                                        data-id="${escapeHTML(
                                            formula._id
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
            } formulas`;
    }


    container.innerHTML = "";


    function createButton(
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
            `pagination-button${
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


                loadFormulas();
            }
        );


        container.appendChild(
            button
        );
    }


    createButton(
        `<i class="fa-solid fa-chevron-left"></i>`,
        currentPage - 1,
        false,
        currentPage <= 1
    );


    let start =
        Math.max(
            1,
            currentPage - 2
        );


    let end =
        Math.min(
            totalPages,
            start + 4
        );


    if (
        end - start < 4
    ) {

        start =
            Math.max(
                1,
                end - 4
            );
    }


    for (
        let page = start;
        page <= end;
        page++
    ) {

        createButton(
            String(page),
            page,
            page === currentPage
        );
    }


    createButton(
        `<i class="fa-solid fa-chevron-right"></i>`,
        currentPage + 1,
        false,
        currentPage >= totalPages
    );
}


/* =========================================================
   FORM DATA
========================================================= */

function getSelectedStatus() {

    const selected =
        document.querySelector(
            'input[name="formulaStatus"]:checked'
        );


    return selected
        ? selected.value
        : "active";
}


function setSelectedStatus(
    status
) {

    const value =
        status === "hidden"
            ? "hidden"
            : "active";


    const radio =
        document.querySelector(
            `input[name="formulaStatus"][value="${value}"]`
        );


    if (radio) {
        radio.checked = true;
    }
}


/* =========================================================
   CLEAR FORM
========================================================= */

function clearFormulaForm() {

    const form =
        document.getElementById(
            "formulaForm"
        );


    if (form) {
        form.reset();
    }


    const id =
        document.getElementById(
            "formulaId"
        );


    if (id) {
        id.value = "";
    }


    const category =
        document.getElementById(
            "formulaCategory"
        );


    if (category) {
        category.value = "";
    }


    const level =
        document.getElementById(
            "formulaLevel"
        );


    if (level) {
        level.value = "College";
    }


    const difficulty =
        document.getElementById(
            "formulaDifficulty"
        );


    if (difficulty) {
        difficulty.value = "Medium";
    }


    setSelectedStatus(
        "active"
    );


    editingFormula =
        false;


    setEditorMode(
        false
    );
}


/* =========================================================
   EDITOR MODE
========================================================= */

function setEditorMode(
    editMode
) {

    editingFormula =
        editMode;


    const addTab =
        document.getElementById(
            "addTab"
        );


    const editTab =
        document.getElementById(
            "editTab"
        );


    const saveButton =
        document.getElementById(
            "saveFormulaButton"
        );


    if (addTab) {

        addTab.classList.toggle(
            "active",
            !editMode
        );
    }


    if (editTab) {

        editTab.classList.toggle(
            "active",
            editMode
        );
    }


    if (saveButton) {

        saveButton.innerHTML =
            editMode

                ? `
                    <i class="fa-solid fa-floppy-disk"></i>
                    Update Formula
                  `

                : `
                    <i class="fa-solid fa-plus"></i>
                    Add Formula
                  `;
    }
}


/* =========================================================
   OPEN ADD MODE
========================================================= */

function openAddMode() {

    clearFormulaForm();

    setEditorMode(
        false
    );


    document
        .getElementById(
            "formulaName"
        )
        ?.focus();
}


/* =========================================================
   LOAD SINGLE FORMULA
========================================================= */

async function getFormula(
    id
) {

    const response =
        await fetch(
            `${API_BASE}/${encodeURIComponent(id)}`,
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
            "Unable to load formula"
        );
    }


    return data.formula;
}


/* =========================================================
   OPEN EDIT MODE
========================================================= */

async function openEditMode(
    id
) {

    try {

        const formula =
            await getFormula(id);


        if (!formula) {
            return;
        }


        document.getElementById(
            "formulaId"
        ).value =
            formula._id || "";


        document.getElementById(
            "formulaName"
        ).value =
            formula.name || "";


        document.getElementById(
            "formulaCategory"
        ).value =
            formula.category || "";


        document.getElementById(
            "formulaExpression"
        ).value =
            formula.expression || "";


        document.getElementById(
            "formulaDescription"
        ).value =
            formula.description || "";


        document.getElementById(
            "formulaLevel"
        ).value =
            formula.level ||
            "College";


        document.getElementById(
            "formulaDifficulty"
        ).value =
            formula.difficulty ||
            "Medium";


        document.getElementById(
            "formulaTags"
        ).value =
            Array.isArray(
                formula.tags
            )
                ? formula.tags.join(", ")
                : "";


        setSelectedStatus(
            formula.status ||
            "active"
        );


        setEditorMode(
            true
        );


        document
            .getElementById(
                "formulaEditorPanel"
            )
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


        document
            .getElementById(
                "formulaName"
            )
            ?.focus();


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
   SAVE FORMULA
========================================================= */

async function saveFormula(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "formulaId"
        )?.value;


    const name =
        document.getElementById(
            "formulaName"
        )?.value
            .trim();


    const category =
        document.getElementById(
            "formulaCategory"
        )?.value
            .trim();


    const expression =
        document.getElementById(
            "formulaExpression"
        )?.value
            .trim();


    const description =
        document.getElementById(
            "formulaDescription"
        )?.value
            .trim();


    const level =
        document.getElementById(
            "formulaLevel"
        )?.value;


    const difficulty =
        document.getElementById(
            "formulaDifficulty"
        )?.value;


    const tagsText =
        document.getElementById(
            "formulaTags"
        )?.value
            .trim();


    const status =
        getSelectedStatus();


    if (!name) {

        showToast(
            "Formula name is required",
            true
        );

        return;
    }


    if (!category) {

        showToast(
            "Formula category is required",
            true
        );

        return;
    }


    if (!expression) {

        showToast(
            "Formula expression is required",
            true
        );

        return;
    }


    const tags =
        tagsText

            ? tagsText
                .split(",")
                .map(
                    tag =>
                        tag.trim()
                )
                .filter(Boolean)

            : [];


    const payload = {

        name,

        expression,

        description,

        category,

        level,

        difficulty,

        tags,

        status

    };


    try {

        const isEdit =
            Boolean(
                editingFormula &&
                id
            );


        const url =
            isEdit
                ? `${API_BASE}/${encodeURIComponent(id)}`
                : API_BASE;


        const response =
            await fetch(
                url,
                {
                    method:
                        isEdit
                            ? "PUT"
                            : "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...authHeaders()
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                (
                    isEdit
                        ? "Unable to update formula"
                        : "Unable to add formula"
                )
            );
        }


        showToast(
            isEdit
                ? "Formula updated successfully"
                : "Formula added successfully"
        );


        clearFormulaForm();


        await loadFormulas();

    }
    catch (error) {

        console.error(
            "Save formula error:",
            error
        );


        showToast(
            error.message,
            true
        );
    }
}


/* =========================================================
   VIEW FORMULA
========================================================= */

async function openViewFormula(
    id
) {

    try {

        const formula =
            await getFormula(id);


        if (!formula) {
            return;
        }


        const modal =
            document.getElementById(
                "formulaViewModal"
            );


        const content =
            document.getElementById(
                "formulaModalContent"
            );


        if (
            !modal ||
            !content
        ) {
            return;
        }


        content.innerHTML = `

            <h2>
                ${escapeHTML(
                    formula.name ||
                    "Formula"
                )}
            </h2>


            <div class="modal-detail">

                <label>
                    Formula Expression
                </label>

                <div
                    class="modal-expression"
                >
                    ${escapeHTML(
                        formula.expression ||
                        "—"
                    )}
                </div>

            </div>


            <div class="modal-detail">

                <label>
                    Category
                </label>

                <strong>
                    ${escapeHTML(
                        formula.category ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-detail">

                <label>
                    Description
                </label>

                <div>
                    ${escapeHTML(
                        formula.description ||
                        "No description available."
                    )}
                </div>

            </div>


            <div class="modal-detail">

                <label>
                    Level
                </label>

                <strong>
                    ${escapeHTML(
                        formula.level ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-detail">

                <label>
                    Difficulty
                </label>

                <strong>
                    ${escapeHTML(
                        formula.difficulty ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="modal-detail">

                <label>
                    Status
                </label>

                <strong>
                    ${escapeHTML(
                        formula.status ||
                        "active"
                    )}
                </strong>

            </div>


            <div class="modal-detail">

                <label>
                    Views
                </label>

                <strong>
                    ${Number(
                        formula.views || 0
                    ).toLocaleString(
                        "en-IN"
                    )}
                </strong>

            </div>


            <div class="modal-detail">

                <label>
                    Added Date
                </label>

                <strong>
                    ${formatDate(
                        formula.createdAt
                    )}
                </strong>

            </div>

        `;


        modal.classList.remove(
            "hidden"
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
   INCREMENT VIEWS
========================================================= */

async function incrementFormulaViews(
    id
) {

    try {

        await fetch(
            `${API_BASE}/${encodeURIComponent(id)}/views`,
            {
                method: "PATCH"
            }
        );

    }
    catch (error) {

        console.warn(
            "Formula view update failed:",
            error
        );
    }
}


/* =========================================================
   DELETE FORMULA
========================================================= */

async function deleteFormula(
    id
) {

    const formula =
        state.formulas.find(
            item =>
                String(
                    item._id
                ) ===
                String(id)
        );


    if (!formula) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete this formula?\n\n${
                formula.name
            }\n\n${
                formula.expression
            }`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/${encodeURIComponent(id)}`,
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
                "Unable to delete formula"
            );
        }


        showToast(
            "Formula deleted successfully"
        );


        if (
            state.formulas.length === 1 &&
            currentPage > 1
        ) {

            currentPage--;

        }


        await loadFormulas();

    }
    catch (error) {

        console.error(
            "Delete formula error:",
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
            "formulaTableBody"
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


            if (!id) {
                return;
            }


            if (
                action === "view"
            ) {

                openViewFormula(
                    id
                );

            }


            else if (
                action === "edit"
            ) {

                openEditMode(
                    id
                );

            }


            else if (
                action === "delete"
            ) {

                deleteFormula(
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

        "categoryFilter",

        "levelFilter",

        "difficultyFilter",

        "sortFilter"

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

                    loadFormulas();

                }
            );

        }
    );


    const search =
        document.getElementById(
            "formulaSearch"
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

                            loadFormulas();

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
                    search.value = "";
                }


                const category =
                    document.getElementById(
                        "categoryFilter"
                    );

                if (category) {
                    category.value =
                        "all";
                }


                const level =
                    document.getElementById(
                        "levelFilter"
                    );

                if (level) {
                    level.value =
                        "all";
                }


                const difficulty =
                    document.getElementById(
                        "difficultyFilter"
                    );

                if (difficulty) {
                    difficulty.value =
                        "all";
                }


                const sort =
                    document.getElementById(
                        "sortFilter"
                    );

                if (sort) {
                    sort.value =
                        "newest";
                }


                currentPage =
                    1;


                loadFormulas();

            }
        );
    }
}


/* =========================================================
   EDITOR BUTTONS
========================================================= */

function setupEditor() {

    const form =
        document.getElementById(
            "formulaForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            saveFormula
        );
    }


    const addTab =
        document.getElementById(
            "addTab"
        );


    if (addTab) {

        addTab.addEventListener(
            "click",
            openAddMode
        );
    }


    const editTab =
        document.getElementById(
            "editTab"
        );


    if (editTab) {

        editTab.addEventListener(
            "click",
            () => {

                const id =
                    document.getElementById(
                        "formulaId"
                    )?.value;


                if (id) {

                    setEditorMode(
                        true
                    );

                }
                else {

                    showToast(
                        "Select a formula from the table to edit."
                    );

                }
            }
        );
    }


    const clearButton =
        document.getElementById(
            "clearFormulaButton"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFormulaForm
        );
    }


    const topAddButton =
        document.getElementById(
            "addFormulaTopButton"
        );


    if (topAddButton) {

        topAddButton.addEventListener(
            "click",
            () => {

                openAddMode();


                document
                    .getElementById(
                        "formulaEditorPanel"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

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
                    "calculation"
                )
            ) {

                window.location.href =
                    "calculations.html";

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


            const formulaSearch =
                document.getElementById(
                    "formulaSearch"
                );


            if (formulaSearch) {

                formulaSearch.value =
                    search.value;


                currentPage =
                    1;


                loadFormulas();


                formulaSearch.focus();
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

            else {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );


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

                }
                else {

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


        if (response.ok) {

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
   APPLY PROFILE
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
            "formulaViewModal"
        );


    const close =
        document.getElementById(
            "formulaModalClose"
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
        window.calcuraFormulaToast
    );


    window.calcuraFormulaToast =
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
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupSidebar();

        setupFilters();

        setupTableActions();

        setupEditor();

        setupGlobalSearch();

        setupModal();

        setupNotification();

        setupProfileButton();

        clearFormulaForm();

        await loadAdminProfile();

        await loadFormulas();

    }
);