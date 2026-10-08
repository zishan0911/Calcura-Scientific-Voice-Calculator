/* =========================================================
   CALCURA GLOBAL THEME SYSTEM
   Dark = default
   Light = complete white theme
   System = Dark fallback
========================================================= */

(function () {

    const THEME_STORAGE_KEY = "calcuraTheme";

    function getStoredTheme() {

        try {

            const directTheme =
                localStorage.getItem(
                    THEME_STORAGE_KEY
                );

            if (
                directTheme === "light" ||
                directTheme === "dark" ||
                directTheme === "system"
            ) {

                return directTheme;

            }


            const settings =
                JSON.parse(
                    localStorage.getItem(
                        "calcuraSettings"
                    ) || "{}"
                );


            if (
                settings.theme === "light" ||
                settings.theme === "dark" ||
                settings.theme === "system"
            ) {

                return settings.theme;

            }

        }

        catch (error) {

            console.error(
                "Theme read error:",
                error
            );

        }


        return "dark";

    }


    function addLightThemeCSS() {

        if (
            document.getElementById(
                "calcura-light-theme"
            )
        ) {

            return;

        }


        const style =
            document.createElement("style");


        style.id =
            "calcura-light-theme";


        style.textContent = `

/* =========================================================
   CALCURA LIGHT THEME
========================================================= */


/* ---------- PAGE ---------- */

html,
body {

    transition:
        background-color 0.25s ease,
        color 0.25s ease;

}


body.light-theme {

    background:
        #f4f7fb !important;

    color:
        #1d2939 !important;

}


/* ---------- MAIN PAGE BACKGROUNDS ---------- */

body.light-theme main,
body.light-theme section,
body.light-theme .dashboard-main,
body.light-theme .settings-page,
body.light-theme .settings-main,
body.light-theme .history-page,
body.light-theme .saved-page,
body.light-theme .formula-page,
body.light-theme .converter-page,
body.light-theme .voice-page,
body.light-theme .about-page,
body.light-theme .help-page,
body.light-theme .profile-page,
body.light-theme .upgrade-page {

    background-color:
        #f4f7fb !important;

    color:
        #1d2939 !important;

}


/* ---------- SIDEBAR ---------- */

body.light-theme .calcura-sidebar {

    background:
        linear-gradient(
            180deg,
            #ffffff 0%,
            #f7f9fc 100%
        ) !important;

    border-right:
        1px solid #dce3eb !important;

    box-shadow:
        4px 0 18px
        rgba(15, 23, 42, 0.06) !important;

}


body.light-theme .sidebar-logo {

    border-bottom:
        1px solid #e2e8f0 !important;

}


body.light-theme .sidebar-logo-name {

    color:
        #172033 !important;

}


body.light-theme .sidebar-logo-tagline {

    color:
        #718096 !important;

}


body.light-theme .sidebar-link {

    color:
        #536174 !important;

}


body.light-theme .sidebar-link
span:first-child {

    color:
        #64748b !important;

}


body.light-theme .sidebar-link:hover {

    background:
        #edf4ff !important;

    color:
        #172033 !important;

}


body.light-theme .sidebar-link:hover
span:first-child {

    color:
        #087cff !important;

}


body.light-theme .sidebar-link.active {

    background:
        linear-gradient(
            135deg,
            #087cff,
            #176de5
        ) !important;

    color:
        #ffffff !important;

}


body.light-theme .sidebar-link.active
span:first-child {

    color:
        #ffffff !important;

}


/* ---------- SIDEBAR UPGRADE ---------- */

body.light-theme .sidebar-upgrade {

    background:
        #ffffff !important;

    border:
        1px solid #dbe5ef !important;

}


body.light-theme .upgrade-title,
body.light-theme .upgrade-text,
body.light-theme .upgrade-list {

    color:
        #334155 !important;

}


/* ---------- TOP HEADERS ---------- */

body.light-theme .dashboard-top-header,
body.light-theme .dashboard-header,
body.light-theme .settings-topbar,
body.light-theme .calculator-header,
body.light-theme .calculator-top,
body.light-theme .history-topbar,
body.light-theme .saved-topbar,
body.light-theme .formula-topbar,
body.light-theme .converter-topbar,
body.light-theme .voice-topbar {

    background:
        rgba(
            255,
            255,
            255,
            0.96
        ) !important;

    border-color:
        #dde5ee !important;

    color:
        #182230 !important;

}


/* ---------- SEARCH BOXES ---------- */

body.light-theme .dashboard-search,
body.light-theme .settings-search,
body.light-theme .calculator-search,
body.light-theme .history-search,
body.light-theme .saved-search,
body.light-theme .formula-search,
body.light-theme .converter-search,
body.light-theme .voice-search,
body.light-theme input[type="search"] {

    background:
        #ffffff !important;

    border:
        1px solid #d7e0e9 !important;

    color:
        #182230 !important;

}


body.light-theme .dashboard-search input,
body.light-theme .settings-search input,
body.light-theme .calculator-search input,
body.light-theme .history-search input,
body.light-theme .saved-search input,
body.light-theme .formula-search input,
body.light-theme .converter-search input,
body.light-theme .voice-search input {

    background:
        transparent !important;

    color:
        #182230 !important;

}


body.light-theme input::placeholder {

    color:
        #94a3b8 !important;

}


/* ---------- HEADINGS ---------- */

body.light-theme h1,
body.light-theme h2,
body.light-theme h3,
body.light-theme h4,
body.light-theme strong {

    color:
        #172033 !important;

}


body.light-theme p {

    color:
        #64748b !important;

}


/* ---------- COMMON CARDS ---------- */

body.light-theme
[class$="-card"],
body.light-theme
[class*=" card"] {

    background:
        #ffffff !important;

    color:
        #1d2939 !important;

    border-color:
        #dce4ec !important;

    box-shadow:
        0 8px 25px
        rgba(
            15,
            23,
            42,
            0.06
        ) !important;

}


/* ---------- DASHBOARD ---------- */

body.light-theme .welcome-card {

    background:
        linear-gradient(
            135deg,
            #ffffff,
            #eef6ff
        ) !important;

    border-color:
        #d7e5f4 !important;

}


body.light-theme .quick-card,
body.light-theme .feature-card {

    background:
        #ffffff !important;

}


body.light-theme .quick-card:hover,
body.light-theme .feature-card:hover {

    background:
        #f8fbff !important;

    border-color:
        #b9d7f5 !important;

}


body.light-theme .recent-calculations {

    background:
        #ffffff !important;

    border-color:
        #dce4ec !important;

}


/* ---------- SETTINGS ---------- */

body.light-theme .settings-hero {

    background:
        linear-gradient(
            135deg,
            #ffffff,
            #eef6ff
        ) !important;

    border-color:
        #d7e5f4 !important;

}


body.light-theme .settings-panel {

    background:
        #ffffff !important;

    border-color:
        #dce4ec !important;

}


body.light-theme .setting-item {

    background:
        #ffffff !important;

    border-color:
        #e1e7ee !important;

}


body.light-theme .setting-item-left
strong {

    color:
        #172033 !important;

}


body.light-theme .setting-item-left p {

    color:
        #718096 !important;

}


body.light-theme .setting-icon {

    background:
        #edf5ff !important;

    color:
        #087cff !important;

}


body.light-theme .appearance-info,
body.light-theme .simple-settings-box {

    background:
        #f8fafc !important;

    color:
        #334155 !important;

    border-color:
        #dce4ec !important;

}


/* ---------- RIGHT SIDEBAR ---------- */

body.light-theme .right-card,
body.light-theme .help-card {

    background:
        #ffffff !important;

    border-color:
        #dce4ec !important;

}


body.light-theme .account-card
strong,
body.light-theme .account-card
span,
body.light-theme .account-card
em {

    color:
        #334155 !important;

}


/* ---------- CALCULATOR ---------- */

body.light-theme .calculator-card,
body.light-theme .calculator-history,
body.light-theme .calculator-right {

    color:
        #182230 !important;

}


body.light-theme .calculator-display {

    background:
        #f8fafc !important;

    border-color:
        #d7e0e9 !important;

}


body.light-theme .calculator-expression {

    color:
        #64748b !important;

}


body.light-theme .calculator-result {

    color:
        #172033 !important;

}


/* ---------- INPUTS ---------- */

body.light-theme input,
body.light-theme select,
body.light-theme textarea {

    background:
        #ffffff !important;

    color:
        #172033 !important;

    border-color:
        #cfd9e4 !important;

}


body.light-theme input:focus,
body.light-theme select:focus,
body.light-theme textarea:focus {

    border-color:
        #1688ff !important;

    box-shadow:
        0 0 0 3px
        rgba(
            22,
            136,
            255,
            0.10
        ) !important;

}


/* ---------- TABLES ---------- */

body.light-theme table {

    background:
        #ffffff !important;

    color:
        #243143 !important;

    border-color:
        #dce4ec !important;

}


body.light-theme th {

    background:
        #f1f5f9 !important;

    color:
        #334155 !important;

}


body.light-theme td {

    color:
        #475569 !important;

    border-color:
        #e2e8f0 !important;

}


/* ---------- DROPDOWNS ---------- */

body.light-theme option {

    background:
        #ffffff !important;

    color:
        #172033 !important;

}


/* ---------- TABS ---------- */

body.light-theme .settings-tab {

    color:
        #64748b !important;

}


body.light-theme .settings-tab:hover {

    background:
        #eef5ff !important;

    color:
        #087cff !important;

}


body.light-theme .settings-tab.active {

    color:
        #087cff !important;

}


/* ---------- FOOTERS ---------- */

body.light-theme
.dashboard-footer,
body.light-theme
.settings-footer,
body.light-theme
.calculator-footer {

    color:
        #64748b !important;

    border-color:
        #dce4ec !important;

}


body.light-theme
.dashboard-footer a,
body.light-theme
.settings-footer a,
body.light-theme
.calculator-footer a {

    color:
        #087cff !important;

}


/* ---------- GENERAL LINKS ---------- */

body.light-theme a {

    color:
        #087cff;

}


/* ---------- KEEP BLUE ACTION BUTTONS ---------- */

body.light-theme
.dashboard-primary-button,
body.light-theme
.dashboard-secondary-button,
body.light-theme
.settings-upgrade,
body.light-theme
.upgrade-button,
body.light-theme
.right-upgrade-btn,
body.light-theme
.help-button,
body.light-theme
.panel-action-btn {

    color:
        #ffffff !important;

}


/* ---------- AUTH PAGES ---------- */

body.light-theme.auth-page,
body.light-theme .auth-container {

    background:
        #f4f7fb !important;

}


body.light-theme .auth-card {

    background:
        #ffffff !important;

    border-color:
        #dce4ec !important;

    box-shadow:
        0 25px 60px
        rgba(
            15,
            23,
            42,
            0.10
        ) !important;

}


body.light-theme .auth-card h1 {

    color:
        #172033 !important;

}


body.light-theme .auth-subtitle {

    color:
        #718096 !important;

}


body.light-theme .auth-footer {

    color:
        #718096 !important;

}


/* ---------- SCROLLBAR ---------- */

body.light-theme ::-webkit-scrollbar {

    width:
        9px;

}


body.light-theme ::-webkit-scrollbar-track {

    background:
        #eef2f6;

}


body.light-theme ::-webkit-scrollbar-thumb {

    background:
        #c3ced9;

    border-radius:
        10px;

}


body.light-theme ::-webkit-scrollbar-thumb:hover {

    background:
        #9eacba;

}

`;


        document.head.appendChild(
            style
        );

    }


    function applyCalcuraTheme(
        theme
    ) {

        const selectedTheme =
            theme === "light"
                ? "light"
                : "dark";


        addLightThemeCSS();


        document.body.classList.toggle(
            "light-theme",
            selectedTheme === "light"
        );


        document.documentElement
            .setAttribute(
                "data-calcura-theme",
                selectedTheme
            );


        try {

            localStorage.setItem(
                THEME_STORAGE_KEY,
                theme
            );

        }

        catch (error) {

            console.error(
                "Theme save error:",
                error
            );

        }

    }


    window.applyCalcuraTheme =
        applyCalcuraTheme;


    window.getCalcuraTheme =
        getStoredTheme;


    /* Apply immediately */

    const savedTheme =
        getStoredTheme();


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                applyCalcuraTheme(
                    savedTheme
                );

            },
            {
                once: true
            }
        );

    }

    else {

        applyCalcuraTheme(
            savedTheme
        );

    }

})();
// ========================================
// CALCURA AUTHENTICATION
// ========================================

// REGISTER
async function registerUser(name, email, password) {
    return await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });
}


// LOGIN
async function loginUser(email, password) {
    const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

    // Save login information
    if (data.success) {
        localStorage.setItem("calcuraToken", data.token);
        localStorage.setItem(
            "calcuraUser",
            JSON.stringify(data.user)
        );
    }

    return data;
}


// GET CURRENT USER
async function getCurrentUser() {
    const token = localStorage.getItem("calcuraToken");

    if (!token) {
        return null;
    }

    try {
        return await apiRequest("/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error("User authentication failed:", error);

        logoutUser();

        return null;
    }
}


// LOGOUT
function logoutUser() {
    localStorage.removeItem("calcuraToken");
    localStorage.removeItem("calcuraUser");

    window.location.href = "../login.html";
}


// CHECK LOGIN
function isLoggedIn() {
    return Boolean(
        localStorage.getItem("calcuraToken")
    );
}


// GET SAVED USER
function getSavedUser() {
    const user = localStorage.getItem("calcuraUser");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid saved user data");

        return null;
    }
}