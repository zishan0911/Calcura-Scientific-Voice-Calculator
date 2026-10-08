// =========================================================
// CALCURA - UPGRADE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const upgradeBtn =
        document.getElementById("upgradeBtn");

    const studentPlanBtn =
        document.getElementById(
            "studentPlanBtn"
        );

    const upgradeTodayBtn =
        document.getElementById(
            "upgradeTodayBtn"
        );

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );

    const searchInput =
        document.getElementById(
            "upgradeSearch"
        );

    const headerAvatar =
        document.getElementById(
            "headerAvatar"
        );

    const headerUserName =
        document.getElementById(
            "headerUserName"
        );

    const headerPlan =
        document.getElementById(
            "headerPlan"
        );


    // =====================================================
    // GET USER
    // =====================================================

    function getLocalUser() {

        try {

            const savedUser =
                localStorage.getItem(
                    "calcuraUser"
                );

            if (!savedUser) {
                return null;
            }

            return JSON.parse(
                savedUser
            );

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
    // SAVE SELECTED PLAN
    // =====================================================

    function selectPlan(plan) {

        localStorage.setItem(
            "calcuraSelectedPlan",
            plan
        );


        localStorage.setItem(
            "calcuraSelectedPrice",
            plan === "student"
                ? "10"
                : "20"
        );


        window.location.href =
            "payment.html";
    }


    // =====================================================
    // PRO BUTTON
    // =====================================================

    if (upgradeBtn) {

        upgradeBtn.addEventListener(
            "click",
            () => {

                selectPlan("pro");

            }
        );
    }


    // =====================================================
    // STUDENT BUTTON
    // =====================================================

    if (studentPlanBtn) {

        studentPlanBtn.addEventListener(
            "click",
            () => {

                selectPlan("student");

            }
        );
    }


    // =====================================================
    // UPGRADE TODAY
    // =====================================================

    if (upgradeTodayBtn) {

        upgradeTodayBtn.addEventListener(
            "click",
            () => {

                selectPlan("pro");

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
    // SEARCH
    // =====================================================

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    const query =
                        searchInput.value
                            .trim()
                            .toLowerCase();


                    if (!query) {
                        return;
                    }


                    const pageText =
                        document.body.innerText
                            .toLowerCase();


                    if (
                        pageText.includes(
                            query
                        )
                    ) {

                        alert(
                            `Found "${searchInput.value}" on this page.`
                        );

                    } else {

                        alert(
                            `No result found for "${searchInput.value}".`
                        );
                    }
                }
            }
        );
    }


    // =====================================================
    // START
    // =====================================================

    loadUser();

});