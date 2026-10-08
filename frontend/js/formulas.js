/* =========================================================
   CALCURA - USER FORMULA LIBRARY
   MONGODB CONNECTED VERSION
========================================================= */

const API_BASE = "http://localhost:5000/api/formulas";
/* =========================================================
   ELEMENTS
========================================================= */

const formulaList =
    document.getElementById("formulaList");

const searchFormula =
    document.getElementById("sideFormulaSearch");

const popularFormulaList =
    document.getElementById("popularFormulaList");

const studySaveButton =
    document.getElementById("studySaveButton");

/* =========================================================
   STATE
========================================================= */

let formulas = [];

let activeCategory = "all";

let currentVisibleFormulas = [];

let selectedFormula = null;

/* =========================================================
   TOKEN
========================================================= */

function getToken() {
    return (
        localStorage.getItem("calcuraToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}

/* =========================================================
   LOAD FORMULAS FROM MONGODB
========================================================= */

async function loadFormulas() {

    try {

        const response = await fetch(
            `${API_BASE}?status=active&limit=1000`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Failed to load formulas"
            );
        }

        formulas =
            data.formulas ||
            data.data ||
            [];

        /*
         * MongoDB formula -> User frontend format
         */

        formulas = formulas.map(formula => ({
            id: formula._id,

            name: formula.name || "",

            equation:
                formula.expression || "",

            category:
                String(formula.category || "")
                    .toLowerCase(),

            description:
                formula.description || "",

            icon:
                formula.icon ||
                "fa-book",

            level:
                formula.level || "College",

            difficulty:
                formula.difficulty || "Medium",

            views:
                Number(formula.views || 0)
        }));

        if (formulas.length > 0) {
            selectedFormula = formulas[0];
        }

        displayFormulas();

        displayPopularFormulas();

        updateCategoryTabs();

    } catch (error) {

        console.error(
            "Formula Load Error:",
            error
        );

        if (formulaList) {

            formulaList.innerHTML = `
                <div class="no-formula">
                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>Unable to load formulas</h3>

                    <p>
                        Please make sure the Calcura
                        backend server is running.
                    </p>
                </div>
            `;
        }
    }
}

/* =========================================================
   DISPLAY FORMULAS
========================================================= */

function displayFormulas() {

    if (!formulaList) {
        return;
    }

    const searchText =
        searchFormula
            ? searchFormula.value
                .toLowerCase()
                .trim()
            : "";

    const filteredFormulas =
        formulas.filter(formula => {

            const matchesCategory =
                activeCategory === "all" ||
                formula.category === activeCategory;

            const searchableText = (

                formula.name +
                " " +
                formula.equation +
                " " +
                formula.description +
                " " +
                formula.category

            ).toLowerCase();
            const matchesSearch =
                searchableText.includes(
                    searchText
                );

            return (
                matchesCategory &&
                matchesSearch
            );
        });

    /*
     * Same existing layout:
     * All + no search = first 9
     * Search/category = all matching
     */

    if (
        activeCategory === "all" &&
        searchText === ""
    ) {

        currentVisibleFormulas =
            filteredFormulas.slice(0, 9);

    } else {

        currentVisibleFormulas =
            filteredFormulas;
    }

    formulaList.innerHTML = "";

    if (
        currentVisibleFormulas.length === 0
    ) {

        formulaList.innerHTML = `
            <div class="no-formula">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>No formulas found</h3>

                <p>
                    Try another formula name,
                    keyword, or category.
                </p>

            </div>
        `;

        return;
    }

    currentVisibleFormulas.forEach(
        formula => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "formula-card";

            card.innerHTML = `

                <div class="formula-card-header">

                    <div class="
                        formula-card-icon
                        ${getCategoryIconClass(
                            formula.category
                        )}
                    ">

                        <i class="
                            fa-solid
                            ${escapeHTML(
                                formula.icon
                            )}
                        "></i>

                    </div>

                    <h3>
                        ${escapeHTML(
                            formula.name
                        )}
                    </h3>

                    <button
                        class="formula-copy-button"
                        type="button"
                        data-copy="${formula.id}"
                        title="Copy formula"
                    >

                        <i class="
                            fa-regular
                            fa-copy
                        "></i>

                    </button>

                </div>

                <div class="formula-equation">

                   <span class="math-formula">
                     \\(${escapeHTML(formula.equation)}\\)
                   </span>

                </div>

                <div class="formula-description">

                    ${escapeHTML(
                        formula.description
                    )}

                </div>

            `;

formulaList.appendChild(card);
if (
    window.MathJax &&
    typeof window.MathJax.typesetPromise === "function"
) {
    window.MathJax.typesetPromise([
        formulaList
    ]).catch(error => {
        console.error(
            "MathJax rendering error:",
            error
        );
    });
}
        }
    );
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function getCategoryIconClass(category) {

    return category || "algebra";
}

/* =========================================================
   CATEGORY TABS
========================================================= */

const formulaTabs =
    document.querySelectorAll(
        ".formula-tab"
    );

formulaTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            formulaTabs.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });

            tab.classList.add(
                "active"
            );

            activeCategory =
                (
                    tab.dataset.category ||
                    "all"
                ).toLowerCase();

            displayFormulas();
        }
    );
});

/* =========================================================
   UPDATE CATEGORY TABS
========================================================= */

function updateCategoryTabs() {

    const categories =
        [
            ...new Set(
                formulas
                    .map(
                        formula =>
                            formula.category
                    )
                    .filter(Boolean)
            )
        ];

    formulaTabs.forEach(tab => {

        const category =
            (
                tab.dataset.category ||
                "all"
            ).toLowerCase();

        if (category === "all") {
            return;
        }

        /*
         * Keep existing design.
         * Hide only categories which have
         * no MongoDB formulas.
         */

        const exists =
            categories.includes(
                category
            );

        tab.style.display =
            exists
                ? ""
                : "none";
    });
}

/* =========================================================
   SEARCH
========================================================= */

if (searchFormula) {

    searchFormula.addEventListener(
        "input",
        () => {

            displayFormulas();

        }
    );
}

/* =========================================================
   COPY FORMULA
========================================================= */

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".formula-copy-button"
            );

        if (!button) {
            return;
        }

        const formula =
            formulas.find(
                item =>
                    item.id ===
                    button.dataset.copy
            );

        if (!formula) {
            return;
        }

        try {

            await navigator.clipboard.writeText(
                formula.equation
            );

            const originalHTML =
                button.innerHTML;

            button.innerHTML =
                `
                <i class="
                    fa-solid
                    fa-check
                "></i>
                `;

            button.style.color =
                "#35d07f";

            setTimeout(
                () => {

                    button.innerHTML =
                        originalHTML;

                    button.style.color =
                        "";

                },
                1200
            );

        } catch (error) {

            console.error(
                "Copy Formula Error:",
                error
            );
        }
    }
);

/* =========================================================
   POPULAR FORMULAS
   MongoDB views based
========================================================= */

function displayPopularFormulas() {

    if (!popularFormulaList) {
        return;
    }

    popularFormulaList.innerHTML = "";

    const popular =
        [...formulas]
            .sort(
                (a, b) =>
                    b.views - a.views
            )
            .slice(0, 5);

    popular.forEach(
        (formula, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "popular-formula-item";

            item.dataset.formulaId =
                formula.id;

            item.innerHTML = `

                <span class="
                    popular-number
                ">
                    ${index + 1}
                </span>

                <span class="
                    popular-name
                ">
                    ${escapeHTML(
                        formula.name
                    )}
                </span>

            `;

            popularFormulaList.appendChild(
                item
            );
        }
    );
}

/* =========================================================
   POPULAR FORMULA CLICK
========================================================= */

if (popularFormulaList) {

    popularFormulaList.addEventListener(
        "click",
        async event => {

            const item =
                event.target.closest(
                    ".popular-formula-item"
                );

            if (!item) {
                return;
            }

            const formula =
                formulas.find(
                    f =>
                        f.id ===
                        item.dataset.formulaId
                );

            if (!formula) {
                return;
            }

            selectedFormula =
                formula;

            if (searchFormula) {

                searchFormula.value =
                    formula.name;
            }

            activeCategory =
                "all";

            formulaTabs.forEach(tab => {

                tab.classList.toggle(
                    "active",
                    tab.dataset.category ===
                    "all"
                );

            });

           displayFormulas();

            await openFormulaDetail(
            formula
            );
        }
    );
}

/* =========================================================
   INCREASE VIEWS
========================================================= */

async function increaseFormulaViews(formulaId) {

    try {

        const response = await fetch(
            `${API_BASE}/${encodeURIComponent(formulaId)}/views`,
            {
                method: "PATCH"
            }
        );

        if (!response.ok) {
            return;
        }

        const data = await response.json();

        const formula = formulas.find(
            item =>
                String(item.id) ===
                String(formulaId)
        );

        if (formula) {

            formula.views =
                Number(data.views || formula.views || 0);
        }

        displayPopularFormulas();

    } catch (error) {

        console.error(
            "Formula View Error:",
            error
        );
    }
}
/* =========================================================
   SAVE FORMULA
========================================================= */

function getSavedFormulas() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "calcuraSavedFormulas"
            )
        ) || [];

    } catch {

        return [];
    }
}

function saveFormula(formula) {

    if (!formula) {
        return;
    }

    const saved =
        getSavedFormulas();

    if (
        !saved.some(
            item =>
                item.id ===
                formula.id
        )
    ) {

        saved.push(formula);

        localStorage.setItem(
            "calcuraSavedFormulas",
            JSON.stringify(saved)
        );
    }
}

/* =========================================================
   STUDY TIP SAVE
========================================================= */

if (studySaveButton) {

    studySaveButton.addEventListener(
        "click",
        () => {

            saveFormula(
                selectedFormula
            );

            const originalText =
                studySaveButton.textContent;

            studySaveButton.textContent =
                "✓ Formula Saved";

            setTimeout(
                () => {

                    studySaveButton.textContent =
                        originalText;

                },
                1500
            );
        }
    );
}

/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}

/* =========================================================
   GLOBAL CALCURA SEARCH
========================================================= */

const globalSearch =
    document.getElementById(
        "globalSearch"
    );

const clearGlobalSearch =
    document.getElementById(
        "clearGlobalSearch"
    );

const searchPages = {

    home: "dashboard.html",

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

if (globalSearch) {

    globalSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }

            const query =
                globalSearch.value
                    .trim()
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        " "
                    );

            if (!query) {
                return;
            }

            if (
                searchPages[query]
            ) {

                window.location.href =
                    searchPages[query];

                return;
            }

            const matchedPage =
                Object.keys(
                    searchPages
                ).find(
                    page =>
                        page.includes(
                            query
                        ) ||
                        query.includes(
                            page
                        )
                );

            if (matchedPage) {

                window.location.href =
                    searchPages[
                        matchedPage
                    ];

                return;
            }

            const topicPages = [

                [
                    "formula",
                    "formulas.html"
                ],

                [
                    "quadratic",
                    "formulas.html"
                ],

                [
                    "trigonometry",
                    "formulas.html"
                ],

                [
                    "calculus",
                    "formulas.html"
                ],

                [
                    "matrix",
                    "formulas.html"
                ],

                [
                    "statistics",
                    "formulas.html"
                ],

                [
                    "physics",
                    "formulas.html"
                ],

                [
                    "voice",
                    "voice-input.html"
                ],

                [
                    "microphone",
                    "voice-input.html"
                ],

                [
                    "graph",
                    "graph.html"
                ],

                [
                    "plot",
                    "graph.html"
                ],

                [
                    "convert",
                    "converter.html"
                ],

                [
                    "unit",
                    "converter.html"
                ]
            ];

            const topic =
                topicPages.find(
                    ([keyword]) =>
                        query.includes(
                            keyword
                        )
                );

            if (topic) {

                window.location.href =
                    topic[1];
            }
        }
    );
}

if (
    globalSearch &&
    clearGlobalSearch
) {

    globalSearch.addEventListener(
        "input",
        () => {

            clearGlobalSearch.style.display =
                globalSearch.value
                    ? "block"
                    : "none";
        }
    );

    clearGlobalSearch.addEventListener(
        "click",
        () => {

            globalSearch.value =
                "";

            clearGlobalSearch.style.display =
                "none";

            globalSearch.focus();
        }
    );
}

/* =========================================================
   NOTIFICATION
========================================================= */

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

            notificationPanel.classList.toggle(
                "open"
            );
        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                !notificationPanel.contains(
                    event.target
                ) &&
                !notificationButton.contains(
                    event.target
                )
            ) {

                notificationPanel.classList.remove(
                    "open"
                );
            }
        }
    );
}

/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadFormulas();

    }
);
/* =========================================================
   CALCURA - REAL LOGGED-IN USER
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const profileName =
            document.getElementById(
                "profileName"
            );

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );

        function setUserName(name) {

            if (!name) {
                return;
            }

            const cleanName =
                String(name).trim();

            if (!cleanName) {
                return;
            }

            /* REAL USER NAME */

            if (profileName) {

                profileName.textContent =
                    cleanName;
            }

            /* REAL USER FIRST LETTER */

            if (profileAvatar) {

                profileAvatar.textContent =
                    cleanName
                        .charAt(0)
                        .toUpperCase();
            }
        }


        /* =================================================
           1. SHOW SAVED LOGGED-IN USER IMMEDIATELY
        ================================================= */

        try {

            if (
                typeof getSavedUser ===
                "function"
            ) {

                const savedUser =
                    getSavedUser();

                if (savedUser) {

                    setUserName(
                        savedUser.name ||
                        savedUser.fullName ||
                        savedUser.username
                    );
                }

            } else {

                const rawUser =
                    localStorage.getItem(
                        "calcuraUser"
                    );

                if (rawUser) {

                    const savedUser =
                        JSON.parse(
                            rawUser
                        );

                    setUserName(
                        savedUser.name ||
                        savedUser.fullName ||
                        savedUser.username
                    );
                }
            }

        } catch (error) {

            console.error(
                "Saved user loading error:",
                error
            );
        }


        /* =================================================
           2. GET LATEST REAL USER FROM BACKEND
        ================================================= */

        try {

            if (
                typeof getCurrentUser ===
                "function"
            ) {

                const currentUser =
                    await getCurrentUser();

                const userData =
                    currentUser?.user ||
                    currentUser;

                if (userData) {

                    setUserName(
                        userData.name ||
                        userData.fullName ||
                        userData.username
                    );
                }
            }

        } catch (error) {

            console.error(
                "Current user loading error:",
                error
            );
        }

    }
);
/* =========================================================
   FORMULA DETAIL MODAL
========================================================= */

const formulaDetailModal =
    document.getElementById("formulaDetailModal");

const formulaDetailName =
    document.getElementById("formulaDetailName");

const formulaDetailCategory =
    document.getElementById("formulaDetailCategory");

const formulaDetailIcon =
    document.getElementById("formulaDetailIcon");

const formulaDetailExpression =
    document.getElementById("formulaDetailExpression");

const formulaDetailDescription =
    document.getElementById("formulaDetailDescription");

const formulaDetailLevel =
    document.getElementById("formulaDetailLevel");

const formulaDetailDifficulty =
    document.getElementById("formulaDetailDifficulty");

const formulaDetailViews =
    document.getElementById("formulaDetailViews");

const closeFormulaDetail =
    document.getElementById("closeFormulaDetail");

const formulaDetailCloseButton =
    document.getElementById(
        "formulaDetailCloseButton"
    );

const formulaDetailCopy =
    document.getElementById(
        "formulaDetailCopy"
    );


/* =========================================================
   OPEN FORMULA DETAIL
========================================================= */

async function openFormulaDetail(formula) {

    if (
        !formula ||
        !formulaDetailModal
    ) {
        return;
    }


    selectedFormula = formula;


    /* NAME */

    if (formulaDetailName) {

        formulaDetailName.textContent =
            formula.name || "Formula";

    }


    /* CATEGORY */

    if (formulaDetailCategory) {

        formulaDetailCategory.textContent =
            formula.category || "Other";

    }


    /* ICON */

    if (formulaDetailIcon) {

        formulaDetailIcon.innerHTML = `
            <i class="fa-solid ${
                escapeHTML(
                    formula.icon ||
                    "fa-book"
                )
            }"></i>
        `;

    }


    /* EXPRESSION */

    if (formulaDetailExpression) {

        formulaDetailExpression.innerHTML =
            `\\(${escapeHTML(
                formula.equation || ""
            )}\\)`;

    }


    /* DESCRIPTION */

    if (formulaDetailDescription) {

        formulaDetailDescription.textContent =
            formula.description ||
            "No description available.";

    }


    /* LEVEL */

    if (formulaDetailLevel) {

        formulaDetailLevel.textContent =
            formula.level || "College";

    }


    /* DIFFICULTY */

    if (formulaDetailDifficulty) {

        formulaDetailDifficulty.textContent =
            formula.difficulty || "Medium";

    }


    /* CURRENT VIEWS */

    if (formulaDetailViews) {

        formulaDetailViews.textContent =
            Number(
                formula.views || 0
            ).toLocaleString("en-IN");

    }


    /* OPEN MODAL */

    formulaDetailModal.classList.add(
        "active"
    );


    /* MATHJAX */

    if (
        window.MathJax &&
        typeof window.MathJax.typesetPromise ===
            "function"
    ) {

        window.MathJax.typesetPromise([
            formulaDetailExpression
        ]).catch(error => {

            console.error(
                "Formula detail MathJax error:",
                error
            );

        });

    }


    /* USER VIEW = +1 */

    await increaseFormulaViews(
        formula.id
    );


    /* UPDATE MODAL VIEW COUNT */

    if (formulaDetailViews) {

        formulaDetailViews.textContent =
            Number(
                formula.views || 0
            ).toLocaleString("en-IN");

    }

}


/* =========================================================
   FORMULA CARD CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        const card =
            event.target.closest(
                ".formula-card"
            );

        if (!card) {
            return;
        }


        /* COPY BUTTON KO IGNORE KARO */

        if (
            event.target.closest(
                ".formula-copy-button"
            )
        ) {
            return;
        }


        /* FORMULA ID CARD SE LO */

        const copyButton =
            card.querySelector(
                ".formula-copy-button"
            );

        const formulaId =
            copyButton?.dataset.copy;


        if (!formulaId) {
            return;
        }


        /* MONGODB SE LOADED FORMULA */

        const formula =
            formulas.find(
                item =>
                    String(item.id) ===
                    String(formulaId)
            );


        if (!formula) {
            return;
        }


        /* OPEN DETAIL */

        openFormulaDetail(
            formula
        );

    }
);

/* =========================================================
   CLOSE MODAL
========================================================= */

function closeFormulaDetailModal() {

    if (!formulaDetailModal) {
        return;
    }

    formulaDetailModal.classList.remove(
        "active"
    );

}


/* CLOSE ICON */

if (closeFormulaDetail) {

    closeFormulaDetail.addEventListener(
        "click",
        closeFormulaDetailModal
    );

}


/* CLOSE BUTTON */

if (formulaDetailCloseButton) {

    formulaDetailCloseButton.addEventListener(
        "click",
        closeFormulaDetailModal
    );

}


/* CLICK OUTSIDE */

if (formulaDetailModal) {

    formulaDetailModal.addEventListener(
        "click",
        event => {

            if (
                event.target.classList.contains(
                    "formula-detail-overlay"
                )
            ) {

                closeFormulaDetailModal();

            }

        }
    );

}


/* ESC KEY */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeFormulaDetailModal();

        }

    }
);


/* =========================================================
   COPY FROM MODAL
========================================================= */

if (formulaDetailCopy) {

    formulaDetailCopy.addEventListener(
        "click",
        async () => {

            if (
                !selectedFormula
            ) {
                return;
            }


            try {

                await navigator.clipboard.writeText(
                    selectedFormula.equation || ""
                );


                const originalHTML =
                    formulaDetailCopy.innerHTML;


                formulaDetailCopy.innerHTML = `
                    <i class="fa-solid fa-check"></i>
                    Copied
                `;


                setTimeout(
                    () => {

                        formulaDetailCopy.innerHTML =
                            originalHTML;

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "Formula detail copy error:",
                    error
                );

            }

        }
    );

}