// ==========================================
// CALCURA - SUBSCRIPTION
// ==========================================

function isPremiumUser() {

    const subscription =
        localStorage.getItem("calcuraSubscription");

    return subscription === "premium";
}


// ==========================================
// GET SUBSCRIPTION
// ==========================================

function getSubscriptionStatus() {

    if (isPremiumUser()) {
        return "Premium";
    }

    return "Free";
}


// ==========================================
// PREMIUM CHECK
// ==========================================

function requirePremium() {

    if (!isPremiumUser()) {

        alert(
            "This feature is available for Calcura Premium users."
        );

        window.location.href =
            "upgrade.html";

        return false;
    }

    return true;
}