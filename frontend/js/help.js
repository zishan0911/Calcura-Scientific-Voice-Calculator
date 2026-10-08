// =========================================================
// CALCURA - HELP & SUPPORT
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const headerAvatar =
        document.getElementById("headerAvatar");

    const headerUserName =
        document.getElementById("headerUserName");

    const headerPlan =
        document.getElementById("headerPlan");

    const topSearchInput =
        document.getElementById("topSearchInput");

    const helpSearchInput =
        document.getElementById("helpSearchInput");

    const helpSearchBtn =
        document.getElementById("helpSearchBtn");

    const topicCards =
        document.querySelectorAll(".help-topic-card");

    const faqList =
        document.getElementById("faqList");

    const viewAllFaqBtn =
        document.getElementById("viewAllFaqBtn");

    const supportForm =
        document.getElementById("supportForm");

    const supportTopic =
        document.getElementById("supportTopic");

    const supportMessage =
        document.getElementById("supportMessage");

    const supportFormMessage =
        document.getElementById(
            "supportFormMessage"
        );

    const liveChatBtn =
        document.getElementById("liveChatBtn");

    const helpCenterBtn =
        document.getElementById("helpCenterBtn");

    const videoTutorialBtn =
        document.getElementById(
            "videoTutorialBtn"
        );

    const documentationBtn =
        document.getElementById(
            "documentationBtn"
        );

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );


    // =====================================================
    // USER
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
                "User data error:",
                error
            );

            return null;
        }
    }


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

            } else {

                headerAvatar.textContent =
                    name
                        .charAt(0)
                        .toUpperCase();
            }
        }
    }


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
                "Could not refresh user:",
                error
            );
        }
    }


    // =====================================================
    // HELP SEARCH
    // =====================================================

    function performSearch() {

        const query =
            (
                helpSearchInput
                    ? helpSearchInput.value
                    : ""
            )
                .trim()
                .toLowerCase();


        let found = 0;


        topicCards.forEach(card => {

            const text =
                card.textContent
                    .toLowerCase();


            if (
                !query ||
                text.includes(query)
            ) {

                card.classList.remove(
                    "hidden"
                );

                found++;

            } else {

                card.classList.add(
                    "hidden"
                );
            }

        });


        if (
            helpSearchInput &&
            query &&
            found === 0
        ) {

            showSearchMessage(
                "No matching help topic found."
            );

        } else {

            clearSearchMessage();
        }
    }


    function showSearchMessage(message) {

        let messageElement =
            document.getElementById(
                "helpSearchMessage"
            );


        if (!messageElement) {

            messageElement =
                document.createElement(
                    "p"
                );

            messageElement.id =
                "helpSearchMessage";

            messageElement.style.margin =
                "10px 0";

            messageElement.style.color =
                "#ffb6c1";

            messageElement.style.fontSize =
                "13px";


            const searchRow =
                document.querySelector(
                    ".help-search-row"
                );


            if (searchRow) {

                searchRow.after(
                    messageElement
                );
            }
        }


        messageElement.textContent =
            message;
    }


    function clearSearchMessage() {

        const element =
            document.getElementById(
                "helpSearchMessage"
            );


        if (element) {
            element.remove();
        }
    }


    if (helpSearchBtn) {

        helpSearchBtn.addEventListener(
            "click",
            performSearch
        );
    }


    if (helpSearchInput) {

        helpSearchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    performSearch();
                }
            }
        );

        helpSearchInput.addEventListener(
            "input",
            () => {

                if (
                    helpSearchInput.value
                        .trim()
                        .length === 0
                ) {

                    topicCards.forEach(
                        card => {
                            card.classList.remove(
                                "hidden"
                            );
                        }
                    );

                    clearSearchMessage();
                }
            }
        );
    }


    // TOP SEARCH also works

    if (topSearchInput) {

        topSearchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    if (helpSearchInput) {

                        helpSearchInput.value =
                            topSearchInput.value;

                        performSearch();


                        helpSearchInput
                            .scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });

                        helpSearchInput.focus();
                    }
                }
            }
        );
    }


    // =====================================================
    // TOPIC BUTTONS
    // =====================================================

    topicCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const topic =
                    card.dataset.topic;


                switch (topic) {

                    case "getting-started":
                        window.location.href =
                            "calculator.html";
                        break;


                    case "voice":
                        window.location.href =
                            "voice-calculator.html";
                        break;


                    case "graph":
                        window.location.href =
                            "graph.html";
                        break;


                    case "converter":
                        window.location.href =
                            "converter.html";
                        break;


                    case "history":
                        window.location.href =
                            "history.html";
                        break;


                    case "account":
                        window.location.href =
                            "settings.html";
                        break;


                    case "billing":
                        window.location.href =
                            "upgrade.html";
                        break;


                    case "privacy":
                        window.location.href =
                            "settings.html";
                        break;


                    case "troubleshooting":

                        if (faqList) {

                            faqList.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }

                        break;
                }

            }
        );
    });


    // =====================================================
    // FAQ
    // =====================================================

    if (viewAllFaqBtn) {

        viewAllFaqBtn.addEventListener(
            "click",
            () => {

                const details =
                    faqList
                        ? faqList.querySelectorAll(
                            "details"
                        )
                        : [];


                details.forEach(
                    item => {
                        item.open = true;
                    }
                );


                if (faqList) {

                    faqList.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                }
            }
        );
    }


    // =====================================================
    // SUPPORT FORM
    // =====================================================

    if (supportForm) {

        supportForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const topic =
                    supportTopic
                        ? supportTopic.value
                        : "";

                const message =
                    supportMessage
                        ? supportMessage.value.trim()
                        : "";


                if (!topic) {

                    showFormMessage(
                        "Please select a support topic.",
                        "error"
                    );

                    return;
                }


                if (!message) {

                    showFormMessage(
                        "Please describe your issue.",
                        "error"
                    );

                    return;
                }


                // Save support request locally

                const request = {

                    topic:
                        topic,

                    message:
                        message,

                    createdAt:
                        new Date().toISOString(),

                    status:
                        "Submitted"
                };


                const existing =
                    JSON.parse(
                        localStorage.getItem(
                            "calcuraSupportRequests"
                        ) || "[]"
                    );


                existing.push(request);


                localStorage.setItem(
                    "calcuraSupportRequests",
                    JSON.stringify(existing)
                );


                showFormMessage(
                    "Message sent successfully. Our support team will get back to you.",
                    "success"
                );


                supportForm.reset();
            }
        );
    }


    function showFormMessage(
        message,
        type
    ) {

        if (!supportFormMessage) {
            return;
        }


        supportFormMessage.textContent =
            message;


        supportFormMessage.style.color =
            type === "success"
                ? "#39e6a1"
                : "#ff7d8a";
    }


    // =====================================================
    // LIVE CHAT
    // =====================================================

    if (liveChatBtn) {

        liveChatBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Live Chat is currently unavailable. Please use Email Support or Contact Support."
                );
            }
        );
    }


    // =====================================================
    // HELP CENTER
    // =====================================================

    if (helpCenterBtn) {

        helpCenterBtn.addEventListener(
            "click",
            () => {

                if (helpSearchInput) {

                    helpSearchInput
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    helpSearchInput.focus();
                }
            }
        );
    }


    // =====================================================
    // VIDEO TUTORIALS
    // =====================================================

    if (videoTutorialBtn) {

        videoTutorialBtn.addEventListener(
            "click",
            () => {

                alert(
                    "Video tutorials will be available here soon."
                );
            }
        );
    }


    // =====================================================
    // DOCUMENTATION
    // =====================================================

    if (documentationBtn) {

        documentationBtn.addEventListener(
            "click",
            () => {

                if (helpSearchInput) {

                    helpSearchInput
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "center"
                        });

                    helpSearchInput.focus();
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
    // START
    // =====================================================

    loadUser();

});