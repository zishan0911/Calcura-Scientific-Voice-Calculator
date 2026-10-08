"use strict";


/* =====================================================
   CONFIG
===================================================== */

const API =
    "http://localhost:5000/api";

const TOKEN_KEY =
    "calcuraToken";


let currentPage = 1;

const pageLimit = 10;

let currentCategory = "";

let allCurrentLogs = [];


/* =====================================================
   HELPERS
===================================================== */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function authHeaders() {

    const token =
        getToken();

    return {

        "Authorization":
            `Bearer ${token}`,

        "Content-Type":
            "application/json"

    };

}


function safe(value) {

    return String(
        value ?? ""
    )
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


function initial(name) {

    return String(
        name || "U"
    )
        .charAt(0)
        .toUpperCase();

}


function formatNumber(value) {

    return Number(
        value || 0
    )
        .toLocaleString(
            "en-IN"
        );

}


/* =====================================================
   ADMIN PROFILE
===================================================== */

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


        const adminName =
            document.getElementById(
                "adminName"
            );


        const adminRole =
            document.getElementById(
                "adminRole"
            );


        const adminAvatar =
            document.getElementById(
                "adminAvatar"
            );


        const profileName =
            document.getElementById(
                "profileName"
            );


        const profileEmail =
            document.getElementById(
                "profileEmail"
            );


        const profileId =
            document.getElementById(
                "profileId"
            );


        const profileRole =
            document.getElementById(
                "profileRole"
            );


        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );


        if (adminName)
            adminName.textContent =
                name;


        if (adminRole)
            adminRole.textContent =
                role;


        if (adminAvatar)
            adminAvatar.textContent =
                initial(name);


        if (profileName)
            profileName.textContent =
                name;


        if (profileEmail)
            profileEmail.textContent =
                email;


        if (profileId)
            profileId.textContent =
                id;


        if (profileRole)
            profileRole.textContent =
                role;


        if (profileAvatar)
            profileAvatar.textContent =
                initial(name);

    }
    catch (error) {

        console.error(
            "Admin profile error:",
            error
        );

    }

}


/* =====================================================
   LOAD USERS FOR FILTER
===================================================== */

async function loadUserFilter() {

    try {

        const response =
            await fetch(
                `${API}/users`,
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


        const users =
            result.users ||
            result.data ||
            [];


        const select =
            document.getElementById(
                "userFilter"
            );


        if (!select) {
            return;
        }


        users.forEach(
            user => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    user._id ||
                    user.id;

                option.textContent =
                    user.name ||
                    user.email ||
                    "Unknown User";

                select.appendChild(
                    option
                );

            }
        );

    }
    catch (error) {

        console.warn(
            "User filter unavailable:",
            error.message
        );

    }

}


/* =====================================================
   LOAD LOGS
===================================================== */

async function loadLogs() {

    const tbody =
        document.getElementById(
            "logsTableBody"
        );


    if (tbody) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-row"
                >

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading activity logs...

                </td>

            </tr>

        `;

    }


    const search =
        document.getElementById(
            "logSearch"
        )?.value
        .trim() || "";


    const userId =
        document.getElementById(
            "userFilter"
        )?.value || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "";


    const start =
        document.getElementById(
            "startDate"
        )?.value || "";


    const end =
        document.getElementById(
            "endDate"
        )?.value || "";


    const params =
        new URLSearchParams();


    params.set(
        "page",
        currentPage
    );


    params.set(
        "limit",
        pageLimit
    );


    if (search)
        params.set(
            "search",
            search
        );


    if (userId)
        params.set(
            "userId",
            userId
        );


    if (status)
        params.set(
            "status",
            status
        );


    if (currentCategory)
        params.set(
            "category",
            currentCategory
        );


    if (start)
        params.set(
            "start",
            start
        );


    if (end)
        params.set(
            "end",
            end
        );


    try {

        const response =
            await fetch(
                `${API}/admin/activity-logs?${params.toString()}`,
                {
                    method:
                        "GET",

                    headers:
                        authHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                `HTTP ${response.status}`
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load logs."
            );

        }


        allCurrentLogs =
            result.logs || [];


        renderStats(
            result.stats || {}
        );


        renderLogs(
            result.logs || []
        );


        renderPagination(
            result.pagination || {}
        );

    }
    catch (error) {

        console.error(
            "Activity logs error:",
            error
        );


        if (tbody) {

            tbody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="loading-row"
                    >

                        <i class="fa-solid fa-triangle-exclamation"></i>

                        ${safe(
                            error.message ||
                            "Unable to load activity logs."
                        )}

                    </td>

                </tr>

            `;

        }

    }

}


/* =====================================================
   STATS
===================================================== */

function renderStats(stats) {

    document.getElementById(
        "totalLogs"
    ).textContent =
        formatNumber(
            stats.totalLogs
        );


    document.getElementById(
        "userActivities"
    ).textContent =
        formatNumber(
            stats.userActivities
        );


    document.getElementById(
        "subscriptionActivities"
    ).textContent =
        formatNumber(
            stats.subscriptionActivities
        );


    document.getElementById(
        "systemActivities"
    ).textContent =
        formatNumber(
            stats.systemActivities
        );

}


/* =====================================================
   ACTIVITY BADGE
===================================================== */

function activityBadge(log) {

    const type =
        String(
            log.activityType ||
            "Activity"
        );


    const lower =
        type.toLowerCase();


    let css =
        "user";


    let icon =
        "fa-user";


    if (
        lower.includes(
            "calculation"
        )
    ) {

        css =
            "calculation";

        icon =
            "fa-calculator";

    }
    else if (
        lower.includes(
            "payment"
        )
    ) {

        css =
            "payment";

        icon =
            "fa-credit-card";

    }
    else if (
        lower.includes(
            "subscription"
        )
    ) {

        css =
            "subscription";

        icon =
            "fa-crown";

    }
    else if (
        lower.includes(
            "security"
        )
    ) {

        css =
            "system";

        icon =
            "fa-shield-halved";

    }


    return `

        <span
            class="activity-badge ${css}"
        >

            <i
                class="fa-solid ${icon}"
            ></i>

            ${safe(type)}

        </span>

    `;

}


/* =====================================================
   STATUS BADGE
===================================================== */

function statusBadge(status) {

    const value =
        String(
            status ||
            "success"
        )
            .toLowerCase();


    const failed =
        value === "failed";


    return `

        <span
            class="status-badge ${
                failed
                    ? "failed"
                    : "success"
            }"
        >

            <span class="status-dot"></span>

            ${
                failed
                    ? "Failed"
                    : "Success"
            }

        </span>

    `;

}


/* =====================================================
   RENDER TABLE
===================================================== */

function renderLogs(logs) {

    const tbody =
        document.getElementById(
            "logsTableBody"
        );


    if (!tbody) {
        return;
    }


    if (!logs.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading-row"
                >

                    <i class="fa-regular fa-folder-open"></i>

                    No activity logs found.

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        logs.map(
            (log, index) => {

                const user =
                    log.user || {};


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

                            <div class="user-cell">

                                <div
                                    class="user-avatar-small"
                                >
                                    ${safe(
                                        user.initial ||
                                        initial(user.name)
                                    )}
                                </div>


                                <div class="user-info">

                                    <strong>
                                        ${safe(
                                            user.name ||
                                            "Unknown User"
                                        )}
                                    </strong>

                                    <small>
                                        ${safe(
                                            user.email ||
                                            "—"
                                        )}
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${activityBadge(log)}
                        </td>


                        <td>
                            ${safe(
                                log.description ||
                                "—"
                            )}
                        </td>


                        <td>
                            ${safe(
                                log.ipAddress ||
                                "Not recorded"
                            )}
                        </td>


                        <td>
                            ${safe(
                                log.formattedDate ||
                                formatDate(log.date)
                            )}
                        </td>


                        <td>
                            ${statusBadge(
                                log.status
                            )}
                        </td>


                        <td>

                            <button
                                type="button"
                                class="view-button"
                                data-id="${safe(
                                    log._id
                                )}"
                                title="View details"
                            >

                                <i
                                    class="fa-solid fa-eye"
                                ></i>

                            </button>

                        </td>

                    </tr>

                `;

            }
        )
        .join("");


    document
        .querySelectorAll(
            ".view-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.id;

                        openDetails(
                            id
                        );

                    }
                );

            }
        );

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(date) {

    if (!date) {
        return "—";
    }


    return new Date(date)
        .toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );

}


/* =====================================================
   PAGINATION
===================================================== */

function renderPagination(data) {

    const container =
        document.getElementById(
            "pagination"
        );


    const info =
        document.getElementById(
            "paginationInfo"
        );


    if (!container) {
        return;
    }


    const page =
        Number(
            data.page || 1
        );


    const total =
        Number(
            data.total || 0
        );


    const totalPages =
        Number(
            data.totalPages || 1
        );


    const start =
        total === 0
            ? 0
            : (
                (page - 1) *
                pageLimit
            ) + 1;


    const end =
        Math.min(
            page * pageLimit,
            total
        );


    if (info) {

        info.textContent =
            `Showing ${start} to ${end} of ${formatNumber(total)} logs`;

    }


    container.innerHTML = "";


    const previous =
        document.createElement(
            "button"
        );


    previous.className =
        "page-button";


    previous.innerHTML =
        `<i class="fa-solid fa-chevron-left"></i>`;


    previous.disabled =
        page <= 1;


    previous.addEventListener(
        "click",
        () => {

            if (page > 1) {

                currentPage =
                    page - 1;

                loadLogs();

            }

        }
    );


    container.appendChild(
        previous
    );


    const maxButtons = 5;


    let startPage =
        Math.max(
            1,
            page -
            Math.floor(
                maxButtons / 2
            )
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxButtons -
            1
        );


    if (
        endPage -
        startPage +
        1 <
        maxButtons
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxButtons +
                1
            );

    }


    for (
        let i = startPage;
        i <= endPage;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "page-button" +
            (
                i === page
                    ? " active"
                    : ""
            );


        button.textContent =
            i;


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    i;

                loadLogs();

            }
        );


        container.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.className =
        "page-button";


    next.innerHTML =
        `<i class="fa-solid fa-chevron-right"></i>`;


    next.disabled =
        page >= totalPages;


    next.addEventListener(
        "click",
        () => {

            if (
                page <
                totalPages
            ) {

                currentPage =
                    page + 1;

                loadLogs();

            }

        }
    );


    container.appendChild(
        next
    );

}


/* =====================================================
   DETAILS
===================================================== */

function openDetails(id) {

    const log =
        allCurrentLogs.find(
            item =>
                String(
                    item._id
                ) ===
                String(id)
        );


    if (!log) {
        return;
    }


    const modal =
        document.getElementById(
            "detailsModal"
        );


    const content =
        document.getElementById(
            "detailsContent"
        );


    if (!modal || !content) {
        return;
    }


    const user =
        log.user || {};


    const metadata =
        log.metadata || {};


    content.innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <span>Activity Type</span>

                <strong>
                    ${safe(
                        log.activityType ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>Status</span>

                <strong>
                    ${
                        String(
                            log.status ||
                            "success"
                        ).toUpperCase()
                    }
                </strong>

            </div>


            <div class="detail-item">

                <span>User</span>

                <strong>
                    ${safe(
                        user.name ||
                        "Unknown"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>Email</span>

                <strong>
                    ${safe(
                        user.email ||
                        "—"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>IP Address</span>

                <strong>
                    ${safe(
                        log.ipAddress ||
                        "Not recorded"
                    )}
                </strong>

            </div>


            <div class="detail-item">

                <span>Date & Time</span>

                <strong>
                    ${safe(
                        log.formattedDate ||
                        formatDate(log.date)
                    )}
                </strong>

            </div>


            <div class="detail-item full">

                <span>Description</span>

                <strong>
                    ${safe(
                        log.description ||
                        "—"
                    )}
                </strong>

            </div>


            ${
                Object.keys(metadata).length
                    ? `

                    <div class="detail-item full">

                        <span>Additional Information</span>

                        <strong>
                            ${safe(
                                JSON.stringify(
                                    metadata,
                                    null,
                                    2
                                )
                            )}
                        </strong>

                    </div>

                    `
                    : ""
            }

        </div>

    `;


    modal.classList.add(
        "open"
    );

}


/* =====================================================
   SIDEBAR
   SAME WORKING LOGIC AS SUBSCRIPTIONS
===================================================== */

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

            /* MOBILE */

            if (
                window.innerWidth <=
                900
            ) {

                sidebar.classList.toggle(
                    "open"
                );

                return;

            }


            /* DESKTOP */

            sidebar.classList.toggle(
                "collapsed"
            );


            document.body.classList.toggle(
                "sidebar-collapsed"
            );

        }
    );

}


/* =====================================================
   PROFILE DROPDOWN
===================================================== */

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


/* =====================================================
   SEARCH
===================================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "logSearch"
        );


    if (!search) {
        return;
    }


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

                        loadLogs();

                    },
                    350
                );

        }
    );

}


/* =====================================================
   FILTERS
===================================================== */

function setupFilters() {

    [
        "userFilter",
        "activityFilter",
        "statusFilter",
        "startDate",
        "endDate"
    ]
        .forEach(
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

                        if (
                            id ===
                            "activityFilter"
                        ) {

                            currentCategory =
                                element.value;

                            document
                                .querySelectorAll(
                                    ".activity-tab"
                                )
                                .forEach(
                                    tab => {

                                        tab.classList.toggle(
                                            "active",
                                            tab.dataset.category ===
                                            currentCategory
                                        );

                                    }
                                );

                        }


                        currentPage =
                            1;

                        loadLogs();

                    }
                );

            }
        );

}


/* =====================================================
   TABS
===================================================== */

function setupTabs() {

    document
        .querySelectorAll(
            ".activity-tab"
        )
        .forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".activity-tab"
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


                        currentCategory =
                            tab.dataset.category ||
                            "";


                        const activityFilter =
                            document.getElementById(
                                "activityFilter"
                            );


                        if (
                            activityFilter
                        ) {

                            activityFilter.value =
                                currentCategory;

                        }


                        currentPage =
                            1;

                        loadLogs();

                    }
                );

            }
        );

}


/* =====================================================
   RESET
===================================================== */

function setupReset() {

    const button =
        document.getElementById(
            "resetButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const ids = [
                "logSearch",
                "userFilter",
                "activityFilter",
                "statusFilter",
                "startDate",
                "endDate"
            ];


            ids.forEach(
                id => {

                    const element =
                        document.getElementById(
                            id
                        );


                    if (!element) {
                        return;
                    }


                    if (
                        element.tagName ===
                        "SELECT"
                    ) {

                        element.value =
                            "";

                    }
                    else {

                        element.value =
                            "";

                    }

                }
            );


            currentCategory =
                "";


            currentPage =
                1;


            document
                .querySelectorAll(
                    ".activity-tab"
                )
                .forEach(
                    tab => {

                        tab.classList.toggle(
                            "active",
                            tab.dataset.category ===
                            ""
                        );

                    }
                );


            loadLogs();

        }
    );

}

/* =====================================================
   DATE DEFAULT
===================================================== */

function setupDateRange() {

    const dateRange =
        getElement("dateRange");

    const activityRange =
        getElement("activityRange");


    /* =========================================
       MAIN DATE RANGE
    ========================================= */

    if (dateRange) {

        dateRange.addEventListener(
            "change",
            function () {

                const days =
                    Number(this.value);

                if (activityRange) {

                    activityRange.value =
                        String(days);

                }

                loadDashboard(days);

            }
        );

    }


    /* =========================================
       ACTIVITY DATE RANGE
    ========================================= */

    if (activityRange) {

        activityRange.addEventListener(
            "change",
            function () {

                const days =
                    Number(this.value);

                if (dateRange) {

                    dateRange.value =
                        String(days);

                }

                loadDashboard(days);

            }
        );

    }

}


function toDateInput(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}

function formatDateRange(
    startDate,
    endDate
) {

    const options = {
        month: "short",
        day: "numeric",
        year: "numeric"
    };


    return (
        startDate.toLocaleDateString(
            "en-US",
            options
        ) +
        " - " +
        endDate.toLocaleDateString(
            "en-US",
            options
        )
    );

}

/* =====================================================
   EXPORT CSV
===================================================== */

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
        async () => {

            try {

                const search =
                    document.getElementById(
                        "logSearch"
                    )?.value
                    .trim() || "";


                const userId =
                    document.getElementById(
                        "userFilter"
                    )?.value || "";


                const status =
                    document.getElementById(
                        "statusFilter"
                    )?.value || "";


                const start =
                    document.getElementById(
                        "startDate"
                    )?.value || "";


                const end =
                    document.getElementById(
                        "endDate"
                    )?.value || "";


                const params =
                    new URLSearchParams();


                params.set(
                    "page",
                    1
                );


                params.set(
                    "limit",
                    5000
                );


                if (search)
                    params.set(
                        "search",
                        search
                    );


                if (userId)
                    params.set(
                        "userId",
                        userId
                    );


                if (status)
                    params.set(
                        "status",
                        status
                    );


                if (currentCategory)
                    params.set(
                        "category",
                        currentCategory
                    );


                if (start)
                    params.set(
                        "start",
                        start
                    );


                if (end)
                    params.set(
                        "end",
                        end
                    );


                const response =
                    await fetch(
                        `${API}/admin/activity-logs?${params.toString()}`,
                        {
                            headers:
                                authHeaders()
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
                        "Export failed"
                    );

                }


                const logs =
                    result.logs || [];


                if (!logs.length) {

                    alert(
                        "No activity logs available for export."
                    );

                    return;

                }


                const rows = [];


                rows.push([
                    "No",
                    "User",
                    "Email",
                    "Activity Type",
                    "Category",
                    "Description",
                    "IP Address",
                    "Date & Time",
                    "Status"
                ]);


                logs.forEach(
                    (log, index) => {

                        rows.push([
                            index + 1,

                            log.user?.name ||
                            "Unknown",

                            log.user?.email ||
                            "",

                            log.activityType ||
                            "",

                            log.category ||
                            "",

                            log.description ||
                            "",

                            log.ipAddress ||
                            "Not recorded",

                            log.formattedDate ||
                            formatDate(
                                log.date
                            ),

                            log.status ||
                            "success"

                        ]);

                    }
                );


                const csv =
                    rows
                        .map(
                            row =>
                                row
                                    .map(
                                        value =>
                                            `"${String(
                                                value
                                            )
                                                .replaceAll(
                                                    '"',
                                                    '""'
                                                )}"`
                                    )
                                    .join(",")
                        )
                        .join("\n");


                const blob =
                    new Blob(
                        [csv],
                        {
                            type:
                                "text/csv;charset=utf-8;"
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
                    `calcura-activity-logs-${toDateInput(new Date())}.csv`;


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );

            }
            catch (error) {

                console.error(
                    "Export error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to export logs."
                );

            }

        }
    );

}


/* =====================================================
   MODAL
===================================================== */

function setupModal() {

    const modal =
        document.getElementById(
            "detailsModal"
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

                modal.classList.remove(
                    "open"
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

                modal.classList.remove(
                    "open"
                );

            }

        }
    );

}


/* =====================================================
   NOTIFICATION
===================================================== */

function setupNotifications() {

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

            alert(
                "Activity Logs are being monitored from the live database."
            );

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    const button =
        document.getElementById(
            "logoutButton"
        );


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

/* =====================================================
   DATE RANGE
===================================================== */

function setupDates() {

    const selector =
        document.getElementById(
            "dateSelector"
        );

    const button =
        document.getElementById(
            "dateRangeButton"
        );

    const dropdown =
        document.getElementById(
            "calendarDropdown"
        );

    const daysContainer =
        document.getElementById(
            "calendarDays"
        );

    const monthTitle =
        document.getElementById(
            "calendarMonth"
        );

    const startInput =
        document.getElementById(
            "startDate"
        );

    const endInput =
        document.getElementById(
            "endDate"
        );

    const rangeText =
        document.getElementById(
            "dateRangeText"
        );

    const prevMonth =
        document.getElementById(
            "prevMonth"
        );

    const nextMonth =
        document.getElementById(
            "nextMonth"
        );

    const clearButton =
        document.getElementById(
            "clearDateRange"
        );

    const applyButton =
        document.getElementById(
            "applyDateRange"
        );


    if (
        !selector ||
        !button ||
        !dropdown ||
        !daysContainer
    ) {
        return;
    }


 let calendarDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
);

    let selectedStart = null;

    let selectedEnd = null;

    /* =========================================
       FORMAT
    ========================================= */

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


    function formatInputDate(date) {

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


    /* =========================================
       RENDER CALENDAR
    ========================================= */

    function renderCalendar() {

        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();


        monthTitle.textContent =
            calendarDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            );


        daysContainer.innerHTML = "";


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        const previousMonthDays =
            new Date(
                year,
                month,
                0
            ).getDate();


        /* Previous month */

        for (
            let i = firstDay - 1;
            i >= 0;
            i--
        ) {

            const day =
                previousMonthDays - i;

            const cell =
                document.createElement(
                    "button"
                );

            cell.type = "button";

            cell.className =
                "calendar-day other-month";

            cell.textContent = day;

            daysContainer.appendChild(
                cell
            );

        }


        /* Current month */

        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const cell =
                document.createElement(
                    "button"
                );

            cell.type = "button";

            cell.className =
                "calendar-day";

            cell.textContent =
                day;


            if (
                selectedStart &&
                date.getTime() ===
                selectedStart.getTime()
            ) {

                cell.classList.add(
                    "selected"
                );

            }


            if (
                selectedEnd &&
                date.getTime() ===
                selectedEnd.getTime()
            ) {

                cell.classList.add(
                    "selected"
                );

            }


            if (
                selectedStart &&
                selectedEnd &&
                date > selectedStart &&
                date < selectedEnd
            ) {

                cell.classList.add(
                    "in-range"
                );

            }


            cell.addEventListener(
                "click",
                () => {

                    if (
                        !selectedStart ||
                        selectedEnd
                    ) {

                        selectedStart =
                            date;

                        selectedEnd =
                            null;

                    }
                    else if (
                        date < selectedStart
                    ) {

                        selectedEnd =
                            selectedStart;

                        selectedStart =
                            date;

                    }
                    else {

                        selectedEnd =
                            date;

                    }


                    renderCalendar();

                }
            );


            daysContainer.appendChild(
                cell
            );

        }


        /* Next month empty cells */

        const totalCells =
            firstDay +
            daysInMonth;

        const remaining =
            42 - totalCells;


        for (
            let i = 1;
            i <= remaining;
            i++
        ) {

            const cell =
                document.createElement(
                    "button"
                );

            cell.type = "button";

            cell.className =
                "calendar-day other-month";

            cell.textContent = i;

            daysContainer.appendChild(
                cell
            );

        }

    }


    /* =========================================
       OPEN / CLOSE
    ========================================= */

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            selector.classList.toggle(
                "open"
            );

            if (
                selector.classList.contains(
                    "open"
                )
            ) {

                renderCalendar();

            }

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !selector.contains(
                    event.target
                )
            ) {

                selector.classList.remove(
                    "open"
                );

            }

        }
    );


    /* =========================================
       MONTH NAVIGATION
    ========================================= */

    prevMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );


    nextMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );


    /* =========================================
       CLEAR
    ========================================= */

    clearButton.addEventListener(
        "click",
        () => {

            selectedStart = null;
            selectedEnd = null;

            startInput.value = "";
            endInput.value = "";

            rangeText.textContent =
                "Select date range";

            renderCalendar();

        }
    );


    /* =========================================
       APPLY
    ========================================= */

    applyButton.addEventListener(
        "click",
        () => {

            if (
                !selectedStart ||
                !selectedEnd
            ) {

                return;

            }


            startInput.value =
                formatInputDate(
                    selectedStart
                );

            endInput.value =
                formatInputDate(
                    selectedEnd
                );


            rangeText.textContent =
                formatDisplayDate(
                    selectedStart
                ) +
                " - " +
                formatDisplayDate(
                    selectedEnd
                );


            selector.classList.remove(
                "open"
            );


            currentPage = 1;

            loadLogs();

        }
    );


  /* =========================================
   DEFAULT: CURRENT MONTH
========================================= */

const now = new Date();

selectedStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
);

selectedEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
);

startInput.value =
    formatInputDate(selectedStart);

endInput.value =
    formatInputDate(selectedEnd);

rangeText.textContent =
    formatDisplayDate(selectedStart) +
    " - " +
    formatDisplayDate(selectedEnd);

/* =====================================================
   INIT
===================================================== */

    applyButton.addEventListener(
        "click",
        () => {

            if (
                !selectedStart ||
                !selectedEnd
            ) {
                return;
            }

            startInput.value =
                formatInputDate(selectedStart);

            endInput.value =
                formatInputDate(selectedEnd);

            rangeText.textContent =
                formatDisplayDate(selectedStart) +
                " - " +
                formatDisplayDate(selectedEnd);

            selector.classList.remove("open");

            currentPage = 1;

            loadLogs();

        }
    );

 } 


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        setupSidebar();
        setupProfile();
        setupSearch();
        setupFilters();
        setupTabs();
        setupReset();
        setupDates();
        setupExport();
        setupModal();
        setupNotifications();
        setupLogout();

        await loadAdminProfile();
        await loadUserFilter();
        await loadLogs();

    }
);