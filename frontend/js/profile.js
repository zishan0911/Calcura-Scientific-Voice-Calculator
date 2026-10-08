// =========================================================
// CALCURA - PROFILE
// REAL USER PROFILE
// =========================================================


document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const headerAvatar =
        document.getElementById("headerAvatar");

    const headerUserName =
        document.getElementById("headerUserName");

    const headerPlan =
        document.getElementById("headerPlan");

    const profilePlan =
        document.getElementById("profilePlan");

    const memberSince =
        document.getElementById("memberSince");

    const nameInput =
        document.getElementById("name");

    const emailInput =
        document.getElementById("email");

    const usernameInput =
        document.getElementById("username");

    const countryInput =
        document.getElementById("country");

    const languageInput =
        document.getElementById("language");

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");

    const cancelProfileBtn =
        document.getElementById("cancelProfileBtn");

    const profileSaveArea =
        document.getElementById("profileSaveArea");

    const profileMessage =
        document.getElementById("profileMessage");

    const avatarCameraBtn =
        document.getElementById("avatarCameraBtn");

    const avatarInput =
        document.getElementById("avatarInput");

    const changePasswordBtn =
        document.getElementById("changePasswordBtn");

    const confirmPasswordBtn =
        document.getElementById("confirmPasswordBtn");

    const cancelPasswordBtn =
        document.getElementById("cancelPasswordBtn");

    const passwordArea =
        document.getElementById("passwordArea");

    const currentPassword =
        document.getElementById("currentPassword");

    const newPassword =
        document.getElementById("newPassword");

    const confirmPassword =
        document.getElementById("confirmPassword");

    const passwordMessage =
        document.getElementById("passwordMessage");

    const downloadDataBtn =
        document.getElementById("downloadDataBtn");

    const deleteAccountBtn =
        document.getElementById("deleteAccountBtn");


    // =====================================================
    // USER STORAGE
    // =====================================================

    function getLocalUser() {

        try {

            const user =
                localStorage.getItem("calcuraUser");

            if (!user) {
                return null;
            }

            return JSON.parse(user);

        } catch (error) {

            console.error(
                "User storage error:",
                error
            );

            return null;
        }
    }


    function getToken() {

        return localStorage.getItem(
            "calcuraToken"
        );
    }


    // =====================================================
    // GET USER
    // =====================================================

    async function loadProfile() {

        let user = null;

        // First local user

        try {

            if (
                typeof getSavedUser ===
                "function"
            ) {

                user = getSavedUser();

            }

        } catch (error) {

            console.warn(
                "getSavedUser unavailable"
            );

        }


        // Fallback localStorage

        if (!user) {
            user = getLocalUser();
        }


        // No user

        if (!user) {

            window.location.href =
                "../login.html";

            return;
        }


        // Display immediately

        displayUser(user);


        // Get latest user from backend

        const token = getToken();

        if (!token) {
            return;
        }


        try {

            let response;


            if (
                typeof getCurrentUser ===
                "function"
            ) {

                response =
                    await getCurrentUser();

            } else {

                const apiResponse =
                    await fetch(
                        "http://localhost:5000/api/auth/profile",
                        {
                            method: "GET",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );

                response =
                    await apiResponse.json();

            }


            if (
                response &&
                response.success &&
                response.user
            ) {

                user = response.user;

                saveLocalUser(user);

                displayUser(user);
            }

        } catch (error) {

            console.warn(
                "Could not refresh profile:",
                error
            );

        }


        // Load statistics

        loadStatistics(user);
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


        const email =
            user.email ||
            "";


        const username =
            user.username ||
            createUsername(user);


        const country =
            user.country ||
            localStorage.getItem(
                "calcuraCountry"
            ) ||
            "India";


        const language =
            user.language ||
            localStorage.getItem(
                "calcuraLanguage"
            ) ||
            "English (US)";


        const plan =
            user.plan ||
            user.subscriptionPlan ||
            "Free Plan";


        // -----------------------------------------------
        // NAME
        // -----------------------------------------------

        if (profileName) {
            profileName.textContent = name;
        }

        if (headerUserName) {
            headerUserName.textContent = name;
        }


        // -----------------------------------------------
        // EMAIL
        // -----------------------------------------------

        if (profileEmail) {
            profileEmail.textContent = email;
        }

        if (emailInput) {
            emailInput.value = email;
        }


        // -----------------------------------------------
        // NAME INPUT
        // -----------------------------------------------

        if (nameInput) {
            nameInput.value = name;
        }


        // -----------------------------------------------
        // USERNAME
        // -----------------------------------------------

        if (usernameInput) {
            usernameInput.value = username;
        }


        // -----------------------------------------------
        // COUNTRY
        // -----------------------------------------------

        if (countryInput) {

            const option =
                Array.from(
                    countryInput.options
                ).find(
                    item =>
                        item.value === country
                );

            if (option) {
                countryInput.value = country;
            }

        }


        // -----------------------------------------------
        // LANGUAGE
        // -----------------------------------------------

        if (languageInput) {

            const option =
                Array.from(
                    languageInput.options
                ).find(
                    item =>
                        item.value === language
                );

            if (option) {
                languageInput.value =
                    language;
            }

        }


        // -----------------------------------------------
        // PLAN
        // -----------------------------------------------

        if (profilePlan) {
            profilePlan.textContent = plan;
        }

        if (headerPlan) {
            headerPlan.textContent = plan;
        }


        // -----------------------------------------------
        // MEMBER SINCE
        // -----------------------------------------------

        const date =
            user.createdAt ||
            user.created_at ||
            user.joinedAt;


        if (memberSince) {

            if (date) {

                const formatted =
                    formatMemberDate(date);

                memberSince.textContent =
                    `Member since ${formatted}`;

            } else {

                memberSince.textContent =
                    "Member since your registration";

            }
        }


        // -----------------------------------------------
        // AVATAR
        // -----------------------------------------------

        setAvatar(
            user,
            name
        );
    }


    // =====================================================
    // USERNAME
    // =====================================================

    function createUsername(user) {

        if (user.username) {
            return user.username;
        }


        if (user.email) {

            return user.email
                .split("@")[0]
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, "");

        }


        return "user";
    }


    // =====================================================
    // AVATAR
    // =====================================================

    function setAvatar(user, name) {

        const avatarUrl =
            user.avatar ||
            user.profileImage ||
            user.profilePicture;


        if (avatarUrl) {

            if (profileAvatar) {

                profileAvatar.innerHTML =
                    `<img src="${avatarUrl}"
                          alt="Profile">`;

            }

            if (headerAvatar) {

                headerAvatar.innerHTML =
                    `<img src="${avatarUrl}"
                          alt="Profile">`;

            }

            return;
        }


        const initial =
            name
                .charAt(0)
                .toUpperCase();


        if (profileAvatar) {

            profileAvatar.textContent =
                initial;
        }


        if (headerAvatar) {

            headerAvatar.textContent =
                initial;
        }
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatMemberDate(date) {

        try {

            return new Date(date)
                .toLocaleDateString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

        } catch (error) {

            return "--";
        }
    }


    // =====================================================
    // SAVE LOCAL USER
    // =====================================================

    function saveLocalUser(user) {

        try {

            localStorage.setItem(
                "calcuraUser",
                JSON.stringify(user)
            );

        } catch (error) {

            console.warn(
                "Unable to save local user"
            );

        }
    }


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    function setEditMode(enabled) {

        if (nameInput) {
            nameInput.disabled =
                !enabled;
        }

        if (countryInput) {
            countryInput.disabled =
                !enabled;
        }

        if (languageInput) {
            languageInput.disabled =
                !enabled;
        }


        if (profileSaveArea) {

            profileSaveArea.classList.toggle(
                "show",
                enabled
            );
        }


        if (editProfileBtn) {

            editProfileBtn.innerHTML =
                enabled
                    ? `<i class="fa-solid fa-xmark"></i> Cancel`
                    : `<i class="fa-solid fa-pen"></i> Edit Profile`;
        }
    }


    // Edit button

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            () => {

                const editing =
                    profileSaveArea &&
                    profileSaveArea.classList.contains(
                        "show"
                    );


                if (editing) {

                    cancelProfileChanges();

                } else {

                    setEditMode(true);
                }

            }
        );
    }


    // =====================================================
    // CANCEL PROFILE
    // =====================================================

    function cancelProfileChanges() {

        const user =
            getLocalUser();

        if (user) {
            displayUser(user);
        }

        setEditMode(false);

        showMessage(
            profileMessage,
            "",
            ""
        );
    }


    if (cancelProfileBtn) {

        cancelProfileBtn.addEventListener(
            "click",
            cancelProfileChanges
        );
    }


    // =====================================================
    // SAVE PROFILE
    // =====================================================

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            saveProfile
        );
    }


    async function saveProfile() {

        const newName =
            nameInput
                ? nameInput.value.trim()
                : "";


        if (newName.length < 2) {

            showMessage(
                profileMessage,
                "Name must contain at least 2 characters.",
                "error"
            );

            return;
        }


        const token = getToken();

        if (!token) {

            showMessage(
                profileMessage,
                "Please login first.",
                "error"
            );

            return;
        }


        saveProfileBtn.disabled = true;


        try {

            const body = {
                name: newName
            };


            if (
                countryInput &&
                !countryInput.disabled
            ) {
                body.country =
                    countryInput.value;
            }


            if (
                languageInput &&
                !languageInput.disabled
            ) {
                body.language =
                    languageInput.value;
            }


            const response =
                await fetch(
                    "http://localhost:5000/api/auth/profile",
                    {
                        method: "PUT",

                                                headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(body)
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to update profile."
                );
            }


            // ---------------------------------------------
            // UPDATED USER
            // ---------------------------------------------

            const updatedUser =
                data.user;


            if (updatedUser) {

                saveLocalUser(
                    updatedUser
                );

                displayUser(
                    updatedUser
                );

            } else {

                // Fallback if backend doesn't
                // return complete user object

                const localUser =
                    getLocalUser();

                if (localUser) {

                    localUser.name =
                        newName;

                    if (
                        countryInput &&
                        !countryInput.disabled
                    ) {

                        localUser.country =
                            countryInput.value;
                    }

                    if (
                        languageInput &&
                        !languageInput.disabled
                    ) {

                        localUser.language =
                            languageInput.value;
                    }

                    saveLocalUser(
                        localUser
                    );

                    displayUser(
                        localUser
                    );
                }
            }


            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            showMessage(
                profileMessage,
                "Profile updated successfully.",
                "success"
            );


            setEditMode(false);


        } catch (error) {

            console.error(
                "Profile update error:",
                error
            );


            showMessage(
                profileMessage,
                error.message ||
                "Failed to update profile.",
                "error"
            );


        } finally {

            saveProfileBtn.disabled =
                false;
        }
    }


    // =====================================================
    // SHOW MESSAGE
    // =====================================================

    function showMessage(
        element,
        message,
        type
    ) {

        if (!element) {
            return;
        }


        element.textContent =
            message;


        if (type === "success") {

            element.style.color =
                "#2edc9a";

        } else if (type === "error") {

            element.style.color =
                "#ff6677";

        } else {

            element.style.color =
                "";
        }
    }


    // =====================================================
    // AVATAR IMAGE UPLOAD
    // =====================================================

    if (avatarCameraBtn && avatarInput) {

        avatarCameraBtn.addEventListener(
            "click",
            () => {

                avatarInput.click();

            }
        );


        avatarInput.addEventListener(
            "change",
            handleAvatarChange
        );
    }


    async function handleAvatarChange(event) {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select an image file."
            );

            return;
        }


        // Maximum 2 MB

        if (
            file.size >
            2 * 1024 * 1024
        ) {

            alert(
                "Profile image must be smaller than 2 MB."
            );

            return;
        }


        const reader =
            new FileReader();


        reader.onload = function () {

            const imageUrl =
                reader.result;


            if (profileAvatar) {

                profileAvatar.innerHTML =
                    `<img src="${imageUrl}"
                          alt="Profile">`;
            }


            if (headerAvatar) {

                headerAvatar.innerHTML =
                    `<img src="${imageUrl}"
                          alt="Profile">`;
            }


            // Save locally for now

            const user =
                getLocalUser();

            if (user) {

                user.avatar =
                    imageUrl;

                saveLocalUser(
                    user
                );
            }
        };


        reader.readAsDataURL(
            file
        );
    }


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    if (changePasswordBtn) {

        changePasswordBtn.addEventListener(
            "click",
            () => {

                if (passwordArea) {

                    passwordArea.classList.toggle(
                        "show"
                    );
                }
            }
        );
    }


    // =====================================================
    // CANCEL PASSWORD
    // =====================================================

    if (cancelPasswordBtn) {

        cancelPasswordBtn.addEventListener(
            "click",
            clearPasswordForm
        );
    }


    function clearPasswordForm() {

        if (currentPassword) {
            currentPassword.value =
                "";
        }

        if (newPassword) {
            newPassword.value =
                "";
        }

        if (confirmPassword) {
            confirmPassword.value =
                "";
        }


        showMessage(
            passwordMessage,
            "",
            ""
        );


        if (passwordArea) {

            passwordArea.classList.remove(
                "show"
            );
        }
    }


    // =====================================================
    // CONFIRM PASSWORD
    // =====================================================

    if (confirmPasswordBtn) {

        confirmPasswordBtn.addEventListener(
            "click",
            changePassword
        );
    }


    async function changePassword() {

        const current =
            currentPassword
                ? currentPassword.value
                : "";


        const newPass =
            newPassword
                ? newPassword.value
                : "";


        const confirm =
            confirmPassword
                ? confirmPassword.value
                : "";


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !current ||
            !newPass ||
            !confirm
        ) {

            showMessage(
                passwordMessage,
                "Please fill in all password fields.",
                "error"
            );

            return;
        }


        if (
            newPass.length < 8
        ) {

            showMessage(
                passwordMessage,
                "New password must contain at least 8 characters.",
                "error"
            );

            return;
        }


        if (
            newPass !== confirm
        ) {

            showMessage(
                passwordMessage,
                "New passwords do not match.",
                "error"
            );

            return;
        }


        const token =
            getToken();


        if (!token) {

            showMessage(
                passwordMessage,
                "Please login first.",
                "error"
            );

            return;
        }


        if (confirmPasswordBtn) {

            confirmPasswordBtn.disabled =
                true;
        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/auth/change-password",
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify({
                                currentPassword:
                                    current,

                                newPassword:
                                    newPass
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to change password."
                );
            }


            showMessage(
                passwordMessage,
                "Password changed successfully.",
                "success"
            );


            clearPasswordFields();


            setTimeout(
                () => {

                    if (passwordArea) {

                        passwordArea.classList.remove(
                            "show"
                        );
                    }

                },
                1500
            );


        } catch (error) {

            console.error(
                "Password change error:",
                error
            );


            showMessage(
                passwordMessage,
                error.message ||
                "Failed to change password.",
                "error"
            );


        } finally {

            if (confirmPasswordBtn) {

                confirmPasswordBtn.disabled =
                    false;
            }
        }
    }


    // =====================================================
    // CLEAR PASSWORD FIELDS
    // =====================================================

    function clearPasswordFields() {

        if (currentPassword) {
            currentPassword.value =
                "";
        }

        if (newPassword) {
            newPassword.value =
                "";
        }

        if (confirmPassword) {
            confirmPassword.value =
                "";
        }
    }


    // =====================================================
    // DOWNLOAD MY DATA
    // =====================================================

    if (downloadDataBtn) {

        downloadDataBtn.addEventListener(
            "click",
            downloadMyData
        );
    }


    async function downloadMyData() {

        const user =
            getLocalUser();


        if (!user) {

            alert(
                "Please login first."
            );

            return;
        }


        const exportData = {

            profile: {
                name:
                    user.name ||
                    user.fullName ||
                    "",

                email:
                    user.email ||
                    "",

                username:
                    user.username ||
                    createUsername(user),

                country:
                    user.country ||
                    "India",

                language:
                    user.language ||
                    "English (US)",

                plan:
                    user.plan ||
                    user.subscriptionPlan ||
                    "Free Plan",

                memberSince:
                    user.createdAt ||
                    user.created_at ||
                    null
            },

            statistics:
                getStoredStatistics(),

            exportedAt:
                new Date().toISOString()
        };


        const json =
            JSON.stringify(
                exportData,
                null,
                2
            );


        const blob =
            new Blob(
                [json],
                {
                    type:
                        "application/json"
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
            "calcura-my-data.json";


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );
    }


    // =====================================================
    // STORED STATISTICS
    // =====================================================

    function getStoredStatistics() {

        return {

            calculations:
                getArrayLength([
                    "calcuraHistory",
                    "calculationHistory",
                    "history"
                ]),

            formulas:
                getArrayLength([
                    "calcuraSaved",
                    "savedCalculations",
                    "saved"
                ]),

            graphs:
                getArrayLength([
                    "calcuraGraphs",
                    "graphHistory",
                    "graphs"
                ]),

            conversions:
                getArrayLength([
                    "calcuraConversions",
                    "conversionHistory",
                    "conversions"
                ])
        };
    }


    // =====================================================
    // ARRAY LENGTH
    // =====================================================

    function getArrayLength(keys) {

        for (
            const key of keys
        ) {

            try {

                const value =
                    localStorage.getItem(
                        key
                    );


                if (!value) {
                    continue;
                }


                const parsed =
                    JSON.parse(
                        value
                    );


                if (
                    Array.isArray(
                        parsed
                    )
                ) {

                    return parsed.length;
                }

            } catch (error) {

                console.warn(
                    "Could not read:",
                    key
                );
            }
        }


        return 0;
    }


    // =====================================================
    // LOAD STATISTICS
    // =====================================================

    function loadStatistics(user) {

        const stats =
            getStoredStatistics();


        const calculationElement =
            document.getElementById(
                "calculationCount"
            );

        const formulaElement =
            document.getElementById(
                "formulaCount"
            );

        const graphElement =
            document.getElementById(
                "graphCount"
            );

        const conversionElement =
            document.getElementById(
                "conversionCount"
            );


        if (calculationElement) {

            calculationElement.textContent =
                stats.calculations;
        }


        if (formulaElement) {

            formulaElement.textContent =
                stats.formulas;
        }


        if (graphElement) {

            graphElement.textContent =
                stats.graphs;
        }


        if (conversionElement) {

            conversionElement.textContent =
                stats.conversions;
        }
    }


    // =====================================================
    // DELETE ACCOUNT
    // =====================================================

    if (deleteAccountBtn) {

        deleteAccountBtn.addEventListener(
            "click",
            deleteAccount
        );
    }


    async function deleteAccount() {

        const firstConfirm =
            confirm(
                "Are you sure you want to delete your Calcura account?"
            );


        if (!firstConfirm) {
            return;
        }


        const secondConfirm =
            confirm(
                "This action may permanently delete your account. Continue?"
            );


        if (!secondConfirm) {
            return;
        }


        const token =
            getToken();


        if (!token) {

            alert(
                "Please login first."
            );

            return;
        }


        try {

            /*
             * IMPORTANT:
             * This endpoint is used only if your backend
             * provides /api/auth/delete-account.
             */

            const response =
                await fetch(
                    "http://localhost:5000/api/auth/delete-account",
                    {
                        method: "DELETE",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete account."
                );
            }


            // Clear local session

            localStorage.removeItem(
                "calcuraToken"
            );

            localStorage.removeItem(
                "calcuraUser"
            );


            alert(
                "Your Calcura account has been deleted."
            );


            window.location.href =
                "../login.html";


        } catch (error) {

            console.error(
                "Delete account error:",
                error
            );


            alert(
                error.message ||
                "Account deletion failed."
            );
        }
    }


    // =====================================================
    // START PROFILE
    // =====================================================

    loadProfile();

});