/* =========================================================
   CALCURA SETTINGS
   REAL USER + BACKEND SETTINGS
========================================================= */


/* =========================================================
   API
========================================================= */

const SETTINGS_API =
    "http://localhost:5000/api/auth/settings";


/* =========================================================
   DOM
========================================================= */

const profileName =
    document.getElementById("profileName");

const profileAvatar =
    document.getElementById("profileAvatar");

const profilePlan =
    document.getElementById("profilePlan");

const rightUserName =
    document.getElementById("rightUserName");

const rightUserEmail =
    document.getElementById("rightUserEmail");

const rightUserPlan =
    document.getElementById("rightUserPlan");

const accountAvatar =
    document.getElementById("accountAvatar");

const accountUserName =
    document.getElementById("accountUserName");

const accountUserEmail =
    document.getElementById("accountUserEmail");


/* =========================================================
   DEFAULT SETTINGS
========================================================= */

const defaultSettings = {

    theme: "dark",

    language: "en-US",

    angleMode: "DEG",

    numberFormat: "standard",

    soundEffects: true,

    autoSave: true,

    voiceEnabled: true,

    decimalPrecision: 8,

    calculationNotifications: true,

    updateNotifications: true,

    welcomeTips: true,

    offlineMode: true,

    usageAnalytics: false,

    emailUpdates: true

};


let userSettings = {
    ...defaultSettings
};


/* =========================================================
   TOKEN
========================================================= */

function getSettingsToken() {

    return localStorage.getItem(
        "calcuraToken"
    );

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


    const email =
        user.email ||
        "—";


    const plan =
        user.plan ||
        user.subscription ||
        "Free Plan";


    if (profileName) {

        profileName.textContent =
            name;

    }


    if (profileAvatar) {

        profileAvatar.textContent =
            name
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    if (profilePlan) {

        profilePlan.textContent =
            plan;

    }


    if (rightUserName) {

        rightUserName.textContent =
            name;

    }


    if (rightUserEmail) {

        rightUserEmail.textContent =
            email;

    }


    if (rightUserPlan) {

        rightUserPlan.textContent =
            plan;

    }


    if (accountAvatar) {

        accountAvatar.textContent =
            name
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    if (accountUserName) {

        accountUserName.textContent =
            name;

    }


    if (accountUserEmail) {

        accountUserEmail.textContent =
            email;

    }

}


/* =========================================================
   LOAD REAL USER
========================================================= */

async function loadRealUser() {

    try {

        /*
         * Show cached user immediately
         */

        if (
            typeof getSavedUser ===
            "function"
        ) {

            const savedUser =
                getSavedUser();


            if (savedUser) {

                updateUserUI(
                    savedUser
                );

            }

        }


        /*
         * Verify with backend
         */

        if (
            typeof getCurrentUser ===
            "function"
        ) {

            const currentUser =
                await getCurrentUser();


            if (!currentUser) {

                return;

            }


            const userData =
                currentUser.user ||
                currentUser;


            updateUserUI(
                userData
            );

        }

    } catch (error) {

        console.error(
            "User loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD SETTINGS FROM BACKEND
========================================================= */

async function loadSettings() {

    const token =
        getSettingsToken();


    if (!token) {

        /*
         * If user is not logged in,
         * use locally stored settings.
         */

        const localSettings =
            localStorage.getItem(
                "calcuraSettings"
            );


        if (localSettings) {

            try {

                userSettings = {
                    ...defaultSettings,
                    ...JSON.parse(
                        localSettings
                    )
                };

            } catch (error) {

                console.error(
                    "Local settings parse error:",
                    error
                );

                userSettings = {
                    ...defaultSettings
                };

            }

        } else {

            userSettings = {
                ...defaultSettings
            };

        }


        applySettingsToUI();

        return;

    }


    try {

        const response =
            await fetch(
                SETTINGS_API,
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


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            console.warn(
                "Settings authentication failed."
            );

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load settings"
            );

        }


        const data =
            await response.json();


        /*
         * Backend response:
         *
         * {
         *   success: true,
         *   settings: {...}
         * }
         */

        userSettings = {

            ...defaultSettings,

            ...(data.settings || {})

        };


        /*
         * Keep local cache updated
         */

        localStorage.setItem(
            "calcuraSettings",
            JSON.stringify(
                userSettings
            )
        );


        applySettingsToUI();


    } catch (error) {

        console.error(
            "Settings loading error:",
            error
        );


        /*
         * Use local settings
         * if backend is temporarily unavailable.
         */

        const localSettings =
            localStorage.getItem(
                "calcuraSettings"
            );


        if (localSettings) {

            try {

                userSettings = {

                    ...defaultSettings,

                    ...JSON.parse(
                        localSettings
                    )

                };

            } catch (parseError) {

                console.error(
                    "Local settings parse error:",
                    parseError
                );

                userSettings = {
                    ...defaultSettings
                };

            }

        } else {

            userSettings = {
                ...defaultSettings
            };

        }


        applySettingsToUI();

    }

}


/* =========================================================
   APPLY SETTINGS TO UI
========================================================= */

function applySettingsToUI() {

    const language =
        document.getElementById(
            "languageSelect"
        );

    const angle =
        document.getElementById(
            "angleMode"
        );

    const numberFormat =
        document.getElementById(
            "numberFormat"
        );

    const sound =
        document.getElementById(
            "soundEffects"
        );

    const autoSave =
        document.getElementById(
            "autoSave"
        );

    const voice =
        document.getElementById(
            "voiceFeedback"
        );

    const precision =
        document.getElementById(
            "decimalPrecision"
        );

    const calculationNotifications =
        document.getElementById(
            "calculationNotifications"
        );

    const updateNotifications =
        document.getElementById(
            "updateNotifications"
        );

    const welcomeTips =
        document.getElementById(
            "welcomeTips"
        );

    const offlineMode =
        document.getElementById(
            "offlineMode"
        );

    const usageAnalytics =
        document.getElementById(
            "usageAnalytics"
        );

    const emailUpdates =
        document.getElementById(
            "emailUpdates"
        );


    if (language) {

        language.value =
            userSettings.language ||
            "en-US";

    }


    if (angle) {

        angle.value =
            userSettings.angleMode ||
            "DEG";

    }


    if (numberFormat) {

        numberFormat.value =
            userSettings.numberFormat ||
            "standard";

    }


    if (sound) {

        sound.checked =
            userSettings.soundEffects !== false;

    }


    if (autoSave) {

        autoSave.checked =
            userSettings.autoSave !== false;

    }


    if (voice) {

        voice.checked =
            userSettings.voiceEnabled !== false;

    }


    if (precision) {

        precision.value =
            String(
                userSettings.decimalPrecision ||
                8
            );

    }


    if (calculationNotifications) {

        calculationNotifications.checked =
            userSettings.calculationNotifications !== false;

    }


    if (updateNotifications) {

        updateNotifications.checked =
            userSettings.updateNotifications !== false;

    }


    if (welcomeTips) {

        welcomeTips.checked =
            userSettings.welcomeTips !== false;

    }


    if (offlineMode) {

        offlineMode.checked =
            userSettings.offlineMode !== false;

    }


    if (usageAnalytics) {

        usageAnalytics.checked =
            userSettings.usageAnalytics === true;

    }


    if (emailUpdates) {

        emailUpdates.checked =
            userSettings.emailUpdates !== false;

    }


    const currentTheme =
        userSettings.theme ||
        "dark";


    updateThemeButtons(
        currentTheme
    );


    if (
        typeof window.applyCalcuraTheme ===
        "function"
    ) {

        window.applyCalcuraTheme(
            currentTheme
        );

    }

}


/* =========================================================
   SAVE SETTINGS
========================================================= */

async function saveSettings() {

    const token =
        getSettingsToken();


    /*
     * Read current UI
     */

    userSettings.language =
        document.getElementById(
            "languageSelect"
        )?.value ||
        userSettings.language;


    userSettings.angleMode =
        document.getElementById(
            "angleMode"
        )?.value ||
        userSettings.angleMode;


    userSettings.numberFormat =
        document.getElementById(
            "numberFormat"
        )?.value ||
        userSettings.numberFormat;


    userSettings.soundEffects =
        document.getElementById(
            "soundEffects"
        )?.checked ??
        userSettings.soundEffects;


    userSettings.autoSave =
        document.getElementById(
            "autoSave"
        )?.checked ??
        userSettings.autoSave;


    userSettings.voiceEnabled =
        document.getElementById(
            "voiceFeedback"
        )?.checked ??
        userSettings.voiceEnabled;


    userSettings.decimalPrecision =
        Number(
            document.getElementById(
                "decimalPrecision"
            )?.value ||
            userSettings.decimalPrecision
        );


    userSettings.calculationNotifications =
        document.getElementById(
            "calculationNotifications"
        )?.checked ??
        userSettings.calculationNotifications;


    userSettings.updateNotifications =
        document.getElementById(
            "updateNotifications"
        )?.checked ??
        userSettings.updateNotifications;


    userSettings.welcomeTips =
        document.getElementById(
            "welcomeTips"
        )?.checked ??
        userSettings.welcomeTips;


    userSettings.offlineMode =
        document.getElementById(
            "offlineMode"
        )?.checked ??
        userSettings.offlineMode;


    userSettings.usageAnalytics =
        document.getElementById(
            "usageAnalytics"
        )?.checked ??
        userSettings.usageAnalytics;


    userSettings.emailUpdates =
        document.getElementById(
            "emailUpdates"
        )?.checked ??
        userSettings.emailUpdates;


    /*
     * Always keep local backup
     */

    localStorage.setItem(
        "calcuraSettings",
        JSON.stringify(
            userSettings
        )
    );


    /*
     * No token:
     * save locally as fallback.
     */

    if (!token) {

        showMessage(
            "Settings saved locally."
        );

        return;

    }


    try {

        const response =
            await fetch(
                SETTINGS_API,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            userSettings
                        )

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to save settings"
            );

        }


        /*
         * Backend returns:
         *
         * {
         *   success: true,
         *   message: "...",
         *   settings: {...}
         * }
         */

        userSettings = {

            ...userSettings,

            ...(data.settings || {})

        };


        /*
         * Update local cache
         */

        localStorage.setItem(
            "calcuraSettings",
            JSON.stringify(
                userSettings
            )
        );


        showMessage(
            "Settings saved successfully."
        );


    } catch (error) {

        console.error(
            "Save settings error:",
            error
        );


        /*
         * Local fallback
         */

        localStorage.setItem(
            "calcuraSettings",
            JSON.stringify(
                userSettings
            )
        );


        showMessage(
            "Settings saved locally."
        );

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

    let messageBox =
        document.getElementById(
            "settingsSaveMessage"
        );


    if (!messageBox) {

        messageBox =
            document.createElement(
                "div"
            );


        messageBox.id =
            "settingsSaveMessage";


        messageBox.style.position =
            "fixed";


        messageBox.style.right =
            "25px";


        messageBox.style.bottom =
            "25px";


        messageBox.style.padding =
            "12px 18px";


        messageBox.style.background =
            "#087dff";


        messageBox.style.color =
            "#ffffff";


        messageBox.style.borderRadius =
            "8px";


        messageBox.style.zIndex =
            "9999";


        messageBox.style.fontSize =
            "13px";


        document.body.appendChild(
            messageBox
        );

    }


    messageBox.textContent =
        message;


    clearTimeout(
        messageBox._timer
    );


    messageBox._timer =
        setTimeout(
            () => {

                messageBox.remove();

            },
            2500
        );

}


/* =========================================================
   THEME BUTTONS
========================================================= */

const themeButtons =
    document.querySelectorAll(
        ".theme-option"
    );


function updateThemeButtons(theme) {

    themeButtons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                theme
            );

        }
    );

}


themeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async () => {

                const theme =
                    button.dataset.theme;


                /* Update local setting */

                userSettings.theme =
                    theme;


                /* Update active button */

                updateThemeButtons(
                    theme
                );


                /* Apply website theme */

                if (
                    typeof window
                        .applyCalcuraTheme ===
                    "function"
                ) {

                    window.applyCalcuraTheme(
                        theme
                    );

                }


                /* Save settings */

                await saveSettings();

            }
        );

    }
);


/* =========================================================
   TABS
========================================================= */

const settingsTabs =
    document.querySelectorAll(
        ".settings-tab"
    );


const panelMap = {

    general:
        "generalPanel",

    account:
        "accountPanel",

    appearance:
        "appearancePanel",

    voice:
        "voicePanel",

    calculations:
        "calculationsPanel",

    storage:
        "storagePanel",

    notifications:
        "notificationsPanel"

};


settingsTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                settingsTabs.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                tab.classList.add(
                    "active"
                );


                Object.values(
                    panelMap
                ).forEach(
                    panelId => {

                        const panel =
                            document.getElementById(
                                panelId
                            );


                        if (panel) {

                            panel.classList.remove(
                                "active"
                            );

                        }

                    }
                );


                const targetId =
                    panelMap[
                        tab.dataset.tab
                    ];


                const target =
                    document.getElementById(
                        targetId
                    );


                if (target) {

                    target.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


/* =========================================================
   AUTO SAVE INPUT CHANGES
========================================================= */

const autoSaveInputs =
    document.querySelectorAll(
        ".settings-panel input, .settings-panel select"
    );


autoSaveInputs.forEach(
    input => {

        input.addEventListener(
            "change",
            () => {

                /*
                 * Small delay prevents
                 * excessive API requests.
                 */

                clearTimeout(
                    window.settingsSaveTimer
                );


                window.settingsSaveTimer =
                    setTimeout(
                        () => {

                            saveSettings();

                        },
                        400
                    );

            }
        );

    }
);


/* =========================================================
   CLEAR ALL DATA
========================================================= */

const clearDataButton =
    document.getElementById(
        "clearDataButton"
    );


if (clearDataButton) {

    clearDataButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Clear all history, saved items and cached data?"
                );


            if (!confirmed) {

                return;

            }


            const token =
                getSettingsToken();


            /*
             * Clear local cache
             */

            localStorage.removeItem(
                "calcuraSettings"
            );


            /*
             * Clear known local data
             */

            localStorage.removeItem(
                "calcuraHistory"
            );


            localStorage.removeItem(
                "calcuraSaved"
            );


            /*
             * Backend history
             */

            if (token) {

                try {

                    await fetch(
                        "http://localhost:5000/api/calculations",
                        {

                            method: "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            }

                        }
                    );

                } catch (error) {

                    console.error(
                        "Clear history error:",
                        error
                    );

                }

            }


            showMessage(
                "Your local data has been cleared."
            );

        }
    );

}


/* =========================================================
   SIGN OUT
========================================================= */

const signOutButton =
    document.getElementById(
        "signOutButton"
    );


if (signOutButton) {

    signOutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to sign out?"
                );


            if (!confirmed) {

                return;

            }


            try {

                if (
                    typeof logoutUser ===
                    "function"
                ) {

                    await logoutUser();

                    return;

                }

            } catch (error) {

                console.error(
                    "Logout function error:",
                    error
                );

            }


            /*
             * Fallback
             */

            localStorage.removeItem(
                "calcuraToken"
            );


            localStorage.removeItem(
                "calcuraUser"
            );


            window.location.href =
                "../login.html";

        }
    );

}


/* =========================================================
   SEARCH
========================================================= */

const settingsSearch =
    document.getElementById(
        "settingsSearch"
    );


if (settingsSearch) {

    settingsSearch.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const query =
                settingsSearch.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                return;

            }


            const navigation = {

                calculator:
                    "calculator.html",

                voice:
                    "voice-input.html",

                graph:
                    "graph.html",

                formulas:
                    "formulas.html",

                converter:
                    "converter.html",

                history:
                    "history.html",

                saved:
                    "saved.html",

                profile:
                    "profile.html",

                help:
                    "help.html",

                upgrade:
                    "upgrade.html"

            };


            if (
                navigation[query]
            ) {

                window.location.href =
                    navigation[query];

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

        await loadSettings();

    }
);