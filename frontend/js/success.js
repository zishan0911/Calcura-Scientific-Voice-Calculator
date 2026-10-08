// ==========================================
// CALCURA - SUCCESS PAGE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const subscription =
    localStorage.getItem("calcuraSubscription");

if (subscription !== "pro") {
    window.location.href = "upgrade.html";
    return;
}


    /* =====================================================
       GET USER INFORMATION
    ===================================================== */

    let userName =
        localStorage.getItem("calcuraUserName") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("username");


    /* =====================================================
       TRY USER OBJECT
    ===================================================== */

    if (!userName) {

        try {

            const userData =
                JSON.parse(
                    localStorage.getItem("calcuraUser")
                );


            if (userData) {

                userName =
                    userData.name ||
                    userData.fullName ||
                    userData.username;

            }

        }

        catch (error) {

            console.log(
                "User data not available."
            );

        }
    }


    /* =====================================================
       DEFAULT NAME
    ===================================================== */

    if (!userName) {

        userName = "User";

    }


    userName =
        String(userName).trim();


    /* =====================================================
       USER NAME
    ===================================================== */

    const userNameElement =
        document.getElementById("userName");


    if (userNameElement) {

        userNameElement.textContent =
            userName;

    }


    /* =====================================================
       WELCOME TEXT
    ===================================================== */

    const welcomeText =
        document.getElementById("welcomeText");


    if (welcomeText) {

        welcomeText.textContent =
            `Welcome to Calcura Pro, ${userName}!`;

    }


    /* =====================================================
       USER AVATAR
    ===================================================== */

    const userAvatar =
        document.getElementById("userAvatar");


    if (userAvatar) {

        const firstLetter =
            userName
                .charAt(0)
                .toUpperCase();


        userAvatar.textContent =
            firstLetter;

    }


    /* =====================================================
       PRO STATUS
    ===================================================== */

    console.log(
        "Calcura Premium activated successfully."
    );

});