"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API =
    "http://localhost:5000/api";

const TOKEN_KEY =
    "calcuraToken";

const SETTINGS_KEY =
    "calcuraAdminSettings";


/* =========================================================
   AUTH
========================================================= */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}

function authHeaders() {

    return {
        "Authorization":
            `Bearer ${getToken()}`,

        "Content-Type":
            "application/json"
    };

}


/* =========================================================
   HELPERS
========================================================= */

function get(id) {

    return document.getElementById(id);

}


function showToast(message) {

    const toast =
        get("toast");

    const text =
        get("toastMessage");

    if (!toast || !text) {
        return;
    }

    text.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    try {

        const response =
            await fetch(
                `${API}/auth/me`,
                {
                    headers:
                        authHeaders()
                }
            );

        if (!response.ok) {
            return;
        }

        const result =
            await response.json();

        const user =
            result.user ||
            result.data ||
            result;

        const name =
            user.name ||
            user.email ||
            "Admin";

        const email =
            user.email ||
            "—";

        const id =
            user._id ||
            user.id ||
            "—";

        const role =
            user.role === "admin"
                ? "Administrator"
                : (
                    user.role ||
                    "User"
                );


        if (get("adminName"))
            get("adminName").textContent =
                name;

        if (get("adminRole"))
            get("adminRole").textContent =
                role;

        if (get("adminAvatar"))
            get("adminAvatar").textContent =
                name.charAt(0).toUpperCase();


        if (get("profileName"))
            get("profileName").textContent =
                name;

        if (get("profileEmail"))
            get("profileEmail").textContent =
                email;

        if (get("profileId"))
            get("profileId").textContent =
                id;

        if (get("profileRole"))
            get("profileRole").textContent =
                role;

        if (get("profileAvatar"))
            get("profileAvatar").textContent =
                name.charAt(0).toUpperCase();

        if (get("updatedBy"))
            get("updatedBy").textContent =
                name;

    }

    catch (error) {

        console.error(
            "Admin profile error:",
            error
        );

    }

}


/* =========================================================
   SIDEBAR
========================================================= */

function setupSidebar() {

    const sidebar =
        get("adminSidebar");

    const toggle =
        get("sidebarToggle");

    if (!sidebar || !toggle) {
        return;
    }

    toggle.addEventListener(
        "click",
        () => {

            if (
                window.innerWidth <=
                900
            ) {

                sidebar.classList.toggle(
                    "open"
                );

                return;
            }

            sidebar.classList.toggle(
                "collapsed"
            );

            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        }
    );

}


/* =========================================================
   PROFILE DROPDOWN
========================================================= */

function setupProfile() {

    const button =
        get("adminProfileButton");

    const dropdown =
        get("profileDropdown");

    if (!button || !dropdown) {
        return;
    }

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "open"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !dropdown.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                dropdown.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function setupNotifications() {

    const button =
        get("notificationButton");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            showToast(
                "No new system notifications."
            );

        }
    );

}


/* =========================================================
   PASSWORD TOGGLE
========================================================= */

function setupPasswordToggles() {

    document
        .querySelectorAll(
            ".password-toggle"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            button.dataset.target;

                        const input =
                            get(targetId);

                        if (!input) {
                            return;
                        }

                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";

                            button.innerHTML =
                                '<i class="fa-regular fa-eye-slash"></i>';

                        }
                        else {

                            input.type =
                                "password";

                            button.innerHTML =
                                '<i class="fa-regular fa-eye"></i>';

                        }

                    }
                );

            }
        );

}


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    const tabs =
        document.querySelectorAll(
            ".settings-tab"
        );

    const contents =
        document.querySelectorAll(
            ".settings-content"
        );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    tabs.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    contents.forEach(
                        content => {

                            content.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    const content =
                        document.querySelector(
                            `[data-content="${target}"]`
                        );

                    if (content) {

                        content.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        get("globalSearch");

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();

            if (!query) {
                return;
            }


            const panels =
                document.querySelectorAll(
                    ".settings-panel, .single-panel, .summary-card"
                );


            panels.forEach(
                panel => {

                    const text =
                        panel.textContent
                            .toLowerCase();

                    panel.style.outline =
                        text.includes(query)
                            ? "1px solid #00bfff"
                            : "none";

                }
            );

        }
    );

}


/* =========================================================
   COLLECT SETTINGS
========================================================= */

function collectSettings() {

    return {

        websiteName:
            get("websiteName")?.value || "",

        websiteURL:
            get("websiteURL")?.value || "",

        contactEmail:
            get("contactEmail")?.value || "",

        supportEmail:
            get("supportEmail")?.value || "",

        timezone:
            get("timezone")?.value || "",

        defaultLanguage:
            get("defaultLanguage")?.value || "",


        twoFactor:
            get("twoFactor")?.checked || false,

        loginLimit:
            get("loginLimit")?.value || "",

        loginLimitEnabled:
            get("loginLimitEnabled")?.checked || false,

        sessionTimeout:
            get("sessionTimeout")?.value || "",

        ipWhitelist:
            get("ipWhitelist")?.checked || false,

        activityLogging:
            get("activityLogging")?.checked || false,


        smtpHost:
            get("smtpHost")?.value || "",

        smtpPort:
            get("smtpPort")?.value || "",

        smtpUsername:
            get("smtpUsername")?.value || "",

        fromEmail:
            get("fromEmail")?.value || "",

        fromName:
            get("fromName")?.value || "",

        registrationEmails:
            get("registrationEmails")?.checked || false,

        subscriptionEmails:
            get("subscriptionEmails")?.checked || false,

        systemAlerts:
            get("systemAlerts")?.checked || false,


        paymentGateway:
            get("paymentGateway")?.value || "",

        razorpayKey:
            get("razorpayKey")?.value || "",

        currency:
            get("currency")?.value || "",

        planDuration:
            get("planDuration")?.value || "",

        enableSubscriptions:
            get("enableSubscriptions")?.checked || false,

        enableFreePlan:
            get("enableFreePlan")?.checked || false,

        autoRenew:
            get("autoRenew")?.checked || false,


        strongPasswords:
            get("strongPasswords")?.checked || false,

        security2FA:
            get("security2FA")?.checked || false,

        sessionProtection:
            get("sessionProtection")?.checked || false,

        securityAlerts:
            get("securityAlerts")?.checked || false,


        emailRegistrationTab:
            get("emailRegistrationTab")?.checked || false,

        emailSubscriptionTab:
            get("emailSubscriptionTab")?.checked || false,

        emailSystemTab:
            get("emailSystemTab")?.checked || false,


        adminTheme:
            get("adminTheme")?.value || "",

        accentColor:
            get("accentColor")?.value || "",


        googleIntegration:
            get("googleIntegration")?.checked || false,

        emailIntegration:
            get("emailIntegration")?.checked || false,

        paymentIntegration:
            get("paymentIntegration")?.checked || false

    };

}


/* =========================================================
   APPLY SETTINGS
========================================================= */

function applySettings(settings) {

    if (!settings) {
        return;
    }


    const values = [
        "websiteName",
        "websiteURL",
        "contactEmail",
        "supportEmail",
        "timezone",
        "defaultLanguage",
        "loginLimit",
        "sessionTimeout",
        "smtpHost",
        "smtpPort",
        "smtpUsername",
        "fromEmail",
        "fromName",
        "paymentGateway",
        "razorpayKey",
        "currency",
        "planDuration",
        "adminTheme",
        "accentColor"
    ];


    values.forEach(
        id => {

            if (
                settings[id] !==
                undefined &&
                get(id)
            ) {

                get(id).value =
                    settings[id];

            }

        }
    );


    const checks = [
        "twoFactor",
        "loginLimitEnabled",
        "ipWhitelist",
        "activityLogging",
        "registrationEmails",
        "subscriptionEmails",
        "systemAlerts",
        "enableSubscriptions",
        "enableFreePlan",
        "autoRenew",
        "strongPasswords",
        "security2FA",
        "sessionProtection",
        "securityAlerts",
        "emailRegistrationTab",
        "emailSubscriptionTab",
        "emailSystemTab",
        "googleIntegration",
        "emailIntegration",
        "paymentIntegration"
    ];


    checks.forEach(
        id => {

            if (
                settings[id] !==
                undefined &&
                get(id)
            ) {

                get(id).checked =
                    Boolean(
                        settings[id]
                    );

            }

        }
    );

}


/* =========================================================
   SAVE
========================================================= */

function setupSave() {

    const button =
        get("saveChanges");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            try {

                button.disabled =
                    true;

                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


                const settings =
                    collectSettings();


                const response =
                    await fetch(
                        `${API}/admin/system-settings`,
                        {
                            method: "PUT",

                            headers:
                                authHeaders(),

                            body:
                                JSON.stringify(
                                    settings
                                )
                        }
                    );


                const result =
                    await response.json();


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Settings update failed."
                    );

                }


                applySettings(
                    result.settings
                );


                if (
                    result.settings?.updatedAt
                ) {

                    const updatedDate =
                        new Date(
                            result.settings.updatedAt
                        );


                    get("lastUpdated")
                        .textContent =
                        updatedDate.toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric",
                                year: "numeric"
                            }
                        );

                }


                if (
                    result.settings?.updatedBy
                ) {

                    await loadAdminProfile();

                }


                showToast(
                    "Changes saved successfully."
                );

            }

            catch (error) {

                console.error(
                    "SYSTEM SETTINGS SAVE ERROR:",
                    error
                );


                showToast(
                    error.message ||
                    "Unable to save changes."
                );

            }

            finally {

                button.disabled =
                    false;

                button.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

            }

        }
    );

}


/* =========================================================
   LOAD SAVED SETTINGS
========================================================= */

async function loadSavedSettings() {

    try {

        const response =
            await fetch(
                `${API}/admin/system-settings`,
                {
                    method: "GET",
                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok ||
            !result.success) {

            throw new Error(
                result.message ||
                "Unable to load settings."
            );

        }


        applySettings(
            result.settings
        );


        if (
            result.settings?.updatedAt
        ) {

            const updatedDate =
                new Date(
                    result.settings.updatedAt
                );


            get("lastUpdated").textContent =
                updatedDate.toLocaleDateString(
                    "en-US",
                    {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }
                );

        }

    }

    catch (error) {

        console.error(
            "SYSTEM SETTINGS LOAD ERROR:",
            error
        );

        showToast(
            "Unable to load system settings."
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function setupLogout() {

    const button =
        get("logoutButton");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                TOKEN_KEY
            );

            localStorage.removeItem(
                "calcuraUser"
            );

            window.location.href =
                "../../index.html";

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupSidebar();

        setupProfile();

        setupNotifications();

        setupPasswordToggles();

        setupTabs();

        setupSearch();

        setupSave();

        setupLogout();

        loadSavedSettings();

        await loadAdminProfile();

    }
);