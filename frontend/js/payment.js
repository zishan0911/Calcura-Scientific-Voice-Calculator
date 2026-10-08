// =========================================================
// CALCURA - PAYMENT PAGE
// Razorpay Subscription Frontend
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // SELECT ELEMENTS
    // =====================================================

    const payBtn = document.getElementById("payBtn");
    const payButtonText = document.getElementById("payButtonText");

    const paymentMessage =
        document.getElementById("paymentMessage");

    const headerAvatar =
        document.getElementById("headerAvatar");

    const headerUserName =
        document.getElementById("headerUserName");

    const headerPlan =
        document.getElementById("headerPlan");

    const summaryPlanName =
        document.getElementById("summaryPlanName");

    const summaryPrice =
        document.getElementById("summaryPrice");

    const summarySubtotal =
        document.getElementById("summarySubtotal");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const summaryTax =
        document.getElementById("summaryTax");

    const summaryPopular =
        document.getElementById("summaryPopular");

    const summaryFeatures =
        document.querySelector(".summary-features");

    const couponCode =
        document.getElementById("couponCode");

    const applyCouponBtn =
        document.getElementById("applyCouponBtn");

    const couponMessage =
        document.getElementById("couponMessage");

    const notificationBtn =
        document.getElementById("notificationBtn");


    // =====================================================
    // SELECTED PLAN
    // Comes from upgrade.js
    // =====================================================

    const selectedPlan =
    localStorage.getItem(
        "calcuraSelectedPlan"
    ) || "pro";

    // =====================================================
    // PLAN DETAILS
    // =====================================================

  let currentPlan = null;

    // =====================================================
    // FORMAT PRICE
    // =====================================================

   function formatPrice(
    price,
    currency = "USD"
) {

    const amount =
        Number(price || 0);

    if (currency === "INR") {
        return `₹${amount.toFixed(2)}`;
    }

    return `$${amount.toFixed(2)}`;
}

    // =====================================================
    // LOAD SELECTED PLAN
    // =====================================================

   async function loadSelectedPlan() {

    try {

       const response = await fetch(
    `http://localhost:5000/api/subscription-plans/${encodeURIComponent(selectedPlan)}`
);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Unable to load subscription plan."
            );
        }

        currentPlan =
            data.plan ||
            data.subscription ||
            null;

        if (!currentPlan) {
            throw new Error(
                "Selected plan was not found."
            );
        }

        const price =
            Number(currentPlan.price || 0);

        const currency =
            currentPlan.currency || "USD";

        const formattedPrice =
            formatPrice(
                price,
                currency
            );

        if (summaryPlanName) {
            summaryPlanName.textContent =
                currentPlan.name || "";
        }

        if (summaryPrice) {
            summaryPrice.textContent =
                formattedPrice;
        }

        if (summarySubtotal) {
            summarySubtotal.textContent =
                formattedPrice;
        }

        if (summaryTotal) {
            summaryTotal.textContent =
                formattedPrice;
        }

        if (summaryTax) {
            summaryTax.textContent =
                currency === "INR"
                    ? "₹0.00"
                    : "$0.00";
        }

        if (payButtonText) {
            payButtonText.textContent =
                `Pay ${formattedPrice} / month`;
        }

        if (headerPlan) {
            headerPlan.textContent =
                currentPlan.name || "";
        }

        if (summaryFeatures) {

            const features =
                Array.isArray(
                    currentPlan.features
                )
                    ? currentPlan.features
                    : [];

            summaryFeatures.innerHTML =
                features
                    .filter(
                        feature =>
                            feature.included !== false
                    )
                    .map(
                        feature => `
                            <li>
                                <i class="fa-solid fa-check"></i>
                                <span>
                                    ${feature.text || ""}
                                </span>
                            </li>
                        `
                    )
                    .join("");
        }

    }
    catch (error) {

        console.error(
            "Load Selected Plan Error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load selected plan."
        );
    }
}


    // =====================================================
    // LOAD REAL USER
    // =====================================================

  // =====================================================
// LOAD REAL USER
// =====================================================

function getLocalUser() {

    try {

        const savedUser =
            localStorage.getItem("calcuraUser");

        if (!savedUser) {
            return null;
        }

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "User storage error:",
            error
        );

        return null;
    }
}


// =====================================================
// DISPLAY REAL USER
// =====================================================

function displayUser(user) {

    if (!user) {
        return;
    }

    const name =
        user.name ||
        user.fullName ||
        "User";


    const plan =
        user.plan ||
        user.subscriptionPlan ||
        localStorage.getItem(
            "calcuraSubscription"
        ) ||
        "Free Plan";


    if (headerUserName) {

        headerUserName.textContent =
            name;
    }


    if (headerPlan) {

        headerPlan.textContent =
            formatPlanName(plan);
    }


    if (headerAvatar) {

        const avatar =
            user.avatar ||
            user.profileImage ||
            user.profilePicture;


        if (avatar) {

            headerAvatar.innerHTML =
                `<img
                    src="${avatar}"
                    alt="Profile"
                >`;

        } else {

            headerAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }
    }
}


// =====================================================
// FORMAT PLAN NAME
// =====================================================

function formatPlanName(plan) {

    if (!plan) {
        return "Free Plan";
    }


    const value =
        String(plan)
            .toLowerCase();


    if (
        value.includes("student")
    ) {
        return "Student Plan";
    }


    if (
        value.includes("premium") ||
        value.includes("pro")
    ) {
        return "Pro Plan";
    }


    return "Free Plan";
}


// =====================================================
// REFRESH REAL USER FROM BACKEND
// =====================================================

async function loadUser() {

    let user =
        getLocalUser();


    // Show saved user immediately
    if (user) {

        displayUser(user);
    }


    const token =
        localStorage.getItem(
            "calcuraToken"
        );


    if (
        !token ||
        typeof getCurrentUser !==
        "function"
    ) {
        return;
    }


    try {

        const response =
            await getCurrentUser();


        // SAME RESPONSE FORMAT AS UPGRADE.JS
        if (
            response &&
            response.success &&
            response.user
        ) {

            user =
                response.user;


            localStorage.setItem(
                "calcuraUser",
                JSON.stringify(user)
            );


            displayUser(user);
        }

    } catch (error) {

        console.warn(
            "Unable to refresh user:",
            error
        );
    }
}


    // =====================================================
    // PROGRESS STEPS
    // =====================================================

    function activatePaymentStep() {

        const step2 =
            document.getElementById(
                "paymentStep2"
            );

        const line1 =
            document.getElementById(
                "stepLine1"
            );


        if (step2) {

            step2.classList.add("active");

        }

        if (line1) {

            line1.classList.add("active");

        }

    }


    function activateSuccessStep() {

        const step3 =
            document.getElementById(
                "paymentStep3"
            );

        const line2 =
            document.getElementById(
                "stepLine2"
            );


        if (step3) {

            step3.classList.add("active");

        }

        if (line2) {

            line2.classList.add("active");

        }

    }


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    function showMessage(
        message,
        type = "error"
    ) {

        if (!paymentMessage) {
            return;
        }


        paymentMessage.textContent =
            message;


        if (type === "success") {

            paymentMessage.style.color =
                "#39d99d";

        } else {

            paymentMessage.style.color =
                "#ff6b6b";

        }

    }


    // =====================================================
    // RAZORPAY SCRIPT
    // =====================================================

    function loadRazorpayScript() {

        return new Promise(
            (resolve, reject) => {

                if (
                    typeof Razorpay !==
                    "undefined"
                ) {

                    resolve();

                    return;
                }


                const script =
                    document.createElement(
                        "script"
                    );

                script.src =
                    "https://checkout.razorpay.com/v1/checkout.js";

                script.onload =
                    () => resolve();

                script.onerror =
                    () => reject(
                        new Error(
                            "Razorpay Checkout could not be loaded."
                        )
                    );

                document.body.appendChild(
                    script
                );

            }
        );

    }


    // =====================================================
    // CREATE SUBSCRIPTION
    // =====================================================

    // =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

async function createOrder() {

    const token = localStorage.getItem("calcuraToken");

    if (!token) {

        showMessage("Please login before making a payment.");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);

        return null;
    }

    const response = await fetch(
        "http://localhost:5000/api/payments/create-order",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                plan: selectedPlan
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data.message ||
            "Unable to create Razorpay order."
        );
    }

    return data;
}


    // =====================================================
// OPEN RAZORPAY STANDARD CHECKOUT
// =====================================================

async function openRazorpayCheckout() {

    try {

        showMessage(
            "Preparing secure payment...",
            "success"
        );

        activatePaymentStep();

        if (payBtn) {

            payBtn.disabled = true;

            payButtonText.textContent =
                "Preparing payment...";
        }

        // Load Razorpay Checkout
        await loadRazorpayScript();

        // Create Razorpay Order
        const order = await createOrder();

        if (!order) {
            return;
        }

        if (
            !order.order_id ||
            !order.keyId
        ) {

            throw new Error(
                "Invalid Razorpay order response."
            );
        }

        const user =
            JSON.parse(
                localStorage.getItem(
                    "calcuraUser"
                ) || "{}"
            );

        const userName =
            user.name ||
            user.fullName ||
            user.username ||
            "";

        const userEmail =
            user.email || "";

        const userPhone =
            user.phone ||
            user.mobile ||
            "";

        const options = {

            // Public Razorpay Test Key
            key: order.keyId,

            // Standard Checkout
            order_id: order.order_id,

            amount: order.amount,

            currency:
                order.currency || "INR",

            name: "Calcura",

            description:
                `${currentPlan.name} Plan`,

            image: "",

            prefill: {

                name: userName,

                email: userEmail,

                contact: userPhone

            },

            notes: {

                plan: selectedPlan

            },

            theme: {

                color: "#087dff"

            },

            handler:
                async function (response) {

                    await verifyPayment(
                        response
                    );

                },

            modal: {

                ondismiss:
                    function () {

                        if (payBtn) {

                            payBtn.disabled =
                                false;

                            payButtonText.textContent =
                                `Pay ${formatPrice(
                                    currentPlan.price
                                )}`;
                        }

                        showMessage("");
                    }
            }
        };

        const razorpay =
            new Razorpay(options);

        razorpay.on(
            "payment.failed",
            function (response) {

                console.error(
                    "Razorpay payment failed:",
                    response
                );

                showMessage(
                    "Payment failed. Please try again."
                );

                if (payBtn) {

                    payBtn.disabled = false;

                    payButtonText.textContent =
                        `Pay ${formatPrice(
                            currentPlan.price
                        )}`;
                }
            }
        );

        razorpay.open();

    } catch (error) {

        console.error(
            "Razorpay error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to start payment."
        );

        if (payBtn) {

            payBtn.disabled = false;

            payButtonText.textContent =
                `Pay ${formatPrice(
                    currentPlan.price
                )}`;
        }
    }
}


   // =====================================================
// VERIFY STANDARD RAZORPAY PAYMENT
// =====================================================

async function verifyPayment(
    razorpayResponse
) {

    try {

        showMessage(
            "Verifying your payment...",
            "success"
        );

        if (payBtn) {

            payBtn.disabled = true;

            payButtonText.textContent =
                "Verifying payment...";
        }

        const token =
            localStorage.getItem(
                "calcuraToken"
            );

        if (!token) {

            throw new Error(
                "Login session expired. Please login again."
            );
        }

        // Validate Razorpay response
        if (
            !razorpayResponse ||
            !razorpayResponse.razorpay_payment_id ||
            !razorpayResponse.razorpay_order_id ||
            !razorpayResponse.razorpay_signature
        ) {

            throw new Error(
                "Incomplete Razorpay payment response."
            );
        }

        const response =
            await fetch(
                "http://localhost:5000/api/payments/verify-payment",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        razorpay_payment_id:
                            razorpayResponse
                                .razorpay_payment_id,

                        razorpay_order_id:
                            razorpayResponse
                                .razorpay_order_id,

                        razorpay_signature:
                            razorpayResponse
                                .razorpay_signature,

                        plan:
                            selectedPlan
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Payment verification failed."
            );
        }

        // =============================================
        // PAYMENT VERIFIED SUCCESSFULLY
        // =============================================

        activateSuccessStep();

        localStorage.setItem(
            "calcuraSubscription",
            data.plan || selectedPlan
        );

        localStorage.setItem(
            "calcuraPaymentStatus",
            "active"
        );

        localStorage.setItem(
            "calcuraPaymentId",
            razorpayResponse
                .razorpay_payment_id
        );

        localStorage.setItem(
            "calcuraOrderId",
            razorpayResponse
                .razorpay_order_id
        );

        showMessage(
            "Payment successful! Activating your plan...",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "success.html";

        }, 1200);

    } catch (error) {

        console.error(
            "Verification error:",
            error
        );

        showMessage(
            error.message ||
            "Payment verification failed."
        );

        if (payBtn) {

            payBtn.disabled = false;

            payButtonText.textContent =
                `Pay ${formatPrice(
                    currentPlan.price
                )}`;
        }
    }
}

    // =====================================================
    // PAY BUTTON
    // =====================================================

    if (payBtn) {

        payBtn.addEventListener(
            "click",
            openRazorpayCheckout
        );

    }


    // =====================================================
    // COUPON
    // =====================================================

    if (applyCouponBtn) {

        applyCouponBtn.addEventListener(
            "click",
            () => {

                const code =
                    couponCode
                        ? couponCode.value
                            .trim()
                            .toUpperCase()
                        : "";


                if (!code) {

                    if (couponMessage) {

                        couponMessage.textContent =
                            "Please enter a coupon code.";

                        couponMessage.style.color =
                            "#ff6b6b";

                    }

                    return;

                }


                /*
                 Coupon validation will be connected
                 to the backend later.
                */

                if (couponMessage) {

                    couponMessage.textContent =
                        "Coupon validation will be available soon.";

                    couponMessage.style.color =
                        "#94a3b8";

                }

            }
        );

    }


    // =====================================================
    // NOTIFICATION
    // =====================================================

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                alert(
                    "No new notifications."
                );

            }
        );

    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    loadSelectedPlan();

    loadUser();

});