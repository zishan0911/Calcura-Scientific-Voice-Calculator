// =========================================================
// CALCURA - ABOUT
// REAL LOGGED-IN USER
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    const headerAvatar =
        document.getElementById("headerAvatar");

    const headerUserName =
        document.getElementById("headerUserName");

    const headerPlan =
        document.getElementById("headerPlan");


    // =====================================================
    // GET LOCAL USER
    // =====================================================

    function getLocalUser() {

        try {

            const saved =
                localStorage.getItem(
                    "calcuraUser"
                );

            if (!saved) {
                return null;
            }

            return JSON.parse(saved);

        } catch (error) {

            console.error(
                "Unable to read Calcura user:",
                error
            );

            return null;
        }
    }


    // =====================================================
    // DISPLAY USER
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
            "Free Plan";


        if (headerUserName) {

            headerUserName.textContent =
                name;
        }


        if (headerPlan) {

            headerPlan.textContent =
                plan;
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

                headerAvatar.classList.add(
                    "has-image"
                );

            } else {

                headerAvatar.textContent =
                    name
                        .charAt(0)
                        .toUpperCase();
            }
        }
    }


    // =====================================================
    // LOAD USER
    // =====================================================

    async function loadUser() {

        let user =
            getLocalUser();


        // Show local user immediately

        if (user) {

            displayUser(
                user
            );
        }


        // Try latest backend user

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
                    JSON.stringify(
                        user
                    )
                );


                displayUser(
                    user
                );
            }

        } catch (error) {

            console.warn(
                "Could not refresh Calcura user:",
                error
            );
        }
    }


    // =====================================================
    // START
    // =====================================================

    await loadUser();

});