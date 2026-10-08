"use strict";


/* =========================================================
   CONFIG
========================================================= */

const API_BASE =
    "http://localhost:5000/api";

const TOKEN_KEY =
    "calcuraToken";


/* =========================================================
   STATE
========================================================= */

let currentPage = 1;

let totalPages = 1;

let pageSize = 10;

let usersCache = [];

let currentTab =
    "sessions";

let loginChart = null;


/* =========================================================
   HEADERS
========================================================= */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function getHeaders(
    json = false
) {

    const headers = {};

    const token =
        getToken();

    if (token) {

        headers.Authorization =
            "Bearer " + token;

    }

    if (json) {

        headers[
            "Content-Type"
        ] =
            "application/json";

    }

    return headers;

}


/* =========================================================
   ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   INITIAL
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    if (!getToken()) {

        window.location.href =
            "../../login.html";

        return;

    }


    setupSidebar();

    setupProfile();

    setupNotifications();

    setupTabs();

    setupFilters();

    setupPagination();

    setupModals();

    setupGlobalSearch();


    await loadAdminProfile();

    await loadUsers();

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
   ADMIN PROFILE
========================================================= */

async function loadAdminProfile() {

    try {

        const response =
            await fetch(
                `${API_BASE}/auth/me`,
                {
                    headers:
                        getHeaders()
                }
            );

        const data =
            await response.json();

        if (!response.ok) {
            return;
        }

        const user =
            data.user ||
            data.data ||
            data;

        const name =
            user.name ||
            "Admin";

        const role =
            user.role ||
            "Administrator";

        const initial =
            name
                .trim()
                .charAt(0)
                .toUpperCase();


        document.getElementById(
            "adminName"
        ).textContent =
            name;


        document.getElementById(
            "adminAvatar"
        ).textContent =
            initial;


        document.getElementById(
            "dropdownName"
        ).textContent =
            name;


        document.getElementById(
            "dropdownAvatar"
        ).textContent =
            initial;


        document.getElementById(
            "dropdownRole"
        ).textContent =
            role;

    } catch (error) {

        console.error(
            "ADMIN PROFILE ERROR:",
            error
        );

    }

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

    if (
        !button ||
        !dropdown
    ) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "show"
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
                    "show"
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

            localStorage.removeItem(
                "calcuraUser"
            );

            window.location.href =
                "../../login.html";

        }
    );

}


/* =========================================================
   NOTIFICATION
========================================================= */

function setupNotifications() {

    document.getElementById(
        "notificationButton"
    )?.addEventListener(
        "click",
        () => {

            alert(
                "No new notifications."
            );

        }
    );

}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    const search =
        document.getElementById(
            "accountSearch"
        ).value.trim();

    const status =
        document.getElementById(
            "statusFilter"
        ).value;


    const params =
        new URLSearchParams();

    params.set(
        "page",
        currentPage
    );

    params.set(
        "limit",
        pageSize
    );

    if (search) {

        params.set(
            "search",
            search
        );

    }

   if (
    currentTab === "blocked"
) {

    params.set(
        "blocked",
        "true"
    );

}

    try {

        showTableLoading();


        const response =
            await fetch(
                `${API_BASE}/admin/users?${params.toString()}`,
                {
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load accounts."
            );

        }


        usersCache =
            data.users || [];


        totalPages =
            data.pagination?.pages ||
            1;


        renderStats(
            data.stats
        );


        renderRecentActivity(
            usersCache
        );


        renderTable(
            usersCache
        );


        renderDeviceData(
            usersCache
        );


        renderChart(
            usersCache
        );


        updatePagination(
            data.pagination
        );


    } catch (error) {

        console.error(
            "LOAD USER ACCOUNTS ERROR:",
            error
        );

        renderError(
            error.message
        );

    }

}


/* =========================================================
   STATS
========================================================= */

function renderStats(
    stats
) {

    document.getElementById(
        "totalAccounts"
    ).textContent =
        Number(
            stats?.totalUsers || 0
        ).toLocaleString();


    document.getElementById(
        "activeAccounts"
    ).textContent =
        Number(
            stats?.activeUsers || 0
        ).toLocaleString();


    /*
     * Current Calcura backend does not
     * have blocked-account tracking yet.
     */

    document.getElementById(
        "blockedAccounts"
    ).textContent =
        "0";


    /*
     * Current Calcura backend does not
     * have password-reset request
     * tracking yet.
     */

    document.getElementById(
        "resetRequests"
    ).textContent =
        "0";

}


/* =========================================================
   RECENT ACTIVITY
========================================================= */

function renderRecentActivity(
    users
) {

    const container =
        document.getElementById(
            "recentLoginList"
        );


    if (!users.length) {

        container.innerHTML = `
            <div class="loading-small">
                No account activity found.
            </div>
        `;

        return;

    }


    const sorted =
        [...users]
            .sort(
                (
                    a,
                    b
                ) => {

                    return (
                        new Date(
                            b.lastActive ||
                            b.updatedAt ||
                            b.createdAt
                        ) -
                        new Date(
                            a.lastActive ||
                            a.updatedAt ||
                            a.createdAt
                        )
                    );

                }
            )
            .slice(
                0,
                5
            );


    container.innerHTML =
        sorted
            .map(
                (
                    user,
                    index
                ) => {

                    const initial =
                        (
                            user.name ||
                            user.email ||
                            "U"
                        )
                            .charAt(0)
                            .toUpperCase();


                    return `
                        <div class="recent-item">

                            <span
                                class="recent-number"
                            >
                                ${index + 1}
                            </span>

                            <div
                                class="recent-avatar"
                            >
                                ${escapeHTML(
                                    initial
                                )}
                            </div>

                            <div
                                class="recent-user"
                            >
                                <strong>
                                    ${escapeHTML(
                                        user.name ||
                                        "User"
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        user.email ||
                                        ""
                                    )}
                                </span>
                            </div>

                            <span
                                class="recent-time"
                            >
                                ${formatRelative(
                                    user.lastActive ||
                                    user.updatedAt ||
                                    user.createdAt
                                )}
                            </span>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   TABLE
========================================================= */

function renderTable(
    users
) {

    const body =
        document.getElementById(
            "accountsTableBody"
        );


    if (!users.length) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="loading-row"
                >
                    No accounts found.
                </td>
            </tr>
        `;

        return;

    }


    body.innerHTML =
        users
            .map(
                (
                    user,
                    index
                ) => {

                    const initial =
                        (
                            user.name ||
                            user.email ||
                            "U"
                        )
                            .charAt(0)
                            .toUpperCase();


                    const loginTime =
                        user.lastActive
                            ? formatDate(
                                user.lastActive
                            )
                            : "Not recorded";


                    return `
                        <tr>

                            <td>
                                ${
                                    (
                                        (
                                            currentPage -
                                            1
                                        ) *
                                        pageSize
                                    ) +
                                    index +
                                    1
                                }
                            </td>


                            <td>

                                <div
                                    class="user-cell"
                                >

                                    <div
                                        class="user-avatar-small"
                                    >
                                        ${escapeHTML(
                                            initial
                                        )}
                                    </div>

                                    <span
                                        class="user-name"
                                    >
                                        ${escapeHTML(
                                            user.name ||
                                            "User"
                                        )}
                                    </span>

                                </div>

                            </td>


                            <td>
                                ${escapeHTML(
                                    user.email
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    user.lastLoginIp ||
                                    "Not recorded"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    user.lastLoginDevice ||
                                    "Not recorded"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    user.lastLoginBrowser ||
                                    "Not recorded"
                                )}
                            </td>


                            <td>
                                ${loginTime}
                            </td>


                            <td>

                                <span
                                    class="status-pill ${
                                        user.status ===
                                        "active"
                                            ? "active"
                                            : "inactive"
                                    }"
                                >

                                    <span
                                        class="status-dot"
                                    ></span>

                                    ${
                                        user.status ===
                                        "active"
                                            ? "Active"
                                            : "Inactive"
                                    }

                                </span>

                            </td>


                            <td>

                                <div
                                    class="action-buttons"
                                >

                                    <button
                                        type="button"
                                        class="action-button"
                                        title="View"
                                        data-action="view"
                                        data-id="${
                                            user._id
                                        }"
                                    >
                                        <i
                                            class="fa-solid fa-eye"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-button"
                                        title="Edit"
                                        data-action="edit"
                                        data-id="${
                                            user._id
                                        }"
                                    >
                                        <i
                                            class="fa-solid fa-pen"
                                        ></i>
                                    </button>


                                    <button
                                        type="button"
                                        class="action-button delete"
                                        title="Delete"
                                        data-action="delete"
                                        data-id="${
                                            user._id
                                        }"
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


    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.action;

                        const id =
                            button.dataset.id;


                        if (
                            action ===
                            "view"
                        ) {

                            viewUser(id);

                        }

                        else if (
                            action ===
                            "edit"
                        ) {

                            editUser(id);

                        }

                        else if (
                            action ===
                            "delete"
                        ) {

                            deleteUser(id);

                        }

                    }
                );

            }
        );

}


/* =========================================================
   VIEW USER
========================================================= */

async function viewUser(
    id
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/admin/users/${id}`,
                {
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load user."
            );

        }


        const user =
            data.user;


        document.getElementById(
            "accountDetails"
        ).innerHTML = `

            <div class="details-grid">

                <div class="detail-box">
                    <span>Name</span>
                    <strong>
                        ${escapeHTML(
                            user.name
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Email</span>
                    <strong>
                        ${escapeHTML(
                            user.email
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Role</span>
                    <strong>
                        ${escapeHTML(
                            user.role ||
                            "user"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Plan</span>
                    <strong>
                        ${escapeHTML(
                            user.plan ||
                            "free"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Subscription</span>
                    <strong>
                        ${escapeHTML(
                            user.subscriptionStatus ||
                            "inactive"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Account Status</span>
                    <strong>
                        ${escapeHTML(
                            user.status ||
                            "inactive"
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Registered</span>
                    <strong>
                        ${formatDate(
                            user.createdAt
                        )}
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Last Activity</span>
                    <strong>
                        ${
                            user.lastActive
                                ? formatDate(
                                    user.lastActive
                                )
                                : "Not recorded"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>IP Address</span>
                    <strong>
                        ${
                            user.lastLoginIp ||
                            "Not recorded"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Device</span>
                    <strong>
                        ${
                            user.lastLoginDevice ||
                            "Not recorded"
                        }
                    </strong>
                </div>

                <div class="detail-box">
                    <span>Browser</span>
                    <strong>
                        ${
                            user.lastLoginBrowser ||
                            "Not recorded"
                        }
                    </strong>
                </div>

            </div>

        `;


        openModal(
            "viewModal"
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   EDIT USER
========================================================= */

async function editUser(
    id
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/admin/users/${id}`,
                {
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load user."
            );

        }


        const user =
            data.user;


        document.getElementById(
            "editUserId"
        ).value =
            user._id;


        document.getElementById(
            "editName"
        ).value =
            user.name || "";


        document.getElementById(
            "editEmail"
        ).value =
            user.email || "";


        document.getElementById(
            "editRole"
        ).value =
            user.role || "user";


        document.getElementById(
            "editPlan"
        ).value =
            user.plan || "free";


        document.getElementById(
            "editSubscription"
        ).value =
            user.subscriptionStatus ||
            "inactive";


        openModal(
            "editModal"
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   SAVE EDIT
========================================================= */

document.addEventListener(
    "submit",
    async event => {

        if (
            event.target.id !==
            "editForm"
        ) {
            return;
        }


        event.preventDefault();


        const id =
            document.getElementById(
                "editUserId"
            ).value;


        const payload = {

            name:
                document.getElementById(
                    "editName"
                ).value.trim(),

            email:
                document.getElementById(
                    "editEmail"
                ).value.trim(),

            role:
                document.getElementById(
                    "editRole"
                ).value,

            plan:
                document.getElementById(
                    "editPlan"
                ).value,

            subscriptionStatus:
                document.getElementById(
                    "editSubscription"
                ).value

        };


        try {

            const response =
                await fetch(
                    `${API_BASE}/admin/users/${id}`,
                    {
                        method:
                            "PUT",

                        headers:
                            getHeaders(
                                true
                            ),

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
                    "Update failed."
                );

            }


            closeModal(
                "editModal"
            );


            await loadUsers();


            alert(
                "Account updated successfully."
            );

        } catch (error) {

            alert(
                error.message
            );

        }

    }
);


/* =========================================================
   DELETE
========================================================= */

async function deleteUser(
    id
) {

    const user =
        usersCache.find(
            item =>
                item._id === id
        );


    const name =
        user?.name ||
        user?.email ||
        "this account";


    if (
        !confirm(
            `Delete ${name}? This action cannot be undone.`
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_BASE}/admin/users/${id}`,
                {
                    method:
                        "DELETE",

                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Delete failed."
            );

        }


        await loadUsers();


        alert(
            "Account deleted successfully."
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================================
   DEVICE DATA
========================================================= */

function renderDeviceData(
    users
) {

    const known =
        users.filter(
            user =>
                user.lastLoginDevice &&
                user.lastLoginDevice !==
                    "Not recorded"
        );


    const counts = {};

    known.forEach(
        user => {

            const device =
                user.lastLoginDevice ||
                "Unknown";

            counts[device] =
                (
                    counts[device] ||
                    0
                ) + 1;

        }
    );


    const entries =
        Object.entries(
            counts
        );


    const total =
        entries.reduce(
            (
                sum,
                item
            ) =>
                sum + item[1],
            0
        );


    document.getElementById(
        "deviceTotal"
    ).textContent =
        total;


    const legend =
        document.getElementById(
            "deviceLegend"
        );


    if (!entries.length) {

        legend.innerHTML = `
            <div
                style="
                    color:#8ea4c0;
                    line-height:1.5;
                "
            >
                Device information will appear
                after users log in with the
                updated account tracking.
            </div>
        `;

        return;

    }


    const colors = [
        "#118cff",
        "#00e89a",
        "#ffcf32",
        "#c63dff",
        "#ef49bd"
    ];


    legend.innerHTML =
        entries
            .map(
                (
                    item,
                    index
                ) => {

                    const percent =
                        total
                            ? Math.round(
                                (
                                    item[1] /
                                    total
                                ) *
                                100
                            )
                            : 0;


                    return `
                        <div class="legend-row">

                            <span
                                class="legend-dot"
                                style="
                                    background:
                                    ${colors[index % colors.length]};
                                "
                            ></span>

                            <span>
                                ${escapeHTML(
                                    item[0]
                                )}
                            </span>

                            <strong>
                                ${percent}%
                            </strong>

                        </div>
                    `;

                }
            )
            .join("");

}


/* =========================================================
   CHART
========================================================= */

function renderChart(
    users
) {

    const canvas =
        document.getElementById(
            "loginChart"
        );


    if (!canvas) {
        return;
    }


    const days = [];

    const successful = [];

    const inactive = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();

        date.setDate(
            date.getDate() - i
        );

        days.push(
            date.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short"
                }
            )
        );


        const dayStart =
            new Date(
                date
            );

        dayStart.setHours(
            0,
            0,
            0,
            0
        );


        const dayEnd =
            new Date(
                date
            );

        dayEnd.setHours(
            23,
            59,
            59,
            999
        );


        let count = 0;


        users.forEach(
            user => {

                if (
                    !user.lastActive
                ) {
                    return;
                }


                const activity =
                    new Date(
                        user.lastActive
                    );


                if (
                    activity >= dayStart &&
                    activity <= dayEnd
                ) {

                    count++;

                }

            }
        );


        successful.push(
            count
        );

        inactive.push(
            0
        );

    }


    if (
        loginChart
    ) {

        loginChart.destroy();

    }


    loginChart =
        new Chart(
            canvas,
            {
                type:
                    "bar",

                data: {

                    labels:
                        days,

                    datasets: [

                        {
                            label:
                                "Recorded activity",

                            data:
                                successful,

                            backgroundColor:
                                "#168fff",

                            borderRadius:
                                2
                        },

                        {
                            label:
                                "No recorded activity",

                            data:
                                inactive,

                            backgroundColor:
                                "#792cff",

                            borderRadius:
                                2
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            labels: {
                                color:
                                    "#b9c8dc"
                            }

                        }

                    },

                    scales: {

                        x: {

                            ticks: {
                                color:
                                    "#8ea5c2"
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.05)"
                            }

                        },

                        y: {

                            beginAtZero:
                                true,

                            ticks: {
                                color:
                                    "#8ea5c2",
                                precision:
                                    0
                            },

                            grid: {
                                color:
                                    "rgba(255,255,255,.05)"
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    document
        .querySelectorAll(
            ".account-tab"
        )
        .forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".account-tab"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        tab.classList.add(
                            "active"
                        );


                        currentTab =
                            tab.dataset.tab;


                        applyTabFilter();

                    }
                );

            }
        );

}


function applyTabFilter() {

    const status =
        document.getElementById(
            "statusFilter"
        );


    switch (
    currentTab
) {

    case "blocked":

        status.value =
            "all";

        break;


    case "security":

        status.value =
            "all";

        break;


    default:

        status.value =
            "all";

}


    currentPage = 1;

    loadUsers();

}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    const search =
        document.getElementById(
            "accountSearch"
        );


    let timer;


    search.addEventListener(
        "input",
        () => {

            clearTimeout(
                timer
            );

            timer =
                setTimeout(
                    () => {

                        currentPage =
                            1;

                        loadUsers();

                    },
                    350
                );

        }
    );


    document.getElementById(
        "statusFilter"
    ).addEventListener(
        "change",
        () => {

            currentPage = 1;

            loadUsers();

        }
    );


    /*
     * Device/browser/date are client-side
     * filters because current users API
     * only supports account search/status.
     */

    document.getElementById(
        "deviceFilter"
    ).addEventListener(
        "change",
        applyLocalFilters
    );


    document.getElementById(
        "browserFilter"
    ).addEventListener(
        "change",
        applyLocalFilters
    );


    document.getElementById(
        "dateFilter"
    ).addEventListener(
        "change",
        applyLocalFilters
    );


    document.getElementById(
        "resetButton"
    ).addEventListener(
        "click",
        () => {

            search.value =
                "";

            document.getElementById(
                "statusFilter"
            ).value =
                "all";

            document.getElementById(
                "deviceFilter"
            ).value =
                "all";

            document.getElementById(
                "browserFilter"
            ).value =
                "all";

            document.getElementById(
                "dateFilter"
            ).value =
                "";

            currentPage =
                1;

            loadUsers();

        }
    );

}


function applyLocalFilters() {

    let filtered =
        [...usersCache];


    const device =
        document.getElementById(
            "deviceFilter"
        ).value;


    const browser =
        document.getElementById(
            "browserFilter"
        ).value;


    const date =
        document.getElementById(
            "dateFilter"
        ).value;


    if (
        device !== "all"
    ) {

        filtered =
            filtered.filter(
                user =>
                    (
                        user.lastLoginDevice ||
                        "Unknown"
                    ) ===
                    device
            );

    }


    if (
        browser !== "all"
    ) {

        filtered =
            filtered.filter(
                user =>
                    (
                        user.lastLoginBrowser ||
                        "Unknown"
                    ) ===
                    browser
            );

    }


    if (date) {

        filtered =
            filtered.filter(
                user => {

                    if (
                        !user.lastActive
                    ) {
                        return false;
                    }

                    return (
                        new Date(
                            user.lastActive
                        )
                            .toISOString()
                            .slice(
                                0,
                                10
                            ) ===
                        date
                    );

                }
            );

    }


    renderTable(
        filtered
    );

}


/* =========================================================
   PAGINATION
========================================================= */

function setupPagination() {

    document.getElementById(
        "previousPage"
    ).addEventListener(
        "click",
        () => {

            if (
                currentPage >
                1
            ) {

                currentPage--;

                loadUsers();

            }

        }
    );


    document.getElementById(
        "nextPage"
    ).addEventListener(
        "click",
        () => {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                loadUsers();

            }

        }
    );

}


function updatePagination(
    pagination
) {

    const total =
        pagination?.total ||
        0;


    document.getElementById(
        "currentPage"
    ).textContent =
        currentPage;


    document.getElementById(
        "previousPage"
    ).disabled =
        currentPage <= 1;


    document.getElementById(
        "nextPage"
    ).disabled =
        currentPage >=
        totalPages;


    const start =
        total === 0
            ? 0
            : (
                (
                    currentPage -
                    1
                ) *
                pageSize
            ) + 1;


    const end =
        Math.min(
            currentPage *
            pageSize,
            total
        );


    document.getElementById(
        "showingText"
    ).textContent =
        total === 0
            ? "Showing 0 accounts"
            : `Showing ${start} to ${end} of ${total} accounts`;

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function setupGlobalSearch() {

    const global =
        document.getElementById(
            "globalSearch"
        );

    const search =
        document.getElementById(
            "accountSearch"
        );


    global.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }


            search.value =
                global.value.trim();


            currentPage =
                1;


            loadUsers();

        }
    );

}


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

    document.getElementById(
        "closeViewModal"
    ).addEventListener(
        "click",
        () =>
            closeModal(
                "viewModal"
            )
    );


    document.getElementById(
        "closeEditModal"
    ).addEventListener(
        "click",
        () =>
            closeModal(
                "editModal"
            )
    );


    document.getElementById(
        "cancelEdit"
    ).addEventListener(
        "click",
        () =>
            closeModal(
                "editModal"
            )
    );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            closeModal(
                                modal.id
                            );

                        }

                    }
                );

            }
        );


    document.getElementById(
        "viewAllButton"
    ).addEventListener(
        "click",
        () => {

            document
                .querySelector(
                    ".table-panel"
                )
                .scrollIntoView({
                    behavior:
                        "smooth"
                });

        }
    );

}


function openModal(
    id
) {

    document.getElementById(
        id
    )?.classList.add(
        "show"
    );

}


function closeModal(
    id
) {

    document.getElementById(
        id
    )?.classList.remove(
        "show"
    );

}


/* =========================================================
   HELPERS
========================================================= */

function formatDate(
    value
) {

    if (!value) {
        return "Not recorded";
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Not recorded";
    }


    return date.toLocaleString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}


function formatRelative(
    value
) {

    if (!value) {
        return "—";
    }


    const diff =
        Date.now() -
        new Date(value).getTime();


    const minutes =
        Math.floor(
            diff /
            60000
        );


    if (
        minutes < 1
    ) {
        return "Just now";
    }


    if (
        minutes < 60
    ) {
        return `${minutes}m ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (
        hours < 24
    ) {
        return `${hours}h ago`;
    }


    return `${Math.floor(
        hours / 24
    )}d ago`;

}


function showTableLoading() {

    document.getElementById(
        "accountsTableBody"
    ).innerHTML = `

        <tr>

            <td
                colspan="9"
                class="loading-row"
            >

                <i
                    class="fa-solid fa-spinner fa-spin"
                ></i>

                Loading accounts...

            </td>

        </tr>

    `;

}


function renderError(
    message
) {

    document.getElementById(
        "accountsTableBody"
    ).innerHTML = `

        <tr>

            <td
                colspan="9"
                class="loading-row"
            >

                ${escapeHTML(
                    message
                )}

            </td>

        </tr>

    `;

}