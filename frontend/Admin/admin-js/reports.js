"use strict";

const API = "http://localhost:5000/api";
const TOKEN_KEY = "calcuraToken";

let reportData = null;

const charts = {};


/* =========================================================
   AUTH
========================================================= */

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function headers() {
    return {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json"
    };
}


/* =========================================================
   HELPERS
========================================================= */

function safe(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-IN");
}

function formatCurrency(value) {
    return "$" + Number(value || 0).toLocaleString("en-IN");
}

function destroyChart(name) {
    if (charts[name]) {
        charts[name].destroy();
        charts[name] = null;
    }
}


/* =========================================================
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    try {

        const response = await fetch(
            `${API}/auth/me`,
            {
                headers: headers()
            }
        );

        if (!response.ok) return;

        const result = await response.json();

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
                : user.role || "User";

        document.getElementById("adminName")
            .textContent = name;

        document.getElementById("adminRole")
            .textContent = role;

        document.getElementById("adminAvatar")
            .textContent =
            name.charAt(0).toUpperCase();

        document.getElementById("profileName")
            .textContent = name;

        document.getElementById("profileEmail")
            .textContent = email;

        document.getElementById("profileId")
            .textContent = id;

        document.getElementById("profileRole")
            .textContent = role;

        document.getElementById("profileAvatar")
            .textContent =
            name.charAt(0).toUpperCase();

    }

    catch (error) {

        console.error(
            "Admin profile error:",
            error
        );

    }
}


/* =========================================================
   LOAD REAL REPORT DATA
========================================================= */

async function loadReports() {

    try {

        const days =
            document.getElementById(
                "dateRange"
            ).value;

        const response =
            await fetch(
                `${API}/admin/reports?days=${days}`,
                {
                    headers: headers()
                }
            );

        if (!response.ok) {

            throw new Error(
                `Reports API returned ${response.status}`
            );

        }

        const result =
            await response.json();

        if (!result.success) {

            throw new Error(
                result.message ||
                "Reports loading failed"
            );

        }

        reportData = result;

        renderStats();

        renderUserChart();

        renderCalculationChart();

        renderPlanChart();

        renderTypeChart();

        renderRevenueChart();

        renderMonthlyTable();

        renderPopularFormulas();

        renderSubscriptions();

        renderNotifications();

    }
    catch (error) {

        console.error(
            "REPORT ERROR:",
            error
        );

    }

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

    const stats =
        reportData.stats || {};

    document.getElementById(
        "totalUsers"
    ).textContent =
        formatNumber(
            stats.totalUsers
        );


    document.getElementById(
        "totalCalculations"
    ).textContent =
        formatNumber(
            stats.totalCalculations
        );


    document.getElementById(
        "activeSubscriptions"
    ).textContent =
        formatNumber(
            stats.activeSubscriptions
        );


    document.getElementById(
        "totalRevenue"
    ).textContent =
        formatCurrency(
            stats.totalRevenue
        );


    document.getElementById(
        "usersComparison"
    ).textContent =
        `${formatNumber(
            stats.rangeUsers
        )} new in selected range`;


    document.getElementById(
        "calculationsComparison"
    ).textContent =
        `${formatNumber(
            stats.rangeCalculations
        )} in selected range`;


    document.getElementById(
        "revenueComparison"
    ).textContent =
        "Verified payments only";


    document.getElementById(
        "subscriptionComparison"
    ).textContent =
        "Current active plans";

}


/* =========================================================
   CHART OPTIONS
========================================================= */

function lineOptions() {

    return {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {

            legend: {
                labels: {
                    color: "#dce8fa",
                    font: {
                        size: 11
                    }
                }
            },

            tooltip: {
                backgroundColor: "#06172c",
                borderColor: "#168dff",
                borderWidth: 1,
                titleColor: "#ffffff",
                bodyColor: "#d8e6fa"
            }

        },

        scales: {

            x: {

                ticks: {
                    color: "#9cafc7",
                    font: {
                        size: 10
                    }
                },

                grid: {
                    color:
                        "rgba(66,128,220,.13)"
                }

            },

            y: {

                beginAtZero: true,

                ticks: {
                    color: "#9cafc7",
                    font: {
                        size: 10
                    }
                },

                grid: {
                    color:
                        "rgba(66,128,220,.13)"
                }

            }

        }

    };
}


/* =========================================================
   USER CHART
========================================================= */

function renderUserChart() {

    const period =
        document.getElementById("userPeriod")?.value ||
        "daily";

    const trends =
        reportData?.trends?.users || {};

    let values = trends[period];

    /*
       Backend ke different possible response formats
       ko safely handle karenge.
    */

    if (!Array.isArray(values)) {

        values =
            Array.isArray(reportData?.userGrowth)
                ? reportData.userGrowth
                : [];
    }

    /*
       Normalize data
    */

    values = values.map(item => {

        if (typeof item === "number") {

            return {
                label: "",
                count: Number(item)
            };

        }

        return {
            label:
                item?._id ??
                item?.date ??
                item?.label ??
                item?.period ??
                "",

            count:
                Number(
                    item?.count ??
                    item?.users ??
                    item?.newUsers ??
                    item?.value ??
                    0
                )
        };

    });

    destroyChart("user");

    const labels =
        values.map(item => item.label);

    const counts =
        values.map(item => item.count);

    const canvas =
        document.getElementById("userChart");

    if (!canvas) return;

    const context =
        canvas.getContext("2d");

    const gradient =
        context.createLinearGradient(
            0,
            0,
            0,
            220
        );

    gradient.addColorStop(
        0,
        "rgba(0,145,255,.35)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,145,255,0)"
    );

    charts.user =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "New Users",

                            data:
                                counts,

                            borderColor:
                                "#16a8ff",

                            backgroundColor:
                                gradient,

                            fill: true,

                            tension: .35,

                            pointRadius: 3,

                            pointHoverRadius: 5,

                            pointBackgroundColor:
                                "#24bfff",

                            pointBorderColor:
                                "#ffffff",

                            borderWidth: 2

                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );


    createFullUserChart(
        labels,
        counts
    );

}


/* =========================================================
   CALCULATION CHART
========================================================= */

function renderCalculationChart() {

    const period =
        document.getElementById(
            "calculationPeriod"
        )?.value ||
        "daily";

    const trends =
        reportData?.trends?.calculations || {};

    let values =
        trends[period];

    if (!Array.isArray(values)) {

        values =
            Array.isArray(
                reportData?.calculationsTrend
            )
                ? reportData.calculationsTrend
                : [];

    }

    /*
       Normalize calculation data
    */

    values = values.map(item => {

        if (typeof item === "number") {

            return {
                label: "",
                count: Number(item)
            };

        }

        return {

            label:
                item?._id ??
                item?.date ??
                item?.label ??
                item?.period ??
                "",

            count:
                Number(
                    item?.count ??
                    item?.calculations ??
                    item?.value ??
                    0
                )

        };

    });


    destroyChart(
        "calculations"
    );


    const labels =
        values.map(
            item => item.label
        );


    const counts =
        values.map(
            item => item.count
        );


    const canvas =
        document.getElementById(
            "calculationChart"
        );


    if (!canvas) return;


    charts.calculations =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Calculations",

                            data:
                                counts,

                            backgroundColor:
                                "#9138ff",

                            borderColor:
                                "#d146ff",

                            borderWidth: 1,

                            borderRadius: 3

                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );


    createFullCalculationChart(
        labels,
        counts
    );

}


/* =========================================================
   PLAN DONUT
========================================================= */

function renderPlanChart() {

    const rawValues =
        reportData?.planDistribution || [];


    destroyChart("plan");


    // =====================================================
    // FIXED PLAN CATEGORIES
    // Free / Student / Pro
    // =====================================================

    const planMap = {

        free: 0,

        student: 0,

        pro: 0

    };


    // =====================================================
    // ACTUAL DATABASE COUNTS
    // =====================================================

    rawValues.forEach(
        function (item) {

            const key =
                String(
                    item?._id ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            if (
                Object.prototype.hasOwnProperty
                    .call(
                        planMap,
                        key
                    )
            ) {

                planMap[key] +=
                    Number(
                        item?.count ||
                        0
                    );

            }

        }
    );


    // =====================================================
    // FINAL VALUES
    // =====================================================

    const values = [

        {
            _id: "free",

            count:
                planMap.free
        },

        {
            _id: "student",

            count:
                planMap.student
        },

        {
            _id: "pro",

            count:
                planMap.pro
        }

    ];


    // =====================================================
    // LABELS
    // =====================================================

    const labels = [

        "Free",

        "Student",

        "Pro"

    ];


    // =====================================================
    // COUNTS
    // =====================================================

    const counts =
        values.map(
            function (item) {

                return Number(
                    item.count || 0
                );

            }
        );


    const total =
        counts.reduce(
            function (sum, value) {

                return sum + value;

            },
            0
        );


    // =====================================================
    // CENTER TOTAL
    // =====================================================

    const totalElement =
        document.getElementById(
            "planTotal"
        );


    if (totalElement) {

        totalElement.textContent =
            formatNumber(total);

    }


    // =====================================================
    // COLORS
    // =====================================================

    const colors = [

        "#147dff",

        "#8b35ff",

        "#ff2380"

    ];


    // =====================================================
    // CANVAS
    // =====================================================

    const canvas =
        document.getElementById(
            "planChart"
        );


    if (!canvas) {

        return;

    }


    // =====================================================
    // DOUGHNUT CHART
    // =====================================================

    charts.plan =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            data: counts,

                            backgroundColor:
                                colors,

                            borderColor:
                                "#071a31",

                            borderWidth: 2,

                            hoverOffset: 6

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    cutout: "62%",

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        const value =
                                            context.raw ||
                                            0;


                                        const percentage =
                                            total
                                                ? (
                                                    value /
                                                    total *
                                                    100
                                                ).toFixed(1)
                                                : "0.0";


                                        return (
                                            `${context.label}: ` +
                                            `${value} ` +
                                            `(${percentage}%)`
                                        );

                                    }

                            }

                        }

                    }

                }

            }

        );


    // =====================================================
    // CUSTOM LEGEND
    // =====================================================

    createLegend(
        "planLegend",

        labels,

        counts,

        colors

    );

}


/* =========================================================
   TYPE DONUT
========================================================= */

function renderTypeChart() {

    const values =
        reportData.calculationTypes || [];

    destroyChart("types");

    const labels =
        values.map(
            item =>
                item._id ||
                "Other"
        );

    const counts =
        values.map(
            item =>
                item.count
        );

    const total =
        counts.reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        );

    document.getElementById(
        "typeTotal"
    ).textContent =
        formatNumber(total);

    const colors = [
        "#147dff",
        "#8b35ff",
        "#ff2380",
        "#ffad21",
        "#16d99f"
    ];

    charts.types =
        new Chart(
            document.getElementById(
                "typeChart"
            ),
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {
                            data:
                                counts,

                            backgroundColor:
                                colors,

                            borderColor:
                                "#071a31",

                            borderWidth: 2
                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "62%",

                    plugins: {

                        legend: {
                            display: false
                        }

                    }

                }

            }
        );


    createLegend(
        "typeLegend",
        labels,
        counts,
        colors
    );
}


/* =========================================================
   LEGEND
========================================================= */

function createLegend(
    id,
    labels,
    counts,
    colors
) {

    const container =
        document.getElementById(id);

    const total =
        counts.reduce(
            (a,b) =>
                a + Number(b || 0),
            0
        );

    container.innerHTML =
        labels.map(
            (label, index) => {

                const count =
                    Number(
                        counts[index] || 0
                    );

                const percentage =
                    total
                        ? ((count / total) * 100)
                            .toFixed(1)
                        : "0";

                return `

                    <div class="legend-item">

                        <span
                            class="legend-dot"
                            style="
                                background:${colors[index]};
                                box-shadow:
                                0 0 8px ${colors[index]};
                            "
                        ></span>

                        <span class="legend-name">
                            ${safe(label)}
                        </span>

                        <span class="legend-value">
                            ${formatNumber(count)}
                            (${percentage}%)
                        </span>

                    </div>

                `;

            }
        ).join("");
}


/* =========================================================
   REVENUE
========================================================= */

function renderRevenueChart() {

    const period =
        document.getElementById(
            "revenuePeriod"
        )?.value ||
        "daily";


    const trends =
        reportData?.trends?.revenue || {};


    let values =
        trends[period];


    if (!Array.isArray(values)) {

        values =
            Array.isArray(
                reportData?.revenueTrend
            )
                ? reportData.revenueTrend
                : [];

    }


    /*
       Normalize revenue data
    */

    values = values.map(item => {

        if (typeof item === "number") {

            return {

                label: "",

                revenue:
                    Number(item)

            };

        }


        return {

            label:
                item?._id ??
                item?.date ??
                item?.label ??
                item?.period ??
                "",

            revenue:
                Number(
                    item?.revenue ??
                    item?.amount ??
                    item?.total ??
                    item?.value ??
                    0
                )

        };

    });


    destroyChart(
        "revenue"
    );


    const labels =
        values.map(
            item => item.label
        );


    const revenue =
        values.map(
            item => item.revenue
        );


    const canvas =
        document.getElementById(
            "revenueChart"
        );


    if (!canvas) return;


    const context =
        canvas.getContext("2d");


    const gradient =
        context.createLinearGradient(
            0,
            0,
            0,
            190
        );


    gradient.addColorStop(
        0,
        "rgba(25,225,165,.30)"
    );


    gradient.addColorStop(
        1,
        "rgba(25,225,165,0)"
    );


    charts.revenue =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Revenue",

                            data:
                                revenue,

                            borderColor:
                                "#19e1a5",

                            backgroundColor:
                                gradient,

                            fill: true,

                            tension: .35,

                            pointRadius: 3,

                            pointHoverRadius: 5,

                            pointBackgroundColor:
                                "#19e1a5",

                            borderWidth: 2

                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );


    createFullRevenueChart(
        labels,
        revenue
    );

}


/* =========================================================
   MONTHLY TABLE
========================================================= */

function renderMonthlyTable() {

    const tbody =
        document.getElementById(
            "monthlyTable"
        );

    const rows =
        Array.isArray(
            reportData.monthlySummary
        )
            ? reportData.monthlySummary
            : [];


    if (!rows.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;"
                >
                    No report data available.
                </td>
            </tr>
        `;

        return;
    }


    tbody.innerHTML =
        rows.map(
            row => `

                <tr>

                    <td>
                        <strong>
                            ${safe(row.month)}
                        </strong>
                    </td>

                    <td>
                        ${formatNumber(
                            row.users
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            row.calculations
                        )}
                    </td>

                    <td>
                        ${formatNumber(
                            row.activeSubscriptions
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            row.revenue
                        )}
                    </td>

                    <td class="growth-positive">

                        ${
                            Number(row.growth || 0) > 0
                                ? "↑ "
                                : ""
                        }

                        ${row.growth || 0}%

                    </td>

                </tr>

            `
        ).join("");

}

/* =========================================================
   POPULAR FORMULAS
========================================================= */

function renderPopularFormulas() {

    const formulas =
        Array.isArray(reportData?.popularFormulas)
            ? reportData.popularFormulas
            : [];


    const tbody =
        document.getElementById(
            "popularFormulaTableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    // =====================================================
    // NO DATA
    // =====================================================

    if (formulas.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="
                        text-align:center;
                        padding:24px;
                    "
                >
                    No formula data available.
                </td>
            </tr>
        `;

        return;
    }


    // =====================================================
    // FORMULA ROWS
    // =====================================================

    formulas.forEach(
        function (formula) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${safe(
                        formula.name || "—"
                    )}
                </td>

                <td>
                    ${safe(
                        formula.expression || "—"
                    )}
                </td>

                <td>
                    ${safe(
                        formula.category || "—"
                    )}
                </td>

                <td>
                    ${safe(
                        formula.level || "—"
                    )}
                </td>

                <td>
                    ${formatNumber(
                        formula.views || 0
                    )}
                </td>

            `;


            tbody.appendChild(row);

        }
    );

}

/* =========================================================
   SUBSCRIPTIONS
========================================================= */

function renderSubscriptions() {

    const plans =
        Array.isArray(
            reportData?.planDistribution
        )
            ? reportData.planDistribution
            : [];


    const map = {};


    plans.forEach(
        item => {

            const key =
                String(
                    item?._id ||
                    "free"
                )
                    .trim()
                    .toLowerCase();


            map[key] =
                (
                    map[key] ||
                    0
                ) +
                Number(
                    item?.count ||
                    0
                );

        }
    );


    const stats =
        reportData?.stats ||
        {};


    const activeElement =
        document.getElementById(
            "subActive"
        );

    const studentElement =
        document.getElementById(
            "subStudent"
        );

    const proElement =
        document.getElementById(
            "subPro"
        );

    const freeElement =
        document.getElementById(
            "subFree"
        );


    if (activeElement) {

        activeElement.textContent =
            formatNumber(
                stats.activeSubscriptions ||
                0
            );

    }


    if (studentElement) {

        studentElement.textContent =
            formatNumber(
                map.student ||
                0
            );

    }


    if (proElement) {

        proElement.textContent =
            formatNumber(
                map.pro ||
                0
            );

    }


    if (freeElement) {

        freeElement.textContent =
            formatNumber(
                map.free ||
                0
            );

    }

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function renderNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );

    const items =
        reportData.notifications || [];

    if (!items.length) {

        list.innerHTML = `
            <div class="notification-item">

                <i class="fa-regular fa-circle-check"></i>

                <div>

                    <strong>
                        No new notifications
                    </strong>

                    <span>
                        No recent activity found.
                    </span>

                </div>

            </div>
        `;

        return;
    }

    list.innerHTML =
        items.slice(0, 10)
            .map(
                item => `

                    <div class="notification-item">

                        <i class="fa-solid ${
                            item.type === "user"
                                ? "fa-user-plus"
                                : "fa-calculator"
                        }"></i>

                        <div>

                            <strong>
                                ${safe(item.title)}
                            </strong>

                            <span>
                                ${safe(item.message)}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");
}


/* =========================================================
   FULL CHARTS
========================================================= */

function createFullUserChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "userGrowthFull"
        );

    if (!canvas) return;

    destroyChart("userFull");

    charts.userFull =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "New Users",

                            data,

                            borderColor:
                                "#14a8ff",

                            backgroundColor:
                                "rgba(20,168,255,.15)",

                            fill: true,

                            tension: .35
                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );
}


function createFullCalculationChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "calculationFull"
        );

    if (!canvas) return;

    destroyChart("calcFull");

    charts.calcFull =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Calculations",

                            data,

                            backgroundColor:
                                "#9138ff"
                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );
}


function createFullRevenueChart(
    labels,
    data
) {

    const canvas =
        document.getElementById(
            "revenueFull"
        );

    if (!canvas) return;

    destroyChart("revenueFull");

    charts.revenueFull =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {
                            label:
                                "Revenue",

                            data,

                            borderColor:
                                "#19e1a5",

                            backgroundColor:
                                "rgba(25,225,165,.12)",

                            fill: true,

                            tension: .35
                        }

                    ]

                },

                options:
                    lineOptions()

            }
        );
}


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    document.querySelectorAll(
        ".report-tab"
    ).forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    document.querySelectorAll(
                        ".report-tab"
                    ).forEach(
                        x =>
                            x.classList.remove(
                                "active"
                            )
                    );

                    document.querySelectorAll(
                        ".tab-content"
                    ).forEach(
                        x =>
                            x.classList.remove(
                                "active"
                            )
                    );

                    tab.classList.add(
                        "active"
                    );

                    const content =
                        document.getElementById(
                            tab.dataset.tab
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
   SIDEBAR TOGGLE
========================================================= */

/* =========================================================
   CALCURA - SIDEBAR FINAL WORKING VERSION
========================================================= */

function setupSidebar() {

    const sidebar =
        document.getElementById("adminSidebar");

    const toggle =
        document.getElementById("sidebarToggle");

    const main =
        document.querySelector(".main");

    if (!sidebar || !toggle) {
        console.error(
            "CALCURA: Sidebar or toggle not found"
        );
        return;
    }

    toggle.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            /* =========================
               MOBILE
            ========================= */

            if (window.innerWidth <= 900) {

                sidebar.classList.toggle("open");

                return;
            }


            /* =========================
               DESKTOP
            ========================= */

            const collapsed =
                sidebar.classList.toggle(
                    "collapsed"
                );


            document.body.classList.toggle(
                "sidebar-collapsed",
                collapsed
            );


            if (main) {

                main.classList.toggle(
                    "sidebar-collapsed",
                    collapsed
                );

            }

        }
    );

}

/* =========================================================
   PROFILE
========================================================= */

function setupProfile() {

    const button =
        document.getElementById(
            "adminProfileButton"
        );

    const dropdown =
        document.getElementById(
            "profileDropdown"
        );

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


    document.getElementById(
        "logoutButton"
    ).addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                TOKEN_KEY
            );

            window.location.href =
                "../../login.html";

        }
    );
}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function setupNotifications() {

    const button =
        document.getElementById(
            "notificationButton"
        );

    const dropdown =
        document.getElementById(
            "notificationDropdown"
        );

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
   CHART PERIODS
========================================================= */

// =========================================================
// REPORT DROPDOWN LISTENERS
// =========================================================

const dateRangeSelect =
    document.getElementById("dateRange");

const userPeriodSelect =
    document.getElementById("userPeriod");

const calculationPeriodSelect =
    document.getElementById("calculationPeriod");

const revenuePeriodSelect =
    document.getElementById("revenuePeriod");


// ---------------------------------------------------------
// DATE RANGE
// Last 7 / 30 / 90 days change
// ---------------------------------------------------------

if (dateRangeSelect) {

    dateRangeSelect.addEventListener(
        "change",
        function () {

            loadReports();

        }
    );

}


// ---------------------------------------------------------
// USER GROWTH
// Daily / Weekly / Monthly
// ---------------------------------------------------------

if (userPeriodSelect) {

    userPeriodSelect.addEventListener(
        "change",
        function () {

            renderUserChart();

        }
    );

}


// ---------------------------------------------------------
// CALCULATIONS
// Daily / Weekly / Monthly
// ---------------------------------------------------------

if (calculationPeriodSelect) {

    calculationPeriodSelect.addEventListener(
        "change",
        function () {

            renderCalculationChart();

        }
    );

}


// ---------------------------------------------------------
// REVENUE
// Daily / Weekly / Monthly
// ---------------------------------------------------------

if (revenuePeriodSelect) {

    revenuePeriodSelect.addEventListener(
        "change",
        function () {

            renderRevenueChart();

        }
    );

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

const globalSearch =
    document.getElementById("globalSearch");

if (globalSearch) {

    globalSearch.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Enter") {
                return;
            }

            const value =
                event.target.value.trim();

            if (!value) {
                return;
            }

            window.location.href =
                `users.html?search=${encodeURIComponent(value)}`;

        }
    );

}


/* =========================================================
   EXPORT
========================================================= */

const exportButton =
    document.getElementById("exportButton");

if (exportButton) {

    exportButton.addEventListener(
        "click",
        () => {

            if (!reportData) {
                return;
            }

            const rows = [];

            rows.push([
                "Month",
                "New Users",
                "Total Calculations",
                "Active Subscriptions",
                "Revenue",
                "Growth"
            ]);

            (
                reportData.monthlySummary || []
            ).forEach(
                row => {

                    rows.push([
                        row.month,
                        row.users,
                        row.calculations,
                        row.activeSubscriptions,
                        row.revenue,
                        row.growth
                    ]);

                }
            );

            const csv =
                rows.map(
                    row =>
                        row.map(
                            value =>
                                `"${String(value ?? "")
                                    .replaceAll(
                                        '"',
                                        '""'
                                    )}"`
                        ).join(",")
                ).join("\r\n");

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

            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                `Calcura-Reports-${new Date()
                    .toISOString()
                    .slice(0, 10)}.csv`;

            document.body.appendChild(a);

            a.click();

            a.remove();

            URL.revokeObjectURL(url);

        }
    );

}

/* =========================================================
   INITIALIZE
========================================================= */

async function init() {

    if (!getToken()) {

        window.location.href =
            "../../login.html";

        return;
    }

    setupTabs();

    // SIDEBAR FIRST
    setupSidebar();

    setupProfile();

    setupNotifications();

    await loadAdminProfile();

    await loadReports();
}


/* =========================================================
   START REPORTS PAGE
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

} else {

    init();

}