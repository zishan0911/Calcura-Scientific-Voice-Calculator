/* =========================================================
   CALCURA ADMIN DASHBOARD
   Sidebar + Dashboard Functionality
========================================================= */


/* =========================================================
   API
========================================================= */

const API_BASE_URL =
    "http://localhost:5000/api";


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let activityChart = null;

let dashboardData = null;


/* =========================================================
   AUTH TOKEN
========================================================= */

const authToken =
    localStorage.getItem("calcuraToken");


/* =========================================================
   ELEMENT HELPER
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   INITIAL
========================================================= */

function getInitial(name) {

    const value =
        String(name || "A").trim();


    if (!value) {
        return "A";
    }


    return value
        .charAt(0)
        .toUpperCase();

}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(value) {

    const number =
        Number(value || 0);


    return number.toLocaleString("en-IN");

}


/* =========================================================
   RELATIVE TIME
========================================================= */

function getRelativeTime(dateValue) {

    if (!dateValue) {
        return "—";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    const difference =
        Date.now() -
        date.getTime();


    const seconds =
        Math.floor(
            Math.max(
                0,
                difference
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

        return `${minutes} min ago`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {

        return `${hours} hour${
            hours === 1 ? "" : "s"
        } ago`;

    }


    const days =
        Math.floor(
            hours / 24
        );


    return `${days} day${
        days === 1 ? "" : "s"
    } ago`;

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(
    title,
    message
) {

    const box =
        getElement(
            "dashboardStatus"
        );


    if (!box) {
        return;
    }


    box.classList.remove(
        "hidden"
    );


    box.innerHTML = `

        <strong>
            ${escapeHTML(title)}
        </strong>

        <span>
            ${escapeHTML(message)}
        </span>

    `;

}


/* =========================================================
   HIDE STATUS
========================================================= */

function hideStatus() {

    const box =
        getElement(
            "dashboardStatus"
        );


    if (!box) {
        return;
    }


    box.classList.add(
        "hidden"
    );

}


/* =========================================================
   SIDEBAR
   THIS IS THE IMPORTANT PART
========================================================= */

function setupSidebar() {

    const sidebar =
        getElement(
            "adminSidebar"
        );


    const toggleButton =
        getElement(
            "sidebarToggle"
        );


    /*
       Check that both elements exist.
    */

    if (!sidebar) {

        console.error(
            "CALCURA: adminSidebar not found."
        );

        return;

    }


    if (!toggleButton) {

        console.error(
            "CALCURA: sidebarToggle not found."
        );

        return;

    }


    /*
       THREE-LINE BUTTON CLICK
    */

    toggleButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /*
               DESKTOP:
               open <-> collapsed
            */

            if (
                window.innerWidth > 900
            ) {

                sidebar.classList.toggle(
                    "collapsed"
                );

                /*
                   Save current state
                   so refresh doesn't reset it.
                */

                const isCollapsed =
                    sidebar.classList.contains(
                        "collapsed"
                    );


                localStorage.setItem(
                    "calcuraAdminSidebar",
                    isCollapsed
                        ? "collapsed"
                        : "open"
                );

            }

            /*
               MOBILE:
               hidden <-> visible
            */

            else {

                sidebar.classList.toggle(
                    "open"
                );

            }

        }
    );


    /*
       RESTORE DESKTOP SIDEBAR STATE
    */

    if (
        window.innerWidth > 900
    ) {

        const savedState =
            localStorage.getItem(
                "calcuraAdminSidebar"
            );


        if (
            savedState === "collapsed"
        ) {

            sidebar.classList.add(
                "collapsed"
            );

        }

    }


    /*
       WHEN SCREEN SIZE CHANGES
    */

    window.addEventListener(
        "resize",
        function () {

            /*
               Desktop
            */

            if (
                window.innerWidth > 900
            ) {

                sidebar.classList.remove(
                    "open"
                );


                const savedState =
                    localStorage.getItem(
                        "calcuraAdminSidebar"
                    );


                if (
                    savedState === "collapsed"
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


            /*
               Mobile
            */

            else {

                sidebar.classList.remove(
                    "collapsed"
                );

            }

        }
    );

}


/* =========================================================
   SIDEBAR LINK ACTIVE STATE
========================================================= */

function setupSidebarLinks() {

    const links =
        document.querySelectorAll(
            ".sidebar-link"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    links.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   UPDATE STATISTICS
========================================================= */

function updateStatistics(stats) {

    const data =
        stats || {};


    const totalUsers =
        getElement(
            "totalUsers"
        );


    const activeUsers =
        getElement(
            "activeUsers"
        );


    const totalCalculations =
        getElement(
            "totalCalculations"
        );


    const activeSubscriptions =
        getElement(
            "activeSubscriptions"
        );


    if (totalUsers) {

        totalUsers.textContent =
            formatNumber(
                data.totalUsers
            );

    }


    if (activeUsers) {

        activeUsers.textContent =
            formatNumber(
                data.activeUsers
            );

    }


    if (totalCalculations) {

        totalCalculations.textContent =
            formatNumber(
                data.totalCalculations
            );

    }


    if (activeSubscriptions) {

        activeSubscriptions.textContent =
            formatNumber(
                data.activeSubscriptions
            );

    }

}


/* =========================================================
   RENDER ACTIVITY
========================================================= */

function renderActivity(items) {

    const container =
        getElement(
            "activityList"
        );


    if (!container) {
        return;
    }


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-message">
                No activity has been recorded.
            </div>

        `;

        return;

    }


    container.innerHTML =
        items
            .slice(0, 8)
            .map(
                function (item) {

                    const isUser =
                        item.kind === "user";


                    const icon =
                        isUser
                            ? "fa-user-plus"
                            : "fa-calculator";


                    return `

                        <div class="activity-item">

                            <div
                                class="activity-icon ${
                                    isUser
                                        ? "user"
                                        : "calculation"
                                }"
                            >

                                <i
                                    class="fa-solid ${icon}"
                                ></i>

                            </div>


                            <div class="activity-details">

                                <strong>
                                    ${escapeHTML(
                                        item.title ||
                                        "Activity"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        item.detail ||
                                        ""
                                    )}
                                </span>

                            </div>


                            <time class="activity-time">

                                ${escapeHTML(
                                    getRelativeTime(
                                        item.createdAt
                                    )
                                )}

                            </time>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   RENDER CALCULATIONS
========================================================= */

function renderCalculations(items) {

    const tbody =
        getElement(
            "calculationsBody"
        );


    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(items) ||
        items.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="empty-table"
                >
                    No calculations have been recorded.
                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        items
            .map(
                function (item, index) {

                    const username =
    item.userName ||
    item.username ||
    item.user?.name ||
    item.name ||
    "Unknown";


                    const expression =
                        item.expression ||
                        "—";


                    const result =
                        item.result ??
                        "—";


                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>


                            <td>

                                <div class="user-cell">

                                    <span
                                        class="user-avatar-small"
                                    >
                                        ${escapeHTML(
                                            getInitial(
                                                username
                                            )
                                        )}
                                    </span>

                                    ${escapeHTML(
                                        username
                                    )}

                                </div>

                            </td>


                            <td
                                title="${escapeHTML(
                                    expression
                                )}"
                            >
                                ${escapeHTML(
                                    expression
                                )}
                            </td>


                            <td
                                class="result-value"
                            >
                                ${escapeHTML(
                                    result
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    getRelativeTime(
                                        item.createdAt
                                    )
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CHART
   CALCURA REFERENCE-STYLE NEON ACTIVITY GRAPH
   Uses existing real API data
========================================================= */

function renderActivityChart(series) {

    const canvas =
        getElement("userActivityChart");

    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }

    /* -----------------------------------------------------
       DESTROY OLD CHART
    ----------------------------------------------------- */

    if (activityChart) {

        activityChart.destroy();

        activityChart = null;

    }


    /* -----------------------------------------------------
       DATA
    ----------------------------------------------------- */

    const chartData =
        Array.isArray(series)
            ? series
            : [];


    const ctx =
        canvas.getContext("2d");


    if (!ctx) {
        return;
    }


    /* -----------------------------------------------------
       BLUE GRADIENT
    ----------------------------------------------------- */

    const blueGradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            215
        );

    blueGradient.addColorStop(
        0,
        "rgba(0, 183, 255, 0.16)"
    );

    blueGradient.addColorStop(
        0.72,
        "rgba(0, 183, 255, 0.035)"
    );

    blueGradient.addColorStop(
        1,
        "rgba(0, 183, 255, 0)"
    );


    /* -----------------------------------------------------
       PURPLE GRADIENT
    ----------------------------------------------------- */

    const purpleGradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            215
        );

    purpleGradient.addColorStop(
        0,
        "rgba(116, 44, 255, 0.13)"
    );

    purpleGradient.addColorStop(
        0.72,
        "rgba(116, 44, 255, 0.025)"
    );

    purpleGradient.addColorStop(
        1,
        "rgba(116, 44, 255, 0)"
    );


    /* -----------------------------------------------------
       PINK GRADIENT
    ----------------------------------------------------- */

    const pinkGradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            215
        );

    pinkGradient.addColorStop(
        0,
        "rgba(241, 38, 169, 0.14)"
    );

    pinkGradient.addColorStop(
        0.72,
        "rgba(241, 38, 169, 0.025)"
    );

    pinkGradient.addColorStop(
        1,
        "rgba(241, 38, 169, 0)"
    );


    /* =====================================================
       NEON GLOW PLUGIN
    ===================================================== */

    const neonGlowPlugin = {

        id:
            "calcuraNeonGlow",


        beforeDatasetDraw(
            chart,
            args
        ) {

            const meta =
                chart.getDatasetMeta(
                    args.index
                );


            if (
                !meta ||
                meta.hidden ||
                !meta.dataset
            ) {
                return;
            }


            const color =
                chart
                    .data
                    .datasets[args.index]
                    .borderColor ||
                "#00b7ff";


            chart.ctx.save();


            chart.ctx.shadowColor =
                color;

            chart.ctx.shadowBlur =
                8;

            chart.ctx.shadowOffsetX =
                0;

            chart.ctx.shadowOffsetY =
                0;

        },


        afterDatasetDraw(
            chart
        ) {

            chart.ctx.restore();

        }

    };


    /* =====================================================
       CREATE CHART
    ===================================================== */

    activityChart =
        new Chart(
            ctx,
            {

                type:
                    "line",


                /* -------------------------------------------------
                   DATASETS
                ------------------------------------------------- */

                data: {

                    labels:
                        chartData.map(
                            function (item) {

                                return item.label;

                            }
                        ),


                    datasets: [

                        /* =========================================
                           NEW USERS
                        ========================================= */

                        {

                            label:
                                "New Users",


                            data:
                                chartData.map(
                                    function (item) {

                                        return Number(
                                            item.newUsers ||
                                            0
                                        );

                                    }
                                ),


                            borderColor:
                                "#00B7FF",


                            backgroundColor:
                                blueGradient,


                            fill:
                                true,


                            tension:
                                0.38,


                            cubicInterpolationMode:
                                "monotone",


                            borderWidth:
                                2.5,


                            pointRadius:
                                2.8,


                            pointHoverRadius:
                                5,


                            pointBackgroundColor:
                                "#00B7FF",


                            pointBorderColor:
                                "#04152a",


                            pointBorderWidth:
                                1.2

                        },


                        /* =========================================
                           ACTIVE USERS
                        ========================================= */

                        {

                            label:
                                "Active Users",


                            data:
                                chartData.map(
                                    function (item) {

                                        return Number(
                                            item.activeUsers ||
                                            0
                                        );

                                    }
                                ),


                            borderColor:
                                "#8B4DFF",


                            backgroundColor:
                                purpleGradient,


                            fill:
                                true,


                            tension:
                                0.38,


                            cubicInterpolationMode:
                                "monotone",


                            borderWidth:
                                2.5,


                            pointRadius:
                                2.8,


                            pointHoverRadius:
                                5,


                            pointBackgroundColor:
                                "#8B4DFF",


                            pointBorderColor:
                                "#04152a",


                            pointBorderWidth:
                                1.2

                        },


                        /* =========================================
                           CALCULATIONS
                        ========================================= */

                        {

                            label:
                                "Calculations",


                            data:
                                chartData.map(
                                    function (item) {

                                        return Number(
                                            item.calculations ||
                                            0
                                        );

                                    }
                                ),


                            borderColor:
                                "#F238A9",


                            backgroundColor:
                                pinkGradient,


                            fill:
                                true,


                            tension:
                                0.38,


                            cubicInterpolationMode:
                                "monotone",


                            borderWidth:
                                2.5,


                            pointRadius:
                                2.8,


                            pointHoverRadius:
                                5,


                            pointBackgroundColor:
                                "#F238A9",


                            pointBorderColor:
                                "#04152a",


                            pointBorderWidth:
                                1.2

                        }

                    ]

                },


                plugins: [

                    neonGlowPlugin

                ],


                /* -------------------------------------------------
                   OPTIONS
                ------------------------------------------------- */

                options: {

                    responsive:
                        true,


                    maintainAspectRatio:
                        false,


                    animation: {

                        duration:
                            700,

                        easing:
                            "easeOutQuart"

                    },


                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    plugins: {

                        /* -----------------------------
                           HIDE DEFAULT LEGEND
                        ----------------------------- */

                        legend: {

                            display:
                                false

                        },


                        /* -----------------------------
                           TOOLTIP
                        ----------------------------- */

                        tooltip: {

                            enabled:
                                true,


                            backgroundColor:
                                "rgba(2, 13, 29, 0.97)",


                            titleColor:
                                "#ffffff",


                            bodyColor:
                                "#dceaff",


                            borderColor:
                                "rgba(0, 155, 255, 0.50)",


                            borderWidth:
                                1,


                            padding:
                                10,


                            cornerRadius:
                                8,


                            displayColors:
                                true

                        }

                    },


                    /* =================================================
                       AXES
                    ================================================= */

                    scales: {

                        /* -----------------------------
                           X AXIS
                        ----------------------------- */

                        x: {

                            border: {

                                display:
                                    false

                            },


                            grid: {

                                display:
                                    true,


                                color:
                                    "rgba(119, 157, 202, 0.10)",


                                lineWidth:
                                    1,


                                drawTicks:
                                    false

                            },


                            ticks: {

                                color:
                                    "rgba(164, 185, 215, 0.70)",


                                maxTicksLimit:
                                    7,


                                padding:
                                    7,


                                font: {

                                    size:
                                        10,


                                    weight:
                                        "500"

                                }

                            }

                        },


                        /* -----------------------------
                           Y AXIS
                        ----------------------------- */

                        y: {

                            beginAtZero:
                                true,


                            border: {

                                display:
                                    false

                            },


                            grid: {

                                display:
                                    true,


                                color:
                                    "rgba(119, 157, 202, 0.10)",


                                lineWidth:
                                    1,


                                drawTicks:
                                    false

                            },


                            ticks: {

                                color:
                                    "rgba(164, 185, 215, 0.70)",


                                precision:
                                    0,


                                padding:
                                    7,


                                maxTicksLimit:
                                    6,


                                font: {

                                    size:
                                        10,


                                    weight:
                                        "500"

                                }

                            }

                        }

                    }

                }

            }
        );

}

/* =========================================================
   LOAD ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    if (!authToken) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${authToken}`

                    }

                }
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        const user =
            data.user ||
            data;


        if (
            user.role &&
            user.role !== "admin"
        ) {

            showStatus(
                "Admin access required",
                "The current account does not have administrator privileges."
            );

            return;

        }


        const adminName =
            getElement(
                "adminName"
            );


        const adminAvatar =
            getElement(
                "adminAvatar"
            );


        if (adminName) {

            adminName.textContent =
                user.name ||
                "Admin";

        }


        if (adminAvatar) {

            adminAvatar.textContent =
                getInitial(
                    user.name
                );

        }

    }
    catch (error) {

        console.error(
            "Admin profile error:",
            error
        );

    }

}


/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard(
    days = 30
) {

    /*
       We are NOT creating fake data.
    */

    if (!authToken) {

        showStatus(
            "Admin authentication required",
            "Sign in with the authorized Calcura administrator account to load live data."
        );


        updateStatistics({});

        renderActivity([]);

        renderCalculations([]);

        renderActivityChart([]);

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/dashboard?days=${days}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${authToken}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load admin dashboard."
            );

        }


        dashboardData =
            data;


        hideStatus();


        updateStatistics(
            data.stats
        );


        renderActivity(
            data.recentActivity
        );


        renderCalculations(
            data.recentCalculations
        );


        renderActivityChart(
            data.chart
        );

    }
    catch (error) {

        console.error(
            "Dashboard data error:",
            error
        );


        /*
           Keep fake data OFF.
        */

        updateStatistics({});

        renderActivity([]);

        renderCalculations([]);

        renderActivityChart([]);


        showStatus(
            "Live data unavailable",
            error.message ||
            "Unable to connect to the Calcura admin API."
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const search =
        getElement(
            "adminSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .trim()
                    .toLowerCase();


            if (
                !dashboardData ||
                !query
            ) {

                renderCalculations(
                    dashboardData
                        ?.recentCalculations ||
                    []
                );

                return;

            }


            const calculations =
                dashboardData
                    .recentCalculations ||
                [];


            const filtered =
                calculations.filter(
                    function (item) {

                        const values = [

                            item.userName,

                            item.username,

                            item.user,

                            item.email,

                            item.expression,

                            item.result

                        ];


                        return values.some(
                            function (value) {

                                return String(
                                    value || ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    );

                            }
                        );

                    }
                );


            renderCalculations(
                filtered
            );

        }
    );

}


/* =========================================================
   CALENDAR DATE RANGE
========================================================= */

function setupDateRange() {

    const selector =
        document.getElementById("dateSelector");

    const button =
        document.getElementById("datePickerButton");

    const popup =
        document.getElementById("datePickerPopup");

    const text =
        document.getElementById("dateRangeText");

    const fromDate =
        document.getElementById("fromDate");

    const toDate =
        document.getElementById("toDate");

    const applyButton =
        document.getElementById("dateApply");

    const cancelButton =
        document.getElementById("dateCancel");


    if (!selector || !button || !popup) {
        return;
    }


    /* OPEN / CLOSE */

    button.addEventListener("click", function (event) {

        event.stopPropagation();

        selector.classList.toggle("open");

    });


    /* QUICK DATE OPTIONS */

    const quickButtons =
        popup.querySelectorAll(
            ".quick-date-options button"
        );


    quickButtons.forEach(function (btn) {

        btn.addEventListener("click", function () {

            const days =
                Number(this.dataset.days);

            const today =
                new Date();

            const start =
                new Date(today);

            start.setDate(
                today.getDate() - days + 1
            );


            fromDate.value =
                formatDateForInput(start);

            toDate.value =
                formatDateForInput(today);

        });

    });


    /* APPLY */

    applyButton.addEventListener(
        "click",
        function () {

            if (!fromDate.value ||
                !toDate.value) {

                return;
            }


            const start =
                new Date(fromDate.value);

            const end =
                new Date(toDate.value);


            if (start > end) {

                alert(
                    "From date cannot be after To date."
                );

                return;
            }


            text.textContent =
                formatDisplayDate(start) +
                " - " +
                formatDisplayDate(end);


            selector.classList.remove("open");


            /*
               Calculate number of days
               for existing dashboard API.
            */

            const difference =
                Math.round(
                    (
                        end - start
                    ) /
                    (1000 * 60 * 60 * 24)
                ) + 1;


            /*
               Keep your existing
               dashboard functionality.
            */

            if (typeof loadDashboard === "function") {

                loadDashboard(
                    difference
                );

            }

        }
    );


    /* CANCEL */

    cancelButton.addEventListener(
        "click",
        function () {

            selector.classList.remove(
                "open"
            );

        }
    );


    /* CLOSE WHEN CLICKING OUTSIDE */

    document.addEventListener(
        "click",
        function (event) {

            if (!selector.contains(event.target)) {

                selector.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =========================================================
   DATE FORMAT HELPERS
========================================================= */

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


function formatDisplayDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================================
   BUTTONS
========================================================= */

function setupButtons() {

    const activityButton =
        getElement(
            "viewActivityLogs"
        );


    if (activityButton) {

        activityButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "activity-logs.html";

            }
        );

    }


    const calculationsButton =
        getElement(
            "viewCalculations"
        );


    if (calculationsButton) {

        calculationsButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "calculations.html";

            }
        );

    }


    const notificationButton =
        getElement(
            "notificationButton"
        );


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                showToast(
                    "Notifications will be connected to real activity data."
                );

            }
        );

    }

const profileButton =
    getElement(
        "adminProfileButton"
    );

const profileWrapper =
    document.querySelector(
        ".admin-profile-wrapper"
    );

const logoutButton =
    getElement(
        "adminLogoutButton"
    );


if (
    profileButton &&
    profileWrapper
) {

    profileButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            profileWrapper.classList.toggle(
                "open"
            );

        }
    );

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "calcuraToken"
            );

            sessionStorage.removeItem(
                "calcuraToken"
            );

            window.location.href =
                "../../login.html";

        }
    );

}


document.addEventListener(
    "click",
    function (event) {

        if (
            profileWrapper &&
            !profileWrapper.contains(
                event.target
            )
        ) {

            profileWrapper.classList.remove(
                "open"
            );

        }

    }
);

   

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        getElement(
            "adminToast"
        );


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.calcuraToastTimer
    );


    window.calcuraToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Sidebar first
           so hamburger works immediately.
        */

        setupSidebar();


        setupSidebarLinks();


        setupSearch();


        setupDateRange();


        setupButtons();


        loadAdminProfile();


        /*
           This may show "Failed to fetch"
           until the Admin API is created.
           We are NOT fixing that in this step.
        */

        loadDashboard(30);

    }
);
