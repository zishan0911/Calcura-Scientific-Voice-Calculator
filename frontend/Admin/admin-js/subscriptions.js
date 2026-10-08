/* =========================================================
   CALCURA ADMIN - SUBSCRIPTION PLANS
   REAL API / MONGODB DATA
========================================================= */

const API_BASE =
    "http://localhost:5000/api/admin/subscriptions";

const TOKEN_KEY = "calcuraToken";

let allPlans = [];
let filteredPlans = [];
let currentPage = 1;

const ITEMS_PER_PAGE = 5;

let editingPlanId = null;


/* =========================================================
   AUTH
========================================================= */

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function authHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",
        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})
    };
}


/* =========================================================
   DOM
========================================================= */

const totalPlans =
    document.getElementById("totalPlans");

const activePlans =
    document.getElementById("activePlans");

const totalSubscribers =
    document.getElementById("totalSubscribers");

const monthlyRevenue =
    document.getElementById("monthlyRevenue");

const planSearch =
    document.getElementById("planSearch");

const planStatusFilter =
    document.getElementById("planStatusFilter");

const resetPlanFilters =
    document.getElementById("resetPlanFilters");

const plansTableBody =
    document.getElementById("plansTableBody");

const previousPage =
    document.getElementById("previousPage");

const nextPage =
    document.getElementById("nextPage");

const currentPageElement =
    document.getElementById("currentPage");

const plansShowingText =
    document.getElementById("plansShowingText");

const planFeaturesGrid =
    document.getElementById("planFeaturesGrid");

const planDetailsGrid =
    document.getElementById("planDetailsGrid");


/* =========================================================
   MODALS
========================================================= */

const viewPlanModal =
    document.getElementById("viewPlanModal");

const planEditorModal =
    document.getElementById("planEditorModal");

const planId =
    document.getElementById("planId");

const planName =
    document.getElementById("planName");

const planSlug =
    document.getElementById("planSlug");

const planPrice =
    document.getElementById("planPrice");

const planCurrency =
    document.getElementById("planCurrency");

const planDuration =
    document.getElementById("planDuration");

const planStatus =
    document.getElementById("planStatus");

const planIcon =
    document.getElementById("planIcon");

const planDescription =
    document.getElementById("planDescription");

const razorpayPlanId =
    document.getElementById("razorpayPlanId");

const featureEditor =
    document.getElementById("featureEditor");

const addFeatureButton =
    document.getElementById("addFeatureButton");

const savePlanButton =
    document.getElementById("savePlanButton");


/* =========================================================
   TOAST
========================================================= */

function showToast(message, type = "success") {

    let toast =
        document.getElementById("calcuraToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "calcuraToast";

        toast.className =
            "calcura-toast";

        document.body.appendChild(toast);
    }

    toast.className =
        `calcura-toast ${type}`;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,
                headers: {
                    ...authHeaders(),
                    ...(options.headers || {})
                }
            }
        );

    let data = {};

    try {
        data =
            await response.json();
    }
    catch {
        data = {};
    }

    if (!response.ok) {

        throw new Error(
            data.message ||
            `Request failed (${response.status})`
        );
    }

    return data;
}


/* =========================================================
   LOAD SUBSCRIPTIONS
========================================================= */

async function loadSubscriptions() {

    try {

        showTableLoading();

        const params =
            new URLSearchParams();

        const search =
            planSearch
                ? planSearch.value.trim()
                : "";

        const status =
            planStatusFilter
                ? planStatusFilter.value
                : "all";

        if (search) {
            params.set(
                "search",
                search
            );
        }

        if (status) {
            params.set(
                "status",
                status
            );
        }

        const data =
            await apiRequest(
                `${API_BASE}?${params.toString()}`
            );

        allPlans =
            Array.isArray(data.plans)
                ? data.plans
                : [];

        filteredPlans =
            [...allPlans];

        currentPage = 1;

        renderStats(
            data.stats || {}
        );

        renderPlans();

        renderPlanFeatures();

        renderPlanDetails();

    }
    catch (error) {

        console.error(
            "Subscription Load Error:",
            error
        );

        allPlans = [];
        filteredPlans = [];

        renderStats({});

        renderPlans();

        renderPlanFeatures();

        renderPlanDetails();

        showToast(
            error.message ||
            "Failed to load subscription plans",
            "error"
        );
    }
}


/* =========================================================
   LOADING TABLE
========================================================= */

function showTableLoading() {

    if (!plansTableBody) {
        return;
    }

    plansTableBody.innerHTML = `
        <tr>
            <td colspan="8"
                style="
                    text-align:center;
                    padding:40px;
                ">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Loading subscription plans...
            </td>
        </tr>
    `;
}


/* =========================================================
   STATS
========================================================= */

function renderStats(stats) {

    if (totalPlans) {

        totalPlans.textContent =
            Number(
                stats.totalPlans || 0
            ).toLocaleString();
    }

    if (activePlans) {

        activePlans.textContent =
            Number(
                stats.activePlans || 0
            ).toLocaleString();
    }

    if (totalSubscribers) {

        totalSubscribers.textContent =
            Number(
                stats.totalSubscribers || 0
            ).toLocaleString();
    }

    if (monthlyRevenue) {

        monthlyRevenue.textContent =
            formatCurrency(
                Number(
                    stats.monthlyRevenue || 0
                )
            );
    }
}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
    amount,
    currency = "USD"
) {

    try {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2
            }
        ).format(amount);

    }
    catch {

        return `$${Number(amount || 0).toLocaleString(
    "en-IN"
)}`;
    }
}


/* =========================================================
   PLAN TABLE
========================================================= */

function renderPlans() {

    if (!plansTableBody) {
        return;
    }

    if (!filteredPlans.length) {

        plansTableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="
                        text-align:center;
                        padding:50px 20px;
                    ">
                    <div>
                        <i
                            class="fa-solid fa-box-open"
                            style="
                                font-size:35px;
                                margin-bottom:12px;
                                opacity:.6;
                            "
                        ></i>

                        <div>
                            No subscription plans found
                        </div>
                    </div>
                </td>
            </tr>
        `;

        updatePagination(0, 0);

        return;
    }

    const totalItems =
        filteredPlans.length;

    const totalPages =
        Math.ceil(
            totalItems /
            ITEMS_PER_PAGE
        );

    if (
        currentPage >
        totalPages
    ) {
        currentPage =
            totalPages;
    }

    const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

    const end =
        start +
        ITEMS_PER_PAGE;

    const pagePlans =
        filteredPlans.slice(
            start,
            end
        );

    plansTableBody.innerHTML =
        pagePlans
            .map(
                plan =>
                    createPlanRow(plan)
            )
            .join("");

    updatePagination(
        start,
        end,
        totalItems
    );
}


/* =========================================================
   PLAN ROW
========================================================= */

function createPlanRow(plan) {

    const id =
        escapeHTML(
            plan.id ||
            plan._id ||
            ""
        );

    const name =
        escapeHTML(
            plan.name ||
            "Unnamed Plan"
        );

    const description =
        escapeHTML(
            plan.description ||
            ""
        );

    const duration =
        escapeHTML(
            plan.duration ||
            "Monthly"
        );

    const currency =
        plan.currency ||
        "INR";

    const status =
        plan.status === "active"
            ? "active"
            : "inactive";

    const subscriberCount =
        Number(
            plan.subscriberCount || 0
        );

    const icon =
        escapeHTML(
            plan.icon ||
            "fa-paper-plane"
        );

    const createdDate =
        formatPlanDate(
            plan.createdAt
        );

    const rowNumber =
        filteredPlans.findIndex(
            item =>
                String(
                    item.id ||
                    item._id
                ) ===
                String(
                    plan.id ||
                    plan._id
                )
        ) + 1;

    return `
        <tr
            data-plan-id="${id}"
        >

            <!-- # -->
            <td>
                ${rowNumber}
            </td>


            <!-- PLAN NAME -->
            <td>

                <div class="plan-name-cell">

                    <div class="plan-table-icon">

                        <i class="
                            fa-solid
                            ${icon}
                        "></i>

                    </div>

                    <div>

                        <strong>
                            ${name}
                        </strong>

                        <small>
                            ${description}
                        </small>

                    </div>

                </div>

            </td>


            <!-- PRICE -->
            <td>

                <strong>
                    ${formatCurrency(
                        Number(
                            plan.price || 0
                        ),
                        currency
                    )}
                </strong>

            </td>


            <!-- DURATION -->
            <td>
                ${duration}
            </td>


            <!-- SUBSCRIBERS -->
            <td>

                <span
                    class="subscriber-count"
                >
                    ${subscriberCount.toLocaleString()}
                </span>

            </td>


            <!-- STATUS -->
            <td>

                <span
                    class="
                        status-badge
                        ${status}
                    "
                >
                    ${
                        status === "active"
                            ? "Active"
                            : "Inactive"
                    }
                </span>

            </td>


            <!-- CREATED ON -->
            <td>
                ${createdDate}
            </td>


            <!-- ACTIONS -->
            <td>

                <div
                    class="table-actions"
                >

                    <button
                        type="button"
                        class="
                            table-action
                            view
                        "
                        title="View Plan"
                        data-action="view"
                        data-id="${id}"
                    >
                        <i
                            class="
                                fa-solid
                                fa-eye
                            "
                        ></i>
                    </button>


                    <button
                        type="button"
                        class="
                            table-action
                            edit
                        "
                        title="Edit Plan"
                        data-action="edit"
                        data-id="${id}"
                    >
                        <i
                            class="
                                fa-solid
                                fa-pen
                            "
                        ></i>
                    </button>


                    <button
                        type="button"
                        class="
                            table-action
                            delete
                        "
                        title="Delete Plan"
                        data-action="delete"
                        data-id="${id}"
                    >
                        <i
                            class="
                                fa-solid
                                fa-trash
                            "
                        ></i>
                    </button>

                </div>

            </td>

        </tr>
    `;
}

function formatPlanDate(value) {

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
   PAGINATION
========================================================= */

function updatePagination(
    start = 0,
    end = 0,
    total = 0
) {

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                ITEMS_PER_PAGE
            )
        );

    if (currentPageElement) {

        currentPageElement.textContent =
            `${currentPage} / ${totalPages}`;
    }

    if (previousPage) {

        previousPage.disabled =
            currentPage <= 1;
    }

    if (nextPage) {

        nextPage.disabled =
            currentPage >= totalPages;
    }

    if (plansShowingText) {

        if (!total) {

            plansShowingText.textContent =
                "Showing 0 plans";

        }
        else {

            const visibleEnd =
                Math.min(
                    end,
                    total
                );

            plansShowingText.textContent =
                `Showing ${start + 1}-${visibleEnd} of ${total} plans`;
        }
    }
}


/* =========================================================
   VIEW PLAN
========================================================= */

async function viewPlan(id) {

    try {

        const data =
            await apiRequest(
                `${API_BASE}/${encodeURIComponent(id)}`
            );

        const plan =
            data.plan;

        if (!plan) {
            throw new Error(
                "Plan data not found"
            );
        }

        fillViewModal(plan);

        openModal(
            viewPlanModal
        );fillViewModal(plan);

if (viewPlanModal) {
    viewPlanModal.dataset.planId =
        String(
            plan.id ||
            plan._id ||
            ""
        );
}

openModal(
    viewPlanModal
);

    }
    catch (error) {

        console.error(
            "View Plan Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to view plan",
            "error"
        );
    }
}


/* =========================================================
   VIEW MODAL
========================================================= */

function fillViewModal(plan) {

    const name =
        document.getElementById(
            "viewPlanName"
        );

    const icon =
        document.getElementById(
            "viewPlanIcon"
        );

    const price =
        document.getElementById(
            "viewPlanPrice"
        );

    const status =
        document.getElementById(
            "viewPlanStatus"
        );

    const description =
        document.getElementById(
            "viewPlanDescription"
        );

    const subscribers =
        document.getElementById(
            "viewPlanSubscribers"
        );

    const duration =
        document.getElementById(
            "viewPlanDuration"
        );

    const features =
        document.getElementById(
            "viewPlanFeatures"
        );

    if (name) {

        name.textContent =
            plan.name || "Unnamed Plan";
    }

    if (icon) {

        icon.innerHTML =
            `<i class="fa-solid ${
                escapeHTML(
                    plan.icon ||
                    "fa-paper-plane"
                )
            }"></i>`;
    }

    if (price) {

        price.textContent =
            formatCurrency(
                Number(plan.price || 0),
                plan.currency || "INR"
            );
    }

    if (status) {

        status.textContent =
            plan.status === "active"
                ? "Active"
                : "Inactive";

        status.className =
            `status-badge ${
                plan.status === "active"
                    ? "active"
                    : "inactive"
            }`;
    }

    if (description) {

        description.textContent =
            plan.description ||
            "No description available.";
    }

    if (subscribers) {

        subscribers.textContent =
            Number(
                plan.subscriberCount || 0
            ).toLocaleString();
    }

    if (duration) {

        duration.textContent =
            plan.duration ||
            "Monthly";
    }

    if (features) {

        const planFeatures =
            Array.isArray(plan.features)
                ? plan.features
                : [];

        if (!planFeatures.length) {

            features.innerHTML =
                `<p>No features added.</p>`;

        }
        else {

            features.innerHTML =
                planFeatures
                    .map(
                        feature => `
                            <div class="
                                view-feature-item
                                ${
                                    feature.included
                                        ? "included"
                                        : "excluded"
                                }
                            ">

                                <i class="
                                    fa-solid
                                    ${
                                        feature.included
                                            ? "fa-check"
                                            : "fa-xmark"
                                    }
                                "></i>

                                <span>
                                    ${escapeHTML(
                                        feature.text || ""
                                    )}
                                </span>

                            </div>
                        `
                    )
                    .join("");
        }
    }
}


/* =========================================================
   ADD PLAN
========================================================= */

function openAddPlanModal() {

    editingPlanId = null;

    if (planId) {
        planId.value = "";
    }

    if (planName) {
        planName.value = "";
    }

    if (planSlug) {
        planSlug.value = "";
    }

    if (planPrice) {
        planPrice.value = "0";
    }

    if (planCurrency) {
    planCurrency.value = "USD";
}

    if (planDuration) {
        planDuration.value = "Monthly";
    }

    if (planStatus) {
        planStatus.value = "active";
    }

    if (planIcon) {
        planIcon.value =
            "fa-paper-plane";
    }

    if (planDescription) {
        planDescription.value = "";
    }

    if (razorpayPlanId) {
        razorpayPlanId.value = "";
    }

    renderFeatureEditor([]);

    updateEditorTitle(
        "Add New Plan"
    );

    openModal(
        planEditorModal
    );
}


/* =========================================================
   EDIT PLAN
========================================================= */

async function editPlan(id) {

    try {

        const data =
            await apiRequest(
                `${API_BASE}/${encodeURIComponent(id)}`
            );

        const plan =
            data.plan;

        if (!plan) {
            throw new Error(
                "Plan data not found"
            );
        }

        editingPlanId =
            plan.id ||
            plan._id;

        if (planId) {
            planId.value =
                editingPlanId;
        }

        if (planName) {
            planName.value =
                plan.name || "";
        }

        if (planSlug) {
            planSlug.value =
                plan.slug || "";
        }

        if (planPrice) {
            planPrice.value =
                Number(
                    plan.price || 0
                );
        }

        if (planCurrency) {
    planCurrency.value =
        plan.currency || "USD";
}

        if (planDuration) {
            planDuration.value =
                plan.duration ||
                "Monthly";
        }

        if (planStatus) {
            planStatus.value =
                plan.status ||
                "active";
        }

        if (planIcon) {
            planIcon.value =
                plan.icon ||
                "fa-paper-plane";
        }

        if (planDescription) {
            planDescription.value =
                plan.description ||
                "";
        }

        if (razorpayPlanId) {
            razorpayPlanId.value =
                plan.razorpayPlanId ||
                "";
        }

        renderFeatureEditor(
            Array.isArray(plan.features)
                ? plan.features
                : []
        );

        updateEditorTitle(
            "Edit Subscription Plan"
        );

        openModal(
            planEditorModal
        );

    }
    catch (error) {

        console.error(
            "Edit Plan Error:",
            error
        );

        showToast(
            error.message ||
            "Unable to edit plan",
            "error"
        );
    }
}


/* =========================================================
   EDITOR TITLE
========================================================= */

function updateEditorTitle(title) {

    const titleElement =
        document.getElementById(
            "planEditorTitle"
        );

    if (titleElement) {
        titleElement.textContent =
            title;
    }
}


/* =========================================================
   FEATURES EDITOR
========================================================= */

function renderFeatureEditor(
    features = []
) {

    if (!featureEditor) {
        return;
    }

    if (!features.length) {

        featureEditor.innerHTML = "";

        addFeatureRow(
            "",
            true
        );

        return;
    }

    featureEditor.innerHTML = "";

    features.forEach(
        feature => {

            addFeatureRow(
                feature.text || "",
                feature.included !== false
            );

        }
    );
}


/* =========================================================
   ADD FEATURE ROW
========================================================= */

function addFeatureRow(
    textValue = "",
    included = true
) {

    if (!featureEditor) {
        return;
    }

    const row =
        document.createElement("div");

    row.className =
        "feature-editor-row";

    row.innerHTML = `

        <label class="feature-check">

            <input
                type="checkbox"
                class="feature-included"
                ${included ? "checked" : ""}
            >

            <span>
                Included
            </span>

        </label>

        <input
            type="text"
            class="feature-text"
            placeholder="Enter plan feature"
            value="${escapeAttribute(
                textValue
            )}"
        >

        <button
            type="button"
            class="remove-feature"
            title="Remove feature"
        >
            <i class="fa-solid fa-trash"></i>
        </button>

    `;

    featureEditor.appendChild(row);
}


/* =========================================================
   COLLECT FEATURES
========================================================= */

function collectFeatures() {

    if (!featureEditor) {
        return [];
    }

    const rows =
        featureEditor.querySelectorAll(
            ".feature-editor-row"
        );

    const features = [];

    rows.forEach(row => {

        const input =
            row.querySelector(
                ".feature-text"
            );

        const checkbox =
            row.querySelector(
                ".feature-included"
            );

        const text =
            input
                ? input.value.trim()
                : "";

        if (!text) {
            return;
        }

        features.push({
            text,
            included:
                checkbox
                    ? checkbox.checked
                    : true
        });
    });

    return features;
}


/* =========================================================
   SAVE PLAN
========================================================= */

async function savePlan() {

    if (!planName || !planSlug || !planPrice) {
        return;
    }

    const name =
        planName.value.trim();

    const slug =
        planSlug.value.trim()
            .toLowerCase();

    const price =
        Number(
            planPrice.value
        );

    if (!name) {

        showToast(
            "Plan name is required",
            "error"
        );

        planName.focus();

        return;
    }

    if (!slug) {

        showToast(
            "Plan slug is required",
            "error"
        );

        planSlug.focus();

        return;
    }

    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        showToast(
            "Enter a valid plan price",
            "error"
        );

        planPrice.focus();

        return;
    }

    const payload = {

        name,

        slug,

        price,

        currency:
    planCurrency
        ? planCurrency.value
        : "USD",

        duration:
            planDuration
                ? planDuration.value
                : "Monthly",

        description:
            planDescription
                ? planDescription.value.trim()
                : "",

        icon:
            planIcon
                ? planIcon.value.trim() ||
                  "fa-paper-plane"
                : "fa-paper-plane",

        iconClass:
            "blue",

        features:
            collectFeatures(),

        status:
            planStatus
                ? planStatus.value
                : "active",

        razorpayPlanId:
            razorpayPlanId
                ? razorpayPlanId.value.trim() ||
                  null
                : null
    };

    try {

        if (savePlanButton) {

            savePlanButton.disabled =
                true;

            savePlanButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Saving...
            `;
        }

        if (editingPlanId) {

            await apiRequest(
                `${API_BASE}/${encodeURIComponent(
                    editingPlanId
                )}`,
                {
                    method: "PUT",
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

            showToast(
                "Subscription plan updated successfully"
            );

        }
        else {

            await apiRequest(
                API_BASE,
                {
                    method: "POST",
                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

            showToast(
                "Subscription plan created successfully"
            );
        }

        closeModal(
            planEditorModal
        );

        await loadSubscriptions();

    }
    catch (error) {

        console.error(
            "Save Plan Error:",
            error
        );

        showToast(
            error.message ||
            "Failed to save subscription plan",
            "error"
        );

    }
    finally {

        if (savePlanButton) {

            savePlanButton.disabled =
                false;

            savePlanButton.innerHTML = `
                <i class="fa-solid fa-floppy-disk"></i>
                Save Plan
            `;
        }
    }
}


/* =========================================================
   DELETE PLAN
========================================================= */

async function deletePlan(id) {

    const plan =
        allPlans.find(
            item =>
                String(
                    item.id ||
                    item._id
                ) === String(id)
        );

    const name =
        plan
            ? plan.name
            : "this plan";

    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${name}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await apiRequest(
            `${API_BASE}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        showToast(
            "Subscription plan deleted successfully"
        );

        await loadSubscriptions();

    }
    catch (error) {

        console.error(
            "Delete Plan Error:",
            error
        );

        showToast(
            error.message ||
            "Failed to delete subscription plan",
            "error"
        );
    }
}


/* =========================================================
   FEATURES TAB
========================================================= */

function renderPlanFeatures() {

    if (!planFeaturesGrid) {
        return;
    }

    if (!allPlans.length) {

        planFeaturesGrid.innerHTML = `
            <div class="empty-state">
                No subscription plans available.
            </div>
        `;

        return;
    }

    planFeaturesGrid.innerHTML =
        allPlans
            .map(
                plan => {

                    const features =
                        Array.isArray(
                            plan.features
                        )
                            ? plan.features
                            : [];

                    return `
                        <div class="plan-feature-card">

                            <div class="plan-feature-header">

                                <div class="plan-feature-icon">
                                    <i class="
                                        fa-solid
                                        ${
                                            escapeHTML(
                                                plan.icon ||
                                                "fa-paper-plane"
                                            )
                                        }
                                    "></i>
                                </div>

                                <div>

                                    <h3>
                                        ${escapeHTML(
                                            plan.name ||
                                            "Unnamed Plan"
                                        )}
                                    </h3>

                                    <span>
                                        ${features.length}
                                        features
                                    </span>

                                </div>

                            </div>

                            <div class="plan-feature-list">

                                ${
                                    features.length
                                        ? features
                                            .map(
                                                feature => `
                                                    <div
                                                        class="
                                                            plan-feature-item
                                                            ${
                                                                feature.included
                                                                    ? "included"
                                                                    : "excluded"
                                                            }
                                                        "
                                                    >

                                                        <i class="
                                                            fa-solid
                                                            ${
                                                                feature.included
                                                                    ? "fa-check"
                                                                    : "fa-xmark"
                                                            }
                                                        "></i>

                                                        <span>
                                                            ${escapeHTML(
                                                                feature.text || ""
                                                            )}
                                                        </span>

                                                    </div>
                                                `
                                            )
                                            .join("")
                                        : `
                                            <div class="plan-feature-item">
                                                No features added
                                            </div>
                                        `
                                }

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   PLAN DETAILS
========================================================= */

function renderPlanDetails() {

    if (!planDetailsGrid) {
        return;
    }

    if (!allPlans.length) {

        planDetailsGrid.innerHTML = `
            <div class="empty-state">
                No subscription plan details available.
            </div>
        `;

        return;
    }

    planDetailsGrid.innerHTML =
        allPlans
            .map(
                plan => {

                    const id =
                        escapeAttribute(
                            plan.id ||
                            plan._id ||
                            ""
                        );

                    const features =
                        Array.isArray(
                            plan.features
                        )
                            ? plan.features
                            : [];

                    const featureHTML =
                        features.length
                            ? features
                                .slice(0, 7)
                                .map(
                                    feature => `
                                        <div class="
                                            plan-detail-feature
                                            ${
                                                feature.included === false
                                                    ? "excluded"
                                                    : ""
                                            }
                                        ">

                                            <i class="
                                                fa-solid
                                                ${
                                                    feature.included === false
                                                        ? "fa-xmark"
                                                        : "fa-check"
                                                }
                                            "></i>

                                            <span>
                                                ${escapeHTML(
                                                    feature.text ||
                                                    ""
                                                )}
                                            </span>

                                        </div>
                                    `
                                )
                                .join("")
                            : `
                                <div class="
                                    plan-detail-feature
                                ">
                                    <i class="
                                        fa-solid
                                        fa-circle-info
                                    "></i>

                                    <span>
                                        No features added
                                    </span>
                                </div>
                            `;

                    return `
                        <div
                            class="plan-detail-card"
                            data-plan-id="${id}"
                        >

                            <div class="plan-detail-top">

                                <div class="plan-detail-icon">

                                    <i class="
                                        fa-solid
                                        ${escapeHTML(
                                            plan.icon ||
                                            "fa-paper-plane"
                                        )}
                                    "></i>

                                </div>

                                <span class="
                                    status-badge
                                    ${
                                        plan.status === "active"
                                            ? "active"
                                            : "inactive"
                                    }
                                ">
                                    ${
                                        plan.status === "active"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>

                            </div>

                            <h3>
                                ${escapeHTML(
                                    plan.name ||
                                    "Unnamed Plan"
                                )}
                            </h3>

                            <div class="plan-detail-price">

                                ${formatCurrency(
                                    Number(
                                        plan.price || 0
                                    ),
                                    plan.currency ||
                                    "INR"
                                )}

                                <span>
                                    /
                                    ${
                                        escapeHTML(
                                            (
                                                plan.duration ||
                                                "Monthly"
                                            ).toLowerCase()
                                        )
                                    }
                                </span>

                            </div>

                            <p>
                                ${escapeHTML(
                                    plan.description ||
                                    "No description available."
                                )}
                            </p>

                            <div class="
                                plan-detail-features
                            ">
                                ${featureHTML}
                            </div>

                            <div class="
                                plan-detail-meta
                            ">

                                <span>
                                    <i class="
                                        fa-solid
                                        fa-users
                                    "></i>

                                    ${Number(
                                        plan.subscriberCount ||
                                        0
                                    ).toLocaleString()}
                                    subscribers
                                </span>

                            </div>

                            <div class="
                                plan-detail-actions
                            ">

                                <button
                                    type="button"
                                    class="plan-edit-btn"
                                    data-plan-edit="${id}"
                                >
                                    Edit Plan
                                </button>

                                <button
                                    type="button"
                                    class="plan-subscribers-btn"
                                    data-plan-subscribers="${id}"
                                >
                                    View Subscribers
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");

    setupPlanDetailButtons();
}
function setupPlanDetailButtons() {

    document
        .querySelectorAll(
            "[data-plan-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .planEdit;

                        if (id) {
                            editPlan(id);
                        }
                    }
                );
            }
        );

    document
        .querySelectorAll(
            "[data-plan-subscribers]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset
                                .planSubscribers;

                        if (!id) {
                            return;
                        }

                        const plan =
                            allPlans.find(
                                item =>
                                    String(
                                        item.id ||
                                        item._id
                                    ) ===
                                    String(id)
                            );

                        if (!plan) {
                            return;
                        }

                        showToast(
                            `${plan.name} subscribers: ${Number(
                                plan.subscriberCount || 0
                            ).toLocaleString()}`
                        );
                    }
                );
            }
        );
}


/* =========================================================
   TABS
========================================================= */

function setupTabs() {

    const plansTab =
        document.getElementById(
            "plansManagementTab"
        );

    const featuresTab =
        document.getElementById(
            "planFeaturesTab"
        );

    const plansSection =
        document.getElementById(
            "plansManagementSection"
        );

    const featuresSection =
        document.getElementById(
            "planFeaturesSection"
        );

    if (
        !plansTab ||
        !featuresTab
    ) {
        return;
    }

    plansTab.addEventListener(
        "click",
        () => {

            plansTab.classList.add(
                "active"
            );

            featuresTab.classList.remove(
                "active"
            );

            if (plansSection) {
                plansSection.style.display =
                    "";
            }

            if (featuresSection) {
                featuresSection.style.display =
                    "none";
            }
        }
    );

    featuresTab.addEventListener(
        "click",
        () => {

            featuresTab.classList.add(
                "active"
            );

            plansTab.classList.remove(
                "active"
            );

            if (plansSection) {
                plansSection.style.display =
                    "none";
            }

            if (featuresSection) {
                featuresSection.style.display =
                    "";
            }
        }
    );
}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add(
        "active"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "modal-open"
    );
}


/* =========================================================
   EVENT DELEGATION
========================================================= */

function setupTableActions() {

    if (!plansTableBody) {
        return;
    }

    plansTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) {
                return;
            }

            const action =
                button.dataset.action;

            const id =
                button.dataset.id;

            if (!id) {
                return;
            }

            if (action === "view") {
                viewPlan(id);
            }

            if (action === "edit") {
                editPlan(id);
            }

            if (action === "delete") {
                deletePlan(id);
            }
        }
    );
}


/* =========================================================
   FEATURE EVENTS
========================================================= */

function setupFeatureEvents() {

    if (addFeatureButton) {

        addFeatureButton.addEventListener(
            "click",
            () => {

                addFeatureRow(
                    "",
                    true
                );
            }
        );
    }

    if (featureEditor) {

        featureEditor.addEventListener(
            "click",
            event => {

                const removeButton =
                    event.target.closest(
                        ".remove-feature"
                    );

                if (!removeButton) {
                    return;
                }

                const row =
                    removeButton.closest(
                        ".feature-editor-row"
                    );

                if (row) {
                    row.remove();
                }
            }
        );
    }
}


/* =========================================================
   FILTERS
========================================================= */

function setupFilters() {

    if (planSearch) {

        let timeout;

        planSearch.addEventListener(
            "input",
            () => {

                clearTimeout(
                    timeout
                );

                timeout =
                    setTimeout(
                        loadSubscriptions,
                        300
                    );
            }
        );
    }

    if (planStatusFilter) {

        planStatusFilter.addEventListener(
            "change",
            () => {

                loadSubscriptions();
            }
        );
    }

    if (resetPlanFilters) {

        resetPlanFilters.addEventListener(
            "click",
            () => {

                if (planSearch) {
                    planSearch.value = "";
                }

                if (planStatusFilter) {
                    planStatusFilter.value =
                        "all";
                }

                loadSubscriptions();
            }
        );
    }
}


/* =========================================================
   PAGINATION EVENTS
========================================================= */

function setupPagination() {

    if (previousPage) {

        previousPage.addEventListener(
            "click",
            () => {

                if (currentPage > 1) {

                    currentPage--;

                    renderPlans();
                }
            }
        );
    }

    if (nextPage) {

        nextPage.addEventListener(
            "click",
            () => {

                const totalPages =
                    Math.ceil(
                        filteredPlans.length /
                        ITEMS_PER_PAGE
                    );

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderPlans();
                }
            }
        );
    }
}


/* =========================================================
   BUTTONS
========================================================= */

function setupMainButtons() {

    const addPlanButton =
        document.getElementById(
            "addPlanButton"
        );

    const planEditorForm =
        document.getElementById(
            "planEditorForm"
        );

    addPlanButton?.addEventListener(
        "click",
        openAddPlanModal
    );

    planEditorForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            savePlan();
        }
    );
}


/* =========================================================
   MODAL CLOSE EVENTS
========================================================= */

function setupModalEvents() {

    const viewClose =
        document.getElementById(
            "viewPlanClose"
        );

    const viewCancel =
        document.getElementById(
            "viewPlanCancel"
        );

    const viewEdit =
        document.getElementById(
            "viewPlanEdit"
        );

    const editorClose =
        document.getElementById(
            "planEditorClose"
        );

    const editorCancel =
        document.getElementById(
            "planEditorCancel"
        );

    viewClose?.addEventListener(
        "click",
        () => {
            closeModal(
                viewPlanModal
            );
        }
    );

    viewCancel?.addEventListener(
        "click",
        () => {
            closeModal(
                viewPlanModal
            );
        }
    );

    editorClose?.addEventListener(
        "click",
        () => {
            closeModal(
                planEditorModal
            );
        }
    );

    editorCancel?.addEventListener(
        "click",
        () => {
            closeModal(
                planEditorModal
            );
        }
    );

    viewEdit?.addEventListener(
        "click",
        async () => {

            const id =
                viewPlanModal?.dataset
                    .planId;

            closeModal(
                viewPlanModal
            );

            if (id) {
                await editPlan(id);
            }
        }
    );

    viewPlanModal
        ?.querySelector(
            ".subscription-modal-overlay"
        )
        ?.addEventListener(
            "click",
            () => {
                closeModal(
                    viewPlanModal
                );
            }
        );

    planEditorModal
        ?.querySelector(
            ".subscription-modal-overlay"
        )
        ?.addEventListener(
            "click",
            () => {
                closeModal(
                    planEditorModal
                );
            }
        );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }

            closeModal(
                viewPlanModal
            );

            closeModal(
                planEditorModal
            );
        }
    );
}


/* =========================================================
   AUTO SLUG
========================================================= */

function setupSlugGenerator() {

    if (
        !planName ||
        !planSlug
    ) {
        return;
    }

    planName.addEventListener(
        "input",
        () => {

            if (editingPlanId) {
                return;
            }

            planSlug.value =
                planName.value
                    .toLowerCase()
                    .trim()
                    .replace(
                        /[^a-z0-9]+/g,
                        "-"
                    )
                    .replace(
                        /^-+|-+$/g,
                        ""
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
   PROFILE
========================================================= */

function loadAdminProfile() {

    let user = null;

    try {

        const raw =
            localStorage.getItem(
                "calcuraUser"
            );

        if (raw) {
            user = JSON.parse(raw);
        }

    } catch (error) {

        console.warn(
            "Unable to read admin user",
            error
        );
    }

    if (!user) {
        return;
    }

    const name =
        user.name ||
        user.fullName ||
        user.username ||
        "Admin";

    const avatar =
        name
            .trim()
            .charAt(0)
            .toUpperCase();

    const nameElement =
        document.getElementById(
            "adminName"
        );

    const avatarElement =
        document.getElementById(
            "adminAvatar"
        );

    if (nameElement) {
        nameElement.textContent =
            name;
    }

    if (avatarElement) {
        avatarElement.textContent =
            avatar;
    }
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function setupGlobalSearch() {

    const searchInput =
        document.querySelector(
            ".global-search input"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {
                return;
            }

            const value =
                searchInput.value
                    .trim();

            if (!value) {
                return;
            }

            if (planSearch) {

                planSearch.value =
                    value;

                loadSubscriptions();
            }
        }
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

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


function escapeAttribute(value) {

    return escapeHTML(
        value
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupTabs();

        setupTableActions();

        setupFeatureEvents();

        setupFilters();

        setupPagination();

        setupMainButtons();

        setupModalEvents();

        setupSlugGenerator();

        setupSidebar();

        setupGlobalSearch();

        loadAdminProfile();

        loadSubscriptions();

    }
);