/* =========================================================
   CALCURA ADMIN - USERS MANAGEMENT
   REAL MONGODB DATA
========================================================= */

"use strict";


/* =========================================================
   API
========================================================= */

const API_BASE =
    "http://localhost:5000/api/admin/users";

const TOKEN_KEY =
    "calcuraToken";


/* =========================================================
   STATE
========================================================= */

let currentPage = 1;

let totalPages = 1;

let totalUsers = 0;

let pageSize = 10;

let selectionMode = false;

let selectedUsers = new Set();

let usersCache = [];

let searchTimer = null;

let toastTimer = null;

let deleteTargetId = null;


/* =========================================================
   TOKEN / HEADERS
========================================================= */

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function getHeaders(includeJson = false) {

    const headers = {};

    const token =
        getToken();

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    if (includeJson) {

        headers["Content-Type"] =
            "application/json";

    }

    return headers;
}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   INITIAL
========================================================= */

function getInitial(
    name,
    email
) {

    const text =
        name ||
        email ||
        "U";

    return text
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* =========================================================
   DATE
========================================================= */

function formatDate(dateValue) {

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
   TIME AGO
========================================================= */

function timeAgo(dateValue) {

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

    const seconds =
        Math.floor(
            (
                Date.now() -
                date.getTime()
            ) / 1000
        );

    if (seconds < 60) {

        return `${Math.max(
            seconds,
            1
        )} sec ago`;

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
            hours > 1 ? "s" : ""
        } ago`;

    }

    const days =
        Math.floor(
            hours / 24
        );

    if (days < 30) {

        return `${days} day${
            days > 1 ? "s" : ""
        } ago`;

    }

    return formatDate(
        dateValue
    );

}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const elements = {};


function cacheElements() {

    elements.tableBody =
        document.querySelector(
            "#usersTableBody"
        );

    elements.search =
        document.querySelector(
            "#userSearch"
        );

    elements.roleFilter =
        document.querySelector(
            "#roleFilter"
        );

    elements.planFilter =
        document.querySelector(
            "#planFilter"
        );

    elements.statusFilter =
        document.querySelector(
            "#statusFilter"
        );

    elements.registrationDate =
        document.querySelector(
            "#registrationDate"
        );

    elements.reset =
        document.querySelector(
            "#resetFilters"
        );

    elements.selectUser =
        document.querySelector(
            "#selectUserBtn"
        );

    elements.bulkBar =
        document.querySelector(
            "#bulkActionBar"
        );

    elements.selectedCount =
        document.querySelector(
            "#selectedCount"
        );

    elements.selectAll =
        document.querySelector(
            "#selectAllUsers"
        );

    elements.pagination =
        document.querySelector(
            "#paginationControls"
        );

    elements.paginationInfo =
        document.querySelector(
            "#paginationInfo"
        );

    elements.prevPage =
        document.querySelector(
            "#previousPage"
        );

    elements.nextPage =
        document.querySelector(
            "#nextPage"
        );

    elements.totalUsers =
        document.querySelector(
            "#totalUsers"
        );

    elements.activeUsers =
        document.querySelector(
            "#activeUsers"
        );

    elements.inactiveUsers =
        document.querySelector(
            "#inactiveUsers"
        );

    elements.premiumUsers =
        document.querySelector(
            "#premiumUsers"
        );

    elements.globalSearch =
        document.querySelector(
            "#globalSearch"
        );

    elements.sidebarToggle =
        document.querySelector(
            "#sidebarToggle"
        );

    elements.sidebar =
        document.querySelector(
            "#adminSidebar"
        );

    elements.modal =
    document.querySelector(
        "#userDetailsModal"
    );

elements.modalOverlay =
    document.querySelector(
        "#userDetailsModal .modal-overlay"
    );

elements.modalClose =
    document.querySelector(
        "#closeUserDetails"
    );
    elements.confirmModal =
        document.querySelector(
            "#confirmModal"
        );

elements.confirmCancel =
    document.querySelector(
        "#cancelConfirm"
    );

elements.confirmDelete =
    document.querySelector(
        "#confirmAction"
    );
    elements.toast =
        document.querySelector(
            "#adminToast"
        );

    elements.toastMessage =
        document.querySelector(
            "#toastMessage"
        );

}


/* =========================================================
   LOAD USERS
========================================================= */

async function loadUsers() {

    if (!elements.tableBody) {

        return;

    }

    showLoading();


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


    const search =
        elements.search?.value.trim() ||
        "";

    const role =
        elements.roleFilter?.value ||
        "all";

    const plan =
        elements.planFilter?.value ||
        "all";

    const status =
        elements.statusFilter?.value ||
        "all";

    const registrationDate =
        elements.registrationDate?.value ||
        "";


    if (search) {

        params.set(
            "search",
            search
        );

    }


    if (
        role &&
        role !== "all"
    ) {

        params.set(
            "role",
            role
        );

    }


    if (
        plan &&
        plan !== "all"
    ) {

        params.set(
            "plan",
            plan
        );

    }


    if (
        status &&
        status !== "all"
    ) {

        params.set(
            "status",
            status
        );

    }


    if (registrationDate) {

        params.set(
            "registrationDate",
            registrationDate
        );

    }


    try {

        const response =
            await fetch(
                `${API_BASE}?${params.toString()}`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (
            response.status ===
            401
        ) {

            showToast(
                "Please login again.",
                "error"
            );

            return;

        }


        if (
            response.status ===
            403
        ) {

            showToast(
                "Admin access required.",
                "error"
            );

            return;

        }


        const data =
            await response.json();


        if (
            !response.ok ||
            data.success === false
        ) {

            throw new Error(
                data.message ||
                "Unable to load users"
            );

        }


        usersCache =
            Array.isArray(
                data.users
            )
                ? data.users
                : [];


        totalUsers =
            Number(
                data.pagination?.total ??
                data.totalUsers ??
                data.total ??
                usersCache.length
            );


        totalPages =
            Number(
                data.pagination?.pages ??
                data.pagination?.totalPages ??
                data.totalPages ??
                Math.max(
                    1,
                    Math.ceil(
                        totalUsers /
                        pageSize
                    )
                )
            );


        currentPage =
            Number(
                data.pagination?.page ??
                data.currentPage ??
                currentPage
            );


        renderUsers();

        updateStats(data);

        renderPagination();


    }
    catch (error) {

        console.error(
            "Admin users error:",
            error
        );

        showError(
            error.message ||
            "Failed to load users"
        );

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    elements.tableBody.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="loading-cell"
            >
                <i
                    class="fa-solid
                    fa-spinner
                    fa-spin"
                ></i>

                Loading users
                from MongoDB...
            </td>
        </tr>
    `;

}


function showError(message) {

    elements.tableBody.innerHTML = `
        <tr>
            <td
                colspan="10"
                class="empty-cell"
            >
                <i
                    class="fa-solid
                    fa-triangle-exclamation"
                ></i>

                ${escapeHTML(message)}

            </td>
        </tr>
    `;

}


/* =========================================================
   RENDER USERS
========================================================= */

function renderUsers() {

    if (
        !usersCache.length
    ) {

        elements.tableBody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    class="empty-cell"
                >
                    <i
                        class="fa-solid
                        fa-users-slash"
                    ></i>

                    No users found.

                </td>
            </tr>
        `;

        updateCheckboxVisibility();

        updateSelectedCount();

        return;

    }


    elements.tableBody.innerHTML =
        usersCache
            .map(
                (
                    user,
                    index
                ) =>
                    createUserRow(
                        user,
                        index
                    )
            )
            .join("");


    updateCheckboxVisibility();

    updateSelectedCount();

    updateSelectAllState();

}


/* =========================================================
   USER ROW
========================================================= */

function createUserRow(
    user,
    index
) {

    const id =
        user._id ||
        user.id;

    const name =
        user.name ||
        user.username ||
        "Unknown User";

    const email =
        user.email ||
        "—";


    const role =
        String(
            user.role ||
            "user"
        ).toLowerCase();


    const plan =
        String(
            user.plan ||
            "free"
        ).toLowerCase();


    const statusValue =
        user.status ||
        user.accountStatus ||
        user.subscriptionStatus ||
        "inactive";


    const status =
        String(
            statusValue
        ).toLowerCase();


    const active =
        status === "active";


    const checked =
        selectedUsers.has(
            String(id)
        )
            ? "checked"
            : "";


    const roleClass =
        role === "admin"
            ? "role-admin"
            : "role-user";


    let planClass =
        "plan-free";


    if (plan === "pro") {

        planClass =
            "plan-pro";

    }


    if (plan === "student") {

        planClass =
            "plan-student";

    }


    const statusClass =
        active
            ? "status-active"
            : "status-inactive";


    return `

        <tr
            data-user-id="${escapeHTML(id)}"
        >

            <td
                class="checkbox-column"
            >

                <input
                    type="checkbox"
                    class="user-checkbox"
                    data-user-id="${escapeHTML(id)}"
                    ${checked}
                >

            </td>


            <td>

                ${
                    (
                        (currentPage - 1)
                        * pageSize
                    )
                    + index
                    + 1
                }

            </td>


            <td>

                <div
                    class="user-cell"
                >

                    <div
                        class="user-avatar"
                    >
                        ${escapeHTML(
                            getInitial(
                                name,
                                email
                            )
                        )}
                    </div>


                    <div
                        class="user-name"
                    >

                        <strong>
                            ${escapeHTML(name)}
                        </strong>

                        <small>
                            ${escapeHTML(
                                user.fullName ||
                                name
                            )}
                        </small>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(email)}
            </td>


            <td>

                <span
                    class="role-badge
                    ${roleClass}"
                >

                    ${escapeHTML(
                        role
                            .charAt(0)
                            .toUpperCase()
                        +
                        role.slice(1)
                    )}

                </span>

            </td>


            <td>

                <span
                    class="plan-badge
                    ${planClass}"
                >

                    ${escapeHTML(
                        plan
                            .charAt(0)
                            .toUpperCase()
                        +
                        plan.slice(1)
                    )}

                </span>

            </td>


            <td>

                <span
                    class="status-badge
                    ${statusClass}"
                >

                    ${active
                        ? "Active"
                        : "Inactive"}

                </span>

            </td>


            <td>

                ${formatDate(
                    user.createdAt ||
                    user.registeredAt
                )}

            </td>


            <td>

                ${timeAgo(
                    user.lastActive ||
                    user.updatedAt ||
                    user.createdAt
                )}

            </td>


            <td>

                <div
                    class="action-buttons"
                >

                    <button
                        class="action-btn
                        action-view"
                        title="View Details"
                        data-action="view"
                        data-id="${escapeHTML(id)}"
                    >
                        <i
                            class="fa-solid
                            fa-eye"
                        ></i>
                    </button>


                    <button
                        class="action-btn
                        action-edit"
                        title="Edit User"
                        data-action="edit"
                        data-id="${escapeHTML(id)}"
                    >
                        <i
                            class="fa-solid
                            fa-pen"
                        ></i>
                    </button>


                    <button
                        class="action-btn
                        action-role"
                        title="Change Role"
                        data-action="role"
                        data-id="${escapeHTML(id)}"
                    >
                        <i
                            class="fa-solid
                            fa-user-group"
                        ></i>
                    </button>


                    <button
                        class="action-btn
                        action-status"
                        title="${
                            active
                                ? "Deactivate User"
                                : "Activate User"
                        }"
                        data-action="${
                            active
                                ? "deactivate"
                                : "activate"
                        }"
                        data-id="${escapeHTML(id)}"
                    >

                        <i
                            class="fa-solid ${
                                active
                                    ? "fa-lock"
                                    : "fa-unlock"
                            }"
                        ></i>

                    </button>


                    <button
                        class="action-btn
                        action-delete"
                        title="Delete User"
                        data-action="delete"
                        data-id="${escapeHTML(id)}"
                    >

                        <i
                            class="fa-solid
                            fa-trash"
                        ></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   STATISTICS
========================================================= */

function updateStats(data) {

    const stats =
        data.stats ||
        data.statistics ||
        {};


    const total =
        stats.totalUsers ??
        data.totalUsers ??
        totalUsers;


    const active =
        stats.activeUsers ??
        data.activeUsers ??
        0;


    const inactive =
        stats.inactiveUsers ??
        data.inactiveUsers ??
        0;


    const premium =
        stats.premiumUsers ??
        data.premiumUsers ??
        0;


    if (elements.totalUsers) {

        elements.totalUsers.textContent =
            Number(
                total || 0
            ).toLocaleString();

    }


    if (elements.activeUsers) {

        elements.activeUsers.textContent =
            Number(
                active || 0
            ).toLocaleString();

    }


    if (elements.inactiveUsers) {

        elements.inactiveUsers.textContent =
            Number(
                inactive || 0
            ).toLocaleString();

    }


    if (elements.premiumUsers) {

        elements.premiumUsers.textContent =
            Number(
                premium || 0
            ).toLocaleString();

    }

}


/* =========================================================
   SELECT USER MODE
========================================================= */

function toggleSelectionMode() {

    selectionMode =
        !selectionMode;


    if (elements.selectUser) {

        elements.selectUser.classList.toggle(
            "selection-active",
            selectionMode
        );


        elements.selectUser.innerHTML =
            selectionMode

                ? `
                    <i
                        class="fa-solid
                        fa-xmark"
                    ></i>

                    Hide Selection
                  `

                : `
                    <i
                        class="fa-solid
                        fa-users"
                    ></i>

                    Select User
                  `;

    }


    if (!selectionMode) {

        selectedUsers.clear();

        if (elements.selectAll) {

            elements.selectAll.checked =
                false;

        }

    }


    updateCheckboxVisibility();

    updateSelectedCount();

}


/* =========================================================
   CHECKBOX VISIBILITY
========================================================= */

function updateCheckboxVisibility() {

    document
        .querySelectorAll(
            ".checkbox-column"
        )
        .forEach(
            column => {

                column.hidden =
                    !selectionMode;

            }
        );


    document
        .querySelectorAll(
            ".user-checkbox"
        )
        .forEach(
            checkbox => {

                const td =
                    checkbox.closest(
                        "td"
                    );

                if (td) {

                    td.hidden =
                        !selectionMode;

                }

            }
        );


    if (elements.selectAll) {

        const th =
            elements.selectAll.closest(
                "th"
            );

        if (th) {

            th.hidden =
                !selectionMode;

        }

    }


    if (elements.bulkBar) {

        elements.bulkBar.hidden =
            !selectionMode;

    }

}


/* =========================================================
   SINGLE CHECKBOX
========================================================= */

function handleUserCheckbox(
    event
) {

    const checkbox =
        event.target.closest(
            ".user-checkbox"
        );


    if (!checkbox) {

        return;

    }


    const id =
        String(
            checkbox.dataset.userId
        );


    if (checkbox.checked) {

        selectedUsers.add(id);

    }
    else {

        selectedUsers.delete(id);

    }


    updateSelectedCount();

    updateSelectAllState();

}


/* =========================================================
   SELECT ALL
========================================================= */

function toggleSelectAll() {

    if (!elements.selectAll) {

        return;

    }


    const checkboxes =
        document.querySelectorAll(
            ".user-checkbox"
        );


    checkboxes.forEach(
        checkbox => {

            checkbox.checked =
                elements.selectAll.checked;


            const id =
                String(
                    checkbox.dataset.userId
                );


            if (checkbox.checked) {

                selectedUsers.add(id);

            }
            else {

                selectedUsers.delete(id);

            }

        }
    );


    updateSelectedCount();

}


/* =========================================================
   SELECT ALL STATE
========================================================= */

function updateSelectAllState() {

    if (!elements.selectAll) {

        return;

    }


    const checkboxes =
        [
            ...document.querySelectorAll(
                ".user-checkbox"
            )
        ];


    if (!checkboxes.length) {

        elements.selectAll.checked =
            false;

        return;

    }


    elements.selectAll.checked =
        checkboxes.every(
            checkbox =>
                checkbox.checked
        );

}


/* =========================================================
   SELECTED COUNT
========================================================= */

function updateSelectedCount() {

    if (
        elements.selectedCount
    ) {

        elements.selectedCount.textContent =
            selectedUsers.size;

    }

}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination() {

    if (!elements.pagination) {

        return;

    }


    elements.pagination.innerHTML =
        "";


    const previous =
        document.createElement(
            "button"
        );


    previous.className =
        "page-btn";


    previous.innerHTML =
        `
            <i
                class="fa-solid
                fa-chevron-left"
            ></i>
        `;


    previous.disabled =
        currentPage <= 1;


    previous.addEventListener(
        "click",
        () => {

            if (
                currentPage > 1
            ) {

                currentPage--;

                selectedUsers.clear();

                loadUsers();

            }

        }
    );


    elements.pagination.appendChild(
        previous
    );


    const maxVisible = 5;


    let startPage =
        Math.max(
            1,
            currentPage - 2
        );


    let endPage =
        Math.min(
            totalPages,
            startPage +
            maxVisible -
            1
        );


    if (
        endPage -
        startPage +
        1 <
        maxVisible
    ) {

        startPage =
            Math.max(
                1,
                endPage -
                maxVisible +
                1
            );

    }


    for (
        let page = startPage;
        page <= endPage;
        page++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "page-btn";


        if (
            page === currentPage
        ) {

            button.classList.add(
                "active"
            );

        }


        button.textContent =
            page;


        button.addEventListener(
            "click",
            () => {

                currentPage =
                    page;

                selectedUsers.clear();

                loadUsers();

            }
        );


        elements.pagination.appendChild(
            button
        );

    }


    const next =
        document.createElement(
            "button"
        );


    next.className =
        "page-btn";


    next.innerHTML =
        `
            <i
                class="fa-solid
                fa-chevron-right"
            ></i>
        `;


    next.disabled =
        currentPage >=
        totalPages;


    next.addEventListener(
        "click",
        () => {

            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                selectedUsers.clear();

                loadUsers();

            }

        }
    );


    elements.pagination.appendChild(
        next
    );


    if (
        elements.paginationInfo
    ) {

        const first =
            totalUsers === 0
                ? 0
                : (
                    (currentPage - 1)
                    * pageSize
                ) + 1;


        const last =
            Math.min(
                currentPage *
                pageSize,
                totalUsers
            );


        elements.paginationInfo.innerHTML =
            `
                Showing
                <strong>
                    ${first}
                </strong>

                to

                <strong>
                    ${last}
                </strong>

                of

                <strong>
                    ${totalUsers.toLocaleString()}
                </strong>

                users
            `;

    }

}


/* =========================================================
   VIEW USER
========================================================= */

async function viewUser(id) {

    try {

        const response =
    await fetch(
        `${API_BASE}/${id}?_t=${Date.now()}`,
        {
            method: "GET",
            cache: "no-store",
            headers: {
                ...getHeaders(),
                "Cache-Control": "no-cache"
            }
        }
    );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load user"
            );

        }


        const user =
            data.user ||
            data.data ||
            data;


        openUserModal(user);

    }
    catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to load user",
            "error"
        );

    }

}


/* =========================================================
   USER MODAL
========================================================= */

function openUserModal(user) {

    if (!elements.modal) {
        return;
    }

    const name =
        user.name ||
        "Unknown User";

    const email =
        user.email ||
        "—";

    const avatar =
        document.querySelector(
            "#detailsAvatar"
        );

    const nameElement =
        document.querySelector(
            "#detailsName"
        );

    const emailElement =
        document.querySelector(
            "#detailsEmail"
        );

    const roleElement =
        document.querySelector(
            "#detailsRole"
        );

    const planElement =
        document.querySelector(
            "#detailsPlan"
        );

    const statusElement =
        document.querySelector(
            "#detailsStatus"
        );

    const registeredElement =
        document.querySelector(
            "#detailsRegistered"
        );

    const subscriptionElement =
        document.querySelector(
            "#detailsSubscription"
        );

    const paymentElement =
        document.querySelector(
            "#detailsPayment"
        );


    if (avatar) {

        avatar.textContent =
            getInitial(
                name,
                email
            );

    }


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    if (emailElement) {

        emailElement.textContent =
            email;

    }


    if (roleElement) {

        roleElement.textContent =
            user.role ||
            "user";

    }


    if (planElement) {

        planElement.textContent =
            user.plan ||
            "free";

    }


    if (statusElement) {

        statusElement.textContent =
            user.status ||
            "inactive";

    }


    if (registeredElement) {

        registeredElement.textContent =
            formatDate(
                user.createdAt
            );

    }


    if (subscriptionElement) {

        subscriptionElement.textContent =
            user.subscriptionStatus ||
            "inactive";

    }


    if (paymentElement) {

        paymentElement.textContent =
            user.paymentId ||
            "—";

    }


    elements.modal.hidden =
        false;

}


function closeUserModal() {

    if (elements.modal) {

        elements.modal.hidden =
            true;

    }

}


/* =========================================================
   UPDATE USER
========================================================= */

async function updateUser(
    id,
    body
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/${id}`,
                {
                    method: "PUT",

                    headers:
                        getHeaders(true),

                    body:
                        JSON.stringify(body)
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update user"
            );

        }


        showToast(
            data.message ||
            "User updated successfully"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Update failed",
            "error"
        );

    }

}


/* =========================================================
   ACTIVATE USER
========================================================= */

async function activateUser(id) {

    await updateUser(
        id,
        {
            subscriptionStatus:
                "active"
        }
    );

}


/* =========================================================
   DEACTIVATE USER
========================================================= */

async function deactivateUser(id) {

    await updateUser(
        id,
        {
            subscriptionStatus:
                "inactive"
        }
    );

}


/* =========================================================
   CHANGE ROLE
========================================================= */

async function changeRole(id) {

    const user =
        usersCache.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (!user) {

        return;

    }


    const currentRole =
        user.role ||
        "user";


    const newRole =
        currentRole === "admin"
            ? "user"
            : "admin";


    const confirmChange =
        confirm(
            `Change this user's role from ${currentRole} to ${newRole}?`
        );


    if (!confirmChange) {

        return;

    }


    await updateUser(
        id,
        {
            role: newRole
        }
    );

}


/* =========================================================
   EDIT USER
========================================================= */

async function editUser(id) {

    const user =
        usersCache.find(
            item =>
                String(
                    item._id ||
                    item.id
                ) ===
                String(id)
        );


    if (!user) {

        return;

    }


    const name =
        prompt(
            "Enter user name:",
            user.name || ""
        );


    if (name === null) {

        return;

    }


    const email =
        prompt(
            "Enter user email:",
            user.email || ""
        );


    if (email === null) {

        return;

    }


    await updateUser(
        id,
        {
            name: name.trim(),
            email: email.trim()
        }
    );

}


/* =========================================================
   DELETE USER
========================================================= */

function requestDelete(id) {

    deleteTargetId =
        id;


    if (
        elements.confirmModal
    ) {

        elements.confirmModal.hidden =
            false;

    }
    else {

        const ok =
            confirm(
                "Are you sure you want to delete this user?"
            );


        if (ok) {

            deleteUser(id);

        }

    }

}


async function deleteUser(id) {

    try {

        const response =
            await fetch(
                `${API_BASE}/${id}`,
                {
                    method: "DELETE",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to delete user"
            );

        }


        selectedUsers.delete(
            String(id)
        );


        showToast(
            data.message ||
            "User deleted successfully"
        );


        await loadUsers();

    }
    catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Delete failed",
            "error"
        );

    }

}


/* =========================================================
   BULK ACTIVATE
========================================================= */

async function bulkActivate() {

    if (
        !selectedUsers.size
    ) {

        showToast(
            "Select at least one user.",
            "error"
        );

        return;

    }


    const ids =
        [...selectedUsers];


    for (
        const id of ids
    ) {

        await updateUser(
            id,
            {
                subscriptionStatus:
                    "active"
            }
        );

    }


    selectedUsers.clear();

    await loadUsers();

}


/* =========================================================
   BULK DEACTIVATE
========================================================= */

async function bulkDeactivate() {

    if (
        !selectedUsers.size
    ) {

        showToast(
            "Select at least one user.",
            "error"
        );

        return;

    }


    const ids =
        [...selectedUsers];


    for (
        const id of ids
    ) {

        await updateUser(
            id,
            {
                subscriptionStatus:
                    "inactive"
            }
        );

    }


    selectedUsers.clear();

    await loadUsers();

}


/* =========================================================
   BULK DELETE
========================================================= */

async function bulkDelete() {

    if (
        !selectedUsers.size
    ) {

        showToast(
            "Select at least one user.",
            "error"
        );

        return;

    }


    const ok =
        confirm(
            `Delete ${selectedUsers.size} selected user(s)?`
        );


    if (!ok) {

        return;

    }


    const ids =
        [...selectedUsers];


    for (
        const id of ids
    ) {

        try {

            await fetch(
                `${API_BASE}/${id}`,
                {
                    method: "DELETE",
                    headers: getHeaders()
                }
            );

        }
        catch (error) {

            console.error(
                "Bulk delete error:",
                error
            );

        }

    }


    selectedUsers.clear();

    await loadUsers();

}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function handleActionClick(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const action = button.dataset.action;
    const id = button.dataset.id;

    if (!action || !id) {
        console.error("Action or User ID missing:", {
            action,
            id
        });
        return;
    }

    console.log("User action:", action, "User ID:", id);

    switch (action) {

        case "view":
            viewUser(id);
            break;

        case "edit":
            editUser(id);
            break;

        case "role":
            changeRole(id);
            break;

        case "activate":
            activateUser(id);
            break;

        case "deactivate":
            deactivateUser(id);
            break;

        case "delete":
            requestDelete(id);
            break;

        default:
            console.warn("Unknown user action:", action);
    }
}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    elements.search?.addEventListener(
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

                        loadUsers();

                    },
                    350
                );

        }
    );


    elements.roleFilter?.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            loadUsers();

        }
    );


    elements.planFilter?.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            loadUsers();

        }
    );


    elements.statusFilter?.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            loadUsers();

        }
    );


    elements.registrationDate?.addEventListener(
        "change",
        () => {

            currentPage =
                1;

            loadUsers();

        }
    );


    elements.reset?.addEventListener(
        "click",
        () => {

            if (
                elements.search
            ) {

                elements.search.value =
                    "";

            }


            if (
                elements.roleFilter
            ) {

                elements.roleFilter.value =
                    "all";

            }


            if (
                elements.planFilter
            ) {

                elements.planFilter.value =
                    "all";

            }


            if (
                elements.statusFilter
            ) {

                elements.statusFilter.value =
                    "all";

            }


            if (
                elements.registrationDate
            ) {

                elements.registrationDate.value =
                    "";

            }


            currentPage =
                1;


            selectedUsers.clear();


            loadUsers();

        }
    );

}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function setupGlobalSearch() {

    elements.globalSearch?.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            const query =
                event.target.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                return;

            }


            if (
                query.includes("user")
                ||
                query.includes("users")
            ) {

                window.location.href =
                    "users.html";

                return;

            }


            if (
                query.includes("calculation")
                ||
                query.includes("calculations")
            ) {

                window.location.href =
                    "calculations.html";

                return;

            }


            if (
                query.includes("formula")
                ||
                query.includes("formulas")
            ) {

                window.location.href =
                    "formula-library.html";

                return;

            }


            if (
                query.includes("subscription")
                ||
                query.includes("plan")
            ) {

                window.location.href =
                    "subscriptions.html";

                return;

            }


            if (
                query.includes("report")
            ) {

                window.location.href =
                    "reports.html";

                return;

            }


            if (
                query.includes("activity")
                ||
                query.includes("logs")
            ) {

                window.location.href =
                    "activity-logs.html";

                return;

            }


            if (
                query.includes("setting")
            ) {

                window.location.href =
                    "system-settings.html";

                return;

            }


            if (
                query.includes("website")
                ||
                query.includes("content")
            ) {

                window.location.href =
                    "website-content.html";

                return;

            }


            showToast(
                "No admin page found for this search.",
                "error"
            );

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

        console.error(
            "Calcura: sidebar elements not found."
        );

        return;

    }


    toggle.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (
                window.innerWidth >
                900
            ) {

                sidebar.classList.toggle(
                    "collapsed"
                );


                const collapsed =
                    sidebar.classList.contains(
                        "collapsed"
                    );


                localStorage.setItem(
                    "calcuraAdminSidebar",
                    collapsed
                        ? "collapsed"
                        : "open"
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

        const savedState =
            localStorage.getItem(
                "calcuraAdminSidebar"
            );


        if (
            savedState ===
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


                const savedState =
                    localStorage.getItem(
                        "calcuraAdminSidebar"
                    );


                if (
                    savedState ===
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
   LOAD LOGGED-IN ADMIN
   THIS IS THE IMPORTANT FIX
========================================================= */

async function loadLoggedInAdminProfile() {

    const token =
        localStorage.getItem(
            "calcuraToken"
        );


    if (!token) {

        console.warn(
            "Calcura token not found."
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
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {

            console.error(
                "Could not load logged-in admin."
            );

            return;

        }


        const data =
            await response.json();


        const user =
            data.user;


        if (!user) {

            return;

        }


        /* =========================================
           REAL ADMIN NAME
        ========================================= */

        const adminName =
            document.getElementById(
                "adminName"
            );


        if (adminName) {

            adminName.textContent =
                user.name ||
                "Admin";

        }


        /* =========================================
           REAL ADMIN AVATAR
        ========================================= */

        const adminAvatar =
            document.getElementById(
                "adminAvatar"
            );


        if (adminAvatar) {

            const name =
                user.name ||
                "Admin";


            adminAvatar.textContent =
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }


        /* =========================================
           ADMIN ROLE
        ========================================= */

        const adminRole =
            document.getElementById(
                "adminRole"
            );


        if (adminRole) {

            adminRole.textContent =
                user.role === "admin"
                    ? "Administrator"
                    : "User";

        }


        console.log(
            "Logged-in admin:",
            user.name
        );

    }
    catch (error) {

        console.error(
            "Admin profile loading error:",
            error
        );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "success"
) {

    if (
        !elements.toast ||
        !elements.toastMessage
    ) {

        return;

    }


    elements.toastMessage.textContent =
        message;


    const icon =
        elements.toast.querySelector(
            "i"
        );


    if (icon) {

        icon.className =
            type === "error"

                ? "fa-solid fa-circle-exclamation"

                : "fa-solid fa-circle-check";

    }


    elements.toast.hidden =
        false;


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                elements.toast.hidden =
                    true;

            },
            3000
        );

}


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

    elements.modalClose?.addEventListener(
        "click",
        closeUserModal
    );


    elements.modalOverlay?.addEventListener(
        "click",
        closeUserModal
    );


    elements.confirmCancel?.addEventListener(
        "click",
        () => {

            deleteTargetId =
                null;


            if (
                elements.confirmModal
            ) {

                elements.confirmModal.hidden =
                    true;

            }

        }
    );


    elements.confirmDelete?.addEventListener(
        "click",
        async () => {

            const id =
                deleteTargetId;


            deleteTargetId =
                null;


            if (
                elements.confirmModal
            ) {

                elements.confirmModal.hidden =
                    true;

            }


            if (id) {

                await deleteUser(id);

            }

        }
    );

}


/* =========================================================
   BULK BUTTONS
========================================================= */

function setupBulkActions() {

    document
        .querySelector(
            "#bulkActivate"
        )
        ?.addEventListener(
            "click",
            bulkActivate
        );


    document
        .querySelector(
            "#bulkDeactivate"
        )
        ?.addEventListener(
            "click",
            bulkDeactivate
        );


    document
        .querySelector(
            "#bulkDelete"
        )
        ?.addEventListener(
            "click",
            bulkDelete
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* -----------------------------------------
           CACHE ELEMENTS
        ----------------------------------------- */

        cacheElements();


        /* -----------------------------------------
           FILTERS
        ----------------------------------------- */

        setupFilters();


        /* -----------------------------------------
           GLOBAL SEARCH
        ----------------------------------------- */

        setupGlobalSearch();


        /* -----------------------------------------
           SIDEBAR
        ----------------------------------------- */

        setupSidebar();


        /* -----------------------------------------
           MODALS
        ----------------------------------------- */

        setupModals();


        /* -----------------------------------------
           BULK ACTIONS
        ----------------------------------------- */

        setupBulkActions();


        /* -----------------------------------------
           SELECT USER
        ----------------------------------------- */

        elements.selectUser?.addEventListener(
            "click",
            toggleSelectionMode
        );


        /* -----------------------------------------
           SELECT ALL
        ----------------------------------------- */

        elements.selectAll?.addEventListener(
            "change",
            toggleSelectAll
        );


        /* -----------------------------------------
           USER CHECKBOX
        ----------------------------------------- */

        elements.tableBody?.addEventListener(
            "change",
            handleUserCheckbox
        );


        /* -----------------------------------------
           ACTION BUTTONS
        ----------------------------------------- */

        elements.tableBody?.addEventListener(
            "click",
            handleActionClick
        );


        /* -----------------------------------------
           LOAD REAL LOGGED-IN ADMIN
        ----------------------------------------- */

        await loadLoggedInAdminProfile();


        /* -----------------------------------------
           LOAD USERS
        ----------------------------------------- */

        await loadUsers();

    }
);