/* =========================================================
   CALCURA AI ASSISTANT
   Frontend Chat Controller
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const aiInput = document.getElementById("aiInput");
    const aiSendBtn = document.getElementById("aiSendBtn");
let aiConversation =
    document.getElementById("aiConversation");


// Create conversation area automatically
// if it is missing from HTML.

if (!aiConversation) {

    const chat =
        document.querySelector(
            ".ai-reference-chat"
        );

    const inputArea =
        chat?.querySelector(
            ".ai-input-area"
        );

    if (chat && inputArea) {

        aiConversation =
            document.createElement("div");

        aiConversation.id =
            "aiConversation";

        aiConversation.className =
            "ai-conversation";

        chat.insertBefore(
            aiConversation,
            inputArea
        );
    }
}
    const newChatBtn = document.getElementById("newChatBtn");

    const attachBtn = document.getElementById("attachBtn");

    const aiFileInput = document.getElementById("aiFileInput");

    const voiceInputBtn = document.getElementById("voiceInputBtn");

    const userProfileBtn = document.getElementById("userProfileBtn");
    const profileDropdown = document.getElementById("profileDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    const profileName = document.getElementById("profileName");
    const profilePlan = document.getElementById("profilePlan");
    const profileAvatar = document.getElementById("profileAvatar");


    /* =====================================================
       STATE
       ===================================================== */

    let conversationHistory = [];

    let lastUserQuestion = "";

    let lastAIAnswer = "";

    let selectedFile = null;

    let isGenerating = false;


    /* =====================================================
       LOAD REAL LOGGED-IN USER
       ===================================================== */

    async function loadUser() {

        try {

            const result = await getCurrentUser();

            if (!result || !result.user) {
                return;
            }

            const user = result.user;

            const name = user.name || "User";

            profileName.textContent = name;

            profileAvatar.textContent =
                name.charAt(0).toUpperCase();

            const plan = user.plan || "free";

            if (plan === "pro") {
                profilePlan.textContent = "Pro Plan";
            }
            else if (plan === "student") {
                profilePlan.textContent = "Student Plan";
            }
            else {
                profilePlan.textContent = "Free Plan";
            }

        }
        catch (error) {

            console.error(
                "Unable to load logged-in user:",
                error
            );

        }

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       FORMAT AI RESPONSE
       ===================================================== */

   function formatAIResponse(text) {

    if (!text) {
        return "";
    }

    let formatted = escapeHTML(text);

    /* Headings */
    formatted = formatted.replace(
        /^###\s*(.+)$/gm,
        '<div class="ai-section-title">$1</div>'
    );

    formatted = formatted.replace(
        /^##\s*(.+)$/gm,
        '<div class="ai-section-title">$1</div>'
    );

    /* Bold */
    formatted = formatted.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
    );

    /* Code */
    formatted = formatted.replace(
        /`([^`]+)`/g,
        '<code>$1</code>'
    );

    /*
       Detect common mathematical
       formula lines.
    */
    const lines = formatted.split("\n");

    let result = "";

    lines.forEach((line) => {

        const clean = line.trim();

        if (!clean) {
            return;
        }

        /*
           Formula-like content
        */
        if (
            clean.includes("∫") ||
            clean.includes("√") ||
            clean.includes("²") ||
            clean.includes("³") ||
            clean.includes("π") ||
            clean.includes("Σ") ||
            clean.includes("dx") ||
            clean.includes("dy") ||
            clean.includes("x^") ||
            clean.includes("y^")
        ) {

            result += `
                <div class="ai-formula">
                    ${clean}
                </div>
            `;

        } else {

            result += `
                <div>${clean}</div>
            `;
        }

    });

    return result;
}


    /* =====================================================
       SCROLL CHAT TO BOTTOM
       ===================================================== */

    function scrollToBottom() {

        if (!aiConversation) {
            return;
        }

        aiConversation.scrollTop =
            aiConversation.scrollHeight;

    }


    /* =====================================================
       ADD USER MESSAGE
       ===================================================== */

    function addUserMessage(message) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message user-message";

        wrapper.innerHTML = `

            <div class="message-body">

                <div class="message-name">
                    You
                </div>

                <div class="message-text">
                    ${escapeHTML(message)}
                </div>

            </div>

            <div class="message-avatar">
                <i class="fa-solid fa-user"></i>
            </div>

        `;

        aiConversation.appendChild(wrapper);

        scrollToBottom();

    }


    /* =====================================================
       ADD AI MESSAGE
       ===================================================== */

    function addAIMessage(answer) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message assistant-message";

        wrapper.innerHTML = `

            <div class="message-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>

            <div class="message-body">

                <div class="message-name">
                    Calcura AI
                </div>

                <div class="message-text ai-response">

                    ${formatAIResponse(answer)}

                </div>

                <div class="message-actions">

                    <button
                        type="button"
                        class="message-action-btn regenerate-btn"
                    >
                        <i class="fa-solid fa-rotate-right"></i>
                        Regenerate
                    </button>

                    <button
                        type="button"
                        class="message-action-btn copy-btn"
                    >
                        <i class="fa-regular fa-copy"></i>
                        Copy
                    </button>

                    <button
                        type="button"
                        class="message-action-btn save-btn"
                    >
                        <i class="fa-regular fa-bookmark"></i>
                        Save
                    </button>

                </div>

            </div>

        `;

        aiConversation.appendChild(wrapper);

        lastAIAnswer = answer;

        attachMessageActions(wrapper);

        scrollToBottom();

    }


    /* =====================================================
       TYPING INDICATOR
       ===================================================== */

    function showTyping() {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ai-message assistant-message";

        wrapper.id = "aiTypingMessage";

        wrapper.innerHTML = `

            <div class="message-avatar">
                <i class="fa-solid fa-robot"></i>
            </div>

            <div class="message-body">

                <div class="message-name">
                    Calcura AI
                </div>

                <div class="message-text">

                    <div class="ai-typing">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>

                </div>

            </div>

        `;

        aiConversation.appendChild(wrapper);

        scrollToBottom();

    }


    /* =====================================================
       REMOVE TYPING
       ===================================================== */

    function removeTyping() {

        const typing =
            document.getElementById(
                "aiTypingMessage"
            );

        if (typing) {
            typing.remove();
        }

    }


    /* =====================================================
       SEND QUESTION TO BACKEND
       ===================================================== */

    async function sendQuestion(question = null) {

        if (isGenerating) {
            return;
        }

        const message =
            (question !== null
                ? question
                : aiInput.value
            ).trim();

        if (!message) {
            return;
        }

        lastUserQuestion = message;

        isGenerating = true;

        if (aiSendBtn) {
            aiSendBtn.disabled = true;
        }

        if (aiInput) {
            aiInput.disabled = true;
        }

        addUserMessage(message);

        aiInput.value = "";

        autoResizeInput();

        showTyping();


        try {

            /*
             * This endpoint will be created
             * in the Calcura backend in the next step.
             */

            const token =
                localStorage.getItem(
                    "calcuraToken"
                );

            if (!token) {

                throw new Error(
                    "Please login to use Calcura AI."
                );

            }


            const response =
    await apiRequest(
        "/ai/ask",
        {
            method: "POST",

            headers: {
                Authorization:
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                message: message,

                conversationId:
                    window.calcuraAIConversationId ||
                    null,

                action:
                    window.calcuraAIAction ||
                    "solve"
            })
        }
    );

            removeTyping();


            if (
                !response ||
                !response.success
            ) {

                throw new Error(
                    response?.message ||
                    "AI could not generate an answer."
                );

            }
            if (response.conversationId) {

    window.calcuraAIConversationId =
        response.conversationId;
}


            const answer =
                response.answer ||
                response.message ||
                "I couldn't generate an answer.";


            conversationHistory.push({

                role: "user",

                content: message

            });


            conversationHistory.push({

                role: "assistant",

                content: answer

            });


            addAIMessage(answer);


        }
        catch (error) {

            console.error(
                "Calcura AI error:",
                error
            );

            removeTyping();

            addAIMessage(
                `Sorry, I couldn't process that question right now.

${error.message || "Please try again."}`
            );

        }
        finally {

            isGenerating = false;

            if (aiSendBtn) {
                aiSendBtn.disabled = false;
            }

            if (aiInput) {
                aiInput.disabled = false;
                aiInput.focus();
            }

        }

    }


    /* =====================================================
       SEND BUTTON
       ===================================================== */

    if (aiSendBtn) {

        aiSendBtn.addEventListener(
            "click",
            () => sendQuestion()
        );

    }


    /* =====================================================
       ENTER TO SEND
       ===================================================== */

    if (aiInput) {

        aiInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendQuestion();

                }

            }
        );


        aiInput.addEventListener(
            "input",
            autoResizeInput
        );

    }


    /* =====================================================
       AUTO RESIZE INPUT
       ===================================================== */

    function autoResizeInput() {

        if (!aiInput) {
            return;
        }

        aiInput.style.height = "auto";

        aiInput.style.height =
            Math.min(
                aiInput.scrollHeight,
                110
            ) + "px";

    }


    /* =====================================================
   TRY THESE EXAMPLES - CLICK
   ===================================================== */

const exampleItems =
    document.querySelectorAll(
        ".reference-example"
    );
    
exampleItems.forEach((item) => {

    item.style.cursor = "pointer";

    item.addEventListener("click", function (e) {

        e.preventDefault();
        e.stopPropagation();

        const prompt = this.dataset.prompt;

        if (!prompt) {
            console.warn("Example has no data-prompt:", this);
            return;
        }

        if (!aiInput) {
            console.warn("AI input not found.");
            return;
        }

        // Put example question into AI input
        aiInput.value = prompt;

        // Resize input
        if (typeof autoResizeInput === "function") {
            autoResizeInput();
        }

        // Focus input
        aiInput.focus();

    });

});
    /* =====================================================
       FEATURE CARDS
       ===================================================== */

    const featureCards =
        document.querySelectorAll(
            ".feature-card"
        );


    featureCards.forEach(
        (card) => {

            card.addEventListener(
                "click",
                () => {

                    const action =
                        card.dataset.action;

                    handleAction(action);

                }
            );

        }
    );


   /* =====================================================
   QUICK ACTION BUTTONS
   ===================================================== */

const quickActions = document.querySelectorAll(".quick-action");

quickActions.forEach((button) => {

    button.addEventListener("click", function (event) {

        event.preventDefault();
        event.stopPropagation();

        const action = this.dataset.action;

        showComingSoon(action);

    });

});


  /* =====================================================
   COMING SOON
   ===================================================== */

function showComingSoon(action) {

    const featureNames = {
        solve: "Solve",
        explain: "Explain",
        simplify: "Simplify",
        differentiate: "Differentiate",
        integrate: "Integrate",
        graph: "Plot Graph",
        more: "More"
    };

    const featureName =
        featureNames[action] || "This Feature";


    if (!aiConversation) {
        alert(featureName + " - Coming Soon");
        return;
    }


    const message = document.createElement("div");

    message.className =
        "ai-message assistant-message";


    message.innerHTML = `
        <div class="message-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>

        <div class="message-body">

            <div class="message-name">
                Calcura AI
            </div>

            <div class="message-text coming-soon-message">

                <div class="coming-soon-icon">
                    <i class="fa-solid fa-clock"></i>
                </div>

                <div class="coming-soon-title">
                    ${featureName}
                    <span>Coming Soon</span>
                </div>

                <div class="coming-soon-description">
                    This feature is currently under development.
                    It will be available in a future update.
                </div>

            </div>

        </div>
    `;


    aiConversation.appendChild(message);


    aiConversation.scrollTop =
        aiConversation.scrollHeight;

}

    /* =====================================================
       NEW CHAT
       ===================================================== */

   if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        () => {

            conversationHistory = [];

            lastUserQuestion = "";

            lastAIAnswer = "";

            window.calcuraAIConversationId =
                null;

            window.calcuraAIAction =
                null;

            if (aiConversation) {

                aiConversation.innerHTML = "";
            }

            if (aiInput) {

                aiInput.value = "";

                aiInput.placeholder =
                    "Ask anything about mathematics...";

                aiInput.focus();
            }

            autoResizeInput();
        }
    );
}


    /* =====================================================
       COPY / SAVE / REGENERATE
       ===================================================== */

    function attachMessageActions(messageElement) {

        const copyBtn =
            messageElement.querySelector(
                ".copy-btn"
            );

        const saveBtn =
            messageElement.querySelector(
                ".save-btn"
            );

        const regenerateBtn =
            messageElement.querySelector(
                ".regenerate-btn"
            );


        /* COPY */

        if (copyBtn) {

            copyBtn.addEventListener(
                "click",
                async () => {

                    try {

                        await navigator.clipboard.writeText(
                            lastAIAnswer
                        );

                        const oldHTML =
                            copyBtn.innerHTML;

                        copyBtn.innerHTML =
                            `<i class="fa-solid fa-check"></i> Copied`;

                        setTimeout(
                            () => {

                                copyBtn.innerHTML =
                                    oldHTML;

                            },
                            1500
                        );

                    }
                    catch (error) {

                        console.error(
                            "Copy failed:",
                            error
                        );

                    }

                }
            );

        }


        /* SAVE */

        /* SAVE */

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        async () => {

            if (
                !lastUserQuestion ||
                !lastAIAnswer
            ) {

                console.error(
                    "Nothing available to save."
                );

                return;

            }


            await saveAIAnswer(
                lastUserQuestion,
                lastAIAnswer,
                saveBtn
            );

        }
    );

}


        /* REGENERATE */

        if (regenerateBtn) {

            regenerateBtn.addEventListener(
                "click",
                () => {

                    if (
                        lastUserQuestion &&
                        !isGenerating
                    ) {

                        sendQuestion(
                            lastUserQuestion
                        );

                    }

                }
            );

        }

    }


   /* =====================================================
   SAVE AI ANSWER
   ===================================================== */

async function saveAIAnswer(question, answer, button) {

    try {

        const token =
            localStorage.getItem("calcuraToken");

        if (!token) {
            throw new Error("Please login first.");
        }

        if (!question || !answer) {
            throw new Error(
                "Question or AI answer is missing."
            );
        }

        const response =
            await apiRequest(
                "/saved",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        expression:
                            String(question).trim(),

                        result:
                            String(answer).trim(),

                        type: "ai"
                    })
                }
            );


        console.log(
            "AI Save Response:",
            response
        );


        if (!response || !response.success) {

            throw new Error(
                response?.message ||
                "Unable to save AI answer."
            );

        }


        /* ===============================
           SAVE SUCCESS
           =============================== */

        if (button) {

            const oldHTML =
                button.innerHTML;

            button.innerHTML =
                `<i class="fa-solid fa-check"></i> Saved`;

            button.disabled = true;


            setTimeout(
                () => {

                    button.innerHTML =
                        oldHTML;

                    button.disabled =
                        false;

                },
                1500
            );

        }


        return response;


    } catch (error) {

        console.error(
            "Save AI answer error:",
            error
        );


        /* ===============================
           SAVE FAILED
           =============================== */

        if (button) {

            const oldHTML =
                button.innerHTML;

            button.innerHTML =
                `<i class="fa-solid fa-xmark"></i> Failed`;


            setTimeout(
                () => {

                    button.innerHTML =
                        oldHTML;

                },
                2000
            );

        }


        return null;

    }

}

    /* =====================================================
       ATTACHMENT
       ===================================================== */

    if (attachBtn && aiFileInput) {

        attachBtn.addEventListener(
            "click",
            () => {

                aiFileInput.click();

            }
        );


        aiFileInput.addEventListener(
            "change",
            () => {

                if (
                    !aiFileInput.files ||
                    !aiFileInput.files.length
                ) {
                    return;
                }

                selectedFile =
                    aiFileInput.files[0];


                if (aiInput) {

                    aiInput.placeholder =
                        `Attached: ${selectedFile.name}`;

                }

            }
        );

    }


    /* =====================================================
       VOICE INPUT
       ===================================================== */

    if (voiceInputBtn) {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            voiceInputBtn.title =
                "Voice recognition is not supported in this browser";

        }
        else {

            const recognition =
                new SpeechRecognition();

            recognition.continuous = false;

            recognition.interimResults = false;

            recognition.lang = "en-US";


            recognition.onstart = () => {

                voiceInputBtn.classList.add(
                    "recording"
                );

            };


            recognition.onend = () => {

                voiceInputBtn.classList.remove(
                    "recording"
                );

            };


            recognition.onerror = (event) => {

                console.error(
                    "Voice recognition error:",
                    event.error
                );

                voiceInputBtn.classList.remove(
                    "recording"
                );

            };


            recognition.onresult = (event) => {

                const transcript =
                    event.results[0][0].transcript;

                aiInput.value =
                    transcript;

                autoResizeInput();

                aiInput.focus();

            };


            voiceInputBtn.addEventListener(
                "click",
                () => {

                    try {

                        recognition.start();

                    }
                    catch (error) {

                        console.error(
                            "Voice start error:",
                            error
                        );

                    }

                }
            );

        }

    }


    /* =====================================================
       USER PROFILE DROPDOWN
       ===================================================== */

    if (userProfileBtn) {

        userProfileBtn.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                userProfileBtn.classList.toggle(
                    "open"
                );

                profileDropdown.classList.toggle(
                    "show"
                );

            }
        );

    }


    document.addEventListener(
        "click",
        () => {

            if (userProfileBtn) {
                userProfileBtn.classList.remove(
                    "open"
                );
            }

            if (profileDropdown) {
                profileDropdown.classList.remove(
                    "show"
                );
            }

        }
    );


    if (profileDropdown) {

        profileDropdown.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                logoutUser();

            }
        );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    await loadUser();

});