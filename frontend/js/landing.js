/* =========================================================
   MATHZA — LANDING PAGE JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initPageLoader();
    initHeaderScroll();
    initNavigation();
    initMobileMenu();
    initDemoModal();
    initSmoothScroll();
    initPreviewInteractions();
    initScrollAnimations();
    initKeyboardControls();

});


/* =========================================================
   PAGE LOADER
========================================================= */

function initPageLoader() {

    const loader = document.querySelector(".page-loader");

    if (!loader) return;

    const hideLoader = () => {
        loader.classList.add("hide");

        setTimeout(() => {
            loader.style.display = "none";
        }, 600);
    };

    if (document.readyState === "complete") {
        setTimeout(hideLoader, 500);
    } else {
        window.addEventListener("load", () => {
            setTimeout(hideLoader, 500);
        });
    }

    // Safety fallback
    setTimeout(hideLoader, 2500);
}


/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

function initHeaderScroll() {

    const header = document.querySelector(".landing-header");

    if (!header) return;

    const updateHeader = () => {

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    };

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );
}


/* =========================================================
   NAVIGATION
========================================================= */

function initNavigation() {

    const navLinks = document.querySelectorAll(
        ".nav-link"
    );

    if (!navLinks.length) return;

    navLinks.forEach(link => {

        link.addEventListener("click", function () {

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");

        });

    });

}


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {

    const menuButton =
        document.querySelector(".mobile-menu-btn");

    const mobileNavigation =
        document.querySelector(".mobile-navigation");

    if (!menuButton || !mobileNavigation) return;

    menuButton.addEventListener("click", () => {

        const isOpen =
            mobileNavigation.classList.toggle("active");

        menuButton.classList.toggle(
            "active",
            isOpen
        );

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    /* Close menu after clicking a link */

    const mobileLinks =
        mobileNavigation.querySelectorAll("a");

    mobileLinks.forEach(link => {

        link.addEventListener("click", () => {

            mobileNavigation.classList.remove(
                "active"
            );

            menuButton.classList.remove(
                "active"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}


/* =========================================================
   DEMO MODAL
========================================================= */

function initDemoModal() {

    const modal =
        document.querySelector(".demo-modal");

    if (!modal) return;

    const openButtons =
        document.querySelectorAll(
            ".hero-demo-btn, [data-demo]"
        );

    const closeButton =
        modal.querySelector(".demo-close");

    const overlay =
        modal.querySelector(".demo-overlay");

    const openModal = () => {

        modal.classList.add("active");

        document.body.style.overflow = "hidden";

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        startDemoAnimation();

    };


    const closeModal = () => {

        modal.classList.remove("active");

        document.body.style.overflow = "";

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    };


    openButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                openModal();

            }
        );

    });


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeModal
        );

    }


    window.MathzaDemo = {
        open: openModal,
        close: closeModal
    };

}


/* =========================================================
   DEMO ANIMATION
========================================================= */

function startDemoAnimation() {

    const expression =
        document.querySelector(".demo-expression strong");

    const answer =
        document.querySelector(".demo-answer strong");

    if (!expression || !answer) return;


    const expressions = [
        {
            text: "2 × sin(30°) + 5²",
            answer: "27"
        },
        {
            text: "√144 + 8 × 3",
            answer: "36"
        },
        {
            text: "15² − 10²",
            answer: "125"
        }
    ];


    let index = 0;

    const showExpression = () => {

        const item =
            expressions[index];

        expression.style.opacity = "0";

        answer.style.opacity = "0";


        setTimeout(() => {

            expression.textContent =
                item.text;

            answer.textContent =
                item.answer;

            expression.style.transition =
                "opacity 0.35s ease";

            answer.style.transition =
                "opacity 0.35s ease";

            expression.style.opacity = "1";

            answer.style.opacity = "1";

        }, 200);


        index++;

        if (index >= expressions.length) {
            index = 0;
        }

    };


    showExpression();

    setTimeout(() => {

        const modal =
            document.querySelector(".demo-modal");

        if (
            modal &&
            modal.classList.contains("active")
        ) {

            showExpression();

        }

    }, 2800);

}


/* =========================================================
   SMOOTH SCROLL
========================================================= */

function initSmoothScroll() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach(link => {

        link.addEventListener("click", event => {

            const href =
                link.getAttribute("href");

            if (
                !href ||
                href === "#" ||
                href === "#!"
            ) {
                return;
            }


            const target =
                document.querySelector(href);

            if (!target) return;

            event.preventDefault();


            const header =
                document.querySelector(
                    ".landing-header"
                );

            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;


            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

        });

    });

}


/* =========================================================
   PREVIEW INTERACTIONS
========================================================= */

function initPreviewInteractions() {

    const previewMic =
        document.querySelector(".preview-mic");

    const phoneMic =
        document.querySelector(".phone-mic-btn");

    const calculateButton =
        document.querySelector(".preview-calculate");


    /* ---------------------------------------------
       Preview microphone
    --------------------------------------------- */

    if (previewMic) {

        previewMic.addEventListener(
            "click",
            () => {

                animateMicrophone(
                    previewMic
                );

                showPreviewExpression(
                    "2 × sin(30°) + 5²"
                );

            }
        );

    }


    /* ---------------------------------------------
       Phone microphone
    --------------------------------------------- */

    if (phoneMic) {

        phoneMic.addEventListener(
            "click",
            () => {

                animateMicrophone(
                    phoneMic
                );

            }
        );

    }


    /* ---------------------------------------------
       Calculate button
    --------------------------------------------- */

    if (calculateButton) {

        calculateButton.addEventListener(
            "click",
            () => {

                const result =
                    document.querySelector(
                        ".result-equation"
                    );

                if (!result) return;

                result.style.opacity = "0";

                setTimeout(() => {

                    result.textContent = "27";

                    result.style.transition =
                        "opacity 0.3s ease";

                    result.style.opacity = "1";

                }, 200);

            }
        );

    }

}


/* =========================================================
   MICROPHONE ANIMATION
========================================================= */

function animateMicrophone(button) {

    if (!button) return;

    button.classList.add("listening");

    button.style.transform =
        "scale(1.12)";

    button.style.boxShadow =
        "0 0 35px rgba(0, 153, 255, 0.75)";


    setTimeout(() => {

        button.classList.remove(
            "listening"
        );

        button.style.transform = "";

        button.style.boxShadow = "";

    }, 1400);

}


/* =========================================================
   PREVIEW EXPRESSION
========================================================= */

function showPreviewExpression(
    expressionText
) {

    const expression =
        document.querySelector(
            ".preview-expression"
        );

    if (!expression) return;


    const textElements =
        expression.querySelectorAll(
            "span"
        );


    let target = null;

    textElements.forEach(element => {

        if (
            element.classList.contains(
                "expression-text"
            )
        ) {
            target = element;
        }

    });


    if (!target) {

        target =
            expression.querySelector(
                "span"
            );

    }


    if (!target) return;


    target.style.opacity = "0";


    setTimeout(() => {

        target.textContent =
            expressionText;

        target.style.transition =
            "opacity 0.3s ease";

        target.style.opacity = "1";

    }, 180);

}


/* =========================================================
   SCROLL ANIMATIONS
========================================================= */

function initScrollAnimations() {

    const elements =
        document.querySelectorAll(
            ".hero-feature-card, " +
            ".step-card, " +
            ".subject-card, " +
            ".about-content, " +
            ".about-visual, " +
            ".cta-section"
        );


    if (!elements.length) return;


    elements.forEach(element => {

        element.style.opacity = "0";

        element.style.transform =
            "translateY(25px)";

        element.style.transition =
            "opacity 0.7s ease, " +
            "transform 0.7s ease";

    });


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    entry.target.style.opacity =
                        "1";

                    entry.target.style.transform =
                        "translateY(0)";


                    observer.unobserve(
                        entry.target
                    );

                });

            },
            {
                threshold: 0.12
            }
        );


    elements.forEach(element => {

        observer.observe(element);

    });

}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function initKeyboardControls() {

    document.addEventListener(
        "keydown",
        event => {

            /* Escape = close modal */

            if (event.key === "Escape") {

                const modal =
                    document.querySelector(
                        ".demo-modal"
                    );

                if (
                    modal &&
                    modal.classList.contains(
                        "active"
                    )
                ) {

                    if (
                        window.MathzaDemo &&
                        typeof window.MathzaDemo.close ===
                        "function"
                    ) {

                        window.MathzaDemo.close();

                    }

                }

            }


            /* Enter on demo button */

            if (
                event.key === "Enter" &&
                document.activeElement &&
                document.activeElement.classList.contains(
                    "hero-demo-btn"
                )
            ) {

                event.preventDefault();

                document.activeElement.click();

            }

        }
    );

}


/* =========================================================
   ACTIVE SECTION DETECTION
========================================================= */

function initActiveSectionDetection() {

    const sections =
        document.querySelectorAll(
            "section[id]"
        );

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    if (
        !sections.length ||
        !navLinks.length
    ) {
        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const sectionId =
                        entry.target.id;


                    navLinks.forEach(link => {

                        const href =
                            link.getAttribute(
                                "href"
                            );


                        link.classList.toggle(
                            "active",
                            href ===
                            `#${sectionId}`
                        );

                    });

                });

            },
            {
                threshold: 0.35
            }
        );


    sections.forEach(section => {

        observer.observe(section);

    });

}


/* =========================================================
   BUTTON RIPPLE EFFECT
========================================================= */

function initRippleEffect() {

    const buttons =
        document.querySelectorAll(
            ".btn, " +
            ".hero-primary-btn, " +
            ".hero-demo-btn, " +
            ".about-btn, " +
            ".cta-primary, " +
            ".cta-secondary"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                const rect =
                    this.getBoundingClientRect();

                const ripple =
                    document.createElement(
                        "span"
                    );


                ripple.style.position =
                    "absolute";

                ripple.style.width =
                    "10px";

                ripple.style.height =
                    "10px";

                ripple.style.borderRadius =
                    "50%";

                ripple.style.background =
                    "rgba(255,255,255,0.35)";

                ripple.style.pointerEvents =
                    "none";

                ripple.style.transform =
                    "translate(-50%, -50%) scale(0)";

                ripple.style.left =
                    `${event.clientX - rect.left}px`;

                ripple.style.top =
                    `${event.clientY - rect.top}px`;

                ripple.style.transition =
                    "transform 0.5s ease, opacity 0.5s ease";


                const currentPosition =
                    getComputedStyle(
                        this
                    ).position;


                if (
                    currentPosition ===
                    "static"
                ) {
                    this.style.position =
                        "relative";
                }


                this.style.overflow =
                    "hidden";


                this.appendChild(ripple);


                requestAnimationFrame(() => {

                    ripple.style.transform =
                        "translate(-50%, -50%) scale(25)";

                    ripple.style.opacity =
                        "0";

                });


                setTimeout(() => {

                    ripple.remove();

                }, 550);

            }
        );

    });

}


/* =========================================================
   STATS COUNTER
========================================================= */

function initCounters() {

    const counters =
        document.querySelectorAll(
            "[data-counter]"
        );


    if (!counters.length) return;


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }


                    const element =
                        entry.target;

                    const target =
                        Number(
                            element.dataset.counter
                        );


                    if (
                        Number.isNaN(target)
                    ) {
                        return;
                    }


                    let current = 0;

                    const duration = 1200;

                    const startTime =
                        performance.now();


                    const animate =
                        currentTime => {

                            const progress =
                                Math.min(
                                    (
                                        currentTime -
                                        startTime
                                    ) /
                                    duration,
                                    1
                                );


                            current =
                                Math.floor(
                                    target *
                                    progress
                                );


                            element.textContent =
                                current.toLocaleString();


                            if (
                                progress < 1
                            ) {

                                requestAnimationFrame(
                                    animate
                                );

                            } else {

                                element.textContent =
                                    target.toLocaleString();

                            }

                        };


                    requestAnimationFrame(
                        animate
                    );


                    observer.unobserve(
                        element
                    );

                });

            }
        );


    counters.forEach(counter => {

        observer.observe(counter);

    });

}


/* =========================================================
   INITIALIZE OPTIONAL FEATURES
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initActiveSectionDetection();
        initRippleEffect();
        initCounters();

    }
);


/* =========================================================
   MATHZA GLOBAL OBJECT
========================================================= */

window.Mathza = {

    version: "1.0.0",

    openDemo: () => {

        if (
            window.MathzaDemo &&
            typeof window.MathzaDemo.open ===
            "function"
        ) {

            window.MathzaDemo.open();

        }

    },

    closeDemo: () => {

        if (
            window.MathzaDemo &&
            typeof window.MathzaDemo.close ===
            "function"
        ) {

            window.MathzaDemo.close();

        }

    }

};