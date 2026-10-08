// ==========================================
// CALCURA - SHARED SIDEBAR
// ==========================================

const sidebarHTML = `
<aside class="calcura-sidebar" id="calcuraSidebar">

    <!-- =====================================
         LOGO
    ====================================== -->

    <div class="sidebar-logo">

        <div class="sidebar-logo-icon">
            <span>∑</span>
        </div>

        <div class="sidebar-logo-text">

            <div class="sidebar-logo-name">
                Calcura
            </div>

            <div class="sidebar-logo-tagline">
                Speak · Calculate · Explore
            </div>

        </div>

    </div>


    <!-- =====================================
         NAVIGATION
    ====================================== -->

    <nav class="sidebar-navigation">


        <!-- HOME -->

        <a
            href="dashboard.html"
            class="sidebar-link"
            data-page="dashboard"
        >

            <span class="sidebar-icon">
            
            <i class="fas fa-home"></i>

            </span>

            <span class="sidebar-link-text">
                Home
            </span>

        </a>


        <!-- CALCULATOR -->

        <a
            href="calculator.html"
            class="sidebar-link"
            data-page="calculator"
        >

            <span class="sidebar-icon"><i class="fas fa-calculator"></i></span>

            <span class="sidebar-link-text">
                Calculator
            </span>

        </a>


        <!-- VOICE -->

        <a
            href="voice-input.html"
            class="sidebar-link"
            data-page="voice-input"
        >

            <span class="sidebar-icon"><i class="fas fa-microphone"></i></span>

            <span class="sidebar-link-text">
                Voice Input
            </span>

        </a>


        <!-- AI -->

        <a
            href="ai-calculator.html"
            class="sidebar-link"
            data-page="ai-calculator"
        >

            <span class="sidebar-icon"><i class="fas fa-robot"></i></span>

            <span class="sidebar-link-text">
                AI Calculator
            </span>

        </a>


        <!-- GRAPH -->

        <a
            href="graph.html"
            class="sidebar-link"
            data-page="graph"
        >

            <span class="sidebar-icon"><i class="fas fa-chart-line"></i></span>

            <span class="sidebar-link-text">
                Graph & Plot
            </span>

        </a>


        <!-- FORMULAS -->

        <a
            href="formulas.html"
            class="sidebar-link"
            data-page="formulas"
        >

            <span class="sidebar-icon">ƒ</span>

            <span class="sidebar-link-text">
                Formula Library
            </span>

        </a>


        <!-- CONVERTER -->

        <a
            href="converter.html"
            class="sidebar-link"
            data-page="converter"
        >

            <span class="sidebar-icon"><i class="fas fa-exchange-alt"></i></span>

            <span class="sidebar-link-text">
                Unit Converter
            </span>

        </a>


        <!-- HISTORY -->

        <a
            href="history.html"
            class="sidebar-link"
            data-page="history"
        >

            <span class="sidebar-icon"><i class="fas fa-history"></i></span>

            <span class="sidebar-link-text">
                History
            </span>

        </a>


        <!-- SAVED -->

        <a
            href="saved.html"
            class="sidebar-link"
            data-page="saved"
        >

            <span class="sidebar-icon"><i class="fas fa-star"></i></span>

            <span class="sidebar-link-text">
                Saved
            </span>

        </a>


        <!-- SETTINGS -->

        <a
            href="settings.html"
            class="sidebar-link"
            data-page="settings"
        >

            <span class="sidebar-icon"><i class="fas fa-cog"></i></span>

            <span class="sidebar-link-text">
                Settings
            </span>

        </a>


        <!-- PROFILE -->

        <a
            href="profile.html"
            class="sidebar-link"
            data-page="profile"
        >

            <span class="sidebar-icon"><i class="fas fa-user"></i></span>

            <span class="sidebar-link-text">
                Profile
            </span>

        </a>


        <!-- ABOUT -->

        <a
            href="about.html"
            class="sidebar-link"
            data-page="about"
        >

            <span class="sidebar-icon"><i class="fas fa-info-circle"></i></span>

            <span class="sidebar-link-text">
                About
            </span>

        </a>


        <!-- HELP -->

        <a
            href="help.html"
            class="sidebar-link"
            data-page="help"
        >

            <span class="sidebar-icon"><i class="fas fa-question-circle"></i></span>

            <span class="sidebar-link-text">
                Help
            </span>

        </a>


    </nav>


    <!-- =====================================
         UPGRADE CARD
    ====================================== -->

    <div class="sidebar-upgrade">

        <div class="upgrade-icon">
            <i class="fas fa-crown"></i>
        </div>

        <div class="upgrade-content">

            <div class="upgrade-title">
                Upgrade to Pro
            </div>

            <div class="upgrade-text">
                Unlock advanced Calcura
                features.
            </div>

            <a
                href="upgrade.html"
                class="upgrade-button"
            >
                Upgrade
            </a>

        </div>

    </div>


</aside>
`;


// ==========================================
// INSERT SIDEBAR
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const existingSidebar =
            document.querySelector(
                ".calcura-sidebar"
            );


        if (!existingSidebar) {

            document.body.insertAdjacentHTML(
                "afterbegin",
                sidebarHTML
            );

        }


        // ==================================
        // ACTIVE PAGE
        // ==================================

        const currentPage =
            window.location.pathname
                .split("/")
                .pop()
                .replace(".html", "");


        const sidebarLinks =
            document.querySelectorAll(
                ".sidebar-link"
            );


        sidebarLinks.forEach(
            function (link) {

                const page =
                    link.getAttribute(
                        "data-page"
                    );


                if (
                    page === currentPage
                ) {

                    link.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);