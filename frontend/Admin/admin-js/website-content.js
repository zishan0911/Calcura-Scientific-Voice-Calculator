/* =========================================================
   CALCURA ADMIN - WEBSITE CONTENT
========================================================= */

const API_BASE = "http://localhost:5000/api";

const token =
    localStorage.getItem("calcuraToken");


// =========================================================
// GLOBAL STATE
// =========================================================

let currentPage = 1;
let totalPages = 1;

let currentSection = "";
let currentSearch = "";
let currentStatus = "";

let editingContentId = null;

let contentCache = [];


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializePage();

    }
);


// =========================================================
// INITIALIZE
// =========================================================

async function initializePage() {

    if (!token) {

        window.location.href =
            "../../login.html";

        return;
    }

    setupSidebar();

    setupProfileDropdown();

    setupNotifications();

    setupSectionTabs();

    setupFilters();

    setupPagination();

    setupModal();

    setupGlobalSearch();

    await loadAdminProfile();

    await loadWebsiteContent();

}


// =========================================================
// API HEADERS
// =========================================================

function getHeaders() {

    return {
        "Content-Type":
            "application/json",

        "Authorization":
            "Bearer " + token
    };

}


// =========================================================
// SIDEBAR
// =========================================================

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


// =========================================================
// ADMIN PROFILE
// =========================================================

async function loadAdminProfile() {

    try {

        const response =
            await fetch(
                `${API_BASE}/auth/me`,
                {
                    method: "GET",
                    headers:
                        getHeaders()
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data
        ) {
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
            getInitial(name);


        const adminName =
            document.getElementById(
                "adminName"
            );

        const adminAvatar =
            document.getElementById(
                "adminAvatar"
            );

        const dropdownName =
            document.getElementById(
                "dropdownName"
            );

        const dropdownAvatar =
            document.getElementById(
                "dropdownAvatar"
            );

        const dropdownRole =
            document.getElementById(
                "dropdownRole"
            );


        if (adminName) {
            adminName.textContent =
                name;
        }

        if (adminAvatar) {
            adminAvatar.textContent =
                initial;
        }

        if (dropdownName) {
            dropdownName.textContent =
                name;
        }

        if (dropdownAvatar) {
            dropdownAvatar.textContent =
                initial;
        }

        if (dropdownRole) {
            dropdownRole.textContent =
                role;
        }

    } catch (error) {

        console.error(
            "ADMIN PROFILE ERROR:",
            error
        );

    }

}


// =========================================================
// INITIAL
// =========================================================

function getInitial(name) {

    return String(name)
        .trim()
        .charAt(0)
        .toUpperCase() || "A";

}


// =========================================================
// PROFILE DROPDOWN
// =========================================================

function setupProfileDropdown() {

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
        (event) => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        (event) => {

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


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutAdmin
        );

    }

}


// =========================================================
// LOGOUT
// =========================================================

function logoutAdmin() {

    localStorage.removeItem(
        "calcuraToken"
    );

    localStorage.removeItem(
        "calcuraUser"
    );

    window.location.href =
        "../../login.html";

}


// =========================================================
// NOTIFICATIONS
// =========================================================

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
                "No new notifications."
            );

        }
    );

}


// =========================================================
// SECTION TABS
// =========================================================

function setupSectionTabs() {

    const tabs =
        document.querySelectorAll(
            ".section-tab"
        );

    tabs.forEach(
        (tab) => {

            tab.addEventListener(
                "click",
                () => {

                    tabs.forEach(
                        (item) => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );

                    tab.classList.add(
                        "active"
                    );

                    currentSection =
                        tab.dataset.section ||
                        "";

                    const sectionFilter =
                        document.getElementById(
                            "sectionFilter"
                        );

                    if (sectionFilter) {

                        sectionFilter.value =
                            currentSection;

                    }

                    currentPage = 1;

                    loadWebsiteContent();

                }
            );

        }
    );

}


// =========================================================
// FILTERS
// =========================================================

function setupFilters() {

    const search =
        document.getElementById(
            "pageSearch"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );

    const section =
        document.getElementById(
            "sectionFilter"
        );

    const reset =
        document.getElementById(
            "resetButton"
        );


    if (search) {

        let timer;

        search.addEventListener(
            "input",
            () => {

                clearTimeout(timer);

                timer =
                    setTimeout(
                        () => {

                            currentSearch =
                                search.value.trim();

                            currentPage =
                                1;

                            loadWebsiteContent();

                        },
                        350
                    );

            }
        );

    }


    if (status) {

        status.addEventListener(
            "change",
            () => {

                currentStatus =
                    status.value;

                currentPage =
                    1;

                loadWebsiteContent();

            }
        );

    }


    if (section) {

        section.addEventListener(
            "change",
            () => {

                currentSection =
                    section.value;

                currentPage =
                    1;

                updateActiveSectionTab();

                loadWebsiteContent();

            }
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            resetFilters
        );

    }

}


// =========================================================
// RESET FILTERS
// =========================================================

function resetFilters() {

    currentPage = 1;

    currentSearch = "";

    currentSection = "";

    currentStatus = "";


    const search =
        document.getElementById(
            "pageSearch"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );

    const section =
        document.getElementById(
            "sectionFilter"
        );


    if (search) {
        search.value = "";
    }

    if (status) {
        status.value = "";
    }

    if (section) {
        section.value = "";
    }


    updateActiveSectionTab();

    loadWebsiteContent();

}


// =========================================================
// ACTIVE TAB
// =========================================================

function updateActiveSectionTab() {

    const tabs =
        document.querySelectorAll(
            ".section-tab"
        );

    tabs.forEach(
        (tab) => {

            const value =
                tab.dataset.section ||
                "";

            tab.classList.toggle(
                "active",
                value ===
                currentSection
            );

        }
    );

}


// =========================================================
// LOAD WEBSITE CONTENT
// =========================================================

async function loadWebsiteContent() {

    const tableBody =
        document.getElementById(
            "pagesTableBody"
        );

    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="loading-row"
                >
                    <i
                        class="fa-solid fa-spinner fa-spin"
                    ></i>
                    Loading website content...
                </td>
            </tr>
        `;

    }


    try {

        const params =
            new URLSearchParams();

        params.set(
            "page",
            currentPage
        );

        params.set(
            "limit",
            10
        );


        if (currentSearch) {

            params.set(
                "search",
                currentSearch
            );

        }


        if (currentSection) {

            params.set(
                "section",
                currentSection
            );

        }


        if (currentStatus) {

            params.set(
                "status",
                currentStatus
            );

        }


        const response =
            await fetch(
                `${API_BASE}/admin/website-content?${params.toString()}`,
                {
                    method: "GET",
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load website content."
            );

        }


        const records =
            data.data || [];

        contentCache =
            records;


        renderTable(
            records
        );


        updatePagination(
            data.pagination
        );


        updateStats(
            records,
            data.pagination
        );


    } catch (error) {

        console.error(
            "LOAD WEBSITE CONTENT ERROR:",
            error
        );

        renderError(
            error.message
        );

    }

}


// =========================================================
// RENDER TABLE
// =========================================================

function renderTable(records) {

    const tableBody =
        document.getElementById(
            "pagesTableBody"
        );

    if (!tableBody) {
        return;
    }


    if (!records.length) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-row"
                >
                    <i
                        class="fa-solid fa-file-circle-xmark"
                    ></i>

                    <span>
                        No website content found.
                    </span>
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML =
        records
            .map(
                (item, index) => {

                    const number =
                        (
                            (currentPage - 1) *
                            10
                        ) +
                        index +
                        1;


                    return `
                        <tr>

                            <td>
                                ${number}
                            </td>

                            <td>
                                <div class="page-title-cell">

                                    <strong>
                                        ${escapeHTML(
                                            item.pageTitle ||
                                            "Untitled"
                                        )}
                                    </strong>

                                </div>
                            </td>

                            <td>
                                <span
                                    class="section-badge"
                                >
                                    ${escapeHTML(
                                        item.section ||
                                        "Other"
                                    )}
                                </span>
                            </td>

                            <td>
                                <span
                                    class="slug-text"
                                >
                                    /${escapeHTML(
                                        item.slug ||
                                        ""
                                    )}
                                </span>
                            </td>

                            <td>
                                <span
                                    class="status-badge ${
                                        item.status ===
                                        "Published"
                                            ? "published"
                                            : "draft"
                                    }"
                                >
                                    ${escapeHTML(
                                        item.status ||
                                        "Draft"
                                    )}
                                </span>
                            </td>

                            <td>
                                ${formatDate(
                                    item.updatedAt
                                )}
                            </td>

                            <td>
                                ${Number(
                                    item.views || 0
                                ).toLocaleString()}
                            </td>

                            <td>

                                <div
                                    class="action-buttons"
                                >

                                    <button
                                        type="button"
                                        class="action-button view"
                                        title="View"
                                        data-action="view"
                                        data-id="${
                                            item._id
                                        }"
                                    >
                                        <i
                                            class="fa-solid fa-eye"
                                        ></i>
                                    </button>

                                    <button
                                        type="button"
                                        class="action-button edit"
                                        title="Edit"
                                        data-action="edit"
                                        data-id="${
                                            item._id
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
                                            item._id
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


    setupTableActions();

}


// =========================================================
// TABLE ACTIONS
// =========================================================

function setupTableActions() {

    const buttons =
        document.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        (button) => {

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

                        viewContent(id);

                    }


                    if (
                        action ===
                        "edit"
                    ) {

                        editContent(id);

                    }


                    if (
                        action ===
                        "delete"
                    ) {

                        deleteContent(id);

                    }

                }
            );

        }
    );

}


// =========================================================
// UPDATE STATS
// =========================================================

function updateStats(
    records,
    pagination
) {

    const totalPagesElement =
        document.getElementById(
            "totalPages"
        );

    const publishedPagesElement =
        document.getElementById(
            "publishedPages"
        );

    const totalViewsElement =
        document.getElementById(
            "totalViews"
        );

    const lastUpdatedElement =
        document.getElementById(
            "lastUpdated"
        );

    const lastUpdatedByElement =
        document.getElementById(
            "lastUpdatedBy"
        );


    /*
       The current GET endpoint returns
       paginated records.

       Therefore total page count comes
       from pagination.totalItems.
    */

    if (totalPagesElement) {

        totalPagesElement.textContent =
            Number(
                pagination?.totalItems || 0
            ).toLocaleString();

    }


    const publishedCount =
        records.filter(
            (item) =>
                item.status ===
                "Published"
        ).length;


    if (publishedPagesElement) {

        publishedPagesElement.textContent =
            publishedCount;

    }


    const views =
        records.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item.views || 0
                    )
                );

            },
            0
        );


    if (totalViewsElement) {

        totalViewsElement.textContent =
            views.toLocaleString();

    }


    if (records.length) {

        const latest =
            records.reduce(
                (
                    latestItem,
                    item
                ) => {

                    if (
                        !latestItem
                    ) {
                        return item;
                    }

                    return new Date(
                        item.updatedAt
                    ) >
                    new Date(
                        latestItem.updatedAt
                    )
                        ? item
                        : latestItem;

                },
                null
            );


        if (lastUpdatedElement) {

    lastUpdatedElement.textContent =
        formatDate(
            latest.updatedAt
        );

}


        if (lastUpdatedElement) {

            lastUpdatedElement.textContent =
                formatDate(
                    latest.updatedAt
                );

        }


        if (
            lastUpdatedByElement
        ) {

            const updater =
                latest.lastUpdatedBy;

            lastUpdatedByElement.textContent =
                updater?.name ||
                updater?.email ||
                "Admin";

        }

    } else {

        if (lastUpdatedElement) {
            lastUpdatedElement.textContent =
                "—";
        }

        if (
            lastUpdatedByElement
        ) {
            lastUpdatedByElement.textContent =
                "No update recorded";
        }

    }

}


// =========================================================
// PAGINATION
// =========================================================

function setupPagination() {

    const previous =
        document.getElementById(
            "previousPage"
        );

    const next =
        document.getElementById(
            "nextPage"
        );


    if (previous) {

        previous.addEventListener(
            "click",
            () => {

                if (
                    currentPage >
                    1
                ) {

                    currentPage--;

                    loadWebsiteContent();

                }

            }
        );

    }


    if (next) {

        next.addEventListener(
            "click",
            () => {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    loadWebsiteContent();

                }

            }
        );

    }

}


// =========================================================
// UPDATE PAGINATION UI
// =========================================================

function updatePagination(
    pagination
) {

    totalPages =
        Number(
            pagination?.totalPages || 1
        );


    const previous =
        document.getElementById(
            "previousPage"
        );

    const next =
        document.getElementById(
            "nextPage"
        );

    const current =
        document.getElementById(
            "currentPage"
        );

    const showing =
        document.getElementById(
            "showingText"
        );


    if (previous) {

        previous.disabled =
            currentPage <= 1;

    }


    if (next) {

        next.disabled =
            currentPage >=
            totalPages;

    }


    if (current) {

        current.textContent =
            currentPage;

    }


    if (showing) {

        const totalItems =
            Number(
                pagination?.totalItems ||
                0
            );

        const limit =
            Number(
                pagination?.limit ||
                10
            );

        const start =
            totalItems === 0
                ? 0
                : (
                    (currentPage - 1) *
                    limit
                ) + 1;

        const end =
            Math.min(
                currentPage * limit,
                totalItems
            );


        showing.textContent =
            totalItems === 0
                ? "Showing 0 pages"
                : `Showing ${start}-${end} of ${totalItems} pages`;

    }

}


// =========================================================
// MODAL SETUP
// =========================================================

function setupModal() {

    const addButton =
        document.getElementById(
            "addContentButton"
        );

    const closeButton =
        document.getElementById(
            "closeModal"
        );

    const cancelButton =
        document.getElementById(
            "cancelModal"
        );

    const form =
        document.getElementById(
            "contentForm"
        );

    const closeView =
        document.getElementById(
            "closeViewModal"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeEditModal
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            saveContent
        );

    }


    if (closeView) {

        closeView.addEventListener(
            "click",
            closeViewModal
        );

    }


    const contentModal =
        document.getElementById(
            "contentModal"
        );

    const viewModal =
        document.getElementById(
            "viewModal"
        );


    if (contentModal) {

        contentModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    contentModal
                ) {

                    closeEditModal();

                }

            }
        );

    }


    if (viewModal) {

        viewModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    viewModal
                ) {

                    closeViewModal();

                }

            }
        );

    }

}


// =========================================================
// OPEN ADD MODAL
// =========================================================

function openAddModal() {

    editingContentId =
        null;


    const modal =
        document.getElementById(
            "contentModal"
        );

    const title =
        document.getElementById(
            "modalTitle"
        );

    const id =
        document.getElementById(
            "contentId"
        );

    const pageTitle =
        document.getElementById(
            "contentTitle"
        );

    const slug =
        document.getElementById(
            "contentSlug"
        );

    const section =
        document.getElementById(
            "contentSection"
        );

    const status =
        document.getElementById(
            "contentStatus"
        );

    const body =
        document.getElementById(
            "contentBody"
        );


    if (title) {
        title.textContent =
            "Add New Content";
    }

    if (id) {
        id.value = "";
    }

    if (pageTitle) {
        pageTitle.value = "";
    }

    if (slug) {
        slug.value = "";
    }

    if (section) {
        section.value =
            "Home";
    }

    if (status) {
        status.value =
            "Published";
    }

    if (body) {
        body.value = "";
    }


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


// =========================================================
// EDIT CONTENT
// =========================================================

async function editContent(id) {

    try {

        const response =
            await fetch(
                `${API_BASE}/admin/website-content/${id}`,
                {
                    method: "GET",
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load content."
            );

        }


        const item =
            data.data;


        editingContentId =
            item._id;


        const modal =
            document.getElementById(
                "contentModal"
            );

        const title =
            document.getElementById(
                "modalTitle"
            );

        const contentId =
            document.getElementById(
                "contentId"
            );

        const pageTitle =
            document.getElementById(
                "contentTitle"
            );

        const slug =
            document.getElementById(
                "contentSlug"
            );

        const section =
            document.getElementById(
                "contentSection"
            );

        const status =
            document.getElementById(
                "contentStatus"
            );

        const body =
            document.getElementById(
                "contentBody"
            );


        if (title) {
            title.textContent =
                "Edit Content";
        }

        if (contentId) {
            contentId.value =
                item._id;
        }

        if (pageTitle) {
            pageTitle.value =
                item.pageTitle ||
                "";
        }

        if (slug) {
            slug.value =
                item.slug ||
                "";
        }

        if (section) {
            section.value =
                item.section ||
                "Home";
        }

        if (status) {
            status.value =
                item.status ||
                "Published";
        }

        if (body) {

            body.value =
                getContentText(
                    item.content
                );

        }


        if (modal) {

            modal.classList.add(
                "show"
            );

        }

    } catch (error) {

        console.error(
            "EDIT CONTENT ERROR:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// SAVE CONTENT
// =========================================================

async function saveContent(
    event
) {

    event.preventDefault();


    const pageTitle =
        document.getElementById(
            "contentTitle"
        )?.value.trim();


    const slug =
        document.getElementById(
            "contentSlug"
        )?.value.trim();


    const section =
        document.getElementById(
            "contentSection"
        )?.value;


    const status =
        document.getElementById(
            "contentStatus"
        )?.value;


    const body =
        document.getElementById(
            "contentBody"
        )?.value || "";


    if (
        !pageTitle ||
        !slug ||
        !section
    ) {

        alert(
            "Please fill all required fields."
        );

        return;
    }


    const payload = {

        pageTitle,

        slug,

        section,

        status,

        content: {
            body
        }

    };


    try {

        const isEdit =
            Boolean(
                editingContentId
            );


        const url =
            isEdit
                ? `${API_BASE}/admin/website-content/${editingContentId}`
                : `${API_BASE}/admin/website-content`;


        const response =
            await fetch(
                url,
                {
                    method:
                        isEdit
                            ? "PUT"
                            : "POST",

                    headers:
                        getHeaders(),

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
                "Failed to save website content."
            );

        }


        closeEditModal();


        await loadWebsiteContent();


        alert(
            isEdit
                ? "Website content updated successfully."
                : "Website content created successfully."
        );


    } catch (error) {

        console.error(
            "SAVE CONTENT ERROR:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// VIEW CONTENT
// =========================================================

async function viewContent(id) {

    try {

        const response =
            await fetch(
                `${API_BASE}/admin/website-content/${id}`,
                {
                    method: "GET",
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load content."
            );

        }


        const item =
            data.data;


        const title =
            document.getElementById(
                "viewTitle"
            );

        const slug =
            document.getElementById(
                "viewSlug"
            );

        const preview =
            document.getElementById(
                "pagePreview"
            );

        const modal =
            document.getElementById(
                "viewModal"
            );


        if (title) {

            title.textContent =
                item.pageTitle ||
                "Page";

        }


        if (slug) {

            slug.textContent =
                "/" +
                (
                    item.slug ||
                    ""
                );

        }


        if (preview) {

            const text =
                getContentText(
                    item.content
                );


            preview.innerHTML = `
                <div class="preview-meta">

                    <span>
                        Section:
                        <strong>
                            ${escapeHTML(
                                item.section ||
                                ""
                            )}
                        </strong>
                    </span>

                    <span>
                        Status:
                        <strong>
                            ${escapeHTML(
                                item.status ||
                                ""
                            )}
                        </strong>
                    </span>

                    <span>
                        Views:
                        <strong>
                            ${Number(
                                item.views || 0
                            ).toLocaleString()}
                        </strong>
                    </span>

                </div>

                <div class="preview-content">
                    ${escapeHTML(
                        text
                    ).replace(
                        /\n/g,
                        "<br>"
                    )}
                </div>
            `;

        }


        if (modal) {

            modal.classList.add(
                "show"
            );

        }

    } catch (error) {

        console.error(
            "VIEW CONTENT ERROR:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// DELETE CONTENT
// =========================================================

async function deleteContent(id) {

    const item =
        contentCache.find(
            (content) =>
                content._id === id
        );


    const pageName =
        item?.pageTitle ||
        "this page";


    const confirmed =
        confirm(
            `Are you sure you want to delete "${pageName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/admin/website-content/${id}`,
                {
                    method: "DELETE",
                    headers:
                        getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete content."
            );

        }


        await loadWebsiteContent();


        alert(
            "Website content deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE CONTENT ERROR:",
            error
        );

        alert(
            error.message
        );

    }

}


// =========================================================
// CLOSE EDIT MODAL
// =========================================================

function closeEditModal() {

    const modal =
        document.getElementById(
            "contentModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

    editingContentId =
        null;

}


// =========================================================
// CLOSE VIEW MODAL
// =========================================================

function closeViewModal() {

    const modal =
        document.getElementById(
            "viewModal"
        );

    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


// =========================================================
// CONTENT TEXT
// =========================================================

function getContentText(
    content
) {

    if (
        content === null ||
        content === undefined
    ) {

        return "";

    }


    if (
        typeof content ===
        "string"
    ) {

        return content;

    }


    if (
        typeof content ===
        "object"
    ) {

        if (
            typeof content.body ===
            "string"
        ) {

            return content.body;

        }


        try {

            return JSON.stringify(
                content,
                null,
                2
            );

        } catch (
            error
        ) {

            return "";

        }

    }


    return String(
        content
    );

}


// =========================================================
// GLOBAL SEARCH
// =========================================================

function setupGlobalSearch() {

    const input =
        document.getElementById(
            "globalSearch"
        );

    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }


            const value =
                input.value.trim();


            if (!value) {
                return;
            }


            const searchable =
                value.toLowerCase();


            const page =
                contentCache.find(
                    (item) => {

                        return (
                            String(
                                item.pageTitle ||
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchable
                                ) ||

                            String(
                                item.slug ||
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchable
                                ) ||

                            String(
                                item.section ||
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchable
                                )
                        );

                    }
                );


            if (page) {

                viewContent(
                    page._id
                );

                return;

            }


            currentSearch =
                value;

            currentPage =
                1;

            const pageSearch =
                document.getElementById(
                    "pageSearch"
                );

            if (pageSearch) {

                pageSearch.value =
                    value;

            }

            loadWebsiteContent();

        }
    );

}


// =========================================================
// ERROR
// =========================================================

function renderError(
    message
) {

    const tableBody =
        document.getElementById(
            "pagesTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = `
        <tr>
            <td
                colspan="8"
                class="empty-row"
            >
                <i
                    class="fa-solid fa-triangle-exclamation"
                ></i>

                <span>
                    ${escapeHTML(
                        message ||
                        "Unable to load website content."
                    )}
                </span>
            </td>
        </tr>
    `;

}


// =========================================================
// DATE FORMAT
// =========================================================

function formatDate(
    value
) {

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


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================================
// HTML ESCAPE
// =========================================================

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